import { ActivityHistoryPage } from '@/features/activity-history/activity-history-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/activity-history')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ActivityHistoryPage />
}
