/**
 * Centralized high-fidelity rendering utilities for the Areloria Character Forge and Weapon Atlas.
 * Designed to achieve a 2.5D high-quality "Diablo 3" inspired look.
 */

/**
 * Adjusts the brightness of a hex color.
 */
export function shade(c: string, amt: number): string {
  const n = parseInt(c.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amt));
  const b = Math.max(0, Math.min(255, (n & 0xff) + amt));
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

/**
 * Adds noise-based texture (grit) to a canvas at a global scale.
 */
export function addGrit(ctx: CanvasRenderingContext2D, width: number, height: number, opacity = 0.12) {
  ctx.save();
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const s = 0.5 + Math.random() * 1.5;
    ctx.fillStyle = `rgba(0,0,0,${opacity})`;
    ctx.fillRect(x, y, s, s);
  }
  ctx.restore();
}

/**
 * Adds noise-based texture (grit) to a specific pixel-art area.
 */
export function addGritPx(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, density = 0.1, opacity = 0.15) {
  ctx.save();
  const count = Math.floor(w * h * density);
  for (let i = 0; i < count; i++) {
    const px = x + Math.floor(Math.random() * w);
    const py = y + Math.floor(Math.random() * h);
    ctx.fillStyle = `rgba(0,0,0,${opacity})`;
    ctx.fillRect(px, py, 1, 1);
  }
  ctx.restore();
}

/**
 * Applies a rim light effect to a canvas path (screen blend).
 */
export function rimLight(ctx: CanvasRenderingContext2D, color = "rgba(255,255,255,0.4)", lw = 2.5) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineJoin = "round";
  ctx.stroke();
  ctx.restore();
}

/**
 * Applies a rim light effect at the pixel level.
 */
export function rimLightPx(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color = "rgba(255,255,255,0.3)") {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = color;
  // Top and left edges
  ctx.fillRect(x, y, w, 1);
  ctx.fillRect(x, y, 1, h);
  ctx.restore();
}

/**
 * Applies an inner shadow effect at the pixel level (multiply blend).
 */
export function innerShadowPx(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color = "rgba(0,0,0,0.2)") {
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = color;
  // Bottom and right edges
  ctx.fillRect(x, y + h - 1, w, 1);
  ctx.fillRect(x + w - 1, y, 1, h);
  ctx.restore();
}

/**
 * Applies a bevel effect by combining rim light and inner shadow.
 */
export function applyBevel(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  rimLightPx(ctx, x, y, w, h);
  innerShadowPx(ctx, x, y, w, h);
}
