import { AssesmentPage } from '@/features/assesment/assesment-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/assesment-page')({
    component: RouteComponent,
})

function RouteComponent() {
    return <AssesmentPage />
}
