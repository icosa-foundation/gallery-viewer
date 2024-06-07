import * as THREE from "three";
export class Viewer {
    constructor(assetBaseUrl: string, frame?: HTMLElement);
    loadGltf(url: string, loadEnvironment: boolean): Promise<void>;
    generateGradientSky(colorA: THREE.Color, colorB: THREE.Color, direction: THREE.Vector3): THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap> | null;
}

//# sourceMappingURL=icosa-viewer.d.ts.map
