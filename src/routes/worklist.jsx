import { createFileRoute, useNavigate } from "@tanstack/react-router"

import { WorklistCard } from "@/features/drg-worklist/worklist-card"

export const Route = createFileRoute("/worklist")({
  component: WorklistPage,
})

function WorklistPage() {
  const navigate = useNavigate()

  return <WorklistCard onCaseSelect={() => navigate({ to: "/case-review" })} />
}
