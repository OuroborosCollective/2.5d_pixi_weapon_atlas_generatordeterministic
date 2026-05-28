// ─── ATTRIBUTION CONSTANTS ────────────────────────────────────────────────────

export const PACK_META = {
  title: "Weapon Atlas — Modular PixiJS Weapon Parts",
  version: "2.0.0",
  creator: "OuroborosCollective",
  repository: "https://github.com/OuroborosCollective/2.5d_pixi_weapon_atlas_generatordeterministic",
  license: "GPL-3.0",
  license_url: "https://www.gnu.org/licenses/gpl-3.0.en.html",
  opengameart_practices: true,
  attribution_required: true,
  share_alike: true,
  commercial_use: true,
  tile_size: 128,
  format: "PNG",
};

export const RARITY_WEIGHTS: Record<string, number> = {
  common: 100,
  uncommon: 60,
  rare: 30,
  epic: 10,
  legendary: 3,
  mythic: 1,
};

export const RARITY_COLORS: Record<string, string> = {
  common: "#9d9d9d",
  uncommon: "#1eff00",
  rare: "#0070dd",
  epic: "#a335ee",
  legendary: "#ff8000",
  mythic: "#e6cc80",
};

const WEAPON_KIND_BY_CATEGORY: Record<string, string> = {
  sword_blade: "sword",
  sword_guard: "sword",
  sword_handle: "sword",
  sword_pommel: "sword",
  axe_head: "axe",
  axe_handle: "axe",
  hammer_head: "hammer",
  spear_tip: "spear",
  spear_shaft: "spear",
  staff_head: "staff",
  shield: "shield",
  magical_crystal: "offhand",
  dagger_blade: "dagger",
  bow_limb: "bow",
  bow_string: "bow",
  knuckle: "knuckle",
  mace_head: "mace",
};

const ANIMATION_GROUPS_BY_KIND: Record<string, string[]> = {
  sword: ["idle", "swing", "slash", "thrust", "parry", "impact", "critical_hit", "sheathe"],
  axe: ["idle", "swing", "chop", "overhead", "impact", "critical_hit", "sheathe"],
  hammer: ["idle", "swing", "smash", "overhead", "impact", "critical_hit", "sheathe"],
  spear: ["idle", "thrust", "sweep", "brace", "impact", "sheathe"],
  bow: ["idle", "draw", "aim", "release", "charge_shot"],
  dagger: ["idle", "slash", "stab", "backstab", "combo", "critical_hit", "sheathe"],
  knuckle: ["idle", "jab", "hook", "uppercut", "combo", "critical_hit"],
  mace: ["idle", "swing", "smash", "overhead", "impact", "critical_hit", "sheathe"],
  staff: ["idle", "cast", "channel", "slam", "impact"],
  shield: ["idle", "block", "bash", "raise", "lower"],
  offhand: ["idle", "glow", "pulse"],
};

const COMPATIBLE_SLOTS_BY_CATEGORY: Record<string, Record<string, string>> = {
  sword_blade: { guard: "sword_guard_*", handle: "sword_handle_*", pommel: "sword_pommel_*" },
  axe_head: { handle: "axe_handle_*" },
  hammer_head: { handle: "axe_handle_*" },
  spear_tip: { shaft: "spear_shaft_*" },
  bow_limb: { string: "bow_string_*" },
  dagger_blade: { guard: "sword_guard_*", handle: "sword_handle_*" },
  mace_head: { handle: "axe_handle_*" },
};

export interface PartInfo {
  id: string;
  name: string;
  category: string;
  material: string;
  rarity: string;
  tags: string[];
  x: number;
  y: number;
  w: number;
  h: number;
}

export function generateManifest(partsInfo: PartInfo[]) {
  const parts: Record<string, unknown> = {};

  for (const info of partsInfo) {
    const kind = WEAPON_KIND_BY_CATEGORY[info.category] ?? "misc";
    const animGroups = ANIMATION_GROUPS_BY_KIND[kind] ?? ["idle"];
    const compatibleWith = COMPATIBLE_SLOTS_BY_CATEGORY[info.category] ?? {};

    parts[info.id] = {
      name: info.name,
      category: info.category,
      weapon_kind: kind,
      material: info.material,
      rarity: info.rarity,
      rarity_weight: RARITY_WEIGHTS[info.rarity] ?? 50,
      tags: info.tags,
      atlas_x: info.x,
      atlas_y: info.y,
      atlas_w: info.w,
      atlas_h: info.h,
      animation_groups: animGroups,
      compatible_with: compatibleWith,
      // OpenGameArt-style attribution fields
      creator: PACK_META.creator,
      repository: PACK_META.repository,
      license: PACK_META.license,
      license_url: PACK_META.license_url,
      attribution_required: true,
      share_alike: true,
      file_path: `parts/${info.category}/${info.id}.png`,
      format: "PNG",
      width: info.w,
      height: info.h,
    };
  }

  return {
    version: "2.0.0",
    generated: new Date().toISOString(),
    atlas: "atlas.png",
    tile_size: 128,
    total_parts: partsInfo.length,
    parts,
    rarity_levels: Object.entries(RARITY_WEIGHTS).map(([rarity, weight]) => ({
      rarity,
      weight,
      color: RARITY_COLORS[rarity] ?? "#ffffff",
    })),
    weapon_kinds: [
      "sword", "axe", "hammer", "spear", "bow",
      "dagger", "knuckle", "mace", "staff", "shield", "offhand",
    ],
    categories: Object.keys(WEAPON_KIND_BY_CATEGORY),
    assembly_rules: {
      sword: ["sword_blade", "sword_guard", "sword_handle", "sword_pommel"],
      axe: ["axe_head", "axe_handle"],
      hammer: ["hammer_head", "axe_handle"],
      spear: ["spear_tip", "spear_shaft"],
      bow: ["bow_limb", "bow_string"],
      dagger: ["dagger_blade", "sword_guard", "sword_handle"],
      mace: ["mace_head", "axe_handle"],
      staff: ["staff_head", "spear_shaft"],
    },
  };
}

export function generateAnimations() {
  return {
    version: "1.0.0",
    generated: new Date().toISOString(),
    description: "Animation frame metadata for each weapon kind. Use animation_groups on each part in manifest.json to know which animations apply.",
    frame_data: {
      idle:         { frames: 4,  duration_ms: 1200, loop: true,  description: "Breathing/floating idle" },
      swing:        { frames: 6,  duration_ms: 350,  loop: false, description: "Horizontal swing arc" },
      slash:        { frames: 4,  duration_ms: 280,  loop: false, description: "Diagonal slash" },
      thrust:       { frames: 4,  duration_ms: 300,  loop: false, description: "Forward lunge thrust" },
      stab:         { frames: 4,  duration_ms: 240,  loop: false, description: "Quick stab (dagger)" },
      chop:         { frames: 5,  duration_ms: 380,  loop: false, description: "Overhead chop (axe)" },
      overhead:     { frames: 5,  duration_ms: 420,  loop: false, description: "Overhead smash" },
      smash:        { frames: 5,  duration_ms: 440,  loop: false, description: "Ground smash (hammer/mace)" },
      sweep:        { frames: 6,  duration_ms: 480,  loop: false, description: "Wide sweeping arc (spear)" },
      brace:        { frames: 3,  duration_ms: 200,  loop: false, description: "Set-spear brace" },
      parry:        { frames: 3,  duration_ms: 180,  loop: false, description: "Deflect incoming attack" },
      block:        { frames: 2,  duration_ms: 150,  loop: false, description: "Shield block" },
      bash:         { frames: 4,  duration_ms: 280,  loop: false, description: "Shield bash" },
      raise:        { frames: 2,  duration_ms: 200,  loop: false, description: "Raise shield" },
      lower:        { frames: 2,  duration_ms: 200,  loop: false, description: "Lower shield" },
      impact:       { frames: 4,  duration_ms: 250,  loop: false, description: "Hit-connect impact flash" },
      critical_hit: { frames: 6,  duration_ms: 400,  loop: false, description: "Critical strike burst" },
      backstab:     { frames: 5,  duration_ms: 320,  loop: false, description: "Backstab strike (rogue)" },
      combo:        { frames: 8,  duration_ms: 560,  loop: false, description: "Multi-hit combo chain" },
      jab:          { frames: 3,  duration_ms: 180,  loop: false, description: "Quick jab (knuckle)" },
      hook:         { frames: 4,  duration_ms: 260,  loop: false, description: "Hook punch (knuckle)" },
      uppercut:     { frames: 4,  duration_ms: 280,  loop: false, description: "Uppercut (knuckle)" },
      draw:         { frames: 4,  duration_ms: 350,  loop: false, description: "Draw bowstring" },
      aim:          { frames: 2,  duration_ms: 800,  loop: false, description: "Aim held pose" },
      release:      { frames: 4,  duration_ms: 200,  loop: false, description: "Arrow release" },
      charge_shot:  { frames: 8,  duration_ms: 1200, loop: false, description: "Charged power shot" },
      cast:         { frames: 6,  duration_ms: 500,  loop: false, description: "Spell cast (staff)" },
      channel:      { frames: 8,  duration_ms: 2000, loop: true,  description: "Channeled spell hold" },
      slam:         { frames: 5,  duration_ms: 380,  loop: false, description: "Staff ground slam" },
      sheathe:      { frames: 3,  duration_ms: 300,  loop: false, description: "Weapon sheathe" },
      glow:         { frames: 8,  duration_ms: 1600, loop: true,  description: "Ambient magical glow pulse" },
      pulse:        { frames: 4,  duration_ms: 800,  loop: true,  description: "Crystal energy pulse" },
    },
    groups_by_kind: {
      sword:   ["idle", "swing", "slash", "thrust", "parry", "impact", "critical_hit", "sheathe"],
      axe:     ["idle", "swing", "chop", "overhead", "impact", "critical_hit", "sheathe"],
      hammer:  ["idle", "swing", "smash", "overhead", "impact", "critical_hit", "sheathe"],
      spear:   ["idle", "thrust", "sweep", "brace", "impact", "sheathe"],
      bow:     ["idle", "draw", "aim", "release", "charge_shot"],
      dagger:  ["idle", "slash", "stab", "backstab", "combo", "critical_hit", "sheathe"],
      knuckle: ["idle", "jab", "hook", "uppercut", "combo", "critical_hit"],
      mace:    ["idle", "swing", "smash", "overhead", "impact", "critical_hit", "sheathe"],
      staff:   ["idle", "cast", "channel", "slam", "impact"],
      shield:  ["idle", "block", "bash", "raise", "lower"],
      offhand: ["idle", "glow", "pulse"],
    },
  };
}

// ─── ATTRIBUTION.md GENERATOR (OpenGameArt standard) ─────────────────────────

export function generateAttribution(partsInfo: PartInfo[]): string {
  const now = new Date().toISOString().split("T")[0];
  const byCategory: Record<string, PartInfo[]> = {};
  for (const p of partsInfo) {
    if (!byCategory[p.category]) byCategory[p.category] = [];
    byCategory[p.category].push(p);
  }

  const tableRows = (parts: PartInfo[]) =>
    parts.map(p =>
      `| \`${p.id}\` | ${p.name} | ${p.material} | ${p.rarity} | PNG | 128×128 |`
    ).join("\n");

  const categoryBlocks = Object.entries(byCategory).map(([cat, parts]) => {
    const title = cat.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    return `### ${title} (${parts.length} assets)

| ID | Title | Material | Rarity | Format | Size |
|----|-------|----------|--------|--------|------|
${tableRows(parts)}`;
  }).join("\n\n");

  return `# ATTRIBUTION

> This file follows **OpenGameArt.org attribution guidelines**.
> All assets in this pack are original procedural artwork generated by code.

---

## Pack Information

| Field | Value |
|-------|-------|
| **Title** | ${PACK_META.title} |
| **Version** | ${PACK_META.version} |
| **Creator** | ${PACK_META.creator} |
| **Repository** | ${PACK_META.repository} |
| **License** | ${PACK_META.license} |
| **License URL** | ${PACK_META.license_url} |
| **Generated** | ${now} |
| **Total Assets** | ${partsInfo.length} |
| **Asset Format** | PNG, 128×128 px tiles |
| **Attribution Required** | Yes |
| **Share-Alike** | Yes |
| **Commercial Use** | Permitted (with source release) |

---

## How to Attribute This Work

When using these assets, include the following credit line:

> **"${PACK_META.title}"** by **${PACK_META.creator}**
> Source: ${PACK_META.repository}
> License: GPL-3.0 — ${PACK_META.license_url}

If you modify or build upon these assets, your derivative work must also be
released under **GPL-3.0** and include this attribution.

---

## License Summary (GPL-3.0)

This work is licensed under the **GNU General Public License v3.0**.

You are free to:
- ✅ Use in commercial and non-commercial games
- ✅ Modify and adapt the assets
- ✅ Redistribute the assets

Under the following conditions:
- ⚠️ Derivative works **must** also be released under GPL-3.0
- ⚠️ Attribution to the original creator **must** be included
- ⚠️ A copy of the GPL-3.0 license **must** be provided
- ⚠️ Source files (or this generation code) **must** remain publicly available

Full license text: ${PACK_META.license_url}

---

## Asset Inventory

${categoryBlocks}

---

## Effect Overlays

The \`effects/\` folder contains compositable overlay PNGs:

### Rarity Auras (effects/auras/)
| File | Rarity | Color | Recommended Blend Mode |
|------|--------|-------|------------------------|
| \`common_aura.png\` | common | #9d9d9d | NORMAL (low opacity) |
| \`uncommon_aura.png\` | uncommon | #1eff00 | SCREEN |
| \`rare_aura.png\` | rare | #0070dd | SCREEN |
| \`epic_aura.png\` | epic | #a335ee | SCREEN |
| \`legendary_aura.png\` | legendary | #ff8000 | ADD |
| \`mythic_aura.png\` | mythic | #e6cc80 | ADD |

### Element Effects (effects/elements/)
| File | Element | Recommended Blend Mode |
|------|---------|------------------------|
| \`fire_effect.png\` | 🔥 Fire | ADD |
| \`ice_effect.png\` | ❄️ Ice | SCREEN |
| \`electro_effect.png\` | ⚡ Electro | ADD |
| \`wind_effect.png\` | 💨 Wind | SCREEN |

---

*Generated by Weapon Atlas Generator — OpenGameArt-compatible attribution practices*
*${PACK_META.repository}*
`;
}

// ─── METADATA.JSONL GENERATOR (OpenGameArt dataset format) ───────────────────

export function generateMetadataJsonl(partsInfo: PartInfo[]): string {
  return partsInfo.map(info => {
    const kind = WEAPON_KIND_BY_CATEGORY[info.category] ?? "misc";
    const animGroups = ANIMATION_GROUPS_BY_KIND[kind] ?? ["idle"];
    const record = {
      id: info.id,
      title: info.name,
      category: info.category,
      weapon_kind: kind,
      material: info.material,
      rarity: info.rarity,
      rarity_weight: RARITY_WEIGHTS[info.rarity] ?? 50,
      tags: info.tags,
      creator: PACK_META.creator,
      repository: PACK_META.repository,
      license: PACK_META.license,
      license_url: PACK_META.license_url,
      attribution_required: true,
      share_alike: true,
      commercial_use: true,
      file_path: `parts/${info.category}/${info.id}.png`,
      atlas: "atlas.png",
      atlas_x: info.x,
      atlas_y: info.y,
      atlas_w: info.w,
      atlas_h: info.h,
      format: "PNG",
      width: info.w,
      height: info.h,
      tile_size: PACK_META.tile_size,
      animation_groups: animGroups,
    };
    return JSON.stringify(record);
  }).join("\n");
}
