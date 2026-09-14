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
            <div className="w-full p-2 sm:p-4 bg-background">
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
        <div className="w-full space-y-4 p-2 sm:p-4 bg-background">
            {/* Top Search Bar & Add Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative w-full max-w-sm">
                    <Input
                        type="text"
                        placeholder="ค้นหาแบบประเมิน"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-10 rounded-xl border-border bg-card pl-3.5 pr-9 text-xs sm:text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary shadow-2xs"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                            <X size={15} />
                        </button>
                    )}
                </div>

                {/* Add Form Button (+ เพิ่มแบบฟอร์ม) */}
                <Button
                    onClick={handleOpenAdd}
                    className="h-10 px-4 sm:px-5 rounded-xl bg-primary text-white font-medium text-xs sm:text-sm shadow-sm transition-all active:scale-[0.98] cursor-pointer shrink-0 self-end sm:self-auto"
                >
                    <Plus size={18} className="mr-1.5" />
                    <span>เพิ่มแบบฟอร์ม</span>
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                {/* Category Tabs using system Tab component */}
                <TabsList variant="pill" className="gap-2 overflow-x-auto no-scrollbar py-0.5">
                    {["ทั้งหมด", ...categories].map((cat) => (
                        <Tab
                            key={cat}
                            variant="pill"
                            size="sm"
                            label={cat}
                            active={activeCategory === cat}
                            onClick={() => setActiveCategory(cat)}
                        />
                    ))}
                </TabsList>

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="rounded-xl border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 normal-case tracking-normal text-xs sm:text-sm font-medium gap-1.5 shadow-2xs shrink-0 self-start sm:self-auto"
                >
                    <SlidersHorizontal size={15} />
                    <span>จัดการหมวดหมู่</span>
                </Button>
            </div>

            {
                filteredForms.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 pt-1">
                        {filteredForms.map((item) => (
                            <div
                                key={item.id}
                                className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-4 sm:p-5 shadow-2xs transition-all hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs"
                            >
                                {/* Header: Title and Action Buttons */}
                                <div className="flex items-start justify-between gap-3">
                                    <h3
                                        className="text-sm sm:text-[14.5px] font-bold text-foreground leading-snug line-clamp-2"
                                        title={item.title}
                                    >
                                        {item.title}
                                    </h3>

                                    {/* 3 Action Buttons (View, Edit, Delete) */}
                                    <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                                        {/* 1. View / Preview Icon Button (Eye) - Primary theme */}
                                        <button
                                            type="button"
                                            onClick={() => setViewingForm(item)}
                                            title="ดูตัวอย่างแบบฟอร์ม"
                                            className="flex h-6 w-6 sm:h-6.5 sm:w-6.5 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer"
                                        >
                                            <Eye size={13} strokeWidth={2.2} />
                                        </button>

                                        {/* 2. Edit Icon Button (Pencil) - Amber/Orange for editing */}
                                        <button
                                            type="button"
                                            onClick={() => handleOpenEdit(item)}
                                            title="แก้ไขแบบฟอร์ม"
                                            className="flex h-6 w-6 sm:h-6.5 sm:w-6.5 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 hover:text-amber-700 dark:hover:text-amber-300 transition-colors cursor-pointer"
                                        >
                                            <Pencil size={12} strokeWidth={2.2} />
                                        </button>

                                        {/* 3. Delete Icon Button (Trash2) - Destructive/Rose */}
                                        <button
                                            type="button"
                                            onClick={() => setDeletingForm(item)}
                                            title="ลบแบบฟอร์ม"
                                            className="flex h-6 w-6 sm:h-6.5 sm:w-6.5 items-center justify-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive transition-colors cursor-pointer"
                                        >
                                            <Trash2 size={12} strokeWidth={2.2} />
                                        </button>
                                    </div>
                                </div>

                                {/* Description Body */}
                                <p className="mt-2.5 text-xs sm:text-[12.5px] leading-relaxed text-muted-foreground line-clamp-3">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
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
                <DialogContent className="max-w-md rounded-2xl p-5 sm:p-6">
                    <DialogHeader>
                        <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                            <SlidersHorizontal size={18} className="text-primary" />
                            <span>จัดการหมวดหมู่แบบฟอร์ม</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            เพิ่มหรือลบประเภทของแบบฟอร์มเพื่อการจัดหมวดหมู่อย่างเป็นระเบียบ
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {/* Add new category input */}
                        <div className="flex items-center gap-2">
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
                                className="h-9.5 px-3.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-medium cursor-pointer"
                            >
                                <FolderPlus size={15} className="mr-1" />
                                เพิ่ม
                            </Button>
                        </div>

                        {/* List of existing categories */}
                        <div className="max-h-60 overflow-y-auto space-y-1.5 border border-border rounded-xl p-2 bg-muted/20">
                            {categories.map((cat) => (
                                <div
                                    key={cat}
                                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-card border border-border/70 text-xs sm:text-sm"
                                >
                                    <span className="font-medium text-foreground">{cat}</span>
                                    {categories.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteCategory(cat)}
                                            title="ลบหมวดหมู่"
                                            className="text-muted-foreground hover:text-rose-500 p-1 rounded-md transition-colors cursor-pointer"
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
                <DialogContent className="max-w-lg rounded-2xl p-5 sm:p-6">
                    <DialogHeader>
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary w-fit mb-1">
                            <FileText size={12} />
                            <span>{viewingForm?.category}</span>
                        </div>
                        <DialogTitle className="text-base sm:text-lg font-bold leading-normal">
                            {viewingForm?.title}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3 py-2 text-xs sm:text-sm">
                        <div className="rounded-xl border border-border bg-muted/20 p-3.5">
                            <h4 className="font-semibold text-foreground mb-1">
                                รายละเอียดและวัตถุประสงค์
                            </h4>
                            <p className="text-muted-foreground leading-relaxed text-xs">
                                {viewingForm?.description}
                            </p>
                        </div>

                        <div className="rounded-xl border border-border/80 p-3.5 space-y-2 bg-card max-h-60 overflow-y-auto">
                            <h4 className="font-semibold text-foreground text-xs">
                                ข้อคำถามในแบบประเมิน ({viewingForm?.questions?.length || 0} ข้อ)
                            </h4>
                            {viewingForm?.questions?.length ? (
                                <ul className="space-y-2 text-xs text-muted-foreground">
                                    {viewingForm.questions.map((q) => (
                                        <li
                                            key={q.number || q.text}
                                            className="p-2 rounded-lg bg-muted/20 border border-border/40"
                                        >
                                            <p className="font-medium text-foreground">
                                                {q.number}. {q.text}
                                            </p>
                                            {q.options && (
                                                <p className="text-[11px] text-muted-foreground mt-1">
                                                    ตัวเลือก: {q.options.join(", ")}
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
                            className="rounded-lg text-xs sm:text-sm cursor-pointer"
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
                <DialogContent className="max-w-sm rounded-2xl p-5 sm:p-6">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-rose-600 flex items-center gap-1.5">
                            <AlertCircle size={18} />
                            <span>ยืนยันการลบแบบฟอร์ม</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            คุณแน่ใจหรือไม่ว่าต้องการลบแบบฟอร์ม "
                            <span className="font-semibold text-foreground">
                                {deletingForm?.title}
                            </span>
                            "? การกระทำนี้ไม่สามารถย้อนกลับได้
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="pt-2 flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDeletingForm(null)}
                            className="rounded-lg text-xs sm:text-sm cursor-pointer"
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleConfirmDelete}
                            className="rounded-lg text-xs sm:text-sm cursor-pointer bg-rose-600 hover:bg-rose-700 text-white"
                        >
                            ลบแบบฟอร์ม
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}