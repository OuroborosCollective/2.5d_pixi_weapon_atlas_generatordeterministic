// characterRig.ts — Deterministic character rig for Areloria Character Forge
// Provides anchor points for every frame of every animation/direction.
// Pure functions — no canvas, no side effects.

import type { CharacterDef, AnimType } from './characterRenderer';

export type Direction = 'south' | 'west' | 'east' | 'north';

export interface RigAnchors {
  head:          { x: number; y: number };
  neck:          { x: number; y: number };
  torso:         { x: number; y: number };
  hips:          { x: number; y: number };
  leftShoulder:  { x: number; y: number };
  rightShoulder: { x: number; y: number };
  leftHand:      { x: number; y: number };
  rightHand:     { x: number; y: number };
  weaponHand:    { x: number; y: number };
  leftFoot:      { x: number; y: number };
  rightFoot:     { x: number; y: number };
  shadowCenter:  { x: number; y: number };
  pivot:         { x: number; y: number };
}

// ─── ANIMATION PHASE DATA ─────────────────────────────────────────────────────

// Walk: left and right foot Y offsets per frame (alternating gait)
const WALK_LY  = [-4, -1,  3,  1];
const WALK_RY  = [ 3,  1, -4, -1];
const WALK_BOB = [-1,  0, -1,  0];

// Idle: gentle breathing bob
const IDLE_BOB = [0, -1, -1, 0];

// Attack: arm extension per frame
const ATTACK_ARM_X = [ 0,  8, 12,  4];
const ATTACK_ARM_Y = [-4,  2,  4,  0];

// Cast: hands raised for spell
const CAST_ARM_X = [0, -2, -4, -2];
const CAST_ARM_Y = [-8, -10, -10, -8];

// Hurt: recoil backwards
const HURT_BOB = [2, 4, 3, 1];

// Death: falling sequence
const DEATH_BOB = [0, 4, 8, 10];

// Race-specific vertical offsets (positive = shorter/lower)
const RACE_DY: Record<string, number> = { human: 0, elf: -1, dwarf: 4, orc: 0 };

// Race-specific torso widths
const RACE_TORSO_W: Record<string, number> = { human: 20, elf: 18, dwarf: 24, orc: 24 };

// ─── RIG BUILDER ─────────────────────────────────────────────────────────────

export function buildCharacterRig(
  char: CharacterDef,
  anim: AnimType,
  _direction: Direction,
  frameIndex: number
): RigAnchors {
  const fi  = frameIndex & 3; // % 4, integer
  const cx  = 24;             // center X of 48px frame
  const dy  = RACE_DY[char.race] ?? 0;
  const tw  = RACE_TORSO_W[char.race] ?? 20;
  const hw  = tw >> 1;

  // Determine bob and foot offsets based on animation
  let bob        = 0;
  let leftFootDy = 0;
  let rightFootDy= 0;

  switch (anim) {
    case 'walk_south':
    case 'walk_west':
    case 'walk_east':
    case 'walk_north':
      bob         = WALK_BOB[fi];
      leftFootDy  = WALK_LY[fi];
      rightFootDy = WALK_RY[fi];
      break;
    case 'idle':
      bob = IDLE_BOB[fi];
      break;
    case 'hurt':
      bob = HURT_BOB[fi];
      break;
    case 'death':
      bob = DEATH_BOB[fi];
      break;
    default:
      break;
  }

  const baseY = dy + bob;

  // Body landmark positions (frame-local coords)
  const headCY   = baseY + 13;
  const neckY    = baseY + 22;
  const torsoMidY= baseY + 33;
  const hipsY    = baseY + 43;
  const groundY  = 58; // contact zone top

  // Foot positions (walk animates them; idle/other holds ground)
  const isWalk = anim === 'walk_south' || anim === 'walk_west' ||
                 anim === 'walk_east'  || anim === 'walk_north';
  const lFootY = isWalk ? (hipsY + leftFootDy  + 10) : groundY;
  const rFootY = isWalk ? (hipsY + rightFootDy + 10) : groundY;

  // Weapon / hand positions vary by animation
  let weaponX = cx + 10;
  let weaponY = baseY + 38;

  if (anim === 'attack') {
    weaponX = cx + 6 + ATTACK_ARM_X[fi];
    weaponY = baseY + 26 + 12 + ATTACK_ARM_Y[fi];
  } else if (anim === 'cast') {
    weaponX = cx + CAST_ARM_X[fi];
    weaponY = baseY + 26 + CAST_ARM_Y[fi];
  } else if (anim === 'death') {
    weaponX = cx + 4 + DEATH_BOB[fi];
    weaponY = baseY + 36 + DEATH_BOB[fi];
  }

  return {
    head:          { x: cx,           y: headCY },
    neck:          { x: cx,           y: neckY },
    torso:         { x: cx,           y: torsoMidY },
    hips:          { x: cx,           y: hipsY },
    leftShoulder:  { x: cx - hw,      y: baseY + 26 },
    rightShoulder: { x: cx + hw,      y: baseY + 26 },
    leftHand:      { x: cx - 12,      y: baseY + 38 },
    rightHand:     { x: cx + 10,      y: baseY + 38 },
    weaponHand:    { x: weaponX,      y: weaponY },
    leftFoot:      { x: cx - 6,       y: lFootY },
    rightFoot:     { x: cx + 6,       y: rFootY },
    shadowCenter:  { x: cx,           y: 62 },
    pivot:         { x: cx,           y: groundY },
  };
}

export function getAnimationFrameAnchors(
  char: CharacterDef,
  anim: AnimType,
  direction: Direction
): RigAnchors[] {
  return [0, 1, 2, 3].map(fi => buildCharacterRig(char, anim, direction, fi));
}

export function getFootLockScore(char: CharacterDef, anim: AnimType): number {
  const anchors = getAnimationFrameAnchors(char, anim, 'south');
  const lYs = anchors.map(a => a.leftFoot.y);
  const rYs = anchors.map(a => a.rightFoot.y);
  const lVar = Math.max(...lYs) - Math.min(...lYs);
  const rVar = Math.max(...rYs) - Math.min(...rYs);
  // Idle should have zero variance; walk should alternate predictably
  if (anim === 'idle') {
    const max = Math.max(lVar, rVar);
    return Math.max(0, 100 - max * 20);
  }
  return 100; // Walk variance is expected
}

export function getPivot(_char: CharacterDef, _anim: AnimType): { x: number; y: number } {
  return { x: 24, y: 58 };
}

export function getContactShadow(
  char: CharacterDef,
  _anim: AnimType,
  _frameIndex: number
): { x: number; y: number; rx: number; ry: number } {
  const tw = RACE_TORSO_W[char.race] ?? 20;
  return { x: 24, y: 62, rx: (tw >> 1) - 1, ry: 3 };
}

export function getWeaponPose(
  char: CharacterDef,
  anim: AnimType,
  frameIndex: number
): { x: number; y: number; angle: number } {
  const r = buildCharacterRig(char, anim, 'south', frameIndex);
  const attackAngles = [-0.8, 0.3, 0.6, 0.0];
  const angle = anim === 'attack' ? attackAngles[frameIndex & 3] : 0;
  return { x: r.weaponHand.x, y: r.weaponHand.y, angle };
}

// Fallback animation list — animations that use simplified/fallback poses
export const FALLBACK_ANIMATIONS: AnimType[] = ['cast', 'hurt', 'death'];

export function isFallbackAnimation(anim: AnimType): boolean {
  return FALLBACK_ANIMATIONS.includes(anim);
}
