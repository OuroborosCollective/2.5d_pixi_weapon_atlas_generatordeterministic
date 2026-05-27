# Weapon Atlas & Workspace

A monorepo workspace containing a modular weapon part atlas system, an Express API server, and a mockup sandbox. The core project, `weapon-atlas`, allows users to browse, filter, and export modular weapon parts rendered dynamically using the Canvas API.

## Run & Operate

- `pnpm run build` — Typecheck and build all packages
- `pnpm run typecheck` — Full typecheck across all packages
- `pnpm --filter @workspace/api-server run dev` — Run the API server (port 5000)
- `pnpm --filter @workspace/weapon-atlas run dev` — Run the Weapon Atlas frontend
- `pnpm --filter @workspace/mockup-sandbox run dev` — Run the Mockup Sandbox
- `pnpm --filter @workspace/api-spec run codegen` — Regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — Push DB schema changes (dev only)

**Required environment variables:**
- `DATABASE_URL`: PostgreSQL connection string

## Stack

- **Monorepo**: pnpm workspaces, Node.js 24, TypeScript 5.9
- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons, Shadcn UI
- **Rendering**: HTML5 Canvas API (dynamic modular weapon parts)
- **API**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **Codegen**: Orval (OpenAPI spec to React Query hooks)
- **Utilities**: JSZip (for atlas export)

## Where things live

- `artifacts/weapon-atlas`: Main frontend application for weapon part browsing and export.
- `artifacts/api-server`: Express backend serving the application.
- `artifacts/mockup-sandbox`: A sandbox for testing UI components and mockups.
- `lib/db`: Database schema and Drizzle configuration.
- `lib/api-spec`: OpenAPI specification and Orval configuration.
- `lib/api-zod`: Generated Zod schemas from the API spec.
- `lib/api-client-react`: Generated React Query hooks for the API.

## Architecture Decisions

- **Modular Rendering**: Weapon parts are defined as a series of drawing instructions on HTML5 Canvas, allowing for high performance and scalability without large sprite assets.
- **Spec-First API**: The API is defined using OpenAPI (`openapi.yaml`), and both the client-side hooks and server-side validation are generated from this single source of truth.
- **Workspace Isolation**: Shared libraries (`lib/`) are separated from applications (`artifacts/`) to ensure clean dependency management and reusability.

## Product Capabilities

- **Weapon Atlas**: Browse a vast library of weapon parts (blades, handles, pommels, etc.) across various categories.
- **Rarity & Elements**: Preview parts with dynamic aura effects (Common to Legendary) and elemental overlays (Fire, Ice, Void, etc.).
- **Export System**: Generate and download a ZIP archive containing the atlas manifest and processed assets for game engine integration.
- **Mockup Sandbox**: A dedicated environment to experiment with the design system and UI components in isolation.

## Gotchas

- Always run `pnpm run typecheck` after modifying shared libraries to ensure no regressions in downstream artifacts.
- API changes MUST start in `lib/api-spec/openapi.yaml` followed by `pnpm --filter @workspace/api-spec run codegen`.
