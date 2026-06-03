import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app/AppSidebar";
import { AppHeader } from "@/components/app/AppHeader";
import { AiFloatingButton } from "@/components/ai/AiFloatingButton";
import { ReminderProvider } from "@/context/ReminderContext";
import { ROUTES } from "@/routes/paths";

export function AppLayout() {
  const { pathname } = useLocation();
  const onAiPage = pathname === ROUTES.aiAssistant;

  return (
    <ReminderProvider>
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset className="min-h-svh bg-background">
        <AppHeader />
        <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
        {!onAiPage && <AiFloatingButton />}
      </SidebarInset>
    </SidebarProvider>
    </ReminderProvider>
  );
}
