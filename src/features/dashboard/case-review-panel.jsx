import { BellRingIcon, ClipboardListIcon, SparklesIcon } from "lucide-react"
import { Link } from "@tanstack/react-router"

const alertTemplates = [
  ["A1", "ขาด Supporting Diagnosis ที่สนับสนุนความรุนแรงของโรค", "สูง", "rose"],
  ["A2", "ค่าใช้จ่ายสูง แต่ RW ต่ำกว่ามาตรฐาน", "สูง", "rose"],
  ["A3", "ระยะเวลานอน รพ. ไม่สอดคล้องกับ DRG", "ปานกลาง", "amber"],
]

export function CaseReviewPanel({ caseData }) {
  const suggestedAdjrw = (caseData.adjrw * 1.25).toFixed(4)
  const estimatedGain = Math.round(caseData.cost * 0.16)
  const alerts = alertTemplates.slice(0, caseData.alerts)
  const details = [
    ["ผู้ป่วย", `${caseData.patient} (${caseData.demographics})`],
    ["AN", `${caseData.an}`],
    ["HN", "00012345"],
    ["วันที่ Admit - Discharge", "15 พ.ค. 2567 - 20 พ.ค. 2567 (5 วัน)"],
    ["สิทธิการรักษา", "บัตรทอง (UC)"],
    ["Principal Dx", caseData.diagnosis],
    ["DRG", `${caseData.drg}  ${caseData.diagnosis}`],
    ["AdjRW", caseData.adjrw.toFixed(4)],
    ["ค่าใช้จ่ายรวม", `${caseData.cost.toLocaleString("en-US", { minimumFractionDigits: 2 })} บาท`],
  ]

  return (
    <aside className="space-y-3 sm:space-y-4">
      <section className="rounded-xl border border-[#edf0f5] bg-card p-3.5 sm:p-4">
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <ClipboardListIcon className="size-4 shrink-0 text-primary" />
            <span>Case Review - สรุปข้อมูลผู้ป่วย</span>
          </h2>
          <Link to="/case-review" className="shrink-0 text-xs font-semibold text-primary hover:underline">
            ดูรายละเอียดทั้งหมด
          </Link>
        </div>
        <dl className="divide-y divide-border text-xs">
          {details.map(([label, value]) => (
            <div key={label} className="grid grid-cols-1 xs:grid-cols-[minmax(6.5rem,auto)_1fr] gap-1 sm:gap-2 py-1.5">
              <dt className="font-semibold text-muted-foreground">{label}</dt>
              <dd className="font-medium text-foreground min-w-0 break-words">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-xl border border-rose-200 bg-rose-50/40 p-3.5 sm:p-4">
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-rose-600">
            <BellRingIcon className="size-4 shrink-0" />
            <span>Smart Alert</span>
          </h2>
          <span className="rounded-md border border-rose-200 bg-white px-2 py-0.5 text-xs font-semibold text-rose-600">
            ทั้งหมด {caseData.alerts}
          </span>
        </div>
        {alerts.length ? (
          <ul className="space-y-2">
            {alerts.map(([code, detail, severity, tone]) => (
              <li key={code} className="flex items-start justify-between gap-2 text-xs">
                <div className="flex items-start gap-1.5 min-w-0 flex-1">
                  <span className="mt-1 flex items-center gap-1 font-medium text-foreground shrink-0">
                    <span className="size-1.5 rounded-full bg-rose-500" />
                    {code}
                  </span>
                  <span className="text-muted-foreground min-w-0 break-words">{detail}</span>
                </div>
                <span className={`shrink-0 rounded-md px-2 py-0.5 font-semibold text-[11px] sm:text-xs ${tone === "rose" ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"}`}>
                  {severity}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-2 text-center text-xs text-emerald-600">ไม่พบรายการแจ้งเตือนสำหรับเคสนี้</p>
        )}
      </section>

      <section className="rounded-xl border border-violet-200 bg-violet-50/30 p-3.5 sm:p-4">
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-violet-700">
            <SparklesIcon className="size-4 shrink-0" />
            <span>AI Suggestion</span>
          </h2>
          <span className="rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-600">
            Confidence 86%
          </span>
        </div>
        <p className="text-xs leading-5 text-foreground">
          แนะนำพิจารณาเพิ่มรหัสวินิจฉัยรองที่เกี่ยวข้อง เพื่อสนับสนุนความรุนแรงของโรคและเพิ่ม AdjRW ของเคสนี้
        </p>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-3 gap-2 text-xs">
          <Metric label="Before (ปัจจุบัน)" value={caseData.adjrw.toFixed(4)} />
          <Metric label="After (แนะนำ)" value={suggestedAdjrw} />
          <div className="flex flex-col justify-between rounded-lg border border-emerald-100 bg-emerald-50 p-2 sm:p-2.5 text-center text-emerald-700">
            <p className="text-[11px] sm:text-xs">เพิ่มขึ้นโดยประมาณ</p>
            <p className="my-1 text-base sm:text-lg font-bold">{estimatedGain.toLocaleString()}</p>
            <p className="text-[11px] sm:text-xs">บาท</p>
          </div>
        </div>
      </section>
    </aside>
  )
}

function Metric({ label, value }) {
  return (
    <div className="flex flex-col justify-between rounded-lg border border-violet-100 bg-white p-2 sm:p-2.5">
      <p className="text-[11px] sm:text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 sm:mt-2 text-xs sm:text-sm font-bold text-foreground">
        AdjRW <span className="ml-1 text-primary">{value}</span>
      </p>
    </div>
  )
}
