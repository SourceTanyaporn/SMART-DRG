import { useState } from "react";
import {
  Search,
  Plus,
  FileText,
  MoreVertical,
  CalendarDays,
  Clock3,
  Users,
  Grid2X2,
  List,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

const notebookData = [
  {
    id: 1,
    title: "การวางแผนการรักษา",
    description:
      "ผู้ป่วยมีไข้สูงหลังได้รับ Ceftriaxone ครบ 48 ชั่วโมง ผล CBC มีแนวโน้มดีขึ้น ให้ติดตามอุณหภูมิทุก 4 ชั่วโมง และประเมินอาการอีกครั้งในช่วงเย็น",
    date: "24 ก.ค. 2026",
    time: "14:00 น.",
    source: "1 รายการ",
    users: "3 คน",
  },
  {
    id: 2,
    title: "รายงานอาการผู้ป่วย",
    description:
      "ผู้ป่วยรู้สึกตัวดี สามารถสื่อสารได้ ไม่มีไข้เพิ่มเติม รับประทานอาหารได้ประมาณ 70% ไม่มีอาการคลื่นไส้อาเจียน สัญญาณชีพอยู่ในเกณฑ์ปกติ",
    date: "24 ก.ค. 2026",
    time: "14:00 น.",
    source: "1 รายการ",
    users: "3 คน",
  },
  {
    id: 3,
    title: "ขอคำสั่งการรักษาเพิ่มเติม",
    description:
      "ผู้ป่วย Pain Score เพิ่มเป็น 7/10 หลังทำกายภาพบำบัด ขอพิจารณาปรับแผนการรักษาตามความเหมาะสม หรือสั่งยาเพิ่มเติม",
    date: "24 ก.ค. 2026",
    time: "14:00 น.",
    source: "1 รายการ",
    users: "3 คน",
  },
  {
    id: 4,
    title: "คำสั่งแพทย์",
    description:
      "ทราบ เพิ่ม Paracetamol 500 mg รับประทานเมื่อมีอาการปวด ทุก 6 ชั่วโมง และติดตาม Pain Score หลังได้รับยา 1 ชั่วโมง หากยังมากกว่า 5/10 ให้รายงานแพทย์ทันที",
    date: "24 ก.ค. 2026",
    time: "14:00 น.",
    source: "1 รายการ",
    users: "3 คน",
  },
  {
    id: 5,
    title: "ผลตรวจทางห้องปฏิบัติการ",
    description:
      "ผล CBC ล่าสุดพบ WBC ลดลงจาก 15,200 เหลือ 10,800 cell/mm³ ค่า CRP มีแนวโน้มลดลง แนะนำติดตามผลซ้ำในวันพรุ่งนี้",
    date: "24 ก.ค. 2026",
    time: "14:00 น.",
    source: "1 รายการ",
    users: "3 คน",
  },
  {
    id: 6,
    title: "เตรียมจำหน่ายผู้ป่วย",
    description:
      "หากผู้ป่วยไม่มีไข้ภายใน 24 ชั่วโมง และสามารถรับประทานอาหารได้ตามปกติ ให้เตรียมเอกสารจำหน่าย พร้อมนัดติดตามอาการที่ OPD ภายใน 7 วัน",
    date: "24 ก.ค. 2026",
    time: "14:00 น.",
    source: "1 รายการ",
    users: "3 คน",
  },
];

function NotebookCard({ item, isCreate = false, onClick }) {
  if (isCreate) {
    return (
      <Link to="/speech-to-text">
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
        <h3 className="border-b border-[#c8dcf7] pb-1.5 text-[15px] font-bold text-[#0066cc]">
          {item.title}
        </h3>

        <p className="mt-3 line-clamp-4 text-[12px] leading-5 text-[#737b8c]">
          {item.description}
        </p>
      </div>

      <div className="mt-4 space-y-2 text-[11px] text-[#a0a8b6]">
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

export function DashboardConversation() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  const filteredData = notebookData.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="min-h-full bg-white rounded-xl ">
      <div className="p-5">
        <div
          className="
          mb-3 flex items-center justify-between gap-2 rounded-xl
           bg-white px-3 py-2 
        "
        >
          <div className="relative w-[400px]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อรายการของคุณ"
              className="
              h-9 w-full rounded-md border border-[#e5eaf1]
              bg-white px-3 pr-10 text-xs text-gray-700
              outline-none transition
              focus:border-[#1677ff]
              focus:ring-1 focus:ring-[#1677ff]/20
            "
            />

            <button
              type="button"
              className="
              absolute right-0 top-0 flex h-9 w-9
              items-center justify-center rounded-r-md
              bg-[#1677ff] text-white
            "
            >
              <Search size={17} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="
            flex h-9 items-center gap-1 rounded-md
            border border-[#1677ff] bg-white px-3
            text-xs text-[#1677ff]
          "
            >
              ล่าสุด
              <ChevronDown size={15} />
            </button>

            <div className="flex h-9 overflow-hidden rounded-md bg-[#1677ff]">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
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

        {viewMode === "grid" ? (
          <div
            className="
            grid grid-cols-1 gap-7
            sm:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
          "
          >
            <NotebookCard isCreate onClick={() => navigate("/speech-to-text")} />

            {filteredData.map((item) => (
              <NotebookCard key={item.id} item={item} onClick={() => navigate("/speech-to-text")} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredData.map((item) => (
              <div
                key={item.id}
                className="
              cursor-pointer 
                flex items-center gap-4 rounded-xl
                border border-[#e5ebf4] bg-white p-4
                hover:border-[#b8d3f7]
              "
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#eef5ff]">
                  <FileText
                    size={22}
                    className="text-[#4b9cff]"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-[#0066cc]">
                    {item.title}
                  </h3>
                  <p className="mt-1 truncate text-xs text-[#737b8c]">
                    {item.description}
                  </p>
                </div>

                <div className="hidden text-right text-[11px] text-[#a0a8b6] md:block">
                  <div>{item.date}</div>
                  <div className="mt-1">{item.time}</div>
                </div>

                <button
                  type="button"
                  className="text-[#a8c5e9] hover:text-[#1677ff]"
                >
                  <MoreVertical size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </section>
  );
}