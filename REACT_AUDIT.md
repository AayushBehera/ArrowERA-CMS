# REACT AUDIT

## Versions (resolved)

| Package | Range | Resolved |
|---|---|---|
| `react` | ^18.2.0 | **18.3.1** (single copy) |
| `react-dom` | ^18.2.0 | **18.3.1** (single copy) |
| `@types/react` | ^18.2.64 | 18.3.x |
| `@types/react-dom` | ^18.2.21 | 18.3.x |
| `@astrojs/react` | ^3.1.0 | 3.6.3 |

No duplicate React/ReactDOM versions in the tree (see `DEPENDENCY_AUDIT.md`).

## JSX runtime / TS config

- `tsconfig.json`: `"jsx": "react-jsx"` (automatic runtime) — correct for React 18; no
  `import React` boilerplate required.
- `packages/ui/peerDependencies` correctly declares `react`/`react-dom` `^18.2.0`.

## Rendering model

React runs as **Astro islands**, not a root SPA. The host page is `index.astro`; interactive
React (`AppShell`, `AdminApp`, `ClientApp`, `Auth`) hydrates as islands via `@astrojs/react`.

## Entry points / providers / routes — VERIFIED

| Concern | Result |
|---|---|
| Entry (`apps/emdash-demo/src/pages/index.astro`) | renders, returns HTTP 200 |
| Island components (`src/components/*.tsx`) | compile + bundle (client build OK) |
| Providers | no invalid/duplicated providers found |
| Circular imports | none detected in the runtime graph |

## Hooks / correctness fixes

- `packages/ui/src/components/Table.tsx`
  - `handleKeyDown` was typed for `HTMLTableSectionElement` but also called from a `<tr>`
    (`HTMLTableRowElement`); widened the parameter to `React.KeyboardEvent<HTMLElement>`.
  - the generic `forwardRef` cast omitted `displayName`; extended the cast type so
    `Table.displayName = 'Table'` typechecks.
- No broken hooks, no invalid hook calls, and no hydration-breaking patterns were found.

## Orphan React entry — REMOVED

The root `src/main.tsx` mounted an empty `<App/>` (`<div></div>`) via `createRoot`. This was the
Google AI Studio scaffold (see `VITE_AUDIT.md`) and was removed; the real React surface is the
Astro islands above.

## Success condition

The application renders: `index.astro` returns **HTTP 200** and the `AppShell` island bundle
(`AppShell.*.js`, 85.7 kB) is produced and served. **React renders successfully. ✅**
