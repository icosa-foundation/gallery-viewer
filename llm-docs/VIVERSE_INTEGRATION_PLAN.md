# Viverse Viewer Integration Plan

## Goal

Remove the need for the long-lived `feature/icosa-and-viverse-unified` branch by supporting both the standard Icosa viewer and the Viverse viewer from `main`.

Both entry points must retain their existing behavior. Viverse-specific assumptions should be explicitly enabled rather than becoming defaults for every `Viewer` consumer.

## Current State

- `main` contains the current general-purpose viewer.
- `feature/icosa-and-viverse-unified` contains the Viverse template, Viverse UI assets, and modifications to `src/viewer.ts`.
- The Viverse branch has been synchronized with the current local `main` in commit `6647437` (`Merge main into Viverse unified viewer`).
- The older `feature/viverse-wrapper` branch is an earlier standalone implementation. It contains duplicated viewer files and historical build archives and should be treated as reference material, not as the integration base.
- `C:/Users/andyb/Documents/gallery-viewer-viverse` is another checkout of the unified branch and contains uncommitted work. It must not be used as a clean source or overwritten during integration.

## Viverse-Specific Behavior to Preserve

The unified branch currently changes the shared viewer to support the Viverse wrapper:

1. It disables the standard fit-scene, fullscreen, and XR UI.
2. It exposes the generated XR button so the wrapper can trigger XR entry through its own UI.
3. It requests the WebXR `hand-tracking` feature.
4. It accepts a callback that runs before each rendered frame.
5. The callback can control movement speed, continuous forward flight, and whether standard desktop controls update.
6. It changes XR snap turning from the standard viewer behavior.
7. It tolerates failures while creating XR controllers and controller grips.
8. It lets the Viverse template provide its own desktop, mobile, VR, chat, and avatar behavior.
9. It ships a Viverse HTML template and its supporting assets as a separate deployment package.

## Proposed Architecture

### One Viewer Implementation

Keep a single `Viewer` class in `src/viewer.ts`. Do not maintain a Viverse copy of the compiled viewer or a Viverse-only source branch.

Add a typed options object for integration-specific behavior. Default values must reproduce the current `main` behavior.

Conceptually:

```ts
interface ViewerOptions {
    frame?: HTMLElement;
    ui?: {
        showStandardControls?: boolean;
        appendXrButton?: boolean;
    };
    xr?: {
        requiredFeatures?: string[];
        moveSpeed?: number;
        snapTurnDegrees?: number;
        tolerateControllerSetupFailure?: boolean;
    };
    beforeRender?: (context: ViewerRenderContext) => ViewerRenderDirectives | void;
}
```

The exact types may change during implementation, but the separation should remain:

- Viewer configuration is supplied at construction.
- Per-frame state is supplied through a documented render hook.
- Standard behavior is the default.
- Viverse behavior is explicitly selected by the Viverse template.

### Preserve Constructor Compatibility

Existing consumers currently call:

```ts
new Viewer(assetBaseUrl, frame)
```

That form should continue to work. Add an overload or a backwards-compatible argument parser rather than silently changing the meaning of the second argument.

Update the Viverse template to use the explicit options API. Do not retain its current ambiguous form where the second constructor argument is a `pre_render` function instead of the standard frame element.

### Standard UI Ownership

Move the current commented-out Viverse modifications back to normal code and guard them with options:

- Standard mode initializes and displays the current built-in controls.
- Viverse mode suppresses the built-in controls because its template owns the UI.
- The XR button should have a documented public method or narrowly scoped handle instead of exposing an implementation detail such as `xrButton_container`.

A method such as `requestXrSession()` would be preferable if browser security and the existing XR button implementation allow it. If a user gesture must click the generated button, expose that element with an intentional name and type.

### Render Hook

Replace the untyped `pre_render` callback with a typed hook. The hook should receive relevant state rather than relying on broad access to private viewer internals.

The hook may return directives such as:

- Override XR move speed for the current frame.
- Apply continuous forward movement.
- Skip built-in desktop control updates for the current frame.

Default directives must match `main`: standard movement speed, no continuous flight, and built-in controls enabled.

### XR Configuration

Make these differences configurable:

- Required and optional WebXR session features.
- Snap-turn angle and direction convention.
- Movement speed.
- Whether controller setup failures are tolerated.

Do not require hand tracking in standard mode unless it is already a standard viewer requirement. Viverse can request it through its options.

### Events

Retain the Viverse branch's GLTF lifecycle events only if they are still consumed:

- `icosa-viewer-load-gltf`
- `icosa-viewer-init-scene-gltf`

Before finalizing the API, search the Viverse template and downstream integration for listeners. If they are part of the integration contract, document their timing and preferably expose typed `Viewer` events while keeping the DOM events temporarily for compatibility.

## Repository and Build Layout

Keep the Viverse template and source assets in the repository if this repository remains responsible for producing the Viverse deployment package.

Avoid treating generated files as source:

- Store the Viverse HTML template and assets in a clearly named source directory.
- Generate or copy the shared `icosa-viewer.module.js`, its map, and `three-icosa.module.js` into the Viverse output directory during packaging.
- Do not manually maintain a second compiled copy of the viewer.
- Replace the current `build:viverse` script if necessary so it does not depend on the known-broken `npm run build` path.

The final source/output directory choice should be confirmed after establishing where the Viverse deployment package is consumed.

## Implementation Sequence

1. Preserve the synchronized Viverse branch as a behavioral reference.
2. Inventory every Viverse template use of `Viewer`, including public fields, private fields accessed at runtime, DOM events, and XR lifecycle behavior.
3. Compare the Viverse template in the branch with the uncommitted template in `gallery-viewer-viverse`; inspect it read-only unless those changes are explicitly brought into scope.
4. Define typed viewer options and render-hook types.
5. Restore standard `main` behavior as the defaults.
6. Express each Viverse source modification through an explicit option or supported public API.
7. Update the Viverse template to use the new API.
8. Move Viverse template/assets into their agreed source location.
9. Update Viverse packaging so both deployments use the same compiled viewer artifact.
10. Regenerate distributable JavaScript and source maps using a verified build path.
11. Merge the integration into `main`.
12. Archive or delete the obsolete Viverse branches only after both deployments are verified.

## Verification

### Standard Viewer

- Existing constructor calls still work.
- Built-in fit-scene, fullscreen, and XR controls remain visible and functional.
- Existing orbit/fly controls behave as before.
- GLTF, GLB, Tilt, splat, and other supported model-loading paths are unaffected.
- XR movement and snap turning retain current `main` behavior.

### Viverse Viewer

- The Viverse-owned UI is shown without duplicate standard controls.
- Desktop keyboard and pointer-lock controls behave as before.
- Mobile controls behave as before.
- XR entry works from the Viverse UI.
- Hand tracking, controllers, snap turning, vertical movement, and continuous flight behave as before.
- Chat and avatar features continue to work.
- GLTF lifecycle-dependent initialization still happens at the same time.
- Template asset URLs resolve in the packaged directory structure.

### Build and Package

- The standard distribution contains the expected shared viewer artifact.
- The Viverse package consumes that same artifact rather than a separately edited copy.
- Source maps correspond to the generated JavaScript.
- A clean checkout can produce both outputs through documented commands.

## Decisions Still Needed

1. Whether this repository owns the Viverse HTML/assets or only the shared viewer API.
2. Whether the uncommitted work in `gallery-viewer-viverse` represents newer required Viverse behavior.
3. Which Viverse lifecycle DOM events remain part of the required contract.
4. What build command should replace or repair the currently non-working standard build process.
5. Whether the older Viverse branches should be deleted remotely or retained as archived references after integration.
