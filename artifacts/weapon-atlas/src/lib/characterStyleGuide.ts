// characterStyleGuide.ts — Areloria Character Style Guide
// Strict constants and utilities for the Character Forge
// All math integer-based where possible. No floating drift.

export const FRAME_W = 48;
export const FRAME_H = 64;
export const SHEET_COLS = 4;
export const SHEET_ROWS = 9; // 0-5 original + 6=cast 7=hurt 8=death

// Body zones (pixel Y ranges, relative to frame top, race-neutral)
export const BODY_ZONES = {
  head:    { yMin: 2,  yMax: 23 },
  torso:   { yMin: 22, yMax: 44 },
  arms:    { yMin: 24, yMax: 50 },
  legs:    { yMin: 43, yMax: 62 },
  contact: { yMin: 58, yMax: 64 },
} as const;

// Quality thresholds
export const QUALITY_THRESHOLDS = {
  minVisiblePixels:  180,
  maxEdgePixels:      16,
  minContrastDelta:   25,
  footLockTolerance:   5,
  safeExportScore:    70,
  acceptableScore:    80,
  highQualityScore:   90,
} as const;

export const ARELORIA_CHARACTER_STYLE = {
  frameW: FRAME_W,
  frameH: FRAME_H,
  sheetCols: SHEET_COLS,
  sheetRows: SHEET_ROWS,
  transparentBg: true,
  imageSmoothingEnabled: false,
  lightSource: 'upper-left' as const,
  bodyZones: BODY_ZONES,
  quality: QUALITY_THRESHOLDS,
  paletteRoles: [
    'skin', 'hair', 'armorBase', 'armorShadow', 'armorHighlight',
    'accent', 'weaponTint', 'outline',
  ],
} as const;

// ─── COLOR UTILITIES ──────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', '').padEnd(6, '0'), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  return '#' + [r, g, b].map(v => clamp(v).toString(16).padStart(2, '0')).join('');
}

export function getLightingShade(baseColor: string, level: number): string {
  // level: -2=deep shadow, -1=shadow, 0=base, 1=highlight, 2=bright
  const [r, g, b] = hexToRgb(baseColor);
  const step = 26 * level;
  return rgbToHex(r + step, g + step, b + step);
}

export function normalizeCharacterColor(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  // Clamp away from pure black or pure white
  return rgbToHex(
    Math.max(12, Math.min(243, r)),
    Math.max(12, Math.min(243, g)),
    Math.max(12, Math.min(243, b)),
  );
}

export function getRarityAccent(rarity: string): { color: string; intensity: number } {
  const map: Record<string, { color: string; intensity: number }> = {
    common:    { color: '#9d9d9d', intensity: 0 },
    uncommon:  { color: '#1eff00', intensity: 1 },
    rare:      { color: '#0070dd', intensity: 2 },
    epic:      { color: '#a335ee', intensity: 3 },
    legendary: { color: '#ff8000', intensity: 4 },
    mythic:    { color: '#e6cc80', intensity: 5 },
  };
  return map[rarity] ?? map['common'];
}

export type ClassPalette = {
  armorBase:      string;
  armorShadow:    string;
  armorHighlight: string;
  armorBelt:      string;
  accent:         string;
  outline:        string;
};

export function getClassPalette(armorColor: string, accentColor: string): ClassPalette {
  return {
    armorBase:      armorColor,
    armorShadow:    getLightingShade(armorColor, -1),
    armorHighlight: getLightingShade(armorColor, 1),
    armorBelt:      getLightingShade(armorColor, -2),
    accent:         accentColor,
    outline:        '#1a1820',
  };
}

export function assertTransparentCanvas(ctx: CanvasRenderingContext2D, _canvas: HTMLCanvasElement): void {
  ctx.imageSmoothingEnabled = false;
  // Caller is responsible for clearRect before drawing. This enforces settings.
}

// ─── DETERMINISTIC HASH (used for per-character variation) ───────────────────

export function charHash(id: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h;
}

export function charVariant(id: string, range: number): number {
  return charHash(id) % range;
}
