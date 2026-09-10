import { useState, useRef, useEffect, useMemo } from "react"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react"

import dayjs from "@/lib/dayjs"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

/**
 * DatePicker Component using dayjs with Thai Buddhist Era (พ.ศ.) support
 *
 * @param {Object} props
 * @param {string} props.value - Date in "YYYY-MM-DD" format
 * @param {Function} props.onChange - Callback receiving "YYYY-MM-DD" string or ""
 * @param {string} [props.placeholder="เลือกวันที่..."]
 * @param {string} [props.displayFormat="D MMM BBBB"] - dayjs format pattern (e.g. "20 พ.ค. 2569")
 * @param {string} [props.className]
 * @param {string} [props.minDate]
 * @param {string} [props.maxDate]
 * @param {boolean} [props.disabled=false]
 */
export function DatePicker({
  value,
  onChange,
  placeholder = "เลือกวันที่...",
  displayFormat = "D MMM BBBB",
  className,
  minDate,
  maxDate,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  // Current selected dayjs instance
  const selectedDate = useMemo(() => {
    if (!value) return null
    const d = dayjs(value)
    return d.isValid() ? d : null
  }, [value])

  // Calendar navigation state (month & year being viewed)
  const [viewDate, setViewDate] = useState(() => {
    if (selectedDate) return selectedDate
    return dayjs()
  })

  // Synchronize viewDate when value changes from outside
  useEffect(() => {
    if (selectedDate) {
      setViewDate(selectedDate)
    }
  }, [value])

  // Close calendar when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  // Generate days grid for the viewed month
  const calendarDays = useMemo(() => {
    const startOfMonth = viewDate.startOf("month")
    const daysInMonth = viewDate.daysInMonth()
    const firstDayOfWeek = startOfMonth.day() // 0 = Sunday

    const days = []

    // Previous month padding days
    const prevMonth = viewDate.subtract(1, "month")
    const prevDaysInMonth = prevMonth.daysInMonth()
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonth.date(prevDaysInMonth - i)
      days.push({ date: d, isCurrentMonth: false })
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = viewDate.date(i)
      days.push({ date: d, isCurrentMonth: true })
    }

    // Next month padding days to complete 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7
    const nextMonth = viewDate.add(1, "month")
    for (let i = 1; i <= remaining; i++) {
      const d = nextMonth.date(i)
      days.push({ date: d, isCurrentMonth: false })
    }

    return days
  }, [viewDate])

  const handleSelectDay = (day) => {
    const formattedIso = day.format("YYYY-MM-DD")
    onChange?.(formattedIso)
    setIsOpen(false)
  }

  const handleClear = (e) => {
    e?.stopPropagation()
    onChange?.("")
  }

  const handleToday = () => {
    const today = dayjs()
    setViewDate(today)
    onChange?.(today.format("YYYY-MM-DD"))
    setIsOpen(false)
  }

  const prevMonth = () => setViewDate(viewDate.subtract(1, "month"))
  const nextMonth = () => setViewDate(viewDate.add(1, "month"))

  const today = dayjs()

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Trigger Button */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault()
            setIsOpen(!isOpen)
          }
        }}
        className={cn(
          "relative flex h-9 w-full items-center justify-between rounded-lg border bg-white px-2.5 text-xs transition cursor-pointer select-none",
          isOpen ? "border-primary ring-2 ring-primary/20" : "border-[#e4e8f1] hover:border-slate-300",
          disabled && "cursor-not-allowed bg-slate-50 text-slate-400 opacity-60"
        )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <CalendarIcon className="size-3.5 shrink-0 text-slate-400" />
          <span className={cn("truncate font-medium", selectedDate ? "text-slate-800" : "text-slate-400")}>
            {selectedDate ? selectedDate.format(displayFormat) : placeholder}
          </span>
        </div>

        {selectedDate && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="ml-1 rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            title="ล้างวันที่"
          >
            <XIcon className="size-3" />
          </button>
        )}
      </div>

      {/* Popover Calendar */}
      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-50 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-lg ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95 duration-100">
          {/* Calendar Header */}
          <div className="flex items-center justify-between gap-1 pb-2.5 border-b border-slate-100">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={prevMonth}
              className="size-7 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="เดือนก่อนหน้า"
            >
              <ChevronLeftIcon className="size-4" />
            </Button>

            <span className="text-xs font-semibold text-slate-800">
              {viewDate.format("MMMM BBBB")}
            </span>

            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={nextMonth}
              className="size-7 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="เดือนถัดไป"
            >
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 pt-2 pb-1 text-center">
            {dayjs.daysShort.map((dayName, idx) => (
              <span
                key={dayName}
                className={cn(
                  "text-[10px] font-semibold",
                  idx === 0 ? "text-rose-500" : "text-slate-400"
                )}
              >
                {dayName}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(({ date, isCurrentMonth }, i) => {
              const isSelected = selectedDate ? selectedDate.isSame(date, "day") : false
              const isCurrentDay = today.isSame(date, "day")
              const isDisabled =
                (minDate && date.isBefore(minDate, "day")) ||
                (maxDate && date.isAfter(maxDate, "day"))

              return (
                <button
                  key={i}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelectDay(date)}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-lg text-xs font-medium transition cursor-pointer select-none",
                    !isCurrentMonth && "text-slate-300",
                    isCurrentMonth && !isSelected && "text-slate-700 hover:bg-slate-100",
                    isCurrentDay && !isSelected && "border border-primary/40 font-semibold text-primary",
                    isSelected && "bg-primary text-white font-semibold shadow-xs hover:bg-primary/90",
                    isDisabled && "cursor-not-allowed opacity-30 hover:bg-transparent"
                  )}
                >
                  {date.date()}
                </button>
              )
            })}
          </div>

          {/* Footer Actions */}
          <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
            <button
              type="button"
              onClick={handleToday}
              className="font-medium text-primary hover:underline cursor-pointer"
            >
              วันนี้
            </button>
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="font-medium text-rose-500 hover:underline cursor-pointer"
              >
                ล้างค่า
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default DatePicker
