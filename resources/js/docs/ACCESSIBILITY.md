# Accessibility Implementation Guide

## Overview

This document outlines the accessibility features implemented in the M02 Frontend License Application Management module. All components follow WCAG 2.1 Level AA standards.

## Key Accessibility Features

### 1. Semantic HTML

All components use semantic HTML elements:
- `<nav>` for navigation components
- `<main>` for main content areas
- `<section>` for content sections
- `<article>` for self-contained content
- `<button>` for interactive actions
- `<table>` with proper `<thead>`, `<tbody>`, `<th>`, and `<td>` elements

### 2. ARIA Attributes

#### Status Badges
- `role="status"` for status indicators
- `aria-label` describing the status

```tsx
<span role="status" aria-label="Status permohonan: Draf">
  Draf
</span>
```

#### Dialogs
- `role="dialog"` for modal dialogs
- `aria-modal="true"` to indicate modal behavior
- `aria-labelledby` pointing to dialog title
- `aria-describedby` pointing to dialog description

#### Lists
- `role="list"` and `role="listitem"` for custom lists
- `aria-label` describing the list purpose

#### Forms
- All form inputs have associated `<label>` elements
- `aria-label` or `aria-labelledby` for inputs without visible labels
- `aria-describedby` for additional input descriptions
- `aria-invalid` for validation errors
- `aria-required` for required fields

#### Tables
- `role="table"`, `role="row"`, `role="columnheader"`, `role="cell"`
- `scope="col"` for column headers
- `aria-label` describing table purpose

#### Navigation
- `aria-label` for navigation regions
- `aria-current="page"` for active navigation items
- `aria-current="step"` for active wizard steps

### 3. Keyboard Navigation

All interactive elements are keyboard accessible:

#### Tab Navigation
- All buttons, links, and form inputs are in the tab order
- Custom interactive elements have `tabIndex={0}`
- Disabled elements have `tabIndex={-1}` or `disabled` attribute

#### Keyboard Shortcuts
- **Enter** or **Space**: Activate buttons and links
- **Escape**: Close dialogs and dropdowns
- **Tab**: Move forward through interactive elements
- **Shift+Tab**: Move backward through interactive elements
- **Arrow keys**: Navigate through tabs and lists (where applicable)

#### Focus Management
```tsx
// Example: Focus trap in dialog
useEffect(() => {
  if (isOpen) {
    previousActiveElement.current = document.activeElement;
    cancelButtonRef.current?.focus();
  } else {
    previousActiveElement.current?.focus();
  }
}, [isOpen]);
```

### 4. Focus Indicators

All interactive elements have visible focus indicators:
- `focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`
- Custom focus styles for specific components
- Focus indicators meet WCAG 2.1 contrast requirements

### 5. Color Contrast

All text and interactive elements meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text):

#### Status Badge Colors
- **Draf**: Gray text on gray background (sufficient contrast)
- **Diserahkan**: Blue text on blue background (sufficient contrast)
- **Dibatalkan**: Red text on red background (sufficient contrast)
- **BelumSah**: Yellow text on yellow background (sufficient contrast)
- **Disahkan**: Green text on green background (sufficient contrast)

#### Button Colors
- Primary buttons: White text on blue background
- Secondary buttons: Gray text on white background with border
- Danger buttons: White text on red background

### 6. Screen Reader Support

#### Announcements
- Form validation errors are announced
- Success/error messages are announced via `aria-live` regions
- Loading states are announced via `aria-busy`

#### Hidden Content
- Decorative icons have `aria-hidden="true"`
- Screen reader only text uses `.sr-only` class

```tsx
<span className="sr-only">Loading...</span>
```

#### Live Regions
```tsx
<div role="alert" aria-live="assertive">
  Error message
</div>

<div role="status" aria-live="polite">
  Success message
</div>
```

### 7. Form Accessibility

#### Labels
All form inputs have associated labels:
```tsx
<label htmlFor="filter-keyword" className="sr-only">
  Cari jenis lesen
</label>
<input
  id="filter-keyword"
  type="text"
  aria-label="Cari mengikut jenis lesen"
/>
```

#### Validation
- Inline error messages below form fields
- `aria-invalid="true"` on invalid inputs
- `aria-describedby` linking to error messages

```tsx
<input
  id="nama-perniagaan"
  aria-invalid={!!errors.nama_perniagaan}
  aria-describedby={errors.nama_perniagaan ? "nama-perniagaan-error" : undefined}
/>
{errors.nama_perniagaan && (
  <p id="nama-perniagaan-error" className="text-red-600 text-sm">
    {errors.nama_perniagaan}
  </p>
)}
```

#### Required Fields
```tsx
<label htmlFor="alamat-1">
  Alamat 1 <span className="text-red-600" aria-label="wajib">*</span>
</label>
<input
  id="alamat-1"
  required
  aria-required="true"
/>
```

### 8. Component-Specific Accessibility

#### LicenseStatusBadge
- `role="status"` for status announcement
- `aria-label` describing the status

#### DocumentUploadSlot
- `role="region"` for document upload area
- `aria-labelledby` pointing to requirement name
- `aria-describedby` for requirement description
- `aria-busy` during upload
- File input has descriptive `aria-label`

#### CompletenessChecklist
- `role="list"` for checklist
- `aria-label` describing the checklist
- Icons have `aria-hidden="true"`
- Text describes completion status

#### FilterBar
- `role="search"` for search region
- All inputs have labels (visible or screen reader only)
- Reset button has descriptive `aria-label`

#### StepIndicator
- `aria-label="Progress"` for navigation
- `aria-current="step"` for current step
- Step numbers and labels are visible

#### TabNavigation
- `role="tablist"` for tab container
- `role="tab"` for each tab button
- `aria-selected` for active tab
- `aria-controls` linking to tab panel
- Keyboard navigation with arrow keys

#### ConfirmDialog
- `role="dialog"` with `aria-modal="true"`
- `aria-labelledby` pointing to title
- `aria-describedby` pointing to message
- Focus trap within dialog
- Escape key closes dialog
- Focus returns to trigger element on close

#### Pagination
- `role="navigation"` with `aria-label="Pagination"`
- `aria-current="page"` for current page
- `aria-label` for previous/next buttons
- Page count announced via `aria-live="polite"`

#### LicenseTable
- Proper table structure with `<thead>` and `<tbody>`
- `scope="col"` for column headers
- Rows are keyboard accessible with `tabIndex={0}`
- Enter/Space activates row click
- Edit buttons have descriptive `aria-label`

## Testing Checklist

### Manual Testing

- [ ] All interactive elements are keyboard accessible
- [ ] Tab order is logical and intuitive
- [ ] Focus indicators are visible on all interactive elements
- [ ] Escape key closes dialogs and dropdowns
- [ ] Enter/Space activates buttons and links
- [ ] Form validation errors are announced
- [ ] Success/error messages are announced
- [ ] Loading states are indicated

### Screen Reader Testing

Test with at least one screen reader:
- **Windows**: NVDA (free) or JAWS
- **macOS**: VoiceOver (built-in)
- **Linux**: Orca

Verify:
- [ ] All content is announced correctly
- [ ] Form labels are associated with inputs
- [ ] Validation errors are announced
- [ ] Status changes are announced
- [ ] Dialogs are announced as dialogs
- [ ] Tables are navigable
- [ ] Lists are announced as lists

### Automated Testing

Use automated tools to catch common issues:
- **axe DevTools** (browser extension)
- **WAVE** (browser extension)
- **Lighthouse** (Chrome DevTools)

Run tests on:
- [ ] License list page
- [ ] License create page (all steps)
- [ ] License edit page (all tabs)
- [ ] License details page

### Color Contrast Testing

Use tools to verify contrast ratios:
- **WebAIM Contrast Checker**
- **Chrome DevTools** (Inspect > Accessibility)

Verify:
- [ ] All text meets 4.5:1 ratio (normal text)
- [ ] Large text meets 3:1 ratio
- [ ] Interactive elements meet 3:1 ratio
- [ ] Focus indicators meet 3:1 ratio

## Common Patterns

### Button with Icon
```tsx
<button
  onClick={handleClick}
  className="btn btn-primary"
  aria-label="Muat naik dokumen"
>
  <svg aria-hidden="true">...</svg>
  Muat Naik
</button>
```

### Loading Button
```tsx
<button
  disabled={loading}
  aria-busy={loading}
  className="btn btn-primary"
>
  {loading ? (
    <>
      <svg className="animate-spin" aria-hidden="true">...</svg>
      Memuat naik...
    </>
  ) : (
    'Muat Naik'
  )}
</button>
```

### Error Alert
```tsx
<div role="alert" className="alert alert-error">
  <p>{errorMessage}</p>
</div>
```

### Form Field with Error
```tsx
<div>
  <label htmlFor="field-id">Field Label</label>
  <input
    id="field-id"
    aria-invalid={!!error}
    aria-describedby={error ? "field-id-error" : undefined}
  />
  {error && (
    <p id="field-id-error" className="text-red-600 text-sm" role="alert">
      {error}
    </p>
  )}
</div>
```

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/resources/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

## Maintenance

When adding new components:
1. Use semantic HTML elements
2. Add appropriate ARIA attributes
3. Ensure keyboard accessibility
4. Test with screen readers
5. Verify color contrast
6. Update this documentation
