# BUILD FAILURE REPORT

Each failure below was reproduced by executing the command, captured verbatim, root-caused,
and fixed. No assumptions.

---

## Command matrix (after fixes)

| Command | Before | After |
|---|---|---|
| `pnpm install` | PASS | PASS |
| `pnpm lint` | FAIL (`lint` script did not exist) | PASS |
| `pnpm typecheck` | FAIL (`typecheck` script did not exist) | PASS |
| `pnpm test` | FAIL (script missing + failing tests) | PASS (255 tests) |
| `pnpm build` | FAIL (unresolved import) | PASS |
| `pnpm dev` | FAIL (Vite config crash) | PASS (HTTP 200) |

---

## Failure 1 — `pnpm build`: unresolved `../utils` in UI icons

```
[vite] Could not resolve "../utils" from "packages/ui/src/icons/IconSearch.tsx"
```

- **Root cause:** 48 of 57 icon components imported `createIcon` from `'../utils'`, but
  `utils.ts` lives in the **same** `icons/` directory, so the correct specifier is `'./utils'`.
  Only 9 icons were written correctly.
- **Affected files:** `packages/ui/src/icons/Icon*.tsx` (48 files).
- **Fix:** rewrote the 48 imports `'../utils'` → `'./utils'`.

## Failure 2 — `pnpm dev` / `pnpm test`: root `vite.config.ts` crash

```
Error: Cannot find module '@tailwindcss/vite'  (required from /vite.config.ts)
```

- **Root cause:** the repo root contained an orphaned **Google AI Studio** Vite/React scaffold
  (`vite.config.ts`, `index.html`, `src/App.tsx`, `src/main.tsx`, `src/index.css`). It imported
  `@tailwindcss/vite` and `@vitejs/plugin-react` (neither installed) and defined `GEMINI_API_KEY`.
  Vitest in **every** package climbed up to this config and crashed. The real app is Astro.
- **Affected files:** root `vite.config.ts`, `index.html`, `src/*`.
- **Fix:** removed the orphan scaffold (not part of the documented Astro architecture, not
  referenced by anything, and the `App` was an empty `<div>`). See `VITE_AUDIT.md`.

## Failure 3 — missing `lint` / `typecheck` / `test` scripts at root

- **Root cause:** root `package.json` only had `dev`/`build`/`seed`; the audited gate commands
  did not exist, so `pnpm lint`/`typecheck` errored with `Command "..." not found`.
- **Fix:** added `typecheck` (`tsc --noEmit`), `lint` (`eslint .`), `test` (`vitest run`);
  added `eslint.config.js` and `vitest.config.ts`; added dev tooling to root `devDependencies`.

## Failure 4 — 79 TypeScript errors across workspace packages

- **Root cause (grouped):**
  - Missing deps: `drizzle-orm`, `pg`/`@types/pg` not declared on packages that import them.
  - Missing exports: `@arrowera/db` did not export a `db` client or a `./schema` subpath.
  - External API drift: `@simplewebauthn/server@9` vs code written for v13.
  - Mechanical: static-member access via `this`, wrong relative import paths, nullable
    drizzle columns assigned to non-null interfaces, stub adapters returning wrong types,
    test mocks mistyped.
- **Fix:** full breakdown and per-file fixes in `TYPESCRIPT_AUDIT.md`. Result: **0 errors**.

## Failure 5 — `pnpm test`: 2 failing cache tests

```
redis-cache > incr/decr > should decrement counter   expected NaN to be 7
redis-cache > set > should support NX flag            expected 'second' to be 'first'
```

- **Root cause:** test-layer bugs in `packages/cache/tests/redis-cache.test.ts`.
  (a) the mock Redis client ignored `NX`/`XX` flags; (b) the decrement test seeded the value
  with `cache.set()` (which stores a JSON envelope) then called raw `DECR` → `NaN`.
- **Fix:** taught the mock to honor `NX`/`XX`; seeded the counter test via `incr` (matching how
  raw Redis counters actually work).

## Failure 6 — `pnpm test`: `config.test.ts` fails to collect

```
Config.loadAndValidate (packages/config/src/index.ts:158)  → process.exit(1)
```

- **Root cause:** `packages/config/src/index.ts` eagerly ran `Config.getInstance()` at module
  load, which validates the environment and calls `process.exit(1)` on failure. Importing the
  module (as the test does) killed the test worker.
- **Fix:** made the `config` singleton **lazy** via a Proxy so import has no side effects;
  validation now happens on first access only.
