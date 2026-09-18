import { createFileRoute, useNavigate } from "@tanstack/react-router"

import { WorklistCard } from "@/features/drg-worklist/worklist-card"

export const Route = createFileRoute("/worklist")({
  component: WorklistPage,
})

function WorklistPage() {
  const navigate = useNavigate()

  return (
    <WorklistCard
      title="รายการผู้ป่วย DRG"
      subtitle="รายการข้อมูลเวชระเบียนผู้ป่วยใน สำหรับการประเมิน DRG และตรวจสอบความสมบูรณ์"
      onCaseSelect={() => navigate({ to: "/case-review" })}
    />
  )
}
