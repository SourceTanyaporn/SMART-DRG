import { Link, Outlet, createRootRoute, useRouterState } from "@tanstack/react-router"
import { BellIcon, CalendarDaysIcon, ChevronDownIcon } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { NavUser } from "@/components/nav-user"
import { currentUser } from "@/lib/current-user"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
})

function RootLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const breadcrumb = breadcrumbByPath[pathname] ?? breadcrumbByPath["/"]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center border-b border-border bg-white px-4 md:px-6">
          <SidebarTrigger className="mr-3 md:hidden" />
          <p className="text-2xl font-bold tracking-tight text-primary">
            SMART DRG<span className="text-sky-500">+</span> AI
          </p>

          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <Button variant="outline" className="h-10 gap-2 border-border px-3 text-sm font-medium">
              <CalendarDaysIcon className="size-4 text-muted-foreground" />
              <span className="hidden sm:inline">20 พ.ค. 2567</span>
              <ChevronDownIcon className="size-4 text-muted-foreground" />
            </Button>
            <button
              type="button"
              aria-label="การแจ้งเตือน"
              className="relative grid size-10 place-items-center rounded-lg text-primary transition-colors hover:bg-accent"
            >
              <BellIcon className="size-5" />
              <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
                3
              </span>
            </button>
            <div className="hidden h-8 border-l border-border sm:block" />
            <NavUser user={currentUser} className="w-48 sm:w-60" />
          </div>
        </header>
        <div className="px-4 py-3 md:px-6">
          <Breadcrumb>
            <BreadcrumbList className="normal-case text-sm tracking-normal">
              <BreadcrumbItem>หน้าหลัก</BreadcrumbItem>
              <BreadcrumbSeparator />
              {breadcrumb.section && (
                <>
                  <BreadcrumbItem>{breadcrumb.section}</BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              )}
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium text-foreground">
                  {breadcrumb.page}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <main className="flex-1 px-4 py-2 md:px-6 md:py-3">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

const breadcrumbByPath = {
  "/": { section: "Dashboard", page: "ภาพรวมผู้ป่วยและความเสี่ยง" },
  "/worklist": { page: "DRG Worklist" },
  "/case-review": { section: "DRG Worklist", page: "Case Review" },
  "/reports": { page: "Reports" },
  "/emr-viewer": { section: "DRG Operations", page: "EMR Case Viewer" },
  "/coding-review": { section: "DRG Operations", page: "Coding Review" },
  "/claim-alerts": { section: "DRG Operations", page: "Claim & Alerts" },
  "/revenue-risk": { section: "Insights", page: "Revenue & Risk" },
}

function NotFound() {
  return (
    <section className="grid min-h-80 place-items-center text-center">
      <div>
        <p className="text-sm font-medium text-slate-500">404</p>
        <h1 className="mt-2 text-2xl font-semibold">Page not found</h1>
        <Link to="/" className="mt-4 inline-block text-blue-700 hover:underline">
          Back to dashboard
        </Link>
      </div>
    </section>
  )
}
