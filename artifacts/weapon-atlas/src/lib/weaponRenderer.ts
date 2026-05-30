export interface WeaponPart {
  id: string;
  name: string;
  category: string;
  material: string;
  rarity: string;
  tags: string[];
  draw: (ctx: CanvasRenderingContext2D) => void;
}

import { shade as shadeUtil, addGritPx, rimLightPx as rimLightPxUtil } from './canvasUtils';

// ─── Helpers ────────────────────────────────────────────────────────────────

function outline(ctx: CanvasRenderingContext2D, color = "#0d0d0d", lw = 3.5) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 2;
  ctx.stroke();
  ctx.restore();
}

function rimLight(ctx: CanvasRenderingContext2D, color = "rgba(255,255,255,0.4)", lw = 2.5) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineJoin = "round";
  ctx.stroke();
  ctx.restore();
}

function addNoise(ctx: CanvasRenderingContext2D, opacity = 0.05) {
  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  for (let i = 0; i < 500; i++) {
    const x = Math.random() * 128;
    const y = Math.random() * 128;
    ctx.fillStyle = Math.random() > 0.5 ? `rgba(255,255,255,${opacity})` : `rgba(0,0,0,${opacity})`;
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.restore();
}

function addGrit(ctx: CanvasRenderingContext2D, opacity = 0.12) {
  ctx.save();
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * 128;
    const y = Math.random() * 128;
    const s = 0.5 + Math.random() * 1.5;
    ctx.fillStyle = `rgba(0,0,0,${opacity})`;
    ctx.fillRect(x, y, s, s);
  }
  ctx.restore();
}

function shine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, alpha = 0.6) {
  ctx.save();
  const g = ctx.createLinearGradient(x1, y1, x2, y2);
  g.addColorStop(0, `rgba(255,255,255,0)`);
  g.addColorStop(0.5, `rgba(255,255,255,${alpha})`);
  g.addColorStop(1, `rgba(255,255,255,0)`);
  ctx.strokeStyle = g;
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

function gem(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, c1: string, c2: string) {
  ctx.save();
  // Deep Glow
  const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
  glow.addColorStop(0, c1 + "aa");
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.globalCompositeOperation = "screen";
  ctx.beginPath(); ctx.arc(x, y, r * 3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // Body — hexagonal facet
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.lineTo(x + r * 0.85, y - r * 0.4);
  ctx.lineTo(x + r * 0.85, y + r * 0.4);
  ctx.lineTo(x, y + r);
  ctx.lineTo(x - r * 0.85, y + r * 0.4);
  ctx.lineTo(x - r * 0.85, y - r * 0.4);
  ctx.closePath();
  const g = ctx.createRadialGradient(x - r * 0.4, y - r * 0.5, 0, x, y, r * 1.4);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(0.2, c1);
  g.addColorStop(0.8, c2);
  g.addColorStop(1, shadeUtil(c2, -40));
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.9)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Internal facets - Star pattern
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    ctx.moveTo(x, y);
    ctx.lineTo(x + r * 0.85 * Math.cos(a), y + r * 0.85 * Math.sin(a));
  }
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Rim highlight
  ctx.beginPath();
  ctx.moveTo(x - r * 0.6, y - r * 0.7);
  ctx.lineTo(x, y - r);
  ctx.lineTo(x + r * 0.6, y - r * 0.7);
  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Sparkle
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.beginPath(); ctx.arc(x - r * 0.35, y - r * 0.45, r * 0.3, 0, Math.PI * 2); ctx.fill();
}

function smallGem(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, c1: string, c2: string) {
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
  g.addColorStop(0, "#fff"); g.addColorStop(0.3, c1); g.addColorStop(1, c2);
  ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.7)"; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function glow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(0.4, color);
  g.addColorStop(1, "transparent");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function rune(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, color: string) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.8;
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.moveTo(x, y - s); ctx.lineTo(x, y + s);
  ctx.moveTo(x - s, y); ctx.lineTo(x + s, y);
  ctx.moveTo(x - s * 0.7, y - s * 0.7); ctx.lineTo(x + s * 0.7, y + s * 0.7);
  ctx.stroke();
  ctx.restore();
}

// ─── BLADE HELPERS ───────────────────────────────────────────────────────────

function bladePath(ctx: CanvasRenderingContext2D, cx: number, top: number, bottom: number, bw: number, tw = 1) {
  ctx.beginPath();
  ctx.moveTo(cx, top);
  ctx.lineTo(cx + bw, top + (bottom - top) * 0.18);
  ctx.lineTo(cx + tw, bottom);
  ctx.lineTo(cx - tw, bottom);
  ctx.lineTo(cx - bw, top + (bottom - top) * 0.18);
  ctx.closePath();
}

function drawBlade(
  ctx: CanvasRenderingContext2D,
  cx: number, top: number, bottom: number, bw: number,
  leftColor: string, centerColor: string, rightColor: string,
  outlineColor = "#0d0d0d"
) {
  bladePath(ctx, cx, top, bottom, bw);
  // Left face
  const lg = ctx.createLinearGradient(cx - bw, 0, cx + 2, 0);
  lg.addColorStop(0, leftColor); lg.addColorStop(1, centerColor);
  ctx.fillStyle = lg; ctx.fill();
  // Right face overlay
  ctx.save(); ctx.clip();
  const rg = ctx.createLinearGradient(cx, 0, cx + bw, 0);
  rg.addColorStop(0, centerColor); rg.addColorStop(1, rightColor);
  ctx.fillStyle = rg;
  ctx.beginPath(); ctx.moveTo(cx, top); ctx.lineTo(cx + bw, top + (bottom - top) * 0.18); ctx.lineTo(cx, bottom); ctx.closePath();
  ctx.fill(); ctx.restore();

  // Painterly Enhancements
  ctx.save();
  bladePath(ctx, cx, top, bottom, bw);
  ctx.clip();
  rimLight(ctx, "rgba(255,255,255,0.25)", 4);
  addNoise(ctx, 0.04);
  ctx.restore();

  bladePath(ctx, cx, top, bottom, bw);
  outline(ctx, outlineColor, 3.5);

  // High-fidelity additions
  addGritPx(ctx, cx - bw, top, bw * 2, bottom - top, 0.08);
  rimLightPxUtil(ctx, cx - bw, top, bw * 2, bottom - top, 'rgba(255,255,255,0.15)');

  // Center ridge
  ctx.beginPath(); ctx.moveTo(cx, top + 4); ctx.lineTo(cx, bottom - 4);
  ctx.strokeStyle = "rgba(255,255,255,0.55)"; ctx.lineWidth = 1.8; ctx.stroke();
}

// ─── SWORD BLADES ────────────────────────────────────────────────────────────

function drawSwordBladeIron(ctx: CanvasRenderingContext2D) {
  const cx = 64, top = 8, bot = 108, bw = 13;
  drawBlade(ctx, cx, top, bot, bw, "#3a3a3a", "#c0c0c0", "#232323");

  // Deep blood groove (fuller) — offset left for visual depth
  ctx.beginPath(); ctx.moveTo(cx - 2, top + 26); ctx.lineTo(cx - 2, bot - 10);
  ctx.strokeStyle = "rgba(0,0,0,0.45)"; ctx.lineWidth = 3; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - 1, top + 26); ctx.lineTo(cx - 1, bot - 10);
  ctx.strokeStyle = "rgba(255,255,255,0.22)"; ctx.lineWidth = 1; ctx.stroke();

  // Ricasso (unhoned base section — slightly darker zone)
  ctx.beginPath(); ctx.roundRect(cx - bw + 3, top + (bot-top) * 0.17, bw * 2 - 6, 9, 1);
  ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.fill();

  // Sharp-edge flash (right bevel catch)
  ctx.beginPath(); ctx.moveTo(cx + bw - 2, top + 22); ctx.lineTo(cx + bw - 2, bot - 8);
  ctx.strokeStyle = "rgba(255,255,255,0.55)"; ctx.lineWidth = 1.5; ctx.stroke();

  shine(ctx, cx - bw + 3, top + 22, cx - bw + 3, bot - 10, 0.45);
  addGrit(ctx, 0.09);
  addNoise(ctx, 0.03);
}

function drawSwordBladeSteel(ctx: CanvasRenderingContext2D) {
  // Two-fullered blade — bright silver
  const cx = 64, top = 5, bot = 108, bw = 14;
  drawBlade(ctx, cx, top, bot, bw, "#607080", "#f0f5f9", "#405060");

  // Fuller grooves
  for (const fx of [cx - 4, cx + 4]) {
    ctx.beginPath(); ctx.moveTo(fx, top + 24); ctx.lineTo(fx, bot - 4);
    ctx.strokeStyle = "rgba(20,30,40,0.4)"; ctx.lineWidth = 3; ctx.stroke();
    // Inner fuller highlight
    ctx.beginPath(); ctx.moveTo(fx + 1, top + 25); ctx.lineTo(fx + 1, bot - 5);
    ctx.strokeStyle = "rgba(255,255,255,0.15)"; ctx.lineWidth = 1; ctx.stroke();
  }

  shine(ctx, cx - bw + 3, top + 20, cx - bw + 3, bot - 4, 0.4);
  // Edge flash
  ctx.beginPath(); ctx.moveTo(cx + bw - 2.5, top + 20); ctx.lineTo(cx + bw - 2.5, bot - 6);
  ctx.strokeStyle = "rgba(255,255,255,0.45)"; ctx.lineWidth = 1.5; ctx.stroke();

  ctx.save();
  bladePath(ctx, cx, top, bot, bw);
  ctx.clip();
  addNoise(ctx, 0.03);
  ctx.restore();
}

function drawSwordBladeVoid(ctx: CanvasRenderingContext2D) {
  const cx = 64, top = 6, bot = 110, bw = 14;

  const voidPath = () => {
    ctx.beginPath();
    ctx.moveTo(cx, top);
    ctx.lineTo(cx + bw, top + 22);
    let y = top + 22;
    while (y < bot) {
      ctx.lineTo(cx + bw - 7, y + 8);
      ctx.lineTo(cx + bw, y + 16);
      y += 16;
    }
    ctx.lineTo(cx, bot);
    ctx.lineTo(cx - bw, bot);
    ctx.lineTo(cx - bw, top + 22);
    ctx.closePath();
  };

  voidPath();
  const lg = ctx.createLinearGradient(cx - bw, 0, cx + bw, 0);
  lg.addColorStop(0, "#0d001a"); lg.addColorStop(0.4, "#4a0a7a"); lg.addColorStop(1, "#8a20c0");
  ctx.fillStyle = lg;
  ctx.shadowColor = "#b060ff"; ctx.shadowBlur = 12;
  ctx.fill(); ctx.shadowBlur = 0;

  ctx.save();
  voidPath(); ctx.clip();
  rimLight(ctx, "rgba(180,100,255,0.3)", 4);
  addNoise(ctx, 0.06);
  ctx.restore();

  voidPath();
  outline(ctx, "#0d0014", 3.5);

  // Purple edge glow on serrations
  ctx.beginPath(); ctx.moveTo(cx + bw, top + 22);
  let y = top + 22;
  while (y < bot) {
    ctx.lineTo(cx + bw - 7, y + 8); ctx.lineTo(cx + bw, y + 16); y += 16;
  }
  ctx.strokeStyle = "#d080ff"; ctx.lineWidth = 1.8; ctx.stroke();

  rune(ctx, cx - 4, bot - 28, 4, "#c87aff");
  rune(ctx, cx - 4, bot - 52, 4, "#c87aff");

  // Center ridge
  ctx.beginPath(); ctx.moveTo(cx, top + 6); ctx.lineTo(cx, bot - 4);
  ctx.strokeStyle = "rgba(200,130,255,0.4)"; ctx.lineWidth = 1.5; ctx.stroke();

  glow(ctx, cx, bot - 40, 25, "rgba(100,20,200,0.15)");
}

function drawSwordBladeRoyal(ctx: CanvasRenderingContext2D) {
  // Wide leaf-shaped blade, gold with blue royal stripe
  const cx = 64, top = 10, bot = 108;
  const leafPath = () => {
    ctx.beginPath();
    ctx.moveTo(cx, top);
    ctx.bezierCurveTo(cx + 22, top + 20, cx + 20, top + 55, cx + 14, bot);
    ctx.lineTo(cx - 14, bot);
    ctx.bezierCurveTo(cx - 20, top + 55, cx - 22, top + 20, cx, top);
    ctx.closePath();
  };

  leafPath();
  const lg = ctx.createLinearGradient(cx - 20, 0, cx + 20, 0);
  lg.addColorStop(0, "#8a6000"); lg.addColorStop(0.35, "#f9c84a"); lg.addColorStop(0.5, "#fff5b0"); lg.addColorStop(0.65, "#e8a800"); lg.addColorStop(1, "#705000");
  ctx.fillStyle = lg; ctx.fill();

  ctx.save();
  leafPath(); ctx.clip();
  rimLight(ctx, "rgba(255,255,255,0.3)", 5);
  addNoise(ctx, 0.03);
  ctx.restore();

  leafPath();
  outline(ctx, "#1a0a00", 3.5);

  // Royal blue center stripe
  ctx.beginPath(); ctx.moveTo(cx, top + 14); ctx.lineTo(cx, bot - 2);
  ctx.strokeStyle = "#1a50c0"; ctx.lineWidth = 6; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, top + 14); ctx.lineTo(cx, bot - 2);
  ctx.strokeStyle = "rgba(100,200,255,0.4)"; ctx.lineWidth = 1.5; ctx.stroke();

  // Fleur diamond marks on stripe
  for (const dy of [bot - 30, bot - 55, bot - 80]) {
    smallGem(ctx, cx, dy, 4.5, "#4aa0ff", "#0a2080");
  }
  shine(ctx, cx - 18, top + 22, cx - 12, bot - 12, 0.5);
  addGrit(ctx, 0.05);
}

function drawSwordBladeCursed(ctx: CanvasRenderingContext2D) {
  // Flame-edged blade, dark red
  const cx = 64, top = 8, bot = 110, bw = 12;

  const cursedPath = () => {
    ctx.beginPath(); ctx.moveTo(cx, top);
    // Flame waves on left side
    ctx.lineTo(cx + bw, top + 20);
    ctx.lineTo(cx + bw, bot);
    ctx.lineTo(cx - bw, bot);
    let fy = bot;
    while (fy > top + 20) {
      ctx.lineTo(cx - bw + 10, fy - 8);
      ctx.lineTo(cx - bw, fy - 16);
      fy -= 16;
    }
    ctx.closePath();
  };

  cursedPath();
  const lg = ctx.createLinearGradient(cx - bw, 0, cx + bw, 0);
  lg.addColorStop(0, "#220000"); lg.addColorStop(0.3, "#8b0000"); lg.addColorStop(0.7, "#cc2200"); lg.addColorStop(1, "#ff5500");
  ctx.fillStyle = lg;
  ctx.shadowColor = "#ff3300"; ctx.shadowBlur = 15;
  ctx.fill(); ctx.shadowBlur = 0;

  ctx.save();
  cursedPath(); ctx.clip();
  rimLight(ctx, "rgba(255,150,0,0.3)", 4);
  addNoise(ctx, 0.07);
  ctx.restore();

  cursedPath();
  outline(ctx, "#0d0000", 3.5);

  // Ember dots along flame edge
  for (let ey = bot - 8; ey > top + 28; ey -= 16) {
    ctx.beginPath(); ctx.arc(cx - bw + 6, ey, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = "#ffaa00";
    ctx.shadowColor = "#ffaa00"; ctx.shadowBlur = 4;
    ctx.fill(); ctx.shadowBlur = 0;
  }

  // Crack lines on blade face
  ctx.strokeStyle = "rgba(255,80,0,0.6)"; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(cx + 2, top + 30); ctx.lineTo(cx + 8, top + 55); ctx.lineTo(cx + 4, top + 70); ctx.stroke();

  // Center ridge
  ctx.beginPath(); ctx.moveTo(cx, top + 6); ctx.lineTo(cx, bot - 4);
  ctx.strokeStyle = "rgba(255,120,30,0.5)"; ctx.lineWidth = 1.8; ctx.stroke();

  glow(ctx, cx, 64, 30, "rgba(255,50,0,0.15)");
}

// ─── NEW BLADES ───────────────────────────────────────────────────────────────

function drawSwordBladeForest(ctx: CanvasRenderingContext2D) {
  // Green nature blade with vine etchings
  const cx = 64, top = 8, bot = 108, bw = 13;
  drawBlade(ctx, cx, top, bot, bw, "#1b3a1b", "#4a8a40", "#0d2010");

  // Vine etching
  ctx.strokeStyle = "rgba(120,220,80,0.7)"; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - 2, top + 20);
  ctx.bezierCurveTo(cx + 6, top + 40, cx - 6, top + 60, cx + 4, top + 90);
  ctx.stroke();

  for (const [vx, vy] of [[cx + 5, top + 38], [cx - 5, top + 60], [cx + 5, top + 80]]) {
    ctx.beginPath(); ctx.arc(vx, vy, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(100,240,80,0.8)";
    ctx.shadowColor = "rgba(100,240,80,0.5)"; ctx.shadowBlur = 4;
    ctx.fill(); ctx.shadowBlur = 0;
  }

  shine(ctx, cx - bw + 3, top + 18, cx - bw + 3, bot - 5, 0.4);
  addNoise(ctx, 0.04);
}

function drawSwordBladeFrost(ctx: CanvasRenderingContext2D) {
  // Ice blade — translucent blue
  const cx = 64, top = 5, bot = 110, bw = 13;
  drawBlade(ctx, cx, top, bot, bw, "#0a5080", "#a8e4f8", "#0a3055");

  // Ice crystal veins
  ctx.strokeStyle = "rgba(200,240,255,0.8)"; ctx.lineWidth = 1.2;
  for (const [sx, sy, ex, ey] of [
    [cx - 3, top + 20, cx + 7, top + 45],
    [cx + 2, top + 50, cx - 6, top + 75],
    [cx - 4, top + 80, cx + 6, top + 100],
  ]) {
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex + 5, ey - 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - 5, ey - 6); ctx.stroke();
  }

  ctx.shadowColor = "#60d0ff"; ctx.shadowBlur = 10;
  shine(ctx, cx - bw + 2, top + 18, cx - bw + 2, bot - 5, 0.6);
  ctx.shadowBlur = 0;

  glow(ctx, cx, 64, 40, "rgba(100,200,255,0.1)");
}

function drawSwordBladeAncient(ctx: CanvasRenderingContext2D) {
  // Weathered bronze/copper ancient blade
  const cx = 64, top = 8, bot = 108, bw = 14;
  drawBlade(ctx, cx, top, bot, bw, "#5c3a10", "#c08040", "#3a2008");

  // Green patina patches
  for (const [px, py, pr] of [[cx - 5, top + 30, 6], [cx + 4, top + 55, 5], [cx - 3, top + 80, 5]]) {
    ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(80,160,80,0.5)";
    ctx.fill();
    // Inner patina texture
    ctx.beginPath(); ctx.arc(px + 1, py + 1, pr * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(100,200,100,0.2)"; ctx.fill();
  }

  // Chipped edge marks
  ctx.strokeStyle = "rgba(40,20,0,0.6)"; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(cx + bw - 2, top + 35); ctx.lineTo(cx + bw - 5, top + 42); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + bw - 2, top + 70); ctx.lineTo(cx + bw - 6, top + 76); ctx.stroke();

  shine(ctx, cx - bw + 3, top + 20, cx - bw + 3, bot - 8, 0.4);
  addGrit(ctx, 0.15);
  addNoise(ctx, 0.05);
}

// ─── SWORD GUARDS ─────────────────────────────────────────────────────────────

function drawGuardSimpleIron(ctx: CanvasRenderingContext2D) {
  // Simple crossguard bar
  const cx = 64, cy = 64, hw = 42, h = 12;
  ctx.beginPath(); ctx.roundRect(cx - hw, cy - h / 2, hw * 2, h, 4);
  const lg = ctx.createLinearGradient(0, cy - h, 0, cy + h);
  lg.addColorStop(0, "#b0b0b0"); lg.addColorStop(0.4, "#e0e0e0"); lg.addColorStop(1, "#505050");
  ctx.fillStyle = lg; ctx.fill();
  outline(ctx, "#1a1a1a", 3);
  shine(ctx, cx - hw + 5, cy - h / 2 + 2, cx + hw - 5, cy - h / 2 + 2);
  // End caps
  for (const ex of [cx - hw + 5, cx + hw - 5]) {
    ctx.beginPath(); ctx.arc(ex, cy, h / 2 + 2, 0, Math.PI * 2);
    const g2 = ctx.createRadialGradient(ex - 1, cy - 1, 0, ex, cy, h / 2 + 2);
    g2.addColorStop(0, "#d0d0d0"); g2.addColorStop(1, "#404040");
    ctx.fillStyle = g2; ctx.fill();
    outline(ctx, "#1a1a1a", 2.5);
  }
}

function drawGuardOrnateGold(ctx: CanvasRenderingContext2D) {
  // Winged gold guard
  const cx = 64, cy = 64;
  const lg = ctx.createLinearGradient(0, cy - 16, 0, cy + 10);
  lg.addColorStop(0, "#fff176"); lg.addColorStop(0.5, "#f9a825"); lg.addColorStop(1, "#bf6c00");

  // Left wing
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy - 8);
  ctx.bezierCurveTo(cx - 22, cy - 30, cx - 52, cy - 22, cx - 50, cy - 6);
  ctx.bezierCurveTo(cx - 48, cy + 6, cx - 28, cy + 8, cx - 6, cy + 8);
  ctx.closePath();
  ctx.fillStyle = lg; ctx.fill(); outline(ctx, "#1a0a00", 3);

  // Right wing (mirror)
  ctx.save(); ctx.translate(cx * 2, 0); ctx.scale(-1, 1);
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy - 8);
  ctx.bezierCurveTo(cx - 22, cy - 30, cx - 52, cy - 22, cx - 50, cy - 6);
  ctx.bezierCurveTo(cx - 48, cy + 6, cx - 28, cy + 8, cx - 6, cy + 8);
  ctx.closePath();
  ctx.fillStyle = lg; ctx.fill(); outline(ctx, "#1a0a00", 3); ctx.restore();

  // Center collar
  ctx.beginPath(); ctx.ellipse(cx, cy, 10, 10, 0, 0, Math.PI * 2);
  const cg = ctx.createRadialGradient(cx - 2, cy - 3, 0, cx, cy, 10);
  cg.addColorStop(0, "#fff176"); cg.addColorStop(1, "#bf6c00");
  ctx.fillStyle = cg; ctx.fill(); outline(ctx, "#1a0a00", 2.5);
  gem(ctx, cx, cy, 7, "#2196f3", "#0a1a60");
  shine(ctx, cx - 48, cy - 10, cx - 20, cy - 22);
  shine(ctx, cx + 20, cy - 22, cx + 48, cy - 10);
}

function drawGuardCrown(ctx: CanvasRenderingContext2D) {
  // Crown/royal guard — three upward prongs
  const cx = 64, cy = 64;
  const lg = ctx.createLinearGradient(cx - 45, 0, cx + 45, 0);
  lg.addColorStop(0, "#0a3080"); lg.addColorStop(0.5, "#4080e0"); lg.addColorStop(1, "#0a3080");

  // Base bar
  ctx.beginPath(); ctx.roundRect(cx - 44, cy - 8, 88, 18, 4);
  ctx.fillStyle = lg; ctx.fill(); outline(ctx, "#001133", 3);

  // Gold border
  ctx.beginPath(); ctx.roundRect(cx - 44, cy - 8, 88, 18, 4);
  ctx.strokeStyle = "#f9c825"; ctx.lineWidth = 2; ctx.stroke();

  // Three prongs
  for (const [px, ph] of [[cx - 28, 24], [cx, 34], [cx + 28, 24]]) {
    ctx.beginPath(); ctx.roundRect(px - 7, cy - 8 - ph, 14, ph + 4, 3);
    ctx.fillStyle = lg; ctx.fill(); outline(ctx, "#001133", 2.5);
    ctx.beginPath(); ctx.roundRect(px - 7, cy - 8 - ph, 14, ph + 4, 3);
    ctx.strokeStyle = "#f9c825"; ctx.lineWidth = 1.5; ctx.stroke();
  }

  // Gems on prong tips
  gem(ctx, cx, cy - 42, 6, "#4fc3f7", "#003366");
  smallGem(ctx, cx - 28, cy - 32, 4.5, "#9c27b0", "#1a0033");
  smallGem(ctx, cx + 28, cy - 32, 4.5, "#9c27b0", "#1a0033");
}

function drawGuardBoneSkull(ctx: CanvasRenderingContext2D) {
  // Bone guard with skull ends
  const cx = 64, cy = 64;
  ctx.beginPath(); ctx.roundRect(cx - 44, cy - 7, 88, 14, 3);
  const lg = ctx.createLinearGradient(0, cy - 7, 0, cy + 7);
  lg.addColorStop(0, "#fffde7"); lg.addColorStop(0.5, "#f0e8c0"); lg.addColorStop(1, "#c8b080");
  ctx.fillStyle = lg; ctx.fill(); outline(ctx, "#1a1000", 3);
  // Grain lines
  for (let gx = cx - 30; gx < cx + 40; gx += 12) {
    ctx.beginPath(); ctx.moveTo(gx, cy - 5); ctx.lineTo(gx + 4, cy + 5);
    ctx.strokeStyle = "rgba(140,100,40,0.3)"; ctx.lineWidth = 1; ctx.stroke();
  }
  // Skull circles at ends
  for (const [sx, sy] of [[cx - 42, cy], [cx + 42, cy]]) {
    ctx.beginPath(); ctx.arc(sx, sy, 10, 0, Math.PI * 2);
    ctx.fillStyle = "#f5f0dc"; ctx.fill(); outline(ctx, "#1a1000", 2.5);
    ctx.fillStyle = "#1a1000";
    ctx.beginPath(); ctx.arc(sx - 3, sy - 2, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(sx + 3, sy - 2, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.roundRect(sx - 3, sy + 2, 6, 4, 1); ctx.fill();
  }
}

function drawGuardVoidTwist(ctx: CanvasRenderingContext2D) {
  // Void guard — two downward curling horns
  const cx = 64, cy = 64;
  const lg = ctx.createLinearGradient(cx - 50, 0, cx + 50, 0);
  lg.addColorStop(0, "#0d0020"); lg.addColorStop(0.5, "#5a0a9a"); lg.addColorStop(1, "#0d0020");

  // Left horn curling down
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy - 6);
  ctx.bezierCurveTo(cx - 30, cy - 10, cx - 52, cy, cx - 48, cy + 22);
  ctx.bezierCurveTo(cx - 46, cy + 32, cx - 34, cy + 28, cx - 28, cy + 18);
  ctx.bezierCurveTo(cx - 22, cy + 8, cx - 14, cy + 4, cx - 8, cy + 6);
  ctx.closePath();
  ctx.shadowColor = "#b060ff"; ctx.shadowBlur = 10;
  ctx.fillStyle = lg; ctx.fill(); ctx.shadowBlur = 0; outline(ctx, "#0d0014", 3);

  // Right horn (mirror)
  ctx.save(); ctx.translate(cx * 2, 0); ctx.scale(-1, 1);
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy - 6);
  ctx.bezierCurveTo(cx - 30, cy - 10, cx - 52, cy, cx - 48, cy + 22);
  ctx.bezierCurveTo(cx - 46, cy + 32, cx - 34, cy + 28, cx - 28, cy + 18);
  ctx.bezierCurveTo(cx - 22, cy + 8, cx - 14, cy + 4, cx - 8, cy + 6);
  ctx.closePath();
  ctx.fillStyle = lg; ctx.fill(); outline(ctx, "#0d0014", 3); ctx.restore();

  // Central void eye
  ctx.beginPath(); ctx.ellipse(cx, cy, 9, 9, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#0d0020"; ctx.fill(); outline(ctx, "#0d0014", 2);
  ctx.beginPath(); ctx.ellipse(cx, cy, 5, 5, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#b060ff"; ctx.fill();
  glow(ctx, cx, cy, 14, "rgba(140,40,255,0.4)");
}

function drawGuardFireWings(ctx: CanvasRenderingContext2D) {
  const cx = 64, cy = 64;
  const lg = ctx.createLinearGradient(cx - 50, cy - 20, cx + 50, cy + 10);
  lg.addColorStop(0, "#bf360c"); lg.addColorStop(0.5, "#ff6f00"); lg.addColorStop(1, "#bf360c");
  // Swept wings
  for (const side of [-1, 1]) {
    ctx.save(); if (side === -1) { ctx.translate(cx * 2, 0); ctx.scale(-1, 1); }
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy);
    ctx.bezierCurveTo(cx - 18, cy - 18, cx - 48, cy - 12, cx - 52, cy + 2);
    ctx.bezierCurveTo(cx - 50, cy + 12, cx - 30, cy + 10, cx - 8, cy + 6);
    ctx.closePath();
    ctx.fillStyle = lg; ctx.fill(); outline(ctx, "#1a0800", 3);
    // Flame tips
    for (const [fx, fy] of [[cx - 50, cy - 4], [cx - 42, cy - 14]]) {
      ctx.beginPath(); ctx.arc(fx, fy, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#ffcc00"; ctx.fill();
    }
    ctx.restore();
  }
  ctx.beginPath(); ctx.ellipse(cx, cy, 9, 9, 0, 0, Math.PI * 2);
  const cg = ctx.createRadialGradient(cx - 2, cy - 2, 0, cx, cy, 9);
  cg.addColorStop(0, "#fff176"); cg.addColorStop(1, "#bf360c");
  ctx.fillStyle = cg; ctx.fill(); outline(ctx, "#1a0800", 2.5);
}

// ─── SWORD HANDLES ────────────────────────────────────────────────────────────

function drawHandleLeather(ctx: CanvasRenderingContext2D) {
  const cx = 64, top = 26, bot = 94, hw = 8;
  // Grip base
  ctx.beginPath(); ctx.roundRect(cx - hw, top, hw * 2, bot - top, 3);
  const lg = ctx.createLinearGradient(cx - hw, 0, cx + hw, 0);
  lg.addColorStop(0, "#3e1f0a"); lg.addColorStop(0.5, "#8b4520"); lg.addColorStop(1, "#3e1f0a");
  ctx.fillStyle = lg; ctx.fill(); outline(ctx, "#1a0800", 3);
  // Leather wrapping diagonal strips
  ctx.save(); ctx.clip();
  const stripW = 12;
  for (let sy = top - 10; sy < bot + 10; sy += stripW) {
    ctx.beginPath();
    ctx.moveTo(cx - hw, sy);
    ctx.lineTo(cx + hw, sy + 6);
    ctx.lineTo(cx + hw, sy + 6 + 4);
    ctx.lineTo(cx - hw, sy + 4);
    ctx.closePath();
    ctx.fillStyle = "rgba(60,25,5,0.55)";
    ctx.fill();
  }
  ctx.restore();
  // Ferrule rings
  for (const ry of [top, top + 8, bot - 8, bot]) {
    ctx.beginPath(); ctx.roundRect(cx - hw - 1, ry - 3, hw * 2 + 2, 6, 1);
    const rg = ctx.createLinearGradient(0, ry - 3, 0, ry + 3);
    rg.addColorStop(0, "#aaa"); rg.addColorStop(0.5, "#fff"); rg.addColorStop(1, "#666");
    ctx.fillStyle = rg; ctx.fill(); outline(ctx, "#111", 1.5);
  }
}

function drawHandleBone(ctx: CanvasRenderingContext2D) {
  const cx = 64, top = 26, bot = 94, hw = 7;
  ctx.beginPath(); ctx.roundRect(cx - hw, top, hw * 2, bot - top, 3);
  const lg = ctx.createLinearGradient(cx - hw, 0, cx + hw, 0);
  lg.addColorStop(0, "#c8b080"); lg.addColorStop(0.5, "#fffde7"); lg.addColorStop(1, "#b09060");
  ctx.fillStyle = lg; ctx.fill(); outline(ctx, "#1a1000", 3);
  // Rib rings
  for (let ry = top + 10; ry < bot; ry += 14) {
    ctx.beginPath(); ctx.roundRect(cx - hw, ry, hw * 2, 6, 2);
    ctx.fillStyle = "rgba(100,70,20,0.3)"; ctx.fill();
    ctx.strokeStyle = "rgba(100,70,20,0.5)"; ctx.lineWidth = 1; ctx.stroke();
  }
  // Grain lines
  ctx.strokeStyle = "rgba(140,100,40,0.3)"; ctx.lineWidth = 1;
  for (const gx of [cx - 3, cx + 2]) {
    ctx.beginPath(); ctx.moveTo(gx, top + 12); ctx.lineTo(gx, bot - 12); ctx.stroke();
  }
}

function drawHandleCrystal(ctx: CanvasRenderingContext2D) {
  const cx = 64, top = 26, bot = 94, hw = 9;
  // Hexagonal facets
  ctx.beginPath();
  ctx.moveTo(cx - hw, top + 6);
  ctx.lineTo(cx, top);
  ctx.lineTo(cx + hw, top + 6);
  ctx.lineTo(cx + hw, bot - 6);
  ctx.lineTo(cx, bot);
  ctx.lineTo(cx - hw, bot - 6);
  ctx.closePath();
  const lg = ctx.createLinearGradient(cx - hw, 0, cx + hw, 0);
  lg.addColorStop(0, "#004466"); lg.addColorStop(0.35, "#00bcd4"); lg.addColorStop(0.5, "#e0f7fa"); lg.addColorStop(0.65, "#0097a7"); lg.addColorStop(1, "#003344");
  ctx.shadowColor = "#00e5ff"; ctx.shadowBlur = 12;
  ctx.fillStyle = lg; ctx.fill(); ctx.shadowBlur = 0; outline(ctx, "#001a1a", 3);
  // Internal refraction lines
  ctx.strokeStyle = "rgba(200,240,255,0.55)"; ctx.lineWidth = 1;
  for (const [sx, sy, ex, ey] of [
    [cx - 6, top + 15, cx + 5, top + 35],
    [cx + 4, top + 50, cx - 5, top + 70],
    [cx - 5, top + 78, cx + 4, top + 90],
  ]) { ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke(); }
}

function drawHandleRoyal(ctx: CanvasRenderingContext2D) {
  const cx = 64, top = 26, bot = 94, hw = 8;
  ctx.beginPath(); ctx.roundRect(cx - hw, top, hw * 2, bot - top, 3);
  const lg = ctx.createLinearGradient(cx - hw, 0, cx + hw, 0);
  lg.addColorStop(0, "#0a2050"); lg.addColorStop(0.5, "#1a4090"); lg.addColorStop(1, "#0a2050");
  ctx.fillStyle = lg; ctx.fill(); outline(ctx, "#001133", 3);
  // Gold X wire wrapping
  ctx.strokeStyle = "#f9c825"; ctx.lineWidth = 2.5;
  for (let wy = top + 5; wy < bot - 5; wy += 12) {
    ctx.beginPath(); ctx.moveTo(cx - hw, wy); ctx.lineTo(cx + hw, wy + 12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + hw, wy); ctx.lineTo(cx - hw, wy + 12); ctx.stroke();
  }
  // Gold ferrules
  for (const ry of [top, bot - 7]) {
    ctx.beginPath(); ctx.roundRect(cx - hw - 1, ry, hw * 2 + 2, 7, 1);
    const rg = ctx.createLinearGradient(0, ry, 0, ry + 7);
    rg.addColorStop(0, "#fff176"); rg.addColorStop(1, "#bf6c00");
    ctx.fillStyle = rg; ctx.fill(); outline(ctx, "#1a0a00", 2);
  }
}

function drawHandleVoid(ctx: CanvasRenderingContext2D) {
  const cx = 64, top = 26, bot = 94, hw = 8;
  ctx.beginPath(); ctx.roundRect(cx - hw, top, hw * 2, bot - top, 3);
  const lg = ctx.createLinearGradient(cx - hw, 0, cx + hw, 0);
  lg.addColorStop(0, "#050010"); lg.addColorStop(0.5, "#1a003a"); lg.addColorStop(1, "#050010");
  ctx.fillStyle = lg; ctx.fill(); outline(ctx, "#0d0014", 3);
  // Purple energy cracks
  ctx.strokeStyle = "#c060ff"; ctx.lineWidth = 1.2;
  for (const [sx, sy, ex, ey] of [
    [cx - 3, top + 15, cx + 5, top + 30],
    [cx + 2, top + 40, cx - 4, top + 55],
    [cx - 2, top + 68, cx + 4, top + 80],
  ]) {
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.shadowColor = "#c060ff"; ctx.shadowBlur = 6; ctx.stroke(); ctx.shadowBlur = 0;
  }
}

// ─── SWORD POMMELS ────────────────────────────────────────────────────────────

function drawPommelIron(ctx: CanvasRenderingContext2D) {
  const cx = 64, cy = 98;
  ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI * 2);
  const g = ctx.createRadialGradient(cx - 3, cy - 3, 0, cx, cy, 12);
  g.addColorStop(0, "#d0d0d0"); g.addColorStop(0.6, "#888"); g.addColorStop(1, "#333");
  ctx.fillStyle = g; ctx.fill(); outline(ctx, "#1a1a1a", 3);
  shine(ctx, cx - 5, cy - 5, cx + 2, cy - 3, 0.6);
}

function drawPommelGold(ctx: CanvasRenderingContext2D) {
  const cx = 64, cy = 98, r = 13;
  // Octagonal shape
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 8;
    i === 0 ? ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a)) : ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
  }
  ctx.closePath();
  const g = ctx.createRadialGradient(cx - 4, cy - 4, 0, cx, cy, r);
  g.addColorStop(0, "#fff176"); g.addColorStop(0.5, "#f9a825"); g.addColorStop(1, "#7a4800");
  ctx.fillStyle = g; ctx.fill(); outline(ctx, "#1a0a00", 3);
  gem(ctx, cx, cy, 6, "#2196f3", "#0a1a50");
}

function drawPommelCrystal(ctx: CanvasRenderingContext2D) {
  const cx = 64, cy = 100;
  // Teardrop
  ctx.beginPath();
  ctx.moveTo(cx, cy - 16);
  ctx.bezierCurveTo(cx + 12, cy - 10, cx + 12, cy + 8, cx, cy + 14);
  ctx.bezierCurveTo(cx - 12, cy + 8, cx - 12, cy - 10, cx, cy - 16);
  ctx.closePath();
  const g = ctx.createRadialGradient(cx - 3, cy - 5, 0, cx, cy, 14);
  g.addColorStop(0, "#ffffff"); g.addColorStop(0.3, "#4fc3f7"); g.addColorStop(1, "#003366");
  ctx.shadowColor = "#00e5ff"; ctx.shadowBlur = 14;
  ctx.fillStyle = g; ctx.fill(); ctx.shadowBlur = 0; outline(ctx, "#001a1a", 3);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.beginPath(); ctx.ellipse(cx - 3, cy - 5, 3, 5, -0.3, 0, Math.PI * 2); ctx.fill();
}

function drawPommelRoyal(ctx: CanvasRenderingContext2D) {
  // Crown shape
  const cx = 64, cy = 100;
  ctx.beginPath();
  ctx.moveTo(cx - 14, cy + 10);
  ctx.lineTo(cx - 14, cy - 6);
  ctx.lineTo(cx - 8, cy - 14);
  ctx.lineTo(cx - 2, cy - 6);
  ctx.lineTo(cx, cy - 18);
  ctx.lineTo(cx + 2, cy - 6);
  ctx.lineTo(cx + 8, cy - 14);
  ctx.lineTo(cx + 14, cy - 6);
  ctx.lineTo(cx + 14, cy + 10);
  ctx.closePath();
  const lg = ctx.createLinearGradient(cx - 14, 0, cx + 14, 0);
  lg.addColorStop(0, "#0a3080"); lg.addColorStop(0.5, "#4080e0"); lg.addColorStop(1, "#0a3080");
  ctx.fillStyle = lg; ctx.fill(); outline(ctx, "#001133", 3);
  ctx.strokeStyle = "#f9c825"; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.roundRect(cx - 14, cy - 6, 28, 16, 2); ctx.stroke();
  gem(ctx, cx, cy - 18, 5, "#e040fb", "#4a0060");
  smallGem(ctx, cx - 8, cy - 14, 3.5, "#f9c825", "#7a4800");
  smallGem(ctx, cx + 8, cy - 14, 3.5, "#f9c825", "#7a4800");
}

function drawPommelVoid(ctx: CanvasRenderingContext2D) {
  const cx = 64, cy = 98, r = 13;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, "#3a0066"); g.addColorStop(1, "#0a0015");
  ctx.shadowColor = "#9b30d0"; ctx.shadowBlur = 12;
  ctx.fillStyle = g; ctx.fill(); ctx.shadowBlur = 0; outline(ctx, "#0d0014", 3);
  // Spiral
  ctx.strokeStyle = "#b060ff"; ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let a = 0; a < Math.PI * 4; a += 0.1) {
    const sr = (a / (Math.PI * 4)) * 8;
    const px = cx + sr * Math.cos(a); const py = cy + sr * Math.sin(a);
    a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.stroke();
  // Void eye iris
  ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  ctx.fillStyle = "#d090ff"; ctx.fill();
}

// ─── AXE HEADS ───────────────────────────────────────────────────────────────

function drawAxeHeadIron(ctx: CanvasRenderingContext2D) {
  const cx = 64, cy = 64;
  ctx.beginPath();
  ctx.moveTo(cx - 10, cy - 26);
  ctx.lineTo(cx + 28, cy - 34);
  ctx.bezierCurveTo(cx + 50, cy - 28, cx + 50, cy + 28, cx + 28, cy + 34);
  ctx.lineTo(cx - 10, cy + 26);
  ctx.lineTo(cx - 8, cy);
  ctx.closePath();
  const lg = ctx.createLinearGradient(cx - 10, 0, cx + 50, 0);
  lg.addColorStop(0, "#4a4a4a"); lg.addColorStop(0.4, "#a0a0a0"); lg.addColorStop(0.7, "#d0d0d0"); lg.addColorStop(1, "#606060");
  ctx.fillStyle = lg; ctx.fill(); outline(ctx, "#1a1a1a", 3.5);
  // Edge highlight
  ctx.beginPath();
  ctx.bezierCurveTo(cx + 50, cy - 28, cx + 50, cy + 28, cx + 28, cy + 34);
  ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.lineWidth = 2.5; ctx.stroke();
  // Poll (back spike)
  ctx.beginPath(); ctx.moveTo(cx - 10, cy - 10); ctx.lineTo(cx - 30, cy); ctx.lineTo(cx - 10, cy + 10); ctx.closePath();
  ctx.fillStyle = "#606060"; ctx.fill(); outline(ctx, "#1a1a1a", 2.5);
  shine(ctx, cx + 26, cy - 32, cx + 46, cy);
}

function drawAxeHeadVoid(ctx: CanvasRenderingContext2D) {
  // Double crescent
  const cx = 64, cy = 64;
  for (const side of [-1, 1]) {
    ctx.save(); ctx.translate(0, side === 1 ? 0 : 0); if (side === -1) ctx.scale(1, -1);
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy * (side === -1 ? -1 : 1) - 6);
    ctx.bezierCurveTo(cx + 20, cy - 10 * side, cx + 44, cy - 30 * side, cx + 44, cy - 42 * side);
    ctx.bezierCurveTo(cx + 44, cy - 52 * side, cx + 30, cy - 56 * side, cx + 16, cy - 48 * side);
    ctx.bezierCurveTo(cx + 28, cy - 44 * side, cx + 32, cy - 34 * side, cx + 22, cy - 22 * side);
    ctx.bezierCurveTo(cx + 10, cy - 10 * side, cx - 4, cy - 4 * side, cx - 8, cy - 6 * side);
    ctx.closePath();
    const lg = ctx.createLinearGradient(cx - 8, 0, cx + 44, 0);
    lg.addColorStop(0, "#0d001a"); lg.addColorStop(0.4, "#4a0a7a"); lg.addColorStop(1, "#9b30d0");
    ctx.shadowColor = "#b060ff"; ctx.shadowBlur = 10;
    ctx.fillStyle = lg; ctx.fill(); ctx.shadowBlur = 0; outline(ctx, "#0d0014", 3);
    ctx.restore();
  }
  // Center rune
  rune(ctx, cx, cy, 6, "#d090ff");
  glow(ctx, cx, cy, 20, "rgba(140,40,255,0.2)");
}

function drawAxeHeadGold(ctx: CanvasRenderingContext2D) {
  const cx = 64, cy = 64;
  ctx.beginPath();
  ctx.moveTo(cx - 10, cy - 28);
  ctx.bezierCurveTo(cx + 16, cy - 40, cx + 50, cy - 32, cx + 50, cy - 8);
  ctx.bezierCurveTo(cx + 50, cy + 8, cx + 40, cy + 20, cx + 28, cy + 28);
  ctx.bezierCurveTo(cx + 16, cy + 34, cx, cy + 30, cx - 10, cy + 28);
  ctx.lineTo(cx - 8, cy); ctx.closePath();
  const lg = ctx.createLinearGradient(cx - 10, 0, cx + 50, 0);
  lg.addColorStop(0, "#7a4800"); lg.addColorStop(0.4, "#f9a825"); lg.addColorStop(0.6, "#fff176"); lg.addColorStop(1, "#7a4800");
  ctx.fillStyle = lg; ctx.fill(); outline(ctx, "#1a0a00", 3.5);
  // Scroll decorations
  ctx.strokeStyle = "#7a4800"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(cx + 32, cy - 8, 8, 0, Math.PI * 1.5); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx + 20, cy + 18, 6, 0, Math.PI); ctx.stroke();
  gem(ctx, cx + 40, cy - 2, 7, "#e040fb", "#4a0060");
  shine(ctx, cx + 48, cy - 30, cx + 48, cy + 10);
}

function drawAxeHeadBone(ctx: CanvasRenderingContext2D) {
  const cx = 64, cy = 64;
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy - 24);
  ctx.lineTo(cx + 26, cy - 32);
  ctx.bezierCurveTo(cx + 46, cy - 26, cx + 44, cy + 2, cx + 30, cy + 10);
  ctx.lineTo(cx + 22, cy + 22);
  ctx.lineTo(cx + 16, cy + 30);
  ctx.lineTo(cx + 8, cy + 24);
  ctx.bezierCurveTo(cx + 20, cy + 12, cx + 22, cy - 6, cx + 8, cy - 10);
  ctx.lineTo(cx - 8, cy + 24);
  ctx.closePath();
  const lg = ctx.createLinearGradient(cx - 8, 0, cx + 46, 0);
  lg.addColorStop(0, "#c8b080"); lg.addColorStop(0.5, "#fffde7"); lg.addColorStop(1, "#a09060");
  ctx.fillStyle = lg; ctx.fill(); outline(ctx, "#1a1000", 3.5);
  // Bone grain
  ctx.strokeStyle = "rgba(100,70,20,0.3)"; ctx.lineWidth = 1;
  for (const [sx, sy, ex, ey] of [[cx + 10, cy - 20, cx + 30, cy - 18], [cx + 15, cy, cx + 35, cy + 5]]) {
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
  }
}

function drawAxeHeadFire(ctx: CanvasRenderingContext2D) {
  const cx = 64, cy = 64;
  // Flame-shaped head
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy);
  ctx.bezierCurveTo(cx, cy - 32, cx + 24, cy - 42, cx + 44, cy - 28);
  ctx.bezierCurveTo(cx + 52, cy - 8, cx + 52, cy + 8, cx + 44, cy + 28);
  ctx.bezierCurveTo(cx + 24, cy + 42, cx, cy + 32, cx - 8, cy);
  ctx.closePath();
  const lg = ctx.createLinearGradient(cx - 8, 0, cx + 52, 0);
  lg.addColorStop(0, "#7f0000"); lg.addColorStop(0.35, "#ff3d00"); lg.addColorStop(0.6, "#ff9100"); lg.addColorStop(1, "#ffcc00");
  ctx.shadowColor = "#ff5500"; ctx.shadowBlur = 16;
  ctx.fillStyle = lg; ctx.fill(); ctx.shadowBlur = 0; outline(ctx, "#1a0800", 3.5);
  // Flame wisps at edge
  ctx.fillStyle = "#ffcc00";
  for (const [fx, fy] of [[cx + 44, cy - 28], [cx + 50, cy], [cx + 44, cy + 28]]) {
    ctx.beginPath(); ctx.arc(fx, fy, 5, 0, Math.PI * 2); ctx.fill();
  }
  shine(ctx, cx + 42, cy - 26, cx + 50, cy);
}

// ─── AXE HANDLES ─────────────────────────────────────────────────────────────

function drawAxeHandleWood(ctx: CanvasRenderingContext2D) {
  const cx = 64, top = 18, bot = 110, hw = 6;
  ctx.beginPath(); ctx.roundRect(cx - hw, top, hw * 2, bot - top, 3);
  const lg = ctx.createLinearGradient(cx - hw, 0, cx + hw, 0);
  lg.addColorStop(0, "#3e2210"); lg.addColorStop(0.5, "#7a4820"); lg.addColorStop(1, "#3e2210");
  ctx.fillStyle = lg; ctx.fill(); outline(ctx, "#0d0800", 3);
  // Grain
  ctx.strokeStyle = "rgba(60,30,10,0.35)"; ctx.lineWidth = 1;
  for (const gx of [cx - 2, cx + 2]) {
    ctx.beginPath(); ctx.moveTo(gx, top + 10); ctx.lineTo(gx, bot - 10); ctx.stroke();
  }
  // Iron bands
  for (const ry of [top + 10, (top + bot) / 2, bot - 16]) {
    ctx.beginPath(); ctx.roundRect(cx - hw - 2, ry, hw * 2 + 4, 8, 1);
    const rg = ctx.createLinearGradient(0, ry, 0, ry + 8);
    rg.addColorStop(0, "#c0c0c0"); rg.addColorStop(1, "#505050");
    ctx.fillStyle = rg; ctx.fill(); outline(ctx, "#111", 1.5);
  }
}

function drawAxeHandleRune(ctx: CanvasRenderingContext2D) {
  const cx = 64, top = 18, bot = 110, hw = 7;
  ctx.beginPath(); ctx.roundRect(cx - hw, top, hw * 2, bot - top, 3);
  const lg = ctx.createLinearGradient(cx - hw, 0, cx + hw, 0);
  lg.addColorStop(0, "#1a0d00"); lg.addColorStop(0.5, "#3a1a08"); lg.addColorStop(1, "#1a0d00");
  ctx.fillStyle = lg; ctx.fill(); outline(ctx, "#0d0800", 3);
  // Glowing rune carvings
  const runeColors = ["#f9c825", "#f9c825", "#f9c825", "#f9c825"];
  for (let i = 0; i < 4; i++) {
    rune(ctx, cx, top + 18 + i * 20, 5, runeColors[i]);
  }
}

function drawAxeHandleBone(ctx: CanvasRenderingContext2D) {
  const cx = 64, top = 18, bot = 110, hw = 7;
  ctx.beginPath(); ctx.roundRect(cx - hw, top, hw * 2, bot - top, 3);
  const lg = ctx.createLinearGradient(cx - hw, 0, cx + hw, 0);
  lg.addColorStop(0, "#b09060"); lg.addColorStop(0.5, "#fffde7"); lg.addColorStop(1, "#b09060");
  ctx.fillStyle = lg; ctx.fill(); outline(ctx, "#1a1000", 3);
  // Sinew wrapping
  ctx.strokeStyle = "rgba(140,100,40,0.6)"; ctx.lineWidth = 2;
  for (let wy = top + 8; wy < bot - 8; wy += 10) {
    ctx.beginPath(); ctx.moveTo(cx - hw, wy); ctx.lineTo(cx + hw, wy + 5); ctx.stroke();
  }
}

// ─── HAMMER HEADS ─────────────────────────────────────────────────────────────

function drawHammerHeadIron(ctx: CanvasRenderingContext2D) {
  const cx = 64, cy = 58, w = 52, h = 36;
  ctx.beginPath(); ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 5);
  const lg = ctx.createLinearGradient(0, cy - h / 2, 0, cy + h / 2);
  lg.addColorStop(0, "#b0b0b0"); lg.addColorStop(0.3, "#d8d8d8"); lg.addColorStop(0.7, "#888"); lg.addColorStop(1, "#444");
  ctx.fillStyle = lg; ctx.fill(); outline(ctx, "#1a1a1a", 3.5);
  // Crosshatch on face
  ctx.strokeStyle = "rgba(80,80,80,0.4)"; ctx.lineWidth = 1;
  for (let hx = cx - w / 2 + 6; hx < cx + w / 2 - 4; hx += 8) {
    ctx.beginPath(); ctx.moveTo(hx, cy - h / 2 + 4); ctx.lineTo(hx, cy + h / 2 - 4); ctx.stroke();
  }
  for (let hy = cy - h / 2 + 6; hy < cy + h / 2 - 4; hy += 8) {
    ctx.beginPath(); ctx.moveTo(cx - w / 2 + 4, hy); ctx.lineTo(cx + w / 2 - 4, hy); ctx.stroke();
  }
  shine(ctx, cx - w / 2 + 4, cy - h / 2 + 4, cx + w / 2 - 4, cy - h / 2 + 4);
  shine(ctx, cx - w / 2 + 4, cy - h / 2 + 4, cx - w / 2 + 4, cy + h / 2 - 4);
}

function drawHammerHeadRoyal(ctx: CanvasRenderingContext2D) {
  // Flanged mace head — star of 8 flanges
  const cx = 64, cy = 62, outerR = 36, innerR = 18;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a1 = (i / 8) * Math.PI * 2; const a2 = ((i + 0.5) / 8) * Math.PI * 2;
    i === 0 ? ctx.moveTo(cx + outerR * Math.cos(a1), cy + outerR * Math.sin(a1)) : ctx.lineTo(cx + outerR * Math.cos(a1), cy + outerR * Math.sin(a1));
    ctx.lineTo(cx + innerR * Math.cos(a2), cy + innerR * Math.sin(a2));
  }
  ctx.closePath();
  const lg = ctx.createRadialGradient(cx, cy, innerR, cx, cy, outerR);
  lg.addColorStop(0, "#fff176"); lg.addColorStop(0.5, "#f9a825"); lg.addColorStop(1, "#7a4800");
  ctx.fillStyle = lg; ctx.fill(); outline(ctx, "#1a0a00", 3);
  // Center disc
  ctx.beginPath(); ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
  const cg = ctx.createRadialGradient(cx - 4, cy - 4, 0, cx, cy, innerR);
  cg.addColorStop(0, "#fff176"); cg.addColorStop(1, "#7a4800");
  ctx.fillStyle = cg; ctx.fill(); outline(ctx, "#1a0a00", 2.5);
  gem(ctx, cx, cy, 9, "#e040fb", "#4a0060");
}

function drawHammerHeadVoid(ctx: CanvasRenderingContext2D) {
  const cx = 64, cy = 58, w = 50, h = 34;
  ctx.beginPath(); ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 4);
  const lg = ctx.createLinearGradient(0, cy - h / 2, 0, cy + h / 2);
  lg.addColorStop(0, "#1a003a"); lg.addColorStop(0.5, "#3a0066"); lg.addColorStop(1, "#0d001a");
  ctx.shadowColor = "#9b30d0"; ctx.shadowBlur = 14;
  ctx.fillStyle = lg; ctx.fill(); ctx.shadowBlur = 0; outline(ctx, "#0d0014", 3.5);
  // Rune carvings glowing
  for (const [rx, ry] of [[cx - 16, cy], [cx, cy], [cx + 16, cy]]) {
    rune(ctx, rx, ry, 7, "#d090ff");
  }
  // Purple lightning cracks
  ctx.strokeStyle = "#c060ff"; ctx.lineWidth = 1.2;
  for (const [sx, sy, ex, ey] of [
    [cx - w / 2 + 4, cy - h / 2 + 6, cx - w / 2 + 14, cy + h / 2 - 6],
    [cx + w / 2 - 14, cy - h / 2 + 4, cx + w / 2 - 4, cy + h / 2 - 6],
  ]) {
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + 4, (sy + ey) / 2); ctx.lineTo(ex, ey); ctx.stroke();
  }
  glow(ctx, cx, cy, 28, "rgba(140,40,255,0.2)");
}

// ─── SPEAR TIPS ───────────────────────────────────────────────────────────────

function drawSpearTipSteel(ctx: CanvasRenderingContext2D) {
  const cx = 64, top = 8, bot = 90, bw = 11;
  drawBlade(ctx, cx, top, bot, bw, "#607d8b", "#eceff1", "#37474f");
  // Socket
  ctx.beginPath(); ctx.roundRect(cx - 8, bot - 6, 16, 22, 2);
  const sg = ctx.createLinearGradient(cx - 8, 0, cx + 8, 0);
  sg.addColorStop(0, "#506070"); sg.addColorStop(0.5, "#90a0b0"); sg.addColorStop(1, "#506070");
  ctx.fillStyle = sg; ctx.fill(); outline(ctx, "#0d0d0d", 2.5);
  shine(ctx, cx - 9, bot + 2, cx - 9, bot + 16);
}

function drawSpearTipVoid(ctx: CanvasRenderingContext2D) {
  const cx = 64, top = 6, bot = 88, bw = 13;
  // Jagged spike
  ctx.beginPath();
  ctx.moveTo(cx, top);
  ctx.lineTo(cx + bw, top + 30);
  ctx.lineTo(cx + bw - 6, top + 45);
  ctx.lineTo(cx + bw, top + 60);
  ctx.lineTo(cx, bot);
  ctx.lineTo(cx - bw, top + 60);
  ctx.lineTo(cx - bw + 6, top + 45);
  ctx.lineTo(cx - bw, top + 30);
  ctx.closePath();
  const lg = ctx.createLinearGradient(cx - bw, 0, cx + bw, 0);
  lg.addColorStop(0, "#0d001a"); lg.addColorStop(0.5, "#4a0a7a"); lg.addColorStop(1, "#0d001a");
  ctx.shadowColor = "#b060ff"; ctx.shadowBlur = 12;
  ctx.fillStyle = lg; ctx.fill(); ctx.shadowBlur = 0; outline(ctx, "#0d0014", 3);
  ctx.beginPath(); ctx.moveTo(cx, top + 4); ctx.lineTo(cx, bot - 4);
  ctx.strokeStyle = "rgba(200,130,255,0.6)"; ctx.lineWidth = 2; ctx.stroke();
  // Flames at base
  for (const [fx, fy] of [[cx - bw, bot - 15], [cx + bw, bot - 15]]) {
    ctx.beginPath(); ctx.arc(fx, fy, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#b060ff"; ctx.fill();
  }
}

function drawSpearTipCrystal(ctx: CanvasRenderingContext2D) {
  const cx = 64, top = 6, bot = 90, bw = 12;
  ctx.beginPath();
  ctx.moveTo(cx, top);
  ctx.lineTo(cx + bw, top + 28);
  ctx.lineTo(cx + bw - 3, top + 38);
  ctx.lineTo(cx + bw, top + 48);
  ctx.lineTo(cx, bot);
  ctx.lineTo(cx - bw, top + 48);
  ctx.lineTo(cx - bw + 3, top + 38);
  ctx.lineTo(cx - bw, top + 28);
  ctx.closePath();
  const lg = ctx.createLinearGradient(cx - bw, 0, cx + bw, 0);
  lg.addColorStop(0, "#003344"); lg.addColorStop(0.35, "#00bcd4"); lg.addColorStop(0.5, "#e0f7fa"); lg.addColorStop(0.65, "#0097a7"); lg.addColorStop(1, "#003344");
  ctx.shadowColor = "#00e5ff"; ctx.shadowBlur = 12;
  ctx.fillStyle = lg; ctx.fill(); ctx.shadowBlur = 0; outline(ctx, "#001a1a", 3);
  ctx.strokeStyle = "rgba(200,240,255,0.7)"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(cx, top + 5); ctx.lineTo(cx, bot - 5); ctx.stroke();
}

// ─── STAFF HEADS ──────────────────────────────────────────────────────────────

function drawStaffHeadArcane(ctx: CanvasRenderingContext2D) {
  // Orb in claw mount
  const cx = 64, cy = 52;
  // Three claws
  const clawColor = "#5a3500";
  const clawHL = "#c07020";
  for (const a of [-0.6, 0, 0.6]) {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(a);
    ctx.beginPath(); ctx.moveTo(-4, 0); ctx.bezierCurveTo(-8, -20, -6, -36, 0, -40); ctx.bezierCurveTo(6, -36, 8, -20, 4, 0); ctx.closePath();
    const lg = ctx.createLinearGradient(-8, -40, 8, 0);
    lg.addColorStop(0, clawHL); lg.addColorStop(1, clawColor);
    ctx.fillStyle = lg; ctx.fill(); outline(ctx, "#1a0a00", 2.5); ctx.restore();
  }
  // Orb
  ctx.beginPath(); ctx.arc(cx, cy, 22, 0, Math.PI * 2);
  const og = ctx.createRadialGradient(cx - 6, cy - 6, 0, cx, cy, 22);
  og.addColorStop(0, "#ffffff"); og.addColorStop(0.2, "#a0b0ff"); og.addColorStop(0.6, "#3040c0"); og.addColorStop(1, "#050a40");
  ctx.shadowColor = "#6080ff"; ctx.shadowBlur = 18;
  ctx.fillStyle = og; ctx.fill(); ctx.shadowBlur = 0; outline(ctx, "#001133", 3);
  // Inner sparkle
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.beginPath(); ctx.ellipse(cx - 7, cy - 7, 5, 7, -0.5, 0, Math.PI * 2); ctx.fill();
  // Stars
  ctx.fillStyle = "rgba(200,220,255,0.6)";
  for (const [sx, sy] of [[cx + 7, cy - 5], [cx - 2, cy + 9], [cx + 10, cy + 8]]) {
    ctx.beginPath(); ctx.arc(sx, sy, 1.5, 0, Math.PI * 2); ctx.fill();
  }
  glow(ctx, cx, cy, 30, "rgba(80,100,255,0.25)");
}

function drawStaffHeadFire(ctx: CanvasRenderingContext2D) {
  const cx = 64, cy = 56;
  // Flame shapes
  const flames = [[cx, 14], [cx - 14, 30], [cx + 14, 30], [cx - 8, 42], [cx + 8, 42]];
  for (const [fx, fy] of flames) {
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.bezierCurveTo(fx - 10, fy + 18, fx - 6, fy + 30, fx, fy + 34);
    ctx.bezierCurveTo(fx + 6, fy + 30, fx + 10, fy + 18, fx, fy);
    ctx.closePath();
    const lg = ctx.createLinearGradient(0, fy, 0, fy + 34);
    lg.addColorStop(0, "#ffcc00"); lg.addColorStop(0.5, "#ff5500"); lg.addColorStop(1, "#cc0000");
    ctx.shadowColor = "#ff5500"; ctx.shadowBlur = 10;
    ctx.fillStyle = lg; ctx.fill(); ctx.shadowBlur = 0;
  }
  outline(ctx, "#1a0800", 2);
  // Core orb
  ctx.beginPath(); ctx.arc(cx, cy + 16, 12, 0, Math.PI * 2);
  const cg = ctx.createRadialGradient(cx - 3, cy + 13, 0, cx, cy + 16, 12);
  cg.addColorStop(0, "#ffffff"); cg.addColorStop(0.3, "#ffcc00"); cg.addColorStop(1, "#cc2200");
  ctx.fillStyle = cg; ctx.fill(); outline(ctx, "#1a0800", 2.5);
  glow(ctx, cx, cy + 16, 24, "rgba(255,100,0,0.3)");
}

function drawStaffHeadVoid(ctx: CanvasRenderingContext2D) {
  // Eye with tentacle prongs
  const cx = 64, cy = 56;
  // Tentacle prongs
  for (const [tx, ty, tc1x, tc1y, tc2x, tc2y, tex, tey] of [
    [cx, cy - 12, cx - 14, cy - 34, cx - 8, cy - 48, cx - 4, cy - 52],
    [cx, cy - 12, cx + 14, cy - 34, cx + 8, cy - 48, cx + 4, cy - 52],
    [cx - 14, cy, cx - 36, cy - 10, cx - 46, cy + 4, cx - 46, cy + 10],
    [cx + 14, cy, cx + 36, cy - 10, cx + 46, cy + 4, cx + 46, cy + 10],
  ]) {
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.bezierCurveTo(tc1x, tc1y, tc2x, tc2y, tex, tey);
    ctx.strokeStyle = "#3a006a"; ctx.lineWidth = 5; ctx.lineCap = "round"; ctx.stroke();
    ctx.strokeStyle = "#9030d0"; ctx.lineWidth = 2; ctx.stroke();
  }
  // Eye body
  ctx.beginPath(); ctx.ellipse(cx, cy, 20, 16, 0, 0, Math.PI * 2);
  const lg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 20);
  lg.addColorStop(0, "#1a0033"); lg.addColorStop(1, "#050010");
  ctx.shadowColor = "#9b30d0"; ctx.shadowBlur = 16;
  ctx.fillStyle = lg; ctx.fill(); ctx.shadowBlur = 0; outline(ctx, "#0d0014", 3);
  // Iris
  ctx.beginPath(); ctx.ellipse(cx, cy, 12, 9, 0, 0, Math.PI * 2);
  const ig = ctx.createRadialGradient(cx - 2, cy - 2, 0, cx, cy, 12);
  ig.addColorStop(0, "#d090ff"); ig.addColorStop(0.5, "#7020c0"); ig.addColorStop(1, "#1a0033");
  ctx.fillStyle = ig; ctx.fill();
  // Pupil
  ctx.beginPath(); ctx.ellipse(cx, cy, 5, 7, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#000"; ctx.fill();
  ctx.fillStyle = "rgba(200,150,255,0.8)";
  ctx.beginPath(); ctx.ellipse(cx - 2, cy - 2, 2, 3, -0.3, 0, Math.PI * 2); ctx.fill();
  glow(ctx, cx, cy, 28, "rgba(140,40,255,0.3)");
}

// ─── SHIELDS ──────────────────────────────────────────────────────────────────

function drawShieldRoundIron(ctx: CanvasRenderingContext2D) {
  const cx = 64, cy = 64, r = 48;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
  const lg = ctx.createRadialGradient(cx - 8, cy - 8, 0, cx, cy, r);
  lg.addColorStop(0, "#c0c0c0"); lg.addColorStop(0.6, "#808080"); lg.addColorStop(1, "#303030");
  ctx.fillStyle = lg; ctx.fill(); outline(ctx, "#1a1a1a", 3.5);
  // Rim
  ctx.beginPath(); ctx.arc(cx, cy, r - 4, 0, Math.PI * 2);
  ctx.strokeStyle = "#d0d0d0"; ctx.lineWidth = 2.5; ctx.stroke();
  // Cross straps
  ctx.strokeStyle = "#505050"; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(cx, cy - r + 6); ctx.lineTo(cx, cy + r - 6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - r + 6, cy); ctx.lineTo(cx + r - 6, cy); ctx.stroke();
  // Boss (central dome)
  ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI * 2);
  const bg = ctx.createRadialGradient(cx - 3, cy - 3, 0, cx, cy, 12);
  bg.addColorStop(0, "#ffffff"); bg.addColorStop(0.5, "#a0a0a0"); bg.addColorStop(1, "#404040");
  ctx.fillStyle = bg; ctx.fill(); outline(ctx, "#1a1a1a", 2.5);
  shine(ctx, cx - r + 6, cy - r + 6, cx - r + 22, cy - r + 22);
}

function drawShieldKiteRoyal(ctx: CanvasRenderingContext2D) {
  const cx = 64, top = 16, bot = 112;
  ctx.beginPath();
  ctx.moveTo(cx, top);
  ctx.bezierCurveTo(cx + 48, top + 8, cx + 48, top + 50, cx + 40, top + 65);
  ctx.bezierCurveTo(cx + 28, top + 82, cx + 8, top + 90, cx, bot);
  ctx.bezierCurveTo(cx - 8, top + 90, cx - 28, top + 82, cx - 40, top + 65);
  ctx.bezierCurveTo(cx - 48, top + 50, cx - 48, top + 8, cx, top);
  ctx.closePath();
  // Royal blue fill
  const lg = ctx.createLinearGradient(cx - 48, 0, cx + 48, 0);
  lg.addColorStop(0, "#0a2a70"); lg.addColorStop(0.5, "#1a50c0"); lg.addColorStop(1, "#0a2a70");
  ctx.fillStyle = lg; ctx.fill(); outline(ctx, "#001133", 4);
  // Gold border
  ctx.beginPath();
  ctx.moveTo(cx, top + 5);
  ctx.bezierCurveTo(cx + 42, top + 12, cx + 42, top + 50, cx + 34, top + 66);
  ctx.bezierCurveTo(cx + 24, top + 82, cx + 8, top + 89, cx, bot - 4);
  ctx.bezierCurveTo(cx - 8, top + 89, cx - 24, top + 82, cx - 34, top + 66);
  ctx.bezierCurveTo(cx - 42, top + 50, cx - 42, top + 12, cx, top + 5);
  ctx.strokeStyle = "#f9c825"; ctx.lineWidth = 3.5; ctx.stroke();
  // Fleur-de-lis emblem
  const ey = top + 48;
  ctx.fillStyle = "#f9c825";
  // Central fleur
  ctx.beginPath(); ctx.ellipse(cx, ey - 8, 5, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx - 8, ey, 5, 8, 0.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + 8, ey, 5, 8, -0.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.roundRect(cx - 3, ey - 4, 6, 14, 2); ctx.fill();
  shine(ctx, cx - 44, top + 10, cx - 30, top + 40);
}

function drawShieldTowerVoid(ctx: CanvasRenderingContext2D) {
  const cx = 64, top = 10, bot = 114;
  ctx.beginPath();
  ctx.moveTo(cx - 36, top + 20);
  ctx.lineTo(cx - 18, top);
  ctx.lineTo(cx, top + 12);
  ctx.lineTo(cx + 18, top);
  ctx.lineTo(cx + 36, top + 20);
  ctx.lineTo(cx + 36, bot - 20);
  ctx.bezierCurveTo(cx + 36, bot - 4, cx, bot, cx, bot);
  ctx.bezierCurveTo(cx, bot, cx - 36, bot - 4, cx - 36, bot - 20);
  ctx.closePath();
  const lg = ctx.createLinearGradient(cx - 36, 0, cx + 36, 0);
  lg.addColorStop(0, "#0a0015"); lg.addColorStop(0.5, "#1a003a"); lg.addColorStop(1, "#0a0015");
  ctx.shadowColor = "#7020c0"; ctx.shadowBlur = 12;
  ctx.fillStyle = lg; ctx.fill(); ctx.shadowBlur = 0; outline(ctx, "#0d0014", 4);
  // Purple border
  ctx.strokeStyle = "#6020a0"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx - 30, top + 22); ctx.lineTo(cx - 14, top + 6); ctx.lineTo(cx, top + 16); ctx.lineTo(cx + 14, top + 6); ctx.lineTo(cx + 30, top + 22); ctx.stroke();
  // Void eye emblem
  ctx.beginPath(); ctx.ellipse(cx, (top + bot) / 2, 18, 13, 0, 0, Math.PI * 2);
  ctx.strokeStyle = "#7020c0"; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(cx, (top + bot) / 2, 8, 11, 0, 0, Math.PI * 2);
  const ig = ctx.createRadialGradient(cx, (top + bot) / 2, 0, cx, (top + bot) / 2, 10);
  ig.addColorStop(0, "#d090ff"); ig.addColorStop(1, "#0d001a");
  ctx.fillStyle = ig; ctx.fill();
  glow(ctx, cx, (top + bot) / 2, 24, "rgba(140,40,255,0.3)");
  rune(ctx, cx - 22, top + 48, 6, "#6020a0");
  rune(ctx, cx + 22, top + 48, 6, "#6020a0");
}

// ─── MAGICAL CRYSTALS ────────────────────────────────────────────────────────

function drawCrystalFire(ctx: CanvasRenderingContext2D) {
  const cx = 64, top = 16, bot = 106;
  // Hexagonal crystal
  function hexCrystal(col1: string, col2: string, glowColor: string, col3: string) {
    ctx.beginPath();
    ctx.moveTo(cx, top);
    ctx.lineTo(cx + 18, top + 20);
    ctx.lineTo(cx + 18, bot - 20);
    ctx.lineTo(cx, bot);
    ctx.lineTo(cx - 18, bot - 20);
    ctx.lineTo(cx - 18, top + 20);
    ctx.closePath();
    const lg = ctx.createLinearGradient(cx - 18, 0, cx + 18, 0);
    lg.addColorStop(0, col1); lg.addColorStop(0.4, col2); lg.addColorStop(0.6, "#ffffff"); lg.addColorStop(1, col3);
    ctx.shadowColor = glowColor; ctx.shadowBlur = 18;
    ctx.fillStyle = lg; ctx.fill(); ctx.shadowBlur = 0; outline(ctx, "#0d0000", 3);
    // Internal light vein
    ctx.beginPath(); ctx.moveTo(cx, top + 5); ctx.lineTo(cx, bot - 5);
    ctx.strokeStyle = "rgba(255,255,255,0.55)"; ctx.lineWidth = 2.5; ctx.stroke();
    // Facet lines
    ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(cx - 18, top + 20); ctx.lineTo(cx, top); ctx.lineTo(cx + 18, top + 20); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 18, bot - 20); ctx.lineTo(cx, bot); ctx.lineTo(cx + 18, bot - 20); ctx.stroke();
  }
  hexCrystal("#7a0000", "#ff6600", "#ff4400", "#5a0000");
  // Flame wisps
  ctx.fillStyle = "#ffaa00";
  for (const [fx, fy, fr] of [[cx - 18, top + 30, 5], [cx + 18, top + 50, 4], [cx - 15, top + 65, 4]]) {
    ctx.beginPath(); ctx.arc(fx, fy, fr, 0, Math.PI * 2); ctx.fill();
  }
  glow(ctx, cx, (top + bot) / 2, 30, "rgba(255,80,0,0.25)");
}

function drawCrystalIce(ctx: CanvasRenderingContext2D) {
  const cx = 64, top = 16, bot = 106;
  // Blue crystal
  ctx.beginPath();
  ctx.moveTo(cx, top); ctx.lineTo(cx + 18, top + 20); ctx.lineTo(cx + 18, bot - 20);
  ctx.lineTo(cx, bot); ctx.lineTo(cx - 18, bot - 20); ctx.lineTo(cx - 18, top + 20); ctx.closePath();
  const lg = ctx.createLinearGradient(cx - 18, 0, cx + 18, 0);
  lg.addColorStop(0, "#003366"); lg.addColorStop(0.35, "#4fc3f7"); lg.addColorStop(0.5, "#e1f5fe"); lg.addColorStop(0.65, "#0277bd"); lg.addColorStop(1, "#003366");
  ctx.shadowColor = "#00c8ff"; ctx.shadowBlur = 16;
  ctx.fillStyle = lg; ctx.fill(); ctx.shadowBlur = 0; outline(ctx, "#001a33", 3);
  // Facet lines
  ctx.strokeStyle = "rgba(200,240,255,0.65)"; ctx.lineWidth = 1.5;
  for (const [sx, sy, ex, ey] of [
    [cx - 18, top + 20, cx, top], [cx, top, cx + 18, top + 20],
    [cx - 18, bot - 20, cx, bot], [cx, bot, cx + 18, bot - 20],
    [cx, top + 5, cx, bot - 5],
  ]) { ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke(); }
  // Ice shard halo
  ctx.strokeStyle = "rgba(180,230,255,0.6)"; ctx.lineWidth = 1;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
    const ix = cx + 24 * Math.cos(a); const iy = (top + bot) / 2 + 24 * Math.sin(a);
    ctx.beginPath(); ctx.moveTo(ix, iy); ctx.lineTo(ix + 8 * Math.cos(a), iy + 8 * Math.sin(a)); ctx.stroke();
  }
  glow(ctx, cx, (top + bot) / 2, 30, "rgba(80,200,255,0.2)");
}

function drawCrystalArcane(ctx: CanvasRenderingContext2D) {
  const cx = 64, top = 16, bot = 106;
  ctx.beginPath();
  ctx.moveTo(cx, top); ctx.lineTo(cx + 18, top + 20); ctx.lineTo(cx + 18, bot - 20);
  ctx.lineTo(cx, bot); ctx.lineTo(cx - 18, bot - 20); ctx.lineTo(cx - 18, top + 20); ctx.closePath();
  const lg = ctx.createLinearGradient(cx - 18, 0, cx + 18, 0);
  lg.addColorStop(0, "#1a0033"); lg.addColorStop(0.35, "#7b1fa2"); lg.addColorStop(0.5, "#e1bee7"); lg.addColorStop(0.65, "#6a1b9a"); lg.addColorStop(1, "#1a0033");
  ctx.shadowColor = "#c060ff"; ctx.shadowBlur = 18;
  ctx.fillStyle = lg; ctx.fill(); ctx.shadowBlur = 0; outline(ctx, "#0d001a", 3);
  ctx.strokeStyle = "rgba(220,160,255,0.65)"; ctx.lineWidth = 1.5;
  for (const [sx, sy, ex, ey] of [
    [cx - 18, top + 20, cx, top], [cx, top, cx + 18, top + 20],
    [cx - 18, bot - 20, cx, bot], [cx, bot, cx + 18, bot - 20],
    [cx, top + 5, cx, bot - 5],
  ]) { ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke(); }
  // Floating stars
  ctx.fillStyle = "rgba(255,220,255,0.8)";
  for (const [sx, sy, sr] of [[cx - 24, (top + bot) / 2 - 18, 2.5], [cx + 24, (top + bot) / 2 + 10, 2], [cx - 20, (top + bot) / 2 + 22, 2], [cx + 20, (top + bot) / 2 - 28, 1.8]]) {
    ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();
  }
  glow(ctx, cx, (top + bot) / 2, 30, "rgba(180,80,255,0.25)");
}

// ─── DAGGER BLADES ───────────────────────────────────────────────────────────

function drawDaggerBladeIron(ctx: CanvasRenderingContext2D) {
  const cx = 64, top = 10, bot = 100, bw = 7;
  // Narrow, very pointed, double-edged dirk
  ctx.beginPath();
  ctx.moveTo(cx, top);
  ctx.lineTo(cx + bw, top + 22);
  ctx.lineTo(cx + bw - 1, bot);
  ctx.lineTo(cx - bw + 1, bot);
  ctx.lineTo(cx - bw, top + 22);
  ctx.closePath();
  const lg = ctx.createLinearGradient(cx - bw, 0, cx + bw, 0);
  lg.addColorStop(0, "#505050"); lg.addColorStop(0.4, "#c0c0c0"); lg.addColorStop(0.5, "#e8e8e8"); lg.addColorStop(0.6, "#a0a0a0"); lg.addColorStop(1, "#404040");
  ctx.fillStyle = lg; ctx.fill(); outline(ctx, "#111", 3);
  // Fuller groove center
  ctx.beginPath(); ctx.moveTo(cx, top + 8); ctx.lineTo(cx, bot - 4);
  ctx.strokeStyle = "rgba(255,255,255,0.65)"; ctx.lineWidth = 1.8; ctx.stroke();
  // Fuller side shadow
  ctx.beginPath(); ctx.moveTo(cx - 2, top + 22); ctx.lineTo(cx - 2, bot - 5);
  ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + 2, top + 22); ctx.lineTo(cx + 2, bot - 5);
  ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.lineWidth = 2; ctx.stroke();
}

function drawDaggerBladeShadow(ctx: CanvasRenderingContext2D) {
  // Curved assassin blade, dark steel, serrated spine
  const cx = 64, top = 8, bot = 102, bw = 9;
  ctx.beginPath();
  ctx.moveTo(cx, top);
  ctx.bezierCurveTo(cx + bw + 4, top + 25, cx + bw, top + 55, cx + 2, bot);
  ctx.lineTo(cx - 2, bot);
  // Serrated left spine
  let sy = bot;
  while (sy > top + 22) {
    ctx.lineTo(cx - bw + 6, sy - 7);
    ctx.lineTo(cx - bw, sy - 14);
    sy -= 14;
  }
  ctx.lineTo(cx - bw, top + 20);
  ctx.closePath();
  const lg = ctx.createLinearGradient(cx - bw, 0, cx + bw, 0);
  lg.addColorStop(0, "#0a0a1a"); lg.addColorStop(0.4, "#2a2a3a"); lg.addColorStop(0.7, "#505060"); lg.addColorStop(1, "#0a0a1a");
  ctx.shadowColor = "#4040a0"; ctx.shadowBlur = 8;
  ctx.fillStyle = lg; ctx.fill(); ctx.shadowBlur = 0; outline(ctx, "#050510", 3);
  shine(ctx, cx + 4, top + 18, cx + bw - 1, bot - 8, 0.4);
}

function drawDaggerBladeGold(ctx: CanvasRenderingContext2D) {
  // Stiletto — very thin needle blade, ornate
  const cx = 64, top = 6, bot = 106, bw = 5;
  ctx.beginPath();
  ctx.moveTo(cx, top);
  ctx.lineTo(cx + bw, top + 18);
  ctx.lineTo(cx + bw - 1, bot);
  ctx.lineTo(cx - bw + 1, bot);
  ctx.lineTo(cx - bw, top + 18);
  ctx.closePath();
  const lg = ctx.createLinearGradient(cx - bw, 0, cx + bw, 0);
  lg.addColorStop(0, "#8a5c00"); lg.addColorStop(0.4, "#f9c825"); lg.addColorStop(0.5, "#fffde0"); lg.addColorStop(0.6, "#e8a800"); lg.addColorStop(1, "#7a4800");
  ctx.fillStyle = lg; ctx.fill(); outline(ctx, "#1a0a00", 3);
  // Ornate filigree marks
  ctx.strokeStyle = "rgba(120,80,0,0.5)"; ctx.lineWidth = 1;
  for (const fy of [bot - 20, bot - 40, bot - 60]) {
    ctx.beginPath(); ctx.moveTo(cx - 3, fy); ctx.lineTo(cx + 3, fy); ctx.stroke();
  }
  shine(ctx, cx, top + 5, cx, bot - 8, 0.65);
  gem(ctx, cx, bot - 12, 4, "#e040fb", "#4a0060");
}

// ─── BOW LIMBS ────────────────────────────────────────────────────────────────

function drawBowLimbWood(ctx: CanvasRenderingContext2D) {
  // Full recurve bow — vertical, symmetric limbs
  const cx = 64, cy = 64, armH = 48, armW = 18, recurveX = 22;
  const woodGrad = (y0: number, y1: number) => {
    const g = ctx.createLinearGradient(cx - armW, y0, cx + armW, y1);
    g.addColorStop(0, "#3e2210"); g.addColorStop(0.4, "#7a4820"); g.addColorStop(0.7, "#a06030"); g.addColorStop(1, "#3e2210");
    return g;
  };
  // Upper limb
  ctx.beginPath();
  ctx.moveTo(cx - 5, cy - 6);
  ctx.bezierCurveTo(cx - armW, cy - 18, cx - recurveX, cy - armH - 8, cx - 8, cy - armH - 14);
  ctx.bezierCurveTo(cx - 2, cy - armH - 16, cx + 4, cy - armH - 14, cx + 8, cy - armH - 10);
  ctx.bezierCurveTo(cx + recurveX - 2, cy - armH, cx + armW - 4, cy - 14, cx + 5, cy - 6);
  ctx.closePath();
  ctx.fillStyle = woodGrad(cy - armH - 16, cy - 6); ctx.fill(); outline(ctx, "#0d0800", 3);
  // Lower limb (mirror)
  ctx.save(); ctx.translate(cx, cy); ctx.scale(1, -1); ctx.translate(-cx, -cy);
  ctx.beginPath();
  ctx.moveTo(cx - 5, cy - 6);
  ctx.bezierCurveTo(cx - armW, cy - 18, cx - recurveX, cy - armH - 8, cx - 8, cy - armH - 14);
  ctx.bezierCurveTo(cx - 2, cy - armH - 16, cx + 4, cy - armH - 14, cx + 8, cy - armH - 10);
  ctx.bezierCurveTo(cx + recurveX - 2, cy - armH, cx + armW - 4, cy - 14, cx + 5, cy - 6);
  ctx.closePath();
  ctx.fillStyle = woodGrad(cy - armH - 16, cy - 6); ctx.fill(); outline(ctx, "#0d0800", 3); ctx.restore();
  // Riser (center grip)
  ctx.beginPath(); ctx.roundRect(cx - 7, cy - 12, 14, 24, 4);
  const rg = ctx.createLinearGradient(cx - 7, 0, cx + 7, 0);
  rg.addColorStop(0, "#3e2210"); rg.addColorStop(0.5, "#8b5520"); rg.addColorStop(1, "#3e2210");
  ctx.fillStyle = rg; ctx.fill(); outline(ctx, "#0d0800", 2.5);
  // Grain lines
  ctx.strokeStyle = "rgba(60,30,10,0.35)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx - 2, cy - armH - 6); ctx.lineTo(cx - 2, cy + armH + 6); ctx.stroke();
  // Tip nocks
  for (const ty of [cy - armH - 10, cy + armH + 10]) {
    ctx.beginPath(); ctx.arc(cx, ty, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#c0c0c0"; ctx.fill(); outline(ctx, "#111", 1.5);
  }
}

function drawBowLimbCrystal(ctx: CanvasRenderingContext2D) {
  const cx = 64, cy = 64, armH = 48, recurveX = 20;
  const crystalGrad = () => {
    const g = ctx.createLinearGradient(cx - 20, 0, cx + 20, 0);
    g.addColorStop(0, "#003344"); g.addColorStop(0.4, "#00bcd4"); g.addColorStop(0.6, "#e0f7fa"); g.addColorStop(1, "#003344");
    return g;
  };
  for (const sign of [1, -1]) {
    ctx.save(); if (sign === -1) { ctx.translate(cx, cy); ctx.scale(1, -1); ctx.translate(-cx, -cy); }
    ctx.beginPath();
    ctx.moveTo(cx - 5, cy - 6);
    ctx.bezierCurveTo(cx - 18, cy - 18, cx - recurveX, cy - armH - 4, cx - 6, cy - armH - 12);
    ctx.bezierCurveTo(cx, cy - armH - 16, cx + 6, cy - armH - 12, cx + 8, cy - armH - 6);
    ctx.bezierCurveTo(cx + recurveX, cy - armH, cx + 18, cy - 14, cx + 5, cy - 6);
    ctx.closePath();
    ctx.shadowColor = "#00e5ff"; ctx.shadowBlur = 10;
    ctx.fillStyle = crystalGrad(); ctx.fill(); ctx.shadowBlur = 0; outline(ctx, "#001a1a", 2.5);
    // Ice facet lines
    ctx.strokeStyle = "rgba(200,240,255,0.5)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx - 2, cy - armH - 8); ctx.lineTo(cx - 2, cy - 12); ctx.stroke();
    ctx.restore();
  }
  // Crystal riser
  ctx.beginPath(); ctx.roundRect(cx - 7, cy - 12, 14, 24, 2);
  const rg = ctx.createLinearGradient(cx - 7, 0, cx + 7, 0);
  rg.addColorStop(0, "#003344"); rg.addColorStop(0.5, "#a0e4f0"); rg.addColorStop(1, "#003344");
  ctx.shadowColor = "#00e5ff"; ctx.shadowBlur = 8;
  ctx.fillStyle = rg; ctx.fill(); ctx.shadowBlur = 0; outline(ctx, "#001a1a", 2.5);
  // Tip gems
  for (const ty of [cy - armH - 10, cy + armH + 10]) {
    smallGem(ctx, cx, ty, 5, "#4fc3f7", "#003366");
  }
}

function drawBowLimbVoid(ctx: CanvasRenderingContext2D) {
  const cx = 64, cy = 64, armH = 50, recurveX = 22;
  for (const sign of [1, -1]) {
    ctx.save(); if (sign === -1) { ctx.translate(cx, cy); ctx.scale(1, -1); ctx.translate(-cx, -cy); }
    ctx.beginPath();
    ctx.moveTo(cx - 5, cy - 6);
    ctx.bezierCurveTo(cx - 20, cy - 16, cx - recurveX, cy - armH - 6, cx - 8, cy - armH - 14);
    ctx.bezierCurveTo(cx - 2, cy - armH - 18, cx + 4, cy - armH - 14, cx + 8, cy - armH - 8);
    ctx.bezierCurveTo(cx + recurveX, cy - armH, cx + 20, cy - 12, cx + 5, cy - 6);
    ctx.closePath();
    const lg = ctx.createLinearGradient(cx - 22, 0, cx + 22, 0);
    lg.addColorStop(0, "#0a0015"); lg.addColorStop(0.4, "#3a006a"); lg.addColorStop(0.6, "#6020a0"); lg.addColorStop(1, "#0a0015");
    ctx.shadowColor = "#8040ff"; ctx.shadowBlur = 10;
    ctx.fillStyle = lg; ctx.fill(); ctx.shadowBlur = 0; outline(ctx, "#0d0014", 2.5);
    ctx.restore();
  }
  // Void riser
  ctx.beginPath(); ctx.roundRect(cx - 7, cy - 12, 14, 24, 2);
  ctx.fillStyle = "#0a0015"; ctx.fill(); outline(ctx, "#0d0014", 2.5);
  ctx.strokeStyle = "#8040ff"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(cx - 7, cy - 12, 14, 24, 2); ctx.stroke();
  // Tip glow orbs
  for (const ty of [cy - armH - 12, cy + armH + 12]) {
    ctx.beginPath(); ctx.arc(cx, ty, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#6020a0"; ctx.fill(); outline(ctx, "#0d0014", 1.5);
    glow(ctx, cx, ty, 10, "rgba(140,40,255,0.5)");
  }
}

// ─── BOW STRINGS ─────────────────────────────────────────────────────────────

function drawBowStringSinew(ctx: CanvasRenderingContext2D) {
  const cx = 64, cy = 64, armH = 54;
  // Simple natural string — thin arc
  ctx.beginPath();
  ctx.moveTo(cx, cy - armH);
  ctx.bezierCurveTo(cx + 14, cy - 24, cx + 14, cy + 24, cx, cy + armH);
  ctx.strokeStyle = "#c8a870"; ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.stroke();
  // Serving (center wrap)
  ctx.strokeStyle = "#7a5020"; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(cx + 12, cy - 14); ctx.lineTo(cx + 12, cy + 14); ctx.stroke();
  ctx.strokeStyle = "#c8a870"; ctx.lineWidth = 1;
  for (let y = cy - 12; y < cy + 12; y += 3) {
    ctx.beginPath(); ctx.moveTo(cx + 10, y); ctx.lineTo(cx + 14, y + 2); ctx.stroke();
  }
  // Nock points
  for (const ty of [cy - armH, cy + armH]) {
    ctx.beginPath(); ctx.arc(cx, ty, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#c8a870"; ctx.fill();
  }
}

function drawBowStringArcane(ctx: CanvasRenderingContext2D) {
  const cx = 64, cy = 64, armH = 54;
  // Glowing energy string
  ctx.save();
  ctx.shadowColor = "#8080ff"; ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(cx, cy - armH);
  ctx.bezierCurveTo(cx + 14, cy - 24, cx + 14, cy + 24, cx, cy + armH);
  ctx.strokeStyle = "#c0c8ff"; ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.stroke();
  ctx.shadowBlur = 0; ctx.restore();
  // Energy particles along string
  ctx.fillStyle = "rgba(180,190,255,0.8)";
  for (const [px, py] of [[cx + 13, cy - 16], [cx + 14, cy], [cx + 13, cy + 16]]) {
    ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2); ctx.fill();
  }
  // Nock glow
  for (const ty of [cy - armH, cy + armH]) {
    ctx.beginPath(); ctx.arc(cx, ty, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#8080ff"; ctx.fill();
    glow(ctx, cx, ty, 8, "rgba(120,120,255,0.5)");
  }
}

// ─── KNUCKLES ─────────────────────────────────────────────────────────────────

function drawKnuckleIron(ctx: CanvasRenderingContext2D) {
  // 4-ring brass knuckle, horizontal
  const cy = 64, startX = 14, ringR = 13, gap = 25;
  const barY = cy + ringR - 3;
  // Connecting bar at bottom
  ctx.beginPath(); ctx.roundRect(startX - 2, barY, gap * 3 + ringR * 2 + 4, 10, 3);
  const bg = ctx.createLinearGradient(0, barY, 0, barY + 10);
  bg.addColorStop(0, "#c0c0c0"); bg.addColorStop(0.5, "#e0e0e0"); bg.addColorStop(1, "#606060");
  ctx.fillStyle = bg; ctx.fill(); outline(ctx, "#1a1a1a", 2.5);
  // 4 rings
  for (let i = 0; i < 4; i++) {
    const rx = startX + ringR + i * gap;
    // Outer ring
    ctx.beginPath(); ctx.arc(rx, cy, ringR, 0, Math.PI * 2);
    const rg = ctx.createRadialGradient(rx - 3, cy - 3, 2, rx, cy, ringR);
    rg.addColorStop(0, "#e0e0e0"); rg.addColorStop(0.5, "#a0a0a0"); rg.addColorStop(1, "#404040");
    ctx.fillStyle = rg; ctx.fill(); outline(ctx, "#1a1a1a", 2.5);
    // Inner hole
    ctx.beginPath(); ctx.arc(rx, cy, ringR - 5, 0, Math.PI * 2);
    ctx.fillStyle = "#111"; ctx.fill();
    ctx.strokeStyle = "#333"; ctx.lineWidth = 1; ctx.stroke();
    // Shine
    shine(ctx, rx - ringR + 3, cy - ringR + 3, rx - 2, cy - ringR + 7, 0.5);
  }
}

function drawKnuckleVoid(ctx: CanvasRenderingContext2D) {
  // Spiked void knuckles
  const cy = 66, startX = 14, ringR = 12, gap = 25;
  const barY = cy + ringR - 3;
  ctx.beginPath(); ctx.roundRect(startX - 2, barY, gap * 3 + ringR * 2 + 4, 10, 3);
  const bg = ctx.createLinearGradient(0, barY, 0, barY + 10);
  bg.addColorStop(0, "#1a003a"); bg.addColorStop(1, "#0a0015");
  ctx.shadowColor = "#8040ff"; ctx.shadowBlur = 6;
  ctx.fillStyle = bg; ctx.fill(); ctx.shadowBlur = 0; outline(ctx, "#0d0014", 2.5);
  for (let i = 0; i < 4; i++) {
    const rx = startX + ringR + i * gap;
    ctx.beginPath(); ctx.arc(rx, cy, ringR, 0, Math.PI * 2);
    const rg = ctx.createRadialGradient(rx - 3, cy - 3, 0, rx, cy, ringR);
    rg.addColorStop(0, "#5a0090"); rg.addColorStop(1, "#0a0015");
    ctx.fillStyle = rg; ctx.fill(); outline(ctx, "#0d0014", 2.5);
    // Inner hole
    ctx.beginPath(); ctx.arc(rx, cy, ringR - 5, 0, Math.PI * 2);
    ctx.fillStyle = "#050010"; ctx.fill();
    ctx.strokeStyle = "#4020a0"; ctx.lineWidth = 1; ctx.stroke();
    // Top spike
    ctx.beginPath();
    ctx.moveTo(rx - 4, cy - ringR + 2);
    ctx.lineTo(rx, cy - ringR - 10);
    ctx.lineTo(rx + 4, cy - ringR + 2);
    ctx.closePath();
    ctx.fillStyle = "#3a006a"; ctx.fill(); outline(ctx, "#0d0014", 2);
    // Purple gem on spike
    smallGem(ctx, rx, cy - ringR - 4, 3, "#c060ff", "#400080");
  }
}

function drawKnuckleGold(ctx: CanvasRenderingContext2D) {
  const cy = 64, startX = 14, ringR = 13, gap = 25;
  const barY = cy + ringR - 3;
  ctx.beginPath(); ctx.roundRect(startX - 2, barY, gap * 3 + ringR * 2 + 4, 10, 3);
  const bg = ctx.createLinearGradient(0, barY, 0, barY + 10);
  bg.addColorStop(0, "#f9c825"); bg.addColorStop(0.5, "#fff176"); bg.addColorStop(1, "#bf6c00");
  ctx.fillStyle = bg; ctx.fill(); outline(ctx, "#1a0a00", 2.5);
  for (let i = 0; i < 4; i++) {
    const rx = startX + ringR + i * gap;
    ctx.beginPath(); ctx.arc(rx, cy, ringR, 0, Math.PI * 2);
    const rg = ctx.createRadialGradient(rx - 4, cy - 4, 0, rx, cy, ringR);
    rg.addColorStop(0, "#fff176"); rg.addColorStop(0.5, "#f9a825"); rg.addColorStop(1, "#7a4800");
    ctx.fillStyle = rg; ctx.fill(); outline(ctx, "#1a0a00", 2.5);
    ctx.beginPath(); ctx.arc(rx, cy, ringR - 5, 0, Math.PI * 2);
    ctx.fillStyle = "#3a2000"; ctx.fill();
    ctx.strokeStyle = "#bf6c00"; ctx.lineWidth = 1; ctx.stroke();
    // Gem on top of each ring
    smallGem(ctx, rx, cy - ringR + 1, 4, "#e040fb", "#4a0060");
    shine(ctx, rx - ringR + 3, cy - ringR + 3, rx - 2, cy - ringR + 7, 0.55);
  }
}

// ─── MACE HEADS ───────────────────────────────────────────────────────────────

function drawMaceHeadIron(ctx: CanvasRenderingContext2D) {
  const cx = 64, cy = 64, r = 32, spikes = 6;
  // Spikes first (behind ball)
  for (let i = 0; i < spikes; i++) {
    const a = (i / spikes) * Math.PI * 2;
    const sx = cx + r * Math.cos(a); const sy = cy + r * Math.sin(a);
    const ox = cx + (r + 16) * Math.cos(a); const oy = cy + (r + 16) * Math.sin(a);
    const px = cx + (r - 2) * Math.cos(a + 0.22); const py = cy + (r - 2) * Math.sin(a + 0.22);
    const qx = cx + (r - 2) * Math.cos(a - 0.22); const qy = cy + (r - 2) * Math.sin(a - 0.22);
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(ox, oy); ctx.lineTo(qx, qy); ctx.closePath();
    const sg = ctx.createLinearGradient(sx, sy, ox, oy);
    sg.addColorStop(0, "#d0d0d0"); sg.addColorStop(1, "#606060");
    ctx.fillStyle = sg; ctx.fill(); outline(ctx, "#1a1a1a", 2);
  }
  // Ball
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
  const bg = ctx.createRadialGradient(cx - 8, cy - 8, 2, cx, cy, r);
  bg.addColorStop(0, "#d8d8d8"); bg.addColorStop(0.5, "#909090"); bg.addColorStop(1, "#303030");
  ctx.fillStyle = bg; ctx.fill(); outline(ctx, "#1a1a1a", 3);
  shine(ctx, cx - 14, cy - 14, cx - 4, cy - 10, 0.65);
}

function drawMaceHeadFire(ctx: CanvasRenderingContext2D) {
  const cx = 64, cy = 64, r = 30;
  // Flame aura
  glow(ctx, cx, cy, r + 25, "rgba(255,100,0,0.4)");
  // Ball
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
  const bg = ctx.createRadialGradient(cx - 10, cy - 10, 2, cx, cy, r);
  bg.addColorStop(0, "#ffffff"); // White hot core
  bg.addColorStop(0.2, "#ffcc00");
  bg.addColorStop(0.5, "#ff6600");
  bg.addColorStop(0.8, "#cc1100");
  bg.addColorStop(1, "#330000"); // Deep char
  ctx.shadowColor = "#ff5500"; ctx.shadowBlur = 24;
  ctx.fillStyle = bg; ctx.fill(); ctx.shadowBlur = 0; outline(ctx, "#220800", 3.5);

  // High-fidelity grit/noise
  addGritPx(ctx, cx - r, cy - r, r * 2, r * 2, 0.15);
  rimLightPxUtil(ctx, cx - r, cy - r, r * 2, r * 2, 'rgba(255,200,0,0.3)');

  // Crack lines with intense glow
  ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2;
  for (const [sx, sy, ex, ey] of [[cx - 12, cy - 18, cx + 6, cy], [cx + 10, cy - 12, cx - 6, cy + 16], [cx - 10, cy + 10, cx + 14, cy + 20]]) {
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey);
    ctx.shadowColor = "#ffcc00"; ctx.shadowBlur = 8; ctx.stroke(); ctx.shadowBlur = 0;
  }
  // Flame wisps around ball - More layered
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const fx = cx + (r + 8) * Math.cos(a);
    const fy = cy + (r + 8) * Math.sin(a);
    ctx.beginPath(); ctx.arc(fx, fy, 6, 0, Math.PI * 2);
    const fg = ctx.createRadialGradient(fx, fy, 0, fx, fy, 6);
    fg.addColorStop(0, "#ffcc00"); fg.addColorStop(1, "transparent");
    ctx.fillStyle = fg; ctx.fill();
  }
  shine(ctx, cx - 16, cy - 16, cx - 6, cy - 12, 0.7);
}

function drawMaceHeadVoid(ctx: CanvasRenderingContext2D) {
  const cx = 64, cy = 64, r = 28, spikes = 8;
  // Void spikes
  for (let i = 0; i < spikes; i++) {
    const a = (i / spikes) * Math.PI * 2;
    const ox = cx + (r + 18) * Math.cos(a); const oy = cy + (r + 18) * Math.sin(a);
    const px = cx + (r - 2) * Math.cos(a + 0.2); const py = cy + (r - 2) * Math.sin(a + 0.2);
    const qx = cx + (r - 2) * Math.cos(a - 0.2); const qy = cy + (r - 2) * Math.sin(a - 0.2);
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(ox, oy); ctx.lineTo(qx, qy); ctx.closePath();
    ctx.fillStyle = "#1a0033"; ctx.fill(); outline(ctx, "#0d0014", 1.5);
    smallGem(ctx, ox, oy, 3.5, "#c060ff", "#300060");
  }
  // Ball
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
  const bg = ctx.createRadialGradient(cx - 6, cy - 6, 0, cx, cy, r);
  bg.addColorStop(0, "#5a0090"); bg.addColorStop(0.6, "#1a0033"); bg.addColorStop(1, "#050010");
  ctx.shadowColor = "#9030d0"; ctx.shadowBlur = 14;
  ctx.fillStyle = bg; ctx.fill(); ctx.shadowBlur = 0; outline(ctx, "#0d0014", 3);
  // Skull face on ball
  ctx.fillStyle = "rgba(200,150,255,0.5)";
  ctx.beginPath(); ctx.arc(cx - 7, cy - 4, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 7, cy - 4, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.beginPath(); ctx.arc(cx - 7, cy - 4, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 7, cy - 4, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.roundRect(cx - 5, cy + 4, 10, 5, 2); ctx.fill();
  glow(ctx, cx, cy, r + 10, "rgba(140,40,255,0.25)");
}

// ─── SPEAR SHAFTS ─────────────────────────────────────────────────────────────

function drawSpearShaftWood(ctx: CanvasRenderingContext2D) {
  const cx = 64, top = 10, bot = 118, hw = 5;
  ctx.beginPath(); ctx.roundRect(cx - hw, top, hw * 2, bot - top, 2);
  const lg = ctx.createLinearGradient(cx - hw, 0, cx + hw, 0);
  lg.addColorStop(0, "#3e2210"); lg.addColorStop(0.4, "#7a4820"); lg.addColorStop(0.7, "#a06030"); lg.addColorStop(1, "#3e2210");
  ctx.fillStyle = lg; ctx.fill(); outline(ctx, "#0d0800", 3);
  // Grain lines
  ctx.strokeStyle = "rgba(60,30,10,0.4)"; ctx.lineWidth = 1;
  for (const gx of [cx - 2, cx + 2]) {
    ctx.beginPath(); ctx.moveTo(gx, top + 12); ctx.lineTo(gx, bot - 14); ctx.stroke();
  }
  // Iron ferrule caps
  for (const [fy, fh] of [[top, 14], [bot - 14, 14]]) {
    ctx.beginPath(); ctx.roundRect(cx - hw - 1, fy, hw * 2 + 2, fh, 1);
    const fg = ctx.createLinearGradient(0, fy, 0, fy + fh);
    fg.addColorStop(0, "#c0c0c0"); fg.addColorStop(0.5, "#e8e8e8"); fg.addColorStop(1, "#606060");
    ctx.fillStyle = fg; ctx.fill(); outline(ctx, "#111", 2);
  }
  // Middle band
  ctx.beginPath(); ctx.roundRect(cx - hw - 1, (top + bot) / 2 - 5, hw * 2 + 2, 10, 1);
  ctx.fillStyle = "#808080"; ctx.fill(); outline(ctx, "#111", 1.5);
}

function drawSpearShaftRune(ctx: CanvasRenderingContext2D) {
  const cx = 64, top = 10, bot = 118, hw = 6;
  ctx.beginPath(); ctx.roundRect(cx - hw, top, hw * 2, bot - top, 2);
  const lg = ctx.createLinearGradient(cx - hw, 0, cx + hw, 0);
  lg.addColorStop(0, "#0d0800"); lg.addColorStop(0.4, "#2a1808"); lg.addColorStop(0.7, "#3a2010"); lg.addColorStop(1, "#0d0800");
  ctx.fillStyle = lg; ctx.fill(); outline(ctx, "#050400", 3);
  // Glowing gold runes carved along shaft
  ctx.strokeStyle = "#f9c825"; ctx.lineWidth = 1.2;
  for (let ry = top + 18; ry < bot - 12; ry += 18) {
    rune(ctx, cx, ry, 4, "#f9c825");
  }
  // Gold end caps
  for (const [fy, fh] of [[top, 12], [bot - 12, 12]]) {
    ctx.beginPath(); ctx.roundRect(cx - hw - 1, fy, hw * 2 + 2, fh, 1);
    const fg = ctx.createLinearGradient(0, fy, 0, fy + fh);
    fg.addColorStop(0, "#fff176"); fg.addColorStop(1, "#bf6c00");
    ctx.fillStyle = fg; ctx.fill(); outline(ctx, "#1a0a00", 2);
  }
}

function drawSpearShaftBone(ctx: CanvasRenderingContext2D) {
  const cx = 64, top = 10, bot = 118, hw = 6;
  ctx.beginPath(); ctx.roundRect(cx - hw, top, hw * 2, bot - top, 2);
  const lg = ctx.createLinearGradient(cx - hw, 0, cx + hw, 0);
  lg.addColorStop(0, "#b09060"); lg.addColorStop(0.5, "#fffde7"); lg.addColorStop(1, "#b09060");
  ctx.fillStyle = lg; ctx.fill(); outline(ctx, "#1a1000", 3);
  // Bone grain
  ctx.strokeStyle = "rgba(140,100,40,0.35)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx - 2, top + 12); ctx.lineTo(cx - 2, bot - 12); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + 2, top + 16); ctx.lineTo(cx + 2, bot - 16); ctx.stroke();
  // Sinew bindings
  ctx.strokeStyle = "rgba(120,80,20,0.6)"; ctx.lineWidth = 2;
  for (let by = top + 15; by < bot - 10; by += 22) {
    ctx.beginPath(); ctx.moveTo(cx - hw, by); ctx.lineTo(cx + hw, by + 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + hw, by + 6); ctx.lineTo(cx - hw, by + 12); ctx.stroke();
  }
  // Bone knuckle joints
  for (const jy of [top + 12, (top + bot) / 2, bot - 12]) {
    ctx.beginPath(); ctx.ellipse(cx, jy, hw + 2, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#f5f0dc"; ctx.fill(); outline(ctx, "#1a1000", 1.5);
  }
}

// ─── CURVED SWORD BLADES ─────────────────────────────────────────────────────

function drawSwordBladeScimitar(ctx: CanvasRenderingContext2D) {
  const cx = 64, top = 12, bot = 110;

  // Scimitar path — wide belly, curves strongly toward tip
  ctx.beginPath();
  ctx.moveTo(cx, top);
  ctx.bezierCurveTo(cx + 18, top + 16, cx + 30, top + 46, cx + 24, bot - 6);
  ctx.lineTo(cx + 20, bot);
  ctx.lineTo(cx + 15, bot);
  ctx.bezierCurveTo(cx + 5, top + 62, cx - 6, top + 36, cx, top);
  ctx.closePath();

  const lg = ctx.createLinearGradient(cx - 6, 0, cx + 30, 0);
  lg.addColorStop(0,    "#222222");
  lg.addColorStop(0.18, "#606060");
  lg.addColorStop(0.42, "#b8b8b8");
  lg.addColorStop(0.62, "#e8e8e8");
  lg.addColorStop(0.78, "#fafafa");
  lg.addColorStop(0.9,  "#ffffff");
  lg.addColorStop(1,    "#d0d0d0");
  ctx.fillStyle = lg; ctx.fill();

  // Clip for inner detail
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx, top);
  ctx.bezierCurveTo(cx + 18, top + 16, cx + 30, top + 46, cx + 24, bot - 6);
  ctx.lineTo(cx + 20, bot); ctx.lineTo(cx + 15, bot);
  ctx.bezierCurveTo(cx + 5, top + 62, cx - 6, top + 36, cx, top);
  ctx.closePath(); ctx.clip();
  rimLight(ctx, "rgba(255,255,255,0.18)", 3);
  addNoise(ctx, 0.04);
  ctx.restore();

  // Outline
  ctx.beginPath();
  ctx.moveTo(cx, top);
  ctx.bezierCurveTo(cx + 18, top + 16, cx + 30, top + 46, cx + 24, bot - 6);
  ctx.lineTo(cx + 20, bot); ctx.lineTo(cx + 15, bot);
  ctx.bezierCurveTo(cx + 5, top + 62, cx - 6, top + 36, cx, top);
  ctx.closePath();
  outline(ctx, "#0d0d0d", 3.5);

  // Bright edge shine along curved cutting edge
  ctx.beginPath();
  ctx.moveTo(cx + 15, top + 14);
  ctx.bezierCurveTo(cx + 27, top + 40, cx + 25, top + 70, cx + 21, bot - 8);
  ctx.strokeStyle = "rgba(255,255,255,0.88)"; ctx.lineWidth = 2; ctx.stroke();

  // Fuller groove along spine
  ctx.beginPath();
  ctx.moveTo(cx - 2, top + 22);
  ctx.bezierCurveTo(cx - 3, top + 48, cx + 3, top + 74, cx + 8, bot - 12);
  ctx.strokeStyle = "rgba(255,255,255,0.32)"; ctx.lineWidth = 1.8; ctx.stroke();

  // Spine shadow
  ctx.beginPath();
  ctx.moveTo(cx - 3, top + 22);
  ctx.bezierCurveTo(cx - 4, top + 48, cx + 2, top + 74, cx + 7, bot - 12);
  ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.lineWidth = 1; ctx.stroke();

  // Arabic/Arabesque engraving near guard
  ctx.strokeStyle = "rgba(180,145,60,0.65)"; ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(cx - 3, top + 28);
  ctx.bezierCurveTo(cx + 4, top + 34, cx + 2, top + 42, cx - 3, top + 48);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx + 4, top + 36, 3, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(180,145,60,0.4)"; ctx.fill();

  addGrit(ctx, 0.06);
}

function drawSwordBladeKatana(ctx: CanvasRenderingContext2D) {
  // Long, gently curved Japanese blade with hamon temper line
  const cx = 64, top = 6, bot = 114;

  ctx.beginPath();
  ctx.moveTo(cx - 2, top);
  ctx.bezierCurveTo(cx + 9,  top + 28, cx + 11, top + 66, cx + 8, bot - 4);
  ctx.lineTo(cx + 5, bot); ctx.lineTo(cx + 1, bot);
  ctx.bezierCurveTo(cx - 4, top + 66, cx - 4, top + 28, cx - 2, top);
  ctx.closePath();

  const lg = ctx.createLinearGradient(cx - 4, 0, cx + 11, 0);
  lg.addColorStop(0,    "#141414");
  lg.addColorStop(0.18, "#3a3a3a");
  lg.addColorStop(0.42, "#909090");
  lg.addColorStop(0.60, "#d8d8d8");
  lg.addColorStop(0.74, "#f4f4f4");
  lg.addColorStop(0.88, "#ffffff");
  lg.addColorStop(1,    "#e0e0e0");
  ctx.fillStyle = lg; ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx - 2, top);
  ctx.bezierCurveTo(cx + 9, top + 28, cx + 11, top + 66, cx + 8, bot - 4);
  ctx.lineTo(cx + 5, bot); ctx.lineTo(cx + 1, bot);
  ctx.bezierCurveTo(cx - 4, top + 66, cx - 4, top + 28, cx - 2, top);
  ctx.closePath(); ctx.clip();
  addNoise(ctx, 0.025);
  ctx.restore();

  ctx.beginPath();
  ctx.moveTo(cx - 2, top);
  ctx.bezierCurveTo(cx + 9, top + 28, cx + 11, top + 66, cx + 8, bot - 4);
  ctx.lineTo(cx + 5, bot); ctx.lineTo(cx + 1, bot);
  ctx.bezierCurveTo(cx - 4, top + 66, cx - 4, top + 28, cx - 2, top);
  ctx.closePath();
  outline(ctx, "#0d0d0d", 3);

  // Hamon (temper line) — wavy, near the ha (edge)
  ctx.beginPath();
  let hy = top + 20;
  ctx.moveTo(cx + 5, hy);
  while (hy < bot - 14) {
    const wave = Math.sin((hy - top) * 0.14) * 1.6;
    ctx.lineTo(cx + 5.5 + wave, hy + 8);
    ctx.lineTo(cx + 4.5 + wave * 0.5, hy + 16);
    hy += 16;
  }
  ctx.strokeStyle = "rgba(210,210,210,0.55)"; ctx.lineWidth = 1.2; ctx.stroke();

  // Ha (cutting edge) brilliant white line
  ctx.beginPath();
  ctx.moveTo(cx + 8, top + 22);
  ctx.bezierCurveTo(cx + 10, top + 55, cx + 10, top + 82, cx + 7, bot - 8);
  ctx.strokeStyle = "rgba(255,255,255,0.92)"; ctx.lineWidth = 1.5; ctx.stroke();

  // Kissaki (tip) highlight
  ctx.beginPath();
  ctx.moveTo(cx - 2, top); ctx.lineTo(cx + 6, top + 14);
  ctx.strokeStyle = "rgba(255,255,255,0.65)"; ctx.lineWidth = 1; ctx.stroke();

  // Ji (blade body) sheen
  ctx.beginPath();
  ctx.moveTo(cx - 1, top + 32);
  ctx.bezierCurveTo(cx - 1, top + 58, cx, top + 84, cx + 1, bot - 22);
  ctx.strokeStyle = "rgba(255,255,255,0.28)"; ctx.lineWidth = 2; ctx.stroke();
}

function drawSwordBladeSabre(ctx: CanvasRenderingContext2D) {
  // European cavalry sabre — medium curve, wide near base, slim tip
  const cx = 64, top = 10, bot = 110;

  ctx.beginPath();
  ctx.moveTo(cx - 4, top);
  ctx.bezierCurveTo(cx + 15, top + 24, cx + 19, top + 56, cx + 13, bot - 6);
  ctx.lineTo(cx + 9, bot); ctx.lineTo(cx + 3, bot);
  ctx.bezierCurveTo(cx - 3, top + 56, cx - 7, top + 28, cx - 4, top);
  ctx.closePath();

  const lg = ctx.createLinearGradient(cx - 7, 0, cx + 19, 0);
  lg.addColorStop(0,    "#252525");
  lg.addColorStop(0.18, "#525252");
  lg.addColorStop(0.42, "#a8a8b0");
  lg.addColorStop(0.60, "#d6d6e0");
  lg.addColorStop(0.76, "#f2f2f2");
  lg.addColorStop(0.90, "#ffffff");
  lg.addColorStop(1,    "#e0e0e0");
  ctx.fillStyle = lg; ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx - 4, top);
  ctx.bezierCurveTo(cx + 15, top + 24, cx + 19, top + 56, cx + 13, bot - 6);
  ctx.lineTo(cx + 9, bot); ctx.lineTo(cx + 3, bot);
  ctx.bezierCurveTo(cx - 3, top + 56, cx - 7, top + 28, cx - 4, top);
  ctx.closePath(); ctx.clip();
  rimLight(ctx, "rgba(255,255,255,0.2)", 3);
  addNoise(ctx, 0.04);
  ctx.restore();

  ctx.beginPath();
  ctx.moveTo(cx - 4, top);
  ctx.bezierCurveTo(cx + 15, top + 24, cx + 19, top + 56, cx + 13, bot - 6);
  ctx.lineTo(cx + 9, bot); ctx.lineTo(cx + 3, bot);
  ctx.bezierCurveTo(cx - 3, top + 56, cx - 7, top + 28, cx - 4, top);
  ctx.closePath();
  outline(ctx, "#0d0d0d", 3.5);

  // Deep fuller groove
  ctx.beginPath();
  ctx.moveTo(cx - 3, top + 20);
  ctx.bezierCurveTo(cx, top + 48, cx + 3, top + 72, cx + 5, bot - 12);
  ctx.strokeStyle = "rgba(255,255,255,0.42)"; ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 2, top + 20);
  ctx.bezierCurveTo(cx + 1, top + 48, cx + 4, top + 72, cx + 6, bot - 12);
  ctx.strokeStyle = "rgba(0,0,0,0.28)"; ctx.lineWidth = 1; ctx.stroke();

  // Edge shine
  ctx.beginPath();
  ctx.moveTo(cx + 13, top + 20);
  ctx.bezierCurveTo(cx + 18, top + 50, cx + 15, top + 76, cx + 11, bot - 8);
  ctx.strokeStyle = "rgba(255,255,255,0.82)"; ctx.lineWidth = 1.8; ctx.stroke();

  // Spine shadow line
  ctx.beginPath();
  ctx.moveTo(cx - 4, top + 14);
  ctx.bezierCurveTo(cx - 5, top + 40, cx - 4, top + 70, cx - 2, bot - 14);
  ctx.strokeStyle = "rgba(0,0,0,0.25)"; ctx.lineWidth = 1.5; ctx.stroke();

  shine(ctx, cx - 5, top + 14, cx - 3, bot - 14, 0.35);
  addGrit(ctx, 0.08);
}

// ─── NEW GUARDS ───────────────────────────────────────────────────────────────

function drawGuardCrescent(ctx: CanvasRenderingContext2D) {
  // Crescent/D-guard for scimitar — curved, Arabic style
  const cx = 64, cy = 64;

  ctx.beginPath();
  ctx.moveTo(cx - 22, cy - 8);
  ctx.bezierCurveTo(cx - 34, cy, cx - 34, cy + 20, cx - 20, cy + 22);
  ctx.bezierCurveTo(cx - 8,  cy + 26, cx + 8,  cy + 26, cx + 20, cy + 22);
  ctx.bezierCurveTo(cx + 34, cy + 20, cx + 34, cy, cx + 22, cy - 8);
  ctx.bezierCurveTo(cx + 14, cy - 16, cx - 14, cy - 16, cx - 22, cy - 8);
  ctx.closePath();

  const lg = ctx.createLinearGradient(cx - 34, 0, cx + 34, 0);
  lg.addColorStop(0,   "#604400");
  lg.addColorStop(0.3, "#c89018");
  lg.addColorStop(0.5, "#f5d84a");
  lg.addColorStop(0.7, "#c89018");
  lg.addColorStop(1,   "#604400");
  ctx.fillStyle = lg; ctx.fill();
  outline(ctx, "#1a0a00", 3.5);

  // Decorative oval cutouts (3 holes in guard body)
  for (const [hx, hy] of [[cx - 18, cy + 10], [cx, cy + 12], [cx + 18, cy + 10]] as [number,number][]) {
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath(); ctx.ellipse(hx, hy, 5, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.beginPath(); ctx.ellipse(hx, hy, 5, 7, 0, 0, Math.PI * 2);
    ctx.strokeStyle = "#1a0a00"; ctx.lineWidth = 1.5; ctx.stroke();
  }

  // Filigree arc engraving
  ctx.beginPath(); ctx.arc(cx, cy + 10, 16, Math.PI * 0.08, Math.PI * 0.92);
  ctx.strokeStyle = "rgba(255,220,60,0.5)"; ctx.lineWidth = 1.2; ctx.stroke();

  // Gold rivets at wing tips
  for (const [rx, ry] of [[cx - 30, cy + 6], [cx + 30, cy + 6]] as [number,number][]) {
    ctx.beginPath(); ctx.arc(rx, ry, 3.5, 0, Math.PI * 2);
    const rg = ctx.createRadialGradient(rx - 1, ry - 1, 0, rx, ry, 3.5);
    rg.addColorStop(0, "#fff176"); rg.addColorStop(1, "#7a4800");
    ctx.fillStyle = rg; ctx.fill(); outline(ctx, "#1a0a00", 1.5);
  }

  shine(ctx, cx - 30, cy - 6, cx - 12, cy - 10, 0.6);
  shine(ctx, cx + 12, cy - 10, cx + 30, cy - 6, 0.6);
}

function drawGuardTsuba(ctx: CanvasRenderingContext2D) {
  // Japanese circular tsuba handguard
  const cx = 64, cy = 64;

  ctx.beginPath(); ctx.arc(cx, cy, 30, 0, Math.PI * 2);
  const lg = ctx.createRadialGradient(cx - 7, cy - 7, 0, cx, cy, 30);
  lg.addColorStop(0,   "#505858");
  lg.addColorStop(0.4, "#2c3232");
  lg.addColorStop(0.75,"#1a1e1e");
  lg.addColorStop(1,   "#0d1010");
  ctx.fillStyle = lg; ctx.fill();
  outline(ctx, "#060808", 3.5);

  // Inner groove ring
  ctx.beginPath(); ctx.arc(cx, cy, 22, 0, Math.PI * 2);
  ctx.strokeStyle = "#445050"; ctx.lineWidth = 2; ctx.stroke();

  // Hitsu-ana (traditional teardrop cutouts)
  for (const angle of [Math.PI * 0.6, Math.PI * 1.6]) {
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(angle);
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath(); ctx.ellipse(14, 0, 4, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(angle);
    ctx.beginPath(); ctx.ellipse(14, 0, 4, 7, 0, 0, Math.PI * 2);
    ctx.strokeStyle = "#1e2626"; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.restore();
  }

  // Center blade slot
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath(); ctx.roundRect(cx - 4, cy - 11, 8, 22, 1); ctx.fill();
  ctx.globalCompositeOperation = "source-over";
  ctx.beginPath(); ctx.roundRect(cx - 4, cy - 11, 8, 22, 1);
  ctx.strokeStyle = "#1e2626"; ctx.lineWidth = 1.5; ctx.stroke();

  // Gold sakura inlay dots (6 petals around inner ring)
  ctx.fillStyle = "rgba(200,158,20,0.75)"; ctx.strokeStyle = "rgba(200,158,20,0.9)"; ctx.lineWidth = 0.8;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const px = cx + 16 * Math.cos(a), py = cy + 16 * Math.sin(a);
    ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }

  // Rim highlight
  ctx.beginPath(); ctx.arc(cx, cy, 28, -Math.PI * 0.45, Math.PI * 0.35);
  ctx.strokeStyle = "rgba(110,150,150,0.65)"; ctx.lineWidth = 2.5; ctx.stroke();

  shine(ctx, cx - 22, cy - 22, cx - 10, cy - 16, 0.55);
}

// ─── NEW POMMELS ──────────────────────────────────────────────────────────────

function drawPommelRing(ctx: CanvasRenderingContext2D) {
  // Ring pommel — classic on cavalry sabres and medieval swords
  const cx = 64, cy = 100, outerR = 14, innerR = 8;
  // Outer torus
  ctx.beginPath(); ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
  const g = ctx.createRadialGradient(cx - 4, cy - 4, 0, cx, cy, outerR);
  g.addColorStop(0,   "#d8d8d8");
  g.addColorStop(0.45,"#909090");
  g.addColorStop(0.8, "#505050");
  g.addColorStop(1,   "#282828");
  ctx.fillStyle = g; ctx.fill(); outline(ctx, "#1a1a1a", 3);
  // Inner hole
  ctx.beginPath(); ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
  ctx.fillStyle = "#111"; ctx.fill();
  ctx.strokeStyle = "#333"; ctx.lineWidth = 1.2; ctx.stroke();
  // Highlight arc
  ctx.beginPath(); ctx.arc(cx, cy, outerR - 3, -Math.PI * 0.55, Math.PI * 0.15);
  ctx.strokeStyle = "rgba(255,255,255,0.65)"; ctx.lineWidth = 2.5; ctx.stroke();
  shine(ctx, cx - outerR + 3, cy - outerR + 3, cx - 4, cy - outerR + 8, 0.6);
}

function drawPommelDisc(ctx: CanvasRenderingContext2D) {
  // Disc/wheel pommel — matching Japanese katana style
  const cx = 64, cy = 100, r = 14;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
  const g = ctx.createRadialGradient(cx - 5, cy - 5, 0, cx, cy, r);
  g.addColorStop(0,   "#505858");
  g.addColorStop(0.4, "#303838");
  g.addColorStop(0.75,"#1a2020");
  g.addColorStop(1,   "#0d1010");
  ctx.fillStyle = g; ctx.fill(); outline(ctx, "#060808", 3);
  // Menuki-inspired gold ring inlay
  ctx.beginPath(); ctx.arc(cx, cy, r - 5, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(200,158,20,0.8)"; ctx.lineWidth = 1.5; ctx.stroke();
  // Center cap rivet
  ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  const cg = ctx.createRadialGradient(cx - 1, cy - 1, 0, cx, cy, 4);
  cg.addColorStop(0, "#fff176"); cg.addColorStop(1, "#7a4800");
  ctx.fillStyle = cg; ctx.fill(); outline(ctx, "#1a0a00", 1.5);
  // Rim arc highlight
  ctx.beginPath(); ctx.arc(cx, cy, r - 1, -Math.PI * 0.5, Math.PI * 0.2);
  ctx.strokeStyle = "rgba(100,140,140,0.7)"; ctx.lineWidth = 2; ctx.stroke();
  shine(ctx, cx - r + 3, cy - r + 3, cx - 4, cy - r + 8, 0.5);
}

// ─── PART REGISTRY ────────────────────────────────────────────────────────────

export const ALL_PARTS: WeaponPart[] = [
  // SWORD BLADES
  { id: "sword_blade_iron_01", name: "Iron Longsword", category: "sword_blade", material: "iron", rarity: "common", tags: ["physical", "any_biome"], draw: drawSwordBladeIron },
  { id: "sword_blade_steel_02", name: "Steel Double-Fuller", category: "sword_blade", material: "steel", rarity: "uncommon", tags: ["physical", "any_biome"], draw: drawSwordBladeSteel },
  { id: "sword_blade_void_03", name: "Void Serrated Blade", category: "sword_blade", material: "void", rarity: "epic", tags: ["magical", "void_biome"], draw: drawSwordBladeVoid },
  { id: "sword_blade_royal_04", name: "Royal Fleur Blade", category: "sword_blade", material: "royal", rarity: "legendary", tags: ["physical", "royal_faction"], draw: drawSwordBladeRoyal },
  { id: "sword_blade_cursed_05", name: "Cursed Flame Blade", category: "sword_blade", material: "cursed", rarity: "epic", tags: ["fire", "cursed_biome"], draw: drawSwordBladeCursed },
  { id: "sword_blade_forest_06", name: "Ancient Forest Blade", category: "sword_blade", material: "nature", rarity: "rare", tags: ["nature", "forest_biome"], draw: drawSwordBladeForest },
  { id: "sword_blade_frost_07", name: "Frostborn Blade", category: "sword_blade", material: "ice", rarity: "rare", tags: ["ice", "tundra_biome"], draw: drawSwordBladeFrost },
  { id: "sword_blade_ancient_08", name: "Ancient Bronze Blade", category: "sword_blade", material: "gold", rarity: "uncommon", tags: ["physical", "ruins_biome"], draw: drawSwordBladeAncient },
  { id: "sword_blade_scimitar_09", name: "Desert Scimitar", category: "sword_blade", material: "iron", rarity: "rare", tags: ["physical", "desert_biome"], draw: drawSwordBladeScimitar },
  { id: "sword_blade_katana_10", name: "Obsidian Katana", category: "sword_blade", material: "steel", rarity: "epic", tags: ["physical", "eastern_faction"], draw: drawSwordBladeKatana },
  { id: "sword_blade_sabre_11", name: "Cavalry Sabre", category: "sword_blade", material: "steel", rarity: "uncommon", tags: ["physical", "any_biome"], draw: drawSwordBladeSabre },

  // SWORD GUARDS
  { id: "sword_guard_iron_01", name: "Simple Crossguard", category: "sword_guard", material: "iron", rarity: "common", tags: ["physical"], draw: drawGuardSimpleIron },
  { id: "sword_guard_gold_02", name: "Ornate Wing Guard", category: "sword_guard", material: "gold", rarity: "legendary", tags: ["physical", "royal_faction"], draw: drawGuardOrnateGold },
  { id: "sword_guard_royal_03", name: "Crown Guard", category: "sword_guard", material: "royal", rarity: "epic", tags: ["physical", "royal_faction"], draw: drawGuardCrown },
  { id: "sword_guard_bone_04", name: "Skull Bone Guard", category: "sword_guard", material: "bone", rarity: "rare", tags: ["physical", "undead_faction"], draw: drawGuardBoneSkull },
  { id: "sword_guard_void_05", name: "Twisted Void Guard", category: "sword_guard", material: "void", rarity: "epic", tags: ["magical", "void_biome"], draw: drawGuardVoidTwist },
  { id: "sword_guard_fire_06", name: "Fire Wing Guard", category: "sword_guard", material: "fire", rarity: "rare", tags: ["fire", "volcanic_biome"], draw: drawGuardFireWings },
  { id: "sword_guard_crescent_07", name: "Crescent Desert Guard", category: "sword_guard", material: "gold", rarity: "rare", tags: ["physical", "desert_biome"], draw: drawGuardCrescent },
  { id: "sword_guard_tsuba_08", name: "Iron Tsuba", category: "sword_guard", material: "iron", rarity: "uncommon", tags: ["physical", "eastern_faction"], draw: drawGuardTsuba },

  // SWORD HANDLES
  { id: "sword_handle_leather_01", name: "Leather Wrapped Grip", category: "sword_handle", material: "leather", rarity: "common", tags: ["physical"], draw: drawHandleLeather },
  { id: "sword_handle_bone_02", name: "Ribbed Bone Grip", category: "sword_handle", material: "bone", rarity: "uncommon", tags: ["physical", "undead_faction"], draw: drawHandleBone },
  { id: "sword_handle_crystal_03", name: "Crystal Grip", category: "sword_handle", material: "crystal", rarity: "rare", tags: ["magical"], draw: drawHandleCrystal },
  { id: "sword_handle_royal_04", name: "Royal Velvet Grip", category: "sword_handle", material: "royal", rarity: "epic", tags: ["physical", "royal_faction"], draw: drawHandleRoyal },
  { id: "sword_handle_void_05", name: "Void Cracked Grip", category: "sword_handle", material: "void", rarity: "epic", tags: ["magical", "void_biome"], draw: drawHandleVoid },

  // SWORD POMMELS
  { id: "sword_pommel_iron_01", name: "Iron Ball Pommel", category: "sword_pommel", material: "iron", rarity: "common", tags: ["physical"], draw: drawPommelIron },
  { id: "sword_pommel_gold_02", name: "Faceted Gold Pommel", category: "sword_pommel", material: "gold", rarity: "rare", tags: ["physical", "royal_faction"], draw: drawPommelGold },
  { id: "sword_pommel_crystal_03", name: "Crystal Teardrop Pommel", category: "sword_pommel", material: "crystal", rarity: "rare", tags: ["magical"], draw: drawPommelCrystal },
  { id: "sword_pommel_royal_04", name: "Royal Crown Pommel", category: "sword_pommel", material: "royal", rarity: "legendary", tags: ["physical", "royal_faction"], draw: drawPommelRoyal },
  { id: "sword_pommel_void_05", name: "Void Eye Pommel", category: "sword_pommel", material: "void", rarity: "epic", tags: ["magical", "void_biome"], draw: drawPommelVoid },
  { id: "sword_pommel_ring_06", name: "Steel Ring Pommel", category: "sword_pommel", material: "iron", rarity: "common", tags: ["physical", "any_biome"], draw: drawPommelRing },
  { id: "sword_pommel_disc_07", name: "Iron Disc Pommel", category: "sword_pommel", material: "iron", rarity: "uncommon", tags: ["physical", "eastern_faction"], draw: drawPommelDisc },

  // AXE HEADS
  { id: "axe_head_iron_01", name: "Iron Single-Bit Axe", category: "axe_head", material: "iron", rarity: "common", tags: ["physical", "any_biome"], draw: drawAxeHeadIron },
  { id: "axe_head_void_02", name: "Void Double Crescent", category: "axe_head", material: "void", rarity: "epic", tags: ["magical", "void_biome"], draw: drawAxeHeadVoid },
  { id: "axe_head_gold_03", name: "Ornate Royal Axe", category: "axe_head", material: "gold", rarity: "legendary", tags: ["physical", "royal_faction"], draw: drawAxeHeadGold },
  { id: "axe_head_bone_04", name: "Bone Fang Axe", category: "axe_head", material: "bone", rarity: "rare", tags: ["physical", "undead_faction"], draw: drawAxeHeadBone },
  { id: "axe_head_fire_05", name: "Blazing Flame Axe", category: "axe_head", material: "fire", rarity: "epic", tags: ["fire", "volcanic_biome"], draw: drawAxeHeadFire },

  // AXE HANDLES
  { id: "axe_handle_wood_01", name: "Banded Wood Haft", category: "axe_handle", material: "wood", rarity: "common", tags: ["physical"], draw: drawAxeHandleWood },
  { id: "axe_handle_rune_02", name: "Rune-Carved Haft", category: "axe_handle", material: "wood", rarity: "rare", tags: ["magical"], draw: drawAxeHandleRune },
  { id: "axe_handle_bone_03", name: "Sinew-Wrapped Bone Haft", category: "axe_handle", material: "bone", rarity: "uncommon", tags: ["physical", "undead_faction"], draw: drawAxeHandleBone },

  // HAMMER HEADS
  { id: "hammer_head_iron_01", name: "War Hammer Head", category: "hammer_head", material: "iron", rarity: "common", tags: ["physical", "any_biome"], draw: drawHammerHeadIron },
  { id: "hammer_head_royal_02", name: "Royal Flanged Mace", category: "hammer_head", material: "gold", rarity: "legendary", tags: ["physical", "royal_faction"], draw: drawHammerHeadRoyal },
  { id: "hammer_head_void_03", name: "Void Rune Maul", category: "hammer_head", material: "void", rarity: "epic", tags: ["magical", "void_biome"], draw: drawHammerHeadVoid },

  // SPEAR TIPS
  { id: "spear_tip_steel_01", name: "Leaf Spear Tip", category: "spear_tip", material: "steel", rarity: "common", tags: ["physical", "any_biome"], draw: drawSpearTipSteel },
  { id: "spear_tip_void_02", name: "Void Shadow Spike", category: "spear_tip", material: "void", rarity: "epic", tags: ["magical", "void_biome"], draw: drawSpearTipVoid },
  { id: "spear_tip_crystal_03", name: "Crystal Spear Point", category: "spear_tip", material: "crystal", rarity: "rare", tags: ["magical", "any_biome"], draw: drawSpearTipCrystal },

  // STAFF HEADS
  { id: "staff_head_arcane_01", name: "Arcane Orb Staff", category: "staff_head", material: "crystal", rarity: "rare", tags: ["magical", "arcane"], draw: drawStaffHeadArcane },
  { id: "staff_head_fire_02", name: "Flame Crown Staff", category: "staff_head", material: "fire", rarity: "epic", tags: ["fire", "volcanic_biome"], draw: drawStaffHeadFire },
  { id: "staff_head_void_03", name: "Void Eye Staff", category: "staff_head", material: "void", rarity: "legendary", tags: ["magical", "void_biome"], draw: drawStaffHeadVoid },

  // SHIELDS
  { id: "shield_round_iron_01", name: "Iron Round Buckler", category: "shield", material: "iron", rarity: "common", tags: ["physical", "any_biome"], draw: drawShieldRoundIron },
  { id: "shield_kite_royal_02", name: "Royal Kite Shield", category: "shield", material: "royal", rarity: "legendary", tags: ["physical", "royal_faction"], draw: drawShieldKiteRoyal },
  { id: "shield_tower_void_03", name: "Void Tower Shield", category: "shield", material: "void", rarity: "epic", tags: ["magical", "void_biome"], draw: drawShieldTowerVoid },

  // MAGICAL CRYSTALS
  { id: "magical_crystal_fire_01", name: "Fire Crystal", category: "magical_crystal", material: "fire", rarity: "rare", tags: ["fire", "volcanic_biome"], draw: drawCrystalFire },
  { id: "magical_crystal_ice_02", name: "Ice Crystal", category: "magical_crystal", material: "ice", rarity: "rare", tags: ["ice", "tundra_biome"], draw: drawCrystalIce },
  { id: "magical_crystal_arcane_03", name: "Arcane Crystal", category: "magical_crystal", material: "arcane", rarity: "epic", tags: ["magical", "any_biome"], draw: drawCrystalArcane },

  // DAGGER BLADES
  { id: "dagger_blade_iron_01", name: "Iron Dirk", category: "dagger_blade", material: "iron", rarity: "common", tags: ["physical", "any_biome"], draw: drawDaggerBladeIron },
  { id: "dagger_blade_shadow_02", name: "Shadow Assassin Blade", category: "dagger_blade", material: "shadow", rarity: "rare", tags: ["physical", "rogue_faction"], draw: drawDaggerBladeShadow },
  { id: "dagger_blade_gold_03", name: "Ornate Gold Stiletto", category: "dagger_blade", material: "gold", rarity: "legendary", tags: ["physical", "royal_faction"], draw: drawDaggerBladeGold },

  // BOW LIMBS
  { id: "bow_limb_wood_01", name: "Wood Recurve Bow", category: "bow_limb", material: "wood", rarity: "common", tags: ["physical", "forest_biome"], draw: drawBowLimbWood },
  { id: "bow_limb_crystal_02", name: "Crystal Ice Bow", category: "bow_limb", material: "crystal", rarity: "rare", tags: ["ice", "tundra_biome"], draw: drawBowLimbCrystal },
  { id: "bow_limb_void_03", name: "Void Shadowbow", category: "bow_limb", material: "void", rarity: "epic", tags: ["magical", "void_biome"], draw: drawBowLimbVoid },

  // BOW STRINGS
  { id: "bow_string_sinew_01", name: "Sinew Bowstring", category: "bow_string", material: "bone", rarity: "common", tags: ["physical", "any_biome"], draw: drawBowStringSinew },
  { id: "bow_string_arcane_02", name: "Arcane Energy String", category: "bow_string", material: "crystal", rarity: "epic", tags: ["magical", "any_biome"], draw: drawBowStringArcane },

  // KNUCKLES
  { id: "knuckle_iron_01", name: "Iron Brass Knuckles", category: "knuckle", material: "iron", rarity: "common", tags: ["physical", "any_biome"], draw: drawKnuckleIron },
  { id: "knuckle_void_02", name: "Void Spike Knuckles", category: "knuckle", material: "void", rarity: "epic", tags: ["magical", "void_biome"], draw: drawKnuckleVoid },
  { id: "knuckle_gold_03", name: "Ornate Gold Knuckles", category: "knuckle", material: "gold", rarity: "legendary", tags: ["physical", "royal_faction"], draw: drawKnuckleGold },

  // MACE HEADS
  { id: "mace_head_iron_01", name: "Iron Spiked Mace", category: "mace_head", material: "iron", rarity: "common", tags: ["physical", "any_biome"], draw: drawMaceHeadIron },
  { id: "mace_head_fire_02", name: "Blazing Fire Mace", category: "mace_head", material: "fire", rarity: "epic", tags: ["fire", "volcanic_biome"], draw: drawMaceHeadFire },
  { id: "mace_head_void_03", name: "Void Skull Mace", category: "mace_head", material: "void", rarity: "legendary", tags: ["magical", "void_biome"], draw: drawMaceHeadVoid },

  // SPEAR SHAFTS
  { id: "spear_shaft_wood_01", name: "Iron-Capped Wood Shaft", category: "spear_shaft", material: "wood", rarity: "common", tags: ["physical", "any_biome"], draw: drawSpearShaftWood },
  { id: "spear_shaft_rune_02", name: "Rune-Carved Dark Shaft", category: "spear_shaft", material: "wood", rarity: "rare", tags: ["magical", "ruins_biome"], draw: drawSpearShaftRune },
  { id: "spear_shaft_bone_03", name: "Sinew-Bound Bone Shaft", category: "spear_shaft", material: "bone", rarity: "uncommon", tags: ["physical", "undead_faction"], draw: drawSpearShaftBone },
];

export const PART_CATEGORIES: Record<string, WeaponPart[]> = {
  sword_blade: ALL_PARTS.filter(p => p.category === "sword_blade"),
  sword_guard: ALL_PARTS.filter(p => p.category === "sword_guard"),
  sword_handle: ALL_PARTS.filter(p => p.category === "sword_handle"),
  sword_pommel: ALL_PARTS.filter(p => p.category === "sword_pommel"),
  axe_head: ALL_PARTS.filter(p => p.category === "axe_head"),
  axe_handle: ALL_PARTS.filter(p => p.category === "axe_handle"),
  hammer_head: ALL_PARTS.filter(p => p.category === "hammer_head"),
  spear_tip: ALL_PARTS.filter(p => p.category === "spear_tip"),
  spear_shaft: ALL_PARTS.filter(p => p.category === "spear_shaft"),
  staff_head: ALL_PARTS.filter(p => p.category === "staff_head"),
  shield: ALL_PARTS.filter(p => p.category === "shield"),
  magical_crystal: ALL_PARTS.filter(p => p.category === "magical_crystal"),
  dagger_blade: ALL_PARTS.filter(p => p.category === "dagger_blade"),
  bow_limb: ALL_PARTS.filter(p => p.category === "bow_limb"),
  bow_string: ALL_PARTS.filter(p => p.category === "bow_string"),
  knuckle: ALL_PARTS.filter(p => p.category === "knuckle"),
  mace_head: ALL_PARTS.filter(p => p.category === "mace_head"),
};

export function renderPartToCanvas(part: WeaponPart): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, 128, 128);
  part.draw(ctx);
  return canvas;
}
