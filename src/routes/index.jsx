import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
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
import { WorklistCard } from "@/features/drg-worklist/worklist-card"
import { drgWorklistData } from "@/features/drg-worklist/data"

export const Route = createFileRoute("/")({
  component: DashboardPage,
})

function DashboardPage() {
  const [selectedCase, setSelectedCase] = useState(drgWorklistData[0])

  return (
    <div className="space-y-4">
      <section className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {dashboardStats.map((stat) => {
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
          <WorklistCard onCaseSelect={setSelectedCase} selectedCaseAn={selectedCase.an} />
          <DashboardCharts />
        </div>
        <div className="xl:col-span-5 2xl:col-span-4">
          <CaseReviewPanel caseData={selectedCase} />
        </div>
      </section>
    </div>
  )
}

const dashboardStats = [
  {
    label: "จำนวนเคส",
    value: "512",
    growth: "12.4%",
    comparison: "จากเมื่อวาน (456)",
    icon: UsersIcon,
    iconClass: "bg-primary/10 text-primary",
  },
  {
    label: "เคสเสี่ยงสูง",
    value: "68",
    growth: "8.7%",
    comparison: "จากเมื่อวาน (63)",
    icon: ShieldAlertIcon,
    iconClass: "bg-rose-50 text-rose-500",
  },
  {
    label: "AdjRW รวม",
    value: "325.18",
    growth: "9.3%",
    comparison: "จากเมื่อวาน (297.49)",
    icon: Layers3Icon,
    iconClass: "bg-emerald-50 text-emerald-500",
  },
  {
    label: "รายได้ที่อาจสูญเสีย",
    value: "1,245,350",
    unit: "บาท",
    growth: "14.6%",
    comparison: "จากเมื่อวาน (1,086,420)",
    icon: CoinsIcon,
    iconClass: "bg-amber-50 text-amber-500",
  },
]
