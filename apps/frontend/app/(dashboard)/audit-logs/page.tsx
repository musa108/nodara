"use client";

import { useMemo, useState } from "react";
import { ScrollText, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { TableSkeleton } from "@/components/dashboard/skeletons";
import { useAuditLogs } from "@/hooks/useAuditLogs";
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
      {/* Title Header Section */}
      <div className="pb-4 border-b border-border/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <span>Home</span>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-muted-foreground">Audit Logs</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">System Audit Logs</h1>
          <p className="text-xs font-medium text-muted-foreground/90">Every system event, securely recorded and searchable.</p>
        </div>
      </div>

      {/* Search Input bar */}
      <div className="relative max-w-sm w-full">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground/70">
          <Search className="h-4 w-4" />
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by event type…"
          className="flex h-10 w-full rounded-xl border border-border bg-background pl-10 pr-3.5 text-xs font-medium outline-none shadow-inner transition-all focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Logs Table */}
      {isLoading || !data ? (
        <TableSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState icon={ScrollText} title="No audit events found" description="System events (workflow changes, executions) will show up here." />
      ) : (
        <Card className="border border-border/40 shadow-premium rounded-2xl overflow-hidden bg-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/20 text-muted-foreground uppercase tracking-wider text-2xs font-bold">
                    <th className="px-6 py-4">Event</th>
                    <th className="px-6 py-4">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filtered.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4.5 font-bold text-foreground capitalize">
                        {log.eventType.replaceAll("_", " ").toLowerCase()}
                      </td>
                      <td className="px-6 py-4.5 text-muted-foreground font-semibold">
                        {format(new Date(log.createdAt), "MMM d, yyyy HH:mm:ss")}
                      </td>
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
