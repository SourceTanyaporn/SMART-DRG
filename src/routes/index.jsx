import { createFileRoute } from "@tanstack/react-router"
import { useState, useMemo, useEffect } from "react"
import {
  ArrowUpIcon,
  CoinsIcon,
  Layers3Icon,
  ShieldAlertIcon,
  UsersIcon,
} from "lucide-react"

import { Card } from "@/components/ui/card"
import { CaseReviewPanel } from "@/features/dashboard/case-review-panel"
import { DashboardCharts } from "@/features/dashboard/dashboard-charts"
import { FilterBar } from "@/components/ui/filter-bar"
import { WorklistCard } from "@/features/drg-worklist/worklist-card"
import { drgWorklistData } from "@/features/drg-worklist/data"
import dayjs from "@/lib/dayjs"

const dashboardFilterConfigs = [
  {
    type: "date",
    name: "startDate",
    label: "วันที่เริ่มต้น",
    placeholder: "เลือกวันที่เริ่มต้น...",
    className: "w-full sm:w-44 sm:flex-none",
  },
  {
    type: "date",
    name: "endDate",
    label: "วันที่สิ้นสุด",
    placeholder: "เลือกวันที่สิ้นสุด...",
    className: "w-full sm:w-44 sm:flex-none",
  },
]

export const Route = createFileRoute("/")({
  component: DashboardPage,
})

function DashboardPage() {
  const [startDate, setStartDate] = useState(() => dayjs().format("YYYY-MM-DD"))
  const [endDate, setEndDate] = useState(() => dayjs().format("YYYY-MM-DD"))

  const filteredCases = useMemo(() => {
    if (!startDate && !endDate) return drgWorklistData
    return drgWorklistData.filter((item) => {
      if (startDate && item.date && item.date < startDate) return false
      if (endDate && item.date && item.date > endDate) return false
      return true
    })
  }, [startDate, endDate])

  const [selectedCase, setSelectedCase] = useState(() => filteredCases[0] || drgWorklistData[0])

  useEffect(() => {
    if (filteredCases.length > 0) {
      const exists = filteredCases.some((c) => c.an === selectedCase?.an)
      if (!exists) {
        setSelectedCase(filteredCases[0])
      }
    } else {
      setSelectedCase(null)
    }
  }, [filteredCases, selectedCase])

  const totalCasesCount = filteredCases.length
  const highRiskCount = filteredCases.filter((c) => c.risk === "สูง").length
  const totalAdjrw = filteredCases.reduce((sum, c) => sum + (c.adjrw || 0), 0).toFixed(2)
  const totalCost = filteredCases.reduce((sum, c) => sum + (c.cost || 0), 0)

  const dynamicStats = [
    {
      label: "จำนวนเคส",
      value: totalCasesCount.toString(),
      growth: totalCasesCount > 0 ? "100%" : "0%",
      comparison: startDate === endDate && startDate === dayjs().format("YYYY-MM-DD") ? "วันนี้" : "ในช่วงเวลาที่เลือก",
      icon: UsersIcon,
      iconClass: "bg-primary/10 text-primary",
    },
    {
      label: "เคสเสี่ยงสูง",
      value: highRiskCount.toString(),
      growth: totalCasesCount > 0 ? `${((highRiskCount / (totalCasesCount || 1)) * 100).toFixed(0)}%` : "0%",
      comparison: "ของเคสทั้งหมด",
      icon: ShieldAlertIcon,
      iconClass: "bg-rose-50 text-rose-500",
    },
    {
      label: "AdjRW รวม",
      value: totalAdjrw,
      growth: "เฉลี่ย",
      comparison: `${totalCasesCount > 0 ? (totalAdjrw / totalCasesCount).toFixed(2) : "0"} / เคส`,
      icon: Layers3Icon,
      iconClass: "bg-emerald-50 text-emerald-500",
    },
    {
      label: "รายได้ที่อาจสูญเสีย",
      value: Math.round(totalCost * 0.16).toLocaleString(),
      unit: "บาท",
      growth: "16%",
      comparison: "ประมาณการจากต้นทุน",
      icon: CoinsIcon,
      iconClass: "bg-amber-50 text-amber-500",
    },
  ]

  return (
    <div className="space-y-4">
      {/* Filter Bar (แบบเดียวกับ WorklistCard) */}
      <FilterBar
        filters={dashboardFilterConfigs}
        initialValues={{
          startDate,
          endDate,
        }}
        onSearch={({ startDate: s, endDate: e }) => {
          setStartDate(s || "")
          setEndDate(e || "")
        }}
        onClear={() => {
          setStartDate("")
          setEndDate("")
        }}
        className="w-full sm:w-fit"
      />

      <section className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {dynamicStats.map((stat) => {
          const Icon = stat.icon

          return (
            <Card
              key={stat.label}
              className="rounded-xl border border-[#edf0f5] p-3.5 sm:p-4 xl:p-4.5 shadow-none ring-0"
              style={{ "--card-spacing": "0.75rem" }}
            >
              <div className="flex items-center gap-3.5 sm:gap-4">
                <div className={`grid size-12 sm:size-14 xl:size-16 shrink-0 place-items-center rounded-xl ${stat.iconClass}`}>
                  <Icon className="size-6 sm:size-7" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs sm:text-sm font-semibold text-black">{stat.label}</p>
                  <div className="mt-0.5 sm:mt-1 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                    <p className="text-xl sm:text-2xl font-bold tracking-tight text-black">
                      {stat.value}
                    </p>
                    {stat.unit && <span className="text-xs sm:text-sm font-semibold text-black">{stat.unit}</span>}
                  </div>
                  <p className="mt-0.5 sm:mt-1 flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[11px] sm:text-xs text-muted-foreground">
                    <ArrowUpIcon className="size-3 shrink-0 text-emerald-500" />
                    <span className="font-medium text-emerald-600">{stat.growth}</span>
                    <span className="truncate">{stat.comparison}</span>
                  </p>
                </div>
              </div>
            </Card>
          )
        })}
      </section>
      <section className="grid items-start gap-4 grid-cols-1 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-7 2xl:col-span-8">
          <WorklistCard
            onCaseSelect={setSelectedCase}
            selectedCaseAn={selectedCase?.an}
            dashboardPage={true}
            startDate={startDate}
            endDate={endDate}
          />
          <DashboardCharts />
        </div>
        <div className="xl:col-span-5 2xl:col-span-4">
          <CaseReviewPanel caseData={selectedCase} />
        </div>
      </section>
    </div>
  )
}
