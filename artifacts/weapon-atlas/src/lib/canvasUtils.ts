// canvasUtils.ts — High-fidelity rendering helpers for Areloria assets
// Provides procedural texture, depth, and volume utilities.

export function shade(color: string, amount: number): string {
  const n = parseInt(color.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amount));
  const b = Math.max(0, Math.min(255, (n & 0xff) + amount));
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

export function addGritPx(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, opacity = 0.1) {
  ctx.save();
  for (let i = 0; i < (w * h * 0.15); i++) {
    const px = x + Math.random() * w;
    const py = y + Math.random() * h;
    ctx.fillStyle = Math.random() > 0.5 ? `rgba(255,255,255,${opacity})` : `rgba(0,0,0,${opacity})`;
    ctx.fillRect(px | 0, py | 0, 1, 1);
  }
  ctx.restore();
}

export function rimLightPx(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color = 'rgba(255,255,255,0.3)') {
  ctx.save();
  ctx.fillStyle = color;
  // Top-left rim
  ctx.fillRect(x, y, w, 1);
  ctx.fillRect(x, y, 1, h);
  ctx.restore();
}

export function innerShadowPx(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color = 'rgba(0,0,0,0.2)') {
  ctx.save();
  ctx.fillStyle = color;
  // Bottom-right inner shadow
  ctx.fillRect(x + w - 1, y + 1, 1, h - 1);
  ctx.fillRect(x + 1, y + h - 1, w - 1, 1);
  ctx.restore();
}

// 4x4 Bayer Dither Matrix for smoother transitions
export const BAYER_4X4 = [
  [ 0,  8,  2, 10],
  [12,  4, 14,  6],
  [ 3, 11,  1,  9],
  [15,  7, 13,  5]
];

// Helper to handle negative modulo correctly in JS
const safeMod = (n: number, m: number) => ((n % m) + m) % m;

export function ditherRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  color1: string, color2: string,
  threshold = 8
) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const px = (x + dx) | 0;
      const py = (y + dy) | 0;
      const bayerValue = BAYER_4X4[safeMod(py, 4)][safeMod(px, 4)];
      ctx.fillStyle = bayerValue < threshold ? color1 : color2;
      ctx.fillRect(px, py, 1, 1);
    }
  }
}
