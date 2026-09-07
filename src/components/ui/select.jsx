"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { Check, ChevronDown, ChevronUp, Search, X } from "lucide-react"

import { cn } from "@/lib/utils"

const SelectContext = React.createContext({
  labels: {},
  registerLabel: () => {},
  searchQuery: "",
  setSearchQuery: () => {},
})

function SelectSearchInput({
  value,
  onChange,
  placeholder = "ค้นหา...",
  className,
  ...props
}) {
  const inputRef = React.useRef(null)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 50)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="sticky top-0 z-10 -mx-1 -mt-1 mb-1 border-b border-border/50 bg-popover px-2 py-1.5">
      <div className="relative flex items-center">
        <Search className="pointer-events-none absolute left-2 size-3 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
          placeholder={placeholder}
          className={cn(
            "h-7 w-full rounded-md bg-muted/60 pl-6.5 pr-6 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:bg-muted/90 focus:ring-1 focus:ring-ring/30 transition-colors",
            className
          )}
          {...props}
        />
        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onChange?.("")
              inputRef.current?.focus()
            }}
            className="absolute right-1.5 flex size-4 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="size-3" />
          </button>
        )}
      </div>
    </div>
  )
}

function Select({
  value,
  defaultValue,
  onValueChange,
  onChange,
  options,
  placeholder,
  className,
  triggerClassName,
  contentClassName,
  searchable = false,
  searchPlaceholder = "ค้นหา...",
  emptyText = "ไม่พบข้อมูล",
  size = "default",
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  ...props
}) {
  const [labels, setLabels] = React.useState({})
  const [searchQuery, setSearchQuery] = React.useState("")
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const handleOpenChange = React.useCallback(
    (nextOpen, eventDetails) => {
      if (!nextOpen) {
        setSearchQuery("")
      }
      if (!isControlled) {
        setUncontrolledOpen(nextOpen)
      }
      controlledOnOpenChange?.(nextOpen, eventDetails)
    },
    [isControlled, controlledOnOpenChange]
  )

  const registerLabel = React.useCallback((val, label) => {
    setLabels((prev) => {
      if (prev[val] === label) return prev
      return { ...prev, [val]: label }
    })
  }, [])

  const handleValueChange = React.useCallback(
    (val, eventDetails) => {
      onValueChange?.(val, eventDetails)
      onChange?.(val, eventDetails)
    },
    [onValueChange, onChange]
  )

  // Normalize options if provided as prop
  const normalizedOptions = React.useMemo(() => {
    if (!options) return null
    if (Array.isArray(options)) {
      return options.map((opt) => {
        if (typeof opt === "object" && opt !== null && "value" in opt) {
          return {
            value: opt.value,
            label: opt.label !== undefined ? opt.label : opt.value,
            disabled: opt.disabled,
          }
        }
        return { value: opt, label: opt, disabled: false }
      })
    }
    if (typeof options === "object" && options !== null) {
      return Object.entries(options).map(([val, label]) => ({
        value: val,
        label,
        disabled: false,
      }))
    }
    return null
  }, [options])

  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!normalizedOptions) return null
    if (!searchQuery.trim()) return normalizedOptions
    const q = searchQuery.toLowerCase().trim()
    return normalizedOptions.filter((opt) => {
      const labelStr = typeof opt.label === "string" ? opt.label : String(opt.label || "")
      const valStr = String(opt.value || "")
      return labelStr.toLowerCase().includes(q) || valStr.toLowerCase().includes(q)
    })
  }, [normalizedOptions, searchQuery])

  // Pre-populate labels when options are passed
  React.useEffect(() => {
    if (normalizedOptions) {
      setLabels((prev) => {
        const next = { ...prev }
        let changed = false
        normalizedOptions.forEach((opt) => {
          if (next[opt.value] !== opt.label) {
            next[opt.value] = opt.label
            changed = true
          }
        })
        return changed ? next : prev
      })
    }
  }, [normalizedOptions])

  const content = normalizedOptions ? (
    <>
      <SelectTrigger
        size={size}
        className={cn(className, triggerClassName)}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={contentClassName}>
        {searchable && (
          <SelectSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={searchPlaceholder}
          />
        )}
        {filteredOptions && filteredOptions.length > 0 ? (
          filteredOptions.map((opt) => (
            <SelectItem
              key={String(opt.value)}
              value={opt.value}
              disabled={opt.disabled}
            >
              {opt.label}
            </SelectItem>
          ))
        ) : (
          <div className="py-4 text-center text-xs text-muted-foreground select-none">
            {emptyText}
          </div>
        )}
      </SelectContent>
    </>
  ) : (
    children
  )

  return (
    <SelectContext.Provider value={{ labels, registerLabel, searchQuery, setSearchQuery }}>
      <SelectPrimitive.Root
        data-slot="select"
        value={value}
        defaultValue={defaultValue}
        onValueChange={handleValueChange}
        open={open}
        onOpenChange={handleOpenChange}
        {...props}
      >
        {content}
      </SelectPrimitive.Root>
    </SelectContext.Provider>
  )
}

function SelectGroup({
  ...props
}) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({
  className,
  placeholder,
  children,
  ...props
}) {
  const { labels } = React.useContext(SelectContext) || {}

  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn("truncate", className)}
      placeholder={placeholder}
      {...props}
    >
      {(value) => {
        if (typeof children === "function") return children(value)
        if (children != null) return children
        if (value != null && labels && labels[value] !== undefined) {
          return labels[value]
        }
        return value ?? placeholder
      }}
    </SelectPrimitive.Value>
  )
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-3 py-2 text-xs font-medium ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 [&>span]:line-clamp-1 cursor-pointer transition-colors",
        size === "sm" && "h-8 px-2.5 text-xs",
        size === "default" && "h-9 px-3 text-xs",
        size === "lg" && "h-10 px-3.5 text-sm",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon className="pointer-events-none shrink-0 text-muted-foreground">
        <ChevronDown className="size-4 opacity-50 transition-transform duration-200" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectScrollUpButton({
  className,
  ...props
}) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1 text-muted-foreground",
        className
      )}
      {...props}
    >
      <ChevronUp className="size-3.5" />
    </SelectPrimitive.ScrollUpArrow>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1 text-muted-foreground",
        className
      )}
      {...props}
    >
      <ChevronDown className="size-3.5" />
    </SelectPrimitive.ScrollDownArrow>
  )
}

function SelectContent({
  className,
  children,
  position = "popper",
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  alignItemWithTrigger = false,
  ...props
}) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        className="isolate z-50 outline-none"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        alignItemWithTrigger={alignItemWithTrigger}
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-xl bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/10 duration-100 outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List className="p-1 max-h-72 overflow-y-auto">
            {children}
          </SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn("px-2 py-1.5 text-xs font-semibold text-muted-foreground", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  value,
  ...props
}) {
  const { registerLabel } = React.useContext(SelectContext) || {}

  React.useEffect(() => {
    if (value !== undefined && children !== undefined) {
      registerLabel?.(value, children)
    }
  }, [value, children, registerLabel])

  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      value={value}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-lg py-1.5 pl-8 pr-2.5 text-xs font-medium outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground cursor-pointer transition-colors",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="size-3.5" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("-mx-1 my-1 h-px bg-border/50", className)}
      {...props}
    />
  )
}

export {
  Select,
  SelectSearchInput,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
