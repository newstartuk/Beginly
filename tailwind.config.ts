import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-mist)",
        surface: "var(--color-surface)",
        card: "var(--color-surface)",
        border: "var(--color-border)",
        muted: "var(--color-muted)",
        primary: "var(--color-teal)",
        teal: {
          DEFAULT: "var(--color-teal)",
          dark: "var(--color-teal-dark)",
          light: "var(--color-teal-light)",
          50: "var(--color-teal-50)",
          100: "var(--color-teal-100)",
        },
        navy: {
          DEFAULT: "var(--color-navy)",
          dark: "var(--color-navy-dark)",
          light: "var(--color-navy-light)",
        },
        green: {
          DEFAULT: "var(--color-green)",
          50: "var(--color-green-light)",
          100: "var(--color-green-bg)",
        },
        amber: {
          DEFAULT: "var(--color-amber)",
          50: "var(--color-amber-light)",
          100: "var(--color-amber-bg)",
        },
        danger: "var(--color-red)",
        red: {
          DEFAULT: "var(--color-red)",
          50: "var(--color-red-light)",
          100: "var(--color-red-bg)",
        },
        violet: {
          DEFAULT: "var(--color-violet)",
          light: "var(--color-violet-light)",
        },
        purple: {
          DEFAULT: "var(--color-purple)",
          50: "var(--color-purple-light)",
          100: "var(--color-purple-bg)",
        },
        blue: {
          DEFAULT: "var(--color-blue)",
          50: "var(--color-blue-light)",
          100: "var(--color-blue-bg)",
        },
        civic: {
          50: "var(--color-civic-50)",
          100: "var(--color-civic-100)",
          200: "var(--color-civic-200)",
          300: "#94A3B8",
          500: "#64748B",
          600: "var(--color-civic-600)",
          700: "var(--color-civic-700)",
          800: "var(--color-civic-800)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        card: "var(--shadow-card)",
      },
    },
  },
  plugins: [],
};

export default config;
