"use client";

import { useState, useEffect, useCallback } from "react";
import { GameCard } from "./GameCard";
import { SportTabs } from "./SportTabs";
import { AIAnalysis } from "./AIAnalysis";
import { getDemoGames } from "./DemoGameData";
import type { ParsedGame } from "@/lib/api/odds";
import type { SportKey } from "@/lib/utils/constants";
import { Loader2, RefreshCw, AlertCircle, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface GamesDashboardProps {
  initialSport?: SportKey;
}

interface FetchResult {
  games: ParsedGame[];
  count: number;
  sport: string;
  demo?: boolean;
  message?: string;
}

export function GamesDashboard({
  initialSport = "basketball_nba",
}: GamesDashboardProps) {
  const [selectedSport, setSelectedSport] = useState<SportKey>(initialSport);
  const [games, setGames] = useState<ParsedGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [demoMessage, setDemoMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [researchingGame, setResearchingGame] = useState<ParsedGame | null>(
    null
  );

  const fetchGames = useCallback(async (sport: SportKey) => {
    setLoading(true);
    setError(null);
    setIsDemo(false);
    setDemoMessage(null);

    try {
      const res = await fetch(`/api/odds?sport=${sport}`);
      const data: FetchResult = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch games");
      }

      if (data.demo || data.games.length === 0) {
        const demoGames = getDemoGames(sport);
        setGames(demoGames);
        setIsDemo(true);
        setDemoMessage(
          data.message || "Showing demo data — no live games available"
        );
      } else {
        setGames(data.games);
      }

      setLastRefresh(new Date());
    } catch (err) {
      const demoGames = getDemoGames(sport);
      setGames(demoGames);
      setIsDemo(true);
      setDemoMessage(
        err instanceof Error
          ? err.message
          : "Using demo data — connect API for live odds"
      );
      setLastRefresh(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGames(selectedSport);
  }, [selectedSport, fetchGames]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchGames(selectedSport);
    }, 120000);
    return () => clearInterval(interval);
  }, [selectedSport, fetchGames]);

  function handleSportChange(sport: SportKey) {
    setSelectedSport(sport);
    setResearchingGame(null);
  }

  function handleResearch(game: ParsedGame) {
    setResearchingGame(game);
  }

  return (
    <div className="space-y-4">
      {/* Sport tabs + refresh */}
      <div className="flex items-center justify-between gap-4">
        <SportTabs selected={selectedSport} onChange={handleSportChange} />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fetchGames(selectedSport)}
          disabled={loading}
          className="shrink-0"
        >
          <RefreshCw
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      {/* Demo mode banner */}
      {isDemo && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
          <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
          <p className="text-xs text-amber-400">
            {demoMessage} — Set <code className="font-mono">ODDS_API_KEY</code>{" "}
            in .env.local for live data
          </p>
          <Badge variant="warning" className="ml-auto shrink-0">
            DEMO
          </Badge>
        </div>
      )}

      {/* Live indicator */}
      {!isDemo && !loading && games.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Wifi className="h-3 w-3 text-emerald-400" />
          <span>
            Live odds from {getUniqueBookCount(games)} sportsbooks
          </span>
          {lastRefresh && (
            <span className="ml-auto">
              Updated {formatTime(lastRefresh)}
            </span>
          )}
        </div>
      )}

      {/* AI Analysis Panel — shown when user clicks Deep Research */}
      {researchingGame && (
        <AIAnalysis
          game={researchingGame}
          onClose={() => setResearchingGame(null)}
        />
      )}

      {/* Loading state */}
      {loading && games.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm text-muted-foreground">Loading odds...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <AlertCircle className="h-8 w-8 text-destructive mb-3" />
          <p className="text-sm text-destructive">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => fetchGames(selectedSport)}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Game cards */}
      {!loading && games.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onResearch={handleResearch}
              researchLoading={researchingGame?.id === game.id}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && games.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground">
            No upcoming games found for this sport
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Games will appear as they&apos;re posted by sportsbooks
          </p>
        </div>
      )}
    </div>
  );
}

function getUniqueBookCount(games: ParsedGame[]): number {
  const books = new Set<string>();
  games.forEach((g) => g.lines.forEach((l) => books.add(l.bookmakerKey)));
  return books.size;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}
