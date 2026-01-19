"use client";

import React from "react";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <select
            value={theme}
            onChange={(e) =>
                setTheme(e.target.value as "light" | "dark" | "system")
            }
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border transition-colors bg-white dark:bg-[rgb(30,30,30)] border-gray-300 dark:border-[rgb(50,50,50)] hover:bg-gray-100 dark:hover:bg-[rgb(40,40,40)] text-gray-700 dark:text-gray-200 cursor-pointer"
            title="Select theme"
        >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
        </select>
    );
}
