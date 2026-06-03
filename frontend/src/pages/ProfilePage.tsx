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
import { apiGet, apiPost } from "@/services/apiClient";
import { Calendar, Check, AlertTriangle, Loader2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";

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

  // Google Calendar Integration states
  const [searchParams, setSearchParams] = useSearchParams();
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [checkingCalendar, setCheckingCalendar] = useState(false);
  const [syncingCalendar, setSyncingCalendar] = useState(false);

  const isLoading = apiEnabled ? loading : simulatedLoading;

  // Load Google Calendar connection status
  const checkGoogleStatus = async () => {
    if (!apiEnabled || isDemo || !user) return;
    setCheckingCalendar(true);
    try {
      const res = await apiGet<{ connected: boolean }>("/auth/google/status");
      setCalendarConnected(res.connected);
    } catch {
      /* ignore */
    } finally {
      setCheckingCalendar(false);
    }
  };

  useEffect(() => {
    if (user) {
      setName(user.name);
      setTimezone(user.timezone || 'UTC');
      checkGoogleStatus();
    }
  }, [user]);

  // Handle callback URL query params from Google redirect
  useEffect(() => {
    const connected = searchParams.get("google_connected");
    const error = searchParams.get("google_error");

    if (connected === "true") {
      toast.success("Google Calendar connected successfully!");
      setCalendarConnected(true);
      // Clean query params
      searchParams.delete("google_connected");
      setSearchParams(searchParams);
    } else if (error) {
      toast.error(`Google Calendar connection failed: ${error}`);
      searchParams.delete("google_error");
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  const handleConnectGoogle = async () => {
    setSyncingCalendar(true);
    try {
      const res = await apiGet<{ url: string }>("/auth/google");
      if (res.url) {
        window.location.href = res.url;
      } else {
        toast.error("Could not obtain connection URL.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to initiate Google Calendar sync.");
    } finally {
      setSyncingCalendar(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    setSyncingCalendar(true);
    try {
      await apiPost("/auth/google/disconnect");
      setCalendarConnected(false);
      toast.success("Google Calendar disconnected.");
    } catch (err: any) {
      toast.error(err.message || "Failed to disconnect Google Calendar.");
    } finally {
      setSyncingCalendar(false);
    }
  };

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
      <div className="space-y-6 max-w-xl">
        <Card className="glass border-border/60">
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

        {apiEnabled && !isDemo && (
          <Card className="glass border-border/60 shadow-[0_0_15px_rgba(0,0,0,0.2)]">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-[0_0_8px_rgba(59,130,246,0.2)]">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Google Calendar Integration</CardTitle>
                <p className="text-xs text-muted-foreground">Keep your dashboard tasks synchronized with Google Calendar.</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-y border-border/30">
                <span className="text-sm font-medium">Sync Status</span>
                {checkingCalendar ? (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" /> Checking...
                  </span>
                ) : calendarConnected ? (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20 shadow-[0_0_8px_rgba(74,222,128,0.1)]">
                    <Check className="h-3.5 w-3.5" /> Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                    <AlertTriangle className="h-3.5 w-3.5" /> Disconnected
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Syncing connects your LifeFlow workspace to Google. Creating, updating, or deleting tasks with start/due times on your dashboard will automatically reflect on your Google Calendar.
              </p>
              <div>
                {calendarConnected ? (
                  <Button
                    onClick={handleDisconnectGoogle}
                    variant="outline"
                    className="w-full sm:w-auto border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    disabled={syncingCalendar}
                  >
                    {syncingCalendar && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Disconnect Google Calendar
                  </Button>
                ) : (
                  <Button
                    onClick={handleConnectGoogle}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)] hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all"
                    disabled={syncingCalendar}
                  >
                    {syncingCalendar && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Connect Google Calendar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageShell>
  );
}
