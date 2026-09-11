import { useState } from "react";
import {
    ShieldAlert,
    AlertOctagon,
    X,
    Pill,
    Info,
    Check,
    AlertTriangle,
    ExternalLink,
    ChevronRight,
    Stethoscope,
    Sparkles,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function DrugAllergyAlert({
    alerts = [],
    selectedPatient,
    onDismissAlert,
    onRemoveDrugFromPlan,
}) {
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [dismissedAlertIds, setDismissedAlertIds] = useState(new Set());

    // Filter out dismissed alerts
    const activeAlerts = alerts.filter((a) => !dismissedAlertIds.has(a.id));

    if (activeAlerts.length === 0) return null;

    const primaryAlert = activeAlerts[0];

    const handleOpenDetail = (alert) => {
        setSelectedAlert(alert);
        setIsDetailModalOpen(true);
    };

    const handleDismiss = (alertId, e) => {
        if (e) e.stopPropagation();
        setDismissedAlertIds((prev) => new Set([...prev, alertId]));
        if (onDismissAlert) onDismissAlert(alertId);
    };

    return (
        <>
            {/* Top Red Safety Alert Banner */}
            <div className="relative z-20 mx-0 rounded-xl overflow-hidden shadow-md border-2 border-red-500 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white animate-in slide-in-from-top-3 duration-300">
                <div className="flex flex-wrap items-center justify-between gap-2.5 px-3.5 py-2.5">
                    {/* Left: Blinking Shield Alert Icon & Main Text */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xs text-white border border-white/30 shadow-inner">
                            <span className="absolute -top-1 -right-1 flex size-3">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-75" />
                                <span className="relative inline-flex size-3 rounded-full bg-amber-400" />
                            </span>
                            <ShieldAlert size={20} className="animate-pulse text-white" />
                        </div>

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                <span className="rounded bg-black/30 px-1.5 py-0.5 text-[10px] font-black tracking-wider uppercase text-amber-300 border border-amber-300/40">
                                    {primaryAlert.badge || "CRITICAL SAFETY ALERT"}
                                </span>
                                <span className="text-xs sm:text-[13px] font-bold tracking-tight">
                                    {primaryAlert.title || "ตรวจพบการสั่งยาที่ตรงกับประวัติแพ้ยาของผู้ป่วย!"}
                                </span>
                                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white">
                                    พบ {activeAlerts.length} รายการ
                                </span>
                            </div>

                            <p className="mt-0.5 text-[11px] sm:text-xs text-red-100 truncate">
                                {primaryAlert.message ? (
                                    primaryAlert.message
                                ) : (
                                    <>
                                        ในเสียงหรือแผนการรักษามีการระบุยา{" "}
                                        <strong className="font-extrabold text-white underline underline-offset-2">
                                            {primaryAlert.drug || primaryAlert.detectedDrug}
                                        </strong>{" "}
                                        ซึ่งผู้ป่วยมีประวัติแพ้{" "}
                                        <span className="font-bold text-amber-200">
                                            ({selectedPatient?.allergies || primaryAlert.allergen || primaryAlert.patientAllergy})
                                        </span>
                                    </>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Right: Actions & Details Button */}
                    <div className="flex items-center gap-2 shrink-0 ml-auto">
                        <button
                            type="button"
                            onClick={() => handleOpenDetail(primaryAlert)}
                            className="cursor-pointer flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-red-700 shadow-sm transition hover:bg-red-50 hover:shadow"
                        >
                            <AlertOctagon size={13} className="text-red-600" />
                            <span>ดูรายละเอียด & ทางเลือก</span>
                            <ChevronRight size={13} />
                        </button>

                        <button
                            type="button"
                            onClick={(e) => handleDismiss(primaryAlert.id, e)}
                            className="cursor-pointer flex size-7 items-center justify-center rounded-lg bg-black/20 text-white/80 hover:bg-black/30 hover:text-white transition"
                            title="ปิดการแจ้งเตือนชั่วคราว"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>

                {/* Sub-strip if more than 1 alert is detected */}
                {activeAlerts.length > 1 && (
                    <div className="flex items-center gap-2 bg-black/25 px-3.5 py-1 text-[11px] text-red-100 border-t border-white/10">
                        <span className="font-semibold text-amber-300">รายการยาอื่นที่ตรวจพบ:</span>
                        <div className="flex flex-wrap gap-1.5">
                            {activeAlerts.slice(1).map((alt) => (
                                <button
                                    key={alt.id}
                                    type="button"
                                    onClick={() => handleOpenDetail(alt)}
                                    className="cursor-pointer underline hover:text-white"
                                >
                                    {alt.detectedDrug}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Comprehensive Drug Allergy & CDS Recommendation Modal */}
            <Dialog
                open={isDetailModalOpen}
                onOpenChange={setIsDetailModalOpen}
            >
                <DialogContent className="max-w-lg w-[calc(100%-2rem)] rounded-2xl p-0 overflow-hidden border-2 border-red-300 shadow-2xl">
                    <div className="bg-gradient-to-r from-red-600 to-rose-700 px-5 py-3.5 text-white">
                        <div className="flex items-center gap-2.5">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-white/20 border border-white/30 text-white">
                                <ShieldAlert size={20} />
                            </div>
                            <div>
                                <DialogTitle className="text-sm sm:text-base font-bold text-white">
                                    ระบบแจ้งเตือนความปลอดภัยด้านยา (Drug Allergy Alert)
                                </DialogTitle>
                                <DialogDescription className="text-xs text-red-100">
                                    Clinical Decision Support System (CDSS)
                                </DialogDescription>
                            </div>
                        </div>
                    </div>

                    {selectedAlert && (
                        <div className="p-5 space-y-4 text-xs text-slate-700 max-h-[70vh] overflow-y-auto">
                            {/* Patient Info Header */}
                            <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5">
                                <div>
                                    <p className="font-bold text-slate-800 text-[13px]">
                                        {selectedPatient?.fullName}
                                    </p>
                                    <p className="text-[11px] text-slate-500">
                                        HN: {selectedPatient?.hn} | เพศ: {selectedPatient?.gender} | อายุ: {selectedPatient?.age} ปี
                                    </p>
                                </div>
                                <span className="rounded-md bg-rose-100 text-rose-800 border border-rose-200 px-2 py-0.5 text-[10px] font-bold">
                                    {selectedAlert.severityLevel}
                                </span>
                            </div>

                            {/* Alert Details Card */}
                            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 space-y-2.5">
                                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold">
                                    <Pill size={15} className="text-red-600 dark:text-red-400 shrink-0" />
                                    <span>ยาที่ตรวจพบในระบบ:</span>
                                    <span className="rounded bg-red-600 text-white px-2 py-0.5 text-[11px] font-extrabold">
                                        {selectedAlert.detectedDrug}
                                    </span>
                                </div>

                                <div className="text-[11.5px] text-foreground/90 space-y-1 pl-1">
                                    <p>
                                        <strong>ตำแหน่งที่ตรวจพบ:</strong>{" "}
                                        <span className="text-primary font-semibold">
                                            {selectedAlert.detectedIn}
                                        </span>
                                    </p>
                                    {selectedAlert.snippet && (
                                        <div className="rounded-lg bg-card border border-red-500/30 p-2 text-foreground font-mono text-[11px] italic">
                                            "{selectedAlert.snippet}"
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Patient's Known Allergy Profile */}
                            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-2">
                                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
                                    <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400 shrink-0" />
                                    <span>ประวัติแพ้ยาเดิมของผู้ป่วย:</span>
                                </div>
                                <div className="text-[11.5px] text-foreground/90 space-y-1 pl-1">
                                    <p>
                                        <strong>ชื่อยา/กลุ่มที่แพ้:</strong>{" "}
                                        <span className="text-red-600 dark:text-red-400 font-bold">
                                            {selectedPatient?.allergies || selectedAlert.patientAllergy}
                                        </span>
                                    </p>
                                    <p>
                                        <strong>กลุ่มยา (Drug Class):</strong>{" "}
                                        <span className="font-semibold text-slate-800">
                                            {selectedAlert.groupName} ({selectedAlert.thaiGroupName})
                                        </span>
                                    </p>
                                    <p>
                                        <strong>อาการแพ้ที่เคยเกิด:</strong>{" "}
                                        <span className="text-rose-700 font-medium">
                                            {selectedAlert.reaction}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {/* Clinical Recommendation */}
                            <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 space-y-1.5">
                                <div className="flex items-center gap-2 text-blue-900 font-bold">
                                    <Sparkles size={14} className="text-blue-600" />
                                    <span>คำแนะนำทางคลินิก (Clinical Recommendation):</span>
                                </div>
                                <p className="text-[11.5px] text-blue-950 leading-relaxed">
                                    {selectedAlert.recommendation}
                                </p>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="border-t border-slate-200 bg-slate-50 px-5 py-3 flex items-center justify-between sm:justify-between gap-2">
                        {onRemoveDrugFromPlan && selectedAlert && (
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                    onRemoveDrugFromPlan(selectedAlert);
                                    setIsDetailModalOpen(false);
                                }}
                                className="cursor-pointer bg-red-600 hover:bg-red-700 text-xs font-semibold"
                            >
                                ลบยานี้ออกจากแผนการรักษา
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsDetailModalOpen(false)}
                            className="cursor-pointer text-xs ml-auto"
                        >
                            ปิดหน้าต่าง
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
