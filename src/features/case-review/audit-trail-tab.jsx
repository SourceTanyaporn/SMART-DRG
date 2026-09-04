import { Card } from "@/components/ui/card"
import { HistoryIcon, UserIcon, BotIcon, ShieldCheckIcon, ClockIcon } from "lucide-react"

const auditLogs = [
  {
    time: "20 พ.ค. 2567 14:05 น.",
    actor: "น.ส.กานตรวณ (Coder)",
    type: "user",
    action: "เริ่มการตรวจสอบ Case Review",
    detail: "เปิดตรวจหลักฐานใน EMR Viewer และเปรียบเทียบรหัสวินิจฉัย",
  },
  {
    time: "20 พ.ค. 2567 11:25 น.",
    actor: "SMART-DRG AI Grouper",
    type: "bot",
    action: "ตรวจพบโอกาสปรับปรุงรหัส (AI Suggestion Triggered)",
    detail: "ตรวจพบ BMI 38.6 ใน Progress Note แนะนำรหัส E66.01 เพื่อเพิ่ม AdjRW 2.2234 -> 2.7890",
  },
  {
    time: "20 พ.ค. 2567 11:20 น.",
    actor: "นพ.วัชรพล ศิริกุล (แพทย์เจ้าของไข้)",
    type: "doctor",
    action: "ลงนาม Discharge Summary (Digital Signature)",
    detail: "บันทึกสรุปจำหน่ายผู้ป่วย รหัสหลัก M16.1, รหัสโรคร่วม I10",
  },
  {
    time: "17 พ.ค. 2567 10:30 น.",
    actor: "นพ.วัชรพล ศิริกุล (ศัลยแพทย์)",
    type: "doctor",
    action: "บันทึก Operative Note",
    detail: "ลงบันทึกการผ่าตัด Total Hip Replacement, Right side",
  },
  {
    time: "15 พ.ค. 2567 09:15 น.",
    actor: "พญ.อรัญญา วัฒนศักดิ์",
    type: "doctor",
    action: "บันทึก Admission Note",
    detail: "รับผู้ป่วยเข้ารับการรักษาในหอผู้ป่วยศัลยกรรมหญิง 1",
  },
]

export function AuditTrailTab() {
  return (
    <div className="space-y-4">
      <Card className="p-5 border border-[#edf0f5] shadow-none space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <HistoryIcon className="size-5 text-primary" />
            <div>
              <h3 className="text-base font-bold text-foreground">ประวัติและเส้นทางการตรวจสอบ (Case Audit Trail)</h3>
              <p className="text-xs text-muted-foreground">บันทึกประวัติการกระทำและ AI event ทั้งหมดของเคส AN 670520-00123</p>
            </div>
          </div>
          <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <ClockIcon className="size-3.5" />
            Real-time Log
          </span>
        </div>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
          {auditLogs.map((log, index) => {
            const isBot = log.type === "bot"
            return (
              <div key={index} className="relative flex items-start gap-4">
                <div
                  className={`absolute -left-6 top-0.5 grid size-5 place-items-center rounded-full border-2 border-white text-[10px] text-white shadow-xs ${
                    isBot ? "bg-indigo-600" : "bg-primary"
                  }`}
                >
                  {isBot ? <BotIcon className="size-3" /> : <UserIcon className="size-3" />}
                </div>

                <div className="flex-1 rounded-lg border border-[#edf0f5] bg-card p-3 text-xs space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="font-bold text-foreground text-sm">{log.action}</span>
                    <span className="text-muted-foreground text-[11px]">{log.time}</span>
                  </div>
                  <p className="font-semibold text-primary">{log.actor}</p>
                  <p className="text-muted-foreground leading-5">{log.detail}</p>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
