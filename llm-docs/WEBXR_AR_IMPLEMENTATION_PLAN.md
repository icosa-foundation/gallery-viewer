# WebXR AR Implementation Plan

## Status and purpose

This document is the living implementation plan for substantial WebXR AR support in Icosa Viewer. It records completed foundations, deliberately deferred work, and the remaining sequence as of 30 August 2026. Phases are not treated as strict barriers: narrowly scoped foundations from a later phase may be pulled forward when they preserve the architectural boundaries defined here.

The plan deliberately separates five concerns that must not be inferred from one another:

1. The XR presentation environment, such as opaque, additive, or alpha-blended display.
2. The available device capabilities, such as tracked controllers, hands, gaze, transient screen input, hit testing, planes, anchors, or depth.
3. The asset's intended presentation, such as a traversable environment, diorama, reusable prop, or an asset whose intent is unknown.
4. The preferred navigation model, such as fly, orbit, physical movement, or object manipulation.
5. User and host-application overrides, which must remain authoritative over asset suggestions.

The implementation must support handheld AR, standalone and tethered passthrough headsets, optical see-through smart glasses, desktop-connected AR hardware, and future WebXR devices without detecting behaviour from a device name or assuming that AR means mobile.

## Goals

1. Make AR a first-class viewer mode rather than treating it as VR with a different session name.
2. Preserve the intended scale and navigation semantics of both large traversable scenes and small reusable objects.
3. Maintain backwards compatibility with current Gallery presentation metadata, Google Poly metadata, embedded Tilt/Open Brush metadata, and existing viewer load calls.
4. Use capability detection and host configuration rather than phone-versus-headset assumptions.
5. Reuse Three.js WebXR support and official examples where they provide reliable low-level mechanisms.
6. Avoid requiring a new runtime framework for the initial implementation.
7. Allow advanced capabilities to degrade independently so that failure or absence of anchors, planes, lighting estimation, depth, hands, or DOM overlay does not prevent a basic AR session.

## Non-goals

1. This plan does not make WebXR feature support consistent across browsers or devices.
2. It does not define a universal automatic classifier that can reliably distinguish an environment, diorama, and prop from geometry bounds alone.
3. It does not replace the existing asset metadata schema with a new incompatible schema.
4. It does not require depth occlusion, persistent anchors, hand tracking, or lighting estimation for the first usable release.
5. It does not make desktop `camera-controls` operate directly on the device-controlled XR camera.
6. It does not introduce asset-specific exceptions to compensate for incorrect general scale, transform, or camera precedence.

## Existing compatibility contract

The viewer currently receives a normalized load-time `overrides` object constructed by Icosa Gallery. The Gallery combines `presentationParams.camera` with the separate top-level `asset.camera`, with `asset.camera` taking precedence. It currently passes the following normalized values:

| Viewer override | Existing source |
| --- | --- |
| `defaultBackgroundColor` | `presentationParams.backgroundColor` |
| `camera` | `{ ...presentationParams.camera, ...asset.camera }` |
| `geometryData` | `presentationParams.geometry_data` or `presentationParams.GOOGLE_geometry_data` |
| `colorSpace` | `presentationParams.colorSpace` or `LINEAR` |

The viewer also consumes embedded model metadata, including:

1. `TB_FlyMode`.
2. `TB_CameraTranslation`, `TB_CameraRotation`, and `TB_CameraTargetDistance`.
3. `TB_PoseTranslation`, `TB_PoseRotation`, and `TB_PoseScale`.
4. `GOOGLE_camera_index`.
5. `GOOGLE_camera_settings`, currently including use of `pivot` from the merged camera override.
6. `GOOGLE_geometry_data`, including geometry statistics and visual centre information.
7. `GOOGLE_initial_camera_motion`, where present in legacy content, although the current viewer does not yet consume it.
8. Tilt/Open Brush environment, background, fog, reflection, and lighting metadata.

The following compatibility rules apply to every phase:

1. Existing fields retain their current meanings. In particular, `TB_PoseScale` remains an exporter or pose transform and must not become an AR display-scale preference.
2. Geometry radius and bounds remain descriptive data. They must not be treated as proof that an asset is a scene, diorama, or prop.
3. Existing load methods continue accepting the current `overrides` object.
4. Missing new metadata preserves the legacy behaviour selected by existing metadata and fallbacks.
5. `asset.camera` remains authoritative over `presentationParams.camera` after merging.
6. New XR metadata, if adopted, is additive and optional.
7. User and host overrides take precedence over asset suggestions.
8. Desktop and VR rendering must be regression-tested whenever shared scene, camera, renderer, content-root, or metadata code changes.

## Proposed internal architecture

The implementation should introduce internal typed state without requiring callers to migrate immediately.

### XR session state

```ts
type GalleryViewMode = 'desktop' | 'vr' | 'ar';

type GalleryEnvironmentBlendMode =
    | 'opaque'
    | 'additive'
    | 'alpha-blend'
    | 'unknown';
```

The active mode must be derived from the requested or active session, not solely from `renderer.xr.isPresenting`.

### Capability snapshot

```ts
interface GalleryXRCapabilities {
    environmentBlendMode: GalleryEnvironmentBlendMode;
    input: {
        transientPointer: boolean;
        trackedPointer: boolean;
        gaze: boolean;
        hands: boolean;
        gamepad: boolean;
        mouseKeyboard: boolean;
    };
    world: {
        hitTest: boolean;
        anchors: boolean;
        persistentAnchors: boolean;
        planes: boolean;
        meshes: boolean;
        depth: boolean;
        lightingEstimation: boolean;
    };
    ui: {
        domOverlay: boolean;
        spatialUI: boolean;
    };
}
```

This is a runtime snapshot, not stored asset metadata. Capabilities may change when input sources connect or disconnect.

### Resolved asset presentation

```ts
type GalleryAssetPresentationIntent =
    | 'environment'
    | 'diorama'
    | 'prop'
    | 'unknown';

type GalleryNavigationMode =
    | 'fly'
    | 'orbit'
    | 'physical'
    | 'object-manipulation';

type GalleryScalePolicy =
    | 'authored'
    | 'real-world'
    | 'fit-volume'
    | 'user-defined';

interface GalleryResolvedPresentation {
    intent: GalleryAssetPresentationIntent;
    preferredNavigation: GalleryNavigationMode;
    scalePolicy: GalleryScalePolicy;
    placementPolicy:
        | 'enter-at-viewpoint'
        | 'place-on-surface'
        | 'place-in-front'
        | 'restore-anchor';
    source: {
        intent: string;
        navigation: string;
        scale: string;
        placement: string;
    };
}
```

The `source` information is required for diagnostics and tests. A resolved value must be traceable to an explicit runtime override, optional XR metadata, existing camera metadata, embedded Tilt metadata, or a named fallback.

### Transform separation

The scene graph must keep these operations conceptually separate:

1. Import and exporter normalization transforms.
2. Authored scene and presentation transforms.
3. AR placement transform.
4. User manipulation transform.
5. The tracked XR camera and reference space.
6. Optional artificial navigation rig movement.

The tracked camera or XR reference space must never be scaled to fit content. Content scaling and placement belong on a content-side group. This separation should be explicit even if the initial implementation combines some content transforms into one group.

## Three.js and WebXR reuse strategy

| Capability | Source to reuse | Viewer-specific work |
| --- | --- | --- |
| AR session entry | Three.js `ARButton` or its implementation pattern | Icosa styling, combined AR/VR presentation, error reporting, host configuration |
| Session and camera integration | Three.js `WebXRManager` | Mode state, cleanup, event contract, content transforms |
| Hit testing and reticle | Official Three.js `webxr_ar_hittest` example | Placement strategies, artwork transform, tracking states |
| Plane detection | Three.js `XRPlanes` and official example | Plane filtering, visualization, placement policy |
| Lighting estimation | Three.js `XREstimatedLight` and official example | Precedence with authored Open Brush and presentation lighting |
| Controller models | Existing `XRControllerModelFactory` use | Mode-aware visibility and interaction mapping |
| Depth access | Three.js `WebXRManager` depth APIs | Material integration, occlusion quality, fallbacks |
| DOM overlay | WebXR DOM Overlay and Three.js `ARButton` setup | Icosa overlay, safe layout, input suppression, instructions |
| Anchors | Native WebXR Anchors API and Immersive Web samples | Anchor ownership, pose updates, persistence, recovery |
| Scale and presentation intent | Existing metadata plus Three.js bounds and transforms | Resolution rules, defaults, user controls |
| Manipulation gestures | Browser pointer events and Three.js transforms | Gesture recognition and device-independent action mapping |

No new runtime library is required for the initial phases. Any later dependency proposal must identify a capability that cannot be maintained reasonably with Three.js and browser APIs.

## Phase 0: Compatibility baseline and metadata normalization

### Objective

Establish a tested compatibility boundary before changing XR behaviour.

### Implementation status: substantially implemented, with integration research remaining

Completed:

1. Existing presentation, camera, geometry, navigation, and real-world-transform metadata have typed representations without breaking the existing load API.
2. A pure presentation metadata resolver records source precedence while preserving distinctions between missing values and explicit `false`, zero, empty, or fallback values.
3. Regression fixtures cover flattened overrides, nested `presentationParams`, legacy spellings, conflicting sources, navigation precedence, and scale observations.
4. The project and its pinned rendering dependencies now target the current Three.js `0.185` compatibility line.

Remaining:

1. Complete the representative production-asset inventory across Icosa Gallery, migrated Poly, Tilt Brush, Open Brush, Blocks, general glTF, splat, and IMM inputs.
2. Establish authoritative semantics for `GOOGLE_real_world_transform.scaling_factor`, especially zero and missing values, before it can influence actual-size presentation.
3. Coordinate how the complete existing `presentationParams` object reaches the viewer in deployed Gallery integrations while retaining current flattened overrides.

### Work

1. Define TypeScript interfaces for the existing load-time override shape without changing the public method signatures yet.
2. Define typed representations for the existing camera, geometry, background, colour-space, post-processing, and relevant embedded metadata fields.
3. Introduce a pure metadata-normalization and precedence function that produces diagnostic resolved values while preserving current behaviour.
4. Record whether preferred navigation came from an explicit runtime override, `camera.GOOGLE_camera_settings.mode`, `TB_FlyMode`, or fallback.
5. Preserve the distinction between missing values and explicit values such as `false`, `NONE`, zero, or an empty pivot.
6. Inventory actual values used by representative Icosa Gallery, migrated Poly, Tilt Brush, Open Brush, Blocks, general glTF, splat, and IMM assets.
7. Identify the exact existing field, if any, corresponding to the documented Poly real-world scaling factor and establish its semantics before using it.
8. Add fixtures for both `geometry_data` and `GOOGLE_geometry_data` spellings.
9. Add fixtures showing the merge precedence between `presentationParams.camera` and top-level `asset.camera`.
10. Update the Gallery integration design so it can additionally pass the complete `presentationParams` object while retaining every existing normalized override.
11. Establish a Three.js version compatibility decision. The package currently targets Three.js 0.185, while deployed Gallery import maps may use older versions. AR addon reuse must not silently depend on a newer runtime than the deployed bundle supplies.

### Representative fixture categories

1. A large Open Brush sketch with `TB_FlyMode=true` and an authored camera.
2. An orbit-oriented small prop with a meaningful pivot and known physical dimensions.
3. A diorama whose large source bounds do not imply full-scale presentation.
4. A legacy Poly asset with `GOOGLE_camera_settings` and geometry statistics.
5. An asset with an all-zero pivot that should be treated according to current compatibility behaviour.
6. An asset with no presentation or camera metadata.
7. An asset with conflicting embedded and load-time camera metadata.
8. A new-exporter Open Brush asset using the current 0.1 scale correction.
9. A legacy Tilt exporter asset using `TB_Pose*` normalization.
10. A very large asset that currently triggers the emergency `radius > 100000` scale protection.

### Acceptance criteria

1. Existing desktop camera, pivot, scale, background, lighting, and control-mode behaviour remains unchanged for the fixture set.
2. Every resolved presentation value reports its source.
3. No existing field has been repurposed.
4. The normalization code can consume both the current flattened override object and the same object with an additional full `presentationParams` property.
5. Tests prove that absence of new XR metadata follows the existing path.
6. The deployment-compatible Three.js feature baseline is documented.

### Exit gate

Do not start content auto-scaling or placement until the existing scale fields and camera-control fields have documented precedence and regression coverage.

## Phase 1: Explicit XR modes, session lifecycle, and capability discovery

### Objective

Replace the current shared AR/VR presentation branch with an explicit, observable session foundation without yet changing asset placement.

### Implementation status: partially implemented

Completed:

1. The viewer distinguishes desktop, VR, and AR presentation state and prevents VR locomotion policy from running merely because an AR session is presenting.
2. XR button lifecycle callbacks provide the viewer with session start and end boundaries while preserving the existing combined host control.
3. The active session's environment blend mode is normalized for presentation policy.
4. AR optional session features can be requested without making unsupported hit testing fatal to basic AR entry.
5. Scene and transform state needed by later AR phases is captured and restored idempotently by the implemented presentation lifecycle.

Remaining:

1. Finalize independent host configuration for enabling AR and VR and supplying required and optional session features.
2. Add a live, public capability snapshot for changing input sources and optional world-understanding features.
3. Add stable host events for mode, capability, error, visibility, and unexpected session-end changes.
4. Complete visible unsupported, insecure-context, permission, startup, and request-failure states without relying on browser-specific detection.
5. Confirm existing VR controller rendering and locomotion on physical hardware after the shared lifecycle changes.

### Work

1. Add explicit `desktop`, `vr`, and `ar` mode state.
2. Separate AR and VR session initialization while allowing a combined host UI.
3. Replace, wrap, or refactor `IcosaXRButton` using the Three.js `ARButton` and `VRButton` implementation patterns.
4. Allow the host to enable AR and VR independently and supply required and optional session features.
5. Add visible states for unsupported WebXR, unsupported AR, insecure context, permission denial, request failure, session startup, and active session.
6. Add `sessionstart`, `sessionend`, and visibility lifecycle handling.
7. Capture `environmentBlendMode` from the active session.
8. Inspect `XRInputSource` values and maintain a live input-capability snapshot without assuming a particular device type.
9. Discover optional world-understanding capabilities individually.
10. Add viewer events for XR mode changes, capability changes, session errors, and session end.
11. Snapshot all scene state that later AR presentation phases may temporarily modify.
12. Ensure cleanup is idempotent when startup partially fails or the browser ends the session unexpectedly.
13. Preserve existing VR behaviour during this structural phase.

### Public API direction

The exact API should be finalized during phase discussion, but it should support an additive shape similar to:

```ts
interface GalleryXROptions {
    allowAR?: boolean;
    allowVR?: boolean;
    arSessionInit?: XRSessionInit;
    vrSessionInit?: XRSessionInit;
}
```

Existing constructor and load calls must remain valid when these options are absent.

### Acceptance criteria

1. Starting AR produces `mode === 'ar'`; starting VR produces `mode === 'vr'`.
2. AR and VR do not inherit behaviour merely because both are presenting.
3. Input capability changes are observable when controllers or hands connect and disconnect.
4. Session failures are visible to the user and available to the host application.
5. Session end restores the desktop state and leaves no stale session references.
6. Existing VR controller rendering and locomotion behave as before unless explicitly disabled by configuration.

### Exit gate

Do not add device-specific interaction based on user-agent strings. All later input routing must consume the capability snapshot and host configuration.

## Phase 2: Environment-aware rendering and XR-safe transforms

### Objective

Make loaded content render correctly in different AR display environments while preserving physical tracking and existing authored transforms.

### Implementation status: foundation implemented; physical-device and additive-display work remains

Implemented in the initial Phase 2 slice:

1. Alpha-capable renderer creation with opaque desktop and VR clear-alpha preservation.
2. Explicit desktop, VR, and AR render-path identity sufficient to prevent VR locomotion from running in AR.
3. `environmentBlendMode` normalization and separate policies for opaque versus passthrough/additive displays.
4. Reversible suppression of scene background, authored sky geometry, and fog while retaining environment lighting.
5. A presentation root above importer-normalized content, with first-frame content placement computed as tracked viewer pose multiplied by the inverse authored camera pose.
6. A rigid, unit-scale AR camera rig; IMM authored viewpoints move presentation content in AR rather than the tracked camera hierarchy.
7. Bounds-aware XR far clipping configured through Three.js camera depth limits without replacing device projection matrices.
8. Exact restoration helpers and regression tests for blend policy, virtual-environment restoration, and entry-transform math.
9. Chrome regression coverage for desktop and VR opacity, alpha/additive/opaque policies, first-frame placement, exact state restoration, and asset reload during AR.

Still required before Phase 2 is considered complete:

1. Manual physical-device checks across alpha-blend, additive, and opaque hardware. An automated device-validation harness is explicitly deferred at this stage to avoid disproportionate test infrastructure work.
2. Additive-display contrast policy beyond removal of opaque backgrounds, without destructively rewriting authored materials.
3. Full screenshot comparison coverage for session exit and asset reload on real WebXR sessions is deferred until the manual test findings justify the automation cost.

### Work

1. Create the renderer with an alpha-capable context, with desktop and VR regression tests.
2. Apply presentation rules based on `environmentBlendMode` rather than on AR alone.
3. For `alpha-blend`, suppress opaque scene backgrounds and selectively hide authored sky geometry and fog while preserving their state for restoration.
4. For `additive`, introduce contrast-aware defaults and avoid assuming that black behaves as an opaque background.
5. For `opaque`, retain appropriate scene presentation unless explicitly overridden by the host.
6. Keep environment lighting and visual background decisions separate. Hiding a sky must not automatically discard every reflection or lighting contribution.
7. Stop copying the desktop authored camera pose directly into the tracked AR camera rig.
8. Add a content-side placement root that can reproduce an authored entry view by transforming content relative to the tracked user.
9. Keep importer normalization, authored transforms, AR placement, and user manipulation logically separate.
10. Ensure the XR camera rig always has unit scale.
11. Add near/far clipping policy suitable for both small props and large environments without changing the device projection matrix incorrectly.
12. Restore background, sky, fog, environment, camera, and content transforms exactly when AR ends.

### Asset-scale rules introduced in this phase

1. Preserve authored scale by default after known exporter normalization.
2. Do not automatically fit every asset into a tabletop volume.
3. Do not automatically enlarge small assets to a standard display size.
4. Treat `TB_PoseScale` as importer normalization only.
5. Treat geometry radius and bounds as descriptive inputs, not presentation intent.
6. Use an authored camera or entry viewpoint to position a full scene around the user, not to reposition the tracked head pose.
7. Permit an emergency numerical-protection scale only where the existing viewer already requires it, and report when it occurs.

### Acceptance criteria

1. Alpha-blended AR exposes the real-world camera feed without authored sky or background obscuring it.
2. Additive and opaque sessions do not receive alpha-blended assumptions.
3. Entering AR does not inherit a desktop camera offset as physical head position.
4. A large scene retains traversable scale.
5. A correctly authored small prop retains its small physical size.
6. Ending AR restores a pixel-equivalent desktop presentation for the regression fixtures.
7. The camera rig and XR reference space are never scaled to fit content.

### Exit gate

Do not add automatic `fit-volume` presentation until explicit presentation intent or a user choice exists. Bounds alone are not sufficient.

## Phase 3: Presentation intent, placement strategies, and scale controls

### Objective

Support environments, dioramas, props, and unknown assets through explicit strategies rather than a single AR placement flow.

### Implementation status: placement and scale foundation implemented; strategy coverage remains incomplete

1. The scene hierarchy now separates the AR authored-entry transform, session-local user placement, importer normalization, and asset-authored transforms.
2. AR session restoration snapshots the entry and user-placement layers independently.
3. Loading another asset resets session-local user placement without changing importer normalization or introducing an asset classification.
4. Browser regression coverage verifies hierarchy, transform isolation, placement reset, asset reload, and exact session restoration.
5. Placement sources can now submit a world-space matrix through one internal operation, with local conversion, snapshot, restore, and reset isolated to the user-placement layer.
6. The initial transform foundation introduced no placement UI, hit testing, public placement configuration, or metadata schema.
7. AR sessions now request hit testing as an optional capability, so unsupported devices can still start a basic AR session.
8. A reusable viewer-space hit-test service owns source creation, per-frame pose updates, tracking-state transitions, and race-safe cancellation on session end.
9. Valid hit poses are retained as world-space placement candidates and can be committed through the existing user-placement operation without changing importer or authored transforms.
10. A persistent scene-level reticle adapts the official Three.js ring geometry and hit-pose pattern, showing valid targets and a distinct lost-tracking state without inheriting asset transforms.
11. Session-local runtime placement defaults to authored entry mode; surface placement must be selected explicitly, so unknown and large assets are not silently moved onto detected surfaces.
12. WebXR `select` events route through one semantic confirmation operation for transient screen, tracked-pointer, gaze, and other select-capable input sources without user-agent or phone detection.
13. Confirmation applies the current world-space candidate to the user-placement root and briefly locks the reticle for feedback without changing importer or authored transforms.
14. A separate user-manipulation root now isolates session-local scale from AR entry, world placement, importer normalization, and asset-authored transforms.
15. Authored scale remains the default. Explicit fit-volume actions derive a uniform multiplier from descriptive asset bounds and a user-selected target diameter; user-defined multipliers are also supported.
16. Actual-size selection remains unavailable when reliable source units are unknown. Bounds are not relabeled as proof of real-world units.

Remaining before Phase 3 is complete:

1. Formalize the internal resolved-presentation policy boundary so placement strategies do not consume raw metadata or host inputs directly.
2. Add floor, table, wall, and unrestricted placement policies where the runtime exposes sufficient hit-test or plane information.
3. Add controller-ray, gaze, fixed or host-provided transform, and capability-light place-in-front strategies.
4. Add reliable actual-size and physical-dimension presentation only after source-unit semantics are established.
5. Add an explicit reset operation that returns placement and scale to the resolved session default.
6. Decide whether and how placement and scale overrides persist beyond the current page controls without introducing schema commitments.
7. Evaluate the interaction on representative props, dioramas, unknown assets, and traversable scenes across handheld, headset, smart-glass, and desktop-connected AR hardware.

### Schema decision: deferred

Phase 3 will not add XR presentation fields to the asset metadata schema. Presentation intent has substantial UX and cross-repository consequences, so field names and allowed values must not become public API before the interaction model has been evaluated manually.

The viewer may use an internal resolved-presentation policy, but that object is an implementation boundary rather than an exported metadata contract. Placement and scale code must consume the resolved policy without depending on where its values came from. A future metadata adapter can populate that policy after Icosa Gallery, editor, exporter, viewer, and client-library semantics have been coordinated.

Consequences of this deferral:

1. Asset authors cannot yet persist an XR presentation preference that travels between applications.
2. User placement and scale choices remain local to the active asset and session unless a host stores them separately.
3. Bounds and navigation metadata remain descriptive or advisory and must not silently classify an asset as an environment, diorama, or prop.
4. Ambiguous assets preserve authored scale and expose a user choice or conservative fallback.
5. Temporary host inputs, if required for integration work, remain explicitly experimental and must not be presented as stable schema.

### Resolution precedence

1. Explicit user choice for the active viewing session.
2. Explicit experimental host runtime configuration, where an integration requires it.
3. Existing metadata used only within its established meaning, such as reliable units or an authored entry camera.
4. Recognized camera-mode metadata as a navigation suggestion, never as an automatic scale or asset-intent classification.
5. A conservative fallback that preserves scale and exposes the ambiguity to the user.

### Placement strategies

1. `enter-at-viewpoint` for traversable environments.
2. `place-on-surface` for props and dioramas where hit testing is available.
3. Controller-ray placement for tracked-pointer devices.
4. Gaze placement for gaze-capable devices.
5. `place-in-front` as a capability-light fallback.
6. Fixed or host-provided world transform for installations and desktop-connected AR.
7. Restored anchor placement when later anchor support is available.

### Work

1. Define an internal resolved-presentation policy and placement state that do not expose or imply a stable metadata schema.
2. Keep importer normalization, authored transforms, AR placement, user manipulation, and navigation state separate.
3. Adapt the official Three.js hit-test example into a reusable placement service.
4. Add a reticle whose appearance indicates tracking, valid placement, invalid placement, and locked placement.
5. Support floor, table, wall, or unrestricted hit-test policies where device support permits.
6. Apply placement to the content-side placement root.
7. Add authored, reliable-real-world, fit-volume, and user-defined scale operations. `fit-volume` requires an explicit user action.
8. Add actual-size, view-as-diorama, and enter-scene actions without permanently classifying the asset.
9. Show calculated physical dimensions before or during placement when reliable unit information is available.
10. Preserve the user's scale and placement override for the active asset and session.
11. Add a reset operation that returns to the resolved session default rather than a universal tabletop state.
12. Ensure placement-source loss does not delete or unexpectedly move already placed content.
13. Evaluate the placement and scale UX manually before proposing fields to other repositories.
14. Treat metadata schema design and cross-repository adoption as a later, separately approved integration step.

### Acceptance criteria

1. An environment can open around the user at authored scale and an authored or calculated entry pose.
2. A prop can be placed on a surface at authored real-world scale.
3. A diorama can be fitted into a user-visible volume without changing the underlying importer scale.
4. An unknown asset presents a clear choice rather than silently applying a destructive scale guess.
5. Placement works through at least hit-test selection and controller-ray selection where supported.
6. User overrides can switch navigation and presentation independently.
7. Phase 3 introduces no new persistent asset metadata fields or implicit schema commitments.
8. Placement strategies can later receive metadata-derived policy through one adapter without changing their transform logic.

## Phase 4: Device-independent input actions and user interface

### Objective

Provide consistent viewer actions through different input and UI mechanisms without equating AR with touch input.

### Implementation status: one placement action pulled forward; broader phase not started

WebXR `select` currently invokes the same semantic placement-confirmation operation for transient-screen, tracked-pointer, gaze, and other select-capable sources exposed through the controller abstraction. This is a narrow foundation, not the full action router. Cancel, reset, selection, manipulation, navigation, input-source capability changes, DOM-overlay coordination, and spatial UI remain outstanding.

### Action layer

Define semantic actions independently from physical input:

1. Aim or update placement target.
2. Confirm placement.
3. Cancel placement.
4. Select content.
5. Translate content.
6. Rotate content.
7. Scale content.
8. Lock or unlock placement.
9. Reset presentation.
10. Enter or leave immersive scene scale.
11. Toggle or select navigation mode.
12. Exit XR.

### Input adapters

1. Transient screen selection for handheld AR.
2. Tracked controller target rays and buttons.
3. Hand input where the browser provides reliable joints and selection events.
4. Gaze and optional dwell confirmation.
5. Mouse and keyboard for desktop-mediated AR.
6. Host-provided custom input adapters for installations or device-specific systems.

### UI surfaces

1. DOM overlay for devices that support and benefit from it.
2. World-space Three.js UI for headsets and glasses.
3. Minimal gaze-accessible controls where controller or touch input is absent.
4. Existing host-page controls for desktop companion workflows.
5. Clear onboarding states for scanning, placement, manipulation, tracking loss, and exit.

### Work

1. Implement the semantic action router.
2. Move VR thumbstick locomotion behind an explicit navigation adapter.
3. Prevent DOM overlay interaction from also placing or manipulating content.
4. Implement optional two-pointer scale and rotation for transient-screen devices.
5. Implement controller-ray translation, rotation, and scale suitable for props and dioramas.
6. Add physical-only and fly navigation options for environments.
7. Ensure orbit semantics manipulate content or a diorama in XR rather than orbiting the tracked head camera.
8. Add accessible target sizes, contrast modes, and reduced-motion behaviour.

### Acceptance criteria

1. The same placement and reset actions can be invoked through at least transient-screen input and tracked controllers.
2. AR sessions without DOM overlay remain operable through spatial controls or host-provided input.
3. A device gaining or losing an input source does not require restarting the session.
4. Fly, physical movement, orbit-style content manipulation, and object manipulation remain distinct modes.
5. Touch gestures are optional adapters, not required AR behaviour.

## Phase 5: Anchors and world understanding

### Objective

Improve placement stability and environmental understanding through independently optional WebXR features.

### Work

1. Add transient anchors created from successful placement results where supported.
2. Track anchor poses and handle temporary tracking loss without snapping content to a new location.
3. Add optional persistent-anchor storage with explicit host and user control.
4. Add anchor deletion and stale-anchor recovery.
5. Integrate Three.js `XRPlanes` behind a plane-detection capability flag.
6. Filter and classify planes by orientation and any available semantic labels.
7. Add optional plane visualization for placement and diagnostics.
8. Consider mesh detection separately from plane detection; do not require either for basic hit-test placement.
9. Define privacy and data-retention behaviour for persistent spatial data.

### Acceptance criteria

1. Basic placement continues working when anchors and planes are unsupported.
2. Anchored content remains stable as the device refines its world understanding.
3. Anchor loss has an explicit UI state and does not silently relocate content.
4. Persistent placement occurs only after an explicit host or user decision.
5. Plane meshes and resources are disposed on session end.

## Phase 6: AR lighting, shadows, and optional occlusion

### Objective

Improve visual integration without compromising authored Open Brush appearance or making advanced features mandatory.

### Work

1. Integrate Three.js `XREstimatedLight` as an optional lighting source.
2. Define precedence separately for material-defined lighting, embedded lights, Tilt/Open Brush environment metadata, Gallery presentation lighting, estimated real-world lighting, and viewer fallback lighting.
3. Decide per material family whether estimated lighting replaces, multiplies, or supplements authored lighting.
4. Add an optional contact shadow or transparent floor receiver placed from the selected surface.
5. Prevent real-world shadow receivers from affecting large immersive scenes unless explicitly requested.
6. Evaluate Three.js depth sensing on supported target devices.
7. Prototype depth-based occlusion with representative standard, raw-shader, Tilt Brush, transparent, additive, splat, and IMM materials.
8. Keep depth occlusion experimental until reprojection, edge quality, flicker, and material compatibility are acceptable.
9. Add independent feature toggles and fallbacks for lighting estimation, shadows, and occlusion.

### Acceptance criteria

1. Absence or failure of lighting estimation leaves a valid authored or fallback lighting result.
2. Estimated lighting does not double-light materials already carrying their own lighting model.
3. Contact shadows are used only when a meaningful real-world receiver exists.
4. Depth occlusion can be disabled independently and is never a prerequisite for AR entry.
5. Transparent and additive Open Brush materials retain their expected appearance within documented device limitations.

## Phase 7: Performance, resilience, and long-session behaviour

### Objective

Make AR sustainable for large Open Brush scenes, dioramas, props, splats, and mixed device classes.

### Work

1. Define XR framebuffer scale and foveation policy using Three.js `WebXRManager` controls.
2. Avoid assuming that mobile devices are the only thermally constrained devices.
3. Use measured content complexity, render timing, active features, and host policy to select quality.
4. Retain the existing XR post-processing bypass until individual effects are validated for XR.
5. Add quality tiers for shadows, environment reflections, splats, animated brushes, depth sensing, and plane visualization.
6. Pause or reduce background work when session visibility changes.
7. Verify audio pause, resume, autoplay, and listener attachment across session transitions.
8. Handle context loss, interrupted sessions, permission revocation, and input-source churn.
9. Profile representative large environments and small props on multiple XR presentation classes.
10. Expose diagnostic timing and active-feature information without enabling verbose logging by default.

### Acceptance criteria

1. Quality selection is based on observed capability and performance rather than phone-versus-desktop classification.
2. Large scenes do not incur prop-specific placement or shadow costs unnecessarily.
3. Optional features can be disabled in response to sustained performance problems.
4. Repeated AR entry and exit does not leak sessions, hit-test sources, anchors, planes, lights, UI, or event listeners.

## Phase 8: Test matrix, rollout, and documentation

### Objective

Ship AR incrementally with measurable compatibility and controlled fallback behaviour.

### Automated coverage

1. Pure tests for metadata normalization and precedence.
2. Pure tests for presentation-intent and navigation resolution.
3. Pure tests for content placement and authored-entry transform calculations.
4. Session lifecycle tests using WebXR test or emulation facilities where available.
5. Tests for capability changes and optional-feature failure.
6. Desktop and VR regression tests for renderer-alpha, scene-state, camera, scale, background, fog, lighting, and post-processing behaviour.
7. Gallery integration tests proving both old flattened overrides and extended `presentationParams` work.
8. Tests for repeated session entry and cleanup.

### Physical device categories

1. Handheld alpha-blended camera AR with transient screen input.
2. Standalone passthrough headset AR with tracked controllers.
3. Standalone passthrough headset AR with hands.
4. Tethered or desktop-driven passthrough AR.
5. Optical see-through additive smart glasses.
6. Gaze-dominant device with limited input.
7. Desktop-mediated AR hardware using mouse, keyboard, controller, or a companion display.

The matrix records actual capabilities and blend mode for each tested session. Device category is descriptive and does not select code paths directly.

### Asset categories

1. Large traversable Open Brush scene.
2. Large diorama intended to be displayed as a model.
3. Correctly scaled small prop.
4. Prop with unreliable or missing source units.
5. Migrated Poly model with camera and pivot metadata.
6. Legacy Tilt and new Open Brush exporter variants.
7. Standard glTF with and without embedded cameras and lights.
8. Gaussian splat.
9. IMM scene with authored viewpoints, animation, and audio.

### Rollout stages

1. Developer-only feature flag with diagnostic overlay.
2. Opt-in host configuration for selected assets and devices.
3. Public beta preserving the existing viewer as fallback.
4. Default-enabled basic AR when the required baseline passes.
5. Independent opt-in rollout for anchors, planes, lighting estimation, and occlusion.

### Documentation deliverables

1. Public viewer XR configuration and event API.
2. Existing presentation metadata precedence and the internal resolved-policy boundary; any extended schema is documented only after separate approval.
3. Asset-author guidance for environments, dioramas, and props.
4. Scale and unit guidance for Tilt Brush, Open Brush, glTF, and other supported formats.
5. Device capability and fallback behaviour.
6. Host guidance for DOM overlay, spatial UI, and custom input adapters.
7. Known browser and device limitations based on tested capabilities rather than broad platform claims.

## Cross-repository coordination

Some work belongs outside this repository and must be coordinated rather than silently encoded here:

1. Icosa Gallery must continue building the existing flattened overrides and optionally pass the existing full `presentationParams` object.
2. New XR presentation metadata is deferred. If resumed later, Gallery validation, editing, API exposure, exporters, and client-library documentation must agree on field names and semantics before adoption.
3. Gallery deployment import maps must supply the Three.js version required by the built viewer and any reused addons.
4. Asset pipelines or Open Brush exporters may eventually author presentation intent or reliable unit metadata, but the viewer must still handle legacy assets without it.
5. Persistent anchors may require host-side storage and privacy controls rather than viewer-local persistence.

## Principal risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Large scenes are shrunk into tabletop objects | Preserve authored scale by default; require explicit intent or user choice for fit-volume scaling |
| Small props are enlarged to environment scale | Never infer intended size from navigation mode or bounds alone; preserve reliable authored units |
| Phone assumptions break headsets or glasses | Route through blend mode, input sources, feature availability, and host policy |
| Existing metadata changes meaning | Keep current fields within their established meaning and route future schema through a separately approved adapter |
| Desktop camera transforms corrupt XR tracking | Transform content relative to the tracked user instead of scaling or replacing the XR camera pose |
| Gallery and viewer schemas diverge | Defer new XR schema until coordinated; keep Phase 3 placement logic dependent only on an internal resolved policy |
| Three.js addon version differs from deployed runtime | Establish and test an explicit Three.js deployment baseline in Phase 0 |
| Optional WebXR features prevent session startup | Request nonessential features as optional and degrade them independently |
| Authored and estimated lighting are applied twice | Establish per-source and per-material precedence before enabling estimation by default |
| Depth occlusion damages custom brush materials | Keep it experimental and test material families independently |
| Shared XR changes regress VR | Preserve explicit VR behaviour and run VR regression checks in every shared phase |

## Recommended milestone boundaries

### Milestone A: Safe AR foundation

Status: partially complete. The core rendering, lifecycle, metadata, and transform foundations are implemented, but the remaining Phase 0 integration research, Phase 1 capability and host-event work, and Phase 2 physical/additive validation keep this milestone open.

Includes Phases 0 through 2.

1. Backwards-compatible metadata resolution.
2. Explicit AR/VR/desktop modes.
3. Reliable lifecycle and errors.
4. Capability discovery.
5. Environment-aware rendering.
6. XR-safe camera and content transforms.
7. No automatic scale guesses.

This milestone may still use configured or simple in-front placement, but it establishes the invariants needed by every later feature.

### Milestone B: Usable multi-device placement

Status: in progress. Hit-test targeting, explicit surface placement, semantic selection confirmation, and session-local scale operations are implemented. Additional placement strategies, the full action layer, manipulation, and device-appropriate UI remain outstanding.

Includes Phases 3 and 4.

1. Asset presentation strategies.
2. Hit-test, controller, gaze, fixed, and in-front placement paths as capabilities allow.
3. Reticle and placement state.
4. Actual-size, diorama, and enter-scene choices.
5. Device-independent action routing.
6. DOM overlay and spatial UI paths.

### Milestone C: Stable and integrated AR

Includes Phases 5 and 6.

1. Anchors and plane understanding.
2. Lighting estimation.
3. Contact shadows.
4. Experimental depth occlusion.

### Milestone D: Production rollout

Includes Phases 7 and 8.

1. Performance adaptation.
2. Resilience and cleanup.
3. Automated and physical-device matrices.
4. Documentation and staged release.

## Resolved decisions and remaining coordination questions

Resolved:

1. The implementation targets the current Three.js `0.185` compatibility line; deployed import maps and peer dependencies must remain aligned with it.
2. Phase 3 adds no persistent XR presentation metadata fields. Schema design is deferred until the interaction model has been evaluated and coordinated across repositories.
3. An asset with no reliable presentation intent preserves authored entry and authored scale. Surface placement and fit-volume scaling require explicit user or experimental host choices.
4. Bounds are descriptive inputs, not evidence of real-world units. Actual-size presentation remains unavailable when unit semantics are unreliable.
5. Placement confirmation consumes WebXR semantic `select` events and does not classify devices as phones, headsets, glasses, or desktop AR by user agent.
6. Importer normalization, authored transforms, AR entry, user placement, and user manipulation remain separate transform layers.

Remaining coordination questions:

1. Should the viewer receive the complete existing `presentationParams` object directly, or should Gallery normalize selected fields into the overrides object while also preserving the original object?
2. What values occur in production for `camera.GOOGLE_camera_settings.mode`, and how should they map to fly and orbit suggestions without implying AR presentation intent?
3. Does `GOOGLE_real_world_transform.scaling_factor` describe importer units, an enablement state, or intended display scale, and what do zero and missing values mean?
4. Should stable XR options be constructor options, a configuration method, load-time options, or a combination with documented precedence?
5. Which mode, capability, lifecycle, and error events must become stable public API?
6. Which physical handheld, headset, smart-glass, and desktop-connected AR devices are available for the initial regression matrix?
7. After manual UX evaluation, which presentation choices, if any, should become portable metadata shared by Gallery, editor, exporter, viewer, and client libraries?
