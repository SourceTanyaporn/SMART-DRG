import React from "react";
import { Clock3, Stethoscope, User } from "lucide-react";
import {
    MessageScroller,
    MessageScrollerViewport,
    MessageScrollerContent,
    MessageScrollerButton,
} from "@/components/ui/message";
import { ChatMessageItem } from "@/components/ui/chat-message-item";

export function TranscriptPanel({ audio, patient }) {
    return (
        <section className="min-h-0 flex-1 flex flex-col overflow-hidden">
            <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
                <div className="flex shrink-0 items-center justify-between border-b border-border/80 px-3.5 py-2 bg-muted/20">


                    <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground shrink-0 font-medium">
                        <Clock3 size={12} className="text-muted-foreground/70" />
                        <span>ระยะเวลา {audio?.formatTime ? audio.formatTime(audio.duration) : "00:00"}</span>
                    </div>
                </div>

                <MessageScroller className="min-h-0 flex-1">
                    <MessageScrollerViewport className="p-2.5 sm:p-3">
                        {audio?.transcript && audio.transcript.length > 0 ? (
                            <MessageScrollerContent className="space-y-3">
                                {audio.transcript.map((item, index) => (
                                    <ChatMessageItem
                                        key={item.id}
                                        msg={item}
                                        nextMsg={audio.transcript[index + 1]}
                                        audio={audio}
                                        patient={patient}
                                        isAudioMode={true}
                                        onToggleSpeakerRole={audio?.toggleSpeakerRole}
                                        onSeekAndPlay={audio?.seekAndPlay}
                                        onPlayPause={audio?.handlePlayPause}
                                    />
                                ))}
                            </MessageScrollerContent>
                        ) : (
                            <div className="flex h-full min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/15 p-4 text-center">
                                <span className="flex items-center gap-1 text-primary/50 mb-2">
                                    <span className="w-1 h-3 bg-primary/50 rounded-full" />
                                    <span className="w-1 h-5 bg-primary/50 rounded-full" />
                                    <span className="w-1 h-2 bg-primary/50 rounded-full" />
                                </span>
                                <p className="text-[12.5px] font-semibold text-foreground">
                                    ยังไม่มีข้อความเสียง
                                </p>
                                <p className="mt-1 text-[11px] text-muted-foreground max-w-xs leading-relaxed">
                                    กรุณาอัปโหลดไฟล์เสียงหรือกดบันทึกเสียงเพื่อเริ่มแปลงข้อความ
                                </p>
                            </div>
                        )}
                    </MessageScrollerViewport>
                    <MessageScrollerButton />
                </MessageScroller>
            </div>
        </section>
    );
}
