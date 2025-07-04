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
import {GLTF, GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader.js';
import {MTLLoader} from 'three/examples/jsm/loaders/MTLLoader.js';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js';
import {PLYLoader} from 'three/examples/jsm/loaders/PLYLoader.js';
import {STLLoader} from 'three/examples/jsm/loaders/STLLoader.js';
import {USDZLoader} from 'three/examples/jsm/loaders/USDZLoader.js';
import {VOXLoader, VOXMesh} from 'three/examples/jsm/loaders/VOXLoader.js';
import { XRButton } from './IcosaXRButton.js';
import { GLTFGoogleTiltBrushTechniquesExtension } from 'three-icosa';
import { GLTFGoogleTiltBrushMaterialExtension } from 'three-icosa';
import { TiltLoader } from 'three-tiltloader';
import * as holdEvent from "hold-event";
import {CanvasTexture, Object3D} from "three";
// import { EffectComposer } from 'three/addons';
// import { RenderPass } from 'three/addons';
import { setupNavigation } from './helpers/Navigation';
import { LegacyGLTFLoader } from './legacy/LegacyGLTFLoader.js';
import { replaceBrushMaterials } from './legacy/ReplaceLegacyMaterials.js';
import {texture} from "three/examples/jsm/nodes/accessors/TextureNode";
// import { GlitchPass } from 'three/addons';
// import { OutputPass } from 'three/addons';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';

class SketchMetadata {
    public EnvironmentGuid : string;
    public Environment : string;
    public UseGradient : boolean;
    public SkyColorA : THREE.Color;
    public SkyColorB : THREE.Color;
    public SkyGradientDirection : THREE.Vector3;
    public AmbientLightColor : THREE.Color;
    public FogColor : THREE.Color;
    public FogDensity : number;
    public SceneLight0Color : THREE.Color;
    public SceneLight0Rotation : THREE.Vector3;
    public SceneLight1Color : THREE.Color;
    public SceneLight1Rotation : THREE.Vector3;
    public PoseTranslation : THREE.Vector3;
    public PoseRotation : THREE.Quaternion;
    public PoseScale : number;
    public EnvironmentPreset: EnvironmentPreset;
    public SkyTexture: string;
    public ReflectionTexture: string;
    public ReflectionIntensity : number

    constructor()
    constructor(userData: any)
    constructor(scene?: THREE.Scene) {
        let userData = scene?.userData ?? {};

        // Traverse the scene and return all nodes with a name starting with "node_SceneLight_"
        let sceneLights: any[] = [];

        scene?.traverse((node: any) => {
            if (node.name && node.name.startsWith("node_SceneLight_")) {
                sceneLights.push(node);
                if (sceneLights.length === 2) {
                    return false; // Bail out early
                }
            }
            return true; // Continue traversal
        });
        this.EnvironmentGuid = userData['TB_EnvironmentGuid'] ?? '';
        this.Environment = userData['TB_Environment'] ?? '(None)';
        this.EnvironmentPreset = new EnvironmentPreset(Viewer.lookupEnvironment(this.EnvironmentGuid));

        if (userData && userData['TB_UseGradient'] === undefined) {
            // The sketch metadata doesn't specify whether to use a gradient or not,
            // so we'll use the environment preset value (assuming it's not a null preset)
            let isValidEnvironmentPreset = this.EnvironmentPreset.Guid !== null;
            this.UseGradient = isValidEnvironmentPreset && this.EnvironmentPreset.UseGradient;
        } else {
            this.UseGradient = JSON.parse(userData['TB_UseGradient'].toLowerCase());
        }
        this.SkyColorA = this.parseTBColorString(userData['TB_SkyColorA'], this.EnvironmentPreset.SkyColorA);
        this.SkyColorB = this.parseTBColorString(userData['TB_SkyColorB'], this.EnvironmentPreset.SkyColorB);
        this.SkyGradientDirection = this.parseTBVector3(userData['TB_SkyGradientDirection'], new THREE.Vector3(0, 1, 0));
        this.AmbientLightColor = this.parseTBColorString(userData['TB_AmbientLightColor'], this.EnvironmentPreset.AmbientLightColor);
        this.FogColor = this.parseTBColorString(userData['TB_FogColor'], this.EnvironmentPreset.FogColor);
        this.FogDensity = userData['TB_FogDensity'] ?? this.EnvironmentPreset.FogDensity;
        this.SkyTexture = userData['TB_SkyTexture'] ?? this.EnvironmentPreset.SkyTexture;
        this.ReflectionTexture = userData['TB_ReflectionTexture'] ?? this.EnvironmentPreset.ReflectionTexture;
        this.ReflectionIntensity = userData['TB_ReflectionIntensity'] ?? this.EnvironmentPreset.ReflectionIntensity;

        function radToDeg3(rot : THREE.Euler) {
            return {
                x: THREE.MathUtils.radToDeg(rot.x),
                y: THREE.MathUtils.radToDeg(rot.y),
                z: THREE.MathUtils.radToDeg(rot.z)
            };
        }

        let light0rot = sceneLights.length == 1 ? radToDeg3(sceneLights[0].rotation) : null;
        let light1rot = sceneLights.length == 2 ? radToDeg3(sceneLights[1].rotation) : null;
        this.SceneLight0Rotation = userData['TB_SceneLight0Rotation'] ?? light0rot ?? this.EnvironmentPreset.SceneLight0Rotation;
        this.SceneLight1Rotation = userData['TB_SceneLight1Rotation'] ?? light1rot ?? this.EnvironmentPreset.SceneLight1Rotation;

        let light0col = userData['TB_SceneLight0Color'] ?? this.EnvironmentPreset.SceneLight0Color;
        let light1col = userData['TB_SceneLight1Color'] ?? this.EnvironmentPreset.SceneLight1Color;
        this.SceneLight0Color = new THREE.Color(light0col.r, light0col.g, light0col.b);
        this.SceneLight1Color = new THREE.Color(light1col.r, light1col.g, light1col.b);

        this.PoseTranslation = this.parseTBVector3(userData['TB_PoseTranslation']);
        this.PoseRotation = this.parseTBRotation(userData['TB_PoseRotation']);
        this.PoseScale = userData['TB_PoseScale'] ?? 1;
    }

    private parseTBRotation(vectorString: string) {
        if (!vectorString) {return new THREE.Quaternion()}
        let [x, y, z] = vectorString.split(',').map(parseFloat);
        return new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z));
    }

    private parseTBVector3(vectorString: string, defaultValue? : THREE.Vector3) {
        if (!vectorString) {return defaultValue ?? new THREE.Vector3()}
        let [x, y, z] = vectorString.split(',').map(parseFloat);
        return new THREE.Vector3(x, y, z);
    }

    private parseTBColorString(colorString: string, defaultValue: THREE.Color) {
        let r : number, g : number, b : number;
        if (colorString) {
            [r, g, b] = colorString.split(',').map(parseFloat);
            return new THREE.Color(r, g, b);
        } else {
            return defaultValue;
        }

    }
}

class EnvironmentPreset {

    public Guid : string;
    public Name : string;
    public UseGradient : boolean;
    public SkyColorA : THREE.Color;
    public SkyColorB : THREE.Color;
    public SkyGradientDirection : THREE.Vector3;
    public FogColor : THREE.Color;
    public FogDensity : number;
    public AmbientLightColor : THREE.Color;
    public SceneLight0Color : THREE.Color;
    public SceneLight0Rotation : THREE.Vector3;
    public SceneLight1Color : THREE.Color;
    public SceneLight1Rotation : THREE.Vector3;
    public SkyTexture: string;
    public ReflectionTexture: string;
    public ReflectionIntensity: number;

    constructor()
    constructor(preset: any)
    constructor(preset?: any) {

        let defaultColor = new THREE.Color("#FFF");
        let defaultRotation = new THREE.Vector3(0, 1, 0);

        this.Guid = preset?.guid ?? null;
        this.Name = preset?.name ?? "No preset";
        this.AmbientLightColor = preset?.renderSettings.ambientColor ?? defaultColor;
        this.SkyColorA = preset?.skyboxColorA ?? defaultColor;
        this.SkyColorB = preset?.skyboxColorB ?? defaultColor;
        this.SkyGradientDirection = new THREE.Vector3(0, 1, 0);
        this.FogColor = preset?.renderSettings.fogColor ?? defaultColor;
        this.FogDensity = preset?.renderSettings.fogDensity ?? 0;
        this.SceneLight0Color = preset?.lights[0].color ?? defaultColor;
        this.SceneLight0Rotation = preset?.lights[0].rotation ?? defaultRotation;
        this.SceneLight1Color = preset?.lights[1].color ?? defaultColor;
        this.SceneLight1Rotation = preset?.lights[1].rotation ?? defaultRotation;
        this.SkyTexture = preset?.renderSettings.skyboxCubemap ?? null;
        this.UseGradient = this.SkyTexture === null;
        this.ReflectionTexture = preset?.renderSettings.reflectionCubemap ?? null;
        this.ReflectionIntensity = preset?.renderSettings.reflectionIntensity ?? 1;
    }
}

export class Viewer {

    public gltfLoader: GLTFLoader;
    public gltfLegacyLoader: LegacyGLTFLoader;
    public objLoader: OBJLoader;
    public fbxLoader: FBXLoader;
    public mtlLoader: MTLLoader;
    public plyLoader: PLYLoader;
    public stlLoader: STLLoader;
    public usdzLoader: USDZLoader;
    public voxLoader: VOXLoader;
    public three : any;
    public captureThumbnail : (width : number, height : number) => string;
    public dataURLtoBlob : (dataURL : string) => Blob;
    public modelBoundingBox?: THREE.Box3;

    private icosa_frame? : HTMLElement | null;
    private brushPath: URL;
    private texturePath: URL;
    private environmentPath: URL;
    private scene : THREE.Scene;
    private canvas : HTMLCanvasElement;

    private activeCamera: THREE.PerspectiveCamera;
    private flatCamera: THREE.PerspectiveCamera;
    private xrCamera: THREE.PerspectiveCamera;
    private cameraControls: CameraControls;
    private trackballControls: TrackballControls;
    private loadedModel?: THREE.Object3D;
    private sceneGltf?: GLTF;
    public environmentObject?: Object3D;
    public skyObject?: Object3D;
    public sketchMetadata?: SketchMetadata;
    private defaultBackgroundColor: THREE.Color; // Used if no environment sky is set
    private overrides: any;
    private cameraRig: THREE.Group;
    public selectedNode: THREE.Object3D | null;
    public showErrorIcon: () => void;
    public loadingError: boolean;

    constructor(assetBaseUrl: string, frame?: HTMLElement) {
        this.loadingError = false;
        this.icosa_frame = frame;

        // Attempt to find viewer frame if not assigned
        if(!this.icosa_frame)
            this.icosa_frame = document.getElementById('icosa-viewer');

        // Create if still not assigned
        if(!this.icosa_frame) {
            this.icosa_frame = document.createElement('div');
            this.icosa_frame.id = 'icosa-viewer';
        }

        initCustomUi(this.icosa_frame);

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

        this.showErrorIcon = () => {
            let loadscreen = document.getElementById('loadscreen');
            loadscreen?.classList.remove('fade-out');
            loadscreen?.classList.add('loaderror');
        }

        const clock = new THREE.Clock();

        this.scene = new THREE.Scene();
        this.three = THREE;

        const viewer = this;

        const manager = new THREE.LoadingManager();
        manager.onStart = function() {
            document.getElementById('loadscreen')?.classList.remove('fade-out');
            document.getElementById('loadscreen')?.classList.remove('loaded');
        };

        manager.onLoad = function () {
            let loadscreen = document.getElementById('loadscreen');
            if (!loadscreen?.classList.contains('loaderror'))
            {
                loadscreen?.classList.add('fade-out');
            }
        };

        this.brushPath = new URL('brushes/', assetBaseUrl);

        this.environmentPath = new URL('environments/', assetBaseUrl);
        this.texturePath = new URL('textures/', assetBaseUrl);

        this.defaultBackgroundColor = new THREE.Color(0x000000);

        this.tiltLoader = new TiltLoader(manager);
        this.tiltLoader.setBrushPath(this.brushPath.toString());

        this.objLoader = new OBJLoader(manager);
        this.mtlLoader = new MTLLoader(manager);
        this.fbxLoader = new FBXLoader(manager);
        this.plyLoader = new PLYLoader(manager);
        this.stlLoader = new STLLoader(manager);
        this.usdzLoader = new USDZLoader(manager);
        this.voxLoader = new VOXLoader(manager);

        this.gltfLegacyLoader = new LegacyGLTFLoader(manager);
        this.gltfLoader = new GLTFLoader(manager);
        // this.gltfLoader.register(parser => new GLTFGoogleTiltBrushTechniquesExtension(parser, this.brushPath.toString()));
        this.gltfLoader.register(parser => new GLTFGoogleTiltBrushMaterialExtension(parser, this.brushPath.toString()));

        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
        this.gltfLoader.setDRACOLoader(dracoLoader);

        this.canvas = document.createElement('canvas') as HTMLCanvasElement;
        this.canvas.id = 'c';
        this.icosa_frame.appendChild(this.canvas);
        this.canvas.onmousedown = () => { this.canvas.classList.add('grabbed'); }
        this.canvas.onmouseup = () => { this.canvas.classList.remove('grabbed'); }

        const renderer = new THREE.WebGLRenderer({
            canvas : this.canvas,
            antialias: true
        });

        renderer.setPixelRatio(window.devicePixelRatio);

        // TODO linear/gamma selection
        if (false) {
            renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
        } else {
            renderer.outputColorSpace = THREE.SRGBColorSpace;
        }

        renderer.xr.enabled = true;

        function handleController(inputSource: XRInputSource) {
            const gamepad = inputSource.gamepad;
            if (gamepad) {
                return {
                    axes: gamepad.axes,
                    buttons: gamepad.buttons
                };
            }
            return null;
        }

        this.cameraRig = new THREE.Group();
        this.selectedNode = null;

        let controller0: THREE.Group;
        let controller1: THREE.Group;
        let controllerGrip0;
        let controllerGrip1;
        let previousLeftThumbstickX = 0;

        controller0 = renderer.xr.getController(0);
        this.scene.add(controller0);


        controller1 = renderer.xr.getController(1);
        this.scene.add(controller1);

        const controllerModelFactory = new XRControllerModelFactory();

        controllerGrip0 = renderer.xr.getControllerGrip(0);
        controllerGrip0.add(controllerModelFactory.createControllerModel(controllerGrip0));
        this.scene.add(controllerGrip0);

        controllerGrip1 = renderer.xr.getControllerGrip(1);
        controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
        this.scene.add(controllerGrip1);

        let xrButton = XRButton.createButton( renderer );
        this.icosa_frame.appendChild(xrButton);

        function initCustomUi(viewerContainer : HTMLElement) {

            const button = document.createElement('button');
            button.innerHTML = `<?xml version="1.0" encoding="utf-8"?>
<svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4 7.5L11.6078 3.22062C11.7509 3.14014 11.8224 3.09991 11.8982 3.08414C11.9654 3.07019 12.0346 3.07019 12.1018 3.08414C12.1776 3.09991 12.2491 3.14014 12.3922 3.22062L20 7.5M4 7.5V16.0321C4 16.2025 4 16.2876 4.02499 16.3637C4.04711 16.431 4.08326 16.4928 4.13106 16.545C4.1851 16.6041 4.25933 16.6459 4.40779 16.7294L12 21M4 7.5L12 11.5M12 21L19.5922 16.7294C19.7407 16.6459 19.8149 16.6041 19.8689 16.545C19.9167 16.4928 19.9529 16.431 19.975 16.3637C20 16.2876 20 16.2025 20 16.0321V7.5M12 21V11.5M20 7.5L12 11.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
            button.style.backgroundColor = 'transparent';
            button.style.position = 'absolute';
            button.style.bottom = '10px';
            button.style.left = '10px';
            button.style.padding = '0px 2px';
            button.style.border = 'none';
            button.style.color = 'white';
            button.style.cursor = 'pointer';
            button.style.zIndex = '20';
            button.title = 'Fit Scene to View';
            viewerContainer.appendChild(button);
            const svgPath = button.querySelector('path');
            button.addEventListener('click', () => {
                viewer.frameScene();
            });

            button.addEventListener('mouseover', () => {
                svgPath.setAttribute('stroke', 'rgba(255, 255, 255, 0.7)');
            });
            button.addEventListener('mouseout', () => {
                svgPath.setAttribute('stroke', 'white');
            });


        }

        function animate() {
            renderer.setAnimationLoop(render);
            // requestAnimationFrame( animate );
            // composer.render();
        }

        function render() {

            const delta = clock.getDelta();

            if (renderer.xr.isPresenting) {

                let session : XRSession = <XRSession>renderer.xr.getSession();
                viewer.activeCamera = viewer?.xrCamera;

                const inputSources = Array.from(session.inputSources);
                const moveSpeed = 0.05;
                const snapAngle = 15;

                inputSources.forEach((inputSource) => {

                    const controllerData = handleController(inputSource);

                    if (controllerData) {

                        const axes = controllerData.axes;

                        if (inputSource.handedness === 'left') {
                            // Movement (left thumbstick)
                            if (Math.abs(axes[2]) > 0.1 || Math.abs(axes[3]) > 0.1) {
                                const moveX = axes[2] * moveSpeed;
                                const moveZ = -axes[3] * moveSpeed;

                                // Get the camera's forward and right vectors
                                const forward = new THREE.Vector3();
                                viewer.activeCamera.getWorldDirection(forward);

                                // TODO Make this an option
                                //forward.y = 0; // Ignore vertical movement

                                forward.normalize();

                                const right = new THREE.Vector3();
                                right.crossVectors(forward, viewer.activeCamera.up).normalize();

                                // Calculate the movement vector
                                const movement = new THREE.Vector3();
                                movement.addScaledVector(forward, moveZ);
                                movement.addScaledVector(right, moveX);

                                viewer.cameraRig.position.add(movement);
                            }
                        }

                        if (inputSource.handedness === 'right') {

                            // Rotation (right thumbstick x)
                            if (Math.abs(axes[2]) > 0.8 && Math.abs(previousLeftThumbstickX) <= 0.8) {
                                if (axes[2] > 0) {
                                    viewer.cameraRig.rotation.y -= THREE.MathUtils.degToRad(snapAngle);
                                } else {
                                    viewer.cameraRig.rotation.y += THREE.MathUtils.degToRad(snapAngle);
                                }
                            }
                            previousLeftThumbstickX = axes[2];

                            // Up/down position right thumbstick y)
                            if (Math.abs(axes[3]) > 0.5) {
                                viewer.cameraRig.position.y += axes[3] * moveSpeed;
                            }
                        }


                    }
                });
            } else {
                viewer.activeCamera = viewer?.flatCamera;
                const needResize = viewer.canvas.width !== viewer.canvas.clientWidth || viewer.canvas.height !== viewer.canvas.clientHeight;
                if (needResize && viewer?.flatCamera) {
                    renderer.setSize(viewer.canvas.clientWidth, viewer.canvas.clientHeight, false);
                    viewer.flatCamera.aspect = viewer.canvas.clientWidth / viewer.canvas.clientHeight;
                    viewer.flatCamera.updateProjectionMatrix();
                }
                if (viewer?.cameraControls) viewer.cameraControls.update(delta);
                if (viewer?.trackballControls) viewer.trackballControls.update();
            }

            if (viewer?.activeCamera) {
                renderer.render(viewer.scene, viewer.activeCamera);
            }
        }

        this.dataURLtoBlob = (dataURL : string) => {
            let arr = dataURL.split(',');
            let mimeMatch = arr[0].match(/:(.*?);/);
            let mime = mimeMatch ? mimeMatch[1] : 'image/png';
            let bstr = atob(arr[1]);
            let n = bstr.length;
            let u8arr = new Uint8Array(n);

            while(n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new Blob([u8arr], { type: mime });
        }

        this.captureThumbnail = (width: number, height : number) => {

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const thumbnailRenderer = new THREE.WebGLRenderer({
                canvas: canvas,
                antialias: true,
                preserveDrawingBuffer: true // Important to allow toDataURL to work
            });
            thumbnailRenderer.setSize(width, height);
            thumbnailRenderer.setPixelRatio(window.devicePixelRatio);

            // If your scene requires specific renderer settings (e.g., tone mapping, shadow map), apply them here
            // Example:
            // thumbnailRenderer.toneMapping = renderer.toneMapping;
            // thumbnailRenderer.shadowMap.enabled = renderer.shadowMap.enabled;

            thumbnailRenderer.render(this.scene, this.activeCamera);
            const dataUrl = canvas.toDataURL('image/png');

            thumbnailRenderer.dispose();
            canvas.width = canvas.height = 0;

            return dataUrl;
        };

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

    private initializeScene(overrides : any) {

        let defaultBackgroundColor : string = overrides?.["defaultBackgroundColor"];
        if (!defaultBackgroundColor) {defaultBackgroundColor = "#000000";}
        this.defaultBackgroundColor = new THREE.Color(defaultBackgroundColor);

        if(!this.loadedModel)
            return;

        this.scene.clear();
        this.initSceneBackground();
        this.initFog();
        this.initLights();
        this.initCameras();

        // Compensate for insanely large models
        const LIMIT = 100000;
        let radius = this.overrides?.geometryData?.stats?.radius;
        if (radius > LIMIT) {
            let excess = radius - LIMIT;
            let sceneNode = this.scene.add(this.loadedModel);
            sceneNode.scale.divideScalar(excess);
            // Reframe the scaled scene
            this.frameNode(sceneNode);
        } else {
            this.scene.add(this.loadedModel);
        }
    }

    public toggleTreeView(root: HTMLElement) {
        if (root.childElementCount == 0) {
            this.createTreeView(this.scene, root);
            root.style.display = 'none';
        }
        if (root.style.display === 'block') {
            root.style.display = 'none';
        } else if (root.style.display === 'none') {
            root.style.display = 'block';
        }
    }

    static lookupEnvironment(guid : string) {
        return {
            "e38af599-4575-46ff-a040-459703dbcd36": {
                name: "Passthrough",
                guid: "e38af599-4575-46ff-a040-459703dbcd36",
                renderSettings: {
                    fogEnabled: false,
                    fogColor: {
                        r: 0.0,
                        g: 0.0,
                        b: 0.0,
                        a: 0.0
                    },
                    fogDensity: 0.0,
                    fogStartDistance: 0.0,
                    fogEndDistance: 0.0,
                    clearColor: {
                        r: 1.0,
                        g: 1.0,
                        b: 1.0,
                        a: 1.0
                    },
                    ambientColor: {
                        r: 0.5,
                        g: 0.5,
                        b: 0.5,
                        a: 1.0
                    },
                    skyboxExposure: 0.0,
                    skyboxTint: {
                        r: 0.0,
                        g: 0.0,
                        b: 0.0,
                        a: 0.0
                    },
                    environmentPrefab: "EnvironmentPrefabs/Passthrough",
                    environmentReverbZone: "EnvironmentAudio/ReverbZone_Room",
                    skyboxCubemap: null,
                    reflectionCubemap: "threelight_reflection",
                    reflectionIntensity: 0.3
                },
                lights: [
                    {
                        color: {
                            r: 1.16949809,
                            g: 1.19485855,
                            b: 1.31320751,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        },
                        rotation: {
                            x: 60.0000038,
                            y: 0.0,
                            z: 25.9999962
                        },
                        type: "Directional",
                        range: 5.0,
                        spotAngle: 30.0,
                        shadowsEnabled: true
                    },
                    {
                        color: {
                            r: 0.428235322,
                            g: 0.4211765,
                            b: 0.3458824,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        },
                        rotation: {
                            x: 40.0000038,
                            y: 180.0,
                            z: 220.0
                        },
                        type: "Directional",
                        range: 5.0,
                        spotAngle: 30.0,
                        shadowsEnabled: false
                    }
                ],
                teleportBoundsHalfWidth: 80.0,
                controllerXRayHeight: 0.0,
                widgetHome: {
                    x: 0.0,
                    y: 0.0,
                    z: 0.0
                },
                skyboxColorA: {
                    r: 0.0,
                    g: 0.0,
                    b: 0.0,
                    a: 0.0
                },
                skyboxColorB: {
                    r: 0.0,
                    g: 0.0,
                    b: 0.0,
                    a: 0.0
                }
            },
            "ab080599-e465-4a6d-8587-43bf495af68b": {
                name: "Standard",
                guid: "ab080599-e465-4a6d-8587-43bf495af68b",
                renderSettings: {
                    fogEnabled: true,
                    fogColor: {
                        r: 0.164705887,
                        g: 0.164705887,
                        b: 0.20784314,
                        a: 1.0
                    },
                    fogDensity: 0.0025,
                    fogStartDistance: 0.0,
                    fogEndDistance: 0.0,
                    clearColor: {
                        r: 0.156862751,
                        g: 0.156862751,
                        b: 0.203921571,
                        a: 1.0
                    },
                    ambientColor: {
                        r: 0.392156869,
                        g: 0.392156869,
                        b: 0.392156869,
                        a: 1.0
                    },
                    skyboxExposure: 0.9,
                    skyboxTint: {
                        r: 0.235294119,
                        g: 0.2509804,
                        b: 0.3529412,
                        a: 1.0
                    },
                    environmentPrefab: "EnvironmentPrefabs/Standard",
                    environmentReverbZone: "EnvironmentAudio/ReverbZone_CarpetedHallway",
                    skyboxCubemap: null,
                    reflectionCubemap: "threelight_reflection",
                    reflectionIntensity: 0.3
                },
                lights: [
                    {
                        color: {
                            r: 0.7780392,
                            g: 0.815686345,
                            b: 0.9913726,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        },
                        rotation: {
                            x: 60.0000038,
                            y: 0.0,
                            z: 25.9999962
                        },
                        type: "Directional",
                        range: 5.0,
                        spotAngle: 30.0,
                        shadowsEnabled: true
                    },
                    {
                        color: {
                            r: 0.428235322,
                            g: 0.4211765,
                            b: 0.3458824,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        },
                        rotation: {
                            x: 40.0000038,
                            y: 180.0,
                            z: 220.0
                        },
                        type: "Directional",
                        range: 5.0,
                        spotAngle: 30.0,
                        shadowsEnabled: false
                    }
                ],
                teleportBoundsHalfWidth: 80.0,
                controllerXRayHeight: 0.0,
                widgetHome: {
                    x: 0.0,
                    y: 0.0,
                    z: 0.0
                },
                skyboxColorA: {
                    r: 0.274509817,
                    g: 0.274509817,
                    b: 0.31764707,
                    a: 1.0
                },
                skyboxColorB: {
                    r: 0.03529412,
                    g: 0.03529412,
                    b: 0.08627451,
                    a: 1.0
                }
            },
            "c504347a-c96d-4505-853b-87b484acff9a": {
                name: "NightSky",
                guid: "c504347a-c96d-4505-853b-87b484acff9a",
                renderSettings: {
                    fogEnabled: true,
                    fogColor: {
                        r: 0.0196078438,
                        g: 0.0117647061,
                        b: 0.0431372561,
                        a: 1.0
                    },
                    fogDensity: 0.006,
                    fogStartDistance: 0.0,
                    fogEndDistance: 0.0,
                    clearColor: {
                        r: 0.0,
                        g: 0.0,
                        b: 0.0,
                        a: 1.0
                    },
                    ambientColor: {
                        r: 0.3019608,
                        g: 0.3019608,
                        b: 0.6039216,
                        a: 1.0
                    },
                    skyboxExposure: 1.0,
                    skyboxTint: {
                        r: 1.0,
                        g: 1.0,
                        b: 1.0,
                        a: 1.0
                    },
                    environmentPrefab: "EnvironmentPrefabs/NightSky",
                    environmentReverbZone: "EnvironmentAudio/ReverbZone_Mountains",
                    skyboxCubemap: "nightsky",
                    reflectionCubemap: "milkyway_reflection",
                    reflectionIntensity: 3.0
                },
                lights: [
                    {
                        color: {
                            r: 1.02352941,
                            g: 0.7647059,
                            b: 0.929411769,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 8.0
                        },
                        rotation: {
                            x: 65.0,
                            y: 0.0,
                            z: 25.9999981
                        },
                        type: "Directional",
                        range: 5.0,
                        spotAngle: 30.0,
                        shadowsEnabled: true
                    },
                    {
                        color: {
                            r: 0.0,
                            g: 0.0,
                            b: 0.0,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 8.0
                        },
                        rotation: {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        },
                        type: "Directional",
                        range: 5.0,
                        spotAngle: 30.0,
                        shadowsEnabled: false
                    }
                ],
                teleportBoundsHalfWidth: 80.0,
                controllerXRayHeight: 0.0,
                widgetHome: {
                    x: 0.0,
                    y: 0.0,
                    z: 0.0
                },
                skyboxColorA: {
                    r: 0.08235294,
                    g: 0.0470588244,
                    b: 0.184313729,
                    a: 1.0
                },
                skyboxColorB: {
                    r: 0.0,
                    g: 0.0,
                    b: 0.0,
                    a: 1.0
                }
            },
            "96cf6f36-47b6-44f4-bdbf-63be2ddac909": {
                name: "Space",
                guid: "96cf6f36-47b6-44f4-bdbf-63be2ddac909",
                renderSettings: {
                    fogEnabled: true,
                    fogColor: {
                        r: 0.0,
                        g: 0.0,
                        b: 0.0,
                        a: 1.0
                    },
                    fogDensity: 0.0,
                    fogStartDistance: 5.0,
                    fogEndDistance: 20.0,
                    clearColor: {
                        r: 0.0,
                        g: 0.0,
                        b: 0.0,
                        a: 1.0
                    },
                    ambientColor: {
                        r: 0.227450982,
                        g: 0.20784314,
                        b: 0.360784322,
                        a: 1.0
                    },
                    skyboxExposure: 1.0,
                    skyboxTint: {
                        r: 1.0,
                        g: 1.0,
                        b: 1.0,
                        a: 1.0
                    },
                    environmentPrefab: "EnvironmentPrefabs/Space",
                    environmentReverbZone: "EnvironmentAudio/ReverbZone_Arena",
                    skyboxCubemap: "milkyway_PNG",
                    reflectionCubemap: "milkyway_reflection",
                    reflectionIntensity: 3.0
                },
                lights: [
                    {
                        color: {
                            r: 1.16000009,
                            g: 0.866666734,
                            b: 0.866666734,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 8.0
                        },
                        rotation: {
                            x: 30.0000019,
                            y: 39.9999962,
                            z: 50.0
                        },
                        type: "Directional",
                        range: 5.0,
                        spotAngle: 30.0,
                        shadowsEnabled: true
                    },
                    {
                        color: {
                            r: 0.0,
                            g: 0.0,
                            b: 0.0,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 8.0
                        },
                        rotation: {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        },
                        type: "Directional",
                        range: 5.0,
                        spotAngle: 30.0,
                        shadowsEnabled: false
                    }
                ],
                teleportBoundsHalfWidth: 20.0,
                controllerXRayHeight: -1E+09,
                widgetHome: {
                    x: 0.0,
                    y: 0.0,
                    z: 0.0
                },
                skyboxColorA: {
                    r: 0.0,
                    g: 0.0,
                    b: 0.0,
                    a: 1.0
                },
                skyboxColorB: {
                    r: 0.121568628,
                    g: 0.03529412,
                    b: 0.172549024,
                    a: 1.0
                }
            },
            "e2e72b76-d443-4721-97e6-f3d49fe98dda": {
                name: "DressForm",
                guid: "e2e72b76-d443-4721-97e6-f3d49fe98dda",
                renderSettings: {
                    fogEnabled: true,
                    fogColor: {
                        r: 0.172549024,
                        g: 0.180392161,
                        b: 0.243137255,
                        a: 1.0
                    },
                    fogDensity: 0.007,
                    fogStartDistance: 0.0,
                    fogEndDistance: 0.0,
                    clearColor: {
                        r: 0.219607845,
                        g: 0.227450982,
                        b: 0.31764707,
                        a: 1.0
                    },
                    ambientColor: {
                        r: 0.4117647,
                        g: 0.3529412,
                        b: 0.596078455,
                        a: 1.0
                    },
                    skyboxExposure: 0.61,
                    skyboxTint: {
                        r: 0.458823532,
                        g: 0.5137255,
                        b: 0.7882353,
                        a: 1.0
                    },
                    environmentPrefab: "EnvironmentPrefabs/DressForm",
                    environmentReverbZone: "EnvironmentAudio/ReverbZone_LivingRoom",
                    skyboxCubemap: null,
                    reflectionCubemap: "threelight_reflection",
                    reflectionIntensity: 0.3
                },
                lights: [
                    {
                        color: {
                            r: 1.1152941,
                            g: 0.917647064,
                            b: 0.7764706,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 7.0
                        },
                        rotation: {
                            x: 50.0,
                            y: 41.9999962,
                            z: 25.9999924
                        },
                        type: "Directional",
                        range: 5.0,
                        spotAngle: 30.0,
                        shadowsEnabled: true
                    },
                    {
                        color: {
                            r: 0.356862754,
                            g: 0.3509804,
                            b: 0.2882353,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 8.0
                        },
                        rotation: {
                            x: 40.0000038,
                            y: 227.0,
                            z: 220.0
                        },
                        type: "Directional",
                        range: 5.0,
                        spotAngle: 30.0,
                        shadowsEnabled: false
                    }
                ],
                teleportBoundsHalfWidth: 80.0,
                controllerXRayHeight: 0.0,
                widgetHome: {
                    x: 0.0,
                    y: 0.0,
                    z: 0.0
                },
                skyboxColorA: {
                    r: 0.34117648,
                    g: 0.345098048,
                    b: 0.4509804,
                    a: 1.0
                },
                skyboxColorB: {
                    r: 0.09411765,
                    g: 0.105882354,
                    b: 0.1764706,
                    a: 1.0
                }
            },
            "ab080511-e465-4a6d-8587-53bf495af68b": {
                name: "Pedestal",
                guid: "ab080511-e465-4a6d-8587-53bf495af68b",
                renderSettings: {
                    fogEnabled: true,
                    fogColor: {
                        r: 0.172549024,
                        g: 0.180392161,
                        b: 0.243137255,
                        a: 1.0
                    },
                    fogDensity: 0.007,
                    fogStartDistance: 0.0,
                    fogEndDistance: 0.0,
                    clearColor: {
                        r: 0.219607845,
                        g: 0.227450982,
                        b: 0.31764707,
                        a: 1.0
                    },
                    ambientColor: {
                        r: 0.4117647,
                        g: 0.3529412,
                        b: 0.596078455,
                        a: 1.0
                    },
                    skyboxExposure: 0.61,
                    skyboxTint: {
                        r: 0.458823532,
                        g: 0.5137255,
                        b: 0.7882353,
                        a: 1.0
                    },
                    environmentPrefab: "EnvironmentPrefabs/Pedestal",
                    environmentReverbZone: "EnvironmentAudio/ReverbZone_LivingRoom",
                    skyboxCubemap: null,
                    reflectionCubemap: "threelight_reflection",
                    reflectionIntensity: 1.0
                },
                lights: [
                    {
                        color: {
                            r: 1.1152941,
                            g: 0.917647064,
                            b: 0.7764706,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 7.0
                        },
                        rotation: {
                            x: 50.0,
                            y: 41.9999962,
                            z: 25.9999924
                        },
                        type: "Directional",
                        range: 5.0,
                        spotAngle: 30.0,
                        shadowsEnabled: true
                    },
                    {
                        color: {
                            r: 0.356862754,
                            g: 0.3509804,
                            b: 0.2882353,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 8.0
                        },
                        rotation: {
                            x: 40.0000038,
                            y: 227.0,
                            z: 220.0
                        },
                        type: "Directional",
                        range: 5.0,
                        spotAngle: 30.0,
                        shadowsEnabled: false
                    }
                ],
                teleportBoundsHalfWidth: 80.0,
                controllerXRayHeight: 0.0,
                widgetHome: {
                    x: 0.0,
                    y: 9.675,
                    z: 5.0
                },
                skyboxColorA: {
                    r: 0.34117648,
                    g: 0.345098048,
                    b: 0.4509804,
                    a: 1.0
                },
                skyboxColorB: {
                    r: 0.09411765,
                    g: 0.105882354,
                    b: 0.1764706,
                    a: 1.0
                }
            },
            "ab080511-e565-4a6d-8587-53bf495af68b": {
                name: "Snowman",
                guid: "ab080511-e565-4a6d-8587-53bf495af68b",
                renderSettings: {
                    fogEnabled: true,
                    fogColor: {
                        r: 0.6509804,
                        g: 0.7254902,
                        b: 0.8745098,
                        a: 1.0
                    },
                    fogDensity: 0.005,
                    fogStartDistance: 0.0,
                    fogEndDistance: 0.0,
                    clearColor: {
                        r: 0.6509804,
                        g: 0.7019608,
                        b: 0.870588243,
                        a: 1.0
                    },
                    ambientColor: {
                        r: 0.7294118,
                        g: 0.7294118,
                        b: 0.7294118,
                        a: 1.0
                    },
                    skyboxExposure: 0.95,
                    skyboxTint: {
                        r: 0.75686276,
                        g: 0.819607854,
                        b: 1.0,
                        a: 1.0
                    },
                    environmentPrefab: "EnvironmentPrefabs/Snowman",
                    environmentReverbZone: "EnvironmentAudio/ReverbZone_PaddedCell",
                    skyboxCubemap: "snowysky",
                    reflectionCubemap: "threelight_reflection",
                    reflectionIntensity: 0.3
                },
                lights: [
                    {
                        color: {
                            r: 0.241451,
                            g: 0.234078437,
                            b: 0.3465098,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 8.0
                        },
                        rotation: {
                            x: 58.0,
                            y: 315.999969,
                            z: 50.0000038
                        },
                        type: "Directional",
                        range: 5.0,
                        spotAngle: 30.0,
                        shadowsEnabled: true
                    },
                    {
                        color: {
                            r: 0.410980433,
                            g: 0.4956863,
                            b: 0.65882355,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 8.0
                        },
                        rotation: {
                            x: 40.0,
                            y: 143.0,
                            z: 220.0
                        },
                        type: "Directional",
                        range: 5.0,
                        spotAngle: 30.0,
                        shadowsEnabled: false
                    }
                ],
                teleportBoundsHalfWidth: 80.0,
                controllerXRayHeight: 0.0,
                widgetHome: {
                    x: 0.0,
                    y: 0.0,
                    z: 0.0
                },
                skyboxColorA: {
                    r: 0.4627451,
                    g: 0.5647059,
                    b: 0.7058824,
                    a: 1.0
                },
                skyboxColorB: {
                    r: 0.7607843,
                    g: 0.8156863,
                    b: 0.972549,
                    a: 1.0
                }
            },
            "36e65e4f-17d7-41ef-834a-e525db0b9888": {
                name: "PinkLemonade",
                guid: "36e65e4f-17d7-41ef-834a-e525db0b9888",
                renderSettings: {
                    fogEnabled: true,
                    fogColor: {
                        r: 1.0,
                        g: 0.5514706,
                        b: 0.9319472,
                        a: 1.0
                    },
                    fogDensity: 0.025,
                    fogStartDistance: 0.0,
                    fogEndDistance: 0.0,
                    clearColor: {
                        r: 0.827451,
                        g: 0.368627459,
                        b: 0.34117648,
                        a: 1.0
                    },
                    ambientColor: {
                        r: 1.0,
                        g: 0.9019608,
                        b: 0.854901969,
                        a: 1.0
                    },
                    skyboxExposure: 1.0,
                    skyboxTint: {
                        r: 0.827451,
                        g: 0.368627459,
                        b: 0.34117648,
                        a: 1.0
                    },
                    environmentPrefab: "EnvironmentPrefabs/AmbientDustDim",
                    environmentReverbZone: "EnvironmentAudio/ReverbZone_Room",
                    skyboxCubemap: null,
                    reflectionCubemap: "gradientblue",
                    reflectionIntensity: 0.0
                },
                lights: [
                    {
                        color: {
                            r: 0.0,
                            g: 0.0,
                            b: 0.0,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        },
                        rotation: {
                            x: 318.189667,
                            y: 116.565048,
                            z: 116.565048
                        },
                        type: "Directional",
                        range: 0.0,
                        spotAngle: 0.0,
                        shadowsEnabled: true
                    },
                    {
                        color: {
                            r: 0.5,
                            g: 0.28039217,
                            b: 0.3156863,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        },
                        rotation: {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        },
                        type: "Directional",
                        range: 0.0,
                        spotAngle: 0.0,
                        shadowsEnabled: false
                    }
                ],
                teleportBoundsHalfWidth: 80.0,
                controllerXRayHeight: -1E+09,
                widgetHome: {
                    x: 0.0,
                    y: 0.0,
                    z: 0.0
                },
                skyboxColorA: {
                    r: 1.0,
                    g: 0.882352948,
                    b: 0.65882355,
                    a: 1.0
                },
                skyboxColorB: {
                    r: 0.858823538,
                    g: 0.294117659,
                    b: 0.3647059,
                    a: 1.0
                }
            },
            "a9bc2bc8-6d86-4cda-82a9-283e0f3977ac": {
                name: "Pistachio",
                guid: "a9bc2bc8-6d86-4cda-82a9-283e0f3977ac",
                renderSettings: {
                    fogEnabled: true,
                    fogColor: {
                        r: 0.2784314,
                        g: 0.5686275,
                        b: 0.458823532,
                        a: 1.0
                    },
                    fogDensity: 0.015,
                    fogStartDistance: 0.0,
                    fogEndDistance: 0.0,
                    clearColor: {
                        r: 0.9558824,
                        g: 0.6708847,
                        b: 0.513083935,
                        a: 1.0
                    },
                    ambientColor: {
                        r: 0.610186,
                        g: 0.838235259,
                        b: 0.75194633,
                        a: 1.0
                    },
                    skyboxExposure: 1.0,
                    skyboxTint: {
                        r: 0.797,
                        g: 0.616,
                        b: 0.755,
                        a: 1.0
                    },
                    environmentPrefab: "EnvironmentPrefabs/AmbientDustDim",
                    environmentReverbZone: "EnvironmentAudio/ReverbZone_Room",
                    skyboxCubemap: null,
                    reflectionCubemap: "gradientblue",
                    reflectionIntensity: 0.3
                },
                lights: [
                    {
                        color: {
                            r: 0.209818333,
                            g: 0.242647052,
                            b: 0.171280265,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        },
                        rotation: {
                            x: 41.810318,
                            y: 116.565048,
                            z: 243.434937
                        },
                        type: "Directional",
                        range: 0.0,
                        spotAngle: 0.0,
                        shadowsEnabled: true
                    },
                    {
                        color: {
                            r: 0.977941155,
                            g: 0.506417,
                            b: 0.438635379,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        },
                        rotation: {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        },
                        type: "Directional",
                        range: 0.0,
                        spotAngle: 0.0,
                        shadowsEnabled: false
                    }
                ],
                teleportBoundsHalfWidth: 50.0,
                controllerXRayHeight: -1E+09,
                widgetHome: {
                    x: 0.0,
                    y: 0.0,
                    z: 0.0
                },
                skyboxColorA: {
                    r: 1.0,
                    g: 0.5176471,
                    b: 0.3529412,
                    a: 1.0
                },
                skyboxColorB: {
                    r: 0.458823532,
                    g: 0.78039217,
                    b: 0.5529412,
                    a: 1.0
                }
            },
            "e65cde1a-a177-4bfb-b93f-f673c99a32bc": {
                name: "Illustrative",
                guid: "e65cde1a-a177-4bfb-b93f-f673c99a32bc",
                renderSettings: {
                    fogEnabled: true,
                    fogColor: {
                        r: 1.0,
                        g: 1.0,
                        b: 1.0,
                        a: 1.0
                    },
                    fogDensity: 0.0125,
                    fogStartDistance: 0.0,
                    fogEndDistance: 0.0,
                    clearColor: {
                        r: 0.7019608,
                        g: 0.7019608,
                        b: 0.7019608,
                        a: 1.0
                    },
                    ambientColor: {
                        r: 1.0,
                        g: 1.0,
                        b: 1.0,
                        a: 1.0
                    },
                    skyboxExposure: 0.0,
                    skyboxTint: {
                        r: 0.625,
                        g: 0.625,
                        b: 0.625,
                        a: 1.0
                    },
                    environmentPrefab: "EnvironmentPrefabs/AmbientDustDim",
                    environmentReverbZone: "EnvironmentAudio/ReverbZone_Room",
                    skyboxCubemap: null,
                    reflectionCubemap: null,
                    reflectionIntensity: 0.0
                },
                lights: [
                    {
                        color: {
                            r: 0.0,
                            g: 0.0,
                            b: 0.0,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        },
                        rotation: {
                            x: 0.0,
                            y: 180.0,
                            z: 180.0
                        },
                        type: "Directional",
                        range: 0.0,
                        spotAngle: 0.0,
                        shadowsEnabled: true
                    },
                    {
                        color: {
                            r: 0.0,
                            g: 0.0,
                            b: 0.0,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        },
                        rotation: {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        },
                        type: "Directional",
                        range: 0.0,
                        spotAngle: 0.0,
                        shadowsEnabled: false
                    }
                ],
                teleportBoundsHalfWidth: 100.0,
                controllerXRayHeight: -1E+09,
                widgetHome: {
                    x: 0.0,
                    y: 0.0,
                    z: 0.0
                },
                skyboxColorA: {
                    r: 0.7647059,
                    g: 0.7647059,
                    b: 0.7647059,
                    a: 1.0
                },
                skyboxColorB: {
                    r: 0.623529434,
                    g: 0.623529434,
                    b: 0.623529434,
                    a: 1.0
                }
            },
            "580b4529-ac50-4fe9-b8d2-635765a14893": {
                name: "Black",
                guid: "580b4529-ac50-4fe9-b8d2-635765a14893",
                renderSettings: {
                    fogEnabled: true,
                    fogColor: {
                        r: 0.0196078438,
                        g: 0.0196078438,
                        b: 0.0196078438,
                        a: 1.0
                    },
                    fogDensity: 0.0,
                    fogStartDistance: 0.0,
                    fogEndDistance: 0.0,
                    clearColor: {
                        r: 0.0,
                        g: 0.0,
                        b: 0.0,
                        a: 1.0
                    },
                    ambientColor: {
                        r: 0.392156869,
                        g: 0.392156869,
                        b: 0.392156869,
                        a: 1.0
                    },
                    skyboxExposure: 1.0,
                    skyboxTint: {
                        r: 0.0,
                        g: 0.0,
                        b: 0.0,
                        a: 1.0
                    },
                    environmentPrefab: "EnvironmentPrefabs/AmbientDust",
                    environmentReverbZone: "EnvironmentAudio/ReverbZone_Room",
                    skyboxCubemap: null,
                    reflectionCubemap: "threelight_reflection",
                    reflectionIntensity: 0.3
                },
                lights: [
                    {
                        color: {
                            r: 0.7780392,
                            g: 0.815686345,
                            b: 0.9913726,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        },
                        rotation: {
                            x: 60.0000038,
                            y: 0.0,
                            z: 25.9999962
                        },
                        type: "Directional",
                        range: 5.0,
                        spotAngle: 30.0,
                        shadowsEnabled: true
                    },
                    {
                        color: {
                            r: 0.428235322,
                            g: 0.4211765,
                            b: 0.3458824,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        },
                        rotation: {
                            x: 40.0000038,
                            y: 180.0,
                            z: 220.0
                        },
                        type: "Directional",
                        range: 5.0,
                        spotAngle: 30.0,
                        shadowsEnabled: false
                    }
                ],
                teleportBoundsHalfWidth: 100.0,
                controllerXRayHeight: -1E+09,
                widgetHome: {
                    x: 0.0,
                    y: 0.0,
                    z: 0.0
                },
                skyboxColorA: {
                    r: 0.0,
                    g: 0.0,
                    b: 0.0,
                    a: 1.0
                },
                skyboxColorB: {
                    r: 0.0,
                    g: 0.0,
                    b: 0.0,
                    a: 1.0
                }
            },
            "9b89b0a4-c41e-4b78-82a1-22f10a238357": {
                name: "White",
                guid: "9b89b0a4-c41e-4b78-82a1-22f10a238357",
                renderSettings: {
                    fogEnabled: true,
                    fogColor: {
                        r: 1.0,
                        g: 1.0,
                        b: 1.0,
                        a: 1.0
                    },
                    fogDensity: 0.0,
                    fogStartDistance: 0.0,
                    fogEndDistance: 0.0,
                    clearColor: {
                        r: 0.784313738,
                        g: 0.784313738,
                        b: 0.784313738,
                        a: 1.0
                    },
                    ambientColor: {
                        r: 0.392156869,
                        g: 0.392156869,
                        b: 0.392156869,
                        a: 1.0
                    },
                    skyboxExposure: 1.0,
                    skyboxTint: {
                        r: 0.0,
                        g: 0.0,
                        b: 0.0,
                        a: 1.0
                    },
                    environmentPrefab: "EnvironmentPrefabs/AmbientGrid",
                    environmentReverbZone: "EnvironmentAudio/ReverbZone_Room",
                    skyboxCubemap: null,
                    reflectionCubemap: "threelight_reflection",
                    reflectionIntensity: 0.4
                },
                lights: [
                    {
                        color: {
                            r: 0.7780392,
                            g: 0.815686345,
                            b: 0.9913726,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        },
                        rotation: {
                            x: 60.0000038,
                            y: 0.0,
                            z: 25.9999962
                        },
                        type: "Directional",
                        range: 5.0,
                        spotAngle: 30.0,
                        shadowsEnabled: true
                    },
                    {
                        color: {
                            r: 0.428235322,
                            g: 0.4211765,
                            b: 0.3458824,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        },
                        rotation: {
                            x: 40.0000038,
                            y: 180.0,
                            z: 220.0
                        },
                        type: "Directional",
                        range: 5.0,
                        spotAngle: 30.0,
                        shadowsEnabled: false
                    }
                ],
                teleportBoundsHalfWidth: 100.0,
                controllerXRayHeight: -1E+09,
                widgetHome: {
                    x: 0.0,
                    y: 0.0,
                    z: 0.0
                },
                skyboxColorA: {
                    r: 0.784313738,
                    g: 0.784313738,
                    b: 0.784313738,
                    a: 1.0
                },
                skyboxColorB: {
                    r: 0.784313738,
                    g: 0.784313738,
                    b: 0.784313738,
                    a: 1.0
                }
            },
            "0ca88298-e5e8-4e94-aad8-4b4f6c80ae52": {
                name: "Blue",
                guid: "0ca88298-e5e8-4e94-aad8-4b4f6c80ae52",
                renderSettings: {
                    fogEnabled: true,
                    fogColor: {
                        r: 0.6313726,
                        g: 0.7137255,
                        b: 0.894117653,
                        a: 1.0
                    },
                    fogDensity: 0.005,
                    fogStartDistance: 0.0,
                    fogEndDistance: 0.0,
                    clearColor: {
                        r: 0.270588249,
                        g: 0.309803933,
                        b: 0.470588237,
                        a: 1.0
                    },
                    ambientColor: {
                        r: 0.203921571,
                        g: 0.294117659,
                        b: 0.368627459,
                        a: 1.0
                    },
                    skyboxExposure: 1.46,
                    skyboxTint: {
                        r: 0.4627451,
                        g: 0.5294118,
                        b: 0.698039234,
                        a: 1.0
                    },
                    environmentPrefab: "EnvironmentPrefabs/AmbientGrid_Blue",
                    environmentReverbZone: "EnvironmentAudio/ReverbZone_Room",
                    skyboxCubemap: "gradientblue",
                    reflectionCubemap: "threelight_reflection",
                    reflectionIntensity: 0.8
                },
                lights: [
                    {
                        color: {
                            r: 1.5533334,
                            g: 1.40666676,
                            b: 1.77333343,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        },
                        rotation: {
                            x: 60.0000038,
                            y: 0.0,
                            z: 25.9999962
                        },
                        type: "Directional",
                        range: 5.0,
                        spotAngle: 30.0,
                        shadowsEnabled: true
                    },
                    {
                        color: {
                            r: 0.271215677,
                            g: 0.2667451,
                            b: 0.219058827,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        },
                        rotation: {
                            x: 40.0000038,
                            y: 180.0,
                            z: 220.0
                        },
                        type: "Directional",
                        range: 5.0,
                        spotAngle: 30.0,
                        shadowsEnabled: false
                    }
                ],
                teleportBoundsHalfWidth: 100.0,
                controllerXRayHeight: -1E+09,
                widgetHome: {
                    x: 0.0,
                    y: 0.0,
                    z: 0.0
                },
                skyboxColorA: {
                    r: 0.180392161,
                    g: 0.235294119,
                    b: 0.4117647,
                    a: 1.0
                },
                skyboxColorB: {
                    r: 0.356862754,
                    g: 0.392156869,
                    b: 0.6,
                    a: 1.0
                }
            }
        }[guid];
    }

    public async loadGltf1(url : string, loadEnvironment : boolean, overrides : any) {
        try {
            await this._loadGltf(url, loadEnvironment, overrides, true);
        } catch (error) {
            this.showErrorIcon();
            console.error("Error loading glTFv1 model");
            this.loadingError = true;
        }
    }

    public async loadGltf(url : string, loadEnvironment : boolean, overrides : any) {
        try {
            await this._loadGltf(url, loadEnvironment, overrides, false);
        } catch (error) {
            this.showErrorIcon();
            console.error("Error loading glTFv2 model");
            this.loadingError = true;
        }
    }

    private async _loadGltf(url : string, loadEnvironment : boolean, overrides : any, isV1: boolean) {
        let sceneGltf : GLTF;
        this.overrides = overrides;
        if (isV1) {
            sceneGltf = <GLTF>await this.gltfLegacyLoader.loadAsync(url);
            replaceBrushMaterials(this.brushPath.toString(), <Object3D>sceneGltf.scene);
        } else {
            sceneGltf = <GLTF>await this.gltfLoader.loadAsync(url);
        }

        this.setupSketchMetaData(sceneGltf.scene);
        if (loadEnvironment) {await this.assignEnvironment(sceneGltf.scene);}
        if (overrides?.tiltUrl) {this.tiltData = await this.tiltLoader.loadAsync(tiltUrl);}
        this.loadedModel = sceneGltf.scene;
        this.sceneGltf = sceneGltf;
        this.initializeScene(overrides);
    }

    public async loadTilt(url: string, overrides : any) {
        try {
            const tiltData = await this.tiltLoader.loadAsync(url);
            this.loadedModel = tiltData;
            this.setupSketchMetaData(tiltData);
            this.initializeScene(overrides);
        } catch (error) {
            this.showErrorIcon();
            console.error("Error loading Tilt model");
            this.loadingError = true;
        }
    }

    private setAllVertexColors(model : Object3D<THREE.Object3DEventMap>) {
        model.traverse(node => {
            if (node.material) {
                if (Array.isArray(node.material)) {
                    node.material.forEach(material => material.vertexColors = true);
                } else {
                    node.material.vertexColors = true;
                }
            }
        });
    }

    // Defaults to assuming materials are vertex colored
    public async loadObj(url: string, overrides: any) {
        try {
            this.objLoader.loadAsync(url).then((objData) => {

                this.loadedModel = objData;

                let defaultBackgroundColor = overrides?.["defaultBackgroundColor"];
                if (!defaultBackgroundColor) {defaultBackgroundColor = "#000000";}
                this.defaultBackgroundColor = new THREE.Color(defaultBackgroundColor);

                let withVertexColors = overrides?.["withVertexColors"];
                if (withVertexColors) {
                    this.setAllVertexColors(this.loadedModel);
                }
                this.setupSketchMetaData(this.loadedModel);
                this.initializeScene(overrides);
            });
        } catch (error) {
            this.showErrorIcon();
            console.error("Error loading Obj model");
            this.loadingError = true;
        }
    }

    public async loadObjWithMtl(objUrl: string, mtlUrl: string, overrides: any) {
        try {
            this.mtlLoader.loadAsync(mtlUrl).then((materials) => {
                materials.preload();
                this.objLoader.setMaterials(materials);
                this.objLoader.loadAsync(objUrl).then((objData) => {
                    this.loadedModel = objData;

                    let defaultBackgroundColor = overrides?.["defaultBackgroundColor"];
                    if (!defaultBackgroundColor) {defaultBackgroundColor = "#000000";}
                    this.defaultBackgroundColor = new THREE.Color(defaultBackgroundColor);

                    let withVertexColors = overrides?.["withVertexColors"];
                    if (withVertexColors) {
                        this.setAllVertexColors(this.loadedModel);
                    }
                    this.setupSketchMetaData(this.loadedModel);
                    this.initializeScene(overrides);
                    this.frameScene(); // Not sure why the standard viewpoint heuristic isn't working here
                });
            });
        } catch (error) {
            this.showErrorIcon();
            console.error("Error loading Obj/Mtl model");
            this.loadingError = true;
        }
    }

    public async loadFbx(url: string, overrides : any) {
        try {
            const fbxData = await this.fbxLoader.loadAsync(url);
            this.loadedModel = fbxData;
            this.setupSketchMetaData(fbxData);
            this.initializeScene(overrides);
            this.frameScene();
        } catch (error) {
            this.showErrorIcon();
            console.error("Error loading Fbx model");
            this.loadingError = true;
        }
    }

    public async loadPly(url: string, overrides : any) {
        try {
            const plyData = await this.plyLoader.loadAsync(url);
            plyData.computeVertexNormals();
            const material = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0 });
            const plyModel = new THREE.Mesh(plyData, material);
            this.loadedModel = plyModel;
            this.setupSketchMetaData(plyModel);
            this.initializeScene(overrides);
            this.frameScene();
        } catch (error) {
            this.showErrorIcon();
            console.error("Error loading Ply model");
            this.loadingError = true;
        }
    }

    public async loadStl(url: string, overrides : any) {
        try {
            const stlData = await this.stlLoader.loadAsync(url);
            let material = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0 });
            if (stlData.hasColors) {
                material = new THREE.MeshStandardMaterial( { opacity: stlData.alpha, vertexColors: true } );
            }
            const stlModel = new THREE.Mesh(stlData, material);
            this.loadedModel = stlModel;
            this.setupSketchMetaData(stlModel);
            this.initializeScene(overrides);
            this.frameScene();
        } catch (error) {
            this.showErrorIcon();
            console.error("Error loading Stl model");
            this.loadingError = true;
        }
    }

    public async loadUsdz(url: string, overrides : any) {
        try {
            const usdzData = await this.usdzLoader.loadAsync(url);
            this.loadedModel = usdzData;
            this.setupSketchMetaData(usdzData);
            this.initializeScene(overrides);
            this.frameScene();
        } catch (error) {
            this.showErrorIcon();
            console.error("Error loading Usdz model");
            this.loadingError = true;
        }
    }

    public async loadVox(url: string, overrides : any) {
        try {
            let voxModel = new THREE.Group();
            let chunks = await this.voxLoader.loadAsync(url);
            for ( let i = 0; i < chunks.length; i ++ ) {
                const chunk = chunks[ i ];
                const mesh = new VOXMesh( chunk );
                mesh.scale.setScalar( 0.0015 );
                voxModel.add( mesh );
            }
            this.loadedModel = voxModel;
            this.setupSketchMetaData(voxModel);
            this.initializeScene(overrides);
            this.frameScene();
        } catch (error) {
            this.showErrorIcon();
            console.error("Error loading Vox model");
            this.loadingError = true;
        }
    }

    private async assignEnvironment(scene : Object3D<THREE.Object3DEventMap>) {
        const guid = this.sketchMetadata?.EnvironmentGuid;
        if (guid) {
            const envUrl = new URL(`${guid}/${guid}.glb`, this.environmentPath);
            const envGltf = await this.gltfLoader.loadAsync(envUrl.toString());
            envGltf.scene.setRotationFromEuler(new THREE.Euler(0, Math.PI, 0));
            envGltf.scene.scale.set(.1, .1, .1);
            scene.attach(envGltf.scene);
            this.environmentObject = envGltf.scene;
        }
    }

    public generateGradientSky(colorA: THREE.Color, colorB: THREE.Color, direction : THREE.Vector3) : THREE.Mesh
    {
        const canvas = document.createElement('canvas');
        canvas.id = "skyCanvas";
        canvas.width = 1;
        canvas.height = 256;
        const context = canvas.getContext('2d');

        const gradient = context.createLinearGradient(0, 0, 0, 256);
        gradient.addColorStop(0, colorB.convertSRGBToLinear().getStyle());
        gradient.addColorStop(1, colorA.convertSRGBToLinear().getStyle());
        context.fillStyle = gradient;
        context.fillRect(0, 0, 1, 256);

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        return this.generateSkyGeometry(texture, direction);
    }

    public generateTextureSky(textureName: string) : THREE.Mesh {
        const textureUrl = new URL(`skies/${textureName}.png`, this.texturePath);
        let texture = new THREE.TextureLoader().load(textureUrl.toString());
        return this.generateSkyGeometry(texture, new THREE.Vector3(0, 1, 0));
    }

    public generateSkyGeometry(texture: THREE.Texture, direction: THREE.Vector3) : THREE.Mesh {
        texture.colorSpace = THREE.SRGBColorSpace;
        const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
        material.fog = false;
        material.toneMapped = false;
        const geometry = new THREE.SphereGeometry(1000, 64, 64);
        const skysphere = new THREE.Mesh(geometry, material);
        skysphere.name = "environmentSky"
        const defaultUp = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(defaultUp, direction);
        skysphere.applyQuaternion(quaternion);
        return skysphere;
    }

    private setupSketchMetaData(model: Object3D<THREE.Object3DEventMap>) {
        let sketchMetaData = new SketchMetadata(model);
        this.modelBoundingBox = new THREE.Box3().setFromObject(model);
        this.sketchMetadata = sketchMetaData;
    }

    private initCameras() {

        let cameraOverrides = this.overrides?.camera;
        let cameraPos = cameraOverrides?.translation || [0, 1, -1];
        let cameraRot = cameraOverrides?.rotation || [1, 0, 0, 0];

        const fov = (cameraOverrides?.perspective?.yfov / (Math.PI / 180)) || 75;
        const aspect = 2;
        const near = cameraOverrides?.perspective?.znear || 0.1;
        const far = 5000;

        this.flatCamera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.flatCamera.position.set(cameraPos[0], cameraPos[1], cameraPos[2]);
        this.flatCamera.quaternion.set(cameraRot[0], cameraRot[1], cameraRot[2], cameraRot[3]);
        this.flatCamera.updateProjectionMatrix();

        this.xrCamera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.cameraRig = new THREE.Group();
        this.scene.add(this.cameraRig);
        this.cameraRig.position.set(cameraPos[0], cameraPos[1], cameraPos[2]);
        this.cameraRig.rotation.y = this.flatCamera.rotation.y;
        this.cameraRig.add(this.xrCamera);
        this.xrCamera.updateProjectionMatrix();

        this.activeCamera = this.flatCamera;

        let cameraTarget;
        let pivot = cameraOverrides?.GOOGLE_camera_settings?.pivot
        if (pivot) {
            cameraTarget = new THREE.Vector3(pivot[0], pivot[1], pivot[2]);
        } else {
            let vp =  this.overrides?.geometryData?.visualCenterPoint;
            if (!vp) {
                const box = this.modelBoundingBox;
                if (box != undefined) {
                    const boxCenter = box.getCenter(new THREE.Vector3());
                    vp = [boxCenter.x, boxCenter.y, boxCenter.z];
                }
            }
            let visualCenterPoint = new THREE.Vector3(vp[0], vp[1], vp[2]);
            cameraTarget = this.calculatePivot(this.flatCamera, visualCenterPoint);
            cameraTarget = cameraTarget || visualCenterPoint;
        }

        CameraControls.install({THREE: THREE});
        this.cameraControls = new CameraControls(this.flatCamera, viewer.canvas);
        this.cameraControls.smoothTime = 1;
        this.cameraControls.polarRotateSpeed = this.cameraControls.azimuthRotateSpeed = 0.5;
        this.cameraControls.setPosition(cameraPos[0], cameraPos[1], cameraPos[2], false);
        this.cameraControls.setTarget(cameraTarget.x, cameraTarget.y, cameraTarget.z, false);
        setupNavigation(this.cameraControls);

        // this.trackballControls = new TrackballControls(this.activeCamera, this.canvas);
        // this.trackballControls.target = cameraTarget;
        // this.trackballControls.rotateSpeed = 1.0;
        // this.trackballControls.zoomSpeed = 1.2;
        // this.trackballControls.panSpeed = 0.8;

        // let noOverrides = !cameraOverrides || !cameraOverrides?.perspective;
        // if (noOverrides) {
        //     this.frameScene();
        // }
    }

    private calculatePivot(camera : THREE.Camera, centroid : THREE.Vector3) {
        // 1. Get the camera's forward vector
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward); // This gives the forward vector in world space.

        // 2. Define a plane based on the centroid and facing the camera
        const planeNormal = forward.clone().negate(); // Plane facing the camera
        const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(planeNormal, centroid);

        // 3. Calculate the intersection point of the forward vector with the plane
        const cameraPosition = camera.position.clone();
        const ray = new THREE.Ray(cameraPosition, forward);
        const intersectionPoint = new THREE.Vector3();

        if (ray.intersectPlane(plane, intersectionPoint)) {
            return intersectionPoint; // This is your calculated pivot point.
        } else {
            console.error("No intersection between camera forward vector and plane.");
            return null; // Handle the error case gracefully.
        }
    }

    private initLights() {
        // Logic for scene light creation:
        // 1. Are there explicit GLTF scene lights? If so use them and skip the rest
        // 2. Are there dummy transforms in the GLTF that represent scene lights? If so use them in preference.
        // 3. Does the GLTF have custom metadata for light transform and color?
        // 4. Does the GLTF have an environment preset guid? If so use the light transform and colors from that
        // 5. If there's neither custom metadata, an environment guid or explicit GLTF lights - create some default lighting.

        function convertTBEuler(rot: THREE.Vector3) : THREE.Euler {
            const deg2rad = Math.PI / 180;
            return new THREE.Euler(
                THREE.MathUtils.degToRad(rot.x),
                THREE.MathUtils.degToRad(rot.y),
                THREE.MathUtils.degToRad(rot.z)
            );
        }

        if (this.sketchMetadata == undefined || this.sketchMetadata == null) {
            const light = new THREE.DirectionalLight(0xffffff, 1);
            light.position.set(10, 10, 10).normalize();
            this.loadedModel.add(light);
            return;
        }

        let l0 = new THREE.DirectionalLight(this.sketchMetadata.SceneLight0Color, 1.0);
        let l1 = new THREE.DirectionalLight(this.sketchMetadata.SceneLight1Color, 1.0);
        l0.setRotationFromEuler(convertTBEuler(this.sketchMetadata.SceneLight0Rotation))
        l1.setRotationFromEuler(convertTBEuler(this.sketchMetadata.SceneLight1Rotation))
        l0.castShadow = true;
        l1.castShadow = false;
        this.loadedModel?.add(l0);
        this.loadedModel?.add(l1);

        const ambientLight = new THREE.AmbientLight();
        ambientLight.color = this.sketchMetadata.AmbientLightColor;
        this.scene.add(ambientLight);
    }

    private initFog() {
        if (this.sketchMetadata == undefined || this.sketchMetadata == null) {
            return;
        }
        this.scene.fog = new THREE.FogExp2(
            this.sketchMetadata.FogColor,
            this.sketchMetadata.FogDensity
        );
    }


    private initSceneBackground() {

        // OBJ and FBX models don't have metadata
        if (!this.sketchMetadata == undefined) {
            this.scene.background = this.defaultBackgroundColor;
            return;
        }
        let sky : Object3D<THREE.Object3DEventMap> | null = null;
        if (this.sketchMetadata.UseGradient) {
            sky = this.generateGradientSky(
                this.sketchMetadata.SkyColorA,
                this.sketchMetadata.SkyColorB,
                this.sketchMetadata.SkyGradientDirection
            );
        } else if (this.sketchMetadata.SkyTexture) {
            sky = this.generateTextureSky(
                this.sketchMetadata.SkyTexture
            );
        }

        if (sky !== null) {
            this.scene?.add(sky as Object3D<THREE.Object3DEventMap>);
            this.skyObject = sky;
        } else {
            // Use the default background color if there's no sky
            this.scene.background = this.defaultBackgroundColor;
        }
    }

    public frameScene() {
        if (this.selectedNode != null) {
            // If a node is selected in the treeview, frame that
            this.frameNode(this.selectedNode);
        } else if (this.modelBoundingBox != null) {
            // This should be the bounding box of the loaded model itself
            this.frameBox(this.modelBoundingBox);
        } else {
            // Fall back to framing the whole scene
            let box = new THREE.Box3().setFromObject(this.scene);
            this.frameBox(box);
        }
    }

    private frameNode(node: THREE.Object3D) {
        this.frameBox(new THREE.Box3().setFromObject(node));
    }

    private frameBox(box: THREE.Box3) {

        const boxSize = box.getSize(new THREE.Vector3()).length();
        const boxCenter = box.getCenter(new THREE.Vector3());

        this.cameraControls.minDistance = boxSize * 0.01;
        this.cameraControls.maxDistance = boxSize * 10;

        const midDistance = this.cameraControls.minDistance + (boxSize - this.cameraControls.minDistance) / 2;
        this.cameraControls.setTarget(boxCenter.x, boxCenter.y, boxCenter.z);
        let sphere = new THREE.Sphere();
        box.getBoundingSphere(sphere);
        let fullDistance = sphere.radius * 1.75;
        this.cameraControls.dollyTo(fullDistance, true);
        this.cameraControls.saveState();
    }

    public levelCamera() {
        // Sets the camera target so that the camera is looking forward and level
        let cameraPos = new THREE.Vector3();
        this.cameraControls.getPosition(cameraPos);
        let cameraDir = new THREE.Vector3();
        this.cameraControls.camera.getWorldDirection(cameraDir);
        cameraDir.y = 0; // Ensure the direction is level
        cameraDir.normalize();
        let newTarget = cameraPos.clone().add(cameraDir);
        this.cameraControls.setTarget(newTarget.x, newTarget.y, newTarget.z, true);
    }

    public createTreeView(model : Object3D<THREE.Object3DEventMap>, root: HTMLElement) {
        const treeView = root;
        if (!treeView) {
            console.error('Tree view container not found');
            return;
        }
        treeView.innerHTML = '';
        if (model) {
            this.createTreeViewNode(model, treeView);
        } else {
            console.error('Model not loaded');
        }
    }

    public createTreeViewNode(object : THREE.Object3D, parentElement : HTMLElement) {
        const nodeElement = document.createElement('div');
        nodeElement.classList.add('tree-node');
        nodeElement.style.marginLeft = '5px';

        const contentElement = document.createElement('div');
        contentElement.classList.add('tree-content');

        const toggleButton = document.createElement('span');
        toggleButton.classList.add('toggle-btn');
        toggleButton.textContent = object.children && object.children.length > 0 ? '▶' : ' ';
        toggleButton.addEventListener('click', () => {
            nodeElement.classList.toggle('expanded');
            toggleButton.textContent = nodeElement.classList.contains('expanded') ? '▼' : '▶';
        });

        const visibilityCheckbox = document.createElement('input');
        visibilityCheckbox.type = 'checkbox';
        visibilityCheckbox.checked = object.visible;
        visibilityCheckbox.addEventListener('change', () => {
            object.visible = visibilityCheckbox.checked;
        });

        const label = document.createElement('span');
        label.classList.add('label');
        label.textContent = object.name || object.type;
        label.style.marginLeft = '5px';

        contentElement.appendChild(toggleButton);
        contentElement.appendChild(visibilityCheckbox);
        contentElement.appendChild(label);
        label.addEventListener('click', () => {

            let wasSelected : boolean = label.classList.contains('selected');

            document.querySelectorAll('.tree-node').forEach(node => {
                const label = node.querySelector('.label');
                if (label) {
                    label.classList.remove('selected');
                }
            });

            if (wasSelected)
            {
                label.classList.remove('selected');
                this.selectedNode = null;
            } else {
                label.classList.add('selected');
                this.selectedNode = object;
            }
            console.log(object);
        });

        nodeElement.appendChild(contentElement);

        if (object.children && object.children.length > 0) {
            const childrenContainer = document.createElement('div');
            childrenContainer.classList.add('children');
            nodeElement.appendChild(childrenContainer);

            object.children.forEach(child => {
                this.createTreeViewNode(child, childrenContainer);
            });
        }

        parentElement.appendChild(nodeElement);
    }
}
