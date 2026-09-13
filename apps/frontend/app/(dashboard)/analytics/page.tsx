"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardsSkeleton } from "@/components/dashboard/skeletons";
import { useAnalytics } from "@/hooks/useAnalytics";

export default function AnalyticsPage() {
  const { data, isLoading } = useAnalytics();

  const successRate =
    data && data.successfulExecutions + data.failedExecutions > 0
      ? Math.round((data.successfulExecutions / (data.successfulExecutions + data.failedExecutions)) * 100)
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">How your workflows are performing.</p>
      </div>

      {isLoading || !data ? (
        <CardsSkeleton count={3} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{successRate !== null ? `${successRate}%` : "100%"}</div>
              <p className="mt-1 text-xs text-muted-foreground">Simulated vs. confirmed on-chain transactions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Executions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{(data.successfulExecutions + data.failedExecutions).toLocaleString()}</div>
              <p className="mt-1 text-xs text-muted-foreground">Triggers fired and executed across all connected chains</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Active Workflows</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">
                {data.activeWorkflows} <span className="text-base font-normal text-muted-foreground">/ {data.totalWorkflows}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Continuous on-chain monitoring rules</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
