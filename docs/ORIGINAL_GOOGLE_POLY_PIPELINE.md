# Original Google Poly Viewer Pipeline

## Purpose

This document records how the archived Google Poly web viewer selected, prepared, and rendered models. Its purpose is to provide a stable reference for aligning Gallery Viewer with Poly without turning individual visual fixes into unrelated heuristics.

The immediate scope is the Poly embed viewer captured during 2021 and the model files preserved by Archive.org and Icosa Gallery. Poly thumbnails are useful visual references, but they are not exact browser-rendering references because some were produced by the source application during export. The resurrected Poly viewer is therefore the primary reference for migrated Poly assets.

This is a living document. Unknowns are stated explicitly rather than filled with plausible defaults.

## Evidence labels

Each significant claim should be treated as one of these classes:

1. **Runtime verified**: observed directly in the archived Poly JavaScript.
2. **Payload verified**: observed in an asset-specific serialized Poly page payload.
3. **File verified**: observed in an original model file retrieved from Archive.org.
4. **Reconstructed**: inferred by translating old Three.js behaviour to current Three.js and comparing against the resurrected viewer.
5. **Unresolved**: not yet established well enough to guide production code.

Current evidence summary:

| Area | Evidence state |
| --- | --- |
| Tilt versus non-Tilt classification | Payload and file verified |
| Tilt Brush technique materials | Runtime and file verified |
| Existence of distinct non-Tilt lighting payloads | Payload verified |
| Exact modern-Three.js translation of non-Tilt light intensities | Reconstructed |
| Gamma versus linear asset modes | Runtime and payload verified; modern translation incomplete |
| Film-grain and vignette shaders | Runtime verified; per-asset enablement audit incomplete |
| Initial camera transform and pivot serialization | Payload verified |
| Initial camera-motion enum and missing-value fallback | Runtime verified |
| Fire Cat's missing camera-motion property | File verified across all three archived glTF renditions |
| Shadow implementation details | Partly reconstructed and unresolved |
| Suspected non-Tilt rim lighting | Reconstructed and unresolved |

## High-level pipeline

```text
Poly asset record
    -> choose a viewer rendition
    -> load glTF 1 or glTF 2
    -> classify Tilt Brush versus non-Tilt content
    -> construct materials using the appropriate material path
    -> apply scene rotation, scale, background, fog and lighting metadata
    -> establish the presentation camera and pivot
    -> run the configured initial camera motion
    -> render using the asset's colour-space mode
    -> apply optional screen-space finishing effects
```

The first-order content split is Tilt Brush versus non-Tilt. The non-Tilt side is not homogeneous: conventional glTF 2, legacy glTF 1 techniques, Google Blocks exports, and assets with explicit Poly lighting rigs can require different handling.

Format selection and content classification are separate decisions. A Tilt Brush scene can exist as glTF 1 or glTF 2, and a glTF 2 file is not necessarily a conventional PBR model.

## Asset page and rendition selection

### Archived page data

An archived Poly model page contains two representations that matter to the viewer:

1. A large raw asset record containing available formats, presentation metadata, author information and related resources.
2. A smaller prepared viewer payload containing the rendition URLs and already-serialized camera, renderer, background, lighting and content-class settings.

The prepared payload is closer to the viewer's actual input than the public metadata object. It should be preferred when reproducing an original Poly render.

The local Poly replay server now takes the original asset-specific prepared payload and replaces only the model-file entries with the selected Icosa or Backblaze rendition. It does not synthesize presentation values when an archived payload is available.

### Multiple glTF renditions

Poly commonly stored more than one rendition of the same asset. Fire Cat, for example, has three glTF files referenced by its archived page:

1. A glTF 1.1 rendition.
2. A glTF 2 rendition without a serialized camera index.
3. A glTF 2 rendition with `GOOGLE_camera_index` and the external Tilt Brush technique data used by Poly's prepared viewer path.

Icosa format labels cannot be trusted in isolation. Some records labelled `GLTF1` contain a glTF 2 document produced by Poly's updater. The document's `asset.version`, role, preferred-viewer flag, and root filename all need to be considered.

### Alignment requirement

Gallery Viewer should make rendition choice explicit and observable. Tests should record the exact root resource that loaded rather than only the database format label.

## Content classification

### Tilt Brush path

Tilt Brush content is identifiable from a combination of the Poly payload and file features:

1. The prepared Poly payload uses the Tilt content classification value seen as `[1]` in verified examples.
2. Legacy files use `GOOGLE_tilt_brush_techniques` at the document and material levels.
3. Scene extras contain `TB_*` environment, sky and fog fields.
4. The asset may include a `.tilt` source rendition.

No single filename or glTF version is sufficient to identify this path.

### Non-Tilt path

The non-Tilt classification includes at least these subgroups:

1. Conventional glTF 2 materials.
2. Legacy glTF 1 technique/shader materials.
3. Google Blocks exports and glTF 1-to-2 conversions of Blocks assets.
4. Assets with an explicit Poly hemisphere light or lighting rig.
5. Assets with no lighting metadata, for which Poly selects fallback lighting.

Blocks is a useful subgroup, not a top-level pipeline parallel to Tilt Brush. Some Blocks assets have a fully serialized Poly lighting rig while others use the same sparse/default payload shape as ordinary models.

## Material pipeline

### Tilt Brush materials

The original Tilt Brush glTF path does not use ordinary PBR interpretation for its brush meshes.

1. `GOOGLE_tilt_brush_techniques` supplies programs, shaders, techniques and material values.
2. Shader sources and textures were loaded from `www.tiltbrush.com/shaders/brushes/...`.
3. Technique state defines blending, depth testing and depth writing per brush.
4. Animated brush parameters such as scroll rate, jitter, waveform and displacement are uniforms, not standard glTF material properties.
5. Scene-light and ambient-light colours may be embedded as technique uniforms. Adding generic Three.js lights does not reproduce this behaviour and may have no effect on unlit or emissive brushes.
6. Additive and transparent brushes depend on the original blend and depth state. Treating them as ordinary transparent `MeshStandardMaterial` objects changes their appearance and ordering.

Fire Cat's archived glTF 2 file contains thirteen Tilt Brush technique programs and their associated external brush shaders. The preserved files also contain the original scene-light colours in material uniform values.

### Non-Tilt materials

Non-Tilt assets use their glTF material representation and Poly's general scene lighting.

1. A conventional glTF 2 model normally enters a PBR-like material path.
2. A glTF 1 asset may supply techniques and shaders that do not map exactly to modern `MeshStandardMaterial`.
3. A converted Blocks model can contain recognisable materials such as `BlocksPaper`, `BlocksGlass`, and `BlocksGem`.
4. Poly may add material-side view-dependent illumination or other shader behaviour that is not equivalent to adding more scene lights. The suspected rim-light contribution remains under investigation.

The Gallery Viewer alignment must preserve legacy technique materials where possible. Converting every non-Tilt material to a modern standard material and then tuning lights against thumbnails risks compensating for a material error with a lighting error.

## Environment, background and fog

### Tilt Brush environment

Verified Tilt Brush files can contain these scene extras:

1. `TB_Environment` and `TB_EnvironmentGuid`.
2. `TB_SkyColorA`, `TB_SkyColorB`, `TB_SkyColorHorizon`, and `TB_SkyColorZenith`.
3. `TB_SkyGradientDirection`.
4. `TB_FogColor` and `TB_FogDensity`.
5. `GOOGLE_camera_index` in some updated renditions.

Poly's Tilt path can draw the exported gradient over the clear/background colour. A solid clear colour alone is not an adequate reproduction. Ronin exposed this failure in the initial replay implementation.

### Non-Tilt background

Non-Tilt assets commonly receive a solid background from `GOOGLE_backgrounds.color` or the equivalent serialized hexadecimal value. The values are associated with the asset's colour-space mode; they must not be independently linearized without confirming how the renderer interprets them.

### Fog

Tilt fog is an exponential-density effect driven by the exported fog colour and density. Fog colour conversion must be considered together with renderer output encoding. Applying both an explicit sRGB-to-linear conversion and an output path that already assumes linear input can double-convert the colour.

## Lighting

### Tilt Brush lighting

Tilt Brush brush shaders can carry ambient and two scene-light colours as material uniforms. The important consequences are:

1. Lighting can be material-defined rather than supplied solely by Three.js light objects.
2. Emissive and additive brushes should not receive generic fallback lighting.
3. The exported environment and light values should take priority over Gallery Viewer's environment presets.
4. Any scene lights added for solid/PBR meshes inside a Tilt scene must be tested against brush materials rather than applied indiscriminately.

### Non-Tilt lighting inputs

The archived viewer payload can contain separate hemisphere-light and lighting-rig structures. Verified examples demonstrate several distinct cases:

| Asset | Class | Verified payload characteristic |
| --- | --- | --- |
| Apartment | Conventional non-Tilt | Solid background, sparse/default hemisphere and rig structures |
| Astronaut | Conventional non-Tilt | Same broad default-lighting family as Apartment |
| Couch | Blocks | No full explicit rig despite being a Blocks asset |
| Truck | Blocks | Explicit pivot, hemisphere settings and a populated lighting rig |
| Fire Cat | Tilt Brush | Empty Tilt-specific hemisphere/rig structures; brush techniques provide lighting behaviour |

This is why a single "Blocks multiplier" cannot be treated as the whole Poly lighting model.

### Working translation of Poly fallback lighting

The current calibration work produced this reconstructed non-Tilt recipe:

1. A warm key directional light with direction approximately `normalize(-1, 2, -1)` and an original intensity near `0.325`.
2. A warm camera-relative head light with an original base intensity near `0.25`.
3. A hemisphere light with a slightly blue-white sky colour and a ground colour derived from `GOOGLE_hemi_light.groundColor`, mixed substantially toward white.
4. A key-light shadow controlled by `GOOGLE_lighting_rig.disableShadows`.
5. Light placement and shadow bounds derived from the geometry centroid and radius.

These values are **reconstructed**, not yet a complete specification. Modern Three.js light units differ from the old renderer. Multiplying the old light intensities by `Math.PI` produced a close translation in the current renderer, but that conversion must be validated across the non-Tilt subgroups.

The exact head-light contribution for Blocks remains unresolved. Visual tests in the current reconstruction found several Blocks models already too bright at a zero head-light multiplier, which suggests that either another part of the material/lighting path is still wrong or the reconstructed head-light rule is being applied to the wrong subgroup.

### Shadows

The archived lighting rig includes a shadow-disable flag. The current reconstruction uses a shadow-casting key light and a non-shadow-casting head light. The precise original shadow-map size, bias, projection and receiver rules still need a focused code audit. Shadows should remain enabled during visual comparison because removing them changes the overall photometry, but shadow tuning is a separate alignment task.

## Colour pipeline and post-processing

### Core colour processing

Poly distinguishes at least `GAMMA` and `LINEAR` asset modes. This distinction is serialized into the viewer payload and changes renderer/material settings.

Core output transfer is not an optional visual effect. A gamma/output-encoding mismatch changes every material and background colour and cannot be approximated with a background-colour multiplier.

For alignment, Gallery Viewer needs one explicit colour pipeline per Poly colour mode:

1. Define the colour space assumed for texture samples and numeric material colours.
2. Define the working/render-target colour space.
3. Define the final display transfer exactly once.
4. Handle background and fog values in the same system.
5. Avoid applying a second gamma conversion in a screen-space pass.

Gallery Viewer currently always selects `THREE.SRGBColorSpace`; its existing `TODO linear/gamma selection` marks a known mismatch with Poly's per-asset behaviour.

### Optional screen-space effects

The archived Poly path includes low-strength film grain and vignette-like finishing. The calibration implementation uses an intermediate render target because these operations depend on screen coordinates and the already-rendered colour of each pixel. They cannot be reproduced by changing a scene background colour.

Human comparison found these effects to be secondary. They should be implemented after core colour, materials, lights and camera are correct.

### Rim or view-dependent material lighting

The current calibration includes a provisional view-dependent rim contribution on standard materials. This is a material-shader operation, not a full-screen post effect. Its exact relationship to Poly's original material code is unresolved and it should not yet be ported as a general Gallery Viewer rule.

## Scene transforms and scale

Poly presentation data can include:

1. A scene rotation quaternion.
2. A real-world scaling factor.
3. Geometry statistics including centroid, radius and visual centre.
4. Tilt Brush pose and exporter-specific coordinate transforms in the model file.

These values affect more than model placement. The centroid and radius can influence fallback light placement, shadow bounds and camera pivot selection. Lighting must remain model-relative when the content root is translated, rotated or scaled.

The exact precedence between server-side scene rotation, file-root transforms and real-world scaling remains to be documented from additional archived examples.

## Initial camera pose

### Presentation camera

The prepared Poly payload contains a 4x4 camera transform and a pivot/control structure. The transform is derived from the asset presentation camera, while the pivot can come from `GOOGLE_camera_settings.pivot`.

Important distinctions are:

1. Camera position and orientation define the initial view.
2. Pivot defines the centre of subsequent orbit interaction.
3. Geometry visual centre can be used when an explicit pivot is absent.
4. Some updated Tilt Brush glTF files contain `GOOGLE_camera_index` referring to an embedded camera node.
5. The selected rendition matters because not every rendition contains that camera index.

The initial-pose path must be tested independently from camera animation. A correct orbit mode can still orbit around the wrong pivot, and a correct pivot does not guarantee the initial camera transform is correct.

Wonder Woman (`6SvG7gtQ9xr`) remains the named camera-placement regression and should not be used as proof of lighting correctness until its precedence path is understood.

## Initial camera motion and interaction

The archived runtime contains this motion mapping:

| Metadata value | Poly motion implementation |
| --- | --- |
| `FULL_ROTATION` | Full orbit/rotation motion |
| `SIDE_TO_SIDE` | Side-to-side motion |
| `NONE` | No initial motion |
| `HOVER` | Special/null mapping requiring further behavioural verification |
| Missing or unknown | `FULL_ROTATION` fallback |

The fallback is explicit in the archived runtime: it looks up `GOOGLE_initial_camera_motion.motionPath` and uses full rotation when the lookup produces no value.

Fire Cat verifies the missing-value case:

1. All three original archived glTF renditions contain no `GOOGLE_initial_camera_motion` property.
2. The Icosa preferred glTF 1 is byte-identical to the archived glTF 1.
3. The updated Icosa mirror also lacks the property.
4. Fire Cat therefore orbits in the original Poly viewer because missing metadata means full rotation, not because the replay overrides an authored `NONE` value.

The initial camera motion is distinct from glTF model animation. Poly's handling of animation clips, autoplay, looping and interaction-triggered stopping still needs to be documented.

## Current Gallery Viewer alignment gaps

| Area | Current Gallery Viewer state | Required alignment work |
| --- | --- | --- |
| Rendition selection | Supports several formats, with Gallery-template fallback logic outside the core viewer | Make the selected rendition and actual loader observable in tests |
| Tilt materials | Loads custom brush materials for glTF 1 and glTF 2 paths | Compare blend, depth, uniforms and animation against original technique definitions |
| Non-Tilt materials | Primarily relies on Three.js loaders/materials | Preserve legacy technique behaviour and identify any Poly-specific material contribution |
| Content classification | Uses generator names, `isNewTiltExporter`, and `TB_*` keys | Align classification with Poly content semantics; do not infer solely from glTF version |
| Non-Tilt lighting | Contains a reconstructed Poly-like fallback rig | Replace broad heuristics with verified rig/default branches |
| Blocks lighting | Detects converted Blocks and changes the head-light multiplier | Establish which Blocks subgroup needs which Poly rule before retaining this branch |
| Tilt lighting | Builds scene lights from exported Open Brush metadata | Confirm which brushes use those lights and which already contain equivalent uniforms |
| Background and fog | Supports Tilt gradients, texture skies and fog | Validate colour-space handling against the matching Poly mode |
| Colour output | Always uses sRGB output | Implement Poly's asset-specific gamma/linear modes without double conversion |
| Camera pose | Merges API overrides, embedded metadata, geometry centre and defaults | Match Poly's precedence, coordinate conversion and pivot behaviour |
| Initial camera motion | No equivalent Poly motion-state mapping is documented in the viewer | Add explicit `FULL_ROTATION`, `SIDE_TO_SIDE`, `NONE`, `HOVER`, and missing-value behaviour if parity is desired |
| Post-processing | No production Poly finishing pass | Defer grain/vignette until core parity; keep it separable and optional |
| Shadows | Partial scene-light shadow handling | Reproduce rig enablement, bounds, bias and material participation after core light parity |

## Alignment order

Work should proceed in this order so later tuning does not conceal earlier errors:

1. Preserve and expose the exact input rendition and presentation metadata.
2. Classify Tilt Brush and non-Tilt content correctly, including non-Tilt subgroups.
3. Reproduce the original material path for each class.
4. Implement the correct gamma/linear colour pipeline.
5. Reproduce background, sky and fog in that colour pipeline.
6. Reproduce non-Tilt lighting branches without asset-specific exceptions.
7. Reproduce initial camera transform and pivot precedence.
8. Reproduce initial camera motion and interaction behaviour.
9. Reproduce shadows.
10. Add optional vignette, grain and any verified view-dependent material finishing.

## Core verification fixtures

The initial Poly-alignment suite should include:

| Asset | Reason |
| --- | --- |
| Fire Cat (`bNXEFtxQty2`) | Tilt Brush techniques, gradient/fog metadata, embedded camera index in one rendition, missing-motion fallback |
| Ronin (`fJ4uqrWr0Je`) | Tilt Brush gradient-background regression |
| Apartment (`01lqee-dZAr`) | Conventional non-Tilt default-lighting case |
| Astronaut (`dLHpzNdygsg`) | Second conventional non-Tilt case with visibly sensitive lighting |
| Couch (`7Q_Ab2HLll1`) | Blocks asset without Truck's full explicit rig |
| Truck (`fbDxapxkwY9`) | Blocks asset with explicit pivot, hemisphere settings and lighting rig |
| Wonder Woman (`6SvG7gtQ9xr`) | Camera-precedence regression; keep separate until fixed |

For migrated Poly assets, compare Gallery Viewer directly with the resurrected Poly viewer using the same model rendition and viewport. Use the thumbnail as a secondary reference. For non-Poly assets, the thumbnail or source application remains the available reference because there is no original Poly render.

## Unresolved questions

1. What does every numeric slot in Poly's serialized viewer-settings array control?
2. Which non-Tilt assets receive the default rig, and which receive an asset-specific rig?
3. Does the Blocks distinction originate in material shaders, lighting selection, exporter metadata, or a combination?
4. What is the exact old-to-current Three.js light-intensity conversion for every material family?
5. What are the precise shadow-map settings and mesh participation rules?
6. Is the reconstructed rim contribution present in Poly's material code, and for which materials?
7. How does Poly combine file cameras, presentation cameras, pivots, geometry visual centres and scene rotation?
8. What does the `HOVER` camera-motion mapping do at runtime?
9. When does user interaction cancel or pause initial camera motion?
10. How does Poly start, loop and stop glTF model animations?
11. Are grain and vignette enabled for every content class and colour mode?
12. How do image-based lights and `GOOGLE_lights_image_based` alter the non-Tilt pipeline?

## Evidence and tooling

Primary archived examples:

1. Fire Cat page: `https://web.archive.org/web/20210610100841id_/https://poly.google.com/view/bNXEFtxQty2/embed`.
2. Fire Cat updated glTF 2: `https://web.archive.org/web/20210619180126id_/https://poly.googleusercontent.com/downloads/c/fp/1619016959940393/bNXEFtxQty2/cKFOcjaLejT/sketch.gltf`.
3. Fire Cat glTF 1: `https://web.archive.org/web/20210619180113id_/https://poly.googleusercontent.com/downloads/c/fp/1619016959940393/bNXEFtxQty2/7TAaggIv1vs/sketch.gltf`.
4. Apartment page: `https://web.archive.org/web/20210610034113id_/https://poly.google.com/view/01lqee-dZAr/embed`.
5. The fixed replay runtime uses the archived Truck page at `https://poly.google.com/view/fbDxapxkwY9/embed` and replaces its bootstrap asset data with the selected asset's original payload.

Repository tools and related documents:

1. `scripts/poly-replay-server.cjs` reconstructs the archived viewer and injects original asset-specific presentation payloads.
2. `dist/comparison-side-by-side.html` compares production, current Gallery Viewer and Poly reference output.
3. `dist/poly-calibration.html` contains experiments used to translate old lighting and colour behaviour. Calibration-only code is not production specification.
4. `docs/CAMERA_POSITIONING.md` documents the current Gallery Viewer camera path.
5. `docs/BACKGROUND_ENVIRONMENT.md` documents the current Gallery Viewer background/environment path.
6. `ICOSA_GALLERY_VIEWER_UPDATE_PLAN.md` tracks production-update tests and known regressions.
