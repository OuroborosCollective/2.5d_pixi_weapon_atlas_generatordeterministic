/**
 * High-fidelity rendering helpers for 2.5D procedural assets.
 * Designed to reach Diablo 3 like graphics standard with pixel-level control.
 */

export const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5]
];

/**
 * Procedural color variant calculation.
 */
export function shade(c: string, amt: number): string {
  const n = parseInt(c.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amt));
  const b = Math.max(0, Math.min(255, (n & 0xff) + amt));
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

/**
 * Deterministic pseudo-random based on coordinates to prevent flickering.
 */
function pseudoRandom(x: number, y: number, seed: number = 0): number {
  const h = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
  return h - Math.floor(h);
}

/**
 * Adds noise-based texture simulation to materials.
 * Reduces 'plastic' appearance of procedural gradients.
 */
export function addGritPx(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, opacity = 0.12) {
  ctx.save();
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const px = x + dx;
      const py = y + dy;
      const rnd = pseudoRandom(px, py);
      if (rnd < 0.15) {
        const grit = pseudoRandom(px, py, 1) > 0.5 ? 255 : 0;
        ctx.fillStyle = `rgba(${grit},${grit},${grit},${opacity})`;
        ctx.fillRect(px, py, 1, 1);
      }
    }
  }
  ctx.restore();
}

/**
 * Edge highlighting to simulate rim lighting and volume.
 */
export function rimLightPx(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color = "rgba(255,255,255,0.35)") {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalCompositeOperation = "screen";
  // Top edge
  ctx.fillRect(x, y, w, 1);
  // Left edge
  ctx.fillRect(x, y, 1, h);
  ctx.restore();
}

/**
 * Depth simulation via inner shadows.
 */
export function innerShadowPx(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color = "rgba(0,0,0,0.25)") {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalCompositeOperation = "multiply";
  // Bottom edge
  ctx.fillRect(x, y + h - 1, w, 1);
  // Right edge
  ctx.fillRect(x + w - 1, y, 1, h);
  ctx.restore();
}

/**
 * 4x4 Bayer matrix dithering for smooth transitions.
 */
export function ditherRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color1: string, color2: string, threshold = 0.5) {
  ctx.save();
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const px = x + dx;
      const py = y + dy;
      const bayerValue = BAYER_4X4[((py % 4) + 4) % 4][((px % 4) + 4) % 4] / 16;
      ctx.fillStyle = bayerValue < threshold ? color1 : color2;
      ctx.fillRect(px, py, 1, 1);
    }
  }
  ctx.restore();
}
