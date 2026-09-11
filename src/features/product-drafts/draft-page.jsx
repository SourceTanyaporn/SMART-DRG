import {
  ArrowRightIcon,
  CheckIcon,
  CheckCircle2Icon,
  CircleAlertIcon,
  ClipboardCheckIcon,
  FileSearchIcon,
  FileTextIcon,
  MoveRightIcon,
  PanelRightOpenIcon,
  StethoscopeIcon,
  TrendingUpIcon,
} from "lucide-react"

import { Card } from "@/components/ui/card"

const pageContent = {
  emr: {
    icon: StethoscopeIcon,
    eyebrow: "Draft · EMR evidence workspace",
    title: "EMR Case Viewer",
    description: "อ่านข้อมูลเวชระเบียนที่เกี่ยวข้องกับการตรวจ DRG โดยไม่ต้องสลับไปหลายระบบ",
    steps: ["เลือกเคสจาก Worklist", "ดู timeline และหลักฐาน", "ส่งไป Coding Review"],
    leftTitle: "Patient timeline",
    leftItems: ["15 พ.ค. 09:24  Admit: Orthopedic ward", "16 พ.ค. 11:10  X-ray / Pre-op assessment", "17 พ.ค. 08:45  Total hip replacement", "20 พ.ค. 14:30  Discharge summary signed"],
    rightTitle: "Evidence for DRG review",
    rightItems: ["Principal diagnosis: Osteoarthritis of hip", "Procedure note: Total hip replacement", "Comorbidity note: Hypertension documented", "Discharge summary: LOS 5 days"],
  },
  coding: {
    icon: ClipboardCheckIcon,
    eyebrow: "Draft · human-in-the-loop coding",
    title: "Coding Review",
    description: "รวมข้อเสนอแนะจาก AI และ rule ให้ coder ตรวจหลักฐานก่อน approve หรือ reject",
    steps: ["AI เสนอรหัส", "Coder ตรวจ EMR evidence", "Approve พร้อมเหตุผล"],
    leftTitle: "Coding candidates",
    leftItems: ["I10  Essential hypertension  · confidence 92%", "E11.9  Type 2 diabetes  · confidence 86%", "D62  Acute posthemorrhagic anemia  · confidence 71%"],
    rightTitle: "Review decision",
    rightItems: ["Evidence coverage: 3 of 4 required notes", "Projected AdjRW: 2.2234 → 2.7890", "Estimated reimbursement impact: +22,270 บาท", "Reviewer note: รอตรวจสอบ discharge summary"],
  },
  claims: {
    icon: CircleAlertIcon,
    eyebrow: "Draft · claim risk control",
    title: "Claim & Alerts",
    description: "จัดลำดับเคสที่เสี่ยงถูกตีกลับหรือมีความคลาดเคลื่อนก่อนส่งเคลม",
    steps: ["ระบบตรวจ rule", "จัดลำดับตามผลกระทบ", "ส่งแก้ไขก่อน claim"],
    leftTitle: "Priority queue",
    leftItems: ["High · AN 670520-00123 · Missing supporting diagnosis", "High · AN 670520-00127 · Cost / RW mismatch", "Medium · AN 670520-00124 · LOS outlier", "Medium · AN 670520-00126 · Procedure documentation"],
    rightTitle: "Claim readiness",
    rightItems: ["Ready to submit: 424 cases", "Need coder review: 68 cases", "Missing documents: 12 cases", "Potential revenue at risk: 1,245,350 บาท"],
  },
  revenue: {
    icon: TrendingUpIcon,
    eyebrow: "Draft · financial operations",
    title: "Revenue & Risk",
    description: "ติดตามผลกระทบทางรายได้จากความเสี่ยงของ DRG และงานแก้ไขที่ทำเสร็จแล้ว",
    steps: ["เห็นรายได้เสี่ยง", "ติดตามงานแก้ไข", "วัด recovered revenue"],
    leftTitle: "Revenue performance",
    leftItems: ["Expected revenue: 1,864,200 บาท", "Actual revenue: 1,342,850 บาท", "Current gap: 521,350 บาท", "Recovered this month: 186,420 บาท"],
    rightTitle: "Risk drivers",
    rightItems: ["Documentation gap: 42%", "Coding variance: 31%", "LOS / cost outlier: 18%", "Pending clinical review: 9%"],
  },
}

export function ProductDraftPage({ type }) {
  if (type === "emr") return <EmrViewerDraft />
  if (type === "coding") return <CodingReviewDraft />

  const content = pageContent[type]
  const Icon = content.icon

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl border border-primary/20 bg-linear-to-br from-primary/15 via-card to-card p-6 shadow-2xs">
        <p className="text-xs font-semibold tracking-wider text-primary uppercase">{content.eyebrow}</p>
        <div className="mt-3 flex items-start gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20"><Icon className="size-6" /></div>
          <div><h1 className="text-2xl font-bold text-foreground">{content.title}</h1><p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{content.description}</p></div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-2 text-xs font-medium text-foreground">
          {content.steps.map((step, index) => <span key={step} className="flex items-center gap-2">{index > 0 && <ArrowRightIcon className="size-3 text-primary" />}<span className="rounded-full border border-border bg-card px-3 py-1.5 text-foreground shadow-2xs">{step}</span></span>)}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <DraftCard title={content.leftTitle} icon={FileTextIcon} items={content.leftItems} />
        <DraftCard title={content.rightTitle} icon={CheckCircle2Icon} items={content.rightItems} accent />
      </section>
    </div>
  )
}

function CodingReviewDraft() {
  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-border bg-card p-5">
        <p className="text-xs font-medium text-muted-foreground">DRG Worklist <MoveRightIcon className="mx-1 inline size-3" /> Case Review <MoveRightIcon className="mx-1 inline size-3" /> Coding Review</p>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-xl font-bold text-foreground">Coding Review <span className="ml-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">รอตัดสินใจ</span></h1><p className="mt-1 text-sm text-muted-foreground">นายสมชาย ใจดี · AN 670520-00123 · DRG ปัจจุบัน I70Z</p></div><p className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-2 text-sm font-semibold text-primary">3 ข้อเสนอแนะรอตรวจ</p></div>
      </section>

      <section className="rounded-xl border border-primary/15 bg-primary/[0.035] p-4"><p className="text-xs font-semibold tracking-wider text-primary uppercase">หน้าที่ของ Coder</p><div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-foreground"><span>ตรวจรหัสที่ระบบเสนอ</span><MoveRightIcon className="size-4 text-primary" /><span>เปิดหลักฐานจาก Case Review</span><MoveRightIcon className="size-4 text-primary" /><span className="font-semibold">Approve หรือ Reject พร้อมเหตุผล</span></div></section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="rounded-xl border border-border p-5 shadow-none">
          <div className="flex items-center justify-between"><div><h2 className="text-base font-semibold text-foreground">รายการรหัสที่ต้องตัดสินใจ</h2><p className="mt-1 text-xs text-muted-foreground">AI ไม่ได้เพิ่มรหัสอัตโนมัติ — Coder เป็นผู้ยืนยันผลสุดท้าย</p></div><span className="text-xs text-muted-foreground">3 รายการ</span></div>
          <div className="mt-4 overflow-hidden rounded-xl border border-border">
            <div className="grid grid-cols-[minmax(12rem,1.1fr)_minmax(10rem,1fr)_8rem] gap-3 bg-muted/70 px-4 py-3 text-xs font-semibold text-muted-foreground"><span>ข้อเสนอแนะ</span><span>หลักฐาน / ความมั่นใจ</span><span className="text-center">การตัดสินใจ</span></div>
            <CodingRow code="I10" diagnosis="Essential hypertension" reason="Progress note + medication list" confidence="92%" decision="Approve" decisionClass="bg-emerald-600 text-white" />
            <CodingRow code="E66.01" diagnosis="Morbid obesity" reason="BMI 38.4, anesthetic assessment" confidence="86%" decision="Review" decisionClass="border border-primary/20 bg-primary/5 text-primary" active />
            <CodingRow code="D62" diagnosis="Acute posthemorrhagic anemia" reason="ไม่มีหลักฐานใน discharge summary" confidence="71%" decision="Reject" decisionClass="border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400" />
          </div>
          <section className="mt-5 rounded-xl border border-primary/15 bg-primary/[0.025] p-4"><div className="flex items-center gap-2"><FileSearchIcon className="size-4 text-primary" /><h3 className="text-sm font-semibold text-foreground">กำลังตรวจ: E66.01 Morbid obesity</h3></div><p className="mt-2 text-sm leading-6 text-foreground">พบ BMI 38.4 และบันทึกใน pre-operative assessment ว่า obesity มีผลต่อการประเมินก่อนผ่าตัด</p><div className="mt-3 flex flex-wrap gap-2"><span className="rounded-md bg-card px-2.5 py-1.5 text-xs font-medium text-primary ring-1 ring-primary/20">ดูหลักฐานจาก Case Review</span><span className="rounded-md bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground ring-1 ring-border">เพิ่มเหตุผลของ coder</span></div></section>
        </Card>

        <div className="space-y-4"><Card className="rounded-xl border border-border p-5 shadow-none"><h2 className="text-base font-semibold text-foreground">ผลกระทบหลังยืนยัน</h2><div className="mt-4 space-y-3"><ImpactItem label="DRG" before="I70Z" after="I02Z" /><ImpactItem label="AdjRW" before="2.2234" after="2.7890" /><ImpactItem label="ค่าชดเชยโดยประมาณ" before="68,450 บาท" after="108,720 บาท" /></div><div className="mt-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-center text-emerald-700 dark:text-emerald-300"><p className="text-xs">เพิ่มขึ้นโดยประมาณ</p><p className="mt-1 text-xl font-bold">+40,270 บาท</p></div></Card><Card className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-5 shadow-none"><h2 className="text-sm font-semibold text-violet-600 dark:text-violet-300">ก่อนส่งผลตรวจ</h2><ul className="mt-3 space-y-2 text-xs text-foreground"><li className="flex gap-2"><CheckIcon className="size-4 text-emerald-500" />Coder ตรวจครบ 3 ข้อเสนอ</li><li className="flex gap-2"><CheckIcon className="size-4 text-emerald-500" />แนบเหตุผลสำหรับรายการที่ reject</li><li className="flex gap-2"><span className="mt-1 size-2 rounded-full bg-amber-500" />รอเลือกผลสำหรับ E66.01</li></ul><button type="button" className="mt-4 h-10 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 active:scale-[0.99] transition">ยืนยัน Coding Review</button></Card></div>
      </section>
    </div>
  )
}

function CodingRow({ code, diagnosis, reason, confidence, decision, decisionClass, active }) {
  return <div className={`grid grid-cols-[minmax(12rem,1.1fr)_minmax(10rem,1fr)_8rem] items-center gap-3 border-t border-border px-4 py-4 text-sm ${active ? "bg-primary/[0.025]" : ""}`}><div><p className="font-semibold text-foreground">{code} <span className="font-normal">{diagnosis}</span></p><p className="mt-1 text-xs text-muted-foreground">Secondary diagnosis proposal</p></div><div><p className="text-xs text-foreground">{reason}</p><p className="mt-1 text-xs font-semibold text-primary">Confidence {confidence}</p></div><div className="text-center"><span className={`inline-flex rounded-md px-2.5 py-1.5 text-xs font-semibold ${decisionClass}`}>{decision}</span></div></div>
}

function ImpactItem({ label, before, after }) {
  return <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-xs"><div><p className="text-muted-foreground">{label}</p><p className="mt-1 font-semibold text-foreground">{before}</p></div><MoveRightIcon className="size-4 text-primary" /><div><p className="text-muted-foreground">หลัง review</p><p className="mt-1 font-semibold text-emerald-600 dark:text-emerald-400">{after}</p></div></div>
}

function EmrViewerDraft() {
  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-border bg-card p-5">
        <p className="text-xs font-medium text-muted-foreground">DRG Worklist <MoveRightIcon className="mx-1 inline size-3" /> EMR Case Viewer</p>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div><h1 className="text-xl font-bold text-foreground">นายสมชาย ใจดี <span className="ml-2 text-sm font-medium text-muted-foreground">AN 670520-00123</span></h1><p className="mt-1 text-sm text-muted-foreground">ชาย, 65 ปี · Admit 15 พ.ค. 2567 · Major Hip Joint Replacement</p></div>
          <span className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 text-sm font-semibold text-rose-600 dark:text-rose-400">ความเสี่ยงสูง · 3 Alerts</span>
        </div>
      </section>

      <section className="rounded-xl border border-primary/15 bg-primary/[0.035] p-4">
        <p className="text-xs font-semibold tracking-wider text-primary uppercase">สิ่งที่ coder ทำในหน้านี้</p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <FlowStep number="1" title="เปิดเคสจาก Worklist" detail="ดูว่า Alert เตือนเรื่องอะไร" done />
          <FlowStep number="2" title="อ่านหลักฐานใน EMR" detail="ตรวจ note ที่ AI อ้างอิง" active />
          <FlowStep number="3" title="ส่งผลการตรวจ" detail="ไป Coding Review เพื่อ approve/reject" />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[13rem_minmax(0,1fr)_18rem]">
        <Card className="rounded-xl border border-border p-4 shadow-none">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground"><FileTextIcon className="size-4 text-primary" />1. เลือกเอกสาร</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">เลือกเฉพาะเอกสารที่เกี่ยวกับ Alert ไม่ต้องอ่านทั้งแฟ้ม</p>
          <div className="mt-4 space-y-1">
            <DocumentItem title="Admission note" status="อ่านแล้ว" />
            <DocumentItem title="Progress note" status="มีหลักฐาน" active />
            <DocumentItem title="Procedure note" status="มีหลักฐาน" active />
            <DocumentItem title="Discharge summary" status="รอตรวจ" />
            <DocumentItem title="Lab / Imaging" status="แนบแล้ว" />
          </div>
        </Card>

        <Card className="rounded-xl border border-border p-5 shadow-none">
          <div className="flex items-center justify-between gap-3"><div><h2 className="text-sm font-semibold text-foreground">2. อ่านหลักฐานในเวชระเบียน</h2><p className="mt-1 text-xs text-muted-foreground">Progress note · 17 พ.ค. 2567 · 08:45</p></div><span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">AI พบ 2 จุด</span></div>
          <div className="mt-5 space-y-4 text-sm leading-7 text-foreground">
            <p>ผู้ป่วยมีอาการปวดสะโพกขวาเรื้อรัง วินิจฉัย <mark className="rounded bg-primary/20 px-1 font-semibold text-primary">osteoarthritis of hip</mark> และรับไว้รักษาเพื่อผ่าตัด</p>
            <p>มีประวัติ <mark className="rounded bg-amber-500/20 px-1 font-semibold text-amber-700 dark:text-amber-300">hypertension รับประทานยาอย่างต่อเนื่อง</mark> โดยแพทย์เฝ้าระวังความดันระหว่างนอนโรงพยาบาล</p>
            <p>วันที่ 17 พ.ค. ทำ <mark className="rounded bg-primary/20 px-1 font-semibold text-primary">total hip replacement</mark> สำเร็จ ไม่มีภาวะแทรกซ้อน</p>
          </div>
          <div className="mt-5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-5 text-amber-700 dark:text-amber-300"><b>Alert A1:</b> พบหลักฐาน hypertension ใน progress note แล้ว — ตรวจต่อว่ามีการบันทึกใน discharge summary หรือไม่ ก่อนยืนยันเป็น secondary diagnosis</div>
        </Card>

        <Card className="rounded-xl border border-primary/20 bg-primary/[0.025] p-4 shadow-none">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground"><FileSearchIcon className="size-4 text-primary" />3. สรุปเพื่อ review</h2>
          <div className="mt-4 space-y-3"><ReviewItem title="Principal Dx" value="M16.1 · พบหลักฐาน" good /><ReviewItem title="Procedure" value="Total hip replacement · พบหลักฐาน" good /><ReviewItem title="Secondary Dx" value="I10 Hypertension · ต้องดู discharge summary" /><ReviewItem title="ผลกระทบ" value="AdjRW 2.2234 → 2.7890" /></div>
          <div className="mt-5 border-t border-primary/15 pt-4"><p className="text-xs leading-5 text-muted-foreground">เมื่ออ่านหลักฐานครบ ให้ส่งเคสพร้อมข้อสรุปไปให้ coder กด approve หรือ reject</p><button type="button" className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-primary text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 active:scale-[0.99] transition"><PanelRightOpenIcon className="size-4" />ส่งไป Coding Review</button></div>
        </Card>
      </section>
    </div>
  )
}

function FlowStep({ number, title, detail, done, active }) {
  return <div className={`rounded-lg border p-3 ${active ? "border-primary bg-card shadow-sm" : "border-primary/10 bg-card/70"}`}><div className="flex items-center gap-2"><span className={`grid size-5 place-items-center rounded-full text-xs font-bold ${done ? "bg-emerald-500 text-white" : active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{done ? <CheckIcon className="size-3" /> : number}</span><p className="text-sm font-semibold text-foreground">{title}</p></div><p className="mt-1 pl-7 text-xs text-muted-foreground">{detail}</p></div>
}

function DocumentItem({ title, status, active }) {
  return <button type="button" className={`w-full rounded-lg p-2.5 text-left transition-colors ${active ? "bg-primary/10" : "hover:bg-muted"}`}><p className="text-xs font-semibold text-foreground">{title}</p><p className={`mt-0.5 text-[11px] ${active ? "text-primary" : "text-muted-foreground"}`}>{status}</p></button>
}

function ReviewItem({ title, value, good }) {
  return <div className="rounded-lg border border-primary/10 bg-card p-2.5"><p className="text-xs font-semibold text-muted-foreground">{title}</p><p className={`mt-1 text-xs font-medium leading-5 ${good ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}>{value}</p></div>
}

function DraftCard({ title, icon: Icon, items, accent }) {
  return <Card className={`rounded-xl border p-5 shadow-none ${accent ? "border-primary/20 bg-primary/[0.025]" : "border-border bg-card"}`}><h2 className="flex items-center gap-2 text-base font-semibold text-foreground"><Icon className={`size-4 ${accent ? "text-primary" : "text-muted-foreground"}`} />{title}</h2><div className="mt-4 divide-y divide-border">{items.map((item) => <div key={item} className="flex items-start gap-3 py-3 text-sm"><span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${accent ? "bg-primary" : "bg-emerald-500"}`} /><p className="leading-5 text-foreground">{item}</p></div>)}</div></Card>
}
