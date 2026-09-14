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
    <aside className="flex h-screen w-64 flex-col border-r border-[#E6E1D8] bg-[#FAF8F4]">
      {/* Brand header */}
      <Link href="/" className="flex items-center gap-2.5 px-6 py-5.5 border-b border-[#E6E1D8]/60">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E0533C] text-white font-bold text-base shadow-sm">
          ✱
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-[#1B1A18]">Nodara</span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#6F6A63]">Console</span>
        </div>
      </Link>

      {/* Nav items */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-[#F3EFE8] text-[#1B1A18] font-semibold shadow-xs"
                  : "text-[#6F6A63] hover:bg-[#F3EFE8]/60 hover:text-[#1B1A18]"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("h-4 w-4 transition-colors", isActive ? "text-[#E0533C]" : "text-[#6F6A63] group-hover:text-[#1B1A18]")} />
                <span>{item.label}</span>
              </div>
              {isActive && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#E0533C]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Status footer */}
      <div className="border-t border-[#E6E1D8] p-4">
        <div className="rounded-xl border border-[#E6E1D8] bg-[#F3EFE8]/70 p-3 text-left">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-semibold text-[#1B1A18]">BOT Chain 677</span>
          </div>
          <p className="mt-1 text-[11px] text-[#6F6A63] leading-relaxed">
            KeeperHub simulation active. Non-custodial gas rail operational.
          </p>
        </div>
      </div>
    </aside>
  );
}
