/**
 * canvasUtils.ts - High-fidelity 2.5D rendering utilities for the Areloria Character and Weapon Forge.
 * Centralizes procedural material effects, lighting, and dithering helpers.
 */

// ─── DETERMINISTIC HASHING ───────────────────────────────────────────────────

/**
 * Generates a pseudo-random float [0, 1) based on x, y coordinates and an optional seed.
 * Ensures texture stability during animations/frame renders.
 */
export function coordHash(x: number, y: number, seed: number = 0): number {
  let h = (x | 0) * 12345 + (y | 0) * 67890 + (seed | 0) * 13579;
  h = Math.sin(h) * 10000;
  return h - Math.floor(h);
}

// ─── MATERIAL EFFECTS ────────────────────────────────────────────────────────

/**
 * High-performance grit/noise renderer.
 * Uses individual pixels and deterministic hashing to avoid plastic-looking gradients.
 */
export function addGritPx(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  density: number = 0.15,
  opacity: number = 0.1,
  seed: number = 42
) {
  const startX = x | 0;
  const startY = y | 0;
  const endX = (x + w) | 0;
  const endY = (y + h) | 0;

  ctx.save();
  for (let py = startY; py < endY; py++) {
    for (let px = startX; px < endX; px++) {
      const hVal = coordHash(px, py, seed);
      if (hVal < density) {
        // Use either dark or light grit based on secondary hash
        const isLight = coordHash(px, py, seed + 1) > 0.5;
        ctx.fillStyle = isLight ? `rgba(255,255,255,${opacity})` : `rgba(0,0,0,${opacity})`;
        ctx.fillRect(px, py, 1, 1);
      }
    }
  }
  ctx.restore();
}

// ─── LIGHTING ────────────────────────────────────────────────────────────────

/**
 * Adds an inner rim light effect to a rectangular area.
 * Simulates 2.5D depth/volume (Diablo 3 style).
 */
export function rimLightPx(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  color: string = "rgba(255,255,255,0.3)"
) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = color;
  // Top edge
  ctx.fillRect(x, y, w, 1);
  // Left edge
  ctx.fillRect(x, y, 1, h);
  ctx.restore();
}

/**
 * Adds an inner shadow to a rectangular area.
 * Simulates depth and occlusion.
 */
export function innerShadowPx(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  color: string = "rgba(0,0,0,0.25)"
) {
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = color;
  // Bottom edge
  ctx.fillRect(x, (y + h - 1) | 0, w, 1);
  // Right edge
  ctx.fillRect((x + w - 1) | 0, y, 1, h);
  ctx.restore();
}
