import { useState, useEffect } from "react";
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
  Check,
} from "lucide-react";
import { useNavigate, Link } from "@tanstack/react-router";
import { toast } from "@/components/ui/toast-notification";

export function ResultPage() {
  const navigate = useNavigate();

  // โหลดข้อมูลที่ส่งมาจาก SpeechToTextPage
  const [sessionData, setSessionData] = useState(() => {
    try {
      const saved = localStorage.getItem("smart_drg_speech_result_data");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse speech result data from localStorage", e);
    }
    return null;
  });

  const patient = sessionData?.selectedPatient || null;
  const initialFormData = sessionData?.formData || {};

  const [formData, setFormData] = useState({
    chiefComplaint: initialFormData.chiefComplaint || "",
    presentIllness: initialFormData.presentIllness || "",
    pastHistory: initialFormData.pastHistory || patient?.underlying || "",
    physicalExam: initialFormData.physicalExam || "",
    diagnosis: initialFormData.diagnosis || "",
    treatmentPlan: initialFormData.treatmentPlan || initialFormData.note || "",
    note: initialFormData.note || "",
    icd10: initialFormData.icd10 && initialFormData.icd10 !== "-" ? initialFormData.icd10 : "F32.9",
    icd10Desc: initialFormData.icd10Desc && initialFormData.icd10Desc !== "-" ? initialFormData.icd10Desc : "Depressive episode, unspecified",
    icd9: initialFormData.icd9 && initialFormData.icd9 !== "-" ? initialFormData.icd9 : "94.49",
    icd9Desc: initialFormData.icd9Desc && initialFormData.icd9Desc !== "-" ? initialFormData.icd9Desc : "Counseling and psychotherapy",
    drg: initialFormData.drg && initialFormData.drg !== "-" ? initialFormData.drg : "19500",
    drgDesc: initialFormData.drgDesc && initialFormData.drgDesc !== "-" ? initialFormData.drgDesc : "Depressive Disorders without CC",
    
    // สัญญาณชีพ
    pr: initialFormData.pr || initialFormData.pulse || "",
    systolic: initialFormData.systolic || "",
    diastolic: initialFormData.diastolic || "",
    bp: initialFormData.bp || "",
    map: initialFormData.map || "",
    weight: initialFormData.weight || "",
    chest: initialFormData.chest || "",
    pulseRate2: initialFormData.pulseRate2 || "",
    systolic2: initialFormData.systolic2 || "",
    diastolic2: initialFormData.diastolic2 || "",
    map2: initialFormData.map2 || "",
    height: initialFormData.height || "",
    waist: initialFormData.waist || "",
    respiratory: initialFormData.respiratory || initialFormData.respiratoryRate || "",
    bodyTemperature: initialFormData.bodyTemperature || "",
    o2sat: initialFormData.o2sat || initialFormData.spo2 || "",
    bmi: initialFormData.bmi || "",
    bsa: initialFormData.bsa || "",
    painScore: initialFormData.painScore || "0",
    esi: initialFormData.esi || "ESI 3",
    barthelIndex: initialFormData.barthelIndex || "20 (เต็ม)",
    cvdRisk: initialFormData.cvdRisk || "< 10%",
  });

  const handleVitalChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSave = () => {
    try {
      const updated = {
        ...sessionData,
        formData,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem("smart_drg_speech_result_data", JSON.stringify(updated));
      toast.success("บันทึกข้อมูลเรียบร้อย", "ข้อมูลสรุปและสัญญาณชีพได้รับการบันทึกแล้ว");
    } catch (e) {
      toast.error("เกิดข้อผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้");
    }
  };

  return (
    <div className="min-h-screen bg-white p-2 sm:p-3 text-[12px] text-slate-700">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <Link to="/speech-to-text">
          <button
            type="button"
            className="cursor-pointer flex h-8 items-center gap-1.5 rounded-lg border border-blue-500 bg-white px-3 text-blue-600 font-medium hover:bg-blue-50 transition"
          >
            <ArrowLeft size={15} />
            ย้อนกลับ
          </button>
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="cursor-pointer flex h-8 items-center gap-1 rounded-lg border border-blue-500 px-3 text-blue-600 font-medium hover:bg-blue-50 transition"
          >
            <Save size={14} />
            บันทึก
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="cursor-pointer flex h-8 items-center gap-1 rounded-lg border border-blue-500 px-3 text-blue-600 font-medium hover:bg-blue-50 transition"
          >
            <FileText size={14} />
            ส่งออก PDF
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="cursor-pointer flex h-8 items-center gap-1 rounded-lg border border-blue-500 px-3 text-blue-600 font-medium hover:bg-blue-50 transition"
          >
            <Printer size={14} />
            พิมพ์
          </button>

          <button
            type="button"
            onClick={() => toast.success("ส่งออกไปยัง HIS สำเร็จ", "ส่งข้อมูลการรักษาและสัญญาณชีพเรียบร้อย")}
            className="cursor-pointer flex h-8 items-center gap-1.5 rounded-lg bg-gradient-to-r from-fuchsia-500 to-blue-600 px-4 text-white font-medium hover:opacity-90 transition shadow-xs"
          >
            <Share2 size={14} />
            ส่งออกไปยัง HIS
          </button>
        </div>
      </div>

      {/* ================= Patient + Vitals ================= */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* Patient Card */}
        <section className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="p-3">
            {/* ================= Patient Info ================= */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-500 font-bold text-lg">
                    {patient?.fullName ? patient.fullName.slice(0, 2) : <User size={26} className="text-blue-400" />}
                  </div>

                  {/* Patient Info */}
                  <div>
                    <div className="text-lg font-bold text-slate-800 flex items-center gap-1.5">
                      <span>{patient?.fullName || patient?.name || "น.ส. กุลธิดา ชูมายงสี"}</span>
                      <span className={`text-base font-semibold ${patient?.gender === "หญิง" ? "text-pink-500" : "text-blue-500"}`}>
                        {patient?.gender === "หญิง" ? "♀" : "♂"}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>HN: {patient?.hn || "67012345"}</span>
                      <span>•</span>
                      <span>อายุ {patient?.age || "46"} ปี</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 font-medium text-teal-700">
                        <Stethoscope size={13} className="text-teal-600" />
                        แพทย์: {patient?.doctor || "พญ. อัญชลี ศรีวิไล (ว.38910)"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Link to="/speech-to-text">
                <button
                  type="button"
                  title="แก้ไขข้อมูล"
                  className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-xl border border-purple-100 text-purple-400 hover:bg-purple-50 hover:text-purple-600 transition"
                >
                  <Edit3 size={18} />
                </button>
              </Link>
            </div>

            {/* ================= Hx ================= */}
            <div className="my-3 border-t border-slate-100" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50">
                  <HeartPulse size={20} className="text-red-400" />
                </div>

                <div>
                  <span className="font-semibold text-red-500 mr-2">
                    ประวัติโรคประจำตัว (Hx):
                  </span>
                  <span className="text-xs text-slate-600">
                    {patient?.underlying || formData.pastHistory || "ปฏิเสธโรคประจำตัวเดิม"}
                  </span>
                </div>
              </div>
            </div>

            {/* ================= Allergy ================= */}
            <div className="my-3 border-t border-slate-100" />

            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-50">
                  <Pill size={20} className="text-purple-400" />
                </div>

                <span className="shrink-0 font-semibold text-red-500">
                  แพ้ยา :
                </span>

                <span className="truncate rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs text-red-600 font-medium">
                  {patient?.allergies || "ไม่มีประวัติการแพ้ยา"}
                </span>
              </div>
            </div>

            {/* ================= Rights ================= */}
            <div className="my-3 border-t border-slate-100" />

            <div className="flex items-center gap-3 overflow-x-auto">
              {/* สิทธิ */}
              <div className="flex shrink-0 items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50">
                  <ShieldCheck size={20} className="text-teal-500" />
                </div>

                <span className="font-semibold text-slate-700">
                  สิทธิ
                </span>

                <div className="relative">
                  <select
                    value={patient?.rights || "บัตรทอง (UC)"}
                    onChange={() => {}}
                    className="h-8 appearance-none rounded-lg border border-slate-200 bg-white px-2.5 pr-6 text-xs text-slate-700 outline-none"
                  >
                    <option value={patient?.rights || "บัตรทอง (UC)"}>{patient?.rights || "บัตรทอง (UC)"}</option>
                    <option value="ประกันสังคม">ประกันสังคม</option>
                    <option value="จ่ายตรงกรมบัญชีกลาง">จ่ายตรงกรมบัญชีกลาง</option>
                  </select>

                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>

              {/* จำนวนเงิน */}
              <div className="flex shrink-0 items-center gap-2 border-l border-slate-200 pl-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-50">
                  <WalletCards size={18} className="text-purple-400" />
                </div>

                <div className="text-xs">
                  <div className="font-semibold text-slate-700">
                    จำนวนเงิน
                  </div>
                  <div className="text-slate-600">-</div>
                </div>
              </div>

              {/* เบิกได้ */}
              <div className="flex shrink-0 items-center gap-2 border-l border-slate-200 pl-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50">
                  <ChartNoAxesColumnIncreasing
                    size={18}
                    className="text-blue-500"
                  />
                </div>

                <div className="text-xs">
                  <div className="font-semibold text-slate-700">
                    เบิกได้
                  </div>
                  <div className="text-slate-600">-</div>
                </div>
              </div>

              {/* เบิกไม่ได้ */}
              <div className="flex shrink-0 items-center gap-2 border-l border-slate-200 pl-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-50">
                  <Wallet size={18} className="text-orange-400" />
                </div>

                <div className="text-xs">
                  <div className="font-semibold text-slate-700">
                    เบิกไม่ได้
                  </div>
                  <div className="text-slate-600">-</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Vitalsign Card */}
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="p-3">
            <div className="border-b border-slate-200 pb-2 font-bold text-slate-700 text-base flex items-center justify-between">
              <span>Vitalsign (สัญญาณชีพ)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-x-3 gap-y-2 pt-2.5 text-[11px]">
              <VitalInput
                label="PR1"
                unit="bpm"
                value={formData.pr}
                onChange={(e) => handleVitalChange("pr", e.target.value)}
              />
              <VitalInput
                label="BP1"
                unit="Sys"
                value={formData.systolic}
                onChange={(e) => handleVitalChange("systolic", e.target.value)}
              />
              <VitalInput
                label="/"
                unit="Dia"
                value={formData.diastolic}
                onChange={(e) => handleVitalChange("diastolic", e.target.value)}
              />
              <VitalInput
                label="MAP"
                unit="mmHg"
                value={formData.map}
                onChange={(e) => handleVitalChange("map", e.target.value)}
              />
              <VitalInput
                label="Weight"
                unit="kg"
                value={formData.weight}
                onChange={(e) => handleVitalChange("weight", e.target.value)}
              />
              <VitalInput
                label="รอบอก"
                unit="cm"
                value={formData.chest}
                onChange={(e) => handleVitalChange("chest", e.target.value)}
              />

              <VitalInput
                label="PR2"
                unit="bpm"
                value={formData.pulseRate2}
                onChange={(e) => handleVitalChange("pulseRate2", e.target.value)}
              />
              <VitalInput
                label="BP2"
                unit="Sys"
                value={formData.systolic2}
                onChange={(e) => handleVitalChange("systolic2", e.target.value)}
              />
              <VitalInput
                label="/"
                unit="Dia"
                value={formData.diastolic2}
                onChange={(e) => handleVitalChange("diastolic2", e.target.value)}
              />
              <VitalInput
                label="MAP2"
                unit="mmHg"
                value={formData.map2}
                onChange={(e) => handleVitalChange("map2", e.target.value)}
              />
              <VitalInput
                label="Height"
                unit="cm"
                value={formData.height}
                onChange={(e) => handleVitalChange("height", e.target.value)}
              />
              <VitalInput
                label="รอบเอว"
                unit="cm"
                value={formData.waist}
                onChange={(e) => handleVitalChange("waist", e.target.value)}
              />

              <VitalInput
                label="RR"
                unit="/min"
                value={formData.respiratory}
                onChange={(e) => handleVitalChange("respiratory", e.target.value)}
              />
              <VitalInput
                label="BT"
                unit="°C"
                value={formData.bodyTemperature}
                onChange={(e) => handleVitalChange("bodyTemperature", e.target.value)}
              />
              <VitalInput
                label="O2sat"
                unit="%"
                value={formData.o2sat}
                onChange={(e) => handleVitalChange("o2sat", e.target.value)}
              />
              <VitalInput
                label="BMI"
                unit="kg/m²"
                value={formData.bmi}
                onChange={(e) => handleVitalChange("bmi", e.target.value)}
              />
              <VitalInput
                label="BSA"
                unit="m²"
                value={formData.bsa}
                onChange={(e) => handleVitalChange("bsa", e.target.value)}
              />
              <div />
            </div>

            {/* Scores & Risks */}
            <div className="mt-3 flex flex-wrap items-end gap-3 border-t border-slate-100 pt-2.5">
              <ScoreBox
                title="Pain Score"
                selectedValue={formData.painScore || "0"}
                onSelect={(val) => handleVitalChange("painScore", val)}
                values={["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]}
              />

              <ScoreSelect
                title="ESI Level"
                value={formData.esi || "ESI 3"}
                onChange={(e) => handleVitalChange("esi", e.target.value)}
                options={["ESI 1 (Resuscitation)", "ESI 2 (Emergent)", "ESI 3 (Urgent)", "ESI 4 (Semi-urgent)", "ESI 5 (Non-urgent)"]}
              />
              <ScoreSelect
                title="Barthel Index"
                value={formData.barthelIndex || "20 (เต็ม)"}
                onChange={(e) => handleVitalChange("barthelIndex", e.target.value)}
                options={["20 (Independent)", "15-19 (Mild)", "10-14 (Moderate)", "5-9 (Severe)", "0-4 (Total)"]}
              />

              <div className="pb-1">
                <div className="text-[11px] text-slate-500">
                  CVD Risk: <span className="font-semibold text-blue-600">{formData.cvdRisk || "< 10%"}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Diagnosis & Coding Section */}
      <section className="mt-3 rounded-xl border border-slate-200 bg-white">
        <div className="p-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <DiagnosisCard
              title="ICD 10 (รหัสการวินิจฉัยโรค)"
              code={formData.icd10}
              description={formData.icd10Desc}
            />

            <DiagnosisCard
              title="ICD 9 (รหัสหัตถการ/การรักษา)"
              code={formData.icd9}
              description={formData.icd9Desc}
            />

            <DiagnosisCard
              title="DRG (กลุ่มวินิจฉัยโรคร่วม)"
              code={formData.drg}
              description={formData.drgDesc}
            />
          </div>
        </div>
      </section>

      {/* Clinical Notes Section (อาการของผู้ป่วย) */}
      <section className="mt-3 rounded-xl border border-slate-200 bg-white">
        <div className="p-3">
          <div className="border-b border-slate-200 pb-2 font-bold text-slate-800 text-base">
            บันทึกข้อมูลทางคลินิก (Clinical Notes)
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <NoteCard
              title="อาการสำคัญ"
              icon={ClipboardList}
              iconColor="text-blue-600"
              iconBg="bg-blue-100"
              bgColor="from-blue-50/70 to-white"
              borderColor="border-blue-200/80"
              text={formData.chiefComplaint || "ไม่มีข้อมูลอาการสำคัญ"}
            />

            <NoteCard
              title="การเจ็บป่วยในปัจจุบัน"
              icon={ClipboardList}
              iconColor="text-emerald-600"
              iconBg="bg-emerald-100"
              bgColor="from-emerald-50/70 to-white"
              borderColor="border-emerald-200/80"
              text={formData.presentIllness || "ไม่มีข้อมูลการเจ็บป่วยในปัจจุบัน"}
            />

            <NoteCard
              title="การตรวจร่างกาย"
              icon={UserRound}
              iconColor="text-amber-600"
              iconBg="bg-amber-100"
              bgColor="from-amber-50/70 to-white"
              borderColor="border-amber-200/80"
              text={formData.physicalExam || "ไม่มีข้อมูลการตรวจร่างกาย"}
            />

            <NoteCard
              title="การแปลผลทางคลินิก"
              icon={BarChart3}
              iconColor="text-purple-600"
              iconBg="bg-purple-100"
              bgColor="from-purple-50/70 to-white"
              borderColor="border-purple-200/80"
              text={formData.diagnosis || "ไม่มีข้อมูลการแปลผลทางคลินิก"}
            />

            <NoteCard
              title="Doctor Note & แผนการรักษา"
              icon={FilePenLine}
              iconColor="text-indigo-600"
              iconBg="bg-indigo-100"
              bgColor="from-indigo-50/70 to-white"
              borderColor="border-indigo-200/80"
              text={formData.treatmentPlan || formData.note || "ไม่มีข้อมูล Doctor Note"}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function VitalInput({
  label,
  unit,
  value = "",
  onChange,
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-9 shrink-0 text-[11px] font-semibold text-slate-600">
        {label}
      </span>

      <div className="flex h-7 min-w-0 flex-1 items-center rounded-md border border-slate-200 bg-white">
        <input
          value={value !== null && value !== undefined ? value : ""}
          onChange={onChange}
          placeholder={unit}
          className="min-w-0 flex-1 bg-transparent px-2 text-[11px] outline-none text-slate-800"
        />
      </div>
    </div>
  );
}

function ScoreBox({ title, values, selectedValue, onSelect }) {
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
  ];

  return (
    <div>
      <div className="mb-1 text-[11px] font-medium text-blue-600">
        {title} (เลือก: {selectedValue || "0"})
      </div>

      <div className="flex overflow-hidden rounded-md border border-slate-200">
        {values.map((value, index) => {
          const isSelected = String(selectedValue) === String(value);
          return (
            <button
              key={value}
              type="button"
              onClick={() => onSelect?.(value)}
              className={`flex h-6 w-5.5 cursor-pointer flex-col items-center justify-center border-r border-white/40 text-[9px] font-bold transition ${
                scoreColors[index]
              } ${isSelected ? "ring-2 ring-slate-900 ring-inset opacity-100 scale-105 z-10" : "opacity-80 hover:opacity-100"}`}
            >
              <span className="text-white drop-shadow-xs">{value}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ScoreSelect({
  title,
  value,
  options = [],
  onChange,
}) {
  return (
    <div className="w-32">
      <div className="mb-1 text-[11px] font-medium text-blue-600">
        {title}
      </div>

      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="h-7 w-full appearance-none rounded-md border border-slate-200 bg-white px-2 pr-6 text-[10px] text-slate-700 outline-none"
        >
          {options.length > 0 ? (
            options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))
          ) : (
            <option value={value}>{value}</option>
          )}
        </select>
        <ChevronDown
          size={12}
          className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </div>
  );
}

function DiagnosisCard({
  title,
  code,
  description,
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[11px]">
        <span className="font-semibold text-slate-700">
          {title}
        </span>

        <span className="text-[10px] text-slate-400">
          AI Auto-Coded
        </span>
      </div>

      <div className="flex h-9 items-center rounded-lg border border-slate-200 bg-slate-50/50">
        <span className="px-3 font-bold text-slate-800 text-xs">
          {code || "-"}
        </span>

        {description && (
          <span className="border-l border-slate-200 px-3 text-[11px] text-slate-600 truncate">
            {description}
          </span>
        )}
      </div>
    </div>
  );
}

function NoteCard({
  title,
  text,
  icon: Icon = ClipboardList,
  iconColor = "text-blue-600",
  iconBg = "bg-blue-100",
  bgColor = "from-blue-50/70 to-white",
  borderColor = "border-blue-200/80",
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("คัดลอกข้อความสำเร็จ");
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      className={`flex h-[200px] flex-col rounded-xl border ${borderColor} bg-gradient-to-br ${bgColor} p-3 shadow-2xs`}
    >
      <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100/80">
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${iconBg}`}
        >
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>

        <div className={`text-xs font-bold ${iconColor} truncate`}>
          {title}
        </div>
      </div>

      <div className="mt-2 flex-1 overflow-y-auto pr-1 text-[11px] leading-[1.6] text-slate-700 whitespace-pre-line">
        {text}
      </div>

      <div className="mt-1 flex justify-end gap-1.5 pt-1 border-t border-slate-100/60">
        <button
          type="button"
          onClick={handleCopy}
          title="คัดลอกข้อความ"
          className="cursor-pointer flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
        </button>
      </div>
    </div>
  );
}