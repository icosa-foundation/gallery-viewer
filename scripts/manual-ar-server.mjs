import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const host = process.env.GALLERY_AR_HOST || "127.0.0.1";
const port = Number(process.env.GALLERY_AR_PORT || 4173);
const contentTypes = new Map([
  [".html", "text/html"], [".css", "text/css"], [".js", "text/javascript"],
  [".mjs", "text/javascript"], [".json", "application/json"],
  [".gltf", "model/gltf+json"], [".glb", "model/gltf-binary"],
  [".png", "image/png"], [".jpg", "image/jpeg"], [".svg", "image/svg+xml"],
  [".wasm", "application/wasm"],
]);

const server = createServer(async (request, response) => {
  const pathname = new URL(request.url ?? "/", "http://127.0.0.1").pathname;
  if (pathname === "/") {
    response.writeHead(302, { Location: "/test/manual-ar.html" }).end();
    return;
  }

  const path = resolve(root, `.${decodeURIComponent(pathname)}`);
  if (!path.startsWith(`${resolve(root)}${sep}`)) {
    response.writeHead(403).end();
    return;
  }

  try {
    const info = await stat(path);
    if (!info.isFile()) throw new Error("not a file");
    response.writeHead(200, { "Content-Type": contentTypes.get(extname(path)) || "application/octet-stream" });
    createReadStream(path).pipe(response);
  } catch {
    response.writeHead(404).end();
  }
});

server.listen(port, host, () => {
  console.log(`Manual AR viewer: http://${host}:${port}/test/manual-ar.html`);
  console.log("Use an HTTPS host or tunnel when testing from a separate headset or glasses device.");
});
