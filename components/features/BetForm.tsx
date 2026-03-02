"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SPORTS } from "@/lib/utils/constants";
import { BET_TYPES, BET_RESULTS } from "@/lib/utils/constants";
import { Plus, X } from "lucide-react";
import type { Bet } from "@/lib/supabase/types";

interface BetFormProps {
  onSubmit: (bet: Bet) => void;
  onCancel: () => void;
}

export function BetForm({ onSubmit, onCancel }: BetFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const body = {
      sport: form.get("sport") as string,
      game_description: form.get("game_description") as string,
      bet_type: form.get("bet_type") as string,
      selection: form.get("selection") as string,
      odds: parseInt(form.get("odds") as string, 10),
      stake: parseFloat(form.get("stake") as string),
      game_date: new Date(form.get("game_date") as string).toISOString(),
      result: (form.get("result") as string) || "pending",
      notes: (form.get("notes") as string) || null,
    };

    if (isNaN(body.odds) || isNaN(body.stake)) {
      setError("Odds and stake must be valid numbers");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/bets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create bet");
      }

      const { bet } = await res.json();
      onSubmit(bet);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create bet");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Log Bet
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sport">Sport</Label>
            <select
              name="sport"
              id="sport"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {SPORTS.map((s) => (
                <option key={s.key} value={s.label}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bet_type">Bet Type</Label>
            <select
              name="bet_type"
              id="bet_type"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {BET_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="game_description">Game</Label>
            <Input
              name="game_description"
              id="game_description"
              placeholder="Lakers vs Celtics"
              required
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="selection">Selection</Label>
            <Input
              name="selection"
              id="selection"
              placeholder="Lakers -3.5"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="odds">Odds (American)</Label>
            <Input
              name="odds"
              id="odds"
              type="number"
              placeholder="-110"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stake">Stake ($)</Label>
            <Input
              name="stake"
              id="stake"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="100.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="game_date">Game Date</Label>
            <Input name="game_date" id="game_date" type="date" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="result">Result</Label>
            <select
              name="result"
              id="result"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {BET_RESULTS.map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input name="notes" id="notes" placeholder="Any notes..." />
          </div>

          {error && (
            <p className="text-sm text-destructive sm:col-span-2">{error}</p>
          )}

          <div className="sm:col-span-2 flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Saving..." : "Log Bet"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
