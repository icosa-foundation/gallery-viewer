// Copyright 2021-2022 Icosa Gallery
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

import CameraControls from 'camera-controls';
import * as THREE from 'three';

import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { GLTFGoogleTiltBrushMaterialExtension } from 'three-icosa';
import { TiltLoader } from 'three-tiltloader';
import * as holdEvent from "hold-event";
import {MathUtils} from "three";

export class Viewer {
    private icosa_frame? : HTMLElement | null;
    private brushPath: string;
    private scene : THREE.Scene;

    private tiltLoader: TiltLoader;
    private gltfLoader: GLTFLoader;

    private sceneCamera: THREE.PerspectiveCamera;
    private sceneColor: THREE.Color = new THREE.Color("#000000");

    private cameraControls: CameraControls;

    private loadedModel?: THREE.Object3D;

    private setupNavigation(cameraControls : CameraControls): void {
        const KEYCODE = {
            W: 87,
            A: 65,
            S: 83,
            D: 68,
            Q: 81,
            E: 69,
            ARROW_LEFT : 37,
            ARROW_UP   : 38,
            ARROW_RIGHT: 39,
            ARROW_DOWN : 40,
        };

        const wKey = new holdEvent.KeyboardKeyHold( KEYCODE.W, 1);
        const aKey = new holdEvent.KeyboardKeyHold( KEYCODE.A, 1);
        const sKey = new holdEvent.KeyboardKeyHold( KEYCODE.S, 1);
        const dKey = new holdEvent.KeyboardKeyHold( KEYCODE.D, 1);
        const qKey = new holdEvent.KeyboardKeyHold( KEYCODE.Q, 1);
        const eKey = new holdEvent.KeyboardKeyHold( KEYCODE.E, 1);
        aKey.addEventListener( 'holding', function( event ) { cameraControls.truck(- 0.01 * event?.deltaTime, 0, true ) } );
        dKey.addEventListener( 'holding', function( event ) { cameraControls.truck(  0.01 * event?.deltaTime, 0, true ) } );
        wKey.addEventListener( 'holding', function( event ) { cameraControls.forward(   0.01 * event?.deltaTime, true ) } );
        sKey.addEventListener( 'holding', function( event ) { cameraControls.forward( - 0.01 * event?.deltaTime, true ) } );
        qKey.addEventListener( 'holding', function( event ) { cameraControls.truck( 0,  0.01 * event?.deltaTime, true ) } );
        eKey.addEventListener( 'holding', function( event ) { cameraControls.truck( 0,- 0.01 * event?.deltaTime, true ) } );
        // Leaving this here because I hope I can use it later somehow.
        // cameraControls.mouseButtons.wheel = CameraControls.ACTION.ZOOM;

        const leftKey  = new holdEvent.KeyboardKeyHold( KEYCODE.ARROW_LEFT,  1);
        const rightKey = new holdEvent.KeyboardKeyHold( KEYCODE.ARROW_RIGHT, 1);
        const upKey    = new holdEvent.KeyboardKeyHold( KEYCODE.ARROW_UP,    1);
        const downKey  = new holdEvent.KeyboardKeyHold( KEYCODE.ARROW_DOWN,  1);
        leftKey.addEventListener ( 'holding', function( event ) { cameraControls.rotate(   0.1 * MathUtils.DEG2RAD * event?.deltaTime, 0, true ) } );
        rightKey.addEventListener( 'holding', function( event ) { cameraControls.rotate( - 0.1 * MathUtils.DEG2RAD * event?.deltaTime, 0, true ) } );
        upKey.addEventListener   ( 'holding', function( event ) { cameraControls.rotate( 0, - 0.05 * MathUtils.DEG2RAD * event?.deltaTime, true ) } );
        downKey.addEventListener ( 'holding', function( event ) { cameraControls.rotate( 0,   0.05 * MathUtils.DEG2RAD * event?.deltaTime, true ) } );
    }

    constructor(brushPath: string, frame?: HTMLElement) {
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
            const opacity = window.getComputedStyle(loadscreen).opacity;
            if (parseFloat(opacity) < 0.2) {
                loadscreen.classList.add('loaded');
            }
        });

        const canvas = document.createElement('canvas') as HTMLCanvasElement;
        canvas.id = 'c';
        this.icosa_frame.appendChild(canvas);
        canvas.onmousedown = () => { canvas.classList.add('grabbed'); }
        canvas.onmouseup = () => { canvas.classList.remove('grabbed'); }

        const renderer = new THREE.WebGLRenderer({canvas : canvas});
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.outputEncoding = THREE.sRGBEncoding;

        renderer.xr.enabled = true;
        this.icosa_frame.appendChild( VRButton.createButton( renderer ) );
        
        const clock = new THREE.Clock();
        
        const fov = 75;
        const aspect = 2;  
        const near = 0.1;
        const far = 1000;
        const flatCamera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        flatCamera.position.set(10, 10, 10);

        CameraControls.install({ THREE: THREE });
        this.cameraControls = new CameraControls(flatCamera, canvas);
        this.cameraControls.dampingFactor = 0.1;
        this.cameraControls.polarRotateSpeed = this.cameraControls.azimuthRotateSpeed = 0.5;
        this.cameraControls.setTarget(0, 0, 0);
        this.cameraControls.dollyTo(3, true);

        flatCamera.updateProjectionMatrix();

        this.sceneCamera = flatCamera;

        const xrCamera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        xrCamera.updateProjectionMatrix();

        this.setupNavigation(this.cameraControls);

        this.scene = new THREE.Scene();

        const viewer = this;

        const manager = new THREE.LoadingManager();
        manager.onStart = function() {
            document.getElementById('loadscreen')?.classList.remove('fade-out');
            document.getElementById('loadscreen')?.classList.remove('loaded');
        };

        manager.onLoad = function () {
            document.getElementById('loadscreen')?.classList.add('fade-out');
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
            
            if(renderer.xr.isPresenting) {
                viewer.sceneCamera = xrCamera;
            } else {
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
        const box = new THREE.Box3().setFromObject(this.loadedModel);
        const boxSize = box.getSize(new THREE.Vector3()).length();
        const boxCenter = box.getCenter(new THREE.Vector3());

        this.cameraControls.minDistance = boxSize * 0.01;
        this.cameraControls.maxDistance = boxSize;

        const midDistance = this.cameraControls.minDistance + (this.cameraControls.maxDistance - this.cameraControls.minDistance) / 2;
        this.cameraControls.setTarget(boxCenter.x, boxCenter.y, boxCenter.z);
        this.cameraControls.dollyTo(midDistance, true);
        this.cameraControls.saveState();

        const ambientLight = new THREE.AmbientLight();
        this.scene.add(ambientLight);
    }

    public async loadGltf(url: string) {
        const gltf = await this.gltfLoader.loadAsync(url);
        this.loadedModel = gltf.scene;
        this.initializeScene();
    }

    public async loadTilt(url: string) {
        const tiltData = await this.tiltLoader.loadAsync(url);
        this.loadedModel = tiltData;
        this.initializeScene();
    }
}