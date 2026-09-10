/**
 * Day.js lightweight engine & Thai Buddhist Era (พ.ศ.) integration
 * Compatible with Dayjs API (format, add, subtract, startOf, endOf, isBefore, isAfter, etc.)
 */

const THAI_MONTHS_FULL = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
]

const THAI_MONTHS_SHORT = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
]

const THAI_DAYS_SHORT = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."]
const THAI_DAYS_FULL = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"]

export class DayjsWrapper {
  constructor(dateInput) {
    if (!dateInput && dateInput !== 0) {
      this._d = new Date()
    } else if (dateInput instanceof Date) {
      this._d = new Date(dateInput.getTime())
    } else if (dateInput instanceof DayjsWrapper) {
      this._d = new Date(dateInput._d.getTime())
    } else if (typeof dateInput === "string") {
      // Parse YYYY-MM-DD safely without timezone drift
      const parts = dateInput.split(/[-/]/)
      if (parts.length === 3 && parts[0].length === 4) {
        const y = parseInt(parts[0], 10)
        const m = parseInt(parts[1], 10) - 1
        const d = parseInt(parts[2], 10)
        this._d = new Date(y, m, d, 12, 0, 0)
      } else {
        this._d = new Date(dateInput)
      }
    } else if (typeof dateInput === "number") {
      this._d = new Date(dateInput)
    } else {
      this._d = new Date(NaN)
    }
  }

  isValid() {
    return !isNaN(this._d.getTime())
  }

  year(val) {
    if (val !== undefined) {
      const d = new Date(this._d.getTime())
      d.setFullYear(val)
      return new DayjsWrapper(d)
    }
    return this._d.getFullYear()
  }

  buddhistYear(val) {
    if (val !== undefined) {
      return this.year(val - 543)
    }
    return this._d.getFullYear() + 543
  }

  month(val) {
    if (val !== undefined) {
      const d = new Date(this._d.getTime())
      d.setMonth(val)
      return new DayjsWrapper(d)
    }
    return this._d.getMonth()
  }

  date(val) {
    if (val !== undefined) {
      const d = new Date(this._d.getTime())
      d.setDate(val)
      return new DayjsWrapper(d)
    }
    return this._d.getDate()
  }

  day() {
    return this._d.getDay()
  }

  daysInMonth() {
    return new Date(this.year(), this.month() + 1, 0).getDate()
  }

  startOf(unit) {
    const d = new Date(this._d.getTime())
    if (unit === "year") {
      return new DayjsWrapper(new Date(d.getFullYear(), 0, 1, 0, 0, 0))
    }
    if (unit === "month") {
      return new DayjsWrapper(new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0))
    }
    if (unit === "day" || unit === "date") {
      return new DayjsWrapper(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0))
    }
    return this
  }

  endOf(unit) {
    const d = new Date(this._d.getTime())
    if (unit === "year") {
      return new DayjsWrapper(new Date(d.getFullYear(), 11, 31, 23, 59, 59))
    }
    if (unit === "month") {
      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
      return new DayjsWrapper(new Date(d.getFullYear(), d.getMonth(), lastDay, 23, 59, 59))
    }
    if (unit === "day" || unit === "date") {
      return new DayjsWrapper(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59))
    }
    return this
  }

  add(value, unit) {
    const d = new Date(this._d.getTime())
    if (unit === "day" || unit === "days" || unit === "d") {
      d.setDate(d.getDate() + value)
    } else if (unit === "month" || unit === "months" || unit === "M") {
      d.setMonth(d.getMonth() + value)
    } else if (unit === "year" || unit === "years" || unit === "y") {
      d.setFullYear(d.getFullYear() + value)
    }
    return new DayjsWrapper(d)
  }

  subtract(value, unit) {
    return this.add(-value, unit)
  }

  isSame(other, unit = "day") {
    if (!other) return false
    const o = new DayjsWrapper(other)
    if (!this.isValid() || !o.isValid()) return false
    if (unit === "year") return this.year() === o.year()
    if (unit === "month") return this.year() === o.year() && this.month() === o.month()
    if (unit === "day" || unit === "date") {
      return (
        this.year() === o.year() &&
        this.month() === o.month() &&
        this.date() === o.date()
      )
    }
    return this._d.getTime() === o._d.getTime()
  }

  isBefore(other, unit = "day") {
    if (!other) return false
    const o = new DayjsWrapper(other)
    if (!this.isValid() || !o.isValid()) return false
    if (unit === "day" || unit === "date") {
      return this.format("YYYY-MM-DD") < o.format("YYYY-MM-DD")
    }
    return this._d.getTime() < o._d.getTime()
  }

  isAfter(other, unit = "day") {
    if (!other) return false
    const o = new DayjsWrapper(other)
    if (!this.isValid() || !o.isValid()) return false
    if (unit === "day" || unit === "date") {
      return this.format("YYYY-MM-DD") > o.format("YYYY-MM-DD")
    }
    return this._d.getTime() > o._d.getTime()
  }

  toDate() {
    return new Date(this._d.getTime())
  }

  toISOString() {
    return this._d.toISOString()
  }

  format(pattern = "YYYY-MM-DD") {
    if (!this.isValid()) return ""

    const y = this._d.getFullYear()
    const by = y + 543
    const m = this._d.getMonth()
    const d = this._d.getDate()
    const dayOfWeek = this._d.getDay()

    const pad = (n) => String(n).padStart(2, "0")

    const tokens = {
      BBBB: String(by),
      BB: String(by).slice(-2),
      YYYY: String(y),
      YY: String(y).slice(-2),
      MMMM: THAI_MONTHS_FULL[m],
      MMM: THAI_MONTHS_SHORT[m],
      MM: pad(m + 1),
      M: String(m + 1),
      DD: pad(d),
      D: String(d),
      dddd: THAI_DAYS_FULL[dayOfWeek],
      ddd: THAI_DAYS_SHORT[dayOfWeek],
    }

    let result = pattern
    // Replace multi-char tokens first
    const keys = Object.keys(tokens).sort((a, b) => b.length - a.length)
    for (const key of keys) {
      result = result.replace(new RegExp(key, "g"), tokens[key])
    }
    return result
  }
}

export function dayjs(dateInput) {
  return new DayjsWrapper(dateInput)
}

dayjs.isDayjs = (obj) => obj instanceof DayjsWrapper
dayjs.months = THAI_MONTHS_FULL
dayjs.monthsShort = THAI_MONTHS_SHORT
dayjs.daysShort = THAI_DAYS_SHORT

export default dayjs
