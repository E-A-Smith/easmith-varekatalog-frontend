# Authentic Byggern Brand Guidelines for Varekatalog

## Overview

This document contains the official brand specifications extracted from https://www.byggern.no/ to ensure the Varekatalog interface maintains authentic Byggern brand consistency.

## 🎨 Official Color Palette

### Primary Colors
```css
/* Primary Byggern Yellow - Official brand color */
--byggern-yellow: #FFDC32;
--byggern-yellow-focus: rgb(249 222 75 / 60%);

/* Header Background - Official gray from website */
--byggern-header-bg: #4D4D4D; /* var(--bygg-colors-gray-600) */

/* Text Colors */
--byggern-text-primary: #141414;
--byggern-text-secondary: #4D4D4D;
--byggern-text-muted: #737373;
```

### Secondary Colors
```css
/* Accent Colors from Byggern website */
--byggern-blue: #3182CE;
--byggern-green: #598925;
--byggern-red: #D22D2D;

/* Gray Scale */
--byggern-gray-50: #F2F2F2;
--byggern-gray-100: #E6E6E6;
--byggern-gray-200: #CCCCCC;
--byggern-gray-300: #B3B3B3;
--byggern-gray-400: #999999;
--byggern-gray-500: #808080;
--byggern-gray-600: #4D4D4D;
--byggern-gray-700: #333333;
--byggern-gray-800: #1A1A1A;
--byggern-gray-900: #141414;
```

## 📝 Official Typography System

### Font Families
```css
/* Primary heading font from Byggern website */
--byggern-font-heading: 'National 2', -apple-system, BlinkMacSystemFont, sans-serif;

/* Body text font from Byggern website */
--byggern-font-body: 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
```

### Font Specifications
```css
/* Font weights available */
--byggern-font-hairline: 100;
--byggern-font-thin: 200;
--byggern-font-light: 300;
--byggern-font-normal: 400;
--byggern-font-medium: 500;
--byggern-font-semibold: 600;
--byggern-font-bold: 700;
--byggern-font-extrabold: 800;
--byggern-font-black: 900;

/* Font sizes */
--byggern-text-xs: 0.75rem;    /* 12px */
--byggern-text-sm: 0.875rem;   /* 14px */
--byggern-text-base: 1rem;     /* 16px */
--byggern-text-lg: 1.125rem;   /* 18px */
--byggern-text-xl: 1.25rem;    /* 20px */
--byggern-text-2xl: 1.5rem;    /* 24px */
--byggern-text-3xl: 1.875rem;  /* 30px */
--byggern-text-4xl: 2.25rem;   /* 36px */
```

## 🏗️ Header Design Specifications

### Official Byggern Header Structure
```css
.byggern-header {
  background-color: var(--byggern-header-bg);
  position: sticky;
  top: 0;
  z-index: 1000;
  height: 56px; /* Official header height */
}

.byggern-logo {
  width: 130px; /* Mobile */
  width: 200px; /* Desktop */
  color: var(--byggern-yellow);
  font-family: var(--byggern-font-heading);
  font-weight: var(--byggern-font-bold);
}

.byggern-search {
  height: 56px;
  border: none;
  border-bottom: 1px solid var(--byggern-gray-400);
  background: transparent;
  font-family: var(--byggern-font-body);
  color: var(--byggern-text-primary);
  placeholder-color: var(--byggern-text-muted);
}

.byggern-search:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--byggern-yellow-focus);
}
```

### Interactive Elements
```css
.byggern-nav-button {
  font-family: var(--byggern-font-body);
  font-size: var(--byggern-text-sm);
  color: white;
  background: transparent;
  border: none;
  padding: 0.5rem 1rem;
  transition: all 150ms ease;
}

.byggern-nav-button:hover {
  text-decoration: underline;
  color: var(--byggern-yellow);
}

.byggern-nav-button:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--byggern-yellow-focus);
}
```

## 📱 Responsive Design Specifications

### Breakpoints (matching Byggern website)
```css
/* Mobile first approach */
.mobile: 0px;
.tablet: 768px;
.desktop: 1024px;
.wide: 1280px;
```

### Header Responsive Behavior
```css
/* Mobile (0-767px) */
@media (max-width: 767px) {
  .byggern-header {
    padding: 0 1rem;
  }
  
  .byggern-logo {
    width: 130px;
    font-size: 1.5rem;
  }
  
  .byggern-search {
    width: 100%;
    max-width: 300px;
  }
}

/* Desktop (768px+) */
@media (min-width: 768px) {
  .byggern-header {
    padding: 0 2rem;
  }
  
  .byggern-logo {
    width: 200px;
    font-size: 2rem;
  }
  
  .byggern-search {
    width: 400px;
    max-width: 600px;
  }
}
```

## 🎯 Updated Main Dashboard Interface

### New ASCII Wireframe with Authentic Byggern Design
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Varekatalog for Løvenskiold Logistikk levert av Byggern                        │ ← Sub Header (36px)
├─────────────────────────────────────────────────────────────────────────────────┤
│ BYGGER'N-LOGO 🔍 [Søk etter produkter eller kategorier...]                     │ ← Header (56px, #4D4D4D bg)
├─────────────────────────────────────────────────────────────────────────────────┤
│ ⚡ [All Suppliers▼] [All Categories▼] [Stock: All▼] [Sort: Name▼] │ 1,247 items │ ← Quick Filters (36px)
├─────────────────────────────────────────────────────────────────────────────────┤
│                          PRODUCT CATALOG TABLE                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│●│Product Name                        │Supplier    │SKU     │Anbr│Price  │🔗NOBB│ ← Table Headers (40px)
├─┼────────────────────────────────────┼────────────┼────────┼────┼───────┼──────┤
│●│SKRUE TRESKRUE 50MM GALVANISERT    │BILTEMA     │12345   │ Ja │[Show] │ View │ ← 10-12 visible rows
│●│BESLAG VINKELBESLAG 90° STÅL       │WÜRTH       │67890   │ Nei│[Hide] │ View │   (Efficient scanning)
│×│LIM MONTERINGSLIM 300ML            │BOSTIK      │11111   │ Ja │ N/A   │ View │
│●│DRILL SPIRALBOR 8MM HSS            │DEWALT      │22222   │ Ja │[Show] │ View │
│●│SKRUE GIPSSKRUE 25MM               │ESSVE       │33333   │ Nei│[Show] │ View │
│●│MALING VEGMALING HVIT 1L           │FLÜGGER     │44444   │ Ja │[Hide] │ View │
│●│ISOLASJON STEINULL 100MM           │GLAVA       │55555   │ Nei│[Show] │ View │
│×│VINDUER TOPPSVING 60X90            │RATIONEL    │66666   │ Nei│ N/A   │ View │
│●│VERKTØY SKRUTREKKER PH2            │STANLEY     │77777   │ Ja │[Show] │ View │
│●│MUTTER SEKSKANT M8 GALVANISERT     │ESSVE       │88888   │ Nei│[Show] │ View │
├─┴────────────────────────────────────┴────────────┴────────┴────┴───────┴──────┤
│ Showing 1-10 of 1,247 products • [◀ Prev] [1][2][3]...[125] [Next ▶] • Export │ ← Pagination
├─────────────────────┬───────────────────────────────────────────────────────────┤
│ 🌐 Online • Last sync: 14:30 • Response: 0.3s • Kundevisning: AV             │ ← Enhanced Status Bar
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🛠️ Implementation Guidelines

### HTML Structure
```html
<header class="byggern-header">
  <div class="container mx-auto flex items-center justify-between">
    <!-- Logo -->
    <div class="byggern-logo">
      BYGGER'N
    </div>
    
    <!-- Search -->
    <div class="flex-1 max-w-2xl mx-8">
      <input 
        type="search" 
        class="byggern-search w-full" 
        placeholder="Søk etter produkter eller kategorier..."
      />
    </div>
    
    <!-- Navigation -->
    <nav class="flex items-center gap-4">
      <button class="byggern-nav-button">🛒</button>
      <button class="byggern-nav-button">👤</button>
    </nav>
  </div>
</header>
```

### Tailwind Configuration
```typescript
// tailwind.config.ts additions
module.exports = {
  theme: {
    extend: {
      colors: {
        'byggern-yellow': '#FFDC32',
        'byggern-header': '#4D4D4D',
        'byggern-blue': '#3182CE',
        'byggern-green': '#598925',
        'byggern-red': '#D22D2D',
      },
      fontFamily: {
        'byggern-heading': ['National 2', 'sans-serif'],
        'byggern-body': ['Roboto', 'sans-serif'],
      }
    }
  }
}
```

## ♿ Accessibility Standards

### WCAG AA Compliance
- **Keyboard Navigation**: All interactive elements accessible via Tab key
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Minimum 4.5:1 ratio for normal text, 3:1 for large text
- **Focus Indicators**: Yellow outline matching brand color

### Norwegian Language Support
- **Placeholder Text**: "Søk etter produkter eller kategorier..."
- **Navigation Labels**: Norwegian terminology throughout
- **Character Support**: Full Norwegian alphabet (æ, ø, å)

## 🎨 Brand Voice

### Byggern Brand Characteristics
- **Professional**: Clean, functional design
- **Accessible**: User-friendly for all skill levels
- **Norwegian**: Local language and cultural context
- **Reliable**: Consistent, trustworthy interface
- **Efficient**: Task-focused, minimal distractions

This authentic brand guideline ensures the Varekatalog maintains perfect consistency with the official Byggern website while providing an excellent user experience for the digital product catalog.