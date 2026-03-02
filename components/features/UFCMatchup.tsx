"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2 } from "lucide-react";
import type { UFCFighter } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

interface UFCMatchupProps {
  fighterA: UFCFighter;
  fighterB: UFCFighter;
  onAnalyze?: (a: UFCFighter, b: UFCFighter) => void;
  analyzing?: boolean;
}

export function UFCMatchup({
  fighterA,
  fighterB,
  onAnalyze,
  analyzing,
}: UFCMatchupProps) {
  const [expanded, setExpanded] = useState(false);

  const statComparisons = [
    { label: "Str. Accuracy", a: fighterA.stats.striking_accuracy, b: fighterB.stats.striking_accuracy, suffix: "%" },
    { label: "Str/Min", a: fighterA.stats.strikes_landed_per_min, b: fighterB.stats.strikes_landed_per_min, suffix: "" },
    { label: "Str Absorbed/Min", a: fighterA.stats.strikes_absorbed_per_min, b: fighterB.stats.strikes_absorbed_per_min, suffix: "", lower: true },
    { label: "TD Accuracy", a: fighterA.stats.takedown_accuracy, b: fighterB.stats.takedown_accuracy, suffix: "%" },
    { label: "TD Defense", a: fighterA.stats.takedown_defense, b: fighterB.stats.takedown_defense, suffix: "%" },
    { label: "Sub Avg", a: fighterA.stats.submission_avg, b: fighterB.stats.submission_avg, suffix: "/15min" },
    { label: "KD Avg", a: fighterA.stats.knockdown_avg, b: fighterB.stats.knockdown_avg, suffix: "/15min" },
  ];

  return (
    <Card>
      <CardContent className="p-4">
        {/* Fighter names header */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-center flex-1">
            <p className="font-bold text-sm">{fighterA.name}</p>
            <p className="text-xs text-muted-foreground">{fighterA.record}</p>
          </div>
          <div className="px-4">
            <Badge variant="outline" className="text-[10px]">
              {fighterA.weight_class}
            </Badge>
            <p className="text-xs text-center text-muted-foreground mt-1">VS</p>
          </div>
          <div className="text-center flex-1">
            <p className="font-bold text-sm">{fighterB.name}</p>
            <p className="text-xs text-muted-foreground">{fighterB.record}</p>
          </div>
        </div>

        {/* Stat comparison bars */}
        <div className="space-y-2">
          {statComparisons.map((stat) => {
            const aVal = stat.a ?? 0;
            const bVal = stat.b ?? 0;
            const max = Math.max(aVal, bVal) || 1;
            const aWins = stat.lower ? aVal < bVal : aVal > bVal;
            const bWins = stat.lower ? bVal < aVal : bVal > aVal;

            return (
              <div key={stat.label}>
                <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
                  <span className={cn(aWins && "text-emerald-400 font-medium")}>
                    {aVal}{stat.suffix}
                  </span>
                  <span className="text-muted-foreground">{stat.label}</span>
                  <span className={cn(bWins && "text-emerald-400 font-medium")}>
                    {bVal}{stat.suffix}
                  </span>
                </div>
                <div className="flex gap-0.5 h-1.5">
                  <div className="flex-1 flex justify-end">
                    <div
                      className={cn(
                        "h-full rounded-l-sm",
                        aWins ? "bg-emerald-500" : "bg-secondary"
                      )}
                      style={{ width: `${(aVal / max) * 100}%` }}
                    />
                  </div>
                  <div className="flex-1">
                    <div
                      className={cn(
                        "h-full rounded-r-sm",
                        bWins ? "bg-emerald-500" : "bg-secondary"
                      )}
                      style={{ width: `${(bVal / max) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent form toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-primary mt-3 hover:underline"
        >
          {expanded ? "Hide" : "Show"} recent fights
        </button>

        {expanded && (
          <div className="mt-3 grid grid-cols-2 gap-4">
            <RecentForm fighter={fighterA} />
            <RecentForm fighter={fighterB} />
          </div>
        )}

        {/* AI Analysis button */}
        <div className="mt-4">
          <Button
            size="sm"
            className="w-full"
            onClick={() => onAnalyze?.(fighterA, fighterB)}
            disabled={analyzing}
          >
            {analyzing ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <Brain className="h-3.5 w-3.5 mr-1.5" />
            )}
            {analyzing ? "Analyzing..." : "AI Fighter Breakdown"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentForm({ fighter }: { fighter: UFCFighter }) {
  return (
    <div>
      <p className="text-xs font-medium mb-2">{fighter.name}</p>
      <div className="space-y-1">
        {fighter.recent_form.slice(0, 5).map((fight, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[10px]">
            <span
              className={cn(
                "w-4 text-center font-bold rounded px-0.5",
                fight.result === "Win"
                  ? "text-emerald-400 bg-emerald-500/10"
                  : "text-red-400 bg-red-500/10"
              )}
            >
              {fight.result === "Win" ? "W" : "L"}
            </span>
            <span className="text-muted-foreground truncate">
              {fight.opponent}
            </span>
            <span className="text-muted-foreground ml-auto whitespace-nowrap">
              R{fight.round}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
