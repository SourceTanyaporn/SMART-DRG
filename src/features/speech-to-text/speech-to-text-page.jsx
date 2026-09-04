import { Button } from "@/components/ui/button";
import CustomDialog from "@/components/ui/customDialog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
    Activity,
    Bot,
    Brain,
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Circle,
    ClipboardCheck,
    Clock3,
    Copy,
    Edit3,
    FileAudio,
    FlaskConical,
    Headphones,
    History,
    LoaderCircle,
    Mic,
    Pause,
    Play,
    Plus,
    RotateCcw,
    RotateCw,
    Save,
    Search,
    Send,
    Settings2,
    Sparkles,
    Square,
    StickyNote,
    Trash2,
    Upload,
    UserRound,
    UsersRound,
    Volume2,
    X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { pipeline, read_audio } from '@huggingface/transformers';
import { TranscribeService } from "@/api/transcribe-service";
import { toast } from "@/components/ui/toast-notification";


const assessmentForms = [
    {
        id: "smoking",
        title: "แบบประเมินพฤติกรรมการสูบบุหรี่ (Fagerström Test)",
        category: "พฤติกรรมสุขภาพ",
        description: "แบบประเมินพฤติกรรมและความเสี่ยงการติดนิโคติน",
        totalScore: 5,
        resultLabel: "ระดับการติดนิโคตินปานกลาง (ควรให้คำแนะนำการเลิกบุหรี่)",
        questions: [
            { number: "1", text: "โดยปกติคุณสูบบุหรี่หรือไม่?", type: "select", options: ["ไม่สูบ", "สูบเป็นประจำ", "สูบเป็นครั้งคราว"], score: "1 คะแนน" },
            { number: "2", text: "หลังตื่นนอนตอนเช้า คุณสูบบุหรี่ รวมแล้วกี่มวน?", type: "select", options: ["น้อยกว่า 10 มวน", "11-20 มวน", "21-30 มวน", "31 มวนขึ้นไป"], score: "1 คะแนน" },
            { number: "3", text: "คุณสูบบุหรี่ในช่วงแรกหลังตื่นนอน (ภายใน 30 นาทีหลังตื่นนอน)", type: "radio", score: "1 คะแนน" },
            { number: "4", text: "หากมีคนในที่ทำงานสูบบุหรี่ คุณมักจะ?", type: "radio", score: "1 คะแนน" },
            { number: "5", text: "คุณรู้สึกว่าคุณสามารถหยุดสูบบุหรี่ได้หรือไม่?", type: "radio", score: "0 คะแนน" },
            { number: "6", text: "คุณสูบบุหรี่เป็นประจำในวันที่มีความเครียดหรือไม่?", type: "radio", score: "1 คะแนน" },
        ],
    },
    {
        id: "depression",
        title: "แบบคัดกรองภาวะซึมเศร้า (2Q / 9Q)",
        category: "สุขภาพจิต",
        description: "แบบคัดกรองและประเมินระดับความรุนแรงของโรคซึมเศร้า",
        totalScore: 7,
        resultLabel: "มีอาการซึมเศร้าระดับเล็กน้อย (Mild Depression)",
        questions: [
            { number: "1", text: "ใน 2 สัปดาห์ที่ผ่านมารวมถึงวันนี้ ท่านรู้สึกหมดพลังหรือไม่สบายใจบ่อยไหม?", type: "radio", score: "1 คะแนน" },
            { number: "2", text: "ใน 2 สัปดาห์ที่ผ่านมารวมถึงวันนี้ ท่านรู้สึกเบื่อหน่าย ไม่เพลิดเพลินกับสิ่งที่เคยทำหรือไม่?", type: "radio", score: "1 คะแนน" },
            { number: "3", text: "หลับยาก หรือหลับๆ ตื่นๆ หรือหลับมากเกินไป?", type: "select", options: ["ไม่มีเลย", "เป็นบางวัน (1-7 วัน)", "เป็นบ่อย (> 7 วัน)", "เป็นทุกวัน"], score: "2 คะแนน" },
            { number: "4", text: "เหนื่อยง่าย หรือไม่ค่อยมีแรง?", type: "select", options: ["ไม่มีเลย", "เป็นบางวัน", "เป็นบ่อย", "เป็นทุกวัน"], score: "2 คะแนน" },
            { number: "5", text: "เบื่ออาหาร หรือรับประทานอาหารมากเกินไป?", type: "radio", score: "1 คะแนน" },
            { number: "6", text: "สมาธิในการทำสิ่งต่างๆ เช่น ดูทีวี หรือทำงาน ลดลงหรือไม่?", type: "radio", score: "0 คะแนน" },
        ],
    },
    {
        id: "fall_risk",
        title: "แบบประเมินความเสี่ยงต่อการหกล้ม (Morse Fall Scale)",
        category: "ความปลอดภัย",
        description: "ประเมินความเสี่ยงและมาตรการป้องกันการพลัดตกหกล้มของผู้ป่วย",
        totalScore: 45,
        resultLabel: "ความเสี่ยงปานกลาง (Moderate Fall Risk - เฝ้าระวัง)",
        questions: [
            { number: "1", text: "ประวัติการหกล้มในช่วง 3 เดือนที่ผ่านมา?", type: "radio", score: "25 คะแนน" },
            { number: "2", text: "มีโรคประจำตัวหรือการวินิจฉัยโรคร่วมมากกว่า 1 โรคหรือไม่?", type: "radio", score: "15 คะแนน" },
            { number: "3", text: "การใช้อุปกรณ์ช่วยเดิน (ไม้เท้า, Walker, รถเข็น)?", type: "select", options: ["ไม่ต้องใช้อุปกรณ์/มีคนพยุง", "ใช้ไม้เท้า/Crutches", "เกาะโต๊ะ/เตียง/ผนัง"], score: "0 คะแนน" },
            { number: "4", text: "ได้รับการให้สารน้ำทางหลอดเลือดดำ (IV Infusion / Heparin lock)?", type: "radio", score: "20 คะแนน" },
            { number: "5", text: "ลักษณะการเดินและการทรงตัว (Gait & Balance)?", type: "select", options: ["เดินปกติ ทรงตัวดี", "เดินช้า ก้าวกระชั้น", "เดินเซ กล้ามเนื้ออ่อนแรง"], score: "10 คะแนน" },
            { number: "6", text: "สภาพจิตใจและการรับรู้ (Mental Status ประเมินตนเองถูกต้อง)?", type: "radio", score: "0 คะแนน" },
        ],
    },
    {
        id: "adl",
        title: "แบบประเมินกิจวัตรประจำวัน (Barthel ADL Index)",
        category: "กายภาพและฟื้นฟู",
        description: "ประเมินระดับการพึ่งพาตนเองในการทำกิจวัตรประจำวัน",
        totalScore: 16,
        resultLabel: "ระดับพึ่งพาเล็กน้อย (Mild Dependency - ติดสังคม)",
        questions: [
            { number: "1", text: "การรับประทานอาหาร (Feeding)?", type: "select", options: ["ทำได้เองทั้งหมด", "ต้องการความช่วยเหลือบางส่วน", "ทำเองไม่ได้เลย"], score: "10 คะแนน" },
            { number: "2", text: "การล้างหน้า แปรงฟัน หวีผม (Grooming)?", type: "radio", score: "5 คะแนน" },
            { number: "3", text: "การเคลื่อนย้ายตัวจากเตียงไปเก้าอี้ (Transfer)?", type: "select", options: ["ทำได้เอง", "ต้องการคนช่วยเล็กน้อย", "ต้องการคนช่วยมาก", "ทำไม่ได้"], score: "15 คะแนน" },
            { number: "4", text: "การใช้ห้องน้ำและขับถ่าย (Toilet Use)?", type: "select", options: ["ทำได้เอง", "ต้องการคนช่วยบางส่วน", "ทำไม่ได้"], score: "10 คะแนน" },
            { number: "5", text: "การเดินหรือเคลื่อนที่บนพื้นราบ (Mobility)?", type: "select", options: ["เดินได้เอง 50 เมตร", "เดินได้โดยมีคนช่วย", "ใช้รถเข็นได้เอง", "ทำไม่ได้"], score: "15 คะแนน" },
            { number: "6", text: "การสวมใส่เสื้อผ้า (Dressing)?", type: "select", options: ["ทำได้เอง", "ต้องการคนช่วยบางส่วน", "ทำไม่ได้"], score: "10 คะแนน" },
        ],
    },
    {
        id: "cvd",
        title: "แบบประเมินความเสี่ยงโรคหัวใจและหลอดเลือด (Thai CV Risk)",
        category: "โรคไม่ติดต่อเรื้อรัง",
        description: "ประเมินความเสี่ยงต่อการเกิดโรคหลอดเลือดหัวใจและสมองใน 10 ปี",
        totalScore: 12,
        resultLabel: "ความเสี่ยงปานกลาง (10 - 20% 10-Year CV Risk)",
        questions: [
            { number: "1", text: "ประวัติการสูบบุหรี่ในปัจจุบัน?", type: "radio", score: "2 คะแนน" },
            { number: "2", text: "มีประวัติได้รับการวินิจฉัยโรคเบาหวาน (DM) หรือไม่?", type: "radio", score: "4 คะแนน" },
            { number: "3", text: "ระดับความดันโลหิต Systolic Blood Pressure (SBP)?", type: "select", options: ["< 120 mmHg", "120 - 139 mmHg", "140 - 159 mmHg", "≥ 160 mmHg"], score: "3 คะแนน" },
            { number: "4", text: "ระดับไขมันโคเลสเตอรอลรวมในเลือด (Total Cholesterol)?", type: "select", options: ["< 200 mg/dL", "200 - 239 mg/dL", "240 - 279 mg/dL", "≥ 280 mg/dL"], score: "2 คะแนน" },
            { number: "5", text: "ขนาดรอบเอวเกินเกณฑ์มาตรฐาน (ชาย > 90 ซม. / หญิง > 80 ซม.)?", type: "radio", score: "1 คะแนน" },
            { number: "6", text: "ประวัติโรคหลอดเลือดหัวใจในครอบครัวสายตรงก่อนวัยอันควร?", type: "radio", score: "0 คะแนน" },
        ],
    },
    {
        id: "braden",
        title: "แบบประเมินความเสี่ยงแผลกดทับ (Braden Scale)",
        category: "การพยาบาล",
        description: "ประเมินความไวต่อความรู้สึก ความชื้น กิจกรรม ภาวะโภชนาการ และแรงเฉือน",
        totalScore: 18,
        resultLabel: "ความเสี่ยงต่ำ (Low Risk of Pressure Ulcer)",
        questions: [
            { number: "1", text: "การรับความรู้สึกต่อแรงกด (Sensory Perception)?", type: "select", options: ["ไม่บกพร่อง (4)", "บกพร่องเล็กน้อย (3)", "บกพร่องมาก (2)", "ไม่รับรู้เลย (1)"], score: "4 คะแนน" },
            { number: "2", text: "ความเปียกชื้นของผิวหนัง (Moisture)?", type: "select", options: ["แทบไม่มีความชื้น (4)", "ชื้นเป็นบางครั้ง (3)", "ชื้นบ่อย (2)", "เปียกชื้นตลอดเวลา (1)"], score: "3 คะแนน" },
            { number: "3", text: "กิจกรรมและการเคลื่อนไหว (Activity)?", type: "select", options: ["เดินได้บ่อย (4)", "เดินได้เป็นครั้งคราว (3)", "นั่งเก้าอี้/รถเข็น (2)", "นอนติดเตียงตลอด (1)"], score: "3 คะแนน" },
            { number: "4", text: "การเปลี่ยนท่านอนและเคลื่อนไหวร่างกาย (Mobility)?", type: "select", options: ["เคลื่อนไหวได้ปกติ (4)", "จำกัดเล็กน้อย (3)", "จำกัดมาก (2)", "เคลื่อนไหวไม่ได้ (1)"], score: "3 คะแนน" },
            { number: "5", text: "ภาวะโภชนาการ (Nutrition)?", type: "select", options: ["ดีเยี่ยม (4)", "เพียงพอ (3)", "น่าจะไม่เพียงพอ (2)", "แย่มาก (1)"], score: "3 คะแนน" },
            { number: "6", text: "แรงเสียดทานและแรงเฉือน (Friction & Shear)?", type: "select", options: ["ไม่มีปัญหา (3)", "อาจมีปัญหา (2)", "มีปัญหา (1)"], score: "2 คะแนน" },
        ],
    },
    {
        id: "alcohol",
        title: "แบบคัดกรองปัญหาการดื่มสุรา (AUDIT Screening)",
        category: "พฤติกรรมสุขภาพ",
        description: "แบบคัดกรองพฤติกรรมการดื่มสุราและความเสี่ยงต่อภาวะติดสุรา",
        totalScore: 4,
        resultLabel: "การดื่มระดับเสี่ยงต่ำ (Low Risk Drinking)",
        questions: [
            { number: "1", text: "คุณดื่มเครื่องดื่มที่มีแอลกอฮอล์บ่อยเพียงใด?", type: "select", options: ["ไม่เคยดื่มเลย", "เดือนละ 1 ครั้งหรือน้อยกว่า", "เดือนละ 2-4 ครั้ง", "สัปดาห์ละ 2-3 ครั้ง", "สัปดาห์ละ 4 ครั้งขึ้นไป"], score: "1 คะแนน" },
            { number: "2", text: "ในวันที่คุณดื่ม โดยทั่วไปคุณดื่มกี่ดื่มมาตรฐาน (Standard Drinks)?", type: "select", options: ["1-2 ดื่ม", "3-4 ดื่ม", "5-6 ดื่ม", "7-9 ดื่ม", "10 ดื่มขึ้นไป"], score: "1 คะแนน" },
            { number: "3", text: "คุณดื่มหนัก (6 ดื่มขึ้นไปในคราวเดียว) บ่อยแค่ไหน?", type: "select", options: ["ไม่เคย", "น้อยกว่าเดือนละครั้ง", "ทุกเดือน", "ทุกสัปดาห์", "ทุกวัน"], score: "0 คะแนน" },
            { number: "4", text: "ในช่วงปีที่ผ่านมา เคยไม่สามารถหยุดดื่มได้เมื่อเริ่มดื่มหรือไม่?", type: "radio", score: "0 คะแนน" },
            { number: "5", text: "คนใกล้ชิดหรือแพทย์เคยแสดงความกังวลหรือแนะนำให้เลิกดื่มหรือไม่?", type: "radio", score: "2 คะแนน" },
        ],
    },
    {
        id: "mna",
        title: "แบบประเมินภาวะโภชนาการ (Mini Nutritional Assessment - MNA)",
        category: "โภชนาการ",
        description: "แบบคัดกรองภาวะทุพโภชนาการและการขาดสารอาหารในผู้ป่วย",
        totalScore: 13,
        resultLabel: "ภาวะโภชนาการปกติ (Normal Nutritional Status)",
        questions: [
            { number: "1", text: "ในช่วง 3 เดือนที่ผ่านมา การรับประทานอาหารลดลงเนื่องจากเบื่ออาหารหรือไม่?", type: "select", options: ["ไม่ลดลงเลย (2)", "ลดลงปานกลาง (1)", "ลดลงมาก (0)"], score: "2 คะแนน" },
            { number: "2", text: "น้ำหนักลดลงในช่วง 3 เดือนที่ผ่านมาหรือไม่?", type: "select", options: ["น้ำหนักไม่ลด (3)", "ไม่ทราบ (2)", "ลดลง 1 - 3 กก. (1)", "ลดลงมากกว่า 3 กก. (0)"], score: "3 คะแนน" },
            { number: "3", text: "ความสามารถในการเคลื่อนไหว (Mobility)?", type: "select", options: ["ออกไปข้างนอกได้ปกติ (2)", "ลุกจากเตียงหรือเก้าอี้ได้แต่ไม่ออกข้างนอก (1)", "นอนติดเตียง/นั่งรถเข็นตลอด (0)"], score: "2 คะแนน" },
            { number: "4", text: "มีความเครียดทางจิตใจรุนแรงหรือมีโรคเฉียบพลันใน 3 เดือนที่ผ่านมา?", type: "radio", score: "2 คะแนน" },
            { number: "5", text: "ปัญหาทางระบบประสาทและจิตใจ (เช่น ความจำเสื่อม หรือซึมเศร้า)?", type: "select", options: ["ไม่มีปัญหา (2)", "ความจำเสื่อมเล็กน้อย (1)", "รุนแรง (0)"], score: "2 คะแนน" },
            { number: "6", text: "ดัชนีมวลกาย Body Mass Index (BMI)?", type: "select", options: ["BMI ≥ 23 (3)", "BMI 21 - 22.9 (2)", "BMI 19 - 20.9 (1)", "BMI < 19 (0)"], score: "2 คะแนน" },
        ],
    },
];

const formCategories = ["ทั้งหมด", "พฤติกรรมสุขภาพ", "สุขภาพจิต", "ความปลอดภัย", "กายภาพและฟื้นฟู", "โรคไม่ติดต่อเรื้อรัง", "การพยาบาล", "โภชนาการ"];

export function SpeechToTextPage() {
    const navigate = useNavigate();
    const [audioFiles, setAudioFiles] = useState([]);
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
    const [selectedFormIds, setSelectedFormIds] = useState(["smoking", "adl"]);
    const [activeFormId, setActiveFormId] = useState("smoking");
    const [formSearchQuery, setFormSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
    const [activeStep, setActiveStep] = useState(0);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [transcriptionProgress, setTranscriptionProgress] = useState(0);
    const [noteText, setNoteText] = useState("");
    const [isExtracting, setIsExtracting] = useState(false);
    const [formData, setFormData] = useState({
        chiefComplaint: "",
        presentIllness: "",
        temperature: "",
        bp1Systolic: "",
        bp1Diastolic: "",
        bp2Systolic: "",
        bp2Diastolic: "",
        bloodPressure: "",
        pulseRate: "",
        pulseRate2: "",
        respiratoryRate: "",
        spo2: "",
        map: "",
        map2: "",
        weight: "",
        height: "",
        chestCircumference: "",
        waistCircumference: "",
        painScore: "",
        esi: "ESI 3",
        barthelIndex: "20",
        cvdRisk: "< 10%",
        physicalExam: "",
        diagnosis: "",
        icd10: "-",
        icd10Desc: "-",
        icd9: "-",
        icd9Desc: "-",
        drg: "-",
        drgDesc: "-",
        treatmentPlan: "",
        note: "",
    });
    const [transcript, setTranscript] = useState([]);
    const [editingAudioName, setEditingAudioName] = useState(null);

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

    // const transcribeAudio = async (file) => {
    //     try {
    //         setIsTranscribing(true);
    //         setTranscriptionProgress(0);

    //         // --------------------------------
    //         // Load Whisper
    //         // --------------------------------
    //         if (!transcriberRef.current) {
    //             console.log("Loading Whisper...");

    //             const device = navigator.gpu ? "webgpu" : "wasm";

    //             transcriberRef.current = await pipeline(
    //                 "automatic-speech-recognition",
    //                 "Xenova/whisper-small",
    //                 {
    //                     device,
    //                     dtype: device === "webgpu" ? "fp32" : "q8",
    //                 }
    //             );

    //             console.log("Whisper loaded");
    //         }

    //         // --------------------------------
    //         // Convert -> 16kHz Mono
    //         // --------------------------------
    //         let audioData = await convertTo16kMono(file);

    //         console.log(
    //             "Original:",
    //             audioData.length / 16000,
    //             "seconds"
    //         );

    //         // --------------------------------
    //         // Trim silence
    //         // --------------------------------
    //         audioData = trimSilence(
    //             audioData,
    //             16000
    //         );

    //         if (!audioData.length) {
    //             console.log("No audio detected");
    //             return "";
    //         }

    //         // --------------------------------
    //         // Duration
    //         // --------------------------------
    //         const duration =
    //             audioData.length / 16000;

    //         console.log(
    //             "Audio duration:",
    //             duration,
    //             "seconds"
    //         );

    //         // --------------------------------
    //         // Whisper options
    //         // --------------------------------
    //         const options = {
    //             language: "th",
    //             task: "transcribe",

    //             return_timestamps: false,

    //             temperature: 0,

    //             // ใช้ greedy decoding
    //             num_beams: 1,

    //             // ป้องกันการวนคำ
    //             no_repeat_ngram_size: 3,

    //             // ไม่เอาข้อความก่อนหน้ามาช่วยเดา
    //             condition_on_previous_text: false,
    //         };

    //         // --------------------------------
    //         // Long audio
    //         // --------------------------------
    //         if (duration > 30) {
    //             options.chunk_length_s = 30;
    //             options.stride_length_s = 5;
    //         }

    //         console.log(
    //             "Transcription options:",
    //             options
    //         );

    //         // --------------------------------
    //         // Transcribe
    //         // --------------------------------
    //         console.log(
    //             "Start transcription..."
    //         );

    //         const result =
    //             await transcriberRef.current(
    //                 audioData,
    //                 options
    //             );

    //         console.log(
    //             "Whisper result:",
    //             result
    //         );

    //         let text =
    //             result?.text?.trim() || "";

    //         console.log(
    //             "Raw:",
    //             text
    //         );

    //         // --------------------------------
    //         // Clean
    //         // --------------------------------
    //         text = cleanRepeatedText(text);

    //         console.log(
    //             "Final:",
    //             text
    //         );

    //         return text;

    //     } catch (error) {
    //         console.error(
    //             "Transcription error:",
    //             error
    //         );

    //         throw error;

    //     } finally {
    //         setIsTranscribing(false);
    //     }
    // };
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

            // =========================================
            // COMPLETED
            // =========================================

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

                // =========================================
                // แปลง Backend segments -> Frontend transcript
                // =========================================

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
        // หยุด MediaRecorder
        if (
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state !== "inactive"
        ) {
            mediaRecorderRef.current.stop();
        }

        // ปิด microphone ทันที
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

    const updateProgress = () => {
        if (!audioRef.current) return;

        setCurrentTime(audioRef.current.currentTime);

        if (!audioRef.current.paused) {
            animationFrameRef.current =
                requestAnimationFrame(updateProgress);
        }
    };
    const progress =
        duration > 0
            ? currentTime / duration
            : 0;
    const updateAudioTime = () => {
        const audio = audioRef.current;

        if (!audio) return;

        setCurrentTime(audio.currentTime);

        if (!audio.paused && !audio.ended) {
            animationFrameRef.current =
                requestAnimationFrame(updateAudioTime);
        }
    };

    const handleWaveformClick = (e) => {
        if (!audioRef.current || !duration) return;

        const rect = e.currentTarget.getBoundingClientRect();

        const clickX = e.clientX - rect.left;

        const ratio = Math.max(
            0,
            Math.min(1, clickX / rect.width)
        );

        const newTime = ratio * duration;

        audioRef.current.currentTime = newTime;

        setCurrentTime(newTime);
    };
    const handleExtractAndFillForm = async () => {
        // รวมข้อความจาก state transcript (Array) ให้เป็น String ก้อนเดียว
        let transcriptText = "";
        if (Array.isArray(transcript) && transcript.length > 0) {
            transcriptText = transcript.map(item => `${item.name || item.speaker || ""}: ${item.text || ""}`).join("\n");
        } else if (audioFiles.length > 0) {
            transcriptText = audioFiles.map(f => f.transcript || f.rawText || "").filter(Boolean).join("\n");
        }

        if (!transcriptText || transcriptText.trim() === "") {
            transcriptText = noteText || "";
        }

        // ถ้ายังไม่มีข้อความให้แจ้งเตือน
        if (!transcriptText || transcriptText.trim() === "") {
            toast.warning("ยังไม่มีข้อความเสียง", "กรุณาอัปโหลดหรือบันทึกเสียงก่อนสกัดข้อมูลครับ");
            return;
        }

        setIsExtracting(true);
        try {
            // เรียก backend API เพื่อสกัดและสรุปข้อมูลทางการแพทย์จาก AI
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

            // ดึงข้อมูลสัญญาณชีพจาก API
            const vs = data.vital_signs || data.vitals || data.vitalSigns || {};
            let bp1Sys = vs.systolic || vs.bp_systolic || vs.bp1Systolic || "";
            let bp1Dia = vs.diastolic || vs.bp_diastolic || vs.bp1Diastolic || "";
            let bpStr = vs.blood_pressure || vs.bloodPressure || "";

            if (!bp1Sys && !bp1Dia && bpStr && typeof bpStr === "string" && bpStr.includes("/")) {
                const parts = bpStr.split("/");
                bp1Sys = parts[0]?.trim() || "";
                bp1Dia = parts[1]?.trim() || "";
            } else if (bp1Sys && bp1Dia && !bpStr) {
                bpStr = `${bp1Sys}/${bp1Dia}`;
            }

            const mapVal = vs.map || (bp1Sys && bp1Dia ? String(Math.round((2 * Number(bp1Dia) + Number(bp1Sys)) / 3)) : "");

            // นำข้อมูลที่ได้จาก API สรุปกรอกลง formData โดยตรง
            setFormData(prev => ({
                ...prev,
                chiefComplaint: data.chief_complaint || data.chiefComplaint || prev.chiefComplaint,
                presentIllness: data.present_illness || data.presentIllness || prev.presentIllness,
                physicalExam: data.physical_exam || data.physicalExam || prev.physicalExam,
                diagnosis: data.provisional_diagnosis || data.diagnosis || prev.diagnosis,
                icd10: data.icd10 || prev.icd10,
                icd10Desc: data.icd10_desc || data.icd10Desc || prev.icd10Desc,
                icd9: data.icd9 || prev.icd9,
                icd9Desc: data.icd9_desc || data.icd9Desc || prev.icd9Desc,
                drg: data.drg || prev.drg,
                drgDesc: data.drg_desc || data.drgDesc || prev.drgDesc,
                treatmentPlan: data.treatment_plan || data.plan || data.treatmentPlan || prev.treatmentPlan,
                note: data.note || prev.note,

                // สัญญาณชีพ
                temperature: vs.temperature !== undefined ? String(vs.temperature || vs.temp || vs.bt || "") : prev.temperature,
                bp1Systolic: bp1Sys || prev.bp1Systolic,
                bp1Diastolic: bp1Dia || prev.bp1Diastolic,
                bp2Systolic: vs.bp2_systolic || vs.bp2Systolic || prev.bp2Systolic,
                bp2Diastolic: vs.bp2_diastolic || vs.bp2Diastolic || prev.bp2Diastolic,
                bloodPressure: bpStr || prev.bloodPressure,
                map: mapVal || prev.map,
                map2: vs.map2 || prev.map2,
                pulseRate: vs.pulse_rate !== undefined ? String(vs.pulse_rate || vs.pulse || vs.pr || vs.pulseRate || "") : prev.pulseRate,
                pulseRate2: vs.pulse_rate2 !== undefined ? String(vs.pulse_rate2 || vs.pulseRate2 || "") : prev.pulseRate2,
                respiratoryRate: vs.respiratory_rate !== undefined ? String(vs.respiratory_rate || vs.rr || vs.respiratoryRate || "") : prev.respiratoryRate,
                spo2: vs.spo2 !== undefined ? String(vs.spo2 || vs.o2sat || "") : prev.spo2,
                weight: vs.weight !== undefined ? String(vs.weight || vs.wt || "") : prev.weight,
                height: vs.height !== undefined ? String(vs.height || vs.ht || "") : prev.height,
                chestCircumference: vs.chest_circumference !== undefined ? String(vs.chest_circumference || vs.chestCircumference || "") : prev.chestCircumference,
                waistCircumference: vs.waist_circumference !== undefined ? String(vs.waist_circumference || vs.waistCircumference || "") : prev.waistCircumference,
                painScore: vs.pain_score !== undefined ? String(vs.pain_score || vs.painScore || "") : prev.painScore,
                esi: data.esi || vs.esi || prev.esi,
                barthelIndex: data.barthel_index || vs.barthel_index || vs.barthelIndex || prev.barthelIndex,
                cvdRisk: data.cvd_risk || vs.cvd_risk || vs.cvdRisk || prev.cvdRisk,
            }));

            // ถ้า API ระบุแบบประเมินที่เกี่ยวข้อง ให้เลือกและเปิดแท็บให้อัตโนมัติ
            const suggestedForm = data.suggested_form_id || data.suggestedFormId || data.form_id;
            if (suggestedForm) {
                setSelectedFormIds(prev =>
                    prev.includes(suggestedForm) ? prev : [...prev, suggestedForm]
                );
                setActiveFormId(suggestedForm);
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
        <>
            <section
                className="
        grid min-h-0 w-full gap-2 p-2
        grid-cols-1
        md:grid-cols-2
        xl:h-[calc(100vh-160px)]
        xl:grid-cols-[minmax(280px,0.85fr)_minmax(0,2fr)_minmax(250px,0.7fr)]
        overflow-y-auto
        xl:overflow-hidden
    "
            >                <div
                className="
        flex min-w-0 flex-col overflow-hidden
        md:min-h-[520px]
        xl:h-full xl:min-h-0
    "
            >
                    <section className="min-w-0 shrink-0 overflow-hidden rounded-xl border-b border-[#dfe3eb] bg-[#f1f4ff] px-3 py-3">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-[14px] font-semibold text-slate-800">
                                แหล่งข้อมูล
                            </h2>

                            <span className="text-[12px] text-slate-400">
                                Speech to Text
                            </span>
                        </div>

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

                        <div className="mt-2 flex h-8 items-center gap-2 rounded-lg border border-[#d7dce7] bg-white px-2.5">

                            <Search
                                size={13}
                                className="text-slate-400"
                            />

                            <input
                                className="w-full bg-transparent text-[12px] outline-none placeholder:text-slate-400"
                                placeholder="ค้นหาไฟล์เสียง..."
                            />

                        </div>
                        <div className="max-h-[160px] md:max-h-[180px] overflow-y-auto pt-2 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                            {audioFiles.length > 0 ? (

                                <div className="space-y-1.5">

                                    {audioFiles.map((file) => (
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

                            ) : (

                                <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-[#d6dbe8] bg-white">

                                    <p className="text-[12px] text-slate-400">
                                        ยังไม่มีไฟล์เสียง
                                    </p>

                                </div>

                            )}

                        </div>
                    </section>

                    {/* Transcribed Text Section (Scrollable when reaching ~50vh / half screen) */}
                    <section className="min-h-0 flex-1 py-1.5 flex flex-col max-h-[50vh]">
                        <div className="flex h-full min-h-0 max-h-[50vh] flex-col overflow-hidden rounded-xl border border-[#d9dde7] bg-white shadow-2xs">

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
                                    <div className="flex items-center gap-1">
                                        <UsersRound size={10} />
                                        <span>2 ผู้ดู</span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Clock3 size={10} />
                                        <span>ระยะเวลา {formatTime(duration)}</span>
                                    </div>
                                </div>

                            </div>

                            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2.5 max-h-[calc(50vh-48px)] scrollbar-thin scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400">
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
                                                                {speaker.name}
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
                                className="min-w-[28px] text-[11px] font-medium text-slate-700"
                            >
                                {playbackRate}x
                            </button>

                            <button
                                type="button"
                                className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
                            >
                                <RotateCcw size={14} />
                            </button>

                            <button
                                type="button"
                                onClick={handlePlayPause}
                                disabled={!audioUrl}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#65b8ff] to-[#d85be9] text-white shadow-md disabled:opacity-40"
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
                                className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
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
        md:min-h-[650px]
        xl:h-full xl:min-h-0
    "
                >
                    <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#dfe3eb] bg-white">
                        <header className="flex h-12 shrink-0 items-center justify-between rounded-t-xl border-b border-[#e4e7ef] bg-[#fafbff] px-3">
                            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                                <button
                                    type="button"
                                    onClick={() => setActiveStep(0)}
                                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${activeStep === 0
                                        ? "bg-white text-primary shadow-xs border border-primary/20 ring-1 ring-primary/10"
                                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                                        }`}
                                >
                                    <Activity size={14} className={activeStep === 0 ? "text-primary" : "text-slate-400"} />
                                    <span>Vitalsign</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveStep(1)}
                                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${activeStep === 1
                                        ? "bg-white text-primary shadow-xs border border-primary/20 ring-1 ring-primary/10"
                                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                                        }`}
                                >
                                    <Edit3 size={14} className={activeStep === 1 ? "text-primary" : "text-slate-400"} />
                                    <span>อาการสำคัญ</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveStep(2)}
                                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${activeStep === 2
                                        ? "bg-white text-primary shadow-xs border border-primary/20 ring-1 ring-primary/10"
                                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                                        }`}
                                >
                                    <ClipboardCheck size={14} className={activeStep === 2 ? "text-primary" : "text-slate-400"} />
                                    <span>แบบประเมิน</span>
                                    {selectedFormIds.length > 0 && (
                                        <span className={`flex size-4.5 items-center justify-center rounded-full text-[10px] font-bold ${activeStep === 2 ? "bg-primary text-white" : "bg-slate-200 text-slate-600"
                                            }`}>
                                            {selectedFormIds.length}
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* Single Auto-Fill Button */}
                            <div className="flex items-center pl-2 text-xs">
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleExtractAndFillForm}
                                    disabled={isExtracting}
                                    className="cursor-pointer flex h-8 items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#0568d8] via-[#2563eb] to-[#7c3aed] hover:from-[#0456b3] hover:to-[#6d28d9] px-3.5 text-xs font-semibold text-white shadow-xs transition-all hover:shadow disabled:opacity-50"
                                    title="สกัดและกรอกข้อมูลจากบทสนทนาลงในแบบฟอร์มอัตโนมัติ"
                                >
                                    {isExtracting ? (
                                        <>
                                            <LoaderCircle size={14} className="animate-spin text-white" />
                                            <span>กำลังกรอก...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={14} className="text-amber-300" />
                                            <span>กรอกฟอร์มอัตโนมัติ</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </header>
                        <div className="min-h-0 flex-1 overflow-y-auto bg-white px-5 py-4 rounded-b-xl">
                            {activeStep === 0 && (
                                <div className="flex h-full flex-col">

                                    <div>
                                        <h2 className="text-[12px] font-semibold text-slate-800">
                                            Vitalsign
                                        </h2>

                                        <p className="mt-0.5 text-[10px] text-slate-400">
                                            ข้อมูลสัญญาณชีพและการประเมินเบื้องต้น
                                        </p>
                                    </div>

                                    <div className="mt-2 rounded-xl border border-[#e1e4eb] bg-white px-3 py-3 sm:px-4">
                                        <div
                                            className="
            grid min-w-0 gap-x-4 gap-y-3
            grid-cols-1
            sm:grid-cols-2
            xl:grid-cols-[minmax(120px,1fr)_minmax(160px,1.2fr)_minmax(100px,0.8fr)_minmax(220px,1fr)]
        "
                                        >
                                            {/* PR / BT */}
                                            <div className="min-w-0 space-y-2">
                                                <div className="flex h-10 min-w-0 items-center gap-2">
                                                    <label className="w-7 shrink-0 text-[10px] font-semibold text-slate-600">
                                                        PR1
                                                    </label>

                                                    <input
                                                        value={formData.pulseRate || ""}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, pulseRate: e.target.value }))}
                                                        placeholder="bpm"
                                                        className="
                        h-9 min-w-0 w-full
                        rounded-lg border border-[#d8dce4]
                        bg-white px-2 text-[10px]
                        outline-none transition
                        focus:border-[#6680ef]
                        focus:ring-1 focus:ring-[#e7ecff]
                    "
                                                    />
                                                </div>

                                                <div className="flex h-10 min-w-0 items-center gap-2">
                                                    <label className="w-7 shrink-0 text-[10px] font-semibold text-slate-600">
                                                        PR2
                                                    </label>

                                                    <input
                                                        value={formData.pulseRate2 || ""}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, pulseRate2: e.target.value }))}
                                                        placeholder="bpm"
                                                        className="
                        h-9 min-w-0 w-full
                        rounded-lg border border-[#d8dce4]
                        bg-white px-2 text-[10px]
                        outline-none transition
                        focus:border-[#6680ef]
                        focus:ring-1 focus:ring-[#e7ecff]
                    "
                                                    />
                                                </div>

                                                <div className="flex h-10 min-w-0 items-center gap-2">
                                                    <label className="w-7 shrink-0 text-[10px] font-semibold text-slate-600">
                                                        BT
                                                    </label>

                                                    <input
                                                        value={formData.temperature || ""}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, temperature: e.target.value }))}
                                                        placeholder="°C"
                                                        className="
                        h-9 min-w-0 w-full
                        rounded-lg border border-[#d8dce4]
                        bg-white px-2 text-[10px]
                        outline-none transition
                        focus:border-[#6680ef]
                        focus:ring-1 focus:ring-[#e7ecff]
                    "
                                                    />
                                                </div>
                                            </div>

                                            {/* BP / O2 */}
                                            <div className="min-w-0 space-y-2">
                                                <div className="flex h-10 min-w-0 items-center gap-2">
                                                    <label className="w-8 shrink-0 text-[10px] font-semibold text-slate-600">
                                                        BP1
                                                    </label>

                                                    <input
                                                        placeholder="Sys"
                                                        value={formData.bp1Systolic || ""}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                bp1Systolic: val,
                                                                bloodPressure: `${val}/${prev.bp1Diastolic || ""}`,
                                                                map: (val && prev.bp1Diastolic) ? String(Math.round((2 * Number(prev.bp1Diastolic) + Number(val)) / 3)) : prev.map
                                                            }));
                                                        }}
                                                        className="
                        h-9 min-w-0 flex-1
                        rounded-lg border border-[#d8dce4]
                        bg-white px-2 text-[10px]
                        outline-none
                        placeholder:text-slate-400
                        focus:border-[#6680ef]
                    "
                                                    />

                                                    <span className="shrink-0 text-[12px] text-slate-500">
                                                        /
                                                    </span>

                                                    <input
                                                        placeholder="Dia"
                                                        value={formData.bp1Diastolic || ""}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                bp1Diastolic: val,
                                                                bloodPressure: `${prev.bp1Systolic || ""}/${val}`,
                                                                map: (prev.bp1Systolic && val) ? String(Math.round((2 * Number(val) + Number(prev.bp1Systolic)) / 3)) : prev.map
                                                            }));
                                                        }}
                                                        className="
                        h-9 min-w-0 flex-1
                        rounded-lg border border-[#d8dce4]
                        bg-white px-2 text-[10px]
                        outline-none
                        placeholder:text-slate-400
                        focus:border-[#6680ef]
                    "
                                                    />
                                                </div>

                                                <div className="flex h-10 min-w-0 items-center gap-2">
                                                    <label className="w-8 shrink-0 text-[10px] font-semibold text-slate-600">
                                                        BP2
                                                    </label>

                                                    <input
                                                        placeholder="Sys"
                                                        value={formData.bp2Systolic || ""}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, bp2Systolic: e.target.value }))}
                                                        className="
                        h-9 min-w-0 flex-1
                        rounded-lg border border-[#d8dce4]
                        bg-white px-2 text-[10px]
                        outline-none
                        placeholder:text-slate-400
                        focus:border-[#6680ef]
                    "
                                                    />

                                                    <span className="shrink-0 text-[12px] text-slate-500">
                                                        /
                                                    </span>

                                                    <input
                                                        placeholder="Dia"
                                                        value={formData.bp2Diastolic || ""}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, bp2Diastolic: e.target.value }))}
                                                        className="
                        h-9 min-w-0 flex-1
                        rounded-lg border border-[#d8dce4]
                        bg-white px-2 text-[10px]
                        outline-none
                        placeholder:text-slate-400
                        focus:border-[#6680ef]
                    "
                                                    />
                                                </div>

                                                <div className="flex h-10 min-w-0 items-center gap-2">
                                                    <label className="w-10 shrink-0 text-[10px] font-semibold text-slate-600">
                                                        O2sat
                                                    </label>

                                                    <input
                                                        placeholder="%"
                                                        value={formData.spo2 || ""}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, spo2: e.target.value }))}
                                                        className="
                        h-9 min-w-0 flex-1
                        rounded-lg border border-[#d8dce4]
                        bg-white px-2 text-[10px]
                        outline-none
                        placeholder:text-slate-400
                        focus:border-[#6680ef]
                    "
                                                    />
                                                </div>
                                            </div>

                                            {/* MAP */}
                                            <div className="min-w-0 space-y-2">
                                                <div className="flex h-10 min-w-0 items-center gap-2">
                                                    <label className="w-10 shrink-0 text-[10px] font-semibold text-slate-600">
                                                        MAP
                                                    </label>

                                                    <input
                                                        disabled
                                                        value={formData.map || (formData.bp1Systolic && formData.bp1Diastolic ? String(Math.round((2 * Number(formData.bp1Diastolic) + Number(formData.bp1Systolic)) / 3)) : "")}
                                                        className="
                        h-9 min-w-0 w-full
                        rounded-lg border border-[#d8dce4]
                        bg-[#f5f5f6] px-2 text-[10px] font-medium text-slate-700
                        outline-none
                    "
                                                    />
                                                </div>

                                                <div className="flex h-10 min-w-0 items-center gap-2">
                                                    <label className="w-10 shrink-0 text-[10px] font-semibold text-slate-600">
                                                        MAP2
                                                    </label>

                                                    <input
                                                        disabled
                                                        value={formData.map2 || (formData.bp2Systolic && formData.bp2Diastolic ? String(Math.round((2 * Number(formData.bp2Diastolic) + Number(formData.bp2Systolic)) / 3)) : "")}
                                                        className="
                        h-9 min-w-0 w-full
                        rounded-lg border border-[#d8dce4]
                        bg-[#f5f5f6] px-2 text-[10px] font-medium text-slate-700
                        outline-none
                    "
                                                    />
                                                </div>
                                            </div>

                                            {/* Weight / Height / รอบอก / รอบเอว */}
                                            <div className="min-w-0">
                                                <div
                                                    className="
                    grid min-w-0
                    grid-cols-1
                    sm:grid-cols-2
                    gap-x-3 gap-y-2
                "
                                                >
                                                    <div className="flex h-10 min-w-0 items-center gap-2">
                                                        <label className="shrink-0 whitespace-nowrap text-[10px] font-semibold text-slate-600">
                                                            Weight
                                                        </label>

                                                        <input
                                                            value={formData.weight || ""}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                                                            placeholder="kg"
                                                            className="
                            h-9 min-w-0 w-full
                            rounded-lg border border-[#d8dce4]
                            bg-white px-2 text-[10px]
                            outline-none
                            focus:border-[#6680ef]
                            focus:ring-1 focus:ring-[#e7ecff]
                        "
                                                        />
                                                    </div>

                                                    <div className="flex h-10 min-w-0 items-center gap-2">
                                                        <label className="shrink-0 whitespace-nowrap text-[10px] font-semibold text-slate-600">
                                                            รอบอก
                                                        </label>

                                                        <input
                                                            value={formData.chestCircumference || ""}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, chestCircumference: e.target.value }))}
                                                            placeholder="cm"
                                                            className="
                            h-9 min-w-0 w-full
                            rounded-lg border border-[#d8dce4]
                            bg-white px-2 text-[10px]
                            outline-none
                            focus:border-[#6680ef]
                            focus:ring-1 focus:ring-[#e7ecff]
                        "
                                                        />
                                                    </div>

                                                    <div className="flex h-10 min-w-0 items-center gap-2">
                                                        <label className="shrink-0 whitespace-nowrap text-[10px] font-semibold text-slate-600">
                                                            Height
                                                        </label>

                                                        <input
                                                            value={formData.height || ""}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                                                            placeholder="cm"
                                                            className="
                            h-9 min-w-0 w-full
                            rounded-lg border border-[#d8dce4]
                            bg-white px-2 text-[10px]
                            outline-none
                            focus:border-[#6680ef]
                            focus:ring-1 focus:ring-[#e7ecff]
                        "
                                                        />
                                                    </div>

                                                    <div className="flex h-10 min-w-0 items-center gap-2">
                                                        <label className="shrink-0 whitespace-nowrap text-[10px] font-semibold text-slate-600">
                                                            รอบเอว
                                                        </label>

                                                        <input
                                                            value={formData.waistCircumference || ""}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, waistCircumference: e.target.value }))}
                                                            placeholder="cm"
                                                            className="
                            h-9 min-w-0 w-full
                            rounded-lg border border-[#d8dce4]
                            bg-white px-2 text-[10px]
                            outline-none
                            focus:border-[#6680ef]
                            focus:ring-1 focus:ring-[#e7ecff]
                        "
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        className="
        mt-4 grid gap-3
        grid-cols-1
        sm:grid-cols-2
        xl:grid-cols-4
    "
                                    >
                                        <div className="rounded-lg border border-[#e0e3eb] p-3">
                                            <ScoreBox
                                                title="Pain Score"
                                                values={[
                                                    "0", "1", "2", "3", "4",
                                                    "5", "6", "7", "8", "9", "10"
                                                ]}
                                                value={formData.painScore}
                                                onChange={(val) => setFormData(prev => ({ ...prev, painScore: val }))}
                                            />
                                        </div>

                                        <div className="rounded-lg border border-[#e0e3eb] p-3">
                                            <p className="mb-2 text-[9px] font-semibold text-slate-700">
                                                ESI
                                            </p>

                                            <select
                                                value={formData.esi || "ESI 3"}
                                                onChange={(e) => setFormData(prev => ({ ...prev, esi: e.target.value }))}
                                                className="h-7 w-full rounded-md border border-[#dfe2e9] bg-white px-2 text-[8px] outline-none text-slate-700"
                                            >
                                                <option value="ESI 1">ESI 1 : Resuscitation (วิกฤต - แดง)</option>
                                                <option value="ESI 2">ESI 2 : Emergent (ฉุกเฉินเร่งด่วน - ชมพู)</option>
                                                <option value="ESI 3">ESI 3 : Urgent (เร่งด่วน - เหลือง)</option>
                                                <option value="ESI 4">ESI 4 : Less Urgent (ไม่เร่งด่วน - เขียว)</option>
                                                <option value="ESI 5">ESI 5 : Non-Urgent (ทั่วไป - ขาว)</option>
                                            </select>
                                        </div>

                                        <div className="rounded-lg border border-[#e0e3eb] p-3">
                                            <p className="mb-2 text-[9px] font-semibold text-slate-700">
                                                Barthel Index
                                            </p>

                                            <select
                                                value={formData.barthelIndex || "20"}
                                                onChange={(e) => setFormData(prev => ({ ...prev, barthelIndex: e.target.value }))}
                                                className="h-7 w-full rounded-md border border-[#dfe2e9] bg-white px-2 text-[8px] outline-none text-slate-700"
                                            >
                                                <option value="20">20 คะแนน : Independent (ติดสังคม)</option>
                                                <option value="12-19">12 - 19 คะแนน : Mild Dependency (ติดสังคม)</option>
                                                <option value="9-11">9 - 11 คะแนน : Moderate Dependency (ติดบ้าน)</option>
                                                <option value="5-8">5 - 8 คะแนน : Severe Dependency (ติดเตียง)</option>
                                                <option value="0-4">0 - 4 คะแนน : Total Dependency (ติดเตียง)</option>
                                            </select>
                                        </div>

                                        <div className="rounded-lg border border-[#e0e3eb] p-3">
                                            <p className="mb-2 text-[9px] font-semibold text-slate-700">
                                                CVD Risk
                                            </p>

                                            <select
                                                value={formData.cvdRisk || "< 10%"}
                                                onChange={(e) => setFormData(prev => ({ ...prev, cvdRisk: e.target.value }))}
                                                className="h-7 w-full rounded-md border border-[#dfe2e9] bg-white px-2 text-[8px] outline-none text-slate-700"
                                            >
                                                <option value="< 10%">&lt; 10% : เสี่ยงต่ำ (Low Risk - เขียว)</option>
                                                <option value="10-20%">10 - 20% : เสี่ยงปานกลาง (Moderate - เหลือง)</option>
                                                <option value="20-30%">20 - 30% : เสี่ยงสูง (High - ส้ม)</option>
                                                <option value="30-40%">30 - 40% : เสี่ยงสูงมาก (Very High - แดง)</option>
                                                <option value=">= 40%">≥ 40% : เสี่ยงอันตรายสูงสุด (Extremely High)</option>
                                            </select>
                                        </div>

                                    </div>

                                    {/* Bottom Button */}
                                    <div className="mt-auto flex justify-end pt-4">
                                        <Link to="/result-page">
                                            <Button
                                                className="w-full sm:w-auto"
                                                variant="default"
                                                size="sm"
                                            >
                                                สรุปข้อมูล
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            )}
                            {activeStep === 1 && (
                                <div className="flex h-full min-h-0 flex-col">
                                    <div className="min-h-0 flex-1 overflow-y-auto pr-1 pb-3">
                                        <div className="relative mt-4 space-y-3">
                                            <div className="absolute bottom-10 left-[35px] top-10 w-px border-l border-dashed border-[#cbd5e1]" />

                                            <ClinicalTextBox
                                                title="อาการสำคัญ"
                                                text={formData.chiefComplaint || ""}
                                                icon={UserRound}
                                                iconClassName="bg-[#f1efff] text-[#7567d9]"
                                                onSave={(val) => setFormData(prev => ({ ...prev, chiefComplaint: val }))}
                                            />

                                            <ClinicalTextBox
                                                title="การเจ็บป่วยในปัจจุบัน"
                                                text={formData.presentIllness || ""}
                                                icon={Brain}
                                                iconClassName="bg-[#eef7ff] text-[#3b91d9]"
                                                onSave={(val) => setFormData(prev => ({ ...prev, presentIllness: val }))}
                                            />

                                            <ClinicalTextBox
                                                title="การตรวจร่างกาย"
                                                text={formData.physicalExam || ""}
                                                icon={FlaskConical}
                                                iconClassName="bg-[#eefbf2] text-[#35b96b]"
                                                onSave={(val) => setFormData(prev => ({ ...prev, physicalExam: val }))}
                                            />

                                            <ClinicalTextBox
                                                title="การประเมินทางคลินิก"
                                                text={formData.diagnosis || ""}
                                                icon={ClipboardCheck}
                                                iconClassName="bg-[#fff8ed] text-[#f5a623]"
                                                onSave={(val) => setFormData(prev => ({ ...prev, diagnosis: val }))}
                                            />
                                            <ClinicalTextBox
                                                title="Note"
                                                text={formData.treatmentPlan || formData.note || ""}
                                                icon={StickyNote}
                                                iconClassName="bg-[#fdf4ff] text-[#c026d3]"
                                                onSave={(val) => setFormData(prev => ({ ...prev, treatmentPlan: val, note: val }))}
                                            />

                                        </div>

                                    </div>

                                    <div className="shrink-0 border-t border-[#e5e7eb] bg-white pt-3">
                                        <div className="flex justify-end">
                                            <Link to="/result-page">
                                                <Button
                                                    className="w-full sm:w-auto"
                                                    variant="default"
                                                    size="sm"
                                                >
                                                    สรุปข้อมูล
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>

                                </div>
                            )}
                            {activeStep === 2 && (() => {
                                const activeId = selectedFormIds.includes(activeFormId) ? activeFormId : (selectedFormIds[0] || "");
                                const currentForm = assessmentForms.find(f => f.id === activeId) || assessmentForms[0];
                                const currentFormIndex = selectedFormIds.indexOf(activeId);
                                const hasMultiple = selectedFormIds.length > 1;

                                return (
                                    <div className="flex h-full min-h-0 flex-col">
                                        {/* Multi-form Tab Bar */}
                                        <div className="shrink-0 pb-2.5 border-b border-slate-100">
                                            {selectedFormIds.length === 0 ? (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-slate-400 font-medium">
                                                        ยังไม่มีการเลือกแบบประเมิน
                                                    </span>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="default"
                                                        onClick={() => setIsOpen(true)}
                                                        className="h-8 gap-1.5 rounded-lg text-xs bg-primary hover:bg-primary/90 text-white font-medium shadow-xs"
                                                    >
                                                        <Plus size={13} />
                                                        <span>เพิ่มแบบประเมิน</span>
                                                    </Button>
                                                </div>
                                            ) : (
                                                <TooltipProvider delay={80}>
                                                    <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                                                        {selectedFormIds.map((formId, idx) => {
                                                            const form = assessmentForms.find(f => f.id === formId);
                                                            if (!form) return null;
                                                            const isActive = form.id === activeId;

                                                            return (
                                                                <Tooltip key={form.id}>
                                                                    <TooltipTrigger
                                                                        render={
                                                                            <div
                                                                                onClick={() => setActiveFormId(form.id)}
                                                                                className={`group relative flex items-center gap-1.5 cursor-pointer rounded-xl px-2.5 py-1.5 text-xs font-medium transition shrink-0 border ${isActive
                                                                                    ? "bg-primary text-white border-primary shadow-xs ring-1 ring-primary/30"
                                                                                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-[#e2e6ee]"
                                                                                    }`}
                                                                            />
                                                                        }
                                                                    >
                                                                        <span className={`flex size-5 items-center justify-center rounded-lg text-xs font-bold ${isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                                                                            }`}>
                                                                            {idx + 1}
                                                                        </span>

                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                const newIds = selectedFormIds.filter(id => id !== form.id);
                                                                                setSelectedFormIds(newIds);
                                                                                if (activeFormId === form.id) {
                                                                                    setActiveFormId(newIds[0] || "");
                                                                                }
                                                                            }}
                                                                            className={`grid size-4 place-items-center rounded-full opacity-60 hover:opacity-100 transition ${isActive ? "hover:bg-white/20 text-white" : "hover:bg-slate-200 text-slate-500"
                                                                                }`}
                                                                            title="ลบออกจากรายการ"
                                                                        >
                                                                            <X size={11} />
                                                                        </button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent
                                                                        side="top"
                                                                        sideOffset={6}
                                                                        className="z-[99999] rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-xl ring-1 ring-white/10"
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-semibold text-white">{form.title}</span>
                                                                        </div>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            );
                                                        })}

                                                        <button
                                                            type="button"
                                                            onClick={() => setIsOpen(true)}
                                                            className="flex items-center gap-1 rounded-xl border border-dashed border-primary/40 bg-primary/[0.04] hover:bg-primary/[0.08] px-2.5 py-1.5 text-xs font-semibold text-primary transition shrink-0 cursor-pointer"
                                                        >
                                                            <Plus size={13} />
                                                            <span>เพิ่ม</span>
                                                        </button>
                                                    </div>
                                                </TooltipProvider>
                                            )}
                                        </div>

                                        {selectedFormIds.length === 0 ? (
                                            <>
                                                <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
                                                    <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary mb-3">
                                                        <ClipboardCheck size={28} />
                                                    </div>
                                                    <h3 className="text-sm font-semibold text-slate-800">
                                                        ยังไม่มีแบบประเมินที่เลือก
                                                    </h3>
                                                    <p className="mt-1 text-xs text-slate-400 max-w-xs">
                                                        กรุณาคลิกปุ่มเพิ่มแบบประเมินเพื่อเลือกแบบฟอร์มที่ต้องการบันทึกข้อมูล
                                                    </p>
                                                    {/* <Button
                                                        onClick={() => setIsOpen(true)}
                                                        size="sm"
                                                        className="mt-4 flex items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-semibold text-white shadow-xs hover:bg-primary/90"
                                                    >
                                                        <Plus size={14} />
                                                        <span>เพิ่มแบบประเมิน</span>
                                                    </Button> */}
                                                </div>

                                                <div className="shrink-0 border-t border-[#e5e7eb] bg-white pt-3">
                                                    <div className="flex justify-end items-center">
                                                        <Link to="/result-page">
                                                            <Button
                                                                className="w-full sm:w-auto"
                                                                variant="default"
                                                                size="sm"
                                                            >
                                                                สรุปข้อมูล
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                {/* Active Form Header */}
                                                <div className="shrink-0 pt-2 pb-1">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h2 className="text-[14px] font-semibold text-slate-800">
                                                                    {currentForm.title}
                                                                </h2>
                                                                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600 border border-blue-200">
                                                                    {currentForm.category}
                                                                </span>
                                                            </div>
                                                            <p className="mt-0.5 text-[11px] text-slate-400">
                                                                {currentForm.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Questions List */}
                                                <div className="min-h-0 flex-1 overflow-y-auto py-2.5 pr-1">
                                                    <div className="space-y-1">
                                                        {currentForm.questions.map((q) => (
                                                            <AssessmentQuestion
                                                                key={`${currentForm.id}-${q.number}`}
                                                                number={q.number}
                                                                text={q.text}
                                                                type={q.type}
                                                                options={q.options}
                                                                score={q.score}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Bottom Interpretation Bar & Action Buttons */}
                                                <div className="shrink-0 border-t border-[#e5e7eb] bg-white pt-3">
                                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                                        <div className="w-full flex-1 rounded-lg border border-[#e0e3eb] bg-[#fafbff] px-3 py-2.5">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <p className="text-[12px] font-semibold text-slate-700">
                                                                        แบบแปลผลคะแนน ({currentForm.title.replace(/^แบบ(ประเมิน|คัดกรอง)/, "").trim()})
                                                                    </p>
                                                                    <p className="mt-0.5 text-[12px] text-emerald-600 font-medium">
                                                                        {currentForm.resultLabel}
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[12px] text-slate-500">
                                                                        คะแนนรวม
                                                                    </span>
                                                                    <span className="text-lg font-bold text-[#13a45b]">
                                                                        {currentForm.totalScore}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex w-full shrink-0 justify-end sm:w-auto">
                                                            <Link to="/result-page">
                                                                <Button
                                                                    className="w-full sm:w-auto"
                                                                    variant="default"
                                                                    size="sm"
                                                                >
                                                                    สรุปข้อมูล
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })()}

                        </div>
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
                        <div className="grid grid-cols-1 gap-2 p-2 sm:grid-cols-3">

                            <CodeRow
                                label="ICD 10"
                                code={formData.icd10 || "R53"}
                                description={formData.icd10Desc || "Malaise and Fatigue (อ่อนเพลีย)"}
                            />

                            <CodeRow
                                label="ICD 9"
                                code={formData.icd9 || "90.59*"}
                                description={formData.icd9Desc || "Blood Glucose Test (ตัวอย่าง)"}
                            />

                            <CodeRow
                                label="DRG"
                                code={formData.drg || "-"}
                                description={formData.drgDesc || "-"}
                            />

                        </div>

                    </section>
                </div>

                <section
                    className="
                        flex min-h-[480px] min-w-0 w-full flex-col
                        overflow-hidden rounded-xl border border-[#dfe3eb] bg-white
                        md:col-span-2
                        xl:col-span-1 xl:h-full xl:min-h-0
                    "
                >
                    {/* Header */}
                    <div className="flex h-[47px] shrink-0 items-center border-b border-[#e2e5ed] bg-[#faf7ff] px-3">

                        <div className="flex items-center gap-2">

                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#a14bd4] to-[#5271eb] text-white">
                                <Bot size={13} />
                            </div>

                            <div>
                                <p className="text-[11px] font-semibold text-slate-700">
                                    สรุปทางคลินิกโดย AI
                                </p>

                                <p className="text-[9px] text-emerald-500">
                                    ● AI พร้อมใช้งาน
                                </p>
                            </div>

                        </div>

                    </div>


                    {/* Chat Area */}
                    <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">

                        <div className="space-y-3">

                            <ChatBubble
                                bot
                                text="สวัสดี อยากให้ฉันช่วยอะไร?"
                            />

                            <ChatBubble
                                text="ช่วยสรุปการรักษาของคนไข้นี้หน่อย แบบเป็นกันเอง"
                            />

                            <div className="ml-8 rounded-xl bg-gradient-to-br from-[#f2e4ff] to-[#f6d4fb] p-3 text-[9px] leading-[1.6] text-slate-700">

                                <p className="mb-1 font-bold text-[11px]">
                                    อาการสำคัญ
                                </p>

                                <p className="text-[11px]">
                                    รู้สึกอ่อนเพลียมากขึ้น
                                    <br />
                                    อาการเป็นช่วงบ่าย
                                    <br />
                                    หลังรับประทานอาหาร
                                </p>

                                <p className="mb-1 mt-3 font-bold text-[11px]">
                                    ระยะเวลา
                                </p>

                                <p className="text-[11px]">
                                    ผู้ป่วยระบุว่า “ช่วงนี้”
                                </p>

                                <p className="mb-1 mt-3 font-bold text-[11px]">
                                    ความกังวลของผู้ป่วย
                                </p>

                                <p className="text-[11px]">
                                    สงสัยว่าอาการเกี่ยวข้องกับ
                                    โรคเบาหวานที่เคยพูดคุยกับแพทย์
                                </p>

                                <div className="mt-3 text-[11px] rounded-lg bg-white/60 p-2">

                                    <p className="mb-1 font-bold">
                                        ควรเฝ้าระวัง (Monitor)
                                    </p>

                                    <p>
                                        • ระดับน้ำตาลในเลือด
                                        <br />
                                        • อาการอ่อนเพลีย
                                        <br />
                                        • อาการหลังรับประทานอาหาร
                                    </p>

                                </div>

                            </div>

                            <ChatBubble
                                text="แล้วถ้าจะตรวจเพิ่มเติม ควรเริ่มจากอะไรดี?"
                            />

                        </div>

                    </div>


                    {/* Bottom Area */}
                    <div className="shrink-0 border-t border-[#e7e9ef] bg-white">

                        {/* Quick Actions */}
                        <div className="flex gap-1.5 overflow-x-auto px-3 py-2">

                            <button
                                type="button"
                                className="whitespace-nowrap rounded-full border border-[#dfe2ea] bg-white px-2.5 py-1 text-[11px] text-slate-600 hover:bg-slate-50"
                            >
                                สรุป
                            </button>

                            <button
                                type="button"
                                className="whitespace-nowrap rounded-full border border-[#dfe2ea] bg-white px-2.5 py-1 text-[11px] text-slate-600 hover:bg-slate-50"
                            >
                                ค้นหาการวินิจฉัย
                            </button>

                            <button
                                type="button"
                                className="whitespace-nowrap rounded-full border border-[#dfe2ea] bg-white px-2.5 py-1 text-[11px] text-slate-600 hover:bg-slate-50"
                            >
                                แนะนำ ICD
                            </button>

                        </div>


                        {/* Input */}
                        <div className="border-t border-[#e1e4eb] p-3">

                            <div className="flex items-center gap-2 rounded-xl border border-[#d9c9ff] bg-[#faf8ff] px-3 py-2">

                                <input
                                    className="min-w-0 flex-1 bg-transparent text-[11px] outline-none placeholder:text-slate-400"
                                    placeholder="สอบถาม AI / เกี่ยวกับการปรึกษานี้..."
                                />

                                <button
                                    type="button"
                                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#9149df] text-white"
                                >
                                    <Send size={11} />
                                </button>

                            </div>

                        </div>

                    </div>

                </section>

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
            <Dialog
                open={isOpen}
                onOpenChange={setIsOpen}
            >
                <DialogContent className="w-full sm:max-w-5xl lg:max-w-6xl max-w-[calc(100%-2rem)] rounded-2xl p-5 sm:p-6">
                    <DialogHeader className="pb-1">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="grid size-9 sm:size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                                    <ClipboardCheck size={20} />
                                </div>
                                <div>
                                    <DialogTitle className="text-base sm:text-lg font-bold text-slate-800">
                                        เลือกแบบฟอร์มการประเมิน
                                    </DialogTitle>
                                    <DialogDescription className="text-xs text-slate-400">
                                        เลือกแบบฟอร์มการประเมินที่ต้องการบันทึก (สามารถเลือกได้หลายรายการ)
                                    </DialogDescription>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary">
                                    เลือกแล้ว {selectedFormIds.length} รายการ
                                </span>
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Search & Category Filter */}
                    <div className="space-y-2.5 pt-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 size-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="ค้นหาชื่อแบบฟอร์ม, รายละเอียด..."
                                value={formSearchQuery}
                                onChange={(e) => setFormSearchQuery(e.target.value)}
                                className="h-9.5 w-full rounded-xl border border-[#d8dce4] bg-slate-50/60 pl-9 pr-3 text-xs sm:text-sm outline-none transition focus:border-primary focus:bg-white"
                            />
                        </div>

                        <div className="flex flex-wrap gap-1.5 text-xs">
                            {formCategories.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`rounded-full px-3 py-1 transition cursor-pointer font-medium text-xs ${selectedCategory === cat
                                        ? "bg-primary text-white shadow-xs"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Assessment Forms List */}
                    <div className="max-h-[520px] sm:max-h-[60vh] overflow-y-auto pr-1 pt-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {assessmentForms
                                .filter((form) => {
                                    const matchCategory = selectedCategory === "ทั้งหมด" || form.category === selectedCategory;
                                    const matchQuery = !formSearchQuery || form.title.toLowerCase().includes(formSearchQuery.toLowerCase()) || form.description.toLowerCase().includes(formSearchQuery.toLowerCase());
                                    return matchCategory && matchQuery;
                                })
                                .map((form) => {
                                    const isSelected = selectedFormIds.includes(form.id);
                                    return (
                                        <div
                                            key={form.id}
                                            onClick={() => {
                                                if (isSelected) {
                                                    const next = selectedFormIds.filter(id => id !== form.id);
                                                    setSelectedFormIds(next);
                                                    if (activeFormId === form.id) {
                                                        setActiveFormId(next[0] || "");
                                                    }
                                                } else {
                                                    setSelectedFormIds([...selectedFormIds, form.id]);
                                                    setActiveFormId(form.id);
                                                }
                                            }}
                                            className={`group relative flex cursor-pointer items-start justify-between rounded-xl border p-3.5 transition ${isSelected
                                                ? "border-primary bg-primary/[0.04] ring-1 ring-primary/40 shadow-xs"
                                                : "border-[#e0e4ec] bg-white hover:border-[#b4c8f0] hover:bg-slate-50/70"
                                                }`}
                                        >
                                            <div className="min-w-0 flex-1 pr-2">
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <p className={`text-xs sm:text-sm font-bold ${isSelected ? "text-primary" : "text-slate-800"}`}>
                                                        {form.title}
                                                    </p>
                                                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                                                        {form.category}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                                    {form.description}
                                                </p>
                                                <p className="mt-1.5 text-[10px] text-slate-400 font-medium">
                                                    จำนวน {form.questions.length} ข้อคำถาม • {form.totalScore} คะแนน
                                                </p>
                                            </div>

                                            <div className="flex shrink-0 items-center pt-0.5">
                                                {isSelected ? (
                                                    <span className="grid size-6 place-items-center rounded-full bg-primary text-white shadow-xs">
                                                        <Check size={13} strokeWidth={2.5} />
                                                    </span>
                                                ) : (
                                                    <span className="grid size-6 place-items-center rounded-full border border-slate-300 text-transparent group-hover:border-primary group-hover:text-primary">
                                                        <Check size={13} />
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>

                    <DialogFooter className="border-t border-slate-100 pt-3 flex flex-row items-center justify-between sm:justify-between">
                        <div className="text-xs text-slate-500 font-medium">
                            เลือกแล้ว <span className="font-bold text-primary">{selectedFormIds.length}</span> จาก {assessmentForms.length} แบบประเมิน
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="default"
                                size="sm"
                                className="rounded-lg text-xs px-4"
                                onClick={() => setIsOpen(false)}
                            >
                                เสร็จสิ้น ({selectedFormIds.length} ฟอร์ม)
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
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
function ChatBubble({ text, bot = false }) {
    return (
        <div
            className={`flex items-end gap-2 ${bot ? "" : "justify-end"
                }`}
        >
            {bot && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8d48b9] to-[#5272e8] text-white shadow-sm">
                    <Bot size={13} />
                </div>
            )}

            <div
                className={`max-w-[82%] rounded-2xl px-3 py-2 text-[11px] leading-4 shadow-sm ${bot
                    ? "rounded-bl-md bg-gradient-to-r from-[#eee4ff] to-[#f6dcfb] text-slate-600"
                    : "rounded-br-md bg-[#edf3ff] text-slate-600"
                    }`}
            >
                {text}
            </div>

            {!bot && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#edf0f5]">
                    <UserRound
                        size={12}
                        className="text-slate-400"
                    />
                </div>
            )}
        </div>
    );
}
function ClinicalTextBox({
    title,
    text,
    icon: Icon,
    iconClassName = "",
    onSave,
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(text);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setEditText(text);
    }, [text]);

    const handleEdit = () => {
        setEditText(text);
        setIsEditing(true);
    };

    const handleCancel = () => {
        setEditText(text);
        setIsEditing(false);
    };

    const handleSave = () => {
        onSave?.(editText);
        setIsEditing(false);
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);

            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 1500);
        } catch (error) {
            console.error("Copy failed:", error);
        }
    };

    return (
        <div className="group relative flex min-h-[78px] items-center rounded-xl border border-[#e3e7ef] bg-white px-4 py-3 transition-all hover:border-[#cfd8e8] hover:shadow-sm">

            {/* Icon */}
            <div
                className={`mr-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl  ${iconClassName}`}
            >
                {Icon ? (
                    <Icon
                        size={21}
                        strokeWidth={1.8}
                    />
                ) : null}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">

                <p className="mb-1 text-[12px] font-semibold text-slate-700">
                    {title}
                </p>

                {isEditing ? (
                    <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        autoFocus
                        rows={3}
                        className="w-full resize-none rounded-lg border border-[#cfd8e8] bg-white px-3 py-2 text-[12px] leading-5 text-slate-600 outline-none focus:border-[#6680ef] focus:ring-2 focus:ring-[#e7ecff]"
                    />
                ) : (
                    <p className={`text-[12px] leading-5 ${text ? "text-slate-600" : "text-slate-400 italic"}`}>
                        {text || "ยังไม่มีข้อมูล"}
                    </p>
                )}

            </div>

            {/* Actions */}
            <div className="ml-4 flex shrink-0 items-center gap-2">

                {isEditing ? (
                    <>
                        {/* Cancel */}
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
                            title="ยกเลิก"
                        >
                            <X size={14} />
                        </button>

                        {/* Save */}
                        <button
                            type="button"
                            onClick={handleSave}
                            className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-lg border border-green-100 text-green-500 transition-colors hover:border-green-200 hover:bg-green-50 hover:text-green-600"
                            title="บันทึก"
                        >
                            <Save size={14} />
                        </button>
                    </>
                ) : (
                    <>
                        {/* Edit */}
                        <button
                            type="button"
                            onClick={handleEdit}
                            className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-lg border border-blue-100 text-blue-400 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-500"
                            title="แก้ไข"
                        >
                            <Edit3 size={14} />
                        </button>

                        {/* Copy */}
                        <button
                            type="button"
                            onClick={handleCopy}
                            className={`cursor-pointer flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${copied
                                ? "border-green-200 bg-green-50 text-green-500"
                                : "border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-600"
                                }`}
                            title={copied ? "คัดลอกแล้ว" : "คัดลอก"}
                        >
                            {copied ? (
                                <Check size={14} />
                            ) : (
                                <Copy size={14} />
                            )}
                        </button>
                    </>
                )}

            </div>
        </div>
    );
}
function AssessmentQuestion({
    number,
    text,
    type = "select",
    options,
    score,
}) {
    return (
        <div className="grid grid-cols-[1fr_170px_60px] items-center gap-3 border-b border-[#edf0f4] py-2.5">

            <div className="text-[12px] leading-4 text-slate-700">
                <span className="mr-1 font-medium">
                    {number}.
                </span>

                {text}
            </div>

            {type === "select" ? (
                <select className="h-7 rounded-md border border-[#dfe2e9] bg-white px-2 text-[11px] text-slate-600 outline-none focus:border-[#6680ef]">
                    <option>
                        เลือกคำตอบ
                    </option>
                    {(options || ["ใช่", "ไม่ใช่"]).map((opt) => (
                        <option key={opt} value={opt}>
                            {opt}
                        </option>
                    ))}
                </select>
            ) : (
                <div className="flex items-center gap-3">

                    <label className="flex items-center gap-1 text-[12px] text-slate-600 cursor-pointer">
                        <input
                            type="radio"
                            name={`question-${number}`}
                            className="accent-[#526df5]"
                        />
                        ใช่
                    </label>

                    <label className="flex items-center gap-1 text-[12px] text-slate-600 cursor-pointer">
                        <input
                            type="radio"
                            name={`question-${number}`}
                            className="accent-[#526df5]"
                        />
                        ไม่ใช่
                    </label>
                </div>
            )}

            <span className="text-right text-[12px] font-semibold text-[#176de0]">
                {score || "5 คะแนน"}
            </span>
        </div>
    );
}
function ScoreBox({ title, values, value, onChange }) {
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
            <div className="mb-1 text-[12px] flex items-center justify-between">
                <span className="font-semibold text-slate-700">{title}</span>
                {value !== undefined && value !== "" && (
                    <span className="text-[11px] font-bold text-primary">({value})</span>
                )}
            </div>

            <div className="flex overflow-hidden rounded-sm">
                {values.map((v, index) => (
                    <label
                        key={v}
                        className={`flex h-7 w-5 cursor-pointer flex-col items-center justify-center border-r border-white text-[8px] text-white transition-opacity ${scoreColors[index]} ${String(value) === String(v) ? "ring-2 ring-blue-600 z-10 font-bold opacity-100" : "opacity-80 hover:opacity-100"}`}
                    >
                        <span>{v}</span>

                        <input
                            type="radio"
                            name={title}
                            value={v}
                            checked={String(value) === String(v)}
                            onChange={() => onChange?.(v)}
                            className="h-3 w-3 cursor-pointer accent-white"
                        />
                    </label>
                ))}
            </div>
        </div>
    )
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