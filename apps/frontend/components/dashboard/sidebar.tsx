"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Workflow, PlayCircle, ScrollText, BarChart3, Settings } from "lucide-react";
import { cn } from "@/utils/cn";

const NAV_ITEMS = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/workflows", label: "Workflows", icon: Workflow },
  { href: "/executions", label: "Executions", icon: PlayCircle },
  { href: "/audit-logs", label: "Audit Logs", icon: ScrollText },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-border bg-card">
      <Link href="/" className="flex items-center gap-2.5 px-5 py-5">
        <svg viewBox="0 0 32 32" className="h-7 w-7 shrink-0" aria-hidden="true">
          <rect width="32" height="32" rx="8" fill="hsl(var(--secondary))" />
          <circle cx="9" cy="10" r="2.4" fill="hsl(var(--primary))" />
          <circle cx="23" cy="10" r="2.4" fill="hsl(var(--primary))" />
          <circle cx="16" cy="22" r="2.4" fill="hsl(var(--primary))" />
          <path
            d="M9 10L16 22M23 10L16 22M9 10L23 10"
            stroke="hsl(var(--primary))"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.55"
          />
        </svg>
        <span className="text-sm font-semibold tracking-tight">Nodara</span>
      </Link>

      <nav className="flex-1 space-y-0.5 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 text-xs text-muted-foreground">
        Every execution runs through <span className="text-foreground">KeeperHub</span>.
      </div>
    </aside>
  );
}
