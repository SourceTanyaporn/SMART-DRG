import { createFileRoute } from "@tanstack/react-router"
import { ProductDraftPage } from "@/features/product-drafts/draft-page"

export const Route = createFileRoute("/coding-review")({ component: () => <ProductDraftPage type="coding" /> })
