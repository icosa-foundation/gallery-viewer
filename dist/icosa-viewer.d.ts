declare class Viewer {
    private icosa_frame?;
    private brushPath;
    private scene;
    private tiltLoader;
    private gltfLegacyLoader;
    private gltfLoader;
    private sceneCamera;
    private sceneColor;
    private cameraControls;
    private loadedModel?;
    constructor(brushPath: string, frame?: HTMLElement);
    private toggleFullscreen;
    private initializeScene;
    loadGltf(url: string): Promise<void>;
    loadTilt(url: string): Promise<void>;
    loadObj(url: string): void;
    loadGltf1(url: string): Promise<void>;
}

export { Viewer };
