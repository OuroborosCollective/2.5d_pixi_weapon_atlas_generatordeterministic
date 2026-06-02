// characterRenderer.ts — Areloria Character Forge v2
// Production-grade procedural pixel-art character sprite generator
// Sheet: 4 cols × 9 rows = 36 frames per character
//   Row 0: walk_south   Row 1: walk_west   Row 2: walk_east
//   Row 3: walk_north   Row 4: idle        Row 5: attack
//   Row 6: cast(fb)     Row 7: hurt(fb)    Row 8: death(fb)
//
// Rendering philosophy (Ragnarok Online / Diablo-style pixel art):
//   - Elliptical head via math-based row drawing (not rounded rect)
//   - 4-tone shading (highlight/light/mid/shadow) + dithered transitions
//   - Consistent top-left light source across all surfaces
//   - Clear class silhouettes readable at any scale
//   - Outline only on outer edges; pixel clusters ≥2px (no isolated dots)

export const CHAR_FRAME_W  = 48;
export const CHAR_FRAME_H  = 64;
export const CHAR_SHEET_COLS = 4;
export const CHAR_SHEET_ROWS = 9;

import { addGritPx, rimLightPx, innerShadowPx, BAYER_4X4, shade as utilsShade } from './canvasUtils';

export type CharacterClass = 'warrior' | 'mage' | 'rogue' | 'ranger' | 'paladin' | 'berserker';
export type CharacterRace  = 'human' | 'elf' | 'dwarf' | 'orc';
export type ArmorTier      = 'leather' | 'iron' | 'steel' | 'mythril';
export type CharRarity     = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
export type AnimType       =
  'walk_south' | 'walk_west' | 'walk_east' | 'walk_north' |
  'idle' | 'attack' | 'cast' | 'hurt' | 'death';

export const ANIM_ROW: Record<AnimType, number> = {
  walk_south: 0, walk_west: 1, walk_east: 2,
  walk_north: 3, idle: 4, attack: 5,
  cast: 6, hurt: 7, death: 8,
};

export const CHAR_RARITY_WEIGHTS: Record<CharRarity, number> = {
  common: 100, uncommon: 60, rare: 30, epic: 10, legendary: 3, mythic: 1,
};

export const CHAR_RARITY_COLORS: Record<CharRarity, string> = {
  common: '#9d9d9d', uncommon: '#1eff00', rare: '#0070dd',
  epic: '#a335ee', legendary: '#ff8000', mythic: '#e6cc80',
};

export interface CharacterDef {
  id: string;
  name: string;
  class: CharacterClass;
  race: CharacterRace;
  armorTier: ArmorTier;
  rarity: CharRarity;
  skinColor: string;
  hairColor: string;
  armorColor: string;
  accentColor: string;
  eyeColor: string;
  weaponTint: string;
  tags: string[];
}

// ─── COLOR PALETTES ───────────────────────────────────────────────────────────

const sk = {
  fair: '#F2C59E', tan: '#C8824A', dark: '#8B5020',
  pale: '#F8EDE0', orc: '#5C8A50', dwarf: '#C27840',
};
const hr = {
  brown: '#6B3000', black: '#1C1010', blonde: '#D8B828',
  red: '#A82800', white: '#E8E8F0', silver: '#9898B8',
  green: '#246020',
};
const ey = {
  brown: '#6C3818', blue: '#1858A0', green: '#287028',
  purple: '#5828A0', gold: '#C09010', red: '#A01010',
};
const AT = {
  leather: { b: '#8B6010', d: '#6B4808', l: '#AA7A16', blt: '#4A2E06' },
  iron:    { b: '#586070', d: '#404858', l: '#7090A8', blt: '#303848' },
  steel:   { b: '#8CA8C0', d: '#6080A0', l: '#B8CED8', blt: '#486070' },
  mythril: { b: '#50A0C8', d: '#3070B0', l: '#80C0E8', blt: '#185878' },
};

// ─── CHARACTER PRESETS ────────────────────────────────────────────────────────

export const ALL_CHARACTERS: CharacterDef[] = [
  // WARRIORS
  { id:'char_warrior_human_leather_common_01',    name:'Iron Recruit',          class:'warrior',   race:'human', armorTier:'leather', rarity:'common',    skinColor:sk.fair,   hairColor:hr.brown,  armorColor:AT.leather.b, accentColor:'#CC2020', eyeColor:ey.brown,  weaponTint:'#C0C8D8', tags:['warrior','melee','physical'] },
  { id:'char_warrior_human_iron_uncommon_01',     name:'Iron Vanguard',         class:'warrior',   race:'human', armorTier:'iron',    rarity:'uncommon',  skinColor:sk.tan,    hairColor:hr.black,  armorColor:AT.iron.b,    accentColor:'#CC2020', eyeColor:ey.blue,   weaponTint:'#C0C8D8', tags:['warrior','melee','tank'] },
  { id:'char_warrior_dwarf_steel_rare_01',        name:'Forge Warden',          class:'warrior',   race:'dwarf', armorTier:'steel',   rarity:'rare',      skinColor:sk.dwarf,  hairColor:hr.red,    armorColor:AT.steel.b,   accentColor:'#CC2020', eyeColor:ey.brown,  weaponTint:'#A08060', tags:['warrior','dwarf','tank'] },
  { id:'char_warrior_orc_iron_uncommon_01',       name:'Bloodfist Grunt',       class:'warrior',   race:'orc',   armorTier:'iron',    rarity:'uncommon',  skinColor:sk.orc,    hairColor:hr.black,  armorColor:AT.iron.b,    accentColor:'#CC2020', eyeColor:ey.red,    weaponTint:'#A08060', tags:['warrior','orc','brute'] },
  { id:'char_warrior_elf_mythril_epic_01',        name:'Moonblade Sentinel',    class:'warrior',   race:'elf',   armorTier:'mythril', rarity:'epic',      skinColor:sk.pale,   hairColor:hr.silver, armorColor:AT.mythril.b, accentColor:'#CC2020', eyeColor:ey.blue,   weaponTint:'#C0C8D8', tags:['warrior','elf','elite'] },
  { id:'char_warrior_human_mythril_legendary_01', name:'Dragonguard Champion',  class:'warrior',   race:'human', armorTier:'mythril', rarity:'legendary', skinColor:sk.fair,   hairColor:'#E8C840', armorColor:AT.mythril.b, accentColor:'#FF4020', eyeColor:ey.gold,   weaponTint:'#FFD040', tags:['warrior','legendary','champion'] },
  // MAGES
  { id:'char_mage_human_leather_common_01',       name:'Apprentice Mage',       class:'mage',      race:'human', armorTier:'leather', rarity:'common',    skinColor:sk.fair,   hairColor:hr.brown,  armorColor:'#4A3860',    accentColor:'#A030E0', eyeColor:ey.purple, weaponTint:'#8060A0', tags:['mage','caster','magic'] },
  { id:'char_mage_human_iron_uncommon_01',        name:'Battle Arcanist',       class:'mage',      race:'human', armorTier:'iron',    rarity:'uncommon',  skinColor:sk.tan,    hairColor:hr.blonde, armorColor:'#503870',    accentColor:'#A030E0', eyeColor:ey.blue,   weaponTint:'#8060A0', tags:['mage','battle','caster'] },
  { id:'char_mage_elf_steel_rare_01',             name:'Arcane Weaver',         class:'mage',      race:'elf',   armorTier:'steel',   rarity:'rare',      skinColor:sk.pale,   hairColor:hr.silver, armorColor:'#5A4880',    accentColor:'#A030E0', eyeColor:ey.purple, weaponTint:'#9070C0', tags:['mage','elf','arcane'] },
  { id:'char_mage_orc_mythril_epic_01',           name:'Shaman Warlord',        class:'mage',      race:'orc',   armorTier:'mythril', rarity:'epic',      skinColor:sk.orc,    hairColor:hr.green,  armorColor:'#304870',    accentColor:'#20E090', eyeColor:ey.green,  weaponTint:'#20D080', tags:['mage','orc','shaman'] },
  { id:'char_mage_elf_mythril_mythic_01',         name:'Starweaver Archon',     class:'mage',      race:'elf',   armorTier:'mythril', rarity:'mythic',    skinColor:sk.pale,   hairColor:'#E0D0FF', armorColor:'#2030A0',    accentColor:'#FFD0FF', eyeColor:'#A080FF', weaponTint:'#C0A0FF', tags:['mage','mythic','legendary'] },
  // ROGUES
  { id:'char_rogue_human_leather_common_01',      name:'Street Cutpurse',       class:'rogue',     race:'human', armorTier:'leather', rarity:'common',    skinColor:sk.tan,    hairColor:hr.black,  armorColor:'#3A3028',    accentColor:'#20A060', eyeColor:ey.green,  weaponTint:'#C0A820', tags:['rogue','stealth','dagger'] },
  { id:'char_rogue_elf_iron_uncommon_01',         name:'Shadow Stalker',        class:'rogue',     race:'elf',   armorTier:'iron',    rarity:'uncommon',  skinColor:sk.pale,   hairColor:hr.silver, armorColor:'#302820',    accentColor:'#20A060', eyeColor:ey.green,  weaponTint:'#C0A820', tags:['rogue','elf','assassin'] },
  { id:'char_rogue_human_steel_rare_01',          name:'Phantom Blade',         class:'rogue',     race:'human', armorTier:'steel',   rarity:'rare',      skinColor:sk.dark,   hairColor:hr.black,  armorColor:'#282028',    accentColor:'#00C080', eyeColor:ey.green,  weaponTint:'#00D090', tags:['rogue','rare','phantom'] },
  { id:'char_rogue_orc_leather_uncommon_01',      name:'Gutter Thug',           class:'rogue',     race:'orc',   armorTier:'leather', rarity:'uncommon',  skinColor:sk.orc,    hairColor:hr.black,  armorColor:'#3A3028',    accentColor:'#20A060', eyeColor:ey.red,    weaponTint:'#C0A820', tags:['rogue','orc','brawler'] },
  { id:'char_rogue_elf_mythril_epic_01',          name:'Wraithstep Assassin',   class:'rogue',     race:'elf',   armorTier:'mythril', rarity:'epic',      skinColor:sk.pale,   hairColor:hr.white,  armorColor:'#181828',    accentColor:'#40FFB0', eyeColor:'#20FFA0', weaponTint:'#40FFB0', tags:['rogue','epic','assassin'] },
  // RANGERS
  { id:'char_ranger_human_leather_common_01',     name:'Forest Scout',          class:'ranger',    race:'human', armorTier:'leather', rarity:'common',    skinColor:sk.tan,    hairColor:hr.brown,  armorColor:'#5A6838',    accentColor:'#40A820', eyeColor:ey.green,  weaponTint:'#806028', tags:['ranger','ranged','bow'] },
  { id:'char_ranger_elf_leather_uncommon_01',     name:'Woodland Archer',       class:'ranger',    race:'elf',   armorTier:'leather', rarity:'uncommon',  skinColor:sk.pale,   hairColor:hr.blonde, armorColor:'#4A5830',    accentColor:'#40A820', eyeColor:ey.green,  weaponTint:'#806028', tags:['ranger','elf','archer'] },
  { id:'char_ranger_human_iron_rare_01',          name:'Ironbow Mercenary',     class:'ranger',    race:'human', armorTier:'iron',    rarity:'rare',      skinColor:sk.dark,   hairColor:hr.black,  armorColor:'#606848',    accentColor:'#80B040', eyeColor:ey.brown,  weaponTint:'#8C7040', tags:['ranger','iron','mercenary'] },
  { id:'char_ranger_dwarf_steel_rare_01',         name:'Crossbow Mountaineer',  class:'ranger',    race:'dwarf', armorTier:'steel',   rarity:'rare',      skinColor:sk.dwarf,  hairColor:hr.red,    armorColor:AT.steel.b,   accentColor:'#40A820', eyeColor:ey.brown,  weaponTint:'#A08050', tags:['ranger','dwarf','crossbow'] },
  { id:'char_ranger_elf_mythril_epic_01',         name:'Stormwind Hawkeye',     class:'ranger',    race:'elf',   armorTier:'mythril', rarity:'epic',      skinColor:sk.pale,   hairColor:hr.silver, armorColor:AT.mythril.b, accentColor:'#A0FF40', eyeColor:'#80E040', weaponTint:'#C0FF60', tags:['ranger','epic','storm'] },
  // PALADINS
  { id:'char_paladin_human_iron_common_01',       name:'Temple Initiate',       class:'paladin',   race:'human', armorTier:'iron',    rarity:'common',    skinColor:sk.fair,   hairColor:hr.blonde, armorColor:AT.iron.b,    accentColor:'#E0C020', eyeColor:ey.blue,   weaponTint:'#D0A010', tags:['paladin','holy','tank'] },
  { id:'char_paladin_human_steel_uncommon_01',    name:'Knight of Dawn',        class:'paladin',   race:'human', armorTier:'steel',   rarity:'uncommon',  skinColor:sk.fair,   hairColor:hr.blonde, armorColor:AT.steel.b,   accentColor:'#E0C020', eyeColor:ey.blue,   weaponTint:'#E0C020', tags:['paladin','knight','holy'] },
  { id:'char_paladin_dwarf_steel_rare_01',        name:'Ironhammer Templar',    class:'paladin',   race:'dwarf', armorTier:'steel',   rarity:'rare',      skinColor:sk.dwarf,  hairColor:hr.red,    armorColor:AT.steel.b,   accentColor:'#FFA020', eyeColor:ey.gold,   weaponTint:'#FFD040', tags:['paladin','dwarf','templar'] },
  { id:'char_paladin_elf_mythril_epic_01',        name:'Sunblade Crusader',     class:'paladin',   race:'elf',   armorTier:'mythril', rarity:'epic',      skinColor:sk.pale,   hairColor:hr.white,  armorColor:'#D8C860',    accentColor:'#FFF080', eyeColor:'#FFD040', weaponTint:'#FFE060', tags:['paladin','epic','sun'] },
  { id:'char_paladin_human_mythril_legendary_01', name:'Aegis Seraph',          class:'paladin',   race:'human', armorTier:'mythril', rarity:'legendary', skinColor:sk.fair,   hairColor:'#FFFFFF', armorColor:'#E8E0A8',    accentColor:'#FFE840', eyeColor:'#FFD080', weaponTint:'#FFC020', tags:['paladin','legendary','seraph'] },
  // BERSERKERS
  { id:'char_berserker_orc_leather_common_01',    name:'Wild Brute',            class:'berserker', race:'orc',   armorTier:'leather', rarity:'common',    skinColor:sk.orc,    hairColor:hr.black,  armorColor:'#3A2010',    accentColor:'#E04010', eyeColor:ey.red,    weaponTint:'#A08060', tags:['berserker','orc','rage'] },
  { id:'char_berserker_human_iron_uncommon_01',   name:'Raging Marauder',       class:'berserker', race:'human', armorTier:'iron',    rarity:'uncommon',  skinColor:sk.dark,   hairColor:hr.red,    armorColor:'#503830',    accentColor:'#E04010', eyeColor:ey.red,    weaponTint:'#A08060', tags:['berserker','rage','axe'] },
  { id:'char_berserker_orc_steel_rare_01',        name:'Bloodrage Warlord',     class:'berserker', race:'orc',   armorTier:'steel',   rarity:'rare',      skinColor:sk.orc,    hairColor:hr.red,    armorColor:'#604040',    accentColor:'#FF2020', eyeColor:'#FF2020', weaponTint:'#C03030', tags:['berserker','orc','warlord'] },
  { id:'char_berserker_orc_mythril_mythic_01',    name:'Apocalypse Fury',       class:'berserker', race:'orc',   armorTier:'mythril', rarity:'mythic',    skinColor:'#3A5A3A', hairColor:'#FF3010', armorColor:'#301820',    accentColor:'#FF4020', eyeColor:'#FF2000', weaponTint:'#FF4020', tags:['berserker','mythic','apocalypse'] },
];

export const CHAR_CATEGORIES: Record<CharacterClass, CharacterDef[]> = {
  warrior:   ALL_CHARACTERS.filter(c => c.class === 'warrior'),
  mage:      ALL_CHARACTERS.filter(c => c.class === 'mage'),
  rogue:     ALL_CHARACTERS.filter(c => c.class === 'rogue'),
  ranger:    ALL_CHARACTERS.filter(c => c.class === 'ranger'),
  paladin:   ALL_CHARACTERS.filter(c => c.class === 'paladin'),
  berserker: ALL_CHARACTERS.filter(c => c.class === 'berserker'),
};

// ─── RACE METRICS ─────────────────────────────────────────────────────────────

interface RaceMetrics {
  headW: number;
  headH: number;
  torsoW: number;
  torsoH: number;
  legH: number;
  dy: number;
}

const RACE_METRICS: Record<CharacterRace, RaceMetrics> = {
  human: { headW: 14, headH: 14, torsoW: 16, torsoH: 18, legH: 13, dy: 0  },
  elf:   { headW: 12, headH: 14, torsoW: 14, torsoH: 18, legH: 15, dy: -1 },
  dwarf: { headW: 14, headH: 13, torsoW: 20, torsoH: 15, legH:  9, dy: 4  },
  orc:   { headW: 16, headH: 14, torsoW: 20, torsoH: 18, legH: 13, dy: 0  },
};

interface WalkPhase { ly: number; ry: number; by: number; la: number; ra: number; }
const WALK_PHASES: WalkPhase[] = [
  { ly: -4, ry:  3, by: -1, la:  3, ra: -3 },
  { ly: -1, ry:  1, by:  0, la:  1, ra: -1 },
  { ly:  3, ry: -4, by: -1, la: -3, ra:  3 },
  { ly:  1, ry: -1, by:  0, la: -1, ra:  1 },
];
const IDLE_BOB = [0, -1, -1, 0];
const ATTACK_PHASES = [
  { armX:  0, armY: -4 },
  { armX:  8, armY:  2 },
  { armX: 12, armY:  4 },
  { armX:  4, armY:  0 },
];

// ─── PIXEL PRIMITIVES ────────────────────────────────────────────────────────

function px(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  if (w <= 0 || h <= 0) return;
  ctx.fillStyle = color;
  ctx.fillRect(x | 0, y | 0, w | 0, h | 0);
}

function pxRound(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  x = x | 0; y = y | 0; w = w | 0; h = h | 0;
  ctx.fillStyle = color;
  ctx.fillRect(x + 2, y,     w - 4, h);
  ctx.fillRect(x,     y + 2, w,     h - 4);
  ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
}

function pxOutline(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  x = x | 0; y = y | 0; w = w | 0; h = h | 0;
  ctx.fillStyle = color;
  ctx.fillRect(x,     y,     w, 1);
  ctx.fillRect(x,     y+h-1, w, 1);
  ctx.fillRect(x,     y,     1, h);
  ctx.fillRect(x+w-1, y,     1, h);
}

function shade(c: string, amt: number): string {
  return utilsShade(c, amt);
}

// 4-tone shading palette for a base color
function palette(c: string) {
  return {
    hi:  shade(c,  42),   // specular highlight
    l:   shade(c,  22),   // lit surface
    b:   c,               // base mid-tone
    d:   shade(c, -26),   // shadow
    vd:  shade(c, -48),   // deep shadow / outline
  };
}

// Dithered row: alternates between two colors (using 4x4 Bayer matrix)
function ditherRow(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, c1: string, c2: string, _offset = 0) {
  for (let i = 0; i < w; i++) {
    const px = (x + i) | 0;
    const py = y | 0;
    // Use safe modulo for negative coordinates
    const row = ((py % 4) + 4) % 4;
    const col = ((px % 4) + 4) % 4;
    const threshold = BAYER_4X4[row][col] / 16;
    ctx.fillStyle = (threshold < 0.5) ? c1 : c2;
    ctx.fillRect(px, py, 1, 1);
  }
}

// Public API helpers
export function drawPixelRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  px(ctx, x, y, w, h, color);
}
export function drawOutlineRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string, outline: string) {
  px(ctx, x, y, w, h, fill);
  pxOutline(ctx, x, y, w, h, outline);
}

// Module-level contact shadow flag (synchronous, safe)
let _skipContactShadow = false;

export function drawContactShadow(ctx: CanvasRenderingContext2D, cx: number, groundY: number, width: number) {
  if (_skipContactShadow) return;
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.fillRect((cx - width) | 0, groundY | 0, (width * 2) | 0, 2);
  ctx.fillStyle = 'rgba(0,0,0,0.16)';
  ctx.fillRect((cx - width + 1) | 0, (groundY + 2) | 0, (width * 2 - 2) | 0, 1);
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.fillRect((cx - width + 2) | 0, (groundY - 1) | 0, (width * 2 - 4) | 0, 1);
}

// ─── HEAD: ELLIPTICAL SHAPE ───────────────────────────────────────────────────
// Draws an organic oval head using ellipse math, with top-left lit shading.
// Light source: top-left → highlight upper-left, shadow lower-right.

export function drawHead(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, skinColor: string) {
  const pal = palette(skinColor);
  const rx  = w * 0.5;
  const ry  = h * 0.5;
  const ox  = (cx - rx)|0;
  const oy  = (cy - ry)|0;
  const out = '#18100E';

  // Draw ellipse row-by-row
  for (let row = 0; row < h; row++) {
    const dy   = (row - ry + 0.5);
    const ratio = Math.max(0, 1 - (dy * dy) / (ry * ry));
    const hw   = Math.round(rx * Math.sqrt(ratio));
    if (hw <= 0) continue;
    const px_  = (cx - hw)|0;
    const pw_  = hw * 2;
    const py_  = (oy + row)|0;
    const t    = row / (h - 1);

    // Base fill per row — 4-tone top-lit
    let rowC: string;
    if (t < 0.12) rowC = pal.hi;
    else if (t < 0.30) rowC = pal.l;
    else if (t < 0.68) rowC = pal.b;
    else if (t < 0.85) rowC = pal.d;
    else               rowC = pal.vd;

    ctx.fillStyle = rowC;
    ctx.fillRect(px_, py_, pw_, 1);

    // Left cheek highlight band (top-left lit)
    if (t > 0.25 && t < 0.60) {
      ctx.fillStyle = pal.l;
      ctx.fillRect(px_, py_, Math.max(2, Math.round(pw_ * 0.28)), 1);
    }
    // Right cheek shadow band
    if (t > 0.30 && t < 0.72) {
      ctx.fillStyle = pal.d;
      ctx.fillRect(px_ + pw_ - Math.max(2, Math.round(pw_ * 0.22)), py_, Math.max(2, Math.round(pw_ * 0.22)), 1);
    }

    // Outer outline pixels at left and right edges of each row
    ctx.fillStyle = out;
    ctx.fillRect(px_ - 1, py_, 1, 1);
    ctx.fillRect(px_ + pw_, py_, 1, 1);
  }

  // Top and bottom cap outline
  for (let row = 0; row < h; row++) {
    if (row > 1 && row < h - 2) continue; // only first/last 2 rows
    const dy   = (row - ry + 0.5);
    const ratio = Math.max(0, 1 - (dy * dy) / (ry * ry));
    const hw   = Math.round(rx * Math.sqrt(ratio));
    if (hw <= 0) continue;
    const px_  = (cx - hw)|0;
    const pw_  = hw * 2;
    const py_  = (oy + row)|0;
    ctx.fillStyle = out;
    if (row < 2) ctx.fillRect(px_, py_ - 1, pw_, 1);
    if (row >= h - 2) ctx.fillRect(px_, py_ + 1, pw_, 1);
  }
}

// ─── FACE: DETAILED EYES, NOSE, MOUTH ─────────────────────────────────────────

function drawFace(ctx: CanvasRenderingContext2D, cx: number, eyeY: number, eyeColor: string, hairColor: string) {
  const WHITE  = '#EEE8E0';
  const PUPIL  = '#10080C';
  const brow   = shade(hairColor, -20);

  // Left eye socket (white 3×2, then iris 2×2 inside, pupil 1×2)
  const lx = cx - 7;
  const rx = cx + 2;
  for (const ex of [lx, rx]) {
    px(ctx, ex, eyeY,     3, 2, WHITE);            // eye white
    px(ctx, ex, eyeY,     2, 2, eyeColor);         // iris (left half of eye)
    px(ctx, ex, eyeY,     1, 2, PUPIL);            // pupil
    px(ctx, ex + 1, eyeY, 1, 1, shade(eyeColor, 45)); // iris highlight
    px(ctx, ex, eyeY - 1, 3, 1, shade(hairColor, -30)); // upper lash line
    px(ctx, ex, eyeY + 2, 3, 1, shade(PUPIL, 20)); // lower lash
  }

  // Eyebrows — arched, 2 heights
  px(ctx, lx - 1, eyeY - 3, 2, 1, brow);
  px(ctx, lx + 1, eyeY - 4, 2, 1, brow);
  px(ctx, lx + 3, eyeY - 3, 1, 1, brow);
  px(ctx, rx,     eyeY - 3, 1, 1, brow);
  px(ctx, rx + 1, eyeY - 4, 2, 1, brow);
  px(ctx, rx + 3, eyeY - 3, 1, 1, brow);

  // Nose bridge (2px shadow below eyes, 1px wide)
  px(ctx, cx, eyeY + 4, 1, 2, shade(eyeColor, -40));
  px(ctx, cx + 1, eyeY + 5, 1, 1, shade(eyeColor, -28));

  // Mouth (subtle 3px line)
  px(ctx, cx - 2, eyeY + 7, 4, 1, shade(eyeColor, -50));
  px(ctx, cx - 1, eyeY + 7, 2, 1, shade(eyeColor, -35)); // slightly lighter centre
}

// ─── HAIR ─────────────────────────────────────────────────────────────────────

export function drawHair(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, hairColor: string, charClass: CharacterClass) {
  const hx  = (cx - (w >> 1)) | 0;
  const hy  = (cy - (h >> 1)) | 0;
  const pal = palette(hairColor);

  // Crown — sits above head oval top
  px(ctx, hx + 1,     hy - 4, w - 2, 5, hairColor);
  px(ctx, hx + 2,     hy - 5, w - 4, 3, hairColor);
  px(ctx, hx + 3,     hy - 3, w - 6, 4, pal.l); // highlight on top
  // Hairline strip over forehead top
  px(ctx, hx,         hy,     w,     2, hairColor);

  // Side curtains
  px(ctx, hx - 2, hy + 2, 3, 10, hairColor);
  px(ctx, hx - 2, hy + 3, 2, 8,  pal.d); // side shadow
  px(ctx, hx + w - 1, hy + 2, 3, 10, hairColor);
  px(ctx, hx + w + 1, hy + 3, 1, 8,  pal.d);

  if (charClass === 'berserker') {
    // Wild spiky tufts
    px(ctx, hx - 3, hy - 1, 3, 6, hairColor);
    px(ctx, hx + w,  hy - 1, 3, 6, hairColor);
    px(ctx, cx - 1,  hy - 6, 2, 4, hairColor);
    px(ctx, cx - 3,  hy - 5, 2, 3, hairColor);
    px(ctx, cx + 1,  hy - 5, 2, 3, hairColor);
  } else if (charClass === 'mage') {
    // Long flowing locks at sides (visible below hat brim)
    px(ctx, hx - 2, hy + 10, 3, 12, hairColor);
    px(ctx, hx + w - 1, hy + 10, 3, 12, hairColor);
    px(ctx, hx - 1, hy + 14, 2, 6, pal.d); // deep shadow at bottom of lock
  } else if (charClass === 'ranger') {
    px(ctx, hx - 2, hy + 4, 2, 12, hairColor);
    px(ctx, hx + w,  hy + 4, 2, 9,  hairColor);
  }
}

// ─── HEADGEAR ─────────────────────────────────────────────────────────────────

function drawHeadgear(ctx: CanvasRenderingContext2D, char: CharacterDef, cx: number, baseY: number, hw: number) {
  const ac      = char.accentColor;
  const arm     = AT[char.armorTier];
  const headTopY = baseY + 5;
  const apal    = palette(arm.b);

  switch (char.class) {
    case 'warrior': {
      // Full closed bucket/sallet helmet
      const hc  = arm.b;
      const pal = palette(hc);
      const hW  = hw * 2 + 4; // covers head + 2px overlap each side
      const hX  = cx - hw - 2;

      // Dome top — 4-tone top-lit
      px(ctx, hX + 2, headTopY - 2, hW - 4, 3,  pal.hi); // specular top
      px(ctx, hX + 1, headTopY + 1, hW - 2, 3,  pal.l);
      px(ctx, hX,     headTopY + 4, hW,     5,  pal.b);
      px(ctx, hX,     headTopY + 9, hW,     3,  pal.d);

      // Dithered highlight/mid transition row
      ditherRow(ctx, hX + 1, headTopY + 3, hW - 2, pal.l, pal.b);

      // Cheek guards (sides — darker)
      px(ctx, hX - 2, headTopY + 3, 3, 11, pal.d);
      px(ctx, hX + hW - 1, headTopY + 3, 3, 11, pal.vd);

      // Visor slit (T-shaped opening)
      px(ctx, cx - 6, headTopY + 7, 12, 3, pal.vd);   // horizontal bar
      px(ctx, cx - 1, headTopY + 5, 2, 7,  pal.vd);   // nose guard strip
      px(ctx, cx - 5, headTopY + 8, 10, 1, '#0A060E'); // dark inner slit

      // Eye glow visible through visor
      px(ctx, cx - 4, headTopY + 8, 3, 1, shade(char.eyeColor, 30));
      px(ctx, cx + 1, headTopY + 8, 3, 1, shade(char.eyeColor, 30));

      // Helm outline
      pxOutline(ctx, hX, headTopY, hW, 12, pal.vd);
      px(ctx, hX + 1, headTopY - 1, hW - 2, 1, pal.vd); // top curve
      px(ctx, hX - 1, headTopY + 2, 1, 10, pal.vd);
      px(ctx, hX + hW + 1, headTopY + 2, 1, 10, pal.vd);

      // Plume for rare+
      if (char.rarity !== 'common' && char.rarity !== 'uncommon') {
        const plyC = ac;
        px(ctx, cx - 2, headTopY - 7, 4, 8, plyC);
        px(ctx, cx - 1, headTopY - 9, 2, 3, shade(plyC, 30));
        px(ctx, cx - 3, headTopY - 6, 2, 5, shade(plyC, -20));
        px(ctx, cx + 2, headTopY - 6, 1, 5, shade(plyC, -20));
      }
      break;
    }

    case 'paladin': {
      // Great helm with cross-shaped visor and holy plume
      const hc  = shade(arm.b, 12);
      const pal = palette(hc);
      const hW  = hw * 2 + 4;
      const hX  = cx - hw - 2;

      px(ctx, hX + 2, headTopY - 2, hW - 4, 3,  pal.hi);
      px(ctx, hX + 1, headTopY + 1, hW - 2, 3,  pal.l);
      px(ctx, hX,     headTopY + 4, hW,     5,  pal.b);
      px(ctx, hX,     headTopY + 9, hW,     3,  pal.d);
      ditherRow(ctx, hX + 1, headTopY + 3, hW - 2, pal.l, pal.b);

      px(ctx, hX - 2, headTopY + 3, 3, 11, pal.d);
      px(ctx, hX + hW - 1, headTopY + 3, 3, 11, pal.vd);

      // Cross visor (horizontal bar + vertical nose guard)
      px(ctx, cx - 6, headTopY + 7, 12, 2, pal.vd);
      px(ctx, cx - 1, headTopY + 4, 2,  8, pal.vd);
      px(ctx, cx - 5, headTopY + 8, 10, 1, '#0A060E');

      // Holy light glow through cross
      px(ctx, cx - 4, headTopY + 8, 3, 1, shade(ac, 40));
      px(ctx, cx + 1, headTopY + 8, 3, 1, shade(ac, 40));

      pxOutline(ctx, hX, headTopY, hW, 12, pal.vd);
      px(ctx, hX + 1, headTopY - 1, hW - 2, 1, pal.vd);

      // Tall holy plume always present
      px(ctx, cx - 2, headTopY - 8, 4, 9, ac);
      px(ctx, cx - 1, headTopY - 10, 2, 4, shade(ac, 30));
      px(ctx, cx - 3, headTopY - 7,  2, 6, shade(ac, -20));
      px(ctx, cx + 2, headTopY - 7,  1, 6, shade(ac, -15));
      break;
    }

    case 'mage': {
      // Tall pointed wizard hat — wide 22px brim, 3-step cone
      const hc   = char.armorColor;
      const pal  = palette(hc);
      const brimY = headTopY + 1;
      const brimW = 22;
      const brimX = cx - 11;

      // Brim — shaded slab
      px(ctx, brimX, brimY,     brimW, 1, pal.hi);   // specular top edge
      px(ctx, brimX, brimY + 1, brimW, 2, pal.l);
      px(ctx, brimX, brimY + 3, brimW, 1, pal.d);    // underside shadow
      // Accent band on brim
      px(ctx, brimX + 2, brimY + 1, brimW - 4, 1, ac);

      // Cone step 1 (base, 14px wide)
      px(ctx, cx - 7, brimY - 6, 14, 1, pal.hi);
      px(ctx, cx - 7, brimY - 5, 14, 4, pal.b);
      px(ctx, cx - 7, brimY - 5,  1, 4, pal.l); // left lit edge
      px(ctx, cx + 6, brimY - 5,  1, 4, pal.d); // right shadow

      // Cone step 2 (mid, 10px wide)
      px(ctx, cx - 5, brimY - 12, 10, 1, pal.hi);
      px(ctx, cx - 5, brimY - 11, 10, 6, pal.b);
      px(ctx, cx - 5, brimY - 11,  1, 6, pal.l);
      px(ctx, cx + 4, brimY - 11,  1, 6, pal.d);

      // Dither transition between steps
      ditherRow(ctx, cx - 5, brimY - 6, 10, pal.b, pal.d);

      // Cone step 3 (upper, 6px wide)
      px(ctx, cx - 3, brimY - 18, 6, 1, pal.hi);
      px(ctx, cx - 3, brimY - 17, 6, 6, pal.b);
      px(ctx, cx - 3, brimY - 17, 1, 6, pal.l);
      px(ctx, cx + 2, brimY - 17, 1, 6, pal.d);

      ditherRow(ctx, cx - 3, brimY - 12, 6, pal.b, pal.d);

      // Tip
      px(ctx, cx - 1, brimY - 22, 2, 5, shade(hc, 10));
      px(ctx, cx,     brimY - 24, 1, 3, pal.l);

      // Hat outlines — follow cone shape
      px(ctx, brimX, brimY,       1, 4, pal.vd);
      px(ctx, brimX + brimW - 1, brimY, 1, 4, pal.vd);
      px(ctx, brimX, brimY - 1,   1, 1, pal.vd); // corner pixel
      px(ctx, brimX + brimW, brimY - 1, 1, 1, pal.vd);
      px(ctx, cx - 8, brimY - 5,  1, 7, pal.vd);
      px(ctx, cx + 7, brimY - 5,  1, 7, pal.vd);
      px(ctx, cx - 6, brimY - 11, 1, 7, pal.vd);
      px(ctx, cx + 5, brimY - 11, 1, 7, pal.vd);
      px(ctx, cx - 4, brimY - 17, 1, 7, pal.vd);
      px(ctx, cx + 3, brimY - 17, 1, 7, pal.vd);
      px(ctx, cx - 2, brimY - 22, 1, 6, pal.vd);
      px(ctx, cx + 1, brimY - 22, 1, 6, pal.vd);

      // Star gem on cone for rare+
      if (char.rarity !== 'common') {
        px(ctx, cx - 1, brimY - 9, 2, 2, shade(ac, 30));
        px(ctx, cx,     brimY - 10, 1, 1, shade(ac, 60));
      }
      break;
    }

    case 'rogue': {
      // Deep shadow hood — close-fitting with strong forehead shadow
      const hc  = shade(char.armorColor, 5);
      const pal = palette(hc);
      const hW  = hw * 2 + 4;
      const hX  = cx - hw - 2;

      // Hood outer shape (wraps head fully)
      px(ctx, hX,     headTopY,     hW,     2, pal.l);   // top lit edge
      px(ctx, hX - 1, headTopY + 2, hW + 2, 9, pal.b);
      px(ctx, hX - 1, headTopY + 2, hW + 2, 1, pal.l);  // highlight rim
      px(ctx, hX - 2, headTopY + 4, 2,      8, pal.d);  // left deep shadow
      px(ctx, hX + hW + 1, headTopY + 4, 2, 8, pal.vd); // right deeper shadow
      // Hood peak
      px(ctx, cx - 2, headTopY - 4, 4, 5, pal.b);
      px(ctx, cx - 1, headTopY - 5, 2, 2, pal.l);
      // Inner shadow (deep forehead darkness)
      px(ctx, cx - 6, headTopY + 3, 12, 5, pal.vd);
      // Face opening — lighter to show skin
      px(ctx, cx - 4, headTopY + 5, 8,  5, shade(hc, -28));
      pxOutline(ctx, hX - 1, headTopY + 2, hW + 2, 9, pal.vd);
      break;
    }

    case 'ranger': {
      // Leather ranger hood — looser, with feather for rare+
      const hc  = shade(char.armorColor, 10);
      const pal = palette(hc);
      const hW  = hw * 2 + 3;
      const hX  = cx - hw - 1;

      // Hood back panel (wider, darker)
      px(ctx, hX - 2, headTopY, hW + 4, 14, pal.d);
      // Hood front
      px(ctx, hX,     headTopY + 1, hW, 1, pal.hi); // rim highlight
      px(ctx, hX,     headTopY + 2, hW, 9, pal.b);
      px(ctx, hX - 1, headTopY + 4, 2,  7, pal.d);  // left shadow
      px(ctx, hX + hW, headTopY + 4, 2, 7, pal.vd); // right deeper
      // Peak
      px(ctx, cx - 2, headTopY - 3, 4, 4, pal.b);
      px(ctx, cx - 1, headTopY - 4, 2, 2, pal.l);
      // Inner face shadow
      px(ctx, cx - 4, headTopY + 3, 8, 5, pal.d);
      pxOutline(ctx, hX, headTopY + 2, hW, 9, pal.vd);

      if (char.rarity !== 'common') {
        // Feather on right side
        const fx = hX + hW + 1;
        px(ctx, fx,     headTopY - 3, 2, 10, ac);
        px(ctx, fx - 1, headTopY - 2, 2,  4, shade(ac, 25));
        px(ctx, fx + 1, headTopY + 1, 2,  5, shade(ac, -15));
        px(ctx, fx,     headTopY - 4, 2,  1, shade(ac, 40));
      }
      break;
    }

    case 'berserker': {
      // Spiked horned headband + wild exposed top
      const hc  = shade(arm.b, -10);
      const pal = palette(hc);
      const hornC = shade(arm.b, -40);

      // Headband strip
      px(ctx, cx - hw - 2, headTopY + 6, hw * 2 + 4, 5, pal.b);
      px(ctx, cx - hw - 2, headTopY + 6, hw * 2 + 4, 1, pal.l); // top edge lit
      px(ctx, cx - hw - 2, headTopY + 10, hw * 2 + 4, 1, pal.d); // bottom shadow
      // Accent rivets
      px(ctx, cx - 4, headTopY + 7, 3, 3, ac);
      px(ctx, cx - 3, headTopY + 8, 1, 1, shade(ac, 50));
      px(ctx, cx + 1, headTopY + 7, 3, 3, ac);
      px(ctx, cx + 2, headTopY + 8, 1, 1, shade(ac, 50));
      pxOutline(ctx, cx - hw - 2, headTopY + 6, hw * 2 + 4, 5, pal.vd);

      // Left horn (curved, 3 segments)
      px(ctx, cx - hw - 5, headTopY + 4, 4, 3, hornC);
      px(ctx, cx - hw - 4, headTopY + 2, 3, 3, hornC);
      px(ctx, cx - hw - 3, headTopY,     2, 3, shade(hornC, 10));
      px(ctx, cx - hw - 5, headTopY + 4, 1, 3, shade(hornC, 12)); // horn highlight
      // Right horn
      px(ctx, cx + hw + 2, headTopY + 4, 4, 3, hornC);
      px(ctx, cx + hw + 2, headTopY + 2, 3, 3, hornC);
      px(ctx, cx + hw + 2, headTopY,     2, 3, shade(hornC, 10));
      px(ctx, cx + hw + 5, headTopY + 4, 1, 3, shade(hornC, -14)); // horn shadow
      break;
    }
  }
}

// ─── BODY: TORSO with TRAPEZOID SHAPE & 4-TONE SHADING ───────────────────────

export function drawTorsoArmor(
  ctx: CanvasRenderingContext2D,
  cx: number, torsoY: number,
  w: number, h: number,
  armorBase: string, armorLight: string, armorDark: string,
  beltColor: string, charClass: CharacterClass,
  accentColor: string, isBerserker: boolean
) {
  const tx   = (cx - (w >> 1)) | 0;
  const pal  = palette(armorBase);
  const out  = pal.vd;

  rimLightPx(ctx, tx, torsoY, w, h, "rgba(255,255,255,0.25)");
  innerShadowPx(ctx, tx, torsoY, w, h, "rgba(0,0,0,0.2)");
  addGritPx(ctx, tx, torsoY, w, h, 0.08);

  // ── Draw torso row-by-row with trapezoid shape ──
  // Rows 0-3: wide pauldron area; rows 4-10: chest; rows 11+: slight waist taper
  const totalRows = h;
  for (let row = 0; row < totalRows; row++) {
    let extraW = 0;
    let extraX = 0;

    if (row < 4) {
      // Pauldron zone — wider each side
      extraW = (charClass === 'warrior' || charClass === 'paladin' || charClass === 'berserker') ? 6 : 2;
    } else if (row < 6) {
      // Shoulder taper back to normal
      extraW = (charClass === 'warrior' || charClass === 'paladin' || charClass === 'berserker') ? 3 : 1;
    } else if (row >= totalRows - 3) {
      // Waist taper for non-heavy classes
      extraX = (charClass === 'warrior' || charClass === 'paladin' || charClass === 'berserker') ? 0 : 1;
      extraW = -extraX * 2;
    }

    const rx_ = tx - (extraW >> 1) + extraX;
    const rw_ = w + extraW - extraX * 2;
    const ry_ = torsoY + row;
    const t   = row / (totalRows - 1);

    // 4-tone lighting — top lit, bottom shadow
    let rowC: string;
    if (row === 0) rowC = pal.hi;
    else if (t < 0.22) rowC = pal.l;
    else if (t < 0.68) rowC = pal.b;
    else               rowC = pal.d;

    ctx.fillStyle = rowC;
    ctx.fillRect(rx_, ry_, rw_, 1);

    // Dithered transition rows
    if (row === 2) ditherRow(ctx, rx_, ry_, rw_, pal.l, pal.b);
    if (row === Math.round(totalRows * 0.65)) ditherRow(ctx, rx_, ry_, rw_, pal.b, pal.d);

    // Right-side shadow strip
    if (row >= 4 && row < totalRows - 1) {
      ctx.fillStyle = pal.d;
      ctx.fillRect(rx_ + rw_ - 2, ry_, 2, 1);
    }
    // Left-side highlight strip
    if (row >= 4 && row < totalRows - 2 && row !== totalRows - 3) {
      ctx.fillStyle = pal.l;
      ctx.fillRect(rx_, ry_, 2, 1);
    }

    // Pauldron top outline
    if (row === 0 || (row === 4 && extraW > 0)) {
      ctx.fillStyle = out;
      ctx.fillRect(rx_ - 1, ry_, rw_ + 2, 1);
    }
    // Side outline for pauldrons
    if (row < 6 && extraW > 0) {
      ctx.fillStyle = out;
      ctx.fillRect(rx_ - 1, ry_, 1, 1);
      ctx.fillRect(rx_ + rw_, ry_, 1, 1);
    }
  }

  // Berserker spikes on pauldrons
  if (isBerserker) {
    const spikeC = shade(armorBase, -28);
    px(ctx, tx - (w >> 1) + 2, torsoY - 4, 3, 5, spikeC);
    px(ctx, tx + w + (w >> 1) - 5, torsoY - 4, 3, 5, spikeC);
    px(ctx, tx - (w >> 1) + 4, torsoY - 5, 1, 3, shade(spikeC, 15));
    px(ctx, tx + w + (w >> 1) - 3, torsoY - 5, 1, 3, shade(spikeC, 15));
  }

  // ── Chest centerline ridge (depth illusion) ──
  px(ctx, cx, torsoY + 4, 1, h - 6, shade(armorBase, -18));

  // ── Class emblem on chest ──
  switch (charClass) {
    case 'warrior':
      // Chevron / V-shape emblem
      px(ctx, cx - 1, torsoY + 5, 3, 9, shade(accentColor, -15));
      px(ctx, cx - 4, torsoY + 9, 9, 3, shade(accentColor, -15));
      px(ctx, cx,     torsoY + 5, 1, 9, shade(accentColor, 20)); // highlight
      break;
    case 'paladin':
      // Holy cross — large and clean
      px(ctx, cx - 1, torsoY + 4, 3, 12, accentColor);
      px(ctx, cx - 5, torsoY + 8, 11, 3,  accentColor);
      px(ctx, cx,     torsoY + 4, 1, 12, shade(accentColor, 40)); // cross highlight
      px(ctx, cx - 1, torsoY + 10, 1, 1, shade(accentColor, 60)); // center gem
      break;
    case 'berserker':
      // Skull-ish chevron
      px(ctx, cx - 2, torsoY + 4, 5, 2, accentColor);
      px(ctx, cx - 4, torsoY + 8, 9, 2, accentColor);
      px(ctx, cx - 2, torsoY + 12, 5, 2, accentColor);
      break;
    case 'mage':
      // Arcane vertical stripe + horizontal bar
      px(ctx, cx - 1, torsoY + 2, 3, 14, shade(accentColor, -10));
      px(ctx, cx - 4, torsoY + 7, 9, 2, accentColor);
      px(ctx, cx,     torsoY + 5, 1, 1, shade(accentColor, 50));
      break;
    case 'rogue':
      // Crossed strap / bandolier
      for (let i = 0; i < 3; i++) {
        px(ctx, tx + 2 + i * 2, torsoY + 2, w - 4 - i * 3, 1, shade(armorBase, -30));
      }
      px(ctx, cx - 2, torsoY + 4, 4, 3, accentColor); // buckle
      px(ctx, cx - 1, torsoY + 5, 2, 1, shade(accentColor, 40));
      break;
    case 'ranger':
      // Quiver strap (diagonal)
      px(ctx, tx + 2, torsoY + 1, 2, h - 2, shade(armorBase, -24));
      px(ctx, tx + 5, torsoY + 4, 2, h - 5, shade(armorBase, -18));
      px(ctx, tx + 3, torsoY + 2, 1, h - 3, shade(armorBase, -10)); // strap highlight
      break;
  }

  // ── Belt ──
  const beltY = torsoY + h;
  const bpal  = palette(beltColor);
  px(ctx, tx - 1, beltY,     w + 2, 4, beltColor);
  px(ctx, tx - 1, beltY,     w + 2, 1, bpal.l);    // top highlight
  px(ctx, tx - 1, beltY + 3, w + 2, 1, bpal.d);    // bottom shadow
  // Buckle
  px(ctx, cx - 2, beltY + 1, 5, 2, shade(beltColor, 35));
  px(ctx, cx - 1, beltY + 1, 3, 2, shade(beltColor, 55));
  // Belt outline
  px(ctx, tx - 2, beltY - 1, w + 4, 1, out);
  px(ctx, tx - 2, beltY + 4, w + 4, 1, out);

  // Torso outer outline
  pxOutline(ctx, tx, torsoY, w, h, out);
}

// ─── BODY: MAGE ROBE (extra wide, with fold shading) ─────────────────────────

function drawMageRobe(
  ctx: CanvasRenderingContext2D,
  cx: number, baseY: number,
  char: CharacterDef
) {
  const rc   = char.armorColor;
  const pal  = palette(rc);
  const ac   = char.accentColor;
  const robeTopY = baseY + 24;

  addGritPx(ctx, (cx - 9)|0, robeTopY, 18, 36, 0.05);

  // ── Upper robe / bodice ──
  const uw = 18; // bodice width
  const utx = (cx - (uw >> 1)) | 0;

  // Draw bodice row by row (slight shoulder taper)
  for (let row = 0; row < 14; row++) {
    const extra = row < 3 ? 4 : (row < 5 ? 2 : 0);
    const rx_ = utx - (extra >> 1);
    const rw_ = uw + extra;
    const t   = row / 13;
    let rowC: string;
    if (row === 0) rowC = pal.hi;
    else if (t < 0.25) rowC = pal.l;
    else if (t < 0.70) rowC = pal.b;
    else               rowC = pal.d;
    ctx.fillStyle = rowC;
    ctx.fillRect(rx_, robeTopY + row, rw_, 1);
    if (row === 2) ditherRow(ctx, rx_, robeTopY + row, rw_, pal.l, pal.b);
    if (row === 9) ditherRow(ctx, rx_, robeTopY + row, rw_, pal.b, pal.d);
    // Right shadow
    ctx.fillStyle = pal.d;
    ctx.fillRect(rx_ + rw_ - 2, robeTopY + row, 2, 1);
    // Side outlines
    ctx.fillStyle = pal.vd;
    if (row === 0 || (extra > 0 && row === 3)) ctx.fillRect(rx_ - 1, robeTopY + row, rw_ + 2, 1);
    ctx.fillRect(rx_ - 1, robeTopY + row, 1, 1);
    ctx.fillRect(rx_ + rw_, robeTopY + row, 1, 1);
  }

  // Center clasp & trim
  px(ctx, cx - 1, robeTopY,     2, 14, shade(ac, -15));
  px(ctx, cx - 2, robeTopY + 4, 4,  2, ac);
  px(ctx, cx - 1, robeTopY + 4, 2,  1, shade(ac, 40));
  px(ctx, cx - 2, robeTopY + 9, 4,  2, ac);

  // ── Belt ──
  const beltY = robeTopY + 13;
  const bpal  = palette(shade(rc, -35));
  px(ctx, utx - 3, beltY, uw + 6, 5, shade(rc, -35));
  px(ctx, utx - 3, beltY, uw + 6, 1, bpal.l);
  px(ctx, utx - 3, beltY + 4, uw + 6, 1, bpal.vd);
  px(ctx, cx - 3, beltY + 1, 6, 3, shade(rc, -20));
  px(ctx, cx - 2, beltY + 1, 4, 3, shade(rc, 0));
  px(ctx, cx - 1, beltY + 2, 2, 1, shade(rc, 40)); // buckle gleam
  // Belt outline
  px(ctx, utx - 4, beltY - 1, uw + 8, 1, pal.vd);
  px(ctx, utx - 4, beltY + 5, uw + 8, 1, pal.vd);

  // ── Lower robe — wide flaring trapezoid ──
  const lrobeTopY = beltY + 5;
  const maxExpand = 10; // max extra pixels each side at hem
  const robeRows  = 19;
  for (let i = 0; i < robeRows; i++) {
    const expansion = Math.round((i / (robeRows - 1)) * maxExpand);
    const rw_ = uw + expansion * 2;
    const rx_ = (cx - (rw_ >> 1)) | 0;
    const ry_ = lrobeTopY + i;
    if (ry_ >= 62) break;

    // Fold shading — subtle alternating bands every ~5 rows
    const foldT = (i % 6) / 5;
    let foldShade = 0;
    if (foldT < 0.2 || foldT > 0.8) foldShade = 10;    // fold lit top
    else if (foldT > 0.4 && foldT < 0.6) foldShade = -14; // fold shadow

    ctx.fillStyle = shade(rc, foldShade);
    ctx.fillRect(rx_, ry_, rw_, 1);

    // Left lit edge / right shadow edge
    ctx.fillStyle = shade(rc, 20);
    ctx.fillRect(rx_, ry_, 2, 1);
    ctx.fillStyle = shade(rc, -20);
    ctx.fillRect(rx_ + rw_ - 2, ry_, 2, 1);

    // Outline at edges
    ctx.fillStyle = pal.vd;
    ctx.fillRect(rx_ - 1, ry_, 1, 1);
    ctx.fillRect(rx_ + rw_, ry_, 1, 1);
  }

  // Hem trim
  const hemW = uw + maxExpand * 2;
  const hemX = (cx - (hemW >> 1)) | 0;
  const hemY = lrobeTopY + robeRows - 1;
  if (hemY < 60) {
    px(ctx, hemX, hemY,     hemW, 3, shade(rc, -28));
    px(ctx, hemX, hemY,     hemW, 1, shade(rc, 0));   // hem top highlight
    px(ctx, hemX + 2, hemY + 1, hemW - 4, 1, ac);     // accent trim line
    px(ctx, hemX - 1, hemY, 1, 3, pal.vd);
    px(ctx, hemX + hemW, hemY, 1, 3, pal.vd);
  }

  // ── Boot toes peeking under robe hem ──
  const bty = baseY + 56;
  if (bty < 62) {
    const bootC = shade(rc, -50);
    const bpal2 = palette(bootC);
    // Left boot
    px(ctx, cx - 8, bty, 7, 5, bootC);
    px(ctx, cx - 8, bty, 7, 1, bpal2.l);
    px(ctx, cx - 8, bty + 4, 7, 1, bpal2.d);
    pxOutline(ctx, cx - 8, bty, 7, 5, bpal2.vd);
    // Right boot (in front, slightly lighter)
    px(ctx, cx + 1, bty, 7, 5, shade(bootC, 10));
    px(ctx, cx + 1, bty, 7, 1, bpal2.hi);
    px(ctx, cx + 1, bty + 4, 7, 1, bootC);
    pxOutline(ctx, cx + 1, bty, 7, 5, bpal2.vd);
  }
}

// ─── BODY: ARMS ──────────────────────────────────────────────────────────────

export function drawArms(
  ctx: CanvasRenderingContext2D,
  cx: number, armY: number,
  armW: number, armH: number,
  backArmOffset: number, frontArmOffset: number,
  armorColor: string, skinColor: string,
  isLeft: boolean
) {
  const pal = palette(armorColor);
  const ax  = isLeft ? (cx - armW - backArmOffset) : (cx + frontArmOffset);

  rimLightPx(ctx, ax, armY, armW, armH, "rgba(255,255,255,0.15)");
  addGritPx(ctx, ax, armY, armW, armH, 0.06);

  // Arm body — 4-tone left-lit
  for (let row = 0; row < armH; row++) {
    const t = row / (armH - 1);
    let c: string;
    if (t < 0.12) c = pal.hi;
    else if (t < 0.35) c = pal.l;
    else if (t < 0.75) c = pal.b;
    else               c = pal.d;
    ctx.fillStyle = c;
    ctx.fillRect(ax, armY + row, armW, 1);
  }
  // Left-lit vertical edge
  ctx.fillStyle = pal.l;
  ctx.fillRect(ax, armY + 1, 1, armH - 2);
  // Right shadow strip
  ctx.fillStyle = pal.d;
  ctx.fillRect(ax + armW - 1, armY + 2, 1, armH - 3);

  // Dither top highlight/mid transition
  ditherRow(ctx, ax, armY + 2, armW, pal.l, pal.b, isLeft ? 0 : 1);

  // Gauntlet/hand (skin exposed at wrist)
  const handY = armY + armH;
  const skinPal = palette(skinColor);
  px(ctx, ax, handY, armW, 4, skinColor);
  px(ctx, ax, handY, armW, 1, skinPal.l);        // wrist highlight
  px(ctx, ax + armW - 1, handY + 1, 1, 2, skinPal.d); // wrist shadow

  // Outline
  pxOutline(ctx, ax, armY, armW, armH + 4, pal.vd);
}

// ─── BODY: LEGS ──────────────────────────────────────────────────────────────

export function drawLegs(
  ctx: CanvasRenderingContext2D,
  cx: number, legTopY: number,
  legW: number, legH: number,
  leftDy: number, rightDy: number,
  armorColor: string
) {
  const pal     = palette(armorColor);
  const bootC   = shade(armorColor, -36);
  const bootPal = palette(bootC);

  const drawLeg = (lx: number, ly: number, isRight: boolean) => {
    rimLightPx(ctx, lx, ly, legW, legH, "rgba(255,255,255,0.2)");
    addGritPx(ctx, lx, ly, legW, legH, 0.07);

    // Thigh — top-lit
    for (let row = 0; row < legH; row++) {
      const t = row / (legH - 1);
      let c: string;
      if (row === 0) c = pal.hi;
      else if (t < 0.20) c = pal.l;
      else if (t < 0.55) c = pal.b;
      else if (t < 0.80) c = pal.d;
      else               c = pal.vd; // back of knee shadow
      ctx.fillStyle = c;
      ctx.fillRect(lx, ly + row, legW, 1);
    }
    // Knee cap highlight (1/3 down)
    const kneeRow = Math.round(legH * 0.28);
    ctx.fillStyle = pal.hi;
    ctx.fillRect(lx + 1, ly + kneeRow, legW - 2, 2);
    ctx.fillStyle = pal.l;
    ctx.fillRect(lx, ly + kneeRow - 1, legW, 1);
    // Inner-leg shadow (separation)
    ctx.fillStyle = pal.vd;
    ctx.fillRect(isRight ? lx : lx + legW - 1, ly + 2, 1, legH - 3);
    // Left lit edge on outer side
    ctx.fillStyle = pal.l;
    ctx.fillRect(isRight ? lx + legW - 1 : lx, ly + 1, 1, legH - 2);

    // Boot top
    px(ctx, lx - 1, ly + legH,     legW + 2, 4, bootC);
    px(ctx, lx - 1, ly + legH,     legW + 2, 1, bootPal.l);
    px(ctx, lx - 1, ly + legH + 3, legW + 2, 1, bootPal.d);
    // Boot toe (extended, adds depth)
    px(ctx, lx - 2, ly + legH + 4, legW + 4, 3, shade(bootC, -6));
    px(ctx, lx - 2, ly + legH + 4, legW + 4, 1, bootPal.l);
    // Outer outline
    pxOutline(ctx, lx, ly, legW, legH, pal.vd);
    px(ctx, lx - 1, ly + legH, 1, 7, bootPal.vd);      // boot left
    px(ctx, lx + legW, ly + legH, 1, 7, bootPal.vd);    // boot right
    px(ctx, lx - 2, ly + legH + 4, 1, 3, bootPal.vd);   // toe left
    px(ctx, lx + legW + 2, ly + legH + 4, 1, 3, bootPal.vd); // toe right
    px(ctx, lx - 2, ly + legH + 7, legW + 5, 1, bootPal.vd); // toe bottom
  };

  // Left leg (cx-legW-3 so there's a visible gap between legs)
  drawLeg((cx - legW - 3)|0, (legTopY + leftDy)|0, false);
  // Right leg
  drawLeg((cx + 3)|0, (legTopY + rightDy)|0, true);
}

// ─── EQUIPMENT: SHIELD ────────────────────────────────────────────────────────
// Heater / kite shield — large, distinct color, prominent boss stud

function drawShield(ctx: CanvasRenderingContext2D, char: CharacterDef, shieldX: number, shieldY: number) {
  // Shield uses a contrasting material — slightly lighter/silver toned vs armor
  const sc   = shade(AT[char.armorTier].b, 20);  // slightly brighter than armor
  const pal  = palette(sc);
  const ac   = char.accentColor;

  // Top rectangular section (13×14)
  // 4-tone top-lit shading
  px(ctx, shieldX,     shieldY,     13, 2, pal.hi);    // specular top
  px(ctx, shieldX,     shieldY + 2, 13, 4, pal.l);
  ditherRow(ctx, shieldX, shieldY + 5, 13, pal.l, pal.b);
  px(ctx, shieldX,     shieldY + 6, 13, 5, pal.b);
  ditherRow(ctx, shieldX, shieldY + 10, 13, pal.b, pal.d);
  px(ctx, shieldX,     shieldY + 11, 13, 3, pal.d);

  // Right shadow strip
  px(ctx, shieldX + 11, shieldY + 1, 2, 12, pal.vd);
  // Left lit strip
  px(ctx, shieldX, shieldY + 2, 2, 10, pal.l);

  // Dividing cross (heraldic)
  const cX = shieldX + 6;
  px(ctx, cX, shieldY + 1, 1, 12, shade(sc, -14)); // vertical
  px(ctx, shieldX + 1, shieldY + 6, 10, 1, shade(sc, -14)); // horizontal

  // Boss (center rivet/umbo)
  px(ctx, shieldX + 4, shieldY + 4, 5, 5, shade(sc, 28));
  px(ctx, shieldX + 5, shieldY + 5, 3, 3, pal.hi);
  px(ctx, shieldX + 6, shieldY + 6, 1, 1, '#FFFFFF'); // specular dot

  // Accent: heraldic marking in upper quadrant
  if (char.rarity !== 'common') {
    px(ctx, shieldX + 2, shieldY + 1, 3, 4, shade(ac, -10));
    px(ctx, shieldX + 2, shieldY + 1, 3, 1, shade(ac, 20));
  }

  // Top outline
  pxOutline(ctx, shieldX, shieldY, 13, 14, pal.vd);
  px(ctx, shieldX + 1, shieldY - 1, 11, 1, pal.vd); // top arc

  // Tapering bottom (kite point)
  px(ctx, shieldX + 1, shieldY + 14, 11, 2, pal.b);
  px(ctx, shieldX + 1, shieldY + 14, 11, 1, shade(sc, -4));
  px(ctx, shieldX + 2, shieldY + 16,  9, 2, pal.d);
  px(ctx, shieldX + 3, shieldY + 18,  7, 2, shade(pal.d, -10));
  px(ctx, shieldX + 4, shieldY + 20,  5, 2, pal.vd);
  px(ctx, shieldX + 5, shieldY + 22,  3, 2, shade(pal.vd, -10));
  px(ctx, shieldX + 6, shieldY + 24,  1, 2, pal.vd);

  // Taper outline
  px(ctx, shieldX, shieldY + 14, 1, 8, pal.vd);
  px(ctx, shieldX + 12, shieldY + 14, 1, 8, pal.vd);
  px(ctx, shieldX + 1, shieldY + 22, 1, 4, pal.vd);
  px(ctx, shieldX + 11, shieldY + 22, 1, 4, pal.vd);
}

// ─── EQUIPMENT: WEAPONS ──────────────────────────────────────────────────────

export function drawWeapon(
  ctx: CanvasRenderingContext2D,
  char: CharacterDef,
  armX: number, armY: number,
  attacking: boolean, frameIdx: number,
  facing: 'south' | 'east'
) {
  const wc   = char.weaponTint;
  const pal  = palette(wc);
  const metal = shade(wc, -14);

  switch (char.class) {
    case 'warrior': {
      if (facing === 'south') {
        const sx = armX + 1;
        const sy = armY + 3;
        // Blade — 3px wide with metallic gradient (left-lit)
        px(ctx, sx + 1, sy,      1, 28, pal.hi);   // left edge shine
        px(ctx, sx + 2, sy,      1, 28, pal.l);    // main face
        px(ctx, sx + 3, sy,      1, 28, pal.d);    // right shadow
        px(ctx, sx + 2, sy,      1,  1, '#FFFFFF'); // tip gleam
        px(ctx, sx + 1, sy + 1,  1,  1, '#E0E8F8'); // sub-tip gleam
        // Fuller groove (center of blade, very subtle)
        px(ctx, sx + 2, sy + 5,  1, 18, shade(wc, -6));
        // Crossguard
        px(ctx, sx - 3, sy + 3,  9,  3, metal);
        px(ctx, sx - 3, sy + 3,  9,  1, pal.l);    // top highlight
        px(ctx, sx - 2, sy + 5,  7,  1, pal.vd);   // bottom shadow
        px(ctx, sx + 1, sy + 3,  1,  1, '#FFFFFF'); // guard gleam
        // Handle / grip
        px(ctx, sx + 1, sy + 6,  3,  7, shade(metal, -22));
        px(ctx, sx + 1, sy + 6,  1,  7, shade(metal, 10));  // grip highlight
        px(ctx, sx + 2, sy + 8,  1,  3, shade(metal, -35)); // wrap shadow
        px(ctx, sx + 2, sy + 11, 1,  1, shade(metal, -35));
        // Pommel
        px(ctx, sx,     sy + 13, 4,  3, pal.l);
        px(ctx, sx + 1, sy + 14, 2,  1, '#FFFFFF');
        pxOutline(ctx, sx - 3, sy + 3, 9, 3, pal.vd);
      } else {
        px(ctx, armX + 2, armY - 12, 2, 32, pal.l);
        px(ctx, armX + 3, armY - 12, 1, 32, pal.d);
        px(ctx, armX - 2, armY + 4,  9,  3, metal);
        px(ctx, armX - 2, armY + 4,  9,  1, pal.l);
        pxOutline(ctx, armX - 2, armY + 4, 9, 3, pal.vd);
      }
      break;
    }

    case 'paladin': {
      if (facing === 'south') {
        const sx = armX + 1;
        const sy = armY + 3;
        // Holy sword blade — slightly wider
        px(ctx, sx + 1, sy,      1, 26, pal.hi);
        px(ctx, sx + 2, sy,      1, 26, pal.l);
        px(ctx, sx + 3, sy,      1, 26, pal.d);
        px(ctx, sx + 2, sy,      1,  1, '#FFFFFF');
        // Wide ornate crossguard
        px(ctx, sx - 4, sy + 3, 11,  3, pal.b);
        px(ctx, sx - 4, sy + 3, 11,  1, pal.l);
        px(ctx, sx - 3, sy + 5,  9,  1, pal.vd);
        // Crossguard end caps
        px(ctx, sx - 5, sy + 3,  2,  4, pal.d);
        px(ctx, sx + 8, sy + 3,  2,  4, pal.d);
        // Holy gem in guard center
        px(ctx, sx + 1, sy + 2,  3,  5, char.accentColor);
        px(ctx, sx + 2, sy + 2,  1,  1, shade(char.accentColor, 60));
        // Handle
        px(ctx, sx + 1, sy + 6,  3,  6, shade(metal, -26));
        px(ctx, sx + 1, sy + 6,  1,  6, shade(metal, 10));
        // Pommel with gem
        px(ctx, sx,     sy + 12, 5,  3, pal.l);
        px(ctx, sx + 1, sy + 13, 3,  1, char.accentColor);
        pxOutline(ctx, sx - 4, sy + 3, 11, 3, pal.vd);
      } else {
        px(ctx, armX + 2, armY - 10, 2, 28, pal.l);
        px(ctx, armX + 3, armY - 10, 1, 28, pal.d);
        px(ctx, armX - 3, armY + 4, 12,  3, pal.b);
        px(ctx, armX - 3, armY + 4, 12,  1, pal.l);
      }
      break;
    }

    case 'mage': {
      if (facing === 'south') {
        const stx = armX - 13;
        const sty = armY - 24;
        // Shaft (2px, 42px long)
        px(ctx, stx + 1, sty + 7, 2, 38, pal.vd);
        px(ctx, stx + 1, sty + 7, 1, 38, pal.d);
        // Shaft highlight
        ditherRow(ctx, stx + 1, sty + 8, 1, pal.d, shade(pal.d, 10), 0);
        // Orb — glowing sphere
        px(ctx, stx - 1, sty,     10, 8, pal.b);       // outer ring
        px(ctx, stx,     sty - 1, 8,  2, pal.b);       // top arc
        px(ctx, stx + 1, sty + 7, 6,  2, pal.b);       // bottom arc
        px(ctx, stx,     sty + 8, 8,  1, pal.d);       // bottom rim
        // Inner glow layers (concentric)
        px(ctx, stx + 1, sty + 1, 7,  6, shade(wc, 28));
        px(ctx, stx + 2, sty + 2, 5,  4, shade(wc, 48));
        px(ctx, stx + 3, sty + 3, 3,  2, pal.hi);
        px(ctx, stx + 3, sty + 3, 2,  1, '#FFFFFF'); // core gleam
        // Orb reflection
        px(ctx, stx + 6, sty + 5, 2,  2, shade(wc, 18));
        // Ferrule cap
        px(ctx, stx,     armY + 16, 4,  4, pal.d);
        px(ctx, stx + 1, armY + 16, 2,  1, pal.l);
        pxOutline(ctx, stx - 1, sty, 10, 9, pal.vd);
        px(ctx, stx, sty - 2, 8, 1, pal.vd);
      } else {
        const stx = armX - 4;
        const sty = armY - 28;
        px(ctx, stx + 1, sty + 6, 2, 40, pal.vd);
        px(ctx, stx,     sty,     8, 7, pal.b);
        px(ctx, stx + 1, sty + 1, 6, 5, shade(wc, 38));
        px(ctx, stx + 2, sty + 2, 3, 2, pal.hi);
        px(ctx, stx + 2, sty + 2, 2, 1, '#FFFFFF');
        pxOutline(ctx, stx, sty, 8, 7, pal.vd);
      }
      break;
    }

    case 'rogue': {
      if (facing === 'south') {
        const dx = armX + 2;
        const dy = armY + 5;
        // Main dagger blade
        px(ctx, dx + 1, dy,      1, 16, pal.hi);
        px(ctx, dx + 2, dy,      1, 16, pal.l);
        px(ctx, dx + 3, dy,      1, 16, pal.d);
        px(ctx, dx + 2, dy,      1,  1, '#FFFFFF');
        // Guard
        px(ctx, dx - 2, dy + 2,  8,  2, metal);
        px(ctx, dx - 2, dy + 2,  8,  1, pal.l);
        px(ctx, dx - 1, dy + 4,  6,  1, pal.vd);
        // Handle (wrapped)
        px(ctx, dx + 1, dy + 4,  3,  5, shade(metal, -28));
        px(ctx, dx + 1, dy + 5,  1,  3, shade(metal, 8));
        px(ctx, dx + 2, dy + 6,  1,  2, shade(metal, -38));
        px(ctx, dx,     dy + 9,  4,  3, pal.b); // pommel
        pxOutline(ctx, dx - 2, dy + 2, 8, 2, pal.vd);
      } else {
        px(ctx, armX + 2, armY + 2, 2, 16, pal.l);
        px(ctx, armX + 3, armY + 2, 1, 16, pal.d);
        px(ctx, armX - 1, armY + 4, 8,  2, metal);
        px(ctx, armX - 1, armY + 4, 8,  1, pal.l);
      }
      break;
    }

    case 'ranger': {
      if (facing === 'south') {
        const bx = armX + 2;
        const by = armY;
        // Bow limbs — organic recurve curve using pixel-stepped arcs
        // Upper limb
        px(ctx, bx - 9, by,      2, 2, pal.b);
        px(ctx, bx - 10, by + 2, 2, 3, pal.b);
        px(ctx, bx - 10, by + 5, 2, 3, pal.b);
        px(ctx, bx - 9, by + 8,  3, 2, pal.b);
        px(ctx, bx - 8, by + 10, 3, 2, pal.b);
        // Handle / riser
        px(ctx, bx - 7, by + 8,  4, 6, shade(pal.b, -18));
        px(ctx, bx - 7, by + 8,  2, 6, shade(pal.b, 8)); // riser highlight
        // Lower limb
        px(ctx, bx - 8, by + 14, 3, 2, pal.b);
        px(ctx, bx - 9, by + 16, 2, 3, pal.b);
        px(ctx, bx - 10, by + 19, 2, 3, pal.b);
        px(ctx, bx - 9, by + 22, 2, 2, pal.b);
        // Limb highlights
        px(ctx, bx - 10, by + 2,  1, 4, pal.l);
        px(ctx, bx - 10, by + 20, 1, 3, pal.l);
        // Bowstring (thin)
        px(ctx, bx - 6, by,      1, 24, '#E8DFC0');
        px(ctx, bx - 7, by + 11, 1, 2, '#E8DFC0'); // draw point
        pxOutline(ctx, bx - 10, by + 2, 2, 20, pal.vd);

        // Arrow when attacking
        if (attacking && frameIdx === 1) {
          px(ctx, bx - 18, by + 10, 16, 2, '#C8A040');
          px(ctx, bx - 18, by + 9,   1,  1, '#C8A040');
          px(ctx, bx - 18, by + 12,  1,  1, '#C8A040');
          px(ctx, bx - 20, by + 8,   3,  5, '#C04020'); // fletching
        }
      } else {
        px(ctx, armX + 1, armY - 4, 3, 3, pal.b);
        px(ctx, armX - 1, armY - 1, 2, 5, pal.b);
        px(ctx, armX,     armY + 4, 3, 3, pal.b);
        px(ctx, armX + 1, armY + 7, 3, 3, pal.b);
        px(ctx, armX + 3, armY - 4, 1, 13, '#E8DFC0');
        if (attacking) {
          px(ctx, armX - 5, armY + 3, 14, 2, '#C8A040');
          px(ctx, armX - 6, armY + 2,  3,  4, '#C04020');
        }
      }
      break;
    }

    case 'berserker': {
      if (facing === 'south') {
        const ax_ = armX;
        const ay_ = armY - 2;
        // Haft — thick wooden handle
        px(ctx, ax_ + 2, ay_,     3, 34, shade(metal, -24));
        px(ctx, ax_ + 2, ay_,     1, 34, shade(metal, 0));  // haft highlight
        px(ctx, ax_ + 4, ay_,     1, 34, shade(metal, -38)); // haft shadow
        // Leather wrap bands
        for (let i = 0; i < 5; i++) {
          px(ctx, ax_ + 2, ay_ + 6 + i * 5, 3, 2, shade(metal, -38));
        }
        // Axe head — wide, asymmetric, dramatic
        px(ctx, ax_ - 8, ay_ + 2, 16, 5, pal.l);  // upper blade
        px(ctx, ax_ - 8, ay_ + 2, 16, 1, pal.hi);
        px(ctx, ax_ - 7, ay_ + 7, 13, 4, pal.b);  // mid blade
        px(ctx, ax_ - 6, ay_ + 11, 10, 3, pal.d); // lower curve
        px(ctx, ax_ - 5, ay_ + 14,  7, 2, pal.vd);// beard
        // Blade edge gleam (outer edge is sharpest/brightest)
        px(ctx, ax_ - 8, ay_ + 3,  1, 8, '#FFFFFF');
        px(ctx, ax_ - 7, ay_ + 2,  1, 2, '#FFFFFF');
        // Back spine of axe head
        px(ctx, ax_ + 7, ay_ + 2,  2, 12, pal.vd);
        // Ferrule
        px(ctx, ax_ + 1, ay_ + 32, 5,  4, pal.d);
        px(ctx, ax_ + 2, ay_ + 32, 3,  1, pal.l);
        pxOutline(ctx, ax_ - 8, ay_ + 2, 16, 5, pal.vd);
        pxOutline(ctx, ax_ - 7, ay_ + 7, 13, 4, pal.vd);
        pxOutline(ctx, ax_ - 6, ay_ + 11, 10, 3, pal.vd);
      } else {
        px(ctx, armX + 2, armY - 6,  3, 28, shade(metal, -24));
        px(ctx, armX - 8, armY - 4, 16,  5, pal.l);
        px(ctx, armX - 8, armY - 4, 16,  1, pal.hi);
        px(ctx, armX - 7, armY + 1, 13,  4, pal.b);
        px(ctx, armX - 8, armY - 3,  1,  8, '#FFFFFF');
        pxOutline(ctx, armX - 8, armY - 4, 16, 5, pal.vd);
      }
      break;
    }
  }
}

// ─── RARITY ACCENTS ──────────────────────────────────────────────────────────

export function drawRarityAccent(ctx: CanvasRenderingContext2D, char: CharacterDef, cx: number, baseY: number) {
  const ac = char.accentColor;
  const apal = palette(ac);
  switch (char.rarity) {
    case 'uncommon':
      // Single shoulder gem
      px(ctx, cx + 10, baseY + 26, 3, 3, ac);
      px(ctx, cx + 11, baseY + 26, 1, 1, apal.hi);
      break;
    case 'rare':
      // Both shoulder gems
      for (const gx of [cx - 14, cx + 10]) {
        px(ctx, gx, baseY + 25, 4, 4, ac);
        px(ctx, gx + 1, baseY + 25, 2, 2, apal.hi);
      }
      break;
    case 'epic':
      for (const gx of [cx - 14, cx + 10]) {
        px(ctx, gx, baseY + 24, 5, 5, ac);
        px(ctx, gx + 1, baseY + 25, 3, 3, apal.hi);
        px(ctx, gx + 2, baseY + 26, 1, 1, '#FFFFFF');
      }
      px(ctx, cx - 2, baseY + 21, 4, 2, ac);
      break;
    case 'legendary':
      for (const gx of [cx - 15, cx + 10]) {
        px(ctx, gx, baseY + 23, 5, 5, ac);
        px(ctx, gx + 1, baseY + 24, 3, 3, apal.hi);
        px(ctx, gx + 2, baseY + 25, 1, 1, '#FFFFFF');
      }
      px(ctx, cx - 14, baseY + 21, 2, 14, shade(ac, -18));
      px(ctx, cx + 12, baseY + 21, 2, 14, shade(ac, -18));
      px(ctx, cx - 2,  baseY + 3,  4,  3, ac);
      px(ctx, cx - 1,  baseY + 4,  2,  1, apal.hi);
      break;
    case 'mythic':
      for (const gx of [cx - 16, cx + 11]) {
        px(ctx, gx, baseY + 22, 6, 6, ac);
        px(ctx, gx + 1, baseY + 23, 4, 4, apal.hi);
        px(ctx, gx + 2, baseY + 25, 2, 2, '#FFFFFF');
      }
      px(ctx, cx - 16, baseY + 20, 2, 18, shade(ac, -24));
      px(ctx, cx + 14, baseY + 20, 2, 18, shade(ac, -24));
      px(ctx, cx - 3,  baseY + 2,  6,  3, ac);
      px(ctx, cx - 2,  baseY + 3,  4,  1, apal.hi);
      px(ctx, cx - 5,  baseY + 4,  3,  3, shade(ac, -15));
      px(ctx, cx + 2,  baseY + 4,  3,  3, shade(ac, -15));
      break;
    default: break;
  }
}

// ─── DRAW SOUTH (main front-facing frame) ─────────────────────────────────────

function drawSouth(
  ctx: CanvasRenderingContext2D,
  char: CharacterDef,
  wp: WalkPhase,
  bob: number,
  anim: AnimType,
  frameIdx: number
) {
  const m   = RACE_METRICS[char.race];
  const cx  = 24;
  const by  = m.dy + bob;
  const arm = AT[char.armorTier];
  const isAttack = anim === 'attack';
  const isMage   = char.class === 'mage';

  const ap = isAttack ? ATTACK_PHASES[frameIdx & 3] : null;

  // ── Contact shadow ──
  drawContactShadow(ctx, cx, 62, isMage ? 14 : (m.torsoW >> 1) + 6);

  // ── Paladin cape (drawn behind everything else) ──
  if (char.class === 'paladin') {
    const capeC  = shade(char.accentColor, -32);
    const capePal = palette(capeC);
    const capeX  = (cx - (m.torsoW >> 1)) - 4;
    const capeW  = m.torsoW + 8;
    const capeY  = by + 28;
    // Cape body with shading
    px(ctx, capeX,     capeY,      capeW, 2, capePal.l);
    px(ctx, capeX,     capeY + 2,  capeW, 16, capeC);
    px(ctx, capeX,     capeY + 18, capeW, 4, capePal.d);
    // Fold lines
    for (let i = 0; i < 3; i++) {
      const fy = capeY + 5 + i * 5;
      px(ctx, capeX + 2, fy, capeW - 4, 1, capePal.d);
    }
    px(ctx, capeX, capeY, 1, 22, capePal.d);     // left edge shadow
    px(ctx, capeX + capeW - 1, capeY, 1, 22, capePal.vd);
    pxOutline(ctx, capeX, capeY, capeW, 22, capePal.vd);
  }

  // ── Back arm ──
  const backArmY = isAttack ? (by + 26) : (by + 26 + ((wp.la * 3) >> 3));
  drawArms(ctx, cx, backArmY, 7, 13, 16, 0, arm.b, char.skinColor, true);

  // ── MAGE: staff back (behind robe) ──
  if (isMage) {
    const staffX = cx - 15;
    const staffY = by + 5;
    px(ctx, staffX, staffY + 5, 2, 36, shade(char.weaponTint, -38));
    px(ctx, staffX, staffY + 5, 1, 36, shade(char.weaponTint, -28));
  }

  if (isMage) {
    drawMageRobe(ctx, cx, by, char);
  } else {
    // ── STANDARD: Legs ──
    const legTopY = by + 44;
    const lDy = isAttack ? 0 : wp.ly;
    const rDy = isAttack ? 0 : wp.ry;
    const lW  = Math.min(9, m.legH > 9 ? 9 : m.legH);
    drawLegs(ctx, cx, legTopY, lW, m.legH, lDy, rDy, arm.b);

    // ── STANDARD: Torso ──
    const torsoY  = by + 24;
    const torsoW  = (char.class === 'berserker') ? m.torsoW + 4 : m.torsoW;
    drawTorsoArmor(ctx, cx, torsoY, torsoW, m.torsoH, arm.b, arm.l, arm.d, arm.blt,
      char.class, char.accentColor, char.class === 'berserker');

    // ── Shield (warrior/paladin — on back-arm side) ──
    if ((char.class === 'warrior' || char.class === 'paladin') && !isAttack) {
      const shieldX = cx - (m.torsoW >> 1) - 16;
      const shieldY = by + 26;
      drawShield(ctx, char, shieldX, shieldY);
    }
  }

  // ── Neck ──
  const neckC  = shade(char.skinColor, -8);
  const neckPal = palette(char.skinColor);
  px(ctx, cx - 3, by + 22, 6, 4, neckC);
  px(ctx, cx - 2, by + 22, 4, 1, neckPal.l);   // neck top highlight
  px(ctx, cx + 2, by + 22, 1, 3, shade(neckC, -16)); // neck shadow
  pxOutline(ctx, cx - 3, by + 22, 6, 4, '#18100E');

  // ── Head ──
  const headCY = by + 14;
  drawHead(ctx, cx, headCY, m.headW, m.headH, char.skinColor);

  // ── Hair (before headgear so gear overlaps it) ──
  if (char.class !== 'warrior' && char.class !== 'paladin') {
    drawHair(ctx, cx, headCY, m.headW, m.headH, char.hairColor, char.class);
  }

  // ── Headgear ──
  drawHeadgear(ctx, char, cx, by, m.headW >> 1);

  // ── Face (eyes + brows + nose + mouth) ──
  const eyeY = by + 12;
  if (char.class !== 'warrior' && char.class !== 'paladin') {
    drawFace(ctx, cx, eyeY, char.eyeColor, char.hairColor);
  } else {
    // Visor slit eye glow only
    px(ctx, cx - 4, eyeY + 3, 3, 1, shade(char.eyeColor, 40));
    px(ctx, cx + 1, eyeY + 3, 3, 1, shade(char.eyeColor, 40));
  }

  // ── Front arm + weapon ──
  if (ap) {
    const fax = cx + 7 + ap.armX;
    const fay = by + 26 + ap.armY;
    drawArms(ctx, fax + 7, fay, 7, 13, 0, 0, arm.b, char.skinColor, false);
    drawWeapon(ctx, char, fax, fay, true, frameIdx, 'south');
  } else {
    const fay = by + 26 + ((wp.ra * 3) >> 3);
    drawArms(ctx, cx + 7 + 7, fay, 7, 13, 0, 0, arm.b, char.skinColor, false);
    drawWeapon(ctx, char, cx + 7, fay, false, 0, 'south');
  }

  // ── Rarity accent ──
  drawRarityAccent(ctx, char, cx, by);
}

// ─── DRAW NORTH (back view) ───────────────────────────────────────────────────

function drawNorth(ctx: CanvasRenderingContext2D, char: CharacterDef, wp: WalkPhase, bob: number) {
  const m   = RACE_METRICS[char.race];
  const cx  = 24;
  const by  = m.dy + bob;
  const arm = AT[char.armorTier];

  drawContactShadow(ctx, cx, 62, (m.torsoW >> 1) + 6);

  if (char.class === 'mage') {
    const rc   = char.armorColor;
    const pal  = palette(rc);
    const rw   = 20;
    const ry   = by + 24;
    // Robe back
    px(ctx, (cx - (rw >> 1))|0, ry, rw, 34, shade(rc, -14));
    px(ctx, (cx - (rw >> 1))|0, ry, rw, 2, pal.l);
    px(ctx, (cx - (rw >> 1))|0, ry, 1, 34, pal.d);
    pxOutline(ctx, (cx - (rw >> 1))|0, ry, rw, 34, pal.vd);
  } else {
    // Legs back
    drawLegs(ctx, cx, by + 44, Math.min(9, m.legH), m.legH, wp.ly, wp.ry, shade(arm.b, -12));

    // Torso back (darker)
    const torsoW  = (char.class === 'berserker') ? m.torsoW + 4 : m.torsoW;
    const tx      = (cx - (torsoW >> 1))|0;
    const backPal = palette(shade(arm.b, -14));
    px(ctx, tx, by + 24, torsoW, m.torsoH, shade(arm.b, -14));
    px(ctx, tx + 2, by + 24, torsoW - 4, 2, backPal.l);
    px(ctx, tx, by + 24, 2, m.torsoH, backPal.d);
    px(ctx, tx - 1, by + 24 + m.torsoH, torsoW + 2, 4, arm.blt);
    pxOutline(ctx, tx, by + 24, torsoW, m.torsoH, backPal.vd);

    // Paladin cape back (on top of torso back)
    if (char.class === 'paladin') {
      const cc  = shade(char.accentColor, -40);
      const cp  = palette(cc);
      px(ctx, tx - 4, by + 28, torsoW + 8, 22, cc);
      px(ctx, tx - 4, by + 28, torsoW + 8, 2, cp.l);
      for (let i = 0; i < 3; i++) px(ctx, tx, by + 33 + i * 5, torsoW, 1, cp.d);
      pxOutline(ctx, tx - 4, by + 28, torsoW + 8, 22, cp.vd);
    }
  }

  // Arms
  px(ctx, cx - 16, by + 26 + ((wp.la * 3) >> 3), 7, 13, shade(arm.b, -10));
  px(ctx, cx + 9,  by + 26 - ((wp.la * 3) >> 3), 7, 13, shade(arm.b, -10));
  pxOutline(ctx, cx - 16, by + 26, 7, 13, shade(arm.b, -50));
  pxOutline(ctx, cx + 9,  by + 26, 7, 13, shade(arm.b, -50));

  // Neck back
  px(ctx, cx - 3, by + 21, 6, 4, shade(char.skinColor, -16));

  // Head back (slightly darker)
  const headCY = by + 14;
  drawHead(ctx, cx, headCY, m.headW, m.headH, shade(char.skinColor, -14));

  // Back hair (more visible from behind — fuller coverage)
  const hx = (cx - (m.headW >> 1))|0;
  const hy = (headCY - (m.headH >> 1))|0;
  px(ctx, hx,     hy - 2, m.headW,     10, char.hairColor);
  px(ctx, hx - 2, hy + 3, m.headW + 4,  7, char.hairColor);
  px(ctx, hx + 2, hy - 3, m.headW - 4,  4, shade(char.hairColor, 18)); // highlight
  if (char.class !== 'warrior' && char.class !== 'paladin') {
    px(ctx, hx - 1, hy + 10, m.headW + 2, 8, char.hairColor);
    px(ctx, hx,     hy + 12, m.headW,     3, shade(char.hairColor, -12));
  }

  drawHeadgear(ctx, char, cx, by, m.headW >> 1);
}

// ─── DRAW EAST (side view) ────────────────────────────────────────────────────

function drawEast(
  ctx: CanvasRenderingContext2D,
  char: CharacterDef,
  wp: WalkPhase,
  bob: number,
  anim: AnimType,
  frameIdx: number
) {
  const m   = RACE_METRICS[char.race];
  const cx  = 24;
  const by  = m.dy + bob;
  const arm = AT[char.armorTier];
  const isAttack = anim === 'attack';
  const isMage   = char.class === 'mage';
  const ap = isAttack ? ATTACK_PHASES[frameIdx & 3] : null;

  drawContactShadow(ctx, cx, 62, isMage ? 8 : 10);

  // Back leg (darker, partially hidden)
  if (!isMage) {
    const bly = (by + 44 + (isAttack ? 0 : wp.ry))|0;
    const blPal = palette(shade(arm.b, -22));
    px(ctx, cx - 3, bly, 7, m.legH, blPal.b);
    px(ctx, cx - 3, bly, 7, 2, blPal.d);
    px(ctx, cx - 4, bly + m.legH, 9, 5, shade(arm.b, -40));
    pxOutline(ctx, cx - 3, bly, 7, m.legH + 5, blPal.vd);
  }

  // Back arm
  const bay = (by + 26 + (isAttack ? 0 : ((wp.la * 3) >> 3)))|0;
  const baPal = palette(shade(arm.b, -24));
  px(ctx, cx - 10, bay, 6, 13, baPal.b);
  px(ctx, cx - 10, bay, 1, 12, baPal.l);
  px(ctx, cx - 10, bay + 13, 6, 4, shade(char.skinColor, -12));
  pxOutline(ctx, cx - 10, bay, 6, 17, baPal.vd);

  // Torso/robe (side view — narrow profile)
  if (isMage) {
    const rc  = char.armorColor;
    const rp  = palette(rc);
    const rw  = 11;
    const rtx = cx - (rw >> 1);
    px(ctx, rtx, by + 24, rw, 36, rc);
    px(ctx, rtx, by + 24, rw, 2, rp.l);
    px(ctx, rtx, by + 26, 2, 32, rp.l);
    px(ctx, rtx + rw - 2, by + 26, 2, 34, rp.d);
    pxOutline(ctx, rtx, by + 24, rw, 36, rp.vd);
  } else {
    const tp = palette(arm.b);
    px(ctx, cx - 7, by + 24, 14, m.torsoH, arm.b);
    px(ctx, cx - 7, by + 24, 14, 2, tp.l);
    px(ctx, cx - 7, by + 25, 2, m.torsoH - 2, tp.l);
    px(ctx, cx + 5, by + 25, 2, m.torsoH - 2, tp.d);
    ditherRow(ctx, cx - 7, by + 24 + 3, 14, tp.l, tp.b);
    px(ctx, cx - 8, by + 24 + m.torsoH, 16, 4, arm.blt);
    pxOutline(ctx, cx - 7, by + 24, 14, m.torsoH, tp.vd);
  }

  // Neck
  px(ctx, cx - 2, by + 22, 5, 4, char.skinColor);
  pxOutline(ctx, cx - 2, by + 22, 5, 4, '#18100E');

  // Head (side profile — slightly narrower)
  const headCY = by + 14;
  const hpx    = cx - (m.headW >> 1) + 1;
  const hpy    = headCY - (m.headH >> 1);
  const hpw    = m.headW - 2;
  // Draw oval head in profile
  drawHead(ctx, cx + 1, headCY, hpw, m.headH, char.skinColor);
  // Nose bump (right side of face = toward right in east view)
  px(ctx, hpx + hpw - 2, hpy + 6, 3, 3, shade(char.skinColor, -18));
  px(ctx, hpx + hpw - 1, hpy + 5, 2, 1, shade(char.skinColor, -8));
  px(ctx, hpx + hpw - 1, hpy + 9, 2, 1, shade(char.skinColor, -26));
  // Jaw shadow
  px(ctx, hpx + 1, hpy + m.headH - 4, hpw - 3, 3, shade(char.skinColor, -22));
  // Cheek highlight (left-front of profile)
  px(ctx, hpx + 2, hpy + 3, 3, 5, shade(char.skinColor, 16));

  // Profile hair
  if (char.class !== 'warrior' && char.class !== 'paladin') {
    px(ctx, hpx - 2, hpy - 1, hpw, 7, char.hairColor);
    px(ctx, hpx - 3, hpy + 2, 4, 9, char.hairColor);
    if (char.class !== 'mage') px(ctx, hpx - 2, hpy + 8, 3, 8, char.hairColor);
    px(ctx, hpx, hpy - 2, hpw - 4, 4, shade(char.hairColor, 18));
  }

  // Headgear side
  drawHeadgear(ctx, char, cx + 2, by, (m.headW >> 1) - 1);

  // Profile eye
  const epy = hpy + 5;
  const epx = hpx + hpw - 5;
  px(ctx, epx,     epy, 2, 2, '#EEE8E0');  // eye white
  px(ctx, epx,     epy, 2, 2, char.eyeColor); // iris
  px(ctx, epx,     epy, 1, 2, '#10080C'); // pupil
  px(ctx, epx + 1, epy, 1, 1, shade(char.eyeColor, 45));
  px(ctx, epx - 1, epy - 2, 3, 1, shade(char.hairColor, -20)); // brow

  // Front leg (brighter, in front)
  if (!isMage) {
    const fly = (by + 44 + (isAttack ? 0 : wp.ly))|0;
    const flPal = palette(arm.b);
    px(ctx, cx - 3, fly, 7, m.legH, flPal.b);
    px(ctx, cx - 3, fly, 7, 2, flPal.l);
    px(ctx, cx - 3, fly, 2, m.legH, flPal.l); // front shin highlight
    px(ctx, cx + 3,  fly + 2, 1, m.legH - 3, flPal.d);
    px(ctx, cx - 4, fly + m.legH, 10, 5, shade(arm.b, -32));
    pxOutline(ctx, cx - 3, fly, 7, m.legH + 5, flPal.vd);
  }

  // Front arm + weapon
  const fay2 = ap ? (by + 26 + ap.armY) : (by + 26 - ((wp.la * 3) >> 3));
  const fax2 = ap ? (cx + 4 + ap.armX) : cx + 4;
  const faPal = palette(arm.b);
  px(ctx, fax2, fay2, 6, 13, faPal.b);
  px(ctx, fax2, fay2, 1, 13, faPal.l);
  px(ctx, fax2, fay2, 6, 2, faPal.l);
  ditherRow(ctx, fax2, fay2 + 2, 6, faPal.l, faPal.b);
  px(ctx, fax2 + 4, fay2 + 3, 2, 9, faPal.d);
  px(ctx, fax2, fay2 + 13, 6, 4, shade(char.skinColor, -12));
  pxOutline(ctx, fax2, fay2, 6, 17, faPal.vd);
  drawWeapon(ctx, char, fax2, fay2, isAttack, frameIdx, 'east');

  drawRarityAccent(ctx, char, cx, by);
}

// ─── DRAW WEST (mirror of east) ───────────────────────────────────────────────

function drawWest(ctx: CanvasRenderingContext2D, char: CharacterDef, wp: WalkPhase, bob: number, anim: AnimType, frameIdx: number) {
  ctx.save();
  ctx.translate(CHAR_FRAME_W, 0);
  ctx.scale(-1, 1);
  const mwp: WalkPhase = { ...wp, la: -wp.la, ra: -wp.ra };
  drawEast(ctx, char, mwp, bob, anim, frameIdx);
  ctx.restore();
}

// ─── DRAW HURT ────────────────────────────────────────────────────────────────

function drawHurt(ctx: CanvasRenderingContext2D, char: CharacterDef, frameIdx: number) {
  const hurtBob = [2, 4, 3, 1];
  const hurtDx  = [0, 2, 1, 0];
  const bob = hurtBob[frameIdx & 3];
  const dx  = hurtDx[frameIdx & 3];
  const wp: WalkPhase = { ly: 0, ry: 0, by: 0, la: -3, ra: -3 };
  ctx.save();
  ctx.translate(dx, 0);
  drawSouth(ctx, char, wp, bob, 'idle', 0);
  ctx.fillStyle = `rgba(220,30,30,${0.12 + (frameIdx & 3) * 0.05})`;
  ctx.fillRect(6, 4, 36, 52);
  ctx.restore();
}

// ─── DRAW DEATH ───────────────────────────────────────────────────────────────

function drawDeath(ctx: CanvasRenderingContext2D, char: CharacterDef, frameIdx: number) {
  const deathDy = [0, 8, 16, 22];
  const dy  = deathDy[frameIdx & 3];
  const m   = RACE_METRICS[char.race];
  const cx  = 24;
  const by  = m.dy + dy;
  const arm = AT[char.armorTier];

  if (frameIdx >= 3) {
    const groundY = 52;
    drawContactShadow(ctx, cx, 56, (m.torsoW >> 1) + 7);
    const bodyPal = palette(shade(arm.b, -20));
    px(ctx, cx - (m.torsoW >> 1) - 3, groundY - 4, m.torsoW + 6, m.torsoH - 8, bodyPal.b);
    px(ctx, cx - (m.torsoW >> 1) - 3, groundY - 4, m.torsoW + 6, 2, bodyPal.l);
    pxOutline(ctx, cx - (m.torsoW >> 1) - 3, groundY - 4, m.torsoW + 6, m.torsoH - 8, bodyPal.vd);
    const hx = cx + (m.torsoW >> 1);
    drawHead(ctx, hx + (m.headW >> 1), groundY - 2, m.headW, m.headH - 6, shade(char.skinColor, -24));
    return;
  }

  drawContactShadow(ctx, cx, 62, (m.torsoW >> 1) + 6);
  const wp: WalkPhase = { ly: dy >> 1, ry: dy >> 1, by: 0, la: dy, ra: dy };
  drawSouth(ctx, char, wp, by - m.dy, 'idle', 0);
}

// ─── DRAW CAST ────────────────────────────────────────────────────────────────

function drawCast(ctx: CanvasRenderingContext2D, char: CharacterDef, frameIdx: number) {
  const castBob = [0, -1, -2, -1];
  const bob = castBob[frameIdx & 3];
  drawSouth(ctx, char, WALK_PHASES[0], bob, 'cast', frameIdx);
  if (char.class === 'mage' || char.class === 'paladin') {
    const m  = RACE_METRICS[char.race];
    const cx = 24;
    const by = m.dy + bob;
    const gc = char.accentColor;
    const alpha = 0.14 + (frameIdx & 3) * 0.07;
    const alphaHex = Math.round(alpha * 255).toString(16).padStart(2, '0');
    ctx.fillStyle = gc + alphaHex;
    ctx.fillRect((cx - 14)|0, (by + 6)|0, 28, 28);
  }
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

export interface RenderFrameOptions {
  contactShadow?: boolean;
}

export function renderCharacterFrame(
  char: CharacterDef,
  anim: AnimType,
  frameIdx: number,
  opts?: RenderFrameOptions
): HTMLCanvasElement {
  _skipContactShadow = opts?.contactShadow === false;

  const canvas = document.createElement('canvas');
  canvas.width  = CHAR_FRAME_W;
  canvas.height = CHAR_FRAME_H;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, CHAR_FRAME_W, CHAR_FRAME_H);

  const fi  = frameIdx & 3;
  const wp  = WALK_PHASES[fi];
  const bob: number = (anim === 'idle') ? IDLE_BOB[fi] :
                      (anim.startsWith('walk')) ? wp.by : 0;

  switch (anim) {
    case 'walk_south': drawSouth(ctx, char, wp, wp.by, anim, fi); break;
    case 'walk_north': drawNorth(ctx, char, wp, wp.by); break;
    case 'walk_east':  drawEast(ctx, char, wp, wp.by, anim, fi); break;
    case 'walk_west':  drawWest(ctx, char, wp, wp.by, anim, fi); break;
    case 'idle':       drawSouth(ctx, char, WALK_PHASES[0], IDLE_BOB[fi], anim, fi); break;
    case 'attack':     drawSouth(ctx, char, WALK_PHASES[0], 0, anim, fi); break;
    case 'cast':       drawCast(ctx, char, fi); break;
    case 'hurt':       drawHurt(ctx, char, fi); break;
    case 'death':      drawDeath(ctx, char, fi); break;
    default:           drawSouth(ctx, char, WALK_PHASES[0], bob, 'idle', fi); break;
  }

  _skipContactShadow = false;
  return canvas;
}

export function renderCharacterSheet(char: CharacterDef, opts?: RenderFrameOptions): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width  = CHAR_SHEET_COLS * CHAR_FRAME_W;
  canvas.height = CHAR_SHEET_ROWS * CHAR_FRAME_H;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  const anims: AnimType[] = [
    'walk_south', 'walk_west', 'walk_east', 'walk_north',
    'idle', 'attack', 'cast', 'hurt', 'death',
  ];
  anims.forEach((a, row) => {
    for (let col = 0; col < CHAR_SHEET_COLS; col++) {
      const frame = renderCharacterFrame(char, a, col, opts);
      ctx.drawImage(frame, col * CHAR_FRAME_W, row * CHAR_FRAME_H);
    }
  });
  return canvas;
}

export function renderCharacterThumb(char: CharacterDef): HTMLCanvasElement {
  return renderCharacterFrame(char, 'idle', 0);
}

export interface CharAtlasResult {
  atlasCanvas: HTMLCanvasElement;
  positions: Record<string, { x: number; y: number; sheetW: number; sheetH: number }>;
}

export function packCharacterAtlas(chars?: CharacterDef[]): CharAtlasResult {
  const characters = chars ?? ALL_CHARACTERS;
  const COLS  = 8;
  const sheetW = CHAR_SHEET_COLS * CHAR_FRAME_W;
  const sheetH = CHAR_SHEET_ROWS * CHAR_FRAME_H;
  const rows  = Math.ceil(characters.length / COLS);

  const atlas = document.createElement('canvas');
  atlas.width  = COLS * sheetW;
  atlas.height = rows * sheetH;
  const ctx = atlas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  const positions: CharAtlasResult['positions'] = {};
  characters.forEach((char, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const x   = col * sheetW;
    const y   = row * sheetH;
    const sheet = renderCharacterSheet(char);
    ctx.drawImage(sheet, x, y);
    positions[char.id] = { x, y, sheetW, sheetH };
  });

  return { atlasCanvas: atlas, positions };
}
