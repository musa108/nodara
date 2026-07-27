"use client";

import { Workflow, CheckCircle2, XCircle, Activity, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardsSkeleton } from "@/components/dashboard/skeletons";
import { ExecutionStatusBadge } from "@/components/dashboard/status-badge";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useExecutions } from "@/hooks/useExecutions";
import { formatDistanceToNow, format } from "date-fns";

function MetricCard({ label, value, icon: Icon }: { label: string; value: number; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Card className="border border-border/40 shadow-premium bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-5">
        <CardTitle className="text-xs font-bold tracking-wider uppercase text-muted-foreground">{label}</CardTitle>
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
          <Icon className="h-4.5 w-4.5" />
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-0 pb-6">
        <div className="text-3xl font-extrabold tracking-tight text-foreground">{value.toLocaleString()}</div>
      </CardContent>
    </Card>
  );
}

// Custom curved SVG Area Chart for Execution Timeline
function ExecutionTimeline({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const width = 600;
  const height = 180;
  const paddingX = 40;
  const paddingY = 20;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  if (data.length === 0) return null;

  // Generate points coordinates
  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * chartWidth;
    const y = paddingY + chartHeight - (d.count / max) * chartHeight;
    return { x, y, date: d.date, count: d.count };
  });

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  if (!firstPoint || !lastPoint) return null;

  // Generate SVG path for line using Cubic Bezier curve for smoothness
  let linePath = `M ${firstPoint.x} ${firstPoint.y}`;
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    if (!p0 || !p1) continue;
    const cpX1 = p0.x + (p1.x - p0.x) / 2;
    const cpY1 = p0.y;
    const cpX2 = p0.x + (p1.x - p0.x) / 2;
    const cpY2 = p1.y;
    linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
  }

  // Generate SVG path for gradient area fill
  const areaPath = `${linePath} L ${lastPoint.x} ${height - paddingY} L ${firstPoint.x} ${height - paddingY} Z`;

  return (
    <div className="w-full">
      <div className="overflow-x-auto overflow-y-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[500px] h-auto overflow-visible">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(14 76% 57% / 0.35)" />
              <stop offset="100%" stopColor="hsl(14 76% 57% / 0.0)" />
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          {Array.from({ length: 4 }).map((_, i) => {
            const y = paddingY + (i / 3) * chartHeight;
            return (
              <line
                key={i}
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="currentColor"
                className="text-border/40"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Area under the line */}
          <path d={areaPath} fill="url(#chartGradient)" />

          {/* The line itself */}
          <path d={linePath} fill="none" stroke="hsl(14 76% 57%)" strokeWidth={2.5} strokeLinecap="round" />

          {/* Points/Dots */}
          {points.map((p, i) => (
            <g key={i} className="group/dot cursor-pointer">
              <circle
                cx={p.x}
                cy={p.y}
                r={4}
                className="fill-white stroke-[2.5px] stroke-primary transition-all duration-150 group-hover/dot:r-5.5"
              />
              <title>{`${p.count} executions on ${p.date}`}</title>
            </g>
          ))}
        </svg>
      </div>
      <div className="flex justify-between px-10 mt-3 text-[10px] font-semibold text-muted-foreground/80">
        {data.map((d, i) => (
          <span key={i}>{format(new Date(d.date), "MMM d")}</span>
        ))}
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const { data: executions, isLoading: executionsLoading } = useExecutions();

  if (analyticsLoading || !analytics) {
    return (
      <div className="space-y-6">
        <div className="h-40 animate-pulse rounded-2xl bg-secondary" />
        <CardsSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Banner with Mountain Waves SVG */}
      <div className="relative overflow-hidden bg-card border border-border/40 rounded-2xl p-6 md:p-8 shadow-premium flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Background Decorative SVG */}
        <div className="absolute right-0 bottom-0 top-0 h-full w-full md:w-[60%] pointer-events-none z-0">
          <svg className="h-full w-full" viewBox="0 0 600 200" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="hill-bg" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f4cbaf" />
                <stop offset="100%" stopColor="#d59a72" />
              </linearGradient>
              <linearGradient id="hill-mid" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#eba88d" />
                <stop offset="100%" stopColor="#c57454" />
              </linearGradient>
              <linearGradient id="hill-fg" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#d78260" />
                <stop offset="100%" stopColor="#a34b2f" />
              </linearGradient>
            </defs>
            {/* Hill 1 (Back) */}
            <path d="M 0 200 C 120 120, 220 50, 420 130 L 600 70 L 600 200 Z" fill="url(#hill-bg)" opacity="0.4" />
            {/* Hill 2 (Middle) */}
            <path d="M 60 200 C 180 100, 280 60, 480 150 L 600 110 L 600 200 Z" fill="url(#hill-mid)" opacity="0.75" />
            {/* Hill 3 (Front) */}
            <path d="M 180 200 C 300 110, 400 80, 600 200 Z" fill="url(#hill-fg)" />
          </svg>
        </div>

        {/* Text Section */}
        <div className="relative z-10 space-y-3 max-w-md">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <span>Home</span>
            <span className="text-muted-foreground/50">/</span>
            <span>Dashboard</span>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-muted-foreground">Overview</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-foreground text-card shadow-md">
              <Zap className="h-6 w-6 text-primary fill-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground">Overview</h1>
              <p className="text-xs text-muted-foreground font-medium">Your automation workflows, at a glance.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total Workflows" value={analytics.totalWorkflows} icon={Workflow} />
        <MetricCard label="Active Workflows" value={analytics.activeWorkflows} icon={Activity} />
        <MetricCard label="Successful Executions" value={analytics.successfulExecutions} icon={CheckCircle2} />
        <MetricCard label="Failed Executions" value={analytics.failedExecutions} icon={XCircle} />
      </div>

      {/* Execution Timeline and Recent Activity Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Side Section (2/3 width) - Timeline */}
        <Card className="lg:col-span-2 border border-border/40 shadow-premium">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-xs font-bold tracking-wider uppercase text-muted-foreground">Execution Timeline (7 days)</CardTitle>
            <div className="flex gap-1">
              <span className="text-[10px] font-bold bg-muted px-2 py-1 rounded text-foreground">7 Days</span>
            </div>
          </CardHeader>
          <CardContent>
            <ExecutionTimeline data={analytics.executionsLast7Days} />
          </CardContent>
        </Card>

        {/* Right Side Section (1/3 width) - Recent Activity */}
        <Card className="border border-border/40 shadow-premium">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-bold tracking-wider uppercase text-muted-foreground">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3.5">
            {executionsLoading || !executions ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-11 animate-pulse rounded-xl bg-secondary" />
                ))}
              </div>
            ) : executions.items.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2 font-medium">No executions yet.</p>
            ) : (
              executions.items.slice(0, 5).map((e) => (
                <div key={e.id} className="flex items-center justify-between gap-3 text-xs font-medium pb-3 border-b border-border/30 last:border-0 last:pb-0">
                  <div className="min-w-0 space-y-0.5">
                    <p className="truncate font-semibold text-foreground">{e.workflowName}</p>
                    <p className="text-[10px] text-muted-foreground/80 font-normal">{formatDistanceToNow(new Date(e.createdAt), { addSuffix: true })}</p>
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
