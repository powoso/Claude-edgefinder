"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfidenceMeter } from "./ConfidenceMeter";
import { extractConfidenceScore } from "@/lib/api/claude";
import type { ParsedGame } from "@/lib/api/odds";
import type { AnalysisInput } from "@/lib/api/claude";
import { Brain, X, Loader2, Save, AlertCircle } from "lucide-react";

interface AIAnalysisProps {
  game: ParsedGame;
  onClose: () => void;
  onSaved?: (analysisId: string) => void;
}

function gameToAnalysisInput(game: ParsedGame): AnalysisInput {
  const topLines = game.lines.slice(0, 6).map((l) => ({
    book: l.bookmaker,
    homeML: l.homeML,
    awayML: l.awayML,
    spread: l.homeSpread,
    spreadOdds: l.homeSpreadOdds,
    total: l.total,
    overOdds: l.overOdds,
    underOdds: l.underOdds,
  }));

  return {
    sport: game.sportTitle,
    homeTeam: game.homeTeam,
    awayTeam: game.awayTeam,
    currentOdds: {
      bestHomeML: game.bestHomeML,
      bestAwayML: game.bestAwayML,
      consensusSpread: game.consensusSpread,
      bestHomeSpread: game.bestHomeSpread,
      bestAwaySpread: game.bestAwaySpread,
      bookmakers: topLines,
    },
    lineMovement: game.lineMovement
      ? {
          openSpread: game.lineMovement.openSpread,
          currentSpread: game.lineMovement.currentSpread,
          direction: game.lineMovement.direction,
          magnitudePoints: game.lineMovement.magnitude,
        }
      : undefined,
  };
}

export function AIAnalysis({ game, onClose, onSaved }: AIAnalysisProps) {
  const [completion, setCompletion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    startAnalysis();
    return () => {
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startAnalysis() {
    setIsLoading(true);
    setError(null);
    setCompletion("");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: game.id,
          game: gameToAnalysisInput(game),
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 429) {
          setRateLimited(true);
          setError(data.error || "Daily analysis limit reached");
        } else {
          setError(data.error || `Request failed (${res.status})`);
        }
        setIsLoading(false);
        return;
      }

      // Read the plain text streaming response
      const reader = res.body?.getReader();
      if (!reader) {
        setError("No response stream");
        setIsLoading(false);
        return;
      }

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setCompletion(accumulated);
      }

      setIsLoading(false);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Analysis failed");
      setIsLoading(false);
    }
  }

  const confidenceScore = completion
    ? extractConfidenceScore(completion)
    : 0;

  async function handleSave() {
    if (!completion || saving) return;
    setSaving(true);

    try {
      const res = await fetch("/api/analysis/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: game.id,
          sport: game.sportKey,
          homeTeam: game.homeTeam,
          awayTeam: game.awayTeam,
          analysisContent: completion,
          confidenceScore,
          oddsSnapshot: {
            bestHomeML: game.bestHomeML,
            bestAwayML: game.bestAwayML,
            consensusSpread: game.consensusSpread,
            lineMovement: game.lineMovement,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSaved(true);
        onSaved?.(data.id);
      }
    } catch {
      // Silently fail save
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="border-primary/30 bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">AI Deep Research</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {game.awayTeam} @ {game.homeTeam}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Rate limit */}
        {rateLimited && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
            <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-amber-400">
                Daily analysis limit reached
              </p>
              <p className="text-muted-foreground text-xs mt-0.5">
                Upgrade to Pro for unlimited analyses
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !rateLimited && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-red-400">Analysis failed</p>
              <p className="text-muted-foreground text-xs mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && !completion && (
          <div className="flex items-center gap-3 py-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">
              Analyzing matchup data...
            </span>
          </div>
        )}

        {/* Streaming content */}
        {completion && (
          <>
            {!isLoading && confidenceScore > 0 && (
              <ConfidenceMeter score={confidenceScore} />
            )}

            <div className="prose-sm">
              {completion.split("\n").map((line, i) => {
                if (line.startsWith("## ")) {
                  return (
                    <h3
                      key={i}
                      className="text-sm font-semibold text-primary mt-4 mb-2 first:mt-0"
                    >
                      {line.replace("## ", "")}
                    </h3>
                  );
                }
                if (line.startsWith("**") && line.endsWith("**")) {
                  return (
                    <p key={i} className="text-sm font-semibold mt-2 mb-1">
                      {line.replace(/\*\*/g, "")}
                    </p>
                  );
                }
                if (line.startsWith("- ") || line.startsWith("* ")) {
                  return (
                    <p key={i} className="text-sm text-muted-foreground ml-3 my-0.5">
                      &bull; {line.replace(/^[-*]\s/, "")}
                    </p>
                  );
                }
                if (line.match(/^\*\*Confidence:/)) return null;
                if (line.trim() === "") return <div key={i} className="h-2" />;
                return (
                  <p key={i} className="text-sm text-foreground/90 my-1">
                    {formatInlineStyles(line)}
                  </p>
                );
              })}
            </div>

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Streaming analysis...
              </div>
            )}

            {!isLoading && !saved && (
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  {saving ? "Saving..." : "Save Analysis"}
                </Button>
                <Badge variant="secondary" className="text-xs">
                  {game.sportTitle}
                </Badge>
              </div>
            )}

            {saved && (
              <p className="text-xs text-emerald-400 pt-2 border-t border-border">
                Analysis saved to your history
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function formatInlineStyles(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
