import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageShell } from "@/components/page/PageShell";
import { LoadingSkeleton } from "@/components/page/LoadingSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useSimulatedLoading } from "@/hooks/useSimulatedLoading";
import { isApiConfigured } from "@/services/api";

export function AnalyticsPage() {
  const apiEnabled = isApiConfigured();
  const simulatedLoading = useSimulatedLoading();
  const { weeklySeries, isLoading: apiLoading, isDemo } = useAnalytics();

  const isLoading = apiEnabled ? apiLoading : simulatedLoading;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const chartData = weeklySeries.length > 0 ? weeklySeries : [];

  return (
    <PageShell
      title="Analytics"
      description={
        isDemo
          ? "Focus and completion trends — sample chart data for demo."
          : "Focus and completion trends from your account."
      }
    >
      <Card className="glass border-border/60">
        <CardHeader>
          <CardTitle>Weekly focus & tasks</CardTitle>
        </CardHeader>
        <CardContent className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.35 0.06 280 / 0.3)" />
              <XAxis dataKey="day" stroke="oklch(0.72 0.04 260)" fontSize={12} />
              <YAxis stroke="oklch(0.72 0.04 260)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.16 0.04 270)",
                  border: "1px solid oklch(0.35 0.06 280 / 0.4)",
                  borderRadius: "0.75rem",
                }}
              />
              <Bar dataKey="focus" fill="oklch(0.82 0.18 195)" radius={[4, 4, 0, 0]} name="Focus %" />
              <Bar dataKey="tasks" fill="oklch(0.72 0.22 320)" radius={[4, 4, 0, 0]} name="Tasks" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </PageShell>
  );
}
