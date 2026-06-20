# Component Guidelines

## Universal Patterns

Every ArrowERA component follows these rules:

### 1. `forwardRef` for interactive components

All buttons, inputs, selects, and interactive elements accept a `ref` via `forwardRef`.

```tsx
export const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return <button ref={ref} {...props} />;
});
```

### 2. Variant + Size pattern

Components that have visual variants use `variant` and `size` props:

```tsx
<Button variant="primary" size="md">Save</Button>
<Badge variant="success">Published</Badge>
```

Variant options: `primary | ghost | outline | destructive` (Button), `neutral | success | warning | destructive` (Badge)

Size options: `sm | md | lg` (Button)

### 3. Dark mode via Tailwind `dark:`

Every color class has a dark variant. Components should always look correct in both modes:

```tsx
className="bg-ae-bg text-ae-text-primary border-ae-border
           dark:bg-ae-bg dark:text-ae-text-primary dark:border-ae-border"
```

Since tokens use CSS custom properties that swap values under `.dark`, Tailwind's `dark:` variant handles this automatically.

### 4. Focus-visible only

Focus rings appear only on keyboard focus, not mouse clicks:

```tsx
className="focus-visible:ring-2 focus-visible:ring-ae-focus-ring"
```

### 5. Data attributes for testing

Components expose `data-*` attributes for test targeting:

```tsx
<Button data-variant="primary" data-size="md" data-loading={loading}>
```

### 6. Disabled states

All interactive components support `disabled` with consistent styling:

```tsx
className="disabled:opacity-40 disabled:pointer-events-none"
```

### 7. Transition durations

Use the standardized duration tokens:

| Token | Duration | Usage |
|---|---|---|
| `duration-ae-fast` | 100ms | Hover color changes, focus rings |
| `duration-ae-normal` | 150ms | Toggle states, indicator movement |
| `duration-ae-slow` | 200ms | Enter/exit animations, sidebar collapse |

### 8. Animation keyframes

Animations use inline `<style>` tags with `@keyframes` scoped to the component:

```tsx
<style>{`
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .animate-fade-in { animation: fadeIn 200ms ease-out; }
`}</style>
```

### 9. Error and hint messages

Form components (`Input`, `Select`, `Textarea`) support `error` and `hint` props:

```tsx
<Input
  label="Email"
  error="Invalid email format"
  hint="We'll never share your email."
/>
```

### 10. Accessibility baseline (WCAG AA+)

- All interactive elements are keyboard-accessible
- Form inputs have associated `<label>` elements
- Modals trap focus and restore on close
- Toast notifications use `role="alert"`
- Icons use `aria-hidden="true"` (decorative only)
- Color is never the sole indicator of state

## Component API Summary

| Component | Props | forwardRef |
|---|---|---|
| **Button** | `variant`, `size`, `loading`, `disabled` | ✅ |
| **Input** | `label`, `error`, `hint`, `leftIcon`, `rightIcon` | ✅ |
| **Textarea** | `label`, `error`, `hint`, `autoResize` | ✅ |
| **Select** | `label`, `error`, `hint`, `options`, `placeholder` | ✅ |
| **Checkbox** | `label`, `indeterminate` | ✅ |
| **Badge** | `variant`, `children` | — |
| **Skeleton** | `variant` (text/circular/rectangular), `width`, `height` | — |
| **Spinner** | `size`, `className` | ✅ |
| **Divider** | `direction` (horizontal/vertical) | — |
| **Sidebar** | `defaultCollapsed`, `collapsedWidth`, `expandedWidth` | — |
| **SidebarItem** | `icon`, `label`, `active`, `badge`, `onClick` | — |
| **Topbar** | `userName`, `userEmail`, `notificationCount`, `onSearch` | — |
| **Container** | `size` (sm/md/lg/xl/full) | — |
| **Modal** | `open`, `onClose`, `title`, `children` | — |
| **Drawer** | `open`, `onClose`, `side` (left/right), `children` | — |
| **Tooltip** | `content`, `placement` (top/bottom/left/right) | — |
| **Popover** | `trigger`, `children` | — |
| **Toast** | Context-based: `ToastProvider` + `useToast()` | — |
| **Alert** | `variant` (info/success/warning/error), `dismissible` | — |
| **EmptyState** | `icon`, `title`, `description`, `action` | — |
| **Table** | `columns`, `data`, `selectable`, `sortKey`, `onSort`, `rowKey` | ✅ |
| **Tabs** | `tabs`, `activeTab`, `onChange` | ✅ |
| **Breadcrumbs** | `items`, `separator` (slash/chevron/dot) | ✅ |
| **CommandPalette** | `groups`, `placeholder`, `emptyMessage` | ✅ |
