// characterRenderer.ts — Areloria Character Forge
// Production-grade procedural pixel-art character sprite generator
// Sheet: 4 cols × 9 rows = 36 frames per character
//   Row 0: walk_south   Row 1: walk_west   Row 2: walk_east
//   Row 3: walk_north   Row 4: idle        Row 5: attack
//   Row 6: cast(fb)     Row 7: hurt(fb)    Row 8: death(fb)
//
// RULES:
//   - TRANSPARENT canvas always. No fillRect on full canvas.
//   - imageSmoothingEnabled = false everywhere.
//   - Integer math only. No floating drift.
//   - Outline pixels on all body parts.
//   - Contact shadow under feet.
//   - Class-specific equipment and silhouette.
//   - Rarity-specific accents.

export const CHAR_FRAME_W  = 48;
export const CHAR_FRAME_H  = 64;
export const CHAR_SHEET_COLS = 4;
export const CHAR_SHEET_ROWS = 9;

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
  fair: '#F0C09A', tan: '#C88050', dark: '#8B5524',
  pale: '#F5E8D8', orc: '#5A8450', dwarf: '#C07840',
};
const hr = {
  brown: '#7B3F00', black: '#2A1E1E', blonde: '#DEC040',
  red: '#B03000', white: '#EFEFEF', silver: '#A0A0C0',
  green: '#2A6020',
};
const ey = {
  brown: '#6C3A18', blue: '#2060A8', green: '#287828',
  purple: '#6030A8', gold: '#C09010', red: '#A01010',
};
const AT = {
  leather: { b: '#8B6410', d: '#6B4A0C', l: '#A87818', blt: '#4A3008' },
  iron:    { b: '#5A6878', d: '#485060', l: '#7898A8', blt: '#384050' },
  steel:   { b: '#90A8C0', d: '#6888A0', l: '#B8D0E0', blt: '#4C6070' },
  mythril: { b: '#58A0CC', d: '#3878B0', l: '#88C8EC', blt: '#1E6080' },
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
  headW: number;   // head width  (pixels)
  headH: number;   // head height (pixels)
  torsoW: number;  // torso width
  torsoH: number;  // torso height
  legH: number;    // leg length
  dy: number;      // vertical offset (positive = shorter)
}

const RACE_METRICS: Record<CharacterRace, RaceMetrics> = {
  human: { headW: 16, headH: 16, torsoW: 20, torsoH: 18, legH: 13, dy: 0  },
  elf:   { headW: 14, headH: 16, torsoW: 18, torsoH: 19, legH: 15, dy: -1 },
  dwarf: { headW: 16, headH: 15, torsoW: 24, torsoH: 15, legH:  9, dy: 4  },
  orc:   { headW: 18, headH: 16, torsoW: 24, torsoH: 18, legH: 13, dy: 0  },
};

// ─── DRAW PHASE DATA ─────────────────────────────────────────────────────────

interface WalkPhase { ly: number; ry: number; by: number; la: number; ra: number; }
const WALK_PHASES: WalkPhase[] = [
  { ly: -4, ry:  3, by: -1, la:  3, ra: -3 },
  { ly: -1, ry:  1, by:  0, la:  1, ra: -1 },
  { ly:  3, ry: -4, by: -1, la: -3, ra:  3 },
  { ly:  1, ry: -1, by:  0, la: -1, ra:  1 },
];
const IDLE_BOB = [0, -1, -1, 0];
const ATTACK_PHASES = [
  { armX:  0, armY: -4, weaponRot: -0.8 },
  { armX:  8, armY:  2, weaponRot:  0.3 },
  { armX: 12, armY:  4, weaponRot:  0.6 },
  { armX:  4, armY:  0, weaponRot:  0.0 },
];

// ─── LOW-LEVEL PIXEL-ART PRIMITIVES ──────────────────────────────────────────

// All drawing uses only fillRect — no arcs/ellipses to avoid anti-aliasing

function px(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x | 0, y | 0, w | 0, h | 0);
}

// Draw a pixel-art "rounded" rect by filling cross shape
function pxRound(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  x = x | 0; y = y | 0; w = w | 0; h = h | 0;
  // Wide band (center)
  ctx.fillStyle = color;
  ctx.fillRect(x + 2, y,     w - 4, h);
  ctx.fillRect(x,     y + 2, w,     h - 4);
}

// Draw outline: 1px dark border around a rect
function pxOutline(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  x = x | 0; y = y | 0; w = w | 0; h = h | 0;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, 1);       // top
  ctx.fillRect(x, y+h-1, w, 1);   // bottom
  ctx.fillRect(x, y, 1, h);       // left
  ctx.fillRect(x+w-1, y, 1, h);   // right
}

function shade(c: string, amt: number): string {
  const n = parseInt(c.replace('#',''), 16);
  const r = Math.max(0, Math.min(255, (n >> 16)         + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amt));
  const b = Math.max(0, Math.min(255, (n & 0xff)        + amt));
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

// ─── COMPOSITE DRAWING PRIMITIVES ────────────────────────────────────────────

export function drawPixelRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  px(ctx, x, y, w, h, color);
}

export function drawOutlineRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string, outlineColor: string) {
  px(ctx, x, y, w, h, fill);
  pxOutline(ctx, x, y, w, h, outlineColor);
}

export function drawContactShadow(ctx: CanvasRenderingContext2D, cx: number, groundY: number, width: number) {
  // Layered shadow for pixel-art look
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.fillRect((cx - width) | 0, groundY | 0, (width * 2) | 0, 2);
  ctx.fillStyle = 'rgba(0,0,0,0.14)';
  ctx.fillRect((cx - width + 1) | 0, (groundY + 2) | 0, (width * 2 - 2) | 0, 1);
  ctx.fillStyle = 'rgba(0,0,0,0.10)';
  ctx.fillRect((cx - width + 2) | 0, (groundY - 1) | 0, (width * 2 - 4) | 0, 1);
}

export function drawHead(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, skinColor: string) {
  const x = (cx - (w >> 1)) | 0;
  const y = (cy - (h >> 1)) | 0;
  // Rounded pixel-art head
  pxRound(ctx, x, y, w, h, skinColor);
  // Jaw shadow (lower third)
  px(ctx, x + 2, y + h - 4, w - 4, 3, shade(skinColor, -18));
  // Cheek blush (subtle highlight left side)
  px(ctx, x + 2, y + 4, 3, 4, shade(skinColor, 12));
}

export function drawHair(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, hairColor: string, charClass: CharacterClass) {
  // Hair covers top half of head
  const hx = (cx - (w >> 1)) | 0;
  const hy = (cy - (h >> 1)) | 0;
  // Top sweep
  px(ctx, hx + 2, hy - 2, w - 4, 6, hairColor);
  px(ctx, hx + 1, hy,     w - 2, 4, hairColor);
  // Side pieces
  px(ctx, hx - 1, hy + 3, 3, 7, hairColor);
  px(ctx, hx + w - 2, hy + 3, 3, 7, hairColor);

  // Class-specific hair style
  switch (charClass) {
    case 'berserker':
      // Wild spiky sides
      px(ctx, hx - 2, hy + 1, 3, 5, shade(hairColor, -10));
      px(ctx, hx + w, hy + 1, 3, 5, shade(hairColor, -10));
      break;
    case 'mage':
      // Neat swept back
      px(ctx, hx - 1, hy + 2, 2, 6, hairColor);
      px(ctx, hx + w - 1, hy + 2, 2, 6, hairColor);
      break;
    case 'ranger':
      // Longer side
      px(ctx, hx - 1, hy + 3, 2, 9, hairColor);
      break;
  }
}

export function drawTorsoArmor(
  ctx: CanvasRenderingContext2D,
  cx: number, torsoY: number,
  w: number, h: number,
  armorBase: string, armorLight: string, armorDark: string,
  beltColor: string, charClass: CharacterClass,
  accentColor: string, isBerserker: boolean
) {
  const tx = (cx - (w >> 1)) | 0;
  // Body
  px(ctx, tx, torsoY, w, h, armorBase);
  // Shoulder pads (top 4px, wider for warrior/berserker)
  const shoulderExtra = (charClass === 'warrior' || charClass === 'berserker' || charClass === 'paladin') ? 3 : 0;
  if (shoulderExtra > 0) {
    px(ctx, tx - shoulderExtra, torsoY, w + shoulderExtra * 2, 5, shade(armorBase, -8));
    px(ctx, tx - shoulderExtra, torsoY, w + shoulderExtra * 2, 2, armorLight);
    if (isBerserker) {
      // Spike-tip shoulder pads
      px(ctx, tx - shoulderExtra - 1, torsoY - 3, 3, 4, shade(armorBase, -20));
      px(ctx, tx + w + shoulderExtra - 2, torsoY - 3, 3, 4, shade(armorBase, -20));
    }
  }
  // Chest highlight (upper-left light source)
  px(ctx, tx + 2, torsoY + 1, w - 6, 3, armorLight);
  // Side shadow (right)
  px(ctx, tx + w - 4, torsoY + 2, 3, h - 3, armorDark);
  // Belt
  px(ctx, tx - 1, torsoY + h, w + 2, 4, beltColor);
  px(ctx, tx, torsoY + h + 1, w, 2, shade(beltColor, 10));
  // Outline
  pxOutline(ctx, tx, torsoY, w, h, shade(armorBase, -40));
}

export function drawArms(
  ctx: CanvasRenderingContext2D,
  cx: number, armY: number,
  armW: number, armH: number,
  backArmOffset: number, frontArmOffset: number,
  armorColor: string, skinColor: string,
  isLeft: boolean
) {
  const outline = shade(armorColor, -40);
  // Arm
  const ax = isLeft ? (cx - armW - backArmOffset) : (cx + frontArmOffset);
  px(ctx, ax, armY, armW, armH, armorColor);
  // Highlight left edge
  px(ctx, ax, armY, 1, armH - 2, shade(armorColor, 18));
  // Shadow right edge
  px(ctx, ax + armW - 1, armY + 1, 1, armH - 1, shade(armorColor, -22));
  // Hand
  const handY = armY + armH;
  px(ctx, ax, handY, armW, 4, skinColor);
  px(ctx, ax, handY, armW, 1, shade(skinColor, -15));
  pxOutline(ctx, ax, armY, armW, armH + 4, outline);
}

export function drawLegs(
  ctx: CanvasRenderingContext2D,
  cx: number, legTopY: number,
  legW: number, legH: number,
  leftDy: number, rightDy: number,
  armorColor: string
) {
  const bootColor  = shade(armorColor, -28);
  const outline    = shade(armorColor, -45);
  const legHighlight = shade(armorColor, 20);

  // Left leg
  const lx = (cx - legW - 2) | 0;
  const ly = (legTopY + leftDy) | 0;
  px(ctx, lx, ly, legW, legH, armorColor);
  px(ctx, lx, ly, legW, 3, legHighlight);           // knee cap
  px(ctx, lx + 1, ly, 1, legH, shade(armorColor, 14));
  // Boot
  px(ctx, lx - 1, ly + legH, legW + 2, 5, bootColor);
  px(ctx, lx, ly + legH, legW, 2, shade(bootColor, 10));
  pxOutline(ctx, lx, ly, legW, legH + 5, outline);

  // Right leg
  const rx = (cx + 2) | 0;
  const ry = (legTopY + rightDy) | 0;
  px(ctx, rx, ry, legW, legH, armorColor);
  px(ctx, rx, ry, legW, 3, legHighlight);
  px(ctx, rx + 1, ry, 1, legH, shade(armorColor, 14));
  // Boot
  px(ctx, rx - 1, ry + legH, legW + 2, 5, bootColor);
  px(ctx, rx, ry + legH, legW, 2, shade(bootColor, 10));
  pxOutline(ctx, rx, ry, legW, legH + 5, outline);
}

export function drawWeapon(
  ctx: CanvasRenderingContext2D,
  char: CharacterDef,
  armX: number, armY: number,
  attacking: boolean, frameIdx: number,
  facing: 'south' | 'east'
) {
  const wc = char.weaponTint;
  const wdark = shade(wc, -25);
  const wlight = shade(wc, 25);

  switch (char.class) {
    case 'warrior': {
      // Sword: blade + guard + pommel
      if (facing === 'south') {
        px(ctx, armX + 2, armY + 8, 3, 24, wc);
        px(ctx, armX + 2, armY + 8, 1, 24, wlight);   // edge shine
        px(ctx, armX - 1, armY + 8, 7, 3, wdark);     // crossguard
        px(ctx, armX + 2, armY + 5, 3, 4, shade(wc, -15)); // pommel
      } else {
        px(ctx, armX + 4, armY - 6, 3, 28, wc);
        px(ctx, armX + 4, armY - 6, 1, 28, wlight);
        px(ctx, armX, armY + 6, 10, 3, wdark);
      }
      break;
    }
    case 'paladin': {
      // Holy sword with accent glow pixel
      if (facing === 'south') {
        px(ctx, armX + 2, armY + 8, 3, 22, wc);
        px(ctx, armX + 2, armY + 8, 1, 22, wlight);
        px(ctx, armX - 2, armY + 8, 9, 3, wdark);    // wider guard
        px(ctx, armX + 2, armY + 4, 4, 5, shade(wc,-15));
        px(ctx, armX + 3, armY + 10, 1, 2, char.accentColor); // holy gem
      } else {
        px(ctx, armX + 4, armY - 6, 3, 26, wc);
        px(ctx, armX, armY + 6, 11, 3, wdark);
      }
      break;
    }
    case 'mage': {
      // Staff: tall pole + orb
      if (facing === 'south') {
        px(ctx, armX + 3, armY - 12, 2, 32, wdark);     // shaft
        px(ctx, armX + 1, armY - 14, 6, 6, wc);         // orb outer
        px(ctx, armX + 2, armY - 13, 4, 4, shade(wc,30)); // orb inner glow
        px(ctx, armX + 3, armY - 13, 2, 2, '#FFFFFF');  // orb highlight
      } else {
        px(ctx, armX + 3, armY - 18, 2, 30, wdark);
        px(ctx, armX + 1, armY - 20, 6, 6, wc);
        px(ctx, armX + 2, armY - 19, 4, 4, shade(wc,30));
      }
      break;
    }
    case 'rogue': {
      // Dagger: short blade
      if (facing === 'south') {
        px(ctx, armX + 2, armY + 8, 3, 14, wc);
        px(ctx, armX + 2, armY + 8, 1, 14, wlight);
        px(ctx, armX, armY + 8, 7, 2, wdark);
        px(ctx, armX + 2, armY + 5, 3, 4, shade(wc,-20));
      } else {
        px(ctx, armX + 3, armY + 2, 2, 14, wc);
        px(ctx, armX + 1, armY + 2, 6, 2, wdark);
      }
      break;
    }
    case 'ranger': {
      // Bow: pixel-art arc using stacked rects
      if (facing === 'south') {
        const bx = armX + 4;
        const by = armY + 2;
        // Bow limb (left side)
        px(ctx, bx - 8, by + 2,  3, 3, wc);
        px(ctx, bx - 9, by + 5,  2, 6, wc);
        px(ctx, bx - 8, by + 11, 3, 4, wc);
        // String
        px(ctx, bx - 7, by,     1, 16, '#D8D0C0');
        // Arrow if attacking (frame 1)
        if (attacking && frameIdx === 1) {
          px(ctx, bx - 14, by + 7, 14, 2, '#C8A050');
          px(ctx, bx - 15, by + 6,  3,  4, '#E84020'); // fletching
        }
      } else {
        // Held sideways
        px(ctx, armX + 2, armY - 4, 3, 3, wc);
        px(ctx, armX, armY - 1, 2, 5, wc);
        px(ctx, armX + 2, armY + 4, 3, 3, wc);
        px(ctx, armX + 3, armY - 4, 1, 12, '#D8D0C0');
        if (attacking) px(ctx, armX - 2, armY + 3, 14, 2, '#C8A050');
      }
      break;
    }
    case 'berserker': {
      // Large axe
      if (facing === 'south') {
        px(ctx, armX + 2, armY,     3, 28, shade(wc,-18));  // haft
        px(ctx, armX - 3, armY + 2,  9, 10, wc);            // axe head
        px(ctx, armX - 3, armY + 2,  9,  3, wlight);        // edge shine
        px(ctx, armX - 3, armY + 10, 5,  4, shade(wc,-15)); // beard
      } else {
        px(ctx, armX + 2, armY - 6,  3, 22, shade(wc,-18));
        px(ctx, armX - 4, armY - 4, 10,  9, wc);
        px(ctx, armX - 4, armY - 4, 10,  2, wlight);
      }
      break;
    }
  }
}

export function drawClassAccessory(
  ctx: CanvasRenderingContext2D,
  char: CharacterDef,
  cx: number, torsoY: number,
  torsoW: number, armorColor: string
) {
  const tx = (cx - (torsoW >> 1)) | 0;
  const ac = char.accentColor;
  switch (char.class) {
    case 'warrior':
      // Pauldron rivets
      px(ctx, tx + 1, torsoY + 2, 2, 2, shade(armorColor, 30));
      px(ctx, tx + torsoW - 3, torsoY + 2, 2, 2, shade(armorColor, 30));
      // Center chest detail
      px(ctx, cx - 2, torsoY + 6, 4, 8, shade(ac, -20));
      break;
    case 'berserker':
      // Chain/spike detail
      px(ctx, tx + 2, torsoY + 5, 2, 2, ac);
      px(ctx, tx + torsoW - 4, torsoY + 5, 2, 2, ac);
      px(ctx, cx - 1, torsoY + 3, 2, 3, shade(ac,-10));
      break;
    case 'mage':
      // Robe clasp + magical trim
      px(ctx, cx - 1, torsoY + 2, 2, 14, shade(ac,-10));
      px(ctx, cx - 3, torsoY + 7, 6, 2, ac);
      px(ctx, cx - 1, torsoY + 12, 2, 2, shade(ac, 20));
      break;
    case 'paladin':
      // Cross emblem
      px(ctx, cx - 1, torsoY + 2, 3, 12, ac);
      px(ctx, cx - 4, torsoY + 6, 9, 3, ac);
      px(ctx, cx, torsoY + 5, 1, 1, shade(ac,40));
      break;
    case 'rogue':
      // Straps / buckles
      px(ctx, tx + 2, torsoY + 4, torsoW - 4, 2, shade(armorColor,-22));
      px(ctx, tx + 4, torsoY + 8, torsoW - 8, 2, shade(armorColor,-22));
      px(ctx, cx - 1, torsoY + 4, 2, 2, ac);
      break;
    case 'ranger':
      // Quiver strap (diagonal)
      px(ctx, tx + 2, torsoY + 1, 2, 14, shade(armorColor,-18));
      px(ctx, tx + 5, torsoY + 1, 2, 14, shade(armorColor,-18));
      break;
  }
}

export function drawRarityAccent(
  ctx: CanvasRenderingContext2D,
  char: CharacterDef,
  cx: number, baseY: number
) {
  const ac = char.accentColor;
  switch (char.rarity) {
    case 'common':
      break;
    case 'uncommon':
      // Single accent dot on shoulder
      px(ctx, cx + 8, baseY + 26, 2, 2, ac);
      break;
    case 'rare':
      // Shoulder gems
      px(ctx, cx - 10, baseY + 25, 3, 3, ac);
      px(ctx, cx + 8,  baseY + 25, 3, 3, ac);
      break;
    case 'epic':
      // Trim line + gems
      px(ctx, cx - 10, baseY + 23, 3, 3, ac);
      px(ctx, cx +  8, baseY + 23, 3, 3, ac);
      px(ctx, cx - 2,  baseY + 20, 4, 2, ac);
      break;
    case 'legendary': {
      // Glow highlights around shoulders + head
      const half = 10;
      px(ctx, cx - half - 1, baseY + 22, 2, 10, shade(ac, -10));
      px(ctx, cx + half - 1, baseY + 22, 2, 10, shade(ac, -10));
      px(ctx, cx - 1, baseY + 4, 2, 3, ac);
      break;
    }
    case 'mythic':
      // Premium crown-like highlights
      px(ctx, cx - 1, baseY + 2, 2, 4, ac);
      px(ctx, cx - 5, baseY + 4, 2, 3, shade(ac,-10));
      px(ctx, cx + 4, baseY + 4, 2, 3, shade(ac,-10));
      px(ctx, cx - 9, baseY + 23, 2, 8, shade(ac,-15));
      px(ctx, cx + 8, baseY + 23, 2, 8, shade(ac,-15));
      break;
  }
}

// ─── HELMET / CLASS HEADGEAR ──────────────────────────────────────────────────

function drawHeadgear(
  ctx: CanvasRenderingContext2D, char: CharacterDef,
  cx: number, baseY: number, hw: number
) {
  const ac = char.accentColor;
  const arm = AT[char.armorTier];

  switch (char.class) {
    case 'warrior':
    case 'paladin': {
      // Full helm with visor slit
      px(ctx, cx - hw + 1, baseY + 5, hw * 2 - 2, 8, arm.b);
      px(ctx, cx - hw + 1, baseY + 5, hw * 2 - 2, 2, arm.l);
      // Visor slit
      px(ctx, cx - 3, baseY + 10, 6, 2, shade(arm.blt, -10));
      // Plume for uncommon+
      if (char.rarity !== 'common') {
        px(ctx, cx - 1, baseY - 1, 3, 7, ac);
        px(ctx, cx,     baseY - 2, 1, 3, shade(ac, 20));
      }
      break;
    }
    case 'mage': {
      // Pointed wizard hat
      const hc = shade(char.armorColor, 15);
      px(ctx, cx - hw,     baseY + 7, hw * 2, 5, hc);
      px(ctx, cx - 6,      baseY + 2, 12,     6, hc);
      px(ctx, cx - 4,      baseY - 2, 8,      5, hc);
      px(ctx, cx - 2,      baseY - 6, 4,      5, hc);
      px(ctx, cx - 1,      baseY - 9, 2,      4, hc);
      // Hat band
      px(ctx, cx - hw, baseY + 7, hw * 2, 2, ac);
      break;
    }
    case 'rogue': {
      // Close hood over head
      const hc = shade(char.armorColor, 8);
      px(ctx, cx - hw - 1, baseY + 4, hw * 2 + 2, 12, hc);
      px(ctx, cx - hw + 1, baseY + 2, hw * 2 - 2,  4, hc);
      px(ctx, cx - hw + 3, baseY,     hw * 2 - 6,  3, hc);
      // Shadow inside hood
      px(ctx, cx - 4, baseY + 8, 8, 4, shade(hc, -30));
      break;
    }
    case 'ranger': {
      // Leather cap with feather
      px(ctx, cx - hw + 2, baseY + 5, hw * 2 - 4, 5, AT.leather.b);
      px(ctx, cx - hw + 2, baseY + 5, hw * 2 - 4, 2, AT.leather.l);
      // Feather
      if (char.rarity !== 'common') {
        px(ctx, cx + hw - 3, baseY + 1, 2, 6, ac);
        px(ctx, cx + hw - 4, baseY,     2, 3, shade(ac, 15));
      }
      break;
    }
    case 'berserker': {
      // Horned headband
      px(ctx, cx - hw, baseY + 9, hw * 2, 4, shade(arm.b,-20));
      px(ctx, cx - hw, baseY + 9, hw * 2, 2, ac);
      // Horns
      px(ctx, cx - hw - 3, baseY + 4, 4, 7, shade(arm.b, -30));
      px(ctx, cx + hw - 1, baseY + 4, 4, 7, shade(arm.b, -30));
      px(ctx, cx - hw - 2, baseY + 3, 2, 2, shade(arm.b, -40));
      px(ctx, cx + hw,     baseY + 3, 2, 2, shade(arm.b, -40));
      break;
    }
  }
}

// ─── DRAW SOUTH FRAME ─────────────────────────────────────────────────────────

function drawSouth(
  ctx: CanvasRenderingContext2D,
  char: CharacterDef,
  wp: WalkPhase,
  bob: number,
  anim: AnimType,
  frameIdx: number
) {
  const m = RACE_METRICS[char.race];
  const cx = 24;
  const baseY = m.dy + bob;
  const arm   = AT[char.armorTier];
  const isAttack = anim === 'attack';
  const isCast   = anim === 'cast';
  const ap   = isAttack ? ATTACK_PHASES[frameIdx & 3] : null;

  // Contact shadow
  drawContactShadow(ctx, cx, 61, (m.torsoW >> 1) + 2);

  // ── BACK ARM ──
  const backArmY = isAttack ? (baseY + 26) : (baseY + 26 + ((wp.la * 3) >> 3));
  const backArmX = cx - 15;
  drawArms(ctx, cx, backArmY, 7, 12, 15, 0, arm.b, char.skinColor, true);

  // ── SHIELD (warrior/paladin left hand) ──
  if ((char.class === 'warrior' || char.class === 'paladin') && !isAttack) {
    const sx = backArmX - 5;
    const sy = backArmY - 2;
    px(ctx, sx, sy, 6, 14, arm.b);
    px(ctx, sx, sy, 6, 2, arm.l);
    px(ctx, sx, sy + 5, 6, 2, shade(char.accentColor, -10));
    pxOutline(ctx, sx, sy, 6, 14, shade(arm.b, -40));
  }

  // ── LEGS ──
  const legTopY  = baseY + 43;
  const leftDy   = isAttack ? 0 : wp.ly;
  const rightDy  = isAttack ? 0 : wp.ry;
  drawLegs(ctx, cx, legTopY, m.legH > 9 ? 9 : m.legH, m.legH, leftDy, rightDy, arm.b);

  // ── TORSO ──
  const torsoY  = baseY + 24;
  const torsoW  = (char.class === 'berserker') ? m.torsoW + 4 : m.torsoW;
  drawTorsoArmor(ctx, cx, torsoY, torsoW, m.torsoH, arm.b, arm.l, arm.d, arm.blt,
    char.class, char.accentColor, char.class === 'berserker');
  drawClassAccessory(ctx, char, cx, torsoY, torsoW, arm.b);

  // ── NECK ──
  px(ctx, cx - 3, baseY + 21, 6, 5, char.skinColor);

  // ── HEAD ──
  const headCY = baseY + 13;
  drawHead(ctx, cx, headCY, m.headW, m.headH, char.skinColor);

  // ── HAIR ──
  drawHair(ctx, cx, headCY, m.headW, m.headH, char.hairColor, char.class);

  // ── HEADGEAR ──
  drawHeadgear(ctx, char, cx, baseY, m.headW >> 1);

  // ── EYES ──
  px(ctx, cx - 6, baseY + 13, 3, 2, char.eyeColor);
  px(ctx, cx + 3, baseY + 13, 3, 2, char.eyeColor);
  px(ctx, cx - 5, baseY + 13, 1, 2, '#18141C');
  px(ctx, cx + 4, baseY + 13, 1, 2, '#18141C');

  // ── FRONT ARM + WEAPON ──
  if (ap) {
    const fax = cx + 7 + ap.armX;
    const fay = baseY + 26 + ap.armY;
    drawArms(ctx, cx + 7 + ap.armX + 7, fay, 7, 12, 0, 0, arm.b, char.skinColor, false);
    drawWeapon(ctx, char, fax, fay, true, frameIdx, 'south');
  } else if (isCast) {
    // Both arms raised
    drawArms(ctx, cx + 10, baseY + 18, 7, 12, 0, 0, arm.b, char.skinColor, false);
    drawWeapon(ctx, char, cx + 8, baseY + 16, false, 0, 'south');
  } else {
    const fax = cx + 7;
    const fay = baseY + 26 + ((wp.ra * 3) >> 3);
    drawArms(ctx, cx + 7 + 7, fay, 7, 12, 0, 0, arm.b, char.skinColor, false);
    drawWeapon(ctx, char, fax, fay, false, 0, 'south');
  }

  // ── RARITY ACCENT ──
  drawRarityAccent(ctx, char, cx, baseY);
}

// ─── DRAW NORTH FRAME ─────────────────────────────────────────────────────────

function drawNorth(ctx: CanvasRenderingContext2D, char: CharacterDef, wp: WalkPhase, bob: number) {
  const m  = RACE_METRICS[char.race];
  const cx = 24;
  const by = m.dy + bob;
  const arm = AT[char.armorTier];

  drawContactShadow(ctx, cx, 61, (m.torsoW >> 1) + 2);

  // Legs (same as south, back view)
  drawLegs(ctx, cx, by + 43, m.legH > 9 ? 9 : m.legH, m.legH, wp.ly, wp.ry, shade(arm.b, -10));

  // Arms (wider from behind)
  px(ctx, cx - 16, by + 26 + ((wp.la * 3) >> 3), 7, 12, shade(arm.b, -8));
  px(ctx, cx + 9,  by + 26 - ((wp.la * 3) >> 3), 7, 12, shade(arm.b, -8));

  // Torso back (slightly darker)
  const torsoW = (char.class === 'berserker') ? m.torsoW + 4 : m.torsoW;
  const tx     = (cx - (torsoW >> 1)) | 0;
  px(ctx, tx, by + 24, torsoW, m.torsoH, shade(arm.b, -12));
  px(ctx, tx + 2, by + 24, torsoW - 4, 2, shade(arm.l, -8));
  px(ctx, tx - 1, by + 24 + m.torsoH, torsoW + 2, 4, arm.blt);
  pxOutline(ctx, tx, by + 24, torsoW, m.torsoH, shade(arm.b, -45));

  // Neck back
  px(ctx, cx - 3, by + 20, 6, 5, shade(char.skinColor, -12));

  // Head back
  const headCY = by + 13;
  drawHead(ctx, cx, headCY, m.headW, m.headH, shade(char.skinColor, -12));

  // Back hair (more visible)
  const hx = (cx - (m.headW >> 1)) | 0;
  const hy = (headCY - (m.headH >> 1)) | 0;
  px(ctx, hx + 1, hy - 1, m.headW - 2, 8, char.hairColor);
  px(ctx, hx - 1, hy + 3, m.headW + 2, 7, char.hairColor);
  if (char.class !== 'mage' && char.class !== 'paladin') {
    px(ctx, hx, hy + 12, m.headW, 6, char.hairColor);
  }
  drawHeadgear(ctx, char, cx, by, m.headW >> 1);
}

// ─── DRAW EAST FRAME ─────────────────────────────────────────────────────────

function drawEast(
  ctx: CanvasRenderingContext2D,
  char: CharacterDef,
  wp: WalkPhase,
  bob: number,
  anim: AnimType,
  frameIdx: number
) {
  const m  = RACE_METRICS[char.race];
  const cx = 24;
  const by = m.dy + bob;
  const arm = AT[char.armorTier];
  const isAttack = anim === 'attack';
  const ap = isAttack ? ATTACK_PHASES[frameIdx & 3] : null;

  drawContactShadow(ctx, cx, 61, 9);

  // Back leg
  const backLegY = (by + 43 + (isAttack ? 0 : wp.ry)) | 0;
  px(ctx, cx - 3, backLegY, 7, m.legH, shade(arm.b, -18));
  px(ctx, cx - 4, backLegY + m.legH, 9, 5, shade(arm.b, -35));

  // Back arm
  const backArmY2 = (by + 26 + (isAttack ? 0 : ((wp.la * 3) >> 3))) | 0;
  px(ctx, cx - 9, backArmY2, 6, 12, shade(arm.b, -22));
  px(ctx, cx - 9, backArmY2 + 12, 6, 4, shade(char.skinColor, -10));

  // Torso side view (narrower)
  px(ctx, cx - 8, by + 24, 14, m.torsoH, arm.b);
  px(ctx, cx - 8, by + 24, 14, 3, arm.l);
  px(ctx, cx + 4,  by + 26, 2, m.torsoH - 3, arm.d);
  px(ctx, cx - 9, by + 24 + m.torsoH, 16, 4, arm.blt);
  pxOutline(ctx, cx - 8, by + 24, 14, m.torsoH, shade(arm.b, -40));

  // Neck
  px(ctx, cx - 3, by + 21, 5, 5, char.skinColor);

  // Head profile
  const headCY = by + 13;
  const hx  = cx - (m.headW >> 1) + 1;
  const hhy = headCY - (m.headH >> 1);
  pxRound(ctx, hx, hhy, m.headW - 2, m.headH, char.skinColor);
  // Nose
  px(ctx, hx + m.headW - 4, hhy + 6, 3, 3, shade(char.skinColor, -15));
  // Jaw shadow
  px(ctx, hx + 2, hhy + m.headH - 4, m.headW - 5, 3, shade(char.skinColor, -18));

  // Profile hair
  px(ctx, hx - 2, hhy - 1, m.headW - 2, 7, char.hairColor);
  px(ctx, hx - 3, hhy + 2, 4, 8, char.hairColor);
  if (char.class !== 'mage') px(ctx, hx - 2, hhy + 7, 3, 7, char.hairColor);
  drawHeadgear(ctx, char, cx + 2, by, (m.headW >> 1) - 1);

  // Eye (profile)
  px(ctx, hx + m.headW - 6, hhy + 5, 2, 2, char.eyeColor);
  px(ctx, hx + m.headW - 6, hhy + 5, 1, 2, '#18141C');

  // Front leg
  const frontLegY = (by + 43 + (isAttack ? 0 : wp.ly)) | 0;
  px(ctx, cx - 3, frontLegY, 7, m.legH, arm.b);
  px(ctx, cx - 3, frontLegY, 7, 3, shade(arm.b, 18));
  px(ctx, cx - 4, frontLegY + m.legH, 9, 5, shade(arm.b, -28));
  pxOutline(ctx, cx - 3, frontLegY, 7, m.legH + 5, shade(arm.b, -40));

  // Front arm + weapon
  if (ap) {
    px(ctx, cx + 4 + ap.armX, by + 26, 6, 12, arm.b);
    px(ctx, cx + 4 + ap.armX, by + 26 + 12, 6, 4, shade(char.skinColor, -10));
    drawWeapon(ctx, char, cx + 4 + ap.armX, by + 26, true, frameIdx, 'east');
  } else {
    const fay = (by + 26 - ((wp.la * 3) >> 3)) | 0;
    px(ctx, cx + 4, fay, 6, 12, arm.b);
    px(ctx, cx + 4, fay + 12, 6, 4, shade(char.skinColor, -10));
    drawWeapon(ctx, char, cx + 4, fay, false, 0, 'east');
  }

  drawRarityAccent(ctx, char, cx, by);
}

// ─── DRAW WEST FRAME (mirror east) ───────────────────────────────────────────

function drawWest(ctx: CanvasRenderingContext2D, char: CharacterDef, wp: WalkPhase, bob: number, anim: AnimType, frameIdx: number) {
  ctx.save();
  ctx.translate(CHAR_FRAME_W, 0);
  ctx.scale(-1, 1);
  const mwp: WalkPhase = { ...wp, la: -wp.la, ra: -wp.ra };
  drawEast(ctx, char, mwp, bob, anim, frameIdx);
  ctx.restore();
}

// ─── DRAW HURT FRAME ─────────────────────────────────────────────────────────

function drawHurt(ctx: CanvasRenderingContext2D, char: CharacterDef, frameIdx: number) {
  // Recoil pose: body tilted back, arms thrown back
  const hurtBob = [2, 4, 3, 1];
  const hurtX   = [0, 2, 1, 0];
  const bob = hurtBob[frameIdx & 3];
  const dx  = hurtX[frameIdx & 3];
  const wp: WalkPhase = { ly: 0, ry: 0, by: 0, la: -4, ra: -4 };
  // Draw south with slight offset and "hurt" tint
  ctx.save();
  ctx.translate(dx, 0);
  drawSouth(ctx, char, wp, bob, 'idle', 0);
  // Red flash overlay
  ctx.fillStyle = `rgba(255,40,40,${0.08 + frameIdx * 0.04})`;
  ctx.fillRect(8, 4, 32, 52);
  ctx.restore();
}

// ─── DRAW DEATH FRAME ────────────────────────────────────────────────────────

function drawDeath(ctx: CanvasRenderingContext2D, char: CharacterDef, frameIdx: number) {
  // Falling sequence: character tilts and lowers
  const deathDy = [0, 8, 16, 20];
  const dy = deathDy[frameIdx & 3];

  const m   = RACE_METRICS[char.race];
  const cx  = 24;
  const by  = m.dy + dy;
  const arm = AT[char.armorTier];

  // For death, draw a "lying flat" pose at frame 3, or tilting at earlier frames
  if (frameIdx >= 3) {
    // Lying flat: draw horizontally collapsed
    const groundY = 54;
    drawContactShadow(ctx, cx, 56, (m.torsoW >> 1) + 4);
    px(ctx, cx - (m.torsoW >> 1) - 2, groundY - 4, m.torsoW + 4, m.torsoH - 8, shade(arm.b,-15));
    px(ctx, cx - (m.headW >> 1) + m.torsoW / 2 + 2, groundY - 4, m.headW, m.headH - 6, shade(char.skinColor, -20));
    return;
  }

  // Falling: tilt forward
  drawContactShadow(ctx, cx, 61, (m.torsoW >> 1) + 2);
  const wp: WalkPhase = { ly: dy >> 1, ry: dy >> 1, by: 0, la: dy, ra: dy };
  drawSouth(ctx, char, wp, by - m.dy, 'idle', 0);
}

// ─── DRAW CAST FRAME ─────────────────────────────────────────────────────────

function drawCast(ctx: CanvasRenderingContext2D, char: CharacterDef, frameIdx: number) {
  const castBob = [0, -1, -2, -1];
  const bob = castBob[frameIdx & 3];
  drawSouth(ctx, char, WALK_PHASES[0], bob, 'cast', frameIdx);
  // Spell energy glow
  const m  = RACE_METRICS[char.race];
  const cx = 24;
  const by = m.dy + bob;
  if (char.class === 'mage' || char.class === 'paladin') {
    const gc = char.accentColor;
    const alpha = 0.15 + (frameIdx & 3) * 0.06;
    ctx.fillStyle = gc + Math.round(alpha * 255).toString(16).padStart(2, '0');
    ctx.fillRect((cx - 10) | 0, (by + 10) | 0, 20, 20);
  }
}

// ─── PUBLIC API: RENDER SINGLE FRAME ─────────────────────────────────────────

export function renderCharacterFrame(
  char: CharacterDef,
  anim: AnimType,
  frameIdx: number
): HTMLCanvasElement {
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
  return canvas;
}

// ─── PUBLIC API: RENDER SPRITE SHEET (192 × 576) ─────────────────────────────

export function renderCharacterSheet(char: CharacterDef): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width  = CHAR_SHEET_COLS * CHAR_FRAME_W;   // 192
  canvas.height = CHAR_SHEET_ROWS * CHAR_FRAME_H;   // 576
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  const anims: AnimType[] = [
    'walk_south', 'walk_west', 'walk_east', 'walk_north',
    'idle', 'attack', 'cast', 'hurt', 'death',
  ];
  anims.forEach((a, row) => {
    for (let col = 0; col < CHAR_SHEET_COLS; col++) {
      const frame = renderCharacterFrame(char, a, col);
      ctx.drawImage(frame, col * CHAR_FRAME_W, row * CHAR_FRAME_H);
    }
  });
  return canvas;
}

// ─── PUBLIC API: THUMBNAIL (idle south frame 0) ──────────────────────────────

export function renderCharacterThumb(char: CharacterDef): HTMLCanvasElement {
  return renderCharacterFrame(char, 'idle', 0);
}

// ─── PUBLIC API: PACK ALL CHARACTER SHEETS INTO ATLAS ────────────────────────

export interface CharAtlasResult {
  atlasCanvas: HTMLCanvasElement;
  positions: Record<string, { x: number; y: number; sheetW: number; sheetH: number }>;
}

export function packCharacterAtlas(): CharAtlasResult {
  const COLS  = 8;
  const sheetW = CHAR_SHEET_COLS * CHAR_FRAME_W;  // 192
  const sheetH = CHAR_SHEET_ROWS * CHAR_FRAME_H;  // 576
  const rows  = Math.ceil(ALL_CHARACTERS.length / COLS);

  const atlas = document.createElement('canvas');
  atlas.width  = COLS * sheetW;
  atlas.height = rows * sheetH;
  const ctx = atlas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  const positions: CharAtlasResult['positions'] = {};
  ALL_CHARACTERS.forEach((char, i) => {
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
