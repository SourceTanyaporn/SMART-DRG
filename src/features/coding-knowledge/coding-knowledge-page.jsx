import React, { useState, useMemo } from "react";
import {
  BookOpen,
  Search,
  Copy,
  Check,
  Filter,
  Download,
  AlertTriangle,
  ShieldAlert,
  FileCheck2,
  Stethoscope,
  TrendingUp,
  FileText,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info,
  Layers,
  Table as TableIcon,
  LayoutGrid,
  CheckSquare,
  Calculator,
  ArrowRight,
  BookMarked,
  X,
  Loader2,
  Bot,
  Plus,
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
import { Select } from "@/components/ui/select";
import { toast } from "@/components/ui/toast-notification";
import {
  codingGuidelinesData,
  KNOWLEDGE_CATEGORIES,
  DRG_IMPACT_LEVELS,
  QUICK_AUDIT_CHECKLISTS,
} from "./data/coding-knowledge-data";
import { queryAiCodingGuideline } from "./services/coding-ai-service";

export function CodingKnowledgePage() {
  const [guidelines, setGuidelines] = useState(() => codingGuidelinesData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedImpact, setSelectedImpact] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table' | 'checklist'
  const [selectedGuideline, setSelectedGuideline] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState("criteria"); // 'criteria' | 'rules' | 'audit' | 'example'

  // AI Assistant state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiInputQuery, setAiInputQuery] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiModalTab, setAiModalTab] = useState("criteria");

  // Quick Calculator state (KDIGO AKI helper)
  const [calcBaselineCr, setCalcBaselineCr] = useState("");
  const [calcCurrentCr, setCalcCurrentCr] = useState("");

  // AI query handler
  const handleRunAiSearch = async (queryText) => {
    const q = (queryText || aiInputQuery || "").trim();
    if (!q) {
      toast.error("กรุณากรอกคำค้นหาหรือชื่อโรคที่ต้องการสอบถาม");
      return;
    }
    setIsAiLoading(true);
    try {
      const res = await queryAiCodingGuideline(q);
      setAiResult(res);
      setAiModalTab("criteria");
      toast.success(`วิเคราะห์แนวทางสำหรับ "${q}" เรียบร้อยแล้ว`);
    } catch (err) {
      toast.error(err.message || "ไม่สามารถดึงข้อมูลจาก AI ได้");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Add AI result into current guidelines list
  const handleSaveAiResultToGuidelines = () => {
    if (!aiResult) return;
    const exists = guidelines.some((g) => g.code === aiResult.code || g.id === aiResult.id);
    if (!exists) {
      setGuidelines((prev) => [aiResult, ...prev]);
      toast.success(`เพิ่ม "${aiResult.title}" เข้าคลังความรู้หน้านี้แล้ว`);
    } else {
      toast.info(`มีแนวทางนี้อยู่ในคลังความรู้แล้ว`);
    }
    setSelectedGuideline(aiResult);
    setIsAiModalOpen(false);
  };

  // Copy code handler
  const handleCopyCode = (code, e) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`คัดลอกรหัส "${code}" สู่คลิปบอร์ดแล้ว`);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  // Filter logic
  const filteredGuidelines = useMemo(() => {
    return guidelines.filter((item) => {
      // Category filter
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }

      // DRG Impact filter
      if (selectedImpact !== "all") {
        if (selectedImpact === "high-audit") {
          if (item.auditRiskLevel !== "high") return false;
        } else if (item.drgImpact !== selectedImpact) {
          return false;
        }
      }

      // Search term
      if (searchTerm.trim() !== "") {
        const q = searchTerm.toLowerCase().trim();
        const matchCode = item.code.toLowerCase().includes(q);
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchTitleEn = item.titleEn.toLowerCase().includes(q);
        const matchSummary = item.summary.toLowerCase().includes(q);
        const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));
        return matchCode || matchTitle || matchTitleEn || matchSummary || matchTags;
      }

      return true;
    });
  }, [guidelines, selectedCategory, selectedImpact, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    const total = guidelines.length;
    const mccCount = guidelines.filter((g) => g.drgImpact === "mcc").length;
    const ccCount = guidelines.filter((g) => g.drgImpact === "cc").length;
    const highAuditCount = guidelines.filter((g) => g.auditRiskLevel === "high").length;
    return { total, mccCount, ccCount, highAuditCount };
  }, [guidelines]);

  // Calculator logic for KDIGO AKI
  const kdigoResult = useMemo(() => {
    const base = parseFloat(calcBaselineCr);
    const curr = parseFloat(calcCurrentCr);
    if (!base || !curr || base <= 0 || curr <= 0) return null;

    const diff = curr - base;
    const ratio = curr / base;

    if (ratio >= 3.0 || curr >= 4.0) {
      return {
        stage: "Stage 3 (Severe)",
        color: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800",
        desc: `Cr เพิ่มขึ้น ${ratio.toFixed(1)}x ของ Baseline หรือ ≥ 4.0 mg/dL (เข้าเกณฑ์รหัส N17.9 / N17.0 - Comorbidity CC)`,
      };
    } else if (ratio >= 2.0) {
      return {
        stage: "Stage 2 (Moderate)",
        color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800",
        desc: `Cr เพิ่มขึ้น ${ratio.toFixed(1)}x ของ Baseline (2.0 - 2.9 เท่า) (เข้าเกณฑ์รหัส N17.9 - Comorbidity CC)`,
      };
    } else if (ratio >= 1.5 || diff >= 0.3) {
      return {
        stage: "Stage 1 (Mild)",
        color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800",
        desc: `Cr เพิ่มขึ้น ${diff.toFixed(2)} mg/dL หรือ ${ratio.toFixed(1)}x (≥ 0.3 mg/dL หรือ 1.5 - 1.9 เท่า)`,
      };
    } else {
      return {
        stage: "ไม่เข้าเกณฑ์ AKI",
        color: "text-slate-600 dark:text-slate-400 bg-muted border-border",
        desc: "การเปลี่ยนแปลงของค่า Creatinine ยังไม่ถึงเกณฑ์ขั้นต่ำตาม KDIGO",
      };
    }
  }, [calcBaselineCr, calcCurrentCr]);

  const drgImpactOptions = useMemo(
    () => DRG_IMPACT_LEVELS.map((lvl) => ({ value: lvl.id, label: lvl.label })),
    []
  );

  return (
    <div className="w-full space-y-4 p-2 sm:p-4 bg-background">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-primary/10 text-primary shrink-0 shadow-2xs">
            <BookOpen size={22} />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <span>คลังความรู้การให้รหัสโรค (Coding Knowledge & Clinical Guidelines)</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                ICD-10-TM & TCG 2024
              </span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              ศูนย์รวมแนวทางการให้รหัสโรค ICD-10, เกณฑ์ทางคลินิก, จุดที่มักถูกทักท้วง Audit และตัวอย่างเวชระเบียนที่ถูกต้อง
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border/70 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${viewMode === "grid"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <LayoutGrid size={14} />
              <span>การ์ด</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${viewMode === "table"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <TableIcon size={14} />
              <span>ตารางเทียบ</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("checklist")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${viewMode === "checklist"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <CheckSquare size={14} />
              <span>Audit Checklist</span>
            </button>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={() => {
              setAiInputQuery(searchTerm || "");
              setIsAiModalOpen(true);
              if (searchTerm && !aiResult) {
                handleRunAiSearch(searchTerm);
              }
            }}
            className="h-8.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold cursor-pointer shadow-2xs gap-1.5 hover:opacity-90"
          >
            <Sparkles size={14} className="text-amber-300 animate-pulse" />
            <span>ถาม AI วิเคราะห์รหัสโรค</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => toast.info("กำลังดาวน์โหลดคู่มือ Thai Coding Guidelines 2024 ฉบับสมบูรณ์ (PDF)...")}
            className="h-8.5 rounded-xl border-border bg-card text-xs font-medium cursor-pointer shadow-2xs gap-1.5"
          >
            <Download size={14} />
            <span className="hidden sm:inline">ดาวน์โหลดคู่มือ</span>
          </Button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-border bg-card shadow-2xs">
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-muted-foreground block truncate">
              แนวทางรหัสโรคทั้งหมด
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-bold text-foreground">
                {stats.total}
              </span>
              <span className="text-[10.5px] text-primary font-medium truncate">
                หัวข้อโรค
              </span>
            </div>
          </div>
          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
            <BookMarked size={16} />
          </div>
        </div>

        <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-border bg-card shadow-2xs">
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-muted-foreground block truncate">
              Major CC (MCC) รุนแรง
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-bold text-foreground">
                {stats.mccCount}
              </span>
              <span className="text-[10.5px] text-rose-600 dark:text-rose-400 font-medium truncate">
                ผลกระทบ RW สูงสุด
              </span>
            </div>
          </div>
          <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 shrink-0">
            <TrendingUp size={16} />
          </div>
        </div>

        <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-border bg-card shadow-2xs">
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-muted-foreground block truncate">
              Comorbidity (CC) โรคร่วม
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-bold text-foreground">
                {stats.ccCount}
              </span>
              <span className="text-[10.5px] text-amber-600 dark:text-amber-400 font-medium truncate">
                เพิ่มค่าน้ำหนัก DRG
              </span>
            </div>
          </div>
          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
            <Layers size={16} />
          </div>
        </div>

        <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-border bg-card shadow-2xs">
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-muted-foreground block truncate">
              จุดเสี่ยง Audit & C-Code
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-bold text-foreground">
                {stats.highAuditCount}
              </span>
              <span className="text-[10.5px] text-purple-600 dark:text-purple-400 font-medium truncate">
                เฝ้าระวังเข้มงวด
              </span>
            </div>
          </div>
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 shrink-0">
            <ShieldAlert size={16} />
          </div>
        </div>
      </div>

      {/* Filter and Search Container */}
      <div className="p-3 sm:p-4 rounded-2xl border border-border shadow-2xs space-y-3 bg-card relative z-30">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full lg:max-w-md">
            <Input
              type="text"
              placeholder="ค้นหารหัส ICD-10 (เช่น A41, N17, E43), ชื่อโรคภาษาไทย / อังกฤษ, หรือแท็ก..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 rounded-xl border-border bg-background pl-3.5 pr-9 text-xs placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary shadow-2xs"
            />
            {searchTerm ? (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={14} />
              </button>
            ) : null}
          </div>

          {/* Select DRG Impact Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-semibold shrink-0">
              ผลกระทบ DRG:
            </span>
            <div className="w-44 shrink-0">
              <Select
                value={selectedImpact}
                onChange={(val) => setSelectedImpact(val || "all")}
                options={drgImpactOptions}
                triggerClassName="h-8.5 rounded-xl border-border bg-background text-xs font-medium shadow-2xs"
                placeholder="ระดับความสำคัญทั้งหมด"
              />
            </div>
          </div>
        </div>

        {/* Category Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <span className="text-xs font-semibold text-muted-foreground mr-1 shrink-0">
            หมวดหมู่:
          </span>
          <TabsList variant="pill" className="gap-1.5 py-0.5">
            {KNOWLEDGE_CATEGORIES.map((cat) => (
              <Tab
                key={cat.id}
                variant="pill"
                size="sm"
                label={cat.label}
                active={selectedCategory === cat.id}
                onClick={() => setSelectedCategory(cat.id)}
              />
            ))}
          </TabsList>
        </div>

        {/* Active Filter Tags */}
        {(selectedCategory !== "all" || selectedImpact !== "all" || searchTerm) && (
          <div className="flex items-center gap-2 pt-2 border-t border-border/40 text-xs text-muted-foreground flex-wrap">
            <span className="font-semibold text-foreground text-[11.5px]">ตัวกรองที่เลือก:</span>
            {selectedCategory !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-foreground font-medium text-[11px]">
                <span>{KNOWLEDGE_CATEGORIES.find((c) => c.id === selectedCategory)?.label}</span>
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className="hover:text-rose-500 cursor-pointer ml-0.5"
                >
                  <X size={11} />
                </button>
              </span>
            )}
            {selectedImpact !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-foreground font-medium text-[11px]">
                <span>{DRG_IMPACT_LEVELS.find((i) => i.id === selectedImpact)?.label}</span>
                <button
                  type="button"
                  onClick={() => setSelectedImpact("all")}
                  className="hover:text-rose-500 cursor-pointer ml-0.5"
                >
                  <X size={11} />
                </button>
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium text-[11px]">
                <span>คำค้นหา: "{searchTerm}"</span>
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="hover:text-rose-500 cursor-pointer ml-0.5"
                >
                  <X size={11} />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setSelectedImpact("all");
              }}
              className="text-primary hover:underline text-[11px] font-semibold cursor-pointer ml-auto"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {viewMode === "grid" && (
        /* =================================================================== */
        /* Grid Cards View                                                     */
        /* =================================================================== */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredGuidelines.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedGuideline(item)}
              className="flex flex-col justify-between p-4 rounded-2xl border border-border bg-card shadow-2xs hover:shadow-md hover:border-primary/40 transition-all duration-200 cursor-pointer group relative"
            >
              <div>
                {/* Header Row: ICD Code & DRG Badge */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-mono text-xs font-bold shadow-xs">
                      {item.code}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleCopyCode(item.pdxCode || item.code.split(" ")[0], e)}
                      title="คัดลอกรหัส ICD-10"
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                      {copiedCode === (item.pdxCode || item.code.split(" ")[0]) ? (
                        <Check size={13} className="text-emerald-600" />
                      ) : (
                        <Copy size={13} />
                      )}
                    </button>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-md text-[10.5px] font-semibold border shrink-0 ${item.drgImpact === "mcc"
                      ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40"
                      : item.drgImpact === "cc"
                        ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40"
                        : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40"
                      }`}
                  >
                    {item.drgImpactLabel}
                  </span>
                </div>

                {/* Title & English Title */}
                <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-[11.5px] text-muted-foreground font-medium line-clamp-1 mb-2">
                  {item.titleEn}
                </p>

                {/* Summary */}
                <p className="text-xs text-muted-foreground/90 line-clamp-2 leading-relaxed mb-3">
                  {item.summary}
                </p>

                {/* Key Clinical Criteria Snippet */}
                <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-1 mb-3">
                  <div className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                    <span>เกณฑ์สำคัญ (Clinical Criteria):</span>
                  </div>
                  <p className="text-[11.5px] text-muted-foreground line-clamp-2 pl-4">
                    {item.clinicalCriteria[0]}
                  </p>
                </div>
              </div>

              {/* Card Footer: RW Boost, Audit Risk & View Button */}
              <div className="pt-2.5 border-t border-border/50 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-muted-foreground font-medium">AdjRW:</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {item.estimatedRwBoost}
                  </span>
                </div>

                {item.auditRiskLevel === "high" && (
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-rose-600 dark:text-rose-400">
                    <AlertTriangle size={11} />
                    <span>เสี่ยง Audit</span>
                  </span>
                )}

                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary group-hover:translate-x-0.5 transition-transform ml-auto">
                  <span>ดูแนวทางเต็ม</span>
                  <ArrowRight size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === "table" && (
        /* =================================================================== */
        /* Table Comparison View                                               */
        /* =================================================================== */
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-muted/30 border-b border-border text-muted-foreground font-semibold">
                  <th className="py-3 px-4 w-[140px]">รหัส ICD-10</th>
                  <th className="py-3 px-4 w-[240px]">ชื่อโรค / หัวข้อแนวทาง</th>
                  <th className="py-3 px-4 w-[130px]">หมวดหมู่</th>
                  <th className="py-3 px-4 w-[130px] text-center">ผลกระทบ DRG</th>
                  <th className="py-3 px-4 w-[110px] text-center">ผลต่อ RW</th>
                  <th className="py-3 px-4">ข้อควรระวังในการ Audit</th>
                  <th className="py-3 px-4 w-[100px] text-center">การกระทำ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredGuidelines.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedGuideline(item)}
                    className="hover:bg-muted/20 transition-colors group cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-foreground">
                      <div className="flex items-center gap-1.5">
                        <span>{item.pdxCode || item.code}</span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyCode(item.pdxCode || item.code.split(" ")[0], e)}
                          title="คัดลอกรหัส"
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground cursor-pointer transition-opacity"
                        >
                          <Copy size={11} />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-muted-foreground font-medium truncate max-w-xs">
                        {item.titleEn}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {item.categoryLabel}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10.5px] font-semibold border ${item.drgImpact === "mcc"
                          ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40"
                          : item.drgImpact === "cc"
                            ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40"
                            : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40"
                          }`}
                      >
                        {item.drgImpactLabel}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-emerald-600 dark:text-emerald-400">
                      {item.estimatedRwBoost}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      <p className="line-clamp-2 text-[11.5px]">{item.auditPitfalls[0]}</p>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-primary font-semibold text-xs inline-flex items-center gap-1 group-hover:underline">
                        <span>ดูแนวทาง</span>
                        <ArrowRight size={12} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewMode === "checklist" && (
        /* =================================================================== */
        /* Audit Checklist & Quick Criteria Calculator View                    */
        /* =================================================================== */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left 2 Columns: Pre-discharge Audit Checklists */}
          <div className="lg:col-span-2 space-y-3.5">
            <div className="p-4 rounded-2xl border border-border bg-card shadow-2xs">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <FileCheck2 size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Pre-Discharge Coding Checklist (เกณฑ์เช็คก่อนจำหน่าย)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    ตรวจสอบความถูกต้องของเวชระเบียนก่อนส่งเคลม e-Claim เพื่อลดการถูกปฏิเสธและหักเงิน Audit
                  </p>
                </div>
              </div>
            </div>

            {QUICK_AUDIT_CHECKLISTS.map((chk) => (
              <div
                key={chk.id}
                className="p-4 rounded-2xl border border-border bg-card shadow-2xs space-y-3"
              >
                <h4 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                  <span className="size-2 rounded-full bg-primary shrink-0" />
                  <span>{chk.title}</span>
                </h4>
                <div className="space-y-2 pl-4">
                  {chk.items.map((item, idx) => (
                    <label
                      key={idx}
                      className="flex items-start gap-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5 size-4 rounded border-border text-primary focus:ring-primary cursor-pointer accent-primary"
                      />
                      <span className="leading-relaxed">{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Interactive Quick Calculator (KDIGO AKI) */}
          <div className="space-y-3.5">
            <div className="p-4 rounded-2xl border border-border bg-card shadow-2xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <Calculator size={18} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-foreground">
                    เครื่องมือช่วยจัดระยะ AKI (KDIGO Calculator)
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    เปรียบเทียบค่า Cr เพื่อระบุระยะของไตวายเฉียบพลัน
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">
                    Baseline Creatinine (mg/dL) เดิม
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="เช่น 1.0"
                    value={calcBaselineCr}
                    onChange={(e) => setCalcBaselineCr(e.target.value)}
                    className="h-8.5 text-xs rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">
                    Current / Peak Creatinine (mg/dL) ล่าสุด
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="เช่น 2.5"
                    value={calcCurrentCr}
                    onChange={(e) => setCalcCurrentCr(e.target.value)}
                    className="h-8.5 text-xs rounded-xl"
                  />
                </div>

                {kdigoResult && (
                  <div className={`p-3 rounded-xl border text-xs space-y-1 mt-3 ${kdigoResult.color}`}>
                    <div className="font-bold flex items-center gap-1.5">
                      <Sparkles size={13} />
                      <span>ผลการคำนวณ: {kdigoResult.stage}</span>
                    </div>
                    <p className="text-[11.5px] leading-relaxed">
                      {kdigoResult.desc}
                    </p>
                  </div>
                )}

                <div className="pt-2 text-[11px] text-muted-foreground space-y-1">
                  <span className="font-semibold text-foreground block">เกณฑ์อ้างอิง KDIGO:</span>
                  <p>• Stage 1: Cr เพิ่ม ≥ 0.3 mg/dL หรือ 1.5 - 1.9 เท่า</p>
                  <p>• Stage 2: Cr เพิ่ม 2.0 - 2.9 เท่า</p>
                  <p>• Stage 3: Cr เพิ่ม ≥ 3.0 เท่า หรือ Cr ≥ 4.0 mg/dL</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredGuidelines.length === 0 && (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-6 sm:p-8 text-center space-y-3">
          <div className="p-3 rounded-2xl bg-muted/60 text-muted-foreground">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">ไม่พบคลังความรู้ที่ตรงกับคำค้นหา</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              {searchTerm
                ? `ไม่พบรหัสโรคที่ตรงกับ "${searchTerm}" ในรายการมาตรฐานหลัก`
                : "ลองปรับคำค้นหา หรือเลือกหมวดหมู่อื่นเพื่อค้นหาแนวทางการให้รหัสโรค"}
            </p>
          </div>

          {searchTerm && (
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 max-w-md w-full text-center space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-center gap-1.5 text-primary text-xs font-bold">
                <Sparkles size={15} className="animate-pulse" />
                <span>ให้ AI ช่วยวิเคราะห์แนวทางและเกณฑ์ Audit สำหรับ "{searchTerm}"</span>
              </div>
              <p className="text-[11.5px] text-muted-foreground">
                AI จะช่วยจัดหารหัส ICD-10, เกณฑ์ทางคลินิก, ผลต่อ DRG, จุดระวัง Audit ป้องกันถูกตัดเงิน และร่างตัวอย่าง Note แพทย์ให้ทันที
              </p>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setAiInputQuery(searchTerm);
                  setIsAiModalOpen(true);
                  handleRunAiSearch(searchTerm);
                }}
                className="w-full text-xs rounded-xl shadow-xs gap-1.5 cursor-pointer"
              >
                <Sparkles size={13} />
                <span>วิเคราะห์โรคนี้ด้วย AI ทันที</span>
              </Button>
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("all");
              setSelectedImpact("all");
            }}
            className="rounded-xl text-xs cursor-pointer"
          >
            ล้างตัวกรองทั้งหมด
          </Button>
        </div>
      )}

      <Dialog open={!!selectedGuideline} onOpenChange={(open) => !open && setSelectedGuideline(null)}>
        <DialogContent className="w-[95vw] sm:max-w-4xl md:max-w-5xl lg:max-w-6xl rounded-2xl p-5 sm:p-6 bg-card max-h-[92vh] flex flex-col">
          {selectedGuideline && (
            <>
              <DialogHeader className="pb-3 border-b border-border/50 shrink-0 pr-10">
                <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-mono text-xs font-bold shadow-xs">
                      {selectedGuideline.code}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleCopyCode(selectedGuideline.pdxCode || selectedGuideline.code.split(" ")[0], e)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                    >
                      <Copy size={12} />
                      <span>คัดลอกรหัส</span>
                    </button>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${selectedGuideline.drgImpact === "mcc"
                      ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40"
                      : selectedGuideline.drgImpact === "cc"
                        ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40"
                        : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40"
                      }`}
                  >
                    {selectedGuideline.drgImpactLabel} (AdjRW {selectedGuideline.estimatedRwBoost})
                  </span>
                </div>

                <DialogTitle className="text-base sm:text-lg font-bold text-foreground leading-snug">
                  {selectedGuideline.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {selectedGuideline.titleEn} • หมวดหมู่: {selectedGuideline.categoryLabel}
                </DialogDescription>
              </DialogHeader>

              {/* Modal Tabs Navigation */}
              <div className="flex items-center gap-1 border-b border-border/60 py-2 shrink-0 overflow-x-auto no-scrollbar">
                {[
                  { id: "criteria", label: "เกณฑ์ทางคลินิก (Criteria)", icon: CheckCircle2 },
                  { id: "rules", label: "กฎการให้รหัส & DRG", icon: Layers },
                  { id: "audit", label: "จุดระวัง Audit & C-Code", icon: AlertTriangle },
                  { id: "example", label: "ตัวอย่าง Note แพทย์", icon: FileText },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveModalTab(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${activeModalTab === tab.id
                        ? "bg-primary text-primary-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                    >
                      <Icon size={13} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="overflow-y-auto py-3 space-y-3.5 text-xs text-foreground flex-1 pr-1">
                {activeModalTab === "criteria" && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-xs">
                      <span className="font-semibold text-foreground block mb-1">
                        คำจำกัดความ (Definition):
                      </span>
                      <p className="text-muted-foreground leading-relaxed">
                        {selectedGuideline.summary}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        <span>เกณฑ์การวินิจฉัยทางคลินิก (Diagnostic Criteria):</span>
                      </h4>
                      <ul className="space-y-2">
                        {selectedGuideline.clinicalCriteria.map((item, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-muted-foreground leading-relaxed pl-1"
                          >
                            <span className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* TAB 2: Coding Rules */}
                {activeModalTab === "rules" && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 text-xs">
                      <span className="font-bold text-blue-900 dark:text-blue-300 block mb-1">
                        ผลกระทบต่อค่าน้ำหนักสัมพัทธ์ (DRG Impact):
                      </span>
                      <p className="text-blue-800 dark:text-blue-400">
                        จัดเป็น {selectedGuideline.drgImpactLabel} ส่งผลให้ค่าน้ำหนักสัมพัทธ์ปรับเพิ่มขึ้นประมาณ{" "}
                        <span className="font-bold">{selectedGuideline.estimatedRwBoost} RW</span>{" "}
                        (ขึ้นอยู่กับ Principal Diagnosis และหัตถการหลัก)
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                        <Layers size={14} className="text-primary" />
                        <span>หลักเกณฑ์และข้อกำหนดการให้รหัส ICD-10 (Coding Rules):</span>
                      </h4>
                      <ul className="space-y-2">
                        {selectedGuideline.codingRules.map((rule, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-muted-foreground leading-relaxed pl-1"
                          >
                            <span className="font-bold text-foreground shrink-0">{i + 1}.</span>
                            <span>{rule}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-border/50 text-muted-foreground text-[11px]">
                      <span className="font-semibold text-foreground">รหัสที่เกี่ยวข้อง: </span>
                      {selectedGuideline.relatedCodes.join(", ")}
                    </div>
                  </div>
                )}

                {/* TAB 3: Audit Pitfalls */}
                {activeModalTab === "audit" && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-rose-800 dark:text-rose-300 mb-1">
                        <ShieldAlert size={15} />
                        <span>ระดับการเฝ้าระวัง: {selectedGuideline.auditRiskLabel}</span>
                      </div>
                      <p className="text-rose-700 dark:text-rose-400 text-[11.5px] leading-relaxed">
                        โปรดตรวจสอบหลักฐานในเวชระเบียนให้ครบถ้วนก่อนส่งเคลม e-Claim เพื่อป้องกันการถูกปฏิเสธการจ่ายหรือตัดเงินเรียกคืนย้อนหลัง
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                        <AlertTriangle size={14} className="text-amber-600" />
                        <span>ข้อผิดพลาดที่มักถูก Auditor สปสช. / กรมบัญชีกลาง ทักท้วง (Pitfalls):</span>
                      </h4>
                      <ul className="space-y-2">
                        {selectedGuideline.auditPitfalls.map((pitfall, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/60 text-muted-foreground leading-relaxed"
                          >
                            <span className="text-rose-600 font-bold shrink-0">⚠️</span>
                            <span>{pitfall}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* TAB 4: Documentation Example */}
                {activeModalTab === "example" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">
                        {selectedGuideline.documentationExample.doctorTitle}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedGuideline.documentationExample.note);
                          toast.success("คัดลอกตัวอย่าง Note สู่คลิปบอร์ดแล้ว");
                        }}
                        className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Copy size={11} />
                        <span>คัดลอกข้อความ</span>
                      </button>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 text-slate-100 font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap border border-slate-800 shadow-inner">
                      {selectedGuideline.documentationExample.note}
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2">
                      <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-emerald-600" />
                      <p className="text-[11.5px] leading-relaxed">
                        การบันทึกตามตัวอย่างนี้ครอบคลุมทั้งเกณฑ์การวินิจฉัย (Clinical criteria), ผล Lab สนับสนุน, และแผนการรักษา (Intervention) ซึ่งได้รับการยอมรับจากการตรวจประเมินเวชระเบียน 100%
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <DialogFooter className="pt-3 border-t border-border/50 shrink-0 flex sm:flex-row items-center justify-between gap-2">
                <span className="text-[11px] text-muted-foreground truncate">
                  อ้างอิง: {selectedGuideline.references}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedGuideline(null)}
                    className="h-8 rounded-xl text-xs cursor-pointer"
                  >
                    ปิด
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      handleCopyCode(selectedGuideline.pdxCode || selectedGuideline.code.split(" ")[0]);
                      setSelectedGuideline(null);
                    }}
                    className="h-8 rounded-xl text-xs cursor-pointer gap-1.5"
                  >
                    <Copy size={12} />
                    <span>คัดลอกรหัส ICD-10</span>
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* =================================================================== */}
      {/* AI Assistant Modal: หน้าต่างถามตอบและสร้างแนวทางรหัสโรคด้วย AI         */}
      {/* =================================================================== */}
      <Dialog open={isAiModalOpen} onOpenChange={(open) => !open && setIsAiModalOpen(false)}>
        <DialogContent className="w-[95vw] sm:max-w-3xl md:max-w-4xl rounded-2xl p-5 sm:p-6 bg-card max-h-[92vh] flex flex-col">
          <DialogHeader className="pb-3 border-b border-border/50 shrink-0 pr-8">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Sparkles size={18} />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                  <span>AI ผู้ช่วยวิเคราะห์รหัสโรค & เกณฑ์ Audit</span>
                  <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    Smart RAG & TCG 2024
                  </span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  พิมพ์ชื่อโรค อาการทางคลินิก หรือรหัส ICD-10 เพื่อให้ AI วิเคราะห์เกณฑ์วินิจฉัย ผลต่อ DRG และร่าง Note แพทย์
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* AI Search Input Section */}
          <div className="pt-3 pb-2 space-y-2.5 shrink-0 border-b border-border/40">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="เช่น ตับแข็ง Cirrhosis SBP, Necrotizing fasciitis, DVT ขาบวม, หรือรหัส K74..."
                  value={aiInputQuery}
                  onChange={(e) => setAiInputQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleRunAiSearch(aiInputQuery);
                    }
                  }}
                  className="h-9 rounded-xl border-border text-xs pr-8 shadow-2xs"
                />
                {aiInputQuery && (
                  <button
                    type="button"
                    onClick={() => setAiInputQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
              <Button
                type="button"
                disabled={isAiLoading || !aiInputQuery.trim()}
                onClick={() => handleRunAiSearch(aiInputQuery)}
                className="h-9 px-4 rounded-xl text-xs font-semibold gap-1.5 cursor-pointer shrink-0"
              >
                {isAiLoading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>กำลังวิเคราะห์...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={13} />
                    <span>วิเคราะห์ด้วย AI</span>
                  </>
                )}
              </Button>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground shrink-0">ตัวอย่างเคส:</span>
              {[
                "ตับแข็ง Cirrhosis SBP",
                "Necrotizing Fasciitis",
                "Deep Vein Thrombosis (DVT)",
                "Severe Sepsis with Shock",
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    setAiInputQuery(chip);
                    handleRunAiSearch(chip);
                  }}
                  className="px-2 py-0.5 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer border border-border/60"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* AI Content Area */}
          <div className="overflow-y-auto py-3 space-y-3.5 text-xs text-foreground flex-1 pr-1">
            {isAiLoading && (
              <div className="flex flex-col items-center justify-center py-12 space-y-3 text-center">
                <div className="p-3.5 rounded-2xl bg-primary/10 text-primary animate-bounce">
                  <Sparkles size={26} />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">AI กำลังวิเคราะห์แนวทางและเกณฑ์ Audit...</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    เทียบเคียงมาตรฐาน ICD-10-TM, Thai Coding Guidelines 2024 และเกณฑ์ตรวจประเมินเวชระเบียน สปสช.
                  </p>
                </div>
              </div>
            )}

            {!isAiLoading && !aiResult && (
              <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground space-y-2">
                <Bot size={32} className="text-muted-foreground/60" />
                <p className="text-xs font-semibold text-foreground">พร้อมวิเคราะห์แนวทางการให้รหัสโรค</p>
                <p className="text-[11px] max-w-sm">
                  พิมพ์ชื่อโรคหรือเลือกตัวอย่างเคสด้านบน เพื่อดูเกณฑ์การวินิจฉัย ผลต่อค่าน้ำหนักสัมพัทธ์ และข้อควรระวัง
                </p>
              </div>
            )}

            {!isAiLoading && aiResult && (
              <div className="space-y-3.5">
                {/* AI Result Header Card */}
                <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-mono text-xs font-bold shadow-xs">
                        {aiResult.code}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10.5px] font-semibold bg-primary/10 text-primary border border-primary/20">
                        {aiResult.drgImpactLabel} (AdjRW {aiResult.estimatedRwBoost})
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 size={12} />
                      <span>AI สังเคราะห์ตามมาตรฐาน TCG 2024</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-foreground">{aiResult.title}</h3>
                    <p className="text-xs text-muted-foreground font-medium">{aiResult.titleEn}</p>
                  </div>
                  <p className="text-[11.5px] text-muted-foreground leading-relaxed">{aiResult.summary}</p>
                </div>

                {/* Sub Tabs */}
                <div className="flex items-center gap-1 border-b border-border/60 pb-2 overflow-x-auto no-scrollbar">
                  {[
                    { id: "criteria", label: "เกณฑ์ทางคลินิก", icon: CheckCircle2 },
                    { id: "rules", label: "กฎการให้รหัส & DRG", icon: Layers },
                    { id: "audit", label: "จุดระวัง Audit", icon: AlertTriangle },
                    { id: "example", label: "ตัวอย่าง Note แพทย์", icon: FileText },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setAiModalTab(tab.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                          aiModalTab === tab.id
                            ? "bg-primary text-primary-foreground shadow-2xs"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <Icon size={12} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab Content */}
                {aiModalTab === "criteria" && (
                  <div className="space-y-2 p-3 rounded-xl bg-muted/40 border border-border/60">
                    <h4 className="font-bold text-foreground text-xs flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-emerald-600" />
                      <span>เกณฑ์การวินิจฉัยทางคลินิก (Diagnostic Criteria):</span>
                    </h4>
                    <ul className="space-y-1.5 pl-1">
                      {aiResult.clinicalCriteria.map((crit, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-muted-foreground leading-relaxed text-[11.5px]">
                          <span className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                          <span>{crit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiModalTab === "rules" && (
                  <div className="space-y-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 text-blue-950 dark:text-blue-200">
                    <h4 className="font-bold text-xs flex items-center gap-1.5">
                      <Layers size={13} className="text-primary" />
                      <span>หลักเกณฑ์การให้รหัส ICD-10 และผลกระทบต่อ DRG:</span>
                    </h4>
                    <ul className="space-y-1.5 pl-1">
                      {aiResult.codingRules.map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-2 leading-relaxed text-[11.5px]">
                          <span className="font-bold shrink-0">{idx + 1}.</span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiModalTab === "audit" && (
                  <div className="space-y-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-rose-950 dark:text-rose-200">
                    <h4 className="font-bold text-xs flex items-center gap-1.5">
                      <ShieldAlert size={14} className="text-rose-600" />
                      <span>ข้อผิดพลาดที่มักถูก Auditor สปสช. ทักท้วง (Pitfalls):</span>
                    </h4>
                    <ul className="space-y-1.5 pl-1">
                      {aiResult.auditPitfalls.map((pitfall, idx) => (
                        <li key={idx} className="flex items-start gap-2 leading-relaxed text-[11.5px]">
                          <span className="text-rose-600 font-bold shrink-0">⚠️</span>
                          <span>{pitfall}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiModalTab === "example" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground text-xs">{aiResult.documentationExample.doctorTitle}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(aiResult.documentationExample.note);
                          toast.success("คัดลอกตัวอย่าง Note สู่คลิปบอร์ดแล้ว");
                        }}
                        className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Copy size={11} />
                        <span>คัดลอกข้อความ</span>
                      </button>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950 text-slate-100 font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap border border-slate-800 shadow-inner">
                      {aiResult.documentationExample.note}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI Footer Actions */}
          <DialogFooter className="pt-3 border-t border-border/50 shrink-0 flex sm:flex-row items-center justify-between gap-2">
            <span className="text-[11px] text-muted-foreground truncate">
              {aiResult ? `อ้างอิง: ${aiResult.references}` : "ระบบ AI สำหรับเวชสถิติและ DRG"}
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAiModalOpen(false)}
                className="h-8 rounded-xl text-xs cursor-pointer"
              >
                ปิด
              </Button>
              {aiResult && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyCode(aiResult.pdxCode || aiResult.code.split(" ")[0])}
                    className="h-8 rounded-xl text-xs cursor-pointer gap-1"
                  >
                    <Copy size={12} />
                    <span>คัดลอกรหัส</span>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSaveAiResultToGuidelines}
                    className="h-8 rounded-xl text-xs cursor-pointer gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Plus size={13} />
                    <span>เพิ่มเข้าคลังความรู้หน้านี้</span>
                  </Button>
                </>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
