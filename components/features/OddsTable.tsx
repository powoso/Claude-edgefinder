"use client";

import { cn } from "@/lib/utils";
import { formatOdds } from "@/lib/utils/calculations";
import type { OddsLine } from "@/lib/api/odds";

interface OddsTableProps {
  lines: OddsLine[];
  homeTeam: string;
  awayTeam: string;
  bestHomeML: number | null;
  bestAwayML: number | null;
}

export function OddsTable({
  lines,
  homeTeam,
  awayTeam,
  bestHomeML,
  bestAwayML,
}: OddsTableProps) {
  if (lines.length === 0) return null;

  return (
    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th className="text-left py-2 pr-3 font-medium whitespace-nowrap">
              Book
            </th>
            <th className="text-center py-2 px-2 font-medium whitespace-nowrap">
              {awayTeam.split(" ").pop()} ML
            </th>
            <th className="text-center py-2 px-2 font-medium whitespace-nowrap">
              {homeTeam.split(" ").pop()} ML
            </th>
            <th className="text-center py-2 px-2 font-medium whitespace-nowrap">
              Spread
            </th>
            <th className="text-center py-2 px-2 font-medium whitespace-nowrap">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {lines.slice(0, 8).map((line) => (
            <tr
              key={line.bookmakerKey}
              className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
            >
              <td className="py-1.5 pr-3 font-medium text-muted-foreground whitespace-nowrap">
                {shortenBookmaker(line.bookmaker)}
              </td>
              <td className="text-center py-1.5 px-2">
                {line.awayML !== null ? (
                  <span
                    className={cn(
                      "font-mono",
                      line.awayML === bestAwayML && "text-emerald-400 font-semibold"
                    )}
                  >
                    {formatOdds(line.awayML)}
                  </span>
                ) : (
                  <span className="text-muted-foreground/40">—</span>
                )}
              </td>
              <td className="text-center py-1.5 px-2">
                {line.homeML !== null ? (
                  <span
                    className={cn(
                      "font-mono",
                      line.homeML === bestHomeML && "text-emerald-400 font-semibold"
                    )}
                  >
                    {formatOdds(line.homeML)}
                  </span>
                ) : (
                  <span className="text-muted-foreground/40">—</span>
                )}
              </td>
              <td className="text-center py-1.5 px-2">
                {line.homeSpread !== null ? (
                  <span className="font-mono">
                    {line.homeSpread > 0 ? "+" : ""}
                    {line.homeSpread}{" "}
                    <span className="text-muted-foreground">
                      ({line.homeSpreadOdds !== null ? formatOdds(line.homeSpreadOdds) : ""})
                    </span>
                  </span>
                ) : (
                  <span className="text-muted-foreground/40">—</span>
                )}
              </td>
              <td className="text-center py-1.5 px-2">
                {line.total !== null ? (
                  <span className="font-mono">
                    {line.total}{" "}
                    <span className="text-muted-foreground">
                      (o{line.overOdds !== null ? formatOdds(line.overOdds) : ""})
                    </span>
                  </span>
                ) : (
                  <span className="text-muted-foreground/40">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {lines.length > 8 && (
        <p className="text-xs text-muted-foreground mt-1">
          +{lines.length - 8} more books
        </p>
      )}
    </div>
  );
}

function shortenBookmaker(name: string): string {
  const map: Record<string, string> = {
    "DraftKings": "DK",
    "FanDuel": "FD",
    "BetMGM": "MGM",
    "Caesars": "CZR",
    "PointsBet": "PB",
    "BetRivers": "Rivers",
    "Bovada": "BOV",
    "BetOnline.ag": "BOL",
    "MyBookie.ag": "MyB",
    "Barstool Sportsbook": "BS",
    "WynnBET": "Wynn",
    "SuperBook": "SB",
    "Unibet": "Uni",
    "FOX Bet": "FOX",
    "SI Sportsbook": "SI",
  };
  return map[name] ?? name.slice(0, 6);
}
