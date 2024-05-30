var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import CameraControls from 'camera-controls';
import { AmbientLight, Box3, Clock, Color, LoadingManager, PerspectiveCamera, Scene, sRGBEncoding, Vector3, WebGLRenderer } from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { GLTFGoogleTiltBrushMaterialExtension } from 'three-icosa';
import { TiltLoader } from 'three-tiltloader';
import { setupNavigation } from 'Navigation';
import { subsetOfTHREE } from 'CameraControlsSetup';
export class Viewer {
    constructor(brushPath, frame) {
        this.sceneColor = new Color("#000000");
        this.icosa_frame = frame;
        if (!this.icosa_frame)
            this.icosa_frame = document.getElementById('icosa-viewer');
        if (!this.icosa_frame) {
            this.icosa_frame = document.createElement('div');
            this.icosa_frame.id = 'icosa-viewer';
        }
        const controlPanel = document.createElement('div');
        controlPanel.classList.add('control-panel');
        const fullscreenButton = document.createElement('button');
        fullscreenButton.classList.add('panel-button', 'fullscreen-button');
        fullscreenButton.onclick = () => { this.toggleFullscreen(fullscreenButton); };
        controlPanel.appendChild(fullscreenButton);
        this.icosa_frame.appendChild(controlPanel);
        const loadscreen = document.createElement('div');
        loadscreen.id = 'loadscreen';
        const loadanim = document.createElement('div');
        loadanim.classList.add('loadlogo');
        loadscreen.appendChild(loadanim);
        this.icosa_frame.appendChild(loadscreen);
        loadscreen.addEventListener('transitionend', function () {
            const opacity = window.getComputedStyle(loadscreen).opacity;
            if (parseFloat(opacity) < 0.2) {
                loadscreen.classList.add('loaded');
            }
        });
        const canvas = document.createElement('canvas');
        canvas.id = 'c';
        this.icosa_frame.appendChild(canvas);
        canvas.onmousedown = () => { canvas.classList.add('grabbed'); };
        canvas.onmouseup = () => { canvas.classList.remove('grabbed'); };
        const renderer = new WebGLRenderer({ canvas: canvas });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.outputEncoding = sRGBEncoding;
        renderer.xr.enabled = true;
        this.icosa_frame.appendChild(VRButton.createButton(renderer));
        const clock = new Clock();
        const fov = 75;
        const aspect = 2;
        const near = 0.1;
        const far = 1000;
        const flatCamera = new PerspectiveCamera(fov, aspect, near, far);
        flatCamera.position.set(10, 10, 10);
        CameraControls.install({ THREE: subsetOfTHREE });
        this.cameraControls = new CameraControls(flatCamera, canvas);
        this.cameraControls.dampingFactor = 0.1;
        this.cameraControls.polarRotateSpeed = this.cameraControls.azimuthRotateSpeed = 0.5;
        this.cameraControls.setTarget(0, 0, 0);
        this.cameraControls.dollyTo(3, true);
        flatCamera.updateProjectionMatrix();
        this.sceneCamera = flatCamera;
        const xrCamera = new PerspectiveCamera(fov, aspect, near, far);
        xrCamera.updateProjectionMatrix();
        setupNavigation(this.cameraControls);
        this.scene = new Scene();
        const viewer = this;
        const manager = new LoadingManager();
        manager.onStart = function () {
            var _a, _b;
            (_a = document.getElementById('loadscreen')) === null || _a === void 0 ? void 0 : _a.classList.remove('fade-out');
            (_b = document.getElementById('loadscreen')) === null || _b === void 0 ? void 0 : _b.classList.remove('loaded');
        };
        manager.onLoad = function () {
            var _a;
            (_a = document.getElementById('loadscreen')) === null || _a === void 0 ? void 0 : _a.classList.add('fade-out');
        };
        this.brushPath = brushPath;
        this.tiltLoader = new TiltLoader(manager);
        this.tiltLoader.setBrushPath(this.brushPath);
        this.gltfLoader = new GLTFLoader(manager);
        this.gltfLoader.register(parser => new GLTFGoogleTiltBrushMaterialExtension(parser, this.brushPath));
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
        this.gltfLoader.setDRACOLoader(dracoLoader);
        function animate() {
            renderer.setAnimationLoop(render);
        }
        function render() {
            const delta = clock.getDelta();
            if (renderer.xr.isPresenting) {
                viewer.sceneCamera = xrCamera;
            }
            else {
                viewer.sceneCamera = flatCamera;
                const needResize = canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight;
                if (needResize) {
                    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
                    flatCamera.aspect = canvas.clientWidth / canvas.clientHeight;
                    flatCamera.updateProjectionMatrix();
                }
                viewer.cameraControls.update(delta);
            }
            renderer.render(viewer.scene, viewer.sceneCamera);
        }
        animate();
    }
    toggleFullscreen(controlButton) {
        var _a, _b;
        if ((_a = this.icosa_frame) === null || _a === void 0 ? void 0 : _a.requestFullscreen)
            (_b = this.icosa_frame) === null || _b === void 0 ? void 0 : _b.requestFullscreen();
        document.onfullscreenchange = () => {
            if (document.fullscreenElement == null) {
                controlButton.onclick = () => {
                    var _a, _b;
                    if ((_a = this.icosa_frame) === null || _a === void 0 ? void 0 : _a.requestFullscreen)
                        (_b = this.icosa_frame) === null || _b === void 0 ? void 0 : _b.requestFullscreen();
                };
                controlButton.classList.remove('fullscreen');
            }
            else {
                controlButton.onclick = () => {
                    if (document.exitFullscreen)
                        document.exitFullscreen();
                };
                controlButton.classList.add('fullscreen');
            }
        };
    }
    initializeScene() {
        if (!this.loadedModel)
            return;
        this.scene.clear();
        this.scene.background = this.sceneColor;
        this.scene.add(this.loadedModel);
        const box = new Box3().setFromObject(this.loadedModel);
        const boxSize = box.getSize(new Vector3()).length();
        const boxCenter = box.getCenter(new Vector3());
        this.cameraControls.minDistance = boxSize * 0.01;
        this.cameraControls.maxDistance = boxSize;
        const midDistance = this.cameraControls.minDistance + (this.cameraControls.maxDistance - this.cameraControls.minDistance) / 2;
        this.cameraControls.setTarget(boxCenter.x, boxCenter.y, boxCenter.z);
        this.cameraControls.dollyTo(midDistance, true);
        this.cameraControls.saveState();
        const ambientLight = new AmbientLight();
        this.scene.add(ambientLight);
    }
    loadGltf(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const gltf = yield this.gltfLoader.loadAsync(url);
            this.loadedModel = gltf.scene;
            this.initializeScene();
        });
    }
    loadTilt(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const tiltData = yield this.tiltLoader.loadAsync(url);
            this.loadedModel = tiltData;
            this.initializeScene();
        });
    }
    loadObj(url) {
    }
}
