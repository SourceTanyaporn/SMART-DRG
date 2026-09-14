import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Tab component for navigation and section switching across the system.
 * Supports multiple variants: "line" (bottom-border), "pill" (capsule), and "outline".
 * 
 * @example
 * // 1. Line variant (default - as in Case Review)
 * <Tab label="ข้อมูลผู้ป่วย" active={activeTab === "patient"} onClick={() => setActiveTab("patient")} />
 * <Tab label="EMR Viewer" icon={StethoscopeIcon} badge="3" active={...} onClick={...} />
 * 
 * // 2. Pill variant (as in Category filters)
 * <Tab variant="pill" label="ทั้งหมด" active={category === "all"} onClick={() => setCategory("all")} />
 * 
 * // 3. Used within TabsList
 * <TabsList variant="line">
 *   <Tab label="Tab 1" active={...} onClick={...} />
 *   <Tab label="Tab 2" active={...} onClick={...} />
 * </TabsList>
 */
export function Tab({
  label,
  children,
  active = false,
  onClick,
  icon: Icon,
  badge,
  badgeClass,
  disabled = false,
  variant = "line",
  size = "default",
  className = "",
  type = "button",
  ...props
}) {
  const content = label || children

  // Size styles
  const sizeStyles = {
    sm: variant === "pill" ? "px-3 py-1 text-xs" : "px-3 py-2 text-xs",
    default: variant === "pill" ? "px-4 py-1.5 text-xs sm:text-sm" : "px-4 py-2.5 text-xs sm:text-sm",
    lg: variant === "pill" ? "px-5 py-2 text-sm" : "px-5 py-3 text-sm sm:text-base",
  }[size] || "px-4 py-2.5 text-sm"

  // Variant styles
  let variantStyles = ""
  if (variant === "line") {
    variantStyles = cn(
      "border-b-2 font-medium transition cursor-pointer select-none whitespace-nowrap",
      active
        ? "border-primary text-primary font-semibold"
        : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
      disabled && "pointer-events-none opacity-50 cursor-not-allowed"
    )
  } else if (variant === "pill") {
    variantStyles = cn(
      "rounded-xl font-medium transition cursor-pointer select-none whitespace-nowrap border",
      active
        ? "bg-primary text-primary-foreground border-primary shadow-xs font-semibold"
        : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/60",
      disabled && "pointer-events-none opacity-50 cursor-not-allowed"
    )
  } else if (variant === "outline") {
    variantStyles = cn(
      "rounded-xl font-medium transition cursor-pointer select-none whitespace-nowrap border",
      active
        ? "border-primary bg-primary/10 text-primary font-semibold"
        : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
      disabled && "pointer-events-none opacity-50 cursor-not-allowed"
    )
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={cn(
        "inline-flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
        sizeStyles,
        variantStyles,
        className
      )}
      {...props}
    >
      {Icon && (
        typeof Icon === "function" || typeof Icon === "object" ? (
          React.isValidElement(Icon) ? Icon : <Icon className="size-4 shrink-0" />
        ) : null
      )}

      {content && <span>{content}</span>}

      {badge !== undefined && badge !== null && (
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-none shrink-0 tracking-tight",
            badgeClass || "border-border bg-muted text-muted-foreground"
          )}
        >
          {badge}
        </span>
      )}
    </button>
  )
}

/**
 * TabsList container for wrapping multiple Tab components.
 */
export function TabsList({
  children,
  variant = "line",
  className = "",
  ...props
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex items-center gap-1 overflow-x-auto no-scrollbar",
        variant === "line" && "border-b border-border",
        variant === "pill" && "py-0.5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * High-level Tabs component that accepts an array of tab items.
 */
export function Tabs({
  tabs = [],
  activeTab,
  onChange,
  variant = "line",
  size = "default",
  className = "",
  listClassName = "",
  children,
  ...props
}) {
  return (
    <div className={cn("w-full", className)} {...props}>
      <TabsList variant={variant} className={listClassName}>
        {tabs.map((tab) => (
          <Tab
            key={tab.id || tab.value || tab.label}
            label={tab.label || tab.title}
            active={activeTab === (tab.id || tab.value || tab.label)}
            onClick={() => onChange?.(tab.id || tab.value || tab.label)}
            icon={tab.icon}
            badge={tab.badge}
            badgeClass={tab.badgeClass}
            disabled={tab.disabled}
            variant={tab.variant || variant}
            size={size}
            className={tab.className}
          />
        ))}
        {children}
      </TabsList>
    </div>
  )
}

export default Tab
