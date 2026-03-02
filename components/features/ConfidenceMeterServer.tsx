import { cn } from "@/lib/utils";

interface ConfidenceMeterServerProps {
  score: number;
}

export function ConfidenceMeterServer({ score }: ConfidenceMeterServerProps) {
  const clampedScore = Math.max(1, Math.min(10, score));
  const percentage = clampedScore * 10;

  const getColor = (s: number) => {
    if (s <= 3) return { bar: "bg-red-500", text: "text-red-400", label: "Low" };
    if (s <= 5) return { bar: "bg-amber-500", text: "text-amber-400", label: "Moderate" };
    if (s <= 7) return { bar: "bg-blue-500", text: "text-blue-400", label: "Good" };
    return { bar: "bg-emerald-500", text: "text-emerald-400", label: "Strong" };
  };

  const color = getColor(clampedScore);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className={cn("text-sm font-medium", color.text)}>
          Confidence: {clampedScore}/10
        </span>
        <span className="text-xs text-muted-foreground">{color.label}</span>
      </div>
      <div className="w-full rounded-full bg-secondary h-2">
        <div
          className={cn("rounded-full h-2", color.bar)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
