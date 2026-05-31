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
  ctx.roundRect(m, m, SIZE - m * 2, SIZE - m * 2, 10);
  ctx.stroke();

  // Secondary softer glow
  ctx.shadowBlur = blur * 1.5;
  ctx.lineWidth = spread * 0.5;
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
  const rg = ctx.createRadialGradient(CX, CY, radius * 0.4, CX, CY, radius);
  rg.addColorStop(0, "transparent");
  rg.addColorStop(0.6, color);
  rg.addColorStop(1, "transparent");
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = rg;
  ctx.globalCompositeOperation = "screen";
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.restore();
}

import { rimLightPx, innerShadowPx } from "./canvasUtils";

export function drawRarityAura(ctx: CanvasRenderingContext2D, rarity: RarityLevel): void {
  switch (rarity) {
    case "common": {
      // Barely there — faint white rim sparkle
      particles(ctx, "#ffffff", 6, 50, 58, 1, 0.25);
      glowRim(ctx, "#aaaaaa", 0.12, 4, 2);
      rimLightPx(ctx, 4, 4, SIZE - 8, SIZE - 8, "rgba(255,255,255,0.1)");
      break;
    }
    case "uncommon": {
      // Green outer glow rim + green sparkles
      outerGlow(ctx, "rgba(0,200,60,0.18)", 1, 64);
      glowRim(ctx, "#00c83c", 0.55, 10, 3);
      rimLightPx(ctx, 4, 4, SIZE - 8, SIZE - 8, "rgba(100,255,150,0.2)");
      particles(ctx, "#44ff88", 8, 50, 60, 1.8, 0.7);
      break;
    }
    case "rare": {
      // Blue pulsing rim + corner rays + blue particles
      outerGlow(ctx, "rgba(0,112,221,0.22)", 1, 64);
      glowRim(ctx, "#0070dd", 0.65, 14, 3.5);
      rimLightPx(ctx, 4, 4, SIZE - 8, SIZE - 8, "rgba(150,200,255,0.3)");
      rays(ctx, "#4ea8ff", 8, 10, 0.55);
      particles(ctx, "#80c8ff", 12, 48, 60, 2, 0.75);
      // Bright corner glints
      ctx.save();
      ctx.globalAlpha = 0.5;
      for (const [cx2, cy2] of [[6, 6], [122, 6], [6, 122], [122, 122]]) {
        ctx.beginPath(); ctx.arc(cx2, cy2, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#80c8ff"; ctx.shadowColor = "#0070dd"; ctx.shadowBlur = 8; ctx.fill();
      }
      ctx.restore();
      break;
    }
    case "epic": {
      // Purple void rim glow + orbiting dim orbs + edge shimmer lines
      outerGlow(ctx, "rgba(163,53,238,0.28)", 1, 64);
      glowRim(ctx, "#a335ee", 0.7, 16, 4);
      rimLightPx(ctx, 4, 4, SIZE - 8, SIZE - 8, "rgba(200,150,255,0.35)");
      particles(ctx, "#cc88ff", 10, 50, 62, 2.5, 0.8);
      // Orbiting larger orbs
      ctx.save();
      ctx.globalAlpha = 0.65;
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + 0.78;
        const x = CX + 55 * Math.cos(a); const y = CY + 55 * Math.sin(a);
        ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#b060ff"; ctx.shadowColor = "#9030d0"; ctx.shadowBlur = 10; ctx.fill();
      }
      ctx.restore();
      // Corner arcane symbols
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = "#a335ee"; ctx.lineWidth = 1.2; ctx.shadowColor = "#a335ee"; ctx.shadowBlur = 6;
      for (const [ox, oy] of [[8, 8], [120, 8], [8, 120], [120, 120]]) {
        ctx.beginPath(); ctx.arc(ox, oy, 5, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ox - 4, oy); ctx.lineTo(ox + 4, oy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ox, oy - 4); ctx.lineTo(ox, oy + 4); ctx.stroke();
      }
      ctx.restore();
      break;
    }
    case "legendary": {
      // Bright gold star burst + gold rim + 16 rays + heavy glow
      outerGlow(ctx, "rgba(255,128,0,0.32)", 1, 64);
      glowRim(ctx, "#ff8000", 0.8, 20, 5);
      rimLightPx(ctx, 4, 4, SIZE - 8, SIZE - 8, "rgba(255,220,100,0.4)");
      rays(ctx, "#ffd060", 16, 14, 0.65);
      particles(ctx, "#ffe080", 14, 48, 62, 2.2, 0.85);
      // Central star gleam (4-pointed)
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = "#fffde0";
      ctx.shadowColor = "#ffaa00"; ctx.shadowBlur = 18;
      for (let i = 0; i < 4; i++) {
        ctx.save();
        ctx.translate(CX, CY);
        ctx.rotate((i / 4) * Math.PI * 2);
        ctx.beginPath();
        ctx.moveTo(0, -62); ctx.lineTo(4, -10); ctx.lineTo(0, 0); ctx.lineTo(-4, -10);
        ctx.closePath(); ctx.fill(); ctx.restore();
      }
      ctx.restore();
      // Corner golden diamonds
      ctx.save();
      ctx.globalAlpha = 0.7;
      for (const [ox, oy] of [[6, 6], [122, 6], [6, 122], [122, 122]]) {
        ctx.save(); ctx.translate(ox, oy); ctx.rotate(Math.PI / 4);
        ctx.fillStyle = "#ffcc00"; ctx.shadowColor = "#ff8000"; ctx.shadowBlur = 8;
        ctx.fillRect(-3.5, -3.5, 7, 7); ctx.restore();
      }
      ctx.restore();
      break;
    }
    case "mythic": {
      // Cosmic pink/purple — intense outer nebula + rune ring + crown stars + swirl
      outerGlow(ctx, "rgba(255,100,200,0.35)", 1, 64);
      glowRim(ctx, "#ff50d0", 0.85, 24, 6);
      rimLightPx(ctx, 4, 4, SIZE - 8, SIZE - 8, "rgba(255,180,240,0.5)");
      rays(ctx, "#ff80e8", 24, 16, 0.5);
      particles(ctx, "#ffaaff", 16, 46, 62, 2.5, 0.9);
      // Orbiting rune ring
      ctx.save();
      ctx.strokeStyle = "#cc40b0"; ctx.lineWidth = 1; ctx.globalAlpha = 0.45;
      ctx.shadowColor = "#ff40cc"; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(CX, CY, 58, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
      // Crown of stars on the ring
      ctx.save();
      ctx.globalAlpha = 0.9;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const x = CX + 58 * Math.cos(a); const y = CY + 58 * Math.sin(a);
        ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#ffaaff"; ctx.shadowColor = "#ff40cc"; ctx.shadowBlur = 10; ctx.fill();
      }
      ctx.restore();
      // Cosmic shimmer center
      const cg = ctx.createRadialGradient(CX, CY, 0, CX, CY, 38);
      cg.addColorStop(0, "rgba(255,180,255,0.12)");
      cg.addColorStop(1, "transparent");
      ctx.save(); ctx.fillStyle = cg; ctx.fillRect(0, 0, SIZE, SIZE); ctx.restore();
      break;
    }
  }
}

// ─── ELEMENT EFFECTS ──────────────────────────────────────────────────────────

export function drawElementEffect(ctx: CanvasRenderingContext2D, element: ElementType): void {
  ctx.save();
  switch (element) {
    case "fire": {
      // Atmospheric fire effect with deeper color depth and multi-layered glow
      ctx.globalCompositeOperation = "screen";
      innerShadowPx(ctx, 0, 0, SIZE, SIZE, 0.3);
      const fg = ctx.createRadialGradient(CX, SIZE - 10, 10, CX, SIZE - 5, 50);
      fg.addColorStop(0, "rgba(255,80,0,0.5)");
      fg.addColorStop(0.6, "rgba(180,40,0,0.2)");
      fg.addColorStop(1, "transparent");
      ctx.fillStyle = fg; ctx.fillRect(0, 0, SIZE, SIZE);

      const flames: [number, number, number][] = [
        [CX - 18, 90, 24], [CX - 6, 75, 32], [CX + 4, 80, 28], [CX + 16, 88, 22],
        [CX - 28, 98, 18], [CX + 26, 96, 16]
      ];
      for (const [fx, fy, fh] of flames) {
        const lg = ctx.createLinearGradient(fx, fy, fx, fy - fh);
        lg.addColorStop(0, "rgba(255,40,0,0.9)");
        lg.addColorStop(0.4, "rgba(255,120,0,0.7)");
        lg.addColorStop(1, "rgba(255,200,0,0)");
        ctx.beginPath();
        ctx.moveTo(fx - 5, fy);
        ctx.bezierCurveTo(fx - 8, fy - fh * 0.4, fx + 6, fy - fh * 0.7, fx, fy - fh);
        ctx.bezierCurveTo(fx - 5, fy - fh * 0.7, fx + 8, fy - fh * 0.3, fx + 5, fy);
        ctx.closePath();
        ctx.fillStyle = lg; ctx.shadowColor = "#ff3300"; ctx.shadowBlur = 10; ctx.fill();
      }

      const sparks: [number, number, number][] = [
        [CX - 22, 68, 2.2], [CX + 20, 60, 1.8], [CX - 10, 52, 2.5], [CX + 8, 45, 2],
        [CX - 30, 78, 1.8], [CX + 28, 72, 2.2], [CX + 2, 38, 1.5]
      ];
      ctx.fillStyle = "#ffcc00"; ctx.shadowColor = "#ff9900"; ctx.shadowBlur = 8;
      for (const [ex, ey, er] of sparks) {
        ctx.beginPath(); ctx.arc(ex, ey, er, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }

    case "ice": {
      // Atmospheric ice effect with frosted overlay and shimmering crystals
      ctx.globalCompositeOperation = "screen";
      rimLightPx(ctx, 0, 0, SIZE, SIZE, "rgba(255,255,255,0.2)");
      const ig = ctx.createRadialGradient(CX, CY, 30, CX, CY, 70);
      ig.addColorStop(0, "transparent");
      ig.addColorStop(0.7, "rgba(100,220,255,0.2)");
      ig.addColorStop(1, "rgba(160,240,255,0.1)");
      ctx.fillStyle = ig; ctx.fillRect(0, 0, SIZE, SIZE);

      const shards: [number, number, number, number][] = [
        [14, 20, -0.4, 16], [12, 55, -0.6, 12], [16, 85, -0.3, 14],
        [114, 18, 0.4, 15], [116, 60, 0.5, 13], [112, 90, 0.35, 11],
        [30, 6, -0.8, 12], [64, 8, 0, 10], [100, 9, 0.7, 13],
        [28, 118, -0.5, 11], [68, 120, 0, 10], [96, 116, 0.6, 12],
      ];
      for (const [sx, sy, angle, sh] of shards) {
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(angle);
        const sg = ctx.createLinearGradient(0, 0, 0, -sh);
        sg.addColorStop(0, "rgba(180,240,255,0.95)");
        sg.addColorStop(0.5, "rgba(220,250,255,0.8)");
        sg.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.moveTo(-5, 0); ctx.lineTo(0, -sh); ctx.lineTo(5, 0); ctx.closePath();
        ctx.fillStyle = sg; ctx.shadowColor = "#a0e8ff"; ctx.shadowBlur = 8; ctx.fill();
        ctx.restore();
      }

      ctx.strokeStyle = "rgba(200,240,255,0.5)"; ctx.lineWidth = 1.2;
      const cracks: [number, number, number, number][] = [
        [10, 30, 30, 55], [118, 25, 98, 48], [25, 100, 50, 115],
        [100, 105, 75, 118], [40, 12, 55, 28], [85, 10, 72, 26]
      ];
      for (const [x1, y1, x2, y2] of cracks) {
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx + 10, my - 12); ctx.stroke();
      }

      ctx.fillStyle = "rgba(230,250,255,0.9)"; ctx.shadowColor = "#ffffff"; ctx.shadowBlur = 5;
      const snow = [[20,40],[45,22],[80,16],[108,38],[115,75],[100,102],[55,112],[18,95],[38,110],[90,8],[8,65],[120,58]];
      for (const [sx, sy] of snow) {
        ctx.beginPath(); ctx.arc(sx, sy, 1.8, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }

    case "electro": {
      // Atmospheric electro effect with energetic lightning and purple/yellow glows
      ctx.globalCompositeOperation = "screen";
      const eg = ctx.createRadialGradient(CX, CY, 15, CX, CY, 65);
      eg.addColorStop(0, "rgba(255,240,0,0.15)");
      eg.addColorStop(0.6, "rgba(160,80,255,0.1)");
      eg.addColorStop(1, "transparent");
      ctx.fillStyle = eg; ctx.fillRect(0, 0, SIZE, SIZE);

      const bolts: [number, number, number, number, number[]][] = [
        [10, 20, 118, 108, [30, 45, 55, 80, 80, 60, 95, 75]],
        [18, 105, 110, 18, [40, 90, 60, 70, 75, 50, 90, 35]],
        [CX, 5, CX + 20, 123, [CX + 5, 30, CX - 8, 55, CX + 12, 80, CX - 5, 100]],
      ];

      ctx.lineWidth = 1.8; ctx.lineCap = "round";
      for (const [x1, y1, x2, y2, pts] of bolts) {
        ctx.strokeStyle = "#ffe000"; ctx.shadowColor = "#ffee00"; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.moveTo(x1, y1);
        for (let i = 0; i < pts.length - 1; i += 2) { ctx.lineTo(pts[i], pts[i + 1]); }
        ctx.lineTo(x2, y2); ctx.stroke();

        ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 0.8; ctx.shadowBlur = 4;
        ctx.beginPath(); ctx.moveTo(x1, y1);
        for (let i = 0; i < pts.length - 1; i += 2) { ctx.lineTo(pts[i], pts[i + 1]); }
        ctx.lineTo(x2, y2); ctx.stroke();
        ctx.lineWidth = 1.8;
      }

      ctx.strokeStyle = "#cc88ff"; ctx.lineWidth = 1.2; ctx.shadowColor = "#9030d0"; ctx.shadowBlur = 6;
      const branches = [[35,45,22,38],[62,55,75,44],[40,90,28,80],[80,68,92,60],[55,80,42,90]];
      for (const [x1, y1, x2, y2] of branches) {
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      }

      ctx.fillStyle = "#ffffa0"; ctx.shadowColor = "#ffee00"; ctx.shadowBlur = 8;
      const sparks = [[12,22,2.8],[118,18,2.2],[20,108,2.5],[108,110,2.8],[64,10,2.2],[64,118,2.2],[10,64,2.2],[118,64,2.2]];
      for (const [sx, sy, sr] of sparks) {
        ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();
      }

      ctx.fillStyle = "#cc88ff"; ctx.shadowColor = "#a335ee"; ctx.shadowBlur = 12;
      for (const [sx, sy] of [[28,28],[100,28],[28,100],[100,100]]) {
        ctx.beginPath(); ctx.arc(sx, sy, 4, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }

    case "wind": {
      // Atmospheric wind effect with ethereal swirls and motion streaks
      ctx.globalCompositeOperation = "screen";
      const wg = ctx.createRadialGradient(CX, CY, 15, CX, CY, 65);
      wg.addColorStop(0, "rgba(0,220,200,0.1)");
      wg.addColorStop(0.7, "rgba(100,240,220,0.05)");
      wg.addColorStop(1, "transparent");
      ctx.fillStyle = wg; ctx.fillRect(0, 0, SIZE, SIZE);

      ctx.lineWidth = 2; ctx.strokeStyle = "#00f0d0"; ctx.shadowColor = "#00e5cc"; ctx.shadowBlur = 10;
      const swirls: [number, number, number, number, number][] = [
        [CX, CY, 52, 0.1, 1.4],
        [CX - 8, CY + 6, 38, 0.8, 2.2],
        [CX + 10, CY - 8, 44, 3.5, 5.2],
        [CX, CY, 28, 2.0, 3.8],
        [CX + 4, CY + 4, 60, -0.3, 0.9],
        [CX - 6, CY - 6, 20, 1.2, 2.8],
      ];
      for (const [wx, wy, wr, startA, endA] of swirls) {
        ctx.beginPath();
        ctx.arc(wx, wy, wr, startA, endA);
        ctx.globalAlpha = 0.6;
        ctx.stroke();
      }

      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 1.5;
      const streaks: [number, number, number, number][] = [
        [0, 18, 35, 22], [0, 32, 28, 36], [90, 24, 128, 20],
        [95, 40, 128, 38], [0, 98, 40, 102], [88, 95, 128, 92],
        [0, 112, 30, 108], [100, 108, 128, 112],
        [20, 55, 50, 52], [78, 75, 108, 72],
      ];
      for (const [x1, y1, x2, y2] of streaks) {
        const sg = ctx.createLinearGradient(x1, y1, x2, y2);
        const toRight = x2 > x1;
        sg.addColorStop(0, toRight ? "transparent" : "rgba(100,255,230,0.7)");
        sg.addColorStop(1, toRight ? "rgba(100,255,230,0.7)" : "transparent");
        ctx.strokeStyle = sg;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      }

      ctx.globalAlpha = 0.7;
      ctx.fillStyle = "#00f0d0"; ctx.shadowColor = "#00e5cc"; ctx.shadowBlur = 8;
      const wisps: [number, number, number][] = [
        [15, 15, 0.4], [110, 20, -0.6], [18, 110, 0.8], [112, 105, -0.5],
        [50, 10, 0.2], [80, 118, -0.3], [8, 60, 0.5], [120, 65, -0.4]
      ];
      for (const [wx, wy, angle] of wisps) {
        ctx.save(); ctx.translate(wx, wy); ctx.rotate(angle);
        ctx.beginPath();
        ctx.ellipse(0, 0, 6, 2.5, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.restore();
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
