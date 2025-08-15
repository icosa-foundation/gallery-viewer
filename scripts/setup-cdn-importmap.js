#!/usr/bin/env node

// Script to update importmap to use published three-icosa from CDN
// Useful for developers who don't have local three-icosa build

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../dist/index.html');

if (!fs.existsSync(indexPath)) {
    console.error('❌ dist/index.html not found. Run "npm run build" first.');
    process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf8');

// Replace local three-icosa with published CDN version
const cdnImportMap = html.replace(
    '"three-icosa": "./three-icosa.module.js"',
    '"three-icosa": "https://cdn.jsdelivr.net/npm/three-icosa@0.4.2-alpha.18/dist/three-icosa.module.js"'
);

fs.writeFileSync(indexPath, cdnImportMap, 'utf8');

console.log('✅ Updated importmap to use published three-icosa from CDN');
console.log('💡 This is for development only - production should use "npm run build:local"');
console.log('💡 Use "npm run build:local" to switch back to your local version');