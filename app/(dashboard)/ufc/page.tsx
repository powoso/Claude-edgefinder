"use client";

import { Badge } from "@/components/ui/badge";
import { Swords } from "lucide-react";
import { UFCDashboard } from "@/components/features/UFCDashboard";

export default function UFCPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Swords className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">UFC Module</h1>
        <Badge>PRO</Badge>
      </div>
      <p className="text-muted-foreground text-sm">
        Fighter profiles, matchup comparisons & AI-powered fight analysis
      </p>
      <UFCDashboard />
    </div>
  );
}
