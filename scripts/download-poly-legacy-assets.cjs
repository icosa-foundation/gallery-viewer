const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');

const sourcePrefix = 'https://www.tiltbrush.com/shaders/brushes/';
const outputRoot = path.resolve(__dirname, '..', 'poly-replay-assets');
const manifestPath = path.join(outputRoot, 'manifest.json');
const concurrency = 3;
const userAgent = 'Icosa-Poly-Replay-Asset-Downloader/1.0';

function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function fetchWithRetries(url, attempts = 8) {
    let lastError;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        try {
            const response = await fetch(url, {
                headers: { 'User-Agent': userAgent },
                redirect: 'follow',
            });
            if (response.ok) return response;
            lastError = new Error(`${response.status} ${response.statusText}`);
            if (![429, 500, 502, 503, 504].includes(response.status)) break;
        } catch (error) {
            lastError = error;
        }
        if (attempt < attempts) {
            await sleep(Math.min(15000, 750 * (2 ** (attempt - 1))));
        }
    }
    throw new Error(`Unable to fetch ${url}: ${lastError?.message || 'unknown error'}`);
}

function localPathFor(originalUrl) {
    const url = new URL(originalUrl);
    if (url.origin !== 'https://www.tiltbrush.com' || !url.pathname.startsWith('/shaders/brushes/')) {
        throw new Error(`Unexpected Poly shader URL: ${originalUrl}`);
    }
    const relativePath = `${url.hostname}${decodeURIComponent(url.pathname)}`;
    const outputPath = path.resolve(outputRoot, relativePath);
    if (!outputPath.startsWith(`${outputRoot}${path.sep}`)) {
        throw new Error(`Unsafe Poly shader path: ${originalUrl}`);
    }
    return outputPath;
}

function sha256(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
}

function validateLegacyResource(originalUrl, body) {
    const pathname = new URL(originalUrl).pathname;
    if (!pathname.endsWith('.glsl')) return;
    const source = body.toString('utf8');
    if (source.includes('Updated to OpenGL ES 3.0 by the Icosa Gallery Authors')) {
        throw new Error('received an Icosa GLSL ES 3.0 shader instead of the Poly-era source');
    }
    if (pathname.endsWith('-vertex.glsl') && !/\battribute\s+\w+/.test(source)) {
        throw new Error('vertex shader does not use the GLSL ES 1.0 attribute syntax');
    }
    if (!/\bvarying\s+\w+/.test(source)) {
        throw new Error('shader does not use the GLSL ES 1.0 varying syntax');
    }
}

async function readPreviousManifest() {
    try {
        return JSON.parse(await fs.readFile(manifestPath, 'utf8'));
    } catch (error) {
        if (error.code === 'ENOENT') return { resources: [] };
        throw error;
    }
}

async function getCaptureIndex() {
    const cdx = new URL('https://web.archive.org/cdx/search/cdx');
    cdx.searchParams.set('url', sourcePrefix);
    cdx.searchParams.set('matchType', 'prefix');
    cdx.searchParams.set('output', 'json');
    cdx.searchParams.append('filter', 'statuscode:200');
    cdx.searchParams.set('collapse', 'urlkey');
    cdx.searchParams.set('fl', 'timestamp,original,mimetype,digest,length');
    cdx.searchParams.set('limit', '10000');
    const response = await fetchWithRetries(cdx);
    const rows = await response.json();
    const captures = rows.slice(1).map(([timestamp, originalUrl, mimeType, digest, length]) => ({
        timestamp,
        originalUrl,
        mimeType,
        digest,
        cdxLength: Number(length),
    }));
    if (!captures.length) throw new Error('Wayback CDX returned no Poly brush resources');
    return captures;
}

async function downloadCapture(capture, previousByUrl) {
    const outputPath = localPathFor(capture.originalUrl);
    const previous = previousByUrl.get(capture.originalUrl);
    if (previous?.digest === capture.digest && previous?.sha256) {
        try {
            const existing = await fs.readFile(outputPath);
            if (sha256(existing) === previous.sha256) {
                return { ...capture, ...previous, localPath: path.relative(outputRoot, outputPath).replaceAll('\\', '/') };
            }
        } catch (error) {
            if (error.code !== 'ENOENT') throw error;
        }
    }

    const archiveUrl = `https://web.archive.org/web/${capture.timestamp}id_/${capture.originalUrl}`;
    const response = await fetchWithRetries(archiveUrl);
    const body = Buffer.from(await response.arrayBuffer());
    validateLegacyResource(capture.originalUrl, body);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, body);
    return {
        ...capture,
        archiveUrl,
        finalUrl: response.url,
        contentType: response.headers.get('content-type') || 'application/octet-stream',
        byteLength: body.length,
        sha256: sha256(body),
        localPath: path.relative(outputRoot, outputPath).replaceAll('\\', '/'),
    };
}

async function runPool(items, worker) {
    const results = new Array(items.length);
    let nextIndex = 0;
    async function runWorker() {
        while (nextIndex < items.length) {
            const index = nextIndex;
            nextIndex += 1;
            results[index] = await worker(items[index], index);
        }
    }
    await Promise.all(Array.from({ length: concurrency }, runWorker));
    return results;
}

async function main() {
    const previousManifest = await readPreviousManifest();
    const previousByUrl = new Map(previousManifest.resources.map(resource => [resource.originalUrl, resource]));
    const captures = await getCaptureIndex();
    console.log(`[POLY-ASSETS] Wayback lists ${captures.length} captured Poly brush resources`);
    let completed = 0;
    const resources = await runPool(captures, async capture => {
        const result = await downloadCapture(capture, previousByUrl);
        completed += 1;
        console.log(`[POLY-ASSETS] ${completed}/${captures.length} ${result.localPath}`);
        return result;
    });
    const manifest = {
        schemaVersion: 1,
        sourcePrefix,
        generatedAt: new Date().toISOString(),
        resourceCount: resources.length,
        resources,
    };
    await fs.mkdir(outputRoot, { recursive: true });
    await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    console.log(`[POLY-ASSETS] Wrote ${manifestPath}`);
}

main().catch(error => {
    console.error(`[POLY-ASSETS] ${error.stack || error}`);
    process.exitCode = 1;
});
