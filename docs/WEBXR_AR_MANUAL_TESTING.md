# Manual WebXR AR testing

1. Build the current viewer with `npm run build:local`.
2. Start the manual page with `npm run manual:ar`.
3. Open `http://127.0.0.1:4173/test/manual-ar.html` on the same computer.
4. Enter either an Icosa asset ID or a direct glTF, GLB, or Tilt URL and select **Load asset**.
5. Select the viewer's real **START AR** button when the browser reports AR support.

The page accepts query parameters, for example:

1. `?asset=ICOSA_ASSET_ID`
2. `?url=https://example.com/model.glb`
3. `?url=https://example.com/legacy.gltf&format=gltf1`
4. `?environment=0` to skip authored environment loading

`localhost` and `127.0.0.1` are secure WebXR contexts on the computer running the browser. A separate headset, smart-glasses browser, phone, or other network device requires the page to be served from an HTTPS origin trusted by that device. The included server is HTTP-only; place it behind the project's existing HTTPS development host or tunnel rather than bypassing the device's certificate checks.

For each device, manually compare one large traversable scene and one small prop:

1. Confirm that authored scale is preserved.
2. Confirm that the large scene opens around the user rather than being reduced to a tabletop object.
3. Confirm that the prop is not enlarged unexpectedly.
4. Confirm that the authored entry view is sensible without changing the tracked head pose.
5. Confirm that background, fog, and sky match the displayed blend mode.
6. Exit AR and confirm that desktop presentation is restored.

The current Phase 3 placement interaction is session-local and intentionally explicit:

1. Use **Enter at authored viewpoint** for a large scene. Hit testing may remain available internally, but no placement reticle or selection action should move the scene.
2. Use **Place on detected surface** for a prop or diorama.
3. When the runtime finds a surface in surface mode, a green ring should follow the current hit-test pose.
4. When an established target is temporarily lost, the ring should remain at its last pose in amber.
5. While searching, unsupported, outside AR, or in entry mode, the ring should be hidden.
6. Select a green target using the runtime's primary WebXR select action. This may originate from transient screen input, a tracked controller, or another select-capable input source.
7. The asset should move through the user-placement root without changing its importer or authored transform. A brief blue reticle confirms the placement.
8. **Preserve authored size** should leave the user-manipulation scale at one after importer normalization.
9. A fit-volume choice should scale the asset uniformly to the selected bounding-sphere diameter. This is an explicit diorama/viewing operation, not an inferred asset classification or real-world-size claim.
10. A custom multiplier should affect only the user-manipulation root and should not change the surface placement or authored entry transform.
11. **Actual size** remains unavailable unless reliable unit semantics are established for the asset.
