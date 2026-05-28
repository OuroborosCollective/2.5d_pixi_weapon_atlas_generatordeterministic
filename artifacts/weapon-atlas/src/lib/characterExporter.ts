// characterExporter.ts — Hardened ZIP export for Areloria Character Forge
// Exports: atlas.png, manifest.json, characters.json, metadata.jsonl,
//          quality-report.json, ATTRIBUTION.md, LICENSE, README.md,
//          characters/{class}/{character_id}.png

import JSZip from "jszip";
import {
  ALL_CHARACTERS, CharacterDef, CHAR_FRAME_W, CHAR_FRAME_H,
  CHAR_SHEET_COLS, CHAR_SHEET_ROWS, CHAR_RARITY_WEIGHTS, CHAR_RARITY_COLORS,
  AnimType, ANIM_ROW, packCharacterAtlas, renderCharacterSheet,
} from "./characterRenderer";
import { PACK_META } from "./manifestGenerator";
import { analyzeCharacterPack, PackQualityReport } from "./characterQualityGate";
import { isFallbackAnimation, FALLBACK_ANIMATIONS } from "./characterRig";

const ANIMS: AnimType[] = [
  'walk_south', 'walk_west', 'walk_east', 'walk_north',
  'idle', 'attack', 'cast', 'hurt', 'death',
];

// Deterministic build id from character ids + timestamp date (day precision)
function buildId(chars: CharacterDef[]): string {
  const ids = chars.map(c => c.id).join('|');
  let h = 0x811c9dc5;
  for (let i = 0; i < ids.length; i++) {
    h ^= ids.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

// ─── PIXIJS-COMPATIBLE ATLAS MANIFEST ────────────────────────────────────────

function generateCharManifest(
  positions: Record<string, { x: number; y: number; sheetW: number; sheetH: number }>,
  atlasW: number,
  atlasH: number,
  qualityReport: PackQualityReport,
) {
  const frames: Record<string, unknown> = {};
  const animations: Record<string, string[]> = {};
  const anchors: Record<string, { pivot: { x: number; y: number } }> = {};
  const fallbackInfo: Record<string, string[]> = {};

  for (const char of ALL_CHARACTERS) {
    const pos = positions[char.id];
    if (!pos) continue;

    const charFallbacks: string[] = [];
    for (const anim of ANIMS) {
      if (isFallbackAnimation(anim)) charFallbacks.push(anim);
    }
    if (charFallbacks.length > 0) fallbackInfo[char.id] = charFallbacks;

    // Pivot at foot center (bottom of frame)
    anchors[char.id] = { pivot: { x: 0.5, y: 58 / CHAR_FRAME_H } };

    for (const anim of ANIMS) {
      const row     = ANIM_ROW[anim];
      const animKey = `${char.id}__${anim}`;
      const frameKeys: string[] = [];

      for (let col = 0; col < CHAR_SHEET_COLS; col++) {
        const key = `${char.id}/${anim}/${col}`;
        const fx  = pos.x + col * CHAR_FRAME_W;
        const fy  = pos.y + row * CHAR_FRAME_H;
        frames[key] = {
          frame:            { x: fx, y: fy, w: CHAR_FRAME_W, h: CHAR_FRAME_H },
          rotated:          false,
          trimmed:          false,
          spriteSourceSize: { x: 0, y: 0, w: CHAR_FRAME_W, h: CHAR_FRAME_H },
          sourceSize:       { w: CHAR_FRAME_W, h: CHAR_FRAME_H },
          anchor:           { x: 0.5, y: 58 / CHAR_FRAME_H },
          isFallback:       isFallbackAnimation(anim),
        };
        frameKeys.push(key);
      }
      animations[animKey] = frameKeys;
    }
  }

  return {
    frames,
    animations,
    meta: {
      app:         "Areloria Character Forge",
      version:     "3.0.0",
      image:       "atlas.png",
      format:      "RGBA8888",
      size:        { w: atlasW, h: atlasH },
      scale:       "1",
      frame_width:  CHAR_FRAME_W,
      frame_height: CHAR_FRAME_H,
      sheet_cols:   CHAR_SHEET_COLS,
      sheet_rows:   CHAR_SHEET_ROWS,
      animation_rows: Object.fromEntries(ANIMS.map((a, i) => [a, i])),
      directions:  ['south', 'west', 'east', 'north'],
      anchors,
      fallback_animations: FALLBACK_ANIMATIONS,
      fallback_info:       fallbackInfo,
      pack_quality_score:  qualityReport.packScore,
      pack_safe_for_export:qualityReport.safeForExport,
      build_id:            buildId(ALL_CHARACTERS),
      creator:             PACK_META.creator,
      license:             PACK_META.license,
      license_url:         PACK_META.license_url,
      repository:          PACK_META.repository,
    },
  };
}

// ─── CHARACTERS.JSON (full metadata per character) ───────────────────────────

function generateCharPartsManifest(qualityReport: PackQualityReport) {
  const parts: Record<string, unknown> = {};
  for (const char of ALL_CHARACTERS) {
    const animData: Record<string, {
      frames: number; row: number; frame_width: number; frame_height: number; is_fallback: boolean;
    }> = {};
    for (const anim of ANIMS) {
      animData[anim] = {
        frames:       CHAR_SHEET_COLS,
        row:          ANIM_ROW[anim],
        frame_width:  CHAR_FRAME_W,
        frame_height: CHAR_FRAME_H,
        is_fallback:  isFallbackAnimation(anim),
      };
    }
    const qr = qualityReport.characterReports[char.id];
    parts[char.id] = {
      name:             char.name,
      class:            char.class,
      race:             char.race,
      armor_tier:       char.armorTier,
      rarity:           char.rarity,
      rarity_weight:    CHAR_RARITY_WEIGHTS[char.rarity],
      rarity_color:     CHAR_RARITY_COLORS[char.rarity],
      tags:             char.tags,
      sheet: {
        columns:      CHAR_SHEET_COLS,
        rows:         CHAR_SHEET_ROWS,
        frame_width:  CHAR_FRAME_W,
        frame_height: CHAR_FRAME_H,
        sheet_width:  CHAR_SHEET_COLS * CHAR_FRAME_W,
        sheet_height: CHAR_SHEET_ROWS * CHAR_FRAME_H,
        file:         `characters/${char.class}/${char.id}.png`,
      },
      animations:           animData,
      fallback_animations:  FALLBACK_ANIMATIONS,
      quality_score:        qr?.score ?? 0,
      safe_for_export:      qr?.safeForExport ?? false,
      build_id:             qr?.buildId ?? '',
      creator:              PACK_META.creator,
      repository:           PACK_META.repository,
      license:              PACK_META.license,
      license_url:          PACK_META.license_url,
      attribution_required: true,
      share_alike:          true,
    };
  }
  return {
    version:          "3.0.0",
    build_id:         buildId(ALL_CHARACTERS),
    total_characters: ALL_CHARACTERS.length,
    frame_size:       { w: CHAR_FRAME_W, h: CHAR_FRAME_H },
    sheet_size:       { cols: CHAR_SHEET_COLS, rows: CHAR_SHEET_ROWS },
    animations:       ANIMS,
    fallback_animations: FALLBACK_ANIMATIONS,
    pack_quality_score:  qualityReport.packScore,
    characters:          parts,
  };
}

// ─── METADATA.JSONL ───────────────────────────────────────────────────────────

function generateCharMetadataJsonl(qualityReport: PackQualityReport): string {
  return ALL_CHARACTERS.map(char => {
    const qr = qualityReport.characterReports[char.id];
    return JSON.stringify({
      id:                  char.id,
      name:                char.name,
      class:               char.class,
      race:                char.race,
      armor_tier:          char.armorTier,
      rarity:              char.rarity,
      rarity_weight:       CHAR_RARITY_WEIGHTS[char.rarity],
      tags:                char.tags,
      creator:             PACK_META.creator,
      repository:          PACK_META.repository,
      license:             PACK_META.license,
      license_url:         PACK_META.license_url,
      attribution_required:true,
      share_alike:         true,
      commercial_use:      true,
      file_path:           `characters/${char.class}/${char.id}.png`,
      format:              "PNG",
      frame_width:         CHAR_FRAME_W,
      frame_height:        CHAR_FRAME_H,
      sheet_cols:          CHAR_SHEET_COLS,
      sheet_rows:          CHAR_SHEET_ROWS,
      animations:          ANIMS,
      fallback_animations: FALLBACK_ANIMATIONS,
      quality_score:       qr?.score ?? 0,
      safe_for_export:     qr?.safeForExport ?? false,
      build_id:            qr?.buildId ?? '',
    });
  }).join("\n");
}

// ─── QUALITY-REPORT.JSON ─────────────────────────────────────────────────────

function generateQualityReportJson(qr: PackQualityReport): string {
  return JSON.stringify({
    pack_score:            qr.packScore,
    safe_for_export:       qr.safeForExport,
    total_characters:      qr.totalCharacters,
    safe_characters:       qr.safeCharacters,
    unsafe_characters:     qr.unsafeCharacters,
    export_recommendation: qr.exportRecommendation,
    build_id:              qr.buildId,
    per_character: Object.fromEntries(
      Object.entries(qr.characterReports).map(([id, rep]) => [
        id,
        {
          score:              rep.score,
          grade:              rep.qualityScore.grade,
          label:              rep.qualityScore.label,
          safe_for_export:    rep.safeForExport,
          fatal_errors:       rep.fatalErrors.length,
          warnings:           rep.warnings.length,
          fallback_animations:rep.fallbackAnimations,
          build_id:           rep.buildId,
          frame_issues: rep.frameReports
            .filter(f => f.findings.length > 0)
            .map(f => ({
              anim:      f.animType,
              frame:     f.frameIndex,
              score:     f.score,
              issues:    f.findings.map(fi => ({ code: fi.code, severity: fi.severity, msg: fi.message })),
            })),
        },
      ])
    ),
  }, null, 2);
}

// ─── ATTRIBUTION.md ───────────────────────────────────────────────────────────

function generateCharAttribution(qr: PackQualityReport): string {
  const now = new Date().toISOString().split("T")[0];
  const byClass: Record<string, CharacterDef[]> = {};
  for (const c of ALL_CHARACTERS) {
    if (!byClass[c.class]) byClass[c.class] = [];
    byClass[c.class].push(c);
  }

  const classBlocks = Object.entries(byClass).map(([cls, chars]) => {
    const title = cls[0].toUpperCase() + cls.slice(1) + 's';
    const rows = chars.map(c => {
      const rep = qr.characterReports[c.id];
      const score = rep ? `${rep.score}/100 (${rep.qualityScore.grade})` : 'N/A';
      return `| \`${c.id}\` | ${c.name} | ${c.race} | ${c.armorTier} | ${c.rarity} | ${score} |`;
    }).join('\n');
    return `### ${title} (${chars.length} characters)\n\n| ID | Name | Race | Armor | Rarity | Quality |\n|----|------|------|-------|--------|--------|\n${rows}`;
  }).join('\n\n');

  return `# ATTRIBUTION — Areloria Character Forge

> This file follows **OpenGameArt.org attribution guidelines**.
> All character sprites are original procedural artwork generated by code.

---

## Pack Information

| Field | Value |
|-------|-------|
| **Title** | Areloria Character Forge — Character Atlas |
| **Version** | 3.0.0 |
| **Creator** | ${PACK_META.creator} |
| **Repository** | ${PACK_META.repository} |
| **License** | ${PACK_META.license} |
| **License URL** | ${PACK_META.license_url} |
| **Generated** | ${now} |
| **Build ID** | ${buildId(ALL_CHARACTERS)} |
| **Total Characters** | ${ALL_CHARACTERS.length} |
| **Frame Size** | ${CHAR_FRAME_W}×${CHAR_FRAME_H} px |
| **Sheet Size** | ${CHAR_SHEET_COLS * CHAR_FRAME_W}×${CHAR_SHEET_ROWS * CHAR_FRAME_H} px (${CHAR_SHEET_COLS} cols × ${CHAR_SHEET_ROWS} rows) |
| **Animations** | ${ANIMS.join(', ')} |
| **Fallback Animations** | ${FALLBACK_ANIMATIONS.join(', ')} |
| **Pack Quality Score** | ${qr.packScore}/100 |
| **Safe for Export** | ${qr.safeForExport ? 'Yes' : 'No — see quality-report.json'} |
| **Attribution Required** | Yes |
| **Share-Alike** | Yes |

---

## How to Attribute

> **"Areloria Character Forge — Character Atlas"** by **${PACK_META.creator}**
> Source: ${PACK_META.repository}
> License: GPL-3.0 — ${PACK_META.license_url}

---

## PixiJS Integration

\`\`\`typescript
import { Assets, AnimatedSprite } from "pixi.js";

const sheet = await Assets.load("character-atlas/manifest.json");
const warrior = new AnimatedSprite(
  sheet.animations["char_warrior_human_iron_uncommon_01__walk_south"]
);
warrior.animationSpeed = 0.12;
warrior.play();
\`\`\`

Animation key format: \`{character_id}__{animation_name}\`
Available animations: \`${ANIMS.join('`, `')}\`
Fallback animations (use stub poses): \`${FALLBACK_ANIMATIONS.join('`, `')}\`

---

## Quality Summary

Pack score: **${qr.packScore}/100** — ${qr.exportRecommendation}

${qr.unsafeCharacters.length > 0
  ? `⚠️ Unsafe characters: \`${qr.unsafeCharacters.join('`, `')}\``
  : '✅ All characters passed quality checks.'}

---

## Character Inventory

${classBlocks}

---

*Generated by Areloria Character Forge — ${PACK_META.repository}*
`;
}

// ─── README ───────────────────────────────────────────────────────────────────

const CHAR_README = `# Areloria Character Forge — PixiJS Ready

Procedurally generated 2.5D MMORPG character sprites for use with PixiJS,
Phaser, or any sprite-sheet-compatible game engine. Designed for WASD/Areloria
asset pipelines.

## Contents

\`\`\`
character-atlas/
  ATTRIBUTION.md        ← OpenGameArt-style asset credits + quality summary
  LICENSE               ← GPL-3.0
  README.md             ← This file
  atlas.png             ← Combined atlas (all characters packed)
  manifest.json         ← PixiJS Spritesheet manifest (frame coords + animations + anchors)
  characters.json       ← Full metadata per character (class, race, quality score)
  metadata.jsonl        ← One JSON record per character (dataset format)
  quality-report.json   ← Per-character and per-frame quality analysis
  characters/
    warrior/            ← Individual 192×576 sprite sheets
    mage/
    rogue/
    ranger/
    paladin/
    berserker/
\`\`\`

## Sprite Sheet Layout (per character: 192×576 px)

| Row | Animation    | Frames | Notes       |
|-----|--------------|--------|-------------|
|  0  | walk_south   |   4    | Full        |
|  1  | walk_west    |   4    | Full        |
|  2  | walk_east    |   4    | Full        |
|  3  | walk_north   |   4    | Full        |
|  4  | idle         |   4    | Full        |
|  5  | attack       |   4    | Full        |
|  6  | cast         |   4    | Fallback    |
|  7  | hurt         |   4    | Fallback    |
|  8  | death        |   4    | Fallback    |

Frame size: 48×64 px — Transparent PNG — No anti-aliasing

## PixiJS Usage

\`\`\`typescript
import { Assets, AnimatedSprite } from "pixi.js";

const sheet = await Assets.load("character-atlas/manifest.json");

const char = new AnimatedSprite(
  sheet.animations["char_warrior_human_iron_uncommon_01__walk_south"]
);
char.animationSpeed = 0.12;
char.loop = true;
char.play();
app.stage.addChild(char);

// Switch to attack
char.textures = sheet.animations["char_warrior_human_iron_uncommon_01__attack"];
char.play();
\`\`\`

## License

GPL-3.0 — see LICENSE file.
Creator: ${PACK_META.creator}
Repository: ${PACK_META.repository}
`;

// ─── GPL-3 LICENSE ────────────────────────────────────────────────────────────

const GPL3 = `GNU GENERAL PUBLIC LICENSE
Version 3, 29 June 2007

Areloria Character Forge — Character Atlas
Copyright (C) ${new Date().getFullYear()} OuroborosCollective
Repository: ${PACK_META.repository}

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Full license text: https://www.gnu.org/licenses/gpl-3.0.en.html
`;

// ─── MAIN EXPORT FUNCTION ─────────────────────────────────────────────────────

export async function exportCharacterZip(
  onProgress?: (step: string) => void
): Promise<{ qualityReport: PackQualityReport }> {
  onProgress?.('Running quality analysis…');
  const qualityReport = analyzeCharacterPack(ALL_CHARACTERS);

  onProgress?.('Rendering character atlas…');
  const { atlasCanvas, positions } = packCharacterAtlas();

  onProgress?.('Generating manifests…');
  const manifest    = generateCharManifest(positions, atlasCanvas.width, atlasCanvas.height, qualityReport);
  const charsMeta   = generateCharPartsManifest(qualityReport);
  const metaJsonl   = generateCharMetadataJsonl(qualityReport);
  const attribution = generateCharAttribution(qualityReport);
  const qualityJson = generateQualityReportJson(qualityReport);

  onProgress?.('Building ZIP…');
  const zip  = new JSZip();
  const root = zip.folder("character-atlas")!;

  root.file("ATTRIBUTION.md",     attribution);
  root.file("LICENSE",            GPL3);
  root.file("README.md",          CHAR_README);
  root.file("manifest.json",      JSON.stringify(manifest, null, 2));
  root.file("characters.json",    JSON.stringify(charsMeta, null, 2));
  root.file("metadata.jsonl",     metaJsonl);
  root.file("quality-report.json",qualityJson);

  const atlasBlob = await new Promise<Blob | null>(res => atlasCanvas.toBlob(res, "image/png"));
  if (atlasBlob) root.file("atlas.png", atlasBlob);

  onProgress?.('Rendering individual sheets…');
  const promises: Promise<void>[] = ALL_CHARACTERS.map(async (char) => {
    const folder = root.folder(`characters/${char.class}`)!;
    const sheet  = renderCharacterSheet(char);
    const blob   = await new Promise<Blob | null>(res => sheet.toBlob(res, "image/png"));
    if (blob) folder.file(`${char.id}.png`, blob);
  });

  await Promise.all(promises);

  onProgress?.('Compressing…');
  const content = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  const url = URL.createObjectURL(content);
  const a   = document.createElement("a");
  a.href     = url;
  a.download = "character-atlas.zip";
  a.click();
  URL.revokeObjectURL(url);

  return { qualityReport };
}
