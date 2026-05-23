/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2B3497',
        'primary-dark': '#1e2470',
        secondary: '#4BBFA0',
        'secondary-dark': '#3aaa8d',
        danger: '#ec6062',
        surface: '#f5f5f4',
        border: 'rgba(43, 52, 151, 0.12)',
        'text-primary': '#1a1a2e',
        'text-muted': 'rgba(26, 26, 46, 0.55)',
      },
      fontFamily: {
        heading: ['Montserrat', 'Poppins', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      fontSize: {
        display: '36px',
        h1: '26px',
        h2: '20px',
        h3: '16px',
        body: '14px',
        small: '11px',
      },
      spacing: {
        xs: '8px',
        sm: '16px',
        md: '24px',
        lg: '32px',
        xl: '48px',
      },
      borderRadius: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        full: '999px',
      },
      boxShadow: {
        sm: '0 1px 4px rgba(43, 52, 151, 0.08)',
        md: '0 4px 16px rgba(43, 52, 151, 0.12)',
        lg: '0 8px 32px rgba(43, 52, 151, 0.16)',
        xl: '0 16px 48px rgba(43, 52, 151, 0.20)',
      },
    },
  },
  plugins: [],
};
