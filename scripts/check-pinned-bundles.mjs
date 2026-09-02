import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

for (const library of ["three-icosa", "three-tiltloader"]) {
  const fileName = `${library}.module.js`;
  const [vendored, installed] = await Promise.all([
    readFile(`dist/${fileName}`),
    readFile(`node_modules/${library}/dist/${fileName}`),
  ]);
  assert.deepEqual(
    vendored,
    installed,
    `dist/${fileName} must match the pinned ${library} package`,
  );
}

console.log("Vendored library bundles match the pinned packages.");
