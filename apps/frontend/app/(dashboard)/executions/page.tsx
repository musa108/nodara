"use client";

import { useState } from "react";
import { PlayCircle, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/dashboard/empty-state";
import { TableSkeleton } from "@/components/dashboard/skeletons";
import { ExecutionStatusBadge } from "@/components/dashboard/status-badge";
import { useExecutions } from "@/hooks/useExecutions";
import { format } from "date-fns";
import { getTxExplorerUrl } from "@/utils/explorer";

export default function ExecutionsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useExecutions(page);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Executions</h1>
        <p className="text-sm text-muted-foreground">Every workflow firing, from simulation through confirmation.</p>
      </div>

      {isLoading || !data ? (
        <TableSkeleton />
      ) : data.items.length === 0 ? (
        <EmptyState icon={PlayCircle} title="No executions yet" description="Executions appear here once a workflow fires." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Workflow</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Tx Hash</th>
                    <th className="px-4 py-3 font-medium">Duration</th>
                    <th className="px-4 py-3 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((e) => {
                    const url = e.transactionHash ? getTxExplorerUrl(e.chainId, e.transactionHash) : null;
                    return (
                      <tr key={e.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 font-medium">{e.workflowName}</td>
                        <td className="px-4 py-3">
                          <ExecutionStatusBadge status={e.status} />
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">
                          {e.transactionHash ? (
                            url ? (
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-primary hover:underline"
                              >
                                {e.transactionHash.slice(0, 8)}…{e.transactionHash.slice(-6)}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              <span className="text-muted-foreground">{e.transactionHash.slice(0, 10)}…</span>
                            )
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{e.durationMs ? `${(e.durationMs / 1000).toFixed(1)}s` : "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{format(new Date(e.createdAt), "MMM d, HH:mm")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {data && data.total > data.pageSize && (
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {data.page} of {Math.ceil(data.total / data.pageSize)}
          </span>
          <Button variant="outline" size="sm" disabled={page * data.pageSize >= data.total} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
