# Plan: Professional Customization Engine (Fabric.js Advanced)

## Objective
Transform the basic canvas editor into a professional-grade design tool with advanced manipulation, visual constraints, and state management.

## Proposed Improvements

### 1. Visual Constraints (Clipping)
- **Absolute Clipping**: Implement a `clipPath` system where the design is masked by the product's printable area. 
- **Fixed Masks**: Use `absolutePositioned: true` to ensure the mask stays fixed to the shirt's front while the user moves/scales the AI design within it.

### 2. Advanced Typography
- **Text on Path**: Add the ability for users to add curved text (perfect for mugs and circular badges).
- **Variable Curvature**: Provide a slider to adjust the text "bend" in real-time.

### 3. Professional Interaction Logic
- **Alignment Snapping**: Implement visual guidelines and "snap-to-center" logic when an object is moved near the vertical or horizontal center of the printable zone.
- **Undo/Redo History**: Implement a local state history stack (limited to 50 states) to allow users to experiment fearlessly.

### 4. Custom Controls API
- **Modern UI Handles**: Replace the standard Fabric "bubbles" with custom SVG icons:
  - Trash icon for direct deletion.
  - Flip icon for horizontal mirroring.
  - Clone icon for quick duplication.
- **Dynamic Visibility**: Only show controls when an object is active to keep the "Studio" feel clean.

### 5. Performance for High-Res
- **Object Caching**: Enable `objectCaching` for complex designs to maintain a smooth 60FPS workspace even with large files.
- **Deferred Rendering**: Use `requestRenderAll` to optimize battery life and responsiveness on mobile devices.

## Implementation Phases
1. **Masking Engine**: Implement the absolute clipping system.
2. **Typography Module**: Add curved text and font selection (Google Fonts integration).
3. **Control Overhaul**: Create the custom SVG handles and snapping logic.
4. **State Management**: Implement the Undo/Redo stack and state serialization.
