import { SpeechToTextPage } from '@/features/speech-to-text/speech-to-text-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/speech-to-text')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SpeechToTextPage />
}
