import './css/style.scss';
export declare class Viewer {
    private icosa_frame?;
    private icosa_viewer?;
    constructor(frame?: HTMLElement);
    private setupNavigation;
    initViewer(): void;
    loadGLTF(url: string): void;
    loadPolyUrl(url: string): void;
    loadPolyAsset(assetID: string): void;
    loadPolyTilt(url: string): void;
    loadPolyGLTF(url: string): void;
}
