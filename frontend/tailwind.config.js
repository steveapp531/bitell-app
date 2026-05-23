// tailwind.config.js
// WHY: Tells Tailwind which files to scan for class names.
// The 'content' array prevents unused CSS from shipping to production.
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      // Custom design tokens that match our dark financial dashboard aesthetic
      colors: {
        slate: {
          850: "#172033", // Between slate-800 and slate-900
          950: "#0a0f1e", // Near-black background
        },
        emerald: {
          450: "#2dde98",
        },
      },
      fontFamily: {
        // Use system mono for numbers — crisp and financial-feeling
        mono: ["'IBM Plex Mono'", "monospace"],
        sans: ["'DM Sans'", "sans-serif"],
      },
    },
  },
  plugins: [],
};