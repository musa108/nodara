"use client";

import { useState } from "react";
import { PlayCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/dashboard/empty-state";
import { TableSkeleton } from "@/components/dashboard/skeletons";
import { ExecutionStatusBadge } from "@/components/dashboard/status-badge";
import { useExecutions } from "@/hooks/useExecutions";
import { format } from "date-fns";

export default function ExecutionsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useExecutions(page);

  return (
    <div className="space-y-6">
      {/* Title Header Section */}
      <div className="pb-4 border-b border-border/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <span>Home</span>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-muted-foreground">Executions</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Workflow Executions</h1>
          <p className="text-xs font-medium text-muted-foreground/90">Detailed execution records from simulation through confirmation.</p>
        </div>
      </div>

      {isLoading || !data ? (
        <TableSkeleton />
      ) : data.items.length === 0 ? (
        <EmptyState icon={PlayCircle} title="No executions yet" description="Executions appear here once a workflow fires." />
      ) : (
        <Card className="border border-border/40 shadow-premium rounded-2xl overflow-hidden bg-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/20 text-muted-foreground uppercase tracking-wider text-2xs font-bold">
                    <th className="px-6 py-4">Workflow</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Tx Hash</th>
                    <th className="px-6 py-4">Duration</th>
                    <th className="px-6 py-4">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {data.items.map((e) => (
                    <tr key={e.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4.5 font-bold text-foreground">{e.workflowName}</td>
                      <td className="px-6 py-4.5">
                        <ExecutionStatusBadge status={e.status} />
                      </td>
                      <td className="px-6 py-4.5 font-mono text-2xs text-muted-foreground">
                        {e.transactionHash ? (
                          <a
                            href={`https://etherscan.io/tx/${e.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary hover:underline transition-colors"
                          >
                            {`${e.transactionHash.slice(0, 8)}…${e.transactionHash.slice(-8)}`}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-6 py-4.5 text-muted-foreground font-semibold">
                        {e.durationMs ? `${(e.durationMs / 1000).toFixed(2)}s` : "—"}
                      </td>
                      <td className="px-6 py-4.5 text-muted-foreground font-semibold">
                        {format(new Date(e.createdAt), "MMM d, HH:mm:ss")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {data && data.total > data.pageSize && (
        <div className="flex items-center justify-between bg-card border border-border/40 rounded-2xl p-4.5 shadow-subtle">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl px-4 text-xs font-bold border-border/60 hover:bg-muted"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Previous
          </Button>
          <span className="text-2xs uppercase tracking-wider font-extrabold text-muted-foreground">
            Page {data.page} of {Math.ceil(data.total / data.pageSize)}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl px-4 text-xs font-bold border-border/60 hover:bg-muted"
            disabled={page * data.pageSize >= data.total}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
