import React, { useState } from "react";
import { Bot, ChevronDown, ChevronUp, Layers } from "lucide-react";
import { Grid } from "@/components/ui/grid";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

function parseCodesAndDescriptions(primaryCode, primaryName, rawList, secondaryRaw) {
    const secondary = [];

    if (Array.isArray(rawList) && rawList.length > 0) {
        let foundPrimary = false;
        rawList.forEach((item, idx) => {
            const isObj = typeof item === "object" && item !== null;
            const code = isObj ? (item.code || item.id || "") : String(item).split(/[\s(]/)[0];
            const name = isObj ? (item.name || item.description || item.desc || "") : String(item);
            const isPrimary = isObj && item.type ? item.type === "primary" : idx === 0;

            if (isPrimary && !foundPrimary) {
                primaryCode = primaryCode || code;
                primaryName = primaryName || name;
                foundPrimary = true;
            } else {
                if (code && code !== "-") {
                    secondary.push({ code, name: name !== code ? name : "" });
                }
            }
        });
    }

    // 2. If secondaryRaw is passed (array or comma-separated string)
    if (Array.isArray(secondaryRaw)) {
        secondaryRaw.forEach((item) => {
            const isObj = typeof item === "object" && item !== null;
            const code = isObj ? (item.code || item.id || "") : String(item).split(/[\s(]/)[0].trim();
            const name = isObj ? (item.name || item.desc || "") : String(item).trim();
            if (code && code !== "-" && !secondary.some((s) => s.code === code)) {
                secondary.push({ code, name: name !== code ? name : "" });
            }
        });
    } else if (typeof secondaryRaw === "string" && secondaryRaw.trim() && secondaryRaw !== "-") {
        secondaryRaw.split(/[,;\n]+/).forEach((part) => {
            const trimmed = part.trim();
            if (!trimmed || trimmed === "-") return;
            const codeMatch = trimmed.match(/^([A-Za-z0-9.]+)/);
            const code = codeMatch ? codeMatch[1] : trimmed;
            const nameMatch = trimmed.match(/\((.*?)\)/);
            const name = nameMatch ? nameMatch[1] : trimmed.replace(code, "").trim();
            if (code && !secondary.some((s) => s.code === code)) {
                secondary.push({ code, name });
            }
        });
    }

    // 3. If primaryCode itself has comma-separated values (e.g. "J11.1, I10")
    if (typeof primaryCode === "string" && (primaryCode.includes(",") || primaryCode.includes(";"))) {
        const parts = primaryCode.split(/[,;]+/).map((s) => s.trim()).filter(Boolean);
        if (parts.length > 1) {
            primaryCode = parts[0];
            parts.slice(1).forEach((sub) => {
                if (sub && !secondary.some((s) => s.code === sub)) {
                    secondary.push({ code: sub, name: "" });
                }
            });
        }
    }

    return {
        primary: {
            code: primaryCode || "-",
            name: primaryName || "",
        },
        secondary,
    };
}

export function CodeRow({
    label,
    code,
    description,
    primaryBadge = "โรคหลัก",
    secondaryLabel = "โรคร่วม / แทรก",
    secondaryList = [],
    onRefresh,
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasSecondary = secondaryList && secondaryList.length > 0;
    const totalCount = 1 + (hasSecondary ? secondaryList.length : 0);

    return (
        <TooltipProvider delay={150}>
            <div className="min-w-0 rounded-xl border border-border bg-card/90 p-2.5 shadow-2xs hover:border-border/80 transition flex flex-col justify-between">
                <div>
                    {/* Header Row: Label, Total count badge, Refresh */}
                    <div className="mb-1.5 flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                {label}
                            </span>
                            {hasSecondary && (
                                <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.2 text-[9.5px] font-bold text-primary shrink-0">
                                    <Layers size={9} />
                                    {totalCount} รายการ
                                </span>
                            )}
                        </div>

                        {onRefresh && (
                            <button
                                type="button"
                                onClick={onRefresh}
                                className="text-[11px] font-bold text-primary hover:underline cursor-pointer p-0.5 rounded transition"
                                title="รีเฟรชข้อมูลรหัส"
                                aria-label="รีเฟรช"
                            >
                                ↻
                            </button>
                        )}
                    </div>

                    {/* Primary Code Area */}
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <p className="truncate text-[13px] font-bold text-foreground font-mono">
                                {code}
                            </p>
                            {hasSecondary && (
                                <span className="inline-block text-[9px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-1 py-0.2 rounded-sm shrink-0">
                                    {primaryBadge}
                                </span>
                            )}
                        </div>

                        <p
                            className="mt-0.5 text-[10.5px] text-muted-foreground font-medium line-clamp-2 leading-relaxed"
                            title={description}
                        >
                            {description || "-"}
                        </p>
                    </div>
                </div>

                {/* Secondary Codes Area (Badge / Chips List) */}
                {hasSecondary && (
                    <div className="mt-2 pt-2 border-t border-border/60">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                            <span className="font-semibold">
                                {secondaryLabel} ({secondaryList.length})
                            </span>
                            {secondaryList.length > 2 && (
                                <button
                                    type="button"
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="inline-flex items-center gap-0.5 text-[10px] text-primary hover:underline font-semibold cursor-pointer"
                                >
                                    <span>{isExpanded ? "ย่อ" : `ดูทั้งหมด`}</span>
                                    {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                                </button>
                            )}
                        </div>

                        {/* Collapsed view: Show chips with tooltip */}
                        {!isExpanded ? (
                            <div className="flex flex-wrap items-center gap-1">
                                {secondaryList.slice(0, 3).map((item, idx) => (
                                    <Tooltip key={`${item.code}-${idx}`}>
                                        <TooltipTrigger asChild>
                                            <span className="inline-flex items-center gap-1 rounded-md bg-muted/90 hover:bg-muted border border-border/80 px-1.5 py-0.5 text-[10px] font-mono font-medium text-foreground cursor-default transition-colors">
                                                <span className="size-1 rounded-full bg-amber-500 shrink-0" />
                                                <span className="truncate max-w-[80px]">{item.code}</span>
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="text-xs max-w-xs p-2">
                                            <p className="font-mono font-bold text-foreground">{item.code}</p>
                                            {item.name && (
                                                <p className="text-[11px] text-muted-foreground mt-0.5">{item.name}</p>
                                            )}
                                        </TooltipContent>
                                    </Tooltip>
                                ))}

                                {secondaryList.length > 3 && (
                                    <button
                                        type="button"
                                        onClick={() => setIsExpanded(true)}
                                        className="inline-flex items-center rounded-md bg-primary/10 hover:bg-primary/20 text-primary px-1.5 py-0.5 text-[10px] font-bold transition-colors cursor-pointer"
                                    >
                                        +{secondaryList.length - 3}
                                    </button>
                                )}
                            </div>
                        ) : (
                            /* Expanded view: Detailed list */
                            <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                                {secondaryList.map((item, idx) => (
                                    <div
                                        key={`${item.code}-${idx}`}
                                        className="flex items-start gap-1.5 rounded-lg bg-muted/40 p-1.5 border border-border/50 text-[10px]"
                                    >
                                        <span className="size-1.5 rounded-full bg-amber-500 mt-1 shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <span className="font-mono font-bold text-foreground">
                                                {item.code}
                                            </span>
                                            {item.name && (
                                                <p className="text-muted-foreground text-[9.5px] truncate">
                                                    {item.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </TooltipProvider>
    );
}

export function AiSummaryCard({ formData = {}, onRefreshCode, className = "" }) {
    // 1. ICD-10 Parsing (Primary + Secondary)
    const rawIcd10Code =
        formData.icd10Code && formData.icd10Code !== "-"
            ? formData.icd10Code
            : (formData.icd10?.split(" ")[0] || "J11.1");

    const rawIcd10Desc =
        formData.icd10Name && formData.icd10Name !== "-"
            ? formData.icd10Name
            : (formData.icd10Desc || (formData.icd10?.includes("(") ? formData.icd10.split("(")[1].replace(")", "") : formData.icd10) || "Influenza with other respiratory manifestations / ไข้หวัดใหญ่");

    const icd10Parsed = parseCodesAndDescriptions(
        rawIcd10Code,
        rawIcd10Desc,
        formData.icd10List,
        formData.icd10Secondary || formData.secondaryDiagnoses || formData.secondary
    );

    // 2. ICD-9 Parsing (Primary + Secondary)
    const rawIcd9Code = formData.icd9Code || (formData.icd9?.split(" ")[0] || "-");
    const rawIcd9Desc =
        formData.icd9Name || formData.icd9Desc || (formData.icd9?.includes("(") ? formData.icd9.split("(")[1].replace(")", "") : "") || "-";

    const icd9Parsed = parseCodesAndDescriptions(
        rawIcd9Code,
        rawIcd9Desc,
        formData.icd9List,
        formData.icd9Secondary || formData.secondaryProcedures
    );

    // 3. DRG Parsing
    const drgCode =
        formData.drgCode && formData.drgCode !== "-"
            ? formData.drgCode
            : (formData.drg?.split(" ")[0] || "-");

    const drgDesc =
        formData.drgName && formData.drgName !== "-"
            ? formData.drgName
            : (formData.drgDesc || (formData.drg?.includes("(") ? formData.drg.split("(")[1].replace(")", "") : "") || "-");

    return (
        <section className={`overflow-hidden rounded-xl border border-border bg-card shadow-2xs ${className}`}>
            <div className="flex items-center gap-2 bg-muted/20 border-b border-border/80 px-3 py-2 text-[12px] font-semibold text-foreground">
                <Bot
                    size={13}
                    className="text-primary shrink-0"
                />
                <span>สรุปผลโดย AI</span>
            </div>

            <Grid cols={{ default: 1, sm: 3 }} gap={2} className="p-2">
                {/* 1. ICD-10 */}
                <CodeRow
                    label="ICD 10"
                    code={icd10Parsed.primary.code}
                    description={icd10Parsed.primary.name}
                    primaryBadge="โรคหลัก"
                    secondaryLabel="โรคร่วม / โรคแทรก"
                    secondaryList={icd10Parsed.secondary}
                    onRefresh={onRefreshCode ? () => onRefreshCode("icd10") : undefined}
                />

                {/* 2. ICD-9 CM */}
                <CodeRow
                    label="ICD 9"
                    code={icd9Parsed.primary.code}
                    description={icd9Parsed.primary.name}
                    primaryBadge="หัตถการหลัก"
                    secondaryLabel="หัตถการร่วม"
                    secondaryList={icd9Parsed.secondary}
                    onRefresh={onRefreshCode ? () => onRefreshCode("icd9") : undefined}
                />

                {/* 3. DRG */}
                <CodeRow
                    label="DRG"
                    code={drgCode}
                    description={drgDesc}
                    onRefresh={onRefreshCode ? () => onRefreshCode("drg") : undefined}
                />
            </Grid>
        </section>
    );
}

export { AiSummaryCard as AiSummary };
