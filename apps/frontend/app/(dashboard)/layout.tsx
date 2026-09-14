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
    <div className="flex h-screen h-[100dvh] overflow-hidden bg-[#FBF9F5]">
      {/* Fixed desktop sidebar */}
      <div className="hidden lg:flex lg:h-full lg:w-64 lg:shrink-0">
        <Sidebar />
      </div>

      {/* Scrollable dashboard content container */}
      <div className="flex flex-1 flex-col h-full min-w-0 overflow-y-auto">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-[#E6E1D8] bg-[#FBF9F5]/90 px-4 backdrop-blur-md sm:px-6">
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="rounded-lg p-2 text-[#6F6A63] hover:bg-[#F3EFE8] hover:text-[#1B1A18] lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="hidden lg:block" />
          <ConnectWalletButton />
        </header>

        {mobileMenuOpen && (
          <nav className="flex shrink-0 flex-wrap gap-1.5 border-b border-[#E6E1D8] bg-[#FAF8F4] px-4 py-3 lg:hidden">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive ? "bg-[#F3EFE8] text-[#1B1A18] font-semibold" : "text-[#6F6A63] hover:bg-[#F3EFE8]/70 hover:text-[#1B1A18]"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        <main className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
          <AuthGate>{children}</AuthGate>
        </main>
      </div>
    </div>
  );
}
