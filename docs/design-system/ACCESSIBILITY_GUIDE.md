# Accessibility Guide

ArrowERA targets **WCAG 2.1 Level AA+** compliance across all components.

## Color Contrast

All text/background combinations meet WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text).

The monochrome palette guarantees high contrast:
- `#000000` on `#ffffff` → 21:1 (exceeds AAA)
- `#52525b` on `#ffffff` → 5.6:1 (meets AA)
- `#71717a` on `#ffffff` → 4.3:1 (meets AA for large text)
- `#ffffff` on `#000000` → 21:1 (exceeds AAA)
- `#a1a1aa` on `#000000` → 6.8:1 (meets AA)

## Keyboard Navigation

### Tab Order
All interactive elements are reachable via `Tab` key. The tab order follows the visual DOM order.

### Focus Indicators
- **All interactive elements** show a visible focus ring on `:focus-visible`
- Focus ring: 2px solid ring using `--ae-focus-ring` with 2px offset
- Mouse clicks do NOT show focus rings (uses `focus-visible:` not `focus:`)

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Tab` | Move focus forward |
| `Shift+Tab` | Move focus backward |
| `Enter/Space` | Activate button/checkbox |
| `Escape` | Close modal/drawer/popover/command palette |
| `ArrowUp/Down` | Navigate list items (select, table rows, command palette) |
| `ArrowLeft/Right` | Navigate tabs |
| `Cmd+K` / `Ctrl+K` | Open command palette |

### Focus Trapping

Modals and drawers trap focus within the container. Tab cycles through focusable elements inside the overlay; Shift+Tab cycles backward. Focus is restored to the trigger element on close.

## Screen Readers

### ARIA Attributes

Components use appropriate ARIA roles and attributes:

- **Sidebar**: `role="navigation" aria-label="Sidebar"`
- **Modal**: `role="dialog" aria-modal="true" aria-label="..."`
- **Tabs**: `role="tablist"`, `role="tab"`, `aria-selected`
- **Alerts/Toasts**: `role="alert"`
- **Breadcrumbs**: `role="navigation" aria-label="Breadcrumb"`
- **Table**: `role="table"`, `role="row"`, `aria-sort`
- **CommandPalette**: `role="dialog" aria-modal="true"`, `role="listbox"`, `role="option"`

### Labels

- Form inputs have associated `<label>` elements via `htmlFor`/`id`
- Icon-only buttons have `aria-label` attributes
- SVG icons use `aria-hidden="true"` (decorative)

### Live Regions

- Toast notifications: `role="alert"` for automatic announcement
- Form errors: `role="alert"` on error messages
- Loading states: `aria-busy="true"` on loading containers

## Reduced Motion

Components respect the `prefers-reduced-motion` media query. Animations should be disabled or simplified:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Touch Targets

Interactive elements have minimum touch target sizes:
- Buttons: minimum 36px height (`h-9` = 36px for `md` size)
- Checkboxes: 16px × 16px with surrounding clickable label area
- Sidebar items: 36px height with full-width click target

## Testing Checklist

- [ ] Tab through every interactive element
- [ ] Verify focus rings are visible on keyboard navigation
- [ ] Verify focus rings do NOT appear on mouse clicks
- [ ] Test Escape key closes all overlays
- [ ] Test Arrow keys navigate lists and tabs
- [ ] Verify screen reader announces dynamic content (toasts, errors)
- [ ] Test with 200% browser zoom
- [ ] Test with Windows High Contrast Mode
- [ ] Verify dark mode has equivalent contrast ratios
- [ ] Test with `prefers-reduced-motion: reduce`
