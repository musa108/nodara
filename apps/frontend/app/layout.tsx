import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/providers/app-providers";

export const metadata: Metadata = {
  title: "Nodara — Programmable On-Chain Automation",
  description:
    "Create programmable blockchain workflows with simple triggers and actions. Nodara monitors on-chain events and reliably executes through KeeperHub.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
