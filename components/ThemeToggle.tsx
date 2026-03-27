"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  // Read saved preference on mount
  useEffect(() => {
    const saved = localStorage.getItem("lb-theme");
    const dark = saved !== "light";
    setIsDark(dark);
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    const theme = next ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("lb-theme", theme);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        flexShrink: 0,
        width: 44,
        height: 24,
        borderRadius: 999,
        border: "1px solid var(--olive)",
        background: isDark ? "var(--brown)" : "var(--surface2)",
        cursor: "pointer",
        padding: 0,
        transition: "background 0.25s",
        zIndex: 10,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 2,
          left: isDark ? 2 : 22,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "var(--olive)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10,
          pointerEvents: "none",
          transition: "left 0.25s ease",
          userSelect: "none",
        }}
      >
        {isDark ? "🌙" : "☀️"}
      </span>
    </button>
  );
}
