# Icosa Viewer

[![Latest NPM release](https://img.shields.io/npm/v/icosa-viewer.svg)](https://www.npmjs.com/package/icosa-viewer)
[![Twitter](https://img.shields.io/badge/follow-%40IcosaGallery-blue.svg?style=flat&logo=twitter)](https://twitter.com/IcosaGallery)
[![Discord](https://discordapp.com/api/guilds/783806589991780412/embed.png?style=shield)](https://discord.gg/W7NCEYnEfy)
[![Open Collective backers and sponsors](https://img.shields.io/opencollective/all/icosa?logo=open-collective)](https://opencollective.com/icosa)

3D viewer component for [Icosa Gallery](https://icosa.gallery).

This project aims to provide a simple way to view raw .tilt files and the various converted variants hosted on Icosa Gallery, with legacy support for [Google Poly](https://poly.google.com) models.

The viewer is still a work in progress and subject to change. Please join the [Discord](https://discord.gg/W7NCEYnEfy) to discuss the project!

## Examples

- [Interactive GLB loader](https://icosa-gallery.github.io/icosa-viewer/index.html)
- [GLTF 2.0](https://icosa-gallery.github.io/icosa-viewer/gltf-viewer.html)
- [GLTF 1.0 (Legacy)](https://icosa-gallery.github.io/icosa-viewer/gltf1-viewer.html)
- [Raw .tilt file](https://icosa-gallery.github.io/icosa-viewer/tilt-viewer.html)

## Installation

`npm install --save icosa-viewer`

## Development Build Instructions

This project uses Three.js as a peer dependency (externalized, not bundled). 

### Quick Start
```bash
npm install
npm run build
```
- Uses the published three-icosa version from npm
- Smallest bundle size (~362KB)
- Works immediately after cloning the repo

### Local Development Build (For three-icosa changes)
If you're working on three-icosa locally:
```bash
npm run build:local
```
- Copies your local `three-icosa.module.js` from `../three-icosa-main/dist/`
- Overrides the npm version with your local changes
- Requires the three-icosa project to be cloned and built locally

### Setting up Local three-icosa (Optional)
Only needed if you want to modify three-icosa:
```bash
git clone https://github.com/icosa-gallery/three-icosa.git ../three-icosa-main
cd ../three-icosa-main && npm install && npm run build
cd ../gallery-viewer && npm run build:local
```

### Available Scripts

- `npm run build` - Standard build using published three-icosa from npm
- `npm run build:local` - Build with local three-icosa from `../three-icosa-main/`
- `npm run download-three-icosa` - Download three-icosa.module.js file for self-hosting
- `npm run setup-cdn` - Switch importmap to load three-icosa from CDN (development only)

### Production Deployment
For production, the `dist/index.html` is configured to load:
- Three.js from CDN
- Local `three-icosa.module.js` file (self-hosted with your dist files)
- other dependencies from CDN

**Important**: Always use `npm run build:local` before deploying to ensure you have the latest `three-icosa.module.js` file included in your deployment.
