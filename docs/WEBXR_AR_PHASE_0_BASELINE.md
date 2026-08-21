# WebXR AR Phase 0 Compatibility Baseline

## Status

Phase 0 is in progress. This document records verified compatibility facts and unresolved decisions. The Phase 0 resolver is diagnostic and does not yet control camera, scale, navigation, or AR placement behaviour.

## Current Gallery-to-viewer contract

The current Icosa Gallery viewer template reads `asset.presentation_params` and the separate `asset.camera` field. It constructs the viewer overrides as follows:

| Viewer field | Gallery source and precedence |
| --- | --- |
| `defaultBackgroundColor` | `presentationParams.backgroundColor` |
| `camera` | `presentationParams.camera`, shallowly overlaid by `asset.camera` |
| `geometryData` | `presentationParams.geometry_data`, then `presentationParams.GOOGLE_geometry_data` |
| `colorSpace` | `presentationParams.colorSpace`, then `LINEAR` |

The complete `presentationParams` dictionary is not currently passed to the viewer. The viewer now accepts it additively as `overrides.presentationParams`; the Gallery caller can begin passing it without removing or changing any existing normalized fields.

## Verified existing metadata

### Camera and navigation

1. `presentationParams.camera` contains translation, rotation, perspective, type, and sometimes `GOOGLE_camera_settings`.
2. The separate top-level `asset.camera` is the current Gallery override and must continue to win after the shallow merge.
3. `GOOGLE_camera_settings.pivot` is already used by the viewer as the orbit target.
4. `GOOGLE_camera_settings.mode` is present in production data but is currently ignored by the viewer.
5. `movableOrbit` has been observed as a production camera mode. The diagnostic resolver maps `movableOrbit` and `orbit` to the existing broad `orbit` category.
6. Embedded `TB_FlyMode` remains the camera-control signal currently applied by the viewer.
7. The resolver reports conflicts between a recognized camera mode and embedded `TB_FlyMode`, but it does not change which controls the viewer currently creates.
8. `GOOGLE_initial_camera_motion.motionPath` is separate from camera-control mode. It describes initial camera motion and must not be treated as a fly-versus-orbit preference without further evidence.

### Geometry and scale

1. Both `geometry_data` and `GOOGLE_geometry_data` exist and must remain accepted.
2. Geometry statistics include fields such as centroid, standard deviation, and radius.
3. Geometry radius and bounds are descriptive. They do not establish whether an asset is an environment, diorama, or prop.
4. Embedded `TB_PoseScale` is an exporter or pose-normalization transform and must not be repurposed as intended AR display scale.
5. The documented Poly real-world scale field has been identified as `presentationParams.GOOGLE_real_world_transform.scaling_factor`.
6. Production values of both `0` and `1` have been observed. The exact meaning of `0`, the unit convention, and whether the field represents a transform, enablement state, or display-scale recommendation remain unresolved.
7. The resolver exposes `GOOGLE_real_world_transform.scaling_factor` as an observation only. It is not applied to content.
8. The existing emergency scale correction for geometry radius greater than `100000` remains separate from intended presentation scale.

### Other presentation state

1. `backgroundColor`, `colorSpace`, `GOOGLE_scene_rotation`, lighting metadata, and background metadata are existing presentation fields.
2. Hiding an authored background for alpha-blended AR must preserve the original value for session restoration.
3. Scene rotation and real-world transforms require a documented precedence relative to file-root and `TB_Pose*` transforms before AR placement uses them.

## Diagnostic resolver

`src/metadata/PresentationMetadata.ts` now provides:

1. Typed interfaces for the current normalized overrides.
2. Typed interfaces for known camera, geometry, real-world transform, and embedded metadata.
3. A pure resolver that does not mutate its inputs.
4. Source attribution for camera, geometry, background, colour space, post-processing, navigation, and observed scale values.
5. Preservation of explicit false and zero values.
6. Diagnostics for unknown camera modes and conflicting navigation suggestions.
7. Support for both the current flattened input and an additive complete `presentationParams` object.

The viewer exposes the result as `viewer.resolvedPresentationMetadata` after asset metadata is initialized. This property is diagnostic during Phase 0.

## Regression fixtures

The fixture set currently covers:

1. Current flattened Gallery overrides.
2. Full `presentationParams` plus a higher-precedence camera override.
3. Both geometry-data spellings.
4. Embedded fly and explicit embedded orbit suggestions.
5. An explicit runtime navigation override.
6. Conflicting camera and embedded navigation metadata.
7. Unknown camera modes.
8. `movableOrbit` and the observed Poly real-world transform field.

## Three.js deployment baseline

The repository currently develops against Three.js `0.185.x`. The inspected Gallery template uses different import-map versions for its deployment channels:

| Gallery channel | Inspected Three.js version |
| --- | --- |
| Default | `0.172.0` |
| Experimental | `0.180.0` |
| Previous | `0.164.0` |

The baseline decision is to target the latest available Three.js release. At the time of the decision, the latest package versions are `three` `0.185.1` and `@types/three` `0.185.4`, which are already installed and declared by this repository. No package update is required here.

Before Phase 1 reuses current `ARButton`, `XRPlanes`, `XREstimatedLight`, or newer `WebXRManager` features, Gallery deployment import maps must be upgraded to the same `0.185` runtime line. Current addons must not be mixed with the older Gallery runtimes.

## Remaining Phase 0 work

1. Expand the production inventory of `GOOGLE_camera_settings.mode` beyond the observed `movableOrbit` value.
2. Establish the exact semantics and precedence of `GOOGLE_real_world_transform.scaling_factor`, including the meaning of zero.
3. Establish precedence for `GOOGLE_scene_rotation`, file-root transforms, and `TB_Pose*` normalization.
4. Add representative real-asset metadata fixtures for large Open Brush scenes, small props, dioramas, legacy Poly models, and conflicting metadata.
5. Coordinate the Gallery import-map upgrade to the `0.185` runtime line before Phase 1 integration testing.
6. Agree on whether the Gallery should pass the complete `presentationParams` dictionary in addition to its existing normalized fields.
7. Confirm whether `navigationMode` should become a supported host override name or remain internal until the Phase 1 public API is designed.
