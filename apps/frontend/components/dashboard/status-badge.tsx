import { Badge } from "@/components/ui/badge";

const EXECUTION_STATUS_MAP: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" }> = {
  PENDING: { label: "Pending", variant: "secondary" },
  SIMULATING: { label: "Simulating", variant: "default" },
  SIMULATION_FAILED: { label: "Simulation failed", variant: "destructive" },
  ESTIMATING_GAS: { label: "Estimating gas", variant: "default" },
  SUBMITTED: { label: "Submitted", variant: "warning" },
  CONFIRMED: { label: "Confirmed", variant: "success" },
  FAILED: { label: "Failed", variant: "destructive" },
  RETRYING: { label: "Retrying", variant: "warning" },
};

const WORKFLOW_STATUS_MAP: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" | "outline" }> = {
  ACTIVE: { label: "Active", variant: "success" },
  PAUSED: { label: "Paused", variant: "secondary" },
  DRAFT: { label: "Draft", variant: "outline" },
};

export function ExecutionStatusBadge({ status }: { status: string }) {
  const entry = EXECUTION_STATUS_MAP[status] ?? { label: status, variant: "secondary" as const };
  return <Badge variant={entry.variant}>{entry.label}</Badge>;
}

export function WorkflowStatusBadge({ status }: { status: string }) {
  const entry = WORKFLOW_STATUS_MAP[status] ?? { label: status, variant: "secondary" as const };
  return <Badge variant={entry.variant}>{entry.label}</Badge>;
}
