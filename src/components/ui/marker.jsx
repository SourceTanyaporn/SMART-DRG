import * as React from "react";
import { cn } from "@/lib/utils";

export const Marker = React.forwardRef(
    ({ className, variant = "purple", children, ...props }, ref) => {
        const variants = {
            purple: "bg-gradient-to-br from-[#f2e4ff] to-[#f6d4fb] border-purple-200/70 text-slate-800",
            blue: "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/70 text-slate-800",
            emerald: "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200/70 text-slate-800",
            amber: "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/70 text-slate-800",
            rose: "bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200/70 text-slate-800",
        };

        return (
            <div
                ref={ref}
                data-slot="marker"
                data-variant={variant}
                className={cn(
                    "rounded-xl border p-3 text-[11px] leading-relaxed shadow-xs transition-all",
                    variants[variant] || variants.purple,
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);
Marker.displayName = "Marker";

export const MarkerContent = React.forwardRef(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                data-slot="marker-content"
                className={cn("space-y-1", className)}
                {...props}
            >
                {children}
            </div>
        );
    }
);
MarkerContent.displayName = "MarkerContent";
