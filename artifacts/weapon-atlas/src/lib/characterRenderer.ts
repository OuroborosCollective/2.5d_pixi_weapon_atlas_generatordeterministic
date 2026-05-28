// characterRenderer.ts — Areloria Character Forge
// Production-grade procedural pixel-art character sprite generator
// Sheet: 4 cols × 9 rows = 36 frames per character
//   Row 0: walk_south   Row 1: walk_west   Row 2: walk_east
//   Row 3: walk_north   Row 4: idle        Row 5: attack
//   Row 6: cast(fb)     Row 7: hurt(fb)    Row 8: death(fb)

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
  headW: number;
  headH: number;
  torsoW: number;
  torsoH: number;
  legH: number;
  dy: number;
}

const RACE_METRICS: Record<CharacterRace, RaceMetrics> = {
  human: { headW: 16, headH: 16, torsoW: 20, torsoH: 18, legH: 13, dy: 0  },
  elf:   { headW: 14, headH: 16, torsoW: 18, torsoH: 19, legH: 15, dy: -1 },
  dwarf: { headW: 16, headH: 15, torsoW: 24, torsoH: 15, legH:  9, dy: 4  },
  orc:   { headW: 18, headH: 16, torsoW: 24, torsoH: 18, legH: 13, dy: 0  },
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
  // Fill corners (make rounder)
  ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
}

function pxOutline(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  x = x | 0; y = y | 0; w = w | 0; h = h | 0;
  ctx.fillStyle = color;
  ctx.fillRect(x,     y,       w, 1);
  ctx.fillRect(x,     y+h-1,   w, 1);
  ctx.fillRect(x,     y,       1, h);
  ctx.fillRect(x+w-1, y,       1, h);
}

function shade(c: string, amt: number): string {
  const n = parseInt(c.replace('#',''), 16);
  const r = Math.max(0, Math.min(255, (n >> 16)         + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amt));
  const b = Math.max(0, Math.min(255, (n & 0xff)        + amt));
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
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
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect((cx - width) | 0, groundY | 0, (width * 2) | 0, 2);
  ctx.fillStyle = 'rgba(0,0,0,0.14)';
  ctx.fillRect((cx - width + 1) | 0, (groundY + 2) | 0, (width * 2 - 2) | 0, 1);
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.fillRect((cx - width + 2) | 0, (groundY - 1) | 0, (width * 2 - 4) | 0, 1);
}

// ─── HEAD ────────────────────────────────────────────────────────────────────

export function drawHead(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, skinColor: string) {
  const x = (cx - (w >> 1)) | 0;
  const y = (cy - (h >> 1)) | 0;
  // Fill with rounded shape
  pxRound(ctx, x, y, w, h, skinColor);
  // Strong outline
  pxOutline(ctx, x, y, w, h, '#1A1420');
  // Upper-left cheek highlight
  px(ctx, x + 2, y + 2, w - 6, 4, shade(skinColor, 16));
  // Right shadow
  px(ctx, x + w - 4, y + 3, 3, h - 6, shade(skinColor, -20));
  // Jaw/chin shadow
  px(ctx, x + 2, y + h - 5, w - 4, 4, shade(skinColor, -20));
}

// Face features (eyes, brows) — called after headgear so visor can override
function drawFace(ctx: CanvasRenderingContext2D, cx: number, eyeY: number, eyeColor: string, hairColor: string) {
  // Left eye (2×2)
  const lx = cx - 6;
  const rx = cx + 3;
  px(ctx, lx, eyeY, 3, 2, eyeColor);
  px(ctx, lx, eyeY, 1, 2, '#160C18');         // pupil
  px(ctx, lx + 1, eyeY, 1, 1, shade(eyeColor, 50)); // gleam
  // Right eye
  px(ctx, rx, eyeY, 3, 2, eyeColor);
  px(ctx, rx, eyeY, 1, 2, '#160C18');
  px(ctx, rx + 1, eyeY, 1, 1, shade(eyeColor, 50));
  // Eyebrows
  const br = shade(hairColor, -15);
  px(ctx, lx - 1, eyeY - 2, 4, 1, br);
  px(ctx, rx,     eyeY - 2, 4, 1, br);
  // Nose shadow (subtle 1px)
  px(ctx, cx,     eyeY + 4, 2, 1, shade(eyeColor, -35));
}

export function drawHair(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, hairColor: string, charClass: CharacterClass) {
  const hx = (cx - (w >> 1)) | 0;
  const hy = (cy - (h >> 1)) | 0;
  // Top sweep
  px(ctx, hx + 2, hy - 3, w - 4, 7, hairColor);
  px(ctx, hx + 1, hy,     w - 2, 4, hairColor);
  px(ctx, hx + 3, hy - 2, w - 6, 3, shade(hairColor, 18)); // highlight
  // Side pieces
  px(ctx, hx - 1, hy + 3,  3, 9, hairColor);
  px(ctx, hx + w - 2, hy + 3, 3, 9, hairColor);

  if (charClass === 'berserker') {
    // Wild spiky
    px(ctx, hx - 2, hy,     3, 7, shade(hairColor, -8));
    px(ctx, hx + w - 1, hy, 3, 7, shade(hairColor, -8));
    px(ctx, hx,     hy - 5, 3, 4, hairColor);
    px(ctx, hx + w - 3, hy - 5, 3, 4, hairColor);
    px(ctx, cx - 1, hy - 6, 2, 4, hairColor);
  } else if (charClass === 'mage') {
    // Long flowing sides under hat
    px(ctx, hx - 1, hy + 8, 3, 10, hairColor);
    px(ctx, hx + w - 2, hy + 8, 3, 10, hairColor);
  } else if (charClass === 'ranger') {
    // Medium with side sweep
    px(ctx, hx - 1, hy + 5, 2, 11, hairColor);
    px(ctx, hx + w - 1, hy + 5, 2, 8, hairColor);
  }
}

// ─── HEADGEAR ────────────────────────────────────────────────────────────────

function drawHeadgear(ctx: CanvasRenderingContext2D, char: CharacterDef, cx: number, baseY: number, hw: number) {
  const ac  = char.accentColor;
  const arm = AT[char.armorTier];
  const headTopY = baseY + 5; // head top for human/elf (approx)

  switch (char.class) {
    case 'warrior': {
      // Full closed helmet — covers entire head except lower face
      const hc  = arm.b;
      const hl  = arm.l;
      const hd  = arm.d;
      const hout = shade(hc, -45);
      // Helmet dome (full width over head)
      px(ctx, cx - hw - 1, headTopY,     hw * 2 + 2, 10, hc);
      px(ctx, cx - hw,     headTopY - 1, hw * 2,      2,  hc);
      // Highlight strip at top
      px(ctx, cx - hw + 1, headTopY,     hw * 2 - 2,  2,  hl);
      // Cheek guards (sides)
      px(ctx, cx - hw - 2, headTopY + 4, 3, 10, shade(hc, -8));
      px(ctx, cx + hw,     headTopY + 4, 3, 10, shade(hc, -8));
      // Visor slit (just eye slit, dark)
      px(ctx, cx - 5, headTopY + 7, 10, 2, shade(hd, -20));
      px(ctx, cx - 4, headTopY + 7,  8, 1, '#0A080E');
      // Nose guard (center strip)
      px(ctx, cx - 1, headTopY + 7, 2, 6, shade(hc, -15));
      // Chin strap bottom
      px(ctx, cx - hw,     headTopY + 10, hw * 2, 3, shade(hc, -10));
      pxOutline(ctx, cx - hw - 1, headTopY, hw * 2 + 2, 13, hout);
      // Plume for rare+
      if (char.rarity !== 'common' && char.rarity !== 'uncommon') {
        px(ctx, cx - 2, headTopY - 5, 4, 6, ac);
        px(ctx, cx - 1, headTopY - 7, 2, 3, shade(ac, 20));
        px(ctx, cx - 3, headTopY - 4, 2, 4, shade(ac, -15));
      }
      break;
    }

    case 'paladin': {
      // Great helm with cross visor + blue plume/tabard
      const hc  = shade(arm.b, 10); // slightly brighter than warrior
      const hl  = shade(arm.l, 10);
      const hout = shade(hc, -45);
      px(ctx, cx - hw - 1, headTopY,     hw * 2 + 2, 10, hc);
      px(ctx, cx - hw,     headTopY - 1, hw * 2,      2,  hc);
      px(ctx, cx - hw + 1, headTopY,     hw * 2 - 2,  2,  hl);
      px(ctx, cx - hw - 2, headTopY + 4, 3, 10, shade(hc,-8));
      px(ctx, cx + hw,     headTopY + 4, 3, 10, shade(hc,-8));
      // Cross visor (horizontal + vertical)
      px(ctx, cx - 5, headTopY + 7, 10, 2, shade(arm.d, -15));
      px(ctx, cx - 1, headTopY + 5, 2,  6, shade(arm.d, -15));
      px(ctx, cx - 4, headTopY + 8, 8,  1, '#0A080E');
      pxOutline(ctx, cx - hw - 1, headTopY, hw * 2 + 2, 13, hout);
      // Holy plume — accent color
      px(ctx, cx - 2, headTopY - 6, 4, 7, ac);
      px(ctx, cx - 1, headTopY - 8, 2, 3, shade(ac, 25));
      px(ctx, cx - 3, headTopY - 5, 2, 5, shade(ac, -15));
      break;
    }

    case 'mage': {
      // Tall pointed wizard hat — WIDE brim, tall cone
      const hc   = char.armorColor;
      const hcl  = shade(hc, 20);
      const hcd  = shade(hc, -20);
      const hout = shade(hc, -55);
      // Wide brim (20px wide, 3px tall, at head top)
      const brimY = headTopY + 1;
      const brimX = cx - 10;
      const brimW = 20;
      px(ctx, brimX, brimY,     brimW, 3, hc);
      px(ctx, brimX, brimY,     brimW, 1, hcl);        // brim highlight
      px(ctx, brimX, brimY + 3, brimW, 1, hcd);        // brim underside
      // Accent band (at brim top)
      px(ctx, brimX + 1, brimY, brimW - 2, 2, ac);
      // Hat cone — 5 layers getting narrower
      px(ctx, cx - 7, brimY - 5,  14, 5, hc);          // lower cone
      px(ctx, cx - 7, brimY - 5,  14, 1, hcl);
      px(ctx, cx - 5, brimY - 10, 10, 6, hc);          // mid cone
      px(ctx, cx - 5, brimY - 10, 10, 1, hcl);
      px(ctx, cx - 3, brimY - 15,  6, 6, hc);          // upper cone
      px(ctx, cx - 3, brimY - 15,  6, 1, hcl);
      px(ctx, cx - 1, brimY - 19,  2, 5, hc);          // tip
      // Hat outlines (left/right sides of cone)
      px(ctx, brimX,     brimY,     1, 3, hout);
      px(ctx, brimX+brimW-1, brimY, 1, 3, hout);
      px(ctx, cx - 7,   brimY - 5,  1, 5, hout);
      px(ctx, cx + 7,   brimY - 5,  1, 5, hout);
      px(ctx, cx - 5,   brimY - 10, 1, 6, hout);
      px(ctx, cx + 5,   brimY - 10, 1, 6, hout);
      px(ctx, cx - 3,   brimY - 15, 1, 6, hout);
      px(ctx, cx + 3,   brimY - 15, 1, 6, hout);
      // Star on hat for rare+
      if (char.rarity !== 'common') {
        px(ctx, cx - 1, brimY - 8, 2, 1, shade(ac, 20));
        px(ctx, cx,     brimY - 9, 1, 3, shade(ac, 20));
      }
      break;
    }

    case 'rogue': {
      // Deep fabric hood — close-fitting, dark
      const hc  = shade(char.armorColor, 5);
      const hcd = shade(hc, -35);
      // Hood wraps around entire head
      px(ctx, cx - hw - 2, headTopY + 1, hw * 2 + 4, 14, hc);
      px(ctx, cx - hw,     headTopY - 1, hw * 2,      3,  hc);
      px(ctx, cx - hw + 2, headTopY - 3, hw * 2 - 4,  3,  hc);
      // Peak at top center
      px(ctx, cx - 2, headTopY - 5, 4, 3, hc);
      // Deep shadow inside hood (forehead area)
      px(ctx, cx - 5, headTopY + 2,  10, 4, hcd);
      // Side shadows
      px(ctx, cx - hw - 1, headTopY + 3, 2, 10, shade(hc, -25));
      px(ctx, cx + hw,     headTopY + 3, 2, 10, shade(hc, -25));
      pxOutline(ctx, cx - hw - 2, headTopY + 1, hw * 2 + 4, 12, shade(hc, -50));
      break;
    }

    case 'ranger': {
      // Leather hood — looser shape, slightly peaked
      const hc  = shade(char.armorColor, 8);
      const hcl = shade(hc, 20);
      const hcd = shade(hc, -25);
      // Hood behind head (wider backing)
      px(ctx, cx - hw - 3, headTopY, hw * 2 + 6, 14, shade(hc, -12));
      // Hood front
      px(ctx, cx - hw - 1, headTopY + 1, hw * 2 + 2, 12, hc);
      px(ctx, cx - hw + 1, headTopY - 1, hw * 2 - 2,  3,  hc);
      px(ctx, cx - 2, headTopY - 4, 4, 3, hc); // peak
      // Highlight
      px(ctx, cx - hw + 2, headTopY + 1, hw * 2 - 4, 2, hcl);
      // Shadow inside
      px(ctx, cx - 4, headTopY + 3, 8, 4, hcd);
      // Feather (rare+)
      if (char.rarity !== 'common') {
        const fx = cx + hw - 1;
        px(ctx, fx,     headTopY - 2, 2, 8, ac);
        px(ctx, fx - 1, headTopY - 1, 2, 4, shade(ac, 15));
        px(ctx, fx + 1, headTopY + 1, 2, 4, shade(ac, -10));
      }
      pxOutline(ctx, cx - hw - 1, headTopY + 1, hw * 2 + 2, 12, shade(hc, -45));
      break;
    }

    case 'berserker': {
      // Spiked horned headband
      const hc  = shade(arm.b, -15);
      const hornC = shade(arm.b, -35);
      // Headband
      px(ctx, cx - hw - 1, headTopY + 7, hw * 2 + 2, 4, hc);
      px(ctx, cx - hw - 1, headTopY + 7, hw * 2 + 2, 1, shade(hc, 15)); // top highlight
      px(ctx, cx - hw - 1, headTopY + 10, hw * 2 + 2, 1, shade(hc,-20)); // bottom shadow
      // Accent rivets
      px(ctx, cx - 3, headTopY + 8, 2, 2, ac);
      px(ctx, cx + 1, headTopY + 8, 2, 2, ac);
      // Left horn
      px(ctx, cx - hw - 4, headTopY + 5, 4, 3, hornC);
      px(ctx, cx - hw - 3, headTopY + 3, 3, 3, hornC);
      px(ctx, cx - hw - 2, headTopY + 1, 2, 3, shade(hornC, -10));
      // Right horn
      px(ctx, cx + hw + 1, headTopY + 5, 4, 3, hornC);
      px(ctx, cx + hw,     headTopY + 3, 3, 3, hornC);
      px(ctx, cx + hw,     headTopY + 1, 2, 3, shade(hornC, -10));
      pxOutline(ctx, cx - hw - 1, headTopY + 7, hw * 2 + 2, 4, shade(hc, -50));
      break;
    }
  }
}

// ─── BODY: STANDARD ARMOR TORSO ──────────────────────────────────────────────

export function drawTorsoArmor(
  ctx: CanvasRenderingContext2D,
  cx: number, torsoY: number,
  w: number, h: number,
  armorBase: string, armorLight: string, armorDark: string,
  beltColor: string, charClass: CharacterClass,
  accentColor: string, isBerserker: boolean
) {
  const tx   = (cx - (w >> 1)) | 0;
  const out  = shade(armorBase, -50);
  const shoulderExt = (charClass === 'warrior' || charClass === 'berserker' || charClass === 'paladin') ? 4 : 1;

  // Main torso fill
  px(ctx, tx, torsoY, w, h, armorBase);

  // Pauldrons / shoulder caps
  if (shoulderExt > 0) {
    const pw = w + shoulderExt * 2;
    const px_ = tx - shoulderExt;
    px(ctx, px_, torsoY,     pw, 6, shade(armorBase, -10));
    px(ctx, px_, torsoY,     pw, 2, armorLight);            // highlight top edge
    px(ctx, px_ + 1, torsoY + 2, pw - 2, 1, armorLight);
    pxOutline(ctx, px_, torsoY, pw, 6, out);
    if (isBerserker) {
      // Spiked shoulder tips
      px(ctx, px_ - 1, torsoY - 3, 3, 4, shade(armorBase, -22));
      px(ctx, px_ + pw - 2, torsoY - 3, 3, 4, shade(armorBase, -22));
    }
  }

  // Chest plate detail
  const cpX = tx + 3, cpY = torsoY + 7, cpW = w - 6, cpH = h - 10;
  px(ctx, cpX, cpY, cpW, cpH, shade(armorBase, -6)); // slightly recessed center plate
  px(ctx, cpX, cpY, cpW, 2, armorLight);              // chest highlight
  px(ctx, cpX + cpW - 2, cpY + 2, 2, cpH - 3, armorDark); // right shadow

  // Class emblem on chest
  switch (charClass) {
    case 'warrior':
      px(ctx, cx - 2, torsoY + 7, 4, 10, shade(accentColor, -20)); // chevron
      px(ctx, cx - 4, torsoY + 10, 8, 3, shade(accentColor, -20));
      break;
    case 'paladin':
      // Cross
      px(ctx, cx - 1, torsoY + 5, 3, 12, accentColor);
      px(ctx, cx - 5, torsoY + 9, 11, 3, accentColor);
      px(ctx, cx,     torsoY + 8, 1, 1, shade(accentColor, 50)); // center gem
      break;
    case 'berserker':
      px(ctx, cx - 2, torsoY + 5, 4, 2, accentColor);
      px(ctx, cx - 4, torsoY + 9, 8, 2, accentColor);
      break;
    case 'mage':
      px(ctx, cx - 1, torsoY + 3, 2, 12, shade(accentColor, -15));
      px(ctx, cx - 3, torsoY + 7, 6, 2, accentColor);
      break;
    case 'rogue':
      // Strap diagonal
      px(ctx, tx + 2, torsoY + 2, w - 4, 2, shade(armorBase, -25));
      px(ctx, tx + 3, torsoY + 6, w - 6, 2, shade(armorBase, -25));
      px(ctx, cx - 1, torsoY + 4, 2, 2, accentColor); // buckle
      break;
    case 'ranger':
      px(ctx, tx + 2, torsoY + 1, 2, h - 3, shade(armorBase, -20)); // quiver strap
      px(ctx, tx + 5, torsoY + 1, 2, h - 3, shade(armorBase, -20));
      break;
  }

  // Belt
  px(ctx, tx - 1, torsoY + h, w + 2, 4, beltColor);
  px(ctx, tx,     torsoY + h, w,     1, shade(beltColor, 18));
  px(ctx, tx,     torsoY + h + 3, w, 1, shade(beltColor, -20));
  // Belt buckle
  px(ctx, cx - 2, torsoY + h + 1, 4, 2, shade(beltColor, 30));
  px(ctx, cx - 1, torsoY + h + 1, 2, 2, shade(beltColor, 50));

  // Torso outline
  pxOutline(ctx, tx, torsoY, w, h, out);
}

// ─── BODY: MAGE ROBE ─────────────────────────────────────────────────────────

function drawMageRobe(
  ctx: CanvasRenderingContext2D,
  cx: number, baseY: number,
  char: CharacterDef
) {
  const rc   = char.armorColor;
  const rcl  = shade(rc, 22);
  const rcd  = shade(rc, -22);
  const rout = shade(rc, -55);
  const belt = shade(rc, -38);
  const ac   = char.accentColor;
  const robeTopY = baseY + 24;

  // ── Upper robe (torso area) ──
  const uw = 22;
  const utx = (cx - (uw >> 1)) | 0;
  px(ctx, utx, robeTopY, uw, 14, rc);
  // Shoulder highlight
  px(ctx, utx + 1, robeTopY, uw - 2, 3, rcl);
  // Right shadow strip
  px(ctx, utx + uw - 3, robeTopY + 2, 2, 11, rcd);
  // Center clasp/trim
  px(ctx, cx - 1, robeTopY, 2, 14, shade(ac, -20));
  px(ctx, cx - 2, robeTopY + 5, 4, 2, ac);
  px(ctx, cx - 1, robeTopY + 9, 2, 2, shade(ac, 20));
  pxOutline(ctx, utx, robeTopY, uw, 14, rout);

  // ── Belt ──
  const beltY = robeTopY + 13;
  px(ctx, utx - 2, beltY, uw + 4, 5, belt);
  px(ctx, utx - 2, beltY, uw + 4, 1, shade(belt, 25));
  px(ctx, utx - 2, beltY + 4, uw + 4, 1, shade(belt, -20));
  // Belt buckle
  px(ctx, cx - 2, beltY + 1, 4, 3, shade(belt, 40));
  px(ctx, cx - 1, beltY + 2, 2, 1, shade(belt, 60));

  // ── Lower robe (wide trapezoid) ──
  const lrobeTopY = beltY + 5;
  for (let i = 0; i < 16; i++) {
    const expansion = Math.min(i, 6);
    const w = uw + expansion * 2;
    const x = (cx - (w >> 1)) | 0;
    const y = lrobeTopY + i;
    if (y >= 61) break;
    // Alternating fold lines
    const rowShade = (i % 5 === 4) ? rcd : (i % 5 === 0 ? rcl : rc);
    px(ctx, x, y, w, 1, rowShade);
    // Side shadow
    ctx.fillStyle = rout;
    ctx.fillRect(x, y, 1, 1);
    ctx.fillRect(x + w - 1, y, 1, 1);
  }
  // Robe hem (darker strip at bottom)
  const hemW = uw + 10;
  const hemX = (cx - (hemW >> 1)) | 0;
  const hemY = lrobeTopY + 14;
  if (hemY < 62) {
    px(ctx, hemX, hemY, hemW, 3, rcd);
    px(ctx, hemX, hemY, hemW, 1, shade(rcd, -15));
    // Trim color on hem
    px(ctx, hemX + 2, hemY, hemW - 4, 2, ac);
    px(ctx, hemX + 1, hemY, 1, 3, rout);
    px(ctx, hemX + hemW - 1, hemY, 1, 3, rout);
  }

  // ── Boot toes peeking at bottom ──
  const bootC = shade(rc, -45);
  const bty   = baseY + 55;
  if (bty < 62) {
    // Left boot
    px(ctx, cx - 7, bty, 7, 5, bootC);
    px(ctx, cx - 7, bty, 7, 1, shade(bootC, 18));
    px(ctx, cx - 7, bty + 4, 7, 1, shade(bootC, -25));
    pxOutline(ctx, cx - 7, bty, 7, 5, shade(bootC, -45));
    // Right boot
    px(ctx, cx + 1, bty, 7, 5, shade(bootC, 6));
    px(ctx, cx + 1, bty, 7, 1, shade(bootC, 22));
    px(ctx, cx + 1, bty + 4, 7, 1, shade(bootC, -22));
    pxOutline(ctx, cx + 1, bty, 7, 5, shade(bootC, -45));
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
  const out = shade(armorColor, -45);
  const ax  = isLeft ? (cx - armW - backArmOffset) : (cx + frontArmOffset);
  // Arm
  px(ctx, ax, armY, armW, armH, armorColor);
  px(ctx, ax, armY, 1, armH - 2, shade(armorColor, 20)); // left highlight
  px(ctx, ax + armW - 1, armY + 1, 1, armH - 1, shade(armorColor, -25)); // right shadow
  // Gauntlet/hand
  const handY = armY + armH;
  px(ctx, ax, handY, armW, 4, skinColor);
  px(ctx, ax, handY, armW, 1, shade(skinColor, -12)); // wrist line
  pxOutline(ctx, ax, armY, armW, armH + 4, out);
}

// ─── BODY: LEGS ──────────────────────────────────────────────────────────────

export function drawLegs(
  ctx: CanvasRenderingContext2D,
  cx: number, legTopY: number,
  legW: number, legH: number,
  leftDy: number, rightDy: number,
  armorColor: string
) {
  const bootColor = shade(armorColor, -32);
  const bootToe   = shade(armorColor, -42);
  const highlight = shade(armorColor, 22);
  const out       = shade(armorColor, -50);

  // ── Left leg ──
  const lx = (cx - legW - 2) | 0;
  const ly = (legTopY + leftDy) | 0;
  px(ctx, lx, ly, legW, legH, armorColor);
  px(ctx, lx + 1, ly, 1, legH, highlight);     // shin highlight
  px(ctx, lx, ly, legW, 3, shade(armorColor, 16)); // knee cap
  px(ctx, lx + legW - 1, ly + 3, 1, legH - 4, shade(armorColor, -22)); // inner shadow
  // Boot (3-piece: top, toe, sole)
  px(ctx, lx - 1, ly + legH,     legW + 2, 3, bootColor);
  px(ctx, lx - 1, ly + legH,     legW + 2, 1, shade(bootColor, 18));
  px(ctx, lx - 2, ly + legH + 3, legW + 4, 2, bootToe);  // toe extends
  px(ctx, lx - 2, ly + legH + 3, legW + 4, 1, shade(bootToe, 12));
  pxOutline(ctx, lx, ly, legW, legH + 5, out);

  // ── Right leg ──
  const rx = (cx + 2) | 0;
  const ry = (legTopY + rightDy) | 0;
  px(ctx, rx, ry, legW, legH, armorColor);
  px(ctx, rx + 1, ry, 1, legH, highlight);
  px(ctx, rx, ry, legW, 3, shade(armorColor, 16));
  px(ctx, rx + legW - 1, ry + 3, 1, legH - 4, shade(armorColor, -22));
  // Boot
  px(ctx, rx - 1, ry + legH,     legW + 2, 3, bootColor);
  px(ctx, rx - 1, ry + legH,     legW + 2, 1, shade(bootColor, 18));
  px(ctx, rx - 1, ry + legH + 3, legW + 4, 2, bootToe);
  px(ctx, rx - 1, ry + legH + 3, legW + 4, 1, shade(bootToe, 12));
  pxOutline(ctx, rx, ry, legW, legH + 5, out);
}

// ─── EQUIPMENT: SHIELD ───────────────────────────────────────────────────────

function drawShield(ctx: CanvasRenderingContext2D, char: CharacterDef, shieldX: number, shieldY: number) {
  const arm  = AT[char.armorTier];
  const sc   = arm.b;
  const sl   = arm.l;
  const sd   = arm.d;
  const sout = shade(sc, -50);
  const ac   = char.accentColor;

  // Kite/heater shield: rectangular top + tapered bottom
  // Top section (w=12, h=12)
  px(ctx, shieldX,     shieldY,      12, 12, sc);
  px(ctx, shieldX,     shieldY,      12,  2, sl); // top highlight
  px(ctx, shieldX + 9, shieldY + 2,   2, 10, sd); // right shadow
  px(ctx, shieldX + 1, shieldY + 1,   6,  8, shade(sc, -8)); // left panel
  // Boss (center rivet)
  px(ctx, shieldX + 4, shieldY + 4,   4,  4, shade(sc, 20));
  px(ctx, shieldX + 5, shieldY + 5,   2,  2, sl);
  // Tapering bottom (3 rows)
  px(ctx, shieldX + 1, shieldY + 12, 10,  3, sc);
  px(ctx, shieldX + 2, shieldY + 12,  8,  1, sl);
  px(ctx, shieldX + 2, shieldY + 15,  8,  3, shade(sc, -8));
  px(ctx, shieldX + 3, shieldY + 18,  6,  2, sd);
  px(ctx, shieldX + 4, shieldY + 20,  4,  2, shade(sd, -8));
  px(ctx, shieldX + 5, shieldY + 22,  2,  2, shade(sd, -15));
  // Accent trim on top section
  if (char.rarity !== 'common') {
    px(ctx, shieldX + 1, shieldY + 3, 1, 6, ac);
    px(ctx, shieldX + 3, shieldY + 1, 6, 1, ac);
  }
  // Outline
  pxOutline(ctx, shieldX, shieldY, 12, 12, sout);
  px(ctx, shieldX + 1, shieldY + 12, 1, 10, sout); // left taper
  px(ctx, shieldX + 10, shieldY + 12, 1, 8, sout); // right taper
}

// ─── EQUIPMENT: WEAPONS ──────────────────────────────────────────────────────

export function drawWeapon(
  ctx: CanvasRenderingContext2D,
  char: CharacterDef,
  armX: number, armY: number,
  attacking: boolean, frameIdx: number,
  facing: 'south' | 'east'
) {
  const wc    = char.weaponTint;
  const wl    = shade(wc, 30);
  const wd    = shade(wc, -28);
  const wout  = shade(wc, -52);
  const metal = shade(wc, -10);

  switch (char.class) {
    case 'warrior': {
      // Long sword: 3px blade, 26px long, 7px guard
      if (facing === 'south') {
        const sx = armX + 1;
        const sy = armY + 4;
        // Blade
        px(ctx, sx + 1, sy,      1, 26, wl);   // left edge shine
        px(ctx, sx + 2, sy,      1, 26, wc);
        px(ctx, sx + 3, sy,      1, 26, wd);   // right shadow
        px(ctx, sx + 2, sy,      1,  1, '#FFFFFF'); // tip gleam
        // Crossguard
        px(ctx, sx - 3, sy + 3,  9,  3, metal);
        px(ctx, sx - 3, sy + 3,  9,  1, wl);
        px(ctx, sx - 2, sy + 5,  7,  1, wd);
        // Handle
        px(ctx, sx + 1, sy + 6,  3, 6, shade(metal, -20));
        px(ctx, sx + 1, sy + 6,  1, 6, shade(metal, 10));
        // Pommel
        px(ctx, sx,     sy + 12, 4, 3, wc);
        pxOutline(ctx, sx - 3, sy + 3, 9, 3, wout);
      } else {
        px(ctx, armX + 2, armY - 10, 2, 30, wc);
        px(ctx, armX + 2, armY - 10, 1, 30, wl);
        px(ctx, armX - 2, armY + 4,  9,  3, metal);
        px(ctx, armX - 2, armY + 4,  9,  1, wl);
      }
      break;
    }

    case 'paladin': {
      // Holy sword — wider guard, jeweled, slightly shorter
      if (facing === 'south') {
        const sx = armX + 1;
        const sy = armY + 4;
        px(ctx, sx + 1, sy,      1, 24, wl);
        px(ctx, sx + 2, sy,      1, 24, wc);
        px(ctx, sx + 3, sy,      1, 24, wd);
        px(ctx, sx + 2, sy,      1,  1, '#FFFFFF');
        // Wide cross guard
        px(ctx, sx - 4, sy + 3, 11,  3, wc);
        px(ctx, sx - 4, sy + 3, 11,  1, wl);
        px(ctx, sx - 3, sy + 5,  9,  1, wd);
        // Gem in guard center
        px(ctx, sx + 1, sy + 3,  3,  3, char.accentColor);
        px(ctx, sx + 2, sy + 3,  1,  1, shade(char.accentColor, 40));
        // Handle
        px(ctx, sx + 1, sy + 6,  3,  5, shade(wc, -25));
        px(ctx, sx + 1, sy + 11, 4,  3, wc);
        pxOutline(ctx, sx - 4, sy + 3, 11, 3, wout);
      } else {
        px(ctx, armX + 2, armY - 8, 2, 26, wc);
        px(ctx, armX + 2, armY - 8, 1, 26, wl);
        px(ctx, armX - 3, armY + 4, 12,  3, wc);
        px(ctx, armX - 3, armY + 4, 12,  1, wl);
      }
      break;
    }

    case 'mage': {
      // Tall staff — extends high above head, large glowing orb
      if (facing === 'south') {
        const stx = armX - 12;
        const sty = armY - 22;
        // Shaft (2px wide, 40px tall)
        px(ctx, stx + 1, sty + 6, 2, 36, wd);
        px(ctx, stx + 1, sty + 6, 1, 36, shade(wd, 15));
        // Orb outer ring
        px(ctx, stx,     sty,     8, 7, wc);
        px(ctx, stx,     sty,     8, 1, wl);
        px(ctx, stx + 1, sty - 1, 6, 2, wc);
        px(ctx, stx,     sty + 6, 8, 1, wd);
        // Orb inner glow
        px(ctx, stx + 1, sty + 1, 6, 5, shade(wc, 25));
        px(ctx, stx + 2, sty + 1, 4, 4, shade(wc, 45));
        // Orb highlight
        px(ctx, stx + 2, sty + 1, 2, 2, '#FFFFFF');
        // Shaft bottom ferrule
        px(ctx, stx,     armY + 15, 4, 3, wd);
        pxOutline(ctx, stx, sty, 8, 7, wout);
      } else {
        const stx = armX - 4;
        const sty = armY - 26;
        px(ctx, stx + 1, sty + 5, 2, 38, wd);
        px(ctx, stx,     sty,     7, 6, wc);
        px(ctx, stx + 1, sty + 1, 5, 4, shade(wc, 35));
        px(ctx, stx + 1, sty + 1, 2, 2, '#FFFFFF');
      }
      break;
    }

    case 'rogue': {
      // Twin daggers (main hand + reverse grip)
      if (facing === 'south') {
        const dx = armX + 2;
        const dy = armY + 6;
        // Blade
        px(ctx, dx + 1, dy,      1, 14, wl);
        px(ctx, dx + 2, dy,      1, 14, wc);
        px(ctx, dx + 3, dy,      1, 14, wd);
        px(ctx, dx + 2, dy,      1,  1, '#FFFFFF');
        // Guard
        px(ctx, dx - 1, dy + 2,  7,  2, metal);
        px(ctx, dx - 1, dy + 2,  7,  1, wl);
        // Handle
        px(ctx, dx + 1, dy + 4,  3,  4, shade(metal, -25));
        px(ctx, dx + 1, dy + 8,  3,  2, wc);
        pxOutline(ctx, dx - 1, dy + 2, 7, 2, wout);
      } else {
        px(ctx, armX + 2, armY + 2, 2, 14, wc);
        px(ctx, armX + 2, armY + 2, 1, 14, wl);
        px(ctx, armX, armY + 4,  7,  2, metal);
      }
      break;
    }

    case 'ranger': {
      // Recurve bow — clear arc shape using stepped rects
      if (facing === 'south') {
        const bx = armX + 2;
        const by = armY;
        const bc = wc;
        const bd = wd;
        // Bow limbs (pixel-art arc)
        px(ctx, bx - 8, by + 1,  3, 2, bc);
        px(ctx, bx - 9, by + 3,  2, 4, bc);
        px(ctx, bx - 9, by + 7,  2, 3, bc);
        px(ctx, bx - 8, by + 10, 3, 3, bc);
        px(ctx, bx - 7, by + 13, 3, 3, bc);
        px(ctx, bx - 7, by + 16, 3, 2, bc);
        // Bow handle (grip)
        px(ctx, bx - 6, by + 7,  4, 4, shade(bc, -15));
        // Limb highlight
        px(ctx, bx - 8, by + 2,  1, 3, shade(bc, 20));
        px(ctx, bx - 8, by + 11, 1, 3, shade(bc, 20));
        // String (thin line behind bow)
        px(ctx, bx - 6, by,      1, 20, '#E8DFC8');
        // Arrow if attacking
        if (attacking && frameIdx === 1) {
          px(ctx, bx - 16, by + 8, 14, 2, '#C8A040');
          px(ctx, bx - 16, by + 7,  1,  1, '#C8A040');
          px(ctx, bx - 16, by + 9,  1,  1, '#C8A040');
          px(ctx, bx - 17, by + 6,  3,  4, '#C04020'); // fletching
        }
        pxOutline(ctx, bx - 9, by + 1, 3, 17, shade(bc, -40));
      } else {
        px(ctx, armX + 1, armY - 4, 3, 3, wc);
        px(ctx, armX - 1, armY - 1, 2, 5, wc);
        px(ctx, armX + 1, armY + 4, 3, 3, wc);
        px(ctx, armX + 3, armY - 4, 1, 12, '#E8DFC8');
        if (attacking) {
          px(ctx, armX - 4, armY + 3, 12, 2, '#C8A040');
          px(ctx, armX - 5, armY + 2,  3,  4, '#C04020');
        }
      }
      break;
    }

    case 'berserker': {
      // Large battle axe — wide heavy blade
      if (facing === 'south') {
        const ax_ = armX;
        const ay_ = armY - 2;
        // Haft (handle) — long
        px(ctx, ax_ + 2, ay_,     3, 32, shade(wd, -10));
        px(ctx, ax_ + 2, ay_,     1, 32, shade(wd, 10));
        // Axe head — wide asymmetric blade
        px(ctx, ax_ - 6, ay_ + 2, 14,  4, wc);  // upper blade
        px(ctx, ax_ - 6, ay_ + 2, 14,  1, wl);
        px(ctx, ax_ - 5, ay_ + 6, 12,  4, wc);  // mid blade
        px(ctx, ax_ - 4, ay_ + 10, 10,  3, wc); // lower blade
        px(ctx, ax_ - 3, ay_ + 13,  7,  2, wd); // beard
        // Edge shine
        px(ctx, ax_ - 6, ay_ + 3,  1, 8, wl);
        // Back edge
        px(ctx, ax_ + 8, ay_ + 2,  1, 12, shade(wd, -10));
        // Ferrule / bottom cap
        px(ctx, ax_ + 1, ay_ + 30, 4,  3, metal);
        pxOutline(ctx, ax_ - 6, ay_ + 2, 14, 4, wout);
        pxOutline(ctx, ax_ - 5, ay_ + 6, 12, 4, wout);
      } else {
        px(ctx, armX + 2, armY - 6,  3, 24, shade(wd, -10));
        px(ctx, armX - 6, armY - 4, 14,  4, wc);
        px(ctx, armX - 6, armY - 4, 14,  1, wl);
        px(ctx, armX - 5, armY,     12,  4, wc);
        px(ctx, armX - 6, armY - 3,  1,  6, wl);
      }
      break;
    }
  }
}

// ─── RARITY ACCENTS ──────────────────────────────────────────────────────────

export function drawRarityAccent(ctx: CanvasRenderingContext2D, char: CharacterDef, cx: number, baseY: number) {
  const ac = char.accentColor;
  switch (char.rarity) {
    case 'uncommon':
      // Single gleam on shoulder
      px(ctx, cx + 10, baseY + 25, 3, 3, ac);
      px(ctx, cx + 11, baseY + 25, 1, 1, shade(ac, 40));
      break;
    case 'rare':
      // Gem on both shoulders
      px(ctx, cx - 12, baseY + 25, 3, 3, ac);
      px(ctx, cx + 10, baseY + 25, 3, 3, ac);
      px(ctx, cx - 11, baseY + 25, 1, 1, shade(ac, 40));
      px(ctx, cx + 11, baseY + 25, 1, 1, shade(ac, 40));
      break;
    case 'epic':
      px(ctx, cx - 12, baseY + 23, 4, 4, ac);
      px(ctx, cx + 9,  baseY + 23, 4, 4, ac);
      px(ctx, cx - 11, baseY + 23, 2, 2, shade(ac, 40));
      px(ctx, cx + 10, baseY + 23, 2, 2, shade(ac, 40));
      px(ctx, cx - 2,  baseY + 20, 4, 2, ac);
      break;
    case 'legendary':
      // Glowing edge highlights
      px(ctx, cx - 14, baseY + 21, 2, 14, shade(ac, -12));
      px(ctx, cx + 12, baseY + 21, 2, 14, shade(ac, -12));
      px(ctx, cx - 12, baseY + 22, 4, 4, ac);
      px(ctx, cx + 9,  baseY + 22, 4, 4, ac);
      px(ctx, cx - 2,  baseY + 3,  4, 3, ac);
      break;
    case 'mythic':
      // Crown-like jewels + full edge glow
      px(ctx, cx - 15, baseY + 20, 2, 18, shade(ac, -20));
      px(ctx, cx + 13, baseY + 20, 2, 18, shade(ac, -20));
      px(ctx, cx - 12, baseY + 21, 5, 5, ac);
      px(ctx, cx + 8,  baseY + 21, 5, 5, ac);
      px(ctx, cx - 11, baseY + 22, 3, 3, shade(ac, 40));
      px(ctx, cx + 9,  baseY + 22, 3, 3, shade(ac, 40));
      px(ctx, cx - 2,  baseY + 1,  4, 3, ac);
      px(ctx, cx - 5,  baseY + 3,  2, 3, shade(ac,-15));
      px(ctx, cx + 3,  baseY + 3,  2, 3, shade(ac,-15));
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
  drawContactShadow(ctx, cx, 62, isMage ? 12 : (m.torsoW >> 1) + 4);

  // ── Paladin cape (drawn behind everything) ──
  if (char.class === 'paladin') {
    const capeC = shade(char.accentColor, -35);
    const capeX = (cx - (m.torsoW >> 1)) - 3;
    const capeY = by + 28;
    px(ctx, capeX, capeY, m.torsoW + 6, 22, capeC);
    px(ctx, capeX, capeY, m.torsoW + 6, 2, shade(capeC, 15));
    px(ctx, capeX + 1, capeY + 20, m.torsoW + 4, 2, shade(capeC, -20));
    pxOutline(ctx, capeX, capeY, m.torsoW + 6, 22, shade(capeC, -45));
  }

  // ── Back arm ──
  const backArmY = isAttack ? (by + 26) : (by + 26 + ((wp.la * 3) >> 3));
  drawArms(ctx, cx, backArmY, 7, 13, 16, 0, arm.b, char.skinColor, true);

  // ── MAGE: back of staff (drawn before robe) ──
  if (isMage) {
    const staffX = cx - 14;
    const staffY = by + 5;
    px(ctx, staffX, staffY + 4, 2, 34, shade(char.weaponTint, -30));
  }

  if (isMage) {
    // ── MAGE: Full robe (replaces legs + torso) ──
    drawMageRobe(ctx, cx, by, char);
  } else {
    // ── STANDARD: Legs ──
    const legTopY = by + 44;
    const lDy = isAttack ? 0 : wp.ly;
    const rDy = isAttack ? 0 : wp.ry;
    drawLegs(ctx, cx, legTopY, m.legH > 9 ? 9 : m.legH, m.legH, lDy, rDy, arm.b);

    // ── STANDARD: Torso ──
    const torsoY = by + 24;
    const torsoW = (char.class === 'berserker') ? m.torsoW + 4 : m.torsoW;
    drawTorsoArmor(ctx, cx, torsoY, torsoW, m.torsoH, arm.b, arm.l, arm.d, arm.blt,
      char.class, char.accentColor, char.class === 'berserker');

    // ── Shield (warrior/paladin back hand) ──
    if ((char.class === 'warrior' || char.class === 'paladin') && !isAttack) {
      const shieldX = cx - (m.torsoW >> 1) - 14;
      const shieldY = by + 27;
      drawShield(ctx, char, shieldX, shieldY);
    }
  }

  // ── Neck ──
  px(ctx, cx - 3, by + 21, 6, 5, char.skinColor);
  px(ctx, cx - 2, by + 21, 4, 1, shade(char.skinColor, -15)); // neck shadow top
  pxOutline(ctx, cx - 3, by + 21, 6, 5, '#1A1420');

  // ── Head ──
  const headCY = by + 13;
  drawHead(ctx, cx, headCY, m.headW, m.headH, char.skinColor);

  // ── Hair (before headgear so gear overlaps it) ──
  if (char.class !== 'warrior' && char.class !== 'paladin') {
    drawHair(ctx, cx, headCY, m.headW, m.headH, char.hairColor, char.class);
  }

  // ── Headgear ──
  drawHeadgear(ctx, char, cx, by, m.headW >> 1);

  // ── Face (eyes + brows) — drawn after headgear ──
  const eyeY = by + 12;
  if (char.class !== 'warrior' && char.class !== 'paladin') {
    // Open face — draw eyes normally
    drawFace(ctx, cx, eyeY, char.eyeColor, char.hairColor);
  } else {
    // Visor slit eye glow
    px(ctx, cx - 4, eyeY + 1, 8, 1, shade(char.eyeColor, 20));
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

// ─── DRAW NORTH (back view) ──────────────────────────────────────────────────

function drawNorth(ctx: CanvasRenderingContext2D, char: CharacterDef, wp: WalkPhase, bob: number) {
  const m   = RACE_METRICS[char.race];
  const cx  = 24;
  const by  = m.dy + bob;
  const arm = AT[char.armorTier];

  drawContactShadow(ctx, cx, 62, (m.torsoW >> 1) + 4);

  // Legs / robe back
  if (char.class === 'mage') {
    const rc = char.armorColor;
    // Robe back view
    const rw = 22;
    const ry = by + 24;
    px(ctx, (cx - (rw >> 1)) | 0, ry, rw, 32, shade(rc, -12));
    px(ctx, (cx - (rw >> 1)) | 0, ry, rw, 2, shade(rc, 10));
    pxOutline(ctx, (cx - (rw >> 1)) | 0, ry, rw, 32, shade(rc, -55));
  } else {
    drawLegs(ctx, cx, by + 44, m.legH > 9 ? 9 : m.legH, m.legH, wp.ly, wp.ry, shade(arm.b, -10));
    // Back of torso (slightly darker)
    const torsoW = (char.class === 'berserker') ? m.torsoW + 4 : m.torsoW;
    const tx     = (cx - (torsoW >> 1)) | 0;
    px(ctx, tx, by + 24, torsoW, m.torsoH, shade(arm.b, -12));
    px(ctx, tx + 2, by + 24, torsoW - 4, 2, shade(arm.l, -8));
    px(ctx, tx - 1, by + 24 + m.torsoH, torsoW + 2, 4, arm.blt);
    pxOutline(ctx, tx, by + 24, torsoW, m.torsoH, shade(arm.b, -50));
    // Cape back for paladin
    if (char.class === 'paladin') {
      px(ctx, tx - 3, by + 28, torsoW + 6, 22, shade(char.accentColor, -45));
    }
  }

  // Arms (back of arms visible from behind)
  px(ctx, cx - 16, by + 26 + ((wp.la * 3) >> 3), 7, 13, shade(arm.b, -8));
  px(ctx, cx + 9,  by + 26 - ((wp.la * 3) >> 3), 7, 13, shade(arm.b, -8));

  // Neck (back)
  px(ctx, cx - 3, by + 20, 6, 5, shade(char.skinColor, -12));

  // Head (back)
  const headCY = by + 13;
  drawHead(ctx, cx, headCY, m.headW, m.headH, shade(char.skinColor, -12));

  // Back hair (more visible from behind)
  const hx = (cx - (m.headW >> 1)) | 0;
  const hy = (headCY - (m.headH >> 1)) | 0;
  px(ctx, hx + 1, hy - 1, m.headW - 2, 9,  char.hairColor);
  px(ctx, hx - 1, hy + 3, m.headW + 2, 7,  char.hairColor);
  px(ctx, hx + 3, hy - 2, m.headW - 6, 4,  shade(char.hairColor, 15)); // hair highlight
  if (char.class !== 'warrior' && char.class !== 'paladin') {
    px(ctx, hx, hy + 11, m.headW, 7, char.hairColor); // longer back hair
  }

  // Headgear (back)
  drawHeadgear(ctx, char, cx, by, m.headW >> 1);
}

// ─── DRAW EAST (side view) ───────────────────────────────────────────────────

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

  // Back leg
  if (!isMage) {
    const bly = (by + 44 + (isAttack ? 0 : wp.ry)) | 0;
    px(ctx, cx - 3, bly, 7, m.legH, shade(arm.b, -20));
    px(ctx, cx - 4, bly + m.legH, 8, 4, shade(arm.b, -38));
    pxOutline(ctx, cx - 3, bly, 7, m.legH + 4, shade(arm.b, -55));
  }

  // Back arm
  const bay = (by + 26 + (isAttack ? 0 : ((wp.la * 3) >> 3))) | 0;
  px(ctx, cx - 10, bay, 6, 13, shade(arm.b, -22));
  px(ctx, cx - 10, bay + 13, 6, 4, shade(char.skinColor, -10));
  pxOutline(ctx, cx - 10, bay, 6, 17, shade(arm.b, -55));

  // Torso/robe (side view — narrow)
  if (isMage) {
    // Robe side profile
    const rc = char.armorColor;
    const rw = 12;
    const rtx = cx - (rw >> 1);
    px(ctx, rtx, by + 24, rw, 34, rc);
    px(ctx, rtx, by + 24, rw, 3, shade(rc, 18));
    px(ctx, rtx + rw - 2, by + 26, 2, 32, shade(rc, -20));
    pxOutline(ctx, rtx, by + 24, rw, 34, shade(rc, -55));
  } else {
    px(ctx, cx - 8, by + 24, 14, m.torsoH, arm.b);
    px(ctx, cx - 8, by + 24, 14, 3, arm.l);
    px(ctx, cx + 4, by + 27, 2, m.torsoH - 4, arm.d);
    px(ctx, cx - 9, by + 24 + m.torsoH, 16, 4, arm.blt);
    pxOutline(ctx, cx - 8, by + 24, 14, m.torsoH, shade(arm.b, -50));
  }

  // Neck
  px(ctx, cx - 3, by + 21, 5, 5, char.skinColor);
  pxOutline(ctx, cx - 3, by + 21, 5, 5, '#1A1420');

  // Head profile
  const headCY = by + 13;
  const hpx  = cx - (m.headW >> 1) + 1;
  const hpy  = headCY - (m.headH >> 1);
  pxRound(ctx, hpx, hpy, m.headW - 2, m.headH, char.skinColor);
  pxOutline(ctx, hpx, hpy, m.headW - 2, m.headH, '#1A1420');
  // Nose
  px(ctx, hpx + m.headW - 5, hpy + 6, 4, 3, shade(char.skinColor, -16));
  px(ctx, hpx + m.headW - 4, hpy + 5, 2, 1, shade(char.skinColor, -8));
  // Jaw shadow
  px(ctx, hpx + 2, hpy + m.headH - 5, m.headW - 5, 4, shade(char.skinColor, -20));
  // Cheek highlight
  px(ctx, hpx + 2, hpy + 3, 3, 5, shade(char.skinColor, 14));

  // Profile hair
  if (char.class !== 'warrior' && char.class !== 'paladin') {
    px(ctx, hpx - 2, hpy - 1, m.headW - 1, 8, char.hairColor);
    px(ctx, hpx - 3, hpy + 2, 4, 9, char.hairColor);
    if (char.class !== 'mage') px(ctx, hpx - 2, hpy + 8, 3, 8, char.hairColor);
    px(ctx, hpx, hpy - 2, m.headW - 5, 4, shade(char.hairColor, 15)); // hair highlight
  }

  // Headgear (side)
  drawHeadgear(ctx, char, cx + 2, by, (m.headW >> 1) - 1);

  // Profile eye
  const epy = hpy + 5;
  const epx = hpx + m.headW - 6;
  px(ctx, epx, epy, 2, 2, char.eyeColor);
  px(ctx, epx, epy, 1, 2, '#160C18');
  px(ctx, epx, epy,  1, 1, shade(char.eyeColor, 45));
  // Eyebrow
  px(ctx, epx - 1, epy - 2, 3, 1, shade(char.hairColor, -15));

  // Front leg
  if (!isMage) {
    const fly = (by + 44 + (isAttack ? 0 : wp.ly)) | 0;
    px(ctx, cx - 3, fly, 7, m.legH, arm.b);
    px(ctx, cx - 3, fly, 7, 3, shade(arm.b, 18));
    px(ctx, cx - 3, fly + m.legH, 9, 5, shade(arm.b, -30));
    pxOutline(ctx, cx - 3, fly, 7, m.legH + 5, shade(arm.b, -50));
  }

  // Front arm + weapon (side)
  const fay2 = ap ? (by + 26 + ap.armY) : (by + 26 - ((wp.la * 3) >> 3));
  const fax2 = ap ? (cx + 4 + ap.armX) : cx + 4;
  px(ctx, fax2, fay2, 6, 13, arm.b);
  px(ctx, fax2, fay2, 1, 13, shade(arm.b, 18));
  px(ctx, fax2, fay2 + 13, 6, 4, shade(char.skinColor, -10));
  pxOutline(ctx, fax2, fay2, 6, 17, shade(arm.b, -50));
  drawWeapon(ctx, char, fax2, fay2, isAttack, frameIdx, 'east');

  drawRarityAccent(ctx, char, cx, by);
}

// ─── DRAW WEST (mirror of east) ──────────────────────────────────────────────

function drawWest(ctx: CanvasRenderingContext2D, char: CharacterDef, wp: WalkPhase, bob: number, anim: AnimType, frameIdx: number) {
  ctx.save();
  ctx.translate(CHAR_FRAME_W, 0);
  ctx.scale(-1, 1);
  const mwp: WalkPhase = { ...wp, la: -wp.la, ra: -wp.ra };
  drawEast(ctx, char, mwp, bob, anim, frameIdx);
  ctx.restore();
}

// ─── DRAW HURT ───────────────────────────────────────────────────────────────

function drawHurt(ctx: CanvasRenderingContext2D, char: CharacterDef, frameIdx: number) {
  const hurtBob = [2, 4, 3, 1];
  const hurtDx  = [0, 2, 1, 0];
  const bob = hurtBob[frameIdx & 3];
  const dx  = hurtDx[frameIdx & 3];
  const wp: WalkPhase = { ly: 0, ry: 0, by: 0, la: -3, ra: -3 };
  ctx.save();
  ctx.translate(dx, 0);
  drawSouth(ctx, char, wp, bob, 'idle', 0);
  // Red flash
  ctx.fillStyle = `rgba(220,30,30,${0.10 + (frameIdx & 3) * 0.05})`;
  ctx.fillRect(6, 4, 36, 52);
  ctx.restore();
}

// ─── DRAW DEATH ──────────────────────────────────────────────────────────────

function drawDeath(ctx: CanvasRenderingContext2D, char: CharacterDef, frameIdx: number) {
  const deathDy = [0, 8, 16, 22];
  const dy  = deathDy[frameIdx & 3];
  const m   = RACE_METRICS[char.race];
  const cx  = 24;
  const by  = m.dy + dy;
  const arm = AT[char.armorTier];

  if (frameIdx >= 3) {
    // Lying flat on ground
    const groundY = 52;
    drawContactShadow(ctx, cx, 56, (m.torsoW >> 1) + 6);
    // Body lying horizontally
    px(ctx, cx - (m.torsoW >> 1) - 2, groundY - 4, m.torsoW + 4, m.torsoH - 8, shade(arm.b, -18));
    pxOutline(ctx, cx - (m.torsoW >> 1) - 2, groundY - 4, m.torsoW + 4, m.torsoH - 8, shade(arm.b, -55));
    // Head to the side
    const hx = cx + (m.torsoW >> 1);
    px(ctx, hx, groundY - 4, m.headW, m.headH - 6, shade(char.skinColor, -22));
    pxOutline(ctx, hx, groundY - 4, m.headW, m.headH - 6, '#1A1420');
    return;
  }

  // Falling: tilts down as dy increases
  drawContactShadow(ctx, cx, 62, (m.torsoW >> 1) + 4);
  const wp: WalkPhase = { ly: dy >> 1, ry: dy >> 1, by: 0, la: dy, ra: dy };
  drawSouth(ctx, char, wp, by - m.dy, 'idle', 0);
}

// ─── DRAW CAST ───────────────────────────────────────────────────────────────

function drawCast(ctx: CanvasRenderingContext2D, char: CharacterDef, frameIdx: number) {
  const castBob = [0, -1, -2, -1];
  const bob = castBob[frameIdx & 3];
  drawSouth(ctx, char, WALK_PHASES[0], bob, 'cast', frameIdx);
  // Spell glow for mage/paladin
  if (char.class === 'mage' || char.class === 'paladin') {
    const m  = RACE_METRICS[char.race];
    const cx = 24;
    const by = m.dy + bob;
    const gc = char.accentColor;
    const alpha = 0.12 + (frameIdx & 3) * 0.06;
    const alphaHex = Math.round(alpha * 255).toString(16).padStart(2, '0');
    ctx.fillStyle = gc + alphaHex;
    ctx.fillRect((cx - 12) | 0, (by + 8) | 0, 24, 24);
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
  const sheetW = CHAR_SHEET_COLS * CHAR_FRAME_W;  // 192
  const sheetH = CHAR_SHEET_ROWS * CHAR_FRAME_H;  // 576
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
