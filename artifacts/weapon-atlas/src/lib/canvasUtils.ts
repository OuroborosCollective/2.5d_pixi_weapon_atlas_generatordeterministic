export const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5]
];

export function shade(c: string, amt: number): string {
  const n = parseInt(c.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amt));
  const b = Math.max(0, Math.min(255, (n & 0xff) + amt));
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

/**
 * Procedural grit/noise applied at pixel level to simulate material texture.
 * Uses deterministic pseudo-randomness based on coordinates to prevent flickering.
 */
export function addGritPx(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, opacity = 0.1) {
  ctx.save();
  const count = Math.floor(w * h * 0.2);
  for (let i = 0; i < count; i++) {
    // Deterministic pseudo-random values based on position and index
    const seed = x + y * 1000 + i;
    const r1 = (Math.sin(seed * 12.9898) * 43758.5453) % 1;
    const r2 = (Math.sin(seed * 78.233) * 43758.5453) % 1;

    const px = x + Math.abs(r1) * w;
    const py = y + Math.abs(r2) * h;
    const size = 0.5 + Math.abs((r1 + r2) * 10) % 1;

    ctx.fillStyle = `rgba(0,0,0,${opacity})`;
    ctx.fillRect(px, py, size, size);
  }
  ctx.restore();
}

/**
 * Adds a rim light effect (screen blend) to edges for volume simulation.
 */
export function rimLightPx(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color = "rgba(255,255,255,0.4)") {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  ctx.restore();
}

/**
 * Adds an inner shadow (multiply blend) to simulate depth.
 */
export function innerShadowPx(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, opacity = 0.2) {
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = `rgba(0,0,0,${opacity})`;
  // Bottom and right shadow
  ctx.fillRect(x + 1, y + h - 1, w - 1, 1);
  ctx.fillRect(x + w - 1, y + 1, 1, h - 1);
  ctx.restore();
}
