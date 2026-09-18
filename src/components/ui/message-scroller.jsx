import * as React from "react";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

const MessageScrollerContext = React.createContext(null);

export function useMessageScroller() {
    const context = React.useContext(MessageScrollerContext);
    if (!context) {
        throw new Error("useMessageScroller must be used within a MessageScrollerProvider or MessageScroller");
    }
    return context;
}

export function MessageScrollerProvider({
    children,
    autoScroll = true,
    scrollThreshold = 80,
}) {
    const viewportRef = React.useRef(null);
    const [isAtBottom, setIsAtBottom] = React.useState(true);
    const [hasScrolled, setHasScrolled] = React.useState(false);

    const scrollToBottom = React.useCallback(
        ({ smooth = true } = {}) => {
            if (viewportRef.current) {
                viewportRef.current.scrollTo({
                    top: viewportRef.current.scrollHeight,
                    behavior: smooth ? "smooth" : "instant",
                });
                setIsAtBottom(true);
            }
        },
        []
    );

    const scrollToTop = React.useCallback(
        ({ smooth = true } = {}) => {
            if (viewportRef.current) {
                viewportRef.current.scrollTo({
                    top: 0,
                    behavior: smooth ? "smooth" : "instant",
                });
            }
        },
        []
    );

    const scrollToMessage = React.useCallback(
        (messageId, { smooth = true, block = "start" } = {}) => {
            if (viewportRef.current) {
                const item = viewportRef.current.querySelector(
                    `[data-message-id="${messageId}"]`
                );
                if (item) {
                    item.scrollIntoView({ behavior: smooth ? "smooth" : "instant", block });
                }
            }
        },
        []
    );

    const handleScroll = React.useCallback(
        (e) => {
            const el = e?.currentTarget || viewportRef.current;
            if (!el) return;
            const { scrollTop, scrollHeight, clientHeight } = el;
            const atBottom = scrollHeight - scrollTop - clientHeight <= scrollThreshold;
            setIsAtBottom(atBottom);
            setHasScrolled(true);
        },
        [scrollThreshold]
    );

    const value = React.useMemo(
        () => ({
            viewportRef,
            isAtBottom,
            hasScrolled,
            autoScroll,
            scrollToBottom,
            scrollToTop,
            scrollToMessage,
            handleScroll,
        }),
        [isAtBottom, hasScrolled, autoScroll, scrollToBottom, scrollToTop, scrollToMessage, handleScroll]
    );

    return (
        <MessageScrollerContext.Provider value={value}>
            {children}
        </MessageScrollerContext.Provider>
    );
}

export const MessageScroller = React.forwardRef(
    ({ className, children, autoScroll = true, ...props }, ref) => {
        const parentContext = React.useContext(MessageScrollerContext);

        const content = (
            <div
                ref={ref}
                data-slot="message-scroller"
                className={cn("relative flex flex-col min-h-0 flex-1 overflow-hidden w-full", className)}
                {...props}
            >
                {children}
            </div>
        );

        if (parentContext) {
            return content;
        }

        return (
            <MessageScrollerProvider autoScroll={autoScroll}>
                {content}
            </MessageScrollerProvider>
        );
    }
);
MessageScroller.displayName = "MessageScroller";

export const MessageScrollerViewport = React.forwardRef(
    ({ className, children, onScroll, ...props }, ref) => {
        const { viewportRef, handleScroll, isAtBottom, autoScroll } = useMessageScroller();

        const combinedRef = React.useCallback(
            (node) => {
                viewportRef.current = node;
                if (typeof ref === "function") ref(node);
                else if (ref) ref.current = node;
            },
            [ref, viewportRef]
        );

        React.useEffect(() => {
            if (autoScroll && isAtBottom) {
                const frameId = requestAnimationFrame(() => {
                    if (viewportRef.current) {
                        viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
                    }
                });
                return () => cancelAnimationFrame(frameId);
            }
        }, [children, autoScroll, isAtBottom, viewportRef]);

        return (
            <div
                ref={combinedRef}
                data-slot="message-scroller-viewport"
                onScroll={(e) => {
                    handleScroll(e);
                    if (onScroll) onScroll(e);
                }}
                className={cn(
                    "min-h-0 flex-1 overflow-y-auto px-3 py-3 scroll-smooth scrollbar-thin",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);
MessageScrollerViewport.displayName = "MessageScrollerViewport";

export const MessageScrollerContent = React.forwardRef(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                data-slot="message-scroller-content"
                className={cn("space-y-3", className)}
                {...props}
            >
                {children}
            </div>
        );
    }
);
MessageScrollerContent.displayName = "MessageScrollerContent";

export const MessageScrollerItem = React.forwardRef(
    ({ className, messageId, scrollAnchor = false, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                data-slot="message-scroller-item"
                data-message-id={messageId}
                data-scroll-anchor={scrollAnchor ? "true" : undefined}
                className={cn("w-full", className)}
                {...props}
            >
                {children}
            </div>
        );
    }
);
MessageScrollerItem.displayName = "MessageScrollerItem";

export const MessageScrollerButton = React.forwardRef(
    ({ className, children, ...props }, ref) => {
        const { isAtBottom, scrollToBottom } = useMessageScroller();

        if (isAtBottom) return null;

        return (
            <button
                ref={ref}
                type="button"
                data-slot="message-scroller-button"
                onClick={() => scrollToBottom({ smooth: true })}
                className={cn(
                    "cursor-pointer absolute bottom-3 right-3 z-20 flex size-7 items-center justify-center rounded-full bg-card/95 border border-primary/30 shadow-md text-primary hover:bg-muted hover:scale-105 active:scale-95 transition-all animate-in fade-in zoom-in-90 duration-150",
                    className
                )}
                title="เลื่อนลงล่างสุด"
                {...props}
            >
                {children || <ArrowDown size={14} />}
            </button>
        );
    }
);
MessageScrollerButton.displayName = "MessageScrollerButton";
