export type GalleryVector3Tuple = [number, number, number];
export type GalleryQuaternionTuple = [number, number, number, number];
export type GalleryRotationTuple = GalleryVector3Tuple | GalleryQuaternionTuple;

export type GalleryNavigationMode = 'fly' | 'orbit';
export type GalleryNavigationSource =
    | 'override.navigationMode'
    | 'camera.GOOGLE_camera_settings.mode'
    | 'embedded.TB_FlyMode'
    | 'fallback';

export interface GalleryPerspectiveMetadata {
    yfov?: number;
    znear?: number;
    zfar?: number;
    [key: string]: unknown;
}

export interface GalleryCameraSettingsMetadata {
    pivot?: number[];
    mode?: string;
    distanceLimits?: unknown;
    yawLimits?: unknown;
    pitchLimits?: unknown;
    panLimits?: unknown;
    [key: string]: unknown;
}

export interface GalleryCameraMetadata {
    translation?: number[];
    rotation?: number[];
    perspective?: GalleryPerspectiveMetadata;
    GOOGLE_camera_settings?: GalleryCameraSettingsMetadata;
    [key: string]: unknown;
}

export interface GalleryGeometryStatsMetadata {
    centroid?: number[];
    stdev?: number;
    radius?: number;
    [key: string]: unknown;
}

export interface GalleryGeometryMetadata {
    stats?: GalleryGeometryStatsMetadata;
    visualCenterPoint?: number[];
    [key: string]: unknown;
}

export interface GalleryRealWorldTransformMetadata {
    scaling_factor?: number;
    [key: string]: unknown;
}

export interface GalleryPresentationParams<TPostProcessing = unknown> {
    backgroundColor?: string;
    camera?: GalleryCameraMetadata;
    colorSpace?: string;
    geometry_data?: GalleryGeometryMetadata;
    GOOGLE_geometry_data?: GalleryGeometryMetadata;
    GOOGLE_real_world_transform?: GalleryRealWorldTransformMetadata;
    postProcessing?: TPostProcessing;
    xr?: unknown;
    [key: string]: unknown;
}

/**
 * Load-time metadata accepted by the existing viewer methods.
 *
 * The known properties describe the current Gallery integration contract. The
 * index signature deliberately preserves untyped legacy presentation fields.
 */
export interface GalleryViewerOverrides<TPostProcessing = unknown> {
    defaultBackgroundColor?: string;
    camera?: GalleryCameraMetadata;
    geometryData?: GalleryGeometryMetadata;
    colorSpace?: string;
    presentationParams?: GalleryPresentationParams<TPostProcessing>;
    presentationPostProcessing?: TPostProcessing;
    postProcessing?: TPostProcessing;
    navigationMode?: GalleryNavigationMode;
    tiltUrl?: string;
    GOOGLE_lighting_rig?: unknown;
    lightingRig?: unknown;
    [key: string]: unknown;
}

export interface GalleryEmbeddedPresentationMetadata {
    TB_FlyMode?: boolean | string | number;
    TB_PoseScale?: number | string;
    TB_PoseTranslation?: unknown;
    TB_PoseRotation?: unknown;
    TB_CameraTranslation?: unknown;
    TB_CameraRotation?: unknown;
    TB_CameraTargetDistance?: number | string;
    GOOGLE_initial_camera_motion?: {
        motionPath?: string;
        [key: string]: unknown;
    };
    [key: string]: unknown;
}

export interface GalleryResolvedValue<T> {
    value: T;
    source: string;
}

export interface GalleryResolvedNavigation {
    mode: GalleryNavigationMode;
    source: GalleryNavigationSource;
    rawCameraMode?: string;
    embeddedFlyMode?: boolean;
}

export interface GalleryScaleObservations {
    geometryRadius?: GalleryResolvedValue<number>;
    poseScale?: GalleryResolvedValue<number>;
    /** An observation only. Its presentation semantics remain unresolved. */
    realWorldScale?: GalleryResolvedValue<number>;
}

export interface GalleryResolvedPresentationMetadata<TPostProcessing = unknown> {
    camera: GalleryResolvedValue<GalleryCameraMetadata>;
    geometryData: GalleryResolvedValue<GalleryGeometryMetadata>;
    backgroundColor: GalleryResolvedValue<string | undefined>;
    colorSpace: GalleryResolvedValue<string>;
    postProcessing: GalleryResolvedValue<TPostProcessing | undefined>;
    navigation: GalleryResolvedNavigation;
    scale: GalleryScaleObservations;
    diagnostics: string[];
}

function hasOwn(object: object | undefined | null, property: string): boolean {
    return object != null && Object.prototype.hasOwnProperty.call(object, property);
}

function finiteNumber(value: unknown): number | undefined {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : undefined;
    }
    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
}

export function parseGalleryMetadataBoolean(value: unknown): boolean | undefined {
    if (typeof value === 'boolean') {
        return value;
    }
    if (typeof value === 'number') {
        if (value === 1) return true;
        if (value === 0) return false;
        return undefined;
    }
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (normalized === 'true' || normalized === '1') return true;
        if (normalized === 'false' || normalized === '0') return false;
    }
    return undefined;
}

function resolvedCamera<TPostProcessing>(
    overrides: GalleryViewerOverrides<TPostProcessing>,
    presentationParams: GalleryPresentationParams<TPostProcessing>
): GalleryResolvedValue<GalleryCameraMetadata> {
    const presentationCamera = presentationParams.camera ?? {};
    if (overrides.camera !== undefined) {
        return {
            value: { ...presentationCamera, ...overrides.camera },
            source: presentationParams.camera !== undefined
                ? 'presentationParams.camera + overrides.camera'
                : 'overrides.camera'
        };
    }
    if (presentationParams.camera !== undefined) {
        return { value: { ...presentationCamera }, source: 'presentationParams.camera' };
    }
    return { value: {}, source: 'fallback.emptyCamera' };
}

function resolvedGeometryData<TPostProcessing>(
    overrides: GalleryViewerOverrides<TPostProcessing>,
    presentationParams: GalleryPresentationParams<TPostProcessing>
): GalleryResolvedValue<GalleryGeometryMetadata> {
    if (overrides.geometryData !== undefined) {
        return { value: overrides.geometryData, source: 'overrides.geometryData' };
    }
    if (presentationParams.geometry_data !== undefined) {
        return { value: presentationParams.geometry_data, source: 'presentationParams.geometry_data' };
    }
    if (presentationParams.GOOGLE_geometry_data !== undefined) {
        return {
            value: presentationParams.GOOGLE_geometry_data,
            source: 'presentationParams.GOOGLE_geometry_data'
        };
    }
    return { value: {}, source: 'fallback.emptyGeometryData' };
}

function recognizedNavigationMode(value: unknown): GalleryNavigationMode | undefined {
    if (typeof value !== 'string') return undefined;
    const normalized = value.trim().toLowerCase();
    if (normalized === 'fly' || normalized === 'orbit') return normalized;
    if (normalized === 'movableorbit') return 'orbit';
    return undefined;
}

/**
 * Resolves existing Gallery and embedded metadata without mutating either
 * input. The result is diagnostic during Phase 0 and does not itself alter
 * viewer camera, scale, or navigation behaviour.
 */
export function resolveGalleryPresentationMetadata<TPostProcessing = unknown>(
    overrides: GalleryViewerOverrides<TPostProcessing> = {},
    embedded: GalleryEmbeddedPresentationMetadata = {}
): GalleryResolvedPresentationMetadata<TPostProcessing> {
    const presentationParams = overrides.presentationParams ?? {};
    const camera = resolvedCamera(overrides, presentationParams);
    const geometryData = resolvedGeometryData(overrides, presentationParams);
    const diagnostics: string[] = [];

    const rawCameraMode = camera.value.GOOGLE_camera_settings?.mode;
    const cameraMode = recognizedNavigationMode(rawCameraMode);
    const embeddedFlyMode = parseGalleryMetadataBoolean(embedded.TB_FlyMode);

    let navigation: GalleryResolvedNavigation;
    if (overrides.navigationMode !== undefined) {
        navigation = {
            mode: overrides.navigationMode,
            source: 'override.navigationMode',
            rawCameraMode,
            embeddedFlyMode
        };
    } else if (cameraMode !== undefined) {
        navigation = {
            mode: cameraMode,
            source: 'camera.GOOGLE_camera_settings.mode',
            rawCameraMode,
            embeddedFlyMode
        };
    } else if (embeddedFlyMode !== undefined) {
        navigation = {
            mode: embeddedFlyMode ? 'fly' : 'orbit',
            source: 'embedded.TB_FlyMode',
            rawCameraMode,
            embeddedFlyMode
        };
    } else {
        navigation = {
            mode: 'orbit',
            source: 'fallback',
            rawCameraMode
        };
    }

    if (rawCameraMode !== undefined && cameraMode === undefined) {
        diagnostics.push(`Unrecognized GOOGLE_camera_settings.mode: ${rawCameraMode}`);
    }
    if (
        cameraMode !== undefined
        && embeddedFlyMode !== undefined
        && cameraMode !== (embeddedFlyMode ? 'fly' : 'orbit')
    ) {
        diagnostics.push(
            `Navigation metadata conflict: camera mode is ${cameraMode} but TB_FlyMode resolves to ${embeddedFlyMode ? 'fly' : 'orbit'}`
        );
    }

    const geometryRadius = finiteNumber(geometryData.value.stats?.radius);
    const poseScale = finiteNumber(embedded.TB_PoseScale);
    const realWorldScale = finiteNumber(
        presentationParams.GOOGLE_real_world_transform?.scaling_factor
    );

    const postProcessing = hasOwn(overrides, 'postProcessing')
        ? { value: overrides.postProcessing, source: 'overrides.postProcessing' }
        : hasOwn(presentationParams, 'postProcessing')
            ? { value: presentationParams.postProcessing, source: 'presentationParams.postProcessing' }
            : hasOwn(overrides, 'presentationPostProcessing')
                ? {
                    value: overrides.presentationPostProcessing,
                    source: 'overrides.presentationPostProcessing'
                }
                : { value: undefined, source: 'fallback.disabled' };

    return {
        camera,
        geometryData,
        backgroundColor: overrides.defaultBackgroundColor !== undefined
            ? {
                value: overrides.defaultBackgroundColor,
                source: 'overrides.defaultBackgroundColor'
            }
            : {
                value: presentationParams.backgroundColor,
                source: presentationParams.backgroundColor !== undefined
                    ? 'presentationParams.backgroundColor'
                    : 'fallback.undefined'
            },
        colorSpace: overrides.colorSpace !== undefined
            ? { value: overrides.colorSpace, source: 'overrides.colorSpace' }
            : presentationParams.colorSpace !== undefined
                ? { value: presentationParams.colorSpace, source: 'presentationParams.colorSpace' }
                : { value: 'LINEAR', source: 'fallback.LINEAR' },
        postProcessing,
        navigation,
        scale: {
            geometryRadius: geometryRadius === undefined
                ? undefined
                : { value: geometryRadius, source: `${geometryData.source}.stats.radius` },
            poseScale: poseScale === undefined
                ? undefined
                : { value: poseScale, source: 'embedded.TB_PoseScale' },
            realWorldScale: realWorldScale === undefined
                ? undefined
                : {
                    value: realWorldScale,
                    source: 'presentationParams.GOOGLE_real_world_transform.scaling_factor'
                }
        },
        diagnostics
    };
}
