import { Card } from "@/components/ui/card"
import { CalculatorIcon, ShieldCheckIcon, TrendingUpIcon, FileSpreadsheetIcon } from "lucide-react"

export function ClaimDrgTab({ onSwitchTab }) {
  return (
    <div className="space-y-4">
      {/* DRG Summary Bar */}
      <section className="grid gap-4 md:grid-cols-4">
        <Card className="p-4 border border-[#edf0f5] shadow-none space-y-1">
          <p className="text-xs font-semibold text-muted-foreground">MDC / Base DRG</p>
          <p className="text-xl font-bold text-foreground">08 / I02</p>
          <p className="text-[11px] text-muted-foreground">Musculoskeletal System</p>
        </Card>

        <Card className="p-4 border border-[#edf0f5] shadow-none space-y-1">
          <p className="text-xs font-semibold text-muted-foreground">Base Relative Weight (RW)</p>
          <p className="text-xl font-bold text-foreground">2.2234</p>
          <p className="text-[11px] text-muted-foreground">Thai DRG Version 6.3</p>
        </Card>

        <Card className="p-4 border border-emerald-200 bg-emerald-50/30 shadow-none space-y-1">
          <p className="text-xs font-semibold text-emerald-800">Adjusted RW (AdjRW)</p>
          <p className="text-xl font-bold text-emerald-700">2.7890</p>
          <p className="text-[11px] text-emerald-600 font-semibold">+0.5656 (Comorbidity impact)</p>
        </Card>

        <Card className="p-4 border border-primary/20 bg-primary/5 shadow-none space-y-1">
          <p className="text-xs font-semibold text-primary">ค่าชดเชยที่คาดการณ์</p>
          <p className="text-xl font-bold text-primary">108,720 ฿</p>
          <p className="text-[11px] text-emerald-600 font-semibold">+40,270 ฿ (+58.8%)</p>
        </Card>
      </section>

      {/* DRG Calculation Details */}
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <Card className="p-5 border border-[#edf0f5] shadow-none space-y-4">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <CalculatorIcon className="size-4 text-primary" />
            ตารางการคำนวณ DRG Grouper Breakdown
          </h3>

          <div className="overflow-hidden rounded-lg border border-border text-xs">
            <table className="w-full text-left">
              <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border">
                <tr>
                  <th className="p-3">ลำดับขั้นตอน</th>
                  <th className="p-3">รหัส/เกณฑ์</th>
                  <th className="p-3">คำอธิบาย</th>
                  <th className="p-3 text-right">RW</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-3 font-semibold">1. MDC</td>
                  <td className="p-3 font-bold">MDC 08</td>
                  <td className="p-3 text-muted-foreground">Diseases and Disorders of the Musculoskeletal System</td>
                  <td className="p-3 text-right">—</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">2. Principal Procedure</td>
                  <td className="p-3 font-bold">0SBT0ZZ</td>
                  <td className="p-3 text-muted-foreground">Total Hip Replacement, Right</td>
                  <td className="p-3 text-right">2.2234</td>
                </tr>
                <tr className="bg-emerald-50/40">
                  <td className="p-3 font-semibold text-emerald-900">3. Secondary Dx (CC/MCC)</td>
                  <td className="p-3 font-bold text-emerald-700">E66.01 + I10</td>
                  <td className="p-3 text-emerald-800">Morbid Obesity (CC) + Hypertension</td>
                  <td className="p-3 text-right font-bold text-emerald-700">+0.5656</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">4. Length of Stay (LOS)</td>
                  <td className="p-3 font-bold">5 วัน</td>
                  <td className="p-3 text-muted-foreground">อยู่ในเกณฑ์ปกติ (Trim Low 1 - High 14 วัน)</td>
                  <td className="p-3 text-right">1.0000</td>
                </tr>
                <tr className="bg-primary/5 font-bold">
                  <td className="p-3 text-primary" colSpan={3}>สรุป DRG สุทธิ (Final DRG) : I02Z Major Hip Joint Replacement w CC</td>
                  <td className="p-3 text-right text-primary text-sm">2.7890</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5 border border-[#edf0f5] shadow-none space-y-4">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <ShieldCheckIcon className="size-4 text-emerald-600" />
            การตรวจทานกฎ Claim Readiness
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-start gap-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200 p-2.5">
              <span className="text-emerald-700 font-bold">✓</span>
              <div>
                <p className="font-semibold text-emerald-900">สิทธิการรักษาตรงตามเกณฑ์</p>
                <p className="text-emerald-700">บัตรทอง (UC) / กองทุน UC รพ.ศิริสุข</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200 p-2.5">
              <span className="text-emerald-700 font-bold">✓</span>
              <div>
                <p className="font-semibold text-emerald-900">บันทึกหัตถการและอุปกรณ์ครบ</p>
                <p className="text-emerald-700">ลงรหัสข้อสะโพกเทียม Cementless ถูกต้อง</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-lg bg-amber-50 border border-amber-200 p-2.5">
              <span className="text-amber-700 font-bold">!</span>
              <div>
                <p className="font-semibold text-amber-900">รอ Coder ยืนยันรหัส E66.01</p>
                <p className="text-amber-700">เพื่อส่งเคลมในอัตรา AdjRW 2.7890</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSwitchTab?.("coding")}
            className="w-full rounded-lg bg-primary p-2.5 text-xs font-bold text-white hover:bg-primary/90 transition cursor-pointer"
          >
            ไปที่ Coding Review เพื่อยืนยันรหัส →
          </button>
        </Card>
      </section>
    </div>
  )
}
