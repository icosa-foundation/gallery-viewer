import { Matrix4, Object3D, Scene } from 'three';

export type GalleryXRSessionMode = 'desktop' | 'vr' | 'ar';

export type GalleryEnvironmentBlendMode =
    | 'opaque'
    | 'additive'
    | 'alpha-blend'
    | 'unknown';

export interface ARVirtualEnvironmentSnapshot {
    background: Scene['background'];
    fog: Scene['fog'];
    skyObject?: Object3D;
    skyVisible?: boolean;
}

export function normalizeEnvironmentBlendMode(value: unknown): GalleryEnvironmentBlendMode {
    if (value === 'opaque' || value === 'additive' || value === 'alpha-blend') {
        return value;
    }
    return 'unknown';
}

/**
 * Alpha-blended and additive displays should not render the asset's opaque
 * virtual sky or fog over the physical environment. Opaque sessions retain
 * the authored environment, and unknown modes remain conservative.
 */
export function shouldSuppressVirtualEnvironment(
    blendMode: GalleryEnvironmentBlendMode
): boolean {
    return blendMode === 'alpha-blend' || blendMode === 'additive';
}

export function captureARVirtualEnvironment(
    scene: Scene,
    skyObject?: Object3D
): ARVirtualEnvironmentSnapshot {
    return {
        background: scene.background,
        fog: scene.fog,
        skyObject,
        skyVisible: skyObject?.visible
    };
}

export function applyARVirtualEnvironmentPolicy(
    scene: Scene,
    blendMode: GalleryEnvironmentBlendMode,
    skyObject?: Object3D
): void {
    if (!shouldSuppressVirtualEnvironment(blendMode)) return;
    scene.background = null;
    scene.fog = null;
    if (skyObject) skyObject.visible = false;
}

export function restoreARVirtualEnvironment(
    scene: Scene,
    snapshot: ARVirtualEnvironmentSnapshot
): void {
    scene.background = snapshot.background;
    scene.fog = snapshot.fog;
    if (snapshot.skyObject && snapshot.skyVisible !== undefined) {
        snapshot.skyObject.visible = snapshot.skyVisible;
    }
}

/**
 * Computes a content-side transform that recreates an authored camera view
 * from the tracked viewer pose without moving or scaling the XR camera.
 *
 * Given authored camera world transform C and tracked viewer pose H, content
 * transform P = H * inverse(C), so H^-1 * P equals the authored view C^-1.
 */
export function computeARContentEntryMatrix(
    authoredCameraWorld: Matrix4,
    viewerPoseWorld: Matrix4,
    target = new Matrix4()
): Matrix4 {
    const inverseAuthoredCamera = authoredCameraWorld.clone().invert();
    return target.multiplyMatrices(viewerPoseWorld, inverseAuthoredCamera);
}
