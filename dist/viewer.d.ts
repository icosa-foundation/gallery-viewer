import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { USDZLoader } from 'three/examples/jsm/loaders/USDZLoader.js';
import { VOXLoader } from 'three/examples/jsm/loaders/VOXLoader.js';
import { Object3D } from "three";
import { LegacyGLTFLoader } from './legacy/LegacyGLTFLoader.js';
declare class SketchMetadata {
    EnvironmentGuid: string;
    Environment: string;
    UseGradient: boolean;
    SkyColorA: THREE.Color;
    SkyColorB: THREE.Color;
    SkyGradientDirection: THREE.Vector3;
    AmbientLightColor: THREE.Color;
    FogColor: THREE.Color;
    FogDensity: number;
    SceneLight0Color: THREE.Color;
    SceneLight0Rotation: THREE.Vector3;
    SceneLight1Color: THREE.Color;
    SceneLight1Rotation: THREE.Vector3;
    PoseTranslation: THREE.Vector3;
    PoseRotation: THREE.Vector3;
    CameraTranslation: THREE.Vector3;
    CameraRotation: THREE.Vector3;
    PoseScale: number;
    EnvironmentPreset: EnvironmentPreset;
    SkyTexture: string;
    ReflectionTexture: string;
    ReflectionIntensity: number;
    constructor(scene: Object3D, userData: any);
    private parseTBVector3;
    private parseTBColorString;
}
declare class EnvironmentPreset {
    Guid: string;
    Name: string;
    UseGradient: boolean;
    SkyColorA: THREE.Color;
    SkyColorB: THREE.Color;
    SkyGradientDirection: THREE.Vector3;
    FogColor: THREE.Color;
    FogDensity: number;
    AmbientLightColor: THREE.Color;
    SceneLight0Color: THREE.Color;
    SceneLight0Rotation: THREE.Vector3;
    SceneLight1Color: THREE.Color;
    SceneLight1Rotation: THREE.Vector3;
    SkyTexture: string;
    ReflectionTexture: string;
    ReflectionIntensity: number;
    constructor();
    constructor(preset: any);
}
export declare class Viewer {
    gltfLoader: GLTFLoader;
    gltfLegacyLoader: LegacyGLTFLoader;
    objLoader: OBJLoader;
    fbxLoader: FBXLoader;
    mtlLoader: MTLLoader;
    plyLoader: PLYLoader;
    stlLoader: STLLoader;
    usdzLoader: USDZLoader;
    voxLoader: VOXLoader;
    three: any;
    captureThumbnail: (width: number, height: number) => string;
    dataURLtoBlob: (dataURL: string) => Blob;
    modelBoundingBox?: THREE.Box3;
    private icosa_frame?;
    private brushPath;
    private texturePath;
    private environmentPath;
    private scene;
    private canvas;
    private activeCamera;
    private flatCamera;
    private xrCamera;
    private cameraControls;
    private trackballControls;
    private loadedModel?;
    private sceneGltf?;
    environmentObject?: Object3D;
    skyObject?: Object3D;
    sketchMetadata?: SketchMetadata;
    private defaultBackgroundColor;
    private overrides;
    private cameraRig;
    selectedNode: THREE.Object3D | null;
    showErrorIcon: () => void;
    loadingError: boolean;
    constructor(assetBaseUrl: string, frame?: HTMLElement);
    private toggleFullscreen;
    private initializeScene;
    toggleTreeView(root: HTMLElement): void;
    static lookupEnvironment(guid: string): {
        name: string;
        guid: string;
        renderSettings: {
            fogEnabled: boolean;
            fogColor: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            fogDensity: number;
            fogStartDistance: number;
            fogEndDistance: number;
            clearColor: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            ambientColor: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            skyboxExposure: number;
            skyboxTint: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            environmentPrefab: string;
            environmentReverbZone: string;
            skyboxCubemap: any;
            reflectionCubemap: string;
            reflectionIntensity: number;
        };
        lights: {
            color: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            position: {
                x: number;
                y: number;
                z: number;
            };
            rotation: {
                x: number;
                y: number;
                z: number;
            };
            type: string;
            range: number;
            spotAngle: number;
            shadowsEnabled: boolean;
        }[];
        teleportBoundsHalfWidth: number;
        controllerXRayHeight: number;
        widgetHome: {
            x: number;
            y: number;
            z: number;
        };
        skyboxColorA: {
            r: number;
            g: number;
            b: number;
            a: number;
        };
        skyboxColorB: {
            r: number;
            g: number;
            b: number;
            a: number;
        };
    } | {
        name: string;
        guid: string;
        renderSettings: {
            fogEnabled: boolean;
            fogColor: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            fogDensity: number;
            fogStartDistance: number;
            fogEndDistance: number;
            clearColor: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            ambientColor: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            skyboxExposure: number;
            skyboxTint: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            environmentPrefab: string;
            environmentReverbZone: string;
            skyboxCubemap: any;
            reflectionCubemap: string;
            reflectionIntensity: number;
        };
        lights: {
            color: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            position: {
                x: number;
                y: number;
                z: number;
            };
            rotation: {
                x: number;
                y: number;
                z: number;
            };
            type: string;
            range: number;
            spotAngle: number;
            shadowsEnabled: boolean;
        }[];
        teleportBoundsHalfWidth: number;
        controllerXRayHeight: number;
        widgetHome: {
            x: number;
            y: number;
            z: number;
        };
        skyboxColorA: {
            r: number;
            g: number;
            b: number;
            a: number;
        };
        skyboxColorB: {
            r: number;
            g: number;
            b: number;
            a: number;
        };
    } | {
        name: string;
        guid: string;
        renderSettings: {
            fogEnabled: boolean;
            fogColor: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            fogDensity: number;
            fogStartDistance: number;
            fogEndDistance: number;
            clearColor: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            ambientColor: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            skyboxExposure: number;
            skyboxTint: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            environmentPrefab: string;
            environmentReverbZone: string;
            skyboxCubemap: string;
            reflectionCubemap: string;
            reflectionIntensity: number;
        };
        lights: {
            color: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            position: {
                x: number;
                y: number;
                z: number;
            };
            rotation: {
                x: number;
                y: number;
                z: number;
            };
            type: string;
            range: number;
            spotAngle: number;
            shadowsEnabled: boolean;
        }[];
        teleportBoundsHalfWidth: number;
        controllerXRayHeight: number;
        widgetHome: {
            x: number;
            y: number;
            z: number;
        };
        skyboxColorA: {
            r: number;
            g: number;
            b: number;
            a: number;
        };
        skyboxColorB: {
            r: number;
            g: number;
            b: number;
            a: number;
        };
    } | {
        name: string;
        guid: string;
        renderSettings: {
            fogEnabled: boolean;
            fogColor: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            fogDensity: number;
            fogStartDistance: number;
            fogEndDistance: number;
            clearColor: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            ambientColor: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            skyboxExposure: number;
            skyboxTint: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            environmentPrefab: string;
            environmentReverbZone: string;
            skyboxCubemap: string;
            reflectionCubemap: string;
            reflectionIntensity: number;
        };
        lights: {
            color: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            position: {
                x: number;
                y: number;
                z: number;
            };
            rotation: {
                x: number;
                y: number;
                z: number;
            };
            type: string;
            range: number;
            spotAngle: number;
            shadowsEnabled: boolean;
        }[];
        teleportBoundsHalfWidth: number;
        controllerXRayHeight: number;
        widgetHome: {
            x: number;
            y: number;
            z: number;
        };
        skyboxColorA: {
            r: number;
            g: number;
            b: number;
            a: number;
        };
        skyboxColorB: {
            r: number;
            g: number;
            b: number;
            a: number;
        };
    } | {
        name: string;
        guid: string;
        renderSettings: {
            fogEnabled: boolean;
            fogColor: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            fogDensity: number;
            fogStartDistance: number;
            fogEndDistance: number;
            clearColor: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            ambientColor: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            skyboxExposure: number;
            skyboxTint: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            environmentPrefab: string;
            environmentReverbZone: string;
            skyboxCubemap: any;
            reflectionCubemap: string;
            reflectionIntensity: number;
        };
        lights: {
            color: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            position: {
                x: number;
                y: number;
                z: number;
            };
            rotation: {
                x: number;
                y: number;
                z: number;
            };
            type: string;
            range: number;
            spotAngle: number;
            shadowsEnabled: boolean;
        }[];
        teleportBoundsHalfWidth: number;
        controllerXRayHeight: number;
        widgetHome: {
            x: number;
            y: number;
            z: number;
        };
        skyboxColorA: {
            r: number;
            g: number;
            b: number;
            a: number;
        };
        skyboxColorB: {
            r: number;
            g: number;
            b: number;
            a: number;
        };
    } | {
        name: string;
        guid: string;
        renderSettings: {
            fogEnabled: boolean;
            fogColor: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            fogDensity: number;
            fogStartDistance: number;
            fogEndDistance: number;
            clearColor: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            ambientColor: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            skyboxExposure: number;
            skyboxTint: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            environmentPrefab: string;
            environmentReverbZone: string;
            skyboxCubemap: any;
            reflectionCubemap: string;
            reflectionIntensity: number;
        };
        lights: {
            color: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            position: {
                x: number;
                y: number;
                z: number;
            };
            rotation: {
                x: number;
                y: number;
                z: number;
            };
            type: string;
            range: number;
            spotAngle: number;
            shadowsEnabled: boolean;
        }[];
        teleportBoundsHalfWidth: number;
        controllerXRayHeight: number;
        widgetHome: {
            x: number;
            y: number;
            z: number;
        };
        skyboxColorA: {
            r: number;
            g: number;
            b: number;
            a: number;
        };
        skyboxColorB: {
            r: number;
            g: number;
            b: number;
            a: number;
        };
    } | {
        name: string;
        guid: string;
        renderSettings: {
            fogEnabled: boolean;
            fogColor: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            fogDensity: number;
            fogStartDistance: number;
            fogEndDistance: number;
            clearColor: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            ambientColor: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            skyboxExposure: number;
            skyboxTint: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            environmentPrefab: string;
            environmentReverbZone: string;
            skyboxCubemap: string;
            reflectionCubemap: string;
            reflectionIntensity: number;
        };
        lights: {
            color: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            position: {
                x: number;
                y: number;
                z: number;
            };
            rotation: {
                x: number;
                y: number;
                z: number;
            };
            type: string;
            range: number;
            spotAngle: number;
            shadowsEnabled: boolean;
        }[];
        teleportBoundsHalfWidth: number;
        controllerXRayHeight: number;
        widgetHome: {
            x: number;
            y: number;
            z: number;
        };
        skyboxColorA: {
            r: number;
            g: number;
            b: number;
            a: number;
        };
        skyboxColorB: {
            r: number;
            g: number;
            b: number;
            a: number;
        };
    } | {
        name: string;
        guid: string;
        renderSettings: {
            fogEnabled: boolean;
            fogColor: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            fogDensity: number;
            fogStartDistance: number;
            fogEndDistance: number;
            clearColor: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            ambientColor: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            skyboxExposure: number;
            skyboxTint: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            environmentPrefab: string;
            environmentReverbZone: string;
            skyboxCubemap: any;
            reflectionCubemap: string;
            reflectionIntensity: number;
        };
        lights: {
            color: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            position: {
                x: number;
                y: number;
                z: number;
            };
            rotation: {
                x: number;
                y: number;
                z: number;
            };
            type: string;
            range: number;
            spotAngle: number;
            shadowsEnabled: boolean;
        }[];
        teleportBoundsHalfWidth: number;
        controllerXRayHeight: number;
        widgetHome: {
            x: number;
            y: number;
            z: number;
        };
        skyboxColorA: {
            r: number;
            g: number;
            b: number;
            a: number;
        };
        skyboxColorB: {
            r: number;
            g: number;
            b: number;
            a: number;
        };
    } | {
        name: string;
        guid: string;
        renderSettings: {
            fogEnabled: boolean;
            fogColor: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            fogDensity: number;
            fogStartDistance: number;
            fogEndDistance: number;
            clearColor: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            ambientColor: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            skyboxExposure: number;
            skyboxTint: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            environmentPrefab: string;
            environmentReverbZone: string;
            skyboxCubemap: any;
            reflectionCubemap: string;
            reflectionIntensity: number;
        };
        lights: {
            color: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            position: {
                x: number;
                y: number;
                z: number;
            };
            rotation: {
                x: number;
                y: number;
                z: number;
            };
            type: string;
            range: number;
            spotAngle: number;
            shadowsEnabled: boolean;
        }[];
        teleportBoundsHalfWidth: number;
        controllerXRayHeight: number;
        widgetHome: {
            x: number;
            y: number;
            z: number;
        };
        skyboxColorA: {
            r: number;
            g: number;
            b: number;
            a: number;
        };
        skyboxColorB: {
            r: number;
            g: number;
            b: number;
            a: number;
        };
    } | {
        name: string;
        guid: string;
        renderSettings: {
            fogEnabled: boolean;
            fogColor: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            fogDensity: number;
            fogStartDistance: number;
            fogEndDistance: number;
            clearColor: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            ambientColor: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            skyboxExposure: number;
            skyboxTint: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            environmentPrefab: string;
            environmentReverbZone: string;
            skyboxCubemap: any;
            reflectionCubemap: any;
            reflectionIntensity: number;
        };
        lights: {
            color: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            position: {
                x: number;
                y: number;
                z: number;
            };
            rotation: {
                x: number;
                y: number;
                z: number;
            };
            type: string;
            range: number;
            spotAngle: number;
            shadowsEnabled: boolean;
        }[];
        teleportBoundsHalfWidth: number;
        controllerXRayHeight: number;
        widgetHome: {
            x: number;
            y: number;
            z: number;
        };
        skyboxColorA: {
            r: number;
            g: number;
            b: number;
            a: number;
        };
        skyboxColorB: {
            r: number;
            g: number;
            b: number;
            a: number;
        };
    } | {
        name: string;
        guid: string;
        renderSettings: {
            fogEnabled: boolean;
            fogColor: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            fogDensity: number;
            fogStartDistance: number;
            fogEndDistance: number;
            clearColor: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            ambientColor: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            skyboxExposure: number;
            skyboxTint: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            environmentPrefab: string;
            environmentReverbZone: string;
            skyboxCubemap: any;
            reflectionCubemap: string;
            reflectionIntensity: number;
        };
        lights: {
            color: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            position: {
                x: number;
                y: number;
                z: number;
            };
            rotation: {
                x: number;
                y: number;
                z: number;
            };
            type: string;
            range: number;
            spotAngle: number;
            shadowsEnabled: boolean;
        }[];
        teleportBoundsHalfWidth: number;
        controllerXRayHeight: number;
        widgetHome: {
            x: number;
            y: number;
            z: number;
        };
        skyboxColorA: {
            r: number;
            g: number;
            b: number;
            a: number;
        };
        skyboxColorB: {
            r: number;
            g: number;
            b: number;
            a: number;
        };
    } | {
        name: string;
        guid: string;
        renderSettings: {
            fogEnabled: boolean;
            fogColor: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            fogDensity: number;
            fogStartDistance: number;
            fogEndDistance: number;
            clearColor: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            ambientColor: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            skyboxExposure: number;
            skyboxTint: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            environmentPrefab: string;
            environmentReverbZone: string;
            skyboxCubemap: any;
            reflectionCubemap: string;
            reflectionIntensity: number;
        };
        lights: {
            color: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            position: {
                x: number;
                y: number;
                z: number;
            };
            rotation: {
                x: number;
                y: number;
                z: number;
            };
            type: string;
            range: number;
            spotAngle: number;
            shadowsEnabled: boolean;
        }[];
        teleportBoundsHalfWidth: number;
        controllerXRayHeight: number;
        widgetHome: {
            x: number;
            y: number;
            z: number;
        };
        skyboxColorA: {
            r: number;
            g: number;
            b: number;
            a: number;
        };
        skyboxColorB: {
            r: number;
            g: number;
            b: number;
            a: number;
        };
    } | {
        name: string;
        guid: string;
        renderSettings: {
            fogEnabled: boolean;
            fogColor: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            fogDensity: number;
            fogStartDistance: number;
            fogEndDistance: number;
            clearColor: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            ambientColor: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            skyboxExposure: number;
            skyboxTint: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            environmentPrefab: string;
            environmentReverbZone: string;
            skyboxCubemap: string;
            reflectionCubemap: string;
            reflectionIntensity: number;
        };
        lights: {
            color: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
            position: {
                x: number;
                y: number;
                z: number;
            };
            rotation: {
                x: number;
                y: number;
                z: number;
            };
            type: string;
            range: number;
            spotAngle: number;
            shadowsEnabled: boolean;
        }[];
        teleportBoundsHalfWidth: number;
        controllerXRayHeight: number;
        widgetHome: {
            x: number;
            y: number;
            z: number;
        };
        skyboxColorA: {
            r: number;
            g: number;
            b: number;
            a: number;
        };
        skyboxColorB: {
            r: number;
            g: number;
            b: number;
            a: number;
        };
    };
    loadGltf1(url: string, loadEnvironment: boolean, overrides: any): Promise<void>;
    loadGltf(url: string, loadEnvironment: boolean, overrides: any): Promise<void>;
    private _loadGltf;
    loadTilt(url: string, overrides: any): Promise<void>;
    private setAllVertexColors;
    loadObj(url: string, overrides: any): Promise<void>;
    loadObjWithMtl(objUrl: string, mtlUrl: string, overrides: any): Promise<void>;
    loadFbx(url: string, overrides: any): Promise<void>;
    loadPly(url: string, overrides: any): Promise<void>;
    loadStl(url: string, overrides: any): Promise<void>;
    loadUsdz(url: string, overrides: any): Promise<void>;
    loadVox(url: string, overrides: any): Promise<void>;
    private assignEnvironment;
    generateGradientSky(colorA: THREE.Color, colorB: THREE.Color, direction: THREE.Vector3): THREE.Mesh;
    generateTextureSky(textureName: string): THREE.Mesh;
    generateSkyGeometry(texture: THREE.Texture, direction: THREE.Vector3): THREE.Mesh;
    private setupSketchMetaDataFromScene;
    private setupSketchMetaData;
    private initCameras;
    private calculatePivot;
    private initLights;
    private initFog;
    private initSceneBackground;
    frameScene(): void;
    private frameNode;
    private frameBox;
    levelCamera(): void;
    createTreeView(model: Object3D<THREE.Object3DEventMap>, root: HTMLElement): void;
    createTreeViewNode(object: THREE.Object3D, parentElement: HTMLElement): void;
}
export {};
