export interface WeaponPart {
  id: string;
  name: string;
  category: string;
  material: string;
  rarity: string;
  tags: string[];
  draw: (ctx: CanvasRenderingContext2D) => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function outline(ctx: CanvasRenderingContext2D, color = "#0d0d0d", lw = 3, soft = false) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  if (soft) {
    ctx.globalAlpha = 0.6;
    ctx.stroke();
    ctx.lineWidth = lw * 0.5;
    ctx.globalAlpha = 1.0;
  }
  ctx.stroke();
  ctx.restore();
}

function shine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, alpha = 0.55, width = 2) {
  ctx.save();
  const g = ctx.createLinearGradient(x1, y1, x2, y2);
  g.addColorStop(0, `rgba(255,255,255,0)`);
  g.addColorStop(0.2, `rgba(255,255,255,${alpha})`);
  g.addColorStop(0.8, `rgba(255,255,255,${alpha})`);
  g.addColorStop(1, `rgba(255,255,255,0)`);
  ctx.strokeStyle = g;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

function rimLight(ctx: CanvasRenderingContext2D, pathFn: () => void, color = "rgba(255,255,255,0.4)", width = 4) {
  ctx.save();
  pathFn();
  ctx.clip();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.globalCompositeOperation = "screen";
  ctx.stroke();
  ctx.restore();
}

function addNoise(ctx: CanvasRenderingContext2D, opacity = 0.05) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.globalCompositeOperation = "overlay";
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * 128;
    const y = Math.random() * 128;
    ctx.fillStyle = Math.random() > 0.5 ? "#fff" : "#000";
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.restore();
}

function addGrit(ctx: CanvasRenderingContext2D, pathFn: () => void, opacity = 0.15) {
  ctx.save();
  pathFn();
  ctx.clip();
  ctx.globalAlpha = opacity;
  ctx.globalCompositeOperation = "multiply";
  for (let i = 0; i < 150; i++) {
    const x = Math.random() * 128;
    const y = Math.random() * 128;
    const r = Math.random() * 2 + 0.5;
    ctx.fillStyle = "#3a2a1a";
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function gem(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, c1: string, c2: string) {
  ctx.save();
  // Deep Shadow
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 2;

  // Glow
  const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 2.5);
  glow.addColorStop(0, c1 + "66");
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(x, y, r * 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

  // Body — hexagonal facet
  ctx.beginPath();
  const sides = 6;
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
    const px = x + r * Math.cos(angle);
    const py = y + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();

  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(0.3, c1);
  g.addColorStop(1, c2);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.8)";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Internal facets
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
    ctx.moveTo(x, y);
    ctx.lineTo(x + r * Math.cos(angle), y + r * Math.sin(angle));
  }
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Sparkle dot
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(x - r * 0.35, y - r * 0.35, r * 0.25, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function smallGem(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, c1: string, c2: string) {
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
  g.addColorStop(0, "#fff"); g.addColorStop(0.3, c1); g.addColorStop(1, c2);
  ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.7)"; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.beginPath(); ctx.arc(x - r * 0.4, y - r * 0.4, r * 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function glow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, "transparent");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function rune(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, color: string) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.moveTo(x, y - s); ctx.lineTo(x, y + s);
  ctx.moveTo(x - s, y); ctx.lineTo(x + s, y);
  ctx.moveTo(x - s * 0.6, y - s * 0.6); ctx.lineTo(x + s * 0.6, y + s * 0.6);
  ctx.stroke(); ctx.restore();
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
  const path = () => bladePath(ctx, cx, top, bottom, bw);
  path();
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

  // Add subtle texture
  addNoise(ctx, 0.04);

  path();
  outline(ctx, outlineColor, 3.5, true);

  // Rim lighting for 3D feel
  rimLight(ctx, path, "rgba(255,255,255,0.25)", 5);

  // Center ridge
  ctx.beginPath(); ctx.moveTo(cx, top + 4); ctx.lineTo(cx, bottom - 4);
  ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, top + 4); ctx.lineTo(cx, bottom - 4);
  ctx.strokeStyle = "rgba(255,255,255,0.1)"; ctx.lineWidth = 4; ctx.stroke();
}

// ─── SWORD BLADES ────────────────────────────────────────────────────────────

function drawSwordBladeIron(ctx: CanvasRenderingContext2D) {
  drawBlade(ctx, 64, 8, 108, 13, "#444", "#a0a0a0", "#333");
  addGrit(ctx, () => bladePath(ctx, 64, 8, 108, 13), 0.1);
  shine(ctx, 55, 25, 55, 90, 0.4, 3);
}

function drawSwordBladeSteel(ctx: CanvasRenderingContext2D) {
  // Two-fullered blade — bright silver
  const cx = 64, top = 5, bot = 108, bw = 14;
  drawBlade(ctx, cx, top, bot, bw, "#607080", "#d0d8e0", "#405060");
  // Fuller grooves
  for (const fx of [cx - 4, cx + 4]) {
    ctx.beginPath(); ctx.moveTo(fx, top + 24); ctx.lineTo(fx, bot - 4);
    ctx.strokeStyle = "rgba(20,30,40,0.6)"; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(fx, top + 24); ctx.lineTo(fx, bot - 4);
    ctx.strokeStyle = "rgba(255,255,255,0.1)"; ctx.lineWidth = 1; ctx.stroke();
  }
  shine(ctx, cx - bw + 3, top + 22, cx - bw + 3, bot - 6, 0.6, 2.5);
  // Edge flash
  ctx.beginPath(); ctx.moveTo(cx + bw - 2, top + 20); ctx.lineTo(cx + bw - 2, bot - 6);
  ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 1.5; ctx.stroke();
}

function drawSwordBladeVoid(ctx: CanvasRenderingContext2D) {
  const cx = 64, top = 6, bot = 110, bw = 14;
  const path = () => {
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
  path();
  const lg = ctx.createLinearGradient(cx - bw, 0, cx + bw, 0);
  lg.addColorStop(0, "#05000a"); lg.addColorStop(0.3, "#2d064d"); lg.addColorStop(0.7, "#6a1b9a"); lg.addColorStop(1, "#ab47bc");
  ctx.fillStyle = lg; ctx.fill();

  addNoise(ctx, 0.08);
  outline(ctx, "#05000a", 3.5, true);
  rimLight(ctx, path, "rgba(180,100,255,0.4)", 6);

  // Purple edge glow on serrations
  ctx.beginPath(); ctx.moveTo(cx + bw, top + 22);
  let y = top + 22;
  while (y < bot) {
    ctx.lineTo(cx + bw - 7, y + 8); ctx.lineTo(cx + bw, y + 16); y += 16;
  }
  ctx.strokeStyle = "rgba(200,100,255,0.6)"; ctx.lineWidth = 2; ctx.stroke();

  rune(ctx, cx - 4, bot - 28, 4.5, "#d080ff");
  rune(ctx, cx - 4, bot - 55, 4.5, "#d080ff");

  // Center ridge
  ctx.beginPath(); ctx.moveTo(cx, top + 8); ctx.lineTo(cx, bot - 6);
  ctx.strokeStyle = "rgba(200,130,255,0.4)"; ctx.lineWidth = 1.5; ctx.stroke();
}

function drawSwordBladeRoyal(ctx: CanvasRenderingContext2D) {
  const cx = 64, top = 10, bot = 108;
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(cx, top);
    ctx.bezierCurveTo(cx + 22, top + 20, cx + 20, top + 55, cx + 14, bot);
    ctx.lineTo(cx - 14, bot);
    ctx.bezierCurveTo(cx - 20, top + 55, cx - 22, top + 20, cx, top);
    ctx.closePath();
  };
  path();
  const lg = ctx.createLinearGradient(cx - 20, 0, cx + 20, 0);
  lg.addColorStop(0, "#6b4e00"); lg.addColorStop(0.3, "#f9c84a"); lg.addColorStop(0.5, "#fffde0"); lg.addColorStop(0.7, "#e8a800"); lg.addColorStop(1, "#503000");
  ctx.fillStyle = lg; ctx.fill();

  addNoise(ctx, 0.05);
  outline(ctx, "#1a0a00", 3.5, true);
  rimLight(ctx, path, "rgba(255,240,150,0.35)", 5);

  // Royal blue center stripe
  ctx.beginPath(); ctx.moveTo(cx, top + 15); ctx.lineTo(cx, bot - 2);
  ctx.strokeStyle = "#0d47a1"; ctx.lineWidth = 6; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, top + 15); ctx.lineTo(cx, bot - 2);
  ctx.strokeStyle = "rgba(100,200,255,0.6)"; ctx.lineWidth = 1.5; ctx.stroke();

  for (const dy of [bot - 30, bot - 55, bot - 80]) {
    smallGem(ctx, cx, dy, 4.5, "#4aa0ff", "#0a2080");
  }
  shine(ctx, cx - 18, top + 25, cx - 12, bot - 15, 0.5, 3);
}

function drawSwordBladeCursed(ctx: CanvasRenderingContext2D) {
  const cx = 64, top = 8, bot = 110, bw = 12;
  const path = () => {
    ctx.beginPath(); ctx.moveTo(cx, top);
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
  path();
  const lg = ctx.createLinearGradient(cx - bw, 0, cx + bw, 0);
  lg.addColorStop(0, "#1a0000"); lg.addColorStop(0.3, "#8b0000"); lg.addColorStop(0.7, "#d50000"); lg.addColorStop(1, "#ff3d00");
  ctx.fillStyle = lg; ctx.fill();

  addGrit(ctx, path, 0.15);
  outline(ctx, "#100000", 3.5, true);
  rimLight(ctx, path, "rgba(255,100,50,0.3)", 5);

  for (let ey = bot - 8; ey > top + 28; ey -= 16) {
    ctx.beginPath(); ctx.arc(cx - bw + 6, ey, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = "#ffab00"; ctx.fill();
  }

  ctx.strokeStyle = "rgba(255,60,0,0.6)"; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(cx + 3, top + 35); ctx.lineTo(cx + 9, top + 50); ctx.lineTo(cx + 5, top + 75); ctx.stroke();

  glow(ctx, cx, bot - 20, 40, "rgba(255,50,0,0.1)");
}

// ─── NEW BLADES ───────────────────────────────────────────────────────────────

function drawSwordBladeForest(ctx: CanvasRenderingContext2D) {
  // Green nature blade with vine etchings
  const cx = 64, top = 8, bot = 108, bw = 13;
  drawBlade(ctx, cx, top, bot, bw, "#1b3a1b", "#3d7a36", "#0a1a08");
  // Vine etching
  ctx.strokeStyle = "rgba(100,200,60,0.5)"; ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(cx - 2, top + 25);
  ctx.bezierCurveTo(cx + 8, top + 45, cx - 8, top + 65, cx + 5, top + 95);
  ctx.stroke();
  for (const [vx, vy] of [[cx + 6, top + 42], [cx - 6, top + 65], [cx + 6, top + 85]]) {
    ctx.beginPath(); ctx.arc(vx, vy, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(60,180,40,0.8)"; ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.lineWidth = 0.5; ctx.stroke();
  }
  shine(ctx, cx - bw + 3, top + 22, cx - bw + 3, bot - 8, 0.4, 2);
}

function drawSwordBladeFrost(ctx: CanvasRenderingContext2D) {
  // Ice blade — translucent blue
  const cx = 64, top = 5, bot = 110, bw = 13;
  drawBlade(ctx, cx, top, bot, bw, "#0d47a1", "#b3e5fc", "#01579b");
  // Ice crystal veins
  ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = 0.8;
  for (const [sx, sy, ex, ey] of [
    [cx - 4, top + 25, cx + 8, top + 50],
    [cx + 3, top + 55, cx - 7, top + 80],
    [cx - 5, top + 85, cx + 7, top + 105],
  ]) {
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex + 6, ey - 10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - 6, ey - 8); ctx.stroke();
  }
  glow(ctx, cx, (top + bot) / 2, 40, "rgba(100,200,255,0.1)");
  shine(ctx, cx - bw + 2, top + 20, cx - bw + 2, bot - 8, 0.7, 3);
}

function drawSwordBladeAncient(ctx: CanvasRenderingContext2D) {
  // Weathered bronze/copper ancient blade
  const cx = 64, top = 8, bot = 108, bw = 14;
  drawBlade(ctx, cx, top, bot, bw, "#4e342e", "#a1887f", "#3e2723");
  // Green patina patches
  addGrit(ctx, () => bladePath(ctx, cx, top, bot, bw), 0.2);
  for (const [px, py, pr] of [[cx - 6, top + 35, 6], [cx + 5, top + 60, 5], [cx - 4, top + 85, 5]]) {
    ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(77,182,172,0.4)"; ctx.fill();
  }
  // Chipped edge marks
  ctx.strokeStyle = "rgba(0,0,0,0.4)"; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(cx + bw - 1, top + 40); ctx.lineTo(cx + bw - 5, top + 48); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + bw - 1, top + 75); ctx.lineTo(cx + bw - 6, top + 82); ctx.stroke();
  shine(ctx, cx - bw + 4, top + 25, cx - bw + 4, bot - 10, 0.35, 2);
}

// ─── SWORD GUARDS ─────────────────────────────────────────────────────────────

function drawGuardSimpleIron(ctx: CanvasRenderingContext2D) {
  // Simple crossguard bar
  const cx = 64, cy = 64, hw = 42, h = 12;
  const path = () => ctx.roundRect(cx - hw, cy - h / 2, hw * 2, h, 4);
  ctx.beginPath(); path();
  const lg = ctx.createLinearGradient(0, cy - h, 0, cy + h);
  lg.addColorStop(0, "#888"); lg.addColorStop(0.4, "#d0d0d0"); lg.addColorStop(1, "#333");
  ctx.fillStyle = lg; ctx.fill();

  addNoise(ctx, 0.05);
  outline(ctx, "#1a1a1a", 3, true);
  rimLight(ctx, path, "rgba(255,255,255,0.3)", 4);

  shine(ctx, cx - hw + 8, cy - h / 2 + 2, cx + hw - 8, cy - h / 2 + 2, 0.5, 2);
  // End caps
  for (const ex of [cx - hw + 5, cx + hw - 5]) {
    ctx.beginPath(); ctx.arc(ex, cy, h / 2 + 2, 0, Math.PI * 2);
    const g2 = ctx.createRadialGradient(ex - 2, cy - 2, 0, ex, cy, h / 2 + 2);
    g2.addColorStop(0, "#e0e0e0"); g2.addColorStop(1, "#222");
    ctx.fillStyle = g2; ctx.fill();
    outline(ctx, "#111", 2.5, true);
  }
}

function drawGuardOrnateGold(ctx: CanvasRenderingContext2D) {
  // Winged gold guard
  const cx = 64, cy = 64;
  const lg = ctx.createLinearGradient(0, cy - 16, 0, cy + 10);
  lg.addColorStop(0, "#fff59d"); lg.addColorStop(0.4, "#fbc02d"); lg.addColorStop(1, "#827717");

  const wing = () => {
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy - 8);
    ctx.bezierCurveTo(cx - 25, cy - 35, cx - 55, cy - 25, cx - 50, cy - 6);
    ctx.bezierCurveTo(cx - 48, cy + 8, cx - 30, cy + 10, cx - 6, cy + 10);
    ctx.closePath();
  };

  // Left wing
  wing();
  ctx.fillStyle = lg; ctx.fill();
  addNoise(ctx, 0.04);
  outline(ctx, "#263238", 3, true);
  rimLight(ctx, wing, "rgba(255,255,255,0.4)", 4);

  // Right wing (mirror)
  ctx.save(); ctx.translate(cx * 2, 0); ctx.scale(-1, 1);
  wing();
  ctx.fillStyle = lg; ctx.fill();
  addNoise(ctx, 0.04);
  outline(ctx, "#263238", 3, true);
  rimLight(ctx, wing, "rgba(255,255,255,0.4)", 4);
  ctx.restore();

  // Center collar
  const collar = () => { ctx.beginPath(); ctx.ellipse(cx, cy, 11, 11, 0, 0, Math.PI * 2); };
  collar();
  const cg = ctx.createRadialGradient(cx - 3, cy - 4, 0, cx, cy, 11);
  cg.addColorStop(0, "#fff59d"); cg.addColorStop(1, "#827717");
  ctx.fillStyle = cg; ctx.fill(); outline(ctx, "#263238", 2.5, true);
  gem(ctx, cx, cy, 7.5, "#039be5", "#01213f");

  shine(ctx, cx - 48, cy - 15, cx - 25, cy - 28, 0.6, 2.5);
  shine(ctx, cx + 25, cy - 28, cx + 48, cy - 15, 0.6, 2.5);
}

function drawGuardCrown(ctx: CanvasRenderingContext2D) {
  // Crown/royal guard — three upward prongs
  const cx = 64, cy = 64;
  const blueLG = ctx.createLinearGradient(cx - 45, 0, cx + 45, 0);
  blueLG.addColorStop(0, "#0d47a1"); blueLG.addColorStop(0.5, "#1e88e5"); blueLG.addColorStop(1, "#0d47a1");

  const goldLG = ctx.createLinearGradient(0, cy - 8, 0, cy + 10);
  goldLG.addColorStop(0, "#fff176"); goldLG.addColorStop(1, "#bf6c00");

  const baseBar = () => { ctx.beginPath(); ctx.roundRect(cx - 44, cy - 8, 88, 18, 4); };

  // Base bar
  baseBar();
  ctx.fillStyle = blueLG; ctx.fill();
  addNoise(ctx, 0.05);
  outline(ctx, "#001133", 3, true);
  rimLight(ctx, baseBar, "rgba(255,255,255,0.2)", 5);

  // Gold border
  baseBar();
  ctx.strokeStyle = "#fbc02d"; ctx.lineWidth = 2.5; ctx.stroke();

  // Three prongs
  for (const [px, ph] of [[cx - 28, 24], [cx, 34], [cx + 28, 24]]) {
    const prong = () => { ctx.beginPath(); ctx.roundRect(px - 7, cy - 8 - ph, 14, ph + 4, 3); };
    prong();
    ctx.fillStyle = blueLG; ctx.fill();
    outline(ctx, "#001133", 2.5, true);
    prong();
    ctx.strokeStyle = "#fbc02d"; ctx.lineWidth = 2; ctx.stroke();
    rimLight(ctx, prong, "rgba(255,255,255,0.25)", 4);
  }

  // Gems on prong tips
  gem(ctx, cx, cy - 42, 6.5, "#81d4fa", "#01579b");
  smallGem(ctx, cx - 28, cy - 32, 5, "#ba68c8", "#4a148c");
  smallGem(ctx, cx + 28, cy - 32, 5, "#ba68c8", "#4a148c");
}

function drawGuardBoneSkull(ctx: CanvasRenderingContext2D) {
  // Bone guard with skull ends
  const cx = 64, cy = 64;
  const path = () => ctx.roundRect(cx - 44, cy - 7, 88, 14, 3);
  ctx.beginPath(); path();
  const lg = ctx.createLinearGradient(0, cy - 7, 0, cy + 7);
  lg.addColorStop(0, "#fafafa"); lg.addColorStop(0.5, "#e0e0e0"); lg.addColorStop(1, "#b0b0b0");
  ctx.fillStyle = lg; ctx.fill();

  addGrit(ctx, path, 0.2);
  outline(ctx, "#212121", 3, true);
  rimLight(ctx, path, "rgba(255,255,255,0.3)", 4);

  // Grain lines
  for (let gx = cx - 30; gx < cx + 40; gx += 10) {
    ctx.beginPath(); ctx.moveTo(gx, cy - 5); ctx.lineTo(gx + 5, cy + 5);
    ctx.strokeStyle = "rgba(0,0,0,0.2)"; ctx.lineWidth = 1; ctx.stroke();
  }
  // Skull circles at ends
  for (const [sx, sy] of [[cx - 42, cy], [cx + 42, cy]]) {
    const skull = () => { ctx.beginPath(); ctx.arc(sx, sy, 11, 0, Math.PI * 2); };
    skull();
    ctx.fillStyle = "#eeeeee"; ctx.fill();
    addNoise(ctx, 0.05);
    outline(ctx, "#212121", 2.5, true);
    rimLight(ctx, skull, "rgba(255,255,255,0.4)", 4);

    ctx.fillStyle = "#212121";
    ctx.beginPath(); ctx.arc(sx - 3.5, sy - 2.5, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(sx + 3.5, sy - 2.5, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.roundRect(sx - 4, sy + 2.5, 8, 5, 1); ctx.fill();
  }
}

function drawGuardVoidTwist(ctx: CanvasRenderingContext2D) {
  // Void guard — two downward curling horns
  const cx = 64, cy = 64;
  const lg = ctx.createLinearGradient(cx - 50, 0, cx + 50, 0);
  lg.addColorStop(0, "#050010"); lg.addColorStop(0.5, "#4a148c"); lg.addColorStop(1, "#050010");

  const horn = () => {
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy - 6);
    ctx.bezierCurveTo(cx - 30, cy - 10, cx - 52, cy, cx - 48, cy + 22);
    ctx.bezierCurveTo(cx - 46, cy + 32, cx - 34, cy + 28, cx - 28, cy + 18);
    ctx.bezierCurveTo(cx - 22, cy + 8, cx - 14, cy + 4, cx - 8, cy + 6);
    ctx.closePath();
  };

  // Left horn curling down
  horn();
  ctx.fillStyle = lg; ctx.fill();
  addNoise(ctx, 0.08);
  outline(ctx, "#0d0014", 3, true);
  rimLight(ctx, horn, "rgba(180,100,255,0.4)", 5);

  // Right horn (mirror)
  ctx.save(); ctx.translate(cx * 2, 0); ctx.scale(-1, 1);
  horn();
  ctx.fillStyle = lg; ctx.fill();
  addNoise(ctx, 0.08);
  outline(ctx, "#0d0014", 3, true);
  rimLight(ctx, horn, "rgba(180,100,255,0.4)", 5);
  ctx.restore();

  // Central void eye
  const eye = () => { ctx.beginPath(); ctx.ellipse(cx, cy, 10, 10, 0, 0, Math.PI * 2); };
  eye();
  ctx.fillStyle = "#0d001a"; ctx.fill(); outline(ctx, "#0d0014", 2, true);
  ctx.beginPath(); ctx.ellipse(cx, cy, 6, 6, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#e1bee7"; ctx.fill();
  glow(ctx, cx, cy, 18, "rgba(171,71,188,0.5)");
}

function drawGuardFireWings(ctx: CanvasRenderingContext2D) {
  const cx = 64, cy = 64;
  const lg = ctx.createLinearGradient(cx - 50, cy - 20, cx + 50, cy + 10);
  lg.addColorStop(0, "#b71c1c"); lg.addColorStop(0.5, "#ff5722"); lg.addColorStop(1, "#bf360c");

  const wing = () => {
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy);
    ctx.bezierCurveTo(cx - 20, cy - 20, cx - 50, cy - 15, cx - 55, cy + 2);
    ctx.bezierCurveTo(cx - 52, cy + 15, cx - 32, cy + 12, cx - 8, cy + 8);
    ctx.closePath();
  };

  // Swept wings
  for (const side of [-1, 1]) {
    ctx.save(); if (side === -1) { ctx.translate(cx * 2, 0); ctx.scale(-1, 1); }
    wing();
    ctx.fillStyle = lg; ctx.fill();
    outline(ctx, "#3e2723", 3, true);
    rimLight(ctx, wing, "rgba(255,183,77,0.35)", 5);

    // Flame tips
    for (const [fx, fy] of [[cx - 53, cy - 5], [cx - 44, cy - 16]]) {
      ctx.beginPath(); ctx.arc(fx, fy, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = "#ffeb3b";
      ctx.shadowColor = "#ffeb3b"; ctx.shadowBlur = 8;
      ctx.fill(); ctx.shadowBlur = 0;
    }
    ctx.restore();
  }

  const core = () => { ctx.beginPath(); ctx.ellipse(cx, cy, 10, 10, 0, 0, Math.PI * 2); };
  core();
  const cg = ctx.createRadialGradient(cx - 3, cy - 3, 0, cx, cy, 10);
  cg.addColorStop(0, "#fff59d"); cg.addColorStop(1, "#b71c1c");
  ctx.fillStyle = cg; ctx.fill(); outline(ctx, "#3e2723", 2.5, true);
  glow(ctx, cx, cy, 18, "rgba(255,87,34,0.4)");
}

// ─── SWORD HANDLES ────────────────────────────────────────────────────────────

function drawHandleLeather(ctx: CanvasRenderingContext2D) {
  const cx = 64, top = 26, bot = 94, hw = 8;
  const path = () => ctx.roundRect(cx - hw, top, hw * 2, bot - top, 3);
  // Grip base
  ctx.beginPath(); path();
  const lg = ctx.createLinearGradient(cx - hw, 0, cx + hw, 0);
  lg.addColorStop(0, "#2d1b0d"); lg.addColorStop(0.5, "#5d4037"); lg.addColorStop(1, "#2d1b0d");
  ctx.fillStyle = lg; ctx.fill();

  addGrit(ctx, path, 0.2);
  outline(ctx, "#1a0800", 3, true);
  rimLight(ctx, path, "rgba(255,255,255,0.15)", 4);

  // Leather wrapping diagonal strips
  ctx.save(); path(); ctx.clip();
  const stripW = 12;
  for (let sy = top - 10; sy < bot + 10; sy += stripW) {
    ctx.beginPath();
    ctx.moveTo(cx - hw, sy);
    ctx.lineTo(cx + hw, sy + 6);
    ctx.lineTo(cx + hw, sy + 6 + 5);
    ctx.lineTo(cx - hw, sy + 5);
    ctx.closePath();
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.05)"; ctx.lineWidth = 0.5; ctx.stroke();
  }
  ctx.restore();

  // Ferrule rings
  for (const ry of [top, top + 8, bot - 8, bot]) {
    const ring = () => { ctx.beginPath(); ctx.roundRect(cx - hw - 1, ry - 3, hw * 2 + 2, 6, 1.5); };
    ring();
    const rg = ctx.createLinearGradient(0, ry - 3, 0, ry + 3);
    rg.addColorStop(0, "#90a4ae"); rg.addColorStop(0.5, "#eceff1"); rg.addColorStop(1, "#455a64");
    ctx.fillStyle = rg; ctx.fill(); outline(ctx, "#111", 1.8, true);
    rimLight(ctx, ring, "rgba(255,255,255,0.3)", 2);
  }
}

function drawHandleBone(ctx: CanvasRenderingContext2D) {
  const cx = 64, top = 26, bot = 94, hw = 7;
  const path = () => ctx.roundRect(cx - hw, top, hw * 2, bot - top, 3);
  ctx.beginPath(); path();
  const lg = ctx.createLinearGradient(cx - hw, 0, cx + hw, 0);
  lg.addColorStop(0, "#bdbdbd"); lg.addColorStop(0.5, "#f5f5f5"); lg.addColorStop(1, "#9e9e9e");
  ctx.fillStyle = lg; ctx.fill();

  addGrit(ctx, path, 0.15);
  outline(ctx, "#212121", 3, true);
  rimLight(ctx, path, "rgba(255,255,255,0.4)", 4);

  // Rib rings
  for (let ry = top + 10; ry < bot; ry += 14) {
    ctx.beginPath(); ctx.roundRect(cx - hw, ry, hw * 2, 6, 2);
    ctx.fillStyle = "rgba(0,0,0,0.15)"; ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.2)"; ctx.lineWidth = 1; ctx.stroke();
  }
  // Grain lines
  ctx.strokeStyle = "rgba(0,0,0,0.15)"; ctx.lineWidth = 1;
  for (const gx of [cx - 3, cx + 2]) {
    ctx.beginPath(); ctx.moveTo(gx, top + 12); ctx.lineTo(gx, bot - 12); ctx.stroke();
  }
}

function drawHandleCrystal(ctx: CanvasRenderingContext2D) {
  const cx = 64, top = 26, bot = 94, hw = 9;
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(cx - hw, top + 6);
    ctx.lineTo(cx, top);
    ctx.lineTo(cx + hw, top + 6);
    ctx.lineTo(cx + hw, bot - 6);
    ctx.lineTo(cx, bot);
    ctx.lineTo(cx - hw, bot - 6);
    ctx.closePath();
  };
  path();
  const lg = ctx.createLinearGradient(cx - hw, 0, cx + hw, 0);
  lg.addColorStop(0, "#006064"); lg.addColorStop(0.4, "#4dd0e1"); lg.addColorStop(0.5, "#e0f7fa"); lg.addColorStop(0.6, "#00bcd4"); lg.addColorStop(1, "#006064");
  ctx.fillStyle = lg; ctx.fill();

  addNoise(ctx, 0.08);
  outline(ctx, "#001a1a", 3, true);
  rimLight(ctx, path, "rgba(255,255,255,0.4)", 6);

  // Internal refraction lines
  ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 1;
  for (const [sx, sy, ex, ey] of [
    [cx - 6, top + 15, cx + 5, top + 35],
    [cx + 4, top + 50, cx - 5, top + 70],
    [cx - 5, top + 78, cx + 4, top + 90],
  ]) { ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke(); }

  glow(ctx, cx, (top + bot) / 2, 25, "rgba(0,188,212,0.2)");
}

function drawHandleRoyal(ctx: CanvasRenderingContext2D) {
  const cx = 64, top = 26, bot = 94, hw = 8;
  const path = () => ctx.roundRect(cx - hw, top, hw * 2, bot - top, 3);
  ctx.beginPath(); path();
  const lg = ctx.createLinearGradient(cx - hw, 0, cx + hw, 0);
  lg.addColorStop(0, "#0d47a1"); lg.addColorStop(0.5, "#1976d2"); lg.addColorStop(1, "#0d47a1");
  ctx.fillStyle = lg; ctx.fill();

  addNoise(ctx, 0.05);
  outline(ctx, "#001133", 3, true);
  rimLight(ctx, path, "rgba(100,200,255,0.3)", 5);

  // Gold X wire wrapping
  ctx.strokeStyle = "#fbc02d"; ctx.lineWidth = 2.5;
  for (let wy = top + 5; wy < bot - 5; wy += 12) {
    ctx.beginPath(); ctx.moveTo(cx - hw, wy); ctx.lineTo(cx + hw, wy + 12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + hw, wy); ctx.lineTo(cx - hw, wy + 12); ctx.stroke();
  }
  // Gold ferrules
  for (const ry of [top, bot - 7]) {
    const ring = () => { ctx.beginPath(); ctx.roundRect(cx - hw - 1, ry, hw * 2 + 2, 7, 2); };
    ring();
    const rg = ctx.createLinearGradient(0, ry, 0, ry + 7);
    rg.addColorStop(0, "#fff59d"); rg.addColorStop(1, "#827717");
    ctx.fillStyle = rg; ctx.fill(); outline(ctx, "#1a0a00", 2, true);
    rimLight(ctx, ring, "rgba(255,255,255,0.35)", 3);
  }
}

function drawHandleVoid(ctx: CanvasRenderingContext2D) {
  const cx = 64, top = 26, bot = 94, hw = 8;
  const path = () => ctx.roundRect(cx - hw, top, hw * 2, bot - top, 3);
  ctx.beginPath(); path();
  const lg = ctx.createLinearGradient(cx - hw, 0, cx + hw, 0);
  lg.addColorStop(0, "#050010"); lg.addColorStop(0.5, "#311b92"); lg.addColorStop(1, "#050010");
  ctx.fillStyle = lg; ctx.fill();

  addNoise(ctx, 0.1);
  outline(ctx, "#0d0014", 3, true);
  rimLight(ctx, path, "rgba(180,100,255,0.35)", 5);

  // Purple energy cracks
  ctx.strokeStyle = "#ab47bc"; ctx.lineWidth = 1.4;
  for (const [sx, sy, ex, ey] of [
    [cx - 4, top + 15, cx + 6, top + 35],
    [cx + 3, top + 45, cx - 5, top + 65],
    [cx - 3, top + 75, cx + 5, top + 90],
  ]) {
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
    glow(ctx, (sx + ex) / 2, (sy + ey) / 2, 8, "rgba(171,71,188,0.4)");
  }
}

// ─── SWORD POMMELS ────────────────────────────────────────────────────────────

function drawPommelIron(ctx: CanvasRenderingContext2D) {
  const cx = 64, cy = 98, r = 12;
  const path = () => ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.beginPath(); path();
  const g = ctx.createRadialGradient(cx - 3, cy - 3, 0, cx, cy, r);
  g.addColorStop(0, "#eceff1"); g.addColorStop(0.6, "#78909c"); g.addColorStop(1, "#263238");
  ctx.fillStyle = g; ctx.fill();

  outline(ctx, "#212121", 3, true);
  rimLight(ctx, path, "rgba(255,255,255,0.4)", 4);
  shine(ctx, cx - 6, cy - 6, cx + 3, cy - 3, 0.6, 3);
}

function drawPommelGold(ctx: CanvasRenderingContext2D) {
  const cx = 64, cy = 98, r = 13;
  const path = () => {
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 - Math.PI / 8;
      i === 0 ? ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a)) : ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
    }
    ctx.closePath();
  };
  path();
  const g = ctx.createRadialGradient(cx - 4, cy - 4, 0, cx, cy, r);
  g.addColorStop(0, "#fff59d"); g.addColorStop(0.5, "#fbc02d"); g.addColorStop(1, "#827717");
  ctx.fillStyle = g; ctx.fill();

  outline(ctx, "#3e2723", 3, true);
  rimLight(ctx, path, "rgba(255,255,255,0.4)", 4);
  gem(ctx, cx, cy, 6.5, "#039be5", "#01213f");
}

function drawPommelCrystal(ctx: CanvasRenderingContext2D) {
  const cx = 64, cy = 100, r = 14;
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(cx, cy - 16);
    ctx.bezierCurveTo(cx + 12, cy - 10, cx + 12, cy + 8, cx, cy + 14);
    ctx.bezierCurveTo(cx - 12, cy + 8, cx - 12, cy - 10, cx, cy - 16);
    ctx.closePath();
  };
  path();
  const g = ctx.createRadialGradient(cx - 4, cy - 6, 0, cx, cy, r);
  g.addColorStop(0, "#e0f7fa"); g.addColorStop(0.3, "#4dd0e1"); g.addColorStop(1, "#006064");
  ctx.fillStyle = g; ctx.fill();

  outline(ctx, "#001a1a", 3, true);
  rimLight(ctx, path, "rgba(255,255,255,0.6)", 6);

  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.beginPath(); ctx.ellipse(cx - 4, cy - 6, 4, 6, -0.3, 0, Math.PI * 2); ctx.fill();
  glow(ctx, cx, cy, 20, "rgba(0,188,212,0.3)");
}

function drawPommelRoyal(ctx: CanvasRenderingContext2D) {
  const cx = 64, cy = 100;
  const path = () => {
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
  };
  path();
  const lg = ctx.createLinearGradient(cx - 14, 0, cx + 14, 0);
  lg.addColorStop(0, "#0d47a1"); lg.addColorStop(0.5, "#1976d2"); lg.addColorStop(1, "#0d47a1");
  ctx.fillStyle = lg; ctx.fill();

  outline(ctx, "#001133", 3, true);
  rimLight(ctx, path, "rgba(255,255,255,0.25)", 4);

  ctx.strokeStyle = "#fbc02d"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(cx - 14, cy - 6, 28, 16, 2.5); ctx.stroke();

  gem(ctx, cx, cy - 18, 5.5, "#ba68c8", "#4a148c");
  smallGem(ctx, cx - 8, cy - 14, 4, "#fbc02d", "#827717");
  smallGem(ctx, cx + 8, cy - 14, 4, "#fbc02d", "#827717");
}

function drawPommelVoid(ctx: CanvasRenderingContext2D) {
  const cx = 64, cy = 98, r = 13;
  const path = () => ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.beginPath(); path();
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, "#4a148c"); g.addColorStop(1, "#050010");
  ctx.fillStyle = g; ctx.fill();

  outline(ctx, "#0d0014", 3, true);
  rimLight(ctx, path, "rgba(180,100,255,0.4)", 5);

  // Spiral
  ctx.strokeStyle = "rgba(171,71,188,0.7)"; ctx.lineWidth = 1.6;
  ctx.beginPath();
  for (let a = 0; a < Math.PI * 4; a += 0.1) {
    const sr = (a / (Math.PI * 4)) * 8.5;
    const px = cx + sr * Math.cos(a); const py = cy + sr * Math.sin(a);
    a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.stroke();

  ctx.beginPath(); ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
  ctx.fillStyle = "#e1bee7"; ctx.fill();
  glow(ctx, cx, cy, 18, "rgba(171,71,188,0.4)");
}

// ─── AXE HEADS ───────────────────────────────────────────────────────────────

function drawAxeHeadIron(ctx: CanvasRenderingContext2D) {
  const cx = 64, cy = 64;
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy - 26);
    ctx.lineTo(cx + 28, cy - 34);
    ctx.bezierCurveTo(cx + 50, cy - 28, cx + 50, cy + 28, cx + 28, cy + 34);
    ctx.lineTo(cx - 10, cy + 26);
    ctx.lineTo(cx - 8, cy);
    ctx.closePath();
  };
  path();
  const lg = ctx.createLinearGradient(cx - 10, 0, cx + 50, 0);
  lg.addColorStop(0, "#455a64"); lg.addColorStop(0.4, "#90a4ae"); lg.addColorStop(0.7, "#cfd8dc"); lg.addColorStop(1, "#37474f");
  ctx.fillStyle = lg; ctx.fill();

  addGrit(ctx, path, 0.15);
  outline(ctx, "#212121", 3.5, true);
  rimLight(ctx, path, "rgba(255,255,255,0.25)", 5);

  // Edge highlight
  ctx.beginPath();
  ctx.bezierCurveTo(cx + 50, cy - 28, cx + 50, cy + 28, cx + 28, cy + 34);
  ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 3; ctx.stroke();

  // Poll (back spike)
  const poll = () => {
    ctx.beginPath(); ctx.moveTo(cx - 10, cy - 10); ctx.lineTo(cx - 32, cy); ctx.lineTo(cx - 10, cy + 10); ctx.closePath();
  };
  poll();
  ctx.fillStyle = "#455a64"; ctx.fill(); outline(ctx, "#212121", 2.5, true);
  rimLight(ctx, poll, "rgba(255,255,255,0.2)", 3);

  shine(ctx, cx + 28, cy - 35, cx + 48, cy, 0.4, 3);
}

function drawAxeHeadVoid(ctx: CanvasRenderingContext2D) {
  // Double crescent
  const cx = 64, cy = 64;
  for (const side of [-1, 1]) {
    ctx.save(); ctx.translate(0, side === 1 ? 0 : 0); if (side === -1) ctx.scale(1, -1);
    const path = () => {
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy * (side === -1 ? -1 : 1) - 6);
      ctx.bezierCurveTo(cx + 20, cy - 10 * side, cx + 44, cy - 30 * side, cx + 44, cy - 42 * side);
      ctx.bezierCurveTo(cx + 44, cy - 52 * side, cx + 30, cy - 56 * side, cx + 16, cy - 48 * side);
      ctx.bezierCurveTo(cx + 28, cy - 44 * side, cx + 32, cy - 34 * side, cx + 22, cy - 22 * side);
      ctx.bezierCurveTo(cx + 10, cy - 10 * side, cx - 4, cy - 4 * side, cx - 8, cy - 6 * side);
      ctx.closePath();
    };
    path();
    const lg = ctx.createLinearGradient(cx - 8, 0, cx + 44, 0);
    lg.addColorStop(0, "#050010"); lg.addColorStop(0.4, "#4a148c"); lg.addColorStop(1, "#ab47bc");
    ctx.fillStyle = lg; ctx.fill();

    addNoise(ctx, 0.08);
    outline(ctx, "#0d0014", 3, true);
    rimLight(ctx, path, "rgba(180,100,255,0.4)", 5);
    ctx.restore();
  }
  // Center rune
  rune(ctx, cx, cy, 7, "#e1bee7");
  glow(ctx, cx, cy, 25, "rgba(171,71,188,0.3)");
}

function drawAxeHeadGold(ctx: CanvasRenderingContext2D) {
  const cx = 64, cy = 64;
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy - 28);
    ctx.bezierCurveTo(cx + 16, cy - 40, cx + 50, cy - 32, cx + 50, cy - 8);
    ctx.bezierCurveTo(cx + 50, cy + 8, cx + 40, cy + 20, cx + 28, cy + 28);
    ctx.bezierCurveTo(cx + 16, cy + 34, cx, cy + 30, cx - 10, cy + 28);
    ctx.lineTo(cx - 8, cy); ctx.closePath();
  };
  path();
  const lg = ctx.createLinearGradient(cx - 10, 0, cx + 50, 0);
  lg.addColorStop(0, "#827717"); lg.addColorStop(0.4, "#fbc02d"); lg.addColorStop(0.6, "#fff59d"); lg.addColorStop(1, "#827717");
  ctx.fillStyle = lg; ctx.fill();

  addNoise(ctx, 0.05);
  outline(ctx, "#1a0a00", 3.5, true);
  rimLight(ctx, path, "rgba(255,255,255,0.3)", 5);

  // Scroll decorations
  ctx.strokeStyle = "rgba(130,119,23,0.6)"; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.arc(cx + 32, cy - 8, 8, 0, Math.PI * 1.5); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx + 20, cy + 18, 6, 0, Math.PI); ctx.stroke();
  gem(ctx, cx + 40, cy - 2, 7.5, "#ba68c8", "#4a148c");
  shine(ctx, cx + 48, cy - 30, cx + 48, cy + 10, 0.6, 3);
}

function drawAxeHeadBone(ctx: CanvasRenderingContext2D) {
  const cx = 64, cy = 64;
  const path = () => {
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
  };
  path();
  const lg = ctx.createLinearGradient(cx - 8, 0, cx + 46, 0);
  lg.addColorStop(0, "#bdbdbd"); lg.addColorStop(0.5, "#eeeeee"); lg.addColorStop(1, "#9e9e9e");
  ctx.fillStyle = lg; ctx.fill();

  addGrit(ctx, path, 0.2);
  outline(ctx, "#212121", 3.5, true);
  rimLight(ctx, path, "rgba(255,255,255,0.4)", 5);

  // Bone grain
  ctx.strokeStyle = "rgba(0,0,0,0.15)"; ctx.lineWidth = 1;
  for (const [sx, sy, ex, ey] of [[cx + 10, cy - 20, cx + 30, cy - 18], [cx + 15, cy, cx + 35, cy + 5]]) {
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
  }
}

function drawAxeHeadFire(ctx: CanvasRenderingContext2D) {
  const cx = 64, cy = 64;
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy);
    ctx.bezierCurveTo(cx, cy - 32, cx + 24, cy - 42, cx + 44, cy - 28);
    ctx.bezierCurveTo(cx + 52, cy - 8, cx + 52, cy + 8, cx + 44, cy + 28);
    ctx.bezierCurveTo(cx + 24, cy + 42, cx, cy + 32, cx - 8, cy);
    ctx.closePath();
  };
  path();
  const lg = ctx.createLinearGradient(cx - 8, 0, cx + 52, 0);
  lg.addColorStop(0, "#b71c1c"); lg.addColorStop(0.35, "#ff5722"); lg.addColorStop(0.7, "#ffab00"); lg.addColorStop(1, "#ffeb3b");
  ctx.fillStyle = lg; ctx.fill();

  outline(ctx, "#3e2723", 3.5, true);
  rimLight(ctx, path, "rgba(255,235,59,0.4)", 6);

  // Flame wisps at edge
  ctx.fillStyle = "#ffeb3b";
  for (const [fx, fy] of [[cx + 44, cy - 28], [cx + 50, cy], [cx + 44, cy + 28]]) {
    ctx.beginPath(); ctx.arc(fx, fy, 6, 0, Math.PI * 2);
    ctx.shadowColor = "#ffeb3b"; ctx.shadowBlur = 10;
    ctx.fill(); ctx.shadowBlur = 0;
  }
  shine(ctx, cx + 42, cy - 30, cx + 52, cy, 0.6, 3);
  glow(ctx, cx + 20, cy, 45, "rgba(255,87,34,0.3)");
}

// ─── AXE HANDLES ─────────────────────────────────────────────────────────────

function drawAxeHandleWood(ctx: CanvasRenderingContext2D) {
  const cx = 64, top = 18, bot = 110, hw = 6;
  const path = () => ctx.roundRect(cx - hw, top, hw * 2, bot - top, 3);
  ctx.beginPath(); path();
  const lg = ctx.createLinearGradient(cx - hw, 0, cx + hw, 0);
  lg.addColorStop(0, "#2d1b0d"); lg.addColorStop(0.5, "#4e342e"); lg.addColorStop(1, "#2d1b0d");
  ctx.fillStyle = lg; ctx.fill();

  addGrit(ctx, path, 0.25);
  outline(ctx, "#1a0800", 3, true);
  rimLight(ctx, path, "rgba(255,255,255,0.1)", 4);

  // Grain
  ctx.strokeStyle = "rgba(0,0,0,0.2)"; ctx.lineWidth = 1;
  for (const gx of [cx - 2.5, cx + 1.5]) {
    ctx.beginPath(); ctx.moveTo(gx, top + 12); ctx.lineTo(gx + 1, bot - 12); ctx.stroke();
  }
  // Iron bands
  for (const ry of [top + 10, (top + bot) / 2, bot - 16]) {
    const band = () => { ctx.beginPath(); ctx.roundRect(cx - hw - 2, ry, hw * 2 + 4, 8, 2); };
    band();
    const rg = ctx.createLinearGradient(0, ry, 0, ry + 8);
    rg.addColorStop(0, "#90a4ae"); rg.addColorStop(1, "#37474f");
    ctx.fillStyle = rg; ctx.fill(); outline(ctx, "#111", 1.5, true);
    rimLight(ctx, band, "rgba(255,255,255,0.25)", 2);
  }
}

function drawAxeHandleRune(ctx: CanvasRenderingContext2D) {
  const cx = 64, top = 18, bot = 110, hw = 7;
  const path = () => ctx.roundRect(cx - hw, top, hw * 2, bot - top, 3);
  ctx.beginPath(); path();
  const lg = ctx.createLinearGradient(cx - hw, 0, cx + hw, 0);
  lg.addColorStop(0, "#212121"); lg.addColorStop(0.5, "#424242"); lg.addColorStop(1, "#212121");
  ctx.fillStyle = lg; ctx.fill();

  addNoise(ctx, 0.08);
  outline(ctx, "#111", 3, true);
  rimLight(ctx, path, "rgba(255,255,255,0.15)", 4);

  // Glowing rune carvings
  for (let i = 0; i < 4; i++) {
    const ry = top + 18 + i * 20;
    rune(ctx, cx, ry, 6, "#fff59d");
    glow(ctx, cx, ry, 12, "rgba(255,235,59,0.3)");
  }
}

function drawAxeHandleBone(ctx: CanvasRenderingContext2D) {
  const cx = 64, top = 18, bot = 110, hw = 7;
  const path = () => ctx.roundRect(cx - hw, top, hw * 2, bot - top, 3);
  ctx.beginPath(); path();
  const lg = ctx.createLinearGradient(cx - hw, 0, cx + hw, 0);
  lg.addColorStop(0, "#bdbdbd"); lg.addColorStop(0.5, "#eeeeee"); lg.addColorStop(1, "#9e9e9e");
  ctx.fillStyle = lg; ctx.fill();

  addGrit(ctx, path, 0.2);
  outline(ctx, "#212121", 3, true);
  rimLight(ctx, path, "rgba(255,255,255,0.4)", 4);

  // Sinew wrapping
  ctx.strokeStyle = "rgba(62,39,35,0.6)"; ctx.lineWidth = 2.5;
  for (let wy = top + 10; wy < bot - 10; wy += 12) {
    ctx.beginPath(); ctx.moveTo(cx - hw, wy); ctx.lineTo(cx + hw, wy + 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + hw, wy + 6); ctx.lineTo(cx - hw, wy + 12); ctx.stroke();
  }
}

// ─── HAMMER HEADS ─────────────────────────────────────────────────────────────

function drawHammerHeadIron(ctx: CanvasRenderingContext2D) {
  const cx = 64, cy = 58, w = 52, h = 36;
  const path = () => ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 6);
  ctx.beginPath(); path();
  const lg = ctx.createLinearGradient(0, cy - h / 2, 0, cy + h / 2);
  lg.addColorStop(0, "#78909c"); lg.addColorStop(0.3, "#eceff1"); lg.addColorStop(0.7, "#546e7a"); lg.addColorStop(1, "#263238");
  ctx.fillStyle = lg; ctx.fill();

  addNoise(ctx, 0.06);
  outline(ctx, "#212121", 3.5, true);
  rimLight(ctx, path, "rgba(255,255,255,0.3)", 5);

  // Crosshatch on face
  ctx.strokeStyle = "rgba(0,0,0,0.2)"; ctx.lineWidth = 1;
  for (let hx = cx - w / 2 + 8; hx < cx + w / 2 - 4; hx += 10) {
    ctx.beginPath(); ctx.moveTo(hx, cy - h / 2 + 5); ctx.lineTo(hx, cy + h / 2 - 5); ctx.stroke();
  }
  for (let hy = cy - h / 2 + 8; hy < cy + h / 2 - 4; hy += 10) {
    ctx.beginPath(); ctx.moveTo(cx - w / 2 + 5, hy); ctx.lineTo(cx + w / 2 - 5, hy); ctx.stroke();
  }
  shine(ctx, cx - w / 2 + 6, cy - h / 2 + 6, cx + w / 2 - 6, cy - h / 2 + 6, 0.5, 3);
  shine(ctx, cx - w / 2 + 6, cy - h / 2 + 6, cx - w / 2 + 6, cy + h / 2 - 6, 0.5, 3);
}

function drawHammerHeadRoyal(ctx: CanvasRenderingContext2D) {
  // Flanged mace head — star of 8 flanges
  const cx = 64, cy = 62, outerR = 36, innerR = 18;
  const path = () => {
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a1 = (i / 8) * Math.PI * 2; const a2 = ((i + 0.5) / 8) * Math.PI * 2;
      i === 0 ? ctx.moveTo(cx + outerR * Math.cos(a1), cy + outerR * Math.sin(a1)) : ctx.lineTo(cx + outerR * Math.cos(a1), cy + outerR * Math.sin(a1));
      ctx.lineTo(cx + innerR * Math.cos(a2), cy + innerR * Math.sin(a2));
    }
    ctx.closePath();
  };
  path();
  const lg = ctx.createRadialGradient(cx, cy, innerR, cx, cy, outerR);
  lg.addColorStop(0, "#fff59d"); lg.addColorStop(0.5, "#fbc02d"); lg.addColorStop(1, "#827717");
  ctx.fillStyle = lg; ctx.fill();

  addNoise(ctx, 0.05);
  outline(ctx, "#3e2723", 3, true);
  rimLight(ctx, path, "rgba(255,255,255,0.35)", 5);

  // Center disc
  const disc = () => { ctx.beginPath(); ctx.arc(cx, cy, innerR, 0, Math.PI * 2); };
  disc();
  const cg = ctx.createRadialGradient(cx - 4, cy - 4, 0, cx, cy, innerR);
  cg.addColorStop(0, "#fff59d"); cg.addColorStop(1, "#827717");
  ctx.fillStyle = cg; ctx.fill(); outline(ctx, "#3e2723", 2.5, true);
  rimLight(ctx, disc, "rgba(255,255,255,0.4)", 4);

  gem(ctx, cx, cy, 10, "#ba68c8", "#4a148c");
}

function drawHammerHeadVoid(ctx: CanvasRenderingContext2D) {
  const cx = 64, cy = 58, w = 50, h = 34;
  const path = () => ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 4);
  ctx.beginPath(); path();
  const lg = ctx.createLinearGradient(0, cy - h / 2, 0, cy + h / 2);
  lg.addColorStop(0, "#311b92"); lg.addColorStop(0.5, "#4a148c"); lg.addColorStop(1, "#0d001a");
  ctx.fillStyle = lg; ctx.fill();

  addNoise(ctx, 0.1);
  outline(ctx, "#0d0014", 3.5, true);
  rimLight(ctx, path, "rgba(180,100,255,0.4)", 6);

  // Rune carvings glowing
  for (const [rx, ry] of [[cx - 16, cy], [cx, cy], [cx + 16, cy]]) {
    rune(ctx, rx, ry, 8, "#e1bee7");
    glow(ctx, rx, ry, 15, "rgba(171,71,188,0.3)");
  }
  // Purple lightning cracks
  ctx.strokeStyle = "rgba(171,71,188,0.6)"; ctx.lineWidth = 1.4;
  for (const [sx, sy, ex, ey] of [
    [cx - w / 2 + 6, cy - h / 2 + 8, cx - w / 2 + 16, cy + h / 2 - 8],
    [cx + w / 2 - 16, cy - h / 2 + 6, cx + w / 2 - 6, cy + h / 2 - 8],
  ]) {
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + 4, (sy + ey) / 2); ctx.lineTo(ex, ey); ctx.stroke();
  }
  glow(ctx, cx, cy, 35, "rgba(106,27,154,0.2)");
}

// ─── SPEAR TIPS ───────────────────────────────────────────────────────────────

function drawSpearTipSteel(ctx: CanvasRenderingContext2D) {
  const cx = 64, top = 8, bot = 90, bw = 11;
  drawBlade(ctx, cx, top, bot, bw, "#78909c", "#eceff1", "#455a64");
  // Socket
  const socket = () => { ctx.beginPath(); ctx.roundRect(cx - 8, bot - 6, 16, 24, 2.5); };
  socket();
  const sg = ctx.createLinearGradient(cx - 8, 0, cx + 8, 0);
  sg.addColorStop(0, "#455a64"); sg.addColorStop(0.5, "#90a4ae"); sg.addColorStop(1, "#37474f");
  ctx.fillStyle = sg; ctx.fill(); outline(ctx, "#111", 2.5, true);
  rimLight(ctx, socket, "rgba(255,255,255,0.25)", 3);
  shine(ctx, cx - 9, bot + 2, cx - 9, bot + 18, 0.4, 2);
}

function drawSpearTipVoid(ctx: CanvasRenderingContext2D) {
  const cx = 64, top = 6, bot = 88, bw = 13;
  const path = () => {
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
  };
  path();
  const lg = ctx.createLinearGradient(cx - bw, 0, cx + bw, 0);
  lg.addColorStop(0, "#050010"); lg.addColorStop(0.5, "#4a148c"); lg.addColorStop(1, "#0d001a");
  ctx.fillStyle = lg; ctx.fill();

  addNoise(ctx, 0.1);
  outline(ctx, "#0d0014", 3, true);
  rimLight(ctx, path, "rgba(180,100,255,0.4)", 5);

  ctx.beginPath(); ctx.moveTo(cx, top + 8); ctx.lineTo(cx, bot - 6);
  ctx.strokeStyle = "rgba(186,104,200,0.45)"; ctx.lineWidth = 2; ctx.stroke();

  // Flames at base
  for (const [fx, fy] of [[cx - bw, bot - 15], [cx + bw, bot - 15]]) {
    ctx.beginPath(); ctx.arc(fx, fy, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#ab47bc";
    ctx.shadowColor = "#ab47bc"; ctx.shadowBlur = 8;
    ctx.fill(); ctx.shadowBlur = 0;
  }
}

function drawSpearTipCrystal(ctx: CanvasRenderingContext2D) {
  const cx = 64, top = 6, bot = 90, bw = 12;
  const path = () => {
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
  };
  path();
  const lg = ctx.createLinearGradient(cx - bw, 0, cx + bw, 0);
  lg.addColorStop(0, "#006064"); lg.addColorStop(0.35, "#4dd0e1"); lg.addColorStop(0.5, "#e0f7fa"); lg.addColorStop(0.65, "#00bcd4"); lg.addColorStop(1, "#006064");
  ctx.fillStyle = lg; ctx.fill();

  addNoise(ctx, 0.08);
  outline(ctx, "#001a1a", 3, true);
  rimLight(ctx, path, "rgba(255,255,255,0.45)", 6);

  ctx.strokeStyle = "rgba(178,235,242,0.6)"; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(cx, top + 10); ctx.lineTo(cx, bot - 10); ctx.stroke();
  glow(ctx, cx, (top + bot) / 2, 25, "rgba(0,188,212,0.2)");
}

// ─── STAFF HEADS ──────────────────────────────────────────────────────────────

function drawStaffHeadArcane(ctx: CanvasRenderingContext2D) {
  // Orb in claw mount
  const cx = 64, cy = 52;
  // Three claws
  const clawColor = "#3e2723";
  const clawHL = "#8d6e63";
  for (const a of [-0.6, 0, 0.6]) {
    const claw = () => {
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(a);
      ctx.beginPath(); ctx.moveTo(-4, 0); ctx.bezierCurveTo(-9, -25, -7, -42, 0, -45); ctx.bezierCurveTo(7, -42, 9, -25, 4, 0); ctx.closePath();
    };
    claw();
    const lg = ctx.createLinearGradient(-8, -45, 8, 0);
    lg.addColorStop(0, clawHL); lg.addColorStop(1, clawColor);
    ctx.fillStyle = lg; ctx.fill();
    addNoise(ctx, 0.05);
    outline(ctx, "#1b110e", 2.5, true);
    rimLight(ctx, () => {}, "rgba(255,255,255,0.2)", 3);
    ctx.restore();
  }
  // Orb
  const orb = () => { ctx.beginPath(); ctx.arc(cx, cy, 23, 0, Math.PI * 2); };
  orb();
  const og = ctx.createRadialGradient(cx - 8, cy - 8, 0, cx, cy, 23);
  og.addColorStop(0, "#ffffff"); og.addColorStop(0.2, "#b3e5fc"); og.addColorStop(0.6, "#1e88e5"); og.addColorStop(1, "#0d47a1");
  ctx.fillStyle = og; ctx.fill();

  outline(ctx, "#001133", 3, true);
  rimLight(ctx, orb, "rgba(255,255,255,0.5)", 8);

  // Inner sparkle
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.beginPath(); ctx.ellipse(cx - 8, cy - 8, 6, 9, -0.5, 0, Math.PI * 2); ctx.fill();
  // Stars
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  for (const [sx, sy] of [[cx + 8, cy - 6], [cx - 2, cy + 10], [cx + 12, cy + 9]]) {
    ctx.beginPath(); ctx.arc(sx, sy, 2, 0, Math.PI * 2); ctx.fill();
    glow(ctx, sx, sy, 6, "rgba(255,255,255,0.3)");
  }
  glow(ctx, cx, cy, 40, "rgba(30,136,229,0.3)");
}

function drawStaffHeadFire(ctx: CanvasRenderingContext2D) {
  const cx = 64, cy = 56;
  // Flame shapes
  const flames = [[cx, 14], [cx - 14, 30], [cx + 14, 30], [cx - 8, 42], [cx + 8, 42]];
  for (const [fx, fy] of flames) {
    const path = () => {
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.bezierCurveTo(fx - 10, fy + 18, fx - 6, fy + 30, fx, fy + 34);
      ctx.bezierCurveTo(fx + 6, fy + 30, fx + 10, fy + 18, fx, fy);
      ctx.closePath();
    };
    path();
    const lg = ctx.createLinearGradient(0, fy, 0, fy + 34);
    lg.addColorStop(0, "#ffeb3b"); lg.addColorStop(0.5, "#ff5722"); lg.addColorStop(1, "#b71c1c");
    ctx.fillStyle = lg; ctx.fill();
    outline(ctx, "#3e2723", 2, true);
    rimLight(ctx, path, "rgba(255,235,59,0.3)", 3);
  }
  // Core orb
  const orb = () => { ctx.beginPath(); ctx.arc(cx, cy + 18, 13, 0, Math.PI * 2); };
  orb();
  const cg = ctx.createRadialGradient(cx - 4, cy + 15, 0, cx, cy + 18, 13);
  cg.addColorStop(0, "#ffffff"); cg.addColorStop(0.3, "#fff176"); cg.addColorStop(1, "#bf360c");
  ctx.fillStyle = cg; ctx.fill(); outline(ctx, "#3e2723", 2.5, true);
  rimLight(ctx, orb, "rgba(255,255,255,0.4)", 5);
  glow(ctx, cx, cy + 18, 30, "rgba(255,87,34,0.4)");
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
    const tentacle = () => {
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.bezierCurveTo(tc1x, tc1y, tc2x, tc2y, tex, tey);
    };
    tentacle();
    ctx.strokeStyle = "#311b92"; ctx.lineWidth = 6; ctx.lineCap = "round"; ctx.stroke();
    ctx.strokeStyle = "#7b1fa2"; ctx.lineWidth = 2.5; ctx.stroke();
    rimLight(ctx, tentacle, "rgba(180,100,255,0.3)", 3);
  }
  // Eye body
  const body = () => { ctx.beginPath(); ctx.ellipse(cx, cy, 22, 18, 0, 0, Math.PI * 2); };
  body();
  const lg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 22);
  lg.addColorStop(0, "#4a148c"); lg.addColorStop(1, "#050010");
  ctx.fillStyle = lg; ctx.fill();
  addNoise(ctx, 0.08);
  outline(ctx, "#0d0014", 3, true);
  rimLight(ctx, body, "rgba(180,100,255,0.35)", 6);

  // Iris
  ctx.beginPath(); ctx.ellipse(cx, cy, 13, 10, 0, 0, Math.PI * 2);
  const ig = ctx.createRadialGradient(cx - 2, cy - 2, 0, cx, cy, 13);
  ig.addColorStop(0, "#e1bee7"); ig.addColorStop(0.5, "#9c27b0"); ig.addColorStop(1, "#311b92");
  ctx.fillStyle = ig; ctx.fill();
  // Pupil
  ctx.beginPath(); ctx.ellipse(cx, cy, 5, 8, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#000"; ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.beginPath(); ctx.ellipse(cx - 2, cy - 2, 2.5, 4, -0.3, 0, Math.PI * 2); ctx.fill();
  glow(ctx, cx, cy, 35, "rgba(171,71,188,0.3)");
}

// ─── SHIELDS ──────────────────────────────────────────────────────────────────

function drawShieldRoundIron(ctx: CanvasRenderingContext2D) {
  const cx = 64, cy = 64, r = 48;
  const path = () => ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.beginPath(); path();
  const lg = ctx.createRadialGradient(cx - 10, cy - 10, 0, cx, cy, r);
  lg.addColorStop(0, "#eceff1"); lg.addColorStop(0.6, "#78909c"); lg.addColorStop(1, "#263238");
  ctx.fillStyle = lg; ctx.fill();

  addGrit(ctx, path, 0.1);
  outline(ctx, "#212121", 3.5, true);
  rimLight(ctx, path, "rgba(255,255,255,0.25)", 6);

  // Rim
  ctx.beginPath(); ctx.arc(cx, cy, r - 4, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 3; ctx.stroke();

  // Cross straps
  ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(cx, cy - r + 6); ctx.lineTo(cx, cy + r - 6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - r + 6, cy); ctx.lineTo(cx + r - 6, cy); ctx.stroke();

  // Boss (central dome)
  const boss = () => { ctx.beginPath(); ctx.arc(cx, cy, 13, 0, Math.PI * 2); };
  boss();
  const bg = ctx.createRadialGradient(cx - 4, cy - 4, 0, cx, cy, 13);
  bg.addColorStop(0, "#ffffff"); bg.addColorStop(0.5, "#90a4ae"); bg.addColorStop(1, "#37474f");
  ctx.fillStyle = bg; ctx.fill(); outline(ctx, "#212121", 2.5, true);
  rimLight(ctx, boss, "rgba(255,255,255,0.4)", 4);

  shine(ctx, cx - r + 10, cy - r + 10, cx - r + 30, cy - r + 30, 0.4, 4);
}

function drawShieldKiteRoyal(ctx: CanvasRenderingContext2D) {
  const cx = 64, top = 16, bot = 112;
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(cx, top);
    ctx.bezierCurveTo(cx + 48, top + 8, cx + 48, top + 50, cx + 40, top + 65);
    ctx.bezierCurveTo(cx + 28, top + 82, cx + 8, top + 90, cx, bot);
    ctx.bezierCurveTo(cx - 8, top + 90, cx - 28, top + 82, cx - 40, top + 65);
    ctx.bezierCurveTo(cx - 48, top + 50, cx - 48, top + 8, cx, top);
    ctx.closePath();
  };
  path();
  // Royal blue fill
  const lg = ctx.createLinearGradient(cx - 48, 0, cx + 48, 0);
  lg.addColorStop(0, "#0d47a1"); lg.addColorStop(0.5, "#1976d2"); lg.addColorStop(1, "#0d47a1");
  ctx.fillStyle = lg; ctx.fill();

  addNoise(ctx, 0.05);
  outline(ctx, "#001133", 4, true);
  rimLight(ctx, path, "rgba(100,200,255,0.25)", 8);

  // Gold border
  ctx.beginPath();
  ctx.moveTo(cx, top + 5);
  ctx.bezierCurveTo(cx + 42, top + 12, cx + 42, top + 50, cx + 34, top + 66);
  ctx.bezierCurveTo(cx + 24, top + 82, cx + 8, top + 89, cx, bot - 4);
  ctx.bezierCurveTo(cx - 8, top + 89, cx - 24, top + 82, cx - 34, top + 66);
  ctx.bezierCurveTo(cx - 42, top + 50, cx - 42, top + 12, cx, top + 5);
  ctx.strokeStyle = "#fbc02d"; ctx.lineWidth = 4; ctx.stroke();

  // Fleur-de-lis emblem
  const ey = top + 48;
  ctx.fillStyle = "#fbc02d";
  // Central fleur
  ctx.beginPath(); ctx.ellipse(cx, ey - 8, 6, 13, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx - 9, ey, 6, 9, 0.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + 9, ey, 6, 9, -0.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.roundRect(cx - 4, ey - 4, 8, 15, 2); ctx.fill();

  shine(ctx, cx - 40, top + 15, cx - 25, top + 45, 0.5, 4);
}

function drawShieldTowerVoid(ctx: CanvasRenderingContext2D) {
  const cx = 64, top = 10, bot = 114;
  const path = () => {
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
  };
  path();
  const lg = ctx.createLinearGradient(cx - 36, 0, cx + 36, 0);
  lg.addColorStop(0, "#050010"); lg.addColorStop(0.5, "#311b92"); lg.addColorStop(1, "#050010");
  ctx.fillStyle = lg; ctx.fill();

  addNoise(ctx, 0.1);
  outline(ctx, "#0d0014", 4, true);
  rimLight(ctx, path, "rgba(180,100,255,0.35)", 8);

  // Purple border
  ctx.strokeStyle = "#7b1fa2"; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(cx - 30, top + 22); ctx.lineTo(cx - 14, top + 6); ctx.lineTo(cx, top + 16); ctx.lineTo(cx + 14, top + 6); ctx.lineTo(cx + 30, top + 22); ctx.stroke();

  // Void eye emblem
  const eyePos = (top + bot) / 2;
  ctx.beginPath(); ctx.ellipse(cx, eyePos, 20, 14, 0, 0, Math.PI * 2);
  ctx.strokeStyle = "#9c27b0"; ctx.lineWidth = 3; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(cx, eyePos, 9, 12, 0, 0, Math.PI * 2);
  const ig = ctx.createRadialGradient(cx, eyePos, 0, cx, eyePos, 11);
  ig.addColorStop(0, "#e1bee7"); ig.addColorStop(1, "#0d001a");
  ctx.fillStyle = ig; ctx.fill();

  glow(ctx, cx, eyePos, 30, "rgba(171,71,188,0.3)");
  rune(ctx, cx - 24, top + 50, 7, "#7b1fa2");
  rune(ctx, cx + 24, top + 50, 7, "#7b1fa2");
}

// ─── MAGICAL CRYSTALS ────────────────────────────────────────────────────────

function drawCrystalFire(ctx: CanvasRenderingContext2D) {
  const cx = 64, top = 16, bot = 106;
  // Hexagonal crystal
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(cx, top);
    ctx.lineTo(cx + 18, top + 20);
    ctx.lineTo(cx + 18, bot - 20);
    ctx.lineTo(cx, bot);
    ctx.lineTo(cx - 18, bot - 20);
    ctx.lineTo(cx - 18, top + 20);
    ctx.closePath();
  };
  function hexCrystal(col1: string, col2: string, col3: string) {
    path();
    const lg = ctx.createLinearGradient(cx - 18, 0, cx + 18, 0);
    lg.addColorStop(0, col1); lg.addColorStop(0.4, col2); lg.addColorStop(0.6, "#ffffff"); lg.addColorStop(1, col3);
    ctx.fillStyle = lg; ctx.fill();

    addNoise(ctx, 0.1);
    outline(ctx, "#210000", 3, true);
    rimLight(ctx, path, "rgba(255,200,100,0.4)", 6);

    // Internal light vein
    ctx.beginPath(); ctx.moveTo(cx, top + 10); ctx.lineTo(cx, bot - 10);
    ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 3; ctx.stroke();
    // Facet lines
    ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(cx - 18, top + 20); ctx.lineTo(cx, top); ctx.lineTo(cx + 18, top + 20); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 18, bot - 20); ctx.lineTo(cx, bot); ctx.lineTo(cx + 18, bot - 20); ctx.stroke();
  }
  hexCrystal("#b71c1c", "#ff5722", "#3e2723");
  // Flame wisps
  ctx.fillStyle = "#ffeb3b";
  for (const [fx, fy, fr] of [[cx - 20, top + 35, 6], [cx + 20, top + 55, 5], [cx - 18, top + 75, 5]]) {
    ctx.beginPath(); ctx.arc(fx, fy, fr, 0, Math.PI * 2);
    ctx.shadowColor = "#ffeb3b"; ctx.shadowBlur = 8;
    ctx.fill(); ctx.shadowBlur = 0;
  }
  glow(ctx, cx, (top + bot) / 2, 45, "rgba(255,87,34,0.3)");
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
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(cx, top);
    ctx.lineTo(cx + bw, top + 22);
    ctx.lineTo(cx + bw - 1, bot);
    ctx.lineTo(cx - bw + 1, bot);
    ctx.lineTo(cx - bw, top + 22);
    ctx.closePath();
  };
  path();
  const lg = ctx.createLinearGradient(cx - bw, 0, cx + bw, 0);
  lg.addColorStop(0, "#455a64"); lg.addColorStop(0.4, "#90a4ae"); lg.addColorStop(0.5, "#eceff1"); lg.addColorStop(0.6, "#78909c"); lg.addColorStop(1, "#37474f");
  ctx.fillStyle = lg; ctx.fill();

  addNoise(ctx, 0.04);
  outline(ctx, "#111", 3, true);
  rimLight(ctx, path, "rgba(255,255,255,0.3)", 4);

  // Fuller groove center
  ctx.beginPath(); ctx.moveTo(cx, top + 10); ctx.lineTo(cx, bot - 5);
  ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 1.8; ctx.stroke();
  // Fuller side shadow
  ctx.beginPath(); ctx.moveTo(cx - 2, top + 24); ctx.lineTo(cx - 2, bot - 6);
  ctx.strokeStyle = "rgba(0,0,0,0.2)"; ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + 2, top + 24); ctx.lineTo(cx + 2, bot - 6);
  ctx.strokeStyle = "rgba(0,0,0,0.2)"; ctx.lineWidth = 2; ctx.stroke();
}

function drawDaggerBladeShadow(ctx: CanvasRenderingContext2D) {
  const cx = 64, top = 8, bot = 102, bw = 9;
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(cx, top);
    ctx.bezierCurveTo(cx + bw + 4, top + 25, cx + bw, top + 55, cx + 2, bot);
    ctx.lineTo(cx - 2, bot);
    let sy = bot;
    while (sy > top + 22) {
      ctx.lineTo(cx - bw + 6, sy - 7);
      ctx.lineTo(cx - bw, sy - 14);
      sy -= 14;
    }
    ctx.lineTo(cx - bw, top + 20);
    ctx.closePath();
  };
  path();
  const lg = ctx.createLinearGradient(cx - bw, 0, cx + bw, 0);
  lg.addColorStop(0, "#0a0a1a"); lg.addColorStop(0.4, "#263238"); lg.addColorStop(0.7, "#455a64"); lg.addColorStop(1, "#0a0a1a");
  ctx.fillStyle = lg; ctx.fill();

  addNoise(ctx, 0.06);
  outline(ctx, "#050510", 3, true);
  rimLight(ctx, path, "rgba(100,100,150,0.25)", 5);

  shine(ctx, cx + 4, top + 20, cx + bw - 1, bot - 10, 0.4, 2);
  glow(ctx, cx, bot - 20, 25, "rgba(69,90,100,0.15)");
}

function drawDaggerBladeGold(ctx: CanvasRenderingContext2D) {
  const cx = 64, top = 6, bot = 106, bw = 5;
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(cx, top);
    ctx.lineTo(cx + bw, top + 18);
    ctx.lineTo(cx + bw - 1, bot);
    ctx.lineTo(cx - bw + 1, bot);
    ctx.lineTo(cx - bw, top + 18);
    ctx.closePath();
  };
  path();
  const lg = ctx.createLinearGradient(cx - bw, 0, cx + bw, 0);
  lg.addColorStop(0, "#827717"); lg.addColorStop(0.4, "#fbc02d"); lg.addColorStop(0.5, "#fffde0"); lg.addColorStop(0.6, "#fbc02d"); lg.addColorStop(1, "#827717");
  ctx.fillStyle = lg; ctx.fill();

  addNoise(ctx, 0.05);
  outline(ctx, "#1a0a00", 3, true);
  rimLight(ctx, path, "rgba(255,255,255,0.4)", 4);

  // Ornate filigree marks
  ctx.strokeStyle = "rgba(0,0,0,0.2)"; ctx.lineWidth = 1;
  for (const fy of [bot - 20, bot - 40, bot - 60]) {
    ctx.beginPath(); ctx.moveTo(cx - 3, fy); ctx.lineTo(cx + 3, fy); ctx.stroke();
  }
  shine(ctx, cx, top + 10, cx, bot - 15, 0.6, 2);
  gem(ctx, cx, bot - 12, 4.5, "#ba68c8", "#4a148c");
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
  glow(ctx, cx, cy, r + 20, "rgba(255,80,0,0.3)");
  // Ball
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
  const bg = ctx.createRadialGradient(cx - 8, cy - 8, 2, cx, cy, r);
  bg.addColorStop(0, "#ffcc00"); bg.addColorStop(0.4, "#ff6600"); bg.addColorStop(0.7, "#cc1100"); bg.addColorStop(1, "#4a0000");
  ctx.shadowColor = "#ff5500"; ctx.shadowBlur = 18;
  ctx.fillStyle = bg; ctx.fill(); ctx.shadowBlur = 0; outline(ctx, "#1a0800", 3);
  // Crack lines with glow
  ctx.strokeStyle = "#ffcc00"; ctx.lineWidth = 1.5;
  for (const [sx, sy, ex, ey] of [[cx - 10, cy - 20, cx + 5, cy], [cx + 8, cy - 14, cx - 4, cy + 14], [cx - 8, cy + 8, cx + 12, cy + 18]]) {
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey);
    ctx.shadowColor = "#ffcc00"; ctx.shadowBlur = 5; ctx.stroke(); ctx.shadowBlur = 0;
  }
  // Flame wisps around ball
  ctx.fillStyle = "#ff9900";
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    ctx.beginPath(); ctx.arc(cx + (r + 6) * Math.cos(a), cy + (r + 6) * Math.sin(a), 5, 0, Math.PI * 2); ctx.fill();
  }
  shine(ctx, cx - 14, cy - 14, cx - 4, cy - 10, 0.55);
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

  // SWORD GUARDS
  { id: "sword_guard_iron_01", name: "Simple Crossguard", category: "sword_guard", material: "iron", rarity: "common", tags: ["physical"], draw: drawGuardSimpleIron },
  { id: "sword_guard_gold_02", name: "Ornate Wing Guard", category: "sword_guard", material: "gold", rarity: "legendary", tags: ["physical", "royal_faction"], draw: drawGuardOrnateGold },
  { id: "sword_guard_royal_03", name: "Crown Guard", category: "sword_guard", material: "royal", rarity: "epic", tags: ["physical", "royal_faction"], draw: drawGuardCrown },
  { id: "sword_guard_bone_04", name: "Skull Bone Guard", category: "sword_guard", material: "bone", rarity: "rare", tags: ["physical", "undead_faction"], draw: drawGuardBoneSkull },
  { id: "sword_guard_void_05", name: "Twisted Void Guard", category: "sword_guard", material: "void", rarity: "epic", tags: ["magical", "void_biome"], draw: drawGuardVoidTwist },
  { id: "sword_guard_fire_06", name: "Fire Wing Guard", category: "sword_guard", material: "fire", rarity: "rare", tags: ["fire", "volcanic_biome"], draw: drawGuardFireWings },

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
