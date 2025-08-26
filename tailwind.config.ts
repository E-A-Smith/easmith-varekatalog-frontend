import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        byggern: {
          // Byggern Brand Colors (from globals.css - source of truth)
          blue: '#1E3A5F',
          orange: '#FF6B35',
          // Legacy aliases for backward compatibility
          primary: '#1E3A5F',
          'primary-hover': '#1a3250',  // Darker variant for hover
          gold: '#d4af37',  // Keep existing gold
          yellow: '#FFDC32', // Keep existing yellow 
          success: '#28A745', // From globals.css semantic colors
          header: '#4D4D4D',  // Keep existing header color
        },
        semantic: {
          success: '#28A745',
          warning: '#FFC107',
          error: '#DC3545',
          info: '#17A2B8',
        },
        neutral: {
          50: '#F8F9FA',
          100: '#E9ECEF',
          200: '#DEE2E6',
          300: '#CED4DA',
          400: '#ADB5BD',
          500: '#6C757D',
          600: '#495057',
          700: '#343A40',
          800: '#212529',
          900: '#161719',
        },
      },
      fontFamily: {
        // Primary font from globals.css (Inter as default)
        sans: ['Inter', 'system-ui', 'sans-serif'],
        // Byggern brand typography stack (for special cases)
        display: ['National2', 'Helvetica Neue', 'helvetica', 'arial', 'sans-serif'],
        body: ['Roboto', 'Arial', 'sans-serif'],  
        mono: ['JetBrains Mono', 'monospace'],
        // Keep compatibility aliases
        inter: ['Inter', 'system-ui', 'sans-serif'],
        byggern: ['National2', 'Helvetica Neue', 'helvetica', 'arial', 'sans-serif'],
      },
      fontSize: {
        // Typography Scale from globals.css (source of truth)
        'xs': '0.75rem',    // 12px
        'sm': '0.875rem',   // 14px  
        'base': '1rem',     // 16px
        'lg': '1.125rem',   // 18px
        'xl': '1.25rem',    // 20px
        '2xl': '1.5rem',    // 24px
        '3xl': '1.875rem',  // 30px
        '4xl': '2.25rem',   // 36px
        // Additional display sizes (preserve existing)
        'display-xl': ['2.25rem', { lineHeight: '2.5rem', fontWeight: '700' }],
        'display-lg': ['2rem', { lineHeight: '2.25rem', fontWeight: '700' }],
        'display-md': ['1.75rem', { lineHeight: '2rem', fontWeight: '600' }],
      },
      screens: {
        'mobile': '375px',
        'tablet': '768px',
        'tablet-lg': '1024px',
        'desktop': '1366px',
        'desktop-hd': '1920px',
      },
      spacing: {
        // Standard Tailwind spacing is preserved
        // Additional custom spacing from globals.css design tokens
        'xs': '0.25rem',    // 4px
        'sm': '0.5rem',     // 8px 
        'md': '1rem',       // 16px
        'lg': '1.5rem',     // 24px
        'xl': '2rem',       // 32px
        '2xl': '3rem',      // 48px
        '3xl': '4rem',      // 64px
        // Keep existing custom spacing
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        // Border Radius from globals.css (source of truth) 
        'sm': '0.25rem',    // 4px
        'md': '0.5rem',     // 8px  
        'lg': '0.75rem',    // 12px
        'xl': '1rem',       // 16px
        // Tailwind defaults
        'none': '0',
        'DEFAULT': '0.5rem',
      },
      boxShadow: {
        'soft': '0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        'medium': '0 4px 8px 0 rgba(0, 0, 0, 0.1)',
        'strong': '0 8px 16px 0 rgba(0, 0, 0, 0.15)',
      },
      zIndex: {
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
      },
    },
  },
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('@tailwindcss/forms'),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('@tailwindcss/typography'),
  ],
};

export default config;