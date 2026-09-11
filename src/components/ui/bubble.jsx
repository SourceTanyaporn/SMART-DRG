import * as React from "react";
import { cn } from "@/lib/utils";

export const Bubble = React.forwardRef(
    ({ className, variant = "default", children, ...props }, ref) => {
        const variants = {
            default: "bg-muted/80 text-foreground rounded-2xl rounded-br-xs border border-border shadow-xs",
            user: "bg-primary text-primary-foreground rounded-2xl rounded-br-xs shadow-xs",
            bot: "bg-primary/[0.04] dark:bg-primary/10 text-foreground rounded-2xl rounded-bl-xs border border-primary/20 shadow-xs",
            ai: "bg-primary/[0.04] dark:bg-primary/10 text-foreground rounded-2xl rounded-bl-xs border border-primary/20 shadow-xs",
            muted: "bg-muted text-muted-foreground rounded-2xl border border-border",
            primary: "bg-primary text-primary-foreground rounded-2xl rounded-br-xs shadow-xs",
        };

        return (
            <div
                ref={ref}
                data-slot="bubble"
                data-variant={variant}
                className={cn(
                    "relative px-3.5 py-2.5 text-[11px] leading-relaxed transition-all",
                    variants[variant] || variants.default,
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);
Bubble.displayName = "Bubble";

export const BubbleContent = React.forwardRef(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                data-slot="bubble-content"
                className={cn("break-words", className)}
                {...props}
            >
                {children}
            </div>
        );
    }
);
BubbleContent.displayName = "BubbleContent";

export const BubbleGroup = React.forwardRef(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                data-slot="bubble-group"
                className={cn("flex flex-col gap-1.5", className)}
                {...props}
            >
                {children}
            </div>
        );
    }
);
BubbleGroup.displayName = "BubbleGroup";

export const BubbleReactions = React.forwardRef(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                data-slot="bubble-reactions"
                className={cn(
                    "flex items-center gap-1 mt-1 text-slate-400 text-[10px]",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);
BubbleReactions.displayName = "BubbleReactions";
