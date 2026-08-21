const assert = require('assert');
const { runPresentationMetadataTests } = require('./test/presentation-metadata.test.cjs');

// Simple sanity check to ensure npm test runs
assert.strictEqual(1 + 1, 2);
runPresentationMetadataTests();
console.log('npm test passed');
