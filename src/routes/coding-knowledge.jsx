import { CodingKnowledgePage } from '@/features/coding-knowledge/coding-knowledge-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/coding-knowledge')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CodingKnowledgePage />
}
