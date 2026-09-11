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
import { useNavigate, useRouterState } from "@tanstack/react-router";
import {
    Activity,
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
    Sparkles,
    Square,
    Trash2,
    Upload,
    Volume2,
    X,
} from "lucide-react";
import { useAudioRecorder } from "./hooks/use-audio-recorder";
import { useClinicalForm, buildFormDataFromPatient } from "./hooks/use-clinical-form";
import { VitalsTab } from "./components/vitals-tab";
import { ChiefComplaintTab } from "./components/chief-complaint-tab";
import { AssessmentFormsTab } from "./components/assessment-forms-tab";
import { PatientSearchBanner } from "./components/patient-search-banner";
import { AiClinicalSummary } from "./components/ai-clinical-summary";
import { DrugAllergyAlert } from "./components/drug-allergy-alert";

export { buildFormDataFromPatient };

export function SpeechToTextPage() {
    const navigate = useNavigate();
    const routerState = useRouterState({ select: (s) => s.location });
    const isNew = routerState?.search?.mode === "new" || routerState?.search?.isNew === "true" || routerState?.search?.new === "true";
    const searchHn = routerState?.search?.hn;
    const searchPatientId = routerState?.search?.patientId || routerState?.search?.id;

    // Custom Hook 1: Clinical Form & Patient State
    const clinical = useClinicalForm({ isNew, searchHn, searchPatientId });

    // Custom Hook 2: Audio Recording & Transcription State
    const audio = useAudioRecorder({
        selectedPatient: clinical.selectedPatient,
        noteText: clinical.noteText,
    });

    // Drug Allergy & Clinical Safety Alert Detection
    const drugAllergyAlerts = clinical.getDrugAllergyAlerts(audio.transcript, audio.audioFiles);

    return (
        <div className="flex flex-col gap-2 h-full lg:h-[calc(100vh-5rem)] lg:max-h-[calc(100vh-5rem)] overflow-hidden">
            {/* Patient Search & Active Patient Info Banner */}
            <PatientSearchBanner
                selectedPatient={clinical.selectedPatient}
                onSelectPatient={clinical.handleSelectPatient}
            />

            {/* Drug Allergy & Clinical Safety Warning Alert */}
            {drugAllergyAlerts.length > 0 && (
                <DrugAllergyAlert
                    alerts={drugAllergyAlerts}
                    selectedPatient={clinical.selectedPatient}
                    onRemoveDrugFromPlan={clinical.handleRemoveDrugFromPlan}
                />
            )}

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
                {/* Column 1: Audio Management & Transcribed Text */}
                <div
                    className="
                        flex min-w-0 flex-col gap-2 overflow-hidden
                        h-auto lg:h-full lg:min-h-0
                    "
                >
                    {/* Audio Upload / Record Box */}
                    <section className="min-w-0 shrink-0 overflow-hidden rounded-xl border border-border bg-card p-3 shadow-2xs">
                        <input
                            ref={audio.fileInputRef}
                            type="file"
                            accept="audio/*"
                            className="hidden"
                            onChange={audio.handleAudioUpload}
                        />

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => audio.fileInputRef.current?.click()}
                                className="cursor-pointer flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-primary text-[12px] font-semibold text-white shadow-sm transition hover:brightness-110 active:scale-98"
                            >
                                <Upload size={14} />
                                อัปโหลดไฟล์เสียง
                            </button>

                            <div className="flex h-9 flex-1 items-center rounded-lg border border-border bg-card px-2">
                                <div className="flex w-full items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (audio.isRecording) {
                                                    audio.stopRecording();
                                                } else {
                                                    audio.startRecording();
                                                }
                                            }}
                                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-red-400 bg-card"
                                        >
                                            {audio.isRecording ? (
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
                                            onClick={audio.togglePauseRecording}
                                            disabled={!audio.isRecording}
                                            className="flex h-6 w-6 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground disabled:opacity-40 cursor-pointer"
                                        >
                                            {audio.isPaused ? (
                                                <Play size={11} fill="currentColor" />
                                            ) : (
                                                <Pause size={11} fill="currentColor" />
                                            )}
                                        </button>
                                    </div>

                                    <span className="font-mono text-[12px] text-muted-foreground">
                                        {audio.formatTime(audio.recordingTime)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {audio.isRecording && (
                            <div className="mt-2 rounded-lg bg-muted/50 px-3 py-2 border border-border">
                                <div
                                    ref={audio.waveformContainerRef}
                                    className="h-[35px] w-full overflow-hidden"
                                >
                                    <div className="flex h-full items-center gap-[2px]">
                                        {audio.waveform.map((height, index) => (
                                            <div
                                                key={index}
                                                className="w-[2px] shrink-0 rounded-full bg-red-400"
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
                            <div className="flex h-8 flex-1 min-w-0 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 shadow-2xs focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                                <Search
                                    size={13}
                                    className="text-muted-foreground shrink-0"
                                />

                                <input
                                    className="w-full min-w-0 bg-transparent text-[11.5px] outline-none placeholder:text-muted-foreground text-foreground"
                                    placeholder="ค้นหาไฟล์เสียง..."
                                    value={audio.audioSearchQuery}
                                    onChange={(e) => audio.setAudioSearchQuery(e.target.value)}
                                />

                                {audio.audioSearchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => audio.setAudioSearchQuery("")}
                                        className="text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                                        title="ล้างคำค้นหา"
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                            </div>

                            {/* Sort Toggle Button */}
                            <button
                                type="button"
                                onClick={() => audio.setAudioSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
                                className={`flex h-8 shrink-0 items-center gap-1 rounded-lg border px-2 text-[10.5px] font-semibold transition cursor-pointer shadow-2xs ${audio.audioSortOrder === "desc"
                                    ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                                    : "bg-muted border-border text-foreground hover:bg-muted/80"
                                    }`}
                                title={
                                    audio.audioSortOrder === "desc"
                                        ? "กำลังเรียง: ไฟล์ใหม่ไปเก่า (คลิกเพื่อเปลี่ยนเป็น เก่าไปใหม่)"
                                        : "กำลังเรียง: ไฟล์เก่าไปใหม่ (คลิกเพื่อเปลี่ยนเป็น ใหม่ไปเก่า)"
                                }
                            >
                                <ArrowUpDown
                                    size={12}
                                    className={audio.audioSortOrder === "desc" ? "text-primary" : "text-muted-foreground"}
                                />
                                <span className="whitespace-nowrap">
                                    {audio.audioSortOrder === "desc" ? "ใหม่ → เก่า" : "เก่า → ใหม่"}
                                </span>
                            </button>
                        </div>

                        {/* Audio Files List */}
                        <div className="max-h-[160px] md:max-h-[180px] overflow-y-auto pt-2 pr-1 scrollbar-thin scrollbar-thumb-muted-foreground/20">
                            {audio.filteredAndSortedAudioFiles.length > 0 ? (
                                <div className="space-y-1.5">
                                    {audio.filteredAndSortedAudioFiles.map((file) => (
                                        <div
                                            key={file.id}
                                            onClick={() => audio.handleSelectAudioFile(file)}
                                            className={`relative cursor-pointer rounded-xl border p-2.5 transition-all duration-200 ${file.processing
                                                ? "border-primary/40 bg-primary/5"
                                                : file.active
                                                    ? "border-primary bg-primary/10 shadow-xs"
                                                    : "border-border bg-card hover:border-primary/40 hover:bg-muted/40"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <span
                                                            className={`h-2 w-2 shrink-0 rounded-full ${file.processing
                                                                ? "bg-amber-500 animate-ping"
                                                                : file.active
                                                                    ? "bg-primary"
                                                                    : "bg-muted-foreground/40"
                                                                }`}
                                                        />

                                                        <div className="flex min-w-0 items-center gap-1">
                                                            {audio.editingAudioId === file.id ? (
                                                                <input
                                                                    autoFocus
                                                                    value={audio.editingAudioName}
                                                                    onChange={(e) =>
                                                                        audio.setEditingAudioName(e.target.value)
                                                                    }
                                                                    onBlur={() => audio.saveAudioName(file.id)}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === "Enter") {
                                                                            audio.saveAudioName(file.id);
                                                                        }
                                                                        if (e.key === "Escape") {
                                                                            audio.setEditingAudioId(null);
                                                                            audio.setEditingAudioName("");
                                                                        }
                                                                    }}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="h-6 min-w-0 flex-1 rounded border border-primary bg-card px-1.5 text-[12px] font-medium text-foreground outline-none"
                                                                />
                                                            ) : (
                                                                <>
                                                                    <p className="truncate text-[12px] font-semibold text-foreground">
                                                                        {file.title}
                                                                    </p>

                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            audio.startEditAudioName(file);
                                                                        }}
                                                                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-primary cursor-pointer"
                                                                    >
                                                                        <Edit3 size={11} />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                                        <Clock3 size={10} />
                                                        <span>{file.time}</span>
                                                        <span>•</span>
                                                        <span
                                                            className={`font-medium ${file.status === "เสร็จสิ้น"
                                                                ? "text-emerald-500 font-semibold"
                                                                : file.status?.includes("ข้อผิดพลาด") || file.status?.includes("ไม่สำเร็จ")
                                                                    ? "text-red-500"
                                                                    : file.processing
                                                                        ? "text-primary font-medium"
                                                                        : "text-muted-foreground"
                                                                }`}
                                                        >
                                                            {file.status}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center shrink-0">
                                                    {!file.processing && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                audio.handleDeleteAudio(file.id);
                                                            }}
                                                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-red-500/90 text-white hover:bg-red-600 transition cursor-pointer"
                                                            title="ลบไฟล์เสียง"
                                                        >
                                                            <Trash2 size={11} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Full-width Progress Bar when Processing */}
                                            {file.processing && (
                                                <div className="mt-2 pt-2 border-t border-border">
                                                    <div className="mb-1 flex items-center justify-between gap-2 text-[10px]">
                                                        <span className="truncate font-medium text-muted-foreground">
                                                            {file.message || "กำลังประมวลผล..."}
                                                        </span>
                                                        <span className="shrink-0 font-bold text-primary">
                                                            {file.progress ?? 0}%
                                                        </span>
                                                    </div>
                                                    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                                        <div
                                                            className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-500"
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
                            ) : audio.audioFiles.length > 0 ? (
                                <div className="flex h-20 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-2 text-center">
                                    <p className="text-[11px] font-medium text-muted-foreground">
                                        ไม่พบไฟล์เสียงที่ค้นหา
                                    </p>
                                    <p className="mt-0.5 text-[10px] text-muted-foreground/80">
                                        ลองค้นหาด้วยคำอื่น หรือกดล้างการค้นหา
                                    </p>
                                </div>
                            ) : (
                                <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-border bg-card">
                                    <p className="text-[12px] text-muted-foreground">
                                        ยังไม่มีไฟล์เสียง
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Transcribed Text Section */}
                    <section className="min-h-0 flex-1 flex flex-col overflow-hidden">
                        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
                            <div className="flex shrink-0 items-center justify-end border-b border-border px-3 py-2 bg-primary/5">

                                <div className="flex items-center gap-2 text-[12px] text-muted-foreground shrink-0">
                                    <div className="flex items-center gap-1">
                                        <Clock3 size={10} />
                                        <span>ระยะเวลา {audio.formatTime(audio.duration)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2.5 scrollbar-thin scrollbar-thumb-muted-foreground/20">
                                {audio.transcript && audio.transcript.length > 0 ? (
                                    <div className="space-y-3">
                                        {audio.transcript.map((item) => {
                                            const isDoc = item.doctor ?? false;

                                            return (
                                                <div key={item.id}>
                                                    <div className="mb-1.5 flex items-center gap-2">
                                                        <div
                                                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${isDoc
                                                                ? "bg-primary/20 text-primary border border-primary/30"
                                                                : "bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30"
                                                                }`}
                                                        >
                                                            {isDoc ? "แพทย์" : "ผู้ป่วย"}
                                                        </div>

                                                        <div>
                                                            <p className="text-[12px] font-semibold text-foreground">
                                                                {isDoc && clinical.selectedPatient?.doctor
                                                                    ? clinical.selectedPatient.doctor
                                                                    : !isDoc && clinical.selectedPatient?.fullName
                                                                        ? clinical.selectedPatient.fullName
                                                                        : (item.name || (isDoc ? "แพทย์" : "ผู้ป่วย"))}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="rounded-xl border border-border bg-card/90 px-3 py-2 text-[12px] leading-[1.7] text-foreground/90 break-words shadow-2xs">
                                                        {item.text}
                                                    </div>

                                                    {isDoc && (
                                                        <div className="mt-1 flex justify-end gap-2">
                                                            <Edit3
                                                                size={11}
                                                                className="cursor-pointer text-muted-foreground hover:text-foreground"
                                                            />
                                                            <Copy
                                                                size={11}
                                                                className="cursor-pointer text-muted-foreground hover:text-foreground"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex h-full min-h-[160px] flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/15 p-4 text-center">
                                        <p className="text-[12.5px] font-semibold text-foreground">
                                            ยังไม่มีข้อความเสียง
                                        </p>
                                        <p className="mt-1 text-[11px] text-muted-foreground max-w-xs leading-relaxed">
                                            กรุณาอัปโหลดไฟล์เสียงหรือกดบันทึกเสียงเพื่อเริ่มแปลงข้อความ
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Audio Player Footer Section */}
                    <section className="shrink-0 rounded-xl border border-border bg-card px-3 py-2 shadow-2xs">
                        <div
                            className="mb-2 flex h-[38px] w-full cursor-pointer items-center gap-[1px] overflow-hidden"
                            onClick={audio.handleWaveformClick}
                        >
                            <audio
                                ref={audio.audioRef}
                                src={audio.audioUrl || undefined}
                                preload="metadata"
                                onLoadedMetadata={(e) => {
                                    audio.setDuration(e.currentTarget.duration);
                                }}
                                onPlay={() => {
                                    audio.setIsPlaying(true);
                                    cancelAnimationFrame(audio.animationFrameRef.current);
                                    audio.animationFrameRef.current = requestAnimationFrame(audio.updateAudioProgress);
                                }}
                                onPause={() => {
                                    audio.setIsPlaying(false);
                                    cancelAnimationFrame(audio.animationFrameRef.current);
                                }}
                                onEnded={() => {
                                    audio.setIsPlaying(false);
                                    cancelAnimationFrame(audio.animationFrameRef.current);
                                    audio.setCurrentTime(0);
                                    if (audio.audioRef.current) {
                                        audio.audioRef.current.currentTime = 0;
                                    }
                                }}
                            />

                            {audio.audioWaveform.length > 0 &&
                                audio.audioWaveform.map((height, index) => {
                                    const barProgress = (index + 0.5) / audio.audioWaveform.length;
                                    const playedProgress = audio.duration > 0 ? audio.currentTime / audio.duration : 0;
                                    const isPlayed = barProgress <= playedProgress;

                                    return (
                                        <span
                                            key={index}
                                            className={`min-w-0 flex-1 rounded-full transition-colors duration-75 ${isPlayed
                                                ? "bg-primary"
                                                : "bg-slate-300 dark:bg-slate-700/80 hover:bg-slate-400 dark:hover:bg-slate-600"
                                                }`}
                                            style={{
                                                height: `${height}px`,
                                            }}
                                        />
                                    );
                                })}
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-center gap-4">
                            <button
                                type="button"
                                onClick={audio.handlePlaybackRate}
                                className="min-w-[28px] text-[11px] font-medium text-foreground hover:text-primary cursor-pointer"
                                title="เปลี่ยนความเร็วการเล่น"
                            >
                                {audio.playbackRate}x
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    if (audio.audioRef.current) {
                                        const newTime = Math.max(0, audio.audioRef.current.currentTime - 5);
                                        audio.audioRef.current.currentTime = newTime;
                                        audio.setCurrentTime(newTime);
                                    }
                                }}
                                className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                                title="ย้อนหลัง 5 วินาที"
                            >
                                <RotateCcw size={14} />
                            </button>

                            <button
                                type="button"
                                onClick={audio.handlePlayPause}
                                disabled={!audio.audioUrl}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-md disabled:opacity-40 cursor-pointer hover:brightness-110 active:scale-98"
                            >
                                {audio.isPlaying ? (
                                    <Pause size={15} fill="currentColor" />
                                ) : (
                                    <Play size={15} fill="currentColor" />
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    if (audio.audioRef.current) {
                                        const newTime = Math.min(audio.duration || 0, audio.audioRef.current.currentTime + 5);
                                        audio.audioRef.current.currentTime = newTime;
                                        audio.setCurrentTime(newTime);
                                    }
                                }}
                                className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                                title="ไปข้างหน้า 5 วินาที"
                            >
                                <RotateCw size={14} />
                            </button>

                            <span className="min-w-[36px] text-[11px] font-medium text-foreground font-mono">
                                {audio.formatTime(audio.currentTime)}
                            </span>
                        </div>

                        {/* Volume */}
                        <div className="mt-2 flex items-center justify-center gap-1.5">
                            <Volume2 size={13} className="text-muted-foreground" />
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={audio.volume}
                                onChange={audio.handleVolumeChange}
                                className="h-1 w-24 cursor-pointer accent-primary"
                            />
                        </div>
                    </section>
                </div>

                {/* Column 2: 3-Tab Clinical Form (Vitals, Chief Complaint, Assessments) */}
                <div
                    className="
                        flex min-w-0 flex-col gap-2 overflow-hidden
                        h-auto lg:h-full lg:min-h-0
                    "
                >
                    <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
                        <header className="flex h-11 sm:h-12 shrink-0 items-center justify-between rounded-t-xl border-b border-border bg-primary/5 px-2 sm:px-3">
                            <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none min-w-0 py-0.5">
                                <button
                                    type="button"
                                    onClick={() => clinical.setActiveStep(0)}
                                    className={`flex shrink-0 whitespace-nowrap items-center gap-1 sm:gap-1.5 rounded-lg px-2 sm:px-2.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold transition cursor-pointer ${clinical.activeStep === 0
                                        ? "bg-card text-primary shadow-xs border border-primary/30 ring-1 ring-primary/20"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        }`}
                                >
                                    <Activity size={13} className={clinical.activeStep === 0 ? "text-primary" : "text-muted-foreground"} />
                                    <span>Vitalsign</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => clinical.setActiveStep(1)}
                                    className={`flex shrink-0 whitespace-nowrap items-center gap-1 sm:gap-1.5 rounded-lg px-2 sm:px-2.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold transition cursor-pointer ${clinical.activeStep === 1
                                        ? "bg-card text-primary shadow-xs border border-primary/30 ring-1 ring-primary/20"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        }`}
                                >
                                    <Edit3 size={13} className={clinical.activeStep === 1 ? "text-primary" : "text-muted-foreground"} />
                                    <span>อาการสำคัญ</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => clinical.setActiveStep(2)}
                                    className={`flex shrink-0 whitespace-nowrap items-center gap-1 sm:gap-1.5 rounded-lg px-2 sm:px-2.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold transition cursor-pointer ${clinical.activeStep === 2
                                        ? "bg-card text-primary shadow-xs border border-primary/30 ring-1 ring-primary/20"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        }`}
                                >
                                    <ClipboardCheck size={13} className={clinical.activeStep === 2 ? "text-primary" : "text-muted-foreground"} />
                                    <span>แบบประเมิน</span>
                                    {clinical.selectedFormIds.length > 0 && (
                                        <span className={`flex size-4 items-center justify-center rounded-full text-[9px] font-bold ${clinical.activeStep === 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                            }`}>
                                            {clinical.selectedFormIds.length}
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* Single Auto-Fill Button */}
                            <div className="flex items-center pl-1.5 text-xs shrink-0">
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => clinical.handleExtractAndFillForm(audio.transcript, audio.audioFiles)}
                                    disabled={!audio.hasExtractData || clinical.isExtracting}
                                    className={`flex h-7.5 sm:h-8 items-center gap-1 sm:gap-1.5 rounded-lg px-2.5 sm:px-3 text-[11px] sm:text-xs font-semibold shadow-xs transition-all ${!audio.hasExtractData || clinical.isExtracting
                                        ? "bg-muted text-muted-foreground opacity-60 cursor-not-allowed shadow-none border border-border"
                                        : "cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md active:scale-98"
                                        }`}
                                    title={audio.hasExtractData ? "สกัดและกรอกข้อมูลจากบทสนทนาลงในแบบฟอร์มอัตโนมัติ" : "ยังไม่มีข้อมูลบทสนทนาหรือข้อความสำหรับสกัดข้อมูล"}
                                >
                                    {clinical.isExtracting ? (
                                        <>
                                            <LoaderCircle size={13} className="animate-spin text-primary-foreground" />
                                            <span>กำลังกรอก...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={13} className={audio.hasExtractData ? "text-primary-foreground" : "text-muted-foreground"} />
                                            <span>กรอกฟอร์มอัตโนมัติ</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </header>

                        {/* Top Conflict Alert Summary Banner */}
                        {clinical.conflictCount > 0 && (
                            <div className="mx-2 mt-1.5 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 text-xs text-amber-700 dark:text-amber-300 shadow-2xs animate-in fade-in duration-200">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white font-bold text-[10px]">
                                        {clinical.conflictCount}
                                    </span>
                                    <span className="text-[11px] font-medium">
                                        พบข้อมูล <strong>{clinical.conflictCount} รายการ</strong> ต่างจากจุดคัดกรอง (ปรับตามเสียงสนทนาล่าสุด)
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                                    <button
                                        type="button"
                                        onClick={clinical.handleRevertAllConflicts}
                                        className="cursor-pointer text-[10px] font-semibold text-foreground bg-card hover:bg-muted border border-border rounded px-2 py-0.5 shadow-2xs transition-colors"
                                        title="คืนค่าข้อมูลทุกช่องให้ตรงกับจุดคัดกรอง"
                                    >
                                        คืนค่าคัดกรองทั้งหมด
                                    </button>
                                    <button
                                        type="button"
                                        onClick={clinical.handleAcceptAllConflicts}
                                        className="cursor-pointer text-[10px] font-semibold text-amber-900 dark:text-amber-100 bg-amber-400/80 hover:bg-amber-400 rounded px-2 py-0.5 transition-colors"
                                        title="ยอมรับค่าจากเสียงเป็นค่าหลัก"
                                    >
                                        ยอมรับค่าเสียงทั้งหมด
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="min-h-0 flex-1 overflow-y-auto bg-card px-2 sm:px-2 py-2 @container">
                            {clinical.activeStep === 0 && (
                                <VitalsTab
                                    formData={clinical.formData}
                                    setFormData={clinical.setFormData}
                                    triageBaseline={clinical.triageBaseline}
                                    onRevertField={clinical.handleRevertField}
                                />
                            )}
                            {clinical.activeStep === 1 && (
                                <ChiefComplaintTab
                                    formData={clinical.formData}
                                    setFormData={clinical.setFormData}
                                    triageBaseline={clinical.triageBaseline}
                                    onRevertField={clinical.handleRevertField}
                                />
                            )}
                            {clinical.activeStep === 2 && (
                                <AssessmentFormsTab
                                    selectedFormIds={clinical.selectedFormIds}
                                    setSelectedFormIds={clinical.setSelectedFormIds}
                                    activeFormId={clinical.activeFormId}
                                    setActiveFormId={clinical.setActiveFormId}
                                    isOpen={clinical.isOpen}
                                    setIsOpen={clinical.setIsOpen}
                                    assessmentAnswers={clinical.assessmentAnswers}
                                    setAssessmentAnswers={clinical.setAssessmentAnswers}
                                    assessmentResults={clinical.assessmentResults}
                                />
                            )}
                        </div>

                        {/* Pinned Bottom Footer */}
                        <footer className="shrink-0 flex items-center justify-end border-t border-border bg-muted/30 mt-2 px-3 py-2 rounded-b-xl">
                            {clinical.hasSummaryData ? (
                                <Button
                                    onClick={() => {
                                        try {
                                            const payload = {
                                                formData: clinical.formData,
                                                selectedPatient: clinical.selectedPatient,
                                                selectedFormIds: clinical.selectedFormIds,
                                                assessmentAnswers: clinical.assessmentAnswers,
                                                assessmentResults: clinical.assessmentResults,
                                                savedAt: new Date().toISOString(),
                                            };
                                            localStorage.setItem("smart_drg_speech_result_data", JSON.stringify(payload));
                                        } catch (e) {
                                            console.error("Failed to save result data", e);
                                        }
                                        navigate({ to: "/result-page" });
                                    }}
                                    className="w-full sm:w-auto shadow-xs font-semibold text-xs cursor-pointer bg-primary text-primary-foreground hover:opacity-90"
                                    size="sm"
                                >
                                    สรุปข้อมูล
                                </Button>
                            ) : (
                                <Button
                                    className="w-full sm:w-auto shadow-xs font-semibold text-xs opacity-50 bg-muted text-muted-foreground border border-border"
                                    variant="outline"
                                    size="sm"
                                    title="ยังไม่มีข้อมูลแบบฟอร์มหรือสัญญาณชีพสำหรับสรุปข้อมูล"
                                    onClick={() => {
                                        try {
                                            const payload = {
                                                formData: clinical.formData,
                                                selectedPatient: clinical.selectedPatient,
                                                selectedFormIds: clinical.selectedFormIds,
                                                assessmentAnswers: clinical.assessmentAnswers,
                                                assessmentResults: clinical.assessmentResults,
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

                    {/* AI ICD / DRG Codes Summary Card */}
                    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
                        <div className="flex items-center gap-2 bg-primary/5 border-b border-border/80 px-3 py-2 text-[12px] font-semibold text-foreground">
                            <Bot
                                size={13}
                                className="text-primary"
                            />
                            สรุปผลโดย AI
                        </div>

                        <Grid cols={{ default: 1, sm: 3 }} gap={2} className="p-2">
                            <CodeRow
                                label="ICD 10"
                                code={clinical.formData.icd10Code && clinical.formData.icd10Code !== "-" ? clinical.formData.icd10Code : (clinical.formData.icd10?.split(" ")[0] || "J11.1")}
                                description={clinical.formData.icd10Name && clinical.formData.icd10Name !== "-" ? clinical.formData.icd10Name : (clinical.formData.icd10Desc || (clinical.formData.icd10?.includes("(") ? clinical.formData.icd10.split("(")[1].replace(")", "") : clinical.formData.icd10) || "Influenza with other respiratory manifestations / ไข้หวัดใหญ่")}
                            />

                            <CodeRow
                                label="ICD 9"
                                code={clinical.formData.icd9Code || (clinical.formData.icd9?.split(" ")[0] || "-")}
                                description={clinical.formData.icd9Name || clinical.formData.icd9Desc || (clinical.formData.icd9?.includes("(") ? clinical.formData.icd9.split("(")[1].replace(")", "") : "") || "-"}
                            />

                            <CodeRow
                                label="DRG"
                                code={clinical.formData.drgCode && clinical.formData.drgCode !== "-" ? clinical.formData.drgCode : (clinical.formData.drg?.split(" ")[0] || "-")}
                                description={clinical.formData.drgName && clinical.formData.drgName !== "-" ? clinical.formData.drgName : (clinical.formData.drgDesc || (clinical.formData.drg?.includes("(") ? clinical.formData.drg.split("(")[1].replace(")", "") : "") || "-")}
                            />
                        </Grid>
                    </section>
                </div>

                {/* Column 3: สรุปทางคลินิกโดย AI (AI Clinical Summary) */}
                <AiClinicalSummary
                    formData={clinical.formData}
                    setFormData={clinical.setFormData}
                    selectedPatient={clinical.selectedPatient}
                    transcript={audio.transcript}
                    audioFiles={audio.audioFiles}
                    onApplyToForm={clinical.handleApplySummaryToForm}
                />
            </section>

            {/* Recording Name Dialog Modal */}
            <Dialog
                open={audio.isNameModalOpen}
                onOpenChange={audio.setIsNameModalOpen}
            >
                <DialogContent className="w-[400px] max-w-[calc(100%-2rem)] rounded-xl bg-card border-border">
                    <DialogHeader>
                        <DialogTitle className="text-foreground">
                            บันทึกเสียง
                        </DialogTitle>

                        <DialogDescription className="text-muted-foreground">
                            กรุณาระบุชื่อไฟล์เสียง
                        </DialogDescription>
                    </DialogHeader>

                    <input
                        placeholder="ชื่อไฟล์"
                        value={audio.recordingName}
                        className="rounded-lg border border-border bg-card px-3 py-2 text-foreground outline-none focus:border-primary"
                        onChange={(e) => audio.setRecordingName(e.target.value)}
                    />

                    <DialogFooter>
                        <Button
                            variant="outline"
                            className="rounded-lg border-border text-foreground hover:bg-muted cursor-pointer"
                            onClick={() => audio.setIsNameModalOpen(false)}
                        >
                            ยกเลิก
                        </Button>

                        <Button
                            className="rounded-lg bg-primary text-primary-foreground hover:opacity-90 cursor-pointer"
                            onClick={audio.handleSaveRecording}
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
        <div className="min-w-0 rounded-xl border border-border bg-card/90 p-2.5 shadow-2xs hover:border-border/80 transition">
            <div className="mb-1 flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground">
                    {label}
                </span>

                <button
                    type="button"
                    className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                >
                    ↻
                </button>
            </div>

            <div className="min-w-0">
                <p className="truncate text-[12px] font-bold text-foreground font-mono">
                    {code}
                </p>

                <p className="mt-0.5 truncate text-[10px] text-muted-foreground font-medium" title={description}>
                    {description}
                </p>
            </div>
        </div>
    );
}