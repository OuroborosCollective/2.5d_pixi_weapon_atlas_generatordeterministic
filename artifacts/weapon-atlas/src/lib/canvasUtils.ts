/**
 * High-fidelity 2.5D rendering utilities for Canvas API.
 * Provides granular control over depth, texture, and lighting.
 */

export const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

/**
 * Procedural color variant calculation.
 * Handles hex and rgb/rgba strings. Returns hex.
 * @param c Color string
 * @param amt Amount to adjust (negative for shadow, positive for highlight)
 */
export function shade(c: string, amt: number): string {
  let r = 0, g = 0, b = 0;
  if (c.startsWith('#')) {
    const n = parseInt(c.replace('#', ''), 16);
    r = (n >> 16) & 0xff;
    g = (n >> 8) & 0xff;
    b = n & 0xff;
  } else if (c.startsWith('rgb')) {
    const parts = c.match(/\d+/g);
    if (parts) {
      r = parseInt(parts[0]);
      g = parseInt(parts[1]);
      b = parseInt(parts[2]);
    }
  } else {
    return c; // Cannot shade unknown format
  }

  r = Math.max(0, Math.min(255, r + amt));
  g = Math.max(0, Math.min(255, g + amt));
  b = Math.max(0, Math.min(255, b + amt));
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

/**
 * Deterministic pseudo-random number generator for coordinate-based noise.
 */
function hash(x: number, y: number, seed: number = 0): number {
  let h = (0x811c9dc5 ^ seed) >>> 0;
  h ^= x; h = Math.imul(h, 0x01000193) >>> 0;
  h ^= y; h = Math.imul(h, 0x01000193) >>> 0;
  return (h >>> 0) / 4294967296;
}

/**
 * Adds deterministic grit/noise to a specific area.
 */
export function addGritPx(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  opacity = 0.12
) {
  ctx.save();
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const px = x + dx;
      const py = y + dy;
      const val = hash(px, py);
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
 * Adds a rim light highlight (top-left by default).
 */
export function rimLightPx(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  color = 'rgba(255,255,255,0.4)'
) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = color;
  // Top edge
  ctx.fillRect(x, y, w, 1);
  // Left edge
  ctx.fillRect(x, y, 1, h);
  ctx.restore();
}

/**
 * Adds an inner shadow for depth (bottom-right by default).
 */
export function innerShadowPx(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  color = 'rgba(0,0,0,0.3)'
) {
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = color;
  // Bottom edge
  ctx.fillRect(x, y + h - 1, w, 1);
  // Right edge
  ctx.fillRect(x + w - 1, y, 1, h);
  ctx.restore();
}

/**
 * Applies Bayer 4x4 dithering to a fill.
 */
export function ditherFill(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  c1: string, c2: string,
  threshold = 8
) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const px = (x + dx) | 0;
      const py = (y + dy) | 0;
      // Safe modulo for coordinates
      const mx = ((px % 4) + 4) % 4;
      const my = ((py % 4) + 4) % 4;

      ctx.fillStyle = BAYER_4X4[my][mx] < threshold ? c1 : c2;
      ctx.fillRect(px, py, 1, 1);
    }
  }
}
