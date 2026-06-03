import { PageShell } from "@/components/page/PageShell";
import { LoadingSkeleton } from "@/components/page/LoadingSkeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useSimulatedLoading } from "@/hooks/useSimulatedLoading";

export function SettingsPage() {
  const isLoading = useSimulatedLoading();

  if (isLoading) {
    return <LoadingSkeleton showHeader rows={3} />;
  }

  return (
    <PageShell
      title="Settings"
      description="Preferences and integrations — toggles are UI-only until backend ships."
    >
      <Card className="glass border-border/60">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Control how LifeFlow reaches you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { id: "email", label: "Email digests", defaultChecked: true },
            { id: "push", label: "Push notifications", defaultChecked: true },
            { id: "ai", label: "AI schedule suggestions", defaultChecked: false },
          ].map((item, i) => (
            <div key={item.id}>
              {i > 0 && <Separator className="mb-4" />}
              <div className="flex items-center justify-between">
                <Label htmlFor={item.id}>{item.label}</Label>
                <Switch id={item.id} defaultChecked={item.defaultChecked} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="glass border-border/60">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Futuristic dark theme is the default</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="compact">Compact sidebar</Label>
            <Switch id="compact" />
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
