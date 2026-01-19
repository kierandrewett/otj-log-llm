"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("system");
    const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(
        "light",
    );

    useEffect(() => {
        // Load theme from localStorage
        const stored = localStorage.getItem("theme") as Theme | null;
        if (stored) {
            setThemeState(stored);
        }
    }, []);

    useEffect(() => {
        const root = document.documentElement;

        const updateTheme = () => {
            if (theme === "system") {
                const systemTheme = window.matchMedia(
                    "(prefers-color-scheme: dark)",
                ).matches
                    ? "dark"
                    : "light";
                root.style.colorScheme = systemTheme;
                if (systemTheme === "dark") {
                    root.classList.add("dark");
                } else {
                    root.classList.remove("dark");
                }
                setResolvedTheme(systemTheme);
            } else {
                root.style.colorScheme = theme;
                if (theme === "dark") {
                    root.classList.add("dark");
                } else {
                    root.classList.remove("dark");
                }
                setResolvedTheme(theme);
            }
        };

        updateTheme();

        // Listen for system theme changes
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => {
            if (theme === "system") {
                updateTheme();
            }
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem("theme", newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within ThemeProvider");
    }
    return context;
}
