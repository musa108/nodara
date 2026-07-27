"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Workflow, PlayCircle, ScrollText, BarChart3, Settings } from "lucide-react";
import { cn } from "@/utils/cn";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/workflows", label: "Workflows", icon: Workflow },
  { href: "/executions", label: "Executions", icon: PlayCircle },
  { href: "/audit-logs", label: "Audit Logs", icon: ScrollText },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ isMobile, onClose }: { isMobile?: boolean; onClose?: () => void }) {
  const pathname = usePathname();

  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <aside className={cn(
      "flex h-full w-full flex-col border-r border-border bg-background/40 backdrop-blur-md",
      isMobile && "border-r-0 bg-transparent"
    )}>
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="relative flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden border border-emerald-500/30 shadow-md bg-card">
          <img src="/logo.png" alt="Nodara Logo" className="h-full w-full object-cover" />
        </div>
        <span className="text-base font-extrabold tracking-widest text-emerald-400 uppercase select-none">
          NODA<span className="text-foreground">RA</span>
        </span>
      </div>

      <nav className="flex-1 space-y-1.5 px-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all relative border border-transparent",
                isActive
                  ? "bg-card text-foreground shadow-subtle border-border/40 font-semibold"
                  : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r bg-emerald-500" />
              )}
              <Icon className={cn("h-4.5 w-4.5 transition-colors", isActive ? "text-emerald-400" : "text-muted-foreground group-hover:text-foreground")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-6 text-xs text-muted-foreground/80 border-t border-border/40">
        Programmable On-Chain Automation Engine
      </div>
    </aside>
  );
}
