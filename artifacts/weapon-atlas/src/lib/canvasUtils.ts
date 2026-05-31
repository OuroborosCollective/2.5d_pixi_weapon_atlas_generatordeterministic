/**
 * canvasUtils.ts - High-fidelity 2.5D rendering utilities for Areloria.
 * Provides procedural tools for depth, texture, and material simulation.
 */

export const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5]
];

/**
 * Safe modulo for negative numbers
 */
export function safeMod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/**
 * Deterministic hash for coordinate-based pseudo-randomness.
 */
export function coordHash(x: number, y: number, seed: number = 0): number {
  let h = 0x811c9dc5 ^ seed;
  h ^= x;
  h = Math.imul(h, 0x01000193);
  h ^= y;
  h = Math.imul(h, 0x01000193);
  return (h >>> 0) / 4294967296;
}

/**
 * Procedural color variant calculation for highlights, shadows, and gradients.
 */
export function shade(color: string, amt: number): string {
  const n = parseInt(color.replace('#', ''), 16);
  let r = (n >> 16) + amt;
  let g = ((n >> 8) & 0xff) + amt;
  let b = (n & 0xff) + amt;

  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));

  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates a 4-tone palette for a base color.
 */
export function getPalette(color: string) {
  return {
    hi: shade(color, 42),   // specular highlight
    l: shade(color, 22),    // lit surface
    b: color,               // base mid-tone
    d: shade(color, -26),   // shadow
    vd: shade(color, -48),  // deep shadow / outline
  };
}

/**
 * Adds pixel-level noise to simulate material texture (grit).
 * Uses deterministic hashing to prevent flickering during animation.
 */
export function addGritPx(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  opacity: number = 0.12,
  seed: number = 42
) {
  ctx.save();
  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const hval = coordHash(x + px, y + py, seed);
      if (hval < 0.15) {
        ctx.fillStyle = `rgba(0,0,0,${opacity})`;
        ctx.fillRect(x + px, y + py, 1, 1);
      } else if (hval > 0.85) {
        ctx.fillStyle = `rgba(255,255,255,${opacity * 0.5})`;
        ctx.fillRect(x + px, y + py, 1, 1);
      }
    }
  }
  ctx.restore();
}

/**
 * Edge highlighting to simulate rim light on 2.5D surfaces.
 */
export function rimLightPx(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  color: string = "rgba(255,255,255,0.4)"
) {
  ctx.save();
  ctx.fillStyle = color;
  // Top edge
  ctx.fillRect(x, y, w, 1);
  // Left edge
  ctx.fillRect(x, y, 1, h);
  ctx.restore();
}

/**
 * Inner shadow to add depth to materials.
 */
export function innerShadowPx(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  color: string = "rgba(0,0,0,0.3)"
) {
  ctx.save();
  ctx.fillStyle = color;
  // Bottom edge
  ctx.fillRect(x, y + h - 1, w, 1);
  // Right edge
  ctx.fillRect(x + w - 1, y, 1, h);
  ctx.restore();
}

/**
 * Bayer 4x4 Dithering helper.
 */
export function shouldDither(x: number, y: number, threshold: number): boolean {
  const bayerValue = BAYER_4X4[safeMod(y, 4)][safeMod(x, 4)];
  return bayerValue < threshold;
}
