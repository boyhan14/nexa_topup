"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle group"
      aria-label={isLight ? "Aktifkan mode gelap" : "Aktifkan mode cerah"}
      title={isLight ? "Mode gelap" : "Mode cerah"}
    >
      <span className="theme-toggle-track">
        <Sun
          size={12}
          className={`theme-toggle-icon theme-toggle-sun ${
            isLight ? "text-amber-500 opacity-100" : "text-slate-500 opacity-40"
          }`}
        />
        <Moon
          size={12}
          className={`theme-toggle-icon theme-toggle-moon ${
            !isLight ? "text-cyan-300 opacity-100" : "text-slate-400 opacity-40"
          }`}
        />
        <span
          className={`theme-toggle-knob ${
            isLight ? "translate-x-[22px]" : "translate-x-[2px]"
          }`}
        />
      </span>
    </button>
  );
}
