import { useState, useEffect } from "react"
import { CalendarIcon, ChevronDownIcon, RotateCcwIcon, SearchIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/**
 * FilterBar Component
 * Configurable, schema-driven filter bar supporting input, date, and select fields.
 *
 * @param {Object} props
 * @param {Array<Object>} props.filters - Configuration array for filter fields:
 *   - type: "input" | "text" | "date" | "select"
 *   - name: string (key in values)
 *   - label?: string (label above field)
 *   - placeholder?: string
 *   - options?: Array<{ label: string, value: string }> (for select)
 *   - minWidth?: string (e.g. "min-w-[130px]")
 *   - prefix?: React.ReactNode
 * @param {Object} [props.values] - Controlled values object
 * @param {Object} [props.initialValues={}] - Initial values
 * @param {Function} [props.onSearch] - Callback receiving (currentValues) on search submit
 * @param {Function} [props.onChange] - Callback receiving (currentValues) on any field change
 * @param {Function} [props.onClear] - Callback on clear
 * @param {string} [props.searchButtonText="ค้นหา"]
 * @param {string} [props.clearButtonText="ล้าง"]
 * @param {boolean} [props.showSearchButton=true]
 * @param {boolean} [props.showClearButton=true]
 * @param {string} [props.className]
 */
export function FilterBar({
  filters = [],
  values: controlledValues,
  initialValues = {},
  onSearch,
  onChange,
  onClear,
  searchButtonText = "ค้นหา",
  clearButtonText = "ล้าง",
  showSearchButton = true,
  showClearButton = true,
  layout = "stacked",
  presets = [],
  activePreset,
  onPresetSelect,
  title,
  subtitle,
  badge,
  icon: Icon,
  children,
  className,
}) {
  // Internal state for draft values before clicking search
  const [internalValues, setInternalValues] = useState(() => {
    return controlledValues || initialValues || {}
  })

  // Sync if controlledValues changes
  useEffect(() => {
    if (controlledValues) {
      setInternalValues(controlledValues)
    }
  }, [controlledValues])

  const handleFieldChange = (name, value) => {
    const updated = {
      ...internalValues,
      [name]: value,
    }
    setInternalValues(updated)
    onChange?.(updated)
  }

  const handleSearch = (e) => {
    if (e) e.preventDefault()
    onSearch?.(internalValues)
  }

  const handleClear = () => {
    const cleared = filters.reduce((acc, f) => {
      acc[f.name] = ""
      return acc
    }, {})
    setInternalValues(cleared)
    if (onClear) {
      onClear()
    } else {
      onSearch?.(cleared)
      onChange?.(cleared)
    }
  }

  // Check if any filter field has an active non-empty value
  const hasActiveFilters = Object.values(internalValues).some(
    (v) => v !== undefined && v !== null && String(v).trim() !== ""
  )

  if (layout === "header") {
    const isMultiFilter = filters.length > 2

    return (
      <form
        onSubmit={handleSearch}
        className={cn(
          "rounded-xl border border-border bg-card p-3.5 sm:p-4 shadow-xs",
          className
        )}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Header context: Icon, Title, Subtitle, Badge */}
          {(title || subtitle || Icon || badge) && (
            <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1 mr-0 lg:mr-3">
              {Icon && (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {title && (
                    <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground truncate">
                      {title}
                    </h2>
                  )}
                  {badge}
                </div>
                {subtitle && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* If NOT multi-filter (e.g. 2 dates in index.jsx): keep presets + inputs + buttons together on right side */}
          {!isMultiFilter && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              {/* Presets */}
              {presets && presets.length > 0 && (
                <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5 text-xs">
                  {presets.map((p) => {
                    const isSelected = activePreset === p.id
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          if (p.values) {
                            setInternalValues(p.values)
                            onSearch?.(p.values)
                            onChange?.(p.values)
                          }
                          onPresetSelect?.(p)
                        }}
                        className={cn(
                          "rounded-md px-2.5 py-1 text-xs font-medium transition cursor-pointer whitespace-nowrap",
                          isSelected
                            ? "bg-card text-foreground font-semibold shadow-xs"
                            : "text-muted-foreground hover:text-foreground hover:bg-card/40"
                        )}
                      >
                        {p.label}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Field Inputs */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {filters.map((field, idx) => {
                  const val = internalValues[field.name] || ""
                  const minW = field.minWidth || (field.type === "date" ? "w-32 sm:w-36" : "min-w-[120px]")
                  const isDateRange =
                    idx > 0 &&
                    field.type === "date" &&
                    filters[idx - 1]?.type === "date"

                  return (
                    <div key={field.name} className="flex items-center gap-1.5">
                      {isDateRange && !field.label && (
                        <span className="text-xs text-muted-foreground font-medium px-0.5">
                          ถึง
                        </span>
                      )}
                      {field.label && (
                        <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                          {field.label}:
                        </span>
                      )}
                      <div className={cn(minW, field.className)}>
                        {field.type === "date" && (
                          <DatePicker
                            value={val}
                            onChange={(dateStr) => handleFieldChange(field.name, dateStr)}
                            placeholder={field.placeholder || "เลือกวันที่..."}
                            align={idx === filters.length - 1 ? "right" : "left"}
                          />
                        )}
                        {field.type === "select" && (
                          <div className="relative">
                            <select
                              value={val}
                              onChange={(e) => handleFieldChange(field.name, e.target.value)}
                              className="h-9 w-full appearance-none rounded-lg border border-input bg-card pl-2.5 pr-8 text-xs font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition cursor-pointer"
                            >
                              {field.placeholder && (
                                <option value="" className="bg-popover text-muted-foreground">{field.placeholder}</option>
                              )}
                              {field.options?.map((opt) => (
                                <option key={opt.value} value={opt.value} className="bg-popover text-foreground">
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                            <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                          </div>
                        )}
                        {(field.type === "input" || field.type === "text" || !field.type) && (
                          <div className="relative">
                            <Input
                              type="text"
                              placeholder={field.placeholder || "ระบุข้อความ..."}
                              value={val}
                              onChange={(e) => handleFieldChange(field.name, e.target.value)}
                              prefix={field.prefix || <SearchIcon className="size-3.5 text-muted-foreground" />}
                              className="h-9 rounded-lg border-input bg-card text-xs font-semibold text-foreground"
                            />
                            {val && (
                              <button
                                type="button"
                                onClick={() => handleFieldChange(field.name, "")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                aria-label="ล้างข้อมูล"
                              >
                                <XIcon className="size-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Action Buttons */}
              {(showSearchButton || showClearButton) && (
                <div className="flex items-center gap-1.5 shrink-0">
                  {showSearchButton && (
                    <Button
                      type="submit"
                      size="sm"
                      className="h-9 px-3 text-xs font-semibold shadow-xs cursor-pointer"
                    >
                      <SearchIcon className="mr-1 size-3.5" />
                      {searchButtonText}
                    </Button>
                  )}

                  {showClearButton && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleClear}
                      className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                      title={clearButtonText}
                    >
                      <RotateCcwIcon className="mr-1 size-3.5" />
                      {clearButtonText}
                    </Button>
                  )}
                </div>
              )}

              {children && (
                <div className="flex items-center gap-2 shrink-0">
                  {children}
                </div>
              )}
            </div>
          )}

          {/* If multi-filter: Presets on top-right */}
          {isMultiFilter && presets && presets.length > 0 && (
            <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5 text-xs self-start lg:self-auto shrink-0 max-w-full overflow-x-auto no-scrollbar">
              {presets.map((p) => {
                const isSelected = activePreset === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      if (p.values) {
                        const updated = { ...internalValues, ...p.values }
                        setInternalValues(updated)
                        onSearch?.(updated)
                        onChange?.(updated)
                      }
                      onPresetSelect?.(p)
                    }}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-xs font-medium transition cursor-pointer whitespace-nowrap shrink-0",
                      isSelected
                        ? "bg-card text-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-card/40"
                    )}
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Row 2: For Multi-Filter (Dates, HN, AN, Status, Buttons) */}
        {isMultiFilter && (
          <div className="pt-3 border-t border-border/50 mt-3 flex flex-wrap items-center gap-2 sm:gap-2.5">
            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
              {filters.map((field, idx) => {
                const val = internalValues[field.name] || ""
                const minW = field.minWidth || (field.type === "date" ? "w-32 sm:w-36" : "min-w-[120px]")
                const isDateRange =
                  idx > 0 &&
                  field.type === "date" &&
                  filters[idx - 1]?.type === "date"

                return (
                  <div key={field.name} className="flex items-center gap-1.5">
                    {isDateRange && !field.label && (
                      <span className="text-xs text-muted-foreground font-medium px-0.5">
                        ถึง
                      </span>
                    )}
                    {field.label && (
                      <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                        {field.label}:
                      </span>
                    )}
                    <div className={cn(minW, field.className)}>
                      {field.type === "date" && (
                        <DatePicker
                          value={val}
                          onChange={(dateStr) => handleFieldChange(field.name, dateStr)}
                          placeholder={field.placeholder || "เลือกวันที่..."}
                          align={idx === filters.length - 1 ? "right" : "left"}
                        />
                      )}
                      {field.type === "select" && (
                        <div className="relative">
                          <select
                            value={val}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            className="h-9 w-full appearance-none rounded-lg border border-input bg-card pl-2.5 pr-8 text-xs font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition cursor-pointer"
                          >
                            {field.placeholder && (
                              <option value="" className="bg-popover text-muted-foreground">{field.placeholder}</option>
                            )}
                            {field.options?.map((opt) => (
                              <option key={opt.value} value={opt.value} className="bg-popover text-foreground">
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        </div>
                      )}
                      {(field.type === "input" || field.type === "text" || !field.type) && (
                        <div className="relative">
                          <Input
                            type="text"
                            placeholder={field.placeholder || "ระบุข้อความ..."}
                            value={val}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            prefix={field.prefix || <SearchIcon className="size-3.5 text-muted-foreground" />}
                            className="h-9 rounded-lg border-input bg-card text-xs font-semibold text-foreground"
                          />
                          {val && (
                            <button
                              type="button"
                              onClick={() => handleFieldChange(field.name, "")}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              aria-label="ล้างข้อมูล"
                            >
                              <XIcon className="size-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Action Buttons */}
            {(showSearchButton || showClearButton) && (
              <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                {showSearchButton && (
                  <Button
                    type="submit"
                    size="sm"
                    className="h-9 px-3 text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    <SearchIcon className="mr-1 size-3.5" />
                    {searchButtonText}
                  </Button>
                )}

                {showClearButton && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleClear}
                    className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                    title={clearButtonText}
                  >
                    <RotateCcwIcon className="mr-1 size-3.5" />
                    {clearButtonText}
                  </Button>
                )}
              </div>
            )}

            {children && (
              <div className="flex items-center gap-2 shrink-0">
                {children}
              </div>
            )}
          </div>
        )}
      </form>
    )
  }

  if (layout === "inline") {
    return (
      <form
        onSubmit={handleSearch}
        className={cn(
          "flex flex-col lg:flex-row lg:items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 p-2.5 sm:p-3",
          className
        )}
      >
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
          {filters.map((field) => {
            const val = internalValues[field.name] || ""
            const minW = field.minWidth || (field.type === "date" ? "w-36 sm:w-40" : "flex-1 min-w-[200px] max-w-[320px]")

            return (
              <div key={field.name} className={cn("flex items-center gap-1.5", field.wrapperClassName)}>
                {field.label && (
                  <span className="text-xs text-foreground font-medium whitespace-nowrap">
                    {field.label}:
                  </span>
                )}

                <div className={cn(minW, field.className)}>
                  {/* DATE TYPE */}
                  {field.type === "date" && (
                    <DatePicker
                      value={val}
                      onChange={(dateStr) => handleFieldChange(field.name, dateStr)}
                      placeholder={field.placeholder || "เลือกวันที่..."}
                    />
                  )}

                  {/* SELECT TYPE */}
                  {field.type === "select" && (
                    <div className="relative">
                      <select
                        value={val}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        className="h-9 w-full appearance-none rounded-lg border border-input bg-card pl-2.5 pr-8 text-xs font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition cursor-pointer"
                      >
                        {field.placeholder && (
                          <option value="" className="bg-popover text-muted-foreground">{field.placeholder}</option>
                        )}
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-popover text-foreground">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  )}

                  {/* INPUT / TEXT TYPE */}
                  {(field.type === "input" || field.type === "text" || !field.type) && (
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder={field.placeholder || "ระบุข้อความ..."}
                        value={val}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        prefix={field.prefix || <SearchIcon className="size-3.5 text-muted-foreground" />}
                        className="h-9 rounded-lg border-input bg-card text-xs font-semibold text-foreground"
                      />
                      {val && (
                        <button
                          type="button"
                          onClick={() => handleFieldChange(field.name, "")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                          aria-label="ล้างข้อมูล"
                        >
                          <XIcon className="size-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* Action Buttons */}
          {(showSearchButton || showClearButton) && (
            <div className="flex items-center gap-1.5 shrink-0">
              {showSearchButton && (
                <Button
                  type="submit"
                  size="sm"
                  className="h-9 px-3.5 text-xs font-semibold shadow-xs cursor-pointer"
                >
                  <SearchIcon className="mr-1.5 size-3.5" />
                  {searchButtonText}
                </Button>
              )}

              {showClearButton && hasActiveFilters && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  className="h-9 px-2.5 text-xs border-destructive/30 bg-card text-destructive hover:bg-destructive/10 hover:text-destructive transition cursor-pointer"
                  title="ล้างตัวกรอง"
                >
                  <RotateCcwIcon className="mr-1 size-3.5" />
                  {clearButtonText}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Children Slot (e.g. view mode switcher, result badges) */}
        {children && (
          <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
            {children}
          </div>
        )}
      </form>
    )
  }

  return (
    <form
      onSubmit={handleSearch}
      className={cn(
        "rounded-xl border border-border bg-card p-3 sm:p-3.5",
        className
      )}
    >
      <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-end">
        {filters.map((field) => {
          const val = internalValues[field.name] || ""
          const minW = field.minWidth || (field.type === "date" ? "min-w-[130px]" : "min-w-[110px]")

          return (
            <div key={field.name} className={cn("flex-1 space-y-1", minW, field.className)}>
              {field.label && (
                <label className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                  {field.type === "date" && <CalendarIcon className="size-3 shrink-0" />}
                  <span>{field.label}</span>
                </label>
              )}

              {/* DATE TYPE */}
              {field.type === "date" && (
                <DatePicker
                  value={val}
                  onChange={(dateStr) => handleFieldChange(field.name, dateStr)}
                  placeholder={field.placeholder || "เลือกวันที่..."}
                />
              )}

              {/* SELECT TYPE */}
              {field.type === "select" && (
                <div className="relative">
                  <select
                    value={val}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    className="h-9 w-full appearance-none rounded-lg border border-input bg-card pl-2.5 pr-8 text-xs font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition cursor-pointer"
                  >
                    {field.placeholder && (
                      <option value="" className="bg-popover text-muted-foreground">{field.placeholder}</option>
                    )}
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-popover text-foreground">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                </div>
              )}

              {/* INPUT / TEXT TYPE */}
              {(field.type === "input" || field.type === "text" || !field.type) && (
                <div className="relative">
                  <Input
                    type="text"
                    placeholder={field.placeholder || "ระบุข้อความ..."}
                    value={val}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    prefix={field.prefix || <SearchIcon className="size-3.5 text-muted-foreground" />}
                    className="h-9 rounded-lg border-input bg-card text-xs font-semibold text-foreground"
                  />
                  {val && (
                    <button
                      type="button"
                      onClick={() => handleFieldChange(field.name, "")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label="ล้างข้อมูล"
                    >
                      <XIcon className="size-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {/* Action Buttons */}
        {(showSearchButton || showClearButton) && (
          <div className="flex items-center gap-1.5 shrink-0 pt-1 sm:pt-0">
            {showSearchButton && (
              <Button
                type="submit"
                size="sm"
                className="h-9 px-3.5 text-xs font-semibold shadow-xs cursor-pointer"
              >
                <SearchIcon className="mr-1.5 size-3.5" />
                {searchButtonText}
              </Button>
            )}

            {showClearButton && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                title="ล้างตัวกรอง"
              >
                <RotateCcwIcon className="mr-1 size-3.5" />
                {clearButtonText}
              </Button>
            )}
          </div>
        )}

        {children && (
          <div className="flex items-center gap-2 shrink-0 self-end ml-auto">
            {children}
          </div>
        )}
      </div>
    </form>
  )
}

export default FilterBar
