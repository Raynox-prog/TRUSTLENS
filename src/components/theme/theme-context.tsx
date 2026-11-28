"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  THEMES,
  DEFAULT_THEME,
  getThemeById,
  type ThemeOption,
} from "@/lib/theme-config";

interface ThemeContextType {
  theme: ThemeOption;
  setTheme: (themeId: string) => void;
  availableThemes: ThemeOption[];
}

const ThemeContext = createContext<ThemeContextType>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
  availableThemes: THEMES,
});

const STORAGE_KEY = "averon-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setCurrentTheme] = useState<ThemeOption>(DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const found = getThemeById(saved);
        setCurrentTheme(found);
        document.documentElement.setAttribute("data-theme", found.id);
      } else {
        document.documentElement.setAttribute("data-theme", DEFAULT_THEME.id);
      }
    } catch {
      // localStorage unavailable in private mode
    }
  }, []);

  const setTheme = useCallback((themeId: string) => {
    const nextTheme = getThemeById(themeId);
    setCurrentTheme(nextTheme);

    try {
      document.documentElement.setAttribute("data-theme", nextTheme.id);
      localStorage.setItem(STORAGE_KEY, nextTheme.id);

      // Dispatch global event for WebGL shaders and canvas elements to adapt immediately
      window.dispatchEvent(
        new CustomEvent("averon-theme-change", {
          detail: { theme: nextTheme },
        })
      );
    } catch {
      // Safe fallback
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, availableThemes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  return context;
}
