import { useMemo, useState } from "react"
import { FilterIcon } from "lucide-react"

import { DataTable } from "@/components/data-table"
import { FilterBar } from "@/components/ui/filter-bar"
import { drgWorklistColumns } from "@/features/drg-worklist/column"
import { drgWorklistData } from "@/features/drg-worklist/data"
import dayjs from "@/lib/dayjs"

const worklistFilterConfigs = [
  {
    type: "date",
    name: "startDate",
    label: "วันที่เริ่มต้น",
    placeholder: "เลือกวันที่เริ่มต้น...",
  },
  {
    type: "date",
    name: "endDate",
    label: "วันที่สิ้นสุด",
    placeholder: "เลือกวันที่สิ้นสุด...",
  },
  {
    type: "input",
    name: "hn",
    label: "HN",
    placeholder: "ระบุ HN...",
  },
  {
    type: "input",
    name: "an",
    label: "AN",
    placeholder: "ระบุ AN...",
  },
  {
    type: "select",
    name: "status",
    label: "สถานะ",
    placeholder: "สถานะทั้งหมด",
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
}) {
  const [appliedFilters, setAppliedFilters] = useState(() => ({
    startDate: dayjs().startOf("month").format("YYYY-MM-DD"),
    endDate: dayjs().endOf("month").format("YYYY-MM-DD"),
  }))

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
      if (appliedFilters.hn) {
        const query = appliedFilters.hn.trim().toLowerCase()
        if (!item.hn || !item.hn.toLowerCase().includes(query)) return false
      }
      if (appliedFilters.an) {
        const query = appliedFilters.an.trim().toLowerCase()
        if (!item.an || !item.an.toLowerCase().includes(query)) return false
      }
      if (appliedFilters.status) {
        if (item.status !== appliedFilters.status) return false
      }
      return true
    })
  }, [appliedFilters])

  return (
    <section className="rounded-xl border border-[#edf0f5] bg-card p-3.5 sm:p-5">
      <div className="mb-3.5 sm:mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-black">รายการผู้ป่วย DRG</h2>
        </div>
        {!dashboardPage && hasActiveFilters && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              <FilterIcon className="size-3" />
              ผลการค้นหา: พบ {filteredData.length} จาก {drgWorklistData.length} รายการ
            </span>
          </div>
        )}
      </div>

      {/* Filter Controls Bar */}
      {!dashboardPage && (
        <FilterBar
          filters={worklistFilterConfigs}
          initialValues={{
            startDate: dayjs().startOf("month").format("YYYY-MM-DD"),
            endDate: dayjs().endOf("month").format("YYYY-MM-DD"),
          }}
          onSearch={(vals) => setAppliedFilters(vals)}
          onClear={() => setAppliedFilters({})}
          className="mb-4"
        />
      )}

      <DataTable
        columns={drgWorklistColumns}
        data={dashboardPage ? filteredDashboardData : filteredData}
        searchPlaceholder="ค้นหา AN, HN, ชื่อผู้ป่วย, DRG..."
        onRowSelect={onCaseSelect}
        selectedRowId={selectedCaseAn}
      />
    </section>
  )
}

