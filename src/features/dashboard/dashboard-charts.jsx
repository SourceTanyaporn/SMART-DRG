import { Cell, Label, Line, LineChart, Pie, PieChart, XAxis, YAxis, CartesianGrid } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const defaultRiskData = [
  { name: "สูง", value: 68, fill: "#ef476f" },
  { name: "ปานกลาง", value: 176, fill: "#f5ae21" },
  { name: "ต่ำ", value: 268, fill: "#20b486" },
]

const defaultRevenueData = [
  { date: "14 พ.ค.", expected: 520000, actual: 260000 },
  { date: "15 พ.ค.", expected: 840000, actual: 580000 },
  { date: "16 พ.ค.", expected: 940000, actual: 690000 },
  { date: "17 พ.ค.", expected: 1380000, actual: 910000 },
  { date: "18 พ.ค.", expected: 1640000, actual: 1080000 },
  { date: "19 พ.ค.", expected: 1860000, actual: 1210000 },
  { date: "20 พ.ค.", expected: 2050000, actual: 1390000 },
]

const riskConfig = {
  value: { label: "เคส" },
  สูง: { label: "ความเสี่ยงสูง", color: "#ef476f" },
  ปานกลาง: { label: "ความเสี่ยงปานกลาง", color: "#f5ae21" },
  ต่ำ: { label: "ความเสี่ยงต่ำ", color: "#20b486" },
}

const revenueConfig = {
  expected: { label: "รายได้คาดการณ์", color: "#2878e2" },
  actual: { label: "รายได้จริง", color: "#7537d8" },
}

export function DashboardCharts({
  riskData = defaultRiskData,
  revenueData = defaultRevenueData,
  loading = false,
  isLive = false,
}) {
  if (loading) {
    return (
      <section className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-[minmax(14rem,0.85fr)_minmax(0,1.15fr)]">
        <div className="rounded-xl border border-border bg-card p-6 h-64 animate-pulse flex items-center justify-center text-muted-foreground text-sm">
          กำลังโหลดข้อมูลการกระจายความเสี่ยงจาก Panacea API...
        </div>
        <div className="rounded-xl border border-border bg-card p-6 h-64 animate-pulse flex items-center justify-center text-muted-foreground text-sm">
          กำลังโหลดข้อมูลแนวโน้มรายได้จาก Panacea API...
        </div>
      </section>
    )
  }

  return (
    <section className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-[minmax(14rem,0.85fr)_minmax(0,1.15fr)]">
      <RiskDistribution data={riskData} isLive={isLive} />
      <RevenueTrend data={revenueData} isLive={isLive} />
    </section>
  )
}

function RiskDistribution({ data = defaultRiskData, isLive }) {
  const totalCases = data.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0)

  return (
    <section className="rounded-xl border border-border bg-card p-3.5 sm:p-4.5 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <h2 className="text-sm sm:text-base font-semibold text-foreground">การกระจายความเสี่ยง</h2>
        {isLive && (
          <span className="text-[10px] font-medium text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 px-1.5 py-0.5 rounded">
            Live API
          </span>
        )}
      </div>
      <div className="mt-2 flex flex-col sm:flex-row md:flex-col xl:flex-row items-center justify-around gap-2 sm:gap-4">
        <ChartContainer config={riskConfig} className="h-48 sm:h-52 min-h-48 sm:min-h-52 w-full max-w-[220px] aspect-auto">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={3} strokeWidth={0}>
              {data.map((item) => (
                <Cell key={item.name} fill={item.fill || riskConfig[item.name]?.color || "#8884d8"} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) return null
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                      <tspan x={viewBox.cx} className="fill-foreground text-xl sm:text-2xl font-bold">
                        {totalCases}
                      </tspan>
                      <tspan x={viewBox.cx} dy="1.45em" className="fill-muted-foreground text-xs">
                        เคสทั้งหมด
                      </tspan>
                    </text>
                  )
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <ul className="flex flex-wrap sm:flex-col justify-center gap-2 sm:gap-2.5 text-xs">
          {data.map((item) => {
            const fill = item.fill || riskConfig[item.name]?.color || "#8884d8"
            const pct = totalCases > 0 ? ((item.value / totalCases) * 100).toFixed(1) : "0"

            return (
              <li key={item.name} className="flex items-start gap-2">
                <span className="mt-1 size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: fill }} />
                <span className="leading-4 text-muted-foreground">
                  ความเสี่ยง{item.name}
                  <br />
                  <b className="text-foreground">
                    {item.value} ({pct}%)
                  </b>
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

function RevenueTrend({ data = defaultRevenueData, isLive }) {
  return (
    <section className="rounded-xl border border-border bg-card p-3.5 sm:p-4.5 flex flex-col justify-between">
      <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm sm:text-base font-semibold text-foreground">แนวโน้มรายได้ (บาท)</h2>
          {isLive && (
            <span className="text-[10px] font-medium text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 px-1.5 py-0.5 rounded">
              Live API
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          <LegendItem color="#2878e2" label="รายได้คาดการณ์" />
          <LegendItem color="#7537d8" label="รายได้จริง" />
        </div>
      </div>
      <ChartContainer config={revenueConfig} className="mt-2 sm:mt-3 h-48 sm:h-56 min-h-48 sm:min-h-56 aspect-auto">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={10} />
          <YAxis tickLine={false} axisLine={false} tickMargin={6} tickFormatter={(value) => `${value / 1000000}M`} />
          <ChartTooltip content={<ChartTooltipContent formatter={(value, name) => <><span>{revenueConfig[name]?.label}</span><span className="ml-auto font-mono font-semibold">฿{Number(value).toLocaleString()}</span></>} />} />
          <Line type="monotone" dataKey="expected" stroke="var(--color-expected)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--color-expected)" }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="actual" stroke="var(--color-actual)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--color-actual)" }} activeDot={{ r: 5 }} />
        </LineChart>
      </ChartContainer>
    </section>
  )
}

function LegendItem({ color, label }) {
  return <span className="flex items-center gap-1.5 text-muted-foreground"><span className="h-0.5 w-4 rounded" style={{ backgroundColor: color }} />{label}</span>
}

