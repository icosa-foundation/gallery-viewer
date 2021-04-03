import CameraControls from "camera-controls";
import { Scene, Camera } from "three";
export declare class Loader {
    private scene;
    private tiltLoader;
    private gltfLoader;
    private legacygltf;
    private sceneCamera;
    private cameraControls;
    private loadedModel?;
    private loaded;
    private updateableMeshes;
    constructor(scene: Scene, sceneCamera: Camera, cameraControls: CameraControls);
    update(deltaTime: number): void;
    private initGltf;
    private initTilt;
    private initPolyGltf;
    loadGLTF(url: string): void;
    loadPolyAsset(assetID: string, format?: string): void;
    loadPolyUrl(url: string, format?: string): void;
    loadPolyTilt(url: string): void;
    loadPolyGltf(url: string): void;
}
