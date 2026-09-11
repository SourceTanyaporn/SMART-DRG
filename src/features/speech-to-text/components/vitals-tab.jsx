import { HeartPulse, Scale, Wind } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Grid } from "@/components/ui/grid";
import { Select } from "@/components/ui/select";
import { DualInput, InputField } from "@/components/ui/input";

export const calculateMAP = (sys, dia) => {
    const s = parseFloat(sys);
    const d = parseFloat(dia);
    if (isNaN(s) || isNaN(d) || s <= 0 || d <= 0) return "";
    return String(Math.round(((2 * d + s) / 3) * 10) / 10);
};

export const calculateBMI = (wt, ht) => {
    const w = parseFloat(wt);
    const h = parseFloat(ht) / 100;
    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) return null;
    const bmi = w / (h * h);
    let status = "สมส่วน (Normal)";
    let color = "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25";
    if (bmi < 18.5) {
        status = "น้ำหนักน้อย (Underweight)";
        color = "text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/25";
    } else if (bmi >= 23 && bmi < 25) {
        status = "ท้วม (Overweight)";
        color = "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/25";
    } else if (bmi >= 25 && bmi < 30) {
        status = "อ้วนระดับ 1 (Obese I)";
        color = "text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/25";
    } else if (bmi >= 30) {
        status = "อ้วนระดับ 2 (Obese II)";
        color = "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/25";
    }
    return { value: bmi.toFixed(1), status, color };
};

export const calculateBSA = (wt, ht) => {
    const w = parseFloat(wt);
    const h = parseFloat(ht);
    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) return "";
    // Mosteller formula: sqrt((weight in kg * height in cm) / 3600)
    return (Math.sqrt((w * h) / 3600)).toFixed(2);
};

export function ScoreBox({ title, values, value, onChange }) {
    const painColors = [
        "bg-emerald-500 hover:bg-emerald-600", // 0
        "bg-emerald-400 hover:bg-emerald-500", // 1
        "bg-lime-500 hover:bg-lime-600",       // 2
        "bg-lime-400 hover:bg-lime-500",       // 3
        "bg-yellow-400 hover:bg-yellow-500",   // 4
        "bg-yellow-500 hover:bg-yellow-600",   // 5
        "bg-amber-500 hover:bg-amber-600",     // 6
        "bg-orange-500 hover:bg-orange-600",   // 7
        "bg-orange-600 hover:bg-orange-700",   // 8
        "bg-rose-500 hover:bg-rose-600",       // 9
        "bg-rose-600 hover:bg-rose-700",       // 10
    ];

    const getPainLabel = (val) => {
        const n = parseInt(val, 10);
        if (isNaN(n)) return "";
        if (n === 0) return "ไม่ปวด";
        if (n <= 3) return "ปวดเล็กน้อย";
        if (n <= 6) return "ปวดปานกลาง";
        return "ปวดรุนแรง";
    };

    return (
        <div className="flex flex-col justify-between h-full space-y-1">
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">{title}</span>
                {value !== "" && value !== undefined && (
                    <span className="text-[10px] font-semibold text-muted-foreground truncate max-w-[90px]">
                        {value} ({getPainLabel(value)})
                    </span>
                )}
            </div>

            <div className="flex w-full items-center gap-0.5 pt-0.5">
                {values.map((v, index) => {
                    const isSelected = String(value) === String(v);
                    return (
                        <button
                            key={v}
                            type="button"
                            onClick={() => onChange?.(v)}
                            className={`cursor-pointer flex-1 h-6 sm:h-6.5 min-w-0 flex items-center justify-center rounded-xs sm:rounded text-[8px] sm:text-[9px] font-bold text-white transition-all ${painColors[index]} ${isSelected
                                ? "ring-2 ring-primary ring-offset-1 ring-offset-background scale-105 z-10 shadow-xs font-black"
                                : "opacity-85 hover:opacity-100 hover:scale-105"
                                }`}
                            title={`Pain Score: ${v} - ${getPainLabel(v)}`}
                        >
                            {v}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export function DiffBadge({ label = "คัดกรอง", originalValue, unit = "", onRevert, className = "" }) {
    if (originalValue === null || originalValue === undefined || originalValue === "") return null;
    return (
        <div className={`mt-1 flex items-center justify-between gap-1 rounded bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 text-[9.5px] sm:text-[10px] text-amber-800 dark:text-amber-300 font-medium animate-in fade-in duration-200 ${className}`}>
            <span className="truncate">
                {label}: <strong className="font-bold text-amber-900 dark:text-amber-200">{originalValue}</strong> {unit}
            </span>
            {onRevert && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRevert();
                    }}
                    className="cursor-pointer shrink-0 font-semibold text-primary hover:underline ml-1 text-[9.5px]"
                    title="คลิกเพื่อคืนค่าเป็นค่าเดิมจากจุดคัดกรอง"
                >
                    คืนค่าเดิม
                </button>
            )}
        </div>
    );
}

export function VitalsTab({ formData, setFormData, triageBaseline = {}, onRevertField }) {
    const hasBp1Conflict = Boolean(
        (triageBaseline.systolic && formData.systolic && formData.systolic !== triageBaseline.systolic) ||
        (triageBaseline.diastolic && formData.diastolic && formData.diastolic !== triageBaseline.diastolic)
    );

    const hasBp2Conflict = Boolean(
        (triageBaseline.systolic2 && formData.systolic2 && formData.systolic2 !== triageBaseline.systolic2) ||
        (triageBaseline.diastolic2 && formData.diastolic2 && formData.diastolic2 !== triageBaseline.diastolic2)
    );

    const currentPr = formData.pr || formData.pulse || "";
    const baselinePr = triageBaseline.pr || triageBaseline.pulse || "";
    const hasPrConflict = Boolean(baselinePr && currentPr && currentPr !== baselinePr);

    const hasO2Conflict = Boolean(triageBaseline.o2sat && formData.o2sat && formData.o2sat !== triageBaseline.o2sat);
    const hasBtConflict = Boolean(triageBaseline.bodyTemperature && formData.bodyTemperature && formData.bodyTemperature !== triageBaseline.bodyTemperature);
    const hasRrConflict = Boolean(triageBaseline.respiratory && formData.respiratory && formData.respiratory !== triageBaseline.respiratory);

    const hasWeightConflict = Boolean(triageBaseline.weight && formData.weight && formData.weight !== triageBaseline.weight);
    const hasHeightConflict = Boolean(triageBaseline.height && formData.height && formData.height !== triageBaseline.height);
    const hasChestConflict = Boolean(triageBaseline.chest && formData.chest && formData.chest !== triageBaseline.chest);
    const hasWaistConflict = Boolean(triageBaseline.waist && formData.waist && formData.waist !== triageBaseline.waist);

    const hasPainConflict = Boolean(triageBaseline.painScore !== undefined && triageBaseline.painScore !== "" && formData.painScore !== "" && formData.painScore !== triageBaseline.painScore);
    const hasEsiConflict = Boolean(triageBaseline.esi && formData.esi && formData.esi !== triageBaseline.esi);
    const hasBarthelConflict = Boolean(triageBaseline.barthelIndex && formData.barthelIndex && formData.barthelIndex !== triageBaseline.barthelIndex);
    const hasCvdConflict = Boolean(triageBaseline.cvdRisk && formData.cvdRisk && formData.cvdRisk !== triageBaseline.cvdRisk);

    return (
        <div className="flex h-full flex-col space-y-2.5 sm:space-y-3">
            {/* 3 Main Medical Category Cards Grid */}
            <div className="grid grid-cols-1 @[420px]:grid-cols-3 gap-2 sm:gap-2.5">

                {/* Card 1: Circulation & Heart (ความดันและชีพจร) */}
                <div className="flex flex-col rounded-xl border border-indigo-500/20 bg-gradient-to-b from-indigo-500/5 via-card to-card p-2.5 sm:p-3 shadow-2xs transition-all hover:border-indigo-500/40">
                    <div className="flex items-center gap-1.5 pb-1.5 mb-2 border-b border-indigo-500/10">
                        <div className="flex size-5.5 sm:size-6 shrink-0 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-500">
                            <HeartPulse className="size-3 sm:size-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-[11px] sm:text-xs font-bold text-foreground truncate">
                                ความดันโลหิตและชีพจร
                            </h3>
                        </div>
                    </div>

                    <div className="space-y-2 flex-1">
                        {/* BP1 */}
                        <div>
                            <DualInput
                                label="BP1"
                                size="sm"
                                value1={formData.systolic || ""}
                                value2={formData.diastolic || ""}
                                onChange1={(val) => {
                                    const mapVal = calculateMAP(val, formData.diastolic);
                                    setFormData(prev => ({
                                        ...prev,
                                        systolic: val,
                                        bp: `${val}/${prev.diastolic || ""}`,
                                        map: mapVal || prev.map
                                    }));
                                }}
                                onChange2={(val) => {
                                    const mapVal = calculateMAP(formData.systolic, val);
                                    setFormData(prev => ({
                                        ...prev,
                                        diastolic: val,
                                        bp: `${prev.systolic || ""}/${val}`,
                                        map: mapVal || prev.map
                                    }));
                                }}
                                unit="mmHg"
                            />
                            {hasBp1Conflict && (
                                <DiffBadge
                                    label="คัดกรอง"
                                    originalValue={`${triageBaseline.systolic || "-"}/${triageBaseline.diastolic || "-"}`}
                                    unit="mmHg"
                                    onRevert={() => onRevertField?.(['systolic', 'diastolic', 'bp', 'map'])}
                                />
                            )}
                        </div>

                        {/* BP2 */}
                        <div>
                            <DualInput
                                label="BP2"
                                size="sm"
                                value1={formData.systolic2 || ""}
                                value2={formData.diastolic2 || ""}
                                onChange1={(val) => {
                                    const mapVal = calculateMAP(val, formData.diastolic2);
                                    setFormData(prev => ({
                                        ...prev,
                                        systolic2: val,
                                        map2: mapVal || prev.map2
                                    }));
                                }}
                                onChange2={(val) => {
                                    const mapVal = calculateMAP(formData.systolic2, val);
                                    setFormData(prev => ({
                                        ...prev,
                                        diastolic2: val,
                                        map2: mapVal || prev.map2
                                    }));
                                }}
                                unit="mmHg"
                            />
                            {hasBp2Conflict && (
                                <DiffBadge
                                    label="คัดกรอง"
                                    originalValue={`${triageBaseline.systolic2 || "-"}/${triageBaseline.diastolic2 || "-"}`}
                                    unit="mmHg"
                                    onRevert={() => onRevertField?.(['systolic2', 'diastolic2', 'map2'])}
                                />
                            )}
                        </div>

                        {/* MAP & MAP2 */}
                        <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                            <InputField
                                label="MAP"
                                unit="mmHg"
                                size="sm"
                                disabled
                                inputClassName="text-center text-[11px]"
                                value={formData.map || (formData.systolic && formData.diastolic ? calculateMAP(formData.systolic, formData.diastolic) : "")}
                                onChange={(e) => setFormData(prev => ({ ...prev, map: e.target.value }))}
                                placeholder="-"
                            />
                            <InputField
                                disabled
                                label="MAP2"
                                unit="mmHg"
                                size="sm"
                                inputClassName="text-center text-[11px]"
                                value={formData.map2 || (formData.systolic2 && formData.diastolic2 ? calculateMAP(formData.systolic2, formData.diastolic2) : "")}
                                onChange={(e) => setFormData(prev => ({ ...prev, map2: e.target.value }))}
                                placeholder="-"
                            />
                        </div>

                        {/* PR */}
                        <div>
                            <InputField
                                label="PR"
                                unit="bpm"
                                size="sm"
                                inputClassName="text-center text-[11px]"
                                value={formData.pr || formData.pulse || ""}
                                onChange={(e) => setFormData(prev => ({ ...prev, pr: e.target.value, pulse: e.target.value }))}
                                placeholder="-"
                            />
                            {hasPrConflict && (
                                <DiffBadge
                                    label="คัดกรอง"
                                    originalValue={baselinePr}
                                    unit="bpm"
                                    onRevert={() => onRevertField?.(['pr', 'pulse'])}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Card 2: Respiration, Temperature & Oxygen (หายใจ ออกซิเจน อุณหภูมิ) */}
                <div className="flex flex-col rounded-xl border border-sky-500/20 bg-gradient-to-b from-sky-500/5 via-card to-card p-2.5 sm:p-3 shadow-2xs transition-all hover:border-sky-500/40">
                    <div className="flex items-center gap-1.5 pb-1.5 mb-2 border-b border-sky-500/10">
                        <div className="flex size-5.5 sm:size-6 shrink-0 items-center justify-center rounded-md bg-sky-500/10 text-sky-500">
                            <Wind className="size-3 sm:size-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-[11px] sm:text-xs font-bold text-foreground truncate">
                                การหายใจและอุณหภูมิ
                            </h3>
                        </div>
                    </div>

                    <div className="space-y-2 flex-1">
                        {/* SpO2 */}
                        <div>
                            <InputField
                                label="O2sat"
                                badge={formData.o2sat ? (
                                    <span className={`text-[9px] font-semibold px-1 py-0.2 rounded border ${Number(formData.o2sat) >= 95
                                        ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
                                        : "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30"
                                        }`}>
                                        {Number(formData.o2sat) >= 95 ? "ปกติ" : "ต่ำ"}
                                    </span>
                                ) : null}
                                unit="%"
                                size="sm"
                                inputClassName="text-center text-[11px]"
                                value={formData.o2sat || ""}
                                onChange={(e) => setFormData(prev => ({ ...prev, o2sat: e.target.value }))}
                                placeholder="-"
                            />
                            {hasO2Conflict && (
                                <DiffBadge
                                    label="คัดกรอง"
                                    originalValue={triageBaseline.o2sat}
                                    unit="%"
                                    onRevert={() => onRevertField?.('o2sat')}
                                />
                            )}
                        </div>

                        {/* BT */}
                        <div>
                            <InputField
                                label="BT"
                                badge={formData.bodyTemperature ? (
                                    <span className={`text-[9px] font-semibold px-1 py-0.2 rounded border ${Number(formData.bodyTemperature) >= 37.5
                                        ? "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30"
                                        : "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
                                        }`}>
                                        {Number(formData.bodyTemperature) >= 38.5 ? "ไข้สูง" : Number(formData.bodyTemperature) >= 37.5 ? "มีไข้" : "ปกติ"}
                                    </span>
                                ) : null}
                                unit="°C"
                                size="sm"
                                inputClassName="text-center text-[11px]"
                                value={formData.bodyTemperature || ""}
                                onChange={(e) => setFormData(prev => ({ ...prev, bodyTemperature: e.target.value }))}
                                placeholder="-"
                            />
                            {hasBtConflict && (
                                <DiffBadge
                                    label="คัดกรอง"
                                    originalValue={triageBaseline.bodyTemperature}
                                    unit="°C"
                                    onRevert={() => onRevertField?.('bodyTemperature')}
                                />
                            )}
                        </div>

                        {/* RR */}
                        <div>
                            <InputField
                                label="RR"
                                unit="/min"
                                size="sm"
                                inputClassName="text-center text-[11px]"
                                value={formData.respiratory || ""}
                                onChange={(e) => setFormData(prev => ({ ...prev, respiratory: e.target.value }))}
                                placeholder="-"
                            />
                            {hasRrConflict && (
                                <DiffBadge
                                    label="คัดกรอง"
                                    originalValue={triageBaseline.respiratory}
                                    unit="/min"
                                    onRevert={() => onRevertField?.('respiratory')}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Card 3: Body Measurements & BMI / BSA (สัดส่วนร่างกาย & BMI / BSA) */}
                <div className="flex flex-col rounded-xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/5 via-card to-card p-2.5 sm:p-3 shadow-2xs transition-all hover:border-emerald-500/40">
                    <div className="flex items-center gap-1.5 pb-1.5 mb-2 border-b border-emerald-500/10">
                        <div className="flex size-5.5 sm:size-6 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500">
                            <Scale className="size-3 sm:size-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-[11px] sm:text-xs font-bold text-foreground truncate">
                                สัดส่วนร่างกาย & BMI / BSA
                            </h3>
                        </div>
                    </div>

                    <div className="space-y-2 flex-1">
                        {/* Weight & Height */}
                        <div className="grid grid-cols-2 gap-1.5">
                            <div>
                                <InputField
                                    label="น้ำหนัก"
                                    unit="kg"
                                    size="sm"
                                    inputClassName="text-center text-[11px]"
                                    value={formData.weight || ""}
                                    onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                                    placeholder="-"
                                />
                                {hasWeightConflict && (
                                    <DiffBadge
                                        label="คัดกรอง"
                                        originalValue={triageBaseline.weight}
                                        unit="kg"
                                        onRevert={() => onRevertField?.('weight')}
                                    />
                                )}
                            </div>
                            <div>
                                <InputField
                                    label="ส่วนสูง"
                                    unit="cm"
                                    size="sm"
                                    inputClassName="text-center text-[11px]"
                                    value={formData.height || ""}
                                    onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                                    placeholder="-"
                                />
                                {hasHeightConflict && (
                                    <DiffBadge
                                        label="คัดกรอง"
                                        originalValue={triageBaseline.height}
                                        unit="cm"
                                        onRevert={() => onRevertField?.('height')}
                                    />
                                )}
                            </div>
                        </div>

                        {/* BMI & BSA (คำนวณอัตโนมัติ) */}
                        <div className="grid grid-cols-2 gap-1.5">
                            {(() => {
                                const bmiInfo = calculateBMI(formData.weight, formData.height);
                                return (
                                    <InputField
                                        label="BMI"
                                        badge={bmiInfo ? (
                                            <span className={`text-[8px] font-semibold px-1 py-0.2 rounded border ${bmiInfo.color}`}>
                                                {bmiInfo.status.split(" ")[0]}
                                            </span>
                                        ) : null}
                                        unit="kg/m²"
                                        size="sm"
                                        disabled
                                        inputClassName="text-center text-[11px]"
                                        value={formData.bmi !== "" ? formData.bmi : (bmiInfo?.value || "")}
                                        onChange={(e) => setFormData(prev => ({ ...prev, bmi: e.target.value }))}
                                        placeholder="-"
                                    />
                                );
                            })()}

                            <InputField
                                label="BSA"
                                badge={calculateBSA(formData.weight, formData.height) ? (
                                    <span className="text-[8px] font-medium text-muted-foreground">
                                        Mosteller
                                    </span>
                                ) : null}
                                unit="m²"
                                size="sm"
                                disabled
                                inputClassName="text-center text-[11px]"
                                value={formData.bsa !== "" ? formData.bsa : (calculateBSA(formData.weight, formData.height) || "")}
                                onChange={(e) => setFormData(prev => ({ ...prev, bsa: e.target.value }))}
                                placeholder="-"
                            />
                        </div>

                        {/* รอบอก & รอบเอว */}
                        <div className="grid grid-cols-2 gap-1.5">
                            <div>
                                <InputField
                                    label="รอบอก"
                                    unit="cm"
                                    size="sm"
                                    inputClassName="text-center text-[11px]"
                                    value={formData.chest || ""}
                                    onChange={(e) => setFormData(prev => ({ ...prev, chest: e.target.value }))}
                                    placeholder="-"
                                />
                                {hasChestConflict && (
                                    <DiffBadge
                                        label="คัดกรอง"
                                        originalValue={triageBaseline.chest}
                                        unit="cm"
                                        onRevert={() => onRevertField?.('chest')}
                                    />
                                )}
                            </div>
                            <div>
                                <InputField
                                    label="รอบเอว"
                                    unit="cm"
                                    size="sm"
                                    inputClassName="text-center text-[11px]"
                                    value={formData.waist || ""}
                                    onChange={(e) => setFormData(prev => ({ ...prev, waist: e.target.value }))}
                                    placeholder="-"
                                />
                                {hasWaistConflict && (
                                    <DiffBadge
                                        label="คัดกรอง"
                                        originalValue={triageBaseline.waist}
                                        unit="cm"
                                        onRevert={() => onRevertField?.('waist')}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Section 2: Clinical Scores & Triage (การประเมินคะแนนและความเร่งด่วน) */}
            <div className="grid grid-cols-1 @[320px]:grid-cols-2 @[560px]:grid-cols-4 gap-2 sm:gap-2.5 pt-0.5">

                {/* Pain Score */}
                <div className="flex flex-col rounded-xl border border-border bg-card p-2.5 sm:p-3 shadow-2xs transition hover:border-border/80">
                    <ScoreBox
                        title="Pain Score"
                        values={["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]}
                        value={formData.painScore}
                        onChange={(val) => setFormData(prev => ({ ...prev, painScore: val }))}
                    />
                    {hasPainConflict && (
                        <DiffBadge
                            label="คัดกรอง"
                            originalValue={`${triageBaseline.painScore}/10`}
                            onRevert={() => onRevertField?.('painScore')}
                        />
                    )}
                </div>

                {/* ESI Triage */}
                <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-2.5 sm:p-3 shadow-2xs transition hover:border-border/80">
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-bold text-foreground">
                                ESI
                            </label>
                        </div>
                        <Select
                            value={formData.esi || "ESI 3"}
                            onValueChange={(val) => setFormData(prev => ({ ...prev, esi: val }))}
                            placeholder="เลือก ESI"
                            options={[
                                { value: "ESI 1", label: "ESI 1 : แดง" },
                                { value: "ESI 2", label: "ESI 2 : ชมพู" },
                                { value: "ESI 3", label: "ESI 3 : เหลือง" },
                                { value: "ESI 4", label: "ESI 4 : เขียว" },
                                { value: "ESI 5", label: "ESI 5 : ขาว" },
                            ]}
                            className="h-7.5 sm:h-8 w-full rounded-lg border-input bg-muted/40 px-2 text-[11px] sm:text-xs font-semibold text-foreground hover:bg-muted/70"
                        />
                        {hasEsiConflict && (
                            <DiffBadge
                                label="คัดกรอง"
                                originalValue={triageBaseline.esi}
                                onRevert={() => onRevertField?.('esi')}
                            />
                        )}
                    </div>
                </div>

                {/* Barthel Index */}
                <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-2.5 sm:p-3 shadow-2xs transition hover:border-border/80">
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-bold text-foreground">
                                Barthel Index
                            </label>
                        </div>
                        <Select
                            value={formData.barthelIndex || "20"}
                            onValueChange={(val) => setFormData(prev => ({ ...prev, barthelIndex: val }))}
                            placeholder="เลือก Barthel Index"
                            options={Array.from({ length: 21 }, (_, i) => String(i))}
                            className="h-7.5 sm:h-8 w-full rounded-lg border-input bg-muted/40 px-2 text-[11px] sm:text-xs font-semibold text-foreground hover:bg-muted/70"
                        />
                        {hasBarthelConflict && (
                            <DiffBadge
                                label="คัดกรอง"
                                originalValue={triageBaseline.barthelIndex}
                                onRevert={() => onRevertField?.('barthelIndex')}
                            />
                        )}
                    </div>
                </div>

                {/* CVD Risk */}
                <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-2.5 sm:p-3 shadow-2xs transition hover:border-border/80">
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-bold text-foreground">
                                CVD Risk
                            </label>
                        </div>
                        <Select
                            value={formData.cvdRisk || "< 10%"}
                            onValueChange={(val) => setFormData(prev => ({ ...prev, cvdRisk: val }))}
                            placeholder="เลือก CVD Risk"
                            options={[
                                { value: "< 10%", label: "< 10% : เสี่ยงต่ำ" },
                                { value: "10-20%", label: "10 - 20% : เสี่ยงปานกลาง" },
                                { value: "20-30%", label: "20 - 30% : เสี่ยงสูง" },
                                { value: "30-40%", label: "30 - 40% : เสี่ยงสูงมาก" },
                                { value: ">= 40%", label: "≥ 40% : เสี่ยงสูงสุด" },
                            ]}
                            className="h-7.5 sm:h-8 w-full rounded-lg border-input bg-muted/40 px-2 text-[11px] sm:text-xs font-semibold text-foreground hover:bg-muted/70"
                        />
                        {hasCvdConflict && (
                            <DiffBadge
                                label="คัดกรอง"
                                originalValue={triageBaseline.cvdRisk}
                                onRevert={() => onRevertField?.('cvdRisk')}
                            />
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
