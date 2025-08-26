# Frontend Mastery Monorepo

A minimal PNPM + Vite + TypeScript monorepo tailored for Week 1 of the plan.
Includes:
- `apps/lab/logsmith-vanilla`: Vanilla TS app (LogSmith v1) — infinite scroll + basic virtualization scaffold.
- `apps/sandbox/react`: React sandbox to play with later weeks.
- Vitest unit tests and Playwright e2e tests (targeting the vanilla app for Week 1).
- Shared tsconfig and eslint config packages.

## Prereqs
- Node LTS
- PNPM (`npm i -g pnpm`)

## Quick Start (Week 1: Vanilla app)
```bash
pnpm i
pnpm -C apps/lab/logsmith-vanilla dev
# In another terminal
pnpm test
pnpm e2e
```

## Workspaces
- `apps/*/*`
- `packages/*`

## Scripts
- `pnpm test` — run Vitest across packages/apps
- `pnpm e2e` — run Playwright tests for the vanilla app
- `pnpm -C <path> dev` — run dev server for a specific app

See `apps/lab/logsmith-vanilla/README.md` for the Week 1 tasks.
