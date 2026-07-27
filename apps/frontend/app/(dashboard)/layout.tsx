"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { ConnectWalletButton } from "@/components/dashboard/connect-wallet-button";
import { AuthGate } from "@/components/dashboard/auth-gate";
import { Menu, X } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 z-20">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col md:pl-60">
        {/* Mobile Header / Desktop Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between md:justify-end border-b border-border bg-card/85 backdrop-blur-md px-4 md:px-6">
          {/* Mobile hamburger & logo */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg overflow-hidden border border-emerald-500/30 bg-card shadow-sm">
                <img src="/logo.png" alt="Nodara" className="h-full w-full object-cover" />
              </div>
              <span className="text-sm font-extrabold tracking-widest text-emerald-400 uppercase select-none">
                NODA<span className="text-foreground">RA</span>
              </span>
            </div>
          </div>

          {/* Connect wallet button */}
          <div className="flex items-center gap-4">
            <ConnectWalletButton />
          </div>
        </header>

        {/* Mobile Sidebar Slide-over / Drawer */}
        {sidebarOpen && (
          <div className="relative z-50 md:hidden animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
              onClick={() => setSidebarOpen(false)}
            />
            {/* Drawer */}
            <div className="fixed inset-y-0 left-0 flex w-60 flex-col bg-card border-r border-border shadow-panel animate-in slide-in-from-left duration-300">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg overflow-hidden border border-emerald-500/30 bg-card shadow-sm">
                    <img src="/logo.png" alt="Nodara" className="h-full w-full object-cover" />
                  </div>
                  <span className="text-sm font-extrabold tracking-widest text-emerald-400 uppercase select-none">
                    NODA<span className="text-foreground">RA</span>
                  </span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <Sidebar isMobile onClose={() => setSidebarOpen(false)} />
              </div>
            </div>
          </div>
        )}

        <main className="flex flex-1 flex-col p-4 md:p-8 max-w-7xl w-full mx-auto">
          <AuthGate>{children}</AuthGate>
        </main>
      </div>
    </div>
  );
}
