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

export function SignupPage() {
  const navigate = useNavigate();
  const { signup, isAuthenticated, loading, isDemo } = useAuth();
  const apiEnabled = isApiConfigured();
  const [name, setName] = useState("");
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
      await signup(name, email, password);
      toast.success("Account created");
      navigate(ROUTES.dashboard);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Sign up failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Start your flow</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {apiEnabled
            ? "Create your LifeFlow account"
            : "Demo mode — set VITE_API_URL to connect the API"}
        </p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="Alex Chen"
            className="glass"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={submitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
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
          <Label htmlFor="signup-password">Password</Label>
          <Input
            id="signup-password"
            type="password"
            placeholder="••••••••"
            className="glass"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={submitting}
          />
        </div>
        {apiEnabled ? (
          <Button type="submit" className="w-full" disabled={submitting || loading}>
            {submitting ? "Creating account…" : "Create account"}
          </Button>
        ) : (
          <Button type="submit" className="w-full" asChild>
            <Link to={ROUTES.dashboard}>Create account (demo)</Link>
          </Button>
        )}
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to={ROUTES.login} className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
