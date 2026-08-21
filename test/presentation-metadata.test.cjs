const assert = require('assert');
const fs = require('fs');
const Module = require('module');
const path = require('path');
const ts = require('typescript');

function loadTypeScriptModule(filename) {
    const source = fs.readFileSync(filename, 'utf8');
    const result = ts.transpileModule(source, {
        compilerOptions: {
            target: ts.ScriptTarget.ES2020,
            module: ts.ModuleKind.CommonJS,
            strict: true
        },
        fileName: filename,
        reportDiagnostics: true
    });

    const errors = (result.diagnostics || []).filter(
        diagnostic => diagnostic.category === ts.DiagnosticCategory.Error
    );
    assert.deepStrictEqual(errors, [], 'Metadata resolver should transpile without diagnostics');

    const loadedModule = new Module(filename, module);
    loadedModule.filename = filename;
    loadedModule.paths = Module._nodeModulePaths(path.dirname(filename));
    loadedModule._compile(result.outputText, filename);
    return loadedModule.exports;
}

function runPresentationMetadataTests() {
    const projectRoot = path.resolve(__dirname, '..');
    const resolverPath = path.join(projectRoot, 'src', 'metadata', 'PresentationMetadata.ts');
    const fixturesPath = path.join(__dirname, 'fixtures', 'presentation-metadata.json');
    const { parseGalleryMetadataBoolean, resolveGalleryPresentationMetadata } = loadTypeScriptModule(resolverPath);
    const fixtures = JSON.parse(fs.readFileSync(fixturesPath, 'utf8'));

    assert.strictEqual(parseGalleryMetadataBoolean(true), true);
    assert.strictEqual(parseGalleryMetadataBoolean('FALSE'), false);
    assert.strictEqual(parseGalleryMetadataBoolean(1), true);
    assert.strictEqual(parseGalleryMetadataBoolean('not-a-boolean'), undefined);

    for (const fixture of fixtures) {
        const resolved = resolveGalleryPresentationMetadata(fixture.overrides, fixture.embedded);
        const expected = fixture.expected;

        if ('cameraSource' in expected) {
            assert.strictEqual(resolved.camera.source, expected.cameraSource, fixture.name);
        }
        if ('geometrySource' in expected) {
            assert.strictEqual(resolved.geometryData.source, expected.geometrySource, fixture.name);
        }
        if ('translation' in expected) {
            assert.deepStrictEqual(resolved.camera.value.translation, expected.translation, fixture.name);
        }
        if ('rotation' in expected) {
            assert.deepStrictEqual(resolved.camera.value.rotation, expected.rotation, fixture.name);
        }
        if ('navigation' in expected) {
            assert.strictEqual(resolved.navigation.mode, expected.navigation, fixture.name);
        }
        if ('navigationSource' in expected) {
            assert.strictEqual(resolved.navigation.source, expected.navigationSource, fixture.name);
        }
        if ('geometryRadius' in expected) {
            assert.strictEqual(resolved.scale.geometryRadius?.value, expected.geometryRadius, fixture.name);
        }
        if ('poseScale' in expected) {
            assert.strictEqual(resolved.scale.poseScale?.value, expected.poseScale, fixture.name);
        }
        if ('realWorldScale' in expected) {
            assert.strictEqual(resolved.scale.realWorldScale?.value, expected.realWorldScale, fixture.name);
        }
        if ('backgroundColor' in expected) {
            assert.strictEqual(resolved.backgroundColor.value, expected.backgroundColor, fixture.name);
        }
        if ('colorSpace' in expected) {
            assert.strictEqual(resolved.colorSpace.value, expected.colorSpace, fixture.name);
        }
        if ('diagnosticIncludes' in expected) {
            assert.ok(
                resolved.diagnostics.some(message => message.includes(expected.diagnosticIncludes)),
                fixture.name
            );
        }

        if (!('realWorldScale' in expected)) {
            assert.strictEqual(resolved.scale.realWorldScale, undefined, fixture.name);
        }
    }

    console.log(`presentation metadata tests passed (${fixtures.length} fixtures)`);
}

module.exports = { runPresentationMetadataTests };
