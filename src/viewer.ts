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
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import CameraControls from 'camera-controls';
import './css/style.scss';
import { Loader }  from './Loader';
import { setupNavigation } from './helpers/Navigation'

export class Viewer {
    private icosa_frame? : HTMLElement | null;
    private icosa_viewer? : Loader;

    constructor(frame?: HTMLElement) {
        this.icosa_frame = frame;
        this.initViewer();
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

        const renderer = new THREE.WebGLRenderer({canvas : canvas});
        renderer.setPixelRatio(window.devicePixelRatio);

        renderer.xr.enabled = true;
        this.icosa_frame.appendChild( VRButton.createButton( renderer ) );
        
        const clock = new THREE.Clock();
        
        const fov = 75;
        const aspect = 2;  
        const near = 0.1;
        const far = 1000;
        const flatCamera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        flatCamera.position.set(10, 10, 10);
        
        CameraControls.install({THREE: THREE});

        const cameraControls = new CameraControls(flatCamera, canvas);
        cameraControls.dampingFactor = 0.1;
        cameraControls.polarRotateSpeed = cameraControls.azimuthRotateSpeed = 0.5;
        cameraControls.setTarget(0, 0, 0);
        cameraControls.dollyTo(3, true);

        flatCamera.updateProjectionMatrix();

        const xrCamera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        xrCamera.updateProjectionMatrix();

        setupNavigation(cameraControls);

        const scene = new THREE.Scene();
        //scene.background = new THREE.Color(0xFFE5B4);

        this.icosa_viewer = new Loader(scene, flatCamera, cameraControls);

        var that = this;

        function animate() {
            renderer.setAnimationLoop(render);
        }

        function render() {

            const delta = clock.getDelta();
            const elapsed = clock.getElapsedTime();

            cameraControls.update(delta);

            const needResize = canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight;
            if (needResize) {
                renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
                flatCamera.aspect = canvas.clientWidth / canvas.clientHeight;
                flatCamera.updateProjectionMatrix();
            }
            
            that.icosa_viewer?.update(elapsed);

            if(renderer.xr.isPresenting) {
                renderer.render(scene, xrCamera);
            } else {
                renderer.render(scene, flatCamera);
            }
        }

        animate();
    }

    public loadGLTF(url : string) {
        this.icosa_viewer?.loadGLTF(url);
    }

    public loadPolyUrl(url : string) {
        this.icosa_viewer?.loadPolyUrl(url);
    }

    public loadPolyAsset(assetID : string) {
        this.icosa_viewer?.loadPolyAsset(assetID);
    }

    public loadPolyTilt(url : string) {
        this.icosa_viewer?.loadPolyTilt(url);
    }

    public loadPolyGLTF(url : string) {
        this.icosa_viewer?.loadPolyGltf(url);
    }
}