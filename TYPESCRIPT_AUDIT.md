# TYPESCRIPT AUDIT

**Command:** `pnpm typecheck` → `tsc --noEmit` over `packages`, `apps`, `plugins`, `scripts`.
**Before:** 84 errors (root scaffold included) → 79 after scaffold removal.
**After:** **0 errors.** ✅

## tsconfig changes

`tsconfig.json` was made deterministic: added `noEmit`, `resolveJsonModule`, `types: ["node"]`,
explicit `include` (`packages`, `apps`, `plugins`, `scripts`) and `exclude`
(`node_modules`, `**/dist`, `**/.astro`). Strictness (`"strict": true`) was **kept**.

## Errors fixed, by root cause

### A. Missing dependencies (import resolution)
| Package | Added | Resolved |
|---|---|---|
| `@arrowera/db` | `drizzle-orm`, `pg`, `@types/pg` | drizzle schema + postgres adapter imports |
| `@arrowera/auth` | `drizzle-orm`, `@simplewebauthn/{server,browser}@^13` | session + passkey services |
| `@arrowera/team` | `drizzle-orm` | org/invitation/license services |
| `@arrowera/security` | `drizzle-orm`, `@arrowera/db` (workspace) | audit service |
| `@arrowera/api` | `@arrowera/security` (workspace) | middleware imports |

### B. Missing exports
- `@arrowera/db` now exports a lazy drizzle `db` client (`packages/db/src/db.ts`) and a
  `./schema` subpath (via an `exports` map); `schema/index.ts` re-exports `auth.schema`.
  This resolved `db` and `@arrowera/db/schema` across auth/team/security.

### C. External API drift — `@simplewebauthn` v9 → v13 (`passkeys/passkey.service.ts`)
- imported the JSON option types from `@simplewebauthn/server` (v13 location);
- `userID` now `Uint8Array` (`new TextEncoder().encode(...)`);
- registration result now reads `credentialDeviceType` / `credentialBackedUp` from
  `registrationInfo` (v13 shape);
- result interfaces switched to `PublicKeyCredential{Creation,Request}OptionsJSON`.

### D. Nullable drizzle columns vs non-null interfaces
Drizzle `$inferSelect` types defaulted columns as `T | null`. Aligned the domain types with
reality (or coalesced at the mapping boundary):
- `auth/session/session.types.ts` — `createdAt/lastActiveAt/isRevoked` nullable; `user` nullable.
- `team/.../organization.types.ts` — `createdAt/updatedAt` nullable; member `user` nullable,
  membership field renamed `role → roleId` (matches schema).
- `team/.../license.types.ts`, `team/.../invitation.types.ts` — timestamps nullable.
- `security/audit/audit.service.ts` — coalesced `actorType ?? 'user'`, `createdAt ?? new Date()`.

### E. Mechanical correctness fixes
- `auth/mfa/totp.service.ts` — static members accessed via `this` → `MFAService.TOTP_*`.
- `api/middleware/index.ts` — broken relative paths → `@arrowera/security`.
- `db/adapters/{d1,turso}.ts` — stubs now return `Promise<QueryResult>` / `Promise<void>`.
- `db/adapters/postgres.ts` — index into `unknown` row cast to `Record<string, any>`.
- `monitoring/src/index.ts` — exposed `type`/`labels`/`buckets` for Prometheus formatting.
- `logging/src/index.ts` — replaced dynamic `logger[level](...)` (which intersected overloads)
  with explicit `error/warn/info` calls.
- `security/{api-keys.ts,input-validation.ts}` — guarded `string | undefined`; widened
  `createMiddleware` schema param to `z.ZodType<T, ZodTypeDef, any>` for transform pipelines.
- `security/audit` — `db.sql` → imported `sql` tag from `drizzle-orm`.

### F. Test typing
- `api/tests/health.test.ts` — cast `process.memoryUsage` mock to its real type.
- `db/tests/postgres-adapter.test.ts` — cast generic `query` mocks to `DatabaseAdapter['query']`.
- `monitoring/tests/monitoring.test.ts` — converted Jest `done`-callback tests (unsupported by
  vitest typings) to Promise-based.

## Remaining `any`

`@typescript-eslint/no-explicit-any` is **off** by policy: the db/cache/adapter boundary layers
intentionally use `any` for dynamic SQL rows and serialized cache payloads. These are isolated to
boundary code and do not leak into the typed domain models.

## Result

```
$ pnpm typecheck
> tsc --noEmit
$ echo $?  → 0
```
**TypeScript errors = 0. ✅**
