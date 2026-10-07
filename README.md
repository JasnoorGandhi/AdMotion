# AdMotion

AdMotion is a web-based Motion Graphics Advertisement Platform built as a University Computer Graphics project.

## Problem statement
Creating short promotional motion graphics normally requires heavyweight creative software. AdMotion demonstrates the core concepts behind such tools in a compact browser-based editor.

## Objective
Build animated advertisements from text, images and shapes using a custom 2D graphics and keyframe animation pipeline.

## Features
- Category → details → template → editor workflow
- Canvas-based 2D rendering
- Text, image, rectangle and circle objects
- Translation, rotation, scaling and opacity
- Layer ordering and visibility
- Linear keyframe interpolation
- Animation presets
- Timeline scrubbing and playback
- Full-screen preview using the same renderer
- Simple background audio upload/playback/volume
- WebM export with Canvas `captureStream()` + `MediaRecorder`
- LocalStorage project persistence
- Computer Graphics demonstration page

## Technology stack
React, Vite, JavaScript, React Router, HTML5 Canvas, CSS and Lucide React.

## Architecture
`ProjectContext` owns project state. `GraphicsEngine` wraps the Canvas renderer. `Renderer.js` performs layered drawing and Canvas transformations. `Animation.js` performs keyframe interpolation and presets. `templates.js` provides data-driven advertisement compositions.

## Graphics engine
Each object is represented by a graphical object containing id, type, position, dimensions, rotation, scale, opacity, z-index, visibility, timing, properties and keyframes.

For every rendered frame:
1. Clear the Canvas.
2. Filter objects by visibility and time.
3. Sort objects by z-index.
4. Interpolate animated properties.
5. Save Canvas state.
6. Apply translation, rotation and scaling.
7. Apply opacity.
8. Draw the object.
9. Restore Canvas state.

## Animation system
Keyframes use `{ time, value }`. Intermediate values are calculated with linear interpolation and progress is clamped between 0 and 1.

## Rendering pipeline
React manages the editor UI and project state. HTML5 Canvas handles the actual graphics. `requestAnimationFrame` advances the current time during playback, and the same renderer is used for editor playback, preview and export.

## Why is AdMotion a Computer Graphics project?
AdMotion implements a custom 2D graphics rendering and animation pipeline. Advertisement elements are represented as graphical objects with geometric transformations and visual properties. The engine applies transformations, interpolates keyframes, composites layers and renders frames using HTML5 Canvas.

The project demonstrates a 2D coordinate system, translation, rotation, scaling, alpha/opacity, layered compositing, keyframe animation, linear interpolation, frame-by-frame rendering and Canvas transformation APIs.

## How to run
```bash
npm install
npm run dev
```
For a production build:
```bash
npm run build
```

## How to use
1. Open Create Advertisement.
2. Select a category.
3. Enter advertisement details and optional images.
4. Choose one of five templates.
5. Add or edit objects in the editor.
6. Select an object to change its properties.
7. Apply animation presets and scrub/play the timeline.
8. Use Preview for a clean playback view.
9. Upload optional audio for local preview.
10. Export the visual animation as `admotion-export.webm`.

## Export limitations
WebM export uses browser `MediaRecorder` and captures the Canvas visual stream. Audio is intentionally kept as simple HTML5 Audio and is not mixed into the exported video. MP4/FFmpeg are outside the project scope.

## Future improvements
Multi-scene timelines, audio mixing, richer easing functions, drag handles, collaborative editing, cloud storage and MP4 encoding could be added later.
