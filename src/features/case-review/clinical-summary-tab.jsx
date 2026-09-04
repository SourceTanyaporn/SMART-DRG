import { Card } from "@/components/ui/card"
import { ActivityIcon, StethoscopeIcon, HeartPulseIcon, FlaskConicalIcon } from "lucide-react"

export function ClinicalSummaryTab({ onSwitchTab }) {
  return (
    <div className="space-y-4">
      {/* Vitals & Physical Indicators */}
      <section className="grid gap-4 md:grid-cols-4">
        <Card className="p-3.5 border border-[#edf0f5] shadow-none space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold">Blood Pressure</span>
            <HeartPulseIcon className="size-4 text-rose-500" />
          </div>
          <p className="text-xl font-bold text-foreground">138/85 <span className="text-xs font-normal text-muted-foreground">mmHg</span></p>
          <p className="text-[11px] text-amber-600 font-medium">Stage 1 HT (Controlled)</p>
        </Card>

        <Card className="p-3.5 border border-[#edf0f5] shadow-none space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold">Heart Rate</span>
            <ActivityIcon className="size-4 text-emerald-500" />
          </div>
          <p className="text-xl font-bold text-foreground">76 <span className="text-xs font-normal text-muted-foreground">bpm</span></p>
          <p className="text-[11px] text-emerald-600 font-medium">Normal sinus rhythm</p>
        </Card>

        <Card className="p-3.5 border border-[#edf0f5] shadow-none space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold">Body Mass Index (BMI)</span>
            <StethoscopeIcon className="size-4 text-indigo-500" />
          </div>
          <p className="text-xl font-bold text-indigo-700">38.6 <span className="text-xs font-normal text-muted-foreground">kg/m²</span></p>
          <p className="text-[11px] text-indigo-600 font-medium">Morbid Obesity (Class II)</p>
        </Card>

        <Card className="p-3.5 border border-[#edf0f5] shadow-none space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold">Pre-op Lab Status</span>
            <FlaskConicalIcon className="size-4 text-sky-500" />
          </div>
          <p className="text-xl font-bold text-foreground">Cleared</p>
          <p className="text-[11px] text-emerald-600 font-medium">Hb 13.2 · Cr 0.82</p>
        </Card>
      </section>

      {/* Main Clinical Breakdown */}
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <Card className="p-5 border border-[#edf0f5] shadow-none space-y-4">
          <h3 className="text-base font-bold text-foreground">สรุปข้อมูลทางคลินิก (Clinical Summary Details)</h3>

          <div className="space-y-3 text-xs leading-6">
            <div className="rounded-lg border border-border p-3.5">
              <p className="font-bold text-foreground text-sm">ประวัติและอาการนำ (History of Present Illness)</p>
              <p className="mt-1 text-muted-foreground">
                ผู้ป่วยหญิงไทย 46 ปี เป็นโรคข้อสะโพกเสื่อมเรื้อรัง มีอาการปวดรุนแรงบริเวณข้อสะโพกขวา เดินลำบาก มีอาการสะโพกติดขัด ขาสั้นยาวไม่เท่ากันเล็กน้อย ไม่ตอบสนองต่อยาแก้ปวดและการทำกายภาพบำบัด ภาพรังสี (X-ray) ยืนยัน Severe Osteoarthritis of Right Hip จึงได้รับการผ่าตัด Total Hip Replacement เมื่อ 17 พ.ค. 2567
              </p>
            </div>

            <div className="rounded-lg border border-border p-3.5">
              <p className="font-bold text-foreground text-sm">โรคร่วมและประวัติอดีต (Comorbidities & Past History)</p>
              <ul className="mt-1 list-disc pl-4 space-y-1 text-muted-foreground">
                <li><b className="text-foreground">Hypertension (I10):</b> รักษาด้วย Amlodipine 5mg วันละ 1 ครั้ง ควบคุมระดับความดันได้ดี</li>
                <li><b className="text-foreground">Morbid Obesity (E66.01):</b> น้ำหนัก 94 kg ส่วนสูง 156 cm (BMI 38.6) มีผลต่อการวางแผนยาระงับความรู้สึกและการฟื้นฟูข้อ</li>
              </ul>
            </div>

            <div className="rounded-lg border border-border p-3.5">
              <p className="font-bold text-foreground text-sm">การผ่าตัดและผลลัพธ์ (Operative & Recovery Course)</p>
              <p className="mt-1 text-muted-foreground">
                ทำหัตถการ Right Total Hip Arthroplasty ผลการผ่าตัดเรียบร้อยดี หลังผ่าตัดไม่มีภาวะแทรกซ้อน สามารถเริ่มทำกายภาพบำบัดยืนและเดินด้วย Walker ได้ในวันที่ 2 หลังผ่าตัด แผลผ่าตัดแห้งดี Discharge วันที่ 20 พ.ค. 2567 รวมนอนรพ. 5 วัน (LOS = 5 days)
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-[#edf0f5] shadow-none space-y-4">
          <h3 className="text-base font-bold text-foreground">ผลตรวจทางห้องปฏิบัติการ</h3>
          <div className="overflow-hidden rounded-lg border border-border text-xs">
            <table className="w-full text-left">
              <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border">
                <tr>
                  <th className="p-2.5">Lab Test</th>
                  <th className="p-2.5">Result</th>
                  <th className="p-2.5">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-2.5 font-medium">Hemoglobin (Hb)</td>
                  <td className="p-2.5 font-bold text-foreground">13.2 g/dL</td>
                  <td className="p-2.5 text-muted-foreground">12.0 - 15.5</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Hematocrit (Hct)</td>
                  <td className="p-2.5 font-bold text-foreground">40.1 %</td>
                  <td className="p-2.5 text-muted-foreground">37.0 - 48.0</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Creatinine</td>
                  <td className="p-2.5 font-bold text-foreground">0.82 mg/dL</td>
                  <td className="p-2.5 text-muted-foreground">0.50 - 1.10</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">eGFR</td>
                  <td className="p-2.5 font-bold text-emerald-600">88 mL/min</td>
                  <td className="p-2.5 text-muted-foreground">&gt; 60</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Fasting Blood Sugar</td>
                  <td className="p-2.5 font-bold text-foreground">96 mg/dL</td>
                  <td className="p-2.5 text-muted-foreground">70 - 99</td>
                </tr>
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={() => onSwitchTab?.("emr")}
            className="w-full rounded-lg border border-primary/20 bg-primary/5 p-2.5 text-xs font-semibold text-primary hover:bg-primary/10 transition cursor-pointer"
          >
            เปิดดูรายละเอียดใน EMR Case Viewer →
          </button>
        </Card>
      </section>
    </div>
  )
}
