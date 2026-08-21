import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = fileURLToPath(new URL("../", import.meta.url));
const server = createServer(async (request, response) => {
  const pathname = new URL(request.url ?? "/", "http://127.0.0.1").pathname;
  const path = resolve(root, `.${decodeURIComponent(pathname)}`);
  if (!path.startsWith(`${resolve(root)}${sep}`)) {
    response.writeHead(403).end();
    return;
  }
  try {
    const info = await stat(path);
    if (!info.isFile()) throw new Error("not a file");
    const contentType = new Map([
      [".html", "text/html"], [".css", "text/css"], [".js", "text/javascript"],
      [".mjs", "text/javascript"], [".json", "application/json"],
      [".gltf", "model/gltf+json"], [".png", "image/png"], [".wasm", "application/wasm"],
    ]).get(extname(path)) ?? "application/octet-stream";
    response.writeHead(200, { "Content-Type": contentType });
    createReadStream(path).pipe(response);
  } catch {
    response.writeHead(404).end();
  }
});

await new Promise((resolveListening) => server.listen(0, "127.0.0.1", resolveListening));
const address = server.address();
if (!address || typeof address === "string") throw new Error("AR regression server did not expose a port");

let browser;
try {
  browser = await chromium.launch({
    channel: "chrome",
    headless: process.env.CI === "true" || process.env.GALLERY_AR_HEADLESS === "1",
    args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  const messages = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => messages.push(`${message.type()}: ${message.text()}`));
  await page.goto(`http://127.0.0.1:${address.port}/test/browser-ar-presentation.html`, {
    waitUntil: "domcontentloaded",
    timeout: 120_000,
  });
  await page.waitForFunction(
    () => document.documentElement.dataset.arPresentation,
    undefined,
    { timeout: 30_000 },
  );
  const resultText = await page.locator("#ar-presentation-result").textContent();
  const result = resultText ? JSON.parse(resultText) : null;
  if (!result?.passed) {
    throw new Error(`AR presentation regression failed: ${JSON.stringify(result)}. Console: ${messages.join("; ")}`);
  }
  if (errors.length > 0) throw new Error(`AR presentation page errors: ${errors.join("; ")}`);
  console.log(`AR presentation browser regression passed: ${result.checks.length} checks.`);
} finally {
  await browser?.close();
  await new Promise((resolveClosed) => server.close(resolveClosed));
}
