# ArrowERA Design System

## Overview

The ArrowERA Design System is a **pure monochrome** UI framework built for the ArrowERA CMS admin interface. It rejects color as a crutch — instead relying on typography, spacing, contrast, and subtle motion to create clarity and hierarchy.

## Philosophy

- **Black and white only.** No indigo, no purple, no green. The content is the color.
- **Typography as design.** Inter, Geist, and SF Pro provide the visual texture.
- **Space is the luxury.** Generous whitespace over dense, card-heavy layouts.
- **Motion with purpose.** 100–200ms transitions. No bouncy springs. No attention theft.
- **Dark mode is first-class.** Every component ships with `dark:` variants.

## Architecture

```
packages/ui/
├── src/
│   ├── tokens/         # CSS custom properties (colors, typography, spacing)
│   ├── icons/          # 47 custom SVG line icons (1.5-2px stroke)
│   ├── components/     # 20+ React components
│   └── index.ts        # Barrel export
```

- **Package**: `@arrorera/ui`
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS 3.x with `dark:` class strategy
- **Icons**: Custom SVG components via `createIcon()` factory

## Design Principles

1. **Typography-first.** Font weights and sizes create hierarchy; color does not.
2. **8px grid.** All spacing is derived from an 8px base unit.
3. **Subtle borders.** Thin 1px borders (`--ae-border`) define boundaries.
4. **Flat surfaces.** No shadows, no gradients, no glassmorphism.
5. **Focus visible.** Every interactive element shows a visible focus ring.
6. **Reduced motion.** Respects `prefers-reduced-motion`.

## Quick Start

```tsx
import '@arrorera/ui/tokens'; // CSS custom properties
import { Button, Input, Sidebar, Table } from '@arrorera/ui';

function App() {
  return (
    <div className="dark:bg-ae-bg">
      <Button variant="primary">Save</Button>
    </div>
  );
}
```

## Browser Support

- Chrome, Firefox, Safari, Edge (last 2 versions)
- Requires CSS custom property support
- Dark mode via `class` strategy on `<html>`
