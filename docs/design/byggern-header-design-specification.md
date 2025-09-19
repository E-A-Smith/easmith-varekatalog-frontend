# Byggern Header Design Specification

## Overview

This document provides comprehensive design specifications for the new Byggern-branded header interface, replacing the simple toolbar design with a professional, business-appropriate header that reflects the Byggern brand identity while maintaining optimal functionality for the Varekatalog application.

## Visual Design Analysis

Based on the reference image (`top.png`), the new header design incorporates:

### Primary Visual Elements
- **Brand Identity**: Prominent "BYGGERN" logo in bright yellow/gold typography
- **Professional Aesthetic**: Dark charcoal/gray background for business environment suitability
- **Centered Search Interface**: Large, prominent search bar with Norwegian placeholder text
- **Subtitle Text**: Contextual branding subtitle above the main header
- **Clean Typography**: Professional, readable font hierarchy

## Design System Specifications

### Color Palette

```css
:root {
  /* Byggern Brand Colors - PRIMARY */
  --byggern-gold: #FFD700;           /* BYGGERN logo text */
  --byggern-gold-hover: #E6C200;     /* Logo hover state */
  --byggern-dark-gray: #404040;      /* Header background */
  --byggern-charcoal: #2A2A2A;       /* Deep background variant */
  
  /* Typography Colors */
  --header-text-primary: #FFFFFF;    /* Primary white text */
  --header-text-secondary: #E5E5E5;  /* Secondary gray text */
  --header-text-muted: #B8B8B8;      /* Subtitle text */
  
  /* Search Interface Colors */
  --search-background: #FFFFFF;      /* Search input background */
  --search-border: #D1D5DB;          /* Search input border */
  --search-border-focus: #3B82F6;    /* Search input focus border */
  --search-text: #1F2937;            /* Search input text */
  --search-placeholder: #6B7280;     /* Search placeholder text */
  --search-icon: #6B7280;            /* Search icon color */
  
  /* Interactive States */
  --hover-overlay: rgba(255, 255, 255, 0.1);
  --focus-ring: #3B82F650;
  --active-state: #1F29371A;
}
```

### Typography Hierarchy

```css
/* Header Typography Scale */
.header-logo {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 1.2px;
  color: var(--byggern-gold);
  text-transform: uppercase;
}

.header-subtitle {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: var(--header-text-muted);
  text-align: center;
  line-height: 1.4;
}

.search-input {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 16px;
  font-weight: 400;
  color: var(--search-text);
  line-height: 1.5;
}

.search-placeholder {
  color: var(--search-placeholder);
  font-style: normal;
}
```

### Layout Specifications

#### Header Container
```css
.header-container {
  width: 100%;
  background: linear-gradient(180deg, var(--byggern-dark-gray) 0%, var(--byggern-charcoal) 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-subtitle-bar {
  height: 28px;
  padding: 4px 0;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-main {
  height: 72px;
  padding: 0 32px;
  display: flex;
  align-items: center;
  gap: 32px;
  max-width: 1920px;
  margin: 0 auto;
}
```

#### Logo Section
```css
.header-logo-section {
  flex-shrink: 0;
  width: 180px;
  display: flex;
  align-items: center;
}

.header-logo {
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.header-logo:hover {
  color: var(--byggern-gold-hover);
  transform: scale(1.02);
}

.header-logo:focus {
  outline: 2px solid var(--focus-ring);
  outline-offset: 4px;
  border-radius: 4px;
}
```

#### Search Section
```css
.header-search-section {
  flex: 1;
  max-width: 600px;
  margin: 0 auto;
  position: relative;
}

.search-container {
  position: relative;
  width: 100%;
  background: var(--search-background);
  border: 2px solid var(--search-border);
  border-radius: 8px;
  transition: all 0.2s ease;
  overflow: hidden;
}

.search-container:focus-within {
  border-color: var(--search-border-focus);
  box-shadow: 0 0 0 3px var(--focus-ring);
}

.search-input {
  width: 100%;
  height: 48px;
  padding: 12px 56px 12px 20px;
  border: none;
  outline: none;
  background: transparent;
  color: var(--search-text);
}

.search-input::placeholder {
  color: var(--search-placeholder);
}

.search-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: var(--search-icon);
  pointer-events: none;
}
```

### Component Measurements

#### Dimensional Specifications
```
Total Header Height: 100px (28px subtitle + 72px main header)

Subtitle Bar:
- Height: 28px
- Padding: 4px 0
- Text: 14px, centered

Main Header:
- Height: 72px
- Horizontal Padding: 32px
- Maximum Width: 1920px (centered)

Logo Section:
- Width: 180px (fixed)
- Logo Font Size: 28px
- Letter Spacing: 1.2px

Search Section:
- Maximum Width: 600px
- Height: 48px
- Border Radius: 8px
- Input Padding: 12px 56px 12px 20px
- Icon Size: 20px
- Icon Position: Right 16px

Spacing System:
- Logo to Search Gap: 32px
- Search Icon Padding: 16px
- Focus Ring Offset: 4px
- Focus Ring Width: 2px
```

### Interactive States

#### Logo Interactions
```css
/* Default State */
.header-logo {
  color: var(--byggern-gold);
  transform: scale(1);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover State */
.header-logo:hover {
  color: var(--byggern-gold-hover);
  transform: scale(1.02);
}

/* Focus State */
.header-logo:focus {
  outline: 2px solid var(--focus-ring);
  outline-offset: 4px;
  border-radius: 4px;
}

/* Active State */
.header-logo:active {
  transform: scale(0.98);
  color: var(--byggern-gold);
}
```

#### Search Interactions
```css
/* Default State */
.search-container {
  border-color: var(--search-border);
  box-shadow: none;
}

/* Hover State */
.search-container:hover {
  border-color: #9CA3AF;
}

/* Focus State */
.search-container:focus-within {
  border-color: var(--search-border-focus);
  box-shadow: 0 0 0 3px var(--focus-ring);
}

/* Input States */
.search-input:focus {
  outline: none;
}

.search-input:valid {
  color: var(--search-text);
}

.search-input:invalid {
  color: #EF4444;
}
```

### Responsive Design Adaptations

#### Desktop (1920px+)
```css
@media (min-width: 1920px) {
  .header-main {
    padding: 0 48px;
    gap: 48px;
  }
  
  .header-logo-section {
    width: 220px;
  }
  
  .header-logo {
    font-size: 32px;
  }
  
  .header-search-section {
    max-width: 700px;
  }
}
```

#### Large Laptop (1440px - 1919px)
```css
@media (max-width: 1919px) and (min-width: 1440px) {
  .header-main {
    padding: 0 24px;
    gap: 24px;
  }
  
  .header-logo-section {
    width: 160px;
  }
  
  .header-logo {
    font-size: 26px;
  }
  
  .header-search-section {
    max-width: 500px;
  }
}
```

#### Standard Laptop (1024px - 1439px)
```css
@media (max-width: 1439px) and (min-width: 1024px) {
  .header-main {
    height: 64px;
    padding: 0 16px;
    gap: 16px;
  }
  
  .header-logo-section {
    width: 140px;
  }
  
  .header-logo {
    font-size: 24px;
  }
  
  .search-container {
    height: 44px;
  }
  
  .search-input {
    height: 44px;
    padding: 10px 48px 10px 16px;
    font-size: 15px;
  }
  
  .header-search-section {
    max-width: 400px;
  }
}
```

#### Tablet (768px - 1023px)
```css
@media (max-width: 1023px) and (min-width: 768px) {
  .header-container {
    position: relative; /* Non-sticky on tablet */
  }
  
  .header-main {
    height: 56px;
    padding: 0 16px;
    gap: 12px;
    flex-direction: row;
  }
  
  .header-logo-section {
    width: 120px;
  }
  
  .header-logo {
    font-size: 20px;
    letter-spacing: 1px;
  }
  
  .search-container {
    height: 40px;
    border-radius: 6px;
  }
  
  .search-input {
    height: 40px;
    padding: 8px 44px 8px 14px;
    font-size: 14px;
  }
  
  .search-icon {
    width: 18px;
    height: 18px;
    right: 12px;
  }
}
```

#### Mobile (≤767px)
```css
@media (max-width: 767px) {
  .header-subtitle-bar {
    height: 24px;
    font-size: 12px;
    padding: 2px 8px;
  }
  
  .header-main {
    height: 56px;
    padding: 0 12px;
    gap: 8px;
    flex-direction: column;
    height: auto;
    padding: 12px;
  }
  
  .header-logo-section {
    width: 100%;
    justify-content: center;
    margin-bottom: 8px;
  }
  
  .header-logo {
    font-size: 22px;
  }
  
  .header-search-section {
    width: 100%;
    max-width: none;
  }
  
  .search-container {
    height: 44px;
    border-radius: 22px;
  }
  
  .search-input {
    height: 44px;
    padding: 12px 48px 12px 16px;
    font-size: 16px; /* Prevent zoom on iOS */
  }
}
```

### Accessibility Specifications

#### Keyboard Navigation
```css
/* Focus Management */
.header-logo:focus,
.search-input:focus {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

/* Skip Link Support */
.skip-to-content {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--byggern-dark-gray);
  color: var(--header-text-primary);
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 1001;
}

.skip-to-content:focus {
  top: 6px;
}

/* Screen Reader Support */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

#### ARIA Labels and Roles
```html
<!-- Header Structure with Accessibility -->
<header role="banner" class="header-container">
  <div class="header-subtitle-bar">
    <span class="header-subtitle">Varekatalog for Løvenskiold Logistikk levert av Byggern</span>
  </div>
  
  <div class="header-main">
    <div class="header-logo-section">
      <h1 class="header-logo" tabindex="0" role="button" aria-label="Byggern Varekatalog - Gå til forsiden">
        BYGGERN
      </h1>
    </div>
    
    <div class="header-search-section" role="search">
      <div class="search-container">
        <label for="main-search" class="sr-only">Søk etter produkter eller kategorier</label>
        <input
          id="main-search"
          type="search"
          class="search-input"
          placeholder="Søk etter produkter eller kategorier..."
          aria-label="Søk etter produkter eller kategorier"
          autocomplete="off"
          spellcheck="false"
        />
        <svg class="search-icon" aria-hidden="true" focusable="false">
          <use href="#search-icon"></use>
        </svg>
      </div>
    </div>
  </div>
</header>
```

### Performance Specifications

#### Loading Strategy
```css
/* Critical CSS - Inline in <head> */
.header-container {
  background: #404040;
  height: 100px;
  position: sticky;
  top: 0;
  z-index: 1000;
}

/* Progressive Enhancement */
.header-enhanced {
  background: linear-gradient(180deg, #404040 0%, #2A2A2A 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Lazy-loaded animations */
@media (prefers-reduced-motion: no-preference) {
  .header-logo {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .search-container {
    transition: all 0.2s ease;
  }
}

/* Reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  .header-logo,
  .search-container {
    transition: none;
  }
  
  .header-logo:hover {
    transform: none;
  }
}
```

#### Font Loading Strategy
```css
/* Font Display Strategy */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-var.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}

/* Fallback Typography */
.header-logo {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
}
```

### Implementation Guidelines

#### HTML Structure
```html
<header class="header-container" role="banner">
  <!-- Skip Navigation -->
  <a href="#main-content" class="skip-to-content">Hopp til hovedinnhold</a>
  
  <!-- Subtitle Bar -->
  <div class="header-subtitle-bar">
    <span class="header-subtitle" aria-label="Applikasjonsbeskrivelse">
      Varekatalog for Løvenskiold Logistikk levert av Byggern
    </span>
  </div>
  
  <!-- Main Header -->
  <div class="header-main">
    <!-- Logo Section -->
    <div class="header-logo-section">
      <h1 class="header-logo" 
          tabindex="0" 
          role="button" 
          aria-label="Byggern Varekatalog hjemmeside"
          onclick="window.location.href='/'">
        BYGGERN
      </h1>
    </div>
    
    <!-- Search Section -->
    <div class="header-search-section" role="search">
      <form class="search-form" onsubmit="handleSearch(event)">
        <div class="search-container">
          <label for="global-search" class="sr-only">
            Produktsøk
          </label>
          <input
            id="global-search"
            name="q"
            type="search"
            class="search-input"
            placeholder="Søk etter produkter eller kategorier..."
            aria-label="Søk etter produkter eller kategorier i katalogen"
            aria-describedby="search-help"
            autocomplete="off"
            spellcheck="false"
            required
          />
          <button type="submit" class="search-button" aria-label="Utfør søk">
            <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 21L16.5 16.5M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" 
                    stroke="currentColor" 
                    stroke-width="2" 
                    stroke-linecap="round" 
                    stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div id="search-help" class="sr-only">
          Skriv inn produktnavn, kategori eller leverandør for å søke
        </div>
      </form>
    </div>
  </div>
</header>
```

#### React Component Structure
```typescript
// HeaderComponent.tsx
interface HeaderProps {
  onSearch?: (query: string) => void;
  searchValue?: string;
  isLoading?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onSearch,
  searchValue = '',
  isLoading = false
}) => {
  const [search, setSearch] = useState(searchValue);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(search);
  };
  
  const handleLogoClick = () => {
    window.location.href = '/';
  };
  
  return (
    <header className="header-container" role="banner">
      <a href="#main-content" className="skip-to-content">
        Hopp til hovedinnhold
      </a>
      
      <div className="header-subtitle-bar">
        <span className="header-subtitle">
          Varekatalog for Løvenskiold Logistikk levert av Byggern
        </span>
      </div>
      
      <div className="header-main">
        <div className="header-logo-section">
          <h1 
            className="header-logo"
            tabIndex={0}
            role="button"
            aria-label="Byggern Varekatalog hjemmeside"
            onClick={handleLogoClick}
            onKeyDown={(e) => e.key === 'Enter' && handleLogoClick()}
          >
            BYGGERN
          </h1>
        </div>
        
        <div className="header-search-section" role="search">
          <form className="search-form" onSubmit={handleSubmit}>
            <div className="search-container">
              <label htmlFor="global-search" className="sr-only">
                Produktsøk
              </label>
              <input
                id="global-search"
                name="q"
                type="search"
                className="search-input"
                placeholder="Søk etter produkter eller kategorier..."
                aria-label="Søk etter produkter eller kategorier i katalogen"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={isLoading}
                autoComplete="off"
                spellCheck={false}
                required
              />
              <button 
                type="submit" 
                className="search-button" 
                aria-label="Utfør søk"
                disabled={isLoading}
              >
                <SearchIcon className="search-icon" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </header>
  );
};
```

### Quality Assurance Checklist

#### Visual Design Compliance
- [ ] Byggern gold color (#FFD700) applied to logo
- [ ] Dark gray gradient background implemented
- [ ] Search bar centered with correct dimensions
- [ ] Typography hierarchy matches specification
- [ ] Spacing and padding measurements accurate
- [ ] Norwegian placeholder text implemented

#### Functionality Requirements
- [ ] Logo click navigates to homepage
- [ ] Search form submission works correctly
- [ ] Keyboard navigation functional (Tab, Enter, Escape)
- [ ] Search input has proper focus states
- [ ] Responsive behavior across all breakpoints

#### Accessibility Standards
- [ ] WCAG AA color contrast compliance
- [ ] Screen reader compatible ARIA labels
- [ ] Keyboard navigation support
- [ ] Skip link functionality
- [ ] Proper heading hierarchy (h1 for logo)
- [ ] Form labels properly associated

#### Performance Criteria
- [ ] Critical CSS inlined for above-fold content
- [ ] Font loading strategy implemented
- [ ] Animations respect motion preferences
- [ ] Progressive enhancement applied
- [ ] Loading states implemented

#### Cross-Browser Compatibility
- [ ] Chrome/Chromium (latest 3 versions)
- [ ] Firefox (latest 3 versions)
- [ ] Safari (latest 3 versions)
- [ ] Edge (latest 3 versions)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

This specification provides the complete foundation for implementing the new Byggern-branded header design, ensuring consistency with the reference image while maintaining high standards for accessibility, performance, and user experience.