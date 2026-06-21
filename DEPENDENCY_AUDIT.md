# DEPENDENCY AUDIT

## Duplicate / conflicting core packages — NONE

Verified against the pnpm store (`node_modules/.pnpm`):

| Package | Copies | Version |
|---|---|---|
| `react` | 1 | 18.3.1 |
| `react-dom` | 1 | 18.3.1 |
| `typescript` | 1 | 5.9.3 |
| `vite` | 1 | 5.4.21 |
| `zod` | 1 | 3.25.76 |

**Duplicate React versions = 0. Duplicate Vite versions = 0. Duplicate TypeScript versions = 0.**

## Conflicting lockfiles — FIXED

The repo carried **both** `package-lock.json` (npm) and `pnpm-lock.yaml` (pnpm). Standardized on
**pnpm**; `package-lock.json` removed.

## Missing dependencies (code imported packages it did not declare) — FIXED

| Package | Was missing | Now declared |
|---|---|---|
| `@arrowera/db` | `drizzle-orm`, `pg`, `@types/pg` | ✅ |
| `@arrowera/auth` | `drizzle-orm` | ✅ |
| `@arrowera/team` | `drizzle-orm` | ✅ |
| `@arrowera/security` | `drizzle-orm`, `@arrowera/db` | ✅ |
| `@arrowera/api` | `@arrowera/security` | ✅ |
| root (tooling) | `vitest`, `eslint`, `typescript-eslint`, `@eslint/js`, `globals`, `@types/node` | ✅ |

## Version drift — FIXED

| Package | Before | After | Reason |
|---|---|---|---|
| `@simplewebauthn/server` | ^9.0.0 (installed 9.0.3) | ^13.0.0 | source code targets the v13 API (JSON option types, `registrationInfo.credential`, `Uint8Array` userID) |
| `@simplewebauthn/browser` | ^9.0.0 | ^13.0.0 | keep client/server in lockstep |

## Peer dependencies — VERIFIED

- `@arrorera/ui` peers `react`/`react-dom` `^18.2.0` satisfied by 18.3.1.
- `@arrowera/auth` / `@arrowera/team` workspace peers (`@arrowera/db`, `@arrowera/logging`,
  `@arrowera/auth`) resolve through the workspace; `pnpm install` reports no unmet peers.

## Deprecated packages

`pnpm install` completed cleanly with no blocking deprecation errors. Build scripts for
`esbuild`/`sharp` are intentionally not auto-approved by pnpm (sandbox default); this does not
affect install, typecheck, test, build, or dev.

## Result

`pnpm install` → exit 0. **Dependency conflicts = 0. ✅**
