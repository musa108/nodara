"use client";

import { Workflow, CheckCircle2, XCircle, Activity, ArrowRight, Zap, GitBranch, Send } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardsSkeleton } from "@/components/dashboard/skeletons";
import { ExecutionStatusBadge } from "@/components/dashboard/status-badge";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useExecutions } from "@/hooks/useExecutions";
import { formatDistanceToNow, format } from "date-fns";

function MetricCard({ label, value, icon: Icon }: { label: string; value: number; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight">{value.toLocaleString()}</div>
      </CardContent>
    </Card>
  );
}

function ExecutionTimeline({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const width = 600;
  const height = 160;
  const paddingX = 8;
  const paddingY = 12;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  if (data.length === 0) return null;

  const points = data.map((d, i) => ({
    x: paddingX + (data.length > 1 ? (i / (data.length - 1)) * chartWidth : chartWidth / 2),
    y: paddingY + chartHeight - (d.count / max) * chartHeight,
    date: d.date,
    count: d.count,
  }));

  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last) return null;

  let linePath = `M ${first.x} ${first.y}`;
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    if (!p0 || !p1) continue;
    const cpX = (p0.x + p1.x) / 2;
    linePath += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  const areaPath = `${linePath} L ${last.x} ${height - paddingY} L ${first.x} ${height - paddingY} Z`;

  return (
    <div className="w-full">
      <div className="overflow-x-auto overflow-y-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full min-w-[420px] overflow-visible">
          <defs>
            <linearGradient id="timelineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>
          {Array.from({ length: 4 }).map((_, i) => {
            const y = paddingY + (i / 3) * chartHeight;
            return <line key={i} x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="hsl(var(--border))" strokeWidth={1} />;
          })}
          <path d={areaPath} fill="url(#timelineGradient)" />
          <path d={linePath} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} strokeLinecap="round" />
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={3} className="fill-primary">
              <title>{`${p.count} executions on ${p.date}`}</title>
            </circle>
          ))}
        </svg>
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
        {data.map((d) => (
          <span key={d.date}>{format(new Date(d.date), "MMM d")}</span>
        ))}
      </div>
    </div>
  );
}

const PIPELINE_STAGES = [
  { icon: Zap, label: "Trigger", detail: "Schedule, funds, or approval" },
  { icon: GitBranch, label: "Condition", detail: "Evaluated on-chain" },
  { icon: Send, label: "Action", detail: "Transfer, swap, or revoke" },
  { icon: CheckCircle2, label: "KeeperHub", detail: "Simulated & confirmed" },
];

export default function OverviewPage() {
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const { data: executions, isLoading: executionsLoading } = useExecutions();

  if (analyticsLoading || !analytics) {
    return (
      <div className="space-y-6">
        <div className="h-36 animate-pulse rounded-lg bg-secondary" />
        <CardsSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardContent className="space-y-6 pt-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl space-y-1.5">
              <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
              <p className="text-sm text-muted-foreground">
                Your automation workflows, monitored continuously and executed reliably through KeeperHub.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/workflows/new">
                <Button size="sm">
                  Create Workflow
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
              <Link href="/executions">
                <Button variant="outline" size="sm">
                  View Executions
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 border-t border-border pt-6 sm:grid-cols-2 lg:grid-cols-4">
            {PIPELINE_STAGES.map((stage, i) => {
              const Icon = stage.icon;
              return (
                <div key={stage.label} className="flex items-center gap-3 rounded-md border border-border bg-secondary/40 p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/15">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground">
                      {i + 1}. {stage.label}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">{stage.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total Workflows" value={analytics.totalWorkflows} icon={Workflow} />
        <MetricCard label="Active Workflows" value={analytics.activeWorkflows} icon={Activity} />
        <MetricCard label="Successful Executions" value={analytics.successfulExecutions} icon={CheckCircle2} />
        <MetricCard label="Failed Executions" value={analytics.failedExecutions} icon={XCircle} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Execution Timeline (7 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ExecutionTimeline data={analytics.executionsLast7Days} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Recent Activity</CardTitle>
            <Link href="/executions" className="text-xs text-muted-foreground hover:text-foreground hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {executionsLoading || !executions ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-10 animate-pulse rounded-md bg-secondary" />
                ))}
              </div>
            ) : executions.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No executions yet.</p>
            ) : (
              executions.items.slice(0, 5).map((e) => (
                <div key={e.id} className="flex items-center justify-between gap-2 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{e.workflowName}</p>
                    <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(e.createdAt), { addSuffix: true })}</p>
                  </div>
                  <ExecutionStatusBadge status={e.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
