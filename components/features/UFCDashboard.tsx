"use client";

import { useState, useRef } from "react";
import { UFCMatchup } from "./UFCMatchup";
import { DEMO_FIGHTERS, DEMO_MATCHUPS } from "./UFCFighterData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfidenceMeter } from "./ConfidenceMeter";
import { extractConfidenceScore } from "@/lib/api/claude";
import type { UFCFighter } from "@/lib/supabase/types";
import { Brain, X, Loader2, AlertCircle } from "lucide-react";

export function UFCDashboard() {
  const [analyzingPair, setAnalyzingPair] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<{
    fighterA: string;
    fighterB: string;
    content: string;
  } | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function handleAnalyze(a: UFCFighter, b: UFCFighter) {
    const pairKey = `${a.id}-${b.id}`;
    setAnalyzingPair(pairKey);
    setAnalysis(null);
    setError(null);
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: `ufc-${a.id}-${b.id}`,
          game: {
            sport: "UFC",
            homeTeam: a.name,
            awayTeam: b.name,
            currentOdds: {
              matchupNote: "UFC bout — no traditional odds in demo",
            },
            recentForm: [
              `${a.name} (${a.record}): Last 5 - ${a.recent_form.slice(0, 5).map((f) => `${f.result} vs ${f.opponent} by ${f.method} R${f.round}`).join("; ")}`,
              `${b.name} (${b.record}): Last 5 - ${b.recent_form.slice(0, 5).map((f) => `${f.result} vs ${f.opponent} by ${f.method} R${f.round}`).join("; ")}`,
            ].join("\n"),
            headToHead: `Fighter A stats: Str.Acc ${a.stats.striking_accuracy}%, Str/min ${a.stats.strikes_landed_per_min}, TD Acc ${a.stats.takedown_accuracy}%, TD Def ${a.stats.takedown_defense}%, Sub avg ${a.stats.submission_avg}/15min, KD avg ${a.stats.knockdown_avg}/15min\nFighter B stats: Str.Acc ${b.stats.striking_accuracy}%, Str/min ${b.stats.strikes_landed_per_min}, TD Acc ${b.stats.takedown_accuracy}%, TD Def ${b.stats.takedown_defense}%, Sub avg ${b.stats.submission_avg}/15min, KD avg ${b.stats.knockdown_avg}/15min`,
          },
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Request failed (${res.status})`);
        setStreaming(false);
        setAnalyzingPair(null);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setError("No response stream");
        setStreaming(false);
        return;
      }

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setAnalysis({
          fighterA: a.name,
          fighterB: b.name,
          content: accumulated,
        });
      }

      setStreaming(false);
      setAnalyzingPair(null);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Analysis failed");
      setStreaming(false);
      setAnalyzingPair(null);
    }
  }

  // Build matchup pairs from demo data
  const matchups = DEMO_MATCHUPS.map((m) => ({
    a: DEMO_FIGHTERS.find((f) => f.id === m.fighterA)!,
    b: DEMO_FIGHTERS.find((f) => f.id === m.fighterB)!,
    weightClass: m.weightClass,
  })).filter((m) => m.a && m.b);

  const confidenceScore = analysis?.content
    ? extractConfidenceScore(analysis.content)
    : 0;

  return (
    <div className="space-y-6">
      {/* Analysis panel */}
      {(analysis || error) && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">AI Fighter Breakdown</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setAnalysis(null);
                  setError(null);
                  abortRef.current?.abort();
                }}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {analysis && (
              <p className="text-sm text-muted-foreground">
                {analysis.fighterA} vs {analysis.fighterB}
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {streaming && !analysis?.content && (
              <div className="flex items-center gap-3 py-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                  Analyzing fighter matchup...
                </span>
              </div>
            )}

            {analysis?.content && (
              <>
                {!streaming && confidenceScore > 0 && (
                  <ConfidenceMeter score={confidenceScore} />
                )}
                <div className="prose-sm">
                  {analysis.content.split("\n").map((line, i) => {
                    if (line.startsWith("## ")) {
                      return (
                        <h3 key={i} className="text-sm font-semibold text-primary mt-4 mb-2 first:mt-0">
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
                    if (line.trim() === "") return <div key={i} className="h-2" />;
                    return (
                      <p key={i} className="text-sm text-foreground/90 my-1">
                        {line}
                      </p>
                    );
                  })}
                </div>
                {streaming && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    Streaming analysis...
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Matchup cards */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Upcoming Matchups</h2>
          <Badge variant="secondary" className="text-xs">
            DEMO DATA
          </Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {matchups.map(({ a, b }) => (
            <UFCMatchup
              key={`${a.id}-${b.id}`}
              fighterA={a}
              fighterB={b}
              onAnalyze={handleAnalyze}
              analyzing={analyzingPair === `${a.id}-${b.id}`}
            />
          ))}
        </div>
      </div>

      {/* Fighter roster */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Fighter Profiles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {DEMO_FIGHTERS.map((fighter) => (
              <div
                key={fighter.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border"
              >
                <div>
                  <p className="font-medium text-sm">{fighter.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {fighter.record} &middot; {fighter.weight_class}
                  </p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>Str: {fighter.stats.striking_accuracy}%</p>
                  <p>TD: {fighter.stats.takedown_accuracy}%</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
