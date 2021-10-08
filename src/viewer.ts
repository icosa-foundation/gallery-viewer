// Copyright 2021 Icosa Gallery
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { AmbientLight, Box3, Camera, Clock, Color, LoadingManager, Mesh, Object3D, PerspectiveCamera, Scene, sRGBEncoding, Vector3, WebGLRenderer } from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';
import CameraControls from 'camera-controls';
import './css/style.scss';
import { setupNavigation } from './helpers/Navigation';
import { TiltLoader, updateBrushes } from 'three-tiltloader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

export class Viewer {
    private icosa_frame? : HTMLElement | null;

    private scene : Scene;

    private tiltLoader: TiltLoader;
    private gltfLoader: GLTFLoader;

    private flatCamera: PerspectiveCamera;
    private xrCamera: PerspectiveCamera;

    private sceneCamera: PerspectiveCamera;
    private sceneColor: Color = new Color("#000000");

    private cameraControls: CameraControls;

    private loadedModel?: Object3D;

    private loaded: boolean = false;

    private updateableMeshes: Mesh[] = [];

    constructor(frame?: HTMLElement) {
        this.icosa_frame = frame;

        // Attempt to find viewer frame if not assigned
        if(!this.icosa_frame)
            this.icosa_frame = document.getElementById('icosa-viewer');
        
        // Create if still not assigned
        if(!this.icosa_frame) {
            this.icosa_frame = document.createElement('div');
            this.icosa_frame.id = 'icosa-viewer';
        }

        const controlPanel = document.createElement('div');
        controlPanel.classList.add('control-panel');

        const fullscreenButton = document.createElement('button');
        fullscreenButton.classList.add('panel-button', 'fullscreen-button');
        fullscreenButton.onclick = () => { this.toggleFullscreen(fullscreenButton); }
        
        controlPanel.appendChild(fullscreenButton);

        this.icosa_frame.appendChild(controlPanel);

        //loadscreen
        const loadscreen = document.createElement('div');
        loadscreen.id = 'loadscreen';
        const loadanim = document.createElement('div');
        loadanim.classList.add('loadlogo');
        loadscreen.appendChild(loadanim);
        this.icosa_frame.appendChild(loadscreen);
        loadscreen.addEventListener('transitionend', function() {
            var opacity = window.getComputedStyle(loadscreen).opacity;
            if (parseFloat(opacity) < 0.2) {
                loadscreen.classList.add('loaded');
            }
        });

        const canvas = document.createElement('canvas') as HTMLCanvasElement;
        canvas.id = 'c';
        this.icosa_frame.appendChild(canvas);
        canvas.onmousedown = () => { canvas.classList.add('grabbed'); }
        canvas.onmouseup = () => { canvas.classList.remove('grabbed'); }

        const renderer = new WebGLRenderer({canvas : canvas});
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.outputEncoding = sRGBEncoding;

        renderer.xr.enabled = true;
        this.icosa_frame.appendChild( VRButton.createButton( renderer ) );
        
        const clock = new Clock();
        
        const fov = 75;
        const aspect = 2;  
        const near = 0.1;
        const far = 1000;
        this.flatCamera = new PerspectiveCamera(fov, aspect, near, far);
        this.flatCamera.position.set(10, 10, 10);

        this.cameraControls = new CameraControls(this.flatCamera, canvas);
        this.cameraControls.dampingFactor = 0.1;
        this.cameraControls.polarRotateSpeed = this.cameraControls.azimuthRotateSpeed = 0.5;
        this.cameraControls.setTarget(0, 0, 0);
        this.cameraControls.dollyTo(3, true);

        this.flatCamera.updateProjectionMatrix();

        this.sceneCamera = this.flatCamera;

        this.xrCamera = new PerspectiveCamera(fov, aspect, near, far);
        this.xrCamera.updateProjectionMatrix();

        setupNavigation(this.cameraControls);

        this.scene = new Scene();

        var that = this;

        const manager = new LoadingManager();
        manager.onStart = function() {
            document.getElementById('loadscreen')?.classList.remove('fade-out');
            document.getElementById('loadscreen')?.classList.remove('loaded');
        };
        manager.onLoad = function () {        
            document.getElementById('loadscreen')?.classList.add('fade-out');
        };

        this.tiltLoader = new TiltLoader(manager);
        this.tiltLoader.setBrushDirectory("https://storage.googleapis.com/static.icosa.gallery/brushes/");

        this.gltfLoader = new GLTFLoader(manager);

        var dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
        this.gltfLoader.setDRACOLoader(dracoLoader);

        function animate() {
            renderer.setAnimationLoop(render);
        }

        function render() {

            const delta = clock.getDelta();
            const elapsed = clock.getElapsedTime();
            
            if(renderer.xr.isPresenting) {
                that.sceneCamera = that.xrCamera;
            } else {
                that.sceneCamera = that.flatCamera;

                const needResize = canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight;
                if (needResize) {
                    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
                    that.flatCamera.aspect = canvas.clientWidth / canvas.clientHeight;
                    that.flatCamera.updateProjectionMatrix();
                }

                that.cameraControls.update(delta);
            }

            updateBrushes(that.updateableMeshes, elapsed, that.sceneCamera.position);

            renderer.render(that.scene, that.sceneCamera);
        }

        animate();
    }

    private toggleFullscreen(controlButton: HTMLButtonElement) {
        if(this.icosa_frame?.requestFullscreen)
            this.icosa_frame?.requestFullscreen();

        document.onfullscreenchange = ()  => {
            if (document.fullscreenElement == null) {
                controlButton.onclick = () => {
                    if(this.icosa_frame?.requestFullscreen)
                        this.icosa_frame?.requestFullscreen();
                };
                controlButton.classList.remove('fullscreen');
            } else {
                controlButton.onclick = () => {
                    if(document.exitFullscreen)
                        document.exitFullscreen();
                };
                controlButton.classList.add('fullscreen');
            }
        }
    }

    private initializeScene() {
        if(!this.loadedModel)
            return;

        this.scene.clear();
        this.scene.background = this.sceneColor;
        this.scene.add(this.loadedModel);

        // Setup camera to center model
        const box = new Box3().setFromObject(this.loadedModel);
        const boxSize = box.getSize(new Vector3()).length();
        const boxCenter = box.getCenter(new Vector3());

        this.cameraControls.minDistance = boxSize * 0.01;
        this.cameraControls.maxDistance = boxSize;

        const midDistance = this.cameraControls.minDistance + (this.cameraControls.maxDistance - this.cameraControls.minDistance) / 2;
        this.cameraControls.setTarget(boxCenter.x, boxCenter.y, boxCenter.z);
        this.cameraControls.dollyTo(midDistance, true);
        this.cameraControls.saveState();

        var ambientLight = new AmbientLight();
        this.scene.add(ambientLight);

        this.loaded = true;
    }

    public async loadTilt(url: string) {
        await this.loadTiltGltf(url);
    }

    public async loadGltf1(url : string) {
        const tiltData = await this.tiltLoader.loadGltf1(url);
        this.updateableMeshes = tiltData.updateableMeshes;
        this.loadedModel = tiltData.scene;
        this.initializeScene();
    }

    public async loadTiltGltf(url : string) {
        const tiltData = await this.tiltLoader.loadAsync(url);
        this.updateableMeshes = tiltData.updateableMeshes;
        this.loadedModel = tiltData.scene;
        this.initializeScene();
    }

    public async loadTiltRaw(url: string) {
        const tiltData = await this.tiltLoader.loadTilt(url);
        this.updateableMeshes = tiltData.updateableMeshes;
        this.loadedModel = tiltData.scene;
        this.initializeScene();
    }

    // Load generic GLTF/GLB ver 2.x
    // This should be the entry point for a Blocks export
    public async loadGltf(url: string) {
        const gltf = await this.tiltLoader.loadAsync(url);
        this.loadedModel = gltf.scene;
        this.initializeScene();
    }

    public loadObj(url: string) {

    }
}