"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { ConnectWalletButton } from "@/components/dashboard/connect-wallet-button";
import { AuthGate } from "@/components/dashboard/auth-gate";
import { cn } from "@/utils/cn";

const NAV_ITEMS = [
  { href: "/overview", label: "Overview" },
  { href: "/workflows", label: "Workflows" },
  { href: "/executions", label: "Executions" },
  { href: "/audit-logs", label: "Audit Logs" },
  { href: "/analytics", label: "Analytics" },
  { href: "/settings", label: "Settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between gap-3 border-b border-border px-4 sm:px-6">
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="hidden lg:block" />
          <ConnectWalletButton />
        </header>

        {mobileMenuOpen && (
          <nav className="flex flex-wrap gap-1.5 border-b border-border px-4 py-3 lg:hidden">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm",
                    isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        <main className="flex flex-1 flex-col p-4 sm:p-6">
          <AuthGate>{children}</AuthGate>
        </main>
      </div>
    </div>
  );
}
