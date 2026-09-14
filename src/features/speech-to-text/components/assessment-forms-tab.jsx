import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
    Check,
    ClipboardCheck,
    Plus,
    Search,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Grid } from "@/components/ui/grid";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";

export { assessmentForms, formCategories } from "@/data/assessment-forms";
import { assessmentForms, formCategories } from "@/data/assessment-forms";

export function AssessmentQuestion({
    formId,
    number,
    text,
    type = "radio",
    options,
    score,
    value,
    onChange,
}) {
    return (
        <div className="grid grid-cols-[1fr_170px_70px] items-center gap-3 border-b border-border/60 py-2.5 px-1 hover:bg-muted/20 rounded-lg transition-colors">
            <div className="text-[12.5px] leading-relaxed text-foreground font-medium">
                <span className="mr-1.5 font-bold text-foreground">
                    {number}.
                </span>
                {text}
            </div>

            {type === "select" ? (
                <Select
                    value={value || ""}
                    onChange={(val) => onChange?.(val)}
                    placeholder="เลือกคำตอบ"
                    options={(options || ["ใช่", "ไม่ใช่"]).map((opt) => ({ value: opt, label: opt }))}
                    triggerClassName="h-8 rounded-lg border-border bg-card text-[11.5px] font-medium"
                />
            ) : (
                <div className="flex items-center gap-3.5">
                    <label className="flex items-center gap-1.5 text-[12px] font-medium text-foreground cursor-pointer select-none">
                        <input
                            type="radio"
                            name={`${formId || "form"}-question-${number}`}
                            checked={value === "ใช่" || value === true || value === "มี"}
                            onChange={() => onChange?.("ใช่")}
                            className="size-3.5 accent-primary cursor-pointer"
                        />
                        ใช่
                    </label>

                    <label className="flex items-center gap-1.5 text-[12px] font-medium text-foreground cursor-pointer select-none">
                        <input
                            type="radio"
                            name={`${formId || "form"}-question-${number}`}
                            checked={value === "ไม่ใช่" || value === false || value === "ไม่มี" || value === "ปฏิเสธ"}
                            onChange={() => onChange?.("ไม่ใช่")}
                            className="size-3.5 accent-primary cursor-pointer"
                        />
                        ไม่ใช่
                    </label>
                </div>
            )}

            <div className="text-right">
                <span className="inline-block rounded-md bg-primary/10 border border-primary/25 px-2 py-0.5 text-[11px] font-bold text-primary">
                    {score || "0 คะแนน"}
                </span>
            </div>
        </div>
    );
}

export function AssessmentFormsTab({
    selectedFormIds,
    setSelectedFormIds,
    activeFormId,
    setActiveFormId,
    isOpen,
    setIsOpen,
    assessmentAnswers = {},
    setAssessmentAnswers,
    assessmentResults = {},
}) {
    const [formSearchQuery, setFormSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");

    const activeId = selectedFormIds.includes(activeFormId) ? activeFormId : (selectedFormIds[0] || "");
    const currentForm = assessmentForms.find(f => f.id === activeId) || assessmentForms[0];

    const currentAnswers = assessmentAnswers[activeId] || {};
    const currentResult = assessmentResults[activeId] || {};

    const handleQuestionChange = (qNum, val) => {
        if (setAssessmentAnswers) {
            setAssessmentAnswers(prev => ({
                ...prev,
                [activeId]: {
                    ...(prev[activeId] || {}),
                    [qNum]: val,
                },
            }));
        }
    };

    const displayScore = currentResult.totalScore !== undefined ? currentResult.totalScore : currentForm.totalScore;
    const displayLabel = currentResult.resultLabel || currentForm.resultLabel;
    const displaySummary = currentResult.summary;

    return (
        <>
            <div className="flex h-full min-h-0 flex-col">
                {/* Multi-form Tab Bar */}
                <div className="shrink-0 pb-2.5 border-b border-border/50">
                    {selectedFormIds.length === 0 ? (
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground font-medium">
                                ยังไม่มีการเลือกแบบประเมิน
                            </span>
                            <Button
                                type="button"
                                size="sm"
                                variant="default"
                                onClick={() => setIsOpen(true)}
                                className="h-8 gap-1.5 rounded-lg text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-xs"
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
                                                            ? "bg-primary text-primary-foreground border-primary shadow-xs ring-1 ring-primary/30"
                                                            : "bg-muted/50 text-foreground hover:bg-muted border-border"
                                                            }`}
                                                    />
                                                }
                                            >
                                                <span className={`flex size-5 items-center justify-center rounded-lg text-xs font-bold ${isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
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
                                                    className={`grid size-4 place-items-center rounded-full opacity-60 hover:opacity-100 transition ${isActive ? "hover:bg-white/20 text-white" : "hover:bg-muted text-muted-foreground"
                                                        }`}
                                                    title="ลบออกจากรายการ"
                                                >
                                                    <X size={11} />
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent
                                                side="top"
                                                sideOffset={6}
                                                className="z-[99999] rounded-xl bg-popover text-popover-foreground border border-border px-3 py-1.5 text-xs font-medium shadow-xl"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">{form.title}</span>
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
                            <h3 className="text-sm font-semibold text-foreground">
                                ยังไม่มีแบบประเมินที่เลือก
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground max-w-xs">
                                กรุณาคลิกปุ่มเพิ่มแบบประเมินเพื่อเลือกแบบฟอร์มที่ต้องการบันทึกข้อมูล
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Active Form Header */}
                        <div className="shrink-0 pt-2 pb-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-[14px] font-semibold text-foreground">
                                            {currentForm.title}
                                        </h2>
                                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary border border-primary/20">
                                            {currentForm.category}
                                        </span>
                                    </div>
                                    <p className="mt-0.5 text-[11px] text-muted-foreground">
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
                                        formId={currentForm.id}
                                        number={q.number}
                                        text={q.text}
                                        type={q.type}
                                        options={q.options}
                                        score={q.score}
                                        value={currentAnswers[q.number]}
                                        onChange={(val) => handleQuestionChange(q.number, val)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Bottom Interpretation Bar & Action Buttons */}
                        <div className="shrink-0 border-t border-border bg-card pt-2.5">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="w-full flex-1 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[12px] font-semibold text-foreground/90">
                                                แบบแปลผลคะแนน ({currentForm.title.replace(/^แบบ(ประเมิน|คัดกรอง)/, "").trim()})
                                            </p>
                                            <p className="mt-0.5 text-[12px] text-emerald-600 dark:text-emerald-400 font-medium">
                                                {displayLabel}
                                            </p>
                                            {displaySummary && (
                                                <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">
                                                    สรุป: {displaySummary}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0 pt-0.5">
                                            <span className="text-[12px] text-muted-foreground">
                                                คะแนนรวม
                                            </span>
                                            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                                {displayScore}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Assessment Forms Selection Dialog */}
            <Dialog
                open={isOpen}
                onOpenChange={setIsOpen}
            >
                <DialogContent className="w-full sm:max-w-5xl lg:max-w-6xl max-w-[calc(100%-2rem)] rounded-2xl p-5 sm:p-6 bg-card border border-border">
                    <DialogHeader className="pb-1">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="grid size-9 sm:size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                                    <ClipboardCheck size={20} />
                                </div>
                                <div>
                                    <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                                        เลือกแบบฟอร์มการประเมิน
                                    </DialogTitle>
                                    <DialogDescription className="text-xs text-muted-foreground">
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
                            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="ค้นหาชื่อแบบฟอร์ม, รายละเอียด..."
                                value={formSearchQuery}
                                onChange={(e) => setFormSearchQuery(e.target.value)}
                                className="h-9.5 w-full rounded-xl border border-input bg-muted/40 pl-9 pr-3 text-xs sm:text-sm text-foreground outline-none transition focus:border-primary focus:bg-card"
                            />
                        </div>

                        <div className="flex flex-wrap gap-1.5 text-xs">
                            {formCategories.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`rounded-full px-3 py-1 transition cursor-pointer font-medium text-xs ${selectedCategory === cat
                                        ? "bg-primary text-primary-foreground shadow-xs"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Assessment Forms List */}
                    <div className="max-h-[520px] sm:max-h-[60vh] overflow-y-auto pr-1 pt-1">
                        <Grid cols={{ default: 1, md: 2, lg: 3 }} gap={3}>
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
                                                ? "border-primary bg-primary/[0.06] ring-1 ring-primary/40 shadow-xs"
                                                : "border-border bg-card hover:border-primary/40 hover:bg-muted/40"
                                                }`}
                                        >
                                            <div className="min-w-0 flex-1 pr-2">
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <p className={`text-xs sm:text-sm font-bold ${isSelected ? "text-primary" : "text-foreground"}`}>
                                                        {form.title}
                                                    </p>
                                                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                                        {form.category}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                                                    {form.description}
                                                </p>
                                                <p className="mt-1.5 text-[10px] text-muted-foreground/70 font-medium">
                                                    จำนวน {form.questions.length} ข้อคำถาม • {form.totalScore} คะแนน
                                                </p>
                                            </div>

                                            <div className="flex shrink-0 items-center pt-0.5">
                                                {isSelected ? (
                                                    <span className="grid size-6 place-items-center rounded-full bg-primary text-primary-foreground shadow-xs">
                                                        <Check size={13} strokeWidth={2.5} />
                                                    </span>
                                                ) : (
                                                    <span className="grid size-6 place-items-center rounded-full border border-border text-transparent group-hover:border-primary group-hover:text-primary">
                                                        <Check size={13} />
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                        </Grid>
                    </div>

                    <DialogFooter className="border-t border-border pt-3 flex flex-row items-center justify-between sm:justify-between">
                        <div className="text-xs text-muted-foreground font-medium">
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
