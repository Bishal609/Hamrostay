// client/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  "#fefdf0",
          100: "#fdf8d0",
          200: "#faf0a0",
          300: "#f5e060",
          400: "#edc830",
          500: "#D4AF37",
          600: "#b8920d",
          700: "#93720a",
          800: "#775a0e",
          900: "#644b11",
          950: "#3a2904",
        },
        dark: {
          50:  "#f6f6f6",
          100: "#e7e7e7",
          200: "#d1d1d1",
          300: "#b0b0b0",
          400: "#888888",
          500: "#6d6d6d",
          600: "#5d5d5d",
          700: "#4f4f4f",
          800: "#454545",
          900: "#3d3d3d",
          950: "#0a0a0a",
        },
      },
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        body:    ["'DM Sans'", "system-ui", "sans-serif"],
        mono:    ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #D4AF37 0%, #f5e060 50%, #b8920d 100%)",
        "dark-gradient": "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)",
        "hero-pattern":  "radial-gradient(ellipse at top, #1a1510 0%, #0a0a0a 70%)",
      },
      boxShadow: {
        gold:   "0 4px 24px rgba(212, 175, 55, 0.25)",
        "gold-lg": "0 8px 40px rgba(212, 175, 55, 0.35)",
        card:   "0 2px 16px rgba(0,0,0,0.4)",
        "card-hover": "0 8px 32px rgba(0,0,0,0.6)",
      },
      animation: {
        "fade-in":    "fadeIn 0.5s ease forwards",
        "slide-up":   "slideUp 0.4s ease forwards",
        "slide-down": "slideDown 0.3s ease forwards",
        "shimmer":    "shimmer 1.5s infinite",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:   { from: { opacity: 0, transform: "translateY(20px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        slideDown: { from: { opacity: 0, transform: "translateY(-10px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        shimmer:   { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        pulseGold: { "0%, 100%": { boxShadow: "0 0 0 0 rgba(212,175,55,0.4)" }, "50%": { boxShadow: "0 0 0 8px rgba(212,175,55,0)" } },
      },
    },
  },
  plugins: [],
};
