import { Link } from "react-router-dom";
import { Bell, LogOut, Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useReminders } from "@/hooks/useReminders";
import { ROUTES } from "@/routes/paths";
import { isApiConfigured } from "@/services/api";
import { cn } from "@/lib/utils";

type AppHeaderProps = {
  title?: string;
};

export function AppHeader({ title }: AppHeaderProps) {
  const { logout, user, isDemo } = useAuth();
  const apiEnabled = isApiConfigured();
  const { unreadCount = 0 } = useReminders();

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      <SidebarTrigger className="-ml-1" />
      {title && (
        <h2 className="hidden text-sm font-medium text-muted-foreground sm:block md:text-base">
          {title}
        </h2>
      )}
      <div className="relative ml-auto flex max-w-md flex-1 items-center gap-2 md:max-w-xs lg:max-w-sm">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search tasks, events…"
          className="h-9 pl-9 glass border-border/60"
          aria-label="Search"
        />
      </div>
      <Button variant="ghost" size="icon" className="relative shrink-0 touch-manipulation" asChild>
        <Link to={ROUTES.notifications} aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 ? (
            <Badge
              className={cn(
                "absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center px-1 text-[10px]",
                "bg-primary shadow-[0_0_8px_oklch(0.82_0.18_195)]",
              )}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          ) : (
            <span
              className={cn(
                "absolute right-1.5 top-1.5 h-2 w-2 rounded-full opacity-40",
                "bg-primary",
              )}
            />
          )}
        </Link>
      </Button>
      {apiEnabled && !isDemo && user && (
        <span className="hidden text-xs text-muted-foreground md:inline">{user.name}</span>
      )}
      <Button variant="outline" size="sm" className="hidden sm:inline-flex shrink-0" asChild>
        <Link to={ROUTES.profile}>Profile</Link>
      </Button>
      {apiEnabled && !isDemo && (
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          aria-label="Sign out"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      )}
    </header>
  );
}
