# Icosa Gallery Viewer Update Plan

This document tracks issues that should be resolved or explicitly accepted before updating Icosa Gallery with the current Gallery Viewer build.

## Test fixture matrix

Use a small core suite across several changes. Add a secondary fixture only when it exercises a distinct metadata path or makes a subtle change easier to see.

The live comparison selector extends this core suite to 46 fixed opt-in cases plus a live API catalog:

1. Three transform controls.
2. Five visually distinct non-Open Brush models.
3. Eight unrelated legacy glTF1 scenes.
4. Four unrelated legacy glTF2 scenes.
5. Ten UnityGLTF or newer-exporter scenes.
6. Sixteen legacy production assets loaded from the live Icosa API.
7. Up to 100 of the API's current highest-ranked glTF1-compatible assets, deduplicated against the fixed set and annotated with triangle counts. The known Wonder Woman camera-regression asset remains excluded until item 8 is resolved.

| ID | Content class | Fixture | Reference and reason for selection |
| --- | --- | --- | --- |
| F1 | Non-Open Brush glTF2 | `dist/formats/gltf2/robot_kit/model_(GLTFupdated).gltf` | Already listed in `dist/index_temp.html`; contains ordinary glTF scene lighting and provides a control against Open Brush-specific handling. Icosa asset `9L2Lt-sxzdp` supplies production metadata and a thumbnail. |
| F2 | Legacy Open Brush glTF1 | `dist/formats/gltf1/sketch.gltf` | Compact true glTF1 file with non-zero fog, a gradient, and an adjacent local `thumbnail.png`. Use as the routine legacy regression case. |
| F3 | Legacy Open Brush glTF1 reference | `dist/formats/gltf1/nighthawks/sketch.gltf` | Already listed in `dist/index_temp.html`; Icosa asset `5PXKoTF3X0p` supplies a known thumbnail. It is large, so reserve it for final human review rather than every iteration. |
| F4 | Legacy Open Brush glTF2 transform family | `dist/formats/gltf2/env-scale-test0.glb`, `env-scale-test1.glb`, and `env-scale-test2.glb` | Small files containing the same kind of scene with different non-identity root transforms. The split `dist/formats/gltf2/env-scale-test/env-scale-test.gltf` version is already listed in `dist/index_temp.html`. |
| F5 | Recent Open Brush exporter | `dist/formats/new_uploads/lighting_test.glb` | Newest local exporter found (`2.24.5`), with asymmetric light rotations, fog, gradient sky, and a non-identity sketch pose. This is the primary trusted new-exporter case. |
| F6 | Intermediate Open Brush exporter | `dist/formats/newglb/envtest/Untitled__15.glb` | Exporter `2.10.17`; uses the environment-preset path without explicit scene-light metadata. This separates preset handling from authored-light handling. |
| F7 | Early Open Brush UnityGLTF exporter | `dist/formats/new_uploads/red_shadow.glb` | Small exporter `2.0` scene, already listed in `dist/index_temp.html`, with deliberately visible shadow/lighting behavior and non-identity pose. |
| F8 | Named lighting regression | `dist/formats/new_uploads/irina_lighting_bug/irina_lighting_bug.gltf` | Already listed in `dist/index_temp.html`; adds an extreme pose and a historically identified lighting failure. Use when F7 exposes uncertainty rather than in every pass. |
| F9 | Dense legacy fog | `dist/formats/gltf1/jellyfish/sketch.gltf` | Compact true glTF1 scene with the highest useful fog density among the inspected local fixtures. Use to make color-space mistakes visually obvious. |
| F10 | Production metadata path | Icosa asset `0F3ek3idOaX` (`Island`) | Already listed remotely in `dist/index_temp.html`; has API presentation metadata, geometry data, and a thumbnail. Use it to verify the Django template path rather than as a replacement for controlled local fixtures. |

Reference URLs:

1. F1 thumbnail: `https://s3.us-east-005.backblazeb2.com/icosa-gallery/poly/9L2Lt-sxzdp/thumbnail.png`.
2. F3 thumbnail: `https://s3.us-east-005.backblazeb2.com/icosa-gallery/poly/5PXKoTF3X0p/thumbnail.png`.
3. F10 asset metadata: `https://api.icosa.gallery/v1/assets/0F3ek3idOaX`.
4. F10 thumbnail: `https://s3.us-east-005.backblazeb2.com/icosa-gallery/poly/0F3ek3idOaX/thumbnail.png`.

## Comparison protocol

1. Use `dist/comparison-side-by-side.html` to show the production and current-main bundles simultaneously in isolated frames with equal viewport sizes and shared fixture selection.
2. Run the final production checks through Icosa Gallery's `partials/viewer.html`, retaining the asset's preferred resource, `presentationParams`, `asset.camera`, background color, geometry data, and `loadEnvironment = true`.
3. Use Three.js `0.172.0` for both sides; this is the version used by both the normal Django template and `dist/index_temp.html`.
4. Do not move the camera or touch the lighting GUI between captures. Its callbacks replace light positions using a separate `+Z` calculation and therefore no longer represent the untouched viewer result.
5. Record which loader actually succeeded, because the Django template can retry a database `GLTF1` asset as glTF2 or vice versa.
6. Present a human reviewer with the source thumbnail, live production view, live current-main view, and relevant exporter/metadata fields together. Treat the thumbnail as directional ground truth, not a pixel-exact oracle.
7. Run local fixtures first. Use API-backed assets for production confirmation, camera/background validation, and thumbnail comparison.
8. Keep the large-scene scaling branch as a separate controlled test until an API asset with `geometry_data.stats.radius > 100000` is identified. Exercise it by supplying that metadata threshold to an existing transformed fixture; do not claim thumbnail validation for the synthetic override.
9. For live API cases, fetch the asset's current preferred Gallery format and reproduce the Django template's camera merge, background, geometry data, color-space default, loader choice, fallback, and `loadEnvironment = true`. Display the API thumbnail alongside both viewers.

## 1. Remove per-frame audio scene traversal

`tryStartAutoplayAudio()` currently traverses the complete scene during every render frame, including for files that contain no audio nodes. This makes audio support impose a recurring cost on all content.

Planned direction:

1. Track autoplay-capable audio objects when `KHR_audio_emitter` attachments are created or when content is loaded.
2. Attempt playback only when audio is unlocked, content changes, or a relevant audio object is added.
3. Avoid traversing the scene from the render loop.
4. Clear tracked audio objects when content is replaced or disposed.
5. Preserve browser autoplay handling through pointer and touch user gestures.

Acceptance criteria:

1. Scenes without audio perform no audio-related scene traversal per frame.
2. Autoplay audio starts after the first valid user gesture when browser policy initially blocks it.
3. Replacing content stops old audio and removes all references to its audio objects.
4. Multiple viewer instances do not act on one another's audio objects.
5. Existing non-audio loading and rendering behavior remains unchanged.

## 2. Validate directional-light rotation conversion

The current viewer converts Unity-style metadata and environment-preset rotations from left-handed `YXZ` coordinates into Three.js coordinates. Rotations from new exporters and explicit glTF scene-light nodes follow different paths.

Actions:

1. Compare F2, F4, F5, and F6; use F1 as the non-Open Brush control.
2. Compare matched live views with a fixed camera and exposure.
3. Confirm authored key-light directions against Open Brush or another trusted rendering reference.
4. Investigate any format-specific regression before approving the viewer update.

Acceptance criteria:

1. Light directions match the trusted reference for every rotation source.
2. No format requires an unexplained corrective rotation.

## 3. Validate the directional-light forward-axis change

Generated scene lights now derive their direction from local `-Z` instead of `+Z`. This is not gated by exporter or glTF version.

Actions:

1. Use F5 and F7 as the asymmetric authored-light cases, F4 as the legacy case, and F6 for fallback environment-preset lights.
2. Compare `+Z` and `-Z` behavior against the source application.
3. Check both generated metadata lights and fallback environment-preset lights.
4. Use F1 to confirm that non-Open Brush content does not acquire an Open Brush-specific regression.

Acceptance criteria:

1. `-Z` reproduces the authored direction for every supported source path.
2. Legacy content is not lit from the opposite side.

## 4. Validate new-exporter Euler ordering

The current viewer uses `YXZ` only when `scene.userData.isNewTiltExporter` is true and uses `XYZ` otherwise.

Actions:

1. Confirm how `isNewTiltExporter` is populated and that it is present on representative new exports.
2. Compare F5, F6, and F7 across exporter generations. F5 and F7 have non-zero X and Y rotations, which is sufficient to distinguish `YXZ` from `XYZ` even though their exported Z rotations are zero.
3. Verify with F4 that older exports remain on the intended `XYZ` path.
4. Use F8 if the early-exporter result is ambiguous.

Acceptance criteria:

1. New exports are reliably detected.
2. New and old exports reproduce their authored light directions without manual exceptions.

## 5. Validate model-relative directional-light targets

Generated directional lights now use explicit targets attached to the loaded model. This should keep lighting aligned with translated, rotated, or scaled content.

Actions:

1. Compare the F4 transform family as the primary test of root translation, rotation, and scale.
2. Use F7 and, if needed, F8 to cover new-exporter non-identity poses.
3. Use F1 as an ordinary non-Open Brush control.
4. Test the large-scene compensation path using the controlled metadata override described in the comparison protocol until a real API case is identified.
5. Confirm that replacing content removes the old lights and targets.

Acceptance criteria:

1. Model transforms do not change the intended model-relative lighting direction.
2. No stale light targets remain after content replacement.

## 6. Verify fog color-space conversion

Fog color is now converted from sRGB to linear before creating `FogExp2`. This is expected to change the appearance of fog-enabled scenes and should be easy to validate visually.

Actions:

1. Use F4 and F5 for light fog, F2 for medium legacy fog, F9 for dense fog, and F8 as the zero-density control.
2. Compare live side-by-side views using the same browser, Three.js version, camera, exposure, and background.
3. Compare the current output against the source application or another trusted reference.
4. Confirm that zero-density fog scenes remain visually unchanged.

Acceptance criteria:

1. Fog hue and brightness more closely match the trusted reference.
2. The conversion does not cause double-linearization.
3. Zero-density scenes remain unchanged.

## 7. Accept gradient color cloning as a bug fix

Gradient generation now clones its input colors before converting them to linear space. The first render should remain equivalent while repeated initialization no longer mutates and reconverts shared metadata colors.

Actions:

1. Treat the change as safe for the Icosa Gallery update.
2. Run a repeated-load check with F2 and F5 to confirm gradients remain stable across both legacy and recent-exporter scene reinitialization.

Acceptance criteria:

1. Repeated initialization produces the same gradient each time.
2. Caller-owned `THREE.Color` values remain unchanged.

## 8. Fix initial camera placement for Wonder Woman

Icosa asset `6SvG7gtQ9xr` (`Wonder Woman - Art of Wonder`) starts from an incorrect camera position in the production Gallery, the production bundle comparison, and the current-main bundle comparison. This is an existing production-path camera bug rather than evidence for or against the lighting and fog changes under review, so the asset is excluded from the current visual regression selector.

Reference URL: `https://icosa.gallery/view/6SvG7gtQ9xr`.

Actions:

1. Record the asset's preferred format, `presentationParams.camera`, top-level `asset.camera`, `GOOGLE_camera_settings.pivot`, geometry visual center, embedded camera, and Open Brush camera metadata.
2. Trace which position, rotation, and target inputs win in `initCameras()`.
3. Compare the intended composition against the authoritative asset thumbnail.
4. Fix the general camera-selection or target calculation rather than adding an asset-specific exception.
5. Re-add the asset to the regression selector after the initial view is correct.

Acceptance criteria:

1. The initial Gallery view presents the intended composition without manual framing.
2. Other API assets using each affected camera metadata path retain their existing correct framing.
3. The result is consistent in both flat and XR camera initialization where the paths overlap.
