"use client";

import Link from "next/link";
import { ArrowRight, Zap, Clock, ArrowDownToLine, ShieldAlert, Send, GitBranch, Lock, Link2, Database, Eye } from "lucide-react";
import { ConnectWalletButton } from "@/components/dashboard/connect-wallet-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const PIPELINE_STAGES = [
  { icon: Zap, label: "Trigger", detail: "Schedule, funds received, or approval detected" },
  { icon: GitBranch, label: "Condition", detail: "Evaluated against live chain state" },
  { icon: Send, label: "Action", detail: "Transfer, swap, or revoke" },
  { icon: Lock, label: "KeeperHub", detail: "Simulated, gas-estimated, confirmed" },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Workflow Builder",
    description: "Choose a trigger, configure a condition, choose an action, review, save. No code required.",
  },
  {
    icon: ArrowDownToLine,
    title: "Live Dashboard",
    description: "Total and active workflows, success and failure counts, and a 7-day execution timeline — all polling live.",
  },
  {
    icon: Clock,
    title: "Execution History",
    description: "Every firing traced end to end: simulation result, gas estimate, transaction hash, duration.",
  },
  {
    icon: ShieldAlert,
    title: "Searchable Audit Log",
    description: "An append-only record of every workflow change and execution event, filterable by type.",
  },
];

const PRINCIPLES = [
  {
    icon: Lock,
    title: "Read-only chain reader",
    description: "The monitoring engine watches balances, allowances, and events — it never holds a private key and never signs anything.",
  },
  {
    icon: Link2,
    title: "One path to execution",
    description: "KeeperHub is the only module allowed to submit a transaction. No exceptions, no bypass.",
  },
  {
    icon: Database,
    title: "Deterministic idempotency",
    description: "Every firing gets a key derived from workflow and trigger evidence — the same event can never execute twice.",
  },
  {
    icon: Eye,
    title: "Simulation gate",
    description: "Nothing broadcasts unless KeeperHub's simulation succeeds first. A reverted simulation costs nothing.",
  },
];

const STATS = [
  { value: "4", label: "Trigger types" },
  { value: "3", label: "Action types" },
  { value: "30s", label: "Monitoring sweep" },
  { value: "100%", label: "Executions via KeeperHub" },
];

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
              <rect width="32" height="32" rx="8" fill="hsl(var(--secondary))" />
              <circle cx="9" cy="10" r="2.4" fill="hsl(var(--primary))" />
              <circle cx="23" cy="10" r="2.4" fill="hsl(var(--primary))" />
              <circle cx="16" cy="22" r="2.4" fill="hsl(var(--primary))" />
              <path d="M9 10L16 22M23 10L16 22M9 10L23 10" stroke="hsl(var(--primary))" strokeWidth="1.6" strokeLinecap="round" opacity="0.55" />
            </svg>
            <span className="text-sm font-semibold tracking-tight">Nodara</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
            <Link href="/workflows" className="hover:text-foreground">Workflows</Link>
            <Link href="/executions" className="hover:text-foreground">Executions</Link>
            <Link href="/audit-logs" className="hover:text-foreground">Audit Logs</Link>
            <Link href="/analytics" className="hover:text-foreground">Analytics</Link>
          </nav>
          <ConnectWalletButton />
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="bg-grid border-b border-border">
          <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-6 inline-flex items-center rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                Programmable On-Chain Automation
              </div>
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                Automate your wallet. <span className="text-primary">Reliably.</span>
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground">
                Define a trigger, a condition, and an action. Nodara watches the chain and lets KeeperHub
                simulate, estimate gas, submit, and confirm the transaction — every time.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link href="/workflows/new">
                  <Button size="lg">
                    Create a workflow
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/workflows">
                  <Button variant="outline" size="lg">
                    Explore workflows
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-6 border-t border-border pt-10 sm:grid-cols-4">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-semibold tracking-tight sm:text-3xl">{stat.value}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pipeline */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="text-center text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Every execution, the same reliable path
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PIPELINE_STAGES.map((stage, i) => {
                const Icon = stage.icon;
                return (
                  <Card key={stage.label}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/15">
                          <Icon className="h-4.5 w-4.5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {i + 1}. {stage.label}
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground">{stage.detail}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="text-center text-2xl font-semibold tracking-tight">A dashboard built for automation, not pages</h2>
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title}>
                    <CardContent className="flex items-start gap-4 pt-6">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/15">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{feature.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Reliability principles */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="text-center text-2xl font-semibold tracking-tight">Reliability is structural, not a convention</h2>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {PRINCIPLES.map((principle) => {
                const Icon = principle.icon;
                return (
                  <div key={principle.title} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/15">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{principle.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{principle.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section>
          <div className="mx-auto max-w-6xl px-6 py-20 text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Built for reliability. Ready to scale.</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              Connect a wallet and create your first workflow in under a minute.
            </p>
            <div className="mt-8 flex justify-center">
              <Link href="/workflows/new">
                <Button size="lg">
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-8 text-center text-xs text-muted-foreground">
          Every execution runs through <span className="text-foreground">KeeperHub</span>.
        </div>
      </footer>
    </div>
  );
}
