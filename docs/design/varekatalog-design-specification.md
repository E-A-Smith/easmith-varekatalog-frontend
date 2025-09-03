# Varekatalog - Design Specification
**Version**: 2.2 - Authentic Byggern Brand Implementation  
**Date**: August 2025  
**Project**: Digital Product Catalog for Byggern Retail Chain  
**Platform**: Next.js Web Application (PC-First with Responsive Design)

## 🎯 Executive Summary

Varekatalog is a professional digital product catalog designed for Byggern retail staff, featuring **authentic Byggern brand elements** extracted from the official website. The design prioritizes PC workstation efficiency (1920x1080) with responsive support for tablets and mobile devices.

### Design Philosophy
**"Authentic Byggern Brand Excellence with Desktop-First Efficiency"**

The interface employs official Byggern colors, typography, and design patterns while optimizing for rapid product lookup during customer interactions. The table-based layout maximizes information density and comparison efficiency for professional retail environments.

### Key Success Metrics
- Search response: <1 second
- Initial load: <2 seconds on PC  
- Staff satisfaction: 90%+ responsiveness rating
- Customer service: 25% faster interactions

---

## 🎨 Authentic Byggern Brand System

### Official Color Palette
```css
/* Primary Brand Colors (Extracted from Byggern.no) */
--byggern-primary: #216ba5;        /* Official brand blue */
--byggern-primary-hover: #1d5d90;  /* Hover state */
--byggern-orange: #ff6803;         /* Accent orange */
--byggern-gold: #d4af37;          /* Logo gold */
--byggern-success: #3dcc4a;       /* Success green */
--byggern-header: #2d2d2d;        /* Header background */

/* Supporting Colors */
--byggern-text-primary: #141414;
--byggern-text-secondary: #4d4d4d;
--byggern-border: #aeaeae;
--byggern-background: #ffffff;
```

### Official Typography
```css
/* Primary Fonts (From Byggern Website) */
--font-heading: 'National2', 'Helvetica Neue', helvetica, arial, sans-serif;
--font-body: 'Roboto', Arial, sans-serif;

/* Font Weights & Sizes */
--font-normal: 400;
--font-medium: 500;
--font-bold: 700;
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
```

---

## 🏗️ Interface Design Architecture

### Header Design - Two-Tier Navigation
**Authentic Byggern Structure matching the official website:**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
││ Varekatalog for Løvenskiold Logistikk levert av Byggern                     🔒 │ ← Sub Header (36px)
├─────────────────────────────────────────────────────────────────────────────────┤
│ BYGGER'N-LOGO 🔍 [Søk etter produkter eller kategorier...]                    ☰│ ← Main Header (64px)
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### Header Specifications
- **Background**: `#2d2d2d` (Official header color)
- **Logo**: "BYGGER'N" in gold (`#d4af37`) using National2 font
- **Search**: White input with Norwegian placeholder text
- **Icons**: White with hover states, professional appearance

### Main Interface - Professional Table Layout

```Logged in variant:

┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [Alle leverandører ▼ ] [Alle kategorier ▼ ]                                                                                                       │ ← Quick Filters (36px)
├───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│●│Product Name                        │Supplier    │LH      │ 🔗NOBB    │ Anbr │ # i pakning │ Lagerantall │ Prisenhet │ Grunnpris │ Nettopris │   ← Headers (40px)
├─┼────────────────────────────────────┼────────────┼────────┼──────────┼───────┼──────────────┼──────────────┼─────────┼─────────────┼────────┤
│●│SKRUE TRESKRUE 50MM GALVANISERT     │BILTEMA     │123456  │ 41033994 │ Ja    │ 5            │ 333          │ STK     │ 450,00      │ 562,50 │
│●│BESLAG VINKELBESLAG 90° STÅL        │WÜRTH       │678901  │ 41033995 │ Nei   │ 5            │ 31           │ POS     │ 450,00      │ 562,50 │
│×│LIM MONTERINGSLIM 300ML             │BOSTIK      │111111  │ 41033996 │ Ja    │ 20           │ 590          │ POS     │ 450,00      │ 562,50 │
│●│DRILL SPIRALBOR 8MM HSS             │DEWALT      │222222  │ 41033997 │ Ja    │ 5            │ 12           │ STK     │ 450,00      │ 562,50 │
├─┴────────────────────────────────────┴────────────┴────────┴──────────┴───────┴──────────────┴──────────────┴─────────┴─────────────┴────────┤
│ Showing 1-10 of 1,247 • [◀ Prev] [1][2][3]...[125] [Next ▶]                                                                                 │   ← Pagination
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

```

```Not logged in variant:

┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [Alle leverandører ▼ ] [Alle kategorier ▼ ]                                                                                                       │ ← Quick Filters (36px)
├───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│●│Product Name                        │Supplier    │LH      │ 🔗NOBB    │ Anbr │ # i pakning │ Lagerantall │ Prisenhet │ Grunnpris │ Nettopris │   ← Headers (40px)
├─┼────────────────────────────────────┼────────────┼────────┼──────────┼───────┼──────────────┼──────────────┼─────────┼─────────────┼────────┤
│●│SKRUE TRESKRUE 50MM GALVANISERT     │BILTEMA     │123456  │ 41033994 │ Ja    │ 5            │ ****         │ STK     │ ****        │ ****   │
│●│BESLAG VINKELBESLAG 90° STÅL        │WÜRTH       │678901  │ 41033995 │ Nei   │ 5            │ ****         │ POS     │ ****        │ ****   │
│×│LIM MONTERINGSLIM 300ML             │BOSTIK      │111111  │ 41033996 │ Ja    │ 20           │ ****         │ POS     │ ****        │ ****   │
│●│DRILL SPIRALBOR 8MM HSS             │DEWALT      │222222  │ 41033997 │ Ja    │ 5            │ ****         │ STK     │ ****        │ ****   │
├─┴────────────────────────────────────┴────────────┴────────┴──────────┴───────┴──────────────┴──────────────┴─────────┴─────────────┴────────┤
│ Showing 1-10 of 1,247 • [◀ Prev] [1][2][3]...[125] [Next ▶]                                                                               │   ← Pagination
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

```
### Visual Status Indicators
- **In Stock**: `●` Green circle (Byggern success color)
- **Out of Stock**: `×` Red cross (clear unavailability)

---

## 📱 Responsive Design Strategy

### Breakpoint System
```css
/* Official Byggern responsive breakpoints */
mobile: 0px     → 639px   /* Single column, touch-optimized */
tablet: 640px   → 767px   /* Condensed table, touch targets */
desktop: 768px  → 1919px  /* Full table, mouse/keyboard */
wide: 1920px+             /* Maximum information density */
```

### Device-Specific Optimizations

#### **Desktop (Primary Target - 1920x1080)**
- Full information density with all columns visible
- Keyboard shortcuts and hover states
- Professional appearance for customer-facing use
- Multiple information panels and expanded data display

#### **Tablet (Secondary Target)**
- Collapsible table sections with touch controls
- Maintained functionality with adjusted hierarchy
- Touch-friendly 44px minimum button sizes
- Gesture support for navigation

#### **Mobile (Tertiary Target)**
- Progressive disclosure with essential information first
- Card-based layout replacing table structure
- Touch-optimized interface elements
- Simplified navigation patterns

---

## ♿ Accessibility & Performance Standards

### WCAG AA Compliance
- **Keyboard Navigation**: Full tab order and shortcuts
- **Screen Reader Support**: Semantic HTML and ARIA labels
- **Color Contrast**: 4.5:1 minimum ratio
- **Focus Management**: Visible focus indicators
- **Norwegian Language**: Complete interface localization

### Performance Targets
- **Initial Load**: <2 seconds on store Wi-Fi
- **Search Response**: <1 second for product lookup
- **Offline Capability**: 4-hour functionality without connectivity
- **Concurrent Users**: Support 50 simultaneous users
- **Data Volume**: Handle 100,000+ product catalog

---

## 🔧 Technical Implementation Guidelines

### Tailwind Configuration
```typescript
// tailwind.config.ts - Official Byggern colors
colors: {
  byggern: {
    primary: '#216ba5',
    'primary-hover': '#1d5d90',
    orange: '#ff6803',
    gold: '#d4af37',
    success: '#3dcc4a',
    header: '#2d2d2d',
  }
},
fontFamily: {
  sans: ['National2', 'Helvetica Neue', 'helvetica', 'arial', 'sans-serif'],
  body: ['Roboto', 'Arial', 'sans-serif'],
}
```

### Component Architecture
```
components/
├── layout/
│   ├── Header/              # Authentic Byggern header
│   ├── QuickFilters/        # 36px filter bar
│   └── StatusBar/           # Enhanced status indicators
├── product/
│   ├── ProductTable/        # Professional table layout
│   ├── ProductRow/          # Individual product row
│   └── StockIndicator/      # Visual status system
└── ui/
    ├── Button/              # Byggern-styled buttons
    ├── Input/               # Search and filter inputs
    └── Badge/               # Status and count indicators
```

### Norwegian Language Implementation
- **Search Placeholder**: "Søk etter produkter eller kategorier..."
- **Navigation**: "Butikker", "Privat", "Proff"
- **Status Messages**: "Online", "Kundevisning: AV/PÅ"
- **Actions**: "Vis", "Skjul", "Eksporter"

---

## 🚀 Implementation Success Criteria

### Brand Authenticity ✅
- Official Byggern color palette (#216ba5 vs generic #1E3A5F)
- Authentic "BYGGER'N" logo in brand gold
- Two-tier navigation matching Byggern.no structure
- Professional appearance suitable for retail environment

### Technical Excellence ✅
- TypeScript strict mode compliance
- WCAG AA accessibility standards
- Mobile-first responsive design
- Performance optimized build
- Norwegian character support (æ, ø, å)

### User Experience ✅
- PC-optimized workflows with keyboard shortcuts
- Sub-second search responses
- Clear information hierarchy and progressive disclosure
- Professional credibility through polished visual presentation
- Operational resilience with offline capabilities

---

## 📋 Quality Assurance Checklist

### Visual Compliance
- [ ] Official Byggern colors implemented exactly
- [ ] Authentic typography (National2, Roboto) loaded
- [ ] Logo matches brand standards
- [ ] Norwegian language throughout interface
- [ ] Professional appearance maintained

### Functional Requirements
- [ ] Search functionality with <1 second response
- [ ] NOBB integration for product images and specs
- [ ] Price visibility controls for customer scenarios
- [ ] Partial quantity (Anbrekk) status clearly displayed
- [ ] Responsive behavior across all breakpoints

### Technical Standards
- [ ] WCAG AA accessibility compliance
- [ ] Cross-browser compatibility testing
- [ ] Performance meets Core Web Vitals
- [ ] TypeScript strict mode passes
- [ ] Norwegian character encoding works correctly

---

## 📋 Design Decisions

### Quick Filters Simplification (August 2025)
**Decision**: Removed sort dropdown from Quick Filters section
**Rationale**: Products will be sorted alphabetically by name by default
- Simplifies user interface and reduces cognitive load
- Alphabetical sorting provides predictable and intuitive product ordering
- Eliminates need for users to understand various sort options
- Maintains fast lookup performance for retail staff
- Quick Filters now focus on core filtering: Suppliers, Categories, Stock Status

**Impact**: Quick Filters section reduced from 4 controls to 3 controls, improving visual clarity and reducing decision fatigue.

### Norwegian Localization (August 2025)
**Decision**: Translate all dropdown values to Norwegian language
**Rationale**: Ensures consistent Norwegian language experience for retail staff
- `"All Suppliers"` → `"Alle leverandører"`
- `"All Categories"` → `"Alle kategorier"`  
- `"Stock: All"` → `"Lager: Alle"`
- `"items"` → `"produkter"`

**Impact**: Complete Norwegian language experience aligning with the Norwegian retail market and staff expectations. Maintains professional terminology while ensuring accessibility for all Norwegian-speaking users.

---

**This specification ensures Varekatalog authentically represents the Byggern brand while delivering superior performance for retail staff workflows. The design serves as the authoritative implementation guide for consistent development execution.**

*Implementation completed based on official Byggern website analysis, August 2025*