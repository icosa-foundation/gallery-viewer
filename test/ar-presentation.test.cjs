const assert = require('assert');
const fs = require('fs');
const Module = require('module');
const path = require('path');
const ts = require('typescript');
const THREE = require('three');

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
    assert.deepStrictEqual(errors, [], 'AR presentation helpers should transpile without diagnostics');

    const loadedModule = new Module(filename, module);
    loadedModule.filename = filename;
    loadedModule.paths = Module._nodeModulePaths(path.dirname(filename));
    loadedModule._compile(result.outputText, filename);
    return loadedModule.exports;
}

function assertMatrixApproximatelyEqual(actual, expected, message) {
    for (let index = 0; index < 16; index++) {
        assert.ok(
            Math.abs(actual.elements[index] - expected.elements[index]) < 1e-6,
            `${message}: matrix element ${index}`
        );
    }
}

function runARPresentationTests() {
    const projectRoot = path.resolve(__dirname, '..');
    const helperPath = path.join(projectRoot, 'src', 'xr', 'ARPresentation.ts');
    const {
        applyARVirtualEnvironmentPolicy,
        captureARVirtualEnvironment,
        computeARContentEntryMatrix,
        computeLocalPlacementMatrix,
        computeXRClippingRange,
        normalizeEnvironmentBlendMode,
        restoreARVirtualEnvironment,
        shouldSuppressVirtualEnvironment
    } = loadTypeScriptModule(helperPath);

    assert.strictEqual(normalizeEnvironmentBlendMode('alpha-blend'), 'alpha-blend');
    assert.strictEqual(normalizeEnvironmentBlendMode('additive'), 'additive');
    assert.strictEqual(normalizeEnvironmentBlendMode('opaque'), 'opaque');
    assert.strictEqual(normalizeEnvironmentBlendMode('unexpected'), 'unknown');

    assert.strictEqual(shouldSuppressVirtualEnvironment('alpha-blend'), true);
    assert.strictEqual(shouldSuppressVirtualEnvironment('additive'), true);
    assert.strictEqual(shouldSuppressVirtualEnvironment('opaque'), false);
    assert.strictEqual(shouldSuppressVirtualEnvironment('unknown'), false);

    const scene = new THREE.Scene();
    const background = new THREE.Color(0x123456);
    const fog = new THREE.Fog(0x654321, 1, 20);
    const sky = new THREE.Group();
    scene.background = background;
    scene.fog = fog;
    sky.visible = true;
    const environmentSnapshot = captureARVirtualEnvironment(scene, sky);
    applyARVirtualEnvironmentPolicy(scene, 'alpha-blend', sky);
    assert.strictEqual(scene.background, null);
    assert.strictEqual(scene.fog, null);
    assert.strictEqual(sky.visible, false);
    restoreARVirtualEnvironment(scene, environmentSnapshot);
    assert.strictEqual(scene.background, background, 'Background identity should be restored');
    assert.strictEqual(scene.fog, fog, 'Fog identity should be restored');
    assert.strictEqual(sky.visible, true, 'Sky visibility should be restored');

    const opaqueScene = new THREE.Scene();
    opaqueScene.background = background;
    opaqueScene.fog = fog;
    applyARVirtualEnvironmentPolicy(opaqueScene, 'opaque');
    assert.strictEqual(opaqueScene.background, background);
    assert.strictEqual(opaqueScene.fog, fog);

    const additiveScene = new THREE.Scene();
    const additiveSky = new THREE.Group();
    additiveScene.background = background;
    additiveScene.fog = fog;
    applyARVirtualEnvironmentPolicy(additiveScene, 'additive', additiveSky);
    assert.strictEqual(additiveScene.background, null);
    assert.strictEqual(additiveScene.fog, null);
    assert.strictEqual(additiveSky.visible, false);

    assert.deepStrictEqual(
        computeXRClippingRange(0.1, 1000),
        { near: 0.01, far: 6000 }
    );
    assert.deepStrictEqual(
        computeXRClippingRange(0.0001, 20000, 7000, 1000),
        { near: 0.001, far: 20000 }
    );
    assert.deepStrictEqual(
        computeXRClippingRange(0.01, 6000, 7000, 1000),
        { near: 0.01, far: 8100 }
    );

    const authoredCamera = new THREE.Matrix4().compose(
        new THREE.Vector3(2, 1.5, -4),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(0.2, 0.7, -0.1)),
        new THREE.Vector3(1, 1, 1)
    );
    const trackedViewer = new THREE.Matrix4().compose(
        new THREE.Vector3(-1, 1.7, 3),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.1, -0.4, 0.05)),
        new THREE.Vector3(1, 1, 1)
    );
    const contentEntry = computeARContentEntryMatrix(authoredCamera, trackedViewer);
    const actualView = trackedViewer.clone().invert().multiply(contentEntry);
    const expectedView = authoredCamera.clone().invert();
    assertMatrixApproximatelyEqual(
        actualView,
        expectedView,
        'Content-side entry transform should reproduce the authored camera view'
    );

    const outputTarget = new THREE.Matrix4();
    assert.strictEqual(
        computeARContentEntryMatrix(authoredCamera, trackedViewer, outputTarget),
        outputTarget,
        'The optional output matrix should be reused'
    );

    const placementParent = new THREE.Matrix4().compose(
        new THREE.Vector3(4, 1, -2),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0.8, 0)),
        new THREE.Vector3(1, 1, 1)
    );
    const desiredPlacementWorld = new THREE.Matrix4().compose(
        new THREE.Vector3(-3, 0.75, 6),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(0.1, -0.3, 0.05)),
        new THREE.Vector3(1.5, 1.5, 1.5)
    );
    const localPlacement = computeLocalPlacementMatrix(
        placementParent,
        desiredPlacementWorld
    );
    const reconstructedPlacementWorld = placementParent.clone().multiply(localPlacement);
    assertMatrixApproximatelyEqual(
        reconstructedPlacementWorld,
        desiredPlacementWorld,
        'Parent and local placement should reconstruct the requested world transform'
    );
    const placementOutputTarget = new THREE.Matrix4();
    assert.strictEqual(
        computeLocalPlacementMatrix(
            placementParent,
            desiredPlacementWorld,
            placementOutputTarget
        ),
        placementOutputTarget,
        'The optional placement output matrix should be reused'
    );

    console.log('AR presentation tests passed');
}

module.exports = { runARPresentationTests };
