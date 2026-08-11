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
    Pause,
    Play,
    RotateCcw,
    RotateCw,
    Search,
    Send,
    Settings2,
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
    const [waveOffset, setWaveOffset] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.75);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [treatmentTitle, setTreatmentTitle] = useState("หัวข้อการสนทนา");
    // const [audioWaveform, setAudioWaveform] = useState([]);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);
    const fileInputRef = useRef(null);
    const audioRef = useRef(null);
    const waveformContainerRef = useRef(null);
    const animationFrameRef = useRef(null);
    const mediaStreamRef = useRef(null);


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

            mediaRecorder.onstop = () => {
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

                setAudioFile(file);
                setAudioUrl(url);

                clearInterval(timerRef.current);
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
    const getAudioDuration = (url) => {
        return new Promise((resolve) => {
            const audio = new Audio();

            audio.onloadedmetadata = () => {
                resolve(audio.duration);
                URL.revokeObjectURL(url);
            };

            audio.onerror = () => {
                resolve(0);
                URL.revokeObjectURL(url);
            };

            audio.src = url;
        });
    };
    const handleAudioUpload = (event) => {
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
    const audioWaveform = useMemo(() => {
        return Array.from({ length: 150 }, () => {
            return Math.floor(Math.random() * 35) + 5;
        });
    }, [audioUrl]);

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
        <section className="flex h-[calc(100vh-140px)] min-h-0 overflow-hidden rounded-xl border border-[#edf0f5] bg-card text-slate-700">
            <aside className="flex w-[300px] shrink-0 flex-col border-r border-[#dfe3eb] bg-[#F0F3FF]">
                <div className="border-b border-[#dfe3eb] px-3 py-3">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-[15px] font-semibold text-slate-800">
                            คลังไฟล์เสียง
                        </h2>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={handleAudioUpload}
                    />

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-white shadow-sm transition hover:bg-[#0059bd]"
                    >
                        <Upload size={16} />
                        อัปโหลดไฟล์เสียง
                    </button>

                    <div className="mt-3 rounded-xl border border-[#dce1eb] bg-white px-3 py-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="flex h-[30px] w-[30px] shrink-0 cursor-pointer items-center justify-center rounded-full ring-1 ring-red-500"
                                        onClick={() => {
                                            if (isRecording) {
                                                stopRecording();
                                            } else {
                                                startRecording();
                                            }
                                        }}
                                    >
                                        {isRecording ? (
                                            <Square
                                                width={18}
                                                height={18}
                                                strokeWidth={2}
                                                className="block shrink-0 fill-red-500 text-red-500"
                                            />
                                        ) : (
                                            <div className="h-[18px] w-[18px] rounded-full bg-red-500" />
                                        )}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={togglePauseRecording}
                                    disabled={!isRecording}
                                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-slate-200 bg-white disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    {isPaused ? (
                                        <Play size={20} fill="currentColor" />
                                    ) : (
                                        <Pause size={20} fill="currentColor" />
                                    )}
                                </button>
                            </div>

                            <span className="font-mono text-xs text-slate-500">
                                {formatTime(recordingTime)}
                            </span>
                        </div>

                        {isRecording && (
                            <div className="mt-2 border-t border-slate-100 pt-2">
                                <div
                                    ref={waveformContainerRef}
                                    className="h-[48px] w-full overflow-hidden"
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
                    </div>
                </div>

                {/* Search */}
                <div className="px-3 pt-3">
                    <div className="flex h-9 items-center gap-2 rounded-lg border border-[#d7dce7] bg-white px-2.5">
                        <Search size={15} className="text-slate-400" />
                        <input
                            className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
                            placeholder="ค้นหาไฟล์เสียง..."
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-3">
                    <div className="space-y-2.5">
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
                                            active: item.id === file.id,
                                        }))
                                    );
                                }}
                                className={`relative cursor-pointer rounded-xl border p-3 transition ${file.active
                                        ? "border-[#0066dd] bg-[#eaf3ff] shadow-sm"
                                        : "border-[#d9deea] bg-white hover:border-blue-300"
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="truncate text-[13px] font-medium text-slate-800">
                                            {file.title}
                                        </p>

                                        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500">
                                            <Clock3 size={11} />

                                            <span>{file.time}</span>

                                            <span>•</span>

                                            <span>{file.status}</span>
                                        </div>
                                    </div>

                                    {file.processing ? (
                                        <LoaderCircle
                                            size={20}
                                            className="animate-spin text-blue-500"
                                        />
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                            }}
                                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-500 text-white hover:bg-red-600"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>
            <main className="flex min-w-0 flex-1 flex-col bg-white">
                <header className="flex h-[48px] shrink-0 items-center justify-between border-b border-[#e5e8ef] px-3">
                    <div className="flex items-center gap-2">
                        {isEditingTitle ? (
                            <input
                                autoFocus
                                value={treatmentTitle}
                                onChange={(e) => setTreatmentTitle(e.target.value)}
                                onBlur={() => setIsEditingTitle(false)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        setIsEditingTitle(false);
                                    }

                                    if (e.key === "Escape") {
                                        setIsEditingTitle(false);
                                    }
                                }}
                                className="h-8 w-auto min-w-[180px] rounded-md border border-blue-400 px-2 text-[17px] font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-100"
                            />
                        ) : (
                            <h1 className="text-[17px] font-bold text-slate-800">
                                {treatmentTitle}
                            </h1>
                        )}

                        <button
                            type="button"
                            onClick={() => setIsEditingTitle(true)}
                            className="text-slate-500 hover:text-slate-800"
                        >
                            <Edit3 size={14} />
                        </button>
                    </div>
                </header>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                    <div className="space-y-5">
                        {transcript.map((item) => (
                            <div key={item.id} className="group">
                                {/* Speaker */}
                                <div className="mb-2 flex items-center gap-2">
                                    <div
                                        className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold ${item.doctor
                                            ? "bg-[#dce8ff] text-[#3266c4]"
                                            : "bg-[#e8ebf1] text-slate-500"
                                            }`}
                                    >
                                        {item.doctor ? "นพ." : "คล."}
                                    </div>

                                    <span className="text-xs font-semibold text-slate-700">
                                        {item.name}
                                    </span>

                                    <span className="text-[10px] text-slate-400">
                                        {item.time}
                                    </span>
                                </div>

                                <div
                                    className={`relative rounded-xl border px-4 py-3 text-[12px] leading-6 ${item.doctor
                                        ? "border-[#d9dce7] bg-white"
                                        : "border-[#0666df] bg-[#f8fbff] shadow-sm"
                                        }`}
                                >
                                    {item.id === 2 && (
                                        <span className="absolute -left-1.5 top-5 h-3 w-3 rotate-45 border-l border-b border-[#0666df] bg-[#f8fbff]" />
                                    )}

                                    <p>{item.text}</p>
                                </div>

                                {/* Action */}
                                <div className="mt-1 flex justify-end gap-3 opacity-0 transition group-hover:opacity-100">
                                    <button
                                        type="button"
                                        className="text-slate-500 hover:text-blue-600"
                                    >
                                        <Edit3 size={14} />
                                    </button>

                                    <button
                                        type="button"
                                        className="text-slate-500 hover:text-blue-600"
                                    >
                                        <Copy size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="shrink-0 border-t border-[#e1e4eb] bg-white px-5 py-2">
                    <div
                        className="relative flex h-[48px] w-full cursor-pointer items-center justify-center overflow-hidden"
                        onClick={(e) => {
                            if (!audioRef.current || !duration) return;

                            const rect = e.currentTarget.getBoundingClientRect();

                            const percent = Math.min(
                                1,
                                Math.max(0, (e.clientX - rect.left) / rect.width)
                            );

                            audioRef.current.currentTime = percent * duration;

                            setCurrentTime(audioRef.current.currentTime);
                        }}
                    >
                        <div className="absolute inset-0 flex items-center justify-center gap-[2px]">
                            {audioWaveform.map((height, index) => (
                                <span
                                    key={index}
                                    className="w-[2px] shrink-0 rounded-full bg-[#f1dafa]"
                                    style={{
                                        height: `${height}px`,
                                    }}
                                />
                            ))}
                        </div>

                        <div
                            className="pointer-events-none absolute inset-0 flex items-center justify-center gap-[2px]"
                            style={{
                                clipPath: `inset(0 ${100 -
                                    (duration > 0
                                        ? (currentTime / duration) * 100
                                        : 0)
                                    }% 0 0)`,
                            }}
                        >
                            {audioWaveform.map((height, index) => (
                                <span
                                    key={index}
                                    className="w-[2px] shrink-0 rounded-full bg-[#0878ed]"
                                    style={{
                                        height: `${height}px`,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-3 pt-5">
                        {audioUrl && (
                            <audio
                                ref={audioRef}
                                src={audioUrl}
                                preload="metadata"
                                className="hidden"
                                onLoadedMetadata={(e) => {
                                    const audio = e.currentTarget;
                                    const duration = audio.duration;

                                    console.log("Audio duration:", duration);
                                    console.log("Audio file:", audioFile);

                                    if (!Number.isFinite(duration)) {
                                        return;
                                    }

                                    setDuration(duration);

                                    // อัปเดตไฟล์ล่าสุด
                                    setAudioFiles((prev) =>
                                        prev.map((item) => {
                                            // หาไฟล์ที่กำลัง active
                                            if (item.active && item.url === audioUrl) {
                                                return {
                                                    ...item,
                                                    time: formatTime(duration),
                                                    status: "พร้อมเล่น",
                                                    processing: false,
                                                };
                                            }

                                            return item;
                                        })
                                    );
                                }}
                                onError={(e) => {
                                    console.error("Audio load error:", e.currentTarget.error);
                                }}
                            />
                        )}
                        <span className="w-10 text-[9px] text-blue-500">    {formatTime(currentTime)}</span>

                        <div className="mx-auto flex items-center justify-center gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    if (!audioRef.current) return;

                                    audioRef.current.currentTime = Math.max(
                                        0,
                                        audioRef.current.currentTime - 10
                                    );
                                }}
                                className="cursor-pointer flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                            >
                                <RotateCcw size={17} />
                            </button>

                            <button
                                type="button"
                                onClick={handlePlayPause}
                                className="cursor-pointer flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#67b9ff] to-[#d85be9] text-white shadow-md"
                            >
                                {isPlaying ? (
                                    <Pause size={17} fill="currentColor" />
                                ) : (
                                    <Play size={17} fill="currentColor" />
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    if (!audioRef.current) return;

                                    audioRef.current.currentTime = Math.min(
                                        audioRef.current.duration || 0,
                                        audioRef.current.currentTime + 10
                                    );
                                }}
                                className="cursor-pointer flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                            >
                                <RotateCw size={17} />
                            </button>
                        </div>
                        <div className="ml-auto flex shrink-0 items-center gap-2">
                            <button
                                type="button"
                                onClick={handlePlaybackRate}
                                className="cursor-pointer rounded-md bg-[#eef1fa] px-2 py-1 text-[10px] text-slate-600 hover:bg-[#e3e7f5]"
                            >
                                {playbackRate}x
                            </button>

                            <Volume2 size={15} className="text-slate-500" />


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
                                className="cursor-pointer h-1 w-24 accent-[#3378e8]"
                            />
                        </div>
                        <span className="text-[9px] text-slate-500">{formatTime(duration)}</span>
                    </div>
                </div>
            </main>
            <aside className="flex w-[324px] shrink-0 flex-col border-l border-[#dfe3eb] bg-white">
                <div className="flex h-[47px] items-center justify-center gap-2  text-sm font-semibold text-white">
                    <Link to="/result-page">
                        <button
                            type="button"
                            onClick={() => navigate("/result-page")}
                            className="cursor-pointer flex h-8 w-70 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d943ed] to-[#365af0] text-sm font-medium text-white shadow-sm "
                        >
                            <FileAudio size={16} />
                            สรุปผลการประเมิน
                        </button>
                    </Link>

                </div>


                <div className="border-b border-[#d9dce5]">
                    <div className="flex items-center gap-2 bg-[#f5eaff] px-3 py-2.5 text-[13px] font-semibold text-slate-700">
                        <Bot size={17} className="text-[#8c46d9]" />
                        สรุปทางคลินิกโดย ICD 10 / ICD 9 / DRG
                    </div>

                    <div className="space-y-3 p-3">
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

                        <CodeRow label="DRG" code="-" description="-" />
                    </div>

                    <div className="pb-3 text-center text-[10px] text-slate-400">
                        คุณยังไม่ได้วิเคราะห์
                    </div>
                </div>

                <div className="flex min-h-0 flex-1 flex-col">
                    <div className="flex items-center gap-2 bg-[#f5eaff] px-3 py-2.5 text-[13px] font-semibold text-slate-700">
                        <Bot size={17} className="text-[#8c46d9]" />
                        สรุปทางคลินิกโดย AI
                    </div>

                    {/* Chat */}
                    <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
                        <div className="space-y-3">
                            <ChatBubble
                                bot
                                text="สวัสดี อยากให้ฉันช่วยอะไร?"
                            />

                            <ChatBubble
                                text="ช่วยสรุปการรักษาของคนไข้นี้หน่อย แบบเป็นกันเอง"
                            />

                            <div className="ml-8 rounded-xl bg-gradient-to-br from-[#f2e4ff] to-[#f6d4fb] p-3 text-[11px] leading-5 text-slate-700">
                                <p className="mb-2 font-bold">อาการสำคัญ</p>
                                <p>
                                    รู้สึกอ่อนเพลียมากขึ้น
                                    <br />
                                    อาการเป็นช่วงบ่าย
                                    <br />
                                    หลังรับประทานอาหาร
                                </p>

                                <p className="mb-2 mt-3 font-bold">ระยะเวลา</p>
                                <p>ผู้ป่วยระบุว่า “ช่วงนี้”</p>

                                <p className="mb-2 mt-3 font-bold">ความกังวลของผู้ป่วย</p>
                                <p>
                                    สงสัยว่าอาการเกี่ยวข้องกับโรคเบาหวานที่เคยพูดคุยกับแพทย์
                                </p>

                                <p className="mb-2 mt-3 font-bold">
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
                    </div>

                    {/* Suggested buttons */}
                    <div className="flex gap-1.5 overflow-x-auto px-3 pb-2 pt-2">
                        <button className="whitespace-nowrap rounded-full border bg-white px-3 py-1 text-[9px] text-slate-600">
                            สรุป
                        </button>

                        <button className="whitespace-nowrap rounded-full border bg-white px-3 py-1 text-[9px] text-slate-600">
                            ค้นหาการวินิจฉัย
                        </button>

                        <button className="whitespace-nowrap rounded-full border bg-white px-3 py-1 text-[9px] text-slate-600">
                            แนะนำ ICD
                        </button>
                    </div>

                    {/* Chat input */}
                    <div className="border-t border-[#e1e4eb] p-3">
                        <div className="flex items-center gap-2 rounded-xl border border-[#d9c9ff] bg-[#faf8ff] px-3 py-2 shadow-sm">
                            <input
                                className="min-w-0 flex-1 bg-transparent text-[11px] outline-none placeholder:text-slate-400"
                                placeholder="สอบถาม AI / เกี่ยวกับการปรึกษานี้..."
                            />

                            <button
                                type="button"
                                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#9149df] text-white"
                            >
                                <Send size={12} />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </section>
    );
}

function CodeRow({ label, code, description }) {
    return (
        <div>
            <div className="mb-1 flex items-center justify-between">
                <span className="text-[10px] font-medium text-slate-500">
                    {label}
                </span>

                <button
                    type="button"
                    className="text-[9px] text-blue-500 hover:underline"
                >
                    ↻ วิเคราะห์ใหม่
                </button>
            </div>

            <div className="flex min-h-[34px] items-center gap-2 rounded-md border border-[#d7dce7] bg-white px-2.5">
                <span className="font-semibold text-[11px] text-slate-700">
                    {code}
                </span>

                <span className="text-[10px] text-slate-500">
                    {description}
                </span>
            </div>
        </div>
    );
}

function ChatBubble({ text, bot = false }) {
    return (
        <div
            className={`flex items-start gap-2 ${bot ? "" : "justify-end"
                }`}
        >
            {bot && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8d48b9] to-[#2c72e7] text-white">
                    <Bot size={14} />
                </div>
            )}

            <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-[10px] leading-4 ${bot
                    ? "bg-gradient-to-r from-[#e7d8ff] to-[#f4c9f8] text-slate-700"
                    : "bg-[#eaf2ff] text-slate-700"
                    }`}
            >
                {text}
            </div>

            {!bot && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200">
                    <UserRound size={13} className="text-slate-500" />
                </div>
            )}
        </div>
    );
}