import React, { useState, useEffect, useRef } from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

// ==========================================
// Global Toast Event Bus & State
// ==========================================
let listeners = [];
let toastIdCounter = 0;
let activeToasts = [];

function notify() {
    listeners.forEach((listener) => listener([...activeToasts]));
}

/**
 * Trigger a toast notification from anywhere in your code.
 * Usage:
 *   toast.success("สำเร็จ", "บันทึกข้อมูลเรียบร้อย");
 *   toast.error("เกิดข้อผิดพลาด", "ไม่สามารถติดต่อเซิร์ฟเวอร์ได้");
 *   toast.warning("แจ้งเตือน", "กรุณาระบุข้อมูลให้ครบถ้วน");
 *   toast.info("ข้อมูล", "กำลังประมวลผล...");
 */
export const toast = (titleOrOptions, maybeMessage, options = {}) => {
    let newToast = {};

    if (typeof titleOrOptions === "object" && titleOrOptions !== null) {
        newToast = {
            id: ++toastIdCounter,
            type: titleOrOptions.type || "info",
            title: titleOrOptions.title || "",
            message: titleOrOptions.message || titleOrOptions.description || "",
            duration: titleOrOptions.duration ?? 4000,
            isClosing: false,
        };
    } else {
        newToast = {
            id: ++toastIdCounter,
            type: options.type || "info",
            title: titleOrOptions || "",
            message: typeof maybeMessage === "string" ? maybeMessage : "",
            duration: (typeof maybeMessage === "object" ? maybeMessage.duration : options.duration) ?? 4000,
            isClosing: false,
        };
    }

    activeToasts = [...activeToasts, newToast];
    notify();

    return newToast.id;
};

toast.success = (title, message, options = {}) =>
    toast(title, message, { ...options, type: "success" });

toast.error = (title, message, options = {}) =>
    toast(title, message, { ...options, type: "error" });

toast.warning = (title, message, options = {}) =>
    toast(title, message, { ...options, type: "warning" });

toast.info = (title, message, options = {}) =>
    toast(title, message, { ...options, type: "info" });

toast.dismiss = (id) => {
    if (id !== undefined) {
        // Mark as closing first to trigger exit animation
        let found = false;
        activeToasts = activeToasts.map((t) => {
            if (t.id === id) {
                found = true;
                return { ...t, isClosing: true };
            }
            return t;
        });
        if (found) {
            notify();
            setTimeout(() => {
                activeToasts = activeToasts.filter((t) => t.id !== id);
                notify();
            }, 360);
        }
    } else {
        activeToasts = activeToasts.map((t) => ({ ...t, isClosing: true }));
        notify();
        setTimeout(() => {
            activeToasts = [];
            notify();
        }, 360);
    }
};

/**
 * Individual Toast Item with smooth mounting, timer, progress bar, and exit transition
 */
function ToastItem({ item, onDismiss }) {
    const [isMounted, setIsMounted] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [progress, setProgress] = useState(100);
    const startTimeRef = useRef(Date.now());
    const remainingTimeRef = useRef(item.duration);

    // Trigger smooth enter animation on mount
    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            setIsMounted(true);
        });
        return () => cancelAnimationFrame(frame);
    }, []);

    // Manage auto-dismissal and progress countdown with pause on hover
    useEffect(() => {
        if (!item.duration || item.duration <= 0 || item.isClosing) return;

        let intervalId;
        if (!isPaused) {
            const start = Date.now();
            const initialRemaining = remainingTimeRef.current;

            intervalId = setInterval(() => {
                const elapsed = Date.now() - start;
                const currentRemaining = Math.max(0, initialRemaining - elapsed);
                remainingTimeRef.current = currentRemaining;

                const percent = (currentRemaining / item.duration) * 100;
                setProgress(percent);

                if (currentRemaining <= 0) {
                    clearInterval(intervalId);
                    onDismiss(item.id);
                }
            }, 25);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isPaused, item.duration, item.id, item.isClosing, onDismiss]);

    const isSuccess = item.type === "success";
    const isError = item.type === "error";
    const isWarning = item.type === "warning";
    const isInfo = item.type === "info" || (!isSuccess && !isError && !isWarning);

    const isVisible = isMounted && !item.isClosing;

    return (
        <div
            className="transition-all ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
                transitionDuration: "360ms",
                maxHeight: isVisible ? "250px" : "0px",
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0) scale(1)" : "translateY(-14px) scale(0.94)",
                marginBottom: isVisible ? "10px" : "0px",
                overflow: "hidden",
            }}
        >
            <div
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                className={`pointer-events-auto relative flex items-start gap-3 rounded-2xl border p-3.5 shadow-xl backdrop-blur-xl transition-all duration-300 ${
                    isSuccess
                        ? "border-emerald-200/90 bg-white/95 text-emerald-950 shadow-emerald-500/10"
                        : isError
                        ? "border-rose-200/90 bg-white/95 text-rose-950 shadow-rose-500/10"
                        : isWarning
                        ? "border-amber-200/90 bg-white/95 text-amber-950 shadow-amber-500/10"
                        : "border-blue-200/90 bg-white/95 text-blue-950 shadow-blue-500/10"
                }`}
            >
                {/* Status Icon with soft glow */}
                <div
                    className={`flex size-8 shrink-0 items-center justify-center rounded-xl shadow-xs transition-transform duration-300 hover:scale-105 ${
                        isSuccess
                            ? "bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-500/20"
                            : isError
                            ? "bg-gradient-to-tr from-rose-600 to-red-500 text-white shadow-rose-500/20"
                            : isWarning
                            ? "bg-gradient-to-tr from-amber-500 to-orange-400 text-white shadow-amber-500/20"
                            : "bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-blue-500/20"
                    }`}
                >
                    {isSuccess && <CheckCircle2 size={18} strokeWidth={2.5} />}
                    {isError && <AlertCircle size={18} strokeWidth={2.5} />}
                    {isWarning && <AlertTriangle size={18} strokeWidth={2.5} />}
                    {isInfo && <Info size={18} strokeWidth={2.5} />}
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                    {item.title && (
                        <h4 className="text-xs font-bold leading-tight text-slate-800 tracking-tight">
                            {item.title}
                        </h4>
                    )}
                    {item.message && (
                        <p className="mt-1 text-[11px] leading-relaxed text-slate-600 whitespace-pre-line">
                            {item.message}
                        </p>
                    )}
                </div>

                {/* Close Button */}
                <button
                    type="button"
                    onClick={() => onDismiss(item.id)}
                    className="cursor-pointer text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100/80 active:scale-90 transition-all shrink-0"
                    title="ปิดการแจ้งเตือน"
                >
                    <X size={14} strokeWidth={2.2} />
                </button>

                {/* Smooth Progress Bar at bottom */}
                {item.duration > 0 && (
                    <div className="absolute bottom-0 left-3 right-3 h-[2.5px] overflow-hidden rounded-full bg-slate-100/80">
                        <div
                            className={`h-full transition-[width] duration-75 ease-linear rounded-full ${
                                isSuccess
                                    ? "bg-emerald-500/80"
                                    : isError
                                    ? "bg-rose-500/80"
                                    : isWarning
                                    ? "bg-amber-500/80"
                                    : "bg-blue-500/80"
                            }`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * Toast Container component to render active toasts.
 * Mount this once in your RootLayout / App root.
 */
export function Toaster() {
    const [toasts, setToasts] = useState(activeToasts);

    useEffect(() => {
        listeners.push(setToasts);
        return () => {
            listeners = listeners.filter((l) => l !== setToasts);
        };
    }, []);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-5 right-5 z-[999999] flex flex-col max-w-sm w-[calc(100vw-2.5rem)] sm:w-96 pointer-events-none">
            {toasts.map((item) => (
                <ToastItem key={item.id} item={item} onDismiss={toast.dismiss} />
            ))}
        </div>
    );
}

// Backward compatibility alias
export const ToastNotificationContainer = Toaster;
