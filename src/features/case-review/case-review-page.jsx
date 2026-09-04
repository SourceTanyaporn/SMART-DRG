import {
  ArrowRightIcon,
  BellRingIcon,
  BookmarkIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardCheckIcon,
  PaperclipIcon,
  SparklesIcon,
  TrendingUpIcon,
  StethoscopeIcon,
  FileSearchIcon,
  UserIcon,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useRouterState } from "@tanstack/react-router"
import { Card } from "@/components/ui/card"
import { EmrViewerTab } from "./emr-viewer-tab"
import { CodingReviewTab } from "./coding-review-tab"
import { ClinicalSummaryTab } from "./clinical-summary-tab"
import { ClaimDrgTab } from "./claim-drg-tab"
import { AuditTrailTab } from "./audit-trail-tab"

const patientSummary = [
  [["AN", "670520-00123"], ["HN", "0012345"]],
  [["ชื่อ-สกุล", "นางสาววันหน้า ใจดี"], ["อายุ / เพศ", "46 ปี 2 เดือน / หญิง"]],
  [["วันที่ Admit - Discharge", "15 พ.ค. 2567 - 20 พ.ค. 2567"], ["LOS", "5 วัน"]],
  [["สิทธิการรักษา", "บัตรทอง (UC)"], ["กองทุน", "UC"]],
]

const admissionDetails = [
  ["แผนก/หอผู้ป่วย", "ศัลยกรรมหญิง 1 / 7102"],
  ["แพทย์เจ้าของไข้", "นพ.วัชรพล ศิริกุล"],
  ["แพทย์ผู้คัด", "นพ.วัชรพล ศิริกุล"],
  ["DRG หลัก (คาดการณ์)", "I02Z Major Hip Joint Replacement"],
]

const alerts = [
  ["A1", "Dx supporting diagnosis ไม่สนับสนุน DRG", "สูง", "rose"],
  ["A2", "ผ่าตัดใหญ่ แต่ RW ต่ำกว่ามาตรฐาน", "สูง", "rose"],
  ["A3", "ไม่พบรหัส Obesity (E66) ใน Secondary Dx", "ปานกลาง", "amber"],
  ["A4", "ควรบันทึกวินิจฉัยหลักครบตามแพทย์", "ปานกลาง", "amber"],
]

export function CaseReviewPage({ initialTab }) {
  const routerState = useRouterState({ select: (s) => s.location })
  const searchTab = routerState?.search?.tab

  const [activeTab, setActiveTab] = useState(initialTab || searchTab || "patient")

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab)
    } else if (searchTab) {
      setActiveTab(searchTab)
    }
  }, [initialTab, searchTab])

  return (
    <div className="space-y-4 [&_[data-slot=card]]:!gap-2 [&_h2]:!mb-1 [&_h2+div]:!mt-1">
      {/* Header & Tabs Navigation */}
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="w-full">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">Case Review</h1>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                รอตรวจสอบ
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex h-9 items-center gap-1 rounded-lg border border-border px-3 text-xs text-muted-foreground transition hover:bg-muted cursor-pointer"
              >
                <ChevronLeftIcon className="size-4" /> ก่อนหน้า
              </button>
              <span className="px-2 text-xs font-semibold text-foreground">3 จาก 103 เคส</span>
              <button
                type="button"
                className="flex h-9 items-center gap-1 rounded-lg border border-border px-3 text-xs font-semibold text-foreground transition hover:bg-muted cursor-pointer"
              >
                ถัดไป <ChevronRightIcon className="size-4" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-3 flex flex-wrap gap-1 border-b border-border text-sm">
            <Tab
              label="ข้อมูลผู้ป่วย"
              active={activeTab === "patient"}
              onClick={() => setActiveTab("patient")}
            />
            <Tab
              label="EMR Case Viewer"
              badge="หลักฐาน"
              badgeClass="bg-sky-50 text-sky-700 border-sky-200"
              icon={StethoscopeIcon}
              active={activeTab === "emr"}
              onClick={() => setActiveTab("emr")}
            />
            <Tab
              label="Coding Review"
              badge="3 ข้อเสนอ"
              badgeClass="bg-amber-50 text-amber-700 border-amber-200"
              icon={ClipboardCheckIcon}
              active={activeTab === "coding"}
              onClick={() => setActiveTab("coding")}
            />
            <Tab
              label="Clinical Summary"
              active={activeTab === "clinical"}
              onClick={() => setActiveTab("clinical")}
            />
            <Tab
              label="Claim & DRG"
              active={activeTab === "claim"}
              onClick={() => setActiveTab("claim")}
            />
            <Tab
              label="Audit Trail"
              active={activeTab === "audit"}
              onClick={() => setActiveTab("audit")}
            />
          </div>
        </div>
      </section>

      {/* Tab Content Display */}
      {activeTab === "patient" && (
        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.95fr)_minmax(22rem,1fr)]">
          <div className="space-y-4">
            <Card className="rounded-xl border border-[#edf0f5] p-4 shadow-none">
              <h2 className="mb-3 text-base font-semibold text-foreground">
                ข้อมูลผู้ป่วยและการเข้ารับการรักษา
              </h2>
              <div className="overflow-hidden rounded-lg border border-[#edf0f5]">
                <div className="grid grid-cols-1 divide-y divide-[#edf0f5] sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
                  {patientSummary.map((group, index) => (
                    <div key={index} className="space-y-3 p-3.5">
                      {group.map(([label, value]) => (
                        <div key={label}>
                          <p className="text-xs font-semibold text-muted-foreground">{label}</p>
                          <p className="mt-1 text-sm font-medium leading-5 text-foreground">{value}</p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 divide-y border-t border-[#edf0f5] sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
                  {admissionDetails.map(([label, value]) => (
                    <div key={label} className="p-3.5">
                      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
                      <p className="mt-1 text-sm font-medium leading-5 text-foreground">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(17rem,0.8fr)]">
              <Card className="rounded-xl border border-[#edf0f5] p-4 shadow-none">
                <h2 className="text-base font-semibold text-foreground">ข้อมูลทางการแพทย์ที่สำคัญ</h2>
                <div className="mt-3 space-y-2 text-sm">
                  <MedicalRow label="Principal Dx" code="M16.1" detail="Osteoarthritis of hip" />
                  <MedicalRow label="Secondary Dx" code="I10" detail="Essential (primary) hypertension" />
                  <MedicalRow label="" code="E66.01" detail="Morbid (severe) obesity due to excess calories" />
                  <MedicalRow label="Procedure" code="0SBT0ZZ" detail="Total hip replacement" />
                  <MedicalRow label="อาการสำคัญ/ประวัติย่อ" detail="ปวดสะโพกขวาเรื้อรัง เดินลำบาก ข้อเสื่อมมากขึ้น" />
                  <MedicalRow
                    label="ข้อมูลสนับสนุนสำคัญ"
                    detail="X-ray hip: Severe OA right hip · Pre-op eval: cleared for surgery"
                  />
                </div>
              </Card>

              <Card className="rounded-xl border border-[#edf0f5] p-4 shadow-none">
                <h2 className="text-base font-semibold text-foreground">เอกสารและเส้นเวลา</h2>
                <div className="mt-4 space-y-4">
                  <TimelineItem
                    title="Admit"
                    date="15 พ.ค. 2567 09:15 น."
                    detail="อาการ: ปวดสะโพกขวาเรื้อรัง"
                    color="bg-primary"
                  />
                  <TimelineItem
                    title="Procedure"
                    date="16 พ.ค. 2567 13:30 น."
                    detail="0S8T0ZZ Total hip replacement"
                    color="bg-emerald-500"
                  />
                  <TimelineItem
                    title="Discharge"
                    date="20 พ.ค. 2567 11:20 น."
                    detail="อาการดี ไม่มีภาวะแทรกซ้อน"
                    color="bg-amber-500"
                  />
                  <TimelineItem
                    title="Coder Review"
                    date="20 พ.ค. 2567 14:05 น."
                    detail="ผู้ทำรหัส: น.ส.กานตรวณ"
                    color="bg-violet-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("emr")}
                  className="mt-5 flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-primary/20 bg-primary/5 text-xs font-semibold text-primary transition hover:bg-primary/10 cursor-pointer"
                >
                  <PaperclipIcon className="size-4" /> ดูเอกสารแนบใน EMR Viewer (5)
                </button>
              </Card>
            </section>

            <Card className="rounded-xl border border-[#edf0f5] p-4 shadow-none">
              <h2 className="text-base font-semibold text-foreground">ข้อมูลค่าใช้จ่ายและการจัดกลุ่ม DRG</h2>
              <div className="mt-4 grid grid-cols-2 divide-x divide-border md:grid-cols-5">
                <SummaryValue label="DRG (คาดการณ์)" value="I02Z" detail="Major Hip Joint Replacement" />
                <SummaryValue label="RW" value="2.2234" />
                <SummaryValue label="AdjRW (คาดการณ์)" value="2.7890" />
                <SummaryValue label="ค่าใช้จ่ายรวม (บาท)" value="142,350.00" />
                <SummaryValue label="ค่าตอบแทนที่คาดหวัง" value="108,720.00 บาท" />
              </div>
              <div className="mt-4 rounded-xl bg-muted/60 p-3">
                <p className="text-xs font-semibold text-muted-foreground">เปรียบเทียบก่อน / หลัง (จาก AI Suggestion)</p>
                <div className="mt-3 grid grid-cols-[1fr_auto_1fr] gap-3">
                  <CompareBox title="ก่อน (ปัจจุบัน)" adjrw="2.2234" amount="68,450 บาท" />
                  <ArrowRightIcon className="my-auto size-5 text-primary" />
                  <CompareBox
                    title="หลัง (หากปรับแก้)"
                    adjrw="2.7890 (+0.5656)"
                    amount="108,720 บาท (+40,270)"
                    positive
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Right Sidebar: Smart Alerts, AI Suggestion & Actions */}
          <aside className="space-y-4">
            <Card className="rounded-xl border border-rose-200 bg-rose-50/40 p-4 shadow-none">
              <Header
                icon={BellRingIcon}
                title="Smart Alert"
                tone="text-rose-600"
                badge="ทั้งหมด 4"
                badgeClass="border-rose-200 text-rose-600"
              />
              <div className="mt-3 space-y-2">
                {alerts.map(([code, detail, severity, tone]) => (
                  <div key={code} className="grid grid-cols-[1.5rem_1fr_auto] gap-2 text-xs">
                    <b className="text-foreground">{code}</b>
                    <p className="text-muted-foreground">{detail}</p>
                    <span
                      className={`rounded-md px-2 py-0.5 font-semibold ${
                        tone === "rose" ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"
                      }`}
                    >
                      {severity}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="rounded-xl border border-violet-200 bg-violet-50/30 p-4 shadow-none">
              <Header
                icon={SparklesIcon}
                title="AI Suggestion"
                tone="text-violet-700"
                badge="Confidence 86%"
                badgeClass="border-indigo-200 text-indigo-600"
              />
              <p className="mt-3 text-sm leading-6 text-foreground">
                แนะนำให้ทบทวนการวินิจฉัยหลักเป็น M16.11 และเพิ่มรหัส E66.01 (Morbid obesity) เป็น Secondary Dx
                เนื่องจากพบหลักฐานในบันทึก pre-operative และผลการประเมินก่อนผ่าตัด
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("emr")}
                className="mt-3 flex w-full items-center justify-between rounded-lg border border-violet-200 bg-white px-3 py-2 text-xs font-semibold text-primary transition hover:bg-violet-50 cursor-pointer"
              >
                ดูเหตุผลและหลักฐานใน EMR Viewer <ChevronRightIcon className="size-4" />
              </button>
            </Card>

            <Card className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-none">
              <Header icon={TrendingUpIcon} title="Impact Estimate" tone="text-emerald-700" />
              <div className="mt-4 grid grid-cols-2 divide-x divide-emerald-200 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">เพิ่มขึ้นของ AdjRW</p>
                  <p className="mt-1 text-xl font-bold text-emerald-700">+0.5656</p>
                  <p className="text-xs text-emerald-600">(25.4%)</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">เพิ่มขึ้นของค่าตอบแทน</p>
                  <p className="mt-1 text-xl font-bold text-emerald-700">+40,270</p>
                  <p className="text-xs text-emerald-600">บาท (58.8%)</p>
                </div>
              </div>
            </Card>

            <Card className="rounded-xl border border-violet-200 bg-violet-50/30 p-4 shadow-none">
              <h2 className="text-base font-semibold text-foreground">การดำเนินการ</h2>
              <button
                type="button"
                onClick={() => setActiveTab("coding")}
                className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 cursor-pointer"
              >
                <CheckIcon className="size-4" /> ไปที่ Coding Review เพื่อยืนยัน
              </button>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="flex h-9 items-center justify-center gap-1 rounded-lg border border-border bg-white text-xs font-semibold text-primary transition hover:bg-muted cursor-pointer"
                >
                  <BookmarkIcon className="size-4" /> บันทึกเป็นติดตาม
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("coding")}
                  className="flex h-9 items-center justify-center gap-1 rounded-lg border border-border bg-white text-xs font-semibold text-primary transition hover:bg-muted cursor-pointer"
                >
                  <ClipboardCheckIcon className="size-4" /> ส่ง Coding Review
                </button>
              </div>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                กรุณายืนยันหลังตรวจสอบข้อมูลและเอกสารประกอบครบถ้วน
              </p>
            </Card>
          </aside>
        </section>
      )}

      {activeTab === "emr" && <EmrViewerTab onSwitchTab={setActiveTab} />}

      {activeTab === "coding" && <CodingReviewTab onSwitchTab={setActiveTab} />}

      {activeTab === "clinical" && <ClinicalSummaryTab onSwitchTab={setActiveTab} />}

      {activeTab === "claim" && <ClaimDrgTab onSwitchTab={setActiveTab} />}

      {activeTab === "audit" && <AuditTrailTab onSwitchTab={setActiveTab} />}
    </div>
  )
}

function Tab({ label, active, onClick, icon: Icon, badge, badgeClass, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition cursor-pointer ${
        active
          ? "border-primary text-primary font-semibold"
          : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
      } ${className}`}
    >
      {Icon && <Icon className="size-4" />}
      <span>{label}</span>
      {badge && (
        <span className={`rounded-full border px-2 py-0.2 text-[11px] font-semibold ${badgeClass || "bg-muted text-muted-foreground"}`}>
          {badge}
        </span>
      )}
    </button>
  )
}

function MedicalRow({ label, code, detail }) {
  return (
    <div className="grid grid-cols-[8.5rem_minmax(0,1fr)] border border-[#edf0f5]">
      <p className="border-r border-[#edf0f5] bg-muted/45 px-3 py-3 text-xs font-semibold text-muted-foreground">
        {label || "—"}
      </p>
      <p className="px-3 py-3 text-sm leading-5 text-foreground">
        {code && <b className="mr-3 text-primary">{code}</b>}
        {detail}
      </p>
    </div>
  )
}

function TimelineItem({ title, date, detail, color }) {
  return (
    <div className="relative flex gap-3 pb-4 last:pb-0">
      <div className="relative z-10 flex w-6 shrink-0 justify-center">
        <span className={`grid size-6 place-items-center rounded-full ${color} ring-4 ring-white`}>
          <span className="size-2 rounded-full bg-white" />
        </span>
        {title !== "Coder Review" && (
          <span className="absolute top-6 h-[calc(100%+0.25rem)] w-px bg-border" />
        )}
      </div>
      <div className="min-w-0 flex-1 pb-0.5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
          <b className="text-sm font-semibold text-foreground">{title}</b>
          <span className="text-[11px] text-muted-foreground">{date}</span>
        </div>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
      </div>
    </div>
  )
}

function SummaryValue({ label, value, detail }) {
  return (
    <div className="p-3">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-bold text-foreground">{value}</p>
      {detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}
    </div>
  )
}

function CompareBox({ title, adjrw, amount, positive }) {
  return (
    <div className="rounded-lg border border-border bg-white p-3">
      <p className="text-xs font-semibold text-muted-foreground">{title}</p>
      <p className="mt-2 text-xs text-muted-foreground">
        AdjRW <b className={`float-right text-sm ${positive ? "text-emerald-600" : "text-foreground"}`}>{adjrw}</b>
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        ค่าตอบแทน <b className={`float-right text-sm ${positive ? "text-emerald-600" : "text-foreground"}`}>{amount}</b>
      </p>
    </div>
  )
}

function Header({ icon: Icon, title, tone, badge, badgeClass }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className={`flex items-center gap-2 text-base font-semibold ${tone}`}>
        <Icon className="size-4" />
        {title}
      </h2>
      {badge && <span className={`rounded-md border bg-white px-2 py-1 text-xs font-semibold ${badgeClass}`}>{badge}</span>}
    </div>
  )
}
