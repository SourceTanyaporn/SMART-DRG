import { useState } from "react"
import {
  ClipboardCheckIcon,
  CheckIcon,
  XIcon,
  FileSearchIcon,
  MoveRightIcon,
  CheckCircle2Icon,
  AlertTriangleIcon,
  InfoIcon,
  SparklesIcon,
  RotateCcwIcon,
  SaveIcon
} from "lucide-react"
import { Card } from "@/components/ui/card"

const initialCandidates = [
  {
    id: "I10",
    code: "I10",
    diagnosis: "Essential (primary) hypertension",
    type: "Secondary Diagnosis",
    reason: "Progress note + Anesthesia assessment + ยารักษาประจำ",
    confidence: "92%",
    decision: "Approve",
    evidenceRef: "Progress Note (17 พ.ค.)",
    notes: "มีบันทึกประวัติความดันโลหิตสูงและยารักษาชัดเจน",
  },
  {
    id: "E66.01",
    code: "E66.01",
    diagnosis: "Morbid (severe) obesity due to excess calories",
    type: "Secondary Diagnosis (AI Recommends)",
    reason: "พบ BMI 38.6 kg/m² และบันทึก Anesthetic evaluation",
    confidence: "86%",
    decision: "Approve",
    evidenceRef: "Progress Note / Pre-op Note",
    notes: "ตรวจพบ BMI เกินเกณฑ์ 35+ พร้อมผลกระทบต่อการวางแผนผ่าตัด",
  },
  {
    id: "D62",
    code: "D62",
    diagnosis: "Acute posthemorrhagic anemia",
    type: "Secondary Diagnosis (Rule Alert)",
    reason: "ไม่พบหลักฐานการให้เลือดหรือบันทึกภาวะซีดเฉียบพลัน",
    confidence: "71%",
    decision: "Reject",
    evidenceRef: "Discharge Summary / Lab Note",
    notes: "ไม่มีการบันทึกภาวะ Anemia ใน Discharge summary และสูญเสียเลือดปกติ",
  },
]

export function CodingReviewTab({ onSwitchTab }) {
  const [candidates, setCandidates] = useState(initialCandidates)
  const [selectedCandidateId, setSelectedCandidateId] = useState("E66.01")
  const [coderNote, setCoderNote] = useState("ยืนยันเพิ่มรหัส E66.01 ตามบันทึก BMI 38.6 ในเวชระเบียน")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [checklist, setChecklist] = useState({
    reviewedAll: true,
    rejectedReasons: true,
    emrConfirmed: true,
  })

  const selectedCandidate = candidates.find((c) => c.id === selectedCandidateId) || candidates[0]

  const handleDecision = (id, newDecision) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, decision: newDecision } : c))
    )
  }

  const approvedCount = candidates.filter((c) => c.decision === "Approve").length
  const rejectedCount = candidates.filter((c) => c.decision === "Reject").length
  const reviewCount = candidates.filter((c) => c.decision === "Review").length

  return (
    <div className="space-y-4">
      {/* Overview Banner */}
      <section className="rounded-xl border border-border bg-card p-4.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                <ClipboardCheckIcon className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-foreground">Coding Review & Validation</h2>
                  <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    รอ Coder ยืนยันผล
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  ผู้ป่วย: นางสาววันหน้า ใจดี · AN 670520-00123 · DRG ปัจจุบัน I02Z (คาดการณ์ 2.7890)
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="rounded-md bg-emerald-500/10 px-2.5 py-1 font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                อนุมัติ {approvedCount}
              </span>
              {reviewCount > 0 && (
                <span className="rounded-md bg-amber-500/10 px-2.5 py-1 font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  รอทบทวน {reviewCount}
                </span>
              )}
              <span className="rounded-md bg-rose-500/10 px-2.5 py-1 font-semibold text-rose-600 dark:text-rose-400 border border-rose-500/20">
                ปฏิเสธ {rejectedCount}
              </span>
            </div>
          </div>
        </div>

        {/* Workflow steps */}
        <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="font-semibold text-primary">ขั้นตอนของ Coder:</span>
          <span>1. ตรวจรหัสที่ระบบเสนอ</span>
          <MoveRightIcon className="size-3 text-muted-foreground" />
          <button
            type="button"
            onClick={() => onSwitchTab?.("emr")}
            className="font-medium text-primary hover:underline cursor-pointer"
          >
            2. เปิดดูหลักฐานใน EMR Viewer
          </button>
          <MoveRightIcon className="size-3 text-muted-foreground" />
          <span>3. กำหนด Approve / Reject พร้อมบันทึกเหตุผล</span>
          <MoveRightIcon className="size-3 text-muted-foreground" />
          <span className="font-semibold text-foreground">4. ยืนยันผลการสรุป DRG</span>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(22rem,0.9fr)]">
        {/* Left Column: Candidates Table & Active Inspector */}
        <div className="space-y-4">
          <Card className="rounded-xl border border-border p-4 shadow-none">
            <div className="flex items-center justify-between pb-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">รายการรหัสวินิจฉัยและหัตถการที่ประเมิน</h3>
                <p className="text-xs text-muted-foreground">
                  AI ให้คำแนะนำ — Coder เป็นผู้ตัดสินใจยืนยันขั้นสุดท้าย
                </p>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">ทั้งหมด {candidates.length} รายการ</span>
            </div>

            <div className="overflow-hidden rounded-xl border border-border">
              <div className="grid grid-cols-[minmax(12rem,1.2fr)_minmax(11rem,1fr)_10.5rem] gap-2 bg-muted/60 px-4 py-2.5 text-xs font-semibold text-muted-foreground">
                <span>รหัส & คำวินิจฉัย</span>
                <span>เหตุผล / ความน่าเชื่อถือ</span>
                <span className="text-center">การตัดสินใจ</span>
              </div>

              {candidates.map((cand) => {
                const isSelected = cand.id === selectedCandidateId
                return (
                  <div
                    key={cand.id}
                    onClick={() => setSelectedCandidateId(cand.id)}
                    className={`grid grid-cols-[minmax(12rem,1.2fr)_minmax(11rem,1fr)_10.5rem] items-center gap-2 border-t border-border px-4 py-3.5 transition cursor-pointer ${
                      isSelected ? "bg-primary/[0.06] ring-1 ring-inset ring-primary/25" : "hover:bg-muted/40"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{cand.code}</span>
                        {cand.code === "E66.01" && (
                          <span className="rounded bg-primary/10 px-1.5 py-0.2 text-[10px] font-bold text-primary">
                            AI แนะนำ
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-foreground line-clamp-1">{cand.diagnosis}</p>
                      <p className="text-[11px] text-muted-foreground">{cand.type}</p>
                    </div>

                    <div>
                      <p className="text-xs text-foreground line-clamp-1">{cand.reason}</p>
                      <div className="mt-1 flex items-center gap-2 text-[11px]">
                        <span className="font-semibold text-primary">Confidence {cand.confidence}</span>
                        <span className="text-muted-foreground">· {cand.evidenceRef}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDecision(cand.id, "Approve")
                        }}
                        className={`flex h-7 items-center gap-1 rounded-md px-2 text-xs font-semibold transition cursor-pointer ${
                          cand.decision === "Approve"
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "border border-border bg-card text-muted-foreground hover:border-emerald-500/40 hover:text-emerald-600"
                        }`}
                      >
                        <CheckIcon className="size-3" />
                        อนุมัติ
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDecision(cand.id, "Reject")
                        }}
                        className={`flex h-7 items-center gap-1 rounded-md px-2 text-xs font-semibold transition cursor-pointer ${
                          cand.decision === "Reject"
                            ? "bg-rose-600 text-white shadow-xs"
                            : "border border-border bg-card text-muted-foreground hover:border-rose-500/40 hover:text-rose-600"
                        }`}
                      >
                        <XIcon className="size-3" />
                        ปฏิเสธ
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Selected Candidate Inspector */}
            <div className="mt-4 rounded-xl border border-primary/20 bg-primary/[0.025] p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileSearchIcon className="size-4 text-primary" />
                  <h4 className="text-sm font-bold text-foreground">
                    กำลังตรวจสอบ: {selectedCandidate.code} - {selectedCandidate.diagnosis}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => onSwitchTab?.("emr")}
                  className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  <SparklesIcon className="size-3.5" />
                  เปิดตรวจหลักฐานใน EMR Viewer
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                <div className="rounded-lg border border-primary/10 bg-card p-3 space-y-1">
                  <p className="font-semibold text-muted-foreground">หลักฐานทางการแพทย์ที่พบ:</p>
                  <p className="text-foreground">{selectedCandidate.reason}</p>
                </div>
                <div className="rounded-lg border border-primary/10 bg-card p-3 space-y-1">
                  <p className="font-semibold text-muted-foreground">ผลกระทบต่อ DRG:</p>
                  <p className="text-foreground">
                    {selectedCandidate.code === "E66.01"
                      ? "เพิ่ม AdjRW +0.5656 (ยกระดับความรุนแรงของโรคร่วม)"
                      : "เป็นโรคร่วมมาตรฐานที่ผ่านเกณฑ์"}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  บันทึกเหตุผลของ Coder (Audit Rationale):
                </label>
                <textarea
                  rows={2}
                  value={coderNote}
                  onChange={(e) => setCoderNote(e.target.value)}
                  placeholder="ระบุเหตุผลการตัดสินใจ..."
                  className="w-full rounded-lg border border-border bg-card p-2.5 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: DRG Financial Impact & Submission */}
        <div className="space-y-4">
          <Card className="rounded-xl border border-border p-4.5 shadow-none space-y-4">
            <h3 className="text-sm font-bold text-foreground">ผลกระทบต่อ DRG & ค่าชดเชย</h3>

            <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-3 text-xs">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <div>
                  <p className="text-muted-foreground">DRG เดิม</p>
                  <p className="mt-1 text-sm font-bold text-foreground">I02Z</p>
                </div>
                <MoveRightIcon className="size-4 text-primary" />
                <div>
                  <p className="text-muted-foreground">DRG หลังปรับ</p>
                  <p className="mt-1 text-sm font-bold text-emerald-600 dark:text-emerald-400">I02Z (Adj)</p>
                </div>
              </div>

              <div className="border-t border-border pt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <div>
                  <p className="text-muted-foreground">AdjRW เดิม</p>
                  <p className="mt-1 text-sm font-bold text-foreground">2.2234</p>
                </div>
                <MoveRightIcon className="size-4 text-primary" />
                <div>
                  <p className="text-muted-foreground">AdjRW ใหม่</p>
                  <p className="mt-1 text-sm font-bold text-emerald-600 dark:text-emerald-400">2.7890</p>
                </div>
              </div>

              <div className="border-t border-border pt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <div>
                  <p className="text-muted-foreground">ค่าชดเชยเดิม</p>
                  <p className="mt-1 text-sm font-bold text-foreground">68,450 บาท</p>
                </div>
                <MoveRightIcon className="size-4 text-primary" />
                <div>
                  <p className="text-muted-foreground">ค่าชดเชยใหม่</p>
                  <p className="mt-1 text-sm font-bold text-emerald-600 dark:text-emerald-400">108,720 บาท</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-center text-emerald-700 dark:text-emerald-300">
              <p className="text-xs font-semibold">รายได้คาดการณ์ที่เพิ่มขึ้น (Recovered Revenue)</p>
              <p className="mt-1 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">+40,270 บาท</p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">(+25.4% AdjRW Growth)</p>
            </div>
          </Card>

          {/* Submission Checklist */}
          <Card className="rounded-xl border border-primary/20 bg-primary/5 p-4.5 shadow-none space-y-3">
            <h3 className="text-sm font-bold text-primary flex items-center gap-1.5">
              <CheckCircle2Icon className="size-4 text-primary" />
              รายการตรวจสอบก่อนส่งผล (Submission Checklist)
            </h3>

            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.reviewedAll}
                  onChange={(e) => setChecklist({ ...checklist, reviewedAll: e.target.checked })}
                  className="rounded border-border text-primary"
                />
                Coder ตรวจสอบรหัสครบ {candidates.length} ข้อเสนอแล้ว
              </label>
              <label className="flex items-center gap-2 text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.emrConfirmed}
                  onChange={(e) => setChecklist({ ...checklist, emrConfirmed: e.target.checked })}
                  className="rounded border-border text-primary"
                />
                มีหลักฐานรองรับในเวชระเบียน (EMR Verified)
              </label>
              <label className="flex items-center gap-2 text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.rejectedReasons}
                  onChange={(e) => setChecklist({ ...checklist, rejectedReasons: e.target.checked })}
                  className="rounded border-border text-primary"
                />
                ระบุเหตุผลชัดเจนสำหรับรหัสที่ปฏิเสธ (D62)
              </label>
            </div>

            <button
              type="button"
              disabled={isSubmitted}
              onClick={() => setIsSubmitted(true)}
              className={`mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg text-xs font-bold text-white shadow-sm transition cursor-pointer ${
                isSubmitted ? "bg-emerald-600" : "bg-primary hover:bg-primary/90"
              }`}
            >
              {isSubmitted ? (
                <>
                  <CheckIcon className="size-4" />
                  ยืนยันผลการ Coding เรียบร้อยแล้ว
                </>
              ) : (
                <>
                  <SaveIcon className="size-4" />
                  บันทึก & ยืนยันผลการ Coding Review
                </>
              )}
            </button>
          </Card>
        </div>
      </section>
    </div>
  )
}
