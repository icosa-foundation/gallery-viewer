import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = fileURLToPath(new URL("../", import.meta.url));
const immRoot = resolve(process.env.IMM_REPO_ROOT ?? resolve(root, "../IMM"));
const immApp = resolve(immRoot, "code/projects/web/app");
const routes = [
  ["/imm-library/", resolve(immApp, "dist-library")],
  ["/imm-decoder/", resolve(immApp, "dist-library/decoder")],
];

const server = createServer(async (request, response) => {
  const pathname = new URL(request.url ?? "/", "http://127.0.0.1").pathname;
  let base = resolve(root);
  let relative = `.${decodeURIComponent(pathname)}`;
  if (pathname === "/sample1.imm") {
    base = resolve(immRoot, "exampleImmFiles");
    relative = "sample1.imm";
  } else {
    const route = routes.find(([prefix]) => pathname.startsWith(prefix));
    if (route) {
      base = route[1];
      relative = pathname.slice(route[0].length);
    }
  }
  const path = resolve(base, relative);
  if (path !== base && !path.startsWith(`${base}${sep}`)) {
    response.writeHead(403).end();
    return;
  }
  try {
    const info = await stat(path);
    if (!info.isFile()) throw new Error("not a file");
    const contentType = new Map([
      [".html", "text/html"], [".js", "text/javascript"], [".mjs", "text/javascript"],
      [".json", "application/json"], [".imm", "application/octet-stream"],
      [".wasm", "application/wasm"], [".png", "image/png"],
    ]).get(extname(path)) ?? "application/octet-stream";
    response.writeHead(200, { "Content-Type": contentType });
    createReadStream(path).pipe(response);
  } catch (error) {
    if (pathname !== "/favicon.ico") {
      console.error(`Gallery IMM smoke server failed ${pathname} -> ${path}:`, error);
    }
    response.writeHead(404).end();
  }
});

const requestedPort = Number(process.env.GALLERY_IMM_PORT ?? 0);
await new Promise((resolveListening) => server.listen(requestedPort, "127.0.0.1", resolveListening));
const address = server.address();
if (!address || typeof address === "string") throw new Error("IMM smoke server did not expose a port");
let browser;
try {
  browser = await chromium.launch({
    channel: "chrome",
    headless: process.env.GALLERY_IMM_HEADLESS === "1",
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  const messages = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => messages.push(`${message.type()}: ${message.text()}`));
  await page.goto(`http://127.0.0.1:${address.port}/test/browser-imm.html`, {
    waitUntil: "domcontentloaded",
    timeout: 120_000,
  });
  await page.waitForFunction(() => window.__galleryImm?.ready === true, undefined, { timeout: 120_000 });
  const before = await page.evaluate(() => window.__galleryImmDiagnostics());
  await page.waitForTimeout(1_500);
  const after = await page.evaluate(() => window.__galleryImmDiagnostics());
  if (before.paintMeshes <= 0 || before.triangles <= 0) throw new Error(`IMM strokes did not render: ${JSON.stringify(before)}`);
  if (!before.sharedGalleryScene) throw new Error("IMM scene is not attached to Gallery's content root");
  if (after.timeSeconds <= before.timeSeconds) throw new Error(`IMM playback did not advance: ${before.timeSeconds} -> ${after.timeSeconds}`);
  if (before.cameraEvents.length === 0) throw new Error("No authored IMM camera was applied");

  const chapterCamera = await page.evaluate(() => {
    const beforeCount = window.__galleryImm.cameraEvents.length;
    window.__galleryImm.viewer.selectImmChapter(0);
    const diagnostics = window.__galleryImmDiagnostics();
    return { beforeCount, diagnostics };
  });
  if (chapterCamera.diagnostics.cameraEvents.length <= chapterCamera.beforeCount) {
    throw new Error("Chapter selection did not reapply its authored IMM camera");
  }
  const applied = chapterCamera.diagnostics.cameraEvents.at(-1)?.transform.translation;
  const actual = chapterCamera.diagnostics.cameraPosition;
  if (!applied || applied.some((value, index) => Math.abs(value - actual[index]) > 1e-4)) {
    throw new Error(`Gallery camera does not match authored desktop pose: ${JSON.stringify({ applied, actual })}`);
  }
  if (before.viewpoints.length > 1) {
    const selectedViewpoint = await page.evaluate((layerId) => {
      const beforeCount = window.__galleryImm.cameraEvents.length;
      window.__galleryImm.viewer.selectImmViewpoint(layerId);
      return { beforeCount, diagnostics: window.__galleryImmDiagnostics() };
    }, before.viewpoints[1].id);
    if (selectedViewpoint.diagnostics.cameraEvents.length <= selectedViewpoint.beforeCount) {
      throw new Error("Explicit IMM viewpoint selection did not apply an authored camera");
    }
    const selectedPose = selectedViewpoint.diagnostics.cameraEvents.at(-1)?.transform.translation;
    if (!selectedPose || selectedPose.some((value, index) =>
      Math.abs(value - selectedViewpoint.diagnostics.cameraPosition[index]) > 1e-4)) {
      throw new Error(`Selected IMM viewpoint does not match Gallery camera: ${JSON.stringify(selectedViewpoint)}`);
    }
  }
  if (errors.length > 0) throw new Error(`Gallery IMM page errors: ${errors.join("; ")}. Console: ${messages.join("; ")}`);
  console.log(`Gallery IMM smoke passed: ${before.paintMeshes} paint meshes, ${before.chapters} chapters, ${before.viewpoints.length} viewpoints, playback ${before.timeSeconds.toFixed(2)}s -> ${after.timeSeconds.toFixed(2)}s.`);
  if (process.env.GALLERY_IMM_KEEP_OPEN === "1") {
    console.log(`Gallery IMM demo remains open at http://127.0.0.1:${address.port}/test/browser-imm.html`);
    await new Promise((resolveClosed) => browser.once("disconnected", resolveClosed));
    browser = undefined;
  }
} finally {
  await browser?.close();
  await new Promise((resolveClosed) => server.close(resolveClosed));
}
