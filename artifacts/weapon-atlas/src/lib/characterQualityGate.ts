// characterQualityGate.ts — Areloria Character Quality Gate
// Analyzes generated character canvases and produces quality reports.
// All analysis operates on raw pixel data — no rendering side effects.

import {
  CharacterDef, AnimType, ANIM_ROW,
  CHAR_FRAME_W, CHAR_FRAME_H, CHAR_SHEET_COLS, CHAR_SHEET_ROWS,
  renderCharacterFrame, renderCharacterSheet,
} from './characterRenderer';
import { QUALITY_THRESHOLDS, BODY_ZONES } from './characterStyleGuide';
import { isFallbackAnimation } from './characterRig';

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type FindingSeverity = 'fatal' | 'warning' | 'info';

export interface CharacterQualityFinding {
  code: string;
  severity: FindingSeverity;
  message: string;
  frameIndex?: number;
  animType?: AnimType;
}

export interface FrameQualityReport {
  animType: AnimType;
  frameIndex: number;
  visiblePixels: number;
  hasBlackBackground: boolean;
  edgeTouchLeft: number;
  edgeTouchRight: number;
  headZonePixels: number;
  torsoZonePixels: number;
  legZonePixels: number;
  contrastScore: number;
  score: number;
  findings: CharacterQualityFinding[];
}

export interface AnimationQualityReport {
  animType: AnimType;
  isFallback: boolean;
  frameReports: FrameQualityReport[];
  footStabilityScore: number;
  headStabilityScore: number;
  score: number;
  findings: CharacterQualityFinding[];
}

export interface CharacterQualityScore {
  value: number;           // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  label: 'high_quality' | 'acceptable' | 'marginal' | 'poor' | 'unsafe';
}

export interface CharacterQualityReport {
  characterId: string;
  characterName: string;
  score: number;
  qualityScore: CharacterQualityScore;
  safeForExport: boolean;
  fatalErrors: CharacterQualityFinding[];
  warnings: CharacterQualityFinding[];
  infos: CharacterQualityFinding[];
  frameReports: FrameQualityReport[];
  animationReports: AnimationQualityReport[];
  fallbackAnimations: AnimType[];
  buildId: string;
}

export interface PackQualityReport {
  packScore: number;
  safeForExport: boolean;
  totalCharacters: number;
  safeCharacters: number;
  unsafeCharacters: string[];
  characterReports: Record<string, CharacterQualityReport>;
  exportRecommendation: string;
  buildId: string;
}

// ─── PIXEL ANALYSIS HELPERS ───────────────────────────────────────────────────

function getLuminance(r: number, g: number, b: number): number {
  // Integer approximation: (r*3 + g*6 + b*1) / 10
  return ((r * 3 + g * 6 + b) / 10) | 0;
}

function analyzeFrame(canvas: HTMLCanvasElement): {
  pixels: Uint8ClampedArray;
  w: number;
  h: number;
  opaque: number;
  blackBg: boolean;
  edgeLeft: number;
  edgeRight: number;
  minLum: number;
  maxLum: number;
  headPixels: number;
  torsoPixels: number;
  legPixels: number;
  footCenter: number | null;
} {
  const ctx = canvas.getContext('2d')!;
  const idata = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = idata.data;
  const w = canvas.width;
  const h = canvas.height;

  let opaque    = 0;
  let edgeLeft  = 0;
  let edgeRight = 0;
  let minLum    = 255;
  let maxLum    = 0;
  let headPx    = 0;
  let torsoPx   = 0;
  let legPx     = 0;
  let footY     = 0;
  let footCount = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const a = d[i + 3];
      if (a < 64) continue;

      opaque++;
      const lum = getLuminance(d[i], d[i+1], d[i+2]);
      if (lum < minLum) minLum = lum;
      if (lum > maxLum) maxLum = lum;

      if (x === 0)     edgeLeft++;
      if (x === w - 1) edgeRight++;

      if (y >= BODY_ZONES.head.yMin    && y < BODY_ZONES.head.yMax)    headPx++;
      if (y >= BODY_ZONES.torso.yMin   && y < BODY_ZONES.torso.yMax)   torsoPx++;
      if (y >= BODY_ZONES.legs.yMin    && y < BODY_ZONES.legs.yMax)    legPx++;
      if (y >= BODY_ZONES.contact.yMin && y < BODY_ZONES.contact.yMax) {
        footY += y;
        footCount++;
      }
    }
  }

  // Check for black background: top-left corner pixel should be transparent
  const tlA = d[3];
  const blackBg = tlA > 200 && d[0] < 30 && d[1] < 30 && d[2] < 30;

  const contrastOk = (maxLum - minLum) >= QUALITY_THRESHOLDS.minContrastDelta;
  void contrastOk;

  return {
    pixels: d,
    w, h, opaque,
    blackBg,
    edgeLeft, edgeRight,
    minLum, maxLum,
    headPixels: headPx,
    torsoPixels: torsoPx,
    legPixels: legPx,
    footCenter: footCount > 0 ? ((footY / footCount) | 0) : null,
  };
}

function scoreFrame(analysis: ReturnType<typeof analyzeFrame>, animType: AnimType, frameIndex: number): FrameQualityReport {
  const findings: CharacterQualityFinding[] = [];
  let score = 100;

  // 1. Black background check
  if (analysis.blackBg) {
    findings.push({
      code: 'BLACK_BG',
      severity: 'fatal',
      message: 'Black background detected — canvas not transparent',
      frameIndex, animType,
    });
    score -= 40;
  }

  // 2. Visible pixel count
  if (analysis.opaque < QUALITY_THRESHOLDS.minVisiblePixels) {
    findings.push({
      code: 'TOO_FEW_PIXELS',
      severity: 'warning',
      message: `Only ${analysis.opaque} opaque pixels (min: ${QUALITY_THRESHOLDS.minVisiblePixels})`,
      frameIndex, animType,
    });
    score -= 20;
  }

  // 3. Edge touch
  const maxEdge = QUALITY_THRESHOLDS.maxEdgePixels;
  if (analysis.edgeLeft > maxEdge) {
    findings.push({
      code: 'EDGE_TOUCH_LEFT',
      severity: 'warning',
      message: `${analysis.edgeLeft} pixels on left edge (max: ${maxEdge})`,
      frameIndex, animType,
    });
    score -= 8;
  }
  if (analysis.edgeRight > maxEdge) {
    findings.push({
      code: 'EDGE_TOUCH_RIGHT',
      severity: 'warning',
      message: `${analysis.edgeRight} pixels on right edge (max: ${maxEdge})`,
      frameIndex, animType,
    });
    score -= 8;
  }

  // 4. Zone check
  if (analysis.headPixels < 20) {
    findings.push({ code: 'NO_HEAD_PIXELS', severity: 'warning', message: 'Head zone has too few pixels', frameIndex, animType });
    score -= 10;
  }
  if (analysis.torsoPixels < 30) {
    findings.push({ code: 'NO_TORSO_PIXELS', severity: 'warning', message: 'Torso zone has too few pixels', frameIndex, animType });
    score -= 10;
  }
  if (analysis.legPixels < 20 && animType !== 'death') {
    findings.push({ code: 'NO_LEG_PIXELS', severity: 'warning', message: 'Leg zone has too few pixels', frameIndex, animType });
    score -= 8;
  }

  // 5. Contrast check
  const contrastDelta = analysis.maxLum - analysis.minLum;
  if (contrastDelta < QUALITY_THRESHOLDS.minContrastDelta) {
    findings.push({
      code: 'LOW_CONTRAST',
      severity: 'warning',
      message: `Contrast delta ${contrastDelta} below threshold ${QUALITY_THRESHOLDS.minContrastDelta}`,
      frameIndex, animType,
    });
    score -= 12;
  }

  // Frame size
  if (analysis.w !== CHAR_FRAME_W || analysis.h !== CHAR_FRAME_H) {
    findings.push({
      code: 'WRONG_FRAME_SIZE',
      severity: 'fatal',
      message: `Frame size ${analysis.w}×${analysis.h}, expected ${CHAR_FRAME_W}×${CHAR_FRAME_H}`,
      frameIndex, animType,
    });
    score -= 30;
  }

  score = Math.max(0, score);

  return {
    animType, frameIndex,
    visiblePixels: analysis.opaque,
    hasBlackBackground: analysis.blackBg,
    edgeTouchLeft: analysis.edgeLeft,
    edgeTouchRight: analysis.edgeRight,
    headZonePixels: analysis.headPixels,
    torsoZonePixels: analysis.torsoPixels,
    legZonePixels: analysis.legPixels,
    contrastScore: analysis.maxLum - analysis.minLum,
    score,
    findings,
  };
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

export function analyzeCharacterFrame(
  char: CharacterDef,
  anim: AnimType,
  frameIndex: number
): FrameQualityReport {
  const canvas   = renderCharacterFrame(char, anim, frameIndex);
  const analysis = analyzeFrame(canvas);
  return scoreFrame(analysis, anim, frameIndex);
}

export function analyzeCharacterSheet(char: CharacterDef): {
  animReports: AnimationQualityReport[];
  allFrameReports: FrameQualityReport[];
  sheetScore: number;
} {
  const anims = Object.keys(ANIM_ROW) as AnimType[];
  const animReports: AnimationQualityReport[] = [];
  const allFrameReports: FrameQualityReport[] = [];

  for (const anim of anims) {
    const frameReps: FrameQualityReport[] = [];
    const footYs: number[] = [];
    const headYs: number[] = [];

    for (let fi = 0; fi < CHAR_SHEET_COLS; fi++) {
      const canvas   = renderCharacterFrame(char, anim, fi);
      const analysis = analyzeFrame(canvas);
      const rep      = scoreFrame(analysis, anim, fi);
      frameReps.push(rep);
      allFrameReports.push(rep);
      if (analysis.footCenter !== null) footYs.push(analysis.footCenter);
      headYs.push(analysis.headPixels > 0 ? BODY_ZONES.head.yMin + 8 : 0);
    }

    // Stability scores
    const footVar = footYs.length > 1
      ? Math.max(...footYs) - Math.min(...footYs)
      : 0;
    const headVar = headYs.length > 1
      ? Math.max(...headYs) - Math.min(...headYs)
      : 0;

    const footScore = Math.max(0, 100 - footVar * 12);
    const headScore = Math.max(0, 100 - headVar * 8);

    const avgFrameScore = frameReps.reduce((s, r) => s + r.score, 0) / frameReps.length;
    const animScore     = Math.round((avgFrameScore + footScore + headScore) / 3);

    const animFindings: CharacterQualityFinding[] = [];
    if (footVar > QUALITY_THRESHOLDS.footLockTolerance && anim === 'idle') {
      animFindings.push({
        code: 'IDLE_FOOT_SLIDE',
        severity: 'warning',
        message: `Idle foot position varies by ${footVar}px (tolerance: ${QUALITY_THRESHOLDS.footLockTolerance})`,
        animType: anim,
      });
    }

    animReports.push({
      animType: anim,
      isFallback: isFallbackAnimation(anim),
      frameReports: frameReps,
      footStabilityScore: footScore,
      headStabilityScore: headScore,
      score: animScore,
      findings: animFindings,
    });
  }

  const sheetScore = Math.round(
    animReports.reduce((s, r) => s + r.score, 0) / animReports.length
  );

  return { animReports, allFrameReports, sheetScore };
}

function determineBuildId(char: CharacterDef): string {
  // Deterministic build id from character properties
  const str = `${char.id}|${char.class}|${char.race}|${char.armorTier}|${char.rarity}|${char.accentColor}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

function gradeScore(score: number): CharacterQualityScore {
  if (score >= 90) return { value: score, grade: 'A', label: 'high_quality' };
  if (score >= 80) return { value: score, grade: 'B', label: 'acceptable' };
  if (score >= 70) return { value: score, grade: 'C', label: 'marginal' };
  if (score >= 50) return { value: score, grade: 'D', label: 'poor' };
  return { value: score, grade: 'F', label: 'unsafe' };
}

export function analyzeCharacterPack(
  characters: CharacterDef[]
): PackQualityReport {
  const reports: Record<string, CharacterQualityReport> = {};
  let totalScore = 0;
  const unsafeChars: string[] = [];

  for (const char of characters) {
    const { animReports, allFrameReports, sheetScore } = analyzeCharacterSheet(char);
    const fallbacks = animReports.filter(a => a.isFallback).map(a => a.animType);
    const fatalErrors = allFrameReports.flatMap(f => f.findings.filter(x => x.severity === 'fatal'));
    const warnings    = allFrameReports.flatMap(f => f.findings.filter(x => x.severity === 'warning'));
    const infos       = allFrameReports.flatMap(f => f.findings.filter(x => x.severity === 'info'));

    const safeForExport = fatalErrors.length === 0 && sheetScore >= QUALITY_THRESHOLDS.safeExportScore;

    const report: CharacterQualityReport = {
      characterId:   char.id,
      characterName: char.name,
      score:         sheetScore,
      qualityScore:  gradeScore(sheetScore),
      safeForExport,
      fatalErrors,
      warnings,
      infos,
      frameReports:     allFrameReports,
      animationReports: animReports,
      fallbackAnimations: fallbacks,
      buildId: determineBuildId(char),
    };

    reports[char.id] = report;
    totalScore += sheetScore;
    if (!safeForExport) unsafeChars.push(char.id);
  }

  const packScore = characters.length > 0
    ? Math.round(totalScore / characters.length)
    : 0;

  const safeCount = characters.length - unsafeChars.length;
  let recommendation: string;
  if (unsafeChars.length === 0) {
    recommendation = 'All characters passed quality checks. Safe for WASD import.';
  } else if (unsafeChars.length <= 3) {
    recommendation = `${unsafeChars.length} character(s) failed quality checks. Review before WASD import.`;
  } else {
    recommendation = `${unsafeChars.length} characters failed. Export with caution.`;
  }

  // Deterministic pack build id
  let packHash = 0x811c9dc5;
  for (const id of characters.map(c => c.id)) {
    for (let i = 0; i < id.length; i++) {
      packHash ^= id.charCodeAt(i);
      packHash = (packHash * 0x01000193) >>> 0;
    }
  }

  return {
    packScore,
    safeForExport: unsafeChars.length === 0,
    totalCharacters: characters.length,
    safeCharacters: safeCount,
    unsafeCharacters: unsafeChars,
    characterReports: reports,
    exportRecommendation: recommendation,
    buildId: packHash.toString(16).padStart(8, '0'),
  };
}
