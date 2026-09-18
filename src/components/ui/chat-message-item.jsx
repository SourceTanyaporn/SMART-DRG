import React, { useState } from "react";
import {
    Bot,
    UserRound,
    Check,
    Copy,
    Sparkles,
    CheckCircle2,
    Play,
    Pause,
    Stethoscope,
    User,
} from "lucide-react";
import {
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar";
import {
    Bubble,
    BubbleContent,
    BubbleGroup,
    BubbleReactions,
} from "@/components/ui/bubble";
import {
    Message,
    MessageAvatar,
    MessageContent,
    MessageFooter,
    MessageScrollerItem,
} from "@/components/ui/message";
import { toast } from "@/components/ui/toast-notification";
import { isDoctorSpeaker } from "@/features/speech-to-text/utils/speaker-helper";

// Helper: แสดงผลข้อความ Markdown ตัวหนา (**bold**) ให้ออกมาคมชัด
export function renderFormattedMessage(text) {
    if (!text || typeof text !== "string") return text;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
            return (
                <strong key={index} className="font-semibold text-foreground">
                    {part.slice(2, -2)}
                </strong>
            );
        }
        return part;
    });
}

const speakerThemes = {
    doctor: {
        avatar: "bg-primary/10 text-primary border border-primary/25 hover:border-primary/50 shadow-2xs hover:bg-primary/15",
        activeBorder: "border-[1.5px] border-primary bg-card shadow-xs",
        equalizer: "text-primary",
        equalizerBar: "bg-primary",
        progressBar: "bg-primary",
        playBtnActive: "bg-primary hover:bg-primary/90 text-primary-foreground",
    },
    patient: {
        avatar: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/50 shadow-2xs hover:bg-emerald-500/15",
        activeBorder: "border-[1.5px] border-emerald-500 bg-card shadow-xs",
        equalizer: "text-emerald-600 dark:text-emerald-400",
        equalizerBar: "bg-emerald-500",
        progressBar: "bg-emerald-500",
        playBtnActive: "bg-emerald-600 hover:bg-emerald-700 text-white",
    },
};

export function ChatMessageItem({
    msg,
    nextMsg,
    // โหมดเสียง / Transcript
    audio,
    patient,
    isAudioMode,
    onSeekAndPlay,
    onPlayPause,
    onToggleSpeakerRole,
    // การคัดลอกและ Action ทั่วไป
    copiedId: externalCopiedId,
    onCopy,
    onApplyStructuredAction,
    isApplied = false,
}) {
    const [localCopied, setLocalCopied] = useState(false);
    const [hoveredAction, setHoveredAction] = useState(null);

    const isCopied = externalCopiedId !== undefined ? externalCopiedId === msg.id : localCopied;

    const handleCopy = (e) => {
        if (e) e.stopPropagation();
        if (onCopy) {
            onCopy(msg.text, msg.id);
        } else {
            navigator.clipboard.writeText(msg.text);
            setLocalCopied(true);
            toast.success("คัดลอกข้อความแล้ว");
            setTimeout(() => setLocalCopied(false), 1500);
        }
    };

    // ตรวจสอบว่าเป็นโหมดเสียง (Transcript Audio) หรือโหมด AI Chat ธรรมดา
    const isAudio = Boolean(isAudioMode || audio || msg.start !== undefined || msg.doctor !== undefined);

    // ==========================================
    // 1. โหมดข้อความเสียงบทสนทนา (Audio Transcript)
    // ==========================================
    if (isAudio) {
        const isDoc = Boolean(
            msg.doctor === true ||
            isDoctorSpeaker(msg.speaker, msg.role) ||
            (msg.doctor === undefined && isDoctorSpeaker(msg.name, msg.role))
        );
        const hasTimestamp = msg.start !== undefined && msg.start !== null;
        const theme = isDoc ? speakerThemes.doctor : speakerThemes.patient;

        // คำนวณช่วงเวลาการเล่นเสียง
        const msgStart = Number(msg.start) || 0;
        const rawEnd = msg.end && Number(msg.end) > msgStart ? Number(msg.end) : null;
        const nextStart = nextMsg?.start !== undefined && Number(nextMsg.start) > msgStart ? Number(nextMsg.start) : null;
        const effectiveEnd = nextStart || rawEnd || (msgStart + Math.max(3, (msg.text?.length || 0) * 0.15));

        const currentT = audio?.currentTime ?? 0;
        const isCurrent =
            hasTimestamp &&
            currentT >= msgStart &&
            currentT < effectiveEnd;

        const segmentDuration = Math.max(0.5, (rawEnd || effectiveEnd) - msgStart);
        const segmentElapsed = Math.max(0, currentT - msgStart);
        const segmentProgress = isCurrent
            ? Math.min(100, Math.max(0, (segmentElapsed / segmentDuration) * 100))
            : 0;

        // แยกชื่อแพทย์กับเลข ว.
        const rawDoctorName = patient?.doctor || msg.name || "แพทย์";
        const doctorMatch = rawDoctorName.match(/^(.*?)(?:\s*(\(ว\.\d+\)))?$/);
        const doctorMainName = doctorMatch?.[1] || rawDoctorName;
        const doctorLicense = doctorMatch?.[2] || "";

        const isPlayHovered = hoveredAction === "play";
        const isCopyHovered = hoveredAction === "copy";

        const handleBubbleClick = () => {
            if (!hasTimestamp) return;
            if (onSeekAndPlay) onSeekAndPlay(msgStart);
            else if (audio?.seekAndPlay) audio.seekAndPlay(msgStart);
        };

        const handlePlayToggle = (e) => {
            e.stopPropagation();
            if (onPlayPause) {
                onPlayPause();
                return;
            }
            if (audio?.isPlaying) {
                audio.handlePlayPause?.();
            } else {
                const isWithinSegment = hasTimestamp && currentT >= msgStart && currentT < effectiveEnd;
                const resumeTime = isWithinSegment ? currentT : msgStart;
                if (audio?.seekAndPlay) {
                    audio.seekAndPlay(resumeTime);
                } else if (audio?.handlePlayPause) {
                    audio.handlePlayPause();
                }
            }
        };

        const handleToggleRole = () => {
            if (onToggleSpeakerRole) onToggleSpeakerRole(msg.id);
            else if (audio?.toggleSpeakerRole) audio.toggleSpeakerRole(msg.id);
        };

        return (
            <MessageScrollerItem
                messageId={msg.id}
                scrollAnchor={isCurrent}
            >
                <Message
                    from={isDoc ? "bot" : "user"}
                    align={isDoc ? "start" : "end"}
                    className="my-1"
                >
                    {/* หมอ: Avatar ฝั่งซ้าย (ไอคอนแพทย์ Stethoscope - speak00) */}
                    {isDoc && (
                        <MessageAvatar>
                            <button
                                type="button"
                                onClick={handleToggleRole}
                                className="cursor-pointer group"
                                title="แพทย์ (speak00) - คลิกเพื่อสลับบทบาท"
                            >
                                <div
                                    className={`size-7 sm:size-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-105 group-active:scale-95 ${theme.avatar}`}
                                >
                                    <Stethoscope size={15} strokeWidth={2.2} />
                                </div>
                            </button>
                        </MessageAvatar>
                    )}

                    <MessageContent className={`flex-1 min-w-0 max-w-full ${isDoc ? "items-start" : "items-end"}`}>
                        {/* แถบส่วนหัว: ชื่อผู้พูด + รหัสผู้พูด (speak00/speak01) + เวลาเสียง */}
                        <div className={`flex items-center gap-1.5 px-0.5 mb-1 w-full flex-wrap ${isDoc ? "justify-start" : "justify-end"}`}>
                            {isDoc ? (
                                <div className="flex items-center gap-1.5">
                                    <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-[9.5px] font-bold text-primary border border-primary/20">
                                        <Stethoscope size={10} strokeWidth={2.5} />
                                        <span>speak00</span>
                                    </span>
                                    <span className="text-[11.5px] font-semibold text-foreground">
                                        {doctorMainName !== "speak00" && doctorMainName !== "SPEAKER_00" ? doctorMainName : "แพทย์"}
                                    </span>
                                    {doctorLicense && (
                                        <span className="text-[10px] text-muted-foreground font-normal">
                                            {doctorLicense}
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[11.5px] font-semibold text-foreground">
                                        {patient?.fullName || (msg.name !== "speak01" && msg.name !== "SPEAKER_01" ? (msg.name || "ผู้ป่วย") : "ผู้ป่วย")}
                                    </span>
                                    <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9.5px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                                        <User size={10} strokeWidth={2.5} />
                                        <span>speak01</span>
                                    </span>
                                </div>
                            )}

                            {hasTimestamp && (
                                <span className="bg-muted text-muted-foreground text-[10px] px-1.5 py-0.2 rounded-full font-medium">
                                    {audio?.formatTime ? audio.formatTime(msg.start) : `${Math.floor(msg.start || 0)}s`}
                                </span>
                            )}
                        </div>

                        {/* Speech Bubble พร้อมฟังก์ชันฟังเสียง */}
                        <BubbleGroup className="w-full">
                            <Bubble
                                variant={isDoc ? "bot" : "default"}
                                onClick={handleBubbleClick}
                                className={`w-full relative p-2.5 sm:p-3 text-[11.5px] leading-relaxed select-text cursor-pointer transition-all duration-200 ${isCurrent
                                    ? `${theme.activeBorder}`
                                    : isDoc
                                        ? "border border-border/80 dark:border-border bg-card shadow-2xs hover:border-primary/40 text-foreground"
                                        : "border border-border/80 dark:border-border bg-card shadow-2xs hover:border-emerald-500/40 text-foreground"
                                    }`}
                            >
                                <BubbleContent className="text-[11.5px] leading-relaxed whitespace-pre-line break-words text-foreground">
                                    {renderFormattedMessage(msg.text)}
                                </BubbleContent>

                                {/* แถบควบคุมเสียงด้านล่าง Bubble */}
                                {isCurrent ? (
                                    /* โหมด Active: คลื่นเสียง + Progress Bar + ปุ่ม Pause/Play + ปุ่ม Copy */
                                    <div className="flex items-center justify-between gap-2.5 mt-2.5 pt-0.5">
                                        <div className="flex items-center gap-1.5 flex-1 min-w-0 mr-1">
                                            <span className={`flex items-center gap-[2px] ${theme.equalizer} shrink-0`}>
                                                <span className={`w-[2.5px] h-2.5 ${theme.equalizerBar} rounded-full ${audio?.isPlaying ? "animate-pulse" : "opacity-75"}`} />
                                                <span className={`w-[3px] h-4 ${theme.equalizerBar} rounded-full ${audio?.isPlaying ? "animate-pulse" : "opacity-75"}`} />
                                                <span className={`w-[2.5px] h-2 ${theme.equalizerBar} rounded-full ${audio?.isPlaying ? "animate-pulse" : "opacity-75"}`} />
                                                <span className={`w-[3px] h-3.5 ${theme.equalizerBar} rounded-full ${audio?.isPlaying ? "animate-pulse" : "opacity-75"}`} />
                                            </span>

                                            <div
                                                className="h-1.5 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden cursor-pointer"
                                                title="คลิกเพื่อเลื่อนไปยังจุดที่ต้องการในประโยคนี้"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                    if (rect.width <= 0) return;
                                                    const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                                                    const seekTime = msgStart + (clickRatio * segmentDuration);
                                                    if (audio?.seekAndPlay) audio.seekAndPlay(seekTime);
                                                }}
                                            >
                                                <div
                                                    className={`h-full ${theme.progressBar} rounded-full`}
                                                    style={{ width: `${Math.min(100, Math.max(0, segmentProgress))}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0 relative">
                                            {isPlayHovered && (
                                                <div className="absolute -top-8.5 left-1/2 -translate-x-1/2 bg-[#1E293B] text-white text-[10px] font-medium px-2 py-0.5 rounded-md shadow-md whitespace-nowrap pointer-events-none z-30 flex flex-col items-center">
                                                    <span>{audio?.isPlaying ? "หยุดชั่วคราว" : "เล่นต่อ"}</span>
                                                    <span className="w-1.5 h-1 bg-[#1E293B] [clip-path:polygon(0_0,50%_100%,100%_0)]" />
                                                </div>
                                            )}

                                            {isCopyHovered && (
                                                <div className="absolute -top-8.5 right-0 bg-[#1E293B] text-white text-[10px] font-medium px-2 py-0.5 rounded-md shadow-md whitespace-nowrap pointer-events-none z-30 flex flex-col items-center">
                                                    <span>คัดลอกข้อความ</span>
                                                    <span className="w-1.5 h-1 bg-[#1E293B] [clip-path:polygon(0_0,50%_100%,100%_0)]" />
                                                </div>
                                            )}

                                            <button
                                                type="button"
                                                onClick={handlePlayToggle}
                                                onMouseEnter={() => setHoveredAction("play")}
                                                onMouseLeave={() => setHoveredAction(null)}
                                                className={`size-7 rounded-full flex items-center justify-center cursor-pointer shadow-xs active:scale-95 transition-transform ${theme.playBtnActive}`}
                                            >
                                                {audio?.isPlaying ? (
                                                    <Pause size={12} fill="currentColor" />
                                                ) : (
                                                    <Play size={12} fill="currentColor" className="ml-0.5" />
                                                )}
                                            </button>

                                            <span className="h-3.5 w-[1px] bg-slate-200 dark:bg-slate-700" />

                                            <button
                                                type="button"
                                                onClick={handleCopy}
                                                onMouseEnter={() => setHoveredAction("copy")}
                                                onMouseLeave={() => setHoveredAction(null)}
                                                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors"
                                            >
                                                {isCopied ? (
                                                    <Check size={13.5} className="text-emerald-500" />
                                                ) : (
                                                    <Copy size={13.5} />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* โหมด Inactive: ปุ่ม Play สีเทาอ่อน + ปุ่ม Copy */
                                    <div className="flex items-center justify-end gap-2 mt-2 pt-0.5 relative">
                                        {isPlayHovered && (
                                            <div className="absolute -top-8.5 right-6 -translate-x-1/4 bg-[#1E293B] text-white text-[10px] font-medium px-2 py-0.5 rounded-md shadow-md whitespace-nowrap pointer-events-none z-30 flex flex-col items-center">
                                                <span>เล่นจากประโยคนี้</span>
                                                <span className="w-1.5 h-1 bg-[#1E293B] [clip-path:polygon(0_0,50%_100%,100%_0)]" />
                                            </div>
                                        )}

                                        {isCopyHovered && (
                                            <div className="absolute -top-8.5 right-0 bg-[#1E293B] text-white text-[10px] font-medium px-2 py-0.5 rounded-md shadow-md whitespace-nowrap pointer-events-none z-30 flex flex-col items-center">
                                                <span>คัดลอกข้อความ</span>
                                                <span className="w-1.5 h-1 bg-[#1E293B] [clip-path:polygon(0_0,50%_100%,100%_0)]" />
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleBubbleClick();
                                            }}
                                            onMouseEnter={() => setHoveredAction("play")}
                                            onMouseLeave={() => setHoveredAction(null)}
                                            className="size-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center cursor-pointer transition-colors"
                                        >
                                            <Play size={10} fill="currentColor" className="ml-0.5" />
                                        </button>

                                        <span className="h-3 w-[1px] bg-slate-200 dark:bg-slate-700" />

                                        <button
                                            type="button"
                                            onClick={handleCopy}
                                            onMouseEnter={() => setHoveredAction("copy")}
                                            onMouseLeave={() => setHoveredAction(null)}
                                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors"
                                        >
                                            {isCopied ? (
                                                <Check size={13} className="text-emerald-500" />
                                            ) : (
                                                <Copy size={13} />
                                            )}
                                        </button>
                                    </div>
                                )}
                            </Bubble>
                        </BubbleGroup>
                    </MessageContent>

                    {/* คนไข้: Avatar ฝั่งขวา (ไอคอนผู้ป่วย User - speak01) */}
                    {!isDoc && (
                        <MessageAvatar>
                            <button
                                type="button"
                                onClick={handleToggleRole}
                                className="cursor-pointer group"
                                title="ผู้ป่วย (speak01) - คลิกเพื่อสลับบทบาท"
                            >
                                <div
                                    className={`size-7 sm:size-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-105 group-active:scale-95 ${theme.avatar}`}
                                >
                                    <User size={15} strokeWidth={2.2} />
                                </div>
                            </button>
                        </MessageAvatar>
                    )}
                </Message>
            </MessageScrollerItem>
        );
    }

    // ==========================================
    // 2. โหมดข้อความแชท AI ปกติ (AI Clinical Chat)
    // ==========================================
    return (
        <MessageScrollerItem
            messageId={msg.id}
            scrollAnchor={!msg.bot}
        >
            <Message from={msg.bot ? "bot" : "user"}>
                {/* Bot Avatar (ฝั่งซ้าย) */}
                {msg.bot && (
                    <MessageAvatar>
                        <Avatar size="sm" className="bg-primary text-primary-foreground shadow-2xs">
                            <AvatarFallback className="bg-transparent text-primary-foreground">
                                <Bot size={13} />
                            </AvatarFallback>
                        </Avatar>
                    </MessageAvatar>
                )}

                <MessageContent className={`flex-1 min-w-0 max-w-[95%] ${msg.bot ? "items-start" : "items-end"}`}>
                    <BubbleGroup className="w-full">
                        <Bubble
                            variant={msg.bot ? "bot" : "user"}
                            className={`w-full ${msg.bot
                                ? "border border-primary/5 bg-primary/5 dark:bg-primary/10 text-foreground shadow-2xs"
                                : "border border-muted bg-muted text-foreground shadow-2xs"
                                }`}
                        >
                            <BubbleContent className="text-[11.5px] leading-relaxed whitespace-pre-line break-words text-foreground">
                                {renderFormattedMessage(msg.text)}
                            </BubbleContent>
                        </Bubble>

                        {/* การ์ดแอ็กชันกรอกฟอร์มอัตโนมัติ (ถ้า AI มี structured_action ส่งมา) */}
                        {msg.bot && msg.structured_action?.data && (
                            <div className="mt-1 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-2 text-[11px]">
                                <Sparkles size={13} className="text-primary shrink-0" />
                                <span className="flex-1 text-foreground/80">
                                    มีข้อมูลพร้อมนำเข้าฟอร์มตรวจรักษา
                                </span>
                                <button
                                    type="button"
                                    onClick={() => onApplyStructuredAction?.(msg.structured_action, msg.id)}
                                    disabled={isApplied}
                                    className={`flex items-center gap-1 rounded px-2 py-0.5 font-medium transition cursor-pointer text-[10px] ${isApplied
                                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                                        : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs"
                                        }`}
                                >
                                    {isApplied ? (
                                        <>
                                            <CheckCircle2 size={11} />
                                            <span>กรอกแล้ว</span>
                                        </>
                                    ) : (
                                        <span>นำเข้าฟอร์ม</span>
                                    )}
                                </button>
                            </div>
                        )}
                    </BubbleGroup>

                    <div className="flex items-center justify-between gap-2 px-1 mt-0.5">
                        <MessageFooter>
                            <span>{msg.time}</span>
                        </MessageFooter>

                        {msg.bot && (
                            <BubbleReactions>
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    className="cursor-pointer flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-muted hover:text-foreground text-muted-foreground transition text-[9px]"
                                    title="คัดลอกข้อความ"
                                >
                                    {isCopied ? (
                                        <>
                                            <Check size={10} className="text-emerald-600 dark:text-emerald-400" />
                                            <span className="text-emerald-600 dark:text-emerald-400">คัดลอกแล้ว</span>
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

                {/* User Avatar (ฝั่งขวา) */}
                {!msg.bot && (
                    <MessageAvatar>
                        <Avatar size="sm" className="bg-primary/10 text-primary border border-primary/20 shadow-2xs">
                            <AvatarFallback className="bg-transparent text-primary">
                                <UserRound size={13} />
                            </AvatarFallback>
                        </Avatar>
                    </MessageAvatar>
                )}
            </Message>
        </MessageScrollerItem>
    );
}
