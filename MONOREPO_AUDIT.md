# MONOREPO AUDIT

## Workspace topology

- **Manager:** pnpm (`pnpm-workspace.yaml`), 21 projects.
- **Members:** `apps/*` (1: `emdash-demo`), `packages/*` (20), `plugins/*` (2).
- `templates/*` contain their own `package.json` files but are **not** workspace members
  (not matched by `pnpm-workspace.yaml`) — intentional, they are starter templates.

## Package export / import validation

| Area | Status | Notes |
|---|---|---|
| `@arrorera/ui` exports (`.`, `./tokens`, `./icons`) | OK | icon `../utils` → `./utils` fixed (48 files) |
| `@arrowera/db` exports | FIXED | added `exports` map (`.`, `./schema`) + `db` client export |
| `@arrorera/emdash` namespace re-exports | OK | enterprise namespaces tree-shaken at build |
| `@arrowera/api` middleware imports | FIXED | `../../security/src/*` → `@arrowera/security` |
| Workspace cross-deps (`*` / `workspace:*`) | OK | all resolve via pnpm symlinks |
| `tsconfig` references | N/A | single root `tsconfig.json`; no project-references graph in use |

## Scope-naming inconsistency — DOCUMENTED, NOT CHANGED

Two scopes coexist:

- `@arrowera/*` — `api, auth, cache, config, db, logging, monitoring, security, team`
- `@arrorera/*` (typo) — `ai, analytics, builder, emdash, plugin-marketplace, plugin-runtime,
  realtime, storage, ui, workflow, example-plugin`

Every package's name is internally consistent and every dependency string targets the **correct**
existing package (e.g. `@arrorera/emdash` depends on both `@arrowera/db` and `@arrorera/ai`, both
of which exist). This is therefore **cosmetic, non-breaking**. A global rename would touch 20
packages, the lockfile, and every import site for **zero functional gain** and meaningful
regression risk — out of scope for a stabilization pass. Recorded here as known tech-debt.

## Broken references found & fixed

1. `@arrowera/db` missing `db` / `./schema` exports → consumers (auth/team/security) could not
   resolve them. **Fixed.**
2. `@arrowera/api` imported security via filesystem-relative paths that escaped the package.
   **Fixed** to the package specifier + workspace dependency.
3. `@arrowera/security/audit` imported `@arrowera/db` without declaring it. **Fixed.**

## Result

All workspace references resolve. `pnpm install` and `pnpm -r` operate cleanly across 21
projects. **Workspace resolves correctly. ✅**
