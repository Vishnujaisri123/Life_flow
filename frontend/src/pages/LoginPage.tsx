import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { ROUTES } from "@/routes/paths";
import { ApiError } from "@/services/api";
import { isApiConfigured } from "@/services/api";
import { toast } from "sonner";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading, isDemo } = useAuth();
  const apiEnabled = isApiConfigured();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated && apiEnabled) {
      navigate(ROUTES.dashboard, { replace: true });
    }
  }, [loading, isAuthenticated, apiEnabled, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isDemo) {
      navigate(ROUTES.dashboard);
      return;
    }
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success("Welcome back");
      navigate(ROUTES.dashboard);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Sign in failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {apiEnabled
            ? "Sign in to your LifeFlow workspace"
            : "Demo mode — set VITE_API_URL to use the API"}
        </p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="glass"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={submitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className="glass"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={submitting}
          />
        </div>
        {apiEnabled ? (
          <Button type="submit" className="w-full" disabled={submitting || loading}>
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        ) : (
          <Button type="submit" className="w-full" asChild>
            <Link to={ROUTES.dashboard}>Sign in (demo)</Link>
          </Button>
        )}
      </form>
      <p className="text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link to={ROUTES.signup} className="text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
