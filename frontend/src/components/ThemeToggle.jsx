import React from "react";
import { Sun, Moon } from "@phosphor-icons/react";
import { useTheme } from "../contexts/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      data-testid="theme-toggle"
      className="w-9 h-9 rounded-full flex items-center justify-center border border-white/10 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:bg-cyan-500/15 transition-colors"
    >
      {theme === "dark" ? <Sun weight="duotone" size={18} /> : <Moon weight="duotone" size={18} />}
    </button>
  );
}
