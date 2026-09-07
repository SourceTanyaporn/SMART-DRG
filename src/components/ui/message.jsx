import * as React from "react";
import { cn } from "@/lib/utils";

export const Message = React.forwardRef(
    ({ className, from = "user", align, children, ...props }, ref) => {
        const isBot = from === "bot" || from === "assistant" || from === "ai";
        const alignment = align || (isBot ? "start" : "end");

        return (
            <div
                ref={ref}
                data-slot="message"
                data-from={from}
                data-align={alignment}
                className={cn(
                    "flex w-full items-end gap-2.5 my-1.5",
                    alignment === "end" ? "justify-end" : "justify-start",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);
Message.displayName = "Message";

export const MessageAvatar = React.forwardRef(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                data-slot="message-avatar"
                className={cn("shrink-0 select-none", className)}
                {...props}
            >
                {children}
            </div>
        );
    }
);
MessageAvatar.displayName = "MessageAvatar";

export const MessageContent = React.forwardRef(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                data-slot="message-content"
                className={cn("flex flex-col gap-1 max-w-[85%]", className)}
                {...props}
            >
                {children}
            </div>
        );
    }
);
MessageContent.displayName = "MessageContent";

export const MessageFooter = React.forwardRef(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                data-slot="message-footer"
                className={cn(
                    "flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);
MessageFooter.displayName = "MessageFooter";
