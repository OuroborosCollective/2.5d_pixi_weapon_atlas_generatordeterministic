# Areloria / WASD Weapon Forge Export Contract

This repository is the upstream Weapon Forge for the Areloria / WASD MMORPG.

The game repository stays lean. This tool generates deterministic modular weapon asset packs. WASD consumes the exported ZIP or normalized public assets.

## Purpose

The Weapon Forge must produce repeatable modular 2.5D weapon packs for the PixiJS client.

A valid export contains:

```text
weapon-atlas/
  atlas.png
  manifest.json
  parts.json
  animations.json
  README.md
  parts/
  effects/
    auras/
    elements/
```

WASD currently consumes the pack through:

```text
asset-packs/2d/weapons/modular_weapon_atlas.zip
```

and extracts it to:

```text
apps/client-2d/public/2d-assets/weapons/modular/
```

## Determinism Rules

Exports must be deterministic by default.

Required:

- stable part ordering
- stable category ordering
- stable atlas packing
- stable file names
- stable rarity mapping
- stable assembly rules
- stable animation metadata

Avoid timestamp-only diffs. The forge must not create pull requests that only change `generatedAt`, `generated`, or similar timestamp fields.

If build metadata is needed, put it behind an explicit flag such as:

```text
INCLUDE_BUILD_TIMESTAMP=true
```

Default export should be stable enough that running the export twice without part changes creates no Git diff.

## Rarity Mapping

The forge uses `mythic` internally in some places.

WASD uses:

```text
common
uncommon
rare
epic
legendary
mystic
```

Therefore the export adapter must normalize:

```text
mythic -> mystic
```

The original source rarity may still be preserved as metadata:

```json
{
  "rarity": "mystic",
  "sourceRarity": "mythic"
}
```

## Weapon Assembly Rules

The current WASD-compatible assembly rules are:

```json
{
  "sword": ["sword_blade", "sword_guard", "sword_handle", "sword_pommel"],
  "axe": ["axe_head", "axe_handle"],
  "hammer": ["hammer_head", "axe_handle"],
  "spear": ["spear_tip", "spear_shaft"],
  "bow": ["bow_limb", "bow_string"],
  "dagger": ["dagger_blade", "sword_guard", "sword_handle"],
  "mace": ["mace_head", "axe_handle"],
  "staff": ["staff_head", "spear_shaft", "magical_crystal"],
  "knuckle": ["knuckle"],
  "shield": ["shield"]
}
```

## Element Rules

Supported visual element overlays:

```text
none
fire
ice
electro
wind
```

Server gameplay mapping should be handled in WASD, not in the asset forge.

Suggested gameplay meaning:

```text
fire    -> damage over time
ice     -> slow
 electro -> stun or interrupt chance
wind    -> attack speed or movement impulse
none    -> neutral
```

## WASD Import Pipeline

Target flow:

```text
Weapon Forge
  -> headless export
  -> modular_weapon_atlas.zip
  -> WASD asset-pack path
  -> WASD extraction workflow
  -> apps/client-2d public assets
  -> PixiJS ModularWeaponAssembler
```

The game repository should not need the full forge UI, API server, DB schema, or OpenAPI stack.

Only the exported pack and the normalized manifest belong in WASD.

## Next Build Tasks

1. Add a headless export command:

```text
pnpm --filter @workspace/weapon-atlas run export:wasd
```

2. Export ZIP to:

```text
dist/wasd/modular_weapon_atlas.zip
```

3. Add a GitHub Action that uploads the ZIP as an artifact.

4. Optional later: add a sync workflow that opens a PR in `OuroborosCollective/Wasd` with the new ZIP.

5. Add a deterministic diff guard that fails if the export only changes timestamps.

## Ownership

This repository is the production forge for Areloria modular weapons.

WASD is the runtime consumer.

The boundary is intentional:

```text
Forge = create assets
WASD = consume assets and run gameplay
```
