import { useState, useEffect } from "react"
import { CalendarIcon, RotateCcwIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { cn } from "@/lib/utils"

/**
 * DateRangeFilter Component
 * Supports start date, end date, search button, and clear functionality
 */
export function DateRangeFilter({
  startDate,
  endDate,
  onSearch,
  onDateChange,
  onStartDateChange,
  onEndDateChange,
  className,
}) {
  const [internalStart, setInternalStart] = useState(startDate || "")
  const [internalEnd, setInternalEnd] = useState(endDate || "")

  useEffect(() => {
    setInternalStart(startDate || "")
  }, [startDate])

  useEffect(() => {
    setInternalEnd(endDate || "")
  }, [endDate])

  const handleSearch = (e) => {
    if (e) e.preventDefault()
    onSearch?.(internalStart, internalEnd)
    onDateChange?.(internalStart, internalEnd)
    onStartDateChange?.(internalStart)
    onEndDateChange?.(internalEnd)
  }

  const handleClear = () => {
    setInternalStart("")
    setInternalEnd("")
    onSearch?.("", "")
    onDateChange?.("", "")
    onStartDateChange?.("")
    onEndDateChange?.("")
  }

  const hasFilter = Boolean(internalStart || internalEnd)

  return (
    <form
      onSubmit={handleSearch}
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-xl border border-[#edf0f5] bg-card p-1.5 sm:p-2 shadow-xs",
        className
      )}
    >
      <div className="flex items-center gap-1.5 pl-1 text-xs font-semibold text-slate-700">
        <CalendarIcon className="size-3.5 text-primary shrink-0" />
        <span className="hidden sm:inline">ช่วงเวลา:</span>
      </div>

      {/* Start Date */}
      <div className="w-32 sm:w-36">
        <DatePicker
          value={internalStart}
          onChange={setInternalStart}
          placeholder="วันที่เริ่มต้น..."
        />
      </div>

      <span className="text-xs text-muted-foreground font-medium">-</span>

      {/* End Date */}
      <div className="w-32 sm:w-36">
        <DatePicker
          value={internalEnd}
          onChange={setInternalEnd}
          placeholder="วันที่สิ้นสุด..."
        />
      </div>

      {/* Search Button */}
      <Button
        type="submit"
        size="sm"
        className="h-9 px-3 text-xs font-semibold shadow-xs"
      >
        <SearchIcon className="mr-1.5 size-3.5" />
        ค้นหา
      </Button>

      {hasFilter && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={handleClear}
          className="size-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-rose-600"
          title="ล้างช่วงวันที่"
        >
          <RotateCcwIcon className="size-3.5" />
        </Button>
      )}
    </form>
  )
}

export default DateRangeFilter

