import { Cell, Label, Line, LineChart, Pie, PieChart, XAxis, YAxis, CartesianGrid } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const riskData = [
  { name: "สูง", value: 68, fill: "#ef476f" },
  { name: "ปานกลาง", value: 176, fill: "#f5ae21" },
  { name: "ต่ำ", value: 268, fill: "#20b486" },
]

const revenueData = [
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

export function DashboardCharts() {
  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(16rem,0.8fr)_minmax(0,1.5fr)]">
      <RiskDistribution />
      <RevenueTrend />
    </section>
  )
}

function RiskDistribution() {
  return (
    <section className="rounded-xl border border-[#edf0f5] bg-card p-5">
      <h2 className="text-base font-semibold text-foreground">การกระจายความเสี่ยง</h2>
      <div className="mt-2 grid items-center gap-2 sm:grid-cols-[minmax(0,1fr)_9rem] lg:grid-cols-1 xl:grid-cols-[minmax(0,1fr)_8rem]">
        <ChartContainer config={riskConfig} className="h-52 min-h-52 aspect-auto">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
            <Pie data={riskData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={76} paddingAngle={3} strokeWidth={0}>
              {riskData.map((item) => <Cell key={item.name} fill={item.fill} />)}
              <Label
                content={({ viewBox }) => {
                  if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) return null
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                      <tspan x={viewBox.cx} className="fill-foreground text-2xl font-bold">512</tspan>
                      <tspan x={viewBox.cx} dy="1.45em" className="fill-muted-foreground text-xs">เคสทั้งหมด</tspan>
                    </text>
                  )
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <ul className="space-y-2.5 text-xs">
          {riskData.map((item) => (
            <li key={item.name} className="flex items-start gap-2">
              <span className="mt-1 size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: item.fill }} />
              <span className="leading-4 text-muted-foreground">ความเสี่ยง{item.name}<br /><b className="text-foreground">{item.value} ({((item.value / 512) * 100).toFixed(1)}%)</b></span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function RevenueTrend() {
  return (
    <section className="rounded-xl border border-[#edf0f5] bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-foreground">แนวโน้มรายได้ (บาท)</h2>
        <div className="flex items-center gap-3 text-xs">
          <LegendItem color="#2878e2" label="รายได้คาดการณ์" />
          <LegendItem color="#7537d8" label="รายได้จริง" />
        </div>
      </div>
      <ChartContainer config={revenueConfig} className="mt-3 h-56 min-h-56 aspect-auto">
        <LineChart data={revenueData} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={10} />
          <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `${value / 1000000}M`} />
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
