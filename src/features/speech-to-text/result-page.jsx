import { useState, useEffect, useRef } from "react";
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
  ClipboardCheck,
  UserRound,
  Stethoscope,
  BarChart3,
  FilePenLine,
  Pencil,
  HeartPulse,
  Pill,
  ShieldCheck,
  ShieldAlert,
  WalletCards,
  ChartNoAxesColumnIncreasing,
  Wallet,
  ChevronDown,
  ChevronUp,
  User,
  Check,
  AlertCircle,
  AlertTriangle,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react";
import { useNavigate, Link } from "@tanstack/react-router";
import { toast } from "@/components/ui/toast-notification";
import { assessmentForms } from "./components/assessment-forms-tab";

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

  const [isAllergyModalOpen, setIsAllergyModalOpen] = useState(false);
  const allergyCardRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (allergyCardRef.current && !allergyCardRef.current.contains(e.target)) {
        setIsAllergyModalOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [formData, setFormData] = useState({
    chiefComplaint: initialFormData.chiefComplaint || "",
    presentIllness: initialFormData.presentIllness || "",
    pastHistory: initialFormData.pastHistory || patient?.underlying || "",
    physicalExam: initialFormData.physicalExam || "",
    provisionalDiagnosis: initialFormData.provisionalDiagnosis || initialFormData.diagnosis || "",
    diagnosis: initialFormData.diagnosis || initialFormData.provisionalDiagnosis || "",
    treatmentPlan: initialFormData.treatmentPlan || initialFormData.note || "",
    note: initialFormData.note || initialFormData.treatmentPlan || "",
    icd10: initialFormData.icd10 && initialFormData.icd10 !== "-" ? initialFormData.icd10 : "J11.1 (Influenza with other respiratory manifestations / ไข้หวัดใหญ่)",
    icd10Code: initialFormData.icd10Code || (initialFormData.icd10?.split(" ")[0] || "J11.1"),
    icd10Name: initialFormData.icd10Name || initialFormData.icd10Desc || "Influenza with other respiratory manifestations / ไข้หวัดใหญ่",
    icd10Desc: initialFormData.icd10Desc || initialFormData.icd10Name || "Influenza with other respiratory manifestations / ไข้หวัดใหญ่",
    icd9: initialFormData.icd9 && initialFormData.icd9 !== "-" ? initialFormData.icd9 : "-",
    icd9Code: initialFormData.icd9Code || "-",
    icd9Name: initialFormData.icd9Name || initialFormData.icd9Desc || "",
    icd9Desc: initialFormData.icd9Desc || initialFormData.icd9Name || "",
    drg: initialFormData.drg && initialFormData.drg !== "-" ? initialFormData.drg : "04510 (Viral Illness / Influenza without CC / โรคติดเชื้อไวรัสหรือไข้หวัดใหญ่)",
    drgCode: initialFormData.drgCode || "04510",
    drgName: initialFormData.drgName || initialFormData.drgDesc || "Viral Illness / Influenza without CC / โรคติดเชื้อไวรัสหรือไข้หวัดใหญ่",
    drgDesc: initialFormData.drgDesc || initialFormData.drgName || "Viral Illness / Influenza without CC / โรคติดเชื้อไวรัสหรือไข้หวัดใหญ่",
    investigation: initialFormData.investigation || (Array.isArray(initialFormData.investigations) ? initialFormData.investigations.join(", ") : ""),
    investigations: Array.isArray(initialFormData.investigations) ? initialFormData.investigations : [],
    disposition: initialFormData.disposition || "OPD",
    rawText: initialFormData.rawText || "",
    extractedBy: initialFormData.extractedBy || "rule_based",

    // สัญญาณชีพ
    pr: initialFormData.pr || initialFormData.pulse || "",
    pulse: initialFormData.pulse || initialFormData.pr || "",
    systolic: initialFormData.systolic || "",
    diastolic: initialFormData.diastolic || "",
    systolic2: initialFormData.systolic2 || "",
    diastolic2: initialFormData.diastolic2 || "",
    bp: initialFormData.bp || "",
    bp2: initialFormData.bp2 || "",
    map: initialFormData.map || "",
    map2: initialFormData.map2 || "",
    weight: initialFormData.weight || "",
    chest: initialFormData.chest || "",
    height: initialFormData.height || "",
    waist: initialFormData.waist || "",
    respiratory: initialFormData.respiratory || initialFormData.respiratoryRate || "",
    bodyTemperature: initialFormData.bodyTemperature || "",
    o2sat: initialFormData.o2sat || initialFormData.spo2 || "",
    bmi: initialFormData.bmi || "",
    bsa: initialFormData.bsa || "",
    painScore: initialFormData.painScore || "0",
    esi: initialFormData.esi || "ESI 3",
    barthelIndex: initialFormData.barthelIndex || "20",
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
    <div className="min-h-screen bg-background p-2 sm:p-3 text-[12px] text-foreground">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <Link to="/speech-to-text">
          <button
            type="button"
            className="cursor-pointer flex h-8 items-center gap-1.5 rounded-lg border border-primary bg-card px-3 text-primary font-medium hover:bg-primary/10 transition"
          >
            <ArrowLeft size={15} />
            ย้อนกลับ
          </button>
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="cursor-pointer flex h-8 items-center gap-1 rounded-lg border border-primary bg-card px-3 text-primary font-medium hover:bg-primary/10 transition"
          >
            <Save size={14} />
            บันทึก
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="cursor-pointer flex h-8 items-center gap-1 rounded-lg border border-primary bg-card px-3 text-primary font-medium hover:bg-primary/10 transition"
          >
            <FileText size={14} />
            ส่งออก PDF
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="cursor-pointer flex h-8 items-center gap-1 rounded-lg border border-primary bg-card px-3 text-primary font-medium hover:bg-primary/10 transition"
          >
            <Printer size={14} />
            พิมพ์
          </button>

          <button
            type="button"
            onClick={() => toast.success("ส่งออกไปยัง HIS สำเร็จ", "ส่งข้อมูลการรักษาและสัญญาณชีพเรียบร้อย")}
            className="cursor-pointer flex h-8 items-center gap-1.5 rounded-lg bg-primary px-4 text-primary-foreground font-medium hover:opacity-90 transition shadow-xs"
          >
            <Share2 size={14} />
            ส่งออกไปยัง HIS
          </button>
        </div>
      </div>

      {/* ================= Patient + Vitals ================= */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* Patient Card */}
        <section className="relative z-20 w-full rounded-xl border border-border bg-card">
          <div className="p-3">
            {/* ================= Patient Info ================= */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-2xs">
                    <User size={22} />
                    <span
                      className={`absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full text-[9px] font-bold text-white border-2 border-card ${
                        patient?.gender === "ชาย" ? "bg-blue-600" : "bg-pink-500"
                      }`}
                      title={`เพศ${patient?.gender || "ไม่ระบุ"}`}
                    >
                      {patient?.gender === "ชาย" ? "♂" : "♀"}
                    </span>
                  </div>

                  {/* Patient Info */}
                  <div>
                    <div className="text-lg font-bold text-foreground flex items-center gap-1.5">
                      <span>{patient?.fullName || patient?.name || "น.ส. กุลธิดา ชูมายงสี"}</span>
                      <span className={`text-base font-semibold ${patient?.gender === "หญิง" ? "text-pink-500" : "text-blue-500"}`}>
                        {patient?.gender === "หญิง" ? "♀" : "♂"}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>HN: {patient?.hn || "67012345"}</span>
                      <span>•</span>
                      <span>อายุ {patient?.age || "46"} ปี</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 font-medium text-primary">
                        <Stethoscope size={13} className="text-primary" />
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
                  className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-xl border border-primary/20 text-primary hover:bg-primary/10 transition"
                >
                  <Edit3 size={18} />
                </button>
              </Link>
            </div>

            {/* ================= Hx ================= */}
            <div className="my-3 border-t border-border" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                  <HeartPulse size={20} className="text-rose-500" />
                </div>

                <div>
                  <span className="font-semibold text-rose-500 mr-2">
                    ประวัติโรคประจำตัว (Hx):
                  </span>
                  <span className="text-xs text-foreground/80">
                    {patient?.underlying || formData.pastHistory || "ปฏิเสธโรคประจำตัวเดิม"}
                  </span>
                </div>
              </div>
            </div>

            {/* ================= Allergy ================= */}
            <div className="my-3 border-t border-border" />

            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Pill size={20} className="text-primary" />
                </div>

                <span className="shrink-0 font-semibold text-rose-500">
                  แพ้ยา :
                </span>

                {patient?.allergies &&
                patient.allergies !== "ไม่มีประวัติแพ้ยา" &&
                patient.allergies !== "ไม่มีประวัติการแพ้ยา" ? (
                  <div className="relative inline-block min-w-0 z-30" ref={allergyCardRef}>
                    <button
                      type="button"
                      onClick={() => setIsAllergyModalOpen((prev) => !prev)}
                      className={`cursor-pointer flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition shadow-2xs border ${
                        isAllergyModalOpen
                          ? "bg-rose-600 text-white border-rose-700 ring-2 ring-rose-200"
                          : "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20"
                      }`}
                      title="คลิกเพื่อดูรายละเอียดประวัติการแพ้ยาแบบครบถ้วน"
                    >
                      <AlertTriangle
                        size={13}
                        className={isAllergyModalOpen ? "text-white" : "text-rose-600 shrink-0 animate-pulse"}
                      />
                      <span
                        className="max-w-[160px] sm:max-w-[240px] md:max-w-[320px] truncate text-left"
                        title={patient?.allergyDetails && patient.allergyDetails.length > 0
                          ? patient.allergyDetails.map((d) => d.drug).join(", ")
                          : patient.allergies}
                      >
                        {patient?.allergyDetails && patient.allergyDetails.length > 0
                          ? patient.allergyDetails.map((d) => d.drug).join(", ")
                          : patient.allergies}
                      </span>
                      <span className="rounded bg-rose-500/20 text-rose-700 dark:text-rose-300 px-1.5 py-0.5 text-[9px] font-extrabold shrink-0">
                        ดูข้อมูล
                      </span>
                    </button>

                    {/* Drug Allergy Popover Card */}
                    {isAllergyModalOpen && (
                      <div className="absolute top-full left-0 mt-1.5 z-50 w-80 sm:w-96 max-w-[calc(100vw-2rem)] rounded-xl border border-rose-500/30 bg-card p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
                          <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                            <ShieldAlert size={16} className="text-rose-600 shrink-0" />
                            <h4 className="text-xs font-bold text-foreground">
                              ประวัติการแพ้ยา (Drug Allergy Profile)
                            </h4>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsAllergyModalOpen(false)}
                            className="cursor-pointer rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            ✕
                          </button>
                        </div>

                        {/* Patient Info Sub-header */}
                        <div className="mb-2.5 flex items-center justify-between rounded-lg bg-rose-500/10 px-2.5 py-1.5 text-[10px] text-rose-700 dark:text-rose-300 border border-rose-500/20">
                          <span className="font-semibold">{patient?.fullName || patient?.name} (HN: {patient?.hn})</span>
                          <span className="text-[9px] text-rose-600">ข้อควรระวังพิเศษทางคลินิก</span>
                        </div>

                        {/* Allergies List */}
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-0.5 scrollbar-thin">
                          {patient?.allergyDetails && patient.allergyDetails.length > 0 ? (
                            patient.allergyDetails.map((item, idx) => {
                              const isLifeThreatening = item.severity === "Life-threatening";
                              const isSevere = item.severity === "Severe";
                              const badgeColor = isLifeThreatening
                                ? "bg-red-600 text-white"
                                : isSevere
                                  ? "bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30"
                                  : "bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30";

                              return (
                                <div
                                  key={idx}
                                  className="rounded-lg border border-border bg-muted/30 p-2 text-[10px] transition hover:bg-rose-500/10"
                                >
                                  <div className="flex items-start justify-between gap-1.5">
                                    <div className="min-w-0">
                                      <p className="font-bold text-foreground flex items-center gap-1">
                                        <Pill size={11} className="text-rose-600 shrink-0" />
                                        <span>{item.drug}</span>
                                      </p>
                                      <p className="text-[9px] text-muted-foreground">{item.group}</p>
                                    </div>

                                    <span className={`rounded px-1.5 py-0.5 text-[8px] font-bold shrink-0 ${badgeColor}`}>
                                      {item.severity}
                                    </span>
                                  </div>

                                  <div className="mt-1.5 rounded bg-card p-1.5 border border-border text-foreground">
                                    <p className="font-semibold text-rose-600 dark:text-rose-400 text-[9px] mb-0.5">อาการที่แพ้ / อาการแสดง:</p>
                                    <p className="text-muted-foreground leading-relaxed text-[10px]">{item.reaction}</p>
                                  </div>

                                  <div className="mt-1 flex items-center justify-between text-[8px] text-muted-foreground">
                                    <span>บันทึกเมื่อ: {item.date}</span>
                                    <span>{item.hospital}</span>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="rounded-lg border border-border p-2.5 text-[11px] text-foreground bg-rose-500/10">
                              <p className="font-bold text-rose-600 dark:text-rose-400 mb-1">ยาที่ระบุในบันทึก:</p>
                              <p>{patient?.allergies}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="truncate rounded-lg border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground font-medium">
                    {patient?.allergies || "ไม่มีประวัติแพ้ยา"}
                  </span>
                )}
              </div>
            </div>

            {/* ================= Rights ================= */}
            <div className="my-3 border-t border-border" />

            <div className="flex items-center gap-3 overflow-x-auto">
              {/* สิทธิ */}
              <div className="flex shrink-0 items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ShieldCheck size={20} className="text-primary" />
                </div>

                <span className="font-semibold text-foreground/90">
                  สิทธิ
                </span>

                <div className="relative">
                  <select
                    value={patient?.rights || "บัตรทอง (UC)"}
                    onChange={() => { }}
                    className="h-8 appearance-none rounded-lg border border-input bg-card px-2.5 pr-6 text-xs text-foreground outline-none focus:border-primary"
                  >
                    <option value={patient?.rights || "บัตรทอง (UC)"}>{patient?.rights || "บัตรทอง (UC)"}</option>
                    <option value="ประกันสังคม">ประกันสังคม</option>
                    <option value="จ่ายตรงกรมบัญชีกลาง">จ่ายตรงกรมบัญชีกลาง</option>
                  </select>

                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                </div>
              </div>

              {/* จำนวนเงิน */}
              <div className="flex shrink-0 items-center gap-2 border-l border-border pl-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <WalletCards size={18} className="text-primary" />
                </div>

                <div className="text-xs">
                  <div className="font-semibold text-foreground/90">
                    จำนวนเงิน
                  </div>
                  <div className="text-muted-foreground">-</div>
                </div>
              </div>

              {/* เบิกได้ */}
              <div className="flex shrink-0 items-center gap-2 border-l border-border pl-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                  <ChartNoAxesColumnIncreasing
                    size={18}
                    className="text-emerald-500"
                  />
                </div>

                <div className="text-xs">
                  <div className="font-semibold text-foreground/90">
                    เบิกได้
                  </div>
                  <div className="text-muted-foreground">-</div>
                </div>
              </div>

              {/* เบิกไม่ได้ */}
              <div className="flex shrink-0 items-center gap-2 border-l border-border pl-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                  <Wallet size={18} className="text-amber-500" />
                </div>

                <div className="text-xs">
                  <div className="font-semibold text-foreground/90">
                    เบิกไม่ได้
                  </div>
                  <div className="text-muted-foreground">-</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Vitalsign Card */}
        <section className="rounded-xl border border-border bg-card">
          <div className="p-3">
            <div className="border-b border-border pb-2 font-bold text-foreground text-base flex items-center justify-between">
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
            <div className="mt-3 flex flex-wrap items-end gap-3 border-t border-border pt-2.5">
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
                <div className="text-[11px] text-muted-foreground">
                  CVD Risk: <span className="font-semibold text-primary">{formData.cvdRisk || "< 10%"}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Diagnosis & Coding Section */}
      <section className="mt-3 rounded-xl border border-border bg-card">
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
      <section className="mt-3 rounded-xl border border-border bg-card">
        <div className="p-3">
          <div className="border-b border-border pb-2 font-bold text-foreground text-base">
            บันทึกข้อมูลทางคลินิก (Clinical Notes)
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <NoteCard
              title="อาการสำคัญ"
              icon={ClipboardList}
              iconColor="text-primary"
              iconBg="bg-primary/10"
              bgColor="from-primary/5 to-card"
              borderColor="border-primary/20"
              text={formData.chiefComplaint || "ไม่มีข้อมูลอาการสำคัญ"}
            />

            <NoteCard
              title="การเจ็บป่วยในปัจจุบัน"
              icon={ClipboardList}
              iconColor="text-emerald-500"
              iconBg="bg-emerald-500/10"
              bgColor="from-emerald-500/5 to-card"
              borderColor="border-emerald-500/20"
              text={formData.presentIllness || "ไม่มีข้อมูลการเจ็บป่วยในปัจจุบัน"}
            />

            <NoteCard
              title="การตรวจร่างกาย"
              icon={UserRound}
              iconColor="text-amber-500"
              iconBg="bg-amber-500/10"
              bgColor="from-amber-500/5 to-card"
              borderColor="border-amber-500/20"
              text={formData.physicalExam || "ไม่มีข้อมูลการตรวจร่างกาย"}
            />

            <NoteCard
              title="การแปลผลทางคลินิก"
              icon={BarChart3}
              iconColor="text-purple-500"
              iconBg="bg-purple-500/10"
              bgColor="from-purple-500/5 to-card"
              borderColor="border-purple-500/20"
              text={formData.diagnosis || "ไม่มีข้อมูลการแปลผลทางคลินิก"}
            />

            <NoteCard
              title="Doctor Note & แผนการรักษา"
              icon={FilePenLine}
              iconColor="text-sky-500"
              iconBg="bg-sky-500/10"
              bgColor="from-sky-500/5 to-card"
              borderColor="border-sky-500/20"
              text={formData.treatmentPlan || formData.note || "ไม่มีข้อมูล Doctor Note"}
            />
          </div>
        </div>
      </section>

      {/* ================= แบบประเมินทางการแพทย์ (Clinical Assessment Forms) ================= */}
      <AssessmentResultsSection
        sessionData={sessionData}
        allForms={assessmentForms}
      />
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
      <span className="w-9 shrink-0 text-[11px] font-semibold text-muted-foreground">
        {label}
      </span>

      <div className="flex h-7 min-w-0 flex-1 items-center rounded-md border border-input bg-card">
        <input
          value={value !== null && value !== undefined ? value : ""}
          onChange={onChange}
          placeholder={unit}
          className="min-w-0 flex-1 bg-transparent px-2 text-[11px] outline-none text-foreground placeholder:text-muted-foreground/50"
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
      <div className="mb-1 text-[11px] font-medium text-primary">
        {title} (เลือก: {selectedValue || "0"})
      </div>

      <div className="flex overflow-hidden rounded-md border border-border">
        {values.map((value, index) => {
          const isSelected = String(selectedValue) === String(value);
          return (
            <button
              key={value}
              type="button"
              onClick={() => onSelect?.(value)}
              className={`flex h-6 w-5.5 cursor-pointer flex-col items-center justify-center border-r border-white/40 text-[9px] font-bold transition ${scoreColors[index]
                } ${isSelected ? "ring-2 ring-primary ring-inset opacity-100 scale-105 z-10" : "opacity-80 hover:opacity-100"}`}
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
      <div className="mb-1 text-[11px] font-medium text-primary">
        {title}
      </div>

      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="h-7 w-full appearance-none rounded-md border border-input bg-card px-2 pr-6 text-[10px] text-foreground outline-none focus:border-primary"
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
          className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground"
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
        <span className="font-semibold text-foreground/90">
          {title}
        </span>

        <span className="text-[10px] text-muted-foreground">
          AI Auto-Coded
        </span>
      </div>

      <div className="flex h-9 items-center rounded-lg border border-border bg-muted/40">
        <span className="px-3 font-bold text-foreground text-xs">
          {code || "-"}
        </span>

        {description && (
          <span className="border-l border-border px-3 text-[11px] text-muted-foreground truncate">
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
  iconColor = "text-primary",
  iconBg = "bg-primary/10",
  bgColor = "from-primary/5 to-card",
  borderColor = "border-primary/20",
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
      <div className="flex items-center gap-2 pb-1.5 border-b border-border/50">
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${iconBg}`}
        >
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>

        <div className={`text-xs font-bold ${iconColor} truncate`}>
          {title}
        </div>
      </div>

      <div className="mt-2 flex-1 overflow-y-auto pr-1 text-[11px] leading-[1.6] text-foreground/90 whitespace-pre-line">
        {text}
      </div>

      <div className="mt-1 flex justify-end gap-1.5 pt-1 border-t border-border/50">
        <button
          type="button"
          onClick={handleCopy}
          title="คัดลอกข้อความ"
          className="cursor-pointer flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          {copied ? <Check size={13} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={13} />}
        </button>
      </div>
    </div>
  );
}

// ==========================================
// Assessment Results Section & Components
// ==========================================

const categoryThemes = {
  "พฤติกรรมสุขภาพ": {
    badgeBg: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 font-bold",
    iconBg: "bg-blue-500/10 text-blue-500",
    border: "border-blue-500/30",
    headerBg: "bg-gradient-to-r from-blue-500/10 via-card to-card",
    icon: Activity,
  },
  "สุขภาพจิต": {
    badgeBg: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30 font-bold",
    iconBg: "bg-purple-500/10 text-purple-500",
    border: "border-purple-500/30",
    headerBg: "bg-gradient-to-r from-purple-500/10 via-card to-card",
    icon: Sparkles,
  },
  "ความปลอดภัย": {
    badgeBg: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 font-bold",
    iconBg: "bg-amber-500/10 text-amber-500",
    border: "border-amber-500/30",
    headerBg: "bg-gradient-to-r from-amber-500/10 via-card to-card",
    icon: ShieldAlert,
  },
  "กายภาพและฟื้นฟู": {
    badgeBg: "bg-teal-500/15 text-teal-800 dark:text-teal-300 border-teal-500/30 font-bold",
    iconBg: "bg-teal-500/10 text-teal-500",
    border: "border-teal-500/30",
    headerBg: "bg-gradient-to-r from-teal-500/10 via-card to-card",
    icon: HeartPulse,
  },
  "โรคไม่ติดต่อเรื้อรัง": {
    badgeBg: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 font-bold",
    iconBg: "bg-rose-500/10 text-rose-500",
    border: "border-rose-500/30",
    headerBg: "bg-gradient-to-r from-rose-500/10 via-card to-card",
    icon: AlertCircle,
  },
  "การพยาบาล": {
    badgeBg: "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-500/30 font-bold",
    iconBg: "bg-fuchsia-500/10 text-fuchsia-500",
    border: "border-fuchsia-500/30",
    headerBg: "bg-gradient-to-r from-fuchsia-500/10 via-card to-card",
    icon: ClipboardList,
  },
  "โภชนาการ": {
    badgeBg: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 font-bold",
    iconBg: "bg-emerald-500/10 text-emerald-500",
    border: "border-emerald-500/30",
    headerBg: "bg-gradient-to-r from-emerald-500/10 via-card to-card",
    icon: Layers,
  },
};

function getResultSeverityStyle(label = "") {
  const text = String(label).toLowerCase();
  if (text.includes("สูง") || text.includes("severe") || text.includes("เสี่ยงสูง") || text.includes("รุนแรง") || text.includes("มาก")) {
    return {
      bg: "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300",
      badge: "bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40",
      bar: "bg-rose-500",
    };
  }
  if (text.includes("ปานกลาง") || text.includes("moderate") || text.includes("เล็กน้อย") || text.includes("mild") || text.includes("เฝ้าระวัง") || text.includes("10 - 20%")) {
    return {
      bg: "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300",
      badge: "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40",
      bar: "bg-amber-500",
    };
  }
  return {
    bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
    badge: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40",
    bar: "bg-emerald-500",
  };
}

function AssessmentResultsSection({ sessionData, allForms = [] }) {
  const selectedFormIds = sessionData?.selectedFormIds || [];
  const assessmentAnswers = sessionData?.assessmentAnswers || {};
  const assessmentResults = sessionData?.assessmentResults || {};

  const formsToShow = Array.isArray(selectedFormIds) && selectedFormIds.length > 0
    ? allForms.filter((f) => selectedFormIds.includes(f.id))
    : [];

  const [expandedForms, setExpandedForms] = useState(() => {
    return formsToShow.slice(0, 3).reduce((acc, f) => ({ ...acc, [f.id]: true }), {});
  });

  const toggleExpand = (id) => {
    setExpandedForms((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyAllAssessments = () => {
    if (formsToShow.length === 0) return;
    const text = formsToShow
      .map((form) => {
        const score = assessmentResults[form.id]?.totalScore ?? form.totalScore;
        const result = assessmentResults[form.id]?.resultLabel ?? form.resultLabel;
        return `【${form.title}】\nหมวดหมู่: ${form.category}\nคะแนนรวม: ${score} คะแนน\nผลการประเมิน: ${result}\n`;
      })
      .join("\n----------------------------------------\n\n");

    navigator.clipboard.writeText(text);
    toast.success("คัดลอกสรุปแบบประเมินทั้งหมดเรียบร้อย");
  };

  return (
    <section className="mt-3 rounded-xl border border-border bg-card shadow-2xs">
      <div className="p-3 sm:p-4">
        {/* Header */}
        <div className="border-b border-border pb-3 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
              <ClipboardCheck size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-foreground text-base">
                  แบบประเมินทางการแพทย์ (Clinical Assessment Forms)
                </h3>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold border ${formsToShow.length > 0 ? "bg-primary/10 border-primary/20 text-primary" : "bg-muted border-border text-muted-foreground"}`}>
                  {formsToShow.length} แบบประเมิน
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                ผลการคัดกรอง สรุปคะแนน และการประเมินความเสี่ยงของผู้ป่วย
              </p>
            </div>
          </div>

          {formsToShow.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyAllAssessments}
                className="cursor-pointer flex h-8 items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-2.5 text-xs font-semibold text-foreground hover:bg-muted transition"
                title="คัดลอกสรุปผลการประเมินทั้งหมด"
              >
                <Copy size={13} />
                <span>คัดลอกสรุปทั้งหมด</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const allExpanded = formsToShow.every((f) => expandedForms[f.id]);
                  const nextState = {};
                  formsToShow.forEach((f) => {
                    nextState[f.id] = !allExpanded;
                  });
                  setExpandedForms(nextState);
                }}
                className="cursor-pointer flex h-8 items-center gap-1 rounded-lg border border-border px-2.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition"
              >
                {formsToShow.every((f) => expandedForms[f.id]) ? "ย่อทั้งหมด" : "ขยายทั้งหมด"}
              </button>
            </div>
          )}
        </div>

        {formsToShow.length === 0 ? (
          <div className="py-8 px-4 text-center rounded-xl border border-dashed border-border bg-muted/20 my-2">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground mb-2">
              <ClipboardList size={22} />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-foreground">
              ไม่มีรายการแบบประเมิน
            </h4>
            <p className="mt-0.5 text-[11px] text-muted-foreground max-w-md mx-auto">
              ไม่มีการบันทึกหรือส่งข้อมูลแบบประเมินทางการแพทย์สำหรับเคสนี้
            </p>
          </div>
        ) : (
          <>
            {/* Overview Badges Row */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5 p-2 rounded-lg bg-muted/40 border border-border text-[11px]">
              <span className="font-semibold text-muted-foreground mr-1 flex items-center gap-1">
                <Activity size={13} className="text-primary" />
                สรุปภาพรวม:
              </span>
              {formsToShow.map((form) => {
                const score = assessmentResults[form.id]?.totalScore ?? form.totalScore;
                const theme = categoryThemes[form.category] || categoryThemes["พฤติกรรมสุขภาพ"];
                return (
                  <span
                    key={form.id}
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-medium border ${theme.badgeBg}`}
                  >
                    <span>{form.title.split(" (")[0]}:</span>
                    <strong className="font-bold">{score} คะแนน</strong>
                  </span>
                );
              })}
            </div>

            {/* Assessment Cards Grid */}
            <div className="mt-3 grid grid-cols-1 gap-3.5 xl:grid-cols-2">
              {formsToShow.map((form) => {
                const isExpanded = Boolean(expandedForms[form.id]);
                const score = assessmentResults[form.id]?.totalScore ?? form.totalScore;
                const resultLabel = assessmentResults[form.id]?.resultLabel ?? form.resultLabel;
                const theme = categoryThemes[form.category] || categoryThemes["พฤติกรรมสุขภาพ"];
                const FormIcon = theme.icon || ClipboardCheck;
                const severity = getResultSeverityStyle(resultLabel);

                return (
                  <div
                    key={form.id}
                    className={`overflow-hidden rounded-xl border ${theme.border} bg-card shadow-2xs transition-all`}
                  >
                    {/* Form Card Header */}
                    <div className={`p-3 border-b border-border ${theme.headerBg}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${theme.iconBg} shadow-2xs`}>
                            <FormIcon size={16} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <h4 className="font-bold text-xs sm:text-sm text-foreground truncate">
                                {form.title}
                              </h4>
                              <span className={`rounded px-1.5 py-0.2 text-[10px] font-semibold border ${theme.badgeBg}`}>
                                {form.category}
                              </span>
                            </div>
                            <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-1">
                              {form.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              const text = `【${form.title}】\nหมวดหมู่: ${form.category}\nคะแนนรวม: ${score} คะแนน\nผลการประเมิน: ${resultLabel}`;
                              navigator.clipboard.writeText(text);
                              toast.success(`คัดลอกสรุป ${form.title.split(" (")[0]} สำเร็จ`);
                            }}
                            className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent hover:border-border transition"
                            title="คัดลอกผลการประเมินนี้"
                          >
                            <Copy size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleExpand(form.id)}
                            className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted border border-transparent hover:border-border transition"
                            title={isExpanded ? "ย่อรายละเอียด" : "ขยายดูคำถาม-คำตอบ"}
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Result & Score Summary Box */}
                      <div className={`mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-lg border p-2 text-xs ${severity.bg}`}>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="size-2 shrink-0 rounded-full animate-pulse bg-current" />
                          <span className="font-semibold truncate">
                            ผลการประเมิน: {resultLabel}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[11px] font-medium text-muted-foreground">คะแนนรวม:</span>
                          <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${severity.badge}`}>
                            {score} คะแนน
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Questions and Answers Breakdown */}
                    {isExpanded && (
                      <div className="p-3 bg-muted/20">
                        <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold text-muted-foreground px-1">
                          <span>ข้อที่ / รายการประเมิน</span>
                          <span className="text-right">คำตอบที่บันทึก & คะแนน</span>
                        </div>

                        <div className="divide-y divide-border rounded-lg border border-border bg-card">
                          {form.questions?.map((q, idx) => {
                            const answerKey = `${form.id}_q${q.number}`;
                            const recordedAnswer = assessmentAnswers[answerKey] || (q.options ? q.options[0] : "มีอาการ / พบประวัติ");
                            const scoreText = q.score || "1 คะแนน";

                            return (
                              <div
                                key={idx}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2 text-xs hover:bg-muted/40 transition"
                              >
                                <div className="flex items-start gap-1.5 min-w-0 flex-1">
                                  <span className="font-bold text-foreground shrink-0">
                                    {q.number}.
                                  </span>
                                  <span className="text-foreground/90 leading-snug">
                                    {q.text}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-2 pl-4 sm:pl-0 shrink-0 text-right">
                                  <span className="rounded bg-muted border border-border px-2 py-0.5 text-[11px] font-semibold text-foreground">
                                    {recordedAnswer}
                                  </span>
                                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                    +{scoreText}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}