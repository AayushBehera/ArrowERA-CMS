# ArrorEra CMS

A modern, serverless-ready CMS built with Astro and TypeScript.

## Architecture

- **Frontend:** Astro
- **Backend:** Serverless (Cloudflare Workers compatible)
- **DB:** D1 / SQLite / Postgres
- **Auth:** Passkeys + OAuth
- **Plugins:** Sandboxed Workers
- **Content:** Structured JSON (Portable Text)

## Project Structure

- `apps/` - Runnable projects (like the demo app)
- `packages/` - Core engine packages (`emdash`, `db`, `auth`, etc.)
- `plugins/` - Sandboxed extensions
- `templates/` - Starter templates

## Getting Started

```bash
npm install
npm run seed
npm run dev
```
