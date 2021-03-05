import './css/style.scss';
export declare class Viewer {
    private icosa_frame?;
    private icosa_viewer?;
    constructor(frame?: HTMLElement);
    private setupNavigation;
    initViewer(): void;
    load(url: string): void;
}
