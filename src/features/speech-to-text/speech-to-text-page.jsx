import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Grid } from "@/components/ui/grid";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
    Activity,
    AlertTriangle,
    ArrowUpDown,
    Bot,
    ClipboardCheck,
    Clock3,
    Copy,
    Edit3,
    LoaderCircle,
    Pause,
    Play,
    RotateCcw,
    RotateCw,
    Search,
    Send,
    Sparkles,
    Square,
    Trash2,
    Upload,
    UserRound,
    UsersRound,
    Volume2,
    X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { TranscribeService } from "@/api/transcribe-service";
import { toast } from "@/components/ui/toast-notification";
import { VitalsTab } from "./components/vitals-tab";
import { ChiefComplaintTab } from "./components/chief-complaint-tab";
import { AssessmentFormsTab, assessmentForms } from "./components/assessment-forms-tab";
import { PatientSearchBanner, mockPatients } from "./components/patient-search-banner";
import { AiClinicalSummary } from "./components/ai-clinical-summary";

const buildFormDataFromPatient = (patient) => {
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

export function SpeechToTextPage() {
    const navigate = useNavigate();
    const routerState = useRouterState({ select: (s) => s.location });
    const isNew = routerState?.search?.mode === "new" || routerState?.search?.isNew === "true" || routerState?.search?.new === "true";

    const [selectedPatient, setSelectedPatient] = useState(() => {
        if (isNew) return null;
        return mockPatients[0];
    });

    const [triageBaseline, setTriageBaseline] = useState(() => {
        if (isNew) return buildFormDataFromPatient(null);
        return buildFormDataFromPatient(mockPatients[0]);
    });

    const [formData, setFormData] = useState(() => {
        if (isNew) return buildFormDataFromPatient(null);
        return buildFormDataFromPatient(mockPatients[0]);
    });

    useEffect(() => {
        if (isNew) {
            setSelectedPatient(null);
            const emptyData = buildFormDataFromPatient(null);
            setFormData(emptyData);
            setTriageBaseline(emptyData);
        }
    }, [isNew]);

    const handleSelectPatient = (patient) => {
        setSelectedPatient(patient);
        const initialData = buildFormDataFromPatient(patient);
        setFormData(initialData);
        setTriageBaseline(initialData);
        // if (patient) {
        //     toast.info("เลือกผู้ป่วยสำเร็จ", `ดึงข้อมูลสัญญาณชีพและอาการสำคัญของ ${patient.fullName || patient.patient || ""} เรียบร้อยแล้ว`);
        // }
    };

    const handleRevertField = (fieldOrFields) => {
        const fields = Array.isArray(fieldOrFields) ? fieldOrFields : [fieldOrFields];
        setFormData(prev => {
            const next = { ...prev };
            fields.forEach(f => {
                next[f] = triageBaseline[f] || "";
            });
            return next;
        });
    };

    const handleRevertAllConflicts = () => {
        setFormData(prev => ({
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

    const [audioFiles, setAudioFiles] = useState([]);
    const [audioSortOrder, setAudioSortOrder] = useState("desc"); // "desc": ใหม่ไปเก่า (Newest first), "asc": เก่าไปใหม่ (Oldest first)
    const [audioSearchQuery, setAudioSearchQuery] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [audioFile, setAudioFile] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [waveform, setWaveform] = useState([]);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.75);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [treatmentTitle, setTreatmentTitle] = useState("หัวข้อการสนทนา");
    const [audioWaveform, setAudioWaveform] = useState([]);
    const [isNameModalOpen, setIsNameModalOpen] = useState(false);
    const [recordingFileData, setRecordingFileData] = useState(null);
    const [recordingName, setRecordingName] = useState("");
    const [editingAudioId, setEditingAudioId] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedFormIds, setSelectedFormIds] = useState([]);
    const [activeFormId, setActiveFormId] = useState("");
    const [activeStep, setActiveStep] = useState(0);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [transcriptionProgress, setTranscriptionProgress] = useState(0);
    const [noteText, setNoteText] = useState("");
    const [isExtracting, setIsExtracting] = useState(false);
    const [assessmentAnswers, setAssessmentAnswers] = useState({});
    const [assessmentResults, setAssessmentResults] = useState({});
    const [transcript, setTranscript] = useState([]);
    const [editingAudioName, setEditingAudioName] = useState(null);

    // รายการไฟล์เสียงที่ผ่านการค้นหาและเรียงลำดับ (ใหม่ไปเก่า / เก่าไปใหม่)
    const filteredAndSortedAudioFiles = useMemo(() => {
        let result = [...audioFiles];
        if (audioSearchQuery.trim()) {
            const q = audioSearchQuery.trim().toLowerCase();
            result = result.filter(file =>
                file.title?.toLowerCase().includes(q) ||
                file.status?.toLowerCase().includes(q) ||
                file.time?.includes(q)
            );
        }
        result.sort((a, b) => {
            const timeA = a.createdAt || (typeof a.id === "number" ? a.id : 0);
            const timeB = b.createdAt || (typeof b.id === "number" ? b.id : 0);
            return audioSortOrder === "desc" ? timeB - timeA : timeA - timeB;
        });
        return result;
    }, [audioFiles, audioSearchQuery, audioSortOrder]);

    // ตรวจสอบว่ามีข้อมูลบทสนทนา/เสียง/ข้อความสำหรับสกัดข้อมูลหรือไม่
    const hasExtractData = Boolean(
        (Array.isArray(transcript) && transcript.length > 0 && transcript.some(t => t.text && t.text.trim())) ||
        (audioFiles.length > 0 && audioFiles.some(f => (f.transcript || f.rawText || "")?.trim())) ||
        (noteText && noteText.trim().length > 0)
    );

    // ตรวจสอบว่ามีข้อมูลใน formData สำหรับสรุปข้อมูลหรือไม่
    const hasSummaryData = Object.entries(formData).some(([_, val]) => {
        if (!val) return false;
        if (typeof val === "string") {
            const trimmed = val.trim();
            return trimmed !== "" && trimmed !== "-";
        }
        return true;
    });

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const audioFilesRef = useRef([]);
    const timerRef = useRef(null);
    const fileInputRef = useRef(null);
    const audioRef = useRef(null);
    const waveformContainerRef = useRef(null);
    const animationFrameRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const transcriberRef = useRef(null);

    useEffect(() => {
        audioFilesRef.current = audioFiles;
    }, [audioFiles]);

    useEffect(() => {
        if (!isRecording || isPaused) return;

        const interval = setInterval(() => {
            setWaveform((prev) => [
                ...prev,
                Math.floor(Math.random() * 28) + 4,
            ]);
        }, 100);

        return () => clearInterval(interval);
    }, [isRecording, isPaused]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [audioUrl]);

    useEffect(() => {
        if (waveformContainerRef.current) {
            waveformContainerRef.current.scrollLeft =
                waveformContainerRef.current.scrollWidth;
        }
    }, [waveform]);
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = playbackRate;
        }
    }, [playbackRate]);

    useEffect(() => {
        if (!audioRef.current) return;

        audioRef.current.volume = volume;
        audioRef.current.playbackRate = playbackRate;
    }, [audioUrl, volume, playbackRate]);

    const updateAudioFile = (fileId, data) => {
        setAudioFiles((prev) =>
            prev.map((item) =>
                item.id === fileId
                    ? {
                        ...item,
                        ...data,
                    }
                    : item
            )
        );
    };
    const pollTranscriptionStatus = async (fileId, jobId) => {
        try {
            const result =
                await TranscribeService.getStatus(jobId);

            console.log(
                "Job status:",
                jobId,
                result
            );

            updateAudioFile(fileId, {
                processing:
                    result.status !== "completed" &&
                    result.status !== "failed",

                progress: result.progress ?? 0,

                status:
                    result.status === "completed"
                        ? "เสร็จสิ้น"
                        : result.status === "failed"
                            ? "เกิดข้อผิดพลาด"
                            : result.status,

                message: result.message ?? "",
            });

            if (result.status === "completed") {

                console.log(
                    "========== TRANSCRIPTION COMPLETED =========="
                );

                const transcriptionResult =
                    result.result;

                const text =
                    transcriptionResult?.text ?? "";

                const rawText =
                    transcriptionResult?.raw_text ?? "";

                const segments =
                    transcriptionResult?.segments ?? [];

                console.log(
                    "Transcript segments:",
                    segments
                );

                const formattedTranscript =
                    segments.map((segment, index) => {

                        const speaker =
                            segment.speaker || "SPEAKER_00";

                        const isDoctor =
                            speaker === "SPEAKER_01";

                        return {
                            id:
                                segment.id ??
                                `${jobId}-${index}`,

                            name:
                                isDoctor
                                    ? "แพทย์"
                                    : "ผู้ป่วย",

                            doctor:
                                isDoctor,

                            speaker,

                            text:
                                segment.text ?? "",

                            start:
                                segment.start,

                            end:
                                segment.end,

                            role:
                                segment.role ?? null,
                        };
                    });

                console.log(
                    "Formatted transcript:",
                    formattedTranscript
                );

                // =========================================
                // Update audio file
                // =========================================

                updateAudioFile(fileId, {
                    processing: false,
                    progress: 100,
                    status: "เสร็จสิ้น",
                    message: "แปลงเสียงและแยกผู้พูดเสร็จแล้ว",

                    transcript:
                        result.result?.text ?? "",

                    rawText:
                        result.result?.raw_text ?? "",

                    transcriptSegments:
                        result.result?.segments ?? [],

                    speakers:
                        result.result?.speakers ?? [],
                });

                // =========================================
                // แสดง Transcript
                // =========================================

                setTranscript(
                    formattedTranscript
                );

                setTranscriptionProgress(100);

                toast.success("แปลงเสียงสำเร็จ ", "ถอดข้อความเสียงและระบุผู้พูดเรียบร้อยแล้ว");

                return;
            }

            // =========================================
            // FAILED
            // =========================================

            if (result.status === "failed") {

                updateAudioFile(fileId, {

                    processing: false,

                    status: "เกิดข้อผิดพลาด",

                    message:
                        result.error ||
                        "ไม่สามารถแปลงเสียงได้",
                });

                setIsTranscribing(false);

                toast.error("แปลงเสียงไม่สำเร็จ", result.error || "เกิดข้อผิดพลาดในการประมวลผลไฟล์เสียง");

                return;
            }

            // =========================================
            // PROCESSING
            // =========================================

            setTranscriptionProgress(
                result.progress ?? 0
            );

            setTimeout(() => {

                pollTranscriptionStatus(
                    fileId,
                    jobId
                );

            }, 1000);

        } catch (error) {

            console.error(
                "Polling transcription error:",
                error
            );

            updateAudioFile(fileId, {

                processing: false,

                status: "เกิดข้อผิดพลาด",

                message:
                    "ไม่สามารถตรวจสอบสถานะได้",
            });

            setIsTranscribing(false);
        }
    };
    const transcribeAudio = async (fileItem, fileId) => {
        try {
            setIsTranscribing(true);
            setTranscriptionProgress(0);

            console.log("========== START TRANSCRIPTION ==========");
            console.log("File:", fileItem.file);

            const result = await TranscribeService.transcribe(
                fileItem.file,
                "openai"
            );

            console.log("Transcribe Job:", result);

            if (!result?.job_id) {
                throw new Error("ไม่พบ job_id จาก API");
            }

            console.log("Job ID:", result.job_id);

            // เริ่ม polling
            await pollTranscriptionStatus(
                fileId,
                result.job_id
            );

            return result;

        } catch (error) {
            console.error("Transcription API error:", error);
            throw error;
        } finally {
            setIsTranscribing(false);
        }
    };
    const handleTranscribe = async (fileItem) => {
        if (!fileItem?.file) {
            return;
        }

        const fileId = fileItem.id;

        try {
            // =========================
            // เริ่มต้น
            // =========================

            updateAudioFile(fileId, {
                processing: true,
                progress: 0,
                status: "กำลังส่งไฟล์",
                message: "กำลังส่งไฟล์...",
                jobId: null,
            });

            // =========================
            // สร้าง Job
            // =========================

            const job = await TranscribeService.transcribe(
                fileItem.file,
                "openai"
            );

            console.log("Created transcription job:", job);

            if (!job?.job_id) {
                throw new Error("ไม่พบ job_id จาก API");
            }

            // =========================
            // เก็บ Job
            // =========================

            updateAudioFile(fileId, {
                processing: true,
                progress: job.progress ?? 0,
                status: job.status ?? "queued",
                message: job.message ?? "รอประมวลผล",
                jobId: job.job_id,
            });

            // =========================
            // เริ่ม Polling
            // =========================

            pollTranscriptionStatus(
                fileId,
                job.job_id
            );

        } catch (error) {
            console.error(
                "Transcription error:",
                error
            );

            updateAudioFile(fileId, {
                processing: false,
                progress: 0,
                status: "เกิดข้อผิดพลาด",
                message:
                    error?.response?.data?.detail ||
                    error?.message ||
                    "ไม่สามารถเริ่มการแปลงเสียงได้",
            });
        }
    };
    const togglePauseRecording = () => {
        const recorder = mediaRecorderRef.current;

        if (!recorder) return;

        if (recorder.state === "recording") {
            recorder.pause();
            setIsPaused(true);
        } else if (recorder.state === "paused") {
            recorder.resume();
            setIsPaused(false);
        }
    };
    const getNextRecordingName = (files) => {
        const numbers = files
            .map((item) => {
                const match = item.title?.match(/^เสียงบันทึก\s+(\d+)$/);
                return match ? Number(match[1]) : 0;
            })
            .filter(Boolean);

        const nextNumber = numbers.length > 0
            ? Math.max(...numbers) + 1
            : 1;

        return `เสียงบันทึก ${nextNumber}`;
    };
    const startEditAudioName = (audio) => {
        setEditingAudioId(audio.id);
        setEditingAudioName(audio.title);
    };
    const saveAudioName = (id) => {
        const name = editingAudioName.trim();

        if (!name) {
            setEditingAudioId(null);
            setEditingAudioName("");
            return;
        }

        setAudioFiles((prev) =>
            prev.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        title: name,
                    }
                    : item
            )
        );

        setEditingAudioId(null);
        setEditingAudioName("");
    };
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });

            mediaStreamRef.current = stream;

            setWaveform([]);

            const mediaRecorder = new MediaRecorder(stream);

            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, {
                    type: "audio/webm",
                });

                const file = new File(
                    [audioBlob],
                    `recording-${Date.now()}.webm`,
                    {
                        type: "audio/webm",
                    }
                );

                const url = URL.createObjectURL(audioBlob);

                const audio = new Audio(url);

                const duration = await new Promise((resolve) => {
                    audio.onloadedmetadata = () => {
                        resolve(audio.duration);
                    };

                    audio.onerror = () => {
                        resolve(0);
                    };
                });

                // ตั้งชื่ออัตโนมัติ
                const title = getNextRecordingName(
                    audioFilesRef.current
                );

                const newId = Date.now();

                const newAudio = {
                    id: newId,
                    title: file.name,
                    time: "--:--",
                    status: "กำลังโหลด",
                    active: true,
                    processing: true,
                    url,
                    file,
                    createdAt: newId,
                    transcript: "",
                    rawText: "",
                    segments: [],
                };

                setAudioFiles((prev) => [
                    ...prev.map((item) => ({
                        ...item,
                        active: false,
                    })),
                    newAudio,
                ]);

                setAudioFile(file);
                setAudioUrl(url);
                setCurrentTime(0);
                setDuration(duration);
                setIsPlaying(false);
                setRecordingTime(0);

                clearInterval(timerRef.current);
                timerRef.current = null;

                // ประมวลผลเสียงต่อ
                try {
                    await generateWaveform(file);

                    // ส่งไฟล์เข้า Backend
                    const response =
                        await TranscribeService.transcribe(file);

                    console.log("Transcription job:", response);

                    const jobId = response.job_id;

                    if (!jobId) {
                        throw new Error("ไม่พบ job_id");
                    }

                    // เริ่ม polling
                    await pollTranscriptionStatus(
                        newId,
                        jobId
                    );

                } catch (error) {

                    console.error(
                        "Audio processing error:",
                        error
                    );

                    setAudioFiles((prev) =>
                        prev.map((item) =>
                            item.id === newId
                                ? {
                                    ...item,
                                    status: "แปลงเสียงไม่สำเร็จ",
                                    processing: false,
                                }
                                : item
                        )
                    );
                }
            };
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.start();

            setIsRecording(true);
            setIsPaused(false);
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);

        } catch (error) {
            console.error(
                "ไม่สามารถเข้าถึง microphone:",
                error
            );
        }
    };
    const stopRecording = () => {
        if (
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state !== "inactive"
        ) {
            mediaRecorderRef.current.stop();
        }

        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((track) => {
                track.stop();
            });

            mediaStreamRef.current = null;
        }

        setIsRecording(false);
        setIsPaused(false);

        clearInterval(timerRef.current);
        timerRef.current = null;
    };
    const handleSaveRecording = async () => {
        if (!recordingFileData) return;

        const {
            file,
            url,
            duration,
        } = recordingFileData;

        const title =
            recordingName.trim() ||
            getNextRecordingName(audioFilesRef.current);

        const newId = Date.now();

        try {
            await generateWaveform(file);

            // แปลงเสียงเป็นข้อความ
            const text = await transcribeAudio(file);

            console.log("ข้อความที่ได้:", text);

            if (text) {
                setTranscript([
                    {
                        id: Date.now(),
                        name: "ผู้ป่วย",
                        doctor: false,
                        text,
                    },
                ]);
            }
        } catch (error) {
            console.error("Audio processing error:", error);
        }

        const newAudio = {
            id: newId,
            title,
            time: formatTime(duration),
            status: "พร้อมใช้งาน",
            active: true,
            processing: false,
            url,
            file,
            createdAt: newId,
            transcript: "",
            rawText: "",
            segments: [],
        };

        setAudioFiles((prev) => [
            ...prev.map((item) => ({
                ...item,
                active: false,
            })),
            newAudio,
        ]);

        setAudioFile(file);
        setAudioUrl(url);
        setCurrentTime(0);
        setDuration(duration);
        setIsPlaying(false);
        setIsRecording(false);
        setIsPaused(false);
        setRecordingTime(0);

        setIsNameModalOpen(false);
        setRecordingFileData(null);
    };
    const handleAudioUpload = async (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        const allowedTypes = [
            "audio/mpeg",
            "audio/wav",
            "audio/x-wav",
            "audio/mp4",
            "audio/x-m4a",
            "audio/webm",
            "audio/ogg",
        ];

        if (!allowedTypes.includes(file.type)) {
            toast.warning("รูปแบบไฟล์ไม่ถูกต้อง", "กรุณาเลือกไฟล์เสียงที่รองรับ (MP3, WAV, M4A, WebM, OGG)");
            event.target.value = "";
            return;
        }

        toast.info("เริ่มประมวลผลเสียง", `อัปโหลดไฟล์ "${file.name}" เข้าสู่ระบบ AI`);

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        const url = URL.createObjectURL(file);
        const newId = Date.now();

        setAudioFile(file);
        setAudioUrl(url);
        setCurrentTime(0);
        setDuration(0);
        setIsPlaying(false);
        setIsRecording(false);
        setIsPaused(false);
        setRecordingTime(0);

        // ==========================================
        // เพิ่มไฟล์เข้า List ทันที
        // ==========================================

        setAudioFiles((prev) => [
            ...prev.map((item) => ({
                ...item,
                active: false,
            })),

            {
                id: newId,
                title: file.name,
                time: "--:--",
                status: "กำลังโหลด",
                active: true,
                createdAt: newId,

                // สำคัญ
                processing: true,
                progress: 0,
                message: "กำลังเตรียมไฟล์...",

                url,
                file,
            },
        ]);

        event.target.value = "";

        try {
            // ==========================================
            // 1. สร้าง waveform
            // ==========================================

            await generateWaveform(file);

            // ==========================================
            // 2. โหลด duration
            // ==========================================

            const audio = new Audio(url);

            await new Promise((resolve, reject) => {
                audio.onloadedmetadata = resolve;
                audio.onerror = reject;
            });

            const audioDuration = audio.duration;

            setDuration(audioDuration);

            // ==========================================
            // อัปเดต Duration
            // ==========================================

            setAudioFiles((prev) =>
                prev.map((item) =>
                    item.id === newId
                        ? {
                            ...item,
                            time: formatTime(audioDuration),
                            status: "กำลังส่งไฟล์",
                            processing: true,
                            progress: 0,
                            message: "กำลังส่งไฟล์...",
                        }
                        : item
                )
            );

            // ==========================================
            // 3. เริ่ม Transcription
            // ==========================================

            await handleTranscribe({
                id: newId,
                title: file.name,
                time: formatTime(audioDuration),
                status: "กำลังส่งไฟล์",
                active: true,
                processing: true,
                progress: 0,
                message: "กำลังส่งไฟล์...",
                url,
                file,
            });

        } catch (error) {
            console.error("Audio processing error:", error);

            setAudioFiles((prev) =>
                prev.map((item) =>
                    item.id === newId
                        ? {
                            ...item,
                            status: "แปลงเสียงไม่สำเร็จ",
                            processing: false,
                            progress: 0,
                            message: error?.message || "เกิดข้อผิดพลาด",
                        }
                        : item
                )
            );
        }
    };
    const handleDeleteAudio = (id) => {
        setAudioFiles((prev) => {
            const target = prev.find((item) => item.id === id);

            if (!target) {
                return prev;
            }

            if (target.url) {
                URL.revokeObjectURL(target.url);
            }

            const newFiles = prev.filter(
                (item) => item.id !== id
            );

            return newFiles;
        });

        if (
            audioFilesRef.current.find(
                (item) => item.id === id
            )?.active
        ) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }

            setAudioFile(null);
            setAudioUrl("");
            setCurrentTime(0);
            setDuration(0);
            setIsPlaying(false);
        }
    };
    const formatTime = (time) => {
        if (!Number.isFinite(time)) return "00:00";

        const minutes = Math.floor(time / 60)
            .toString()
            .padStart(2, "0");

        const seconds = Math.floor(time % 60)
            .toString()
            .padStart(2, "0");

        return `${minutes}:${seconds}`;
    }
    const handlePlaybackRate = () => {
        const rates = [1, 1.25, 1.5, 2];

        const currentIndex = rates.indexOf(playbackRate);

        const nextRate =
            rates[(currentIndex + 1) % rates.length];

        setPlaybackRate(nextRate);

        if (audioRef.current) {
            audioRef.current.playbackRate = nextRate;
        }
    };
    const generateWaveform = async (file) => {
        try {
            const arrayBuffer = await file.arrayBuffer();

            const AudioContext =
                window.AudioContext || window.webkitAudioContext;

            const audioContext = new AudioContext();

            const audioBuffer =
                await audioContext.decodeAudioData(arrayBuffer);

            // รวมทุก channel
            const channelCount = audioBuffer.numberOfChannels;
            const length = audioBuffer.length;

            const mixedData = new Float32Array(length);

            for (let channel = 0; channel < channelCount; channel++) {
                const channelData = audioBuffer.getChannelData(channel);

                for (let i = 0; i < length; i++) {
                    mixedData[i] += channelData[i] / channelCount;
                }
            }

            const samples = 150;
            const blockSize = Math.floor(length / samples);

            // ==========================================
            // 1. หา RMS ของแต่ละช่วง
            // ==========================================

            const rmsValues = [];

            for (let i = 0; i < samples; i++) {
                const start = i * blockSize;
                const end =
                    i === samples - 1
                        ? length
                        : start + blockSize;

                let sum = 0;

                for (let j = start; j < end; j++) {
                    sum += mixedData[j] * mixedData[j];
                }

                const rms = Math.sqrt(
                    sum / Math.max(1, end - start)
                );

                rmsValues.push(rms);
            }

            // ==========================================
            // 2. หา max ของเสียงทั้งหมด
            // ==========================================

            const maxRms = Math.max(...rmsValues);

            // ==========================================
            // 3. แปลงเป็นความสูง
            // ==========================================

            const waveform = rmsValues.map((rms) => {

                // normalize 0 - 1
                const normalized =
                    maxRms > 0
                        ? rms / maxRms
                        : 0;

                // ทำให้ความแตกต่างชัดขึ้น
                const boosted =
                    Math.pow(normalized, 0.5);

                // 3px - 40px
                return 3 + boosted * 37;
            });

            console.log("RMS:", rmsValues);
            console.log("MAX RMS:", maxRms);
            console.log("WAVEFORM:", waveform);

            setAudioWaveform(waveform);

            await audioContext.close();

        } catch (error) {
            console.error(
                "Generate waveform error:",
                error
            );

            setAudioWaveform([]);
        }
    };
    const updateAudioProgress = () => {
        const audio = audioRef.current;

        if (!audio) return;

        setCurrentTime(audio.currentTime);

        if (!audio.paused && !audio.ended) {
            animationFrameRef.current =
                requestAnimationFrame(updateAudioProgress);
        }
    };
    const handlePlayPause = async () => {
        if (!audioRef.current || !audioUrl) return;

        try {
            const audio = audioRef.current;

            if (audio.paused) {
                await audio.play();

                setIsPlaying(true);

                cancelAnimationFrame(
                    animationFrameRef.current
                );

                animationFrameRef.current =
                    requestAnimationFrame(updateAudioProgress);

            } else {
                audio.pause();

                setIsPlaying(false);

                setCurrentTime(audio.currentTime);

                cancelAnimationFrame(
                    animationFrameRef.current
                );
            }

        } catch (error) {
            console.error("Play audio error:", error);
            setIsPlaying(false);
        }
    };

    const handleWaveformClick = (e) => {
        if (!audioRef.current || !duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        if (width <= 0) return;
        const newTime = Math.max(0, Math.min(duration, (clickX / width) * duration));
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleExtractAndFillForm = async () => {
        let transcriptText = "";
        if (Array.isArray(transcript) && transcript.length > 0) {
            transcriptText = transcript.map(item => `${item.name || item.speaker || ""}: ${item.text || ""}`).join("\n");
        } else if (audioFiles.length > 0) {
            transcriptText = audioFiles.map(f => f.transcript || f.rawText || "").filter(Boolean).join("\n");
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
            const response = await fetch("http://localhost:8002/v1/extract-form", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: transcriptText }),
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            if (!data) {
                throw new Error("ไม่ได้รับข้อมูลที่สกัดจาก API");
            }

            console.log("Extracted Data from API:", data);

            // ดึงข้อมูลสัญญาณชีพจาก API (รองรับ vitalSigns, vital_signs, vitals)
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
            setFormData(prev => ({
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
            }));

            // ถ้า API ระบุแบบประเมิน (assessment_forms หรือ assessments) ให้ default ตามที่ API ส่งมา
            const formsFromApi = Array.isArray(data.assessment_forms)
                ? data.assessment_forms
                : (Array.isArray(data.assessmentForms)
                    ? data.assessmentForms
                    : (data.assessments && typeof data.assessments === "object" ? Object.keys(data.assessments) : []));

            if (formsFromApi && formsFromApi.length > 0) {
                // กรองเฉพาะ form ที่มีอยู่ในระบบจริง
                const validForms = formsFromApi.filter(id => assessmentForms.some(f => f.id === id));
                const finalForms = validForms.length > 0 ? validForms : formsFromApi;

                setSelectedFormIds(finalForms);
                setActiveFormId(finalForms[0]);
            } else {
                const suggestedForm = data.suggested_form_id || data.suggestedFormId || data.form_id;
                if (suggestedForm) {
                    setSelectedFormIds(prev =>
                        prev.includes(suggestedForm) ? prev : [...prev, suggestedForm]
                    );
                    setActiveFormId(suggestedForm);
                }
            }

            // สกัดและตั้งค่าเริ่มต้นคะแนนและคำตอบของแบบประเมินจาก API
            if (data.assessments && typeof data.assessments === "object") {
                const rawAssessments = data.assessments;
                const nextAnswers = {};
                const nextResults = {};

                // 1. Depression (2Q / 9Q)
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

                // 3. Alcohol (AUDIT)
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

                // 4. Fall Risk (Morse)
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

                // 5. ADL (Barthel)
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

                setAssessmentAnswers(prev => ({ ...prev, ...nextAnswers }));
                setAssessmentResults(prev => ({ ...prev, ...nextResults }));
            }

            toast.success("ดึงข้อมูลจาก API สำเร็จ", "นำเข้าข้อมูลและสัญญาณชีพจากระบบเรียบร้อยแล้ว");
        } catch (err) {
            console.error("Error extracting form from API:", err);
            toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลจาก API", err.message || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ AI ได้");
        } finally {
            setIsExtracting(false);
        }
    };

    return (
        <div className="flex flex-col gap-2 h-full lg:h-[calc(100vh-5rem)] lg:max-h-[calc(100vh-5rem)] overflow-hidden">
            {/* Patient Search & Active Patient Info Banner */}
            <PatientSearchBanner
                selectedPatient={selectedPatient}
                onSelectPatient={handleSelectPatient}
            />

            <section
                className="
                    grid min-h-0 w-full flex-1 gap-2 sm:gap-2.5 
                    grid-cols-1
                    lg:grid-cols-[250px_minmax(0,1fr)_275px]
                    xl:grid-cols-[270px_minmax(0,1.35fr)_300px]
                    2xl:grid-cols-[290px_minmax(0,1.5fr)_330px]
                    overflow-y-auto
                    lg:overflow-hidden
                "
            >
                <div
                    className="
                        flex min-w-0 flex-col gap-2 overflow-hidden
                        h-auto lg:h-full lg:min-h-0
                    "
                >
                    <section className="min-w-0 shrink-0 overflow-hidden rounded-xl border-b border-[#dfe3eb] bg-[#f1f4ff] px-3 py-3">
                        {/* <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-[14px] font-semibold text-slate-800">
                                แหล่งข้อมูล
                            </h2>

                            <span className="text-[12px] text-slate-400">
                                Speech to Text
                            </span>
                        </div> */}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="audio/*"
                            className="hidden"
                            onChange={handleAudioUpload}
                        />

                        <div className="flex items-center gap-2">

                            <button
                                type="button"
                                onClick={() =>
                                    fileInputRef.current?.click()
                                }
                                className="cursor-pointer flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-[#0568d8] text-[12px] font-medium text-white shadow-sm transition hover:bg-[#005bbd]"
                            >
                                <Upload size={14} />
                                อัปโหลดไฟล์เสียง
                            </button>

                            <div className="flex h-9 flex-1 items-center rounded-lg border border-[#dce1eb] bg-white px-2">

                                <div className="flex w-full items-center justify-between">

                                    <div className="flex items-center gap-2">

                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (isRecording) {
                                                    stopRecording();
                                                } else {
                                                    startRecording();
                                                }
                                            }}
                                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-red-400 bg-white"
                                        >
                                            {isRecording ? (
                                                <Square
                                                    size={12}
                                                    className="fill-red-500 text-red-500"
                                                />
                                            ) : (
                                                <span className="h-[14px] w-[14px] rounded-full bg-red-500" />
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={togglePauseRecording}
                                            disabled={!isRecording}
                                            className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 disabled:opacity-40"
                                        >
                                            {isPaused ? (
                                                <Play size={11} fill="currentColor" />
                                            ) : (
                                                <Pause size={11} fill="currentColor" />
                                            )}
                                        </button>

                                    </div>

                                    <span className="font-mono text-[12px] text-slate-500">
                                        {formatTime(recordingTime)}
                                    </span>

                                </div>
                            </div>

                        </div>
                        {isRecording && (
                            <div className="mt-2 rounded-lg bg-white px-3 py-2">
                                <div
                                    ref={waveformContainerRef}
                                    className="h-[35px] w-full overflow-hidden"
                                >
                                    <div className="flex h-full items-center gap-[2px]">
                                        {waveform.map((height, index) => (
                                            <div
                                                key={index}
                                                className="w-[2px] shrink-0 rounded-full bg-red-300"
                                                style={{
                                                    height: `${height}px`,
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Search & Sort Controls */}
                        <div className="mt-2 flex items-center gap-1.5">
                            <div className="flex h-8 flex-1 min-w-0 items-center gap-1.5 rounded-lg border border-[#d7dce7] bg-white px-2.5 shadow-2xs focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-100 transition-all">
                                <Search
                                    size={13}
                                    className="text-slate-400 shrink-0"
                                />

                                <input
                                    className="w-full min-w-0 bg-transparent text-[11.5px] outline-none placeholder:text-slate-400"
                                    placeholder="ค้นหาไฟล์เสียง..."
                                    value={audioSearchQuery}
                                    onChange={(e) => setAudioSearchQuery(e.target.value)}
                                />

                                {audioSearchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setAudioSearchQuery("")}
                                        className="text-slate-400 hover:text-slate-600 cursor-pointer shrink-0"
                                        title="ล้างคำค้นหา"
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                            </div>

                            {/* Sort Toggle Button (ใหม่ไปเก่า / เก่าไปใหม่) */}
                            <button
                                type="button"
                                onClick={() => setAudioSortOrder(prev => prev === "desc" ? "asc" : "desc")}
                                className={`flex h-8 shrink-0 items-center gap-1 rounded-lg border px-2 text-[10.5px] font-semibold transition cursor-pointer shadow-2xs ${audioSortOrder === "desc"
                                    ? "bg-blue-50/90 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300"
                                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                                    }`}
                                title={
                                    audioSortOrder === "desc"
                                        ? "กำลังเรียง: ไฟล์ใหม่ไปเก่า (คลิกเพื่อเปลี่ยนเป็น เก่าไปใหม่)"
                                        : "กำลังเรียง: ไฟล์เก่าไปใหม่ (คลิกเพื่อเปลี่ยนเป็น ใหม่ไปเก่า)"
                                }
                            >
                                <ArrowUpDown
                                    size={12}
                                    className={audioSortOrder === "desc" ? "text-blue-600" : "text-slate-500"}
                                />
                                <span className="whitespace-nowrap">
                                    {audioSortOrder === "desc" ? "ใหม่ → เก่า" : "เก่า → ใหม่"}
                                </span>
                            </button>
                        </div>

                        {/* Audio Files List */}
                        <div className="max-h-[160px] md:max-h-[180px] overflow-y-auto pt-2 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                            {filteredAndSortedAudioFiles.length > 0 ? (
                                <div className="space-y-1.5">
                                    {filteredAndSortedAudioFiles.map((file) => (
                                        <div
                                            key={file.id}
                                            onClick={() => {
                                                if (!file.url) return;

                                                audioRef.current?.pause();

                                                setAudioFile(file.file);
                                                setAudioUrl(file.url);
                                                setCurrentTime(0);
                                                setIsPlaying(false);

                                                setAudioFiles((prev) =>
                                                    prev.map((item) => ({
                                                        ...item,
                                                        active: item.id === file.id,
                                                    }))
                                                );
                                            }}
                                            className={`relative cursor-pointer rounded-xl border p-2.5 transition-all duration-300 ${file.processing
                                                ? "border-blue-300 bg-blue-50/40"
                                                : file.active
                                                    ? "border-[#126be3] bg-[#dceaff] shadow-sm"
                                                    : "border-[#d9deea] bg-white hover:border-blue-300"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <span
                                                            className={`h-2 w-2 shrink-0 rounded-full ${file.processing
                                                                ? "bg-amber-500 animate-ping"
                                                                : file.active
                                                                    ? "bg-[#0869dd]"
                                                                    : "bg-slate-300"
                                                                }`}
                                                        />

                                                        <div className="flex min-w-0 items-center gap-1">
                                                            {editingAudioId === file.id ? (
                                                                <input
                                                                    autoFocus
                                                                    value={editingAudioName}
                                                                    onChange={(e) =>
                                                                        setEditingAudioName(e.target.value)
                                                                    }
                                                                    onBlur={() => saveAudioName(file.id)}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === "Enter") {
                                                                            saveAudioName(file.id);
                                                                        }

                                                                        if (e.key === "Escape") {
                                                                            setEditingAudioId(null);
                                                                            setEditingAudioName("");
                                                                        }
                                                                    }}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="h-6 min-w-0 flex-1 rounded border border-blue-400 bg-white px-1.5 text-[12px] font-medium text-slate-800 outline-none"
                                                                />
                                                            ) : (
                                                                <>
                                                                    <p className="truncate text-[12px] font-semibold text-slate-800">
                                                                        {file.title}
                                                                    </p>

                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            startEditAudioName(file);
                                                                        }}
                                                                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-blue-500 cursor-pointer"
                                                                    >
                                                                        <Edit3 size={11} />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500">
                                                        <Clock3 size={10} />
                                                        <span>{file.time}</span>
                                                        <span>•</span>
                                                        <span
                                                            className={`font-medium ${file.status === "เสร็จสิ้น"
                                                                ? "text-emerald-600 font-semibold"
                                                                : file.status?.includes("ข้อผิดพลาด") || file.status?.includes("ไม่สำเร็จ")
                                                                    ? "text-red-500"
                                                                    : file.processing
                                                                        ? "text-blue-600 font-medium"
                                                                        : "text-slate-500"
                                                                }`}
                                                        >
                                                            {file.status}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center shrink-0">
                                                    {file.processing ? (
                                                        <div>
                                                            {/* <LoaderCircle size={10} className="animate-spin text-blue-600" />
                                                            <span>{file.progress ?? 0}%</span> */}
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteAudio(file.id);
                                                            }}
                                                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-red-500 text-white hover:bg-red-600 transition cursor-pointer"
                                                            title="ลบไฟล์เสียง"
                                                        >
                                                            <Trash2 size={11} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Full-width Progress Bar when Processing */}
                                            {file.processing && (
                                                <div className="mt-2 pt-2 border-t border-blue-100">
                                                    <div className="mb-1 flex items-center justify-between gap-2 text-[10px]">
                                                        <span className="truncate font-medium text-slate-600">
                                                            {file.message || "กำลังประมวลผล..."}
                                                        </span>
                                                        <span className="shrink-0 font-bold text-blue-600">
                                                            {file.progress ?? 0}%
                                                        </span>
                                                    </div>
                                                    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-blue-100">
                                                        <div
                                                            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                                                            style={{
                                                                width: `${file.progress ?? 0}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : audioFiles.length > 0 ? (
                                <div className="flex h-20 flex-col items-center justify-center rounded-lg border border-dashed border-[#d6dbe8] bg-white p-2 text-center">
                                    <p className="text-[11px] font-medium text-slate-500">
                                        ไม่พบไฟล์เสียงที่ค้นหา
                                    </p>
                                    <p className="mt-0.5 text-[10px] text-slate-400">
                                        ลองค้นหาด้วยคำอื่น หรือกดล้างการค้นหา
                                    </p>
                                </div>
                            ) : (
                                <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-[#d6dbe8] bg-white">
                                    <p className="text-[12px] text-slate-400">
                                        ยังไม่มีไฟล์เสียง
                                    </p>
                                </div>
                            )}

                        </div>
                    </section>

                    {/* Transcribed Text Section */}
                    <section className="min-h-0 flex-1 flex flex-col overflow-hidden">
                        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-[#d9dde7] bg-white shadow-2xs">

                            <div className="flex shrink-0 items-center justify-between border-b border-[#e2e5ed] px-3 py-2 bg-slate-50/50">

                                <div className="flex items-center gap-1.5 min-w-0">
                                    {isEditingTitle ? (
                                        <input
                                            autoFocus
                                            value={treatmentTitle}
                                            onChange={(e) => setTreatmentTitle(e.target.value)}
                                            onBlur={() => setIsEditingTitle(false)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === "Escape") {
                                                    setIsEditingTitle(false);
                                                }
                                            }}
                                            className="h-6 rounded border border-primary/40 px-1.5 text-[12px] font-semibold text-slate-800 outline-none bg-white"
                                        />
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setIsEditingTitle(true)}
                                            className="flex items-center gap-1 text-[13px] font-semibold text-slate-800 hover:text-primary transition cursor-pointer"
                                            title="คลิกเพื่อแก้ไขหัวข้อการสนทนา"
                                        >
                                            <span className="truncate max-w-[140px] sm:max-w-[180px]">{treatmentTitle}</span>
                                            <Edit3 size={11} className="text-slate-400 shrink-0" />
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 text-[12px] text-slate-400 shrink-0">
                                    {/* <div className="flex items-center gap-1">
                                        <UsersRound size={11} className="text-slate-400" />
                                        <span>ผู้พูด 2 คน</span>
                                    </div> */}

                                    <div className="flex items-center gap-1">
                                        <Clock3 size={10} />
                                        <span>ระยะเวลา {formatTime(duration)}</span>
                                    </div>
                                </div>

                            </div>

                            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2.5 scrollbar-thin scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400">
                                {transcript && transcript.length > 0 ? (
                                    <div className="space-y-3">
                                        {transcript.map((item) => {
                                            const speaker = speakerMap[item.speaker] ?? {
                                                name: item.name || item.speaker || "ไม่ทราบผู้พูด",
                                                label: item.doctor ? "แพทย์" : "ผู้ป่วย",
                                                doctor: item.doctor ?? false,
                                                avatarClass: item.doctor ? "bg-[#dce8ff] text-[#3f6fd0]" : "bg-[#eee7ff] text-[#805ad5]",
                                            };

                                            return (
                                                <div key={item.id}>
                                                    <div className="mb-1.5 flex items-center gap-2">
                                                        <div
                                                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[8px] font-semibold ${speaker.avatarClass}`}
                                                        >
                                                            {speaker.label}
                                                        </div>

                                                        <div>
                                                            <p className="text-[12px] font-semibold text-slate-700">
                                                                {speaker.doctor && selectedPatient?.doctor
                                                                    ? selectedPatient.doctor
                                                                    : !speaker.doctor && selectedPatient?.fullName
                                                                        ? selectedPatient.fullName
                                                                        : speaker.name}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="rounded-xl border border-[#dce1eb] bg-white px-3 py-2 text-[12px] leading-[1.7] text-slate-600 break-words">
                                                        {item.text}
                                                    </div>

                                                    {speaker.doctor && (
                                                        <div className="mt-1 flex justify-end gap-2">
                                                            <Edit3
                                                                size={11}
                                                                className="cursor-pointer text-slate-500 hover:text-slate-700"
                                                            />

                                                            <Copy
                                                                size={11}
                                                                className="cursor-pointer text-slate-500 hover:text-slate-700"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex h-full min-h-[160px] flex-col items-center justify-center rounded-xl border border-dashed border-[#dce1eb] p-4 text-center">
                                        <p className="text-[12px] font-medium text-slate-500">
                                            ยังไม่มีข้อความเสียง
                                        </p>
                                        <p className="mt-1 text-[10px] text-slate-400">
                                            กรุณาอัปโหลดไฟล์เสียงหรือกดบันทึกเสียงเพื่อเริ่มแปลงข้อความ
                                        </p>
                                    </div>
                                )}
                            </div>

                        </div>
                    </section>

                    <section className="shrink-0 rounded-xl border border-[#dfe3eb] bg-white px-3 py-2">

                        <div
                            className="mb-2 flex h-[38px] w-full cursor-pointer items-center gap-[1px] overflow-hidden"
                            onClick={handleWaveformClick}
                        >

                            <audio
                                ref={audioRef}
                                src={audioUrl || undefined}
                                preload="metadata"
                                onLoadedMetadata={(e) => {
                                    setDuration(e.currentTarget.duration);
                                }}

                                onPlay={() => {
                                    setIsPlaying(true);

                                    cancelAnimationFrame(
                                        animationFrameRef.current
                                    );

                                    animationFrameRef.current =
                                        requestAnimationFrame(
                                            updateAudioProgress
                                        );
                                }}

                                onPause={() => {
                                    setIsPlaying(false);

                                    cancelAnimationFrame(
                                        animationFrameRef.current
                                    );
                                }}

                                onEnded={() => {
                                    setIsPlaying(false);

                                    cancelAnimationFrame(
                                        animationFrameRef.current
                                    );

                                    setCurrentTime(0);

                                    if (audioRef.current) {
                                        audioRef.current.currentTime = 0;
                                    }
                                }}
                            />

                            {audioWaveform.length > 0 &&
                                audioWaveform.map((height, index) => {

                                    const barProgress =
                                        (index + 0.5) /
                                        audioWaveform.length;

                                    const playedProgress =
                                        duration > 0
                                            ? currentTime / duration
                                            : 0;

                                    const isPlayed =
                                        barProgress <= playedProgress;

                                    return (
                                        <span
                                            key={index}
                                            className={`min-w-0 flex-1 rounded-full transition-colors duration-75 ${isPlayed
                                                ? "bg-[#8d7de8]"
                                                : "bg-[#eadff5]"
                                                }`}
                                            style={{
                                                height: `${height}px`,
                                            }}
                                        />
                                    );
                                })}
                        </div>

                        {/* controls */}
                        <div className="flex items-center justify-center gap-4">

                            <button
                                type="button"
                                onClick={handlePlaybackRate}
                                className="min-w-[28px] text-[11px] font-medium text-slate-700 hover:text-slate-900 cursor-pointer"
                                title="เปลี่ยนความเร็วการเล่น"
                            >
                                {playbackRate}x
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    if (audioRef.current) {
                                        const newTime = Math.max(0, audioRef.current.currentTime - 5);
                                        audioRef.current.currentTime = newTime;
                                        setCurrentTime(newTime);
                                    }
                                }}
                                className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 cursor-pointer"
                                title="ย้อนหลัง 5 วินาที"
                            >
                                <RotateCcw size={14} />
                            </button>

                            <button
                                type="button"
                                onClick={handlePlayPause}
                                disabled={!audioUrl}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#65b8ff] to-[#d85be9] text-white shadow-md disabled:opacity-40 cursor-pointer"
                            >
                                {isPlaying ? (
                                    <Pause
                                        size={15}
                                        fill="currentColor"
                                    />
                                ) : (
                                    <Play
                                        size={15}
                                        fill="currentColor"
                                    />
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    if (audioRef.current) {
                                        const newTime = Math.min(duration || 0, audioRef.current.currentTime + 5);
                                        audioRef.current.currentTime = newTime;
                                        setCurrentTime(newTime);
                                    }
                                }}
                                className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 cursor-pointer"
                                title="ไปข้างหน้า 5 วินาที"
                            >
                                <RotateCw size={14} />
                            </button>

                            <span className="min-w-[36px] text-[11px] font-medium text-slate-700">
                                {formatTime(currentTime)}
                            </span>

                        </div>

                        {/* volume */}
                        <div className="mt-2 flex items-center justify-center gap-1.5">

                            <Volume2
                                size={13}
                                className="text-slate-500"
                            />

                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={(e) => {
                                    const value =
                                        Number(e.target.value);

                                    setVolume(value);

                                    if (audioRef.current) {
                                        audioRef.current.volume =
                                            value;
                                    }
                                }}
                                className="h-1 w-24 cursor-pointer accent-[#3378e8]"
                            />

                        </div>

                    </section>

                </div>
                <div
                    className="
                        flex min-w-0 flex-col gap-2 overflow-hidden
                        h-auto lg:h-full lg:min-h-0
                    "
                >
                    <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#dfe3eb] bg-white">
                        <header className="flex h-11 sm:h-12 shrink-0 items-center justify-between rounded-t-xl border-b border-[#e4e7ef] bg-[#fafbff] px-2 sm:px-3">
                            <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none min-w-0 py-0.5">
                                <button
                                    type="button"
                                    onClick={() => setActiveStep(0)}
                                    className={`flex shrink-0 whitespace-nowrap items-center gap-1 sm:gap-1.5 rounded-lg px-2 sm:px-2.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold transition cursor-pointer ${activeStep === 0
                                        ? "bg-white text-primary shadow-xs border border-primary/20 ring-1 ring-primary/10"
                                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                                        }`}
                                >
                                    <Activity size={13} className={activeStep === 0 ? "text-primary" : "text-slate-400"} />
                                    <span>Vitalsign</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveStep(1)}
                                    className={`flex shrink-0 whitespace-nowrap items-center gap-1 sm:gap-1.5 rounded-lg px-2 sm:px-2.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold transition cursor-pointer ${activeStep === 1
                                        ? "bg-white text-primary shadow-xs border border-primary/20 ring-1 ring-primary/10"
                                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                                        }`}
                                >
                                    <Edit3 size={13} className={activeStep === 1 ? "text-primary" : "text-slate-400"} />
                                    <span>อาการสำคัญ</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveStep(2)}
                                    className={`flex shrink-0 whitespace-nowrap items-center gap-1 sm:gap-1.5 rounded-lg px-2 sm:px-2.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold transition cursor-pointer ${activeStep === 2
                                        ? "bg-white text-primary shadow-xs border border-primary/20 ring-1 ring-primary/10"
                                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                                        }`}
                                >
                                    <ClipboardCheck size={13} className={activeStep === 2 ? "text-primary" : "text-slate-400"} />
                                    <span>แบบประเมิน</span>
                                    {selectedFormIds.length > 0 && (
                                        <span className={`flex size-4 items-center justify-center rounded-full text-[9px] font-bold ${activeStep === 2 ? "bg-primary text-white" : "bg-slate-200 text-slate-600"
                                            }`}>
                                            {selectedFormIds.length}
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* Single Auto-Fill Button */}
                            <div className="flex items-center pl-1.5 text-xs shrink-0">
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleExtractAndFillForm}
                                    disabled={!hasExtractData || isExtracting}
                                    className={`flex h-7.5 sm:h-8 items-center gap-1 sm:gap-1.5 rounded-lg px-2.5 sm:px-3 text-[11px] sm:text-xs font-semibold shadow-xs transition-all ${!hasExtractData || isExtracting
                                        ? "bg-slate-200 text-slate-400 opacity-60 cursor-not-allowed shadow-none border border-slate-200"
                                        : "cursor-pointer bg-gradient-to-r from-[#0568d8] via-[#2563eb] to-[#7c3aed] hover:from-[#0456b3] hover:to-[#6d28d9] text-white hover:shadow"
                                        }`}
                                    title={hasExtractData ? "สกัดและกรอกข้อมูลจากบทสนทนาลงในแบบฟอร์มอัตโนมัติ" : "ยังไม่มีข้อมูลบทสนทนาหรือข้อความสำหรับสกัดข้อมูล"}
                                >
                                    {isExtracting ? (
                                        <>
                                            <LoaderCircle size={13} className="animate-spin text-white" />
                                            <span>กำลังกรอก...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={13} className={hasExtractData ? "text-white" : "text-slate-400"} />
                                            <span>กรอกฟอร์มอัตโนมัติ</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </header>

                        {/* Top Conflict Alert Summary Banner */}
                        {conflictCount > 0 && (
                            <div className="mx-2 mt-1.5 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-amber-50/95 border border-amber-200/90 px-3 py-1.5 text-xs text-amber-900 shadow-2xs animate-in fade-in duration-200">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white font-bold text-[10px]">
                                        {conflictCount}
                                    </span>
                                    <span className="text-[11px] font-medium text-amber-900">
                                        พบข้อมูล <strong>{conflictCount} รายการ</strong> ต่างจากจุดคัดกรอง (ปรับตามเสียงสนทนาล่าสุด)
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                                    <button
                                        type="button"
                                        onClick={handleRevertAllConflicts}
                                        className="cursor-pointer text-[10px] font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-amber-200/80 rounded px-2 py-0.5 shadow-2xs transition-colors"
                                        title="คืนค่าข้อมูลทุกช่องให้ตรงกับจุดคัดกรอง"
                                    >
                                        คืนค่าคัดกรองทั้งหมด
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleAcceptAllConflicts}
                                        className="cursor-pointer text-[10px] font-semibold text-amber-900 hover:text-amber-950 bg-amber-200/80 hover:bg-amber-200 rounded px-2 py-0.5 transition-colors"
                                        title="ยอมรับค่าจากเสียงเป็นค่าหลัก"
                                    >
                                        ยอมรับค่าเสียงทั้งหมด
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="min-h-0 flex-1 overflow-y-auto bg-white px-2 sm:px-2 py-2 @container">
                            {activeStep === 0 && (
                                <VitalsTab
                                    formData={formData}
                                    setFormData={setFormData}
                                    triageBaseline={triageBaseline}
                                    onRevertField={handleRevertField}
                                />
                            )}
                            {activeStep === 1 && (
                                <ChiefComplaintTab
                                    formData={formData}
                                    setFormData={setFormData}
                                    triageBaseline={triageBaseline}
                                    onRevertField={handleRevertField}
                                />
                            )}
                            {activeStep === 2 && (
                                <AssessmentFormsTab
                                    selectedFormIds={selectedFormIds}
                                    setSelectedFormIds={setSelectedFormIds}
                                    activeFormId={activeFormId}
                                    setActiveFormId={setActiveFormId}
                                    isOpen={isOpen}
                                    setIsOpen={setIsOpen}
                                    assessmentAnswers={assessmentAnswers}
                                    setAssessmentAnswers={setAssessmentAnswers}
                                    assessmentResults={assessmentResults}
                                />
                            )}
                        </div>

                        {/* Pinned Bottom Footer */}
                        <footer className="shrink-0 flex items-center justify-end border-t border-[#e4e7ef] bg-[#fafbff] mt-2 px-3 py-2 rounded-b-xl">
                            {hasSummaryData ? (
                                <Button
                                    onClick={() => {
                                        try {
                                            const payload = {
                                                formData,
                                                selectedPatient,
                                                selectedFormIds,
                                                assessmentAnswers,
                                                assessmentResults,
                                                savedAt: new Date().toISOString(),
                                            };
                                            localStorage.setItem("smart_drg_speech_result_data", JSON.stringify(payload));
                                        } catch (e) {
                                            console.error("Failed to save result data", e);
                                        }
                                        navigate({ to: "/result-page" });
                                    }}
                                    className="w-full sm:w-auto shadow-xs font-semibold text-xs cursor-pointer"
                                    variant="default"
                                    size="sm"
                                >
                                    สรุปข้อมูล
                                </Button>
                            ) : (
                                <Button
                                    // disabled
                                    className="w-full sm:w-auto shadow-xs font-semibold text-xs opacity-50  bg-slate-100 text-slate-400 border border-slate-200"
                                    // className="w-full sm:w-auto shadow-xs font-semibold text-xs opacity-50 cursor-not-allowed bg-slate-100 text-slate-400 border border-slate-200"
                                    variant="outline"
                                    size="sm"
                                    title="ยังไม่มีข้อมูลแบบฟอร์มหรือสัญญาณชีพสำหรับสรุปข้อมูล"
                                    onClick={() => {
                                        try {
                                            const payload = {
                                                formData,
                                                selectedPatient,
                                                selectedFormIds,
                                                assessmentAnswers,
                                                assessmentResults,
                                                savedAt: new Date().toISOString(),
                                            };
                                            localStorage.setItem("smart_drg_speech_result_data", JSON.stringify(payload));
                                        } catch (e) {
                                            console.error("Failed to save result data", e);
                                        }
                                        navigate({ to: "/result-page" });
                                    }}
                                >
                                    สรุปข้อมูล
                                </Button>
                            )}
                        </footer>
                    </section>
                    <section className="overflow-hidden rounded-xl border border-[#dfe3eb] bg-white">
                        <div className="flex items-center gap-2 bg-[#faf9ff] px-3 py-2 text-[12px] font-semibold text-slate-700">
                            <Bot
                                size={13}
                                className="text-[#8c46d9]"
                            />

                            สรุปผลโดย AI
                        </div>

                        {/* Content */}
                        <Grid cols={{ default: 1, sm: 3 }} gap={2} className="p-2">

                            <CodeRow
                                label="ICD 10"
                                code={formData.icd10Code && formData.icd10Code !== "-" ? formData.icd10Code : (formData.icd10?.split(" ")[0] || "J11.1")}
                                description={formData.icd10Name && formData.icd10Name !== "-" ? formData.icd10Name : (formData.icd10Desc || (formData.icd10?.includes("(") ? formData.icd10.split("(")[1].replace(")", "") : formData.icd10) || "Influenza with other respiratory manifestations / ไข้หวัดใหญ่")}
                            />

                            <CodeRow
                                label="ICD 9"
                                code={formData.icd9Code || (formData.icd9?.split(" ")[0] || "-")}
                                description={formData.icd9Name || formData.icd9Desc || (formData.icd9?.includes("(") ? formData.icd9.split("(")[1].replace(")", "") : "") || "-"}
                            />

                            <CodeRow
                                label="DRG"
                                code={formData.drgCode && formData.drgCode !== "-" ? formData.drgCode : (formData.drg?.split(" ")[0] || "-")}
                                description={formData.drgName && formData.drgName !== "-" ? formData.drgName : (formData.drgDesc || (formData.drg?.includes("(") ? formData.drg.split("(")[1].replace(")", "") : "") || "-")}
                            />

                        </Grid>

                    </section>
                </div>

                {/* สรุปทางคลินิกโดย AI (แยกเป็น Component) */}
                <AiClinicalSummary
                    formData={formData}
                    setFormData={setFormData}
                    selectedPatient={selectedPatient}
                    transcript={transcript}
                    audioFiles={audioFiles}
                    onApplyToForm={(data) => {
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
                    }}
                />

            </section>

            <Dialog
                open={isNameModalOpen}
                onOpenChange={setIsNameModalOpen}
            >
                <DialogContent className="w-[400px] max-w-[calc(100%-2rem)] rounded-lg">

                    <DialogHeader>
                        <DialogTitle>
                            บันทึกเสียง
                        </DialogTitle>

                        <DialogDescription>
                            กรุณาระบุชื่อไฟล์เสียง
                        </DialogDescription>
                    </DialogHeader>

                    <input
                        placeholder="ชื่อไฟล์"
                        value={recordingName}
                        className="rounded-lg border border-gray-300 p-2"
                        onChange={(e) =>
                            setRecordingName(e.target.value)
                        }
                    />

                    <DialogFooter>

                        <Button
                            variant="outline"
                            className="rounded-lg"
                            onClick={() =>
                                setIsNameModalOpen(false)
                            }
                        >
                            ยกเลิก
                        </Button>

                        <Button
                            className="rounded-lg"
                            onClick={handleSaveRecording}
                        >
                            บันทึก
                        </Button>

                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function CodeRow({ label, code, description }) {
    return (
        <div className="min-w-0 rounded-xl border border-[#e3e5ee] bg-white p-2 shadow-sm">

            <div className="mb-1 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400">
                    {label}
                </span>

                <button
                    type="button"
                    className="text-[11px] text-[#6178df] hover:underline"
                >
                    ↻
                </button>
            </div>

            <div className="min-w-0">
                <p className="truncate text-[11px] font-bold text-slate-700">
                    {code}
                </p>

                <p className="mt-0.5 truncate text-[9px] text-slate-400">
                    {description}
                </p>
            </div>
        </div>
    );
}

const speakerMap = {
    SPEAKER_00: {
        name: "ผู้พูดคนที่ 1",
        label: "1",
        doctor: true,
        avatarClass: "bg-[#dce8ff] text-[#3f6fd0]",
    },
    SPEAKER_01: {
        name: "ผู้พูดคนที่ 2",
        label: "2",
        doctor: false,
        avatarClass: "bg-[#eee7ff] text-[#805ad5]",
    },
};