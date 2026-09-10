import { useState } from "react"
import { flexRender } from "@tanstack/react-table"
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useLegacyTable,
} from "@tanstack/react-table/legacy"
import { ChevronLeftIcon, ChevronRightIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function DataTable({ columns, data, searchPlaceholder, onRowSelect, selectedRowId }) {
  const [globalFilter, setGlobalFilter] = useState("")
  const table = useLegacyTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  return (
    <div>
      <div className="relative mb-3 sm:mb-4 w-full sm:max-w-xs md:max-w-sm">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          placeholder={searchPlaceholder}
          className="h-9 sm:h-10 rounded-lg border-[#e4e8f1] bg-white pl-9 pr-3 text-xs sm:text-sm"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-[#edf0f5] bg-card">
        <Table>
          <TableHeader className="bg-muted/70 [&_tr]:border-[#edf0f5]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-10 sm:h-11 px-3 sm:px-4 normal-case text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => {
                const isSelected = selectedRowId === row.original.an

                return (
                  <TableRow
                    key={row.id}
                    onClick={() => onRowSelect?.(row.original)}
                    className={`border-[#edf0f5] ${onRowSelect ? "cursor-pointer hover:bg-primary/[0.035]" : ""} ${isSelected ? "bg-primary/[0.045] hover:bg-primary/[0.06]" : ""}`}
                  >
                    {row.getVisibleCells().map((cell, index) => (
                      <TableCell key={cell.id} className={`px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-foreground whitespace-nowrap ${isSelected && index === 0 ? "border-l-[3px] border-l-primary pl-[11px] sm:pl-[13px]" : ""}`}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-28 text-center text-xs sm:text-sm text-muted-foreground">
                  ไม่พบข้อมูลที่ค้นหา
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-3 sm:pt-4 text-xs sm:text-sm text-muted-foreground">
        <p className="order-2 sm:order-1 text-center sm:text-left">
          แสดง {table.getRowModel().rows.length} จาก {table.getFilteredRowModel().rows.length} รายการ
        </p>
        <div className="order-1 sm:order-2 flex items-center gap-2">
          <Button variant="outline" size="icon-sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} aria-label="หน้าก่อนหน้า">
            <ChevronLeftIcon className="size-4" />
          </Button>
          <span className="min-w-14 text-center">{table.getState().pagination.pageIndex + 1} / {table.getPageCount()}</span>
          <Button variant="outline" size="icon-sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} aria-label="หน้าถัดไป">
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
