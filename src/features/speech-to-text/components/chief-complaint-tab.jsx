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
                className={`mr-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
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

export function ChiefComplaintTab({ formData, setFormData }) {
    return (
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

        </div>
    );
}
