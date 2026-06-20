# PRODUCTION BUILD REPORT

Executed from a clean state on the stabilized tree (2026-06-20).

| Command | Result | Detail |
|---|---|---|
| `pnpm install` | **PASS** | 21 workspace projects, lockfile in sync, exit 0 |
| `pnpm lint` | **PASS** | `eslint .` → 0 errors, 96 warnings (non-blocking), exit 0 |
| `pnpm typecheck` | **PASS** | `tsc --noEmit` → 0 errors, exit 0 |
| `pnpm test` | **PASS** | vitest → 13 files, **255 tests passed**, exit 0 |
| `pnpm build` | **PASS** | Astro server + client build complete, exit 0 |
| `pnpm dev` | **PASS** | server ready in ~430 ms, `GET / → 200` |

## Evidence

```
# install
Scope: all 21 workspace projects ... Done

# lint
✖ 96 problems (0 errors, 96 warnings)        # exit 0

# typecheck
> tsc --noEmit                                # exit 0  (0 × "error TS")

# test
Test Files  13 passed (13)
     Tests  255 passed (255)                  # exit 0

# build
[build] Complete!                             # exit 0
  dist/client/_astro/AppShell.*.js  85.71 kB
  dist/client/_astro/client.*.js   135.60 kB

# dev
astro v4.16.19 ready in 429 ms
┃ Local http://localhost:3000/
curl → HTTP 200
```

## Verdict

**Every required command passes (PASS × 6).** The lint warnings are intentional (unused
imports / `any` in boundary code) and do not fail the gate.
