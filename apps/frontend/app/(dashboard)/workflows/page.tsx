"use client";

import Link from "next/link";
import { Workflow as WorkflowIcon, Plus, Play, Trash2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { TableSkeleton } from "@/components/dashboard/skeletons";
import { WorkflowStatusBadge } from "@/components/dashboard/status-badge";
import { useWorkflows, useSetWorkflowEnabled, useDeleteWorkflow } from "@/hooks/useWorkflows";
import { useTriggerWorkflow } from "@/hooks/useExecutions";

export default function WorkflowsPage() {
  const { data: workflows, isLoading } = useWorkflows();
  const setEnabled = useSetWorkflowEnabled();
  const deleteWorkflow = useDeleteWorkflow();
  const triggerWorkflow = useTriggerWorkflow();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Workflows</h1>
          <p className="text-sm text-muted-foreground">Trigger → Condition → Action, monitored continuously.</p>
        </div>
        <Link href="/workflows/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            New Workflow
          </Button>
        </Link>
      </div>

      {isLoading || !workflows ? (
        <TableSkeleton />
      ) : workflows.length === 0 ? (
        <EmptyState
          icon={WorkflowIcon}
          title="No workflows yet"
          description="Create your first workflow to start automating on-chain actions."
          actionLabel="Create Workflow"
          onAction={() => (window.location.href = "/workflows/new")}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {workflows.map((wf) => (
            <Card key={wf.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-medium text-foreground">{wf.name}</p>
                  {wf.description && <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{wf.description}</p>}
                </div>
                <WorkflowStatusBadge status={wf.status} />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4 text-xs">
                  <Badge variant="secondary">{wf.triggerType.replaceAll("_", " ")}</Badge>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <Badge variant="secondary">{wf.actionType.replaceAll("_", " ")}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {wf.triggerType === "MANUAL" && (
                      <Button variant="ghost" size="icon" title="Run now" onClick={() => triggerWorkflow.mutate(wf.id)} disabled={triggerWorkflow.isPending}>
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => setEnabled.mutate({ id: wf.id, enabled: !wf.enabled })} disabled={setEnabled.isPending}>
                      {wf.enabled ? "Pause" : "Activate"}
                    </Button>
                  </div>
                  <Button variant="ghost" size="icon" title="Delete" onClick={() => deleteWorkflow.mutate(wf.id)} disabled={deleteWorkflow.isPending}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
