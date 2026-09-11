import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "@/components/ui/toast-notification";
import { mockPatients } from "../components/patient-search-banner";
import { assessmentForms } from "../components/assessment-forms-tab";
import { checkDrugAllergySafety } from "../utils/drug-allergy-checker";

export const buildFormDataFromPatient = (patient) => {
    if (!patient) {
        return {
            chiefComplaint: "",
            presentIllness: "",
            pastHistory: "",
            physicalExam: "",
            provisionalDiagnosis: "",
            diagnosis: "",
            icd10: "-",
            icd10Code: "-",
            icd10Name: "-",
            icd10Desc: "-",
            icd9: "-",
            icd9Code: "-",
            icd9Name: "-",
            icd9Desc: "-",
            drg: "-",
            drgCode: "-",
            drgName: "-",
            drgDesc: "-",
            investigation: "",
            investigations: [],
            treatmentPlan: "",
            note: "",
            disposition: "OPD",
            rawText: "",
            extractedBy: "rule_based",

            // สัญญาณชีพ
            bodyTemperature: "",
            systolic: "",
            diastolic: "",
            systolic2: "",
            diastolic2: "",
            bp: "",
            bp2: "",
            pr: "",
            pulse: "",
            respiratory: "",
            o2sat: "",
            map: "",
            map2: "",
            weight: "",
            height: "",
            bmi: "",
            bsa: "",
            chest: "",
            waist: "",
            painScore: "",
            esi: "ESI 3",
            barthelIndex: "20",
            cvdRisk: "< 10%",
        };
    }
    const vs = patient.vitals || patient.vitalSigns || {};
    const sys = vs.systolic || "";
    const dia = vs.diastolic || "";
    const bp = vs.bp || (sys && dia ? `${sys}/${dia}` : "");
    const mapVal = vs.map || (sys && dia ? String(Math.round((2 * Number(dia) + Number(sys)) / 3)) : "");

    const provDx = patient.provisionalDiagnosis || patient.diagnosis || "";
    const icd10Code = patient.icd10Code || patient.icd10 || "-";
    const icd10Name = patient.icd10Name || patient.icd10Desc || "-";
    const icd9Code = patient.icd9Code || patient.icd9 || "-";
    const icd9Name = patient.icd9Name || patient.icd9Desc || "-";
    const drgCode = patient.drgCode || patient.drg || "-";
    const drgName = patient.drgName || patient.drgDesc || patient.diagnosis || "-";

    return {
        chiefComplaint: patient.chiefComplaint || "",
        presentIllness: patient.presentIllness || "",
        pastHistory: patient.pastHistory || patient.underlying || "",
        physicalExam: patient.physicalExam || "",
        provisionalDiagnosis: provDx,
        diagnosis: provDx,
        icd10: patient.icd10 || (icd10Code !== "-" && icd10Name !== "-" ? `${icd10Code} (${icd10Name})` : icd10Code),
        icd10Code: icd10Code,
        icd10Name: icd10Name,
        icd10Desc: icd10Name,
        icd9: patient.icd9 || (icd9Code !== "-" && icd9Name !== "-" ? `${icd9Code} (${icd9Name})` : icd9Code),
        icd9Code: icd9Code,
        icd9Name: icd9Name,
        icd9Desc: icd9Name,
        drg: patient.drg || (drgCode !== "-" && drgName !== "-" ? `${drgCode} (${drgName})` : drgCode),
        drgCode: drgCode,
        drgName: drgName,
        drgDesc: drgName,
        investigation: patient.investigation || (Array.isArray(patient.investigations) ? patient.investigations.join(", ") : ""),
        investigations: Array.isArray(patient.investigations) ? patient.investigations : [],
        treatmentPlan: patient.treatmentPlan || "",
        note: patient.note || "",
        disposition: patient.disposition || "OPD",
        rawText: patient.rawText || "",
        extractedBy: patient.extractedBy || "rule_based",

        // สัญญาณชีพ
        systolic: String(sys || ""),
        diastolic: String(dia || ""),
        systolic2: String(vs.systolic2 || ""),
        diastolic2: String(vs.diastolic2 || ""),
        bp,
        bp2: String(vs.bp2 || (vs.systolic2 && vs.diastolic2 ? `${vs.systolic2}/${vs.diastolic2}` : "")),
        map: mapVal,
        map2: String(vs.map2 || ""),
        pr: String(vs.pr || vs.pulse || ""),
        pulse: String(vs.pr || vs.pulse || ""),
        respiratory: String(vs.respiratory || ""),
        bodyTemperature: String(vs.bodyTemperature || ""),
        o2sat: String(vs.o2sat || ""),
        weight: String(vs.weight || ""),
        height: String(vs.height || ""),
        bmi: String(vs.bmi || ""),
        bsa: String(vs.bsa || ""),
        chest: String(vs.chest || ""),
        waist: String(vs.waist || ""),
        painScore: String(vs.painScore ?? ""),
        esi: vs.esi || "ESI 3",
        barthelIndex: vs.barthelIndex || "20",
        cvdRisk: vs.cvdRisk || "< 10%",
    };
};

export function useClinicalForm({ isNew = false, searchHn, searchPatientId } = {}) {
    const findInitialPatient = () => {
        if (isNew) return null;
        if (searchHn) {
            const found = mockPatients.find((p) => p.hn === searchHn);
            if (found) return found;
        }
        if (searchPatientId) {
            const found = mockPatients.find((p) => p.id === searchPatientId);
            if (found) return found;
        }
        return mockPatients[0];
    };

    const [selectedPatient, setSelectedPatient] = useState(() => findInitialPatient());

    const [triageBaseline, setTriageBaseline] = useState(() => {
        const p = findInitialPatient();
        return buildFormDataFromPatient(p);
    });

    const [formData, setFormData] = useState(() => {
        const p = findInitialPatient();
        return buildFormDataFromPatient(p);
    });

    // 3 Tab & Assessments states
    const [activeStep, setActiveStep] = useState(0); // 0: Vitals, 1: Chief Complaint, 2: Assessment
    const [isOpen, setIsOpen] = useState(false);
    const [selectedFormIds, setSelectedFormIds] = useState([]);
    const [activeFormId, setActiveFormId] = useState("");
    const [assessmentAnswers, setAssessmentAnswers] = useState({});
    const [assessmentResults, setAssessmentResults] = useState({});
    const [noteText, setNoteText] = useState("");
    const [isExtracting, setIsExtracting] = useState(false);

    useEffect(() => {
        if (isNew) {
            setSelectedPatient(null);
            const emptyData = buildFormDataFromPatient(null);
            setFormData(emptyData);
            setTriageBaseline(emptyData);
        } else if (searchHn || searchPatientId) {
            const found = mockPatients.find((p) => (searchHn && p.hn === searchHn) || (searchPatientId && p.id === searchPatientId));
            if (found) {
                setSelectedPatient(found);
                const data = buildFormDataFromPatient(found);
                setFormData(data);
                setTriageBaseline(data);
            }
        }
    }, [isNew, searchHn, searchPatientId]);

    const handleSelectPatient = (patient) => {
        setSelectedPatient(patient);
        const initialData = buildFormDataFromPatient(patient);
        setFormData(initialData);
        setTriageBaseline(initialData);
    };

    const handleRevertField = (fieldOrFields) => {
        const fields = Array.isArray(fieldOrFields) ? fieldOrFields : [fieldOrFields];
        setFormData((prev) => {
            const next = { ...prev };
            fields.forEach((f) => {
                next[f] = triageBaseline[f] || "";
            });
            return next;
        });
    };

    const handleRevertAllConflicts = () => {
        setFormData((prev) => ({
            ...prev,
            ...triageBaseline,
        }));
        toast.info("คืนค่าทั้งหมดจากจุดคัดกรอง", "รีเซ็ตข้อมูลทุกช่องให้ตรงกับจุดคัดกรองเรียบร้อยแล้ว");
    };

    const handleAcceptAllConflicts = () => {
        setTriageBaseline({ ...formData });
        toast.success("บันทึกการยอมรับค่าจากเสียง", "ปรับปรุงค่าตั้งต้นให้ตรงกับข้อมูลปัจจุบันเรียบร้อยแล้ว");
    };

    const conflictCount = useMemo(() => {
        if (!triageBaseline || !selectedPatient) return 0;
        let count = 0;
        // Vital signs check
        if (triageBaseline.systolic && formData.systolic && formData.systolic !== triageBaseline.systolic) count++;
        if (triageBaseline.diastolic && formData.diastolic && formData.diastolic !== triageBaseline.diastolic) count++;
        if (triageBaseline.pr && (formData.pr || formData.pulse) && (formData.pr || formData.pulse) !== triageBaseline.pr) count++;
        if (triageBaseline.bodyTemperature && formData.bodyTemperature && formData.bodyTemperature !== triageBaseline.bodyTemperature) count++;
        if (triageBaseline.respiratory && formData.respiratory && formData.respiratory !== triageBaseline.respiratory) count++;
        if (triageBaseline.o2sat && formData.o2sat && formData.o2sat !== triageBaseline.o2sat) count++;
        if (triageBaseline.weight && formData.weight && formData.weight !== triageBaseline.weight) count++;
        if (triageBaseline.height && formData.height && formData.height !== triageBaseline.height) count++;
        if (triageBaseline.painScore !== undefined && triageBaseline.painScore !== "" && formData.painScore !== "" && formData.painScore !== triageBaseline.painScore) count++;

        // Clinical texts
        if (triageBaseline.chiefComplaint && formData.chiefComplaint && formData.chiefComplaint.trim() !== triageBaseline.chiefComplaint.trim()) count++;
        if (triageBaseline.presentIllness && formData.presentIllness && formData.presentIllness.trim() !== triageBaseline.presentIllness.trim()) count++;
        if (triageBaseline.physicalExam && formData.physicalExam && formData.physicalExam.trim() !== triageBaseline.physicalExam.trim()) count++;
        if (triageBaseline.diagnosis && formData.diagnosis && formData.diagnosis.trim() !== triageBaseline.diagnosis.trim()) count++;

        return count;
    }, [formData, triageBaseline, selectedPatient]);

    // ตรวจสอบว่ามีข้อมูลใน formData สำหรับสรุปข้อมูลหรือไม่
    const hasSummaryData = useMemo(() => {
        return Object.entries(formData).some(([_, val]) => {
            if (!val) return false;
            if (typeof val === "string") {
                const trimmed = val.trim();
                return trimmed !== "" && trimmed !== "-";
            }
            return true;
        });
    }, [formData]);

    // AI Form Extraction handler
    const handleExtractAndFillForm = async (transcript = [], audioFiles = []) => {
        let transcriptText = "";
        if (Array.isArray(transcript) && transcript.length > 0) {
            transcriptText = transcript.map((item) => `${item.name || item.speaker || ""}: ${item.text || ""}`).join("\n");
        } else if (audioFiles.length > 0) {
            transcriptText = audioFiles.map((f) => f.transcript || f.rawText || "").filter(Boolean).join("\n");
        }

        if (!transcriptText || transcriptText.trim() === "") {
            transcriptText = noteText || "";
        }

        if (!transcriptText || transcriptText.trim() === "") {
            toast.warning("ยังไม่มีข้อความเสียง", "กรุณาอัปโหลดหรือบันทึกเสียงก่อนสกัดข้อมูลครับ");
            return;
        }

        setIsExtracting(true);
        try {
            const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8002";
            const response = await fetch(`${apiBase}/v1/extract-form`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: transcriptText,
                    patientAllergies: selectedPatient?.allergies || "",
                    patient_allergies: selectedPatient?.allergies || "",
                    patient: selectedPatient ? {
                        hn: selectedPatient.hn,
                        name: selectedPatient.fullName,
                        allergies: selectedPatient.allergies,
                        allergyDetails: selectedPatient.allergyDetails,
                    } : null,
                }),
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            if (!data) {
                throw new Error("ไม่ได้รับข้อมูลที่สกัดจาก API");
            }

            console.log("Extracted Data from API:", data);

            const serverSafetyAlerts = data.safetyAlerts || data.safety_alerts || [];
            if (serverSafetyAlerts.length > 0) {
                toast.error("⚠️ ตรวจพบความเสี่ยงด้านยา (Safety Alert)", serverSafetyAlerts[0]?.title || `พบการสั่งยาที่ตรงกับประวัติแพ้ยา`);
            }

            // ดึงข้อมูลสัญญาณชีพจาก API
            const vs = data.vitalSigns || data.vital_signs || data.vitals || {};
            let bp1Sys = vs.systolic || vs.bp_systolic || "";
            let bp1Dia = vs.diastolic || vs.bp_diastolic || "";
            let bpStr = vs.bp || vs.blood_pressure || "";

            if (!bp1Sys && !bp1Dia && bpStr && typeof bpStr === "string" && bpStr.includes("/")) {
                const parts = bpStr.split("/");
                bp1Sys = parts[0]?.trim() || "";
                bp1Dia = parts[1]?.trim() || "";
            } else if (bp1Sys && bp1Dia && !bpStr) {
                bpStr = `${bp1Sys}/${bp1Dia}`;
            }

            const mapVal = vs.map || (bp1Sys && bp1Dia ? String(Math.round((2 * Number(bp1Dia) + Number(bp1Sys)) / 3)) : "");
            const provDx = data.provisionalDiagnosis || data.provisional_diagnosis || data.diagnosis || "";

            // ICD-10 Code & Name
            const icd10Code = data.icd10Code || (data.icd10 ? data.icd10.split(" ")[0].replace(/[()]/g, "") : "") || "-";
            const icd10Name = data.icd10Name || data.icd10Desc || data.icd10_desc || (data.icd10?.includes("(") ? data.icd10.split("(")[1].replace(")", "") : "") || "-";
            const icd10Full = data.icd10 || (icd10Code !== "-" && icd10Name !== "-" ? `${icd10Code} (${icd10Name})` : icd10Code);

            // ICD-9 Code & Name
            const icd9Code = data.icd9Code || (data.icd9 ? data.icd9.split(" ")[0].replace(/[()]/g, "") : "") || "-";
            const icd9Name = data.icd9Name || data.icd9Desc || data.icd9_desc || (data.icd9?.includes("(") ? data.icd9.split("(")[1].replace(")", "") : "") || "-";
            const icd9Full = data.icd9 || (icd9Code !== "-" && icd9Name !== "-" ? `${icd9Code} (${icd9Name})` : icd9Code);

            // DRG Code & Name
            const drgCode = data.drgCode || (data.drg ? data.drg.split(" ")[0].replace(/[()]/g, "") : "") || "-";
            const drgName = data.drgName || data.drgDesc || data.drg_desc || (data.drg?.includes("(") ? data.drg.split("(")[1].replace(")", "") : "") || "-";
            const drgFull = data.drg || (drgCode !== "-" && drgName !== "-" ? `${drgCode} (${drgName})` : drgCode);

            const invList = Array.isArray(data.investigations) ? data.investigations : (data.investigation ? [data.investigation] : []);
            const invStr = data.investigation || invList.join(", ");

            // นำข้อมูลที่ได้จาก API สรุปกรอกลง formData โดยตรง
            setFormData((prev) => ({
                ...prev,
                chiefComplaint: data.chiefComplaint || data.chief_complaint || prev.chiefComplaint,
                presentIllness: data.presentIllness || data.present_illness || prev.presentIllness,
                pastHistory: data.pastHistory || data.past_history || prev.pastHistory,
                physicalExam: data.physicalExam || data.physical_exam || prev.physicalExam,
                provisionalDiagnosis: provDx || prev.provisionalDiagnosis || prev.diagnosis,
                diagnosis: provDx || prev.diagnosis,

                icd10: icd10Full || prev.icd10,
                icd10Code: icd10Code || prev.icd10Code,
                icd10Name: icd10Name || prev.icd10Name,
                icd10Desc: icd10Name || prev.icd10Desc,

                icd9: icd9Full || prev.icd9,
                icd9Code: icd9Code || prev.icd9Code,
                icd9Name: icd9Name || prev.icd9Name,
                icd9Desc: icd9Name || prev.icd9Desc,

                drg: drgFull || prev.drg,
                drgCode: drgCode || prev.drgCode,
                drgName: drgName || prev.drgName,
                drgDesc: drgName || prev.drgDesc,

                investigation: invStr || prev.investigation,
                investigations: invList.length > 0 ? invList : prev.investigations,
                treatmentPlan: data.treatmentPlan || data.treatment_plan || data.plan || data.note || prev.treatmentPlan,
                note: data.note || data.treatmentPlan || prev.note,
                disposition: data.disposition || prev.disposition || "OPD",
                rawText: data.rawText || data.raw_text || prev.rawText,
                extractedBy: data.extractedBy || data.extracted_by || prev.extractedBy,

                // สัญญาณชีพ
                bodyTemperature: (vs.bodyTemperature ?? vs.temperature ?? vs.temp ?? vs.bt) !== null && (vs.bodyTemperature ?? vs.temperature ?? vs.temp ?? vs.bt) !== undefined ? String(vs.bodyTemperature ?? vs.temperature ?? vs.temp ?? vs.bt) : prev.bodyTemperature,
                systolic: bp1Sys ? String(bp1Sys) : prev.systolic,
                diastolic: bp1Dia ? String(bp1Dia) : prev.diastolic,
                systolic2: (vs.systolic2 ?? vs.bp2_systolic) !== null && (vs.systolic2 ?? vs.bp2_systolic) !== undefined ? String(vs.systolic2 ?? vs.bp2_systolic) : prev.systolic2,
                diastolic2: (vs.diastolic2 ?? vs.bp2_diastolic) !== null && (vs.diastolic2 ?? vs.bp2_diastolic) !== undefined ? String(vs.diastolic2 ?? vs.bp2_diastolic) : prev.diastolic2,
                bp: bpStr || prev.bp,
                map: mapVal ? String(mapVal) : prev.map,
                map2: vs.map2 ? String(vs.map2) : prev.map2,
                pr: (vs.pulse ?? vs.pulse_rate ?? vs.pr) !== null && (vs.pulse ?? vs.pulse_rate ?? vs.pr) !== undefined ? String(vs.pulse ?? vs.pulse_rate ?? vs.pr) : prev.pr,
                pulse: (vs.pulse ?? vs.pulse_rate ?? vs.pr) !== null && (vs.pulse ?? vs.pulse_rate ?? vs.pr) !== undefined ? String(vs.pulse ?? vs.pulse_rate ?? vs.pr) : (prev.pulse || prev.pr),
                respiratory: (vs.respiratory ?? vs.respiratory_rate ?? vs.rr) !== null && (vs.respiratory ?? vs.respiratory_rate ?? vs.rr) !== undefined ? String(vs.respiratory ?? vs.respiratory_rate ?? vs.rr) : prev.respiratory,
                o2sat: (vs.o2sat ?? vs.spo2) !== null && (vs.o2sat ?? vs.spo2) !== undefined ? String(vs.o2sat ?? vs.spo2) : prev.o2sat,
                weight: (vs.weight ?? vs.wt) !== null && (vs.weight ?? vs.wt) !== undefined ? String(vs.weight ?? vs.wt) : prev.weight,
                height: (vs.height ?? vs.ht) !== null && (vs.height ?? vs.ht) !== undefined ? String(vs.height ?? vs.ht) : prev.height,
                bmi: vs.bmi !== null && vs.bmi !== undefined ? String(vs.bmi) : prev.bmi,
                bsa: vs.bsa !== null && vs.bsa !== undefined ? String(vs.bsa) : prev.bsa,
                chest: (vs.chest ?? vs.chest_circumference) !== null && (vs.chest ?? vs.chest_circumference) !== undefined ? String(vs.chest ?? vs.chest_circumference) : prev.chest,
                waist: (vs.waist ?? vs.waist_circumference) !== null && (vs.waist ?? vs.waist_circumference) !== undefined ? String(vs.waist ?? vs.waist_circumference) : prev.waist,
                painScore: (vs.painScore ?? vs.pain_score) !== null && (vs.painScore ?? vs.pain_score) !== undefined ? String(vs.painScore ?? vs.pain_score) : prev.painScore,
                esi: data.esi || vs.esi || prev.esi,
                barthelIndex: data.barthel_index || vs.barthel_index || vs.barthelIndex || prev.barthelIndex,
                cvdRisk: data.cvd_risk || vs.cvd_risk || vs.cvdRisk || prev.cvdRisk,
                safetyAlerts: serverSafetyAlerts.length > 0 ? serverSafetyAlerts : (data.safetyAlerts || prev.safetyAlerts || []),
            }));

            // แบบประเมิน
            const formsFromApi = Array.isArray(data.assessment_forms)
                ? data.assessment_forms
                : (Array.isArray(data.assessmentForms)
                    ? data.assessmentForms
                    : (data.assessments && typeof data.assessments === "object" ? Object.keys(data.assessments) : []));

            if (formsFromApi && formsFromApi.length > 0) {
                const validForms = formsFromApi.filter((id) => assessmentForms.some((f) => f.id === id));
                const finalForms = validForms.length > 0 ? validForms : formsFromApi;
                setSelectedFormIds(finalForms);
                setActiveFormId(finalForms[0]);
            } else {
                const suggestedForm = data.suggested_form_id || data.suggestedFormId || data.form_id;
                if (suggestedForm) {
                    setSelectedFormIds((prev) =>
                        prev.includes(suggestedForm) ? prev : [...prev, suggestedForm]
                    );
                    setActiveFormId(suggestedForm);
                }
            }

            // สกัดคะแนนและคำตอบแบบประเมิน
            if (data.assessments && typeof data.assessments === "object") {
                const rawAssessments = data.assessments;
                const nextAnswers = {};
                const nextResults = {};

                // 1. Depression
                if (rawAssessments.depression) {
                    const dep = rawAssessments.depression;
                    const ans = dep.answers || {};
                    nextAnswers.depression = {
                        "1": ans.q2_1 === "มี" || dep.q2?.q1 ? "ใช่" : "ไม่ใช่",
                        "2": ans.q2_2 === "มี" || dep.q2?.q2 ? "ใช่" : "ไม่ใช่",
                        "3": ans.sleep_issue?.includes("เกือบทุกคืน") || ans.sleep_issue?.includes("หลับยาก") ? "เป็นบ่อย (> 7 วัน)" : "เป็นบางวัน (1-7 วัน)",
                        "4": ans.fatigue?.includes("เกือบทุกวัน") || ans.fatigue?.includes("อ่อนเพลีย") ? "เป็นบ่อย" : "เป็นบางวัน",
                        "5": ans.appetite?.includes("เบื่ออาหาร") || ans.appetite?.includes("กินข้าวไม่ลง") ? "ใช่" : "ไม่ใช่",
                        "6": ans.concentration?.includes("ปกติ") || ans.concentration?.includes("จดจ่อได้") ? "ไม่ใช่" : "ใช่",
                    };
                    nextResults.depression = {
                        totalScore: dep.total_score || dep.score || (dep.q2?.positive ? 7 : 2),
                        resultLabel: dep.q2?.positive
                            ? "มีอาการซึมเศร้าระดับเล็กน้อย (Mild Depression - 2Q Positive แนะนำประเมิน 9Q ต่อ)"
                            : "ไม่พบภาวะซึมเศร้า (Normal / 2Q Negative)",
                        summary: dep.summary || "",
                    };
                }

                // 2. Smoking
                if (rawAssessments.smoking) {
                    const smk = rawAssessments.smoking;
                    const ans = smk.answers || {};
                    const isNever = smk.status === "never" || ans.smoking_status?.includes("ไม่เคยสูบ");
                    nextAnswers.smoking = {
                        "1": isNever ? "ไม่สูบ" : "สูบเป็นประจำ",
                        "2": isNever ? "น้อยกว่า 10 มวน" : (ans.cigarettes_per_day || "น้อยกว่า 10 มวน"),
                        "3": isNever ? "ไม่ใช่" : "ใช่",
                        "4": isNever ? "ไม่ใช่" : "ใช่",
                        "5": isNever ? "ใช่" : "ไม่ใช่",
                        "6": isNever ? "ไม่ใช่" : "ใช่",
                    };
                    nextResults.smoking = {
                        totalScore: ans.fagerstrom_score ?? (isNever ? 0 : 5),
                        resultLabel: isNever ? "ไม่สูบบุหรี่ (Never Smoker)" : "ระดับการติดนิโคตินปานกลาง",
                        summary: smk.summary || "",
                    };
                }

                // 3. Alcohol
                if (rawAssessments.alcohol) {
                    const alc = rawAssessments.alcohol;
                    const ans = alc.answers || {};
                    const isOccasional = alc.status === "occasional" || ans.frequency?.includes("นานๆ");
                    nextAnswers.alcohol = {
                        "1": isOccasional ? "เดือนละ 1 ครั้งหรือน้อยกว่า" : "ไม่เคยดื่มเลย",
                        "2": ans.amount?.includes("1-2") ? "1-2 ดื่ม" : "1-2 ดื่ม",
                        "3": "ไม่เคย",
                        "4": "ไม่ใช่",
                        "5": "ไม่ใช่",
                    };
                    nextResults.alcohol = {
                        totalScore: alc.total_score ?? (isOccasional ? 2 : 0),
                        resultLabel: ans.risk_level || "การดื่มระดับเสี่ยงต่ำ (Low Risk Drinking)",
                        summary: alc.summary || "",
                    };
                }

                // 4. Fall Risk
                if (rawAssessments.fall_risk) {
                    const fall = rawAssessments.fall_risk;
                    const ans = fall.answers || {};
                    nextAnswers.fall_risk = {
                        "1": "ไม่ใช่",
                        "2": "ไม่ใช่",
                        "3": "ไม่ต้องใช้อุปกรณ์/มีคนพยุง",
                        "4": "ไม่ใช่",
                        "5": "เดินปกติ ทรงตัวดี",
                        "6": "ไม่ใช่",
                    };
                    nextResults.fall_risk = {
                        totalScore: ans.morse_score ?? 0,
                        resultLabel: "ความเสี่ยงต่ำ (Low Fall Risk - ดูแลตามมาตรฐาน)",
                        summary: fall.summary || "",
                    };
                }

                // 5. ADL
                if (rawAssessments.adl) {
                    const adl = rawAssessments.adl;
                    const ans = adl.answers || {};
                    nextAnswers.adl = {
                        "1": "ทำได้เองทั้งหมด",
                        "2": "ใช่",
                        "3": "ทำได้เอง",
                        "4": "ทำได้เอง",
                        "5": "เดินได้เอง 50 เมตร",
                        "6": "ทำได้เอง",
                    };
                    nextResults.adl = {
                        totalScore: ans.total_score ?? 20,
                        resultLabel: "ช่วยเหลือตนเองได้ทั้งหมด (Independent - 20/20 คะแนน)",
                        summary: adl.summary || "",
                    };
                }

                // 6. MNA
                if (rawAssessments.mna) {
                    const mna = rawAssessments.mna;
                    const ans = mna.answers || {};
                    nextAnswers.mna = {
                        "1": "ลดลงปานกลาง (1)",
                        "2": "ไม่ทราบ (2)",
                        "3": "ออกไปข้างนอกได้ปกติ (2)",
                        "4": ans.psychological_stress?.includes("มี") ? "ใช่" : "ไม่ใช่",
                        "5": ans.neuropsychological?.includes("ซึมเศร้า") ? "ความจำเสื่อมเล็กน้อย (1)" : "ไม่มีปัญหา (2)",
                        "6": "BMI ≥ 23 (3)",
                    };
                    nextResults.mna = {
                        totalScore: mna.total_score ?? 11,
                        resultLabel: "มีความเสี่ยงต่อภาวะทุพโภชนาการ (At Risk of Malnutrition)",
                        summary: mna.summary || "",
                    };
                }

                setAssessmentAnswers((prev) => ({ ...prev, ...nextAnswers }));
                setAssessmentResults((prev) => ({ ...prev, ...nextResults }));
            }

            toast.success("ดึงข้อมูลจาก API สำเร็จ", "นำเข้าข้อมูลและสัญญาณชีพจากระบบเรียบร้อยแล้ว");
        } catch (err) {
            console.error("Error extracting form from API:", err);
            toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลจาก API", err.message || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ AI ได้");
        } finally {
            setIsExtracting(false);
        }
    };

    // Handler to apply updates directly from AI Clinical Summary component
    const handleApplySummaryToForm = (data) => {
        const vs = data.vitalSigns || data.vital_signs || data.vitals || {};
        const updates = { ...data };

        if (vs && typeof vs === "object") {
            if (vs.pulse || vs.pr) {
                updates.pulse = String(vs.pulse || vs.pr);
                updates.pr = String(vs.pulse || vs.pr);
            }
            if (vs.bodyTemperature !== null && vs.bodyTemperature !== undefined) updates.bodyTemperature = String(vs.bodyTemperature);
            if (vs.bp) updates.bp = String(vs.bp);
            if (vs.systolic !== null && vs.systolic !== undefined) updates.systolic = String(vs.systolic);
            if (vs.diastolic !== null && vs.diastolic !== undefined) updates.diastolic = String(vs.diastolic);
            if (vs.systolic2 !== null && vs.systolic2 !== undefined) updates.systolic2 = String(vs.systolic2);
            if (vs.diastolic2 !== null && vs.diastolic2 !== undefined) updates.diastolic2 = String(vs.diastolic2);
            if (vs.bp2) updates.bp2 = String(vs.bp2);
            if (vs.map !== null && vs.map !== undefined) updates.map = String(vs.map);
            if (vs.map2 !== null && vs.map2 !== undefined) updates.map2 = String(vs.map2);
            if (vs.o2sat !== null && vs.o2sat !== undefined) updates.o2sat = String(vs.o2sat);
            if (vs.respiratory !== null && vs.respiratory !== undefined) updates.respiratory = String(vs.respiratory);
            if (vs.painScore !== null && vs.painScore !== undefined) updates.painScore = String(vs.painScore);
            if (vs.weight !== null && vs.weight !== undefined) updates.weight = String(vs.weight);
            if (vs.height !== null && vs.height !== undefined) updates.height = String(vs.height);
            if (vs.bmi !== null && vs.bmi !== undefined) updates.bmi = String(vs.bmi);
            if (vs.chest !== null && vs.chest !== undefined) updates.chest = String(vs.chest);
            if (vs.waist !== null && vs.waist !== undefined) updates.waist = String(vs.waist);
        }

        if (data.provisionalDiagnosis && !updates.diagnosis) {
            updates.diagnosis = data.provisionalDiagnosis;
        }
        if (data.provisional_diagnosis && !updates.diagnosis) {
            updates.diagnosis = data.provisional_diagnosis;
            updates.provisionalDiagnosis = data.provisional_diagnosis;
        }
        if (data.diagnosis && !updates.provisionalDiagnosis) {
            updates.provisionalDiagnosis = data.diagnosis;
        }
        if (data.treatmentPlan && !updates.note) {
            updates.note = data.treatmentPlan;
        }
        if (data.note && !updates.treatmentPlan) {
            updates.treatmentPlan = data.note;
        }

        setFormData((prev) => ({
            ...prev,
            ...updates,
        }));
    };

    // Helper to safely remove a conflicting allergic drug from treatment plan
    const handleRemoveDrugFromPlan = useCallback((alert) => {
        if (!alert || !alert.detectedAlias) return;
        const alias = alert.detectedAlias;
        const regex = new RegExp(`\\b${alias}\\b|${alias}`, "gi");
        setFormData((prev) => {
            const nextPlan = (prev.treatmentPlan || "").replace(regex, "").replace(/,\s*,/g, ",").replace(/\s{2,}/g, " ").trim();
            const nextNote = (prev.note || "").replace(regex, "").replace(/,\s*,/g, ",").replace(/\s{2,}/g, " ").trim();
            return {
                ...prev,
                treatmentPlan: nextPlan,
                note: nextNote,
            };
        });
        toast.info("ปรับปรุงแผนการรักษา", `นำยา ${alert.detectedDrug} ออกจากแผนการรักษาเรียบร้อยแล้ว`);
    }, []);

    // Function to calculate drug allergy alerts given transcript and audio files
    const getDrugAllergyAlerts = useCallback((transcript = [], audioFiles = []) => {
        const rawAudioTexts = audioFiles.map((f) => f.transcript || f.rawText || "").filter(Boolean);
        const clientAlerts = checkDrugAllergySafety(selectedPatient, {
            transcript,
            treatmentPlan: formData.treatmentPlan,
            note: formData.note,
            rawAudioTexts,
        });

        const serverAlerts = (formData.safetyAlerts || []).map((sa, idx) => ({
            id: sa.id || `server-safety-${idx}`,
            severity: sa.severity || "CRITICAL",
            badge: sa.badge || "CRITICAL SAFETY ALERT",
            title: sa.title || "คำเตือนความปลอดภัยด้านยา",
            detectedDrug: sa.drug || sa.detectedDrug || "",
            patientAllergy: sa.allergen || sa.patientAllergy || selectedPatient?.allergies || "",
            groupName: sa.groupName || "",
            message: sa.message || "",
            recommendation: sa.recommendation || "",
            snippet: sa.snippet || "",
            detectedIn: "AI Safety Engine (Backend)",
            reaction: sa.reaction || "เสี่ยงต่อการเกิดปฏิกิริยาแพ้ยารุนแรง (Anaphylaxis)",
            severityLevel: sa.severityLevel || sa.severity || "Critical",
        }));

        // Merge and deduplicate by detectedDrug or ID
        const combined = [...serverAlerts];
        clientAlerts.forEach((ca) => {
            const exists = combined.some((sa) =>
                (sa.detectedDrug && ca.detectedDrug && sa.detectedDrug.toLowerCase().includes(ca.detectedDrug.toLowerCase())) ||
                (sa.id === ca.id)
            );
            if (!exists) {
                combined.push(ca);
            }
        });

        return combined;
    }, [selectedPatient, formData.treatmentPlan, formData.note, formData.safetyAlerts]);

    return {
        // Patient & Form Data
        selectedPatient,
        setSelectedPatient,
        handleSelectPatient,
        triageBaseline,
        setTriageBaseline,
        formData,
        setFormData,
        conflictCount,
        handleRevertField,
        handleRevertAllConflicts,
        handleAcceptAllConflicts,

        // Tab Navigation
        activeStep,
        setActiveStep,

        // Assessment Forms
        selectedFormIds,
        setSelectedFormIds,
        activeFormId,
        setActiveFormId,
        isOpen,
        setIsOpen,
        assessmentAnswers,
        setAssessmentAnswers,
        assessmentResults,
        setAssessmentResults,

        // Note & Extraction
        noteText,
        setNoteText,
        isExtracting,
        hasSummaryData,
        handleExtractAndFillForm,
        handleApplySummaryToForm,

        // Drug Allergy & Safety Alerts
        getDrugAllergyAlerts,
        handleRemoveDrugFromPlan,
    };
}
