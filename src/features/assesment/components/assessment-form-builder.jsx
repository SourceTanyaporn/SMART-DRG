import React, { useState, useMemo, useEffect } from "react";
import {
  ChevronLeft,
  ChevronDown,
  X,
  Plus,
  Trash2,
  Copy,
  GripVertical,
  Check,
  Circle,
  Square,
  FileText,
  SlidersHorizontal,
  Pencil,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { toast } from "@/components/ui/toast-notification";

const ANSWER_TYPES = [
  { value: "radio", label: "Radio Selection (เลือกได้ 1 ข้อ)" },
  { value: "checkbox", label: "Checkbox (เลือกได้มากกว่า 1 ข้อ)" },
  { value: "text", label: "Text Box (คำตอบอัตนัย)" },
  { value: "matrix", label: "Matrix Question (หลายคำถาม/ตาราง)" },
];

const THAI_BULLETS = ["ก.", "ข.", "ค.", "ง.", "จ.", "ฉ.", "ช.", "ซ."];

const KPI_COLOR_PALETTES = [
  {
    id: "green",
    label: "เขียว",
    barClass: "bg-green-500",
    badgeClass: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800/40",
    dotClass: "bg-green-500",
  },
  {
    id: "lime",
    label: "เขียวอ่อน",
    barClass: "bg-lime-500",
    badgeClass: "bg-lime-50 text-lime-700 border-lime-200 dark:bg-lime-950/40 dark:text-lime-400 dark:border-lime-800/40",
    dotClass: "bg-lime-500",
  },
  {
    id: "yellow",
    label: "เหลือง",
    barClass: "bg-yellow-300",
    badgeClass: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-800/40",
    dotClass: "bg-yellow-300",
  },
  {
    id: "amber",
    label: "เหลือง/ส้ม",
    barClass: "bg-amber-500",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40",
    dotClass: "bg-amber-500",
  },
  {
    id: "orange",
    label: "ส้มเข้ม",
    barClass: "bg-orange-500",
    badgeClass: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800/40",
    dotClass: "bg-orange-500",
  },
  {
    id: "red",
    label: "แดง",
    barClass: "bg-red-500",
    badgeClass: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/40",
    dotClass: "bg-red-500",
  },
  {
    id: "rose",
    label: "แดงเข้ม",
    barClass: "bg-red-700",
    badgeClass: "bg-red-60 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-500 dark:border-red-900/40",
    dotClass: "bg-red-700",
  },
];

export function AssessmentFormBuilder({
  initialData,
  categories = [],
  onSave,
  onCancel,
}) {
  // Assessment metadata
  const [title, setTitle] = useState(initialData?.title || "");
  const [category, setCategory] = useState(
    initialData?.category || categories[0] || "พฤติกรรมสุขภาพ"
  );
  const [description, setDescription] = useState(
    initialData?.description || ""
  );

  // Questions array
  const [questions, setQuestions] = useState(() => {
    if (initialData?.questions && initialData.questions.length > 0) {
      return initialData.questions.map((q, qIdx) => ({
        id: q.id || `q-${qIdx + 1}`,
        title: q.title || q.text || `คำถามที่ ${qIdx + 1}`,
        type: q.type || "radio",
        maxScore: parseInt(q.score) || 5,
        subQuestions: [
          { id: "sq-1", text: q.text || "" },
        ],
        options: (q.options && q.options.length > 0)
          ? q.options.map((opt, oIdx) => ({
            id: `opt-${oIdx + 1}`,
            text: typeof opt === "string" ? opt : opt.text || "",
            score: oIdx === 0 ? 5 : oIdx === 1 ? 3 : oIdx === 2 ? 1 : 0,
          }))
          : [
            { id: "opt-1", text: "ใช่ / มีอาการ", score: 5 },
            { id: "opt-2", text: "ไม่ใช่ / ไม่มีอาการ", score: 0 },
          ],
      }));
    }

    // Default 4 questions as in mockup
    return [
      {
        id: "q-1",
        title: "การประเมินพฤติกรรมและความถี่",
        type: "radio",
        maxScore: 5,
        subQuestions: [{ id: "sq-1", text: "ระบุคำถามย่อยๆ" }],
        options: [
          { id: "opt-1", text: "ก. ระบุคำตอบย่อยๆ", score: 5 },
          { id: "opt-2", text: "ข. ระบุคำตอบย่อยๆ", score: 0 },
        ],
      },
      {
        id: "q-2",
        title: "ประเมินระดับความรุนแรงและผลกระทบ",
        type: "checkbox",
        maxScore: 10,
        subQuestions: [{ id: "sq-2", text: "ระบุคำถามย่อยๆ" }],
        options: [
          { id: "opt-2-1", text: "ก. ระบุคำตอบย่อยๆ", score: 5 },
          { id: "opt-2-2", text: "ข. ระบุคำตอบย่อยๆ", score: 5 },
        ],
      },
      {
        id: "q-3",
        title: "ประเมินอาการร่วมและความพร้อม",
        type: "text",
        maxScore: 5,
        subQuestions: [{ id: "sq-3", text: "ระบุคำถามย่อยๆ" }],
        options: [{ id: "opt-3-1", text: "คำตอบอัตนัย / บันทึกข้อความ", score: 5 }],
      },
      {
        id: "q-4",
        title: "การประเมินความถี่และพฤติกรรมสุขภาพ",
        type: "matrix",
        maxScore: 8,
        subQuestions: [
          { id: "sq-4-1", text: "1. ความถี่ในการดื่มเครื่องดื่มแอลกอฮอล์" },
          { id: "sq-4-2", text: "2. ความถี่ในการสูบบุหรี่หรือผลิตภัณฑ์ยาสูบ" },
          { id: "sq-4-3", text: "3. อาการอยากหรือต้องการในแต่ละวัน" },
          { id: "sq-4-4", text: "4. ความพยายามในการลดหรือหยุดพฤติกรรม" },
        ],
        options: [
          { id: "opt-4-1", text: "ไม่เคย", score: 0 },
          { id: "opt-4-2", text: "เพียง 1–2 ครั้ง", score: 2 },
          { id: "opt-4-3", text: "เดือนละ 1–3 ครั้ง", score: 4 },
          { id: "opt-4-4", text: "สัปดาห์ละ 1–4 ครั้ง", score: 6 },
          { id: "opt-4-5", text: "เกือบทุกวัน", score: 8 },
        ],
      },
    ];
  });

  // KPI Criteria Levels (เกณฑ์คะแนน และ ผลคะแนน)
  const [kpiLevels, setKpiLevels] = useState(() => {
    if (initialData?.kpiLevels && initialData.kpiLevels.length > 0) {
      return initialData.kpiLevels.map((lvl, idx) => {
        const palette =
          KPI_COLOR_PALETTES.find((p) => p.id === lvl.colorId) ||
          KPI_COLOR_PALETTES[idx % KPI_COLOR_PALETTES.length];
        return {
          id: lvl.id || `kpi-${Date.now()}-${idx}`,
          result: lvl.result || lvl.title || lvl.label || `ระดับ ${idx + 1}`,
          colorId: palette.id,
          barClass: lvl.barClass || palette.barClass,
          badgeClass: lvl.badgeClass || palette.badgeClass,
          dotClass: lvl.dotClass || palette.dotClass,
          min: lvl.min ?? 0,
          max: lvl.max ?? 10,
        };
      });
    }

    return [
      {
        id: "low",
        result: "ระดับต่ำ (นวัตกรรมที่เป็นมาตรฐานสูงสุด / ปกติ)",
        colorId: "green",
        barClass: "bg-green-500",
        badgeClass: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800/40",
        dotClass: "bg-green-500",
        min: 0,
        max: 10,
      },
      {
        id: "mid",
        result: "ระดับปานกลาง (ระดับยอดเยี่ยมตามมาตรฐาน)",
        colorId: "amber",
        barClass: "bg-amber-500",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40",
        dotClass: "bg-amber-500",
        min: 11,
        max: 20,
      },
      {
        id: "high",
        result: "ระดับสูง (ระดับเร่งด่วนที่ต้องส่งต่อ)",
        colorId: "rose",
        barClass: "bg-red-700",
        badgeClass: "bg-red-60 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-500 dark:border-red-900/40",
        dotClass: "bg-red-700",
        min: 21,
        max: 33,
      },
    ];
  });

  // Synchronize internal state when initialData changes
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setCategory(
        initialData.category || categories[0] || "พฤติกรรมสุขภาพ"
      );
      setDescription(initialData.description || "");

      if (initialData.questions && initialData.questions.length > 0) {
        setQuestions(
          initialData.questions.map((q, qIdx) => ({
            id: q.id || `q-${qIdx + 1}`,
            title: q.title || q.text || `คำถามที่ ${qIdx + 1}`,
            type: q.type || "radio",
            maxScore: parseInt(q.score) || 5,
            subQuestions: [
              { id: "sq-1", text: q.text || "" },
            ],
            options: (q.options && q.options.length > 0)
              ? q.options.map((opt, oIdx) => ({
                id: `opt-${oIdx + 1}`,
                text: typeof opt === "string" ? opt : opt.text || "",
                score: oIdx === 0 ? 5 : oIdx === 1 ? 3 : oIdx === 2 ? 1 : 0,
              }))
              : [
                { id: "opt-1", text: "ใช่ / มีอาการ", score: 5 },
                { id: "opt-2", text: "ไม่ใช่ / ไม่มีอาการ", score: 0 },
              ],
          }))
        );
      }

      if (initialData.kpiLevels && initialData.kpiLevels.length > 0) {
        setKpiLevels(
          initialData.kpiLevels.map((lvl, idx) => {
            const palette =
              KPI_COLOR_PALETTES.find((p) => p.id === lvl.colorId) ||
              KPI_COLOR_PALETTES[idx % KPI_COLOR_PALETTES.length];
            return {
              id: lvl.id || `kpi-${Date.now()}-${idx}`,
              result: lvl.result || lvl.title || lvl.label || `ระดับ ${idx + 1}`,
              colorId: palette.id,
              barClass: lvl.barClass || palette.barClass,
              badgeClass: lvl.badgeClass || palette.badgeClass,
              dotClass: lvl.dotClass || palette.dotClass,
              min: lvl.min ?? 0,
              max: lvl.max ?? 10,
            };
          })
        );
      }
    }
  }, [initialData, categories]);

  // Calculate Total Score dynamically
  const totalScore = useMemo(() => {
    return questions.reduce((sum, q) => {
      // Sum max score of each question
      return sum + (parseInt(q.maxScore) || 0);
    }, 0);
  }, [questions]);

  // Display max score for score bar and scales
  const displayMaxScore = useMemo(() => {
    const kpiMax = kpiLevels.reduce(
      (max, lvl) => Math.max(max, parseInt(lvl.max) || 0),
      0
    );
    return Math.max(totalScore, kpiMax, 10);
  }, [totalScore, kpiLevels]);

  // Question handlers
  const handleAddQuestion = () => {
    const newQ = {
      id: `q-${Date.now()}`,
      title: "",
      type: "radio",
      maxScore: 5,
      subQuestions: [{ id: `sq-${Date.now()}`, text: "" }],
      options: [
        { id: `opt-${Date.now()}-1`, text: "", score: 5 },
        { id: `opt-${Date.now()}-2`, text: "", score: 0 },
      ],
    };
    setQuestions((prev) => [...prev, newQ]);
  };

  const handleDuplicateQuestion = (idx) => {
    const target = questions[idx];
    const duplicated = {
      ...target,
      id: `q-${Date.now()}`,
      title: `${target.title} (สำเนา)`,
      options: target.options.map((opt, oIdx) => ({
        ...opt,
        id: `opt-${Date.now()}-${oIdx}`,
      })),
      subQuestions: target.subQuestions.map((sq, sqIdx) => ({
        ...sq,
        id: `sq-${Date.now()}-${sqIdx}`,
      })),
    };
    const updated = [...questions];
    updated.splice(idx + 1, 0, duplicated);
    setQuestions(updated);
  };

  const handleDeleteQuestion = (idx) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateQuestion = (idx, field, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== idx) return q;
        if (field === "type" && value === "matrix" && (!q.options || q.options.length <= 2)) {
          return {
            ...q,
            type: value,
            options: [
              { id: `opt-${Date.now()}-1`, text: "ไม่เคย", score: 0 },
              { id: `opt-${Date.now()}-2`, text: "เพียง 1–2 ครั้ง", score: 2 },
              { id: `opt-${Date.now()}-3`, text: "เดือนละ 1–3 ครั้ง", score: 4 },
              { id: `opt-${Date.now()}-4`, text: "สัปดาห์ละ 1–4 ครั้ง", score: 6 },
              { id: `opt-${Date.now()}-5`, text: "เกือบทุกวัน", score: 8 },
            ],
            subQuestions:
              q.subQuestions && q.subQuestions.length > 1
                ? q.subQuestions
                : [
                  { id: `sq-${Date.now()}-1`, text: "1. ระบุข้อคำถามแถวที่ 1" },
                  { id: `sq-${Date.now()}-2`, text: "2. ระบุข้อคำถามแถวที่ 2" },
                  { id: `sq-${Date.now()}-3`, text: "3. ระบุข้อคำถามแถวที่ 3" },
                ],
          };
        }
        return { ...q, [field]: value };
      })
    );
  };

  // Option handlers
  const handleAddOption = (qIdx) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        return {
          ...q,
          options: [
            ...q.options,
            { id: `opt-${Date.now()}`, text: "", score: 0 },
          ],
        };
      })
    );
  };

  // Drag & drop state for options & subquestions
  const [draggedOption, setDraggedOption] = useState(null); // { qIdx, optIdx }
  const [dragOverOption, setDragOverOption] = useState(null); // { qIdx, optIdx }
  const [draggedSubQ, setDraggedSubQ] = useState(null); // { qIdx, sqIdx }
  const [dragOverSubQ, setDragOverSubQ] = useState(null); // { qIdx, sqIdx }

  const handleReorderOptions = (qIdx, sourceIdx, targetIdx) => {
    if (sourceIdx === targetIdx) return;
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const nextOptions = [...q.options];
        const [moved] = nextOptions.splice(sourceIdx, 1);
        nextOptions.splice(targetIdx, 0, moved);
        return { ...q, options: nextOptions };
      })
    );
  };

  const handleReorderSubQuestions = (qIdx, sourceIdx, targetIdx) => {
    if (sourceIdx === targetIdx) return;
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const nextSubQs = [...q.subQuestions];
        const [moved] = nextSubQs.splice(sourceIdx, 1);
        nextSubQs.splice(targetIdx, 0, moved);
        return { ...q, subQuestions: nextSubQs };
      })
    );
  };

  const handleUpdateOption = (qIdx, optIdx, field, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const updatedOpts = q.options.map((opt, oi) =>
          oi === optIdx ? { ...opt, [field]: value } : opt
        );
        return { ...q, options: updatedOpts };
      })
    );
  };

  const handleDeleteOption = (qIdx, optIdx) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        if (q.options.length <= 1) return q;
        return {
          ...q,
          options: q.options.filter((_, oi) => oi !== optIdx),
        };
      })
    );
  };

  // Subquestion handlers
  const handleAddSubQuestion = (qIdx) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        return {
          ...q,
          subQuestions: [
            ...q.subQuestions,
            { id: `sq-${Date.now()}`, text: "" },
          ],
        };
      })
    );
  };

  const handleUpdateSubQuestion = (qIdx, sqIdx, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const updatedSq = q.subQuestions.map((sq, si) =>
          si === sqIdx ? { ...sq, text: value } : sq
        );
        return { ...q, subQuestions: updatedSq };
      })
    );
  };

  const handleDeleteSubQuestion = (qIdx, sqIdx) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        if (q.subQuestions.length <= 1) return q;
        return {
          ...q,
          subQuestions: q.subQuestions.filter((_, si) => si !== sqIdx),
        };
      })
    );
  };

  // KPI Level handlers (เกณฑ์คะแนน และ ผลคะแนน)
  const handleAddKpiLevel = () => {
    const lastLevel = kpiLevels[kpiLevels.length - 1];
    const newMin = lastLevel ? (parseInt(lastLevel.max) || 0) + 1 : 0;
    const newMax = Math.max(newMin + 5, totalScore);
    const paletteIndex = kpiLevels.length % KPI_COLOR_PALETTES.length;
    const palette = KPI_COLOR_PALETTES[paletteIndex];

    const newLvl = {
      id: `kpi-${Date.now()}`,
      result: `ระดับ ${kpiLevels.length + 1}`,
      colorId: palette.id,
      barClass: palette.barClass,
      badgeClass: palette.badgeClass,
      dotClass: palette.dotClass,
      min: newMin,
      max: newMax,
    };
    setKpiLevels((prev) => [...prev, newLvl]);
  };

  const handleDeleteKpiLevel = (id) => {
    if (kpiLevels.length <= 1) return;
    setKpiLevels((prev) => prev.filter((lvl) => lvl.id !== id));
  };

  const handleUpdateKpiLevel = (id, field, value) => {
    setKpiLevels((prev) =>
      prev.map((lvl) => {
        if (lvl.id !== id) return lvl;
        if (field === "colorId") {
          const palette =
            KPI_COLOR_PALETTES.find((p) => p.id === value) || KPI_COLOR_PALETTES[0];
          return {
            ...lvl,
            colorId: palette.id,
            barClass: palette.barClass,
            badgeClass: palette.badgeClass,
            dotClass: palette.dotClass,
          };
        }
        return { ...lvl, [field]: value };
      })
    );
  };

  const [activeColorPickerId, setActiveColorPickerId] = useState(null);

  // Save form
  const handleSave = () => {
    if (!title.trim()) {
      toast.error("กรุณาระบุชื่อหัวข้อแบบประเมิน");
      return;
    }

    const payload = {
      id: initialData?.id || Date.now(),
      title,
      category,
      description,
      fieldsCount: questions.length,
      totalScore,
      questions: questions.map((q, idx) => ({
        number: String(idx + 1),
        text: q.title || `คำถามที่ ${idx + 1}`,
        type: q.type,
        score: `${q.maxScore} คะแนน`,
        options: q.options.map((o) => o.text),
      })),
      kpiLevels: kpiLevels.map((lvl) => ({
        id: lvl.id,
        min: lvl.min,
        max: lvl.max,
        result: lvl.result || "",
        label: lvl.result || "",
        title: lvl.result || "",
        colorId: lvl.colorId,
      })),
    };

    onSave?.(payload);
  };

  return (
    <div className="w-full space-y-5 pb-16 ">
      <div className="sticky top-16 z-30 flex items-center justify-between gap-3 bg-background/95 backdrop-blur-md py-3 -mx-2 sm:-mx-4 px-2 sm:px-4 border-b border-border shadow-xs transition-all">
        <div className="flex items-center gap-2.5 min-w-0">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="rounded-xl border-border bg-white hover:bg-muted text-xs sm:text-sm font-medium gap-1.5 cursor-pointer shadow-2xs shrink-0"
          >
            <ChevronLeft size={16} />
            <span>ย้อนกลับ</span>
          </Button>

          {title && (
            <span className="text-xs sm:text-sm font-bold text-foreground truncate max-w-[200px] sm:max-w-xs md:max-w-md hidden md:inline">
              {title}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="rounded-xl bg-white border-rose-300 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs sm:text-sm font-medium px-4 cursor-pointer"
          >
            <X size={15} className="mr-1" />
            <span>ยกเลิก</span>
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-semibold px-5 shadow-sm transition-all active:scale-[0.98] cursor-pointer flex items-center gap-1.5"
          >
            <Check size={16} />
            <span>บันทึกแบบฟอร์ม</span>
          </Button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* Card 1: กำหนดรายละเอียดแบบประเมิน (Assessment Metadata)               */}
      {/* =================================================================== */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4.5 bg-primary rounded-full inline-block" />
          <h3 className="font-bold text-sm sm:text-base text-foreground">
            กำหนดรายละเอียดแบบประเมิน
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* ชื่อหัวข้อแบบประเมิน */}
          <div className="lg:col-span-6 space-y-1.5">
            <label className="block text-xs font-semibold text-foreground">
              ชื่อหัวข้อแบบประเมิน <span className="text-rose-500">*</span>
            </label>
            <Input
              placeholder="ระบุชื่อแบบประเมิน"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 text-xs sm:text-sm rounded-xl border-border"
            />
          </div>

          {/* หมวดหมู่แบบประเมิน */}
          <div className="lg:col-span-3 space-y-1.5">
            <label className="block text-xs font-semibold text-foreground">
              หมวดหมู่แบบประเมิน
            </label>
            <Select
              value={category}
              onChange={(val) => setCategory(val)}
              options={categories.map((cat) => ({ value: cat, label: cat }))}
              placeholder="เลือกหมวดหมู่แบบประเมิน"
              triggerClassName="h-10 text-xs sm:text-sm rounded-xl border-border"
            />
          </div>

          {/* สถิติสรุป (จำนวนคำถาม & จำนวนคะแนนรวม) */}
          <div className="lg:col-span-3 flex items-center justify-around rounded-xl border border-border/70 bg-muted/20 px-3 py-1">
            <div className="text-center">
              <span className="block text-[11px] text-muted-foreground font-medium">
                จำนวนคำถาม
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-primary">
                {questions.length}
              </span>
            </div>

            <div className="h-8 w-px bg-border/60" />

            <div className="text-center">
              <span className="block text-[11px] text-muted-foreground font-medium">
                จำนวนคะแนนรวม
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {totalScore}
              </span>
            </div>
          </div>
        </div>

        {/* รายละเอียด */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-foreground">
            รายละเอียด
          </label>
          <textarea
            rows={3}
            placeholder="ระบุรายละเอียด"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-input bg-card p-3 text-xs sm:text-sm text-foreground font-medium placeholder:text-muted-foreground/50 shadow-2xs outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* =================================================================== */}
      {/* Cards 2 to N: กำหนดรายละเอียดคำถาม (Question Cards)                  */}
      {/* =================================================================== */}
      <div className="space-y-4">
        {questions.map((q, qIdx) => (
          <div
            key={q.id}
            className="group relative rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-2xs space-y-4 transition-all hover:border-slate-300 dark:hover:border-slate-700"
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4.5 bg-primary rounded-full inline-block" />
              <h3 className="font-bold text-sm sm:text-base text-foreground">
                กำหนดรายละเอียดคำถาม
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
              <div className="lg:col-span-8 space-y-1.5">
                <label className="block text-xs font-semibold text-foreground">
                  ชื่อหัวข้อคำถาม
                </label>
                <Input
                  placeholder="ระบุชื่อคำถาม"
                  value={q.title}
                  onChange={(e) =>
                    handleUpdateQuestion(qIdx, "title", e.target.value)
                  }
                  className="h-10 text-xs sm:text-sm rounded-xl border-border "
                />
              </div>

              <div className="lg:col-span-4 space-y-1.5">
                <label className="block text-xs font-semibold text-foreground">
                  ประเภทคำตอบ
                </label>
                <Select
                  value={q.type}
                  onChange={(val) =>
                    handleUpdateQuestion(qIdx, "type", val)
                  }
                  options={ANSWER_TYPES}
                  placeholder="เลือกประเภทคำตอบ"
                  triggerClassName="h-10 text-xs sm:text-sm rounded-xl border-border"
                  contentClassName="min-w-[280px]"
                />
              </div>
            </div>

            {/* Row 2: การคิดคะแนนและการกำหนดคะแนน */}
            <div className="flex items-center justify-between border-t border-border/50 pt-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">
                  การคิดคะแนนและการกำหนดคะแนน
                </span>
                <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  คะแนนสูงสุดที่ตั้งไว้ {q.maxScore} คะแนน
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>ปรับคะแนน:</span>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={q.maxScore}
                    onChange={(e) =>
                      handleUpdateQuestion(
                        qIdx,
                        "maxScore",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="h-6 w-12 text-center text-xs rounded-lg font-bold p-0"
                  />
                </div>
                <span className="text-[11px] text-muted-foreground hidden sm:inline">
                  กำหนดสูงสุด 5 ข้อ
                </span>
              </div>
            </div>

            {/* Row 3: คำถาม (Subquestions) */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-foreground">
                {q.type === "matrix"
                  ? "ข้อคำถามในแต่ละแถว (Rows)"
                  : "คำถาม (จำกัดตัวอักษรได้มากสุด 100 ตัวอักษร)"}
              </label>

              <div className="space-y-2">
                {q.subQuestions.map((sq, sqIdx) => {
                  const isDragging =
                    draggedSubQ?.qIdx === qIdx && draggedSubQ?.sqIdx === sqIdx;
                  const isDragOver =
                    dragOverSubQ?.qIdx === qIdx && dragOverSubQ?.sqIdx === sqIdx;

                  return (
                    <div
                      key={sq.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", `${qIdx}-${sqIdx}`);
                        e.dataTransfer.effectAllowed = "move";
                        setDraggedSubQ({ qIdx, sqIdx });
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                        if (
                          dragOverSubQ?.qIdx !== qIdx ||
                          dragOverSubQ?.sqIdx !== sqIdx
                        ) {
                          setDragOverSubQ({ qIdx, sqIdx });
                        }
                      }}
                      onDragLeave={() => {
                        if (
                          dragOverSubQ?.qIdx === qIdx &&
                          dragOverSubQ?.sqIdx === sqIdx
                        ) {
                          setDragOverSubQ(null);
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedSubQ && draggedSubQ.qIdx === qIdx) {
                          handleReorderSubQuestions(
                            qIdx,
                            draggedSubQ.sqIdx,
                            sqIdx
                          );
                        }
                        setDraggedSubQ(null);
                        setDragOverSubQ(null);
                      }}
                      onDragEnd={() => {
                        setDraggedSubQ(null);
                        setDragOverSubQ(null);
                      }}
                      className={`flex items-center gap-2 p-1 rounded-xl border transition-all duration-150 ${isDragging
                          ? "opacity-40 border-dashed border-primary bg-primary/5 scale-[0.99]"
                          : isDragOver
                            ? "border-primary bg-primary/10 ring-2 ring-primary/20 scale-[1.01]"
                            : "border-transparent hover:border-border/40"
                        }`}
                    >
                      <div
                        className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-foreground p-0.5 rounded transition-colors shrink-0"
                        title="ลากเพื่อสลับลำดับคำถาม"
                      >
                        <GripVertical size={15} />
                      </div>
                      <Input
                        placeholder={
                          q.type === "matrix"
                            ? `ระบุข้อคำถามแถวที่ ${sqIdx + 1}`
                            : "ระบุคำถามย่อยๆ"
                        }
                        value={sq.text}
                        onChange={(e) =>
                          handleUpdateSubQuestion(qIdx, sqIdx, e.target.value)
                        }
                        onDragStart={(e) => e.stopPropagation()}
                        className="h-9 text-xs sm:text-sm rounded-lg flex-1 bg-card"
                        maxLength={100}
                      />
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            const newText = prompt("แก้ไขคำถามย่อย:", sq.text);
                            if (newText !== null) {
                              handleUpdateSubQuestion(qIdx, sqIdx, newText);
                            }
                          }}
                          className="text-muted-foreground/60 hover:text-foreground p-1"
                          title="แก้ไข"
                        >
                          <Pencil size={13} />
                        </button>
                        {q.subQuestions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteSubQuestion(qIdx, sqIdx)}
                            className="text-muted-foreground/60 hover:text-rose-500 p-1"
                            title="ลบ"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => handleAddSubQuestion(qIdx)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer pt-0.5"
              >
                <Plus size={13} />
                <span>
                  {q.type === "matrix" ? "เพิ่มแถวข้อคำถาม" : "เพิ่มคำถาม"}
                </span>
              </button>
            </div>

            {/* Row 4: คำตอบ (Options) */}
            {q.type !== "text" && (
              <div className="space-y-2 border-t border-border/50 pt-3">
                <label className="block text-xs font-semibold text-foreground">
                  {q.type === "matrix"
                    ? "ระดับคำตอบ / คอลัมน์ (Columns) พร้อมคะแนน"
                    : "คำตอบ (จำกัดตัวอักษรได้มากสุด 20 ตัวอักษร ต่อคำตอบ, และสูงสุด 4 คอลัมน์)"}
                </label>

                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => {
                    const isDragging =
                      draggedOption?.qIdx === qIdx &&
                      draggedOption?.optIdx === optIdx;
                    const isDragOver =
                      dragOverOption?.qIdx === qIdx &&
                      dragOverOption?.optIdx === optIdx;

                    return (
                      <div
                        key={opt.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", `${qIdx}-${optIdx}`);
                          e.dataTransfer.effectAllowed = "move";
                          setDraggedOption({ qIdx, optIdx });
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "move";
                          if (
                            dragOverOption?.qIdx !== qIdx ||
                            dragOverOption?.optIdx !== optIdx
                          ) {
                            setDragOverOption({ qIdx, optIdx });
                          }
                        }}
                        onDragLeave={() => {
                          if (
                            dragOverOption?.qIdx === qIdx &&
                            dragOverOption?.optIdx === optIdx
                          ) {
                            setDragOverOption(null);
                          }
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (draggedOption && draggedOption.qIdx === qIdx) {
                            handleReorderOptions(qIdx, draggedOption.optIdx, optIdx);
                          }
                          setDraggedOption(null);
                          setDragOverOption(null);
                        }}
                        onDragEnd={() => {
                          setDraggedOption(null);
                          setDragOverOption(null);
                        }}
                        className={`flex items-center gap-2 p-1.5 rounded-xl border transition-all duration-150 ${isDragging
                            ? "opacity-40 border-dashed border-primary bg-primary/5 scale-[0.99]"
                            : isDragOver
                              ? "border-primary bg-primary/10 ring-2 ring-primary/20 scale-[1.01]"
                              : "bg-muted/20 border-border/60 hover:border-slate-300 dark:hover:border-slate-700"
                          }`}
                      >
                        <div
                          className="cursor-grab active:cursor-grabbing p-0.5 rounded text-muted-foreground/40 hover:text-foreground transition-colors shrink-0"
                          title="ลากเพื่อสลับลำดับคำตอบ"
                        >
                          <GripVertical size={15} />
                        </div>

                        <span className="text-xs font-semibold text-muted-foreground shrink-0 w-5 text-center select-none">
                          {THAI_BULLETS[optIdx] || `${optIdx + 1}.`}
                        </span>

                        <Input
                          placeholder={
                            q.type === "matrix"
                              ? "ชื่อคอลัมน์ เช่น ไม่เคย, เกือบทุกวัน"
                              : "ระบุคำตอบย่อยๆ"
                          }
                          value={opt.text}
                          onChange={(e) =>
                            handleUpdateOption(qIdx, optIdx, "text", e.target.value)
                          }
                          onDragStart={(e) => e.stopPropagation()}
                          className="h-8 text-xs rounded-lg flex-1 bg-card"
                          maxLength={30}
                        />

                        {/* Score assignment */}
                        <div
                          onDragStart={(e) => e.stopPropagation()}
                          className="flex items-center h-8 shrink-0 rounded-lg border border-border bg-card px-2.5 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all"
                        >
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={opt.score}
                            onChange={(e) =>
                              handleUpdateOption(
                                qIdx,
                                optIdx,
                                "score",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-10 text-center text-xs font-bold text-foreground bg-transparent outline-hidden p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <span className="text-[11px] text-muted-foreground font-medium select-none ml-1">
                            คะแนน
                          </span>
                        </div>

                        {q.options.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteOption(qIdx, optIdx)}
                            className="text-muted-foreground hover:text-rose-500 p-1 cursor-pointer rounded transition-colors"
                            title="ลบคำตอบ"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {q.options.length < 8 && (
                  <button
                    type="button"
                    onClick={() => handleAddOption(qIdx)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer pt-0.5"
                  >
                    <Plus size={13} />
                    <span>
                      {q.type === "matrix" ? "เพิ่มคอลัมน์คำตอบ" : "เพิ่มคำตอบ"}
                    </span>
                  </button>
                )}
                {/* 
                {q.type === "matrix" && (
                  <div className="mt-4 rounded-xl border border-border overflow-hidden bg-card shadow-2xs">
                    <div className="bg-muted/30 px-3.5 py-2 border-b border-border flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <span>ตัวอย่างตาราง Matrix Question</span>
                      </span>
                      <span className="text-[11px] text-muted-foreground font-medium">
                        (พรีวิวหน้าตาคำตอบจริง)
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-muted/20 border-b border-border text-foreground font-bold">
                            <th className="py-2.5 px-3.5 text-left font-semibold text-muted-foreground w-1/3 min-w-[170px]">
                              ข้อคำถาม
                            </th>
                            {q.options.map((opt, oIdx) => (
                              <th
                                key={opt.id || oIdx}
                                className="py-2.5 px-2 font-semibold text-center border-l border-border/50 min-w-[95px]"
                              >
                                {opt.text || `คอลัมน์ ${oIdx + 1}`}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {q.subQuestions.map((sq, sIdx) => (
                            <tr
                              key={sq.id || sIdx}
                              className="hover:bg-muted/10 transition-colors"
                            >
                              <td className="py-3 px-3.5 text-left font-medium text-foreground">
                                {sq.text || `คำถามย่อยที่ ${sIdx + 1}`}
                              </td>
                              {q.options.map((opt, oIdx) => (
                                <td
                                  key={opt.id || oIdx}
                                  className="py-3 px-2 text-center border-l border-border/50"
                                >
                                  <div className="flex flex-col items-center justify-center gap-1">
                                    <div className="w-4.5 h-4.5 rounded-full border-2 border-muted-foreground/40 hover:border-primary transition-colors cursor-pointer" />
                                    <span className="text-[10.5px] text-muted-foreground font-medium">
                                      ( {opt.score ?? 0} คะแนน )
                                    </span>
                                  </div>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )} */}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
              <button
                type="button"
                onClick={() => handleDuplicateQuestion(qIdx)}
                title="คัดลอกคำถาม"
                className="p-1 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <Copy size={14} />
              </button>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDeleteQuestion(qIdx)}
                  title="ลบคำถาม"
                  className="p-1 rounded-md text-muted-foreground/60 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Middle Button: + เพิ่มคำถาม */}
      <div className="flex justify-center py-2">
        <Button
          type="button"
          onClick={handleAddQuestion}
          className="h-10 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs sm:text-sm shadow-sm flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
        >
          <Plus size={17} />
          <span>เพิ่มแบบฟอร์มข้อ</span>
        </Button>
      </div>

      {/* =================================================================== */}
      {/* Card 3: การกำหนดผลการประเมิน KPI (Dynamic N Levels)                  */}
      {/* =================================================================== */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-2xs space-y-4">
        {/* Header with Title and Add Level Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4.5 bg-primary rounded-full inline-block" />
            <div>
              <h3 className="font-bold text-sm sm:text-base text-foreground">
                การกำหนดผลการประเมิน KPI
              </h3>
              <p className="text-xs text-muted-foreground">
                ช่วงคะแนนประเมิน (0 - {displayMaxScore} คะแนน) • มีทั้งหมด {kpiLevels.length} ระดับเกณฑ์
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddKpiLevel}
            className="rounded-xl border-primary/30 text-primary hover:bg-primary/10 text-xs font-semibold gap-1.5 self-start sm:self-auto cursor-pointer shadow-2xs"
          >
            <Plus size={15} />
            <span>เพิ่มเกณฑ์คะแนน</span>
          </Button>
        </div>

        {/* Dynamic score range bar indicator */}
        <div className="space-y-1.5">
          <div className="h-2.5 w-full rounded-full overflow-hidden flex bg-muted/60 p-0.5 gap-0.5">
            {kpiLevels.map((lvl) => {
              const span = Math.max(
                1,
                (parseInt(lvl.max) || 0) - (parseInt(lvl.min) || 0) + 1
              );
              return (
                <div
                  key={lvl.id}
                  style={{ flex: span }}
                  className={`${lvl.barClass || "bg-primary"} h-full rounded-sm transition-all`}
                  title={`${lvl.result} (${lvl.min} - ${lvl.max} คะแนน)`}
                />
              );
            })}
          </div>

          {/* Scale labels below the bar */}
          <div className="flex justify-between items-center text-[10.5px] text-muted-foreground px-0.5">
            <span>0 คะแนน</span>
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
              {kpiLevels.map((lvl) => (
                <span key={lvl.id} className="flex items-center gap-1 shrink-0">
                  <span
                    className={`w-2 h-2 rounded-full ${lvl.dotClass || "bg-primary"}`}
                  />
                  <span className="truncate max-w-[140px]">
                    {lvl.result} ({lvl.min}–{lvl.max})
                  </span>
                </span>
              ))}
            </div>
            <span>{displayMaxScore} คะแนน</span>
          </div>
        </div>

        {/* Table / List Header for desktop */}
        <div className="hidden sm:grid sm:grid-cols-[145px_230px_1fr_40px] items-center gap-3 px-4 py-2 text-xs font-semibold text-muted-foreground bg-muted/30 rounded-xl border border-border/50">
          <div>สี / ลำดับ</div>
          <div>เกณฑ์คะแนน</div>
          <div>ผลคะแนน</div>
          <div className="text-center">ลบ</div>
        </div>

        <div className="space-y-2">
          {kpiLevels.map((lvl, idx) => (
            <div
              key={lvl.id}
              className="flex flex-col sm:grid sm:grid-cols-[145px_230px_1fr_40px] items-start sm:items-center gap-2.5 sm:gap-3 p-3 sm:px-4 sm:py-2.5 rounded-xl border border-border bg-background hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-2xs group"
            >
              {/* Col 1: Index + Color Dropdown Button */}
              <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-muted text-[11px] font-bold text-muted-foreground">
                    {idx + 1}
                  </span>

                  {/* Compact Color Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveColorPickerId(
                          activeColorPickerId === lvl.id ? null : lvl.id
                        )
                      }
                      className="flex items-center gap-1.5 h-8 px-2 rounded-lg border border-border bg-card hover:bg-muted/60 text-xs font-medium cursor-pointer transition-colors shadow-2xs"
                    >
                      <span
                        className={`w-3 h-3 rounded-full shrink-0 ${lvl.dotClass || "bg-primary"}`}
                      />
                      <span className="text-xs">
                        {KPI_COLOR_PALETTES.find((p) => p.id === lvl.colorId)?.label || "สี"}
                      </span>
                      <ChevronDown size={12} className="text-muted-foreground ml-0.5" />
                    </button>

                    {activeColorPickerId === lvl.id && (
                      <div className="absolute left-0 top-full mt-1 z-40 p-1.5 bg-popover border border-border rounded-xl shadow-lg flex flex-col gap-0.5 min-w-[125px]">
                        {KPI_COLOR_PALETTES.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              handleUpdateKpiLevel(lvl.id, "colorId", p.id);
                              setActiveColorPickerId(null);
                            }}
                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-accent transition-colors cursor-pointer w-full text-left ${lvl.colorId === p.id
                              ? "bg-accent font-semibold text-primary"
                              : "text-foreground"
                              }`}
                          >
                            <span className={`w-3 h-3 rounded-full shrink-0 ${p.dotClass}`} />
                            <span>{p.label}</span>
                            {lvl.colorId === p.id && (
                              <Check size={12} className="ml-auto text-primary" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile delete button */}
                {kpiLevels.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteKpiLevel(lvl.id)}
                    title="ลบเกณฑ์นี้"
                    className="sm:hidden p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {/* Col 2: เกณฑ์คะแนน (min - max) */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <span className="text-xs text-muted-foreground font-medium whitespace-nowrap sm:hidden">
                  เกณฑ์คะแนน:
                </span>
                <span className="text-xs text-muted-foreground font-medium shrink-0">
                  ตั้งแต่
                </span>
                <Input
                  type="number"
                  value={lvl.min}
                  onChange={(e) =>
                    handleUpdateKpiLevel(
                      lvl.id,
                      "min",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="h-8.5 w-16 text-center text-xs font-bold rounded-lg"
                />
                <span className="text-xs text-muted-foreground font-medium shrink-0">
                  ถึง
                </span>
                <Input
                  type="number"
                  value={lvl.max}
                  onChange={(e) =>
                    handleUpdateKpiLevel(
                      lvl.id,
                      "max",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="h-8.5 w-16 text-center text-xs font-bold rounded-lg"
                />
                <span className="text-xs text-muted-foreground font-medium shrink-0">
                  คะแนน
                </span>
              </div>

              {/* Col 3: ผลคะแนน */}
              <div className="w-full flex items-center gap-2 min-w-0">
                <span className="text-xs text-muted-foreground font-medium whitespace-nowrap sm:hidden">
                  ผลคะแนน:
                </span>
                <Input
                  value={lvl.result}
                  onChange={(e) =>
                    handleUpdateKpiLevel(lvl.id, "result", e.target.value)
                  }
                  placeholder="ระบุผลคะแนน เช่น ระดับต่ำ (ปกติ), ระดับปานกลาง, ระดับสูง..."
                  className="h-8.5 text-xs font-medium rounded-lg w-full"
                />
              </div>

              {/* Col 4: Desktop Delete button */}
              <div className="hidden sm:flex items-center justify-center">
                {kpiLevels.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteKpiLevel(lvl.id)}
                    title="ลบเกณฑ์นี้"
                    className="p-1.5 text-muted-foreground/60 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                ) : (
                  <span className="w-6" />
                )}
              </div>
            </div>
          ))}

          {/* Add level dashed button */}
          <button
            type="button"
            onClick={handleAddKpiLevel}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-border/80 hover:border-primary/60 bg-muted/15 hover:bg-primary/[0.04] text-muted-foreground hover:text-primary transition-all text-xs font-semibold cursor-pointer"
          >
            <Plus size={15} />
            <span>เพิ่มเกณฑ์คะแนน (เกณฑ์ที่ {kpiLevels.length + 1})</span>
          </button>
        </div>
      </div>

      {/* Bottom Save / Cancel Action Bar */}
      <div className="flex items-center justify-end gap-3 pt-4 pb-12 border-t border-border/60">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="rounded-xl bg-white border-rose-300 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs sm:text-sm font-medium px-4 cursor-pointer"
        >
          <X size={15} className="mr-1" />
          <span>ยกเลิก</span>
        </Button>

        <Button
          type="button"
          onClick={handleSave}
          className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-semibold px-6 shadow-sm transition-all active:scale-[0.98] cursor-pointer flex items-center gap-1.5"
        >
          <Check size={16} />
          <span>บันทึกแบบฟอร์ม</span>
        </Button>
      </div>
    </div>
  );
}
