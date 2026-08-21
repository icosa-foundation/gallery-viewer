const assert = require('assert');
const { runARPresentationTests } = require('./test/ar-presentation.test.cjs');
const { runPresentationMetadataTests } = require('./test/presentation-metadata.test.cjs');

// Simple sanity check to ensure npm test runs
assert.strictEqual(1 + 1, 2);
runARPresentationTests();
runPresentationMetadataTests();
console.log('npm test passed');
