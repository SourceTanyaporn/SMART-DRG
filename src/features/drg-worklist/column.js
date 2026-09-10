const riskClasses = {
  สูง: "bg-rose-50 text-rose-600",
  ปานกลาง: "bg-amber-50 text-amber-600",
  ต่ำ: "bg-emerald-50 text-emerald-600",
}

const statusClasses = {
  รอตรวจสอบ: "bg-blue-50 text-blue-600",
  กำลังตรวจสอบ: "bg-violet-50 text-violet-600",
  เสร็จสิ้น: "bg-emerald-50 text-emerald-600",
}

export const drgWorklistColumns = [
  {
    accessorKey: "an",
    header: "AN",
    cell: ({ getValue }) => createElement("span", { className: "font-semibold text-foreground whitespace-nowrap" }, getValue()),
  },
  {
    accessorKey: "hn",
    header: "HN",
    cell: ({ getValue }) => createElement("span", { className: "font-medium text-muted-foreground whitespace-nowrap" }, getValue() || "-"),
  },
  {
    accessorKey: "date",
    header: "วันที่",
    cell: ({ getValue }) => {
      const val = getValue()
      return createElement(
        "span",
        { className: "text-xs font-medium text-muted-foreground whitespace-nowrap" },
        val ? dayjs(val).format("D MMM BBBB") : "-"
      )
    },
  },
  {
    accessorKey: "patient",
    header: "ผู้ป่วย",
    cell: ({ row }) => detailCell(row.original.patient),
  },
  {
    accessorKey: "drg",
    header: "DRG",
    cell: ({ row }) => detailCell(row.original.drg, row.original.diagnosis, "font-semibold text-foreground"),
  },
  {
    accessorKey: "adjrw",
    header: "AdjRW",
    cell: ({ getValue }) => getValue().toFixed(4),
  },
  {
    accessorKey: "cost",
    header: "ค่าใช้จ่าย (บาท)",
    cell: ({ getValue }) => getValue().toLocaleString("en-US", { minimumFractionDigits: 2 }),
  },
  {
    accessorKey: "risk",
    header: "Risk",
    cell: ({ getValue }) => createElement(
      "span",
      { className: `inline-flex min-w-18 justify-center rounded-md px-2 py-1 text-xs font-semibold ${riskClasses[getValue()]}` },
      getValue(),
    ),
  },
  {
    accessorKey: "alerts",
    header: "Alert",
    cell: ({ getValue }) => {
      const count = getValue()

      return createElement(
        "span",
        { className: `inline-grid size-6 place-items-center rounded-full text-xs font-semibold ${count > 0 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}` },
        count,
      )
    },
  },
  {
    accessorKey: "status",
    header: "สถานะ",
    cell: ({ getValue }) => createElement(
      "span",
      { className: `inline-flex rounded-md px-2 py-1 text-xs font-semibold ${statusClasses[getValue()]}` },
      getValue(),
    ),
  },
]

function detailCell(primary, secondary, primaryClassName) {
  return createElement(
    "div",
    null,
    createElement("p", { className: primaryClassName }, primary),
    secondary ? createElement("p", { className: "mt-0.5 text-xs text-muted-foreground" }, secondary) : null,
  )
}
import { createElement } from "react"
import dayjs from "@/lib/dayjs"
