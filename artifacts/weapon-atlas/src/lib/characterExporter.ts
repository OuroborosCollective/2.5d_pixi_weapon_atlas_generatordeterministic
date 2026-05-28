// characterExporter.ts — ZIP export for character sprite atlases (PixiJS-ready)
import JSZip from "jszip";
import {
  ALL_CHARACTERS, CharacterDef, CHAR_FRAME_W, CHAR_FRAME_H,
  CHAR_SHEET_COLS, CHAR_SHEET_ROWS, CHAR_RARITY_WEIGHTS, CHAR_RARITY_COLORS,
  AnimType, ANIM_ROW, packCharacterAtlas, renderCharacterSheet,
} from "./characterRenderer";
import { PACK_META } from "./manifestGenerator";

const ANIMS: AnimType[] = ['walk_south', 'walk_west', 'walk_east', 'walk_north', 'idle', 'attack'];

// ─── PIXIJS-COMPATIBLE ATLAS MANIFEST ────────────────────────────────────────

function generateCharManifest(positions: Record<string, { x: number; y: number; sheetW: number; sheetH: number }>, atlasW: number, atlasH: number) {
  const frames: Record<string, unknown> = {};
  const animations: Record<string, string[]> = {};

  for (const char of ALL_CHARACTERS) {
    const pos = positions[char.id];
    if (!pos) continue;

    for (const anim of ANIMS) {
      const row = ANIM_ROW[anim];
      const animKey = `${char.id}__${anim}`;
      const frameKeys: string[] = [];

      for (let col = 0; col < CHAR_SHEET_COLS; col++) {
        const key = `${char.id}/${anim}/${col}`;
        const fx = pos.x + col * CHAR_FRAME_W;
        const fy = pos.y + row * CHAR_FRAME_H;
        frames[key] = {
          frame:           { x: fx, y: fy, w: CHAR_FRAME_W, h: CHAR_FRAME_H },
          rotated:         false,
          trimmed:         false,
          spriteSourceSize:{ x: 0, y: 0, w: CHAR_FRAME_W, h: CHAR_FRAME_H },
          sourceSize:      { w: CHAR_FRAME_W, h: CHAR_FRAME_H },
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
      app:      "Weapon Atlas Generator",
      version:  "2.0.0",
      image:    "atlas.png",
      format:   "RGBA8888",
      size:     { w: atlasW, h: atlasH },
      scale:    "1",
      creator:  PACK_META.creator,
      license:  PACK_META.license,
      license_url: PACK_META.license_url,
      repository:  PACK_META.repository,
    },
  };
}

// ─── FRAME-LEVEL MANIFEST ─────────────────────────────────────────────────────

function generateCharPartsManifest() {
  const parts: Record<string, unknown> = {};
  for (const char of ALL_CHARACTERS) {
    const animData: Record<string, { frames: number; row: number; frame_width: number; frame_height: number }> = {};
    for (const anim of ANIMS) {
      animData[anim] = {
        frames: CHAR_SHEET_COLS,
        row: ANIM_ROW[anim],
        frame_width: CHAR_FRAME_W,
        frame_height: CHAR_FRAME_H,
      };
    }
    parts[char.id] = {
      name:         char.name,
      class:        char.class,
      race:         char.race,
      armor_tier:   char.armorTier,
      rarity:       char.rarity,
      rarity_weight:CHAR_RARITY_WEIGHTS[char.rarity],
      rarity_color: CHAR_RARITY_COLORS[char.rarity],
      tags:         char.tags,
      sheet: {
        columns:      CHAR_SHEET_COLS,
        rows:         CHAR_SHEET_ROWS,
        frame_width:  CHAR_FRAME_W,
        frame_height: CHAR_FRAME_H,
        sheet_width:  CHAR_SHEET_COLS * CHAR_FRAME_W,
        sheet_height: CHAR_SHEET_ROWS * CHAR_FRAME_H,
        file:         `characters/${char.class}/${char.id}.png`,
      },
      animations: animData,
      creator:           PACK_META.creator,
      repository:        PACK_META.repository,
      license:           PACK_META.license,
      license_url:       PACK_META.license_url,
      attribution_required: true,
      share_alike:       true,
    };
  }
  return {
    version:     "2.0.0",
    generated:   new Date().toISOString(),
    total_characters: ALL_CHARACTERS.length,
    frame_size:  { w: CHAR_FRAME_W, h: CHAR_FRAME_H },
    sheet_size:  { cols: CHAR_SHEET_COLS, rows: CHAR_SHEET_ROWS },
    animations:  ANIMS,
    characters:  parts,
  };
}

// ─── METADATA.JSONL ───────────────────────────────────────────────────────────

function generateCharMetadataJsonl(): string {
  return ALL_CHARACTERS.map(char => JSON.stringify({
    id:          char.id,
    name:        char.name,
    class:       char.class,
    race:        char.race,
    armor_tier:  char.armorTier,
    rarity:      char.rarity,
    rarity_weight: CHAR_RARITY_WEIGHTS[char.rarity],
    tags:        char.tags,
    creator:     PACK_META.creator,
    repository:  PACK_META.repository,
    license:     PACK_META.license,
    license_url: PACK_META.license_url,
    attribution_required: true,
    share_alike: true,
    commercial_use: true,
    file_path:   `characters/${char.class}/${char.id}.png`,
    format:      "PNG",
    frame_width: CHAR_FRAME_W,
    frame_height:CHAR_FRAME_H,
    sheet_cols:  CHAR_SHEET_COLS,
    sheet_rows:  CHAR_SHEET_ROWS,
    animations:  ANIMS,
  })).join("\n");
}

// ─── ATTRIBUTION.md ───────────────────────────────────────────────────────────

function generateCharAttribution(): string {
  const now = new Date().toISOString().split("T")[0];
  const byClass: Record<string, CharacterDef[]> = {};
  for (const c of ALL_CHARACTERS) {
    if (!byClass[c.class]) byClass[c.class] = [];
    byClass[c.class].push(c);
  }

  const classBlocks = Object.entries(byClass).map(([cls, chars]) => {
    const title = cls[0].toUpperCase() + cls.slice(1) + 's';
    const rows = chars.map(c =>
      `| \`${c.id}\` | ${c.name} | ${c.race} | ${c.armorTier} | ${c.rarity} | PNG | ${CHAR_SHEET_COLS * CHAR_FRAME_W}×${CHAR_SHEET_ROWS * CHAR_FRAME_H} |`
    ).join('\n');
    return `### ${title} (${chars.length} characters)\n\n| ID | Name | Race | Armor | Rarity | Format | Sheet Size |\n|----|------|------|-------|--------|--------|------------|\n${rows}`;
  }).join('\n\n');

  return `# ATTRIBUTION — Character Sprite Atlas

> This file follows **OpenGameArt.org attribution guidelines**.
> All character sprites are original procedural artwork generated by code.

---

## Pack Information

| Field | Value |
|-------|-------|
| **Title** | ${PACK_META.title} — Character Atlas |
| **Version** | ${PACK_META.version} |
| **Creator** | ${PACK_META.creator} |
| **Repository** | ${PACK_META.repository} |
| **License** | ${PACK_META.license} |
| **License URL** | ${PACK_META.license_url} |
| **Generated** | ${now} |
| **Total Characters** | ${ALL_CHARACTERS.length} |
| **Frame Size** | ${CHAR_FRAME_W}×${CHAR_FRAME_H} px |
| **Sheet Size** | ${CHAR_SHEET_COLS * CHAR_FRAME_W}×${CHAR_SHEET_ROWS * CHAR_FRAME_H} px (${CHAR_SHEET_COLS} cols × ${CHAR_SHEET_ROWS} rows) |
| **Animations** | ${ANIMS.join(', ')} |
| **Attribution Required** | Yes |
| **Share-Alike** | Yes |

---

## How to Attribute

> **"${PACK_META.title} — Character Atlas"** by **${PACK_META.creator}**
> Source: ${PACK_META.repository}
> License: GPL-3.0 — ${PACK_META.license_url}

---

## PixiJS Integration

\`\`\`typescript
import { Assets, Spritesheet } from "pixi.js";

const sheet = await Assets.load("character-atlas/manifest.json");
const warrior = new AnimatedSprite(sheet.animations["char_warrior_human_iron_uncommon_01__walk_south"]);
warrior.animationSpeed = 0.15;
warrior.play();
\`\`\`

Animation key format: \`{character_id}__{animation_name}\`
Available animations: \`${ANIMS.join('`, `')}\`

---

## Character Inventory

${classBlocks}

---

*Generated by Weapon Atlas Generator — ${PACK_META.repository}*
`;
}

// ─── README ───────────────────────────────────────────────────────────────────

const CHAR_README = `# Character Sprite Atlas — PixiJS Ready

Procedurally generated character sprites for use with PixiJS, Phaser, or any
sprite-sheet-compatible game engine.

## Contents

\`\`\`
character-atlas/
  ATTRIBUTION.md        ← OpenGameArt-style asset credits
  LICENSE               ← GPL-3.0
  README.md             ← This file
  atlas.png             ← Combined atlas (all characters packed)
  manifest.json         ← PixiJS Spritesheet manifest (frame coords + animations)
  characters.json       ← Full metadata per character
  metadata.jsonl        ← One JSON record per character (dataset format)
  characters/
    warrior/            ← Individual sprite sheets per character
    mage/
    rogue/
    ranger/
    paladin/
    berserker/
\`\`\`

## Sprite Sheet Layout (per character: 192×384 px)

| Row | Animation    | Frames |
|-----|--------------|--------|
|  0  | walk_south   |   4    |
|  1  | walk_west    |   4    |
|  2  | walk_east    |   4    |
|  3  | walk_north   |   4    |
|  4  | idle         |   4    |
|  5  | attack       |   4    |

Frame size: 48×64 px

## PixiJS Usage

\`\`\`typescript
import { Assets, AnimatedSprite } from "pixi.js";

// Load the packed atlas
const sheet = await Assets.load("character-atlas/manifest.json");

// Create an animated character
const char = new AnimatedSprite(
  sheet.animations["char_warrior_human_iron_uncommon_01__walk_south"]
);
char.animationSpeed = 0.12;
char.loop = true;
char.play();
app.stage.addChild(char);

// Switch animation
char.textures = sheet.animations["char_warrior_human_iron_uncommon_01__attack"];
char.play();
\`\`\`

## License

GPL-3.0 — see LICENSE file.
Creator: ${PACK_META.creator}
Repository: ${PACK_META.repository}
`;

// ─── GPL-3 LICENSE (same text as weapon atlas) ───────────────────────────────

const GPL3 = `GNU GENERAL PUBLIC LICENSE
Version 3, 29 June 2007

Character Sprite Atlas — Weapon Atlas Generator
Copyright (C) ${new Date().getFullYear()} OuroborosCollective
Repository: ${PACK_META.repository}

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Full license text: https://www.gnu.org/licenses/gpl-3.0.en.html
`;

// ─── MAIN EXPORT FUNCTION ─────────────────────────────────────────────────────

export async function exportCharacterZip(): Promise<void> {
  // 1. Pack all characters into atlas
  const { atlasCanvas, positions } = packCharacterAtlas();

  // 2. Generate documents
  const manifest   = generateCharManifest(positions, atlasCanvas.width, atlasCanvas.height);
  const charsMeta  = generateCharPartsManifest();
  const metaJsonl  = generateCharMetadataJsonl();
  const attribution = generateCharAttribution();

  // 3. ZIP
  const zip = new JSZip();
  const root = zip.folder("character-atlas")!;

  // Root documents
  root.file("ATTRIBUTION.md", attribution);
  root.file("LICENSE", GPL3);
  root.file("README.md", CHAR_README);

  // Atlas PNG
  const atlasBlob = await new Promise<Blob | null>(res => atlasCanvas.toBlob(res, "image/png"));
  if (atlasBlob) root.file("atlas.png", atlasBlob);

  // Manifests
  root.file("manifest.json", JSON.stringify(manifest, null, 2));
  root.file("characters.json", JSON.stringify(charsMeta, null, 2));
  root.file("metadata.jsonl", metaJsonl);

  // Individual sprite sheets
  const promises: Promise<void>[] = ALL_CHARACTERS.map(async (char) => {
    const folder = root.folder(`characters/${char.class}`)!;
    const sheet = renderCharacterSheet(char);
    const blob = await new Promise<Blob | null>(res => sheet.toBlob(res, "image/png"));
    if (blob) folder.file(`${char.id}.png`, blob);
  });

  await Promise.all(promises);

  // 4. Download
  const content = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
  const url = URL.createObjectURL(content);
  const a = document.createElement("a");
  a.href = url;
  a.download = "character-atlas.zip";
  a.click();
  URL.revokeObjectURL(url);
}
