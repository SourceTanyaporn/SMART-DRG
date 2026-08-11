import { Link, useRouterState } from "@tanstack/react-router"
import {
  BookOpenIcon,
  BriefcaseMedicalIcon,
  Building2Icon,
  ChevronLeftIcon,
  CircleDollarSignIcon,
  ClipboardListIcon,
  FileBarChartIcon,
  HistoryIcon,
  LayoutDashboardIcon,
  MessageCircle,
  SettingsIcon,
  ShieldAlertIcon,
  StethoscopeIcon,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"

const operationsNavigation = [
  { title: "Dashboard", to: "/", icon: LayoutDashboardIcon },
  { title: "DRG Worklist", to: "/worklist", icon: ClipboardListIcon },
  { title: "Case Review", to: "/case-review", icon: FileBarChartIcon },
  { title: "EMR Case Viewer", to: "/emr-viewer", icon: StethoscopeIcon, badge: "Draft" },
  { title: "Coding Review", to: "/coding-review", icon: BriefcaseMedicalIcon, badge: "Draft" },
  { title: "Claim & Alerts", to: "/claim-alerts", icon: ShieldAlertIcon, badge: "12" },

]

const speechtotextNavigation = [
   { title: "Dashboard Conversation", to: "/dashboard-conversation", icon: LayoutDashboardIcon },
     // { title: "Speech to text", to: "/speech-to-text", icon: MessageCircle },
  // { title: "Result", to: "/result-page", icon: LayoutDashboardIcon },

]

const insightNavigation = [
  { title: "Revenue & Risk", to: "/revenue-risk", icon: CircleDollarSignIcon, badge: "Draft" },
  { title: "Reports", to: "/reports", icon: FileBarChartIcon },
]

const administrationNavigation = [
  { title: "Coding Knowledge Base", icon: BookOpenIcon },
  { title: "Audit Log", icon: HistoryIcon },
  { title: "Settings", icon: SettingsIcon },
]

export function AppSidebar(props) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="h-16 border-b border-sidebar-border px-4 py-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-sidebar-primary/10 text-sidebar-primary"><Building2Icon className="size-5" /></div>
          <div className="min-w-0 leading-tight group-data-[collapsible=icon]:hidden"><p className="truncate text-sm font-semibold">โรงพยาบาลศิริสุข</p><p className="truncate text-[11px] text-muted-foreground">Sirisuk Hospital</p></div>
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-0 px-2 py-4">
        <NavigationMenu label="DRG Operations" items={operationsNavigation} pathname={pathname} />
        <NavigationMenu label="Speech to text" items={speechtotextNavigation} pathname={pathname} />
        <NavigationMenu label="Insights" items={insightNavigation} pathname={pathname} />
        <div className="my-4 border-t border-sidebar-border" />
        <NavigationMenu label="Administration" items={administrationNavigation} pathname={pathname} />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2"><CollapseButton /></SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function NavigationMenu({ label, items, pathname }) {
  return (
    <div className="mb-4">
      <p className="px-3 pb-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase group-data-[collapsible=icon]:hidden">{label}</p>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = item.to === pathname
          const Icon = item.icon
          return <SidebarMenuItem key={item.title}><SidebarMenuButton isActive={isActive} tooltip={item.title} render={item.to ? <Link to={item.to} /> : undefined} className="h-11 rounded-lg px-3 text-[15px]"><Icon className="size-5" /><span>{item.title}</span></SidebarMenuButton>{item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}</SidebarMenuItem>
        })}
      </SidebarMenu>
    </div>
  )
}

function CollapseButton() {
  const { toggleSidebar } = useSidebar()
  return <SidebarMenu><SidebarMenuItem><SidebarMenuButton tooltip="ย่อเมนู" onClick={toggleSidebar} className="h-10 rounded-lg px-3 text-muted-foreground"><ChevronLeftIcon className="size-5" /><span>ย่อเมนู</span></SidebarMenuButton></SidebarMenuItem></SidebarMenu>
}
