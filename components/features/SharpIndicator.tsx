"use client";

import { cn } from "@/lib/utils";
import type { LineMovementData } from "@/lib/api/odds";
import { AlertTriangle } from "lucide-react";

interface SharpIndicatorProps {
  lineMovement: LineMovementData | null;
  homeTeam: string;
  awayTeam: string;
}

export function SharpIndicator({
  lineMovement,
  homeTeam,
  awayTeam,
}: SharpIndicatorProps) {
  if (!lineMovement || lineMovement.magnitude < 0.5) return null;

  // Sharp money signal: significant line movement (1+ points)
  // In reality you'd compare to public betting %, but the line movement magnitude
  // itself is a proxy signal — sharp bettors move lines against public sentiment
  const isSharp = lineMovement.magnitude >= 1;
  const isReverse = lineMovement.magnitude >= 1.5;

  if (!isSharp) return null;

  const favored =
    lineMovement.direction === "home" ? homeTeam : awayTeam;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs px-2 py-1 rounded-md",
        isReverse
          ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
          : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
      )}
    >
      <AlertTriangle className="h-3 w-3" />
      <span className="font-medium">
        {isReverse ? "RLM" : "Sharp"}: Line moved{" "}
        {lineMovement.magnitude.toFixed(1)}pts toward {favored}
      </span>
    </div>
  );
}
