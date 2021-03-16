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

import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';
import CameraControls from 'camera-controls';
import * as holdEvent from 'hold-event';
import './css/style.scss';
import { Loader }  from './loader';

export class Viewer {
    private icosa_frame? : HTMLElement | null;
    private icosa_viewer? : Loader;

    constructor(frame?: HTMLElement) {
        this.icosa_frame = frame;
        this.initViewer();
    }

    private setupNavigation(cameraControls : CameraControls) {
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

        
        const leftKey  = new holdEvent.KeyboardKeyHold( KEYCODE.ARROW_LEFT,  1);
        const rightKey = new holdEvent.KeyboardKeyHold( KEYCODE.ARROW_RIGHT, 1);
        const upKey    = new holdEvent.KeyboardKeyHold( KEYCODE.ARROW_UP,    1);
        const downKey  = new holdEvent.KeyboardKeyHold( KEYCODE.ARROW_DOWN,  1);
        leftKey.addEventListener ( 'holding', function( event ) { cameraControls.rotate(   0.1 * THREE.MathUtils.DEG2RAD * event?.deltaTime, 0, true ) } );
        rightKey.addEventListener( 'holding', function( event ) { cameraControls.rotate( - 0.1 * THREE.MathUtils.DEG2RAD * event?.deltaTime, 0, true ) } );
        upKey.addEventListener   ( 'holding', function( event ) { cameraControls.rotate( 0, - 0.05 * THREE.MathUtils.DEG2RAD * event?.deltaTime, true ) } );
        downKey.addEventListener ( 'holding', function( event ) { cameraControls.rotate( 0,   0.05 * THREE.MathUtils.DEG2RAD * event?.deltaTime, true ) } );
    }

    public initViewer() {
        // Attempt to find viewer frame if not assigned
        if(!this.icosa_frame)
            this.icosa_frame = document.getElementById('icosa-viewer');
        
        // Create if still not assigned
        if(!this.icosa_frame) {
            this.icosa_frame = document.createElement('div');
            this.icosa_frame.id = 'icosa-viewer';
        }
        
        const canvas = document.createElement('canvas') as HTMLCanvasElement;
        canvas.id = 'c';
        this.icosa_frame.appendChild(canvas);

        const renderer = new THREE.WebGLRenderer({canvas : canvas});
        renderer.setPixelRatio(window.devicePixelRatio);

        renderer.xr.enabled = true;
        this.icosa_frame.appendChild( VRButton.createButton( renderer ) );

        CameraControls.install({THREE: THREE});

        const clock = new THREE.Clock();

        const fov = 75;
        const aspect = 2;  
        const near = 0.1;
        const far = 1000;
        const flatCamera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        flatCamera.position.set(10, 10, 10);

        const cameraControls = new CameraControls(flatCamera, canvas);
        cameraControls.dampingFactor = 0.1;
        cameraControls.polarRotateSpeed = cameraControls.azimuthRotateSpeed = 0.5;
        cameraControls.setTarget(0, 0, 0);
        cameraControls.dollyTo(3, true);

        flatCamera.updateProjectionMatrix();

        const xrCamera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        xrCamera.updateProjectionMatrix();

        this.setupNavigation(cameraControls);

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xFFE5B4);

        const light = new THREE.DirectionalLight();
        light.intensity = 2.0;
        scene.add(light);

        // const loader = new GLTFLoader();
        // loader.load('res/testmodels/myreality.glb', (gltf) => {
        //     const root = gltf.scene;
        //     scene.add(root);
        // })

        this.icosa_viewer = new Loader(scene, cameraControls);

        function animate() {
            renderer.setAnimationLoop(render);
        }

        function render() {

            var updated = false;

            const delta = clock.getDelta();
            const elapsed = clock.getElapsedTime();

            updated = cameraControls.update(delta) || renderer.xr.isPresenting;

            const needResize = canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight;
            if (needResize) {
                renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
                flatCamera.aspect = canvas.clientWidth / canvas.clientHeight;
                flatCamera.updateProjectionMatrix();
                updated = true;
            }
            
            if(updated) {
                if(renderer.xr.isPresenting) {
                    renderer.render(scene, xrCamera);
                } else {
                    renderer.render(scene, flatCamera);
                }
            }
        }

        animate();
    }

    public load(url : string) {
        this.icosa_viewer?.loadPoly(url);
    }
}