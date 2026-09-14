"use client";

import { Navbar } from "./navbar";
import { Hero } from "./hero";
import { StatementStrip } from "./statement-strip";
import { TrustStrip } from "./trust-strip";
import { ProblemSection } from "./problem-section";
import { HowItWorks } from "./how-it-works";
import { ProductDemo } from "./product-demo";
import { ExecutionPipeline } from "./execution-pipeline";
import { SecuritySection } from "./security-section";
import { BotChainSection } from "./botchain-section";
import { DeveloperSection } from "./developer-section";
import { FinalCTA } from "./final-cta";
import { Footer } from "./footer";

export function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Precision sticky navbar */}
      <Navbar />

      <main>
        {/* 1. Hero with Interactive Live Workflow Simulator */}
        <Hero />

        {/* 2. Editorial punchline statement */}
        <StatementStrip />

        {/* 3. Architectural Guarantees & Technical Trust Strip */}
        <TrustStrip />

        {/* 3. The Problem: Manual Fragility vs Programmatic Automation */}
        <ProblemSection />

        {/* 4. How Nodara Works: 01 Trigger, 02 Condition, 03 Action */}
        <HowItWorks />

        {/* 5. Live Product Demonstration & Real Console Telemetry */}
        <ProductDemo />

        {/* 6. The 9-Stage KeeperHub Execution Pipeline */}
        <ExecutionPipeline />

        {/* 7. Non-Custodial Security & Module Boundaries */}
        <SecuritySection />

        {/* 8. BOT Chain Mainnet & NodaraExecutionRegistry Anchoring */}
        <BotChainSection />

        {/* 9. Developer Primitives & TypeScript / API Schemas */}
        <DeveloperSection />

        {/* 10. High-Impact Final Call to Action */}
        <FinalCTA />
      </main>

      {/* 11. Multi-Column Technical Footer */}
      <Footer />
    </div>
  );
}
