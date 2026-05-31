/**
 * canvasUtils.ts — High-fidelity procedural rendering helpers
 * Centralizes utilities for reaching 2.5D 'Diablo 3' design standards.
 */

export const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map(row => row.map(v => v / 16));

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return '#' + [r, g, b].map(v => clamp(v).toString(16).padStart(2, '0')).join('');
}

/**
 * Procedurally shade a color by an absolute amount (-255 to 255).
 */
export function shade(color: string, amount: number): string {
  const [r, g, b] = hexToRgb(color);
  return rgbToHex(r + amount, g + amount, b + amount);
}

/**
 * Adds pixel-level grit/noise to simulate material texture.
 */
export function addGritPx(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  opacity = 0.1
) {
  ctx.save();
  const density = 0.2;
  const count = (w * h) * density;
  for (let i = 0; i < count; i++) {
    const px = x + Math.random() * w;
    const py = y + Math.random() * h;
    ctx.fillStyle = Math.random() > 0.5 ? `rgba(255,255,255,${opacity})` : `rgba(0,0,0,${opacity})`;
    ctx.fillRect(px | 0, py | 0, 1, 1);
  }
  ctx.restore();
}

/**
 * Adds an edge highlight using 'screen' blend mode.
 */
export function rimLightPx(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  color = "rgba(255,255,255,0.3)"
) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = color;
  // Top and left edge
  ctx.fillRect(x, y, w, 1);
  ctx.fillRect(x, y, 1, h);
  ctx.restore();
}

/**
 * Adds depth via an inner shadow using 'multiply' blend mode.
 */
export function innerShadowPx(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  color = "rgba(0,0,0,0.2)"
) {
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = color;
  // Bottom and right edge
  ctx.fillRect(x, y + h - 1, w, 1);
  ctx.fillRect(x + w - 1, y, 1, h);
  ctx.restore();
}

/**
 * Safe modulo for negative numbers (useful for matrix indexing).
 */
export function safeModulo(n: number, m: number): number {
  return ((n % m) + m) % m;
}
