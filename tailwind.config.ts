import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#1a1208",
        surface: "#231a0a",
        surface2: "#2d2210",
        border: "#3d2e14",
        brown: { DEFAULT: "#613910", light: "#7a4a1a", dark: "#4a2a08" },
        olive: { DEFAULT: "#a8ba41", dark: "#8a9a32", dim: "#a8ba4115" },
        cream: "#ecedf1",
        muted: "#9a8a6a",
        up: "#a8ba41",
        down: "#e05a3a",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
