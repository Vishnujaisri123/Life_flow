import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/page/PageShell";
import { LoadingSkeleton } from "@/components/page/LoadingSkeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useSimulatedLoading } from "@/hooks/useSimulatedLoading";
import { isApiConfigured } from "@/services/api";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ProfilePage() {
  const apiEnabled = isApiConfigured();
  const simulatedLoading = useSimulatedLoading();
  const { user, loading, isDemo, logout, updateProfile } = useAuth();
  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [isSaving, setIsSaving] = useState(false);

  const isLoading = apiEnabled ? loading : simulatedLoading;

  useEffect(() => {
    if (user) {
      setName(user.name);
      setTimezone(user.timezone || 'UTC');
    }
  }, [user]);

  const displayName = user?.name ?? "Alex Chen";
  const displayEmail = user?.email ?? "alex@lifeflow.demo";

  const hasChanges = user && (name !== user.name || timezone !== user.timezone);

  const handleSave = async () => {
    if (!user || !apiEnabled || !hasChanges) return;
    setIsSaving(true);
    try {
      await updateProfile({ name, timezone });
      toast.success('Profile updated');
    } catch (error) {
      toast.error('Could not update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageShell
      title="Profile"
      description={
        isDemo
          ? "Your account details — placeholder profile until auth API is wired."
          : "Your LifeFlow account."
      }
    >
      <Card className="glass max-w-xl border-border/60">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/40">
            <AvatarFallback className="text-lg font-bold bg-primary/20">
              {initials(displayName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{displayName}</CardTitle>
            <p className="text-sm text-muted-foreground">{displayEmail}</p>
            {user && (
              <p className="text-xs text-muted-foreground mt-1">
                Score {user.productivityScore}% · Streak {user.streak} days
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display-name">Display name</Label>
            <Input
              id="display-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="glass"
              disabled={!apiEnabled || isDemo}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              value={timezone}
              onChange={(event) => setTimezone(event.target.value)}
              className="glass"
              disabled={!apiEnabled || isDemo}
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={logout}
              disabled={isSaving}
            >
              Sign out
            </Button>
            <Button
              className="w-full sm:w-auto"
              onClick={handleSave}
              disabled={!apiEnabled || isDemo || !hasChanges || isSaving}
            >
              {isSaving ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
