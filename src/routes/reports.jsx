import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
})

function ReportsPage() {
  return (
    <section>
      <p className="text-sm font-medium text-muted-foreground">Reports</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">Reports</h1>
      <p className="mt-2 text-muted-foreground">
        Add filters, tables, and report-specific data here.
      </p>
    </section>
  )
}
