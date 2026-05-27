# Weapon Atlas & Tooling

A modular weapon part system and sprite sheet generator.

## Quick Start

- `pnpm --filter @workspace/weapon-atlas run dev` — Run the Weapon Atlas UI (Port 3000)
- `pnpm --filter @workspace/api-server run dev` — Run the API server (Port 5000)
- `pnpm run build` — Typecheck and build all packages

## Key Files

- **DB Schema:** `lib/db/src/schema/index.ts`
- **Weapon Parts:** `artifacts/weapon-atlas/src/lib/weaponRenderer.ts`
- **Atlas Logic:** `artifacts/weapon-atlas/src/lib/atlasPacker.ts`

For full documentation, see [README.md](./README.md).
