/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-primary)',
        surface: 'var(--bg-secondary)',
        'surface-2': 'var(--bg-tertiary)',
        border: 'var(--border-subtle)',
        'border-strong': 'var(--border-strong)',
        primary: 'var(--accent-blue)',
        success: 'var(--accent-green)',
        danger: 'var(--accent-red)',
        warning: 'var(--accent-amber)',
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        }
      }
    },
  },
  plugins: [],
}
