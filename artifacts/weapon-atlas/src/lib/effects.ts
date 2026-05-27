export type RarityLevel = "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic";
export type ElementType = "none" | "fire" | "ice" | "electro" | "wind";

const CX = 64, CY = 64, SIZE = 128;

// ─── RARITY AURAS ─────────────────────────────────────────────────────────────

function glowRim(ctx: CanvasRenderingContext2D, color: string, alpha: number, blur: number, spread: number) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  ctx.globalAlpha = alpha;
  // Outer rim rect (inset so glow is visible inside the 128px tile)
  ctx.strokeStyle = color;
  ctx.lineWidth = spread;
  const m = spread / 2 + 2;
  ctx.beginPath();
  ctx.roundRect(m, m, SIZE - m * 2, SIZE - m * 2, 8);
  ctx.stroke();
  ctx.restore();
}

function rays(ctx: CanvasRenderingContext2D, color: string, count: number, len: number, alpha: number) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const r0 = 46, r1 = r0 + len;
    ctx.beginPath();
    ctx.moveTo(CX + r0 * Math.cos(a), CY + r0 * Math.sin(a));
    ctx.lineTo(CX + r1 * Math.cos(a), CY + r1 * Math.sin(a));
    ctx.stroke();
  }
  ctx.restore();
}

function particles(ctx: CanvasRenderingContext2D, color: string, count: number, rMin: number, rMax: number, dotR: number, alpha: number) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + 0.3;
    const r = rMin + ((i * 7919) % (rMax - rMin));
    ctx.beginPath();
    ctx.arc(CX + r * Math.cos(a), CY + r * Math.sin(a), dotR, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function outerGlow(ctx: CanvasRenderingContext2D, color: string, alpha: number, radius: number) {
  const rg = ctx.createRadialGradient(CX, CY, radius * 0.55, CX, CY, radius);
  rg.addColorStop(0, "transparent");
  rg.addColorStop(1, color);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.restore();
}

export function drawRarityAura(ctx: CanvasRenderingContext2D, rarity: RarityLevel): void {
  ctx.save();
  switch (rarity) {
    case "common": {
      glowRim(ctx, "#ffffff", 0.08, 4, 1);
      particles(ctx, "#ffffff", 4, 52, 60, 1, 0.2);
      break;
    }
    case "uncommon": {
      outerGlow(ctx, "rgba(76,175,80,0.15)", 1, 64);
      glowRim(ctx, "#4caf50", 0.4, 12, 3);
      particles(ctx, "#a5d6a7", 10, 50, 62, 1.5, 0.6);
      break;
    }
    case "rare": {
      outerGlow(ctx, "rgba(33,150,243,0.18)", 1, 64);
      glowRim(ctx, "#2196f3", 0.5, 16, 4);
      rays(ctx, "#90caf9", 8, 12, 0.4);
      particles(ctx, "#bbdefb", 14, 48, 62, 2, 0.7);
      for (const [x, y] of [[8, 8], [120, 8], [8, 120], [120, 120]]) {
        ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#fff"; ctx.shadowColor = "#2196f3"; ctx.shadowBlur = 10; ctx.fill();
      }
      break;
    }
    case "epic": {
      outerGlow(ctx, "rgba(156,39,176,0.22)", 1, 64);
      glowRim(ctx, "#9c27b0", 0.6, 20, 5);
      particles(ctx, "#e1bee7", 12, 48, 62, 2.5, 0.7);
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + 0.78;
        const x = CX + 56 * Math.cos(a), y = CY + 56 * Math.sin(a);
        ctx.beginPath(); ctx.arc(x, y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = "#f3e5f5"; ctx.shadowColor = "#9c27b0"; ctx.shadowBlur = 12; ctx.fill();
      }
      for (const [ox, oy] of [[10, 10], [118, 10], [10, 118], [118, 118]]) {
        ctx.strokeStyle = "#9c27b0"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(ox, oy, 6, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ox - 5, oy); ctx.lineTo(ox + 5, oy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ox, oy - 5); ctx.lineTo(ox, oy + 5); ctx.stroke();
      }
      break;
    }
    case "legendary": {
      outerGlow(ctx, "rgba(255,152,0,0.25)", 1, 64);
      glowRim(ctx, "#ff9800", 0.7, 24, 6);
      rays(ctx, "#ffe082", 16, 18, 0.5);
      particles(ctx, "#fff9c4", 18, 46, 62, 2.2, 0.8);
      ctx.fillStyle = "#fffde7"; ctx.shadowColor = "#ff9800"; ctx.shadowBlur = 20;
      for (let i = 0; i < 4; i++) {
        ctx.save(); ctx.translate(CX, CY); ctx.rotate((i / 4) * Math.PI * 2);
        ctx.beginPath(); ctx.moveTo(0, -64); ctx.lineTo(5, -12); ctx.lineTo(0, 0); ctx.lineTo(-5, -12); ctx.closePath(); ctx.fill(); ctx.restore();
      }
      for (const [ox, oy] of [[8, 8], [120, 8], [8, 120], [120, 120]]) {
        ctx.save(); ctx.translate(ox, oy); ctx.rotate(Math.PI / 4);
        ctx.fillStyle = "#fff176"; ctx.shadowColor = "#ff9800"; ctx.shadowBlur = 10; ctx.fillRect(-4.5, -4.5, 9, 9); ctx.restore();
      }
      break;
    }
    case "mythic": {
      const g = ctx.createRadialGradient(CX, CY, 20, CX, CY, 64);
      g.addColorStop(0, "rgba(244,143,177,0.2)"); g.addColorStop(1, "rgba(171,71,188,0.35)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, SIZE, SIZE);
      glowRim(ctx, "#f06292", 0.8, 30, 7);
      rays(ctx, "#f8bbd0", 24, 20, 0.6);
      particles(ctx, "#fce4ec", 20, 44, 62, 2.5, 0.9);
      ctx.strokeStyle = "#e91e63"; ctx.lineWidth = 1.2; ctx.setLineDash([5, 3]);
      ctx.beginPath(); ctx.arc(CX, CY, 58, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const x = CX + 58 * Math.cos(a), y = CY + 58 * Math.sin(a);
        ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "#fce4ec"; ctx.shadowColor = "#e91e63"; ctx.shadowBlur = 12; ctx.fill();
      }
      break;
    }
  }
  ctx.restore();
}

// ─── ELEMENT EFFECTS ──────────────────────────────────────────────────────────

export function drawElementEffect(ctx: CanvasRenderingContext2D, element: ElementType): void {
  ctx.save();
  switch (element) {
    case "fire": {
      const fg = ctx.createRadialGradient(CX, SIZE - 10, 0, CX, SIZE - 10, 50);
      fg.addColorStop(0, "rgba(255,87,34,0.5)");
      fg.addColorStop(1, "transparent");
      ctx.fillStyle = fg; ctx.fillRect(0, 0, SIZE, SIZE);

      const flames: [number, number, number][] = [
        [CX - 22, 95, 25], [CX - 8, 75, 35], [CX + 6, 82, 30], [CX + 20, 90, 22],
        [CX - 32, 102, 18], [CX + 30, 100, 16]
      ];
      for (const [fx, fy, fh] of flames) {
        const lg = ctx.createLinearGradient(fx, fy, fx, fy - fh);
        lg.addColorStop(0, "rgba(216,67,21,0.9)");
        lg.addColorStop(0.5, "rgba(255,152,0,0.8)");
        lg.addColorStop(1, "rgba(255,235,59,0)");
        ctx.beginPath();
        ctx.moveTo(fx - 5, fy);
        ctx.bezierCurveTo(fx - 8, fy - fh * 0.4, fx + 6, fy - fh * 0.7, fx, fy - fh);
        ctx.bezierCurveTo(fx - 5, fy - fh * 0.7, fx + 8, fy - fh * 0.3, fx + 5, fy);
        ctx.closePath();
        ctx.fillStyle = lg; ctx.shadowColor = "#ff5722"; ctx.shadowBlur = 10; ctx.fill();
      }
      const sparks: [number, number, number][] = [
        [CX - 25, 65, 2], [CX + 24, 55, 1.5], [CX - 12, 45, 2.5], [CX + 10, 35, 1.8],
        [CX - 35, 75, 1.5], [CX + 32, 68, 2], [CX + 4, 30, 1.2], [CX - 15, 25, 1.5]
      ];
      ctx.fillStyle = "#fff176"; ctx.shadowColor = "#ffeb3b"; ctx.shadowBlur = 8;
      for (const [ex, ey, er] of sparks) {
        ctx.beginPath(); ctx.arc(ex, ey, er, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }

    case "ice": {
      const ig = ctx.createRadialGradient(CX, CY, 24, CX, CY, 64);
      ig.addColorStop(0, "transparent");
      ig.addColorStop(1, "rgba(129,212,250,0.25)");
      ctx.fillStyle = ig; ctx.fillRect(0, 0, SIZE, SIZE);

      const shards: [number, number, number, number][] = [
        [12, 18, -0.45, 16], [10, 58, -0.7, 12], [14, 90, -0.3, 14],
        [116, 16, 0.45, 15], [118, 62, 0.6, 13], [114, 95, 0.4, 11],
        [32, 5, -0.9, 12], [64, 6, 0, 10], [96, 7, 0.8, 13],
        [30, 123, -0.4, 11], [64, 125, 0, 10], [98, 122, 0.7, 12],
      ];
      for (const [sx, sy, angle, sh] of shards) {
        ctx.save(); ctx.translate(sx, sy); ctx.rotate(angle);
        const sg = ctx.createLinearGradient(0, 0, 0, -sh);
        sg.addColorStop(0, "rgba(179,229,252,0.95)");
        sg.addColorStop(0.6, "rgba(225,245,254,0.7)");
        sg.addColorStop(1, "rgba(255,255,255,0)");
        ctx.beginPath();
        ctx.moveTo(-5, 0); ctx.lineTo(0, -sh); ctx.lineTo(5, 0); ctx.lineTo(2, -sh * 0.5); ctx.lineTo(-2, -sh * 0.5);
        ctx.closePath();
        ctx.fillStyle = sg; ctx.shadowColor = "#81d4fa"; ctx.shadowBlur = 8; ctx.fill();
        ctx.restore();
      }
      ctx.strokeStyle = "rgba(179,229,252,0.5)"; ctx.lineWidth = 1.2;
      const cracks: [number, number, number, number][] = [
        [8, 25, 35, 60], [120, 20, 95, 55], [20, 105, 55, 120],
        [105, 110, 80, 125], [35, 8, 58, 32], [90, 6, 75, 28]
      ];
      for (const [x1, y1, x2, y2] of cracks) {
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx + 10, my - 12); ctx.stroke();
      }
      const snow = [[18,35],[48,20],[82,14],[110,42],[118,78],[105,105],[58,115],[16,98],[42,112],[92,10],[10,68],[125,62]];
      ctx.fillStyle = "#fff"; ctx.shadowColor = "#e1f5fe"; ctx.shadowBlur = 5;
      for (const [sx, sy] of snow) {
        ctx.beginPath(); ctx.arc(sx, sy, 1.8, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }

    case "electro": {
      const eg = ctx.createRadialGradient(CX, CY, 15, CX, CY, 64);
      eg.addColorStop(0, "rgba(255,241,118,0.15)");
      eg.addColorStop(0.5, "rgba(186,104,200,0.1)");
      eg.addColorStop(1, "transparent");
      ctx.fillStyle = eg; ctx.fillRect(0, 0, SIZE, SIZE);

      const bolts: [number, number, number, number, number[]][] = [
        [8, 15, 120, 112, [25, 40, 50, 85, 75, 65, 98, 80]],
        [15, 110, 115, 15, [35, 95, 55, 75, 70, 55, 95, 40]],
        [CX, 2, CX + 25, 126, [CX + 8, 35, CX - 10, 60, CX + 15, 85, CX - 8, 105]],
      ];
      for (const [x1, y1, x2, y2, pts] of bolts) {
        ctx.lineWidth = 1.8; ctx.lineCap = "round";
        ctx.strokeStyle = "#fff176"; ctx.shadowColor = "#ffee58"; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.moveTo(x1, y1);
        for (let i = 0; i < pts.length - 1; i += 2) { ctx.lineTo(pts[i], pts[i + 1]); }
        ctx.lineTo(x2, y2); ctx.stroke();
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 0.8; ctx.shadowBlur = 4;
        ctx.beginPath(); ctx.moveTo(x1, y1);
        for (let i = 0; i < pts.length - 1; i += 2) { ctx.lineTo(pts[i], pts[i + 1]); }
        ctx.lineTo(x2, y2); ctx.stroke();
      }
      ctx.strokeStyle = "#ba68c8"; ctx.lineWidth = 1.2; ctx.shadowColor = "#9c27b0"; ctx.shadowBlur = 6;
      const branches = [[30,40,18,32],[65,58,80,48],[38,95,25,85],[85,72,98,65],[58,85,45,95]];
      for (const [x1, y1, x2, y2] of branches) {
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      }
      ctx.fillStyle = "#fff59d"; ctx.shadowColor = "#fdd835"; ctx.shadowBlur = 10;
      const sparks = [[10,18,2.8],[120,15,2.2],[18,112,2.5],[112,115,2.8],[64,8,2.2],[64,122,2.2],[8,64,2.2],[122,64,2.2]];
      for (const [sx, sy, sr] of sparks) {
        ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = "#e1bee7"; ctx.shadowColor = "#8e24aa"; ctx.shadowBlur = 12;
      for (const [sx, sy] of [[25,25],[103,25],[25,103],[103,103]]) {
        ctx.beginPath(); ctx.arc(sx, sy, 4, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }

    case "wind": {
      const wg = ctx.createRadialGradient(CX, CY, 8, CX, CY, 64);
      wg.addColorStop(0, "rgba(77,208,225,0.1)");
      wg.addColorStop(1, "rgba(128,222,234,0.08)");
      ctx.fillStyle = wg; ctx.fillRect(0, 0, SIZE, SIZE);

      ctx.lineWidth = 2.2; ctx.strokeStyle = "#4dd0e1"; ctx.shadowColor = "#00bcd4"; ctx.shadowBlur = 10;
      const swirls: [number, number, number, number, number][] = [
        [CX, CY, 54, 0, 1.5], [CX - 10, CY + 8, 40, 0.7, 2.4], [CX + 12, CY - 10, 46, 3.4, 5.4],
        [CX, CY, 30, 1.8, 4.0], [CX + 5, CY + 5, 62, -0.4, 1.0], [CX - 8, CY - 8, 22, 1.1, 3.0],
      ];
      for (const [wx, wy, wr, startA, endA] of swirls) {
        ctx.beginPath(); ctx.arc(wx, wy, wr, startA, endA); ctx.globalAlpha = 0.6; ctx.stroke();
      }
      const streaks: [number, number, number, number][] = [
        [0, 15, 40, 20], [0, 30, 32, 35], [85, 22, 128, 18], [90, 42, 128, 40],
        [0, 102, 45, 105], [82, 98, 128, 95], [0, 115, 35, 110], [95, 112, 128, 115],
        [15, 58, 55, 55], [75, 78, 110, 75],
      ];
      for (const [x1, y1, x2, y2] of streaks) {
        const sg = ctx.createLinearGradient(x1, y1, x2, y2);
        const toRight = x2 > x1;
        sg.addColorStop(0, toRight ? "transparent" : "rgba(178,235,242,0.8)");
        sg.addColorStop(1, toRight ? "rgba(178,235,242,0.8)" : "transparent");
        ctx.strokeStyle = sg; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      }
      ctx.fillStyle = "#b2ebf2"; ctx.shadowColor = "#4dd0e1"; ctx.shadowBlur = 8;
      const wisps: [number, number, number][] = [
        [12, 12, 0.5], [115, 18, -0.7], [20, 115, 0.9], [115, 110, -0.6],
        [55, 8, 0.3], [85, 120, -0.4], [5, 65, 0.6], [123, 70, -0.5]
      ];
      for (const [wx, wy, angle] of wisps) {
        ctx.save(); ctx.translate(wx, wy); ctx.rotate(angle);
        ctx.beginPath(); ctx.ellipse(0, 0, 6, 2.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      }
      break;
    }

    case "none":
    default:
      break;
  }
  ctx.restore();
}

// ─── COMPOSITE RENDERER ───────────────────────────────────────────────────────

export function renderWithEffects(
  ctx: CanvasRenderingContext2D,
  drawFn: (ctx: CanvasRenderingContext2D) => void,
  rarity: RarityLevel,
  showAura: boolean,
  element: ElementType
): void {
  ctx.clearRect(0, 0, SIZE, SIZE);
  drawFn(ctx);
  if (showAura) drawRarityAura(ctx, rarity);
  if (element !== "none") drawElementEffect(ctx, element);
}

// ─── STANDALONE EFFECT RENDERERS (for ZIP export) ────────────────────────────

export function renderRarityAuraCanvas(rarity: RarityLevel): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE; canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;
  drawRarityAura(ctx, rarity);
  return canvas;
}

export function renderElementEffectCanvas(element: ElementType): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE; canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;
  drawElementEffect(ctx, element);
  return canvas;
}

export const RARITY_AURA_COLORS: Record<RarityLevel, string> = {
  common:    "#9d9d9d",
  uncommon:  "#1eff00",
  rare:      "#0070dd",
  epic:      "#a335ee",
  legendary: "#ff8000",
  mythic:    "#e6cc80",
};

export const ELEMENT_COLORS: Record<ElementType, string> = {
  none:    "#444444",
  fire:    "#ff4400",
  ice:     "#80d4ff",
  electro: "#ffe000",
  wind:    "#00e5cc",
};

export const ELEMENT_LABELS: Record<ElementType, string> = {
  none:    "None",
  fire:    "🔥 Fire",
  ice:     "❄️ Ice",
  electro: "⚡ Electro",
  wind:    "💨 Wind",
};
