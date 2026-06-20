# Color System

ArrowERA uses a **strict monochrome palette**. No colors beyond black, white, and grayscale — with the sole exception of system-level states (success, warning, error, info) which remain near-monochrome.

## Design Tokens

All colors are defined as CSS custom properties in `packages/ui/src/tokens/colors.css`:

### Light Mode

| Token | Value | Usage |
|---|---|---|
| `--ae-bg` | `#ffffff` | Page background |
| `--ae-fg` | `#000000` | Foreground, primary actions |
| `--ae-surface` | `#fafafa` | Elevated surfaces |
| `--ae-surface-secondary` | `#f4f4f5` | Secondary surfaces |
| `--ae-border` | `#e4e4e7` | Default borders |
| `--ae-border-light` | `#f0f0f0` | Subtle separators |
| `--ae-border-strong` | `#d4d4d8` | Emphasized borders |
| `--ae-text-primary` | `#000000` | Primary text |
| `--ae-text-secondary` | `#52525b` | Secondary text |
| `--ae-text-muted` | `#71717a` | Muted/placeholder text |
| `--ae-text-disabled` | `#a1a1aa` | Disabled text |
| `--ae-hover` | `#f5f5f5` | Hover state background |
| `--ae-active` | `#efefef` | Active/pressed state |
| `--ae-focus-ring` | `rgba(0,0,0,0.12)` | Focus indicator |
| `--ae-overlay` | `rgba(0,0,0,0.04)` | Subtle overlay |
| `--ae-backdrop` | `rgba(0,0,0,0.20)` | Modal backdrop |

### Dark Mode

| Token | Value | Usage |
|---|---|---|
| `--ae-bg` | `#000000` | Page background |
| `--ae-fg` | `#ffffff` | Foreground |
| `--ae-surface` | `#0a0a0a` | Elevated surfaces |
| `--ae-surface-secondary` | `#111111` | Secondary surfaces |
| `--ae-border` | `#222222` | Default borders |
| `--ae-border-light` | `#1a1a1a` | Subtle separators |
| `--ae-border-strong` | `#2a2a2a` | Emphasized borders |
| `--ae-text-primary` | `#ffffff` | Primary text |
| `--ae-text-secondary` | `#a1a1aa` | Secondary text |
| `--ae-text-muted` | `#71717a` | Muted text |
| `--ae-text-disabled` | `#52525b` | Disabled text |
| `--ae-hover` | `#121212` | Hover state |
| `--ae-active` | `#181818` | Active state |
| `--ae-focus-ring` | `rgba(255,255,255,0.12)` | Focus indicator |
| `--ae-overlay` | `rgba(255,255,255,0.04)` | Subtle overlay |
| `--ae-backdrop` | `rgba(0,0,0,0.50)` | Modal backdrop |

## Tailwind Integration

```js
// tailwind.config.mjs
colors: {
  ae: {
    bg: 'var(--ae-bg)',
    fg: 'var(--ae-fg)',
    surface: 'var(--ae-surface)',
    // ...
  }
}
```

Usage: `bg-ae-bg`, `text-ae-text-primary`, `border-ae-border`, `hover:bg-ae-hover`

## System States (near-monochrome)

Even the four system state colors remain grayscale:

| Token | Light | Dark |
|---|---|---|
| `--ae-success` | `#18181b` | `#e4e4e7` |
| `--ae-warning` | `#3f3f46` | `#a1a1aa` |
| `--ae-error` | `#18181b` | `#e4e4e7` |
| `--ae-info` | `#27272a` | `#d4d4d8` |

## Forbidden

- ❌ Indigo, blue, purple, green, emerald, amber, pink, teal
- ❌ Gradients (`bg-gradient-*`)
- ❌ Shadow-heavy cards (`shadow-lg`, `shadow-xl`)
- ❌ Glassmorphism (`backdrop-blur-xl bg-white/80`)
- ❌ Neumorphism
- ❌ Neon/glow effects
