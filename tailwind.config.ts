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
          // Official Byggern brand colors from website analysis
          primary: '#216ba5',
          'primary-hover': '#1d5d90',
          orange: '#ff6803',
          gold: '#d4af37',
          yellow: '#FFDC32',  // Authentic Byggern yellow for logo
          success: '#3dcc4a',
          header: '#4D4D4D',  // Updated header background color
          // Legacy colors for backward compatibility
          blue: '#216ba5',
        },
        semantic: {
          success: '#3dcc4a',
          warning: '#ff6803',
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
        // Official Byggern typography stack
        sans: ['National2', 'Helvetica Neue', 'helvetica', 'arial', 'sans-serif'],
        display: ['National2', 'Helvetica Neue', 'helvetica', 'arial', 'sans-serif'],
        body: ['Roboto', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        // Legacy fonts for backward compatibility
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
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
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'none': '0',
        'sm': '0.25rem',
        'DEFAULT': '0.5rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
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