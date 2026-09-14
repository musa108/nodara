"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="py-24 sm:py-32 bg-[#F3EFE8] border-b border-[#E6E1D8] text-center relative overflow-hidden">
      <div className="mx-auto max-w-4xl px-6 relative z-10">
        {/* Starburst icon at top inspired directly by screenshot */}
        <div className="flex justify-center mb-5">
          <span className="text-[#E0533C] text-4xl font-serif select-none">
            ✱
          </span>
        </div>

        <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#1B1A18] leading-[1.1] text-balance">
          Your automation starts here.
          <br />
          Give your wallet superpowers.
        </h2>

        <div className="mt-8 flex justify-center">
          <Link
            href="/workflows/new"
            className="inline-flex items-center gap-2 rounded-full bg-[#1C1C1F] px-8 py-4 text-sm sm:text-base font-bold text-white shadow-md hover:bg-[#2C2C30] transition-all hover:scale-[1.02]"
          >
            <span>Launch Nodara</span>
            <ArrowUpRight className="h-4 w-4 opacity-80" />
          </Link>
        </div>

        <p className="mt-5 text-xs sm:text-sm text-[#6F6A63] font-sans">
          Reliable execution starts with a trigger. Non-custodial &bull; Zero gas on simulated reverts.
        </p>
      </div>
    </section>
  );
}
