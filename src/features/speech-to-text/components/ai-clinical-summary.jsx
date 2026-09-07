import { useState, useRef, useEffect } from "react";
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
                    text: `สวัสดีครับ AI สรุปทางคลินิกพร้อมใช้งานครับ สำหรับผู้ป่วย ${patient.fullName} (อายุ ${patient.age} ปี, สิทธิ์: ${patient.rights || "บัตรทอง"}) ตรวจพบประวัติ: ${underlying}, ${allergies} แผนก: ${patient.department}`,
                    time: "10:30",
                },
                {
                    id: 2,
                    bot: true,
                    text: `คำแนะนำเบื้องต้น: ผู้ป่วยเข้ารับการตรวจในความดูแลของ ${doctorName} สถานะปัจจุบัน: "${patient.status}" คุณหมอสามารถพิมพ์สอบถามแนวทางวินิจฉัย หรือให้ช่วยสรุปข้อความเสียงและแนะนำรหัส ICD ได้เลยครับ`,
                    time: "10:30",
                },
            ],
        },
        {
            id: `sess-${patient.hn}-prev`,
            title: `ประวัติการรักษารอบก่อนหน้า (${patient.department?.includes("IPD") ? "OPD ติดตามอาการ" : "ตรวจคัดกรองเบื้องต้น"})`,
            createdAt: "15 ส.ค. 2569",
            timestamp: Date.now() - 1000 * 60 * 60 * 24 * 23,
            visit: {
                an: `VN67-0815-${patient.hn.slice(-4)}`,
                type: "OPD",
                date: "15 ส.ค. 2569",
                isCurrent: false,
            },
            service: {
                name: patient.department || "ตรวจรักษาทั่วไป",
                doctor: doctorName,
            },
            messages: [
                {
                    id: 3,
                    bot: true,
                    text: `สรุปการตรวจรอบวันที่ 15 ส.ค. 2569: ผู้ป่วย ${patient.fullName} มารับการประเมินอาการโรคประจำตัว (${underlying}) สัญญาณชีพและผลตรวจเดิมอยู่ในเกณฑ์ควบคุมได้ นัดติดตามอาการในรอบนี้ครับ`,
                    time: "14:15",
                },
            ],
        },
    ];
}

export function AiClinicalSummary({
    formData = {},
    selectedPatient = null,
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
    // ตัวกรองใน History Drawer: "all" หรือ "current_visit"
    const [visitFilter, setVisitFilter] = useState("all");

    // สถานะแชท
    const [isActive, setIsActive] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [copiedId, setCopiedId] = useState(null);
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
                        // ปรับชื่อ session ตามคำถามแรกถ้ายังเป็นชื่อ default
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

    // สร้าง Session ใหม่ (New Chat) ผูกกับ Visit และ Service ปัจจุบันของคนไข้
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
                    text: `เริ่มรอบการสนทนาใหม่สำหรับ ${selectedPatient?.fullName || "ผู้ป่วย"} (Visit: ${selectedPatient?.an || "ปัจจุบัน"}) แผนก ${selectedPatient?.department || "-"} คุณหมอสามารถพิมพ์ปรึกษาหรือสั่งสรุปผลได้เลยครับ`,
                    time: timeStr,
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

    const handleActivate = () => {
        setIsActive(true);
        if (messages.length === 0) {
            handleCreateNewSession();
        }
    };

    const handleDeactivate = () => {
        setIsActive(false);
    };

    const handleCopyMessage = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1500);
    };

    const handleSendMessage = (textToSend) => {
        const query = (textToSend || inputValue).trim();
        if (!query) return;

        let activeSessionId = currentSessionId;

        // ถ้ายังไม่มี session ให้สร้างอัตโนมัติ
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

        setTimeout(() => {
            let reply = "กำลังประมวลผลข้อมูลทางคลินิก...";
            const pName = selectedPatient?.fullName || "ผู้ป่วย";
            const pUnderlying = selectedPatient?.underlying || "ไม่มีโรคประจำตัวระบุ";
            const pAllergies = selectedPatient?.allergies || "ไม่มี";
            const pDoc = selectedPatient?.doctor?.split(" (")[0] || "แพทย์ประจำเคส";

            if (query.includes("สรุป")) {
                reply = `สรุปทางคลินิกเบื้องต้นของ ${pName} (อายุ ${selectedPatient?.age || "-"} ปี, ${selectedPatient?.department || "-"}): ประวัติเดิมมี ${pUnderlying} (${pAllergies.includes("ไม่มี") ? "ไม่แพ้ยา" : `ระวังแพ้: ${pAllergies}`}) อาการปัจจุบัน: ${formData?.chiefComplaint || "ตามการสนทนา"} ดูแลโดย ${pDoc} ครับ`;
            } else if (query.includes("วินิจฉัย") || query.includes("ICD") || query.includes("โรค")) {
                if (pUnderlying.includes("Asthma")) {
                    reply = `ข้อเสนอแนะรหัสโรคของ ${pName}: J45.9 (Asthma, unspecified) ร่วมกับรหัสการพ่นยาพ่นขยายหลอดลม แนะนำเฝ้าระวัง Peak Flow และประเมินการตอบสนองต่อ Bronchodilator`;
                } else if (pUnderlying.includes("DM") || pUnderlying.includes("Diabetes")) {
                    reply = `ข้อเสนอแนะรหัสโรคของ ${pName}: E11.9 (Type 2 diabetes mellitus without complications) ร่วมกับ I10 (Essential hypertension) และ R53 (Malaise and Fatigue)`;
                } else if (pUnderlying.includes("CKD") || pUnderlying.includes("Heart Failure")) {
                    reply = `ข้อเสนอแนะรหัสโรคของ ${pName}: I50.9 (Heart failure, unspecified) ร่วมกับ N18.3 (Chronic kidney disease, stage 3) ระวังการให้สารน้ำและยาที่มีผลต่อไต`;
                } else {
                    reply = `ข้อเสนอแนะรหัสโรคเบื้องต้น: ${formData?.icd10 || "R53"} (${formData?.icd10Desc || "Malaise and Fatigue"}) ร่วมกับประวัติ ${pUnderlying}`;
                }
            } else if (query.includes("ตรวจเพิ่มเติม") || query.includes("เริ่มจาก")) {
                if (pUnderlying.includes("Asthma")) {
                    reply = "แนะนำตรวจ Chest X-ray (CXR), Spirometry หรือ Peak Expiratory Flow Rate (PEFR) และตรวจ SpO2 baseline เพิ่มเติมครับ";
                } else if (pUnderlying.includes("Heart") || pUnderlying.includes("CKD")) {
                    reply = "แนะนำตรวจ Serum Creatinine, eGFR, Electrolytes, EKG 12-leads, NT-proBNP และติดตาม Urine Output อย่างต่อเนื่องครับ";
                } else {
                    reply = "แนะนำตรวจ Fasting Blood Sugar (FBS), HbA1c, ตรวจคลื่นไฟฟ้าหัวใจ (EKG 12 leads) และ Lipid profile ตามแนวทางเวชปฏิบัติครับ";
                }
            } else {
                reply = `รับทราบครับ: "${query}" จากข้อมูลผู้ป่วย ${pName} (${selectedPatient?.department || "-"}) AI บันทึกคำถามและจะช่วย ${pDoc} ตรวจสอบความถูกต้องของรหัส DRG ในลำดับถัดไปครับ`;
            }

            const updatedWithBot = [
                ...updatedWithUser,
                {
                    id: Date.now() + 1,
                    bot: true,
                    text: reply,
                    time: now,
                },
            ];

            setMessages(updatedWithBot);
            syncSessionMessages(updatedWithBot, activeSessionId);
            setIsTyping(false);
        }, 700);
    };

    const handleQuickAction = (actionText) => {
        handleSendMessage(actionText);
    };

    // เซสชันปัจจุบันที่เปิดอยู่
    const activeSession = currentPatientSessions.find((s) => s.id === currentSessionId);

    // เซสชันที่ผ่านการกรอง (ทั้งหมด หรือ เฉพาะ Visit ปัจจุบัน)
    const filteredSessions = currentPatientSessions.filter((s) => {
        if (visitFilter === "current_visit") {
            return s.visit?.isCurrent || s.visit?.an === selectedPatient?.an;
        }
        return true;
    });

    return (
        <section
            className={`relative flex min-w-0 w-full flex-col overflow-hidden rounded-xl border border-[#dfe3eb] bg-white shadow-2xs md:col-span-2 xl:col-span-1 md:min-h-[520px] xl:h-full xl:min-h-0 ${className}`}
        >
            {/* Header */}
            <div className="flex h-10 shrink-0 items-center justify-between border-b border-[#e2e5ed] bg-[#faf7ff] px-2">
                <div className="flex items-center gap-1.5 min-w-0">
                    <Avatar size="sm" className="size-5 shrink-0 bg-gradient-to-br from-[#a14bd4] to-[#5271eb] text-white shadow-2xs">
                        <AvatarFallback className="bg-transparent text-white">
                            <Bot size={11} />
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex items-center gap-1 min-w-0">
                        <p className="text-[11px] font-bold text-slate-800 truncate" title="AI Clinical Assistant">
                            AI Clinical
                        </p>
                        <span
                            className={`inline-block size-1.5 rounded-full shrink-0 ${isActive
                                ? "bg-emerald-500 animate-pulse"
                                : "bg-slate-300"
                                }`}
                            title={isActive ? "AI พร้อมใช้งาน" : "ยังไม่เปิดใช้งาน"}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    {/* ปุ่มเปิดแถบประวัติการแชท */}
                    <button
                        type="button"
                        onClick={() => setIsHistoryOpen((prev) => !prev)}
                        className={`cursor-pointer relative flex h-6 items-center gap-1 rounded-md px-1.5 text-[10px] font-medium transition border ${isHistoryOpen
                            ? "bg-purple-100 text-purple-800 border-purple-300"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 shadow-2xs"
                            }`}
                        title="ดูประวัติการสนทนาย้อนหลังตามรอบการตรวจ"
                    >
                        <History size={11} className="text-purple-600" />
                        <span className="text-[10px]">ประวัติ</span>
                        {currentPatientSessions.length > 0 && (
                            <span className="flex size-3.5 items-center justify-center rounded-full bg-purple-600 text-[8px] font-bold text-white leading-none">
                                {currentPatientSessions.length}
                            </span>
                        )}
                    </button>

                    {/* ปุ่มสนทนาใหม่ (+ New Chat) */}
                    <button
                        type="button"
                        onClick={handleCreateNewSession}
                        className="cursor-pointer flex h-6 items-center gap-1 rounded-md bg-purple-50 border border-purple-200/80 px-1.5 text-[10px] font-semibold text-purple-700 shadow-2xs transition hover:bg-purple-100"
                        title="เริ่มรอบการสนทนาใหม่ (ผูกกับ Visit ปัจจุบัน)"
                    >
                        <Plus size={11} />
                        <span className="text-[10px]">ใหม่</span>
                    </button>
                </div>
            </div>

            {/* Sub-bar: แสดงบริบทของ Session ปัจจุบัน (Visit AN & Service) แบบกะทัดรัด ไม่เบียด */}
            {isActive && activeSession && (
                <div className="flex items-center justify-between border-b border-[#eceef4] bg-[white] px-2 py-1.5 text-[9px] text-slate-500">
                    <div className="flex items-center gap-1 min-w-0 truncate">
                        <span className="inline-flex items-center gap-0.5 font-semibold text-purple-700 bg-purple-50 px-1 py-0.2 rounded border border-purple-200/60 truncate">
                            <Calendar size={9} className="shrink-0" />
                            <span className="truncate">{activeSession.visit?.an || selectedPatient?.an || "ปัจจุบัน"}</span>
                        </span>
                        <span className="truncate text-slate-600">
                            {activeSession.service?.name || selectedPatient?.department || "อายุรกรรม"}
                        </span>
                    </div>

                    <span className="shrink-0 text-[9px] text-slate-400 pl-1 truncate max-w-[80px]">
                        {activeSession.service?.doctor?.split(" ")[1]
                            ? `${activeSession.service?.doctor?.split(" ")[1]}`
                            : (activeSession.service?.doctor || "แพทย์ประจำ")}
                    </span>
                </div>
            )}

            {/* Main Area: สลับระหว่าง Standby Inactive Screen กับ Chat Messages */}
            {!isActive ? (
                /* หน้าต่างตอนยังไม่เปิดใช้งาน (Inactive State) */
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-purple-50/20 via-white to-white">
                    <div className="relative mb-3 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-600 shadow-xs border border-purple-200/50">
                        <Bot size={26} className="text-purple-600" />
                        <span className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-purple-600 ring-2 ring-white">
                            <Sparkles size={8} className="text-white" />
                        </span>
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight">
                        ระบบสรุปทางคลินิกโดย AI
                    </h3>
                    <p className="mt-1 max-w-[280px] text-[11px] leading-relaxed text-slate-500">
                        ช่วยแพทย์วิเคราะห์บทสนทนา คัดกรองอาการสำคัญ และแนะนำรหัสโรค ICD ทางคลินิกอัตโนมัติ
                    </p>

                    {/* Features List Pills */}
                    <div className="mt-3 flex flex-wrap justify-center gap-1.5 max-w-[280px]">
                        <span className="flex items-center gap-1 rounded-full bg-purple-50 border border-purple-100/80 px-2 py-0.5 text-[10px] font-medium text-purple-700">
                            <Activity size={10} />
                            <span>สรุปอาการสำคัญ</span>
                        </span>
                        <span className="flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-100/80 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
                            <FileText size={10} />
                            <span>แนะนำ ICD-10/ICD-9</span>
                        </span>
                        <span className="flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100/80 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                            <ShieldCheck size={10} />
                            <span>ตรวจติดตามอาการ</span>
                        </span>
                    </div>

                    {/* Action Button */}
                    <div className="mt-5">
                        <Button
                            type="button"
                            onClick={handleActivate}
                            size="sm"
                            className="cursor-pointer gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:from-purple-700 hover:to-indigo-700 transition active:scale-95"
                        >
                            <Sparkles size={13} />
                            <span>เปิดใช้งาน AI สรุปผล</span>
                        </Button>
                        <p className="mt-2 text-[10px] text-slate-400">
                            หรือพิมพ์ข้อความในช่องด้านล่างเพื่อเริ่มใช้งานทันที
                        </p>
                    </div>
                </div>
            ) : (
                /* หน้าต่างตอนเปิดใช้งานแล้ว (Active Messages Area) */
                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="min-h-0 flex-1 overflow-y-auto px-3 py-3 scroll-smooth scrollbar-thin "
                >
                    <div className="space-y-3">
                        {messages.map((msg) => (
                            <Message
                                key={msg.id}
                                from={msg.bot ? "bot" : "user"}
                            >
                                {msg.bot && (
                                    <MessageAvatar>
                                        <Avatar size="sm" className="bg-gradient-to-br from-[#8d48b9] to-[#5272e8] text-white shadow-2xs">
                                            <AvatarFallback className="bg-transparent text-white">
                                                <Bot size={13} />
                                            </AvatarFallback>
                                        </Avatar>
                                    </MessageAvatar>
                                )}

                                <MessageContent>
                                    <BubbleGroup>
                                        <Bubble variant={msg.bot ? "bot" : "user"}>
                                            <BubbleContent>{msg.text}</BubbleContent>
                                        </Bubble>
                                    </BubbleGroup>

                                    <div className="flex items-center justify-between gap-2 px-1">
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
                                                    className="cursor-pointer flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-purple-50 hover:text-purple-700 text-slate-400 transition"
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
                                    <Avatar size="sm" className="bg-gradient-to-br from-[#8d48b9] to-[#5272e8] text-white">
                                        <AvatarFallback className="bg-transparent text-white">
                                            <Bot size={13} />
                                        </AvatarFallback>
                                    </Avatar>
                                </MessageAvatar>
                                <MessageContent>
                                    <Bubble variant="bot">
                                        <BubbleContent>
                                            <span className="italic flex items-center gap-1 text-slate-500">
                                                AI กำลังพิมพ์
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
            )}

            {/* Floating Scroll to Bottom Button */}
            {isActive && showScrollBottom && (
                <button
                    type="button"
                    onClick={scrollToBottom}
                    className="cursor-pointer absolute bottom-24 right-4 z-20 flex size-7 items-center justify-center rounded-full bg-white/95 border border-purple-200 shadow-md text-purple-600 hover:bg-purple-50 hover:scale-105 transition-all"
                    title="เลื่อนลงล่างสุด"
                >
                    <ArrowDown size={14} />
                </button>
            )}

            {/* Bottom Area */}
            <div className="shrink-0 border-t border-[#e7e9ef] bg-white">
                {/* Quick Actions (Horizontal Scroll) */}
                <div className="flex gap-1.5 overflow-x-auto px-3 py-2 scrollbar-none">
                    {[
                        { label: "สรุป", query: "ช่วยสรุปภาพรวมการรักษาและอาการสำคัญของเคสนี้" },
                        { label: "ค้นหาการวินิจฉัย", query: "วิเคราะห์การวินิจฉัยและโรคที่ต้องแยกแยะ (Differential Diagnosis)" },
                        { label: "แนะนำ ICD", query: "แนะนำรหัส ICD-10 และ ICD-9-CM ที่เหมาะสม" },
                        { label: "ตรวจเพิ่มเติม", query: "ควรสั่งตรวจ Lab หรือ Investigation อะไรเพิ่มเติม?" },
                    ].map((act) => (
                        <button
                            key={act.label}
                            type="button"
                            onClick={() => handleQuickAction(act.query)}
                            className="cursor-pointer whitespace-nowrap rounded-full border border-[#dfe2ea] bg-slate-50/70 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 px-2.5 py-1 text-[11px] font-medium text-slate-600 transition"
                        >
                            {act.label}
                        </button>
                    ))}
                </div>

                {/* Input */}
                <div className="border-t border-[#e1e4eb] p-2.5 sm:p-3">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSendMessage();
                        }}
                        className="flex items-center gap-2 rounded-xl border border-[#d9c9ff] bg-[#faf8ff] px-3 py-1.5 transition focus-within:border-[#9149df] focus-within:ring-2 focus-within:ring-purple-100"
                    >
                        <input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="min-w-0 flex-1 bg-transparent text-[11px] text-slate-800 outline-none placeholder:text-slate-400"
                            placeholder="สอบถาม AI / เกี่ยวกับการปรึกษานี้..."
                        />

                        <button
                            type="submit"
                            disabled={!inputValue.trim()}
                            className="cursor-pointer flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#9149df] text-white transition hover:bg-[#7e34cd] disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                            title="ส่งข้อความ"
                        >
                            <Send size={12} />
                        </button>
                    </form>
                </div>
            </div>

            {/* Slide-over Drawer: ประวัติการแชทแยกตามรอบการรักษา (Visit AN / Service) */}
            {isHistoryOpen && (
                <div className="absolute inset-0 z-30 flex flex-col bg-white/95 backdrop-blur-xs transition-all animate-in fade-in duration-200">
                    {/* Header ของ Drawer */}
                    <div className="flex h-[49px] shrink-0 items-center justify-between border-b border-[#e2e5ed] bg-[#faf8ff] px-3">
                        <div className="flex items-center gap-1.5">
                            <History size={14} className="text-purple-600" />
                            <h4 className="text-xs font-bold text-slate-800">
                                ประวัติการแชทของ {selectedPatient?.fullName || "ผู้ป่วย"}
                            </h4>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsHistoryOpen(false)}
                            className="cursor-pointer rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                            title="ปิดแถบประวัติ"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Filter Bar: กรองตามรอบการรักษา (Visit) */}
                    <div className="flex items-center justify-between border-b border-[#edf0f5] bg-slate-50/70 px-3 py-1.5">
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setVisitFilter("all")}
                                className={`cursor-pointer rounded-md px-2 py-0.5 text-[10px] font-medium transition ${visitFilter === "all"
                                    ? "bg-purple-600 text-white shadow-2xs"
                                    : "text-slate-600 hover:bg-slate-200/60"
                                    }`}
                            >
                                ทั้งหมด ({currentPatientSessions.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setVisitFilter("current_visit")}
                                className={`cursor-pointer rounded-md px-2 py-0.5 text-[10px] font-medium transition ${visitFilter === "current_visit"
                                    ? "bg-purple-600 text-white shadow-2xs"
                                    : "text-slate-600 hover:bg-slate-200/60"
                                    }`}
                            >
                                Visit ปัจจุบัน
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={handleCreateNewSession}
                            className="cursor-pointer flex items-center gap-1 rounded-md bg-purple-100 hover:bg-purple-200 text-purple-700 px-2 py-0.5 text-[10px] font-semibold transition"
                        >
                            <Plus size={10} />
                            <span>แชทใหม่</span>
                        </button>
                    </div>

                    {/* รายการประวัติ Sessions */}
                    <div className="flex-1 overflow-y-auto p-2.5 space-y-2 scrollbar-thin">
                        {filteredSessions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
                                <FolderOpen size={32} className="text-slate-300 mb-2" />
                                <p className="text-xs font-medium text-slate-500">ยังไม่มีประวัติการสนทนา</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">ในรอบการรักษานี้</p>
                            </div>
                        ) : (
                            filteredSessions.map((session) => {
                                const isSelected = session.id === currentSessionId;
                                const isCurrentVisit = session.visit?.isCurrent || session.visit?.an === selectedPatient?.an;

                                return (
                                    <div
                                        key={session.id}
                                        onClick={() => handleSelectSession(session)}
                                        className={`group relative cursor-pointer rounded-xl border p-2.5 transition ${isSelected
                                            ? "border-purple-300 bg-purple-50/60 shadow-xs"
                                            : "border-slate-200 bg-white hover:border-purple-200 hover:bg-slate-50/80"
                                            }`}
                                    >
                                        {/* หัวเรื่อง & ปุ่มลบ */}
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={`text-[11px] font-bold line-clamp-1 ${isSelected ? "text-purple-900" : "text-slate-800 group-hover:text-purple-700"}`}>
                                                {session.title}
                                            </p>

                                            <button
                                                type="button"
                                                onClick={(e) => handleDeleteSession(e, session.id)}
                                                className="cursor-pointer opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition rounded"
                                                title="ลบประวัติการสนทนานี้"
                                            >
                                                <Trash2 size={11} />
                                            </button>
                                        </div>

                                        {/* ข้อมูล Visit & Service & Doctor */}
                                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[9px]">
                                            {/* Visit Tag */}
                                            <span className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 font-semibold ${isCurrentVisit
                                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                : "bg-slate-100 text-slate-600 border border-slate-200"
                                                }`}>
                                                <Calendar size={9} />
                                                <span>{session.visit?.an}</span>
                                                {isCurrentVisit && <span className="text-[8px] ml-0.5">(ปัจจุบัน)</span>}
                                            </span>

                                            {/* Service / Department Tag */}
                                            <span className="inline-flex items-center gap-0.5 rounded bg-indigo-50 border border-indigo-100/80 text-indigo-700 px-1.5 py-0.5">
                                                <Tag size={9} />
                                                <span>{session.service?.name}</span>
                                            </span>

                                            {/* Doctor Attribution */}
                                            <span className="inline-flex items-center gap-0.5 text-slate-500">
                                                <Stethoscope size={9} className="text-slate-400" />
                                                <span>{session.service?.doctor}</span>
                                            </span>
                                        </div>

                                        {/* Footer ของการ์ด: เวลาและจำนวนข้อความ */}
                                        <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[9px] text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <Clock size={9} />
                                                <span>{session.createdAt}</span>
                                            </span>

                                            <span className="font-medium text-slate-500">
                                                {session.messages?.length || 0} ข้อความ
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer ของ Drawer */}
                    <div className="border-t border-[#edf0f5] bg-white p-2.5 text-center">
                        <p className="text-[10px] text-slate-400">
                            ประวัติจะถูกผูกกับรหัสผู้ป่วย (HN: {selectedPatient?.hn || "-"}) โดยอัตโนมัติ
                        </p>
                    </div>
                </div>
            )}
        </section>
    );
}
