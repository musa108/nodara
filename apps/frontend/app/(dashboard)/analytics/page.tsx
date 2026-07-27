"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardsSkeleton } from "@/components/dashboard/skeletons";
import { useAnalytics } from "@/hooks/useAnalytics";
import { BarChart3, TrendingUp, Cpu, Workflow } from "lucide-react";

export default function AnalyticsPage() {
  const { data, isLoading } = useAnalytics();

  const successRate =
    data && data.successfulExecutions + data.failedExecutions > 0
      ? Math.round((data.successfulExecutions / (data.successfulExecutions + data.failedExecutions)) * 100)
      : null;

  return (
    <div className="space-y-6">
      {/* Title Header Section */}
      <div className="pb-4 border-b border-border/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <span>Home</span>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-muted-foreground">Analytics</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Automation Analytics</h1>
          <p className="text-xs font-medium text-muted-foreground/90">Detailed metrics representing workflow performance and trigger metrics.</p>
        </div>
      </div>

      {isLoading || !data ? (
        <CardsSkeleton count={3} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Success Rate Card */}
          <Card className="border border-border/40 shadow-premium rounded-2xl overflow-hidden bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3 p-5">
              <CardTitle className="text-xs font-bold tracking-wider uppercase text-muted-foreground">Success Rate</CardTitle>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <TrendingUp className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0 pb-6">
              <div className="text-3xl font-extrabold tracking-tight text-foreground">
                {successRate !== null ? `${successRate}%` : "100%"}
              </div>
              <p className="text-[10px] text-muted-foreground font-semibold mt-1">Based on simulated vs confirmed transactions</p>
            </CardContent>
          </Card>

          {/* Total Executions Card */}
          <Card className="border border-border/40 shadow-premium rounded-2xl overflow-hidden bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3 p-5">
              <CardTitle className="text-xs font-bold tracking-wider uppercase text-muted-foreground">Total Executions</CardTitle>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                <Cpu className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0 pb-6">
              <div className="text-3xl font-extrabold tracking-tight text-foreground">
                {(data.successfulExecutions + data.failedExecutions).toLocaleString()}
              </div>
              <p className="text-[10px] text-muted-foreground font-semibold mt-1">Total triggers fired and managed by KeeperHub</p>
            </CardContent>
          </Card>

          {/* Active Workflows Card */}
          <Card className="border border-border/40 shadow-premium rounded-2xl overflow-hidden bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3 p-5">
              <CardTitle className="text-xs font-bold tracking-wider uppercase text-muted-foreground">Active Workflows</CardTitle>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <Workflow className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0 pb-6">
              <div className="text-3xl font-extrabold tracking-tight text-foreground">
                {data.activeWorkflows} <span className="text-base font-normal text-muted-foreground/80">/ {data.totalWorkflows}</span>
              </div>
              <p className="text-[10px] text-muted-foreground font-semibold mt-1">Active automated rules monitored on-chain</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
