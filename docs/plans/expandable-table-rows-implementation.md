# Expandable Table Rows Implementation Plan

**Status**: ✅ Implemented (2025-09-30)
**Created**: 2025-09-30
**Purpose**: Enable expandable table rows to display `produktBeskrivelse` on demand

---

## 🎉 Implementation Progress (2025-09-30)

### ✅ Completed Tasks

1. **TypeScript Types** (`components/ui/Table/types.ts`)
   - Created comprehensive type definitions for expandable functionality
   - `ExpandableConfig<T>` interface with all required properties
   - `ExpandIconProps` for custom expand icons
   - `TableProps<T>` extended with optional `expandable` config
   - Full TypeScript strict mode compliance

2. **ExpandableTableRow Component** (`components/ui/Table/ExpandableTableRow.tsx`)
   - Self-contained row component with expansion logic (178 lines)
   - Default chevron icon with smooth rotation animation
   - Grid-based CSS animation (`grid-rows-[0fr]` → `grid-rows-[1fr]`)
   - Full ARIA support: `aria-expanded`, `aria-controls`, `aria-label`
   - Keyboard navigation: Enter/Space to toggle expansion
   - Optional `rowExpandable` predicate function
   - Optional `expandRowByClick` for full-row expansion

3. **Enhanced Table Component** (`components/ui/Table.tsx`)
   - Added `expandable` prop to TableProps
   - Conditional expand column header rendering
   - Automatic routing to ExpandableTableRow when expandable config present
   - Maintains 100% backward compatibility for non-expandable tables
   - Updated imports to use new types system

4. **Integration in Dashboard** (`app/page.tsx`)
   - Added expandable configuration to main product table
   - `expandedRowRender` displays `produktBeskrivelse` with HTML rendering
   - `rowExpandable` predicate prevents expansion for empty descriptions
   - Semantic HTML with proper heading structure

5. **Barrel Export** (`components/ui/Table/index.ts`)
   - Clean exports for all types and components
   - TypeScript-friendly module structure

### ⚠️ Security Note

Current implementation uses `dangerouslySetInnerHTML` for HTML descriptions.
**TODO**: Add DOMPurify sanitization before production deployment.

### 🧪 Build Validation

- ✅ TypeScript strict mode: **PASSED**
- ✅ Production build: **PASSED** (Next.js 15.5.0)
- ✅ ESLint: **PASSED** (no errors)
- ✅ Unit tests created: `ExpandableTableRow.test.tsx` (11 test cases)

### 📦 Files Created/Modified

**New Files:**
- `components/ui/Table/types.ts` (95 lines)
- `components/ui/Table/ExpandableTableRow.tsx` (178 lines)
- `components/ui/Table/ExpandableTableRow.test.tsx` (195 lines)
- `components/ui/Table/index.ts` (12 lines)

**Modified Files:**
- `components/ui/Table.tsx` (+48 lines, enhanced with expandable support)
- `app/page.tsx` (+19 lines, integrated expandable config)

### 🎨 Features Implemented

✅ Expandable row functionality with smooth animations
✅ Chevron icon with 90° rotation on expansion
✅ Grid-based CSS animation (200ms duration)
✅ Full ARIA support for screen readers
✅ Keyboard navigation (Enter/Space)
✅ Conditional expansion based on content availability
✅ HTML rendering for product descriptions
✅ Backward compatibility for non-expandable tables
✅ TypeScript strict mode compliance
✅ Comprehensive unit test coverage

### 🚀 Next Steps for Production

1. **Security Enhancement**: Add DOMPurify for HTML sanitization
2. **Manual Testing**: Test with real product data
3. **Accessibility Audit**: WAVE/axe DevTools validation
4. **Cross-browser Testing**: Chrome, Firefox, Safari, Edge
5. **Mobile Testing**: iOS Safari, Android Chrome
6. **Performance Testing**: Measure animation FPS

---

## 📊 Data Model Analysis

From `/home/rydesp/dev/easmith-varekatalog-backend/docs/project/api-endpoints-reference.md`:

**Key field**: `produktBeskrivelse` - HTML description content (line 87)
```json
{
  "vvsnr": "54327454",
  "produktNavn": "Product name",
  "produktBeskrivelse": "<p>HTML description</p>",
  // ... 22 other fields
}
```

## 🎨 Design Pattern Research Findings

### Best Practices (2025 Standards)

1. **TanStack Table Expansion Pattern** (Industry Standard)
   - Row-level expansion state management
   - `row.getCanExpand()`, `row.getIsExpanded()`, `row.getToggleExpandedHandler()`
   - Flexible custom UI for expand/collapse icons

2. **Ant Design Table Expandable** (Battle-tested UX)
   - `expandedRowRender` function for custom content
   - `expandIcon` for custom toggle button
   - `expandRowByClick` option for full-row click vs icon-only
   - ARIA support: `aria-expanded`, `aria-controls`, `aria-label`

3. **Accessibility Requirements** (HeroUI/NextUI Standards)
   - Keyboard navigation (Arrow keys, Enter, Space)
   - Screen reader announcements via ARIA live regions
   - Focus management after expansion
   - `useId()` hook for unique ARIA relationships

4. **Animation Best Practices**
   - CSS `grid-template-rows` with `0fr` → `1fr` transition
   - Tailwind: `transition-all duration-200 ease-in-out`
   - Avoid `max-height` hacks (causes janky animations)
   - Use `overflow-hidden` during transition

## 🏗️ Implementation Architecture

### Component Structure

```
components/
└── ui/
    ├── Table/
    │   ├── Table.tsx              (existing - enhance)
    │   ├── ExpandableTableRow.tsx (new - expandable row logic)
    │   ├── types.ts               (new - expand types)
    │   └── index.ts               (barrel export)
```

### Core Features

1. **Expansion State Management**
   - Zustand store or local useState for `expandedRows: Set<string>`
   - Toggle function: `(rowId: string) => void`
   - Persist state during pagination (optional)

2. **Expand Icon Component**
   - Chevron icon: `→` collapsed, `↓` expanded
   - Position: First column (before status indicator)
   - Visual: 24×24px clickable area
   - Color: `text-neutral-400` → `text-byggern-primary` on hover

3. **Expanded Content Row**
   - Full-width `<tr>` with single `<td colspan={columns.length}>`
   - Background: `bg-neutral-50` (subtle distinction)
   - Padding: `p-6` for comfortable reading
   - HTML sanitization for `produktBeskrivelse`

4. **Responsive Design**
   - Desktop: Full table layout with expansion
   - Mobile: Consider accordion card layout alternative
   - Touch targets: Minimum 44×44px (WCAG AAA)

## 🔧 Technical Implementation Details

### TypeScript Types

```typescript
interface ExpandableTableProps<T> extends TableProps<T> {
  expandable?: {
    expandedRowRender: (record: T, index: number) => React.ReactNode;
    rowExpandable?: (record: T) => boolean;
    defaultExpandedRowKeys?: string[];
    expandIcon?: (props: { expanded: boolean; onExpand: () => void }) => React.ReactNode;
  };
}
```

### Accessibility Attributes

- `<tr aria-expanded="true|false">`
- `<td role="button" aria-label="Utvid rad">`
- `<div id={expandedContentId} role="region">`
- `useId()` for unique ID generation

### Animation CSS

```css
.expanded-row {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 200ms ease-in-out;
}
.expanded-row.is-expanded {
  grid-template-rows: 1fr;
}
```

## 📝 Changes Required

### 1. Enhance `Table.tsx`

**Current**: 184 lines
**Estimated New**: ~280 lines

Changes:
- Add expandable props interface
- Integrate expansion state management
- Render expand icon column conditionally
- Render expanded content rows
- Maintain backward compatibility for non-expandable tables

### 2. Create `ExpandableTableRow.tsx`

**New file**: ~120 lines

Features:
- Isolated row component with expansion logic
- Handles expand/collapse animations
- Manages ARIA attributes
- HTML sanitization for beskrivelse

### 3. Update `app/page.tsx`

**Changes**: ~10 lines

Modifications:
- Add `expandable` configuration to Table component
- Define `expandedRowRender` to display produktBeskrivelse
- Conditionally show expand column

### 4. Update `types/product.ts`

**Changes**: ~5 lines

Additions:
- Add `beskrivelse?: string` mapping for produktBeskrivelse
- Update Product interface documentation

## ✅ Quality Assurance Checklist

- [ ] TypeScript strict mode compliance
- [ ] Unit tests with React Testing Library
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Mobile responsive testing
- [ ] Keyboard navigation verification
- [ ] Screen reader testing (NVDA/VoiceOver)
- [ ] Animation performance testing
- [ ] HTML sanitization security review

## 🎯 Success Criteria

1. Users can click expand icon to reveal produktBeskrivelse
2. Smooth animation (200ms) with no jank
3. ARIA attributes properly announce state changes
4. Keyboard accessible (Enter/Space to toggle)
5. Works across all table features (pagination, filtering, sorting)
6. Mobile-friendly touch targets (44×44px minimum)
7. Expanded state survives pagination navigation (optional)
8. HTML content is properly sanitized to prevent XSS

## 📚 References

- [TanStack Table Expanding Guide](https://github.com/TanStack/table/blob/main/docs/guide/expanding.md)
- [Ant Design Table Expandable API](https://ant.design/components/table#expandable)
- [React useId Hook Documentation](https://react.dev/reference/react/useId#usage)
- [WCAG 2.1 Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [HeroUI Table Accessibility](https://www.heroui.com/docs/components/table#accessibility)

## 🔒 Security Considerations

- **HTML Sanitization**: Use `DOMPurify` or similar library for `produktBeskrivelse`
- **XSS Prevention**: Never use `dangerouslySetInnerHTML` without sanitization
- **Content Security Policy**: Ensure inline styles are allowed if needed

## 🎨 UX Design Decisions

### Expand Icon Position
**Decision**: First column (before status indicator)
**Rationale**: Standard pattern, users expect expand controls on the left

### Expand Trigger
**Decision**: Icon click only (not full row click)
**Rationale**: Prevents accidental expansions, allows future row click for detail view

### Visual Feedback
**Decision**: Subtle background color change (`bg-neutral-50`)
**Rationale**: Maintains clean design while providing visual separation

### Animation Duration
**Decision**: 200ms
**Rationale**: Fast enough to feel responsive, slow enough to be perceivable

## 🚧 Future Enhancements

- Expand all/collapse all buttons
- Persist expansion state in URL query params
- Lazy load produktBeskrivelse on expansion
- Rich text editor for produktBeskrivelse in admin interface
- Export expanded rows to PDF/Excel
