import { useMemo, useState } from "react"
import { ClipboardListIcon, FilterIcon } from "lucide-react"

import { DataTable } from "@/components/data-table"
import { FilterBar } from "@/components/ui/filter-bar"
import { drgWorklistColumns } from "@/features/drg-worklist/column"
import { drgWorklistData } from "@/features/drg-worklist/data"
import dayjs from "@/lib/dayjs"

const worklistFilterConfigs = [
  {
    type: "date",
    name: "startDate",
    placeholder: "วันที่เริ่มต้น...",
    className: "w-32 sm:w-34",
  },
  {
    type: "date",
    name: "endDate",
    placeholder: "วันที่สิ้นสุด...",
    className: "w-32 sm:w-34",
  },
  {
    type: "select",
    name: "patientType",
    placeholder: "ประเภทผู้ป่วยทั้งหมด",
    className: "w-32 sm:w-36",
    options: [
      { label: "ประเภทผู้ป่วยทั้งหมด", value: "" },
      { label: "IPD ผู้ป่วยใน", value: "IPD" },
      { label: "OPD ผู้ป่วยนอก", value: "OPD" },
    ],
  },
  {
    type: "input",
    name: "hn",
    placeholder: "ระบุ HN...",
    className: "w-24 sm:w-28",
  },
  {
    type: "input",
    name: "an",
    placeholder: "ระบุ AN / VN...",
    className: "w-28 sm:w-32",
  },
  {
    type: "select",
    name: "status",
    placeholder: "สถานะทั้งหมด",
    className: "w-30 sm:w-34",
    options: [
      { label: "สถานะทั้งหมด", value: "" },
      { label: "รอตรวจสอบ", value: "รอตรวจสอบ" },
      { label: "กำลังตรวจสอบ", value: "กำลังตรวจสอบ" },
      { label: "เสร็จสิ้น", value: "เสร็จสิ้น" },
    ],
  },
]

export function WorklistCard({
  onCaseSelect,
  selectedCaseAn,
  dashboardPage,
  startDate: propStartDate,
  endDate: propEndDate,
  data: propData,
  loading: propLoading = false,
  isLive = false,
  title = "รายการผู้ป่วย DRG",
  subtitle,
}) {
  const todayStr = useMemo(() => dayjs().format("YYYY-MM-DD"), [])
  const last7Str = useMemo(() => dayjs().subtract(6, "day").format("YYYY-MM-DD"), [])
  const monthStartStr = useMemo(() => dayjs().startOf("month").format("YYYY-MM-DD"), [])
  const monthEndStr = useMemo(() => dayjs().endOf("month").format("YYYY-MM-DD"), [])

  const [appliedFilters, setAppliedFilters] = useState(() => ({
    startDate: dayjs().startOf("month").format("YYYY-MM-DD"),
    endDate: dayjs().endOf("month").format("YYYY-MM-DD"),
    patientType: "",
    hn: "",
    an: "",
    status: "",
  }))

  const worklistPresets = useMemo(
    () => [
      {
        id: "today",
        label: "วันนี้",
        values: {
          startDate: todayStr,
          endDate: todayStr,
        },
      },
      {
        id: "7days",
        label: "7 วันล่าสุด",
        values: {
          startDate: last7Str,
          endDate: todayStr,
        },
      },
      {
        id: "month",
        label: "เดือนนี้",
        values: {
          startDate: monthStartStr,
          endDate: monthEndStr,
        },
      },
      {
        id: "all",
        label: "ทั้งหมด",
        values: {
          startDate: "",
          endDate: "",
        },
      },
    ],
    [todayStr, last7Str, monthStartStr, monthEndStr]
  )

  const activePresetId = useMemo(() => {
    const { startDate, endDate } = appliedFilters
    if (startDate === todayStr && endDate === todayStr) return "today"
    if (startDate === last7Str && endDate === todayStr) return "7days"
    if (startDate === monthStartStr && endDate === monthEndStr) return "month"
    if (!startDate && !endDate) return "all"
    return "custom"
  }, [appliedFilters, todayStr, last7Str, monthStartStr, monthEndStr])

  const activePresetLabel = useMemo(() => {
    switch (activePresetId) {
      case "today":
        return `ข้อมูลวันนี้ • ${dayjs().format("D MMM BBBB")}`
      case "7days":
        return "7 วันล่าสุด"
      case "month":
        return `ประจำเดือน ${dayjs().format("MMMM BBBB")}`
      case "all":
        return "ข้อมูลทั้งหมดทุกช่วงเวลา"
      default:
        if (appliedFilters.startDate && appliedFilters.endDate) {
          return `${dayjs(appliedFilters.startDate).format("D MMM BBBB")} - ${dayjs(appliedFilters.endDate).format("D MMM BBBB")}`
        }
        return "ช่วงเวลาที่กำหนดเอง"
    }
  }, [activePresetId, appliedFilters.startDate, appliedFilters.endDate])

  const filteredDashboardData = useMemo(() => {
    if (!propStartDate && !propEndDate) return drgWorklistData
    return drgWorklistData.filter((item) => {
      if (propStartDate && item.date && item.date < propStartDate) return false
      if (propEndDate && item.date && item.date > propEndDate) return false
      return true
    })
  }, [propStartDate, propEndDate])

  const hasActiveFilters = Object.values(appliedFilters).some(
    (v) => v !== undefined && v !== null && String(v).trim() !== ""
  )

  const filteredData = useMemo(() => {
    return drgWorklistData.filter((item) => {
      if (appliedFilters.startDate && item.date && item.date < appliedFilters.startDate) {
        return false
      }
      if (appliedFilters.endDate && item.date && item.date > appliedFilters.endDate) {
        return false
      }
      if (appliedFilters.patientType) {
        const isIpdCase = Boolean(item.an && String(item.an).trim() !== "" && item.an !== "-")
        if (appliedFilters.patientType === "IPD" && !isIpdCase) return false
        if (appliedFilters.patientType === "OPD" && isIpdCase) return false
      }
      if (appliedFilters.hn) {
        const query = appliedFilters.hn.trim().toLowerCase()
        if (!item.hn || !item.hn.toLowerCase().includes(query)) return false
      }
      if (appliedFilters.an) {
        const query = appliedFilters.an.trim().toLowerCase()
        const matchAn = item.an && item.an.toLowerCase().includes(query)
        const matchVn = item.vn && item.vn.toLowerCase().includes(query)
        if (!matchAn && !matchVn) return false
      }
      if (appliedFilters.status) {
        if (item.status !== appliedFilters.status) return false
      }
      return true
    })
  }, [appliedFilters])

  // When used inside DashboardPage: Render table card only (dashboard has its own top header filter)
  if (dashboardPage) {
    const tableData = propData !== undefined ? propData : filteredDashboardData

    return (
      <section className="rounded-xl border border-border bg-card p-3.5 sm:p-5">
        <div className="mb-3.5 sm:mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">รายการผู้ป่วย DRG</h2>
            {isLive && (
              <span className="text-[10px] font-medium text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                Panacea API
              </span>
            )}
          </div>
          {propLoading && (
            <span className="text-xs text-muted-foreground animate-pulse">
              กำลังโหลดข้อมูลจาก Panacea API...
            </span>
          )}
        </div>
        <DataTable
          columns={drgWorklistColumns}
          data={tableData}
          searchPlaceholder="ค้นหา AN, HN, ชื่อผู้ป่วย, DRG..."
          onRowSelect={onCaseSelect}
          selectedRowId={selectedCaseAn}
        />
      </section>
    )
  }

  // When used on Worklist Page: Render full header filter bar + main table card
  return (
    <div className="space-y-4">
      <FilterBar
        layout="header"
        icon={ClipboardListIcon}
        title={title}
        subtitle={
          subtitle ||
          `รายการข้อมูลเวชระเบียนผู้ป่วยในและการตรวจสอบ DRG • พบ ${filteredData.length} จาก ${drgWorklistData.length} รายการ`
        }
        badge={
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              {activePresetLabel}
            </span>
            {hasActiveFilters && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                <FilterIcon className="size-3" />
                พบ {filteredData.length} จาก {drgWorklistData.length} รายการ
              </span>
            )}
          </div>
        }
        presets={worklistPresets}
        activePreset={activePresetId}
        onPresetSelect={(preset) => {
          if (preset.values) {
            setAppliedFilters((prev) => ({
              ...prev,
              startDate: preset.values.startDate,
              endDate: preset.values.endDate,
            }))
          }
        }}
        filters={worklistFilterConfigs}
        values={appliedFilters}
        onSearch={(vals) => setAppliedFilters(vals)}
        onClear={() => {
          setAppliedFilters({
            startDate: dayjs().startOf("month").format("YYYY-MM-DD"),
            endDate: dayjs().endOf("month").format("YYYY-MM-DD"),
            patientType: "",
            hn: "",
            an: "",
            status: "",
          })
        }}
        clearButtonText="รีเซ็ต"
        className="w-full"
      />

      <section className="rounded-xl border border-border bg-card p-3.5 sm:p-5">
        <DataTable
          columns={drgWorklistColumns}
          data={propData !== undefined ? propData : filteredData}
          searchPlaceholder="ค้นหา AN, VN, HN, ชื่อผู้ป่วย, DRG..."
          onRowSelect={onCaseSelect}
          selectedRowId={selectedCaseAn}
        />
      </section>
    </div>
  )
}

