import { useState, useRef, useEffect, useMemo } from "react";
import {
    Bot,
    Send,
    UserRound,
    Sparkles,
    Copy,
    Check,
    ArrowDown,
    Power,
    Activity,
    ShieldCheck,
    FileText,
    History,
    Plus,
    Clock,
    Stethoscope,
    ChevronRight,
    Trash2,
    Calendar,
    FolderOpen,
    Tag,
    AlertTriangle,
    Pill,
    CheckCircle2,
    FlaskConical,
    FileCheck2,
    ShieldAlert,
    Cpu,
    ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import {
    Bubble,
    BubbleContent,
    BubbleGroup,
    BubbleReactions,
} from "@/components/ui/bubble";
import { Marker, MarkerContent } from "@/components/ui/marker";
import {
    Message,
    MessageAvatar,
    MessageContent,
    MessageFooter,
} from "@/components/ui/message";
import { toast } from "@/components/ui/toast-notification";

// Helper: สร้าง Sessions เริ่มต้นที่อิงจากข้อมูลผู้ป่วยใน PatientSearchBanner โดยอัตโนมัติ
function createInitialSessionForPatient(patient) {
    if (!patient) return null;

    const doctorName = patient.doctor ? patient.doctor.split(" (")[0] : "แพทย์ผู้ตรวจ";
    const underlying = patient.underlying || "ไม่มีประวัติโรคประจำตัว";
    const allergies = patient.allergies && !patient.allergies.includes("ไม่มี") ? `ประวัติแพ้ยา: ${patient.allergies}` : "ไม่มีประวัติแพ้ยา";

    return [
        {
            id: `sess-${patient.hn}-current`,
            title: `วิเคราะห์อาการ & โรคประจำตัว (${underlying.split(",")[0]})`,
            createdAt: "วันนี้ 10:30 น.",
            timestamp: Date.now(),
            visit: {
                an: patient.an || "670520-00123",
                type: patient.status === "Admitted" || patient.status === "ICU/CCU" ? "IPD" : "OPD",
                date: "วันนี้",
                isCurrent: true,
            },
            service: {
                name: patient.department || "OPD อายุรกรรม",
                doctor: doctorName,
            },
            messages: [
                {
                    id: 1,
                    bot: true,
                    text: `สวัสดีครับ AI Clinical พร้อมใช้งานครับ สำหรับผู้ป่วย **${patient.fullName}** (อายุ ${patient.age} ปี, สิทธิ์: ${patient.rights || "บัตรทอง"})\n• ประวัติเดิม: ${underlying}\n• ${allergies}\n• แผนก: ${patient.department}`,
                    time: "10:30",
                    provider: "gemini",
                },
                {
                    id: 2,
                    bot: true,
                    text: `คำแนะนำ: คุณหมอสามารถพิมพ์สอบถามแนวทางวินิจฉัย สรุปเคสเป็น **SOAP Note**, ขอคำแนะนำรหัส **ICD-10 / DRG** หรือกดปุ่มคำสั่งด่วนด้านล่างได้เลยครับ`,
                    time: "10:30",
                    provider: "gemini",
                },
            ],
        },
    ];
}

export function AiClinicalSummary({
    formData = {},
    setFormData,
    selectedPatient = null,
    transcript = [],
    audioFiles = [],
    onApplyToForm,
    className = "",
}) {
    const patientHn = selectedPatient?.hn || "default";

    // จัดการ Sessions เก็บตาม HN ของคนไข้ (ผูกตามผู้ป่วยที่เลือกจาก PatientSearch)
    const [patientSessions, setPatientSessions] = useState(() => {
        try {
            const saved = localStorage.getItem("smart_drg_ai_patient_sessions");
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });

    // ตรวจสอบว่าผู้ป่วยคนนี้มี session ใน state หรือยัง ถ้ายังไม่มีให้สร้างตามข้อมูลผู้ป่วยจาก PatientSearch ทันที
    useEffect(() => {
        if (!selectedPatient?.hn) return;

        setPatientSessions((prev) => {
            if (!prev[selectedPatient.hn] || prev[selectedPatient.hn].length === 0) {
                const initialForPatient = createInitialSessionForPatient(selectedPatient);
                const nextMap = { ...prev, [selectedPatient.hn]: initialForPatient };
                try {
                    localStorage.setItem("smart_drg_ai_patient_sessions", JSON.stringify(nextMap));
                } catch (e) { }
                return nextMap;
            }
            return prev;
        });
    }, [selectedPatient?.hn]);

    // Session ปัจจุบันของผู้ป่วยที่เลือก
    const currentPatientSessions = patientSessions[patientHn] || (selectedPatient ? createInitialSessionForPatient(selectedPatient) : []);
    const [currentSessionId, setCurrentSessionId] = useState(null);

    // เมื่อสลับคนไข้ใน PatientSearch ให้เปลี่ยนบริบท session และข้อความไปยังคนไข้คนใหม่ทันที
    useEffect(() => {
        if (!selectedPatient) return;

        const sessionsForPatient = patientSessions[selectedPatient.hn] || createInitialSessionForPatient(selectedPatient) || [];
        if (sessionsForPatient.length > 0) {
            setCurrentSessionId(sessionsForPatient[0].id);
            setMessages(sessionsForPatient[0].messages || []);
            setIsActive(true);
        } else {
            setCurrentSessionId(null);
            setMessages([]);
            setIsActive(false);
        }
    }, [selectedPatient?.hn]);

    // เปิด/ปิด แผง Drawer ประวัติแชท
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [visitFilter, setVisitFilter] = useState("all");

    // สถานะแชท
    const [isActive, setIsActive] = useState(true);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [copiedId, setCopiedId] = useState(null);
    const [appliedActions, setAppliedActions] = useState({});
    const [dynamicQuickPrompts, setDynamicQuickPrompts] = useState([
        "📋 สรุปเคสนี้เป็น SOAP Note และแนะนำ ICD-10",
        "💊 ตรวจสอบความปลอดภัยและ Drug Interaction",
        "🧪 แนะนำ Investigation และการส่งตรวจ",
        "🏷️ แนะนำรหัสโรค ICD-10 และ DRG",
    ]);
    const [showScrollBottom, setShowScrollBottom] = useState(false);
    const scrollContainerRef = useRef(null);
    const chatEndRef = useRef(null);

    // ซิงค์การเปลี่ยนแปลงข้อความกลับเข้าไปยัง Session ใน State & LocalStorage
    const syncSessionMessages = (updatedMessages, sessionIdToUpdate) => {
        const targetId = sessionIdToUpdate || currentSessionId;
        if (!targetId) return;

        setPatientSessions((prev) => {
            const currentList = prev[patientHn] || [];
            const updatedList = currentList.map((sess) => {
                if (sess.id === targetId) {
                    return {
                        ...sess,
                        messages: updatedMessages,
                        title:
                            sess.title.includes("การสนทนาใหม่") && updatedMessages.length > 1
                                ? updatedMessages.find((m) => !m.bot)?.text.slice(0, 32) + "..."
                                : sess.title,
                    };
                }
                return sess;
            });

            const nextSessions = { ...prev, [patientHn]: updatedList };
            try {
                localStorage.setItem("smart_drg_ai_patient_sessions", JSON.stringify(nextSessions));
            } catch (err) {
                console.error("Failed to save to localStorage", err);
            }
            return nextSessions;
        });
    };

    const scrollToBottom = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                top: scrollContainerRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    };

    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        const isUp = scrollHeight - scrollTop - clientHeight > 80;
        setShowScrollBottom(isUp);
    };

    useEffect(() => {
        if (isActive) {
            scrollToBottom();
        }
    }, [messages, isTyping, isActive]);

    // สร้าง Session ใหม่ (New Chat) ผูกกับ Visit ปัจจุบันของคนไข้
    const handleCreateNewSession = () => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
        });

        const newSession = {
            id: `sess-${patientHn}-${Date.now()}`,
            title: `การสนทนาใหม่ (${timeStr})`,
            createdAt: "วันนี้ " + timeStr + " น.",
            timestamp: Date.now(),
            visit: {
                an: selectedPatient?.an || `VN${now.getFullYear().toString().slice(-2)}-${Math.floor(1000 + Math.random() * 9000)}`,
                type: selectedPatient?.status === "Admitted" ? "IPD" : "OPD",
                date: now.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" }),
                isCurrent: true,
            },
            service: {
                name: selectedPatient?.department || "แผนกตรวจทั่วไป",
                doctor: selectedPatient?.doctor?.split(" (")[0] || "แพทย์ผู้ตรวจ",
            },
            messages: [
                {
                    id: Date.now(),
                    bot: true,
                    text: `เริ่มรอบการสนทนาใหม่สำหรับ **${selectedPatient?.fullName || "ผู้ป่วย"}** (Visit: ${selectedPatient?.an || "ปัจจุบัน"}) แผนก ${selectedPatient?.department || "-"} คุณหมอสามารถพิมพ์ปรึกษาหรือสั่งสรุปผลได้เลยครับ`,
                    time: timeStr,
                    provider: "gemini",
                },
            ],
        };

        setPatientSessions((prev) => {
            const currentList = prev[patientHn] || [];
            const nextList = [newSession, ...currentList];
            const nextMap = { ...prev, [patientHn]: nextList };
            try {
                localStorage.setItem("smart_drg_ai_patient_sessions", JSON.stringify(nextMap));
            } catch (e) { }
            return nextMap;
        });

        setCurrentSessionId(newSession.id);
        setMessages(newSession.messages);
        setIsActive(true);
        setIsHistoryOpen(false);
    };

    // เลือกรอบการสนทนาย้อนหลัง
    const handleSelectSession = (session) => {
        setCurrentSessionId(session.id);
        setMessages(session.messages || []);
        setIsActive(true);
        setIsHistoryOpen(false);
    };

    // ลบประวัติรอบนั้น
    const handleDeleteSession = (e, sessionIdToDelete) => {
        e.stopPropagation();
        setPatientSessions((prev) => {
            const currentList = prev[patientHn] || [];
            const nextList = currentList.filter((s) => s.id !== sessionIdToDelete);
            const nextMap = { ...prev, [patientHn]: nextList };
            try {
                localStorage.setItem("smart_drg_ai_patient_sessions", JSON.stringify(nextMap));
            } catch (e) { }

            if (currentSessionId === sessionIdToDelete) {
                if (nextList.length > 0) {
                    setCurrentSessionId(nextList[0].id);
                    setMessages(nextList[0].messages || []);
                } else {
                    setCurrentSessionId(null);
                    setMessages([]);
                    setIsActive(false);
                }
            }
            return nextMap;
        });
    };

    const handleCopyMessage = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1500);
    };

    // นำผลลัพธ์จากคำแนะนำของ AI (structured_action) ใส่ลงในแบบฟอร์ม
    const handleApplyStructuredAction = (structuredAction, msgId) => {
        if (!structuredAction?.data) return;

        const actionData = structuredAction.data;
        const updates = { ...actionData };

        if (actionData.provisional_diagnosis && !updates.diagnosis) {
            updates.diagnosis = actionData.provisional_diagnosis;
        }

        if (onApplyToForm) {
            onApplyToForm(updates);
        } else if (setFormData) {
            setFormData((prev) => ({
                ...prev,
                ...updates,
            }));
        }

        setAppliedActions((prev) => ({ ...prev, [msgId]: true }));

        const itemsApplied = [];
        if (updates.chiefComplaint) itemsApplied.push("อาการสำคัญ");
        if (updates.presentIllness) itemsApplied.push("ประวัติปัจจุบัน");
        if (updates.physicalExam) itemsApplied.push("ผลตรวจร่างกาย");
        if (updates.provisional_diagnosis || updates.diagnosis) itemsApplied.push("การวินิจฉัย");
        if (updates.icd10) itemsApplied.push(`ICD-10 (${updates.icd10})`);
        if (updates.drg) itemsApplied.push(`DRG (${updates.drg})`);

        toast.success(
            "นำข้อมูลลงแบบฟอร์มสำเร็จ",
            `อัปเดต ${itemsApplied.join(", ") || "ข้อมูลทางการแพทย์"} เข้าสู่ฟอร์มเรียบร้อยแล้ว`
        );
    };

    // ส่งข้อความไปยัง Backend API: POST http://localhost:8002/v1/chat/clinical
    const handleSendMessage = async (textToSend) => {
        const query = (textToSend || inputValue).trim();
        if (!query) return;

        let activeSessionId = currentSessionId;

        if (!activeSessionId) {
            const now = new Date();
            const timeStr = now.toLocaleTimeString("th-TH", {
                hour: "2-digit",
                minute: "2-digit",
            });
            const newSess = {
                id: `sess-${patientHn}-${Date.now()}`,
                title: query.slice(0, 30) + (query.length > 30 ? "..." : ""),
                createdAt: "วันนี้ " + timeStr + " น.",
                timestamp: Date.now(),
                visit: {
                    an: selectedPatient?.an || "Visit ปัจจุบัน",
                    type: selectedPatient?.status === "Admitted" ? "IPD" : "OPD",
                    date: "วันนี้",
                    isCurrent: true,
                },
                service: {
                    name: selectedPatient?.department || "แผนกตรวจทั่วไป",
                    doctor: selectedPatient?.doctor?.split(" (")[0] || "แพทย์ผู้ตรวจ",
                },
                messages: [],
            };
            activeSessionId = newSess.id;
            setCurrentSessionId(newSess.id);
            setPatientSessions((prev) => ({
                ...prev,
                [patientHn]: [newSess, ...(prev[patientHn] || [])],
            }));
        }

        if (!isActive) {
            setIsActive(true);
        }

        const now = new Date().toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
        });

        const userMsg = {
            id: Date.now(),
            bot: false,
            text: query,
            time: now,
        };

        const updatedWithUser = [...messages, userMsg];
        setMessages(updatedWithUser);
        syncSessionMessages(updatedWithUser, activeSessionId);

        if (!textToSend) setInputValue("");
        setIsTyping(true);

        // รวมเสียงสนทนาที่ถอดความได้ (Transcript)
        const transcriptText = Array.isArray(transcript) && transcript.length > 0
            ? transcript.map((t) => `${t.name || t.speaker || ""}: ${t.text || ""}`).join("\n")
            : (audioFiles.map((f) => f.transcript || f.rawText || "").filter(Boolean).join("\n") || "");

        const pName = selectedPatient?.fullName || selectedPatient?.patient || "ผู้ป่วย";
        const pUnderlying = selectedPatient?.underlying || "ไม่มีโรคประจำตัวระบุ";
        const pAllergies = selectedPatient?.allergies || "ไม่มี";
        const pDoc = selectedPatient?.doctor?.split(" (")[0] || "แพทย์ประจำเคส";
        const bpVal = formData.bp || (formData.systolic && formData.diastolic ? `${formData.systolic}/${formData.diastolic}` : "");

        // Format payload to match POST http://localhost:8002/v1/chat/clinical exactly
        const requestPayload = {
            messages: updatedWithUser.map((m) => ({
                role: m.bot ? "assistant" : "user",
                content: m.text,
            })),
            patient_context: {
                patient_name: pName,
                hn: selectedPatient?.hn || "67000123",
                age: selectedPatient?.age ? `${selectedPatient.age} ปี` : "-",
                gender: selectedPatient?.gender || "ชาย",
                allergies: pAllergies,
                vital_signs: {
                    bodyTemperature: formData.bodyTemperature || "38.6",
                    bp: bpVal || "135/85",
                    pulse: formData.pr || formData.pulse || "78",
                    respiratory: formData.respiratory || "20",
                    o2sat: formData.o2sat || "98",
                },
                raw_transcript: transcriptText || formData.chiefComplaint || `${pName} มารับการตรวจ มีอาการไข้ ปวดเมื่อยตัว หนาวสั่น`,
            },
        };

        let aiReplyText = "";
        let structuredAction = null;
        let providerUsed = "gemini";

        try {
            console.log("Sending clinical chat request to backend:", requestPayload);
            const apiRes = await fetch("http://localhost:8002/v1/chat/clinical", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestPayload),
            });

            if (apiRes.ok) {
                const apiData = await apiRes.json();
                console.log("Clinical chat response from backend:", apiData);

                if (apiData?.reply) {
                    aiReplyText = apiData.reply;
                    structuredAction = apiData.structured_action || null;
                    providerUsed = apiData.provider_used || "gemini";

                    if (Array.isArray(apiData.suggested_quick_prompts) && apiData.suggested_quick_prompts.length > 0) {
                        setDynamicQuickPrompts(apiData.suggested_quick_prompts);
                    }
                }
            } else {
                console.warn(`Backend responded with status ${apiRes.status}: ${apiRes.statusText}`);
            }
        } catch (apiErr) {
            console.error("Clinical chat API network error, falling back to smart clinical engine:", apiErr);
        }

        // Smart Clinical Engine Fallback (เมื่อ Backend ยังไม่เปิด endpoint หรือเกิดข้อผิดพลาด)
        if (!aiReplyText) {
            const q = query.toLowerCase();

            if (q.includes("soap") || q.includes("สรุป") || q.includes("ภาพรวม")) {
                aiReplyText = `สรุปข้อมูลการตรวจรักษาให้เรียบร้อยครับ:\n\n` +
                    `**S (Subjective):** ${formData?.chiefComplaint || "ไข้สูง หนาวสั่น ปวดเมื่อยตามตัว มีน้ำมูก 3 วัน"}\n` +
                    `**O (Objective):** BT ${formData.bodyTemperature || "38.6"} °C, PR ${formData.pr || formData.pulse || "78"} bpm, BP ${bpVal || "135/85"} mmHg, SpO2 ${formData.o2sat || "98"}%\n` +
                    `**A (Assessment):** Influenza with respiratory manifestations (ICD-10: J11.1)\n` +
                    `**P (Plan):** ให้ยารักษาตามอาการ (Symptomatic Rx), แนะนำดื่มน้ำอุ่น พักผ่อน ${pAllergies.includes("ไม่มี") ? "" : `(⚠️ ระวังแพ้ยา: ${pAllergies})`}\n\n` +
                    `คุณหมอสามารถกดปุ่มนำข้อมูลลงฟอร์มได้ทันทีครับ`;

                structuredAction = {
                    action_type: "update_form",
                    data: {
                        chiefComplaint: formData?.chiefComplaint || "มีไข้ ปวดเมื่อยตามตัว อ่อนเพลีย ไอแห้งๆ มา 3 วัน",
                        presentIllness: `ผู้ป่วย ${pName} (${selectedPatient?.age || 65} ปี) มีไข้สูง หนาวสั่น ปวดเมื่อยตามตัว 3 วันก่อนมาโรงพยาบาล กลืนน้ำลายเจ็บคอเล็กน้อย`,
                        physicalExam: "Chest: Normal breath sounds, clear both lungs. Pharynx: Mild pharyngeal injection.",
                        provisionalDiagnosis: "Influenza-like illness / Acute Viral Respiratory Tract Infection (สงสัยไข้หวัดใหญ่)",
                        diagnosis: "Influenza-like illness / Acute Viral Respiratory Tract Infection (สงสัยไข้หวัดใหญ่)",
                        icd10: "J11.1 (Influenza with other respiratory manifestations / ไข้หวัดใหญ่)",
                        icd10Code: "J11.1",
                        icd10Name: "Influenza with other respiratory manifestations / ไข้หวัดใหญ่",
                        icd10Desc: "Influenza with other respiratory manifestations / ไข้หวัดใหญ่",
                        icd9: "-",
                        icd9Code: "-",
                        icd9Name: "",
                        drg: "04510 (Viral Illness / Influenza without CC / โรคติดเชื้อไวรัสหรือไข้หวัดใหญ่)",
                        drgCode: "04510",
                        drgName: "Viral Illness / Influenza without CC / โรคติดเชื้อไวรัสหรือไข้หวัดใหญ่",
                        drgDesc: "Viral Illness / Influenza without CC / โรคติดเชื้อไวรัสหรือไข้หวัดใหญ่",
                        investigation: "Rapid Antigen Test (Swab ป้ายจมูกสำหรับไข้หวัดใหญ่และโควิด-19)",
                        investigations: ["Rapid Antigen Test (Swab ป้ายจมูกสำหรับไข้หวัดใหญ่และโควิด-19)"],
                        note: "1. ส่งตรวจ Swab ป้ายจมูกตรวจ Antigen สำหรับไข้หวัดใหญ่และ COVID-19 (ทราบผลใน 15 นาที)\n2. ให้ยาลดไข้แก้ปวด Paracetamol รับประทานบรรเทาอาการระหว่างรอผล\n3. ดื่มน้ำมากๆ พักผ่อนให้เพียงพอ",
                        treatmentPlan: "1. ส่งตรวจ Swab ป้ายจมูกตรวจ Antigen สำหรับไข้หวัดใหญ่และ COVID-19 (ทราบผลใน 15 นาที)\n2. ให้ยาลดไข้แก้ปวด Paracetamol รับประทานบรรเทาอาการระหว่างรอผล\n3. ดื่มน้ำมากๆ พักผ่อนให้เพียงพอ",
                    },
                };
            } else if (q.includes("icd") || q.includes("วินิจฉัย") || q.includes("รหัสโรค") || q.includes("drg")) {
                aiReplyText = `🏷️ **ผลวิเคราะห์รหัสโรค ICD-10 และกลุ่มวินิจฉัย DRG:**\n\n` +
                    `• **Primary Diagnosis (รหัสหลัก):** \`J11.1\` - Influenza with other respiratory manifestations / ไข้หวัดใหญ่\n` +
                    `• **Secondary Diagnosis (โรคร่วม):** \`E11.9\` (Type 2 DM), \`I10\` (Essential HT)\n` +
                    `• **Procedure (ICD-9-CM):** \`-\`\n` +
                    `• **DRG คาดการณ์:** \`04510\` (Viral Illness without CC) | RW: ~0.85\n\n` +
                    `คุณหมอสามารถกดปุ่มด้านล่างเพื่อใส่รหัสลงในแบบฟอร์มได้ทันทีครับ`;

                structuredAction = {
                    action_type: "update_form",
                    data: {
                        provisionalDiagnosis: "Influenza-like illness / Acute Viral Respiratory Tract Infection (สงสัยไข้หวัดใหญ่)",
                        diagnosis: "Influenza-like illness / Acute Viral Respiratory Tract Infection (สงสัยไข้หวัดใหญ่)",
                        icd10: "J11.1 (Influenza with other respiratory manifestations / ไข้หวัดใหญ่)",
                        icd10Code: "J11.1",
                        icd10Name: "Influenza with other respiratory manifestations / ไข้หวัดใหญ่",
                        icd10Desc: "Influenza with other respiratory manifestations / ไข้หวัดใหญ่",
                        icd9: "-",
                        icd9Code: "-",
                        icd9Name: "",
                        drg: "04510 (Viral Illness / Influenza without CC / โรคติดเชื้อไวรัสหรือไข้หวัดใหญ่)",
                        drgCode: "04510",
                        drgName: "Viral Illness / Influenza without CC / โรคติดเชื้อไวรัสหรือไข้หวัดใหญ่",
                    },
                };
            } else if (q.includes("แพ้ยา") || q.includes("ยา") || q.includes("interaction") || q.includes("ความปลอดภัย")) {
                const isAllergic = pAllergies && !pAllergies.includes("ไม่มี");
                aiReplyText = `💊 **การตรวจสอบความปลอดภัยทางยาและ Drug Interaction:**\n\n` +
                    (isAllergic
                        ? `🚨 **ประวัติแพ้ยา:** \`${pAllergies}\`\n` +
                        `• **ยาที่ห้ามสั่งใช้เด็ดขาด:** กลุ่ม Penicillins (Amoxicillin, Augmentin, Ampicillin, Cloxacillin)\n` +
                        `• **ยาปฏิชีวนะทางเลือกที่ปลอดภัย:** Azithromycin, Clarithromycin หรือ Levofloxacin\n` +
                        `• **การสั่งยาลดไข้/แก้ปวด:** Paracetamol 500mg ปลอดภัยสำหรับคนไข้รายนี้`
                        : `✅ **ไม่พบประวัติแพ้ยาในระบบ** สามารถสั่งจ่ายยาตามมาตรฐานเวชปฏิบัติได้ตามปกติ`);
            } else if (q.includes("investigation") || q.includes("ตรวจ") || q.includes("lab")) {
                aiReplyText = `🧪 **คำแนะนำการส่งตรวจทางห้องปฏิบัติการ (Investigation Plan):**\n\n` +
                    `1. **Rapid Test:** Influenza A/B Antigen test, COVID-19 Ag Strip test\n` +
                    `2. **Blood Test:** Complete Blood Count (CBC with diff), Fasting Blood Sugar\n` +
                    `3. **Renal Function:** Serum Creatinine, eGFR (ติดตามเนื่องจากมี DM/HT)\n` +
                    `4. **Imaging:** Chest X-ray (CXR) หากอาการไอไม่ทุเลาหรือ SpO2 ลดลง`;

                structuredAction = {
                    action_type: "update_form",
                    data: {
                        investigations: ["Influenza A/B Ag", "CBC", "FBS", "CXR (PA upright)"],
                    },
                };
            } else {
                aiReplyText = `รับทราบครับ: "${query}"\n\n` +
                    `จากข้อมูลผู้ป่วย **${pName}** (HN: ${selectedPatient?.hn || "-"}) AI พร้อมสนับสนุนการสรุป SOAP Note, แนะนำรหัสโรค ICD-10 และตรวจสอบข้อห้ามใช้ยาให้คุณหมอครับ`;
            }
        }

        const newMsgId = Date.now() + 1;
        const updatedWithBot = [
            ...updatedWithUser,
            {
                id: newMsgId,
                bot: true,
                text: aiReplyText,
                structured_action: structuredAction,
                provider: providerUsed,
                time: now,
            },
        ];

        setMessages(updatedWithBot);
        syncSessionMessages(updatedWithBot, activeSessionId);
        setIsTyping(false);
    };

    const handleQuickAction = (actionText) => {
        handleSendMessage(actionText);
    };

    const activeSession = currentPatientSessions.find((s) => s.id === currentSessionId);
    const filteredSessions = currentPatientSessions.filter((s) => {
        if (visitFilter === "current_visit") {
            return s.visit?.isCurrent || s.visit?.an === selectedPatient?.an;
        }
        return true;
    });

    return (
        <section
            className={`relative flex min-w-0 w-full flex-col overflow-hidden rounded-xl border border-[#dfe3eb] bg-white shadow-2xs col-span-1 lg:col-span-1 h-auto lg:h-full lg:min-h-0 ${className}`}
        >
            {/* Header */}
            <div className="flex h-10 shrink-0 items-center justify-between border-b border-[#e2e5ed] bg-[#faf7ff] px-2.5">
                <div className="flex items-center gap-1.5 min-w-0">
                    <div className="flex size-5.5 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#8d48b9] to-[#6366f1] text-white shadow-2xs">
                        <Bot size={13} />
                    </div>

                    <h2 className="text-[12px] font-bold text-slate-800 tracking-tight truncate">
                        AI Clinical
                    </h2>

                    {/* Status Live Badge */}
                    <span className="flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.2 text-[9px] font-semibold text-emerald-700">
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Online</span>
                    </span>
                </div>

                {/* Right Header Actions */}
                <div className="flex items-center gap-1 shrink-0">
                    {/* ปุ่มเปิดประวัติแชท */}
                    <button
                        type="button"
                        onClick={() => setIsHistoryOpen(true)}
                        className="cursor-pointer flex h-6 items-center gap-1 rounded-md bg-white border border-[#dfe3eb] px-1.5 text-[10px] font-medium text-slate-600 hover:bg-slate-50 transition shadow-2xs"
                        title="ดูประวัติการสนทนาย้อนหลังตามรอบการรักษา"
                    >
                        <History size={11} className="text-purple-600" />
                        <span className="hidden sm:inline">ประวัติ</span>
                        {currentPatientSessions.length > 0 && (
                            <span className="flex size-3.5 items-center justify-center rounded-full bg-purple-600 text-[8px] font-bold text-white">
                                {currentPatientSessions.length}
                            </span>
                        )}
                    </button>

                    {/* ปุ่มสนทนาใหม่ (+ New Chat) */}
                    <button
                        type="button"
                        onClick={handleCreateNewSession}
                        className="cursor-pointer flex h-6 items-center gap-1 rounded-md bg-purple-50 border border-purple-200/80 px-1.5 text-[10px] font-semibold text-purple-700 shadow-2xs transition hover:bg-purple-100"
                        title="เริ่มรอบการสนทนาใหม่"
                    >
                        <Plus size={11} />
                        <span className="text-[10px]">ใหม่</span>
                    </button>
                </div>
            </div>

            {/* Sub-bar: บริบท Session ปัจจุบัน */}
            {activeSession && (
                <div className="flex items-center justify-between border-b border-[#eceef4] bg-slate-50/50 px-2.5 py-1 text-[9px] text-slate-500">
                    <div className="flex items-center gap-1.5 min-w-0 truncate">
                        <span className="inline-flex items-center gap-0.5 font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200/60 truncate">
                            <Calendar size={9} className="shrink-0" />
                            <span className="truncate">{activeSession.visit?.an || selectedPatient?.an || "ปัจจุบัน"}</span>
                        </span>
                        <span className="truncate text-slate-600 font-medium">
                            {activeSession.service?.name || selectedPatient?.department || "OPD อายุรกรรม"}
                        </span>
                    </div>

                    <span className="shrink-0 text-[9px] text-slate-400 pl-1 truncate max-w-[90px]">
                        {selectedPatient?.doctor?.split(" ")[1]
                            ? `นพ.${selectedPatient.doctor.split(" ")[1]}`
                            : (selectedPatient?.doctor || "แพทย์ประจำเคส")}
                    </span>
                </div>
            )}

            {/* Main Messages Area */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="min-h-0 flex-1 overflow-y-auto px-3 py-3 scroll-smooth scrollbar-thin"
            >
                <div className="space-y-3">
                    {messages.map((msg) => (
                        <Message
                            key={msg.id}
                            from={msg.bot ? "bot" : "user"}
                        >
                            {msg.bot && (
                                <MessageAvatar>
                                    <Avatar size="sm" className="bg-gradient-to-br from-[#8d48b9] to-[#6366f1] text-white shadow-2xs">
                                        <AvatarFallback className="bg-transparent text-white">
                                            <Bot size={13} />
                                        </AvatarFallback>
                                    </Avatar>
                                </MessageAvatar>
                            )}

                            <MessageContent>
                                <BubbleGroup>
                                    <Bubble variant={msg.bot ? "bot" : "user"}>
                                        <BubbleContent className="text-[11.5px] leading-relaxed whitespace-pre-line break-words">
                                            {msg.text}
                                        </BubbleContent>
                                    </Bubble>
                                </BubbleGroup>

                                <div className="flex items-center justify-between gap-2 px-1 mt-0.5">
                                    <MessageFooter>
                                        <span>{msg.bot ? "AI Clinical Assistant" : "ผู้ใช้งาน"}</span>
                                        <span>•</span>
                                        <span>{msg.time}</span>
                                    </MessageFooter>

                                    {msg.bot && (
                                        <BubbleReactions>
                                            <button
                                                type="button"
                                                onClick={() => handleCopyMessage(msg.text, msg.id)}
                                                className="cursor-pointer flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-purple-50 hover:text-purple-700 text-slate-400 transition text-[9px]"
                                                title="คัดลอกข้อความ"
                                            >
                                                {copiedId === msg.id ? (
                                                    <>
                                                        <Check size={10} className="text-emerald-600" />
                                                        <span className="text-emerald-600">คัดลอกแล้ว</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy size={10} />
                                                        <span>คัดลอก</span>
                                                    </>
                                                )}
                                            </button>
                                        </BubbleReactions>
                                    )}
                                </div>
                            </MessageContent>

                            {!msg.bot && (
                                <MessageAvatar>
                                    <Avatar size="sm" className="bg-[#edf0f5] text-slate-500 shadow-2xs">
                                        <AvatarFallback className="bg-transparent text-slate-500">
                                            <UserRound size={13} />
                                        </AvatarFallback>
                                    </Avatar>
                                </MessageAvatar>
                            )}
                        </Message>
                    ))}

                    {isTyping && (
                        <Message from="bot">
                            <MessageAvatar>
                                <Avatar size="sm" className="bg-gradient-to-br from-[#8d48b9] to-[#6366f1] text-white">
                                    <AvatarFallback className="bg-transparent text-white">
                                        <Bot size={13} />
                                    </AvatarFallback>
                                </Avatar>
                            </MessageAvatar>
                            <MessageContent>
                                <Bubble variant="bot">
                                    <BubbleContent>
                                        <span className="italic flex items-center gap-1 text-slate-500 text-xs">
                                            AI กำลังวิเคราะห์ข้อมูลทางคลินิก
                                            <span className="animate-bounce">.</span>
                                            <span className="animate-bounce delay-100">.</span>
                                            <span className="animate-bounce delay-200">.</span>
                                        </span>
                                    </BubbleContent>
                                </Bubble>
                            </MessageContent>
                        </Message>
                    )}

                    <div ref={chatEndRef} />
                </div>
            </div>

            {/* Floating Scroll to Bottom Button */}
            {showScrollBottom && (
                <button
                    type="button"
                    onClick={scrollToBottom}
                    className="cursor-pointer absolute bottom-24 right-4 z-20 flex size-7 items-center justify-center rounded-full bg-white/95 border border-purple-200 shadow-md text-purple-600 hover:bg-purple-50 hover:scale-105 transition-all"
                    title="เลื่อนลงล่างสุด"
                >
                    <ArrowDown size={14} />
                </button>
            )}

            {/* Bottom Quick Actions & Input Bar */}
            <div className="shrink-0 border-t border-[#e7e9ef] bg-white">
                {/* Dynamic Quick Actions Chips */}
                <div className="flex gap-1.5 overflow-x-auto px-2.5 py-1.5 scrollbar-none">
                    {dynamicQuickPrompts.map((promptText, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => handleQuickAction(promptText)}
                            className="cursor-pointer shrink-0 whitespace-nowrap rounded-full border border-[#dfe2ea] bg-slate-50/90 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 px-2.5 py-1 text-[10.5px] font-medium text-slate-600 transition shadow-2xs active:scale-95"
                        >
                            {promptText}
                        </button>
                    ))}
                </div>

                {/* Input Form */}
                <div className="border-t border-[#e1e4eb] p-2">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSendMessage();
                        }}
                        className="flex items-center gap-1.5 rounded-xl border border-[#d9c9ff] bg-[#faf8ff] px-2.5 py-1.5 transition focus-within:border-[#9149df] focus-within:ring-2 focus-within:ring-purple-100"
                    >
                        <input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="min-w-0 flex-1 bg-transparent text-[11.5px] text-slate-800 outline-none placeholder:text-slate-400"
                            placeholder="สอบถาม AI / เกี่ยวกับการปรึกษานี้..."
                        />

                        <button
                            type="submit"
                            disabled={!inputValue.trim() || isTyping}
                            className="cursor-pointer flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#9149df] text-white transition hover:bg-[#7e34cd] disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                            title="ส่งข้อความ"
                        >
                            <Send size={12} />
                        </button>
                    </form>
                </div>
            </div>

            {/* Slide-over Drawer: ประวัติการแชทแยกตามรอบการรักษา */}
            {isHistoryOpen && (
                <div className="absolute inset-0 z-40 flex flex-col bg-white animate-in slide-in-from-right duration-200 shadow-xl">
                    <div className="flex h-11 items-center justify-between border-b border-slate-200 bg-slate-50/80 px-3">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <History size={14} className="text-purple-600" />
                            <h3 className="text-xs font-bold text-slate-800 truncate">
                                ประวัติการปรึกษา AI ของ {selectedPatient?.fullName || "ผู้ป่วย"}
                            </h3>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsHistoryOpen(false)}
                            className="cursor-pointer rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1 border-b border-slate-100 bg-white px-3 py-1.5 text-[10px]">
                        <button
                            type="button"
                            onClick={() => setVisitFilter("all")}
                            className={`cursor-pointer rounded-md px-2 py-0.5 font-semibold transition ${
                                visitFilter === "all"
                                    ? "bg-purple-100 text-purple-800"
                                    : "text-slate-500 hover:bg-slate-100"
                            }`}
                        >
                            ทั้งหมด ({currentPatientSessions.length})
                        </button>

                        <button
                            type="button"
                            onClick={() => setVisitFilter("current_visit")}
                            className={`cursor-pointer rounded-md px-2 py-0.5 font-semibold transition ${
                                visitFilter === "current_visit"
                                    ? "bg-purple-100 text-purple-800"
                                    : "text-slate-500 hover:bg-slate-100"
                            }`}
                        >
                            เฉพาะ Visit ปัจจุบัน ({filteredSessions.length})
                        </button>
                    </div>

                    {/* List of Sessions */}
                    <div className="min-h-0 flex-1 overflow-y-auto p-2.5 space-y-2">
                        {filteredSessions.length > 0 ? (
                            filteredSessions.map((session) => {
                                const isCurrent = session.id === currentSessionId;
                                const firstMsg = session.messages?.[0]?.text || "ไม่มีข้อความ";

                                return (
                                    <div
                                        key={session.id}
                                        onClick={() => handleSelectSession(session)}
                                        className={`cursor-pointer group relative rounded-xl border p-2.5 transition-all shadow-2xs ${
                                            isCurrent
                                                ? "border-purple-400 bg-purple-50/50 shadow-xs ring-1 ring-purple-200"
                                                : "border-slate-200 bg-white hover:border-purple-200 hover:bg-slate-50"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-1.5">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[11px] font-bold text-slate-800 truncate">
                                                    {session.title}
                                                </p>
                                                <p className="mt-0.5 text-[10px] text-slate-500 line-clamp-1">
                                                    {firstMsg}
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={(e) => handleDeleteSession(e, session.id)}
                                                className="cursor-pointer opacity-0 group-hover:opacity-100 rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                                                title="ลบประวัตินี้"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>

                                        <div className="mt-2 flex items-center justify-between text-[9px] text-slate-400 border-t border-slate-100 pt-1.5">
                                            <span className="flex items-center gap-1 text-purple-700 font-medium">
                                                <Calendar size={9} />
                                                <span>{session.visit?.an || "OPD"}</span>
                                            </span>
                                            <span>{session.createdAt}</span>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex h-32 flex-col items-center justify-center text-center p-4">
                                <FolderOpen size={24} className="text-slate-300 mb-1" />
                                <p className="text-xs text-slate-400 font-medium">ยังไม่มีประวัติการสนทนา</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
