import { useState, useRef, useEffect } from "react";
import {
    Sun,
    Moon,
    Laptop,
    Palette,
    Check,
    ChevronDown,
    Sparkles,
} from "lucide-react";
import { useTheme } from "@/context/theme-context";

export function ThemeSwitcher({ className = "", compact = false }) {
    const { mode, setMode, colorTheme, setColorTheme, isDark, toggleMode, colorThemes } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const activeThemeObj = colorThemes.find((c) => c.id === colorTheme) || colorThemes[0];

    return (
        <div ref={dropdownRef} className={`relative inline-flex items-center gap-1.5 ${className}`}>
            {/* Quick Dark/Light Toggle Button */}
            <button
                type="button"
                onClick={toggleMode}
                className="cursor-pointer relative flex size-8 sm:size-8.5 items-center justify-center rounded-lg border border-border bg-card text-foreground hover:bg-muted transition shadow-2xs"
                title={isDark ? "สลับเป็นโหมดสว่าง (Light Mode)" : "สลับเป็นโหมดมืด (Dark Mode)"}
            >
                {isDark ? (
                    <Sun size={15} className="text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
                ) : (
                    <Moon size={15} className="text-slate-600 transition-transform duration-300 rotate-0 hover:-rotate-12" />
                )}
            </button>

            {/* Color Palette & Settings Dropdown Trigger */}
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="cursor-pointer flex h-8 sm:h-8.5 items-center gap-1.5 rounded-lg border border-border bg-card px-2 sm:px-2.5 text-xs font-semibold text-foreground hover:bg-muted transition shadow-2xs"
                title="เลือกโทนสีและโหมดการแสดงผล"
            >
                {/* Active Color Dot */}
                <span
                    className="size-3.5 rounded-full shadow-2xs shrink-0 ring-1 ring-black/10"
                    style={{
                        backgroundColor: isDark ? (activeThemeObj.darkColor || activeThemeObj.color) : activeThemeObj.color,
                    }}
                />
                {!compact && (
                    <span className="hidden sm:inline-block text-[11.5px] font-medium text-foreground truncate max-w-[80px]">
                        {activeThemeObj.name}
                    </span>
                )}
                <ChevronDown size={12} className={`text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Popover */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-1.5 z-50 w-72 rounded-2xl border border-border bg-card p-3 shadow-xl animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto scrollbar-thin">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-border pb-2 mb-2.5">
                        <div className="flex items-center gap-1.5 text-foreground font-bold text-xs">
                            <Palette size={14} className="text-primary" />
                            <span>ปรับแต่งธีม & โทนสี</span>
                        </div>
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Theme Settings
                        </span>
                    </div>

                    {/* Mode Selector (Light / Dark / System) */}
                    <div className="mb-3">
                        <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">
                            โหมดการแสดงผล
                        </p>
                        <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
                            <button
                                type="button"
                                onClick={() => setMode("light")}
                                className={`cursor-pointer flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-semibold transition ${mode === "light"
                                    ? "bg-card text-foreground shadow-2xs font-bold"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <Sun size={12} className={mode === "light" ? "text-amber-500" : ""} />
                                <span>สว่าง</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setMode("dark")}
                                className={`cursor-pointer flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-semibold transition ${mode === "dark"
                                    ? "bg-card text-foreground shadow-2xs font-bold"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <Moon size={12} className={mode === "dark" ? "text-indigo-400" : ""} />
                                <span>มืด</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setMode("system")}
                                className={`cursor-pointer flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-semibold transition ${mode === "system"
                                    ? "bg-card text-foreground shadow-2xs font-bold"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <Laptop size={12} />
                                <span>ตามระบบ</span>
                            </button>
                        </div>
                    </div>

                    {/* Solid Colors Grid */}
                    <div>
                        <div className="grid grid-cols-2 gap-1.5">
                            {colorThemes.map((c) => {
                                const isSelected = colorTheme === c.id;
                                const displayColor = isDark ? (c.darkColor || c.color) : c.color;

                                return (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => {
                                            setColorTheme(c.id);
                                        }}
                                        className={`cursor-pointer flex items-center justify-between rounded-xl border px-2.5 py-1.5 text-left transition ${isSelected
                                            ? "border-primary bg-primary/10 shadow-2xs ring-1 ring-primary/20"
                                            : "border-border bg-card/50 hover:bg-muted hover:border-border/80"
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span
                                                className="size-3.5 rounded-full shrink-0 shadow-2xs ring-1 ring-black/10"
                                                style={{ backgroundColor: displayColor }}
                                            />
                                            <div className="min-w-0">
                                                <p className="text-[11px] font-semibold text-foreground truncate">
                                                    {c.name}
                                                </p>
                                            </div>
                                        </div>

                                        {isSelected && (
                                            <Check size={12} className="text-primary shrink-0 ml-1 font-bold" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
