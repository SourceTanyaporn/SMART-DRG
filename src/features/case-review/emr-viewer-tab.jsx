import { useState } from "react"
import {
  FileTextIcon,
  FileSearchIcon,
  PanelRightOpenIcon,
  CheckIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  SearchIcon,
  EyeIcon,
  SparklesIcon,
  ExternalLinkIcon,
  BookOpenIcon,
  ChevronRightIcon
} from "lucide-react"
import { Card } from "@/components/ui/card"

const documentsData = [
  {
    id: "progress",
    title: "Progress Note",
    date: "17 พ.ค. 2567 08:45 น.",
    author: "นพ.วัชรพล ศิริกุล (ศัลยแพทย์)",
    status: "มีหลักฐานสำคัญ",
    statusType: "success",
    alertsCount: 2,
    content: (
      <div className="space-y-4 text-sm leading-7 text-foreground">
        <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">บันทึกความก้าวหน้าการรักษา:</span> ผู้ป่วยหญิงไทย 46 ปี Admit เพื่อวางแผนผ่าตัดเปลี่ยนข้อสะโพกเทียมขวา
        </div>
        <p>
          ผู้ป่วยมีอาการปวดสะโพกขวาเรื้อรังมานานกว่า 2 ปี วินิจฉัย <mark className="rounded bg-primary/15 px-1.5 py-0.5 font-semibold text-primary">osteoarthritis of right hip (M16.1)</mark> มีอาการเดินกะเผลกและเจ็บตลอดเวลา ไม่ตอบสนองต่อการรักษาทางยา
        </p>
        <p>
          ประวัติโรคประจำตัว: มีประวัติ <mark className="rounded bg-amber-100 px-1.5 py-0.5 font-semibold text-amber-800">hypertension (I10) รับประทานยา Amlodipine 5mg ต่อเนื่อง</mark> โดยแพทย์วิสัญญีและอายุรแพทย์ประเมินความดันโลหิตและให้เฝ้าระวังระหว่างผ่าตัด
        </p>
        <p>
          ผลการตรวจทางกายภาพ: น้ำหนัก 94 กิโลกรัม ส่วนสูง 156 ซม. คำนวณ <mark className="rounded bg-rose-100 px-1.5 py-0.5 font-semibold text-rose-800">BMI = 38.6 kg/m² เข้าเกณฑ์ Morbid (severe) Obesity (E66.01)</mark> ซึ่งเป็นปัจจัยเพิ่มความเสี่ยงในการให้ยาระงับความรู้สึกและการฟื้นตัวหลังผ่าตัด
        </p>
        <p>
          วันที่ 17 พ.ค. 2567 เวลา 08:45 น. ได้ทำหัตถการ <mark className="rounded bg-primary/15 px-1.5 py-0.5 font-semibold text-primary">Total hip replacement, right side (0SBT0ZZ)</mark> เรียบร้อย ไม่มีภาวะแทรกซ้อนเฉียบพลัน เสียเลือดประมาณ 250 ml ได้รับการให้สารน้ำและสังเกตอาการที่ห้องพักฟื้น
        </p>
      </div>
    ),
  },
  {
    id: "admission",
    title: "Admission Note",
    date: "15 พ.ค. 2567 09:15 น.",
    author: "พญ.อรัญญา วัฒนศักดิ์ (แพทย์ประจำบ้าน)",
    status: "อ่านแล้ว",
    statusType: "default",
    alertsCount: 1,
    content: (
      <div className="space-y-4 text-sm leading-7 text-foreground">
        <p>
          <strong>Chief Complaint:</strong> ปวดสะโพกขวา เดินลำบาก ข้อสะโพกติดขัด 6 เดือนก่อนมารพ.
        </p>
        <p>
          <strong>Present Illness:</strong> ผู้ป่วยหญิง 46 ปี เป็น OA right hip ตรวจติดตามที่ Ortho clinic อาการปวดรุนแรงขึ้นเรื่อยๆ เดินได้ระยะสั้น นั่งยองไม่ได้ X-ray พบ Severe Joint space narrowing จึงนัด Admit เพื่อทำ Elective Right Total Hip Arthroplasty
        </p>
        <p>
          <strong>Past Medical History:</strong> Known case HT 5 ปี กินยาสม่ำเสมอ, ปฏิเสธ DM, ปฏิเสธโรคไต
        </p>
        <p>
          <strong>Physical Exam:</strong> Vitals stable, BP 138/85 mmHg, PR 76 bpm, BMI 38.6 kg/m². Right hip limited ROM with severe groin pain on internal rotation.
        </p>
      </div>
    ),
  },
  {
    id: "procedure",
    title: "Operative / Procedure Note",
    date: "17 พ.ค. 2567 08:45 - 10:30 น.",
    author: "นพ.วัชรพล ศิริกุล",
    status: "มีหลักฐานสำคัญ",
    statusType: "success",
    alertsCount: 1,
    content: (
      <div className="space-y-4 text-sm leading-7 text-foreground">
        <p><strong>Pre-operative Diagnosis:</strong> Severe Osteoarthritis, Right Hip</p>
        <p><strong>Post-operative Diagnosis:</strong> Severe Osteoarthritis, Right Hip with Morbid Obesity</p>
        <p><strong>Procedure Performed:</strong> Right Total Hip Arthroplasty (Cementless prosthesis)</p>
        <p><strong>Anesthesia:</strong> Spinal with epidural anesthesia</p>
        <p><strong>Operative Findings:</strong> Complete loss of articular cartilage at right femoral head and acetabular roof. Marginal osteophytes present. Acetabular cup size 50 mm, Femoral stem size 4 cemented with perfect stability.</p>
        <p><strong>Complications:</strong> None. Estimated blood loss 250 ml.</p>
      </div>
    ),
  },
  {
    id: "discharge",
    title: "Discharge Summary",
    date: "20 พ.ค. 2567 11:20 น.",
    author: "นพ.วัชรพล ศิริกุล",
    status: "รอตรวจยืนยัน",
    statusType: "warning",
    alertsCount: 1,
    content: (
      <div className="space-y-4 text-sm leading-7 text-foreground">
        <p><strong>Principal Diagnosis:</strong> M16.1 - Other primary arthrosis of hip (Right)</p>
        <p><strong>Secondary Diagnosis:</strong> I10 - Essential (primary) hypertension</p>
        <p className="rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-amber-900">
          <strong>AI Note:</strong> แนะนำเพิ่มรหัส <code>E66.01 Morbid (severe) obesity due to excess calories</code> ลงใน Secondary Diagnosis ตามหลักฐานใน Progress Note & Anesthetic Record
        </p>
        <p><strong>Main Operating/Procedure:</strong> 0SBT0ZZ - Total Hip Replacement, Right</p>
        <p><strong>Discharge Status:</strong> Improved, Home with walker support</p>
        <p><strong>Follow up:</strong> 2 สัปดาห์ ที่ Orthopedic Clinic</p>
      </div>
    ),
  },
  {
    id: "lab",
    title: "Lab & Imaging Reports",
    date: "15-17 พ.ค. 2567",
    author: "ห้องปฏิบัติการกลาง / รังสีวิทยา",
    status: "แนบแล้ว",
    statusType: "default",
    alertsCount: 0,
    content: (
      <div className="space-y-4 text-sm leading-7 text-foreground">
        <div className="rounded-lg border border-border p-3">
          <p className="font-semibold text-foreground">X-ray Pelvis & Right Hip AP/Lateral:</p>
          <p className="text-muted-foreground">Severe narrowing of right hip joint space with sclerosis and subchondral cyst formation. Compatible with severe right hip osteoarthritis.</p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="font-semibold text-foreground">Pre-op Lab Results:</p>
          <p className="text-muted-foreground">Hb 13.2 g/dL, Hct 40.1%, WBC 6,800 /uL, Plt 245,000 /uL, Cr 0.82 mg/dL, eGFR 88 ml/min, FBS 96 mg/dL, Na 140, K 4.1, Cl 102, HCO3 24</p>
        </div>
      </div>
    ),
  },
]

export function EmrViewerTab({ onSwitchTab }) {
  const [selectedDocId, setSelectedDocId] = useState("progress")
  const [searchQuery, setSearchQuery] = useState("")

  const activeDoc = documentsData.find((d) => d.id === selectedDocId) || documentsData[0]

  return (
    <div className="space-y-4">
      {/* Overview Banner */}
      <section className="rounded-xl border border-primary/20 bg-linear-to-r from-primary/5 via-sky-50/40 to-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-lg bg-primary text-white shadow-sm">
              <FileSearchIcon className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground">EMR Evidence Viewer (เวชระเบียนผู้ป่วย)</h2>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  ตรวจหลักฐาน DRG
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                ผู้ป่วย: นางสาววันหน้า ใจดี · AN 670520-00123 · HN 0012345 · Admit 15-20 พ.ค. 2567
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSwitchTab?.("coding")}
              className="flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-primary/90 cursor-pointer"
            >
              <PanelRightOpenIcon className="size-4" />
              ไปที่ Coding Review
              <ChevronRightIcon className="size-4" />
            </button>
          </div>
        </div>

        {/* Coder Guide Flow */}
        <div className="mt-3.5 grid gap-2.5 border-t border-primary/10 pt-3 sm:grid-cols-3 text-xs">
          <div className="flex items-center gap-2 rounded-lg bg-white/80 p-2 border border-primary/10">
            <span className="grid size-5 place-items-center rounded-full bg-emerald-500 text-white font-bold text-[10px]">✓</span>
            <div>
              <p className="font-semibold text-foreground">1. เอกสารที่ระบุรหัส</p>
              <p className="text-muted-foreground text-[11px]">เลือกดู Note ที่ AI ไฮไลท์</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white p-2 border border-primary/30 shadow-xs">
            <span className="grid size-5 place-items-center rounded-full bg-primary text-white font-bold text-[10px]">2</span>
            <div>
              <p className="font-semibold text-primary">2. ตรวจหลักฐานเวชระเบียน</p>
              <p className="text-muted-foreground text-[11px]">ตรวจคำวินิจฉัยและ BMI</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white/80 p-2 border border-primary/10">
            <span className="grid size-5 place-items-center rounded-full bg-muted text-muted-foreground font-bold text-[10px]">3</span>
            <div>
              <p className="font-semibold text-foreground">3. ส่ง Coding Review</p>
              <p className="text-muted-foreground text-[11px]">Approve / Reject รหัส</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main 3-Column Viewer Workspace */}
      <section className="grid gap-4 xl:grid-cols-[15rem_minmax(0,1fr)_18rem]">
        {/* Left Column: Document Navigation */}
        <Card className="rounded-xl border border-[#edf0f5] p-3.5 shadow-none space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-xs font-bold text-foreground uppercase tracking-wider">
              <FileTextIcon className="size-4 text-primary" />
              เอกสารในแฟ้ม ({documentsData.length})
            </h3>
          </div>

          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="ค้นหาเอกสาร..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-full rounded-lg border border-border bg-muted/30 pl-8 pr-3 text-xs outline-none focus:border-primary focus:bg-white"
            />
          </div>

          <div className="space-y-1.5">
            {documentsData
              .filter((doc) => doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || doc.author.includes(searchQuery))
              .map((doc) => {
                const isSelected = doc.id === activeDoc.id
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`w-full rounded-lg p-2.5 text-left transition cursor-pointer ${
                      isSelected
                        ? "border border-primary/20 bg-primary/10 shadow-xs"
                        : "border border-transparent hover:bg-muted/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <p className={`text-xs font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>
                        {doc.title}
                      </p>
                      {doc.alertsCount > 0 && (
                        <span className="rounded bg-rose-100 px-1.5 py-0.2 text-[10px] font-bold text-rose-700">
                          {doc.alertsCount}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground line-clamp-1">{doc.author}</p>
                    <div className="mt-1.5 flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">{doc.date.split(" ")[0]} {doc.date.split(" ")[1]}</span>
                      <span
                        className={`rounded px-1.5 py-0.5 font-medium ${
                          doc.statusType === "success"
                            ? "bg-emerald-50 text-emerald-700"
                            : doc.statusType === "warning"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {doc.status}
                      </span>
                    </div>
                  </button>
                )
              })}
          </div>
        </Card>

        {/* Center Column: Active Document Reading Pane */}
        <Card className="rounded-xl border border-[#edf0f5] p-5 shadow-none flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">{activeDoc.title}</h3>
                <p className="text-xs text-muted-foreground">
                  ผู้บันทึก: {activeDoc.author} · วันที่บันทึก: {activeDoc.date}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  <SparklesIcon className="size-3.5" />
                  AI ไฮไลท์หลักฐานอัตโนมัติ
                </span>
              </div>
            </div>

            {/* Document Content View */}
            <div className="rounded-lg bg-card p-4 ring-1 ring-[#edf0f5]">
              {activeDoc.content}
            </div>

            {/* AI Evidence Alert Callout Box */}
            <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <AlertCircleIcon className="size-4 text-amber-600" />
                ข้อสังเกตจากระบบ Smart DRG สำหรับเอกสารนี้
              </div>
              <p className="leading-5">
                พบหลักฐานการวินิจฉัย <b>M16.1 (OA Hip)</b> และ <b>E66.01 (Morbid obesity, BMI 38.6)</b> ในบันทึก Progress note ซึ่งมีความสมบูรณ์เพียงพอสำหรับการให้รหัสโรคร่วม (Secondary Diagnosis) ที่มีผลต่อการจัดกลุ่ม DRG
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
            <span>เอกสารผ่านการลงลายมือชื่อดิจิทัล (Digital Signature Verified)</span>
            <button
              type="button"
              className="flex items-center gap-1 font-semibold text-primary hover:underline cursor-pointer"
            >
              <ExternalLinkIcon className="size-3.5" />
              เปิดดูไฟล์ PDF ต้นฉบับ
            </button>
          </div>
        </Card>

        {/* Right Column: DRG Evidence Summary & Action */}
        <div className="space-y-4">
          <Card className="rounded-xl border border-primary/20 bg-primary/[0.025] p-4 shadow-none space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <CheckCircle2Icon className="size-4 text-primary" />
              สรุปหลักฐานเพื่อจัดรหัส DRG
            </h3>
            <p className="text-xs text-muted-foreground leading-5">
              ตรวจสอบความสอดคล้องของหลักฐานในเวชระเบียนกับรหัสที่แนะนำ
            </p>

            <div className="space-y-2.5 pt-1">
              <div className="rounded-lg border border-primary/10 bg-white p-3 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-muted-foreground">Principal Dx</span>
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                    พบหลักฐานชัดเจน
                  </span>
                </div>
                <p className="text-xs font-bold text-foreground">M16.1 Osteoarthritis of hip</p>
                <p className="text-[11px] text-muted-foreground">ระบุใน Admission & Progress Note</p>
              </div>

              <div className="rounded-lg border border-primary/10 bg-white p-3 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-muted-foreground">Secondary Dx (แนะนำเพิ่ม)</span>
                  <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-800">
                    AI แนะนำ + หลักฐานครบ
                  </span>
                </div>
                <p className="text-xs font-bold text-primary">E66.01 Morbid obesity</p>
                <p className="text-[11px] text-muted-foreground">พบ BMI 38.6 kg/m² ใน Progress Note</p>
              </div>

              <div className="rounded-lg border border-primary/10 bg-white p-3 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-muted-foreground">Procedure</span>
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                    พบหลักฐานชัดเจน
                  </span>
                </div>
                <p className="text-xs font-bold text-foreground">0SBT0ZZ Total hip replacement</p>
                <p className="text-[11px] text-muted-foreground">มีบันทึก Operative Note ครบถ้วน</p>
              </div>

              <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-900">ผลกระทบต่อ AdjRW</span>
                  <span className="font-bold text-emerald-700">+0.5656</span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  เพิ่มค่าตอบแทนคาดการณ์ประมาณ <b>+40,270 บาท</b>
                </p>
              </div>
            </div>

            <div className="border-t border-primary/15 pt-3">
              <button
                type="button"
                onClick={() => onSwitchTab?.("coding")}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-xs font-bold text-white shadow-sm transition hover:bg-primary/90 cursor-pointer"
              >
                <PanelRightOpenIcon className="size-4" />
                ส่งผลตรวจไป Coding Review
              </button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}
