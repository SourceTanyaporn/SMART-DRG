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
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { mockPatients } from "@/features/drg-worklist/data";
import { DatePicker } from "@/components/ui/date-picker";
import dayjs from "@/lib/dayjs";

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
          rounded-xl border border-dashed border-[#78aaf5]
          bg-[#edf5ff] px-5 transition-all
          hover:border-[#1677ff] hover:bg-[#e7f1ff]
        "
        >
          <div
            className="
            mb-4 flex h-12 w-12 items-center justify-center
            rounded-full bg-[#003b7a] text-white
            transition-transform group-hover:scale-105
          "
          >
            <Plus size={27} strokeWidth={1.8} />
          </div>

          <span className="text-sm font-semibold text-[#003b7a]">
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
        flex min-h-[300px] flex-col rounded-xl border border-[#e5ebf4]
        bg-white p-3 shadow-none transition-all
        hover:border-[#b8d3f7] hover:shadow-sm
      "
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#eef5ff]">
          <FileText
            size={22}
            strokeWidth={1.8}
            className="text-[#4b9cff]"
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
            bg-[#eef5ff] text-[#a8c5e9]
            transition-colors hover:bg-[#dcecff] hover:text-[#1677ff]
          "
        >
          <MoreVertical size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="mt-4 flex-1">
        <h3
          className="border-b border-[#c8dcf7] pb-1.5 text-[14px] font-bold text-[#0066cc] truncate"
          title={`HN: ${item.hn} - ${item.patient}`}
        >
          <span className="text-[#1677ff]">HN: {item.hn}</span> - {item.patient}
        </h3>

        <div className="mt-2.5">
          <div className="text-[11px] font-semibold text-slate-700">อาการสำคัญ:</div>
          <p className="mt-1 line-clamp-3 text-[12px] leading-5 text-[#64748b]">
            {item.chiefComplaint || item.description}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-[11px] text-[#a0a8b6]">
        <div className="mt-2 space-y-1 text-[11px] text-[#8a94a6]">
          <div className="flex items-center gap-1.5 truncate">
            <Stethoscope size={12} className="text-teal-600 shrink-0" />
            <span className="truncate">{item.doctor}</span>
          </div>

          <div className="flex items-center gap-1.5 truncate">
            <Building2 size={12} className="text-slate-400 shrink-0" />
            <span className="truncate">{item.department}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <CalendarDays size={13} />
            <span>{item.date}</span>
          </div>

          <div>
            แหล่งข้อมูล{" "}
            <span className="font-medium text-[#1677ff]">
              {item.source}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Clock3 size={13} />
            <span>{item.time}</span>
          </div>

          <div>
            จำนวนผู้สนทนา{" "}
            <span className="font-medium text-[#1677ff]">
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
    <section className="min-h-full bg-white rounded-xl ">
      <div className="p-5">
        {/* Filter Toolbar */}
        <div className="mb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 rounded-xl bg-white px-1 sm:px-2 py-2">
          {/* Search & Filter Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0"
          >
            {/* Start Date */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-600 font-medium whitespace-nowrap">วันที่เริ่มต้น:</span>
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
              <span className="text-xs text-slate-600 font-medium whitespace-nowrap">วันที่สิ้นสุด:</span>
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
                  h-9 w-full rounded-md border border-[#e5eaf1]
                  bg-white px-3 pr-8 text-xs text-gray-700
                  outline-none transition
                  focus:border-[#1677ff]
                  focus:ring-1 focus:ring-[#1677ff]/20
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
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="ล้างข้อความค้นหา"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="
                flex h-9 items-center gap-1.5 rounded-md
                bg-[#1677ff] px-4 text-xs font-medium text-white
                transition hover:bg-[#1565d8] cursor-pointer shadow-xs
              "
            >
              <Search size={15} />
              <span>ค้นหา</span>
            </button>

            {/* Reset / Clear Filter Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="
                  flex h-9 items-center gap-1.5 rounded-md
                  border border-rose-200 bg-rose-50/70 px-3
                  text-xs font-medium text-rose-600 hover:bg-rose-100/80 transition cursor-pointer
                "
                title="ล้างตัวกรองทั้งหมด"
              >
                <RotateCcw size={13} />
                <span>ล้างตัวกรอง</span>
              </button>
            )}

            {/* Result Counter Badge */}
            <div className="hidden sm:flex items-center gap-1 rounded-full bg-blue-50/80 border border-blue-200/60 px-3 py-1 text-xs text-blue-700 font-medium">
              <span>พบ</span>
              <span className="font-bold text-[#1677ff]">{totalItems}</span>
              <span>รายการ</span>
            </div>
          </form>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
            {/* Mobile result badge */}
            <div className="sm:hidden text-xs text-slate-500 font-medium mr-1">
              พบ <span className="font-bold text-[#1677ff]">{totalItems}</span> รายการ
            </div>

            <div className="flex h-9 overflow-hidden rounded-md bg-[#1677ff]">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                title="มุมมองแบบการ์ด (Grid)"
                className={`
                  flex w-9 items-center justify-center 
                  ${viewMode === "grid"
                    ? "bg-[#1677ff] text-white"
                    : "bg-white text-[#1677ff] border border-[#1677ff] rounded-md"}
                `}
              >
                <Grid2X2 size={17} />
              </button>

              <button
                type="button"
                onClick={() => setViewMode("list")}
                title="มุมมองแบบรายการ (List)"
                className={`
                  flex w-9 items-center justify-center 
                  ${viewMode === "list"
                    ? "bg-[#1677ff] text-white"
                    : "bg-white text-[#1677ff] border border-[#1677ff] rounded-md"}
                `}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {totalItems === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-16 px-4 text-center my-4 bg-slate-50/40">
            <div className="flex size-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
              <FilterX size={26} />
            </div>
            <h4 className="text-sm font-bold text-slate-700">ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              กรุณาลองตรวจสอบคำค้นหา หรือกดปุ่ม &quot;ล้างตัวกรอง&quot; เพื่อดูข้อมูลทั้งหมด
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-4 flex items-center gap-1.5 rounded-md bg-[#1677ff] px-4 py-2 text-xs font-medium text-white hover:bg-[#1565d8] transition cursor-pointer"
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
                  grid grid-cols-1 gap-7
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
              <div className="space-y-2">
                {safeCurrentPage === 1 && (
                  <Link
                    to="/speech-to-text"
                    search={{ mode: "new" }}
                    className="
                      group flex h-[72px] w-full cursor-pointer
                      items-center justify-center
                      rounded-lg border border-dashed border-[#78aaf5]
                      bg-[#edf5ff]
                      transition-all
                      hover:border-[#1677ff]
                      hover:bg-[#e7f1ff]
                    "
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="
                          flex h-9 w-9 items-center justify-center
                          rounded-full bg-[#003b7a] text-white
                          transition-transform
                          group-hover:scale-105
                        "
                      >
                        <Plus size={21} strokeWidth={1.8} />
                      </div>

                      <span className="text-xs font-semibold text-[#003b7a]">
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
                      rounded-lg border border-[#e5ebf4]
                      bg-white px-3 py-2
                      transition-all
                      hover:border-[#b8d3f7]
                      hover:shadow-sm
                    "
                  >
                    {/* Icon */}
                    <div
                      className="
                        flex h-9 w-9 shrink-0
                        items-center justify-center
                        rounded-lg bg-[#eef5ff]
                      "
                    >
                      <FileText
                        size={20}
                        strokeWidth={1.8}
                        className="text-[#4b9cff]"
                      />
                    </div>

                    {/* HN & Name */}
                    <div className="w-[200px] shrink-0">
                      <h3 className="text-xs font-bold text-[#0066cc] truncate">
                        HN: {item.hn}
                      </h3>
                      <p className="text-[11px] font-medium text-slate-700 truncate">
                        {item.patient}
                      </p>
                    </div>

                    {/* Chief Complaint / Description */}
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-[11px] leading-4 text-[#737b8c]">
                        <span className="font-semibold text-slate-700 mr-1">อาการสำคัญ:</span>
                        {item.chiefComplaint || item.description}
                      </p>
                    </div>

                    {/* Doctor & Department */}
                    <div className="hidden sm:block w-[180px] shrink-0 space-y-1 text-[11px] text-[#8a94a6]">
                      <div className="flex items-center gap-1.5 truncate">
                        <Stethoscope size={12} className="text-teal-600 shrink-0" />
                        <span className="truncate">{item.doctor}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate text-[10px] text-slate-500">
                        <Building2 size={11} className="shrink-0" />
                        <span className="truncate">{item.department}</span>
                      </div>
                    </div>

                    {/* Date / Time */}
                    <div
                      className="
                        hidden w-[110px] shrink-0
                        text-[10px] text-[#a0a8b6]
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
                        text-[10px] text-[#a0a8b6]
                        md:block
                      "
                    >
                      <div>
                        แหล่งข้อมูล{" "}
                        <span className="font-medium text-[#1677ff]">
                          {item.source}
                        </span>
                      </div>

                      <div className="mt-1">
                        จำนวนผู้สนทนา{" "}
                        <span className="font-medium text-[#1677ff]">
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
                        bg-[#eef5ff]
                        text-[#a8c5e9]
                        transition-colors
                        hover:bg-[#dcecff]
                        hover:text-[#1677ff]
                      "
                    >
                      <MoreVertical size={16} />
                    </button>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-4 text-xs text-slate-600">
              {/* Left: Summary & Page Size selector */}
              <div className="flex flex-wrap items-center gap-3">
                <span>
                  แสดง <span className="font-semibold text-slate-800">{startIndex + 1} - {endIndex}</span> จากทั้งหมด{" "}
                  <span className="font-semibold text-slate-800">{totalItems}</span> รายการ
                </span>

                <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                  <span className="text-slate-500">แสดงหน้าละ:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="h-8 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-700 outline-none focus:border-[#1677ff]"
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
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  title="หน้าแรก"
                >
                  <ChevronsLeft size={15} />
                </button>

                {/* Previous Page */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  title="หน้าก่อนหน้า"
                >
                  <ChevronLeft size={15} />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1 px-1">
                  {getPageNumbers(safeCurrentPage, totalPages).map((p, idx) => {
                    if (p === "...") {
                      return (
                        <span key={`dots-${idx}`} className="px-1 text-slate-400">
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
                          ${
                            isCurrent
                              ? "bg-[#1677ff] text-white shadow-xs font-semibold"
                              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
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
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  title="หน้าถัดไป"
                >
                  <ChevronRight size={15} />
                </button>

                {/* Last Page */}
                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={safeCurrentPage === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
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