# Typography

ArrowERA uses a curated sans-serif font stack optimized for readability on screens at small sizes.

## Font Stack

```
Inter, Geist, SF Pro Display, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif
```

- **Inter**: Primary UI font. Excellent at 11–14px.
- **Geist**: Vercel's typeface. Geometric, clean, modern.
- **SF Pro Display**: System font on macOS/iOS. Crisp rendering.

## Monospace Stack

```
JetBrains Mono, Fira Code, SF Mono, Cascadia Code, Consolas, monospace
```

Used for code blocks, API keys, inline code.

## Type Scale

| Class | Size | Line Height | Weight | Usage |
|---|---|---|---|---|
| `text-ae-xs` | 0.75rem (12px) | 1.5 | 400–500 | Labels, captions, helper text |
| `text-ae-sm` | 0.8125rem (13px) | 1.5 | 400–500 | Body, inputs, table cells |
| `text-ae-base` | 0.875rem (14px) | 1.5 | 400–500 | Default body text |
| `text-ae-md` | 0.9375rem (15px) | 1.5 | 500–600 | Section headings |
| `text-ae-lg` | 1.0625rem (17px) | 1.5 | 500–600 | Subheadings |
| `text-ae-xl` | 1.25rem (20px) | 1.15 | 600–700 | Page titles |
| `text-ae-2xl` | 1.5rem (24px) | 1.15 | 600–700 | Major headings |
| `text-ae-3xl` | 1.875rem (30px) | 1.15 | 600–700 | Hero headings |
| `text-ae-4xl` | 2.25rem (36px) | 1.15 | 600–700 | Stat numbers, display |

## Weights

- **400 (Regular)**: Body text, descriptions
- **500 (Medium)**: Labels, buttons, navigation
- **600 (Semi Bold)**: Headings, emphasized text
- **700 (Bold)**: Strong emphasis (rare)

## Letter Spacing

- Default: `0` (normal)
- `text-ae-xs`: `0.01em` for legibility at small sizes
- `text-ae-4xl`: `-0.015em` for tight display rendering

## Best Practices

- Never use `font-bold` (700) for body text — reserved for headings
- Use `font-medium` (500) for interactive elements
- Use `tracking-tight` for large headings, `tracking-wider` for uppercase labels
- Keep line lengths to 60–75 characters for readability
- Use `tabular-nums` for numbers that change (counters, timers)
