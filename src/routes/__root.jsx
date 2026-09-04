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
import { Toaster } from "@/components/ui/toast-notification"

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
})

function RootLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const breadcrumb = breadcrumbByPath[pathname] ?? breadcrumbByPath["/"]

  return (
    <SidebarProvider>
      <Toaster />
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center border-b border-border bg-white px-3 sm:px-4 md:px-6">
          <SidebarTrigger className="mr-2 sm:mr-3 md:hidden" />
          <p className="text-lg sm:text-2xl font-bold tracking-tight text-primary truncate">
            SMART DRG<span className="text-sky-500">+</span> AI
          </p>

          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <NavUser user={currentUser} className="w-auto max-w-[150px] sm:w-56 sm:max-w-none md:w-60" />
          </div>
        </header>
        <div className="overflow-x-auto px-3 py-2 sm:px-4 sm:py-3 md:px-6">
          <Breadcrumb>
            <BreadcrumbList className="normal-case text-xs sm:text-sm tracking-normal flex-nowrap whitespace-nowrap">
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
        <main className="flex-1 px-3 py-3 sm:px-4 sm:py-4 md:px-6">
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
  "/speech-to-text": { section: "Speech to text", page: "Speech to text" },
  "/dashboard-conversation": { section: "Speech to text", page: "Dashboard Conversation" },
  "/result-page": { section: "Speech to text", page: "Result" },
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
