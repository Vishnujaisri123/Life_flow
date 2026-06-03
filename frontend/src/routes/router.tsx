import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/layouts/AppLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/pages/LoginPage";
import { SignupPage } from "@/pages/SignupPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { TasksPage } from "@/pages/TasksPage";
import { TimelinePage } from "@/pages/TimelinePage";
import { CalendarPage } from "@/pages/CalendarPage";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { AIAssistantPage } from "@/pages/AIAssistantPage";
import { NotificationsPage } from "@/pages/NotificationsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { HabitsPage } from "@/pages/HabitsPage";
import { GoalsPage } from "@/pages/GoalsPage";
import { ROUTES } from "@/routes/paths";

function RootProviders() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootProviders />,
    children: [
      {
        path: ROUTES.home,
        element: <LandingPage />,
      },
      {
        element: <AuthLayout />,
        children: [
          { path: ROUTES.login, element: <LoginPage /> },
          { path: ROUTES.signup, element: <SignupPage /> },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: ROUTES.dashboard, element: <DashboardPage /> },
              { path: ROUTES.tasks, element: <TasksPage /> },
              { path: ROUTES.timeline, element: <TimelinePage /> },
              { path: ROUTES.calendar, element: <CalendarPage /> },
              { path: ROUTES.analytics, element: <AnalyticsPage /> },
              { path: ROUTES.aiAssistant, element: <AIAssistantPage /> },
              { path: ROUTES.notifications, element: <NotificationsPage /> },
              { path: ROUTES.settings, element: <SettingsPage /> },
              { path: ROUTES.profile, element: <ProfilePage /> },
              { path: ROUTES.habits, element: <HabitsPage /> },
              { path: ROUTES.goals, element: <GoalsPage /> },
            ],
          },
        ],
      },
      { path: "/app", element: <Navigate to={ROUTES.dashboard} replace /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
