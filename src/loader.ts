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

import CameraControls from "camera-controls";
import { LoadingManager, Material, Mesh, RawShaderMaterial, Scene, Object3D, Vector3, Color, Camera, Vector4, Box3, AmbientLight, Matrix4 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { TiltLoader, updateBrushes } from 'three-tiltloader';

export class Loader {
    private scene : Scene;

    private tiltLoader: TiltLoader;
    private gltfLoader: GLTFLoader;

    private sceneCamera: Camera;
    private sceneColor: Color = new Color("#000000");

    private cameraControls: CameraControls;

    private loadedModel?: Object3D;

    private loaded: boolean = false;
    private isGltfLegacy: boolean = false;

    private updateableMeshes: Mesh[] = [];

    constructor (scene : Scene, sceneCamera : Camera, cameraControls : CameraControls) {        
        const manager = new LoadingManager();
        manager.onStart = function( ) {
            document.getElementById('loadscreen')?.classList.remove('fade-out');
            document.getElementById('loadscreen')?.classList.remove('loaded');
        };
        manager.onLoad = function ( ) {        
            document.getElementById('loadscreen')?.classList.add('fade-out');
        };

        this.tiltLoader = new TiltLoader(manager);
        this.tiltLoader.setBrushDirectory("https://storage.googleapis.com/static.icosa.gallery/brushes/");

        this.gltfLoader = new GLTFLoader(manager);

        var dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
        this.gltfLoader.setDRACOLoader(dracoLoader);

        this.scene = scene;
        this.sceneCamera = sceneCamera;
        this.cameraControls = cameraControls;
    }

    public update(elapsedTime : number) {
        if(!this.loaded)
            return;

        updateBrushes(this.updateableMeshes, elapsedTime, this.sceneCamera.position);
    }

    private finishSetup() {
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

    public async loadTiltGltf(url : string) {
        const tiltData = await this.tiltLoader.loadAsync(url);
        this.updateableMeshes = tiltData.updateableMeshes;
        this.loadedModel = tiltData.scene;
        this.finishSetup();
    }

    public async loadTiltGltf1(url : string) {
        const tiltData = await this.tiltLoader.loadGltf1(url);
        this.updateableMeshes = tiltData.updateableMeshes;
        this.loadedModel = tiltData.scene;
        this.finishSetup();
    }

    public async loadGltf(url: string) {
        const gltf = await this.gltfLoader.loadAsync(url);
        this.loadedModel = gltf.scene;
        this.finishSetup();
    }

    public async loadTiltRaw(url: string) {
        const tiltData = await this.tiltLoader.loadTilt(url);
        this.updateableMeshes = tiltData.updateableMeshes;
        this.loadedModel = tiltData.scene;
        this.finishSetup();
    }
}