# REPOSITORY FORENSICS REPORT

**Repository:** ArrowERA CMS
**Audit date:** 2026-06-20
**Auditor role:** Lead Staff Engineer — pre-production stabilization
**Scope:** Make the repository buildable, runnable, testable, and stable. No new features.

---

## 1. Executive summary

The repository is a **pnpm monorepo** whose product is an **Astro + React (islands)** CMS
(`apps/emdash-demo`) backed by ~20 workspace packages. The "outage" was caused by a
**leftover Google AI Studio Vite/React scaffold committed at the repo root** that was
incompatible with the actual Astro architecture, plus a set of broken imports, missing
dependencies and TypeScript errors across the workspace packages.

After stabilization, **all gates pass**: `install`, `lint`, `typecheck`, `test`, `build`, `dev`.

---

## 2. System inventory & status

| System | Artifact(s) | Status (before) | Status (after) |
|---|---|---|---|
| Package manager | `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `.npmrc` | EXISTS / OK | EXISTS / OK |
| Conflicting npm lockfile | `package-lock.json` | CONFLICTING | REMOVED |
| Root build app (orphan) | `vite.config.ts`, `index.html`, `src/*` | BROKEN (orphan) | REMOVED |
| Real app | `apps/emdash-demo` (Astro) | BROKEN (build) | EXISTS / OK |
| TS config | `tsconfig.json` | INCOMPLETE (no include/noEmit) | FIXED |
| UI package | `packages/ui` | BROKEN (icon imports) | FIXED |
| DB package | `packages/db` | BROKEN (missing deps/exports) | FIXED |
| Auth package | `packages/auth` | BROKEN (webauthn/drizzle drift) | FIXED |
| Team package | `packages/team` | BROKEN (drizzle null types) | FIXED |
| Security package | `packages/security` | BROKEN (drizzle, types) | FIXED |
| Monitoring/Logging/API | `packages/*` | BROKEN (type errors) | FIXED |
| Config package | `packages/config` | BROKEN (import side effect) | FIXED |
| Cache package | `packages/cache` | BROKEN (2 failing tests) | FIXED |
| Lint tooling | (none) | MISSING | ADDED (`eslint.config.js`) |
| Test runner config | (none at root) | MISSING | ADDED (`vitest.config.ts`) |
| Turbo pipeline | `turbo.json` | EXISTS (unused) | EXISTS |

---

## 3. Package manager forensics

- `pnpm-workspace.yaml` globs `apps/*`, `packages/*`, `plugins/*` — **correct**.
- `.npmrc` sets `link-workspace-packages=true` — workspace packages link locally — **OK**.
- **CONFLICT:** both `package-lock.json` (npm) and `pnpm-lock.yaml` (pnpm) were committed,
  and `package.json` declared an npm-style `workspaces` array. The project is driven entirely
  by `pnpm`. The npm lockfile was **removed** to standardize on pnpm and avoid drift.

## 4. Scope-naming forensics

Two scopes coexist by historical accident: `@arrowera/*` (canonical) and `@arrorera/*` (typo).
Every package name is internally consistent and every cross-package dependency resolves to a
real package, so this is **cosmetic, not breaking**. It was left as-is to avoid a high-risk,
zero-functional-value rename across the lockfile and 20 packages. Documented in `MONOREPO_AUDIT.md`.

## 5. Import / dependency graph (runtime)

The Astro app's **actual** runtime graph is small and clean:

```
apps/emdash-demo (astro)
 ├─ @arrowera/db        → DatabaseClient, SQLiteAdapter (server-side content)
 ├─ @arrorera/ui        → components + icons
 ├─ @arrorera/plugin-runtime → PluginSandbox
 └─ @arrorera/emdash    → core/astro/schema/auth/content/plugins/admin/api/utils
                          (re-exports enterprise namespaces, tree-shaken at build)
```

The "enterprise" packages (`auth`, `team`, `security/audit`, drizzle schema, extra db
adapters) are **scaffolded but not wired into the running app**; their package indexes do not
export the half-built services, which is why the build never reached them. They are still
fully typechecked and were brought to **0 TypeScript errors**.

## 6. Config forensics

- `tsconfig.json`: lacked `include`/`exclude`/`noEmit`; made deterministic.
- `vite.config.ts` (root): referenced `@tailwindcss/vite` + `@vitejs/plugin-react` that were
  **not installed**, plus a Gemini `define` — orphan AI-Studio scaffold. **Removed.**
- `astro.config.mjs`: valid; `server.open` switched to `false` for headless boot.
- `turbo.json`: present but unused by the npm/pnpm scripts; left untouched.

See `BUILD_FAILURE_REPORT.md` for the per-failure root-cause analysis.
