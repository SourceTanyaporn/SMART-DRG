import { createElement } from "react"
import dayjs from "@/lib/dayjs"

const riskClasses = {
  สูง: "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 font-bold",
  ปานกลาง: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 font-bold",
  ต่ำ: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 font-bold",
}

const statusClasses = {
  รอตรวจสอบ: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 font-bold",
  กำลังตรวจสอบ: "bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 font-bold",
  เสร็จสิ้น: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 font-bold",
}

export const drgWorklistColumns = [
  {
    accessorKey: "an",
    header: "AN",
    cell: ({ getValue }) =>
      createElement(
        "span",
        { className: "font-semibold text-foreground hover:text-primary transition-colors whitespace-nowrap" },
        getValue(),
      ),
  },
  {
    accessorKey: "hn",
    header: "HN",
    cell: ({ getValue }) =>
      createElement("span", { className: "font-medium text-muted-foreground whitespace-nowrap" }, getValue() || "-"),
  },
  {
    accessorKey: "date",
    header: "วันที่",
    cell: ({ getValue }) => {
      const val = getValue()
      return createElement(
        "span",
        { className: "text-xs font-medium text-muted-foreground whitespace-nowrap" },
        val ? dayjs(val).format("D MMM BBBB") : "-",
      )
    },
  },
  {
    accessorKey: "patient",
    header: "ผู้ป่วย",
    cell: ({ row }) =>
      detailCell(
        row.original.patient,
        row.original.demographics || (row.original.gender ? `${row.original.gender}, ${row.original.age} ปี` : ""),
        "font-semibold text-foreground",
      ),
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
    cell: ({ getValue }) =>
      createElement(
        "span",
        {
          className: `inline-flex min-w-18 justify-center rounded-md px-2.5 py-1 text-xs ${riskClasses[getValue()] || "bg-muted text-muted-foreground"}`,
        },
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
        {
          className: `inline-grid size-6 place-items-center rounded-full text-xs font-bold ${
            count > 0
              ? "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
              : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
          }`,
        },
        count,
      )
    },
  },
  {
    accessorKey: "status",
    header: "สถานะ",
    cell: ({ getValue }) =>
      createElement(
        "span",
        {
          className: `inline-flex rounded-md px-2.5 py-1 text-xs ${statusClasses[getValue()] || "bg-muted text-muted-foreground"}`,
        },
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

