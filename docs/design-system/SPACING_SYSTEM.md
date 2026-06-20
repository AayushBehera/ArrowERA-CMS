# Spacing System

ArrowERA is built on a **strict 8px grid**. Every spacing value is a multiple of 4px (half-unit) or 8px (base unit).

## Base Scale

| Token | Value | px | Usage |
|---|---|---|---|
| `ae-1` | 0.25rem | 4px | Tight gaps, icon padding |
| `ae-2` | 0.5rem | 8px | Inline gaps, compact padding |
| `ae-3` | 0.75rem | 12px | Component internal spacing |
| `ae-4` | 1rem | 16px | Default padding/gap |
| `ae-5` | 1.25rem | 20px | Comfortable spacing |
| `ae-6` | 1.5rem | 24px | Section padding |
| `ae-8` | 2rem | 32px | Large section gaps |
| `ae-12` | 3rem | 48px | Layout spacing |
| `ae-16` | 4rem | 64px | Major layout divisions |
| `ae-24` | 6rem | 96px | Page-level spacing |

## Container Widths

Content is constrained to max-width containers for readability:

| Size | Max Width | Usage |
|---|---|---|
| `sm` | 768px | Narrow forms, settings |
| `md` | 1024px | Standard content |
| `lg` | 1280px | Wide tables, media grids |
| `xl` | 1440px | Full-width dashboards |
| `full` | 100% | Edge-to-edge layouts |

## Layout Measurements

- **Topbar**: 64px (h-16)
- **Sidebar collapsed**: 64px
- **Sidebar expanded**: 240px
- **SidebarItem**: 36px height (py-2)

## Border Radius

| Token | Value | Usage |
|---|---|---|
| `rounded-ae-sm` | 4px | Checkboxes, badges, small elements |
| `rounded-ae-md` | 6px | Buttons, inputs, table cells |
| `rounded-ae-lg` | 8px | Cards, modals, panels |
| `rounded-ae-xl` | 12px | Large containers |

## Shadows (subtle, near-flat)

| Token | Description |
|---|---|
| `ae-none` | No shadow |
| `ae-xs` | Subtle elevation (1px) |
| `ae-sm` | Low elevation (2px) |
| `ae-md` | Medium elevation (4px) |
| `ae-lg` | High elevation (8px) |
| `ae-overlay` | Modal/drawer backdrop |

## Rules

1. **Spacing must be from the scale.** Never use arbitrary values like `px-[7px]` or `mx-[13px]`.
2. **Use the Container component** for page-level max-width constraints.
3. **Padding is generous.** Default content padding is 32px (`p-8`).
4. **Gaps match rhythm.** Grid and flex gaps should be scale values.
5. **Border radius matches element size.** Small elements get small radius; large panels get larger radius.
