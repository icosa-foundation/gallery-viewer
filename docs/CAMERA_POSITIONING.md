# Camera Positioning Logic in Icosa Viewer

This document describes how the Three.js-based Icosa Viewer determines camera position and orientation when loading 3D models.

## Overview

The camera positioning system uses a priority-based approach, with runtime overrides taking precedence over embedded metadata, which in turn takes precedence over default fallback values.

## Camera Position Priority Order

### Position Determination

The camera position (`cameraPos`) is determined by the following priority chain (from `src/viewer.ts:2420`):

1. **Override parameters** (`cameraOverrides?.translation`) - **Highest priority**
   - Runtime configuration passed to the viewer
   - Allows dynamic positioning without modifying source files

2. **Sketch metadata** (`this.sketchMetadata?.CameraTranslation.toArray()`) - **Medium priority**
   - Embedded in .tilt/.gltf files from Tilt Brush/Open Brush exports
   - Parsed from `TB_CameraTranslation` field in userData

3. **Default fallback** (`[0, 1, -1]`) - **Lowest priority**
   - Used when no other position data is available
   - Places camera slightly above and in front of origin

### Rotation Determination

The camera rotation (`cameraRot`) follows the same priority hierarchy (from `src/viewer.ts:2421`):

1. **Override parameters** (`cameraOverrides?.rotation`) - **Highest priority**
2. **Sketch metadata** (`this.sketchMetadata?.CameraRotation.toArray()`) - **Medium priority**
3. **Default fallback** (`[0, 0, 0]`) - **Lowest priority**

## Metadata Sources

### Sketch Metadata Parsing

Camera metadata is extracted from model userData in `src/viewer.ts:119-120`:

```typescript
this.CameraTranslation = Viewer.parseTBVector3(userData['TB_CameraTranslation'])
this.CameraRotation = Viewer.parseTBVector3(userData['TB_CameraRotation']);
```

**Source fields:**
- `TB_CameraTranslation` - 3D position vector as comma-separated string
- `TB_CameraRotation` - 3D rotation vector (euler angles or quaternion)

**Processing:**
- Parsed via `Viewer.parseTBVector3()` helper method (`src/viewer.ts:536-540`)
- Handles string-to-vector conversion with fallback defaults

### Override Parameters

Runtime overrides can include:
- `camera.translation` - Position override
- `camera.rotation` - Rotation override
- `camera.perspective.yfov` - Field of view
- `camera.perspective.znear` - Near clipping plane
- `GOOGLE_camera_settings.pivot` - Target point override

## Camera Target/Pivot Determination

The camera target (look-at point) follows its own priority system (`src/viewer.ts:2460-2476`):

1. **Google camera settings pivot** (`cameraOverrides?.GOOGLE_camera_settings?.pivot`) - **Highest priority**
   - Explicit target point specification
   - Direct 3D coordinate specification

2. **Geometry visual center point** (`this.overrides?.geometryData?.visualCenterPoint`) - **Medium priority**
   - Pre-calculated visual center of the model
   - Accounts for visual weight distribution

3. **Model bounding box center** - **Lowest priority**
   - Geometric center calculated from model bounds
   - Fallback when no other target data available

```typescript
const box = this.modelBoundingBox;
const boxCenter = box.getCenter(new THREE.Vector3());
```

## Coordinate System Conversions

### Unity to Three.js Handedness Correction

The viewer applies coordinate system corrections for metadata from Unity-based tools (`src/viewer.ts:2423-2434`):

**Rotation adjustments:**
- Y-axis rotation: +180 degrees added to metadata rotations
- Compensates for handedness differences between Unity (left-handed) and Three.js (right-handed)
- Applied only to euler angle rotations (3-component arrays)

**Angle conversion:**
- Euler angles converted from degrees to radians
- Uses `THREE.MathUtils.degToRad()` for conversion

### Rotation Format Handling

The system supports both rotation formats:
- **Euler angles** (3 components) - converted from degrees to radians
- **Quaternions** (4 components) - used directly without conversion

## Camera Setup Implementation

### Perspective Camera Configuration

Two cameras are created (`src/viewer.ts:2441-2456`):
- `flatCamera` - Primary camera for non-VR viewing
- `xrCamera` - Secondary camera for WebXR/VR mode

**Camera parameters:**
- FOV: From overrides or default 75 degrees
- Aspect ratio: Default 2 (updated during resize)
- Near plane: From overrides or default 0.1
- Far plane: Fixed at 6000 units

### Camera Controls Integration

The viewer uses `camera-controls` library for navigation (`src/viewer.ts:2478-2483`):

```typescript
this.cameraControls = new CameraControls(this.flatCamera, viewer.canvas);
this.cameraControls.setPosition(cameraPos[0], cameraPos[1], cameraPos[2], false);
this.cameraControls.setTarget(cameraTarget.x, cameraTarget.y, cameraTarget.z, false);
```

**Control settings:**
- Smooth time: 1 second for camera transitions
- Rotation speeds: 0.5 for both polar and azimuth rotation

## Usage Examples

### Runtime Override Example

```javascript
const cameraOverrides = {
  translation: [5, 10, 15],
  rotation: [0, 45, 0],
  perspective: {
    yfov: Math.PI / 3, // 60 degrees in radians
    znear: 0.01
  }
};

viewer.loadModel(url, { camera: cameraOverrides });
```

### Metadata Example

In .tilt/.gltf file userData:
```json
{
  "TB_CameraTranslation": "2.5, 1.8, -3.2",
  "TB_CameraRotation": "15, 180, 0"
}
```

## File References

- **Main implementation**: `src/viewer.ts:2416-2489`
- **Metadata parsing**: `src/viewer.ts:119-120`
- **Vector parsing utility**: `src/viewer.ts:536-540`
- **Coordinate conversion**: `src/viewer.ts:2423-2434`
- **Target calculation**: `src/viewer.ts:2460-2476`