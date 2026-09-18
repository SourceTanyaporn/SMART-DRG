import React, { useState, useMemo } from "react";
import {
    Search,
    Plus,
    SlidersHorizontal,
    Eye,
    Pencil,
    Trash2,
    X,
    Check,
    FileText,
    AlertCircle,
    FolderPlus,
    BookText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tab, TabsList } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

import {
    assessmentForms as defaultAssessmentForms,
    formCategories,
} from "@/data/assessment-forms";
import { AssessmentFormBuilder } from "./components/assessment-form-builder";

// Helper to calculate or retrieve the total score of a form
export const calculateFormTotalScore = (form) => {
    if (!form) return 0;
    if (typeof form.totalScore === "number" && form.totalScore > 0) {
        return form.totalScore;
    }
    if (Array.isArray(form.questions) && form.questions.length > 0) {
        const sum = form.questions.reduce((acc, q) => {
            const scoreNum = parseInt(q.score ?? q.maxScore) || 0;
            return acc + scoreNum;
        }, 0);
        if (sum > 0) return sum;
    }
    if (Array.isArray(form.kpiLevels) && form.kpiLevels.length > 0) {
        const maxKpi = Math.max(...form.kpiLevels.map((lvl) => parseInt(lvl.max) || 0));
        if (maxKpi > 0) return maxKpi;
    }
    return form.totalScore || 0;
};

export function AssesmentPage() {
    const [categories, setCategories] = useState(() =>
        formCategories.filter((c) => c !== "ทั้งหมด")
    );
    const [activeCategory, setActiveCategory] = useState("ทั้งหมด");
    const [forms, setForms] = useState(() => defaultAssessmentForms);
    const [searchTerm, setSearchTerm] = useState("");

    // View mode: 'list' or 'builder' (matches the full form design)
    const [viewMode, setViewMode] = useState("list");
    const [builderFormData, setBuilderFormData] = useState(null);

    // Modals & Active items
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [viewingForm, setViewingForm] = useState(null);
    const [deletingForm, setDeletingForm] = useState(null);

    // State for new category input
    const [newCategoryName, setNewCategoryName] = useState("");

    // Sync forms with defaultAssessmentForms if kpiLevels were updated
    React.useEffect(() => {
        setForms((prev) =>
            prev.map((f) => {
                const defaultForm = defaultAssessmentForms.find((df) => df.id === f.id);
                if (defaultForm && (!f.kpiLevels || f.kpiLevels.length === 0)) {
                    return { ...f, kpiLevels: defaultForm.kpiLevels };
                }
                return f;
            })
        );
    }, []);

    // Filtered forms based on search and active category
    const filteredForms = useMemo(() => {
        return forms.filter((item) => {
            const matchesCategory =
                !activeCategory ||
                activeCategory === "ทั้งหมด" ||
                item.category === activeCategory;
            const matchesSearch =
                searchTerm.trim() === "" ||
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [forms, activeCategory, searchTerm]);

    // Handle Open Builder for Add
    const handleOpenAdd = () => {
        setBuilderFormData(null);
        setViewMode("builder");
    };

    // Handle Open Builder for Edit
    const handleOpenEdit = (form) => {
        const defaultForm = defaultAssessmentForms.find((df) => df.id === form.id);
        const formWithKpi = {
            ...form,
            kpiLevels:
                form.kpiLevels && form.kpiLevels.length > 0
                    ? form.kpiLevels
                    : defaultForm?.kpiLevels || [],
        };
        setBuilderFormData(formWithKpi);
        setViewMode("builder");
    };

    // Save from Builder
    const handleSaveBuilderForm = (savedForm) => {
        setForms((prev) => {
            const exists = prev.some((f) => f.id === savedForm.id);
            if (exists) {
                return prev.map((f) => (f.id === savedForm.id ? savedForm : f));
            }
            return [savedForm, ...prev];
        });
        setViewMode("list");
        setBuilderFormData(null);
    };

    // Cancel Builder
    const handleCancelBuilder = () => {
        setViewMode("list");
        setBuilderFormData(null);
    };

    const handleConfirmDelete = () => {
        if (!deletingForm) return;
        setForms((prev) => prev.filter((f) => f.id !== deletingForm.id));
        setDeletingForm(null);
    };

    // Handle Add Category
    const handleAddCategory = () => {
        if (!newCategoryName.trim()) return;
        if (!categories.includes(newCategoryName.trim())) {
            setCategories((prev) => [...prev, newCategoryName.trim()]);
        }
        setNewCategoryName("");
    };

    const handleDeleteCategory = (catName) => {
        if (categories.length <= 1) return;
        setCategories((prev) => prev.filter((c) => c !== catName));
        if (activeCategory === catName) {
            setActiveCategory(categories.find((c) => c !== catName) || "");
        }
    };

    if (viewMode === "builder") {
        return (
            <div className="w-full p-0 sm:p-2 md:p-4 bg-background">
                <AssessmentFormBuilder
                    key={builderFormData?.id || "new-form"}
                    initialData={builderFormData}
                    categories={categories}
                    onSave={handleSaveBuilderForm}
                    onCancel={handleCancelBuilder}
                />
            </div>
        );
    }

    return (
        <div className="w-full space-y-3.5 sm:space-y-4 bg-background">
            {/* Top Header Card */}
            <div className="rounded-xl border border-border bg-card p-3.5 sm:p-4 shadow-xs">
                <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
                    {/* Left: Icon, Title, Subtitle, Badges */}
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                        <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <BookText className="size-4.5 sm:size-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                <h1 className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-foreground break-words">
                                    แบบประเมิน (Assessment Forms)
                                </h1>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold text-primary shrink-0">
                                    <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                                    {forms.length} แบบฟอร์ม
                                </span>
                                {searchTerm && (
                                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground border border-border shrink-0">
                                        พบ {filteredForms.length} รายการ
                                    </span>
                                )}
                            </div>
                            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-2 sm:line-clamp-none break-words">
                                จัดการและกำหนดแบบฟอร์มการประเมินทางการแพทย์และเกณฑ์การตรวจประเมิน DRG
                            </p>
                        </div>
                    </div>

                    {/* Right: Add Form Button */}
                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                        <Button
                            onClick={handleOpenAdd}
                            className="w-full sm:w-auto h-9 px-3.5 sm:px-4 rounded-xl bg-primary text-white font-medium text-xs sm:text-sm shadow-xs transition-all active:scale-[0.98] cursor-pointer justify-center"
                        >
                            <Plus size={16} className="mr-1.5 shrink-0" />
                            <span>เพิ่มแบบฟอร์ม</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Search Bar & Categories Toolbar */}
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center justify-between">
                {/* Search Input */}
                <div className="relative w-full sm:max-w-xs md:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <Input
                        type="text"
                        placeholder="ค้นหาแบบประเมิน หรือคำอธิบาย..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-9 w-full rounded-xl border-border bg-card pl-9 pr-8 text-xs sm:text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary shadow-2xs"
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => setSearchTerm("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded-sm"
                            aria-label="ล้างการค้นหา"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Manage Categories Button */}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="h-9 w-full sm:w-auto justify-center rounded-xl border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 normal-case tracking-normal text-xs sm:text-sm font-medium gap-1.5 shadow-2xs shrink-0 cursor-pointer"
                >
                    <SlidersHorizontal size={14} className="shrink-0" />
                    <span>จัดการหมวดหมู่</span>
                </Button>
            </div>

            {/* Category Filter Tabs */}
            <div className="pt-0.5 overflow-hidden">
                <TabsList variant="pill" className="gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5 w-full flex-nowrap scroll-smooth">
                    {["ทั้งหมด", ...categories].map((cat) => (
                        <Tab
                            key={cat}
                            variant="pill"
                            size="sm"
                            label={cat}
                            active={activeCategory === cat}
                            onClick={() => setActiveCategory(cat)}
                            className="shrink-0 whitespace-nowrap text-xs sm:text-sm"
                        />
                    ))}
                </TabsList>
            </div>

            {
                filteredForms.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 pt-1">
                        {filteredForms.map((item) => (
                            <div
                                key={item.id}
                                className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-3.5 sm:p-4 md:p-5 shadow-2xs transition-all hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs"
                            >
                                {/* Header: Category badge, Title, Action Buttons */}
                                <div>
                                    <div className="flex items-start justify-between gap-2.5">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[10.5px] font-medium text-muted-foreground border border-border/60">
                                                    <FileText size={10} />
                                                    <span className="truncate max-w-[130px] sm:max-w-[170px]">{item.category}</span>
                                                </span>
                                            </div>
                                            <h3
                                                className="text-sm sm:text-[14.5px] font-bold text-foreground leading-snug line-clamp-2 break-words"
                                                title={item.title}
                                            >
                                                {item.title}
                                            </h3>
                                        </div>

                                        {/* 3 Action Buttons (View, Edit, Delete) */}
                                        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 pt-0.5">
                                            {/* 1. View / Preview Icon Button (Eye) */}
                                            <button
                                                type="button"
                                                onClick={() => setViewingForm(item)}
                                                title="ดูตัวอย่างแบบฟอร์ม"
                                                className="flex size-7 sm:size-7.5 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer"
                                                aria-label="ดูตัวอย่างแบบฟอร์ม"
                                            >
                                                <Eye size={13} strokeWidth={2.2} />
                                            </button>

                                            {/* 2. Edit Icon Button (Pencil) */}
                                            <button
                                                type="button"
                                                onClick={() => handleOpenEdit(item)}
                                                title="แก้ไขแบบฟอร์ม"
                                                className="flex size-7 sm:size-7.5 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 hover:text-amber-700 dark:hover:text-amber-300 transition-colors cursor-pointer"
                                                aria-label="แก้ไขแบบฟอร์ม"
                                            >
                                                <Pencil size={12} strokeWidth={2.2} />
                                            </button>

                                            {/* 3. Delete Icon Button (Trash2) */}
                                            <button
                                                type="button"
                                                onClick={() => setDeletingForm(item)}
                                                title="ลบแบบฟอร์ม"
                                                className="flex size-7 sm:size-7.5 items-center justify-center rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive transition-colors cursor-pointer"
                                                aria-label="ลบแบบฟอร์ม"
                                            >
                                                <Trash2 size={12} strokeWidth={2.2} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Description Body */}
                                    <p className="mt-2 text-xs sm:text-[12.5px] leading-relaxed text-muted-foreground line-clamp-3 break-words">
                                        {item.description}
                                    </p>
                                </div>

                                {item.questions && (
                                    <div className="mt-3.5 pt-2.5 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <span>จำนวนคำถาม</span>
                                            <span className="font-semibold text-foreground">{item.questions.length} ข้อ</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span>คะแนนรวม</span>
                                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                {calculateFormTotalScore(item)} คะแนน
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex min-h-[200px] sm:min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-6 sm:p-8 text-center">
                        <AlertCircle className="size-8 text-muted-foreground/60 mb-2" />
                        <p className="text-sm font-medium text-foreground">ไม่พบแบบฟอร์มที่ค้นหา</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            ลองปรับเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่น
                        </p>
                    </div>
                )
            }

            {/* ================================================================= */}
            {/* Dialog: Manage Categories                                         */}
            {/* ================================================================= */}
            <Dialog
                open={isCategoryModalOpen}
                onOpenChange={setIsCategoryModalOpen}
            >
                <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md rounded-2xl p-4 sm:p-6 max-h-[88vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                            <SlidersHorizontal size={18} className="text-primary shrink-0" />
                            <span>จัดการหมวดหมู่แบบฟอร์ม</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            เพิ่มหรือลบประเภทของแบบฟอร์มเพื่อการจัดหมวดหมู่อย่างเป็นระเบียบ
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {/* Add new category input */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <Input
                                placeholder="ระบุชื่อหมวดหมู่ใหม่..."
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                className="h-9.5 text-xs sm:text-sm rounded-lg flex-1"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddCategory();
                                    }
                                }}
                            />
                            <Button
                                type="button"
                                onClick={handleAddCategory}
                                className="h-9.5 px-3.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-medium justify-center cursor-pointer shrink-0"
                            >
                                <FolderPlus size={15} className="mr-1" />
                                เพิ่ม
                            </Button>
                        </div>

                        {/* List of existing categories */}
                        <div className="max-h-56 sm:max-h-60 overflow-y-auto space-y-1.5 border border-border rounded-xl p-2 bg-muted/20">
                            {categories.map((cat) => (
                                <div
                                    key={cat}
                                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-card border border-border/70 text-xs sm:text-sm"
                                >
                                    <span className="font-medium text-foreground truncate mr-2">{cat}</span>
                                    {categories.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteCategory(cat)}
                                            title="ลบหมวดหมู่"
                                            className="text-muted-foreground hover:text-rose-500 p-1.5 rounded-md transition-colors cursor-pointer shrink-0"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            onClick={() => setIsCategoryModalOpen(false)}
                            className="w-full rounded-lg text-xs sm:text-sm cursor-pointer"
                        >
                            เสร็จสิ้น
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ================================================================= */}
            {/* Dialog: Preview / View Form                                       */}
            {/* ================================================================= */}
            <Dialog
                open={!!viewingForm}
                onOpenChange={(open) => !open && setViewingForm(null)}
            >
                <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg rounded-2xl p-4 sm:p-6 max-h-[88vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary w-fit">
                                <FileText size={12} />
                                <span>{viewingForm?.category}</span>
                            </div>
                            <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                                <span>คะแนนรวม {calculateFormTotalScore(viewingForm)} คะแนน</span>
                            </div>
                        </div>
                        <DialogTitle className="text-base sm:text-lg font-bold leading-snug break-words">
                            {viewingForm?.title}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3 py-2 text-xs sm:text-sm">
                        <div className="rounded-xl border border-border bg-muted/20 p-3 sm:p-3.5">
                            <h4 className="font-semibold text-foreground mb-1">
                                รายละเอียดและวัตถุประสงค์
                            </h4>
                            <p className="text-muted-foreground leading-relaxed text-xs break-words">
                                {viewingForm?.description}
                            </p>
                        </div>

                        <div className="rounded-xl border border-border/80 p-3 sm:p-3.5 space-y-2 bg-card max-h-56 sm:max-h-64 overflow-y-auto">
                            <h4 className="font-semibold text-foreground text-xs">
                                ข้อคำถามในแบบประเมิน ({viewingForm?.questions?.length || 0} ข้อ)
                            </h4>
                            {viewingForm?.questions?.length ? (
                                <ul className="space-y-2 text-xs text-muted-foreground">
                                    {viewingForm.questions.map((q) => (
                                        <li
                                            key={q.number || q.text}
                                            className="p-2 sm:p-2.5 rounded-lg bg-muted/20 border border-border/40"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="font-medium text-foreground break-words flex-1">
                                                    {q.number}. {q.text}
                                                </p>
                                                {(q.score || q.maxScore !== undefined) && (
                                                    <span className="shrink-0 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200/60">
                                                        {typeof (q.score ?? q.maxScore) === "number"
                                                            ? `${q.score ?? q.maxScore} คะแนน`
                                                            : (q.score ?? `${q.maxScore} คะแนน`)}
                                                    </span>
                                                )}
                                            </div>
                                            {q.options && (
                                                <p className="text-[11px] text-muted-foreground mt-1 break-words">
                                                    ตัวเลือก: {q.options.map((opt) => typeof opt === "string" ? opt : opt.text).join(", ")}
                                                </p>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-xs text-muted-foreground">ไม่มีข้อคำถามในแบบประเมินนี้</p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            onClick={() => setViewingForm(null)}
                            className="w-full sm:w-auto rounded-lg text-xs sm:text-sm cursor-pointer"
                        >
                            ปิด
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ================================================================= */}
            {/* Dialog: Confirm Delete Form                                       */}
            {/* ================================================================= */}
            <Dialog
                open={!!deletingForm}
                onOpenChange={(open) => !open && setDeletingForm(null)}
            >
                <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-sm rounded-2xl p-4 sm:p-6">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-rose-600 flex items-center gap-1.5">
                            <AlertCircle size={18} className="shrink-0" />
                            <span>ยืนยันการลบแบบฟอร์ม</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground break-words">
                            คุณแน่ใจหรือไม่ว่าต้องการลบแบบฟอร์ม "
                            <span className="font-semibold text-foreground">
                                {deletingForm?.title}
                            </span>
                            "? การกระทำนี้ไม่สามารถย้อนกลับได้
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDeletingForm(null)}
                            className="w-full sm:w-auto rounded-lg text-xs sm:text-sm cursor-pointer"
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleConfirmDelete}
                            className="w-full sm:w-auto rounded-lg text-xs sm:text-sm cursor-pointer bg-rose-600 hover:bg-rose-700 text-white"
                        >
                            ลบแบบฟอร์ม
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}