/**
 * High-fidelity 2.5D rendering utilities for procedural Canvas assets.
 * Focuses on volumetric lighting (rim/shadow), material texture (grit),
 * and smoother transitions (Bayer dithering).
 */

export const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5]
];

/**
 * Deterministic pseudo-randomness based on coordinates and a seed.
 * Prevents "crawling" noise in animations.
 */
export function hash2D(x: number, y: number, seed: number = 0): number {
  const h = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453123;
  return h - Math.floor(h);
}

/**
 * Adds volumetric rim lighting to the edges of a shape.
 * Typically used with 'screen' blend mode.
 */
export function rimLightPx(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  color: string = "rgba(255,255,255,0.3)"
) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  ctx.restore();
}

/**
 * Adds internal depth shadow to the edges of a shape.
 * Typically used with 'multiply' blend mode.
 */
export function innerShadowPx(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  color: string = "rgba(0,0,0,0.2)"
) {
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
  ctx.restore();
}

/**
 * Adds deterministic grain/grit to a material to reduce "plastic" look.
 */
export function addGritPx(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  opacity: number = 0.1,
  seed: number = 42
) {
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  // Density-based loop for performance, avoiding getImageData/putImageData
  const density = 0.2;
  const count = Math.floor(w * h * density);
  for (let i = 0; i < count; i++) {
    const nx = x + hash2D(i, seed, 1) * w;
    const ny = y + hash2D(i, seed, 2) * h;
    const n = hash2D(i, seed, 3);
    if (n < opacity) {
      const v = Math.floor(255 - n * 128);
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fillRect(nx | 0, ny | 0, 1, 1);
    }
  }
  ctx.restore();
}

/**
 * Simulates a beveled edge for 2.5D depth.
 */
export function bevel(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  // Highlight (top-left)
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y + h); ctx.lineTo(x, y); ctx.lineTo(x + w, y);
  ctx.stroke();
  // Shadow (bottom-right)
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.moveTo(x + w, y); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h);
  ctx.stroke();
  ctx.restore();
}

/**
 * Adds a gloss sheen across the top of a surface.
 */
export function gloss(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  const g = ctx.createLinearGradient(x, y, x, y + h * 0.5);
  g.addColorStop(0, "rgba(255,255,255,0.15)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h * 0.5);
  ctx.restore();
}

/**
 * Applies 4x4 Bayer dithering to a transition between two colors.
 */
export function applyBayerDither(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  colorA: string, colorB: string,
  threshold: number = 0.5
) {
  ctx.save();
  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const bayerVal = BAYER_4X4[((y + py) % 4 + 4) % 4][((x + px) % 4 + 4) % 4] / 16;
      ctx.fillStyle = bayerVal < threshold ? colorA : colorB;
      ctx.fillRect(x + px, y + py, 1, 1);
    }
  }
  ctx.restore();
}
