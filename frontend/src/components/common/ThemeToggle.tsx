import React from "react";
import { useThemeContext } from "../../contexts";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
}

/**
 * Theme toggle button component with smooth transitions
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = "" }) => {
  const { theme, toggleTheme, isDark } = useThemeContext();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative p-2 rounded-lg
        bg-slate-800/50 dark:bg-slate-800/50
        hover:bg-slate-700/50 dark:hover:bg-slate-700/50
        border border-slate-700/50 dark:border-slate-700/50
        transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-sky-500/50
        ${className}
      `}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <div className="relative w-5 h-5">
        {/* Sun icon - visible in dark mode */}
        <Sun
          className={`
            absolute inset-0 w-5 h-5 text-amber-400
            transition-all duration-300 ease-in-out
            ${isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-50"}
          `}
        />
        {/* Moon icon - visible in light mode */}
        <Moon
          className={`
            absolute inset-0 w-5 h-5 text-slate-600
            transition-all duration-300 ease-in-out
            ${isDark ? "opacity-0 -rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"}
          `}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;
