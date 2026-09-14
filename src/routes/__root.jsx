import { Link, Outlet, createRootRoute, useRouterState } from "@tanstack/react-router"
import { BellIcon, CalendarDaysIcon, ChevronDownIcon, ChevronLeftIcon } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { NavUser } from "@/components/nav-user"
import { currentUser } from "@/lib/current-user"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
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
import { ThemeProvider } from "@/context/theme-context"
import { ThemeSwitcher } from "@/components/theme-switcher"

import { getBreadcrumb } from "@/config/navigation"

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
})

function RootLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const breadcrumb = getBreadcrumb(pathname)
  const immediateParent = breadcrumb.parents && breadcrumb.parents.length > 0
    ? breadcrumb.parents[breadcrumb.parents.length - 1]
    : null

  return (
    <ThemeProvider>
      <SidebarProvider>
        <Toaster />
        <AppSidebar />
        <SidebarInset className="bg-background">
          <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center border-b border-border bg-card/95 backdrop-blur-md px-2 sm:px-3 md:px-4">
            <SidebarTrigger className="-ml-1 sm:-ml-1.5 mr-1.5 sm:mr-2.5 shrink-0" />

            <div className="flex lg:hidden items-center gap-1.5 min-w-0 flex-1 mr-2 text-xs sm:text-sm">
              {immediateParent ? (
                <>
                  <Link
                    to={immediateParent.to}
                    className="flex items-center gap-0.5 text-muted-foreground hover:text-foreground shrink-0 max-w-[120px] sm:max-w-[200px] md:max-w-[300px] truncate font-medium transition active:opacity-70"
                    title={`ย้อนกลับไป ${immediateParent.title}`}
                  >
                    <ChevronLeftIcon className="size-3.5 sm:size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{immediateParent.title}</span>
                  </Link>
                  <span className="text-muted-foreground/40 shrink-0">/</span>
                </>
              ) : breadcrumb.section ? (
                <>
                  <span className="text-muted-foreground/80 shrink-0 max-w-[100px] sm:max-w-[180px] truncate text-[11px] sm:text-xs">
                    {breadcrumb.section}
                  </span>
                  <span className="text-muted-foreground/40 shrink-0">/</span>
                </>
              ) : null}

              <span className="font-semibold text-foreground truncate max-w-[180px] sm:max-w-[280px] md:max-w-none">
                {breadcrumb.page}
              </span>
            </div>

            <Breadcrumb className="hidden lg:block">
              <BreadcrumbList className="normal-case text-xs sm:text-sm tracking-normal flex-nowrap whitespace-nowrap">
                <BreadcrumbItem>
                  <BreadcrumbLink render={<Link to="/" />}>
                    หน้าหลัก
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />

                {breadcrumb.section && (
                  <>
                    <BreadcrumbItem className="text-muted-foreground font-normal">
                      {breadcrumb.section}
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                  </>
                )}

                {breadcrumb.parents?.map((parent) => (
                  <span key={parent.to || parent.title} className="contents">
                    <BreadcrumbItem>
                      {parent.to ? (
                        <BreadcrumbLink render={<Link to={parent.to} />}>
                          {parent.title}
                        </BreadcrumbLink>
                      ) : (
                        <span className="text-muted-foreground">{parent.title}</span>
                      )}
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                  </span>
                ))}

                <BreadcrumbItem>
                  <BreadcrumbPage className="font-medium text-foreground">
                    {breadcrumb.page}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Right: Theme Switcher & User Profile */}
            <div className="ml-auto flex items-center gap-2 sm:gap-2.5 shrink-0">
              <ThemeSwitcher />
              <NavUser user={currentUser} className="w-auto md:w-auto lg:w-60 shrink-0" />
            </div>
          </header>
          <main className="flex-1 px-2 py-2 sm:px-2 sm:py-2 md:px-2">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  )
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
