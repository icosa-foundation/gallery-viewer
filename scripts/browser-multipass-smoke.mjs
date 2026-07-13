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
      [".html", "text/html"], [".js", "text/javascript"], [".mjs", "text/javascript"],
      [".json", "application/json"], [".glb", "model/gltf-binary"], [".gltf", "model/gltf+json"],
      [".png", "image/png"], [".jpg", "image/jpeg"], [".wasm", "application/wasm"],
    ]).get(extname(path)) ?? "application/octet-stream";
    response.writeHead(200, { "Content-Type": contentType });
    createReadStream(path).pipe(response);
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((resolveListening) => server.listen(0, "127.0.0.1", resolveListening));
const address = server.address();
if (!address || typeof address === "string") throw new Error("Local smoke server did not expose a TCP port.");
let browser;
try {
  browser = await chromium.launch({
    channel: "chrome",
    headless: process.env.CI === "true",
    args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  const messages = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => messages.push(`${message.type()}: ${message.text()}`));
  page.on("response", (response) => {
    if (response.status() >= 400) messages.push(`http ${response.status()}: ${response.url()}`);
  });
  page.on("requestfailed", (request) => messages.push(`request failed: ${request.url()} ${request.failure()?.errorText ?? ""}`));
  await page.goto(`http://127.0.0.1:${address.port}/test/browser-multipass.html`, {
    waitUntil: "domcontentloaded",
    timeout: 120_000,
  });
  try {
    await page.waitForFunction(() => document.documentElement.dataset.multipass, undefined, { timeout: 30_000 });
  } catch (error) {
    throw new Error(`Gallery multipass page did not initialize. Errors: ${errors.join("; ")}. Console: ${messages.join("; ")}`, { cause: error });
  }
  const result = await page.evaluate(() => window.multipassResult);
  if (!result?.passed) throw new Error(`Gallery multipass binding failed: ${JSON.stringify(result)}`);
  if (errors.length > 0) throw new Error(`Gallery page errors: ${errors.join("; ")}`);
  console.log(`Gallery multipass smoke passed for ${result.matches.length} Tube Toon Inverted mesh(es).`);
} finally {
  await browser?.close();
  await new Promise((resolveClosed) => server.close(resolveClosed));
}
