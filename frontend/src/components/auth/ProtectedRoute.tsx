import { Navigate, Outlet } from "react-router-dom";
import { LoadingSkeleton } from "@/components/page/LoadingSkeleton";
import { useAuth } from "@/context/AuthContext";
import { isApiConfigured } from "@/services/api";
import { ROUTES } from "@/routes/paths";

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const apiEnabled = isApiConfigured();

  if (!apiEnabled) {
    return <Outlet />;
  }

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center p-8">
        <LoadingSkeleton showHeader rows={4} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  return <Outlet />;
}
