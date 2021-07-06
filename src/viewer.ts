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

import { Clock, PerspectiveCamera, Scene, WebGLRenderer, Color } from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';
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

    public initViewer() {
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

        renderer.xr.enabled = true;
        this.icosa_frame.appendChild( VRButton.createButton( renderer ) );
        
        const clock = new Clock();
        
        const fov = 75;
        const aspect = 2;  
        const near = 0.1;
        const far = 1000;
        const flatCamera = new PerspectiveCamera(fov, aspect, near, far);
        flatCamera.position.set(10, 10, 10);

        const cameraControls = new CameraControls(flatCamera, canvas);
        cameraControls.dampingFactor = 0.1;
        cameraControls.polarRotateSpeed = cameraControls.azimuthRotateSpeed = 0.5;
        cameraControls.setTarget(0, 0, 0);
        cameraControls.dollyTo(3, true);

        flatCamera.updateProjectionMatrix();

        const xrCamera = new PerspectiveCamera(fov, aspect, near, far);
        xrCamera.updateProjectionMatrix();

        setupNavigation(cameraControls);

        const scene = new Scene();

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

    // Load GLTF/GLB ver 2.x *Brush file
    public loadBrushGltf(url: string) {
        this.icosa_viewer?.loadBrushGltf2(url);
    }

    // Load GLTF/GLB ver 1.0 *Brush file
    // Legacy for original exported assets, and files that were recovered from Poly
    public loadBrushGltf1(url: string) {
        this.icosa_viewer?.loadBrushGltf1(url);
    }

    // Load generic GLTF/GLB ver 2.x
    // This should be the entry point for a Blocks export
    public loadGltf(url: string) {

    }

    public loadObj(url: string) {

    }


    // public loadGLTF(url : string) {
    //     this.icosa_viewer?.loadGLTF(url);
    // }
    
    // public loadPolyAsset(assetID : string) {
    //     this.icosa_viewer?.loadPolyAsset(assetID);
    // }
    
    // public loadBrushGltf1(url : string) {
    //     this.icosa_viewer?.loadPolyTilt(url);
    // }


    // Helper functions for platforms

    // Icosa
    // public loadIcosaUrl(url : string) {
    //     this.icosa_viewer?.loadIcosaUrl(url);
    // }

    // public loadIcosaAsset(userurl : string, asseturl : string) {
    //     this.icosa_viewer?.loadIcosaAsset(userurl, asseturl);
    // }

    // // Poly
    // public loadPolyGLTF(url : string) {
    //     this.icosa_viewer?.loadPolyGltf(url);
    // }    
    
    // public loadPolyUrl(url : string) {
    //     this.icosa_viewer?.loadPolyUrl(url);
    // }
}