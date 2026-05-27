# WASD Forge Next Tasks

The export contract is now defined in `ARELORIA_WASD_EXPORT_CONTRACT.md`.

Next implementation tasks:

## 1. Headless WASD Export

Add a command that exports the current weapon atlas without using the browser download button.

Target command:

```text
pnpm --filter @workspace/weapon-atlas run export:wasd
```

Target output:

```text
dist/wasd/modular_weapon_atlas.zip
```

The generated ZIP must contain:

```text
weapon-atlas/atlas.png
weapon-atlas/manifest.json
weapon-atlas/parts.json
weapon-atlas/animations.json
weapon-atlas/README.md
weapon-atlas/parts/**
weapon-atlas/effects/**
```

## 2. Deterministic Export Guard

The forge must not create PRs that only change timestamps.

Default export should avoid unstable metadata fields such as:

```text
generated
generatedAt
exportedAt
```

Only include timestamps when explicitly requested.

Suggested flag:

```text
INCLUDE_BUILD_TIMESTAMP=true
```

## 3. WASD Rarity Adapter

Normalize rarity values before WASD export:

```text
mythic -> mystic
```

The original source value may be preserved as metadata if needed.

## 4. GitHub Action Artifact

Add a workflow that runs the headless export and uploads the ZIP as an artifact.

Suggested artifact name:

```text
wasd-modular-weapon-atlas
```

## 5. Optional WASD Sync

Later, add a workflow that opens a PR in:

```text
OuroborosCollective/Wasd
```

Target file:

```text
asset-packs/2d/weapons/modular_weapon_atlas.zip
```

Do not include the full forge UI, API server, or DB code in WASD.

Forge builds assets. WASD consumes assets.
