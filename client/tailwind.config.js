/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'apple-blue': '#0071e3',
        'apple-dark': '#1d1d1f',
        'apple-light-gray': '#f5f5f7',
        'dark-surface-1': '#272729',
        'dark-surface-2': '#262628',
        'dark-surface-3': '#28282a',
        'dark-surface-4': '#2a2a2d',
      },
      fontFamily: {
        'sf-pro-display': ['SF Pro Display', 'SF Pro Icons', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        'sf-pro-text': ['SF Pro Text', 'SF Pro Icons', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      letterSpacing: {
        'tight-hero': '-0.28px',
        'tight-body': '-0.374px',
        'tight-caption': '-0.224px',
        'tight-micro': '-0.12px',
      },
      lineHeight: {
        'tight-hero': '1.07',
        'tight': '1.14',
      },
    },
  },
  plugins: [],
}
