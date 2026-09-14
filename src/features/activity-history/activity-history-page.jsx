import React, { useState, useMemo } from "react";
import {
  Search,
  History,
  Calendar,
  Filter,
  Download,
  FileText,
  Clock,
  User,
  Shield,
  Bot,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  FileEdit,
  ArrowRight,
  ListFilter,
  Table as TableIcon,
  GitCommit,
  X,
  Eye,
  SlidersHorizontal,
  ChevronDown,
  BookText,
  FileBarChart,
  Mic,
  Server,
  Activity,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tab, TabsList } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast-notification";
import { DatePicker } from "@/components/ui/date-picker";
import {
  activityLogsData,
  ACTIVITY_CATEGORIES,
  ACTIVITY_STATUSES,
} from "./data/activity-history-data";
import dayjs from "@/lib/dayjs";
import { Select } from "@/components/ui/select";

export function ActivityHistoryPage() {
  const [logs, setLogs] = useState(() => activityLogsData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState("today"); // 'all' | 'today' | '7days' | 'custom'
  const [startDate, setStartDate] = useState(() => dayjs().format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(() => dayjs().format("YYYY-MM-DD"));
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'timeline'
  const [selectedLog, setSelectedLog] = useState(null);

  // Helper to normalize any date input (Dayjs object or string) to "YYYY-MM-DD" string
  const toDateString = (val) => {
    if (!val) return "";
    if (typeof val === "string") return val;
    if (dayjs.isDayjs(val)) return val.format("YYYY-MM-DD");
    if (typeof val?.format === "function") return val.format("YYYY-MM-DD");
    const d = dayjs(val);
    return d.isValid() ? d.format("YYYY-MM-DD") : "";
  };

  // Helper to format date into readable Thai Buddhist text (e.g. "14 ก.ย. 2569")
  const formatThaiDate = (val) => {
    const dateStr = toDateString(val);
    if (!dateStr) return "";
    const d = dayjs(dateStr);
    return d.isValid() ? d.format("D MMM BBBB") : dateStr;
  };

  const handleSelectDatePreset = (preset) => {
    setSelectedDateRange(preset);
    const todayStr = dayjs().format("YYYY-MM-DD");
    if (preset === "all") {
      setStartDate("");
      setEndDate("");
    } else if (preset === "today") {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === "7days") {
      setStartDate(dayjs().subtract(7, "day").format("YYYY-MM-DD"));
      setEndDate(todayStr);
    }
  };

  const handleClearDate = () => {
    setSelectedDateRange("all");
    setStartDate("");
    setEndDate("");
  };

  // Status options for Select component
  const statusOptions = useMemo(
    () => [
      { value: "all", label: "สถานะทั้งหมด" },
      ...ACTIVITY_STATUSES.map((s) => ({ value: s.id, label: s.label })),
    ],
    []
  );

  // Statistics calculation
  const stats = useMemo(() => {
    const total = logs.length;
    const assessmentCount = logs.filter((l) => l.category === "assessment").length;
    const drgCount = logs.filter((l) => l.category === "drg").length;
    const speechCount = logs.filter((l) => l.category === "speech").length;
    const systemCount = logs.filter((l) => l.category === "system").length;
    return { total, assessmentCount, drgCount, speechCount, systemCount };
  }, [logs]);

  // Filtering logic
  const filteredLogs = useMemo(() => {
    const startStr = toDateString(startDate);
    const endStr = toDateString(endDate);

    return logs.filter((item) => {
      // Category filter
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (selectedStatus !== "all" && item.status !== selectedStatus) {
        return false;
      }

      // Date range filtering
      if (startStr && item.date < startStr) {
        return false;
      }
      if (endStr && item.date > endStr) {
        return false;
      }

      // Search term
      if (searchTerm.trim() !== "") {
        const query = searchTerm.toLowerCase();
        const matchesUser = item.user.toLowerCase().includes(query);
        const matchesRole = item.role.toLowerCase().includes(query);
        const matchesAction = item.action.toLowerCase().includes(query);
        const matchesTarget = item.target.toLowerCase().includes(query);
        const matchesDetails = item.details.toLowerCase().includes(query);
        const matchesDept = item.department.toLowerCase().includes(query);
        return matchesUser || matchesRole || matchesAction || matchesTarget || matchesDetails || matchesDept;
      }

      return true;
    });
  }, [logs, selectedCategory, selectedStatus, startDate, endDate, searchTerm]);

  // Grouped logs by date for Timeline view
  const groupedTimelineLogs = useMemo(() => {
    const groups = {};
    const todayStr = dayjs().format("YYYY-MM-DD");
    const yesterdayStr = dayjs().subtract(1, "day").format("YYYY-MM-DD");

    filteredLogs.forEach((log) => {
      const d = dayjs(log.date);
      const thaiFormatted = d.isValid() ? d.format("D MMM BBBB") : log.date;
      const groupKey =
        log.date === todayStr
          ? `วันนี้ (${thaiFormatted})`
          : log.date === yesterdayStr
            ? `เมื่อวานนี้ (${thaiFormatted})`
            : thaiFormatted;

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(log);
    });
    return groups;
  }, [filteredLogs]);

  // Helper for Category icons
  const getCategoryIcon = (category) => {
    switch (category) {
      case "assessment":
        return <BookText className="size-3.5 text-purple-600 dark:text-purple-400" />;
      case "drg":
        return <FileBarChart className="size-3.5 text-blue-600 dark:text-blue-400" />;
      case "speech":
        return <Mic className="size-3.5 text-emerald-600 dark:text-emerald-400" />;
      case "system":
        return <Server className="size-3.5 text-amber-600 dark:text-amber-400" />;
      default:
        return <Activity className="size-3.5 text-slate-500" />;
    }
  };

  // Helper for Category badges
  const getCategoryBadge = (category, label) => {
    const map = {
      assessment: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800/40",
      drg: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40",
      speech: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40",
      system: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40",
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${map[category] || "bg-muted text-foreground"}`}>
        {getCategoryIcon(category)}
        <span>{label}</span>
      </span>
    );
  };

  // Helper for Status badges
  const getStatusBadge = (status, label) => {
    const statusObj = ACTIVITY_STATUSES.find((s) => s.id === status);
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${statusObj?.badgeClass || "bg-muted"}`}>
        {status === "success" && <CheckCircle2 className="size-3 mr-1 text-emerald-500" />}
        {status === "modified" && <FileEdit className="size-3 mr-1 text-blue-500" />}
        {status === "warning" && <AlertTriangle className="size-3 mr-1 text-amber-500" />}
        {status === "error" && <X className="size-3 mr-1 text-rose-500" />}
        <span>{label}</span>
      </span>
    );
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = ["ID,วันเวลา,ผู้ใช้งาน,ตำแหน่ง,แผนก,หมวดหมู่,กิจกรรม,เป้าหมาย,สถานะ,IP Address"];
    const rows = filteredLogs.map((log) =>
      `"${log.id}","${log.timestamp}","${log.user}","${log.role}","${log.department}","${log.categoryLabel}","${log.action}","${log.target}","${log.statusLabel}","${log.ipAddress}"`
    );
    const csvContent = "\uFEFF" + [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `SMART_DRG_Activity_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("ส่งออกข้อมูลประวัติการใช้งานเป็นไฟล์ CSV เรียบร้อยแล้ว");
  };

  return (
    <div className="w-full space-y-4 p-2 sm:p-4 bg-background">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <History size={20} />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-foreground">
                ประวัติการใช้งานระบบ (System Activity & Audit Log)
              </h1>
              <p className="text-xs text-muted-foreground">
                ติดตามและตรวจสอบประวัติการทำรายการย้อนหลังของทุกโมดูลในระบบ SMART-DRG
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border/70 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${viewMode === "table"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <TableIcon size={14} />
              <span>ตาราง</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("timeline")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${viewMode === "timeline"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <GitCommit size={14} />
              <span>ไทม์ไลน์</span>
            </button>
          </div>

          {/* Export CSV Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleExportCSV}
            className="rounded-xl border-border hover:bg-muted text-xs sm:text-sm font-medium gap-1.5 cursor-pointer shadow-2xs h-9 px-3.5"
          >
            <Download size={14} />
            <span className="hidden sm:inline">ส่งออก CSV</span>
          </Button>
        </div>
      </div>

      {/* Summary Stat Cards (Compact & Sleek) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-border bg-card shadow-2xs">
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-muted-foreground block truncate">
              กิจกรรมทั้งหมด
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-bold text-foreground">
                {stats.total}
              </span>
              <span className="text-[10.5px] text-muted-foreground truncate">
                รายการ
              </span>
            </div>
          </div>
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
            <Activity size={16} />
          </div>
        </div>

        <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-border bg-card shadow-2xs">
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-muted-foreground block truncate">
              การจัดการแบบประเมิน
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-bold text-foreground">
                {stats.assessmentCount}
              </span>
              <span className="text-[10.5px] text-purple-600 dark:text-purple-400 truncate">
                รายการ
              </span>
            </div>
          </div>
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 shrink-0">
            <BookText size={16} />
          </div>
        </div>

        <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-border bg-card shadow-2xs">
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-muted-foreground block truncate">
              ตรวจสอบเคส DRG
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-bold text-foreground">
                {stats.drgCount}
              </span>
              <span className="text-[10.5px] text-blue-600 dark:text-blue-400 truncate">
                เคส
              </span>
            </div>
          </div>
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
            <FileBarChart size={16} />
          </div>
        </div>

        <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-border bg-card shadow-2xs">
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-muted-foreground block truncate">
              การถอดเสียง AI
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-bold text-foreground">
                {stats.speechCount}
              </span>
              <span className="text-[10.5px] text-emerald-600 dark:text-emerald-400 truncate">
                ไฟล์
              </span>
            </div>
          </div>
          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Mic size={16} />
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-3 sm:p-4 rounded-2xl border border-border shadow-2xs space-y-3 bg-card relative z-30">
        {/* Search row & Date Filter */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full lg:max-w-xs xl:max-w-sm">
            <Input
              type="text"
              placeholder="ค้นหาชื่อผู้ใช้, กิจกรรม, เคส/แบบประเมิน, แผนก..."
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

          {/* Date Picker & Quick Presets & Status Filter */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Date Presets */}
            {/* <div className="flex items-center bg-muted/40 p-1 rounded-xl border border-border/70 text-xs shrink-0">
              {[
                { id: "all", label: "ทุกวัน" },
                { id: "today", label: "วันนี้" },
                { id: "7days", label: "7 วันล่าสุด" },
              ].map((range) => (
                <button
                  key={range.id}
                  type="button"
                  onClick={() => handleSelectDatePreset(range.id)}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${selectedDateRange === range.id
                      ? "bg-card text-foreground font-semibold shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {range.label}
                </button>
              ))}
            </div> */}

            {/* Start Date */}
            <div className="w-32 sm:w-36 shrink-0">
              <DatePicker
                value={toDateString(startDate)}
                onChange={(val) => {
                  setStartDate(val || "");
                  setSelectedDateRange("custom");
                }}
                placeholder="วันที่เริ่มต้น..."
                className="h-8.5 text-xs rounded-xl border-border bg-background shadow-2xs"
              />
            </div>

            <span className="text-xs text-muted-foreground font-medium shrink-0">-</span>

            {/* End Date */}
            <div className="w-32 sm:w-36 shrink-0">
              <DatePicker
                value={toDateString(endDate)}
                onChange={(val) => {
                  setEndDate(val || "");
                  setSelectedDateRange("custom");
                }}
                placeholder="วันที่สิ้นสุด..."
                align="right"
                className="h-8.5 text-xs rounded-xl border-border bg-background shadow-2xs"
              />
            </div>

            {/* Status Select */}
            <div className="w-32 sm:w-36 shrink-0">
              <Select
                value={selectedStatus}
                onChange={(val) => setSelectedStatus(val || "all")}
                options={statusOptions}
                triggerClassName="h-8.5 rounded-xl border-border bg-background text-xs font-medium shadow-2xs"
                placeholder="สถานะทั้งหมด"
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
            {ACTIVITY_CATEGORIES.map((cat) => (
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

        {/* Active Filter Summary if filters are applied */}
        {(startDate || endDate || selectedCategory !== "all" || selectedStatus !== "all" || searchTerm) && (
          <div className="flex items-center gap-2 pt-2 border-t border-border/40 text-xs text-muted-foreground flex-wrap">
            <span className="font-semibold text-foreground text-[11.5px]">ตัวกรองที่เลือก:</span>
            {(startDate || endDate) && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium text-[11px]">
                <Calendar size={11} />
                <span>
                  {toDateString(startDate) && toDateString(endDate) && toDateString(startDate) === toDateString(endDate)
                    ? `วันที่ ${formatThaiDate(startDate)}`
                    : `${startDate ? `ตั้งแต่ ${formatThaiDate(startDate)}` : ""} ${endDate ? `ถึง ${formatThaiDate(endDate)}` : ""}`}
                </span>
                <button
                  type="button"
                  onClick={handleClearDate}
                  title="ล้างตัวกรองวันที่"
                  className="hover:text-rose-500 cursor-pointer ml-0.5"
                >
                  <X size={11} />
                </button>
              </span>
            )}
            {selectedCategory !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-foreground font-medium text-[11px]">
                <span>{ACTIVITY_CATEGORIES.find((c) => c.id === selectedCategory)?.label}</span>
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className="hover:text-rose-500 cursor-pointer ml-0.5"
                >
                  <X size={11} />
                </button>
              </span>
            )}
            {selectedStatus !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-foreground font-medium text-[11px]">
                <span>{ACTIVITY_STATUSES.find((s) => s.id === selectedStatus)?.label}</span>
                <button
                  type="button"
                  onClick={() => setSelectedStatus("all")}
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
                setSelectedStatus("all");
                handleClearDate();
              }}
              className="text-primary hover:underline text-[11px] font-semibold cursor-pointer ml-auto"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        )}
      </div>

      {/* Main Content: Table or Timeline View */}
      {filteredLogs.length > 0 ? (
        viewMode === "table" ? (
          /* ================================================================= */
          /* Table View                                                        */
          /* ================================================================= */
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/30 border-b border-border text-muted-foreground font-semibold">
                    <th className="py-3 px-4 w-[160px]">วันเวลา</th>
                    <th className="py-3 px-4 w-[210px]">ผู้ใช้งาน & แผนก</th>
                    <th className="py-3 px-4 w-[130px]">หมวดหมู่</th>
                    <th className="py-3 px-4">กิจกรรม & เป้าหมาย</th>
                    <th className="py-3 px-4 w-[120px] text-center">สถานะ</th>
                    <th className="py-3 px-4 w-[90px] text-center">รายละเอียด</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-muted/20 transition-colors group cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                    >
                      {/* Timestamp */}
                      <td className="py-3 px-4 align-top">
                        <div className="font-semibold text-foreground">{log.timestamp.split(" ")[0]} {log.timestamp.split(" ")[1]}</div>
                        <div className="text-[11px] text-muted-foreground">{log.time} น.</div>
                      </td>

                      {/* User & Role */}
                      <td className="py-3 px-4 align-top">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-[11px] flex items-center justify-center shrink-0">
                            {log.avatar}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">{log.user}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{log.role}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 align-top">
                        {getCategoryBadge(log.category, log.categoryLabel)}
                      </td>

                      {/* Action & Target */}
                      <td className="py-3 px-4 align-top">
                        <p className="font-bold text-foreground">{log.action}</p>
                        <p className="text-[11.5px] font-medium text-primary mt-0.5">{log.target}</p>
                        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{log.details}</p>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 align-top text-center">
                        {getStatusBadge(log.status, log.statusLabel)}
                      </td>

                      {/* View Button */}
                      <td className="py-3 px-4 align-top text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setSelectedLog(log)}
                          title="ดูรายละเอียดเชิงลึก"
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer with count */}
            <div className="px-4 py-2.5 bg-muted/20 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span>แสดงทั้งหมด {filteredLogs.length} รายการ</span>
              <span>บันทึกความปลอดภัยตามมาตรฐาน PDPA & ISO 27001</span>
            </div>
          </div>
        ) : (
          /* ================================================================= */
          /* Timeline View                                                     */
          /* ================================================================= */
          <div className="space-y-6">
            {Object.entries(groupedTimelineLogs).map(([dateLabel, logsGroup]) => (
              <div key={dateLabel} className="space-y-3">
                {/* Date header badge */}
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-muted text-foreground">
                    <Calendar size={13} />
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm text-foreground">
                    {dateLabel}
                  </h3>
                  <span className="text-xs text-muted-foreground">({logsGroup.length} รายการ)</span>
                </div>

                {/* Timeline vertical items */}
                <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/80">
                  {logsGroup.map((log) => (
                    <div
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="relative flex items-start gap-3.5 group cursor-pointer"
                    >
                      {/* Timeline dot */}
                      <div className="absolute -left-6 top-2.5 grid size-5 place-items-center rounded-full border-2 border-background bg-card shadow-xs">
                        {getCategoryIcon(log.category)}
                      </div>

                      {/* Card Content */}
                      <Card className="flex-1 p-3.5 sm:p-4 rounded-xl border border-border bg-card hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-2xs space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-border/50 pb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-foreground">{log.action}</span>
                            {getCategoryBadge(log.category, log.categoryLabel)}
                            {getStatusBadge(log.status, log.statusLabel)}
                          </div>
                          <span className="text-[11.5px] text-muted-foreground font-medium flex items-center gap-1">
                            <Clock size={12} />
                            <span>{log.time} น.</span>
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <div>
                            <p className="font-semibold text-primary">{log.target}</p>
                            <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">{log.details}</p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto pt-1 sm:pt-0">
                            <span className="text-[11px] text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-md">
                              โดย: <strong className="text-foreground">{log.user}</strong>
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLog(log);
                              }}
                              className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                            >
                              <span>ดูรายละเอียด</span>
                              <ArrowRight size={12} />
                            </button>
                          </div>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Empty State */
        <Card className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
          <div className="p-3 rounded-full bg-muted/60 text-muted-foreground mb-2">
            <History size={24} />
          </div>
          <p className="text-sm font-bold text-foreground">ไม่พบประวัติการใช้งานที่ตรงกับเงื่อนไข</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            ลองปรับเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่และช่วงเวลาอื่นๆ เพื่อดูประวัติรายการย้อนหลัง
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("all");
              setSelectedStatus("all");
              handleClearDate();
            }}
            className="mt-4 rounded-xl text-xs cursor-pointer"
          >
            ล้างตัวกรองทั้งหมด
          </Button>
        </Card>
      )}

      {/* =================================================================== */}
      {/* Detail Modal: แสดงข้อมูลเชิงลึกของรายการกิจกรรม                        */}
      {/* =================================================================== */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-lg rounded-2xl p-5 sm:p-6 bg-card">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              {selectedLog && getCategoryBadge(selectedLog.category, selectedLog.categoryLabel)}
              {selectedLog && getStatusBadge(selectedLog.status, selectedLog.statusLabel)}
            </div>
            <DialogTitle className="text-base sm:text-lg font-bold text-foreground leading-snug">
              {selectedLog?.action}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              รหัสบันทึก: #{selectedLog?.id} • บันทึกเมื่อ {selectedLog?.timestamp}
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 py-2 text-xs">
              {/* User and Location Details */}
              <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-muted/20 border border-border/70">
                <div>
                  <span className="text-[11px] text-muted-foreground font-medium block">ผู้ดำเนินการ:</span>
                  <span className="font-bold text-foreground">{selectedLog.user}</span>
                  <span className="text-[11px] text-muted-foreground block">{selectedLog.role}</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground font-medium block">แผนก / หน่วยงาน:</span>
                  <span className="font-semibold text-foreground">{selectedLog.department}</span>
                </div>
                <div className="border-t border-border/40 pt-2 col-span-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Laptop size={12} />
                    <span>{selectedLog.device}</span>
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <span>IP: {selectedLog.ipAddress}</span>
                  </span>
                </div>
              </div>

              {/* Action and Target Information */}
              <div className="space-y-1.5 p-3 rounded-xl border border-border bg-card">
                <span className="text-[11px] text-muted-foreground font-medium">เป้าหมายรายการ:</span>
                <p className="font-bold text-primary text-xs sm:text-sm">{selectedLog.target}</p>
                <span className="text-[11px] text-muted-foreground font-medium block pt-1.5">คำอธิบายรายละเอียด:</span>
                <p className="text-muted-foreground leading-relaxed text-xs">{selectedLog.details}</p>
              </div>

              {/* Before & After Changes if available */}
              {selectedLog.changes && selectedLog.changes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                    <FileEdit size={13} className="text-primary" />
                    <span>ข้อมูลเปรียบเทียบการเปลี่ยนแปลง (Audit Diff)</span>
                  </h4>
                  <div className="border border-border rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-muted/40 border-b border-border text-[11px] font-semibold text-muted-foreground">
                          <th className="py-2 px-3">ฟิลด์</th>
                          <th className="py-2 px-3">ค่าเดิม (Before)</th>
                          <th className="py-2 px-3">ค่าใหม่ (After)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {selectedLog.changes.map((ch, cIdx) => (
                          <tr key={cIdx} className="hover:bg-muted/10">
                            <td className="py-2 px-3 font-semibold text-foreground">{ch.field}</td>
                            <td className="py-2 px-3 text-rose-600 dark:text-rose-400 bg-rose-50/40 dark:bg-rose-950/20">{ch.before}</td>
                            <td className="py-2 px-3 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50/40 dark:bg-emerald-950/20">{ch.after}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              onClick={() => setSelectedLog(null)}
              className="rounded-xl text-xs sm:text-sm cursor-pointer w-full"
            >
              ปิดหน้าต่าง
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
