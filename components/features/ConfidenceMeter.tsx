"use client";

import { cn } from "@/lib/utils";

interface ConfidenceMeterProps {
  score: number; // 1-10
  size?: "sm" | "md" | "lg";
}

export function ConfidenceMeter({ score, size = "md" }: ConfidenceMeterProps) {
  const clampedScore = Math.max(1, Math.min(10, score));
  const percentage = clampedScore * 10;

  const getColor = (s: number) => {
    if (s <= 3) return { bar: "bg-red-500", text: "text-red-400", label: "Low" };
    if (s <= 5) return { bar: "bg-amber-500", text: "text-amber-400", label: "Moderate" };
    if (s <= 7) return { bar: "bg-blue-500", text: "text-blue-400", label: "Good" };
    return { bar: "bg-emerald-500", text: "text-emerald-400", label: "Strong" };
  };

  const color = getColor(clampedScore);

  const heights = { sm: "h-1.5", md: "h-2", lg: "h-3" };
  const textSizes = { sm: "text-xs", md: "text-sm", lg: "text-base" };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className={cn("font-medium", textSizes[size], color.text)}>
          Confidence: {clampedScore}/10
        </span>
        <span className={cn("text-xs text-muted-foreground")}>{color.label}</span>
      </div>
      <div
        className={cn("w-full rounded-full bg-secondary", heights[size])}
      >
        <div
          className={cn(
            "rounded-full transition-all duration-700 ease-out",
            heights[size],
            color.bar
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {/* Tick marks */}
      {size !== "sm" && (
        <div className="flex justify-between px-[2px]">
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              className={cn(
                "w-0.5 h-1 rounded-full",
                i < clampedScore ? color.bar : "bg-secondary"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
