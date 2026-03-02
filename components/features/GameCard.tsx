"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OddsTable } from "./OddsTable";
import { LineMovement } from "./LineMovement";
import { SharpIndicator } from "./SharpIndicator";
import { formatOdds } from "@/lib/utils/calculations";
import { formatGameDate } from "@/lib/utils/formatting";
import type { ParsedGame } from "@/lib/api/odds";
import {
  Brain,
  ChevronDown,
  ChevronUp,
  Clock,
} from "lucide-react";

interface GameCardProps {
  game: ParsedGame;
  onResearch?: (game: ParsedGame) => void;
  researchLoading?: boolean;
}

export function GameCard({ game, onResearch, researchLoading }: GameCardProps) {
  const [expanded, setExpanded] = useState(false);

  const isLive =
    new Date(game.commenceTime).getTime() <= Date.now();
  const isSoon =
    new Date(game.commenceTime).getTime() - Date.now() < 60 * 60 * 1000;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Header row */}
        <div className="p-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {isLive ? (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                  LIVE
                </Badge>
              ) : isSoon ? (
                <Badge variant="warning" className="text-[10px] px-1.5 py-0">
                  SOON
                </Badge>
              ) : null}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatGameDate(game.commenceTime)}
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground">
              {game.lines.length} books
            </span>
          </div>

          {/* Matchup */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Away team */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm truncate">
                  {game.awayTeam}
                </span>
                <div className="flex items-center gap-3 ml-2 shrink-0">
                  {game.bestAwaySpread && (
                    <span className="font-mono text-sm">
                      {game.bestAwaySpread.point > 0 ? "+" : ""}
                      {game.bestAwaySpread.point}
                    </span>
                  )}
                  {game.bestAwayML !== null && (
                    <span className="font-mono text-sm font-medium w-14 text-right">
                      {formatOdds(game.bestAwayML)}
                    </span>
                  )}
                </div>
              </div>
              {/* Home team */}
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm truncate">
                  {game.homeTeam}
                </span>
                <div className="flex items-center gap-3 ml-2 shrink-0">
                  {game.bestHomeSpread && (
                    <span className="font-mono text-sm">
                      {game.bestHomeSpread.point > 0 ? "+" : ""}
                      {game.bestHomeSpread.point}
                    </span>
                  )}
                  {game.bestHomeML !== null && (
                    <span className="font-mono text-sm font-medium w-14 text-right">
                      {formatOdds(game.bestHomeML)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Line movement + sharp indicator */}
          <div className="mt-3 space-y-1.5">
            {game.lineMovement && (
              <LineMovement
                data={game.lineMovement}
                homeTeam={game.homeTeam}
                awayTeam={game.awayTeam}
              />
            )}
            <SharpIndicator
              lineMovement={game.lineMovement}
              homeTeam={game.homeTeam}
              awayTeam={game.awayTeam}
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-3">
            <Button
              size="sm"
              className="flex-1"
              onClick={() => onResearch?.(game)}
              disabled={researchLoading}
            >
              <Brain className="h-3.5 w-3.5 mr-1.5" />
              {researchLoading ? "Analyzing..." : "Deep Research"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="px-2"
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Expanded odds table */}
        {expanded && (
          <div className="border-t border-border px-4 py-3 bg-secondary/20">
            <OddsTable
              lines={game.lines}
              homeTeam={game.homeTeam}
              awayTeam={game.awayTeam}
              bestHomeML={game.bestHomeML}
              bestAwayML={game.bestAwayML}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
