/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.html",
    "./public/**/*.js",
    "./public/*.html",
    "./public/*.js"
  ],
  theme: {
    extend: {
      colors: {
        finSlate: 'var(--color-fin-slate)',
        finEmerald: 'var(--color-fin-emerald)',
        finBg: 'var(--color-fin-bg)',
        finGlass: 'var(--color-fin-glass)',
        finBorder: 'var(--color-fin-border)',
        
        // Premium Stitch Colors
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        'secondary-container': 'var(--color-secondary-container)',
        'on-secondary-container': 'var(--color-secondary)',
        'surface-container-lowest': 'var(--color-card-bg)',
        'surface-container-low': 'var(--color-surface-container-low)',
        'surface-container': 'var(--color-surface-container-low)',
        'surface-container-high': 'var(--color-surface-container-low)',
        'surface-container-highest': 'var(--color-surface-container-low)',
        'surface-bright': 'var(--color-fin-bg)',
        'on-surface': 'var(--color-text-slate-800)',
        'on-surface-variant': 'var(--color-text-slate-800)',
        outline: 'var(--color-fin-border)',
        'outline-variant': 'var(--color-fin-border)',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',
        error: '#ba1a1a',
      },
      fontFamily: {
        sans: ['"Inter"', '"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      borderRadius: {
        'fin': '12px',
        'xl': '12px',
        '2xl': '16px',
      }
    },
  },
  plugins: [],
}
