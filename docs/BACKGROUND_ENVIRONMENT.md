# Background Color and Environment Logic in Icosa Viewer

This document describes how the Three.js-based Icosa Viewer determines background colors, sky rendering, and environment settings when loading 3D models.

## Overview

The background and environment system uses a multi-layered approach combining metadata from .tilt/.gltf files, predefined environment presets, and fallback defaults. The system supports gradient skies, texture-based skies, and solid color backgrounds.

## Background Determination Priority

### Primary Logic Flow

The background is determined in `initSceneBackground()` (`src/viewer.ts:2578-2605`) following this priority:

1. **No Metadata Available** - **Highest priority for fallback**
   - Used when `sketchMetadata` is undefined (OBJ/FBX models)
   - Sets `scene.background = defaultBackgroundColor` (black by default)

2. **Gradient Sky** - **Highest priority when metadata exists**
   - Used when `sketchMetadata.UseGradient` is true
   - Generates procedural gradient using `generateGradientSky()`

3. **Texture Sky** - **Medium priority**
   - Used when `sketchMetadata.SkyTexture` is defined
   - Loads external texture using `generateTextureSky()`

4. **Default Background Color** - **Lowest priority**
   - Used when no sky options are available
   - Falls back to `defaultBackgroundColor`

## Environment Metadata Sources

### Sketch Metadata Fields

Environment data is parsed from model userData in `SketchMetadata` constructor (`src/viewer.ts:78-98`):

**Core Environment Fields:**
- `TB_EnvironmentGuid` - UUID referencing predefined environment preset
- `TB_Environment` - Human-readable environment name
- `TB_UseGradient` - Boolean controlling gradient vs texture sky

**Sky Configuration:**
- `TB_SkyColorA` - Primary gradient color
- `TB_SkyColorB` - Secondary gradient color
- `TB_SkyGradientDirection` - Gradient direction vector
- `TB_SkyTexture` - Texture filename for sky

**Reflection and Fog:**
- `TB_ReflectionTexture` - Cubemap for reflections
- `TB_ReflectionIntensity` - Reflection strength multiplier
- `TB_FogColor` - Fog color override
- `TB_FogDensity` - Fog density value

### Environment Preset System

Environment presets provide default values when metadata is missing or incomplete (`src/viewer.ts:80`):

```typescript
this.EnvironmentPreset = new EnvironmentPreset(Viewer.lookupEnvironment(this.EnvironmentGuid));
```

**Preset Lookup:**
- Uses `EnvironmentGuid` to find matching preset in `lookupEnvironment()` (`src/viewer.ts:621+`)
- Contains predefined configurations for lighting, sky, and reflection settings

## Environment Preset Fallback Logic

### Metadata Priority Chain

Each environment property follows this priority hierarchy:

1. **Explicit Metadata** - Values from `TB_*` fields in userData
2. **Environment Preset** - Default values from matching preset
3. **System Defaults** - Hardcoded fallbacks

**Example Priority Chain** (`src/viewer.ts:90-98`):
```typescript
this.SkyColorA = Viewer.parseTBColorString(userData['TB_SkyColorA'], this.EnvironmentPreset.SkyColorA);
this.SkyColorB = Viewer.parseTBColorString(userData['TB_SkyColorB'], this.EnvironmentPreset.SkyColorB);
this.SkyTexture = userData['TB_SkyTexture'] ?? this.EnvironmentPreset.SkyTexture;
this.ReflectionTexture = userData['TB_ReflectionTexture'] ?? this.EnvironmentPreset.ReflectionTexture;
```

### UseGradient Logic

Special handling for gradient vs texture decision (`src/viewer.ts:82-89`):

1. **Explicit Setting** - If `TB_UseGradient` is defined, use that value
2. **Preset-Based** - If valid environment preset exists, use `preset.UseGradient`
3. **Texture-Based** - If no preset, determine based on whether `SkyTexture` is null

## Built-in Environment Presets

The viewer includes 12 predefined environments (`src/viewer.ts:622+`):

### Environment Types

1. **Passthrough** (`e38af599-4575-46ff-a040-459703dbcd36`)
   - Transparent/minimal environment
   - No skybox, basic lighting

2. **Standard** (`cb937de4-7086-4505-9588-0a21ba35b341`)
   - Default indoor environment
   - Neutral colors, moderate lighting

3. **Night Sky** (`0a5173e8-8c2f-42ab-ae61-c0d7b9a6ee6a`)
   - Space environment with stars
   - Uses "nightsky" cubemap texture

4. **Space** (`e1fa67b0-5f35-418e-ac6a-fb6285e654b9`)
   - Deep space environment
   - Uses "milkyway_PNG" cubemap texture

5. **Dress Form** (`04ac3395-d22a-436d-8e20-ba54ba9b4e8e`)
   - Indoor studio environment
   - Optimized for object display

6. **Pedestal** (`b1b21715-2ba2-498e-a76e-1e5ebe250e52`)
   - Gallery/museum environment
   - Clean, professional lighting

7. **Snowman** (`8eb8c4ab-4637-44b4-9840-ed28bb75b0c7`)
   - Winter outdoor environment
   - Uses "snowysky" cubemap texture

8. **Ambient Dust** (`e6191b3e-4a88-4bb7-89b3-6dc6f3b7d3df`)
   - Atmospheric environment
   - Particle-like ambient lighting

9. **Gradient Dim** / **Gradient Bright** (`52be32e9-bc8b-45e9-ad07-a9b4f84ff269`, `27c8fd7c-efc8-4e09-8aa9-a20ec3b133e1`)
   - Procedural gradient environments
   - Different brightness levels

10. **Grey Room** (`2ba742b1-93a1-49a7-b726-84ad8f8e8b2e`)
    - Neutral studio environment
    - Consistent grey coloring

11. **Void** (`00000000-0000-0000-0000-000000000000`)
    - Minimal black environment
    - No distractions, pure black background

## Sky Generation Methods

### Gradient Sky Generation

**Method:** `generateGradientSky()` (`src/viewer.ts:2364-2382`)

**Process:**
1. Creates 1x256 pixel canvas for gradient texture
2. Generates linear gradient between `colorA` and `colorB`
3. Applies gradient in specified `direction` vector
4. Creates sphere geometry with inward-facing normals
5. Returns textured mesh for sky dome

### Texture Sky Generation

**Method:** `generateTextureSky()` (`src/viewer.ts:2384-2388`)

**Process:**
1. Loads texture from `textures/skies/{textureName}.png`
2. Creates sphere geometry with texture mapping
3. Returns textured mesh for sky dome

**Asset Structure:**
- Textures loaded from `textures/skies/` directory
- Common textures: "nightsky", "milkyway_PNG", "snowysky"

## Environment Asset Loading

### 3D Environment Models

**Method:** `assignEnvironment()` (`src/viewer.ts:2338-2362`)

**Process:**
1. Uses `EnvironmentGuid` to construct asset URL
2. Loads GLB model from `environments/{guid}/{guid}.glb`
3. Adds environment model to scene as `environmentObject`
4. Provides 3D geometry beyond just sky/background

**Error Handling:**
- Graceful fallback if environment asset fails to load
- Continues with sky/background only if 3D environment unavailable

## Default Values and Initialization

### System Defaults

**Default Background Color** (`src/viewer.ts:282`):
```typescript
this.defaultBackgroundColor = new THREE.Color(0x000000); // Black
```

**Asset Paths** (`src/viewer.ts:279-280`):
```typescript
this.environmentPath = new URL('environments/', assetBaseUrl);
this.texturePath = new URL('textures/', assetBaseUrl);
```

### Environment Preset Structure

Each preset contains:
- `guid` - Unique identifier
- `name` - Human-readable name
- `renderSettings` - Fog, ambient light, skybox settings
- `lights` - Directional light configurations
- `skyboxColorA/B` - Gradient colors
- `skyboxCubemap` - Texture reference
- `reflectionCubemap` - Reflection texture
- `reflectionIntensity` - Reflection strength

## Integration with Scene Setup

### Initialization Order

Background setup occurs in `initializeScene()` (`src/viewer.ts:590`):

1. `initSceneBackground()` - Set background/sky
2. `initFog()` - Configure scene fog
3. `initLights()` - Set up lighting
4. `initCameras()` - Position cameras

### Scene Management

**Sky Object Tracking:**
- Sky meshes stored in `this.skyObject` for later cleanup
- Added to scene with `scene.add(sky)`
- Replaced when environment changes

**Background vs Sky:**
- `scene.background` used for solid colors
- 3D sky mesh used for gradients/textures
- Sky mesh creates immersive 3D environment

## Usage Examples

### Runtime Environment Override

```javascript
const sceneOverrides = {
  environment: {
    useGradient: true,
    skyColorA: { r: 1.0, g: 0.5, b: 0.0 },
    skyColorB: { r: 0.0, g: 0.5, b: 1.0 },
    gradientDirection: [0, 1, 0]
  }
};

viewer.loadModel(url, sceneOverrides);
```

### Metadata Example

In .tilt/.gltf file userData:
```json
{
  "TB_EnvironmentGuid": "0a5173e8-8c2f-42ab-ae61-c0d7b9a6ee6a",
  "TB_UseGradient": "false",
  "TB_SkyTexture": "nightsky",
  "TB_ReflectionTexture": "milkyway_reflection",
  "TB_ReflectionIntensity": "3.0"
}
```

## File References

- **Main background logic**: `src/viewer.ts:2578-2605`
- **Environment assignment**: `src/viewer.ts:2338-2362`
- **Gradient sky generation**: `src/viewer.ts:2364-2382`
- **Texture sky generation**: `src/viewer.ts:2384-2388`
- **Environment presets**: `src/viewer.ts:621+`
- **Metadata parsing**: `src/viewer.ts:78-98`
- **Preset fallback logic**: `src/viewer.ts:82-89`