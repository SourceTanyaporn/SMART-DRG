import { createFileRoute } from "@tanstack/react-router"
import { ProductDraftPage } from "@/features/product-drafts/draft-page"

export const Route = createFileRoute("/emr-viewer")({ component: () => <ProductDraftPage type="emr" /> })
