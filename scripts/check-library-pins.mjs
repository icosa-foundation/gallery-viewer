import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const packageLock = JSON.parse(await readFile("package-lock.json", "utf8"));
const rootLock = packageLock.packages[""];

for (const dependency of ["three-icosa", "three-tiltloader"]) {
  const declared = packageJson.dependencies[dependency];
  assert.match(declared, /\/archive\/[0-9a-f]{40}\.tar\.gz$/);
  assert.equal(rootLock.dependencies[dependency], declared);
  assert.equal(packageLock.packages[`node_modules/${dependency}`].resolved, declared);
}

assert.equal(
  packageLock.packages["node_modules/three-tiltloader"].dependencies[
    "three-icosa"
  ],
  packageJson.dependencies["three-icosa"],
  "three-tiltloader and Gallery Viewer must pin the same three-icosa commit",
);

console.log("Library dependency pins are aligned.");
