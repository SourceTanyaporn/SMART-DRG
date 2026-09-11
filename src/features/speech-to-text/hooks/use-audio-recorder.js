import { useState, useRef, useEffect, useMemo } from "react";
import { TranscribeService } from "@/api/transcribe-service.js";
import { toast } from "@/components/ui/toast-notification";

export function useAudioRecorder({ selectedPatient, noteText } = {}) {
    const [audioFiles, setAudioFiles] = useState([]);
    const [audioSortOrder, setAudioSortOrder] = useState("desc"); // "desc": ใหม่ไปเก่า, "asc": เก่าไปใหม่
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
    const [editingAudioName, setEditingAudioName] = useState("");
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [transcriptionProgress, setTranscriptionProgress] = useState(0);
    const [transcript, setTranscript] = useState([]);

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

    // Animate visual recording waveform
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
        if (waveformContainerRef.current) {
            waveformContainerRef.current.scrollLeft =
                waveformContainerRef.current.scrollWidth;
        }
    }, [waveform]);

    useEffect(() => {
        if (!audioRef.current) return;
        audioRef.current.volume = volume;
        audioRef.current.playbackRate = playbackRate;
    }, [audioUrl, volume, playbackRate]);

    // รายการไฟล์เสียงที่ผ่านการค้นหาและเรียงลำดับ
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
            const result = await TranscribeService.getStatus(jobId);

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
                const transcriptionResult = result.result;
                const segments = transcriptionResult?.segments ?? [];

                const formattedTranscript = segments.map((segment, index) => {
                    const speaker = segment.speaker || "SPEAKER_00";
                    const isDoctor = speaker === "SPEAKER_01";

                    return {
                        id: segment.id ?? `${jobId}-${index}`,
                        name: isDoctor ? "แพทย์" : "ผู้ป่วย",
                        doctor: isDoctor,
                        speaker,
                        text: segment.text ?? "",
                        start: segment.start,
                        end: segment.end,
                        role: segment.role ?? null,
                    };
                });

                updateAudioFile(fileId, {
                    processing: false,
                    progress: 100,
                    status: "เสร็จสิ้น",
                    message: "แปลงเสียงและแยกผู้พูดเสร็จแล้ว",
                    transcript: result.result?.text ?? "",
                    rawText: result.result?.raw_text ?? "",
                    transcriptSegments: result.result?.segments ?? [],
                    speakers: result.result?.speakers ?? [],
                });

                setTranscript(formattedTranscript);
                setTranscriptionProgress(100);
                toast.success("แปลงเสียงสำเร็จ", "ถอดข้อความเสียงและระบุผู้พูดเรียบร้อยแล้ว");
                return;
            }

            if (result.status === "failed") {
                updateAudioFile(fileId, {
                    processing: false,
                    status: "เกิดข้อผิดพลาด",
                    message: result.error || "ไม่สามารถแปลงเสียงได้",
                });
                setIsTranscribing(false);
                toast.error("แปลงเสียงไม่สำเร็จ", result.error || "เกิดข้อผิดพลาดในการประมวลผลไฟล์เสียง");
                return;
            }

            setTranscriptionProgress(result.progress ?? 0);
            setTimeout(() => {
                pollTranscriptionStatus(fileId, jobId);
            }, 1000);

        } catch (error) {
            console.error("Polling transcription error:", error);
            updateAudioFile(fileId, {
                processing: false,
                status: "เกิดข้อผิดพลาด",
                message: "ไม่สามารถตรวจสอบสถานะได้",
            });
            setIsTranscribing(false);
        }
    };

    const transcribeAudio = async (fileItem, fileId) => {
        try {
            setIsTranscribing(true);
            setTranscriptionProgress(0);

            const result = await TranscribeService.transcribe(
                fileItem.file,
                "openai"
            );

            if (!result?.job_id) {
                throw new Error("ไม่พบ job_id จาก API");
            }

            await pollTranscriptionStatus(fileId, result.job_id);
            return result;
        } catch (error) {
            console.error("Transcription API error:", error);
            throw error;
        } finally {
            setIsTranscribing(false);
        }
    };

    const handleTranscribe = async (fileItem) => {
        if (!fileItem?.file) return;
        const fileId = fileItem.id;

        try {
            updateAudioFile(fileId, {
                processing: true,
                progress: 0,
                status: "กำลังส่งไฟล์",
                message: "กำลังส่งไฟล์...",
                jobId: null,
            });

            const job = await TranscribeService.transcribe(
                fileItem.file,
                "openai"
            );

            if (!job?.job_id) {
                throw new Error("ไม่พบ job_id จาก API");
            }

            updateAudioFile(fileId, {
                processing: true,
                progress: job.progress ?? 0,
                status: job.status ?? "queued",
                message: job.message ?? "รอประมวลผล",
                jobId: job.job_id,
            });

            pollTranscriptionStatus(fileId, job.job_id);
        } catch (error) {
            console.error("Transcription error:", error);
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

        const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
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
                    { type: "audio/webm" }
                );

                const url = URL.createObjectURL(audioBlob);
                const audio = new Audio(url);

                const duration = await new Promise((resolve) => {
                    audio.onloadedmetadata = () => resolve(audio.duration);
                    audio.onerror = () => resolve(0);
                });

                const title = getNextRecordingName(audioFilesRef.current);
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

                try {
                    await generateWaveform(file);
                    const response = await TranscribeService.transcribe(file);
                    const jobId = response.job_id;
                    if (!jobId) throw new Error("ไม่พบ job_id");
                    await pollTranscriptionStatus(newId, jobId);
                } catch (error) {
                    console.error("Audio processing error:", error);
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
            console.error("ไม่สามารถเข้าถึง microphone:", error);
            toast.error("ข้อผิดพลาดไมโครโฟน", "ไม่สามารถเข้าถึงไมโครโฟนได้ กรุณาตรวจสอบการอนุญาตใช้งานไมโครโฟน");
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
            mediaStreamRef.current.getTracks().forEach((track) => track.stop());
            mediaStreamRef.current = null;
        }

        setIsRecording(false);
        setIsPaused(false);

        clearInterval(timerRef.current);
        timerRef.current = null;
    };

    const handleSaveRecording = async () => {
        if (!recordingFileData) return;
        const { file, url, duration } = recordingFileData;

        const title =
            recordingName.trim() ||
            getNextRecordingName(audioFilesRef.current);

        const newId = Date.now();

        try {
            await generateWaveform(file);
            const text = await transcribeAudio(file);

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
                processing: true,
                progress: 0,
                message: "กำลังเตรียมไฟล์...",
                url,
                file,
            },
        ]);

        event.target.value = "";

        try {
            await generateWaveform(file);

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
                            status: "กำลังส่งไฟล์",
                            processing: true,
                            progress: 0,
                            message: "กำลังส่งไฟล์...",
                        }
                        : item
                )
            );

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
        const target = audioFiles.find((item) => item.id === id);
        if (!target) return;

        if (target.url) {
            URL.revokeObjectURL(target.url);
        }

        const remainingFiles = audioFiles.filter((item) => item.id !== id);
        const wasActive = target.active || audioUrl === target.url;

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        if (remainingFiles.length === 0) {
            setAudioFiles([]);
            setAudioFile(null);
            setAudioUrl("");
            setCurrentTime(0);
            setDuration(0);
            setIsPlaying(false);
            setAudioWaveform([]);
            setTranscript([]);
        } else if (wasActive) {
            const nextActive = remainingFiles[remainingFiles.length - 1];
            const updated = remainingFiles.map((item) => ({
                ...item,
                active: item.id === nextActive.id,
            }));

            setAudioFiles(updated);
            setAudioFile(nextActive.file || null);
            setAudioUrl(nextActive.url || "");
            setCurrentTime(0);
            setIsPlaying(false);

            if (nextActive.file) {
                generateWaveform(nextActive.file);
            } else {
                setAudioWaveform([]);
            }

            if (nextActive.transcriptSegments && nextActive.transcriptSegments.length > 0) {
                const formatted = nextActive.transcriptSegments.map((segment, index) => {
                    const isDoctor = segment.role === "doctor" || segment.speaker === "Doctor";
                    return {
                        id: index + 1,
                        speaker: segment.speaker || (isDoctor ? "Doctor" : "Patient"),
                        doctor: isDoctor,
                        text: segment.text,
                        role: segment.role ?? null,
                    };
                });
                setTranscript(formatted);
            } else if (nextActive.transcript || nextActive.rawText) {
                setTranscript([
                    {
                        id: Date.now(),
                        name: "ผู้ป่วย",
                        doctor: false,
                        text: nextActive.transcript || nextActive.rawText,
                    },
                ]);
            } else {
                setTranscript([]);
            }
        } else {
            setAudioFiles(remainingFiles);
        }

        toast.success("ลบไฟล์เสียงสำเร็จ", "ลบไฟล์เสียงและข้อความถอดเสียงเรียบร้อยแล้ว (ข้อมูลในฟอร์มยังคงเดิม)");
    };

    const formatTime = (time) => {
        if (!Number.isFinite(time)) return "00:00";
        const minutes = Math.floor(time / 60).toString().padStart(2, "0");
        const seconds = Math.floor(time % 60).toString().padStart(2, "0");
        return `${minutes}:${seconds}`;
    };

    const handlePlaybackRate = () => {
        const rates = [1, 1.25, 1.5, 2];
        const currentIndex = rates.indexOf(playbackRate);
        const nextRate = rates[(currentIndex + 1) % rates.length];
        setPlaybackRate(nextRate);
        if (audioRef.current) {
            audioRef.current.playbackRate = nextRate;
        }
    };

    const generateWaveform = async (file) => {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContext();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

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
            const rmsValues = [];

            for (let i = 0; i < samples; i++) {
                const start = i * blockSize;
                const end = i === samples - 1 ? length : start + blockSize;
                let sum = 0;
                for (let j = start; j < end; j++) {
                    sum += mixedData[j] * mixedData[j];
                }
                const rms = Math.sqrt(sum / Math.max(1, end - start));
                rmsValues.push(rms);
            }

            const maxRms = Math.max(...rmsValues);
            const wf = rmsValues.map((rms) => {
                const normalized = maxRms > 0 ? rms / maxRms : 0;
                const boosted = Math.pow(normalized, 0.5);
                return 3 + boosted * 37;
            });

            setAudioWaveform(wf);
            await audioContext.close();
        } catch (error) {
            console.error("Generate waveform error:", error);
            setAudioWaveform([]);
        }
    };

    const updateAudioProgress = () => {
        const audio = audioRef.current;
        if (!audio) return;
        setCurrentTime(audio.currentTime);
        if (!audio.paused && !audio.ended) {
            animationFrameRef.current = requestAnimationFrame(updateAudioProgress);
        }
    };

    const handlePlayPause = async () => {
        if (!audioRef.current || !audioUrl) return;
        try {
            const audio = audioRef.current;
            if (audio.paused) {
                await audio.play();
                setIsPlaying(true);
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = requestAnimationFrame(updateAudioProgress);
            } else {
                audio.pause();
                setIsPlaying(false);
                cancelAnimationFrame(animationFrameRef.current);
            }
        } catch (error) {
            console.error("Playback error:", error);
        }
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
    };

    const handleSeek = (e) => {
        const newTime = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
        }
        setCurrentTime(newTime);
    };

    const handleWaveformClick = (e) => {
        if (!audioRef.current || !duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        if (width <= 0) return;
        const percentage = Math.max(0, Math.min(1, clickX / width));
        const newTime = percentage * duration;
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleSelectAudioFile = (file) => {
        if (!file.url) return;

        audioRef.current?.pause();

        setAudioFile(file.file);
        setAudioUrl(file.url);
        setCurrentTime(0);
        setIsPlaying(false);

        if (file.file) {
            generateWaveform(file.file);
        }

        setAudioFiles((prev) =>
            prev.map((item) => ({
                ...item,
                active: item.id === file.id,
            }))
        );

        // Load transcript of the selected file
        if (file.transcriptSegments && file.transcriptSegments.length > 0) {
            const formatted = file.transcriptSegments.map((segment, index) => {
                const isDoctor = segment.role === "doctor" || segment.speaker === "Doctor";
                return {
                    id: index + 1,
                    speaker: segment.speaker || (isDoctor ? "Doctor" : "Patient"),
                    doctor: isDoctor,
                    text: segment.text,
                    role: segment.role ?? null,
                };
            });
            setTranscript(formatted);
        } else if (file.transcript || file.rawText) {
            setTranscript([
                {
                    id: Date.now(),
                    name: "ผู้ป่วย",
                    doctor: false,
                    text: file.transcript || file.rawText,
                },
            ]);
        } else {
            setTranscript([]);
        }
    };

    return {
        // Audio Files & Search
        audioFiles,
        setAudioFiles,
        audioSortOrder,
        setAudioSortOrder,
        audioSearchQuery,
        setAudioSearchQuery,
        filteredAndSortedAudioFiles,
        editingAudioId,
        editingAudioName,
        setEditingAudioName,
        startEditAudioName,
        saveAudioName,
        handleAudioUpload,
        handleDeleteAudio,
        handleSelectAudioFile,
        fileInputRef,

        // Recording State
        isRecording,
        isPaused,
        recordingTime,
        waveform,
        waveformContainerRef,
        isNameModalOpen,
        setIsNameModalOpen,
        recordingName,
        setRecordingName,
        startRecording,
        stopRecording,
        togglePauseRecording,
        handleSaveRecording,

        // Playback State
        audioFile,
        setAudioFile,
        audioUrl,
        setAudioUrl,
        currentTime,
        setCurrentTime,
        duration,
        setDuration,
        isPlaying,
        setIsPlaying,
        volume,
        playbackRate,
        audioWaveform,
        audioRef,
        handlePlayPause,
        handleVolumeChange,
        handleSeek,
        handleWaveformClick,
        handlePlaybackRate,
        formatTime,
        generateWaveform,
        updateAudioProgress,
        animationFrameRef,

        // Transcription & Dialogue
        isTranscribing,
        transcriptionProgress,
        transcript,
        setTranscript,
        treatmentTitle,
        setTreatmentTitle,
        isEditingTitle,
        setIsEditingTitle,
        hasExtractData,
    };
}
