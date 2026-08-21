import type { Matrix4, Object3D, Scene } from 'three';

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

export interface GalleryXRClippingRange {
    near: number;
    far: number;
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

export function computeXRClippingRange(
    authoredNear: number,
    authoredFar: number,
    distanceToBoundsCenter?: number,
    boundsRadius?: number
): GalleryXRClippingRange {
    const validNear = Number.isFinite(authoredNear) && authoredNear > 0
        ? authoredNear
        : 0.01;
    const validFar = Number.isFinite(authoredFar) && authoredFar > 0
        ? authoredFar
        : 6000;
    const near = Math.max(0.001, Math.min(validNear, 0.01));
    let far = Math.max(6000, validFar);

    if (
        Number.isFinite(distanceToBoundsCenter)
        && Number.isFinite(boundsRadius)
        && distanceToBoundsCenter! >= 0
        && boundsRadius! >= 0
    ) {
        far = Math.max(far, distanceToBoundsCenter! + boundsRadius! * 1.1);
    }

    return { near, far };
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
    target?: Matrix4
): Matrix4 {
    const inverseAuthoredCamera = authoredCameraWorld.clone().invert();
    return (target ?? viewerPoseWorld.clone()).multiplyMatrices(
        viewerPoseWorld,
        inverseAuthoredCamera
    );
}

/**
 * Converts a desired world-space placement into the local transform required
 * beneath the AR-entry root. Placement sources can therefore share one
 * world-space contract without modifying the entry or importer transforms.
 */
export function computeLocalPlacementMatrix(
    parentWorld: Matrix4,
    desiredWorld: Matrix4,
    target?: Matrix4
): Matrix4 {
    const inverseParent = parentWorld.clone().invert();
    return (target ?? desiredWorld.clone()).multiplyMatrices(
        inverseParent,
        desiredWorld
    );
}
