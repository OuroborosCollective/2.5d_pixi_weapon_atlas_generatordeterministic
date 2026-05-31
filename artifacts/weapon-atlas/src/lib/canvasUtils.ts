/**
 * canvasUtils.ts
 * Centralized high-fidelity rendering helpers for the Weapon Atlas and Character Forge.
 * Reaches the design standard of 2.5D high-quality graphics (Diablo 3 style).
 */

export const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

/**
 * Safe modulo for negative numbers.
 */
export function safeMod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/**
 * Deterministic pseudo-random number generator based on coordinates and a seed.
 * Returns a float between 0 and 1.
 */
export function deterministicRandom(x: number, y: number, seed: number): number {
  let h = (seed + (x | 0) * 374761393 + (y | 0) * 668265263) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

/**
 * Adds procedural "grit" or noise-based texture to a specific area.
 * Helps reduce the "plastic" look of flat gradients.
 */
export function addGritPx(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  opacity = 0.12,
  seed = 42
) {
  ctx.save();
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const px = (x + dx) | 0;
      const py = (y + dy) | 0;
      if (deterministicRandom(px, py, seed) < 0.1) {
        const val = deterministicRandom(px, py, seed + 1) > 0.5 ? 255 : 0;
        ctx.fillStyle = `rgba(${val},${val},${val},${opacity})`;
        ctx.fillRect(px, py, 1, 1);
      }
    }
  }
  ctx.restore();
}

/**
 * Draws a subtle rim light on the upper-left edges.
 */
export function rimLightPx(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color = "rgba(255,255,255,0.3)"
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  // Top edge
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  // Left edge
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + h);
  ctx.stroke();
  ctx.restore();
}

/**
 * Draws a subtle inner shadow on the bottom-right edges.
 */
export function innerShadowPx(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color = "rgba(0,0,0,0.25)"
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  // Bottom edge
  ctx.moveTo(x, y + h);
  ctx.lineTo(x + w, y + h);
  // Right edge
  ctx.moveTo(x + w, y);
  ctx.lineTo(x + w, y + h);
  ctx.stroke();
  ctx.restore();
}

/**
 * Procedurally calculates a color variant (lighter or darker).
 */
export function shade(color: string, amt: number): string {
  const n = parseInt(color.replace("#", ""), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amt));
  const b = Math.max(0, Math.min(255, (n & 0xff) + amt));
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}
