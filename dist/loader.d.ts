import CameraControls from "camera-controls";
import { Scene } from "three";
export declare class Loader {
    private scene;
    private tiltLoader;
    constructor(scene: Scene, camercontrols: CameraControls);
    load(assetID: string): void;
    loadPoly(assetID: string): void;
    loadPolyURL(url: string): void;
    private initTilt;
}
