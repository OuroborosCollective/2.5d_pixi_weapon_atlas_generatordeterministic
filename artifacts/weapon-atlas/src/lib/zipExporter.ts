import JSZip from "jszip";
import { packAtlas } from "./atlasPacker";
import { generateManifest, generateAnimations, generateAttribution, generateMetadataJsonl, PACK_META } from "./manifestGenerator";
import { renderPartToCanvas, ALL_PARTS } from "./weaponRenderer";
import {
  renderRarityAuraCanvas, renderElementEffectCanvas,
  RarityLevel, ElementType
} from "./effects";

const README_CONTENT = `# Weapon Atlas — Integration Guide
## PixiJS MMORPG Modular Weapon Pack v2.0.0

### Files in this Pack

\`\`\`
weapon-atlas/
  atlas.png          ← Packed sprite sheet (128×128 px tiles)
  manifest.json      ← Part metadata, rarity weights, atlas UV coords
  animations.json    ← Frame counts & durations per animation type
  parts.json         ← Raw part list (flat array)
  README.md          ← This file
  parts/
    sword_blade/     ← Individual PNGs per category
    sword_guard/
    sword_handle/
    sword_pommel/
    axe_head/
    axe_handle/
    hammer_head/
    spear_tip/
    spear_shaft/
    staff_head/
    shield/
    magical_crystal/
    dagger_blade/
    bow_limb/
    bow_string/
    knuckle/
    mace_head/
\`\`\`

---

### Naming Convention

Every part ID follows a deterministic pattern:

\`\`\`
{category}_{material}_{index:02d}
\`\`\`

**Examples:**
- \`sword_blade_iron_01\`   — category: sword_blade, material: iron, index 1
- \`axe_head_void_02\`      — category: axe_head,    material: void, index 2
- \`bow_limb_crystal_02\`   — category: bow_limb,    material: crystal, index 2
- \`mace_head_void_03\`     — category: mace_head,   material: void, index 3

---

### Rarity System

| Rarity    | Weight | Color   | Drop Chance (approx.) |
|-----------|--------|---------|----------------------|
| common    | 100    | #9d9d9d | 48.5%                |
| uncommon  | 60     | #1eff00 | 29.1%                |
| rare      | 30     | #0070dd | 14.6%                |
| epic      | 10     | #a335ee | 4.9%                 |
| legendary | 3      | #ff8000 | 1.5%                 |
| mythic    | 1      | #e6cc80 | 0.5%                 |

---

### Loading the Atlas in PixiJS

\`\`\`javascript
import * as PIXI from "pixi.js";
import manifest from "./weapon-atlas/manifest.json";

// 1. Load the atlas texture
const texture = await PIXI.Assets.load("weapon-atlas/atlas.png");

// 2. Create a sprite for a specific part by atlas UV
function createPartSprite(partId) {
  const part = manifest.parts[partId];
  if (!part) throw new Error(\`Unknown part: \${partId}\`);
  
  const rect = new PIXI.Rectangle(part.atlas_x, part.atlas_y, part.atlas_w, part.atlas_h);
  const partTexture = new PIXI.Texture({ source: texture.source, frame: rect });
  return new PIXI.Sprite(partTexture);
}

// 3. Usage
const blade = createPartSprite("sword_blade_iron_01");
app.stage.addChild(blade);
\`\`\`

---

### Deterministic Part Picker (Seeded RNG)

Use this to reproducibly pick weapon parts from a seed (e.g. loot drop seed, player ID):

\`\`\`javascript
import manifest from "./weapon-atlas/manifest.json";

// Simple seeded LCG random — deterministic for the same seed
function seededRandom(seed) {
  let s = seed | 0;
  return function () {
    s = (Math.imul(1664525, s) + 1013904223) | 0;
    return (s >>> 0) / 0xffffffff;
  };
}

/**
 * Pick a random part from a category using weighted rarity.
 * @param {string} category   e.g. "sword_blade"
 * @param {number} seed       deterministic seed (e.g. loot seed)
 * @param {string} [minRarity] optional: "common"|"uncommon"|"rare"|"epic"|"legendary"
 * @returns {string} part ID (e.g. "sword_blade_void_03")
 */
function pickPart(category, seed, minRarity = null) {
  const rand = seededRandom(seed);
  const rarityOrder = ["common", "uncommon", "rare", "epic", "legendary", "mythic"];
  const minIdx = minRarity ? rarityOrder.indexOf(minRarity) : 0;
  
  // Collect all parts in this category, filtered by minRarity
  const pool = Object.entries(manifest.parts)
    .filter(([, part]) => 
      part.category === category && 
      rarityOrder.indexOf(part.rarity) >= minIdx
    )
    .map(([id, part]) => ({ id, weight: part.rarity_weight }));

  if (pool.length === 0) throw new Error(\`No parts found for category: \${category}\`);
  
  // Weighted random pick
  const totalWeight = pool.reduce((sum, p) => sum + p.weight, 0);
  let r = rand() * totalWeight;
  for (const { id, weight } of pool) {
    r -= weight;
    if (r <= 0) return id;
  }
  return pool[pool.length - 1].id;
}

// Example: generate a full sword from a loot seed
function rollSword(lootSeed) {
  return {
    blade:  pickPart("sword_blade",  lootSeed * 1),
    guard:  pickPart("sword_guard",  lootSeed * 2),
    handle: pickPart("sword_handle", lootSeed * 3),
    pommel: pickPart("sword_pommel", lootSeed * 4),
  };
}

function rollBow(lootSeed) {
  return {
    limb:   pickPart("bow_limb",   lootSeed * 1),
    string: pickPart("bow_string", lootSeed * 2),
  };
}

function rollDagger(lootSeed) {
  return {
    blade:  pickPart("dagger_blade",  lootSeed * 1),
    guard:  pickPart("sword_guard",   lootSeed * 2),
    handle: pickPart("sword_handle",  lootSeed * 3),
  };
}

// Usage
const sword = rollSword(0xDEADBEEF);
// { blade: "sword_blade_iron_01", guard: "sword_guard_iron_01", ... }
// Same seed → always same result. Different seed → different weapon.
\`\`\`

---

### Assembling a Composite Weapon Sprite

\`\`\`javascript
// Compose weapon parts into a single PIXI.Container
function buildWeapon(partIds) {
  const container = new PIXI.Container();
  for (const partId of partIds) {
    const sprite = createPartSprite(partId);
    sprite.anchor.set(0.5);
    container.addChild(sprite);
  }
  return container;
}

// Example sword
const sword = rollSword(0xDEADBEEF);
const swordContainer = buildWeapon([
  sword.blade, sword.guard, sword.handle, sword.pommel
]);
app.stage.addChild(swordContainer);
\`\`\`

---

### Animation Integration

\`\`\`javascript
import animations from "./weapon-atlas/animations.json";
import manifest from "./weapon-atlas/manifest.json";

// Get animation data for a specific animation
function getAnimData(animName) {
  return animations.frame_data[animName];
}

// Get all valid animations for a weapon part
function getPartAnimations(partId) {
  const part = manifest.parts[partId];
  return part ? part.animation_groups : [];
}

// Example: play swing animation on a sword blade
const bladeAnims = getPartAnimations("sword_blade_iron_01");
// ["idle", "swing", "slash", "thrust", "parry", "impact", "critical_hit", "sheathe"]

const swingData = getAnimData("swing");
// { frames: 6, duration_ms: 350, loop: false, description: "Horizontal swing arc" }
\`\`\`

---

### Filtering by Tag

\`\`\`javascript
// Pick only parts matching certain tags (e.g. for biome-themed loot)
function pickPartByTag(category, seed, requiredTag) {
  const rand = seededRandom(seed);
  const pool = Object.entries(manifest.parts)
    .filter(([, p]) => p.category === category && p.tags.includes(requiredTag))
    .map(([id, p]) => ({ id, weight: p.rarity_weight }));

  const totalWeight = pool.reduce((s, p) => s + p.weight, 0);
  let r = rand() * totalWeight;
  for (const { id, weight } of pool) {
    r -= weight;
    if (r <= 0) return id;
  }
  return pool[pool.length - 1].id;
}

// Example: only void-biome weapons in a dungeon
const voidBlade = pickPartByTag("sword_blade", seed, "void_biome");
\`\`\`

---

### Assembly Rules

Each weapon kind specifies which part slots are needed:

| Kind    | Required Slots                                  |
|---------|-------------------------------------------------|
| sword   | sword_blade + sword_guard + sword_handle + sword_pommel |
| axe     | axe_head + axe_handle                          |
| hammer  | hammer_head + axe_handle                       |
| spear   | spear_tip + spear_shaft                         |
| bow     | bow_limb + bow_string                           |
| dagger  | dagger_blade + sword_guard + sword_handle       |
| mace    | mace_head + axe_handle                         |
| staff   | staff_head + spear_shaft                        |

---

*Generated by Weapon Atlas Generator — PixiJS Ready*
`;

const GPL3_LICENSE = `GNU GENERAL PUBLIC LICENSE
Version 3, 29 June 2007

Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>

Weapon Atlas — Modular PixiJS Weapon Parts
Copyright (C) ${new Date().getFullYear()} OuroborosCollective
Repository: https://github.com/OuroborosCollective/2.5d_pixi_weapon_atlas_generatordeterministic

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

---

FULL LICENSE TEXT: https://www.gnu.org/licenses/gpl-3.0.en.html

SUMMARY OF KEY CONDITIONS:
  1. Source code must be made available when distributing the software.
  2. A copy of the license and copyright notice must be included.
  3. Modifications must be released under the same license (GPL-3.0).
  4. Attribution to the original creator is required.
  5. Commercial use is permitted provided all GPL-3.0 conditions are met.

This license was designed for software but is applied here to game art assets
following the OpenGameArt.org community conventions for GPL-3.0 licensed works.
When modifying these assets, "source" means the procedural generation code used
to create them, available at the repository link above.
`;

export async function exportZip() {
  // 1. Pack atlas and get part positions
  const { atlasCanvas, partsInfo } = await packAtlas();

  // 2. Generate all documents
  const manifest = generateManifest(partsInfo);
  const animations = generateAnimations();
  const attribution = generateAttribution(partsInfo);
  const metadataJsonl = generateMetadataJsonl(partsInfo);

  // 3. Setup ZIP
  const zip = new JSZip();
  const root = zip.folder("weapon-atlas")!;

  // 4. OpenGameArt-standard root documents
  root.file("ATTRIBUTION.md", attribution);
  root.file("LICENSE", GPL3_LICENSE);
  root.file("README.md", README_CONTENT);

  // 5. Atlas PNG
  const atlasBlob = await new Promise<Blob | null>(res => atlasCanvas.toBlob(res, "image/png"));
  if (atlasBlob) root.file("atlas.png", atlasBlob);

  // 6. manifest.json (with per-part creator/license fields)
  root.file("manifest.json", JSON.stringify(manifest, null, 2));

  // 7. animations.json
  root.file("animations.json", JSON.stringify(animations, null, 2));

  // 8. parts.json (flat array)
  root.file("parts.json", JSON.stringify(partsInfo, null, 2));

  // 9. metadata.jsonl — one JSON record per line (OpenGameArt dataset format)
  root.file("metadata.jsonl", metadataJsonl);

  // 9. Individual PNGs per part in category subfolders
  const partsFolder = root.folder("parts")!;

  // Pre-create category folders
  const categoryFolders: Record<string, JSZip> = {};
  for (const part of ALL_PARTS) {
    if (!categoryFolders[part.category]) {
      categoryFolders[part.category] = partsFolder.folder(part.category)!;
    }
  }

  // Render and export each part
  const renderPromises = ALL_PARTS.map(async (part) => {
    const canvas = renderPartToCanvas(part);
    const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, "image/png"));
    if (blob) {
      categoryFolders[part.category].file(`${part.id}.png`, blob);
    }
  });

  await Promise.all(renderPromises);

  // 10. Effect overlay PNGs
  const effectsFolder = root.folder("effects")!;
  const aurasFolder = effectsFolder.folder("auras")!;
  const elementsFolder = effectsFolder.folder("elements")!;

  const rarities: RarityLevel[] = ["common", "uncommon", "rare", "epic", "legendary", "mythic"];
  const elements: ElementType[] = ["fire", "ice", "electro", "wind"];

  const effectPromises: Promise<void>[] = [
    ...rarities.map(async (rarity) => {
      const canvas = renderRarityAuraCanvas(rarity);
      const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, "image/png"));
      if (blob) aurasFolder.file(`${rarity}_aura.png`, blob);
    }),
    ...elements.map(async (el) => {
      const canvas = renderElementEffectCanvas(el);
      const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, "image/png"));
      if (blob) elementsFolder.file(`${el}_effect.png`, blob);
    }),
  ];

  await Promise.all(effectPromises);

  // 11. Generate and download ZIP
  const content = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  const url = URL.createObjectURL(content);
  const a = document.createElement("a");
  a.href = url;
  a.download = "weapon-atlas.zip";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
