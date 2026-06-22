# Gym Workout App

A functional mobile gym workout app for Android and iOS, pulling data from an Adalo database via a proxy API server.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/mobile run dev` — run the Expo mobile app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo (React Native) with expo-router
- API: Express 5 (Adalo proxy server)
- State: React Query (@tanstack/react-query)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `artifacts/api-server/src/routes/` — Express route handlers (Adalo proxy)
- `artifacts/mobile/app/` — Expo screens (expo-router file-based routing)
- `artifacts/mobile/constants/colors.ts` — design tokens (dark gym theme)
- `artifacts/mobile/components/` — WorkoutCard, ExerciseCard

## Architecture decisions

- The Express server acts as a secure proxy for the Adalo API — the API key never leaves the server
- Sample/fallback data is returned automatically when Adalo collection IDs are not configured
- Dark-only theme (no light mode) — standard for fitness apps (Nike Training Club, Fitbod)
- Electric lime (#C8F000) as primary accent for energy and contrast on dark backgrounds
- Each screen handles its own loading/error/empty states independently

## Product

- **Home** — greeting, weekly activity tracker, featured workout, category chips, workout list
- **Workouts** — full list with search + category filter, pull-to-refresh
- **Exercises** — full list with search + muscle group filter, pull-to-refresh
- **Profile** — stats grid, account/preferences settings
- **Workout Detail** — full stats, "Start Workout" CTA with haptic feedback
- **Exercise Detail** — muscle group, performance targets, equipment, form tips

## Adalo Integration

To connect to your live Adalo data, set these environment variables:

| Variable | Description |
|---|---|
| `ADALO_API_KEY` | Already set — your API key |
| `ADALO_APP_ID` | Optional override — defaults to your app UUID |
| `ADALO_COLLECTION_WORKOUTS` | Numeric collection ID for Workouts |
| `ADALO_COLLECTION_EXERCISES` | Numeric collection ID for Exercises |
| `ADALO_COLLECTION_CATEGORIES` | Numeric collection ID for Categories |

Find collection IDs in your Adalo dashboard under **Settings → App Access → API** — each collection shows its numeric ID. Without these IDs set, the app serves high-quality sample data.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Adalo external API requires collection IDs (numeric) — not discoverable programmatically without dashboard access
- The API server falls back to sample data silently — no error shown to users
- Expo web preview has different safe area insets than native; use native (Expo Go) as the source of truth
- Do NOT hardcode ports — workflow injects `PORT` env var

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `expo` skill for mobile-specific patterns
