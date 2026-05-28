// characterRenderer.ts — Procedural pixel-art character sprite generator
// Sheet layout: 4 cols × 6 rows = 24 frames per character
//   Row 0: walk_south[0-3]  Row 1: walk_west[0-3]
//   Row 2: walk_east[0-3]   Row 3: walk_north[0-3]
//   Row 4: idle[0-3]        Row 5: attack[0-3]

export const CHAR_FRAME_W = 48;
export const CHAR_FRAME_H = 64;
export const CHAR_SHEET_COLS = 4;
export const CHAR_SHEET_ROWS = 6;

export type CharacterClass  = 'warrior' | 'mage' | 'rogue' | 'ranger' | 'paladin' | 'berserker';
export type CharacterRace   = 'human' | 'elf' | 'dwarf' | 'orc';
export type ArmorTier       = 'leather' | 'iron' | 'steel' | 'mythril';
export type CharRarity      = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
export type AnimType        = 'walk_south' | 'walk_west' | 'walk_east' | 'walk_north' | 'idle' | 'attack';

export const ANIM_ROW: Record<AnimType, number> = {
  walk_south: 0, walk_west: 1, walk_east: 2,
  walk_north: 3, idle: 4, attack: 5,
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

const sk = { fair: '#F5C5A3', tan: '#D4956A', dark: '#8D5524', pale: '#FAEBD7', orc: '#5A8A5A', dwarf: '#C07840' };
const hr = { brown: '#7B3F00', black: '#1A1A1A', blonde: '#E8C840', red: '#B83A00', white: '#EFEFEF', silver: '#A8A8C0', green: '#2A6B2A' };
const ey = { brown: '#5C3317', blue: '#2060A0', green: '#286028', purple: '#6030A0', gold: '#C09010', red: '#A01010' };
const ar = {
  leather: { b: '#8B6410', d: '#6B4C0C', l: '#A87A18', blt: '#4A3008' },
  iron:    { b: '#607080', d: '#485868', l: '#8098A8', blt: '#384048' },
  steel:   { b: '#98B0C8', d: '#7090A8', l: '#C0D8E8', blt: '#506070' },
  mythril: { b: '#60A8D0', d: '#4080B0', l: '#90D0F0', blt: '#206080' },
};

// ─── CHARACTER PRESETS (30 total) ─────────────────────────────────────────────

export const ALL_CHARACTERS: CharacterDef[] = [
  // WARRIORS
  { id:'char_warrior_human_leather_common_01',   name:'Iron Recruit',          class:'warrior',   race:'human', armorTier:'leather', rarity:'common',    skinColor:sk.fair,  hairColor:hr.brown,  armorColor:ar.leather.b, accentColor:'#CC2020', eyeColor:ey.brown,  weaponTint:'#C0C8D8', tags:['warrior','melee','physical'] },
  { id:'char_warrior_human_iron_uncommon_01',    name:'Iron Vanguard',         class:'warrior',   race:'human', armorTier:'iron',    rarity:'uncommon',  skinColor:sk.tan,   hairColor:hr.black,  armorColor:ar.iron.b,    accentColor:'#CC2020', eyeColor:ey.blue,   weaponTint:'#C0C8D8', tags:['warrior','melee','tank'] },
  { id:'char_warrior_dwarf_steel_rare_01',       name:'Forge Warden',          class:'warrior',   race:'dwarf', armorTier:'steel',   rarity:'rare',      skinColor:sk.dwarf, hairColor:hr.red,    armorColor:ar.steel.b,   accentColor:'#CC2020', eyeColor:ey.brown,  weaponTint:'#A08060', tags:['warrior','dwarf','tank'] },
  { id:'char_warrior_orc_iron_uncommon_01',      name:'Bloodfist Grunt',       class:'warrior',   race:'orc',   armorTier:'iron',    rarity:'uncommon',  skinColor:sk.orc,   hairColor:hr.black,  armorColor:ar.iron.b,    accentColor:'#CC2020', eyeColor:ey.red,    weaponTint:'#A08060', tags:['warrior','orc','brute'] },
  { id:'char_warrior_elf_mythril_epic_01',       name:'Moonblade Sentinel',    class:'warrior',   race:'elf',   armorTier:'mythril', rarity:'epic',      skinColor:sk.pale,  hairColor:hr.silver, armorColor:ar.mythril.b, accentColor:'#CC2020', eyeColor:ey.blue,   weaponTint:'#C0C8D8', tags:['warrior','elf','elite'] },
  { id:'char_warrior_human_mythril_legendary_01',name:'Dragonguard Champion',  class:'warrior',   race:'human', armorTier:'mythril', rarity:'legendary', skinColor:sk.fair,  hairColor:'#E8C840', armorColor:ar.mythril.b, accentColor:'#FF4020', eyeColor:ey.gold,   weaponTint:'#FFD040', tags:['warrior','legendary','champion'] },
  // MAGES
  { id:'char_mage_human_leather_common_01',      name:'Apprentice Mage',       class:'mage',      race:'human', armorTier:'leather', rarity:'common',    skinColor:sk.fair,  hairColor:hr.brown,  armorColor:'#4A3860',    accentColor:'#A030E0', eyeColor:ey.purple, weaponTint:'#8060A0', tags:['mage','caster','magic'] },
  { id:'char_mage_human_iron_uncommon_01',       name:'Battle Arcanist',       class:'mage',      race:'human', armorTier:'iron',    rarity:'uncommon',  skinColor:sk.tan,   hairColor:hr.blonde, armorColor:'#503870',    accentColor:'#A030E0', eyeColor:ey.blue,   weaponTint:'#8060A0', tags:['mage','battle','caster'] },
  { id:'char_mage_elf_steel_rare_01',            name:'Arcane Weaver',         class:'mage',      race:'elf',   armorTier:'steel',   rarity:'rare',      skinColor:sk.pale,  hairColor:hr.silver, armorColor:'#5A4880',    accentColor:'#A030E0', eyeColor:ey.purple, weaponTint:'#9070C0', tags:['mage','elf','arcane'] },
  { id:'char_mage_orc_mythril_epic_01',          name:'Shaman Warlord',        class:'mage',      race:'orc',   armorTier:'mythril', rarity:'epic',      skinColor:sk.orc,   hairColor:hr.green,  armorColor:'#304870',    accentColor:'#20E090', eyeColor:ey.green,  weaponTint:'#20D080', tags:['mage','orc','shaman'] },
  { id:'char_mage_elf_mythril_mythic_01',        name:'Starweaver Archon',     class:'mage',      race:'elf',   armorTier:'mythril', rarity:'mythic',    skinColor:sk.pale,  hairColor:'#E0D0FF', armorColor:'#2030A0',    accentColor:'#FFD0FF', eyeColor:'#A080FF', weaponTint:'#C0A0FF', tags:['mage','mythic','legendary'] },
  // ROGUES
  { id:'char_rogue_human_leather_common_01',     name:'Street Cutpurse',       class:'rogue',     race:'human', armorTier:'leather', rarity:'common',    skinColor:sk.tan,   hairColor:hr.black,  armorColor:'#3A3028',    accentColor:'#20A060', eyeColor:ey.green,  weaponTint:'#C0A820', tags:['rogue','stealth','dagger'] },
  { id:'char_rogue_elf_iron_uncommon_01',        name:'Shadow Stalker',        class:'rogue',     race:'elf',   armorTier:'iron',    rarity:'uncommon',  skinColor:sk.pale,  hairColor:hr.silver, armorColor:'#302820',    accentColor:'#20A060', eyeColor:ey.green,  weaponTint:'#C0A820', tags:['rogue','elf','assassin'] },
  { id:'char_rogue_human_steel_rare_01',         name:'Phantom Blade',         class:'rogue',     race:'human', armorTier:'steel',   rarity:'rare',      skinColor:sk.dark,  hairColor:hr.black,  armorColor:'#282028',    accentColor:'#00C080', eyeColor:ey.green,  weaponTint:'#00D090', tags:['rogue','rare','phantom'] },
  { id:'char_rogue_orc_leather_uncommon_01',     name:'Gutter Thug',           class:'rogue',     race:'orc',   armorTier:'leather', rarity:'uncommon',  skinColor:sk.orc,   hairColor:hr.black,  armorColor:'#3A3028',    accentColor:'#20A060', eyeColor:ey.red,    weaponTint:'#C0A820', tags:['rogue','orc','brawler'] },
  { id:'char_rogue_elf_mythril_epic_01',         name:'Wraithstep Assassin',   class:'rogue',     race:'elf',   armorTier:'mythril', rarity:'epic',      skinColor:sk.pale,  hairColor:hr.white,  armorColor:'#181828',    accentColor:'#40FFB0', eyeColor:'#20FFA0', weaponTint:'#40FFB0', tags:['rogue','epic','assassin'] },
  // RANGERS
  { id:'char_ranger_human_leather_common_01',    name:'Forest Scout',          class:'ranger',    race:'human', armorTier:'leather', rarity:'common',    skinColor:sk.tan,   hairColor:hr.brown,  armorColor:'#5A6838',    accentColor:'#40A820', eyeColor:ey.green,  weaponTint:'#806028', tags:['ranger','ranged','bow'] },
  { id:'char_ranger_elf_leather_uncommon_01',    name:'Woodland Archer',       class:'ranger',    race:'elf',   armorTier:'leather', rarity:'uncommon',  skinColor:sk.pale,  hairColor:hr.blonde, armorColor:'#4A5830',    accentColor:'#40A820', eyeColor:ey.green,  weaponTint:'#806028', tags:['ranger','elf','archer'] },
  { id:'char_ranger_human_iron_rare_01',         name:'Ironbow Mercenary',     class:'ranger',    race:'human', armorTier:'iron',    rarity:'rare',      skinColor:sk.dark,  hairColor:hr.black,  armorColor:'#606848',    accentColor:'#80B040', eyeColor:ey.brown,  weaponTint:'#8C7040', tags:['ranger','iron','mercenary'] },
  { id:'char_ranger_dwarf_steel_rare_01',        name:'Crossbow Mountaineer',  class:'ranger',    race:'dwarf', armorTier:'steel',   rarity:'rare',      skinColor:sk.dwarf, hairColor:hr.red,    armorColor:ar.steel.b,   accentColor:'#40A820', eyeColor:ey.brown,  weaponTint:'#A08050', tags:['ranger','dwarf','crossbow'] },
  { id:'char_ranger_elf_mythril_epic_01',        name:'Stormwind Hawkeye',     class:'ranger',    race:'elf',   armorTier:'mythril', rarity:'epic',      skinColor:sk.pale,  hairColor:hr.silver, armorColor:ar.mythril.b, accentColor:'#A0FF40', eyeColor:'#80E040', weaponTint:'#C0FF60', tags:['ranger','epic','storm'] },
  // PALADINS
  { id:'char_paladin_human_iron_common_01',      name:'Temple Initiate',       class:'paladin',   race:'human', armorTier:'iron',    rarity:'common',    skinColor:sk.fair,  hairColor:hr.blonde, armorColor:ar.iron.b,    accentColor:'#E0C020', eyeColor:ey.blue,   weaponTint:'#D0A010', tags:['paladin','holy','tank'] },
  { id:'char_paladin_human_steel_uncommon_01',   name:'Knight of Dawn',        class:'paladin',   race:'human', armorTier:'steel',   rarity:'uncommon',  skinColor:sk.fair,  hairColor:hr.blonde, armorColor:ar.steel.b,   accentColor:'#E0C020', eyeColor:ey.blue,   weaponTint:'#E0C020', tags:['paladin','knight','holy'] },
  { id:'char_paladin_dwarf_steel_rare_01',       name:'Ironhammer Templar',    class:'paladin',   race:'dwarf', armorTier:'steel',   rarity:'rare',      skinColor:sk.dwarf, hairColor:hr.red,    armorColor:ar.steel.b,   accentColor:'#FFA020', eyeColor:ey.gold,   weaponTint:'#FFD040', tags:['paladin','dwarf','templar'] },
  { id:'char_paladin_elf_mythril_epic_01',       name:'Sunblade Crusader',     class:'paladin',   race:'elf',   armorTier:'mythril', rarity:'epic',      skinColor:sk.pale,  hairColor:hr.white,  armorColor:'#D8C860',    accentColor:'#FFF080', eyeColor:'#FFD040', weaponTint:'#FFE060', tags:['paladin','epic','sun'] },
  { id:'char_paladin_human_mythril_legendary_01',name:'Aegis Seraph',          class:'paladin',   race:'human', armorTier:'mythril', rarity:'legendary', skinColor:sk.fair,  hairColor:'#FFFFFF', armorColor:'#E8E0A8',    accentColor:'#FFE840', eyeColor:'#FFD080', weaponTint:'#FFC020', tags:['paladin','legendary','seraph'] },
  // BERSERKERS
  { id:'char_berserker_orc_leather_common_01',   name:'Wild Brute',            class:'berserker', race:'orc',   armorTier:'leather', rarity:'common',    skinColor:sk.orc,   hairColor:hr.black,  armorColor:'#3A2010',    accentColor:'#E04010', eyeColor:ey.red,    weaponTint:'#A08060', tags:['berserker','orc','rage'] },
  { id:'char_berserker_human_iron_uncommon_01',  name:'Raging Marauder',       class:'berserker', race:'human', armorTier:'iron',    rarity:'uncommon',  skinColor:sk.dark,  hairColor:hr.red,    armorColor:'#503830',    accentColor:'#E04010', eyeColor:ey.red,    weaponTint:'#A08060', tags:['berserker','rage','axe'] },
  { id:'char_berserker_orc_steel_rare_01',       name:'Bloodrage Warlord',     class:'berserker', race:'orc',   armorTier:'steel',   rarity:'rare',      skinColor:sk.orc,   hairColor:hr.red,    armorColor:'#604040',    accentColor:'#FF2020', eyeColor:'#FF2020', weaponTint:'#C03030', tags:['berserker','orc','warlord'] },
  { id:'char_berserker_orc_mythril_mythic_01',   name:'Apocalypse Fury',       class:'berserker', race:'orc',   armorTier:'mythril', rarity:'mythic',    skinColor:'#3A5A3A',hairColor:'#FF3010', armorColor:'#301820',    accentColor:'#FF4020', eyeColor:'#FF2000', weaponTint:'#FF4020', tags:['berserker','mythic','apocalypse'] },
];

export const CHAR_CATEGORIES: Record<CharacterClass, CharacterDef[]> = {
  warrior:   ALL_CHARACTERS.filter(c => c.class === 'warrior'),
  mage:      ALL_CHARACTERS.filter(c => c.class === 'mage'),
  rogue:     ALL_CHARACTERS.filter(c => c.class === 'rogue'),
  ranger:    ALL_CHARACTERS.filter(c => c.class === 'ranger'),
  paladin:   ALL_CHARACTERS.filter(c => c.class === 'paladin'),
  berserker: ALL_CHARACTERS.filter(c => c.class === 'berserker'),
};

// ─── DRAWING HELPERS ──────────────────────────────────────────────────────────

function fr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}
function fc(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}
function fe(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}
function shade(c: string, amt: number): string {
  const n = parseInt(c.slice(1), 16);
  const r = Math.min(255, Math.max(0, (n >> 16) + amt));
  const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + amt));
  const b = Math.min(255, Math.max(0, (n & 0xff) + amt));
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

// ─── RACE METRICS ─────────────────────────────────────────────────────────────

interface RaceMetrics {
  headR: number;      // head circle radius
  torsoW: number;     // torso width
  torsoH: number;     // torso height
  legH: number;       // leg height
  dy: number;         // vertical offset (positive = shorter char)
}

const RACE_METRICS: Record<CharacterRace, RaceMetrics> = {
  human:  { headR: 9,  torsoW: 20, torsoH: 18, legH: 13, dy: 0  },
  elf:    { headR: 8,  torsoW: 18, torsoH: 19, legH: 15, dy: -1 },
  dwarf:  { headR: 9,  torsoW: 24, torsoH: 16, legH: 9,  dy: 4  },
  orc:    { headR: 10, torsoW: 24, torsoH: 18, legH: 13, dy: 0  },
};

// ─── WALK / IDLE / ATTACK PHASE DATA ─────────────────────────────────────────

interface WalkPhase { ly: number; ry: number; by: number; la: number; ra: number; }
const WALK_PHASES: WalkPhase[] = [
  { ly: -4, ry:  3, by: -1, la:  3, ra: -3 },
  { ly: -1, ry:  1, by:  0, la:  1, ra: -1 },
  { ly:  3, ry: -4, by: -1, la: -3, ra:  3 },
  { ly:  1, ry: -1, by:  0, la: -1, ra:  1 },
];
const IDLE_BOB = [0, -1, -1, 0];
const ATTACK_PHASES = [
  { armX: 0,  armY: -4, weaponRot: -0.8 },
  { armX: 8,  armY:  2, weaponRot:  0.3 },
  { armX: 12, armY:  4, weaponRot:  0.6 },
  { armX: 4,  armY:  0, weaponRot:  0.0 },
];

// ─── DRAW: SOUTH-FACING FRAME ─────────────────────────────────────────────────

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
  const baseY = 0 + m.dy + bob;
  const ac = char.accentColor;
  const arm = ar[char.armorTier];

  // Shadow
  fe(ctx, cx, 62, 11, 3, 'rgba(0,0,0,0.3)');

  const isAttack = anim === 'attack';
  const ap = isAttack ? ATTACK_PHASES[frameIdx] : null;

  // ── BACK ARM (left in south view) ──
  const backArmY = isAttack ? baseY + 26 : baseY + 26 + wp.la * 0.4;
  fr(ctx, cx - 15, backArmY, 7, 12, shade(arm.b, -20));
  // back hand
  fc(ctx, cx - 12, backArmY + 12, 3, shade(char.skinColor, -10));

  // ── LEGS ──
  const legX = [cx - 10, cx + 2];
  const legYs = isAttack ? [baseY + 43, baseY + 43] : [baseY + 43 + wp.ly, baseY + 43 + wp.ry];
  for (let i = 0; i < 2; i++) {
    fr(ctx, legX[i], legYs[i], 9, m.legH, arm.b);
    fr(ctx, legX[i] - 1, legYs[i] + m.legH, 11, 4, shade(arm.b, -30)); // boot
    fr(ctx, legX[i], legYs[i], 9, 3, shade(arm.b, 20)); // knee highlight
  }

  // ── TORSO ──
  const torsoX = cx - m.torsoW / 2;
  const torsoY = baseY + 24;
  fr(ctx, torsoX, torsoY, m.torsoW, m.torsoH, arm.b);
  // chest highlight
  fr(ctx, torsoX + 2, torsoY + 1, m.torsoW - 4, 3, arm.l);
  // chest plate / class detail
  drawChestDetail(ctx, char, cx, torsoY, m.torsoW, ac);
  // belt
  fr(ctx, torsoX - 1, torsoY + m.torsoH, m.torsoW + 2, 3, arm.blt);

  // ── NECK ──
  fr(ctx, cx - 3, baseY + 20, 6, 5, char.skinColor);

  // ── HEAD ──
  fc(ctx, cx, baseY + 13, m.headR, char.skinColor);
  // jaw shadow
  fe(ctx, cx, baseY + 18, m.headR - 1, 3, shade(char.skinColor, -20));

  // ── HAIR (south) ──
  drawHairSouth(ctx, char, cx, baseY, m.headR);

  // ── CLASS HAT / HELMET ──
  drawHelmet(ctx, char, cx, baseY, m.headR);

  // ── EYES ──
  fr(ctx, cx - 5, baseY + 13, 3, 2, char.eyeColor);
  fr(ctx, cx + 2, baseY + 13, 3, 2, char.eyeColor);
  // pupils
  fr(ctx, cx - 4, baseY + 13, 1, 2, '#000000');
  fr(ctx, cx + 3, baseY + 13, 1, 2, '#000000');

  // ── FRONT ARM + WEAPON ──
  if (ap) {
    fr(ctx, cx + 6 + ap.armX, baseY + 26, 7, 12, arm.b);
    fc(ctx, cx + 10 + ap.armX, baseY + 38, 3, shade(char.skinColor, -10));
    // weapon extended
    drawWeaponSouth(ctx, char, cx + 6 + ap.armX, baseY + 26, true, frameIdx);
  } else {
    const frontArmX = cx + 7;
    fr(ctx, frontArmX, baseY + 26 + wp.ra * 0.4, 7, 12, arm.b);
    fc(ctx, frontArmX + 3, baseY + 38 + wp.ra * 0.4, 3, shade(char.skinColor, -10));
    drawWeaponSouth(ctx, char, frontArmX, baseY + 26 + wp.ra * 0.4, false, 0);
  }
}

// ─── DRAW: NORTH-FACING FRAME ─────────────────────────────────────────────────

function drawNorth(
  ctx: CanvasRenderingContext2D,
  char: CharacterDef,
  wp: WalkPhase,
  bob: number
) {
  const m = RACE_METRICS[char.race];
  const cx = 24;
  const baseY = m.dy + bob;
  const arm = ar[char.armorTier];

  fe(ctx, cx, 62, 11, 3, 'rgba(0,0,0,0.3)');

  const legX = [cx - 10, cx + 2];
  const legYs = [baseY + 43 + wp.ly, baseY + 43 + wp.ry];
  for (let i = 0; i < 2; i++) {
    fr(ctx, legX[i], legYs[i], 9, m.legH, arm.b);
    fr(ctx, legX[i] - 1, legYs[i] + m.legH, 11, 4, shade(arm.b, -30));
  }

  // Arms visible on sides
  fr(ctx, cx - 15, baseY + 26 + wp.la * 0.4, 7, 12, shade(arm.b, -10));
  fr(ctx, cx + 8,  baseY + 26 - wp.la * 0.4, 7, 12, shade(arm.b, -10));

  // Torso (back view — slightly darker)
  const torsoX = cx - m.torsoW / 2;
  const torsoY = baseY + 24;
  fr(ctx, torsoX, torsoY, m.torsoW, m.torsoH, shade(arm.b, -15));
  fr(ctx, torsoX + 2, torsoY + 1, m.torsoW - 4, 3, shade(arm.l, -10));
  fr(ctx, torsoX - 1, torsoY + m.torsoH, m.torsoW + 2, 3, arm.blt);

  // Neck
  fr(ctx, cx - 3, baseY + 20, 6, 4, shade(char.skinColor, -15));

  // Head (back)
  fc(ctx, cx, baseY + 13, m.headR, shade(char.skinColor, -15));

  // Back hair (more visible from behind)
  drawHairNorth(ctx, char, cx, baseY, m.headR);
  drawHelmet(ctx, char, cx, baseY, m.headR);
}

// ─── DRAW: EAST-FACING FRAME ─────────────────────────────────────────────────

function drawEast(
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
  const arm = ar[char.armorTier];
  const isAttack = anim === 'attack';
  const ap = isAttack ? ATTACK_PHASES[frameIdx] : null;

  fe(ctx, cx, 62, 9, 3, 'rgba(0,0,0,0.3)');

  // Back leg
  const backLegY = baseY + 43 + (isAttack ? 0 : wp.ry);
  fr(ctx, cx - 2, backLegY, 8, m.legH, shade(arm.b, -20));
  fr(ctx, cx - 3, backLegY + m.legH, 10, 4, shade(arm.b, -40));

  // Back arm
  const backArmY = baseY + 26 + (isAttack ? 0 : wp.la * 0.5);
  fr(ctx, cx - 8, backArmY, 6, 11, shade(arm.b, -25));

  // Torso (side view — narrower)
  fr(ctx, cx - 7, baseY + 24, 14, m.torsoH, arm.b);
  fr(ctx, cx - 7, baseY + 24, 14, 3, arm.l);
  fr(ctx, cx - 8, baseY + 24 + m.torsoH, 16, 3, arm.blt);

  // Neck
  fr(ctx, cx - 2, baseY + 20, 5, 5, char.skinColor);

  // Head (profile oval)
  ctx.fillStyle = char.skinColor;
  ctx.beginPath();
  ctx.ellipse(cx + 1, baseY + 13, m.headR - 2, m.headR, 0, 0, Math.PI * 2);
  ctx.fill();
  // Nose bump
  fr(ctx, cx + m.headR - 3, baseY + 14, 3, 2, shade(char.skinColor, -15));

  // Profile hair
  drawHairEast(ctx, char, cx, baseY, m.headR);
  drawHelmet(ctx, char, cx + 2, baseY, m.headR);

  // One eye (profile)
  fr(ctx, cx + 2, baseY + 13, 2, 2, char.eyeColor);
  fr(ctx, cx + 2, baseY + 13, 1, 2, '#000000');

  // Front leg
  const frontLegY = baseY + 43 + (isAttack ? 0 : wp.ly);
  fr(ctx, cx - 2, frontLegY, 8, m.legH, arm.b);
  fr(ctx, cx - 3, frontLegY + m.legH, 10, 4, shade(arm.b, -30));
  fr(ctx, cx - 2, frontLegY, 8, 3, shade(arm.b, 20));

  // Front arm + weapon
  if (ap) {
    fr(ctx, cx + 4 + ap.armX, baseY + 26, 6, 11, arm.b);
    drawWeaponEast(ctx, char, cx + 4 + ap.armX, baseY + 26, true, frameIdx);
  } else {
    fr(ctx, cx + 4, baseY + 26 - wp.la * 0.3, 6, 11, arm.b);
    drawWeaponEast(ctx, char, cx + 4, baseY + 26 - wp.la * 0.3, false, 0);
  }
}

// ─── DRAW: WEST-FACING FRAME (mirror of east) ────────────────────────────────

function drawWest(
  ctx: CanvasRenderingContext2D,
  char: CharacterDef,
  wp: WalkPhase,
  bob: number,
  anim: AnimType,
  frameIdx: number
) {
  ctx.save();
  ctx.translate(CHAR_FRAME_W, 0);
  ctx.scale(-1, 1);
  const mirroredWp: WalkPhase = { ...wp, la: -wp.la, ra: -wp.ra };
  drawEast(ctx, char, mirroredWp, bob, anim, frameIdx);
  ctx.restore();
}

// ─── HAIR DRAWING ─────────────────────────────────────────────────────────────

function drawHairSouth(ctx: CanvasRenderingContext2D, char: CharacterDef, cx: number, baseY: number, r: number) {
  const h = char.hairColor;
  // Top
  ctx.fillStyle = h;
  ctx.beginPath();
  ctx.arc(cx, baseY + 13, r, Math.PI, 0);
  ctx.fill();
  // Side pieces
  fr(ctx, cx - r, baseY + 10, 4, 8, h);
  fr(ctx, cx + r - 3, baseY + 10, 4, 8, h);
  // Bangs
  fr(ctx, cx - 4, baseY + 6, 8, 4, h);
  // Class-specific
  if (char.class === 'berserker') {
    fr(ctx, cx - 6, baseY + 4, 4, 6, h);
    fr(ctx, cx + 3, baseY + 4, 4, 6, h);
  }
}

function drawHairNorth(ctx: CanvasRenderingContext2D, char: CharacterDef, cx: number, baseY: number, r: number) {
  const h = char.hairColor;
  ctx.fillStyle = h;
  ctx.beginPath();
  ctx.arc(cx, baseY + 13, r, Math.PI, 0);
  ctx.fill();
  fr(ctx, cx - r + 1, baseY + 10, 4, 10, h);
  fr(ctx, cx + r - 4, baseY + 10, 4, 10, h);
  // Back of hair hangs lower
  if (char.class !== 'mage' && char.class !== 'paladin') {
    fr(ctx, cx - 5, baseY + 22, 10, 4, h);
  }
}

function drawHairEast(ctx: CanvasRenderingContext2D, char: CharacterDef, cx: number, baseY: number, r: number) {
  const h = char.hairColor;
  ctx.fillStyle = h;
  ctx.beginPath();
  ctx.arc(cx + 1, baseY + 13, r - 1, Math.PI, Math.PI * 2);
  ctx.fill();
  fr(ctx, cx - r + 2, baseY + 10, 5, 9, h);
  // Ponytail/back hair
  if (char.class !== 'mage') fr(ctx, cx - r + 1, baseY + 15, 4, 8, h);
}

// ─── HELMET / HAT ─────────────────────────────────────────────────────────────

function drawHelmet(ctx: CanvasRenderingContext2D, char: CharacterDef, cx: number, baseY: number, r: number) {
  switch (char.class) {
    case 'warrior':
    case 'paladin': {
      const col = ar[char.armorTier].b;
      // Helm rim
      fr(ctx, cx - r, baseY + 9, r * 2, 4, col);
      fr(ctx, cx - r + 1, baseY + 7, r * 2 - 2, 3, shade(col, 20));
      // Plume
      if (char.rarity !== 'common') fr(ctx, cx - 2, baseY, 4, 8, char.accentColor);
      break;
    }
    case 'mage': {
      // Pointed wizard hat
      const col = shade(char.armorColor, 20);
      fr(ctx, cx - 8, baseY + 8, 16, 4, col);
      fr(ctx, cx - 5, baseY + 3, 10, 6, col);
      fr(ctx, cx - 3, baseY - 1, 6, 5, col);
      fr(ctx, cx - 1, baseY - 5, 3, 5, col);
      // Hat band
      fr(ctx, cx - 8, baseY + 8, 16, 2, char.accentColor);
      break;
    }
    case 'rogue': {
      // Hood
      const col = shade(char.armorColor, 10);
      fr(ctx, cx - r - 1, baseY + 6, r * 2 + 2, 10, col);
      fr(ctx, cx - r + 2, baseY + 4, r * 2 - 4, 4, col);
      fr(ctx, cx - r + 4, baseY + 2, r * 2 - 8, 3, col);
      break;
    }
    case 'ranger': {
      // Leather cap / circlet
      fr(ctx, cx - r + 1, baseY + 6, r * 2 - 2, 4, ar.leather.b);
      fr(ctx, cx - r + 3, baseY + 4, r * 2 - 6, 3, shade(ar.leather.b, 20));
      if (char.rarity !== 'common') fr(ctx, cx - 1, baseY + 3, 3, 5, char.accentColor);
      break;
    }
    case 'berserker': {
      // Spiked shoulder horns drawn on head
      fr(ctx, cx - r - 3, baseY + 9, 4, 8, shade(ar[char.armorTier].b, -20));
      fr(ctx, cx + r,     baseY + 9, 4, 8, shade(ar[char.armorTier].b, -20));
      // Head band
      fr(ctx, cx - r, baseY + 10, r * 2, 3, char.accentColor);
      break;
    }
  }
}

// ─── CHEST DETAIL ─────────────────────────────────────────────────────────────

function drawChestDetail(ctx: CanvasRenderingContext2D, char: CharacterDef, cx: number, torsoY: number, w: number, ac: string) {
  switch (char.class) {
    case 'warrior':
    case 'berserker':
      fr(ctx, cx - w / 2 + 1, torsoY + 4, 5, 8, ac + '88');
      fr(ctx, cx + w / 2 - 6, torsoY + 4, 5, 8, ac + '88');
      break;
    case 'mage':
      // Robe clasp
      fr(ctx, cx - 1, torsoY + 4, 3, 10, shade(char.accentColor, -10));
      fr(ctx, cx - 3, torsoY + 7, 7, 2, char.accentColor);
      break;
    case 'paladin':
      // Cross emblem
      fr(ctx, cx - 1, torsoY + 3, 3, 10, ac);
      fr(ctx, cx - 4, torsoY + 6, 9, 3, ac);
      break;
    case 'rogue':
      // Buckles
      fr(ctx, cx - 4, torsoY + 6, 3, 2, ac);
      fr(ctx, cx + 2, torsoY + 6, 3, 2, ac);
      break;
    case 'ranger':
      // Quiver strap
      fr(ctx, cx - w / 2 + 2, torsoY + 2, 3, 14, shade(ar.leather.b, -10));
      break;
  }
}

// ─── WEAPON SOUTH ─────────────────────────────────────────────────────────────

function drawWeaponSouth(ctx: CanvasRenderingContext2D, char: CharacterDef, armX: number, armY: number, attacking: boolean, frameIdx: number) {
  const wc = char.weaponTint;
  switch (char.class) {
    case 'warrior':
    case 'paladin':
      // Sword: blade pointing down
      fr(ctx, armX + 2, armY + 10, 3, 20, wc);
      fr(ctx, armX, armY + 10, 7, 2, shade(wc, -20)); // guard
      fr(ctx, armX + 2, armY + 8, 3, 3, shade(wc, 20)); // pommel
      break;
    case 'mage':
      // Staff: tall stick with orb
      fr(ctx, armX + 3, armY - 10, 2, 30, shade(wc, -20));
      fc(ctx, armX + 4, armY - 12, 5, wc);
      fc(ctx, armX + 4, armY - 12, 3, shade(wc, 40));
      break;
    case 'rogue':
      // Dagger: short
      fr(ctx, armX + 2, armY + 10, 3, 12, wc);
      fr(ctx, armX + 1, armY + 10, 5, 2, shade(wc, -30));
      break;
    case 'ranger':
      // Bow: arc + string
      ctx.strokeStyle = wc;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(armX + 6, armY + 8, 10, -0.8, 0.8);
      ctx.stroke();
      ctx.strokeStyle = '#EFEFEF';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(armX + 6 - 8, armY + 8 - 8);
      ctx.lineTo(armX + 6 - 8, armY + 8 + 8);
      ctx.stroke();
      if (attacking && frameIdx === 1) {
        // Arrow
        fr(ctx, armX - 2, armY + 6, 12, 1, '#C0A060');
      }
      break;
    case 'berserker':
      // Axe: wide head
      fr(ctx, armX + 2, armY + 2, 3, 22, shade(wc, -10));
      fr(ctx, armX - 2, armY + 4, 8, 8, wc);
      fr(ctx, armX - 2, armY + 4, 8, 2, shade(wc, 30));
      break;
  }
}

// ─── WEAPON EAST ─────────────────────────────────────────────────────────────

function drawWeaponEast(ctx: CanvasRenderingContext2D, char: CharacterDef, armX: number, armY: number, attacking: boolean, _frameIdx: number) {
  const wc = char.weaponTint;
  switch (char.class) {
    case 'warrior':
    case 'paladin':
      fr(ctx, armX + 3, armY - 5, 2, 26, wc);
      fr(ctx, armX, armY + 5, 8, 2, shade(wc, -20));
      break;
    case 'mage':
      fr(ctx, armX + 4, armY - 16, 2, 28, shade(wc, -20));
      fc(ctx, armX + 5, armY - 17, 5, wc);
      break;
    case 'rogue':
      fr(ctx, armX + 3, armY + 3, 2, 12, wc);
      fr(ctx, armX + 1, armY + 3, 5, 2, shade(wc, -30));
      break;
    case 'ranger':
      // Bow held sideways
      ctx.strokeStyle = wc;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(armX + 8, armY + 6, 10, -1.2, 1.2);
      ctx.stroke();
      if (attacking) fr(ctx, armX, armY + 5, 16, 1, '#C0A060');
      break;
    case 'berserker':
      fr(ctx, armX + 2, armY - 4, 2, 18, shade(wc, -10));
      fr(ctx, armX - 2, armY - 2, 10, 6, wc);
      break;
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

  const walkPhase = WALK_PHASES[frameIdx % 4];
  const idleBob   = anim === 'idle' ? IDLE_BOB[frameIdx % 4] : 0;
  const bob       = anim === 'idle' ? idleBob : (anim === 'attack' ? 0 : walkPhase.by);

  switch (anim) {
    case 'walk_south': drawSouth(ctx, char, walkPhase, walkPhase.by, anim, frameIdx); break;
    case 'walk_north': drawNorth(ctx, char, walkPhase, walkPhase.by); break;
    case 'walk_east':  drawEast(ctx, char, walkPhase, walkPhase.by, anim, frameIdx); break;
    case 'walk_west':  drawWest(ctx, char, walkPhase, walkPhase.by, anim, frameIdx); break;
    case 'idle':       drawSouth(ctx, char, WALK_PHASES[0], idleBob, anim, frameIdx); break;
    case 'attack':     drawSouth(ctx, char, WALK_PHASES[0], bob, anim, frameIdx); break;
  }
  return canvas;
}

// ─── PUBLIC API: RENDER SPRITE SHEET (192×384) ───────────────────────────────

export function renderCharacterSheet(char: CharacterDef): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width  = CHAR_SHEET_COLS * CHAR_FRAME_W;  // 192
  canvas.height = CHAR_SHEET_ROWS * CHAR_FRAME_H;  // 384
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  const anims: AnimType[] = ['walk_south', 'walk_west', 'walk_east', 'walk_north', 'idle', 'attack'];
  anims.forEach((anim, row) => {
    for (let col = 0; col < CHAR_SHEET_COLS; col++) {
      const frame = renderCharacterFrame(char, anim, col);
      ctx.drawImage(frame, col * CHAR_FRAME_W, row * CHAR_FRAME_H);
    }
  });
  return canvas;
}

// ─── PUBLIC API: THUMBNAIL (idle south frame 0) ───────────────────────────────

export function renderCharacterThumb(char: CharacterDef): HTMLCanvasElement {
  return renderCharacterFrame(char, 'idle', 0);
}

// ─── PUBLIC API: PACK ALL CHARACTER SHEETS INTO ATLAS ────────────────────────

export interface CharAtlasResult {
  atlasCanvas: HTMLCanvasElement;
  positions: Record<string, { x: number; y: number; sheetW: number; sheetH: number }>;
}

export function packCharacterAtlas(): CharAtlasResult {
  const COLS = 8; // character sheets per row
  const sheetW = CHAR_SHEET_COLS * CHAR_FRAME_W;
  const sheetH = CHAR_SHEET_ROWS * CHAR_FRAME_H;
  const rows = Math.ceil(ALL_CHARACTERS.length / COLS);

  const atlas = document.createElement('canvas');
  atlas.width  = COLS * sheetW;
  atlas.height = rows * sheetH;
  const ctx = atlas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  const positions: CharAtlasResult['positions'] = {};
  ALL_CHARACTERS.forEach((char, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const x = col * sheetW;
    const y = row * sheetH;
    const sheet = renderCharacterSheet(char);
    ctx.drawImage(sheet, x, y);
    positions[char.id] = { x, y, sheetW, sheetH };
  });

  return { atlasCanvas: atlas, positions };
}
