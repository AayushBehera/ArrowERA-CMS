# ROUTE AUDIT

## Astro routes (`apps/emdash-demo/src/pages`)

| Route file | URL | Type | Status |
|---|---|---|---|
| `index.astro` | `/` | SSR page | ✅ renders (HTTP 200), lists `posts` collection |
| `emdash/admin/[...all].astro` | `/emdash/admin/*` | SSR catch-all → React SPA | ✅ mounts `AppShell` island (`client:only="react"`) |
| `_emdash/admin/[...all].astro` | (private) | underscore-prefixed → **not routed** by Astro | ✅ intentionally excluded |

- `output: 'server'` with `@astrojs/node` (standalone), so all routes are server-rendered.
- The admin/client experience is a **catch-all SSR shell** that hands off to a React island
  router (`AppShell` → `AdminApp`/`ClientApp`), the standard Astro islands pattern.

## Route registration / rendering / imports — VERIFIED

- `index.astro` imports `getEmDashCollection` from `@arrorera/emdash` — resolves; build bundles it.
- `[...all].astro` imports `AppShell` from `../../../components/AppShell` — resolves and hydrates.
- Underscore route (`_emdash`) is deliberately non-public per Astro convention; no dead link.
- No unresolved route imports; the production build emits the client island chunks for `AppShell`.

## API routes

The CMS exposes its API through the **emdash engine** rather than Astro file-based API endpoints:

- `packages/emdash/src/api/index.ts` → `createApiRouter()` (engine-level router factory).
- `packages/api` provides the gateway layer (`@arrowera/api`) with middleware wired to
  `@arrowera/security` (rate-limit, api-keys, permissions, audit) — now resolving after the
  import fix.

No file-based `pages/api/*` endpoints exist in the demo app; none are broken or missing.

## Result

All registered routes resolve, import cleanly, and render. The home route returns **HTTP 200**
and the admin catch-all serves the React island shell. **Routes validated. ✅**
