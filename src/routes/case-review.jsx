import { createFileRoute } from "@tanstack/react-router"
import { CaseReviewPage } from "@/features/case-review/case-review-page"

export const Route = createFileRoute("/case-review")({ component: CaseReviewPage })
