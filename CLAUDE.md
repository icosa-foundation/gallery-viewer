# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Icosa Viewer is a 3D viewer component for Tilt Brush/Open Brush files and derivatives, built with Three.js and TypeScript. It renders VR art sketches created in Tilt Brush or Open Brush applications, supporting multiple 3D formats including .tilt files, GLTF/GLB, OBJ, FBX, PLY, STL, USDZ, and VOX.

## Development Commands

- `npm run build` - Build the project using Parcel (outputs to dist/)
- `npm run watch` - Watch mode for development using Parcel
- `npm test` - Run basic test suite (currently a simple sanity check)

## Architecture

### Core Components

- **`src/viewer.ts`** - Main Viewer class that handles 3D scene setup, loading various file formats, camera controls, lighting, and environment settings
- **`src/helpers/Navigation.ts`** - Keyboard navigation controls (WASD movement, arrow key rotation) for the 3D scene
- **`src/legacy/`** - Legacy GLTF loader support for backward compatibility with older file formats
- **`src/IcosaXRButton.js`** - WebXR integration for VR viewing capabilities

### Key Dependencies

- **Three.js** - Core 3D rendering engine (peer dependency >=0.165 <0.166.0)
- **camera-controls** - Advanced camera controls for navigation
- **three-icosa** - Icosa-specific Three.js extensions for Tilt Brush material support
- **three-tiltloader** - Loader for raw .tilt files
- **Parcel** - Build tool and bundler

### File Structure

- `src/viewer.ts` - Entry point with main Viewer class (~27k tokens, contains scene setup, loaders for multiple formats, environment presets, lighting, camera positioning)
- `src/index.html` - Example HTML page demonstrating viewer usage
- `dist/` - Built output files (module and HTML)
- `dist/index.html` - **Testing/example HTML file** - Contains all example/testing code including lil-gui setup, import maps, and commented-out load examples for various file formats
- `examples/` - Additional example implementations

### Build System

Uses Parcel 2 with TypeScript compilation. The build targets a module format with source maps enabled. The entry point is `src/viewer.ts` and outputs to `dist/icosa-viewer.module.js`.

### Local Development Setup

The project includes a local dependency on `three-icosa` located at `file:C:/Users/andyb/Documents/three-icosa-main`. When working on this codebase, ensure this local dependency is properly linked.

## Critical Rules

**NEVER manually edit built files or create post-build scripts that modify generated output.** All fixes must be made at the source level. This includes:

- NO manual editing of files in `dist/` directory
- NO post-build scripts that patch or modify built files  
- NO workarounds that edit generated bundle outputs
- ALL fixes must be in source files (`src/` directory) only

Any build issues must be resolved through proper source code changes, build configuration, or dependency management - never through manual file manipulation.

## Communication Guidelines

**CRITICAL: Distinguish between QUESTIONS and REQUESTS FOR ACTION**

- **QUESTIONS** (e.g., "is it possible that...?", "could this break...?") = Provide analysis/explanation only, DO NOT take action
- **REQUESTS FOR ACTION** (e.g., "please fix...", "change this to...") = Actually make the requested changes

Always ask for clarification if uncertain whether the user wants analysis or action.

**CRITICAL: Avoid perpetual optimism and excessive enthusiasm**

- Do NOT use overly positive language like "Perfect!", "Great!", "Excellent!"
- Do NOT make confident predictions about outcomes ("This should work perfectly!", "This will fix everything!")
- State facts and technical information without emotional language
- Let results speak for themselves rather than projecting success

## Important Notes

- The viewer supports both regular and WebXR viewing modes
- Environment presets are built-in for different lighting/background scenarios
- Legacy GLTF support is maintained for backward compatibility
- The codebase follows Three.js conventions and uses TypeScript with strict mode enabled
- Always rebuild after any change to files in the src directory using npm run build:local