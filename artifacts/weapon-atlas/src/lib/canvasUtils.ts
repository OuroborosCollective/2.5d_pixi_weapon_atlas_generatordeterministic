/**
 * artifacts/weapon-atlas/src/lib/canvasUtils.ts
 * High-fidelity 2.5D rendering utilities for the Areloria asset pipeline.
 */

export const BAYER_4X4 = [
  [ 0,  8,  2, 10],
  [12,  4, 14,  6],
  [ 3, 11,  1,  9],
  [15,  7, 13,  5]
];

/**
 * Deterministic coordinate-based hash for procedural textures.
 */
export function hashCoord(x: number, y: number, seed: number): number {
  let h = seed ^ (x * 374761393) ^ (y * 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}

/**
 * Adds high-performance deterministic grit to a surface.
 * Avoids getImageData/putImageData for GPU efficiency.
 */
export function addGritPx(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  opacity: number, seed: number
) {
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  const density = 0.15;
  const iterations = Math.floor(w * h * density);
  for (let i = 0; i < iterations; i++) {
    const h1 = hashCoord(i, seed, 0);
    const h2 = hashCoord(i, seed, 1);
    const px = x + (h1 % w);
    const py = y + (h2 % h);
    const s = 1 + (hashCoord(i, seed, 2) % 2);
    ctx.fillStyle = `rgba(0,0,0,${opacity})`;
    ctx.fillRect(px | 0, py | 0, s, s);
  }
  ctx.restore();
}

/**
 * Procedural rim lighting (Screen blend) for edge highlights.
 */
export function rimLightPx(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  color = "rgba(255,255,255,0.3)"
) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = color;
  // Left-top highlight
  ctx.fillRect(x, y, 1, h);
  ctx.fillRect(x, y, w, 1);
  ctx.restore();
}

/**
 * Procedural inner shadow (Multiply blend) for simulated volume.
 */
export function innerShadowPx(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  color = "rgba(0,0,0,0.25)"
) {
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = color;
  // Right-bottom shadow
  ctx.fillRect(x + w - 1, y, 1, h);
  ctx.fillRect(x, y + h - 1, w, 1);
  ctx.restore();
}

/**
 * Applies Bayer 4x4 dithering to a row.
 */
export function applyBayerDitherRow(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number,
  c1: string, c2: string,
  threshold: number // 0-15
) {
  const my = ((y % 4) + 4) % 4;
  for (let i = 0; i < w; i++) {
    const mx = (((x + i) % 4) + 4) % 4;
    ctx.fillStyle = (BAYER_4X4[my][mx] < threshold) ? c1 : c2;
    ctx.fillRect((x + i) | 0, y | 0, 1, 1);
  }
}
