import { ResultPage } from '@/features/speech-to-text/result-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/result-page')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ResultPage />
}
