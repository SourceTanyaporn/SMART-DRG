import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
    Brain,
    Check,
    ClipboardCheck,
    Copy,
    Edit3,
    FlaskConical,
    Save,
    StickyNote,
    UserRound,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function ClinicalTextBox({
    title,
    text,
    icon: Icon,
    iconClassName = "",
    onSave,
    triageText,
    onRevert,
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

    const hasConflict = Boolean(triageText && text && text.trim() !== triageText.trim());

    return (
        <div className="group relative flex flex-col rounded-xl border border-border bg-card px-4 py-3 transition-all hover:border-border/80 hover:shadow-xs">
            <div className="flex items-start min-h-[52px] w-full">
                {/* Icon */}
                <div
                    className={`mr-3.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/40 ${iconClassName}`}
                >
                    {Icon ? (
                        <Icon
                            size={20}
                            strokeWidth={1.8}
                        />
                    ) : null}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 pt-0.5">
                    <p className="mb-1 text-[12.5px] font-semibold text-foreground">
                        {title}
                    </p>

                    {isEditing ? (
                        <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            autoFocus
                            rows={3}
                            className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-[12px] leading-5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                    ) : (
                        <p className={`text-[12px] leading-5 ${text ? "text-foreground/90 font-medium" : "text-muted-foreground/70 italic"}`}>
                            {text || "ยังไม่มีข้อมูล"}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="ml-3 flex shrink-0 items-center gap-1.5">
                    {isEditing ? (
                        <>
                            {/* Cancel */}
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="cursor-pointer flex h-7.5 w-7.5 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                title="ยกเลิก"
                            >
                                <X size={13} />
                            </button>

                            {/* Save */}
                            <button
                                type="button"
                                onClick={handleSave}
                                className="cursor-pointer flex h-7.5 w-7.5 items-center justify-center rounded-lg border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 transition-colors hover:bg-emerald-500/10"
                                title="บันทึก"
                            >
                                <Save size={13} />
                            </button>
                        </>
                    ) : (
                        <>
                            {/* Edit */}
                            <button
                                type="button"
                                onClick={handleEdit}
                                className="cursor-pointer flex h-7.5 w-7.5 items-center justify-center rounded-lg border border-primary/30 text-primary transition-colors hover:bg-primary/10"
                                title="แก้ไข"
                            >
                                <Edit3 size={13} />
                            </button>

                            {/* Copy */}
                            <button
                                type="button"
                                onClick={handleCopy}
                                className={`cursor-pointer flex h-7.5 w-7.5 items-center justify-center rounded-lg border transition-colors ${copied
                                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                    : "border-border text-muted-foreground hover:border-border/80 hover:bg-muted hover:text-foreground"
                                    }`}
                                title={copied ? "คัดลอกแล้ว" : "คัดลอก"}
                            >
                                {copied ? (
                                    <Check size={13} />
                                ) : (
                                    <Copy size={13} />
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Conflict Alert with Triage Baseline */}
            {hasConflict && !isEditing && (
                <div className="mt-2.5 flex items-center justify-between rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 text-[11px] text-amber-700 dark:text-amber-300 animate-in fade-in duration-200">
                    <div className="flex items-start gap-1.5 min-w-0 flex-1 pr-2">
                        <span className="shrink-0 font-bold text-amber-800 dark:text-amber-200">จุดคัดกรอง:</span>
                        <span className="italic text-foreground/80 truncate">"{triageText}"</span>
                    </div>
                    {onRevert && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onRevert();
                            }}
                            className="cursor-pointer shrink-0 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-200 px-2 py-0.5 text-[10px] font-bold transition-colors"
                            title="คลิกเพื่อนำข้อความจากจุดคัดกรองกลับมาใช้"
                        >
                            ใช้ค่าคัดกรอง
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export function ChiefComplaintTab({ formData, setFormData, triageBaseline = {}, onRevertField }) {
    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto pr-1 pb-3">
                <div className="relative mt-4 space-y-3">
                    <div className="absolute bottom-10 left-[35px] top-10 w-px border-l border-dashed border-border" />

                    <ClinicalTextBox
                        title="อาการสำคัญ"
                        text={formData.chiefComplaint || ""}
                        triageText={triageBaseline.chiefComplaint}
                        onRevert={() => onRevertField?.('chiefComplaint')}
                        icon={UserRound}
                        iconClassName="bg-indigo-500/10 text-indigo-500"
                        onSave={(val) => setFormData(prev => ({ ...prev, chiefComplaint: val }))}
                    />

                    <ClinicalTextBox
                        title="การเจ็บป่วยในปัจจุบัน"
                        text={formData.presentIllness || ""}
                        triageText={triageBaseline.presentIllness}
                        onRevert={() => onRevertField?.('presentIllness')}
                        icon={Brain}
                        iconClassName="bg-sky-500/10 text-sky-500"
                        onSave={(val) => setFormData(prev => ({ ...prev, presentIllness: val }))}
                    />

                    <ClinicalTextBox
                        title="การตรวจร่างกาย"
                        text={formData.physicalExam || ""}
                        triageText={triageBaseline.physicalExam}
                        onRevert={() => onRevertField?.('physicalExam')}
                        icon={FlaskConical}
                        iconClassName="bg-emerald-500/10 text-emerald-500"
                        onSave={(val) => setFormData(prev => ({ ...prev, physicalExam: val }))}
                    />

                    <ClinicalTextBox
                        title="การประเมินทางคลินิก"
                        text={formData.diagnosis || ""}
                        triageText={triageBaseline.diagnosis}
                        onRevert={() => onRevertField?.('diagnosis')}
                        icon={ClipboardCheck}
                        iconClassName="bg-amber-500/10 text-amber-500"
                        onSave={(val) => setFormData(prev => ({ ...prev, diagnosis: val }))}
                    />

                    <ClinicalTextBox
                        title="Note"
                        text={formData.treatmentPlan || formData.note || ""}
                        icon={StickyNote}
                        iconClassName="bg-purple-500/10 text-purple-500"
                        onSave={(val) => setFormData(prev => ({ ...prev, treatmentPlan: val, note: val }))}
                    />
                </div>
            </div>

        </div>
    );
}
