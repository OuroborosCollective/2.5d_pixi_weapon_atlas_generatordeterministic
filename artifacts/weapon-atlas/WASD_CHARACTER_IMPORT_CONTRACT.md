# WASD Character Import Contract
## Areloria Character Forge — v3.0.0

This document defines the exact export format and integration contract for using
Character Forge sprite packs inside the Areloria WASD game engine.

---

## 1. Exported ZIP Structure

```
character-atlas.zip
└── character-atlas/
    ├── ATTRIBUTION.md          ← OpenGameArt attribution + quality summary
    ├── LICENSE                 ← GPL-3.0
    ├── README.md               ← Quick-start guide
    ├── atlas.png               ← Combined spritesheet atlas (all characters packed)
    ├── manifest.json           ← PixiJS Spritesheet manifest (frames + animations + anchors)
    ├── characters.json         ← Full per-character metadata
    ├── metadata.jsonl          ← One-record-per-line dataset format
    ├── quality-report.json     ← Per-character and per-frame quality analysis
    └── characters/
        ├── warrior/
        │   ├── char_warrior_human_iron_uncommon_01.png
        │   └── ...
        ├── mage/
        ├── rogue/
        ├── ranger/
        ├── paladin/
        └── berserker/
```

### Individual sheet dimensions
- **Per-character sheet:** 192 × 576 px (4 cols × 9 rows)
- **Frame size:** 48 × 64 px
- **Format:** PNG, RGBA, transparent background
- **Anti-aliasing:** NONE (pure pixel-art, integer math only)

---

## 2. Intended WASD Import Path

Drop the unzipped `character-atlas/` folder into:

```
apps/client-2d/public/2d-assets/characters/generated/
```

Final paths:
```
apps/client-2d/public/2d-assets/characters/generated/character-atlas/atlas.png
apps/client-2d/public/2d-assets/characters/generated/character-atlas/manifest.json
apps/client-2d/public/2d-assets/characters/generated/character-atlas/characters/warrior/*.png
```

---

## 3. Sprite Sheet Layout (per character)

| Row | Animation Key  | Frames | Status   |
|-----|----------------|--------|----------|
|  0  | `walk_south`   |   4    | Full     |
|  1  | `walk_west`    |   4    | Full     |
|  2  | `walk_east`    |   4    | Full     |
|  3  | `walk_north`   |   4    | Full     |
|  4  | `idle`         |   4    | Full     |
|  5  | `attack`       |   4    | Full     |
|  6  | `cast`         |   4    | Fallback |
|  7  | `hurt`         |   4    | Fallback |
|  8  | `death`        |   4    | Fallback |

**Fallback animations** use simplified/derived poses. They are fully playable but
not frame-by-frame animated. Check `manifest.json > meta.fallback_animations` or
`quality-report.json` for per-character fallback info.

---

## 4. Animation Key Naming Convention

All animation keys in `manifest.json` follow this strict format:

```
{character_id}__{animation_name}
```

Rules:
- All lowercase
- No spaces
- No random suffixes
- Double underscore separator (`__`)
- `{animation_name}` is one of: `idle`, `walk_south`, `walk_west`, `walk_east`, `walk_north`, `attack`, `cast`, `hurt`, `death`

### Examples
```
areloria_human_warrior_starter__idle
areloria_human_warrior_starter__walk_south
areloria_human_warrior_starter__walk_west
areloria_human_warrior_starter__walk_east
areloria_human_warrior_starter__walk_north
areloria_human_warrior_starter__attack
areloria_human_warrior_starter__cast
areloria_human_warrior_starter__hurt
areloria_human_warrior_starter__death
```

---

## 5. PixiJS Integration

### 5.1 Load the manifest

```typescript
import { Assets, Spritesheet } from "pixi.js";

const BASE = "2d-assets/characters/generated/character-atlas/";

const sheet: Spritesheet = await Assets.load(`${BASE}manifest.json`);
```

### 5.2 Create an AnimatedSprite

```typescript
import { AnimatedSprite } from "pixi.js";

const charId = "areloria_human_warrior_starter";

const warrior = new AnimatedSprite(
  sheet.animations[`${charId}__walk_south`]
);
warrior.animationSpeed = 0.12; // ~7fps at 60Hz
warrior.loop = true;
warrior.play();

// Anchor at foot pivot (matches recommended_anchor in manifest meta)
warrior.anchor.set(0.5, 0.88);

app.stage.addChild(warrior);
```

### 5.3 Switch animation

```typescript
function setAnim(sprite: AnimatedSprite, charId: string, anim: string) {
  const key = `${charId}__${anim}`;
  if (!sheet.animations[key]) {
    console.warn(`Animation not found: ${key}`);
    return;
  }
  const wasPlaying = sprite.playing;
  sprite.textures = sheet.animations[key];
  sprite.currentFrame = 0;
  if (wasPlaying) sprite.play();
}

// Walk
setAnim(warrior, charId, "walk_south");

// Attack (play once, then return to idle)
setAnim(warrior, charId, "attack");
warrior.loop = false;
warrior.onComplete = () => {
  warrior.loop = true;
  setAnim(warrior, charId, "idle");
};
warrior.play();
```

### 5.4 Detect fallback animations

```typescript
const meta = sheet.data.meta as Record<string, unknown>;
const fallbacks: string[] = (meta.fallback_animations as string[]) ?? [];

function isFallback(anim: string): boolean {
  return fallbacks.includes(anim);
}

// Per-character fallback info
const fallbackInfo = meta.fallback_info as Record<string, string[]>;
const charFallbacks = fallbackInfo[charId] ?? [];
```

### 5.5 Read quality score

```typescript
// From manifest meta
const packScore: number = meta.pack_quality_score as number;
const safeForExport: boolean = meta.pack_safe_for_export as boolean;

// Per-character from characters.json
const charsJson = await fetch(`${BASE}characters.json`).then(r => r.json());
const charMeta = charsJson.characters[charId];
const charScore: number = charMeta.quality_score;
const charSafe: boolean = charMeta.safe_for_export;

// Full detail from quality-report.json
const qr = await fetch(`${BASE}quality-report.json`).then(r => r.json());
const charQR = qr.per_character[charId];
console.log(charQR.score, charQR.grade, charQR.fatal_errors, charQR.frame_issues);
```

---

## 6. Sprite Scale & Physics Metadata

The following values are included in `manifest.json > meta` and are critical
for correct 2.5D scene integration:

```json
{
  "recommended_scale": 2,
  "recommended_anchor": { "x": 0.5, "y": 0.88 },
  "recommended_sort_y_offset": 8,
  "collision_box": { "w": 18, "h": 14, "offsetY": -8 },
  "contact_shadow": {
    "included_in_sprite": true,
    "note": "Set includeContactShadow=false on export if your engine renders shadows from scene lighting"
  }
}
```

### How to use in PixiJS:

```typescript
const SCALE   = 2;
const ANCHOR  = { x: 0.5, y: 0.88 };
const SORT_DY = 8;  // pixels to add to sprite.y for z-sort ordering
const COL_BOX = { w: 18 * SCALE, h: 14 * SCALE, offsetY: -8 * SCALE };

sprite.scale.set(SCALE);
sprite.anchor.set(ANCHOR.x, ANCHOR.y);

// In your render sort:
sprite.zIndex = sprite.y + SORT_DY * SCALE;

// Collision rectangle (centered on foot anchor):
const col = {
  x: sprite.x - COL_BOX.w / 2,
  y: sprite.y + COL_BOX.offsetY,
  w: COL_BOX.w,
  h: COL_BOX.h,
};
```

---

## 7. Contact Shadow Option

The contact shadow (semi-transparent ellipse under feet) can be toggled at export time:

- **`includeContactShadow: true`** (default for preview and Full Pack):
  Shadow pixels are embedded in the sprite sheet. Simpler setup.

- **`includeContactShadow: false`** (default for WASD Starter Pack):
  No shadow in sprite — use when your engine draws dynamic shadows from the
  scene lighting system. Results in a cleaner sprite with exact transparency.

This setting is recorded in `manifest.json > meta.contact_shadow.included_in_sprite`.

---

## 8. Export Profiles

| Profile         | Characters Included        | Contact Shadow | Use Case                  |
|-----------------|---------------------------|----------------|---------------------------|
| `full`          | All characters             | Yes            | Complete pack, all assets |
| `wasd-starter`  | 8 curated Areloria presets | No             | Initial game integration  |
| `safe-only`     | Score ≥ 70, no fatal errors| Yes            | Filtered quality export   |
| `selected`      | One character              | Yes            | Single character workflow |

---

## 9. Quality Gate

| Score Range | Grade | Badge  | WASD Ready |
|-------------|-------|--------|------------|
| 90–100      |  A    | green  | Yes        |
| 80–89       |  B    | green  | Yes        |
| 70–79       |  C    | yellow | No         |
| 60–69       |  D    | red    | No         |
| 0–59        |  F    | red    | No         |

**WASD Ready** = score ≥ 80 AND `safe_for_export: true` AND no fatal errors.

### Quality checks performed per frame:
- No solid black background (must be fully transparent)
- Minimum visible pixel count (≥ 180 pixels)
- No excessive edge bleed (≤ 16 edge-touch pixels)
- Head zone populated (≥ 20 pixels in y:2–22)
- Torso zone populated (≥ 30 pixels in y:22–44)
- Leg zone populated (≥ 20 pixels in y:43–62)
- Minimum luminance contrast (Δ ≥ 25 between brightest and mean)

---

## 10. Validation

Run the built-in validation before importing:

```typescript
import { validateCharacterExport } from "@workspace/weapon-atlas/src/lib/characterExporter";

const report = await validateCharacterExport("wasd-starter");
console.log(report.valid);         // true/false
console.log(report.checks);       // array of { name, passed, detail }
```

Or from the browser devtools on the Character Forge page:
```javascript
// Press F12 → Console
window.__validateCharacterExport?.("wasd-starter").then(r => console.table(r.checks));
```

---

## 11. Changelog

| Version | Change |
|---------|--------|
| 3.0.0   | 9-row sheet (added cast/hurt/death), export profiles, quality gate, WASD metadata |
| 2.0.0   | 6-row sheet, PixiJS manifest, ZIP export |
| 1.0.0   | Initial procedural character generator |

---

*Generated by Areloria Character Forge — https://github.com/OuroborosCollective/weapon-atlas*
