import { DataTable } from "@/components/data-table"
import { drgWorklistColumns } from "@/features/drg-worklist/column"
import { drgWorklistData } from "@/features/drg-worklist/data"

export function WorklistCard({ onCaseSelect, selectedCaseAn }) {
  return (
    <section className="rounded-xl border border-[#edf0f5] bg-card p-3.5 sm:p-5">
      <div className="mb-3.5 sm:mb-5">
        <h2 className="text-base sm:text-lg font-semibold text-black">DRG Worklist</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">รายการผู้ป่วยที่รอการตรวจสอบ DRG</p>
      </div>
      <DataTable
        columns={drgWorklistColumns}
        data={drgWorklistData}
        searchPlaceholder="ค้นหา AN, ชื่อผู้ป่วย, HN..."
        onRowSelect={onCaseSelect}
        selectedRowId={selectedCaseAn}
      />
    </section>
  )
}
