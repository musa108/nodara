"use client";

import { useMemo, useState } from "react";
import { ScrollText, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { TableSkeleton } from "@/components/dashboard/skeletons";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { truncateHash } from "@nodara/utils";
import { format } from "date-fns";

export default function AuditLogsPage() {
  const { data, isLoading } = useAuditLogs();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!data) return [];
    if (!search.trim()) return data.items;
    const q = search.toLowerCase();
    return data.items.filter((log) => log.eventType.toLowerCase().includes(q));
  }, [data, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Audit Logs</h1>
          <p className="text-sm text-muted-foreground">Every system event, recorded and searchable.</p>
        </div>

        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by event type…"
            className="flex h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      {isLoading || !data ? (
        <TableSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState icon={ScrollText} title="No audit events found" description="System events (workflow changes, executions) will show up here." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Event</th>
                    <th className="px-4 py-3 font-medium">Reference</th>
                    <th className="px-4 py-3 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((log) => (
                    <tr key={log.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium">{log.eventType.replaceAll("_", " ")}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {log.executionId ? truncateHash(log.executionId, 6) : log.workflowId ? truncateHash(log.workflowId, 6) : "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{format(new Date(log.createdAt), "MMM d, HH:mm:ss")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
