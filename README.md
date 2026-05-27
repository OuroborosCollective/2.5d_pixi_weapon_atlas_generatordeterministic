# Weapon Atlas & Tooling

A modular weapon part system and sprite sheet generator. This workspace provides a suite of tools for designing, previewing, and exporting modular weapon assets for game development.

## Core Components

### 🛠️ Weapon Atlas (Frontend)
Located in `artifacts/weapon-atlas`, this is a React-based web application that allows users to:
- **Browse Modular Parts:** View a library of weapon components (blades, handles, guards, etc.).
- **Live Effects:** Preview rarity auras and elemental status effects on individual parts.
- **Export Assets:** Generate and download a ZIP package containing:
    - `atlas.png`: A generated sprite sheet containing all current weapon parts.
    - `manifest.json`: Metadata for every part, including category, rarity, and texture coordinates.
    - `animations.json`: Generic animation timing data for different weapon archetypes.

### 🔌 API Server
Located in `artifacts/api-server`, an Express.js server providing backend services for the ecosystem.

### 📚 Shared Libraries
- `lib/db`: Database schema and migrations using Drizzle ORM.
- `lib/api-spec`: OpenAPI specification for the project.
- `lib/api-client-react`: Generated React hooks for interacting with the API.
- `lib/api-zod`: Generated Zod schemas for runtime validation.

## Getting Started

### Prerequisites
- Node.js 24+
- pnpm

### Installation
```bash
pnpm install
```

### Running the Apps
- **Weapon Atlas UI:** `pnpm --filter @workspace/weapon-atlas run dev` (Starts on port 3000)
- **API Server:** `pnpm --filter @workspace/api-server run dev` (Starts on port 5000)

### Development Workflow
- **Typechecking:** `pnpm run typecheck`
- **Build All:** `pnpm run build`
- **Codegen:** `pnpm --filter @workspace/api-spec run codegen` (Regenerate API hooks/schemas)

## Architecture Decisions

- **Modular Assembly:** Weapons are split into discrete parts (e.g., `sword_blade`, `sword_guard`) defined in `weaponRenderer.ts`.
- **Canvas-Based Rendering:** Parts are procedurally drawn to HTML5 Canvases, allowing for dynamic tinting and effect layering.
- **Packer Logic:** The `atlasPacker.ts` utility handles the layout of parts onto a single sprite sheet for efficient game engine usage (e.g., PixiJS).
- **Metadata-First:** Exports include rich JSON manifests so game engines can reconstruct weapons and play appropriate animations based on the part's `weapon_kind`.

## Project Structure

```text
.
├── artifacts/
│   ├── weapon-atlas/      # Main UI and asset exporter
│   ├── api-server/        # Backend API
│   └── mockup-sandbox/    # Component playground
├── lib/                   # Shared packages
│   ├── api-spec/          # OpenAPI source
│   ├── db/                # Drizzle schema
│   └── ...                # Generated client code
└── scripts/               # Workspace maintenance scripts
```
