/**
 * Centralized high-fidelity rendering helpers for the Areloria asset pipeline.
 * Designed for 2.5D graphics with a focus on depth, texture, and deterministic results.
 */

export const BAYER_4X4 = [
  [ 0,  8,  2, 10],
  [12,  4, 14,  6],
  [ 3, 11,  1,  9],
  [15,  7, 13,  5]
];

/**
 * Deterministic pseudo-random hash based on coordinates and seed.
 * Prevents flickering in procedural textures during animation or re-renders.
 */
export function deterministicHash(x: number, y: number, seed: number = 0): number {
  let h = Math.imul(x ^ seed, 374761393) + Math.imul(y ^ seed, 668265263);
  h = (h ^ (h >>> 13)) * 12741261;
  return (h ^ (h >>> 16)) >>> 0;
}

/**
 * Adds procedural noise-based texture (grit) to a canvas region.
 * Used to reduce 'plastic' appearance of gradients.
 */
export function addGritPx(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, opacity: number = 0.1, seed: number = 0) {
  const imageData = ctx.getImageData(x, y, w, h);
  const data = imageData.data;
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const idx = (j * w + i) * 4;
      if (data[idx + 3] < 10) continue; // Skip transparent pixels

      const hash = deterministicHash((x + i) | 0, (y + j) | 0, seed);
      if ((hash % 100) < (opacity * 100)) {
        const factor = 0.85 + (hash % 20) / 200; // Random darkening factor
        data[idx] = (data[idx] * factor) | 0;
        data[idx + 1] = (data[idx + 1] * factor) | 0;
        data[idx + 2] = (data[idx + 2] * factor) | 0;
      }
    }
  }
  ctx.putImageData(imageData, x, y);
}

/**
 * Procedural rim light effect for edge highlighting.
 * Uses screen blend mode to simulate light catching on edges.
 */
export function rimLightPx(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string = "rgba(255,255,255,0.35)") {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  ctx.restore();
}

/**
 * Procedural inner shadow for simulated volume and depth.
 * Uses multiply blend mode.
 */
export function innerShadowPx(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string = "rgba(0,0,0,0.25)") {
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = color;
  // Bottom and right edge shadow
  ctx.fillRect(x + w - 1, y + 1, 1, h - 1);
  ctx.fillRect(x + 1, y + h - 1, w - 1, 1);
  ctx.restore();
}

/**
 * Utility to darken or lighten a hex color.
 */
export function shade(c: string, amt: number): string {
  const n = parseInt(c.replace('#',''), 16);
  const r = Math.max(0, Math.min(255, (n >> 16)         + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amt));
  const b = Math.max(0, Math.min(255, (n & 0xff)        + amt));
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}
