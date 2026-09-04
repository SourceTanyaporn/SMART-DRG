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
import { useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
    Activity,
    Bot,
    ChevronDown,
    Circle,
    Clock3,
    Copy,
    Edit3,
    FileAudio,
    Headphones,
    History,
    LoaderCircle,
    Mic,
    Pause,
    Play,
    RotateCcw,
    RotateCw,
    Search,
    Send,
    Settings2,
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

const transcript = [
    {
        id: 1,
        doctor: true,
        name: "นพ. กันตพล เกสร",
        time: "01:15",
        text: "สวัสดีครับคุณสมชาย ผมได้ตรวจสอบผลเลือดและการตรวจคัดกรองระหว่างแล้ว และผลที่ได้ล่าสุดของคุณแล้ว ความเป็นได้มีของคุณอยู่ที่ 145 ซึ่งอยู่ในเกณฑ์ความเป็นกลางครับ",
    },
    {
        id: 2,
        doctor: false,
        name: "คุณสมชาย ใจดี",
        time: "01:45",
        text: "ช่วงนี้ผมรู้สึกเพลียมากครับคุณหมอ โดยเฉพาะช่วงบ่ายๆ แล้วผมยังมีอาการเจ็บป่วยหลังรับประทานอาหารด้วยครับ",
    },
    {
        id: 3,
        doctor: true,
        name: "นพ. กันตพล เกสร",
        time: "02:20",
        text: "เป็นไปได้แน่นอนครับคุณสมชาย ภาวะเบาหวานชนิดประเภท (Retinopathy) เป็นสิ่งที่น่ากังวลสำหรับผู้ที่เป็นมานานด้วยกัน ตรวจควรตรวจระดับน้ำตาล (Fundoscopic exam) และประเมินสายตา",
    },
];

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
    const [showNameDialog, setShowNameDialog] = useState(false);
    const [savedRecordingName, setSavedRecordingName] = useState("");
    const [activeStep, setActiveStep] = useState(0);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const audioFilesRef = useRef([]);
    const timerRef = useRef(null);
    const fileInputRef = useRef(null);
    const audioRef = useRef(null);
    const waveformContainerRef = useRef(null);
    const animationFrameRef = useRef(null);
    const mediaStreamRef = useRef(null);

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

                const defaultName = getNextRecordingName(
                    audioFilesRef.current
                );

                // เก็บข้อมูลไว้รอ user ตั้งชื่อ
                setRecordingFileData({
                    file,
                    url,
                    duration,
                });

                setRecordingName(defaultName);
                setIsNameModalOpen(true);

                clearInterval(timerRef.current);
                timerRef.current = null;
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
        } catch (error) {
            console.error(
                "Generate recording waveform error:",
                error
            );
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
            alert("กรุณาเลือกไฟล์เสียงเท่านั้น");
            event.target.value = "";
            return;
        }

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

        // เพิ่มรายการก่อน เพื่อให้ UI แสดงทันที
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
                processing: true,
                url,
                file,
            },
        ]);

        event.target.value = "";

        try {
            // สร้าง waveform จากเสียงจริง
            await generateWaveform(file);

            // โหลด duration
            const audio = new Audio(url);

            await new Promise((resolve, reject) => {
                audio.onloadedmetadata = resolve;
                audio.onerror = reject;
            });

            const audioDuration = audio.duration;

            setDuration(audioDuration);

            setAudioFiles((prev) =>
                prev.map((item) =>
                    item.id === newId
                        ? {
                            ...item,
                            time: formatTime(audioDuration),
                            status: "พร้อมใช้งาน",
                            processing: false,
                        }
                        : item
                )
            );
        } catch (error) {
            console.error("Audio loading error:", error);

            setAudioFiles((prev) =>
                prev.map((item) =>
                    item.id === newId
                        ? {
                            ...item,
                            status: "โหลดไม่สำเร็จ",
                            processing: false,
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
    };

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

            const audioContext = new (
                window.AudioContext || window.webkitAudioContext
            )();

            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

            const rawData = audioBuffer.getChannelData(0);

            const samples = 150;
            const blockSize = Math.floor(rawData.length / samples);

            const waveform = [];

            for (let i = 0; i < samples; i++) {
                const start = i * blockSize;
                const end = Math.min(start + blockSize, rawData.length);

                let sum = 0;

                for (let j = start; j < end; j++) {
                    sum += Math.abs(rawData[j]);
                }

                const average = sum / (end - start);

                // แปลง amplitude เป็นความสูงของแท่ง
                const height = Math.max(
                    5,
                    Math.min(40, average * 120)
                );

                waveform.push(height);
            }

            setAudioWaveform(waveform);

            await audioContext.close();
        } catch (error) {
            console.error("Generate waveform error:", error);

            // fallback
            setAudioWaveform(
                Array.from(
                    { length: 150 },
                    () => Math.floor(Math.random() * 35) + 5
                )
            );
        }
    };

    const updateAudioProgress = () => {
        if (!audioRef.current) return;

        setCurrentTime(audioRef.current.currentTime);

        if (!audioRef.current.paused) {
            animationFrameRef.current =
                requestAnimationFrame(updateAudioProgress);
        }
    };
    const handlePlayPause = async () => {
        if (!audioRef.current) return;

        if (audioRef.current.paused) {
            await audioRef.current.play();

            cancelAnimationFrame(animationFrameRef.current);

            animationFrameRef.current =
                requestAnimationFrame(updateAudioProgress);
        } else {
            audioRef.current.pause();

            cancelAnimationFrame(animationFrameRef.current);

            setCurrentTime(audioRef.current.currentTime);
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



    return (
        <>
            <section className="flex h-[calc(100vh-140px)] min-h-0 overflow-hidden rounded-xl border border-[#e2e5ef] bg-white text-slate-700">
                <div className="flex h-full min-h-0 w-[380px] flex-col border-r border-[#dfe3eb]">
                    <div className="shrink-0 border-b border-[#dfe3eb] bg-[#f1f4ff] px-3 py-3">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-[13px] font-semibold text-slate-800">
                                แหล่งข้อมูล
                            </h2>

                            <span className="text-[9px] text-slate-400">
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

                        {/* Upload + Record */}
                        <div className="flex items-center gap-2">

                            <button
                                type="button"
                                onClick={() =>
                                    fileInputRef.current?.click()
                                }
                                className="flex h-9 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#0568d8] text-[11px] font-medium text-white shadow-sm transition hover:bg-[#005bbd]"
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
                                            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            {isPaused ? (
                                                <Play
                                                    size={11}
                                                    fill="currentColor"
                                                />
                                            ) : (
                                                <Pause
                                                    size={11}
                                                    fill="currentColor"
                                                />
                                            )}
                                        </button>

                                    </div>

                                    <span className="font-mono text-[8px] text-slate-500">
                                        {formatTime(recordingTime)}
                                    </span>

                                </div>

                            </div>
                        </div>

                        {/* Waveform ตอนกำลังบันทึก */}
                        {isRecording && (
                            <div className="mt-2 rounded-lg border border-[#dce1eb] bg-white px-3 py-2">
                                <div
                                    ref={waveformContainerRef}
                                    className="h-[35px] w-full overflow-hidden"
                                >
                                    <div className="flex h-full min-w-max items-center gap-[2px]">
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

                        {/* Search */}
                        <div className="mt-2">
                            <div className="flex h-8 items-center gap-2 rounded-lg border border-[#d7dce7] bg-white px-2.5">

                                <Search
                                    size={13}
                                    className="shrink-0 text-slate-400"
                                />

                                <input
                                    className="w-full bg-transparent text-[10px] outline-none placeholder:text-slate-400"
                                    placeholder="ค้นหาไฟล์เสียง..."
                                />

                            </div>
                        </div>


                        {/* =========================
            FILE LIST
            อยู่ในการ์ดเดียวกับ
            "แหล่งข้อมูล"
        ========================= */}
                        <div className="mt-2 rounded-lg border border-[#d9dde7] bg-white p-2">

                            {audioFiles.length > 0 ? (

                                <div className="space-y-1.5">

                                    {audioFiles.map((file) => (

                                        <div
                                            key={file.id}
                                            onClick={() => {

                                                if (!file.url) return;

                                                if (audioRef.current) {
                                                    audioRef.current.pause();
                                                }

                                                setAudioFile(file.file);
                                                setAudioUrl(file.url);
                                                setCurrentTime(0);
                                                setIsPlaying(false);

                                                setAudioFiles((prev) =>
                                                    prev.map((item) => ({
                                                        ...item,
                                                        active:
                                                            item.id === file.id,
                                                    }))
                                                );
                                            }}
                                            className={`relative cursor-pointer rounded-lg border p-2.5 transition ${file.active
                                                    ? "border-[#126be3] bg-[#dceaff] shadow-sm"
                                                    : "border-[#d9deea] bg-white hover:border-blue-300"
                                                }`}
                                        >

                                            <div className="flex items-center justify-between gap-2">

                                                <div className="min-w-0 flex-1">

                                                    <div className="flex items-center gap-1.5">

                                                        <span
                                                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${file.active
                                                                    ? "bg-[#0869dd]"
                                                                    : "bg-slate-300"
                                                                }`}
                                                        />

                                                        <p className="truncate text-[10px] font-medium text-slate-800">
                                                            {file.title}
                                                        </p>

                                                    </div>

                                                    <div className="mt-1 flex items-center gap-1.5 text-[8px] text-slate-500">

                                                        <Clock3 size={9} />

                                                        <span>
                                                            {file.time}
                                                        </span>

                                                        <span>•</span>

                                                        <span>
                                                            {file.status}
                                                        </span>

                                                    </div>

                                                </div>

                                                {file.processing ? (

                                                    <LoaderCircle
                                                        size={14}
                                                        className="animate-spin text-blue-500"
                                                    />

                                                ) : (

                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();

                                                            handleDeleteAudio(file.id);
                                                        }}
                                                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-red-500 text-white hover:bg-red-600"
                                                    >
                                                        <Trash2 size={11} />
                                                    </button>

                                                )}

                                            </div>

                                        </div>

                                    ))}

                                </div>

                            ) : (

                                <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-[#d6dbe8] bg-white">
                                    <p className="text-[9px] text-slate-400">
                                        ยังไม่มีไฟล์เสียง
                                    </p>
                                </div>

                            )}

                        </div>

                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-2">
                        <div className="overflow-hidden rounded-lg border border-[#d9dde7] bg-white">
                            <div className="flex items-center justify-between border-b border-[#e2e5ed] px-3 py-2">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-[12px] font-semibold text-slate-800">
                                        การรักษาเบื้องต้น
                                    </h3>

                                    <Edit3
                                        size={11}
                                        className="text-slate-500"
                                    />
                                </div>
                                <div className="flex items-center gap-2 text-[8px] text-slate-400">
                                    <div className="flex items-center gap-1">
                                        <UsersRound size={10} />
                                        <span>2 ผู้ดู</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock3 size={10} />
                                        <span>ระยะเวลา 10:00</span>
                                    </div>
                                </div>

                            </div>

                            <div className="space-y-3 px-2.5 py-2.5">
                                {transcript.map((item) => (
                                    <div key={item.id}>
                                        <div className="mb-2 flex items-center gap-2">
                                            <div
                                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[8px] font-semibold ${item.doctor
                                                        ? "bg-[#dce8ff] text-[#3f6fd0]"
                                                        : "bg-[#eee7ff] text-[#805ad5]"
                                                    }`}
                                            >
                                                {item.doctor ? "นพ." : "ผู้ป่วย"}
                                            </div>

                                            <div className="min-w-0">
                                                <p className="truncate text-[12px] font-semibold text-slate-700">
                                                    {item.name}
                                                </p>

                                                <p className="text-[10px] text-slate-400">
                                                    {item.time}
                                                </p>
                                            </div>

                                        </div>

                                        <div className="rounded-xl border border-[#dce1eb] bg-white px-3 py-2.5 text-[12px] leading-[1.8] text-slate-600">
                                            {item.text}
                                        </div>

                                        {item.doctor && (
                                            <div className="mt-1 flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    className="text-slate-500 hover:text-slate-700"
                                                >
                                                    <Edit3 size={11} />
                                                </button>

                                                <button
                                                    type="button"
                                                    className="text-slate-500 hover:text-slate-700"
                                                >
                                                    <Copy size={11} />
                                                </button>
                                            </div>
                                        )}

                                    </div>

                                ))}

                            </div>

                        </div>

                    </div>
                    <div className="shrink-0 border-t border-[#dfe3eb] bg-white px-3 py-3">

                        {/* waveform */}
                        <div className="mb-1 flex h-[38px] items-center justify-center gap-[2px] overflow-hidden">

                            {audioWaveform.length > 0
                                ? audioWaveform.map((height, index) => (
                                    <span
                                        key={index}
                                        className="w-[2px] shrink-0 rounded-full bg-[#b9a8ef]"
                                        style={{
                                            height: `${Math.min(30, height)}px`,
                                        }}
                                    />
                                ))
                                : Array.from({ length: 80 }).map((_, index) => (
                                    <span
                                        key={index}
                                        className="w-[2px] shrink-0 rounded-full bg-[#dce0ee]"
                                        style={{
                                            height: `${5 + ((index * 7) % 20)}px`,
                                        }}
                                    />
                                ))
                            }

                        </div>

                        {/* controls */}
                        <div className="flex items-center gap-2">

                            <span className="w-8 shrink-0 text-[8px] text-slate-500">
                                {formatTime(currentTime)}
                            </span>

                            <button
                                type="button"
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
                            >
                                <RotateCcw size={13} />
                            </button>

                            <button
                                type="button"
                                onClick={handlePlayPause}
                                disabled={!audioUrl}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#65b8ff] to-[#d85be9] text-white shadow-sm disabled:opacity-40"
                            >
                                {isPlaying ? (
                                    <Pause size={14} fill="currentColor" />
                                ) : (
                                    <Play size={14} fill="currentColor" />
                                )}
                            </button>

                            <button
                                type="button"
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
                            >
                                <RotateCw size={13} />
                            </button>

                            <div className="ml-auto flex items-center gap-1.5">

                                <button
                                    type="button"
                                    className="rounded-md bg-[#eef1fa] px-1.5 py-1 text-[8px] text-slate-600"
                                >
                                    {playbackRate}x
                                </button>

                                <Volume2
                                    size={12}
                                    className="text-slate-500"
                                />

                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={volume}
                                    onChange={(e) => {
                                        const value = Number(e.target.value);

                                        setVolume(value);

                                        if (audioRef.current) {
                                            audioRef.current.volume = value;
                                        }
                                    }}
                                    className="h-1 w-16 cursor-pointer accent-[#3378e8]"
                                />

                            </div>

                        </div>

                    </div>

                </div>

                <main className="flex min-w-0 flex-1 flex-col bg-white">
                    <header className="flex h-[47px] shrink-0 items-center justify-between border-b border-[#e4e7ef] bg-[#faf9ff] px-3">

                        <div className="flex items-center gap-2">

                            <Edit3
                                size={14}
                                className="text-[#8c46d9]"
                            />

                            {isEditingTitle ? (
                                <input
                                    autoFocus
                                    value={treatmentTitle}
                                    onChange={(e) =>
                                        setTreatmentTitle(
                                            e.target.value
                                        )
                                    }
                                    onBlur={() =>
                                        setIsEditingTitle(false)
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            setIsEditingTitle(false);
                                        }

                                        if (e.key === "Escape") {
                                            setIsEditingTitle(false);
                                        }
                                    }}
                                    className="h-7 rounded-md border border-blue-400 px-2 text-[12px] font-semibold outline-none"
                                />
                            ) : (
                                <h1 className="text-[12px] font-semibold text-slate-800">
                                    {treatmentTitle}
                                </h1>
                            )}

                            <button
                                type="button"
                                onClick={() =>
                                    setIsEditingTitle(true)
                                }
                                className="text-[9px] text-blue-500"
                            >
                                เปลี่ยนฟอร์ม
                            </button>
                        </div>
                    </header>
                    <div className="shrink-0 border-b border-[#e4e7ef] bg-white px-5 pt-3">

                        <div className="relative flex items-start justify-between">
                            <div className="absolute left-[9%] right-[9%] top-[16px] h-[4px] rounded-full bg-[#dfe2eb]" />

                            <div
                                className="absolute left-[9%] top-[16px] h-[4px] rounded-full bg-[#526df5] transition-all duration-300"
                                style={{
                                    width:
                                        activeStep === 0
                                            ? "0%"
                                            : activeStep === 1
                                                ? "41%"
                                                : "82%",
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setActiveStep(0)}
                                className="relative z-10 flex w-1/3 cursor-pointer flex-col items-center"
                            >
                                <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-full text-white shadow-sm ${activeStep >= 0
                                            ? "bg-[#526df5]"
                                            : "bg-[#cfd3de]"
                                        }`}
                                >
                                    <Activity size={14} />
                                </div>

                                <span
                                    className={`mt-1.5 text-[9px] font-medium ${activeStep === 0
                                            ? "text-[#526df5]"
                                            : "text-slate-400"
                                        }`}
                                >
                                    Vitalsign
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveStep(1)}
                                className="relative z-10 flex w-1/3 cursor-pointer flex-col items-center"
                            >
                                <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-full text-white shadow-sm ${activeStep >= 1
                                            ? "bg-[#526df5]"
                                            : "bg-[#cfd3de]"
                                        }`}
                                >
                                    <Edit3 size={14} />
                                </div>

                                <span
                                    className={`mt-1.5 text-[9px] font-medium ${activeStep === 1
                                            ? "text-[#526df5]"
                                            : "text-slate-400"
                                        }`}
                                >
                                    อาการสำคัญ
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveStep(2)}
                                className="relative z-10 flex w-1/3 cursor-pointer flex-col items-center"
                            >
                                <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-full text-white shadow-sm ${activeStep >= 2
                                            ? "bg-[#526df5]"
                                            : "bg-[#cfd3de]"
                                        }`}
                                >
                                    <FileAudio size={14} />
                                </div>

                                <span
                                    className={`mt-1.5 text-[9px] font-medium ${activeStep === 2
                                            ? "text-[#526df5]"
                                            : "text-slate-400"
                                        }`}
                                >
                                    แบบประเมิน
                                </span>
                            </button>
                        </div>
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto bg-white px-5 py-4">
                        {activeStep === 0 && (
                            <div className="space-y-4">

                                <div>
                                    <h2 className="text-[12px] font-semibold text-slate-800">
                                        Vitalsign
                                    </h2>

                                    <p className="mt-0.5 text-[8px] text-slate-400">
                                        ข้อมูลสัญญาณชีพและการประเมินเบื้องต้น
                                    </p>
                                </div>
                                <div className="rounded-xl border border-[#e1e4eb] bg-white px-4 py-3">
                                    <div className="grid grid-cols-[125px_330px_300px_1fr] gap-x-5">
                                        <div className="space-y-2">
                                            <div className="flex h-10 items-center gap-2">
                                                <label className="w-[28px] shrink-0 text-[10px] font-semibold text-slate-600">
                                                    PR1
                                                </label>

                                                <input
                                                    className="h-9 w-[100px] rounded-lg border border-[#d8dce4] bg-white px-2 text-[10px] outline-none transition focus:border-[#6680ef] focus:ring-1 focus:ring-[#e7ecff]"
                                                />
                                            </div>
                                            <div className="flex h-10 items-center gap-2">
                                                <label className="w-[28px] shrink-0 text-[10px] font-semibold text-slate-600">
                                                    PR2
                                                </label>

                                                <input
                                                    className="h-9 w-[100px] rounded-lg border border-[#d8dce4] bg-white px-2 text-[10px] outline-none transition focus:border-[#6680ef] focus:ring-1 focus:ring-[#e7ecff]"
                                                />
                                            </div>
                                            <div className="flex h-10 items-center gap-2">
                                                <label className="w-[28px] shrink-0 text-[10px] font-semibold text-slate-600">
                                                    BT
                                                </label>

                                                <input
                                                    className="h-9 w-[100px] rounded-lg border border-[#d8dce4] bg-white px-2 text-[10px] outline-none transition focus:border-[#6680ef] focus:ring-1 focus:ring-[#e7ecff]"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex h-10 items-center gap-2">

                                                <label className="w-[30px] shrink-0 text-[10px] font-semibold text-slate-600">
                                                    BP1
                                                </label>

                                                <input
                                                    placeholder="mm"
                                                    className="h-9 w-[100px] rounded-lg border border-[#d8dce4] bg-white px-2 text-[10px] outline-none transition placeholder:text-slate-400 focus:border-[#6680ef] focus:ring-1 focus:ring-[#e7ecff]"
                                                />

                                                <span className="text-[12px] text-slate-500">
                                                    /
                                                </span>

                                                <input
                                                    placeholder="mm"
                                                    className="h-9 w-[120px] rounded-lg border border-[#d8dce4] bg-white px-2 text-[10px] outline-none transition placeholder:text-slate-400 focus:border-[#6680ef] focus:ring-1 focus:ring-[#e7ecff]"
                                                />

                                            </div>
                                            <div className="flex h-10 items-center gap-2">

                                                <label className="w-[30px] shrink-0 text-[10px] font-semibold text-slate-600">
                                                    BP2
                                                </label>

                                                <input
                                                    placeholder="mm"
                                                    className="h-9 w-[100px] rounded-lg border border-[#d8dce4] bg-white px-2 text-[10px] outline-none transition placeholder:text-slate-400 focus:border-[#6680ef] focus:ring-1 focus:ring-[#e7ecff]"
                                                />

                                                <span className="text-[12px] text-slate-500">
                                                    /
                                                </span>

                                                <input
                                                    placeholder="mm"
                                                    className="h-9 w-[120px] rounded-lg border border-[#d8dce4] bg-white px-2 text-[10px] outline-none transition placeholder:text-slate-400 focus:border-[#6680ef] focus:ring-1 focus:ring-[#e7ecff]"
                                                />

                                            </div>
                                            <div className="flex h-10 items-center gap-2">

                                                <label className="w-[40px] shrink-0 text-[10px] font-semibold text-slate-600">
                                                    O2sat
                                                </label>

                                                <input
                                                    placeholder="%"
                                                    className="h-9 w-[100px] rounded-lg border border-[#d8dce4] bg-white px-2 text-[10px] outline-none transition placeholder:text-slate-400 focus:border-[#6680ef] focus:ring-1 focus:ring-[#e7ecff]"
                                                />

                                            </div>

                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex h-10 items-center gap-2">

                                                <label className="w-[40px] shrink-0 text-[10px] font-semibold text-slate-600">
                                                    MAP
                                                </label>

                                                <input
                                                    disabled
                                                    className="h-9 w-[175px] rounded-lg border border-[#d8dce4] bg-[#f5f5f6] px-2 text-[10px] outline-none"
                                                />

                                            </div>
                                            <div className="flex h-10 items-center gap-2">

                                                <label className="w-[40px] shrink-0 text-[10px] font-semibold text-slate-600">
                                                    MAP2
                                                </label>

                                                <input
                                                    disabled
                                                    className="h-9 w-[175px] rounded-lg border border-[#d8dce4] bg-[#f5f5f6] px-2 text-[10px] outline-none"
                                                />

                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex h-10 items-center gap-5">
                                                <div className="flex items-center gap-2">

                                                    <label className="whitespace-nowrap text-[10px] font-semibold text-slate-600">
                                                        Weight
                                                    </label>

                                                    <input
                                                        className="h-9 w-[72px] rounded-lg border border-[#d8dce4] bg-white px-2 text-[10px] outline-none focus:border-[#6680ef] focus:ring-1 focus:ring-[#e7ecff]"
                                                    />

                                                </div>
                                                <div className="flex items-center gap-2">

                                                    <label className="whitespace-nowrap text-[10px] font-semibold text-slate-600">
                                                        รอบอก
                                                    </label>

                                                    <input
                                                        className="h-9 w-[72px] rounded-lg border border-[#d8dce4] bg-white px-2 text-[10px] outline-none focus:border-[#6680ef] focus:ring-1 focus:ring-[#e7ecff]"
                                                    />

                                                </div>

                                            </div>
                                            <div className="flex h-10 items-center gap-5">
                                                <div className="flex items-center gap-2">

                                                    <label className="whitespace-nowrap text-[10px] font-semibold text-slate-600">
                                                        Height
                                                    </label>

                                                    <input
                                                        className="h-9 w-[72px] rounded-lg border border-[#d8dce4] bg-white px-2 text-[10px] outline-none focus:border-[#6680ef] focus:ring-1 focus:ring-[#e7ecff]"
                                                    />

                                                </div>
                                                <div className="flex items-center gap-2">

                                                    <label className="whitespace-nowrap text-[10px] font-semibold text-slate-600">
                                                        รอบเอว
                                                    </label>

                                                    <input
                                                        className="h-9 w-[72px] rounded-lg border border-[#d8dce4] bg-white px-2 text-[10px] outline-none focus:border-[#6680ef] focus:ring-1 focus:ring-[#e7ecff]"
                                                    />

                                                </div>

                                            </div>

                                        </div>

                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-3">

                                    <div className="rounded-lg border border-[#e0e3eb] p-3">
                                        <ScoreBox
                                            title="Pain Score"
                                            values={["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]}
                                        />
                                    </div>

                                    <div className="rounded-lg border border-[#e0e3eb] p-3">
                                        <p className="mb-2 text-[9px] font-semibold text-slate-700">
                                            ESI (Emergency Severity)
                                        </p>

                                        <select defaultValue="ESI 3" className="h-7 w-full rounded-md border border-[#dfe2e9] bg-white px-2 text-[8px] outline-none text-slate-700">
                                            <option value="ESI 1">ESI 1 : Resuscitation (วิกฤต - แดง)</option>
                                            <option value="ESI 2">ESI 2 : Emergent (ฉุกเฉินเร่งด่วน - ชมพู)</option>
                                            <option value="ESI 3">ESI 3 : Urgent (เร่งด่วน - เหลือง)</option>
                                            <option value="ESI 4">ESI 4 : Less Urgent (ไม่เร่งด่วน - เขียว)</option>
                                            <option value="ESI 5">ESI 5 : Non-Urgent (ทั่วไป - ขาว)</option>
                                        </select>
                                    </div>

                                    <div className="rounded-lg border border-[#e0e3eb] p-3">
                                        <p className="mb-2 text-[9px] font-semibold text-slate-700">
                                            Barthel Index (ADL)
                                        </p>

                                        <select defaultValue="20" className="h-7 w-full rounded-md border border-[#dfe2e9] bg-white px-2 text-[8px] outline-none text-slate-700">
                                            <option value="20">20 คะแนน : Independent (ติดสังคม)</option>
                                            <option value="12-19">12 - 19 คะแนน : Mild Dependency (ติดสังคม)</option>
                                            <option value="9-11">9 - 11 คะแนน : Moderate Dependency (ติดบ้าน)</option>
                                            <option value="5-8">5 - 8 คะแนน : Severe Dependency (ติดเตียง)</option>
                                            <option value="0-4">0 - 4 คะแนน : Total Dependency (ติดเตียง)</option>
                                        </select>
                                    </div>
                                    <div className="rounded-lg border border-[#e0e3eb] p-3">
                                        <p className="mb-2 text-[9px] font-semibold text-slate-700">
                                            CVD Risk (Thai CV Risk)
                                        </p>

                                        <select defaultValue="< 10%" className="h-7 w-full rounded-md border border-[#dfe2e9] bg-white px-2 text-[8px] outline-none text-slate-700">
                                            <option value="< 10%">&lt; 10% : เสี่ยงต่ำ (Low Risk - เขียว)</option>
                                            <option value="10-20%">10 - 20% : เสี่ยงปานกลาง (Moderate - เหลือง)</option>
                                            <option value="20-30%">20 - 30% : เสี่ยงสูง (High - ส้ม)</option>
                                            <option value="30-40%">30 - 40% : เสี่ยงสูงมาก (Very High - แดง)</option>
                                            <option value=">= 40%">≥ 40% : เสี่ยงอันตรายสูงสุด (Extremely High)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setActiveStep(1)
                                        }
                                        className="flex h-8 items-center gap-2 rounded-lg bg-[#0869dd] px-4 text-[9px] font-medium text-white"
                                    >
                                        ต่อไป
                                        <span>›</span>
                                    </button>
                                </div>
                            </div>
                        )}
                        {activeStep === 1 && (
                            <div className="space-y-3">

                                <div className="mb-3">
                                    <h2 className="text-[12px] font-semibold text-slate-800">
                                        อาการสำคัญ
                                    </h2>

                                    <p className="mt-0.5 text-[8px] text-slate-400">
                                        ข้อมูลจากการซักประวัติและการตรวจ
                                    </p>
                                </div>

                                <ClinicalTextBox
                                    title="อาการสำคัญ"
                                    text="ผู้ป่วยมีอาการอ่อนเพลียมากขึ้น โดยเฉพาะในช่วงบ่าย ร่วมกับมีอาการไม่สบายหลังรับประทานอาหาร"
                                />

                                <ClinicalTextBox
                                    title="การเจ็บป่วยในปัจจุบัน"
                                    text="ผู้ป่วยรายงานว่ามีอาการดังกล่าวเป็นระยะ และมีความกังวลเกี่ยวกับระดับน้ำตาลในเลือด"
                                />

                                <ClinicalTextBox
                                    title="การตรวจร่างกาย"
                                    text="ผู้ป่วยมีความดันโลหิตสูง และมีระดับน้ำตาลในเลือดอยู่ที่ 110 mg/dL ในวันนี้"
                                />

                                <ClinicalTextBox
                                    title="การประเมินทางคลินิก"
                                    text="ควรติดตามอาการและประเมินระดับน้ำตาลในเลือดเพิ่มเติมตามความเหมาะสม"
                                />

                                <div className="flex justify-end gap-2 pt-2">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setActiveStep(0)
                                        }
                                        className="h-8 rounded-lg border border-[#176de0] bg-white px-4 text-[9px] font-medium text-[#176de0]"
                                    >
                                        ย้อนกลับ
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setActiveStep(2)
                                        }
                                        className="h-8 rounded-lg bg-[#0869dd] px-4 text-[9px] font-medium text-white"
                                    >
                                        ต่อไป
                                    </button>
                                </div>
                            </div>
                        )}
                        {activeStep === 2 && (
                            <div className="space-y-3">

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-[12px] font-semibold text-slate-800">
                                            แบบประเมิน
                                        </h2>

                                        <p className="mt-0.5 text-[8px] text-slate-400">
                                            แบบประเมินพฤติกรรมและความเสี่ยง
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        className="text-[9px] font-medium text-[#176de0]"
                                    >
                                        เปลี่ยนฟอร์ม
                                    </button>
                                </div>

                                <AssessmentQuestion
                                    number="1"
                                    text="โดยปกติคุณสูบบุหรี่หรือไม่?"
                                    type="select"
                                />

                                <AssessmentQuestion
                                    number="2"
                                    text="หลังตื่นนอนตอนเช้า คุณสูบบุหรี่ รวมแล้วกี่มวน?"
                                    type="select"
                                />

                                <AssessmentQuestion
                                    number="3"
                                    text="คุณสูบบุหรี่ในช่วงแรกหลังตื่นนอน (สูบบุหรี่ภายในช่วง 30 นาทีหลังตื่นนอน)"
                                    type="radio"
                                />

                                <AssessmentQuestion
                                    number="4"
                                    text="หากมีคนในที่ทำงานสูบบุหรี่ คุณมักจะ?"
                                    type="radio"
                                />

                                <AssessmentQuestion
                                    number="5"
                                    text="คุณรู้สึกว่าคุณสามารถหยุดสูบบุหรี่ได้หรือไม่?"
                                    type="radio"
                                />

                                <AssessmentQuestion
                                    number="6"
                                    text="คุณสูบบุหรี่เป็นประจำในวันที่มีความเครียดหรือไม่?"
                                    type="radio"
                                />

                                {/* Score */}
                                <div className="mt-4 rounded-lg border border-[#e0e3eb] bg-[#fafbff] px-3 py-2.5">

                                    <div className="flex items-center justify-between">

                                        <div>
                                            <p className="text-[9px] font-semibold text-slate-700">
                                                แบบแปลผลคะแนน
                                            </p>

                                            <p className="mt-0.5 text-[8px] text-slate-400">
                                                กรุณาตอบคำถามให้ครบทุกข้อ
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="text-[8px] text-slate-500">
                                                คะแนนรวม
                                            </span>

                                            <span className="text-lg font-bold text-[#13a45b]">
                                                5
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-1">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setActiveStep(1)
                                        }
                                        className="flex h-8 items-center gap-1 rounded-lg border border-[#176de0] bg-white px-4 text-[9px] font-medium text-[#176de0]"
                                    >
                                        <span>‹</span>
                                        ย้อนกลับ
                                    </button>

                                    <button
                                        type="button"
                                        className="flex h-8 items-center gap-1 rounded-lg bg-[#0869dd] px-4 text-[9px] font-medium text-white"
                                    >
                                        <span>▣</span>
                                        บันทึกการประเมิน
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                    <section className=" overflow-hidden bg-white">

                        <div className="flex items-center gap-2 bg-[#f5eaff] px-3 py-2 text-[10px] font-semibold text-slate-700">
                            <Bot
                                size={13}
                                className="text-[#8c46d9]"
                            />

                            สรุปผลโดย AI
                        </div>

                        <div className="grid grid-cols-3 gap-2 p-2">

                            <CodeRow
                                label="ICD 10"
                                code="R53"
                                description="Malaise and Fatigue (อ่อนเพลีย)"
                            />

                            <CodeRow
                                label="ICD 9"
                                code="90.59*"
                                description="Blood Glucose Test (ตัวอย่าง)"
                            />

                            <CodeRow
                                label="DRG"
                                code="-"
                                description="-"
                            />
                        </div>
                    </section>
                </main>
                <aside className="flex w-[300px] shrink-0 flex-col border-l border-[#dfe3eb] bg-white">
                    <div className="flex h-[47px] shrink-0 items-center border-b border-[#e2e5ed] bg-[#faf7ff] px-3">

                        <div className="flex items-center gap-2">

                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#a14bd4] to-[#5271eb] text-white">
                                <Bot size={13} />
                            </div>

                            <div>
                                <p className="text-[11px] font-semibold text-slate-700">
                                    สรุปทางคลินิกโดย AI
                                </p>

                                <p className="text-[7px] text-emerald-500">
                                    ● AI พร้อมใช้งาน
                                </p>
                            </div>
                        </div>
                    </div>
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

                                <p className="mb-1 font-bold">
                                    อาการสำคัญ
                                </p>

                                <p>
                                    รู้สึกอ่อนเพลียมากขึ้น
                                    <br />
                                    อาการเป็นช่วงบ่าย
                                    <br />
                                    หลังรับประทานอาหาร
                                </p>

                                <p className="mb-1 mt-3 font-bold">
                                    ระยะเวลา
                                </p>

                                <p>
                                    ผู้ป่วยระบุว่า
                                    “ช่วงนี้”
                                </p>

                                <p className="mb-1 mt-3 font-bold">
                                    ความกังวลของผู้ป่วย
                                </p>

                                <p>
                                    สงสัยว่าอาการเกี่ยวข้องกับ
                                    โรคเบาหวานที่เคยพูดคุยกับแพทย์
                                </p>

                                <div className="mt-3 rounded-lg bg-white/60 p-2">

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
                    <div className="flex gap-1.5 overflow-x-auto border-t border-[#e7e9ef] px-3 py-2.5">

                        <button className="whitespace-nowrap rounded-full border border-[#dfe2ea] bg-white px-2.5 py-1 text-[8px] text-slate-600">
                            สรุป
                        </button>

                        <button className="whitespace-nowrap rounded-full border border-[#dfe2ea] bg-white px-2.5 py-1 text-[8px] text-slate-600">
                            ค้นหาการวินิจฉัย
                        </button>

                        <button className="whitespace-nowrap rounded-full border border-[#dfe2ea] bg-white px-2.5 py-1 text-[8px] text-slate-600">
                            แนะนำ ICD
                        </button>
                    </div>
                    <div className="shrink-0 border-t border-[#e1e4eb] p-3">

                        <div className="flex items-center gap-2 rounded-xl border border-[#d9c9ff] bg-[#faf8ff] px-3 py-2">

                            <input
                                className="min-w-0 flex-1 bg-transparent text-[9px] outline-none placeholder:text-slate-400"
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
                </aside>
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
        </>
    );
}

function CodeRow({ label, code, description }) {
    return (
        <div className="min-w-0 rounded-xl border border-[#e3e5ee] bg-white p-2 shadow-sm">

            <div className="mb-1 flex items-center justify-between">
                <span className="text-[8px] font-semibold text-slate-400">
                    {label}
                </span>

                <button
                    type="button"
                    className="text-[8px] text-[#6178df] hover:underline"
                >
                    ↻
                </button>
            </div>

            <div className="min-w-0">
                <p className="truncate text-[11px] font-bold text-slate-700">
                    {code}
                </p>

                <p className="mt-0.5 truncate text-[7px] text-slate-400">
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
                className={`max-w-[82%] rounded-2xl px-3 py-2 text-[9px] leading-4 shadow-sm ${bot
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
function VitalInput({ label, value = "" }) {
    return (
        <div>
            <label className="mb-1 block text-[8px] font-medium text-slate-500">
                {label}
            </label>

            <input
                defaultValue={value}
                className="h-7 w-full rounded-md border border-[#dfe2e9] bg-white px-2 text-[9px] outline-none transition focus:border-[#6680ef] focus:ring-1 focus:ring-[#e7ecff]"
            />
        </div>
    );
}
function ClinicalTextBox({ title, text }) {
    return (
        <div className="rounded-lg border border-[#dfe2e9] bg-white">

            <div className="flex items-center justify-between border-b border-[#edf0f4] px-3 py-2">

                <p className="text-[9px] font-semibold text-slate-700">
                    {title}
                </p>

                <div className="flex items-center gap-2">
                    <Edit3
                        size={11}
                        className="cursor-pointer text-slate-400 hover:text-blue-500"
                    />

                    <Copy
                        size={11}
                        className="cursor-pointer text-slate-400 hover:text-blue-500"
                    />
                </div>
            </div>

            <div className="min-h-[65px] px-3 py-2.5 text-[9px] leading-5 text-slate-600">
                {text}
            </div>
        </div>
    );
}
function AssessmentQuestion({
    number,
    text,
    type = "select",
}) {
    return (
        <div className="grid grid-cols-[1fr_170px_55px] items-center gap-3 border-b border-[#edf0f4] py-2.5">

            <div className="text-[9px] leading-4 text-slate-700">
                <span className="mr-1 font-medium">
                    {number}.
                </span>

                {text}
            </div>

            {type === "select" ? (
                <select className="h-7 rounded-md border border-[#dfe2e9] bg-white px-2 text-[8px] text-slate-500 outline-none focus:border-[#6680ef]">
                    <option>
                        เลือกคำตอบ
                    </option>

                    <option>
                        ใช่
                    </option>

                    <option>
                        ไม่ใช่
                    </option>
                </select>
            ) : (
                <div className="flex items-center gap-3">

                    <label className="flex items-center gap-1 text-[8px] text-slate-600">
                        <input
                            type="radio"
                            name={`question-${number}`}
                            className="accent-[#526df5]"
                        />
                        ใช่
                    </label>

                    <label className="flex items-center gap-1 text-[8px] text-slate-600">
                        <input
                            type="radio"
                            name={`question-${number}`}
                            className="accent-[#526df5]"
                        />
                        ไม่ใช่
                    </label>
                </div>
            )}

            <span className="text-right text-[9px] font-semibold text-[#176de0]">
                5 คะแนน
            </span>
        </div>
    );
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
            <div className="mb-1 text-[12px] ">
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