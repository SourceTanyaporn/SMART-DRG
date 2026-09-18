import { createFileRoute } from "@tanstack/react-router"
import { useState, useMemo, useEffect } from "react"
import {
  ArrowUpIcon,
  CalendarDaysIcon,
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
import { PanaceaService } from "@/api/panacea-service"
import dayjs from "@/lib/dayjs"

const dashboardFilterConfigs = [
  {
    type: "date",
    name: "startDate",
    placeholder: "วันที่เริ่มต้น...",
    className: "w-32 sm:w-36",
  },
  {
    type: "date",
    name: "endDate",
    placeholder: "วันที่สิ้นสุด...",
    className: "w-32 sm:w-36",
  },
]

export const Route = createFileRoute("/")({
  component: DashboardPage,
})

function DashboardPage() {
  const todayStr = useMemo(() => dayjs().format("YYYY-MM-DD"), [])
  const last7Str = useMemo(() => dayjs().subtract(6, "day").format("YYYY-MM-DD"), [])
  const monthStartStr = useMemo(() => dayjs().startOf("month").format("YYYY-MM-DD"), [])
  const monthEndStr = useMemo(() => dayjs().endOf("month").format("YYYY-MM-DD"), [])

  const [startDate, setStartDate] = useState(() => dayjs().format("YYYY-MM-DD"))
  const [endDate, setEndDate] = useState(() => dayjs().format("YYYY-MM-DD"))

  const [isLoading, setIsLoading] = useState(true)
  const [isLiveApi, setIsLiveApi] = useState(false)
  const [dashboardData, setDashboardData] = useState(() => ({
    cases: drgWorklistData,
    summary: null,
    riskDistribution: undefined,
    revenueTrend: undefined,
  }))

  const [selectedCase, setSelectedCase] = useState(() => drgWorklistData[0] || null)

  // ดึงข้อมูล Dashboard จาก panaceaClient โดยตรงผ่าน PanaceaService
  useEffect(() => {
    let isMounted = true
    setIsLoading(true)

    PanaceaService.getDashboardData({ startDate, endDate })
      .then((res) => {
        if (!isMounted) return
        setDashboardData(res)
        setIsLiveApi(Boolean(res.isLive))
        setIsLoading(false)

        if (res.cases && res.cases.length > 0) {
          const currentSelectedExists = res.cases.some((c) => c.an === selectedCase?.an)
          if (!currentSelectedExists) {
            setSelectedCase(res.cases[0])
          }
        } else {
          setSelectedCase(null)
        }
      })
      .catch((err) => {
        if (!isMounted) return
        console.error("PanaceaClient dashboard error:", err)
        setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [startDate, endDate])

  const dashboardPresets = useMemo(
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
    if (startDate === todayStr && endDate === todayStr) return "today"
    if (startDate === last7Str && endDate === todayStr) return "7days"
    if (startDate === monthStartStr && endDate === monthEndStr) return "month"
    if (!startDate && !endDate) return "all"
    return "custom"
  }, [startDate, endDate, todayStr, last7Str, monthStartStr, monthEndStr])

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
        if (startDate && endDate) {
          return `${dayjs(startDate).format("D MMM BBBB")} - ${dayjs(endDate).format("D MMM BBBB")}`
        }
        return "ช่วงเวลาที่กำหนดเอง"
    }
  }, [activePresetId, startDate, endDate])

  const currentCases = dashboardData.cases || []
  const totalCasesCount = currentCases.length
  const highRiskCount = currentCases.filter((c) => c.risk === "สูง").length
  const totalAdjrw = currentCases.reduce((sum, c) => sum + (c.adjrw || 0), 0).toFixed(2)
  const totalCost = currentCases.reduce((sum, c) => sum + (c.cost || 0), 0)

  const dynamicStats = [
    {
      label: "จำนวนเคส",
      value: totalCasesCount.toString(),
      growth: totalCasesCount > 0 ? "100%" : "0%",
      comparison:
        activePresetId === "today"
          ? "วันนี้"
          : activePresetId === "7days"
            ? "7 วันล่าสุด"
            : activePresetId === "month"
              ? "เดือนนี้"
              : activePresetId === "all"
                ? "เคสทั้งหมด"
                : "ในช่วงเวลาที่เลือก",
      icon: UsersIcon,
      iconClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    },
    {
      label: "เคสเสี่ยงสูง",
      value: highRiskCount.toString(),
      growth: totalCasesCount > 0 ? `${((highRiskCount / (totalCasesCount || 1)) * 100).toFixed(0)}%` : "0%",
      comparison: "ของเคสทั้งหมด",
      icon: ShieldAlertIcon,
      iconClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    },
    {
      label: "AdjRW รวม",
      value: totalAdjrw,
      growth: "เฉลี่ย",
      comparison: `${totalCasesCount > 0 ? (totalAdjrw / totalCasesCount).toFixed(2) : "0"} / เคส`,
      icon: Layers3Icon,
      iconClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "รายได้ที่อาจสูญเสีย",
      value: Math.round(totalCost * 0.16).toLocaleString(),
      unit: "บาท",
      growth: "16%",
      comparison: "ประมาณการจากต้นทุน",
      icon: CoinsIcon,
      iconClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
  ]

  return (
    <div className="space-y-4">
      <FilterBar
        layout="header"
        icon={CalendarDaysIcon}
        title="ภาพรวมผู้ป่วยและความเสี่ยง"
        subtitle={`ข้อมูลสถิติและการประเมินเวชระเบียน • พบ ${totalCasesCount} รายการ`}
        badge={
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              {activePresetLabel}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                isLiveApi
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
              }`}
            >
              <span className={`size-1.5 rounded-full ${isLiveApi ? "bg-emerald-500" : "bg-amber-500"}`} />
              {isLiveApi ? "Panacea API เชื่อมต่อแล้ว" : "Panacea Client (Mock Data)"}
            </span>
          </div>
        }
        presets={dashboardPresets}
        activePreset={activePresetId}
        onPresetSelect={(preset) => {
          if (preset.values) {
            setStartDate(preset.values.startDate)
            setEndDate(preset.values.endDate)
          }
        }}
        filters={dashboardFilterConfigs}
        values={{
          startDate,
          endDate,
        }}
        onSearch={({ startDate: s, endDate: e }) => {
          setStartDate(s || "")
          setEndDate(e || "")
        }}
        onClear={() => {
          setStartDate(todayStr)
          setEndDate(todayStr)
        }}
        clearButtonText="รีเซ็ต"
        className="w-full"
      />

      <section className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {dynamicStats.map((stat) => {
          const Icon = stat.icon

          return (
            <Card
              key={stat.label}
              className="rounded-xl border border-border p-3.5 sm:p-4 xl:p-4.5 shadow-none ring-0"
              style={{ "--card-spacing": "0.75rem" }}
            >
              <div className="flex items-center gap-3.5 sm:gap-4">
                <div className={`grid size-12 sm:size-14 xl:size-16 shrink-0 place-items-center rounded-xl ${stat.iconClass}`}>
                  <Icon className="size-6 sm:size-7" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs sm:text-sm font-semibold text-foreground">{stat.label}</p>
                  <div className="mt-0.5 sm:mt-1 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                    <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                      {stat.value}
                    </p>
                    {stat.unit && <span className="text-xs sm:text-sm font-semibold text-foreground">{stat.unit}</span>}
                  </div>
                  <p className="mt-0.5 sm:mt-1 flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[11px] sm:text-xs text-muted-foreground">
                    <ArrowUpIcon className="size-3 shrink-0 text-emerald-500" />
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">{stat.growth}</span>
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
            data={currentCases}
            loading={isLoading}
            isLive={isLiveApi}
            onCaseSelect={setSelectedCase}
            selectedCaseAn={selectedCase?.an}
            dashboardPage={true}
            startDate={startDate}
            endDate={endDate}
          />
          <DashboardCharts
            riskData={dashboardData.riskDistribution}
            revenueData={dashboardData.revenueTrend}
            loading={isLoading}
            isLive={isLiveApi}
          />
        </div>
        <div className="xl:col-span-5 2xl:col-span-4">
          <CaseReviewPanel caseData={selectedCase} />
        </div>
      </section>
    </div>
  )
}
