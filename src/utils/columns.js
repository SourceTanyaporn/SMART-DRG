
import { createColumnHelper } from "@tanstack/react-table"

const columnHelper = createColumnHelper()

export const columns = columnHelper.columns([
    columnHelper.accessor("status", {
        header: "Status",
    }),
    columnHelper.accessor("email", {
        header: "Email",
    }),
    columnHelper.accessor("amount", {
        header: "Amount",
    }),
])