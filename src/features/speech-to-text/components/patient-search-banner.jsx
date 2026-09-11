import { useState, useRef, useEffect } from "react";
import {
    Search,
    User,
    UserCheck,
    X,
    ChevronDown,
    Copy,
    Check,
    AlertTriangle,
    Shield,
    Building2,
    Calendar,
    Phone,
    HeartPulse,
    RefreshCw,
    SlidersHorizontal,
    Sparkles,
    Stethoscope,
    ShieldAlert,
    Info,
    AlertOctagon,
    Pill,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { mockPatients } from "@/features/drg-worklist/data";
import dayjs from "@/lib/dayjs";

export { mockPatients };

export function PatientSearchBanner({
    selectedPatient,
    onSelectPatient,
    className = "",
    showPatientCard = true,
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isEditingMode, setIsEditingMode] = useState(!selectedPatient || !showPatientCard);
    const [filterCategory, setFilterCategory] = useState("ทั้งหมด");
    const [copiedField, setCopiedField] = useState(null);
    const [isAllergyModalOpen, setIsAllergyModalOpen] = useState(false);
    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const allergyCardRef = useRef(null);

    // Sync editing mode and search query when selectedPatient or showPatientCard changes
    useEffect(() => {
        if (!selectedPatient) {
            setIsEditingMode(true);
            setSearchQuery("");
        } else if (!showPatientCard) {
            setIsEditingMode(true);
            setSearchQuery(`${selectedPatient.hn} - ${selectedPatient.fullName}`);
        } else {
            setIsEditingMode(false);
        }
    }, [showPatientCard, selectedPatient]);

    // Close dropdown & allergy popover on click outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
            }
            if (allergyCardRef.current && !allergyCardRef.current.contains(e.target)) {
                setIsAllergyModalOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const todayStr = dayjs().format("YYYY-MM-DD");
    const yesterdayStr = dayjs().subtract(1, "day").format("YYYY-MM-DD");

    // Filter patient database based on query and quick category
    const filteredPatients = mockPatients.filter((p) => {
        const q = searchQuery.trim().toLowerCase();

        // Quick category filter
        const matchCategory =
            filterCategory === "ทั้งหมด" ||
            (filterCategory === "วันนี้" && (p.isToday || p.date === todayStr)) ||
            (filterCategory === "เมื่อวาน" && (p.isYesterday || p.date === yesterdayStr)) ||
            (filterCategory === "OPD" && p.department?.includes("OPD")) ||
            (filterCategory === "IPD" && p.department?.includes("IPD"));

        if (!matchCategory) return false;
        if (!q) return true;

        const cleanQ = q.replace(/[-\s]/g, "");
        const cleanCitizen = (p.citizenId || "").replace(/[-\s]/g, "");
        const cleanHn = (p.hn || "").toLowerCase().replace(/[-\s]/g, "");
        const cleanAn = (p.an || "").toLowerCase().replace(/[-\s]/g, "");

        // Match HN, AN, Citizen ID, Name, Doctor, Date, Diagnosis
        const matchHn = cleanHn.includes(cleanQ) || (p.hn && p.hn.toLowerCase().includes(q));
        const matchAn = cleanAn.includes(cleanQ) || (p.an && p.an.toLowerCase().includes(q));
        const matchCitizen = cleanCitizen.includes(cleanQ) || (p.citizenId && p.citizenId.includes(q));
        const matchName =
            (p.fullName && p.fullName.toLowerCase().includes(q)) ||
            (p.firstName && p.firstName.toLowerCase().includes(q)) ||
            (p.lastName && p.lastName.toLowerCase().includes(q));
        const matchDoctor = p.doctor && p.doctor.toLowerCase().includes(q);
        const matchDiagnosis = (p.diagnosis && p.diagnosis.toLowerCase().includes(q)) || (p.drg && p.drg.toLowerCase().includes(q));
        const matchDate = (p.date && p.date.includes(q)) || (q === "วันนี้" && (p.isToday || p.date === todayStr)) || (q === "เมื่อวาน" && (p.isYesterday || p.date === yesterdayStr));

        return matchHn || matchAn || matchCitizen || matchName || matchDoctor || matchDiagnosis || matchDate;
    });

    const getMatchReason = (p, query) => {
        if (!query) return null;
        const q = query.trim().toLowerCase();
        const cleanQ = q.replace(/[-\s]/g, "");
        const cleanCitizen = (p.citizenId || "").replace(/[-\s]/g, "");
        const cleanHn = (p.hn || "").toLowerCase().replace(/[-\s]/g, "");
        const cleanAn = (p.an || "").toLowerCase().replace(/[-\s]/g, "");

        if (cleanHn.includes(cleanQ) || (p.hn && p.hn.toLowerCase().includes(q))) {
            return { label: "HN", value: p.hn, color: "bg-primary/10 text-primary border-primary/20" };
        }
        if (cleanAn.includes(cleanQ) || (p.an && p.an.toLowerCase().includes(q))) {
            return { label: "AN", value: p.an, color: "bg-primary/10 text-primary border-primary/20" };
        }
        if (cleanCitizen.includes(cleanQ) || (p.citizenId && p.citizenId.includes(q))) {
            return { label: "เลขบัตร ปชช", value: p.citizenId, color: "bg-primary/10 text-primary border-primary/20" };
        }
        if (
            (p.fullName && p.fullName.toLowerCase().includes(q)) ||
            (p.firstName && p.firstName.toLowerCase().includes(q)) ||
            (p.lastName && p.lastName.toLowerCase().includes(q))
        ) {
            return { label: "ชื่อ-สกุล", value: p.fullName, color: "bg-primary/10 text-primary border-primary/20" };
        }
        if (p.doctor && p.doctor.toLowerCase().includes(q)) {
            return { label: "แพทย์ผู้ตรวจ", value: p.doctor, color: "bg-primary/10 text-primary border-primary/20" };
        }
        if (p.drg && p.drg.toLowerCase().includes(q)) {
            return { label: "DRG", value: p.drg, color: "bg-primary/10 text-primary border-primary/20" };
        }
        return null;
    };

    const handleCopy = (text, fieldName) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 1500);
    };

    const handleSelect = (patient) => {
        onSelectPatient(patient);
        setIsDropdownOpen(false);
        if (showPatientCard) {
            setIsEditingMode(false);
            setSearchQuery("");
        } else {
            setSearchQuery(`${patient.hn} - ${patient.fullName}`);
        }
    };

    return (
        <div ref={containerRef} className={`relative z-30 w-full ${className}`}>
            {/* When patient is selected & not in editing search mode */}
            {showPatientCard && selectedPatient && !isEditingMode ? (
                <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-border bg-card px-3.5 py-2.5 shadow-2xs transition-all">
                    {/* Left: Patient Avatar & Demographics */}
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-2xs">
                            <User size={20} />
                            <span
                                className={`absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full text-[9px] font-bold text-white border-2 border-card ${selectedPatient.gender === "ชาย" ? "bg-blue-600" : "bg-pink-500"
                                    }`}
                                title={`เพศ${selectedPatient.gender}`}
                            >
                                {selectedPatient.gender === "ชาย" ? "♂" : "♀"}
                            </span>
                        </div>

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-sm font-bold text-foreground tracking-tight truncate">
                                    {selectedPatient.fullName}
                                </h2>
                                <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-foreground/80">
                                    อายุ {selectedPatient.age} ปี ({selectedPatient.gender})
                                </span>
                                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary border border-primary/20">
                                    {selectedPatient.department}
                                </span>
                                {selectedPatient.doctor && (
                                    <span
                                        className="flex items-center gap-1 rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-[11px] font-semibold text-primary shadow-2xs"
                                        title={`แพทย์ผู้ตรวจ: ${selectedPatient.doctor}`}
                                    >
                                        <Stethoscope size={12} className="text-primary shrink-0" />
                                        <span>แพทย์: {selectedPatient.doctor}</span>
                                    </span>
                                )}
                            </div>

                            {/* ID Pills with Click-to-Copy */}
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                                <button
                                    type="button"
                                    onClick={() => handleCopy(selectedPatient.hn, "hn")}
                                    className="group flex items-center gap-1 rounded border border-border bg-card px-1.5 py-0.5 text-[11px] font-medium text-foreground hover:border-primary/40 hover:bg-muted transition cursor-pointer"
                                    title="คลิกเพื่อคัดลอก HN"
                                >
                                    <span className="text-[10px] font-semibold text-primary">HN:</span>
                                    <span className="font-mono">{selectedPatient.hn}</span>
                                    {copiedField === "hn" ? (
                                        <Check size={10} className="text-emerald-500" />
                                    ) : (
                                        <Copy size={9} className="opacity-40 group-hover:opacity-100 text-muted-foreground" />
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleCopy(selectedPatient.an, "an")}
                                    className="group flex items-center gap-1 rounded border border-border bg-card px-1.5 py-0.5 text-[11px] font-medium text-foreground hover:border-primary/40 hover:bg-muted transition cursor-pointer"
                                    title="คลิกเพื่อคัดลอก AN"
                                >
                                    <span className="text-[10px] font-semibold text-primary">AN:</span>
                                    <span className="font-mono">{selectedPatient.an}</span>
                                    {copiedField === "an" ? (
                                        <Check size={10} className="text-emerald-500" />
                                    ) : (
                                        <Copy size={9} className="opacity-40 group-hover:opacity-100 text-muted-foreground" />
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleCopy(selectedPatient.citizenId, "cid")}
                                    className="group flex items-center gap-1 rounded border border-border bg-card px-1.5 py-0.5 text-[11px] font-medium text-foreground hover:border-primary/40 hover:bg-muted transition cursor-pointer"
                                    title="คลิกเพื่อคัดลอกเลขบัตรประชาชน"
                                >
                                    <span className="text-[10px] font-semibold text-primary">เลขบัตร:</span>
                                    <span className="font-mono">{selectedPatient.citizenId}</span>
                                    {copiedField === "cid" ? (
                                        <Check size={10} className="text-emerald-500" />
                                    ) : (
                                        <Copy size={9} className="opacity-40 group-hover:opacity-100 text-muted-foreground" />
                                    )}
                                </button>

                                <span className="rounded bg-primary/10 border border-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                    สิทธิ : {selectedPatient.rights}
                                </span>

                                {selectedPatient.date && (
                                    <span className="rounded bg-muted border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                        วันที่ : {selectedPatient.isToday ? "วันนี้" : selectedPatient.isYesterday ? "เมื่อวาน" : dayjs(selectedPatient.date).format("D MMM BBBB")}
                                    </span>
                                )}

                                {selectedPatient.allergies && selectedPatient.allergies !== "ไม่มีประวัติแพ้ยา" && (
                                    <div className="relative inline-block" ref={allergyCardRef}>
                                        <button
                                            type="button"
                                            onClick={() => setIsAllergyModalOpen((prev) => !prev)}
                                            className={`cursor-pointer flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold transition shadow-2xs border ${isAllergyModalOpen
                                                ? "bg-rose-600 text-white border-rose-700 ring-2 ring-rose-200"
                                                : "bg-rose-50 border-rose-300/80 text-rose-700 hover:bg-rose-100 hover:border-rose-400"
                                                }`}
                                            title="คลิกเพื่อดูรายละเอียดประวัติการแพ้ยาแบบครบถ้วน"
                                        >
                                            <AlertTriangle size={11} className={isAllergyModalOpen ? "text-white" : "text-rose-600 shrink-0 animate-pulse"} />
                                            <span className="shrink-0">แพ้ยา:</span>
                                            <span
                                                className="max-w-[130px] sm:max-w-[190px] md:max-w-[240px] truncate text-left"
                                                title={selectedPatient.allergyDetails && selectedPatient.allergyDetails.length > 0
                                                    ? selectedPatient.allergyDetails.map((d) => d.drug).join(", ")
                                                    : selectedPatient.allergies}
                                            >
                                                {selectedPatient.allergyDetails && selectedPatient.allergyDetails.length > 0
                                                    ? selectedPatient.allergyDetails.map((d) => d.drug).join(", ")
                                                    : selectedPatient.allergies}
                                            </span>
                                            <span className="rounded bg-rose-200/70 text-rose-900 px-1 py-0.2 text-[9px] font-extrabold shrink-0">
                                                ดูข้อมูล
                                            </span>
                                        </button>

                                        {/* Drug Allergy Popover Card */}
                                        {isAllergyModalOpen && (
                                            <div className="absolute top-full left-0 mt-1.5 z-50 w-80 sm:w-96 max-w-[calc(100vw-2rem)] rounded-xl border border-rose-500/30 bg-popover p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                                                {/* Header */}
                                                <div className="flex items-center justify-between border-b border-rose-500/20 pb-2 mb-2">
                                                    <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                                                        <ShieldAlert size={16} className="text-rose-500" />
                                                        <h4 className="text-xs font-bold text-foreground">
                                                            ประวัติการแพ้ยา (Drug Allergy Profile)
                                                        </h4>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsAllergyModalOpen(false)}
                                                        className="cursor-pointer rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>

                                                {/* Patient Info Sub-header */}
                                                <div className="mb-2.5 flex items-center justify-between rounded-lg bg-rose-500/10 px-2.5 py-1.5 text-[10px] text-rose-600 dark:text-rose-300 border border-rose-500/20">
                                                    <span className="font-semibold">{selectedPatient.fullName} (HN: {selectedPatient.hn})</span>
                                                    <span className="text-[9px] text-rose-500">ข้อควรระวังพิเศษทางคลินิก</span>
                                                </div>

                                                {/* Allergies List */}
                                                <div className="space-y-2 max-h-60 overflow-y-auto pr-0.5 scrollbar-thin">
                                                    {selectedPatient.allergyDetails && selectedPatient.allergyDetails.length > 0 ? (
                                                        selectedPatient.allergyDetails.map((item, idx) => {
                                                            const isLifeThreatening = item.severity === "Life-threatening";
                                                            const isSevere = item.severity === "Severe";
                                                            const badgeColor = isLifeThreatening
                                                                ? "bg-red-600 text-white"
                                                                : isSevere
                                                                    ? "bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30"
                                                                    : "bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30";

                                                            return (
                                                                <div
                                                                    key={idx}
                                                                    className="rounded-lg border border-border bg-muted/40 p-2 text-[10px] transition hover:bg-rose-500/10"
                                                                >
                                                                    <div className="flex items-start justify-between gap-1.5">
                                                                        <div className="min-w-0">
                                                                            <p className="font-bold text-foreground flex items-center gap-1">
                                                                                <Pill size={11} className="text-rose-500 shrink-0" />
                                                                                <span>{item.drug}</span>
                                                                            </p>
                                                                            <p className="text-[9px] text-muted-foreground">{item.group}</p>
                                                                        </div>

                                                                        <span className={`rounded px-1.5 py-0.5 text-[8px] font-bold shrink-0 ${badgeColor}`}>
                                                                            {item.severity}
                                                                        </span>
                                                                    </div>

                                                                    <div className="mt-1.5 rounded bg-card p-1.5 border border-border text-foreground">
                                                                        <p className="font-semibold text-rose-600 dark:text-rose-400 text-[9px] mb-0.5">อาการที่แพ้ / อาการแสดง:</p>
                                                                        <p className="text-muted-foreground leading-relaxed text-[10px]">{item.reaction}</p>
                                                                    </div>

                                                                    <div className="mt-1 flex items-center justify-between text-[8px] text-muted-foreground">
                                                                        <span>บันทึกเมื่อ: {item.date}</span>
                                                                        <span>{item.hospital}</span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        <div className="rounded-lg border border-border p-2.5 text-[11px] text-foreground bg-rose-500/10">
                                                            <p className="font-bold text-rose-600 dark:text-rose-400 mb-1">ยาที่ระบุในบันทึก:</p>
                                                            <p className="text-muted-foreground">{selectedPatient.allergies}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                setIsEditingMode(true);
                                setTimeout(() => inputRef.current?.focus(), 50);
                            }}
                            className="cursor-pointer h-7.5 gap-1.5 rounded-lg border-primary/30 bg-card px-2.5 text-xs font-semibold text-primary hover:bg-primary/10 shadow-2xs"
                        >
                            <Search size={13} />
                            <span>ค้นหาผู้ป่วย</span>
                        </Button>

                        <button
                            type="button"
                            onClick={() => onSelectPatient(null)}
                            className="cursor-pointer flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-destructive transition"
                            title="ล้างข้อมูลผู้ป่วย"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
            ) : (
                /* Search Input Bar Mode */
                <div className="relative rounded-xl border border-border bg-card p-2 sm:p-2.5 shadow-2xs transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Search Input Box */}
                        <div className="relative flex-1 min-w-[240px]">
                            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setIsDropdownOpen(true);
                                }}
                                onFocus={() => setIsDropdownOpen(true)}
                                placeholder="ค้นหาผู้ป่วยด้วย HN, AN, เลขบัตร ปชช, ชื่อ-สกุล หรือชื่อแพทย์ผู้ตรวจ..."
                                className="h-9 w-full rounded-lg bg-muted/40 pl-9 pr-8 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:bg-card border border-transparent focus:border-border"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery("");
                                        if (!showPatientCard) {
                                            onSelectPatient(null);
                                        }
                                    }}
                                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Search Tag Badges */}
                        <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground shrink-0">
                            <span>ค้นหาจาก:</span>
                            <span className="rounded bg-primary/10 border border-primary/20 px-1.5 py-0.5 text-[10px] font-bold text-primary">HN</span>
                            <span className="rounded bg-primary/10 border border-primary/20 px-1.5 py-0.5 text-[10px] font-bold text-primary">AN</span>
                            <span className="rounded bg-primary/10 border border-primary/20 px-1.5 py-0.5 text-[10px] font-bold text-primary">เลขบัตร ปชช</span>
                            <span className="rounded bg-primary/10 border border-primary/20 px-1.5 py-0.5 text-[10px] font-bold text-primary">ชื่อ-สกุล</span>
                            <span className="rounded bg-primary/10 border border-primary/20 px-1.5 py-0.5 text-[10px] font-bold text-primary">แพทย์ผู้ตรวจ</span>
                        </div>

                        {/* Quick filter chips */}
                        <div className="flex flex-wrap items-center gap-1 text-xs shrink-0">
                            {["ทั้งหมด", "วันนี้", "เมื่อวาน", "OPD", "IPD"].map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => {
                                        setFilterCategory(cat);
                                        setIsDropdownOpen(true);
                                    }}
                                    className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold transition ${filterCategory === cat
                                        ? "bg-primary text-primary-foreground shadow-2xs font-bold"
                                        : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {selectedPatient && showPatientCard && (
                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => setIsEditingMode(false)}
                                className="cursor-pointer h-8 text-xs text-muted-foreground hover:text-foreground shrink-0"
                            >
                                ยกเลิก
                            </Button>
                        )}
                    </div>

                    {/* Autocomplete Dropdown */}
                    {isDropdownOpen && (
                        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-[380px] overflow-y-auto rounded-xl border border-border bg-popover p-2 shadow-2xl ring-1 ring-black/10 scrollbar-thin">
                            <div className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-muted-foreground border-b border-border/80 mb-1.5">
                                <span>
                                    {searchQuery
                                        ? `ผลการค้นหา (${filteredPatients.length} รายการ)`
                                        : `รายชื่อผู้ป่วยล่าสุด (${filteredPatients.length} รายการ)`}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-normal">คลิกเลือกเพื่อบันทึกข้อมูล</span>
                            </div>

                            {filteredPatients.length > 0 ? (
                                <div className="space-y-1">
                                    {filteredPatients.map((patient) => {
                                        const matchInfo = getMatchReason(patient, searchQuery);
                                        const isCurrent = selectedPatient?.id === patient.id;

                                        return (
                                            <div
                                                key={patient.id}
                                                onClick={() => handleSelect(patient)}
                                                className={`group relative flex cursor-pointer items-center justify-between rounded-xl p-2.5 transition ${isCurrent
                                                    ? "bg-primary/[0.12] border border-primary/40 shadow-xs"
                                                    : "hover:bg-muted/60 border border-transparent hover:border-border"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                                    <div
                                                        className={`flex size-9 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${patient.gender === "ชาย"
                                                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                                            : "bg-pink-500/10 text-pink-600 dark:text-pink-400"
                                                            }`}
                                                    >
                                                        {patient.gender === "ชาย" ? "♂" : "♀"}
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-center gap-1.5">
                                                            <span className="font-bold text-xs sm:text-sm text-foreground group-hover:text-primary transition">
                                                                {patient.fullName}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                (อายุ {patient.age} ปี)
                                                            </span>
                                                            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                                                {patient.department}
                                                            </span>
                                                            {patient.doctor && (
                                                                <span className="flex items-center gap-1 rounded bg-primary/10 border border-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                                                                    <Stethoscope size={11} className="text-primary shrink-0" />
                                                                    <span>{patient.doctor}</span>
                                                                </span>
                                                            )}
                                                            {matchInfo && (
                                                                <span
                                                                    className={`rounded border px-1.5 py-0.2 text-[10px] font-bold ${matchInfo.color}`}
                                                                >
                                                                    ตรงกับ {matchInfo.label}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Details Row */}
                                                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                                                            <span className={`rounded px-1.5 py-0.2 text-[10px] font-semibold ${patient.isToday ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : patient.isYesterday ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" : "bg-muted text-muted-foreground"}`}>
                                                                {patient.isToday ? "วันนี้" : patient.isYesterday ? "เมื่อวาน" : (patient.date ? dayjs(patient.date).format("D MMM BBBB") : "-")}
                                                            </span>
                                                            <span>•</span>
                                                            <span>
                                                                <strong className="text-primary">HN:</strong> {patient.hn}
                                                            </span>
                                                            <span>•</span>
                                                            <span>
                                                                <strong className="text-primary">AN:</strong> {patient.an}
                                                            </span>
                                                            <span>•</span>
                                                            <span>
                                                                <strong className="text-primary">บัตร ปชช:</strong> {patient.citizenId}
                                                            </span>
                                                            <span>•</span>
                                                            <span className="text-primary font-medium">
                                                                {patient.rights}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0 pl-2">
                                                    {patient.allergies && patient.allergies !== "ไม่มีประวัติแพ้ยา" && (
                                                        <span className="hidden md:inline-flex rounded bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 text-[10px] font-medium text-rose-600 dark:text-rose-400">
                                                            แพ้ยา
                                                        </span>
                                                    )}
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        className={`h-7 px-3 text-xs rounded-lg font-semibold cursor-pointer ${isCurrent
                                                            ? "bg-primary text-white"
                                                            : "bg-slate-100 text-slate-700 group-hover:bg-primary group-hover:text-white"
                                                            }`}
                                                    >
                                                        {isCurrent ? "เลือกอยู่" : "เลือก"}
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <User className="mx-auto size-8 text-slate-300 mb-2" />
                                    <p className="text-xs font-semibold text-slate-600">
                                        ไม่พบข้อมูลผู้ป่วยที่ตรงกับคำค้นหา "{searchQuery}"
                                    </p>
                                    <p className="mt-1 text-[11px] text-slate-400">
                                        กรุณาตรวจสอบ HN, AN, เลขบัตรประชาชน, ชื่อ-นามสกุล หรือชื่อแพทย์ผู้ตรวจอีกครั้ง
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
