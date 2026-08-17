const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

const host = '127.0.0.1';
const portArgument = Number(process.argv[2]);
const port = Number.isInteger(portArgument) && portArgument > 0 ? portArgument : 8766;
const pageCapture = '20210630000000';
const effectivePageCapture = '20210610025821';
const moduleCapture = '20220302155530';
const contentCapture = '20250101010101';
const browserInfoUrl = 'https://poly.google.com/_/VrZandriaUi/browserinfo?f.sid=6474560356310485348&bl=boq_vrzandriauiserver_20210504.17_p0&hl=en-US&soc-app=653&soc-platform=1&soc-device=1&_reqid=139642&rt=j';
const cache = new Map();
const moduleCaptureCache = new Map();
const assetCache = new Map();
const legacyAssetRoot = path.resolve(__dirname, '..', 'poly-replay-assets', 'www.tiltbrush.com', 'shaders');
const comparisonFixtureModule = path.resolve(__dirname, '..', 'dist', 'comparison-fixtures.js');
const fixedRuntimeAssetId = 'fbDxapxkwY9';
const truckModelUrl = '/__poly_content__/downloads/c/fp/1622752595896720/fbDxapxkwY9/bX0pl9VnRFG/model.gltf';
const archivedMainModules = 'n73qwf,ws9Tlc,IZT63,e5qFLc,GkRiKb,UUJqVe,O1Gjze,xUdipf,blwjVc,fKUV3e,aurFic,COQbmf,U0aPgd,ZwDk9d,V3dDOb,WO9ee,mI3LFb,h2ivme,O6y8ed,NpD4ec,PrPYRd,iWP1Yb,MpJwZc,O8k1Cd,NwH0H,OmgaI,HLo3Ef,x60fie,xiqEse,lazG7b,AG3oQd,XVMNvd,L1AAkb,KUM7Z,lfpdyf,fFdwef,s39S4,lwddkf,gychg,w9hDv,RMhBfe,qCSYWe,d349jb,SdcwHb,aW3pY,YLQSd,PQaYAf,pw70Gc,EFQ78c,Ulmmrd,ZfAoz,mdR7q,CBlRxf,MdUzUe,xQtZb,lPKSwe,QIhFr,JNoxi,MI6k7c,kjKdXe,pB6Zqd,rHjpXd,yDVVkb,SF3gsd,hKSk3e,iTsyac,hc6Ubd,KG2eXe,SpsfSb,fCrUFd,wfKlkc,tfTN8c,o02Jie,VwDzFe,zbML3c,HDvRde,Uas9Hd,BVgquf,A7fCU,UgAtXe,pjICDe';
const requestedMainModules = archivedMainModules
    .split(',')
    .filter(module => !['h2ivme', 'AG3oQd', 'd349jb', 'fCrUFd', 'wfKlkc'].includes(module))
    .join(',');
const compatibleModuleBatches = new Map([
    [requestedMainModules, [archivedMainModules]],
    [archivedMainModules, [archivedMainModules]],
    [
        'h2ivme,AG3oQd,d349jb,fCrUFd,wfKlkc',
        [archivedMainModules],
    ],
    [
        'AG3oQd,d349jb,fCrUFd,wfKlkc',
        [archivedMainModules],
    ],
    [
        'bnobpf,h2ivme,lBON2d',
        [
            'bnobpf,h2ivme,A4UTCb,EGNJFf,iSvg6e,uY3Nvd,lBON2d,OpzjR',
        ],
    ],
    ['bnobpf,lBON2d', ['bnobpf,lBON2d']],
    ['Wt6vjf,_latency,FCpbqb,WhJNk', ['Wt6vjf,_latency,FCpbqb,WhJNk']],
    ['sOXFj,LdUV1b,q0xTif,TetHhd', ['sOXFj,LdUV1b,q0xTif,TetHhd']],
]);

function archivedUrl(capture, originalUrl) {
    return `https://web.archive.org/web/${capture}id_/${originalUrl}`;
}

function requestOrigin(request) {
    return `http://${request.headers.host || `${host}:${port}`}`;
}

function replaceOrigin(text, remoteOrigin, localPrefix, localOrigin) {
    const escapedRemote = remoteOrigin.replaceAll('/', '\\/');
    const escapedLocal = `${localOrigin}${localPrefix}`.replaceAll('/', '\\/');
    return text
        .replaceAll(`${remoteOrigin}/`, `${localOrigin}${localPrefix}`)
        .replaceAll(`${escapedRemote}\/`, escapedLocal)
        .replaceAll(`//${remoteOrigin.slice('https://'.length)}/`, `${localOrigin}${localPrefix}`)
        .replaceAll(`\\/\\/${remoteOrigin.slice('https://'.length)}\\/`, escapedLocal);
}

function rewriteText(text, localOrigin) {
    let rewritten = text;
    rewritten = rewritten.replaceAll(`/m=${requestedMainModules}`, `/m=${archivedMainModules}`);
    rewritten = rewritten.replace(
        /https:\/\/web\.archive\.org\/web\/\d+(?:id_)?\/https:\/\/www\.tiltbrush\.com\/shaders\/brushes\//g,
        `${localOrigin}/__poly_legacy__/brushes/`
    );
    rewritten = replaceOrigin(
        rewritten,
        'https://www.tiltbrush.com/shaders/brushes',
        '/__poly_legacy__/brushes/',
        localOrigin
    );
    rewritten = replaceOrigin(rewritten, 'https://poly.googleusercontent.com', '/__poly_content__/', localOrigin);
    rewritten = replaceOrigin(rewritten, 'https://lh3.googleusercontent.com', '/__lh3__/', localOrigin);
    rewritten = replaceOrigin(rewritten, 'https://ssl.gstatic.com', '/__ssl_gstatic__/', localOrigin);
    rewritten = replaceOrigin(rewritten, 'https://www.gstatic.com', '/__www_gstatic__/', localOrigin);
    rewritten = replaceOrigin(rewritten, 'https://fonts.gstatic.com', '/__fonts_gstatic__/', localOrigin);
    rewritten = replaceOrigin(rewritten, 'https://poly.google.com', '/', localOrigin);
    rewritten = rewritten
        .replaceAll('vec2 round( vec2 x )', 'vec2 polyRound( vec2 x )')
        .replaceAll(' * round( 4.0 * vec2', ' * polyRound( 4.0 * vec2');
    return rewritten;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function replayAssetUrl(url, localOrigin) {
    return url
        .replace(
            /^https:\/\/web\.archive\.org\/web\/\d+(?:id_)?\/https:\/\/poly\.googleusercontent\.com\//,
            `${localOrigin}/__poly_content__/`
        )
        .replace(
            /^https:\/\/s3\.us-east-005\.backblazeb2\.com\/icosa-gallery\//,
            `${localOrigin}/__icosa_content__/`
        );
}

function cameraMatrix(presentationParams) {
    const camera = presentationParams?.camera;
    const [x, y, z, w] = camera?.rotation || [0, 0, 0, 1];
    const [tx, ty, tz] = camera?.translation || [0, 0, 0];
    return [
        1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w), tx,
        2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w), ty,
        2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y), tz,
        0, 0, 0, 1,
    ];
}

function polyPresentation(asset) {
    const params = asset.presentationParams || {};
    const isTiltBrushAsset = asset.formats?.some(format => format.formatType === 'TILT');
    const isBlocksAsset = asset.formats?.some(format => format.formatType === 'BLOCKS');
    const pivot = params.camera?.GOOGLE_camera_settings?.pivot;
    const hasExplicitPivot = Array.isArray(pivot);
    const radius = params.GOOGLE_geometry_data?.stats?.radius;
    const hasCompactBlocksRig = isBlocksAsset && hasExplicitPivot && Number.isFinite(radius) && radius < 1;
    const hasLargeBlocksRig = isBlocksAsset && hasExplicitPivot && !hasCompactBlocksRig;

    const viewerSettings = isTiltBrushAsset
        ? [null, 0.5, 4, 5, null, 0, 0.05, null, null, 1, null, null, null, 2, 2, 2]
        : hasCompactBlocksRig
            ? [null, 1.2, 2, 5, null, 1.2, 0.3, null, null, 1, null, null, null, 1, 1, 2]
            : hasLargeBlocksRig
                ? [null, 1.2, 2, 5, null, 3.2, 0.2, null, null, 1, null, null, null, 2, 2, 2]
                : [null, 1, 2, 5, null, 3.5, 0, null, null, 1, null, null, null, 2, 2, 2];

    const hemiLight = isTiltBrushAsset
        ? null
        : hasCompactBlocksRig
            ? [null, [1.3, '#ffeedd'], [1.3, '#ffeedd'], false]
            : [null, null, null, false];

    const lightingRig = isTiltBrushAsset
        ? [null, [[]]]
        : hasCompactBlocksRig
            ? [null, null, [[
                2,
                45,
                [
                    [0.729, null, 100],
                    [-208],
                    [-35.3],
                    [pivot, [], []],
                    [[], [], []],
                ],
            ], [[]]]]
            : isBlocksAsset
                ? [null, null, [[]]]
                : [[], null, [null, null, []], null, null, [[]]];

    const sceneRotation = params.GOOGLE_scene_rotation?.rotation
        || [0, 0, 0, isBlocksAsset ? 0 : 1];

    return {
        backgroundColor: params.backgroundColor || '#000000',
        colorSpace: isTiltBrushAsset ? 1 : isBlocksAsset ? 2 : 3,
        hemiLight,
        isTiltBrushAsset,
        lightingRig,
        pivot: pivot || [0, 0, 0],
        sceneRotation,
        viewerSettings,
    };
}

function fixedRuntimeViewerData(asset, viewerFormat, localOrigin) {
    const params = asset.presentationParams || {};
    const presentation = polyPresentation(asset);
    const rootUrl = replayAssetUrl(viewerFormat.root.url, localOrigin);
    const binResource = viewerFormat.resources?.find(resource =>
        resource.url && (resource.relativePath?.endsWith('.bin') || resource.contentType === 'application/octet-stream')
    );
    const binUrl = binResource?.url ? replayAssetUrl(binResource.url, localOrigin) : null;
    const binFilename = binResource?.relativePath
        || (binResource?.url ? new URL(binResource.url).pathname.split('/').at(-1) : null);
    const file = [
        viewerFormat.root.relativePath || new URL(viewerFormat.root.url).pathname.split('/').at(-1),
        rootUrl,
        binFilename,
        binUrl,
        null,
        true,
    ];
    const hasExplicitPivot = presentation.pivot.some(component => Math.abs(component) > 1e-9);
    return [
        asset.assetId,
        asset.displayName || asset.assetId,
        [file, file, [0, 0, 0, 0, viewerFormat.formatComplexity?.triangleCount || 0, 0]],
        [[cameraMatrix(params)], presentation.pivot, 0, 0, false,
            hasExplicitPivot ? 2 : 0,
            hasExplicitPivot ? 2 : 0,
            hasExplicitPivot ? 2 : 0],
        presentation.viewerSettings,
        presentation.backgroundColor,
        presentation.hemiLight,
        presentation.lightingRig,
        presentation.sceneRotation,
        presentation.isTiltBrushAsset ? 1 : 0,
        presentation.colorSpace,
        [[]],
    ];
}

function replaceJsonArray(text, marker, update) {
    const start = text.indexOf(marker);
    if (start < 0) throw new Error(`Poly payload marker was not found: ${marker}`);
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let end = start; end < text.length; end += 1) {
        const character = text[end];
        if (inString) {
            if (escaped) escaped = false;
            else if (character === '\\') escaped = true;
            else if (character === '"') inString = false;
            continue;
        }
        if (character === '"') inString = true;
        else if (character === '[') depth += 1;
        else if (character === ']') {
            depth -= 1;
            if (depth === 0) {
                const value = JSON.parse(text.slice(start, end + 1));
                update(value);
                return `${text.slice(0, start)}${JSON.stringify(value)}${text.slice(end + 1)}`;
            }
        }
    }
    throw new Error(`Poly payload array was not terminated: ${marker}`);
}

function injectRawAssetRecord(text, asset) {
    const params = asset.presentationParams || {};
    const presentation = polyPresentation(asset);
    return replaceJsonArray(text, `["${fixedRuntimeAssetId}","Truck"`, record => {
        record[0] = asset.assetId;
        record[1] = asset.displayName || asset.assetId;
        record[2] = asset.description || '';
        record[3] = asset.thumbnail?.url || record[3];
        record[11] = [cameraMatrix(params), presentation.pivot, 0, 0];
        record[12] = presentation.viewerSettings.map((value, index) => index === 9 ? 0 : value);
        record[13] = asset.authorName || record[13];
        record[21] = presentation.backgroundColor;
        record[22] = presentation.colorSpace;
        record[27] = presentation.sceneRotation;
        record[31] = presentation.hemiLight;
        record[34] = presentation.lightingRig;
        record[37] = presentation.isTiltBrushAsset ? 1 : 0;
    });
}

function injectPageMetadata(text, asset) {
    const name = escapeHtml(asset.displayName || asset.assetId);
    const author = escapeHtml(asset.authorName || 'Unknown author');
    const authorId = encodeURIComponent(asset.authorId || '');
    const assetId = encodeURIComponent(asset.assetId);
    const thumbnail = escapeHtml(asset.thumbnail?.url || '');
    return text
        .replace(/<meta property="og:title" content="[^"]*"\/>/, `<meta property="og:title" content="${name}"/>`)
        .replace(/<meta property="og:url" content="[^"]*"\/>/, `<meta property="og:url" content="https://poly.google.com/view/${assetId}"/>`)
        .replace(/<meta property="og:image" content="[^"]*"\/>/, `<meta property="og:image" content="${thumbnail}"/>`)
        .replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${name}">`)
        .replace(/<meta name="twitter:image" content="[^"]*">/, `<meta name="twitter:image" content="${thumbnail}">`)
        .replace(/<title>[^<]* - Poly<\/title>/, `<title>${name} - Poly</title>`)
        .replace(
            new RegExp(`<a href="\\./view/${fixedRuntimeAssetId}" target="_blank" class="ad5tce">[^<]*<\\/a>`),
            `<a href="./view/${assetId}" target="_blank" class="ad5tce">${name}</a>`
        )
        .replace(
            /<a href="\.\/user\/[^"/]+" target="_blank" class="ad5tce">[^<]*<\/a>/,
            `<a href="./user/${authorId}" target="_blank" class="ad5tce">${author}</a>`
        );
}

function injectFixedRuntimeViewerData(text, asset, viewerFormat, localOrigin) {
    const startMarker = `,true,false,false,["${fixedRuntimeAssetId}"`;
    const start = text.lastIndexOf(startMarker);
    const endMarker = ', sideChannel: {}});';
    const end = start >= 0 ? text.indexOf(endMarker, start) : -1;
    if (start < 0 || end < 0) {
        throw new Error('Fixed Poly runtime viewer payload was not found');
    }
    const viewerData = fixedRuntimeViewerData(asset, viewerFormat, localOrigin);
    const replacementFiles = fixedRuntimeViewerData(asset, viewerFormat, localOrigin)[2];
    viewerData[0] = asset.assetId;
    viewerData[1] = asset.displayName || asset.assetId;
    viewerData[2] = replacementFiles;
    const payload = JSON.stringify(viewerData);
    return `${text.slice(0, start)},true,false,false,${payload}]]\n${text.slice(end)}`;
}

function localComparisonModelUrl(modelPath, localOrigin) {
    if (!modelPath?.startsWith('/dist/formats/')
        || modelPath.includes('..')
        || !/\.(?:gltf|glb)$/i.test(modelPath)) {
        throw new Error(`Invalid local comparison model path: ${modelPath}`);
    }
    return `${localOrigin}/__comparison__${modelPath}`;
}

async function getReplaySelection(localUrl, localOrigin) {
    const directModelPath = localUrl.searchParams.get('model');
    if (!directModelPath) {
        const assetId = localUrl.searchParams.get('asset') || 'fbDxapxkwY9';
        return { assetId, ...await getPreferredViewerAsset(assetId) };
    }

    const assetId = 'fbDxapxkwY9';
    const selection = await getPreferredViewerAsset(assetId);
    const modelUrl = localComparisonModelUrl(directModelPath, localOrigin);
    return {
        assetId,
        asset: selection.asset,
        preferredFormat: selection.preferredFormat,
        viewerFormat: {
            formatType: /\.glb$/i.test(directModelPath) ? 'GLB' : 'GLTF',
            role: 'LOCAL_COMPARISON_FORMAT',
            root: { url: modelUrl },
        },
    };
}

async function fetchIcosaAsset(assetId) {
    const url = `https://api.icosa.gallery/v1/assets/${assetId}`;
    const maximumAttempts = 5;

    for (let attempt = 1; attempt <= maximumAttempts; attempt += 1) {
        let response;
        try {
            response = await fetch(url, {
                headers: {
                    'User-Agent': 'Icosa-Poly-Replay/1.0',
                },
            });
        } catch (error) {
            if (attempt === maximumAttempts) throw error;
            console.warn(`[POLY-REPLAY] Icosa API network retry ${attempt}/${maximumAttempts - 1} for ${assetId}`);
            await new Promise(resolve => setTimeout(resolve, attempt * 500));
            continue;
        }

        if (response.ok) return response.json();

        const transient = response.status === 429 || response.status >= 500;
        if (!transient || attempt === maximumAttempts) {
            throw new Error(`Icosa API returned ${response.status} for ${assetId}`);
        }

        const retryAfterSeconds = Number(response.headers.get('retry-after'));
        const delay = Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
            ? retryAfterSeconds * 1000
            : attempt * 500;
        console.warn(`[POLY-REPLAY] Icosa API ${response.status} retry ${attempt}/${maximumAttempts - 1} for ${assetId}`);
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    throw new Error(`Icosa API retries exhausted for ${assetId}`);
}

async function derivedBackblazeUpdatedFormat(preferredFormat, updatedViewerFormat) {
    if (!preferredFormat?.root?.url || !updatedViewerFormat?.root?.url) return undefined;

    const preferredUrl = new URL(preferredFormat.root.url);
    if (preferredUrl.hostname !== 's3.us-east-005.backblazeb2.com'
        || !preferredUrl.pathname.endsWith('.gltf')) {
        return undefined;
    }

    const candidateUrl = new URL(preferredUrl);
    candidateUrl.pathname = candidateUrl.pathname.replace(/\.gltf$/, '_(GLTFupdated).gltf');
    const response = await fetch(candidateUrl, {
        method: 'HEAD',
        headers: {
            'User-Agent': 'Icosa-Poly-Replay/1.0',
        },
    });
    if (!response.ok) return undefined;

    const siblingUrl = relativePath => new URL(relativePath, candidateUrl).toString();
    return {
        ...updatedViewerFormat,
        role: `${updatedViewerFormat.role || 'UPDATED_GLTF_FORMAT'} (derived Backblaze updated mirror)`,
        root: {
            ...updatedViewerFormat.root,
            relativePath: candidateUrl.pathname.split('/').at(-1),
            url: candidateUrl.toString(),
        },
        resources: updatedViewerFormat.resources?.map(resource => ({
            ...resource,
            url: resource.relativePath ? siblingUrl(resource.relativePath) : resource.url,
        })),
    };
}

async function getPreferredViewerAsset(assetId) {
    if (!/^[A-Za-z0-9_-]+$/.test(assetId)) {
        throw new Error(`Invalid Icosa asset ID: ${assetId}`);
    }
    if (assetCache.has(assetId)) return assetCache.get(assetId);
    const asset = await fetchIcosaAsset(assetId);
    const preferredFormat = asset.formats?.find(format => format.isPreferredForGalleryViewer);
    if (!preferredFormat?.root?.url) {
        throw new Error(`Icosa asset ${assetId} has no preferred Gallery viewer format`);
    }
    const preferredFilename = new URL(preferredFormat.root.url).pathname.split('/').at(-1);
    const updatedGltf2Formats = (asset.formats || []).filter(format =>
        format.formatType === 'GLTF2'
        && format.role === 'UPDATED_GLTF_FORMAT'
        && format.root?.url
    );
    const updatedViewerFormat = updatedGltf2Formats.find(format =>
        new URL(format.root.url).pathname.split('/').at(-1) === preferredFilename
    ) || updatedGltf2Formats[0];
    const mirroredUpdatedFormats = (asset.formats || []).filter(format => {
        if (!format.root?.url || !format.isCorsAllowed) return false;
        const rootUrl = new URL(format.root.url);
        return rootUrl.hostname === 's3.us-east-005.backblazeb2.com'
            && /\(GLTFupdated\)\.gltf$/i.test(rootUrl.pathname);
    });
    const mirroredUpdatedFormat = mirroredUpdatedFormats[0]
        ? {
            ...mirroredUpdatedFormats[0],
            formatType: 'GLTF2',
            role: `${mirroredUpdatedFormats[0].role || 'unknown role'} (Backblaze updated mirror)`,
        }
        : undefined;
    const derivedUpdatedFormat = mirroredUpdatedFormat
        ? undefined
        : await derivedBackblazeUpdatedFormat(preferredFormat, updatedViewerFormat);
    const viewerFormat = mirroredUpdatedFormat
        || derivedUpdatedFormat
        || updatedViewerFormat
        || (preferredFormat.formatType === 'GLTF2' ? preferredFormat : undefined);
    if (!viewerFormat) {
        throw new Error(`Icosa asset ${assetId} has no Poly-compatible GLTF2 format`);
    }
    const result = { asset, preferredFormat, viewerFormat };
    assetCache.set(assetId, result);
    return result;
}

function assetControls(assetId, asset, preferredFormat, viewerFormat = preferredFormat) {
    const preferredDetail = `${preferredFormat.formatType} · ${preferredFormat.role || 'unknown role'} · preferred for viewer`;
    const detail = viewerFormat === preferredFormat
        ? preferredDetail
        : `${preferredDetail} → ${viewerFormat.formatType} · ${viewerFormat.role || 'unknown role'} · Poly-compatible fallback`;
    return `
<style>
    #poly-replay-controls { position: fixed; z-index: 2147483647; top: 10px; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 10px; max-width: calc(100vw - 24px); padding: 8px 12px; border: 1px solid rgba(255,255,255,.3); border-radius: 7px; background: rgba(20,20,24,.92); color: white; font: 13px/1.25 Arial,sans-serif; box-shadow: 0 3px 16px rgba(0,0,0,.4); }
    #poly-replay-controls select { min-width: 290px; max-width: 46vw; color: #111; }
    #poly-replay-controls .detail { max-width: 42vw; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #ccc; }
</style>
<div id="poly-replay-controls">
    <label for="poly-replay-asset">Icosa model</label>
    <select id="poly-replay-asset"><option>Loading full API fixture catalog…</option></select>
    <span class="detail" title="${escapeHtml(detail)}">${escapeHtml(detail)}</span>
</div>
<script type="module">
import { populateApiAssetSelect } from '/comparison-fixtures.js';

    const select = document.getElementById('poly-replay-asset');
    await populateApiAssetSelect(select, '${escapeHtml(assetId)}', 'fbDxapxkwY9');
    select.addEventListener('change', () => {
        const url = new URL(location.href);
        url.searchParams.set('asset', select.value);
        location.href = url;
    });
</script>`;
}

function testPage(localOrigin, assetId, asset, preferredFormat, viewerFormat) {
    const thumbnailUrl = asset.thumbnail?.url || '';
    const assetName = asset.displayName || assetId;
    const authorName = asset.authorName || 'Unknown author';
    const embedUrl = `${localOrigin}/view/${encodeURIComponent(assetId)}/embed?asset=${encodeURIComponent(assetId)}&controls=0`;
    return `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(assetName)} — Poly replay comparison</title>
    <style>
        html, body { width: 100%; height: 100%; margin: 0; overflow: hidden; background: #111; color: white; font-family: Arial, sans-serif; }
        #poly-replay-layout { display: grid; grid-template-columns: 2fr 1fr; width: 100%; height: 100%; }
        #poly-replay-viewer { width: 100%; height: 100%; border: 0; background: #111; }
        #poly-replay-reference { box-sizing: border-box; display: grid; grid-template-rows: auto minmax(0, 1fr) auto; gap: 10px; min-width: 0; padding: 68px 14px 14px; border-left: 1px solid #444; background: #1b1b1f; }
        #poly-replay-reference h1 { margin: 0; overflow: hidden; font-size: 16px; line-height: 1.3; text-overflow: ellipsis; white-space: nowrap; }
        #poly-replay-thumbnail { width: 100%; height: 100%; min-height: 0; object-fit: contain; background: #111; }
        #poly-replay-reference footer { overflow: hidden; color: #bbb; font-size: 13px; line-height: 1.35; text-overflow: ellipsis; white-space: nowrap; }
    </style>
</head>
<body>
    <main id="poly-replay-layout">
        <iframe id="poly-replay-viewer" title="Archived Google Poly viewer" src="${escapeHtml(embedUrl)}"></iframe>
        <aside id="poly-replay-reference">
            <h1>${escapeHtml(assetName)} — ${escapeHtml(authorName)}</h1>
            <img id="poly-replay-thumbnail" src="${escapeHtml(thumbnailUrl)}" alt="Icosa Gallery thumbnail for ${escapeHtml(assetName)}">
            <footer>Icosa Gallery thumbnail · authoritative Open Brush export reference</footer>
        </aside>
    </main>
    ${assetControls(assetId, asset, preferredFormat, viewerFormat)}
</body>
</html>`;
}

async function injectPreferredViewerAsset(text, localOrigin, assetId, asset, preferredFormat, viewerFormat) {
    const originalModelUrl = text.match(/<meta property="og:asset" content="([^"]+)"/)?.[1]
        || `${localOrigin}${truckModelUrl}`;
    const replacementModelUrl = replayAssetUrl(viewerFormat.root.url, localOrigin);
    const selectedAssetModelUrls = new Set([
        originalModelUrl,
        ...Array.from(
            text.matchAll(new RegExp(`https?:\\/\\/[^"\\]\\s]+\\/${fixedRuntimeAssetId}\\/[^"\\]\\s]+\\.gltf`, 'g')),
            match => match[0]
        ),
    ]);
    let rewritten = text;
    for (const modelUrl of selectedAssetModelUrls) {
        rewritten = rewritten
            .replaceAll(modelUrl, replacementModelUrl)
            .replaceAll(modelUrl.replaceAll('/', '\\/'), replacementModelUrl.replaceAll('/', '\\/'));
    }
    const replacementBinUrl = viewerFormat.resources?.find(resource =>
        resource.url && (resource.relativePath?.endsWith('.bin') || resource.contentType === 'application/octet-stream')
    )?.url;
    if (replacementBinUrl) {
        const localBinUrl = replayAssetUrl(replacementBinUrl, localOrigin);
        const fixedBinUrls = Array.from(
            rewritten.matchAll(new RegExp(`https?:\\/\\/[^"\\]\\s]+\\/${fixedRuntimeAssetId}\\/[^"\\]\\s]+\\.bin`, 'g')),
            match => match[0]
        );
        for (const binUrl of fixedBinUrls) {
            rewritten = rewritten
                .replaceAll(binUrl, localBinUrl)
                .replaceAll(binUrl.replaceAll('/', '\\/'), localBinUrl.replaceAll('/', '\\/'));
        }
    }
    rewritten = injectRawAssetRecord(rewritten, asset);
    rewritten = injectPageMetadata(rewritten, asset);
    rewritten = injectFixedRuntimeViewerData(
        rewritten,
        asset,
        viewerFormat,
        localOrigin
    );
    const controls = assetControls(assetId, asset, preferredFormat, viewerFormat);
    rewritten = rewritten.includes('</body>')
        ? rewritten.replace('</body>', `${controls}</body>`)
        : `${rewritten}${controls}`;
    return rewritten;
}

function upstreamFor(requestUrl) {
    const url = new URL(requestUrl, `http://${host}:${port}`);
    if (/^\/view\/[^/]+\/embed$/.test(url.pathname)) {
        const useOriginalPage = url.searchParams.get('original') === '1';
        if (useOriginalPage) {
            const requestedCapture = url.searchParams.get('capture');
            const capture = /^\d{14}$/.test(requestedCapture || '') ? requestedCapture : pageCapture;
            url.searchParams.delete('original');
            url.searchParams.delete('capture');
            url.searchParams.delete('asset');
            url.searchParams.delete('model');
            url.searchParams.delete('controls');
            return archivedUrl(capture, `https://poly.google.com${url.pathname}${url.search}`);
        }
        url.pathname = `/view/${fixedRuntimeAssetId}/embed`;
        url.searchParams.delete('original');
        url.searchParams.delete('asset');
        url.searchParams.delete('model');
        url.searchParams.delete('controls');
    }
    const pathAndQuery = `${url.pathname}${url.search}`;
    if (url.pathname === '/_/VrZandriaUi/browserinfo') {
        return archivedUrl('20210524110042', browserInfoUrl);
    }
    if (url.pathname.startsWith('/__comparison__/')) {
        return `http://127.0.0.1:8765/${pathAndQuery.slice('/__comparison__/'.length)}`;
    }
    if (url.pathname.startsWith('/__icosa_content__/')) {
        return `https://s3.us-east-005.backblazeb2.com/icosa-gallery/${pathAndQuery.slice('/__icosa_content__/'.length)}`;
    }
    const mappings = [
        ['/__poly_content__/', contentCapture, 'https://poly.googleusercontent.com/'],
        ['/__lh3__/', pageCapture, 'https://lh3.googleusercontent.com/'],
        ['/__ssl_gstatic__/', pageCapture, 'https://ssl.gstatic.com/'],
        ['/__www_gstatic__/', pageCapture, 'https://www.gstatic.com/'],
        ['/__fonts_gstatic__/', pageCapture, 'https://fonts.gstatic.com/'],
    ];
    for (const [prefix, capture, remoteOrigin] of mappings) {
        if (url.pathname.startsWith(prefix)) {
            const remotePath = pathAndQuery.slice(prefix.length);
            return archivedUrl(capture, `${remoteOrigin}${remotePath}`);
        }
    }

    const capture = url.pathname === `/view/${fixedRuntimeAssetId}/embed`
        ? effectivePageCapture
        : url.pathname.startsWith('/_/scs/') ? moduleCapture : pageCapture;
    return archivedUrl(capture, `https://poly.google.com${pathAndQuery}`);
}

function isRewritable(contentType, pathname = '') {
    return contentType.includes('text/')
        || contentType.includes('javascript')
        || contentType.includes('json')
        || contentType.includes('xml')
        || /\.gltf$/i.test(pathname);
}

function contentTypeForLegacyAsset(filePath) {
    if (filePath.endsWith('.glsl')) return 'text/plain; charset=utf-8';
    if (filePath.endsWith('.png')) return 'image/png';
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg';
    return 'application/octet-stream';
}

async function localLegacyAssetResponse(localUrl) {
    const relativePath = decodeURIComponent(localUrl.pathname.slice('/__poly_legacy__/'.length));
    const filePath = path.resolve(legacyAssetRoot, relativePath);
    if (!filePath.startsWith(`${legacyAssetRoot}${path.sep}`)) {
        return { status: 400, contentType: 'text/plain; charset=utf-8', body: Buffer.from('Invalid legacy asset path') };
    }
    try {
        return {
            status: 200,
            contentType: contentTypeForLegacyAsset(filePath),
            body: await fs.readFile(filePath),
            finalUrl: filePath,
        };
    } catch (error) {
        if (error.code === 'ENOENT') {
            return { status: 404, contentType: 'text/plain; charset=utf-8', body: Buffer.from('Legacy asset not downloaded') };
        }
        throw error;
    }
}

async function fetchArchived(upstream) {
    if (cache.has(upstream)) return cache.get(upstream);
    let response;
    for (let attempt = 1; attempt <= 5; attempt += 1) {
        try {
            response = await fetch(upstream, {
                headers: {
                    'User-Agent': 'Icosa-Poly-Replay/1.0',
                },
                redirect: 'follow',
            });
            break;
        } catch (error) {
            if (attempt === 5) throw error;
            console.warn(`[POLY-REPLAY] archive fetch retry ${attempt}/4: ${upstream}`);
            await new Promise(resolve => setTimeout(resolve, attempt * 500));
        }
    }
    const result = {
        status: response.status,
        contentType: response.headers.get('content-type') || 'application/octet-stream',
        body: Buffer.from(await response.arrayBuffer()),
        finalUrl: response.url,
    };
    if (response.ok) cache.set(upstream, result);
    return result;
}

async function findCompatibleModuleCapture(moduleSet) {
    if (moduleCaptureCache.has(moduleSet)) return moduleCaptureCache.get(moduleSet);
    const firstModule = moduleSet.split(',')[0];
    const cdx = new URL('https://web.archive.org/cdx/search/cdx');
    cdx.searchParams.set('url', 'poly.google.com/_/scs/mss-static/_/js/');
    cdx.searchParams.set('matchType', 'prefix');
    cdx.searchParams.set('output', 'json');
    cdx.searchParams.append('filter', 'statuscode:200');
    cdx.searchParams.append('filter', `original:.*${firstModule}.*`);
    cdx.searchParams.set('fl', 'timestamp,original,length');
    cdx.searchParams.set('collapse', 'urlkey');
    cdx.searchParams.set('limit', '2000');
    const response = await fetch(cdx, { headers: { 'User-Agent': 'Icosa-Poly-Replay/1.0' } });
    if (!response.ok) throw new Error(`CDX returned ${response.status} for ${moduleSet}`);
    const rows = await response.json();
    const captureTime = timestamp => Date.UTC(
        Number(timestamp.slice(0, 4)),
        Number(timestamp.slice(4, 6)) - 1,
        Number(timestamp.slice(6, 8)),
        Number(timestamp.slice(8, 10)),
        Number(timestamp.slice(10, 12)),
        Number(timestamp.slice(12, 14)),
    );
    const referenceTime = captureTime(effectivePageCapture);
    const match = rows.slice(1)
        .filter(row =>
            row[1].includes('Sst-zH62oTw')
            && row[1].includes('/excm=_b,_tp,embedview/')
            && decodeURIComponent(row[1]).split('/m=').at(-1) === moduleSet
        )
        .sort((left, right) =>
            Math.abs(captureTime(left[0]) - referenceTime) - Math.abs(captureTime(right[0]) - referenceTime)
        )[0];
    if (!match) throw new Error(`No compatible same-build capture for Poly modules ${moduleSet}`);
    const capture = archivedUrl(match[0], match[1]);
    moduleCaptureCache.set(moduleSet, capture);
    return capture;
}

async function compatibleModuleResponse(requestUrl) {
    const moduleSet = decodeURIComponent(requestUrl).split('/m=').at(-1)?.split('?')[0];
    const batches = compatibleModuleBatches.get(moduleSet);
    if (!batches) return undefined;
    const bodies = [];
    for (const batch of batches) {
        const capture = await findCompatibleModuleCapture(batch);
        const archived = await fetchArchived(capture);
        if (archived.status !== 200) {
            throw new Error(`Compatible module capture returned ${archived.status}: ${capture}`);
        }
        bodies.push(archived.body);
    }
    return {
        status: 200,
        contentType: 'text/javascript; charset=utf-8',
        body: Buffer.concat(bodies.map((body, index) => index ? Buffer.concat([Buffer.from('\n'), body]) : body)),
        finalUrl: `compatible module batches: ${batches.join(' + ')}`,
    };
}

const server = http.createServer(async (request, response) => {
    const started = Date.now();
    const localUrl = new URL(request.url || '/', `http://${host}:${port}`);
    const upstream = upstreamFor(request.url || '/');
    try {
        if (localUrl.pathname === '/comparison-fixtures.js') {
            const body = await fs.readFile(comparisonFixtureModule);
            response.writeHead(200, {
                'content-type': 'text/javascript; charset=utf-8',
                'content-length': body.length,
                'access-control-allow-origin': '*',
                'cache-control': 'no-store',
            });
            response.end(body);
            return;
        }
        if (localUrl.pathname.startsWith('/__poly_legacy__/')) {
            const localAsset = await localLegacyAssetResponse(localUrl);
            response.writeHead(localAsset.status, {
                'content-type': localAsset.contentType,
                'content-length': localAsset.body.length,
                'access-control-allow-origin': '*',
                'cache-control': 'no-store',
            });
            response.end(localAsset.body);
            console.log(`[POLY-REPLAY] ${localAsset.status} ${request.url} -> ${localAsset.finalUrl || 'local legacy assets'} (${Date.now() - started}ms)`);
            return;
        }
        if (localUrl.pathname === '/poly-test') {
            const assetId = localUrl.searchParams.get('asset') || 'fbDxapxkwY9';
            const { asset, preferredFormat, viewerFormat } = await getPreferredViewerAsset(assetId);
            const body = Buffer.from(testPage(requestOrigin(request), assetId, asset, preferredFormat, viewerFormat));
            response.writeHead(200, {
                'content-type': 'text/html; charset=utf-8',
                'content-length': body.length,
                'access-control-allow-origin': '*',
                'cache-control': 'no-store',
            });
            response.end(body);
            console.log(`[POLY-REPLAY] test page ${assetId}: preferred ${preferredFormat.formatType} ${preferredFormat.role}; rendering ${viewerFormat.formatType} ${viewerFormat.role} (${Date.now() - started}ms)`);
            return;
        }
        const requestedModules = request.url?.startsWith('/_/scs/')
            ? decodeURIComponent(request.url).split('/m=').at(-1)?.split('?')[0]
            : undefined;
        let archived = requestedModules && compatibleModuleBatches.has(requestedModules)
            ? await compatibleModuleResponse(request.url)
            : await fetchArchived(upstream);
        if (archived.status === 404 && request.url?.startsWith('/_/scs/')) {
            archived = await compatibleModuleResponse(request.url) || archived;
        }
        let body = archived.body;
        if (isRewritable(archived.contentType, localUrl.pathname)) {
            const localOrigin = requestOrigin(request);
            let rewritten = rewriteText(body.toString('utf8'), localOrigin);
            if (archived.contentType.includes('text/html')
                && /^\/view\/[^/]+\/embed$/.test(localUrl.pathname)
                && localUrl.searchParams.get('original') !== '1') {
                const { assetId, asset, preferredFormat, viewerFormat } = await getReplaySelection(localUrl, localOrigin);
                rewritten = await injectPreferredViewerAsset(rewritten, localOrigin, assetId, asset, preferredFormat, viewerFormat);
                if (localUrl.searchParams.get('controls') === '0') {
                    rewritten = rewritten.replace(/<style>\s*#poly-replay-controls[\s\S]*?<\/script>/, '');
                }
                console.log(`[POLY-REPLAY] selected ${assetId}: preferred ${preferredFormat.formatType} ${preferredFormat.role}; rendering ${viewerFormat.formatType} ${viewerFormat.role} ${viewerFormat.root.url}`);
            }
            body = Buffer.from(rewritten);
        }
        response.writeHead(archived.status, {
            'content-type': archived.contentType,
            'content-length': body.length,
            'access-control-allow-origin': '*',
            'cache-control': 'no-store',
        });
        response.end(body);
        console.log(`[POLY-REPLAY] ${archived.status} ${request.url} -> ${archived.finalUrl} (${Date.now() - started}ms)`);
    } catch (error) {
        const message = `[POLY-REPLAY] proxy failure for ${request.url}: ${error.stack || error}`;
        console.error(message);
        response.writeHead(502, { 'content-type': 'text/plain; charset=utf-8' });
        response.end(message);
    }
});

server.listen(port, host, () => {
    console.log(`[POLY-REPLAY] listening on http://${host}:${port}`);
    console.log(`[POLY-REPLAY] Truck: http://${host}:${port}/view/fbDxapxkwY9/embed`);
});
