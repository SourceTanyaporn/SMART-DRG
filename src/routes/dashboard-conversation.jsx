import { DashboardConversation } from '@/features/speech-to-text/dashboard-conversation'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard-conversation')({
  component: RouteComponent,
})

function RouteComponent() {
  return <DashboardConversation />
}
