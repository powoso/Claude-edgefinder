"use client";

import { cn } from "@/lib/utils";
import type { LineMovementData } from "@/lib/api/odds";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

interface LineMovementProps {
  data: LineMovementData;
  homeTeam: string;
  awayTeam: string;
}

export function LineMovement({ data, homeTeam, awayTeam }: LineMovementProps) {
  const { openSpread, currentSpread, direction, magnitude } = data;

  if (openSpread === null || currentSpread === null) return null;

  const formatSpread = (s: number) => (s > 0 ? `+${s}` : `${s}`);
  const moved = magnitude > 0;

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground">Line:</span>
      <span className="text-muted-foreground font-mono">
        {formatSpread(openSpread)}
      </span>
      <span className="text-muted-foreground">&rarr;</span>
      <span
        className={cn(
          "font-mono font-medium",
          direction === "home" && "text-emerald-400",
          direction === "away" && "text-red-400",
          direction === "none" && "text-muted-foreground"
        )}
      >
        {formatSpread(currentSpread)}
      </span>
      {moved && (
        <span
          className={cn(
            "inline-flex items-center gap-0.5 rounded px-1 py-0.5",
            direction === "home" && "bg-emerald-500/10 text-emerald-400",
            direction === "away" && "bg-red-500/10 text-red-400"
          )}
        >
          {direction === "home" ? (
            <TrendingDown className="h-3 w-3" />
          ) : direction === "away" ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <Minus className="h-3 w-3" />
          )}
          {magnitude.toFixed(1)}pts
        </span>
      )}
      {moved && (
        <span className="text-muted-foreground">
          toward {direction === "home" ? homeTeam : awayTeam}
        </span>
      )}
    </div>
  );
}
