# VITE AUDIT

## Context

This project ships an **Astro** application (`apps/emdash-demo`). Astro uses **Vite**
internally for both the dev server and the production client/server bundles, so "Vite" in this
repository means *Astro's Vite pipeline*, not a standalone Vite app.

## Findings

### 1. Orphan root `vite.config.ts` (startup blocker) — REMOVED

A standalone Vite/React scaffold from **Google AI Studio** was committed at the repo root:

| File | Problem |
|---|---|
| `vite.config.ts` | imported `@tailwindcss/vite` + `@vitejs/plugin-react` (not installed); defined `GEMINI_API_KEY`; aliased `@` → repo root |
| `index.html` | titled "My Google AI Studio App"; loaded `/src/main.tsx` |
| `src/main.tsx` / `src/App.tsx` | React entry rendering an **empty `<div></div>`** |
| `src/index.css` | `@import "tailwindcss"` (Tailwind v4 syntax; root pinned Tailwind v3) |

**Impact:** `pnpm dev` and `pnpm test` crashed with `Cannot find module '@tailwindcss/vite'`
because Vite (and Vitest in every package) resolved this root config first.

**Resolution:** removed entirely. It was not part of the documented architecture
(README: *Frontend: Astro*), not referenced by any code, and contained AI/Gemini cruft that
the stabilization mandate explicitly excludes.

### 2. Astro's Vite config (`apps/emdash-demo/astro.config.mjs`) — HEALTHY

- `output: 'server'`, adapter `@astrojs/node` (standalone) — resolves.
- integrations `react()` + `tailwind()` — resolve and load.
- `server.open` changed `true → false` so `astro dev` boots cleanly in headless/CI
  (previously emitted `spawn xdg-open ENOENT`).

### 3. Alias / path / workspace resolution — VERIFIED

- Workspace package imports (`@arrowera/db`, `@arrorera/ui`, …) resolve through pnpm symlinks.
- Added an `exports` map to `@arrowera/db` so the `./schema` subpath resolves.
- The drizzle `db` client uses a **lazy** `pg` require, so it is never pulled into the Vite
  **client** bundle (verified: client build = 119 modules, no `pg`).

### 4. Environment loading — VERIFIED

- The removed root config used `loadEnv` only to inject a Gemini key (deleted).
- Astro/Vite load `.env` natively; `.env.example` documents the variables.

## Success condition

```
$ pnpm dev
astro v4.16.19 ready in 429 ms
┃ Local http://localhost:3000/
$ curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/  →  200
```

**`pnpm dev` starts successfully. ✅**
