/**
 * canvasUtils.ts - High-fidelity 2.5D rendering helpers
 * Reaches Diablo 3 design standards with procedural pixel-art enhancements.
 */

// 4x4 Bayer Dither Matrix for sophisticated gradients
export const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

/**
 * Deterministic pseudo-random number generator based on coordinates.
 * Prevents texture flickering in animations.
 */
function hash2D(x: number, y: number, seed: number = 0): number {
  const h = (x * 374761393 + y * 668265263 + seed * 1274126177) >>> 0;
  return (h ^ (h >>> 13)) * 1274126177 >>> 0;
}

/**
 * Returns a shaded version of a hex color.
 */
export function shade(c: string, amt: number): string {
  const n = parseInt(c.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amt));
  const b = Math.max(0, Math.min(255, (n & 0xff) + amt));
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

/**
 * Procedural rim light (edge highlight) using 'screen' blending.
 * Simulates light catching the edges of a 3D volume.
 */
export function rimLightPx(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  color: string = 'rgba(255,255,255,0.35)'
) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = color;
  // Top edge highlight
  ctx.fillRect(x, y, w, 1);
  // Left edge highlight
  ctx.fillRect(x, y, 1, h);
  ctx.restore();
}

/**
 * Procedural inner shadow using 'multiply' blending.
 * Adds depth and volume to surfaces.
 */
export function innerShadowPx(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  color: string = 'rgba(0,0,0,0.25)'
) {
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = color;
  // Bottom edge shadow
  ctx.fillRect(x, y + h - 1, w, 1);
  // Right edge shadow
  ctx.fillRect(x + w - 1, y, 1, h);
  ctx.restore();
}

/**
 * Adds deterministic grit/noise to a pixel area.
 * Reduces the 'plastic' look of flat gradients.
 */
export function addGritPx(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  opacity: number = 0.1,
  seed: number = 42
) {
  ctx.save();
  for (let i = 0; i < w; i++) {
    for (let j = 0; j < h; j++) {
      const hval = hash2D(x + i, y + j, seed);
      if ((hval % 100) < 15) { // 15% density
        const dark = (hval % 2) === 0;
        ctx.fillStyle = dark ? `rgba(0,0,0,${opacity})` : `rgba(255,255,255,${opacity})`;
        ctx.fillRect(x + i, y + j, 1, 1);
      }
    }
  }
  ctx.restore();
}

/**
 * Applies Bayer dithering to a rectangle.
 */
export function ditherPx(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  colorA: string, colorB: string,
  threshold: number = 8
) {
  for (let i = 0; i < w; i++) {
    for (let j = 0; j < h; j++) {
      const bayerVal = BAYER_4X4[((y + j) % 4 + 4) % 4][((x + i) % 4 + 4) % 4];
      ctx.fillStyle = bayerVal < threshold ? colorA : colorB;
      ctx.fillRect(x + i, y + j, 1, 1);
    }
  }
}
