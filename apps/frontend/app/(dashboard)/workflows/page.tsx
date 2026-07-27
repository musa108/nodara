"use client";

import Link from "next/link";
import { Workflow as WorkflowIcon, Plus, Play, Trash2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
      {/* Title Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <span>Home</span>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-muted-foreground">Workflows</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Automation Workflows</h1>
          <p className="text-xs font-medium text-muted-foreground/90">Continuous monitoring of Trigger → Condition → Action workflows.</p>
        </div>
        <Link href="/workflows/new" className="shrink-0">
          <Button size="sm" className="rounded-xl px-4 py-2.5 h-10 text-xs font-bold shadow-sm">
            <Plus className="mr-1.5 h-4 w-4" />
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
            <Card key={wf.id} className="border border-border/40 shadow-premium hover:border-primary/20 hover:shadow-md transition-all rounded-2xl flex flex-col justify-between overflow-hidden bg-card">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3 p-5">
                <div className="space-y-1 pr-4 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{wf.name}</p>
                  {wf.description && <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{wf.description}</p>}
                </div>
                <WorkflowStatusBadge status={wf.status} />
              </CardHeader>
              
              <CardContent className="flex items-center justify-between border-t border-border/30 bg-muted/10 p-5 py-4">
                <div className="flex items-center gap-1.5 text-2xs uppercase tracking-wider font-bold text-muted-foreground/90">
                  <span className="bg-muted px-2 py-0.5 rounded-md border border-border/50 text-foreground/80">{wf.triggerType.replaceAll("_", " ")}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span className="bg-primary/5 border border-primary/10 text-primary px-2 py-0.5 rounded-md">{wf.actionType.replaceAll("_", " ")}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  {wf.triggerType === "MANUAL" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Run now"
                      className="h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                      onClick={() => triggerWorkflow.mutate(wf.id)}
                      disabled={triggerWorkflow.isPending}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 rounded-lg text-xs font-bold hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setEnabled.mutate({ id: wf.id, enabled: !wf.enabled })}
                    disabled={setEnabled.isPending}
                  >
                    {wf.enabled ? "Pause" : "Activate"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Delete"
                    className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    onClick={() => deleteWorkflow.mutate(wf.id)}
                    disabled={deleteWorkflow.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
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
