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
    // Reset all defined filter keys to empty string
    const cleared = filters.reduce((acc, f) => {
      acc[f.name] = ""
      return acc
    }, {})
    setInternalValues(cleared)
    onClear?.()
    onSearch?.(cleared)
    onChange?.(cleared)
  }

  // Check if any filter field has an active non-empty value
  const hasActiveFilters = Object.values(internalValues).some(
    (v) => v !== undefined && v !== null && String(v).trim() !== ""
  )

  return (
    <form
      onSubmit={handleSearch}
      className={cn(
        "rounded-xl border border-[#e4e8f1] bg-slate-50/70 p-3 sm:p-3.5",
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
                    className="h-9 w-full appearance-none rounded-lg border border-[#e4e8f1] bg-white pl-2.5 pr-8 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition cursor-pointer"
                  >
                    {field.placeholder && (
                      <option value="">{field.placeholder}</option>
                    )}
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
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
                    className="h-9 rounded-lg border-[#e4e8f1] bg-white text-xs font-semibold text-slate-800"
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
                className="h-9 px-3.5 text-xs font-semibold shadow-xs"
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
                className="h-9 px-2.5 text-xs text-slate-600 hover:bg-slate-100"
                title="ล้างตัวกรอง"
              >
                <RotateCcwIcon className="mr-1 size-3.5" />
                {clearButtonText}
              </Button>
            )}
          </div>
        )}
      </div>
    </form>
  )
}

export default FilterBar
