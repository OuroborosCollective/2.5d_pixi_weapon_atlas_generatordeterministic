/**
 * canvasUtils.ts — High-fidelity procedural rendering helpers
 * Centralized utilities for 2.5D Diablo-like graphics standards.
 * All effects are deterministic based on coordinates.
 */

/**
 * 4x4 Bayer Dither Matrix for ordered dithering
 */
export const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

/**
 * Deterministic pseudo-random hash based on coordinates and an optional seed.
 */
export function coordHash(x: number, y: number, seed: number = 0): number {
  let h = 0x811c9dc5 ^ seed;
  h ^= (x | 0);
  h = Math.imul(h, 0x01000193);
  h ^= (y | 0);
  h = Math.imul(h, 0x01000193);
  return (h >>> 0) / 0xffffffff;
}

/**
 * Adds deterministic grit/noise to a specific area using fillRect to avoid getImageData bottlenecks.
 * @param ctx Canvas context
 * @param x Top-left X
 * @param y Top-left Y
 * @param w Width
 * @param h Height
 * @param opacity Base opacity of the grit
 * @param seed Optional seed for variation
 */
export function addGritPx(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  opacity: number = 0.12,
  seed: number = 42
) {
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const px = x + dx;
      const py = y + dy;
      const val = coordHash(px, py, seed);
      if (val < 0.15) {
        ctx.fillStyle = `rgba(0,0,0,${opacity})`;
        ctx.fillRect(px, py, 1, 1);
      } else if (val > 0.85) {
        ctx.fillStyle = `rgba(255,255,255,${opacity * 0.5})`;
        ctx.fillRect(px, py, 1, 1);
      }
    }
  }
  ctx.restore();
}

/**
 * Draws a rim light effect (edge highlight).
 */
export function rimLightPx(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string = "rgba(255,255,255,0.4)"
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
 * Draws an inner shadow effect for depth.
 */
export function innerShadowPx(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string = "rgba(0,0,0,0.3)"
) {
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = color;
  // Bottom edge
  ctx.fillRect(x, y + h - 1, w, 1);
  // Right edge
  ctx.fillRect(x + w - 1, y, 1, h);
  ctx.restore();
}

/**
 * Utility to calculate shading variants.
 */
export function shade(color: string, amount: number): string {
  const n = parseInt(color.replace("#", ""), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amount));
  const b = Math.max(0, Math.min(255, (n & 0xff) + amount));
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}
