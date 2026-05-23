// postcss.config.js
// WHY: Vite uses PostCSS to process CSS. Tailwind requires
// this plugin chain to generate utility classes from your source files.
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};