import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ground: { DEFAULT: "var(--ground)", 2: "var(--ground-2)", 3: "var(--ground-3)" },
        rule: { DEFAULT: "var(--rule)", strong: "var(--rule-strong)" },
        ink: { DEFAULT: "var(--ink)", 2: "var(--ink-2)", 3: "var(--ink-3)" },
        band: { DEFAULT: "var(--band)", ink: "var(--band-ink)", ink2: "var(--band-ink-2)" },
        selected: { DEFAULT: "var(--selected)", ink: "var(--selected-ink)" },
        up: { DEFAULT: "var(--up)", fill: "var(--up-fill)", wash: "var(--up-wash)" },
        down: { DEFAULT: "var(--down)", fill: "var(--down-fill)", wash: "var(--down-wash)" },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
