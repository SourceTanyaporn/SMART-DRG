import { createContext, useContext, useEffect, useState } from "react";

export const COLOR_THEMES = [
    {
        id: "blue",
        name: "Royal Blue",
        thaiName: "น้ำเงินรอยัล (เริ่มต้น)",
        color: "#4b52e8",
        accent: "#737bf5",
        bgLight: "#e0e4ffff",
        darkColor: "#6366f1",
    },
    {
        id: "violet",
        name: "Royal Purple",
        thaiName: "ม่วงรอยัล",
        color: "#7c3aed",
        accent: "#a855f7",
        bgLight: "#f5f3ff",
        darkColor: "#c084fc",
    },
    {
        id: "emerald",
        name: "Emerald Green",
        thaiName: "เขียวมรกต",
        color: "#059669",
        accent: "#10b981",
        bgLight: "#ecfdf5",
        darkColor: "#34d399",
    },
    {
        id: "rose",
        name: "Ruby Rose",
        thaiName: "แดงทับทิม",
        color: "#e11d48",
        accent: "#f43f5e",
        bgLight: "#fff1f2",
        darkColor: "#fb7185",
    },
    {
        id: "amber",
        name: "Sunset Amber",
        thaiName: "ส้มอำพัน",
        color: "#d97706",
        accent: "#f59e0b",
        bgLight: "#fffbeb",
        darkColor: "#fbbf24",
    },
    {
        id: "indigo",
        name: "Classic Indigo",
        thaiName: "อินดิโก้คลาสสิก",
        color: "#2563eb",
        accent: "#3b82f6",
        bgLight: "#eff6ff",
        darkColor: "#60a5fa",
    },
    {
        id: "cyan",
        name: "Medical Cyan",
        thaiName: "ฟ้าเมดิคอล",
        color: "#0891b2",
        accent: "#06b6d4",
        bgLight: "#ecfeff",
        darkColor: "#22d3ee",
    },
    {
        id: "pink",
        name: "Blossom Pink",
        thaiName: "ชมพูซากุระ",
        color: "#ec4899",
        accent: "#f472b6",
        bgLight: "#fdf2f8",
        darkColor: "#f472b6",
    },

];

const ThemeContext = createContext({
    mode: "light",
    setMode: () => { },
    colorTheme: "blue",
    setColorTheme: () => { },
    isDark: false,
    toggleMode: () => { },
});

export function ThemeProvider({ children }) {
    const [mode, setMode] = useState(() => {
        try {
            return localStorage.getItem("smart_drg_theme_mode") || "light";
        } catch {
            return "light";
        }
    });

    const [colorTheme, setColorTheme] = useState(() => {
        try {
            return localStorage.getItem("smart_drg_color_theme") || "blue";
        } catch {
            return "blue";
        }
    });

    const [isSystemDark, setIsSystemDark] = useState(() => {
        if (typeof window === "undefined") return false;
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    });

    // Listen to system OS theme changes
    useEffect(() => {
        if (typeof window === "undefined") return;
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e) => setIsSystemDark(e.matches);

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    const isDark = mode === "dark" || (mode === "system" && isSystemDark);

    // Sync HTML class & data-theme attributes
    useEffect(() => {
        const root = document.documentElement;

        // Toggle dark class
        if (isDark) {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }

        // Set data-theme attribute for CSS variable overrides
        root.setAttribute("data-theme", colorTheme);

        // Persist preferences
        try {
            localStorage.setItem("smart_drg_theme_mode", mode);
            localStorage.setItem("smart_drg_color_theme", colorTheme);
        } catch (e) {
            console.error("Failed to save theme settings", e);
        }
    }, [mode, isDark, colorTheme]);

    const toggleMode = () => {
        setMode((prev) => (prev === "dark" ? "light" : "dark"));
    };

    return (
        <ThemeContext.Provider
            value={{
                mode,
                setMode,
                colorTheme,
                setColorTheme,
                isDark,
                toggleMode,
                colorThemes: COLOR_THEMES,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
