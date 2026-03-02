"use client";

import { cn } from "@/lib/utils";
import { SPORTS, type SportKey } from "@/lib/utils/constants";

interface SportTabsProps {
  selected: SportKey;
  onChange: (sport: SportKey) => void;
  gameCounts?: Record<string, number>;
}

export function SportTabs({ selected, onChange, gameCounts }: SportTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {SPORTS.map((sport) => {
        const isActive = selected === sport.key;
        const count = gameCounts?.[sport.key];
        return (
          <button
            key={sport.key}
            onClick={() => onChange(sport.key)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2",
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {sport.label}
            {count !== undefined && (
              <span
                className={cn(
                  "text-[10px] rounded-full px-1.5 py-0.5 min-w-[20px] text-center",
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
