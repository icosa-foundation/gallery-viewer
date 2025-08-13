const fs = require('fs');

const output = fs.readFileSync('dist/icosa-viewer.module.js', 'utf8');
if (!output.includes('from "three"')) {
  throw new Error('Bundled output is missing external three import');
}
console.log('three import verified');
