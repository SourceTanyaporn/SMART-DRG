import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Plus,
  FileText,
  MoreVertical,
  CalendarDays,
  Clock3,
  Grid2X2,
  List,
  Stethoscope,
  Building2,
  X,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FilterX,
  SearchIcon,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { mockPatients } from "@/features/drg-worklist/data";
import { DatePicker } from "@/components/ui/date-picker";
import dayjs from "@/lib/dayjs";
import { Button } from "@/components/ui/button";

const generateNotebooksFromPatients = () => {
  const times = ["08:45 น.", "09:30 น.", "10:15 น.", "11:00 น.", "13:30 น.", "14:00 น.", "15:15 น.", "16:00 น."];
  return mockPatients.map((p, idx) => {
    const formattedDate = p.date ? dayjs(p.date).format("D MMM BBBB") : "24 ก.ค. 2026";
    const time = times[idx % times.length];

    return {
      id: p.id || idx + 1,
      hn: p.hn,
      an: p.an,
      patient: p.fullName || p.patient,
      fullName: p.fullName || p.patient,
      title: `${p.hn} - ${p.fullName || p.patient}`,
      chiefComplaint: p.chiefComplaint || "ไม่มีข้อมูลอาการสำคัญ",
      description: p.chiefComplaint || p.presentIllness || "ไม่มีข้อมูลอาการสำคัญ",
      presentIllness: p.presentIllness,
      doctor: p.doctor || "นพ. กิตติพงศ์ วงศ์สมุทร",
      department: p.department || "OPD อายุรกรรม",
      date: formattedDate,
      rawDate: p.date,
      time: time,
      source: "1 รายการ",
      users: "2 คน",
      rawPatient: p,
    };
  });
};

function NotebookCard({ item, isCreate = false, onClick }) {
  if (isCreate) {
    return (
      <Link to="/speech-to-text" search={{ mode: "new" }} className="w-full">
        <button
          type="button"
          onClick={onClick}
          className="
          group flex min-h-[300px] w-full cursor-pointer flex-col items-center justify-center
          rounded-xl border border-dashed border-primary/40
          bg-primary/5 px-5 transition-all
          hover:border-primary hover:bg-primary/10
        "
        >
          <div
            className="
            mb-4 flex h-12 w-12 items-center justify-center
            rounded-full bg-primary text-primary-foreground
            transition-transform group-hover:scale-105 shadow-sm
          "
          >
            <Plus size={27} strokeWidth={1.8} />
          </div>

          <span className="text-sm font-semibold text-primary">
            สร้าง Notebook ใหม่
          </span>
        </button>
      </Link>
    );
  }

  return (
    <Link
      to="/speech-to-text"
      search={{ hn: item.hn }}
      className="
        group flex min-h-[300px] flex-col rounded-xl border border-border
        bg-card p-4 shadow-2xs transition-all
        hover:border-primary/50 hover:shadow-md
      "
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
          <FileText
            size={20}
            strokeWidth={1.8}
            className="text-primary"
          />
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="
            flex h-8 w-8 items-center justify-center rounded-full
            bg-muted text-muted-foreground
            transition-colors hover:bg-primary/15 hover:text-primary cursor-pointer
          "
        >
          <MoreVertical size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="mt-3.5 flex-1">
        <h3
          className="border-b border-border pb-2 text-[13.5px] font-bold text-primary truncate"
          title={`HN: ${item.hn} - ${item.patient}`}
        >
          <span>HN: {item.hn}</span> - <span className="text-foreground">{item.patient}</span>
        </h3>

        <div className="mt-2.5">
          <div className="text-[11px] font-bold text-foreground">อาการสำคัญ:</div>
          <p className="mt-1 line-clamp-3 text-[12px] leading-relaxed text-foreground/80">
            {item.chiefComplaint || item.description}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-[11px] text-muted-foreground">
        <div className="mt-2 space-y-1 text-[11px]">
          <div className="flex items-center gap-1.5 truncate">
            <Stethoscope size={13} className="text-primary shrink-0" />
            <span className="truncate text-foreground font-medium">{item.doctor}</span>
          </div>

          <div className="flex items-center gap-1.5 truncate text-muted-foreground">
            <Building2 size={13} className="shrink-0" />
            <span className="truncate">{item.department}</span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-2 text-[10.5px]">
          <div className="flex items-center gap-1.5">
            <CalendarDays size={13} className="text-muted-foreground" />
            <span>{item.date}</span>
          </div>

          <div>
            แหล่งข้อมูล{" "}
            <span className="font-semibold text-primary">
              {item.source}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10.5px]">
          <div className="flex items-center gap-1.5">
            <Clock3 size={13} className="text-muted-foreground" />
            <span>{item.time}</span>
          </div>

          <div>
            จำนวนผู้สนทนา{" "}
            <span className="font-semibold text-primary">
              {item.users}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function getPageNumbers(currentPage, totalPages) {
  const pages = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    }
  }
  return pages;
}

export function DashboardConversation() {
  const navigate = useNavigate();

  const todayStr = useMemo(() => dayjs().format("YYYY-MM-DD"), []);

  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const notebookList = useMemo(() => generateNotebooksFromPatients(), []);

  // Filtered dataset
  const filteredData = useMemo(() => {
    let list = notebookList;

    // 1. Date filter: Start Date
    if (startDate) {
      list = list.filter((item) => item.rawDate && item.rawDate >= startDate);
    }

    // 2. Date filter: End Date
    if (endDate) {
      list = list.filter((item) => item.rawDate && item.rawDate <= endDate);
    }

    // 3. Search query filter
    const query = (appliedSearch || search).trim().toLowerCase();
    if (query) {
      const cleanQ = query.replace(/[-\s]/g, "");

      list = list.filter((item) => {
        const cleanHn = (item.hn || "").toLowerCase().replace(/[-\s]/g, "");
        const cleanAn = (item.an || "").toLowerCase().replace(/[-\s]/g, "");
        const cleanCitizen = (item.rawPatient?.citizenId || "").replace(/[-\s]/g, "");

        return (
          cleanHn.includes(cleanQ) ||
          cleanAn.includes(cleanQ) ||
          cleanCitizen.includes(cleanQ) ||
          (item.patient && item.patient.toLowerCase().includes(query)) ||
          (item.chiefComplaint && item.chiefComplaint.toLowerCase().includes(query)) ||
          (item.doctor && item.doctor.toLowerCase().includes(query)) ||
          (item.department && item.department.toLowerCase().includes(query))
        );
      });
    }

    return list;
  }, [startDate, endDate, search, appliedSearch, notebookList]);

  // Reset pagination to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate, appliedSearch, search, pageSize]);

  // Pagination Calculations
  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedData = useMemo(() => {
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, startIndex, endIndex]);

  const hasActiveFilters = Boolean(startDate !== todayStr || endDate !== todayStr || search || appliedSearch);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setAppliedSearch(search);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setStartDate(todayStr);
    setEndDate(todayStr);
    setSearch("");
    setAppliedSearch("");
    setCurrentPage(1);
  };

  return (
    <section className="min-h-full bg-card rounded-xl border border-border">
      <div className="p-5">
        {/* Filter Toolbar */}
        <div className="mb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 rounded-xl bg-muted/40 border border-border p-3">
          {/* Search & Filter Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0"
          >
            {/* Start Date */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-foreground font-medium whitespace-nowrap">วันที่เริ่มต้น:</span>
              <div className="w-36 sm:w-40">
                <DatePicker
                  value={startDate}
                  onChange={(val) => {
                    setStartDate(val);
                    setCurrentPage(1);
                  }}
                  placeholder="เลือกวันที่เริ่มต้น"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* End Date */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-foreground font-medium whitespace-nowrap">วันที่สิ้นสุด:</span>
              <div className="w-36 sm:w-40">
                <DatePicker
                  value={endDate}
                  onChange={(val) => {
                    setEndDate(val);
                    setCurrentPage(1);
                  }}
                  placeholder="เลือกวันที่สิ้นสุด"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] max-w-[320px]">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหา HN, AN, ชื่อผู้ป่วย หรืออื่นๆ..."
                className="
                  h-9 w-full rounded-md border border-input
                  bg-card px-3 pr-8 text-xs text-foreground
                  outline-none transition
                  focus:border-primary
                  focus:ring-1 focus:ring-primary/20
                "
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setAppliedSearch("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  title="ล้างข้อความค้นหา"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <Button
              type="submit"
              size="sm"
              className="h-9 px-3.5 text-xs font-semibold shadow-xs"
            >
              <Search size={15} />
              <span>ค้นหา</span>
            </Button>

            {/* Reset / Clear Filter Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="
                  flex h-9 items-center gap-1.5 rounded-md
                  border border-destructive/30 bg-destructive/10 px-3
                  text-xs font-medium text-destructive hover:bg-destructive/20 transition cursor-pointer
                "
                title="ล้างตัวกรองทั้งหมด"
              >
                <RotateCcw size={13} />
                <span>ล้างตัวกรอง</span>
              </button>
            )}

            {/* Result Counter Badge */}
            <div className="hidden sm:flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs text-primary font-medium">
              <span>พบ</span>
              <span className="font-bold text-primary">{totalItems}</span>
              <span>รายการ</span>
            </div>
          </form>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
            {/* Mobile result badge */}
            <div className="sm:hidden text-xs text-muted-foreground font-medium mr-1">
              พบ <span className="font-bold text-primary">{totalItems}</span> รายการ
            </div>

            <div className="flex h-9 overflow-hidden rounded-md border border-input bg-card p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                title="มุมมองแบบการ์ด (Grid)"
                className={`
                  flex w-8 items-center justify-center rounded-sm transition
                  ${viewMode === "grid"
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"}
                `}
              >
                <Grid2X2 size={16} />
              </button>

              <button
                type="button"
                onClick={() => setViewMode("list")}
                title="มุมมองแบบรายการ (List)"
                className={`
                  flex w-8 items-center justify-center rounded-sm transition
                  ${viewMode === "list"
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"}
                `}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {totalItems === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 px-4 text-center my-4 bg-muted/20">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
              <FilterX size={26} />
            </div>
            <h4 className="text-sm font-bold text-foreground">ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              กรุณาลองตรวจสอบคำค้นหา หรือกดปุ่ม &quot;ล้างตัวกรอง&quot; เพื่อดูข้อมูลทั้งหมด
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-4 flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition cursor-pointer shadow-xs"
              >
                <RotateCcw size={13} />
                <span>ล้างตัวกรองทั้งหมด</span>
              </button>
            )}
          </div>
        )}

        {/* Content: Grid or List */}
        {totalItems > 0 && (
          <>
            {viewMode === "grid" ? (
              <div
                className="
                  grid grid-cols-1 gap-6
                  sm:grid-cols-2
                  lg:grid-cols-3
                  xl:grid-cols-4
                "
              >
                {safeCurrentPage === 1 && (
                  <NotebookCard
                    isCreate
                    onClick={() => navigate({ to: "/speech-to-text", search: { mode: "new" } })}
                  />
                )}

                {paginatedData.map((item) => (
                  <NotebookCard
                    key={item.id}
                    item={item}
                    onClick={() => navigate({ to: "/speech-to-text", search: { hn: item.hn } })}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2.5">
                {safeCurrentPage === 1 && (
                  <Link
                    to="/speech-to-text"
                    search={{ mode: "new" }}
                    className="
                      group flex h-[72px] w-full cursor-pointer
                      items-center justify-center
                      rounded-lg border border-dashed border-primary/40
                      bg-primary/5
                      transition-all
                      hover:border-primary
                      hover:bg-primary/10
                    "
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="
                          flex h-9 w-9 items-center justify-center
                          rounded-full bg-primary text-primary-foreground
                          transition-transform
                          group-hover:scale-105 shadow-sm
                        "
                      >
                        <Plus size={21} strokeWidth={1.8} />
                      </div>

                      <span className="text-xs font-semibold text-primary">
                        สร้าง Notebook ใหม่
                      </span>
                    </div>
                  </Link>
                )}

                {paginatedData.map((item) => (
                  <Link
                    key={item.id}
                    to="/speech-to-text"
                    search={{ hn: item.hn }}
                    className="
                      flex min-h-[68px] w-full cursor-pointer
                      items-center gap-4
                      rounded-lg border border-border
                      bg-card px-3 py-2
                      transition-all
                      hover:border-primary/50
                      hover:shadow-sm
                    "
                  >
                    {/* Icon */}
                    <div
                      className="
                        flex h-9 w-9 shrink-0
                        items-center justify-center
                        rounded-lg bg-primary/10
                      "
                    >
                      <FileText
                        size={20}
                        strokeWidth={1.8}
                        className="text-primary"
                      />
                    </div>

                    {/* HN & Name */}
                    <div className="w-[200px] shrink-0">
                      <h3 className="text-xs font-bold text-primary truncate">
                        HN: {item.hn}
                      </h3>
                      <p className="text-[11px] font-medium text-foreground truncate">
                        {item.patient}
                      </p>
                    </div>

                    {/* Chief Complaint / Description */}
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-[11px] leading-4 text-muted-foreground">
                        <span className="font-semibold text-foreground mr-1">อาการสำคัญ:</span>
                        {item.chiefComplaint || item.description}
                      </p>
                    </div>

                    {/* Doctor & Department */}
                    <div className="hidden sm:block w-[180px] shrink-0 space-y-1 text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1.5 truncate">
                        <Stethoscope size={12} className="text-primary shrink-0" />
                        <span className="truncate text-foreground/80">{item.doctor}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate text-[10px] text-muted-foreground">
                        <Building2 size={11} className="shrink-0" />
                        <span className="truncate">{item.department}</span>
                      </div>
                    </div>

                    {/* Date / Time */}
                    <div
                      className="
                        hidden w-[110px] shrink-0
                        text-[10px] text-muted-foreground
                        lg:block
                      "
                    >
                      <div className="flex items-center gap-1">
                        <CalendarDays size={11} />
                        <span>{item.date}</span>
                      </div>

                      <div className="mt-1 flex items-center gap-1">
                        <Clock3 size={11} />
                        <span>{item.time}</span>
                      </div>
                    </div>

                    {/* Source */}
                    <div
                      className="
                        hidden w-[90px] shrink-0
                        text-[10px] text-muted-foreground
                        md:block
                      "
                    >
                      <div>
                        แหล่งข้อมูล{" "}
                        <span className="font-medium text-primary">
                          {item.source}
                        </span>
                      </div>

                      <div className="mt-1">
                        จำนวนผู้สนทนา{" "}
                        <span className="font-medium text-primary">
                          {item.users}
                        </span>
                      </div>
                    </div>

                    {/* More */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className="
                        flex h-7 w-7 shrink-0
                        items-center justify-center
                        rounded-full
                        bg-muted
                        text-muted-foreground
                        transition-colors
                        hover:bg-primary/15
                        hover:text-primary
                      "
                    >
                      <MoreVertical size={16} />
                    </button>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
              {/* Left: Summary & Page Size selector */}
              <div className="flex flex-wrap items-center gap-3">
                <span>
                  แสดง <span className="font-semibold text-foreground">{startIndex + 1} - {endIndex}</span> จากทั้งหมด{" "}
                  <span className="font-semibold text-foreground">{totalItems}</span> รายการ
                </span>

                <div className="flex items-center gap-1.5 border-l border-border pl-3">
                  <span className="text-muted-foreground">แสดงหน้าละ:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="h-8 rounded-md border border-input bg-card px-2 py-0.5 text-xs text-foreground outline-none focus:border-primary"
                  >
                    <option value={8}>8</option>
                    <option value={12}>12</option>
                    <option value={24}>24</option>
                    <option value={48}>48</option>
                  </select>
                </div>
              </div>

              {/* Right: Page Navigation Buttons */}
              <div className="flex items-center gap-1">
                {/* First Page */}
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  disabled={safeCurrentPage === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-input bg-card text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition"
                  title="หน้าแรก"
                >
                  <ChevronsLeft size={15} />
                </button>

                {/* Previous Page */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-input bg-card text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition"
                  title="หน้าก่อนหน้า"
                >
                  <ChevronLeft size={15} />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1 px-1">
                  {getPageNumbers(safeCurrentPage, totalPages).map((p, idx) => {
                    if (p === "...") {
                      return (
                        <span key={`dots-${idx}`} className="px-1 text-muted-foreground">
                          ...
                        </span>
                      );
                    }
                    const isCurrent = p === safeCurrentPage;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setCurrentPage(p)}
                        className={`
                          flex h-8 min-w-[32px] items-center justify-center rounded-md px-2 text-xs font-medium transition
                          ${isCurrent
                            ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                            : "border border-input bg-card text-foreground hover:bg-muted"
                          }
                        `}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>

                {/* Next Page */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-input bg-card text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition"
                  title="หน้าถัดไป"
                >
                  <ChevronRight size={15} />
                </button>

                {/* Last Page */}
                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={safeCurrentPage === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-input bg-card text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition"
                  title="หน้าสุดท้าย"
                >
                  <ChevronsRight size={15} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}