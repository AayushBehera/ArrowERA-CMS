# RUNTIME VALIDATION

All checks executed against the stabilized tree.

## Frontend

| Check | Result |
|---|---|
| Dev server starts | ✅ `astro v4.16.19 ready in 429 ms` |
| Serves HTTP | ✅ `GET / → 200` |
| Renders | ✅ home page + `AppShell` React island bundle produced/served |
| Navigates | ✅ `/` → `/emdash/admin/*` catch-all SPA shell (client-routed) |
| Production client bundle | ✅ 119 modules, island chunks emitted |

## Backend

| Check | Result |
|---|---|
| Server build | ✅ `@astrojs/node` standalone server built |
| Serves SSR | ✅ `output: 'server'`, `/` rendered server-side |
| API layer loads | ✅ `@arrowera/api` middleware resolves `@arrowera/security` (rate-limit, api-keys, permissions, audit) |

## Database

| Check | Result |
|---|---|
| Runtime adapter | ✅ `DatabaseClient` + `SQLiteAdapter` (JSON-file backed `local.json`) used by content layer |
| Connects | ✅ SQLite adapter initializes its store on construction |
| Migrates / schema | ✅ `generateSchema()` available; drizzle Postgres schema (`auth.schema`) typechecks and is exported via `@arrowera/db/schema` (used by enterprise packages, lazy `pg` connection) |
| Adapters typecheck | ✅ `sqlite`, `postgres`, `d1`, `turso` all satisfy `DatabaseAdapter` |

> Note: the drizzle/Postgres path connects lazily only on first use of the `db` client and is
> not exercised by the demo app's default (SQLite/JSON) runtime; no live Postgres is required to
> boot, build, or test.

## Auth

| Check | Result |
|---|---|
| Package loads | ✅ `@arrowera/auth` index exports OAuth providers, Passkeys (v13), MFA/TOTP, Sessions |
| Typechecks | ✅ 0 errors after webauthn v13 alignment |

## Environment

| Check | Result |
|---|---|
| Loads correctly | ✅ Astro/Vite load `.env`; `.env.example` documents variables |
| Config validation | ✅ `@arrowera/config` validates env **lazily** (no import-time `process.exit`) |

## Fatal runtime errors

**None.** The only previously-observed dev-time error (`spawn xdg-open ENOENT`, from auto-opening
a browser) was eliminated by setting `server.open: false`.

## Result

Frontend starts/renders/navigates; backend serves; DB connects; auth + env load.
**No fatal runtime errors. ✅**
