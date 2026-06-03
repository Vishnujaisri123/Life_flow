import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  Bot,
  Calendar,
  Clock,
  CheckSquare,
  LayoutDashboard,
  Settings,
  Sparkles,
  Target,
  User,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { ROUTES } from "@/routes/paths";
import { cn } from "@/lib/utils";

const mainNav = [
  { to: ROUTES.dashboard, label: "Dashboard", icon: LayoutDashboard },
  { to: ROUTES.timeline, label: "Timeline", icon: Clock },
  { to: ROUTES.tasks, label: "Tasks", icon: CheckSquare },
  { to: ROUTES.calendar, label: "Calendar", icon: Calendar },
  { to: ROUTES.habits, label: "Habits", icon: Sparkles },
  { to: ROUTES.goals, label: "Goals", icon: Target },
  { to: ROUTES.analytics, label: "Analytics", icon: BarChart3 },
  { to: ROUTES.aiAssistant, label: "AI Assistant", icon: Bot },
] as const;

const accountNav = [
  { to: ROUTES.profile, label: "Profile", icon: User },
  { to: ROUTES.settings, label: "Settings", icon: Settings },
] as const;

export function AppSidebar() {
  const { pathname } = useLocation();

  const isActive = (path: string) =>
    pathname === path || (path !== ROUTES.dashboard && pathname.startsWith(path));

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link to={ROUTES.dashboard} className="flex items-center gap-2 group">
          <Sparkles className="h-5 w-5 shrink-0" style={{ color: "oklch(0.85 0.18 195)" }} />
          <span className="font-bold tracking-tight group-data-[collapsible=icon]:hidden">
            Life<span className="text-gradient">Flow</span>
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map(({ to, label, icon: Icon }) => (
                <SidebarMenuItem key={to}>
                  <SidebarMenuButton asChild isActive={isActive(to)} tooltip={label}>
                    <Link to={to}>
                      <Icon />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountNav.map(({ to, label, icon: Icon }) => (
                <SidebarMenuItem key={to}>
                  <SidebarMenuButton asChild isActive={isActive(to)} tooltip={label}>
                    <Link to={to}>
                      <Icon />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div
          className={cn(
            "rounded-xl px-3 py-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden",
            "glass",
          )}
        >
          <span className="font-medium text-foreground">Pro trial</span>
          <span className="block mt-0.5">12 days left · placeholder</span>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
