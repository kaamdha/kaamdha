"use client";

import { useState } from "react";
import { HeroSection } from "./hero-section";
import { HowItWorks } from "./how-it-works";
import { JobTypeGrid } from "./job-type-grid";
import { TrustStats } from "./trust-stats";
import { BottomCta } from "./bottom-cta";

type Mode = "find_help" | "find_jobs";

export function HomeLanding() {
  const [mode, setMode] = useState<Mode>("find_help");

  return (
    <div className="flex flex-col">
      <HeroSection mode={mode} onModeChange={setMode} />
      <HowItWorks mode={mode} />
      <JobTypeGrid mode={mode} />
      <TrustStats />
      <BottomCta />
    </div>
  );
}
