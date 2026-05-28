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

function outline(ctx: CanvasRenderingContext2D, color = "#0d0d0d", lw = 2.5) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke();
  ctx.restore();
}

function ambientOcclusion(ctx: CanvasRenderingContext2D, pathFn: () => void, opacity = 0.3) {
  ctx.save();
  pathFn();
  ctx.clip();
  ctx.shadowColor = "black";
  ctx.shadowBlur = 10;
  ctx.strokeStyle = `rgba(0,0,0,${opacity})`;
  ctx.lineWidth = 8;
  ctx.stroke();
  ctx.restore();
}

function painterlyTexture(ctx: CanvasRenderingContext2D, pathFn: () => void, color = "rgba(0,0,0,0.08)") {
  ctx.save();
  pathFn();
  ctx.clip();
  ctx.fillStyle = color;
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * 64;
    const y = Math.random() * 64;
    const w = 8 + Math.random() * 12;
    const h = 2 + Math.random() * 4;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.random() * Math.PI);
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.restore();
  }
  ctx.restore();
}

function rimLight(ctx: CanvasRenderingContext2D, pathFn: () => void, color = "rgba(255,255,255,0.3)", width = 3) {
  ctx.save();
  pathFn();
  ctx.clip();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.globalCompositeOperation = "screen";
  ctx.stroke();
  ctx.restore();
}

function addNoise(ctx: CanvasRenderingContext2D, opacity = 0.04) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.globalCompositeOperation = "overlay";
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * 64;
    const y = Math.random() * 64;
    ctx.fillStyle = Math.random() > 0.5 ? "#fff" : "#000";
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.restore();
}

function shade(c: string, amt: number): string {
  const n = parseInt(c.slice(1), 16);
  const r = Math.min(255, Math.max(0, (n >> 16) + amt));
  const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + amt));
  const b = Math.min(255, Math.max(0, (n & 0xff) + amt));
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

// ─── ANATOMY PATHS ────────────────────────────────────────────────────────────

function headPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  // Slightly tapered egg shape for realistic head
  ctx.ellipse(cx, cy, r * 0.85, r, 0, 0, Math.PI * 2);
}

function torsoPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, taper = 0.8) {
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, cy);
  ctx.lineTo(cx + w / 2, cy);
  ctx.lineTo(cx + (w / 2) * taper, cy + h);
  ctx.lineTo(cx - (w / 2) * taper, cy + h);
  ctx.closePath();
}

function limbPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, taper = 0.7) {
  ctx.beginPath();
  ctx.moveTo(x - w / 2, y);
  ctx.lineTo(x + w / 2, y);
  ctx.lineTo(x + (w / 2) * taper, y + h);
  ctx.lineTo(x - (w / 2) * taper, y + h);
  ctx.closePath();
}

function drawMaterial(ctx: CanvasRenderingContext2D, pathFn: () => void, baseColor: string, isMetal = false) {
  ctx.save();
  pathFn();
  const g = ctx.createLinearGradient(0, 0, 0, 64);
  g.addColorStop(0, shade(baseColor, 20));
  g.addColorStop(1, shade(baseColor, -20));
  ctx.fillStyle = g;
  ctx.fill();

  ambientOcclusion(ctx, pathFn, isMetal ? 0.4 : 0.25);
  painterlyTexture(ctx, pathFn, isMetal ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)");
  rimLight(ctx, pathFn, isMetal ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.2)", isMetal ? 4 : 2);
  addNoise(ctx, 0.03);

  pathFn();
  outline(ctx, shade(baseColor, -60), 2.5);
  ctx.restore();
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
  human:  { headR: 8.5, torsoW: 18, torsoH: 20, legH: 16, dy: -2 },
  elf:    { headR: 7.5, torsoW: 16, torsoH: 22, legH: 18, dy: -4 },
  dwarf:  { headR: 9,   torsoW: 22, torsoH: 16, legH: 10, dy: 6  },
  orc:    { headR: 10,  torsoW: 24, torsoH: 20, legH: 14, dy: -2 },
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
  const arm = ar[char.armorTier];
  const isMetal = char.armorTier !== 'leather';

  // Shadow
  ctx.save();
  ctx.beginPath(); ctx.ellipse(cx, 62, 12, 4, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fill();
  ctx.restore();

  const isAttack = anim === 'attack';
  const ap = isAttack ? ATTACK_PHASES[frameIdx] : null;

  // ── BACK ARM (left in south view) ──
  const backArmY = isAttack ? baseY + 26 : baseY + 26 + wp.la * 0.4;
  drawMaterial(ctx, () => limbPath(ctx, cx - 11, backArmY, 8, 12), shade(arm.b, -20), isMetal);
  // hand
  drawMaterial(ctx, () => { ctx.beginPath(); ctx.arc(cx - 11, backArmY + 12, 3.5, 0, Math.PI * 2); }, char.skinColor);

  // ── LEGS ──
  const legX = [cx - 8, cx + 8];
  const legYs = isAttack ? [baseY + 44, baseY + 44] : [baseY + 44 + wp.ly, baseY + 44 + wp.ry];
  for (let i = 0; i < 2; i++) {
    drawMaterial(ctx, () => limbPath(ctx, legX[i], legYs[i], 10, m.legH), arm.b, isMetal);
    // Boot
    drawMaterial(ctx, () => {
      ctx.beginPath();
      ctx.roundRect(legX[i] - 6, legYs[i] + m.legH - 2, 12, 6, 2);
    }, shade(arm.b, -40), isMetal);
  }

  // ── TORSO ──
  const torsoY = baseY + 25;
  drawMaterial(ctx, () => torsoPath(ctx, cx, torsoY, m.torsoW, m.torsoH), arm.b, isMetal);

  // Belt
  drawMaterial(ctx, () => {
    ctx.beginPath(); ctx.roundRect(cx - m.torsoW/2 - 1, torsoY + m.torsoH - 2, m.torsoW + 2, 4, 1);
  }, arm.blt, false);

  // Class detail / Chest plate
  drawChestDetail(ctx, char, cx, torsoY, m.torsoW);

  // ── NECK ──
  drawMaterial(ctx, () => { ctx.beginPath(); ctx.roundRect(cx - 3, baseY + 21, 6, 6, 1); }, char.skinColor);

  // ── HEAD ──
  drawMaterial(ctx, () => headPath(ctx, cx, baseY + 14, m.headR), char.skinColor);

  // ── HAIR & HELMET ──
  drawHairSouth(ctx, char, cx, baseY, m.headR);
  drawHelmet(ctx, char, cx, baseY, m.headR);

  // ── EYES ──
  for (const ex of [cx - 4, cx + 4]) {
    ctx.fillStyle = char.eyeColor;
    ctx.beginPath(); ctx.arc(ex, baseY + 14, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#000";
    ctx.beginPath(); ctx.arc(ex, baseY + 14, 0.8, 0, Math.PI * 2); ctx.fill();
  }

  // ── FRONT ARM + WEAPON ──
  if (ap) {
    const fax = cx + 11 + ap.armX;
    const fay = baseY + 26 + ap.armY;
    drawMaterial(ctx, () => limbPath(ctx, fax, fay, 8, 12), arm.b, isMetal);
    drawMaterial(ctx, () => { ctx.beginPath(); ctx.arc(fax, fay + 12, 3.5, 0, Math.PI * 2); }, char.skinColor);
    drawWeaponSouth(ctx, char, fax, fay, true, frameIdx);
  } else {
    const fax = cx + 11;
    const fay = baseY + 26 + wp.ra * 0.4;
    drawMaterial(ctx, () => limbPath(ctx, fax, fay, 8, 12), arm.b, isMetal);
    drawMaterial(ctx, () => { ctx.beginPath(); ctx.arc(fax, fay + 12, 3.5, 0, Math.PI * 2); }, char.skinColor);
    drawWeaponSouth(ctx, char, fax, fay, false, 0);
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
  const isMetal = char.armorTier !== 'leather';

  // Shadow
  ctx.save();
  ctx.beginPath(); ctx.ellipse(cx, 62, 12, 4, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fill();
  ctx.restore();

  // ── LEGS ──
  const legX = [cx - 8, cx + 8];
  const legYs = [baseY + 44 + wp.ly, baseY + 44 + wp.ry];
  for (let i = 0; i < 2; i++) {
    drawMaterial(ctx, () => limbPath(ctx, legX[i], legYs[i], 10, m.legH), shade(arm.b, -10), isMetal);
    drawMaterial(ctx, () => {
      ctx.beginPath();
      ctx.roundRect(legX[i] - 6, legYs[i] + m.legH - 2, 12, 6, 2);
    }, shade(arm.b, -50), isMetal);
  }

  // ── ARMS (back) ──
  drawMaterial(ctx, () => limbPath(ctx, cx - 11, baseY + 26 + wp.la * 0.4, 8, 12), shade(arm.b, -15), isMetal);
  drawMaterial(ctx, () => limbPath(ctx, cx + 11, baseY + 26 - wp.la * 0.4, 8, 12), shade(arm.b, -15), isMetal);

  // ── TORSO (back) ──
  const torsoY = baseY + 25;
  drawMaterial(ctx, () => torsoPath(ctx, cx, torsoY, m.torsoW, m.torsoH), shade(arm.b, -10), isMetal);

  // Belt
  drawMaterial(ctx, () => {
    ctx.beginPath(); ctx.roundRect(cx - m.torsoW/2 - 1, torsoY + m.torsoH - 2, m.torsoW + 2, 4, 1);
  }, shade(arm.blt, -10), false);

  // ── NECK ──
  drawMaterial(ctx, () => { ctx.beginPath(); ctx.roundRect(cx - 3, baseY + 21, 6, 6, 1); }, shade(char.skinColor, -15));

  // ── HEAD ──
  drawMaterial(ctx, () => headPath(ctx, cx, baseY + 14, m.headR), shade(char.skinColor, -15));

  // ── HAIR & HELMET ──
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
  const isMetal = char.armorTier !== 'leather';
  const isAttack = anim === 'attack';
  const ap = isAttack ? ATTACK_PHASES[frameIdx] : null;

  // Shadow
  ctx.save();
  ctx.beginPath(); ctx.ellipse(cx, 62, 10, 4, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fill();
  ctx.restore();

  // ── BACK ARM ──
  const backArmY = baseY + 26 + (isAttack ? 0 : wp.la * 0.5);
  drawMaterial(ctx, () => limbPath(ctx, cx - 4, backArmY, 6, 11), shade(arm.b, -30), isMetal);

  // ── BACK LEG ──
  const backLegY = baseY + 44 + (isAttack ? 0 : wp.ry);
  drawMaterial(ctx, () => limbPath(ctx, cx, backLegY, 8, m.legH), shade(arm.b, -25), isMetal);

  // ── TORSO ──
  const torsoY = baseY + 25;
  drawMaterial(ctx, () => torsoPath(ctx, cx, torsoY, 14, m.torsoH), arm.b, isMetal);

  // ── NECK ──
  drawMaterial(ctx, () => { ctx.beginPath(); ctx.roundRect(cx - 2, baseY + 21, 5, 6, 1); }, char.skinColor);

  // ── HEAD ──
  const headP = () => { ctx.beginPath(); ctx.ellipse(cx + 2, baseY + 14, m.headR * 0.7, m.headR, 0, 0, Math.PI * 2); };
  drawMaterial(ctx, headP, char.skinColor);

  // Eye (profile)
  ctx.fillStyle = char.eyeColor;
  ctx.beginPath(); ctx.arc(cx + 4, baseY + 14, 1.6, 0, Math.PI * 2); ctx.fill();

  // ── HAIR & HELMET ──
  drawHairEast(ctx, char, cx, baseY, m.headR);
  drawHelmet(ctx, char, cx + 2, baseY, m.headR);

  // ── FRONT LEG ──
  const frontLegY = baseY + 44 + (isAttack ? 0 : wp.ly);
  drawMaterial(ctx, () => limbPath(ctx, cx, frontLegY, 8, m.legH), arm.b, isMetal);
  drawMaterial(ctx, () => {
    ctx.beginPath(); ctx.roundRect(cx - 5, frontLegY + m.legH - 2, 11, 6, 2);
  }, shade(arm.b, -35), isMetal);

  // ── FRONT ARM + WEAPON ──
  if (ap) {
    const fax = cx + 5 + ap.armX;
    const fay = baseY + 26 + ap.armY;
    drawMaterial(ctx, () => limbPath(ctx, fax, fay, 7, 11), arm.b, isMetal);
    drawMaterial(ctx, () => { ctx.beginPath(); ctx.arc(fax, fay + 11, 3.2, 0, Math.PI * 2); }, char.skinColor);
    drawWeaponEast(ctx, char, fax, fay, true, frameIdx);
  } else {
    const fax = cx + 5;
    const fay = baseY + 26 - wp.la * 0.3;
    drawMaterial(ctx, () => limbPath(ctx, fax, fay, 7, 11), arm.b, isMetal);
    drawMaterial(ctx, () => { ctx.beginPath(); ctx.arc(fax, fay + 11, 3.2, 0, Math.PI * 2); }, char.skinColor);
    drawWeaponEast(ctx, char, fax, fay, false, 0);
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
  const hairP = () => {
    ctx.beginPath();
    ctx.arc(cx, baseY + 14, r, Math.PI, 0);
    // Side locks
    ctx.lineTo(cx + r, baseY + 22);
    ctx.lineTo(cx + r - 4, baseY + 22);
    ctx.lineTo(cx + r - 4, baseY + 18);
    ctx.lineTo(cx - r + 4, baseY + 18);
    ctx.lineTo(cx - r + 4, baseY + 22);
    ctx.lineTo(cx - r, baseY + 22);
    ctx.closePath();
  };
  drawMaterial(ctx, hairP, h);
}

function drawHairNorth(ctx: CanvasRenderingContext2D, char: CharacterDef, cx: number, baseY: number, r: number) {
  const h = char.hairColor;
  const hairP = () => {
    ctx.beginPath();
    ctx.arc(cx, baseY + 14, r, Math.PI, 0);
    ctx.lineTo(cx + r, baseY + 26);
    ctx.lineTo(cx - r, baseY + 26);
    ctx.closePath();
  };
  drawMaterial(ctx, hairP, h);
}

function drawHairEast(ctx: CanvasRenderingContext2D, char: CharacterDef, cx: number, baseY: number, r: number) {
  const h = char.hairColor;
  const hairP = () => {
    ctx.beginPath();
    ctx.ellipse(cx + 2, baseY + 14, r * 0.8, r, 0, Math.PI, Math.PI * 2);
    ctx.lineTo(cx + 2 - r * 0.4, baseY + 26);
    ctx.lineTo(cx + 2 - r * 0.8, baseY + 26);
    ctx.closePath();
  };
  drawMaterial(ctx, hairP, h);
}

// ─── HELMET / HAT ─────────────────────────────────────────────────────────────

function drawHelmet(ctx: CanvasRenderingContext2D, char: CharacterDef, cx: number, baseY: number, r: number) {
  const ac = char.accentColor;
  switch (char.class) {
    case 'warrior':
    case 'paladin': {
      const col = ar[char.armorTier].b;
      const helmP = () => {
        ctx.beginPath();
        ctx.arc(cx, baseY + 12, r + 1, Math.PI, 0);
        ctx.lineTo(cx + r + 1, baseY + 16);
        ctx.lineTo(cx - r - 1, baseY + 16);
        ctx.closePath();
      };
      drawMaterial(ctx, helmP, col, true);
      // Plume
      if (char.rarity !== 'common') {
        drawMaterial(ctx, () => {
          ctx.beginPath(); ctx.moveTo(cx, baseY + 8);
          ctx.bezierCurveTo(cx + 10, baseY - 10, cx - 10, baseY - 10, cx, baseY + 8);
        }, ac);
      }
      break;
    }
    case 'mage': {
      const col = shade(char.armorColor, 20);
      const hatP = () => {
        ctx.beginPath();
        ctx.moveTo(cx - 12, baseY + 14);
        ctx.lineTo(cx + 12, baseY + 14);
        ctx.lineTo(cx, baseY - 8);
        ctx.closePath();
      };
      drawMaterial(ctx, hatP, col);
      // Band
      drawMaterial(ctx, () => { ctx.beginPath(); ctx.roundRect(cx - 7, baseY + 10, 14, 3, 1); }, ac);
      break;
    }
    case 'rogue': {
      const col = shade(char.armorColor, 10);
      const hoodP = () => {
        ctx.beginPath();
        ctx.arc(cx, baseY + 12, r + 2, Math.PI * 0.8, Math.PI * 2.2);
        ctx.lineTo(cx, baseY + 4);
        ctx.closePath();
      };
      drawMaterial(ctx, hoodP, col);
      break;
    }
    case 'ranger': {
      const col = ar.leather.b;
      drawMaterial(ctx, () => { ctx.beginPath(); ctx.roundRect(cx - r, baseY + 8, r * 2, 4, 1); }, col);
      if (char.rarity !== 'common') {
        drawMaterial(ctx, () => { ctx.beginPath(); ctx.arc(cx, baseY + 8, 3, 0, Math.PI * 2); }, ac);
      }
      break;
    }
    case 'berserker': {
      const col = shade(ar[char.armorTier].b, -20);
      // Spiked horns
      const horn = (side: number) => {
        ctx.beginPath();
        ctx.moveTo(cx + side * r, baseY + 10);
        ctx.lineTo(cx + side * (r + 6), baseY + 2);
        ctx.lineTo(cx + side * (r + 2), baseY + 18);
        ctx.closePath();
      };
      drawMaterial(ctx, () => horn(1), col, true);
      drawMaterial(ctx, () => horn(-1), col, true);
      // Headband
      drawMaterial(ctx, () => { ctx.beginPath(); ctx.roundRect(cx - r, baseY + 10, r * 2, 4, 1); }, ac);
      break;
    }
  }
}

// ─── CHEST DETAIL ─────────────────────────────────────────────────────────────

function drawChestDetail(ctx: CanvasRenderingContext2D, char: CharacterDef, cx: number, torsoY: number, w: number) {
  const ac = char.accentColor;
  ctx.save();
  switch (char.class) {
    case 'warrior':
    case 'berserker':
      drawMaterial(ctx, () => {
        ctx.beginPath(); ctx.roundRect(cx - w/4 - 2, torsoY + 4, 4, 8, 1);
        ctx.roundRect(cx + w/4 - 2, torsoY + 4, 4, 8, 1);
      }, ac, true);
      break;
    case 'mage':
      drawMaterial(ctx, () => { ctx.beginPath(); ctx.arc(cx, torsoY + 8, 4, 0, Math.PI * 2); }, ac);
      break;
    case 'paladin':
      drawMaterial(ctx, () => {
        ctx.beginPath(); ctx.roundRect(cx - 1, torsoY + 3, 2, 10, 1);
        ctx.roundRect(cx - 4, torsoY + 6, 8, 2, 1);
      }, ac, true);
      break;
    case 'rogue':
      drawMaterial(ctx, () => {
        ctx.beginPath(); ctx.roundRect(cx - w/3, torsoY + 5, 3, 2, 0.5);
        ctx.roundRect(cx + w/3 - 3, torsoY + 5, 3, 2, 0.5);
      }, ac);
      break;
  }
  ctx.restore();
}

// ─── WEAPON SOUTH ─────────────────────────────────────────────────────────────

function drawWeaponSouth(ctx: CanvasRenderingContext2D, char: CharacterDef, armX: number, armY: number, attacking: boolean, frameIdx: number) {
  const wc = char.weaponTint;
  switch (char.class) {
    case 'warrior':
    case 'paladin':
      drawMaterial(ctx, () => { ctx.beginPath(); ctx.roundRect(armX + 2, armY + 10, 3, 20, 1); }, wc, true);
      drawMaterial(ctx, () => { ctx.beginPath(); ctx.roundRect(armX - 1, armY + 10, 9, 3, 1); }, shade(wc, -20), true);
      break;
    case 'mage':
      drawMaterial(ctx, () => { ctx.beginPath(); ctx.roundRect(armX + 3, armY - 10, 2, 30, 1); }, shade(wc, -20));
      drawMaterial(ctx, () => { ctx.beginPath(); ctx.arc(armX + 4, armY - 12, 5, 0, Math.PI * 2); }, wc);
      break;
    case 'rogue':
      drawMaterial(ctx, () => { ctx.beginPath(); ctx.roundRect(armX + 2, armY + 10, 3, 12, 1); }, wc, true);
      break;
    case 'ranger':
      ctx.save();
      ctx.strokeStyle = wc; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(armX + 6, armY + 8, 11, -0.8, 0.8); ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(armX - 2, armY); ctx.lineTo(armX - 2, armY + 16); ctx.stroke();
      if (attacking && frameIdx === 1) {
        drawMaterial(ctx, () => { ctx.beginPath(); ctx.roundRect(armX - 4, armY + 7, 14, 2, 0.5); }, "#C0A060");
      }
      ctx.restore();
      break;
    case 'berserker':
      drawMaterial(ctx, () => { ctx.beginPath(); ctx.roundRect(armX + 2, armY + 2, 3, 22, 1); }, shade(wc, -10));
      drawMaterial(ctx, () => { ctx.beginPath(); ctx.roundRect(armX - 2, armY + 4, 8, 8, 1); }, wc, true);
      break;
  }
}

// ─── WEAPON EAST ─────────────────────────────────────────────────────────────

function drawWeaponEast(ctx: CanvasRenderingContext2D, char: CharacterDef, armX: number, armY: number, attacking: boolean, _frameIdx: number) {
  const wc = char.weaponTint;
  switch (char.class) {
    case 'warrior':
    case 'paladin':
      drawMaterial(ctx, () => { ctx.beginPath(); ctx.roundRect(armX + 3, armY - 5, 2, 26, 1); }, wc, true);
      drawMaterial(ctx, () => { ctx.beginPath(); ctx.roundRect(armX, armY + 5, 8, 2, 1); }, shade(wc, -20), true);
      break;
    case 'mage':
      drawMaterial(ctx, () => { ctx.beginPath(); ctx.roundRect(armX + 4, armY - 16, 2, 28, 1); }, shade(wc, -20));
      drawMaterial(ctx, () => { ctx.beginPath(); ctx.arc(armX + 5, armY - 17, 5, 0, Math.PI * 2); }, wc);
      break;
    case 'rogue':
      drawMaterial(ctx, () => { ctx.beginPath(); ctx.roundRect(armX + 3, armY + 3, 2, 12, 1); }, wc, true);
      break;
    case 'ranger':
      ctx.save();
      ctx.strokeStyle = wc; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(armX + 8, armY + 6, 11, -1.2, 1.2); ctx.stroke();
      if (attacking) drawMaterial(ctx, () => { ctx.beginPath(); ctx.roundRect(armX, armY + 5, 16, 2, 0.5); }, "#C0A060");
      ctx.restore();
      break;
    case 'berserker':
      drawMaterial(ctx, () => { ctx.beginPath(); ctx.roundRect(armX + 2, armY - 4, 2, 18, 1); }, shade(wc, -10));
      drawMaterial(ctx, () => { ctx.beginPath(); ctx.roundRect(armX - 2, armY - 2, 10, 6, 1); }, wc, true);
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
