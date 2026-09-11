import { Link, useRouterState } from "@tanstack/react-router"
import {
  Building2Icon,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { navigationGroups } from "@/config/navigation"

export function AppSidebar(props) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader
        className="
    h-16
    border-b
    border-sidebar-border
    px-4
    py-3
    group-data-[collapsible=icon]:px-0
  "
      >
        <div
          className="
      flex
      items-center
      gap-3
      overflow-hidden
      group-data-[collapsible=icon]:justify-center
    "
        >
          <div
            className="
        grid
        size-9
        shrink-0
        place-items-center
        rounded-lg
        bg-primary
        text-white
        shadow-2xs
      "
          >
            <Building2Icon className="size-5" />
          </div>

          <div className="min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold">
              โรงพยาบาลศิริสุข
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              Sirisuk Hospital
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-0 px-2 py-4">
        {navigationGroups.map((group) => (
          <div key={group.label}>
            {group.isDividerBefore && <div className="my-4 border-t border-sidebar-border" />}
            <NavigationMenu label={group.label} items={group.items} pathname={pathname} />
          </div>
        ))}
      </SidebarContent>

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
