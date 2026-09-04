import {
  ArrowLeft,
  Edit3,
  Eye,
  Copy,
  Save,
  FileText,
  Printer,
  Share2,
  RefreshCw,
  ClipboardList,
  UserRound,
  Stethoscope,
  BarChart3,
  FilePenLine,
  Pencil,
  HeartPulse,
  Pill,
  ShieldCheck,
  WalletCards,
  ChartNoAxesColumnIncreasing,
  Wallet,
  ChevronDown,
  User,
} from "lucide-react"
import { useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
export function ResultPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white p-2 text-[12px] text-slate-700">

      <div className="mb-3 flex items-center justify-between">
        <Link to="/speech-to-text">
          <button
            type="button"
            className="cursor-pointer flex h-8 items-center gap-1 rounded-md border border-blue-500 bg-white px-3 text-blue-600 hover:bg-blue-50"
          >
            <ArrowLeft size={15} />
            ย้อนกลับ
          </button>
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-8 items-center gap-1 rounded-md border border-blue-500 px-3 text-blue-600 hover:bg-blue-50"
          >
            <Save size={14} />
            บันทึก
          </button>

          <button
            type="button"
            className="flex h-8 items-center gap-1 rounded-md border border-blue-500 px-3 text-blue-600 hover:bg-blue-50"
          >
            <FileText size={14} />
            ส่งออก PDF
          </button>

          <button
            type="button"
            className="flex h-8 items-center gap-1 rounded-md border border-blue-500 px-3 text-blue-600 hover:bg-blue-50"
          >
            <Printer size={14} />
            พิมพ์
          </button>

          <button
            type="button"
            className="flex h-8 items-center gap-1 rounded-md bg-gradient-to-r from-fuchsia-500 to-blue-600 px-4 text-white hover:opacity-90"
          >
            <Share2 size={14} />
            ส่งออกไปยัง HIS
          </button>
        </div>
      </div>

      {/* ================= Patient + Vitals ================= */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* Patient */}
        <section className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="p-3">
            {/* ================= Patient ================= */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50">
                    <User size={28} className="text-blue-400" />
                  </div>

                  {/* Patient Info */}
                  <div>
                    <div className="text-lg font-bold text-slate-700">
                      น.ส. กุลธิดา ชูมายงสี
                      <span className="ml-1 text-pink-500">♀</span>
                    </div>

                    <div className="mt-1 text-sm text-slate-500">
                      อายุ 9 ปี 0 ด.
                    </div>
                  </div>
                </div>


              </div>

              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-100 text-purple-400 hover:text-purple-600"
              >
                <Edit3 size={20} />
              </button>
            </div>

            {/* ================= Hx ================= */}
            <div className="my-3 border-t border-slate-100" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
                  <HeartPulse size={23} className="text-red-400" />
                </div>

                <span className="font-semibold text-red-500">
                  Hx
                </span>
              </div>

              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-100"
              >
                <Eye size={20} className="text-blue-400" />
              </button>
            </div>

            {/* ================= Allergy ================= */}
            <div className="my-3 border-t border-slate-100" />

            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50">
                  <Pill size={23} className="text-purple-400" />
                </div>

                <span className="shrink-0 font-semibold text-red-500">
                  แพ้ยา :
                </span>

                <span className="truncate rounded-lg border border-red-200 bg-red-50 px-4 py-1.5 text-sm text-red-500">
                  ยา: AMLODIPINE
                </span>
              </div>

              <button
                type="button"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-100"
              >
                <Eye size={20} className="text-blue-400" />
              </button>
            </div>

            {/* ================= Rights ================= */}
            <div className="my-3 border-t border-slate-100" />

            <div className="flex items-center gap-3 overflow-x-auto">
              {/* สิทธิ */}
              <div className="flex shrink-0 items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50">
                  <ShieldCheck size={22} className="text-teal-500" />
                </div>

                <span className="font-semibold text-slate-700">
                  สิทธิ
                </span>

                <div className="relative">
                  <select
                    defaultValue="บัตรทอง"
                    className="h-9 w-28 appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-7 text-sm text-slate-700 outline-none"
                  >
                    <option value="บัตรทอง">บัตรทอง</option>
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 "
                  />
                </div>
              </div>

              {/* จำนวนเงิน */}
              <div className="flex shrink-0 items-center gap-2 border-l border-slate-200 pl-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50">
                  <WalletCards size={21} className="text-purple-400" />
                </div>

                <div className="text-sm">
                  <div className="font-semibold text-slate-700">
                    จำนวนเงิน
                  </div>
                  <div className="text-slate-700">-</div>
                </div>
              </div>

              {/* เบิกได้ */}
              <div className="flex shrink-0 items-center gap-2 border-l border-slate-200 pl-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                  <ChartNoAxesColumnIncreasing
                    size={21}
                    className="text-blue-500"
                  />
                </div>

                <div className="text-sm">
                  <div className="font-semibold text-slate-700">
                    เบิกได้
                  </div>
                  <div className="text-slate-700">-</div>
                </div>
              </div>

              {/* เบิกไม่ได้ */}
              <div className="flex shrink-0 items-center gap-2 border-l border-slate-200 pl-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50">
                  <Wallet size={21} className="text-orange-400" />
                </div>

                <div className="text-sm">
                  <div className="font-semibold text-slate-700">
                    เบิกไม่ได้
                  </div>
                  <div className="text-slate-700">-</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="p-2">
            <div className="border-b border-slate-200 pb-2 font-bold text-slate-600 text-lg">
              Vitalsign
            </div>

            <div className="grid grid-cols-6 gap-x-3 gap-y-2 pt-2 text-[10px]">

              <VitalInput label="PR1" unit="mm" />
              <VitalInput label="BP1" unit="mm" />
              <VitalInput label="/" unit="mm" />
              <VitalInput label="MAP" unit="" />

              <VitalInput label="Weight" unit="" />
              <VitalInput label="รอบอก" unit="" />

              <VitalInput label="PR2" unit="mm" />
              <VitalInput label="BP2" unit="mm" />
              <VitalInput label="/" unit="mm" />
              <VitalInput label="MAP2" unit="" />

              <VitalInput label="Height" unit="" />
              <VitalInput label="รอบเอว" unit="" />

              <VitalInput label="RR3" unit="mm" />
              <VitalInput label="BP3" unit="mmHg" />
              <VitalInput label="/" unit="mm" />

              <div />

              <div />
              <div />

              <VitalInput label="BT" unit="" />
              <VitalInput label="O2sat" unit="%" />
            </div>

            {/* Score */}
            <div className="mt-3 flex items-end gap-4">
              <ScoreBox
                title="Pain Score"
                values={["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]}
              />

              <ScoreSelect title="ESI" value="EMER1 : แดง" />
              <ScoreSelect title="Barthel Index" value="EMER1 : แดง" />

              <div className="pb-1">
                <div className="mb-1 text-[12px] text-blue-500">
                  CVD Risk -
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="mt-3 rounded-xl border border-slate-200 bg-white">
        <div className="p-3">

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <DiagnosisCard
              title="ICD 10"
              code="R53"
              description="Malaise and Fatigue (อ่อนเพลีย)"
            />

            <DiagnosisCard
              title="ICD 9"
              code="90.59*"
              description="Blood Glucose Test (ตรวจระดับ)"
            />

            <DiagnosisCard
              title="DRG"
              code="-"
              description=""
            />
          </div>
        </div>
      </section>

      <section className="mt-3 rounded-xl border border-slate-200 bg-white">
        <div className="p-3">
          <div className="border-b border-slate-200 pb-2 font-bold text-lg">
            อาการของผู้ป่วย
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
            <NoteCard
              title="อาการสำคัญ"
              icon={ClipboardList}
              iconColor="text-blue-500"
              iconBg="bg-blue-100"
              bgColor="from-blue-50/80 to-white"
              borderColor="border-blue-100"
              text="ผู้ป่วยมีอาการอ่อนเพลียมากขึ้น โดยเฉพาะในช่วงบ่าย ร่วมกับมีอาการตามัวเล็กน้อยหลังตื่นนอน และยังคงมีอาการเบื่ออาหารร่วมกับน้ำหนักที่เคยได้รับการประเมินมาก่อน"
            />

            <NoteCard
              title="การเจ็บป่วยในปัจจุบัน"
              icon={ClipboardList}
              iconColor="text-emerald-500"
              iconBg="bg-emerald-100"
              bgColor="from-emerald-50/80 to-white"
              borderColor="border-emerald-100"
              text="ผู้ป่วยรายงานว่าช่วงที่ผ่านมาเริ่มมีอาการอ่อนเพลียมากขึ้น โดยอาการมักเป็นชัดในช่วงบ่าย ร่วมกับมีอาการตามัวเล็กน้อยในช่วงเช้าหลังตื่นนอน ผู้ป่วยไม่มีการกล่าวถึงอาการเวียนศีรษะ หมดสติ หรือปวดศีรษะ และมีความกังวลว่าตนเองอาจสัมพันธ์กับโรคเบาหวานที่เคยได้รับคำแนะนำจากแพทย์ก่อนหน้านี้"
            />

            <NoteCard
              title="การตรวจร่างกาย"
              icon={UserRound}
              iconColor="text-orange-400"
              iconBg="bg-orange-100"
              bgColor="from-orange-50/80 to-white"
              borderColor="border-orange-100"
              text="ผู้ป่วยมีอาการอ่อนเพลียเพิ่มขึ้นในช่วงบ่าย ร่วมกับอาการตามัวหลังตื่นนอน ซึ่งอาจสัมพันธ์กับการควบคุมระดับน้ำตาลในเลือดที่ยังไม่เหมาะสม หรือภาวะแทรกซ้อนของโรคเบาหวาน โดยเฉพาะภาวะเบาหวานขึ้นจอประสาทตา (Diabetic Retinopathy)"
            />

            <NoteCard
              title="การแปลผลทางคลินิก"
              icon={BarChart3}
              iconColor="text-purple-500"
              iconBg="bg-purple-100"
              bgColor="from-purple-50/80 to-white"
              borderColor="border-purple-100"
              text="ยังไม่มีข้อมูลการตรวจร่างกายจากบทสนทนา"
            />

            <NoteCard
              title="Doctor Note"
              icon={FilePenLine}
              iconColor="text-blue-500"
              iconBg="bg-blue-100"
              bgColor="from-indigo-50/80 to-white"
              borderColor="border-indigo-100"
              text="ผู้ป่วยมีอาการอ่อนเพลียและตามัวร่วมด้วย อาจสัมพันธ์กับภาวะแทรกซ้อนจากโรคเบาหวาน โดยเฉพาะภาวะเบาหวานขึ้นจอประสาทตา (Diabetic Retinopathy) จำเป็นต้องประเมินเพิ่มเติมด้วยการตรวจจอประสาทตา รวมถึงติดตามการควบคุมระดับน้ำตาลในเลือด"
            />
          </div>
        </div>
      </section>
    </div>
  )
}


function VitalInput({
  label,
  unit,
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-8 shrink-0 text-[12px] text-slate-600">
        {label}
      </span>

      <div className="flex h-7 min-w-0 flex-1 items-center rounded-md border border-slate-200 bg-white">
        <input
          placeholder={unit}
          className="min-w-0 flex-1 bg-transparent px-2 text-[10px] outline-none"
        />

      </div>
    </div>
  )
}

function ScoreBox({ title, values }) {
  const scoreColors = [
    "bg-green-600",
    "bg-green-500",
    "bg-lime-500",
    "bg-lime-400",
    "bg-yellow-400",
    "bg-yellow-500",
    "bg-amber-500",
    "bg-orange-500",
    "bg-orange-600",
    "bg-red-500",
    "bg-red-600",
  ]

  return (
    <div>
      <div className="mb-1 text-[12px] text-blue-500">
        {title}
      </div>

      <div className="flex overflow-hidden rounded-sm">
        {values.map((value, index) => (
          <label
            key={value}
            className={`flex h-7 w-5 cursor-pointer flex-col items-center justify-center border-r border-white text-[8px] text-white ${scoreColors[index]
              }`}
          >
            <span>{value}</span>

            <input
              type="radio"
              name={title}
              value={value}
              className="h-3 w-3 cursor-pointer accent-white"
            />
          </label>
        ))}
      </div>
    </div>
  )
}
function ScoreSelect({
  title,
  value,
}) {
  return (
    <div className="w-28">
      <div className="mb-1 text-[12px] text-blue-500">
        {title}
      </div>

      <select className="h-7 w-full rounded-md border border-slate-200 bg-white px-2 text-[9px] outline-none">
        <option>{value}</option>
      </select>
    </div>
  )
}

function DiagnosisCard({
  title,
  code,
  description,
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[12px]">
        <span className="font-medium text-slate-600">
          {title}
        </span>

        <button className="flex items-center gap-1 text-blue-500 hover:underline">
          <RefreshCw size={10} />
          วิเคราะห์ใหม่
        </button>
      </div>

      <div className="flex h-8 items-center rounded-md border border-slate-200">
        <span className="px-3 font-semibold text-slate-600">
          {code}
        </span>

        {description && (
          <span className="border-l border-slate-100 px-3 text-[10px] text-slate-500">
            {description}
          </span>
        )}
      </div>
    </div>
  )
}

function NoteCard({
  title,
  text,
  icon: Icon = ClipboardList,
  iconColor = "text-blue-500",
  iconBg = "bg-blue-100",
  bgColor = "from-blue-50/80 to-white",
  borderColor = "border-blue-100",
}) {
  return (
    <div
      className={`flex h-[190px] flex-col rounded-lg border ${borderColor} bg-gradient-to-br ${bgColor} px-3 py-2.5`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconBg}`}
        >
          <Icon className={`h-[17px] w-[17px] ${iconColor}`} />
        </div>

        <div className={`text-[14px] font-semibold ${iconColor}`}>
          {title}
        </div>
      </div>

      <div className="mt-1 flex-1 overflow-y-auto pr-1 text-[12px] leading-[1.55] text-slate-600">
        {text}
      </div>

      <div className="mt-1 flex justify-end gap-2">
        <button
          type="button"
          className="flex h-6 w-6 items-center justify-center rounded-md text-blue-400 transition hover:bg-blue-50 hover:text-blue-600"
        >
          <Pencil className="h-[15px] w-[15px]" />
        </button>

        <button
          type="button"
          className="flex h-6 w-6 items-center justify-center rounded-md text-blue-400 transition hover:bg-blue-50 hover:text-blue-600"
        >
          <Copy className="h-[15px] w-[15px]" />
        </button>
      </div>
    </div>
  );
}