"use client";

import { useState, useEffect, useCallback } from "react";
import { BetForm } from "./BetForm";
import { BetCharts } from "./BetCharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatOdds } from "@/lib/utils/calculations";
import { formatCurrency, formatShortDate } from "@/lib/utils/formatting";
import {
  calculateROI,
  calculateCLV,
  calculateUnits,
} from "@/lib/utils/calculations";
import type { Bet } from "@/lib/supabase/types";
import {
  Plus,
  Trash2,
  TrendingUp,
  DollarSign,
  Target,
  BarChart3,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function BetTracker() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const fetchBets = useCallback(async () => {
    try {
      const res = await fetch("/api/bets");
      if (res.ok) {
        const { bets } = await res.json();
        setBets(bets || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBets();
  }, [fetchBets]);

  function handleBetAdded(bet: Bet) {
    setBets((prev) => [bet, ...prev]);
    setShowForm(false);
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/bets?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setBets((prev) => prev.filter((b) => b.id !== id));
    }
  }

  async function handleResultChange(id: string, result: string) {
    const res = await fetch("/api/bets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, result }),
    });
    if (res.ok) {
      const { bet } = await res.json();
      setBets((prev) => prev.map((b) => (b.id === id ? bet : b)));
    }
  }

  // Stats
  const settled = bets.filter((b) => b.result && b.result !== "pending");
  const wins = settled.filter((b) => b.result === "win");
  const totalStaked = settled.reduce((sum, b) => sum + Number(b.stake), 0);
  const totalPL = settled.reduce((sum, b) => sum + (Number(b.profit_loss) || 0), 0);
  const roi = calculateROI(totalPL, totalStaked);
  const winRate = settled.length > 0 ? (wins.length / settled.length) * 100 : 0;
  const units = calculateUnits(totalPL);

  // CLV for bets with closing lines
  const clvBets = settled.filter((b) => b.closing_line !== null);
  const avgCLV =
    clvBets.length > 0
      ? clvBets.reduce((sum, b) => sum + calculateCLV(b.odds, b.closing_line!), 0) /
        clvBets.length
      : 0;

  // Filtered bets
  const filteredBets =
    filter === "all" ? bets : bets.filter((b) => b.sport === filter);

  const sports = Array.from(new Set(bets.map((b) => b.sport)));

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<DollarSign className="h-4 w-4 text-primary" />}
          label="Total P/L"
          value={formatCurrency(totalPL)}
          color={totalPL >= 0 ? "text-emerald-400" : "text-red-400"}
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4 text-emerald-400" />}
          label="ROI"
          value={`${roi >= 0 ? "+" : ""}${roi.toFixed(1)}%`}
          color={roi >= 0 ? "text-emerald-400" : "text-red-400"}
        />
        <StatCard
          icon={<Target className="h-4 w-4 text-amber-400" />}
          label="Win Rate"
          value={`${winRate.toFixed(0)}%`}
          sub={`${wins.length}/${settled.length}`}
        />
        <StatCard
          icon={<BarChart3 className="h-4 w-4 text-blue-400" />}
          label="Units"
          value={`${units >= 0 ? "+" : ""}${units.toFixed(1)}u`}
          color={units >= 0 ? "text-emerald-400" : "text-red-400"}
          sub={avgCLV !== 0 ? `CLV: ${avgCLV >= 0 ? "+" : ""}${avgCLV.toFixed(1)}%` : undefined}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Log Bet
        </Button>
        {bets.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCharts(!showCharts)}
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            {showCharts ? "Hide Charts" : "Show Charts"}
          </Button>
        )}
        {sports.length > 1 && (
          <div className="flex gap-1 ml-auto">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "px-2 py-1 rounded text-xs font-medium",
                filter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              )}
            >
              All
            </button>
            {sports.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={cn(
                  "px-2 py-1 rounded text-xs font-medium",
                  filter === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bet form */}
      {showForm && (
        <BetForm
          onSubmit={handleBetAdded}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Charts */}
      {showCharts && bets.length > 0 && <BetCharts bets={bets} />}

      {/* Bets table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filteredBets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <TrendingUp className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No bets logged yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Click &quot;Log Bet&quot; to start tracking
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              Bet History ({filteredBets.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-xs">
                    <th className="text-left px-4 py-2 font-medium">Date</th>
                    <th className="text-left px-4 py-2 font-medium">Game</th>
                    <th className="text-left px-4 py-2 font-medium">Pick</th>
                    <th className="text-right px-4 py-2 font-medium">Odds</th>
                    <th className="text-right px-4 py-2 font-medium">Stake</th>
                    <th className="text-center px-4 py-2 font-medium">Result</th>
                    <th className="text-right px-4 py-2 font-medium">P/L</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBets.map((bet) => (
                    <tr
                      key={bet.id}
                      className="border-b border-border/50 hover:bg-secondary/30"
                    >
                      <td className="px-4 py-2 text-xs text-muted-foreground whitespace-nowrap">
                        {formatShortDate(bet.game_date)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div>
                          <span className="font-medium text-xs">
                            {bet.game_description}
                          </span>
                          <Badge
                            variant="secondary"
                            className="ml-2 text-[10px] px-1 py-0"
                          >
                            {bet.sport}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-xs">
                        <span>{bet.selection}</span>
                        <Badge
                          variant="outline"
                          className="ml-1 text-[10px] px-1 py-0"
                        >
                          {bet.bet_type}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 text-right font-mono text-xs">
                        {formatOdds(bet.odds)}
                      </td>
                      <td className="px-4 py-2 text-right font-mono text-xs">
                        {formatCurrency(Number(bet.stake))}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <select
                          value={bet.result || "pending"}
                          onChange={(e) =>
                            handleResultChange(bet.id, e.target.value)
                          }
                          className={cn(
                            "text-xs font-medium rounded px-1.5 py-0.5 border-0 bg-transparent",
                            bet.result === "win" && "text-emerald-400",
                            bet.result === "loss" && "text-red-400",
                            bet.result === "push" && "text-amber-400",
                            bet.result === "pending" && "text-muted-foreground"
                          )}
                        >
                          <option value="pending">Pending</option>
                          <option value="win">Win</option>
                          <option value="loss">Loss</option>
                          <option value="push">Push</option>
                        </select>
                      </td>
                      <td
                        className={cn(
                          "px-4 py-2 text-right font-mono text-xs font-medium",
                          (Number(bet.profit_loss) || 0) > 0 && "text-emerald-400",
                          (Number(bet.profit_loss) || 0) < 0 && "text-red-400"
                        )}
                      >
                        {bet.profit_loss !== null
                          ? formatCurrency(Number(bet.profit_loss))
                          : "—"}
                      </td>
                      <td className="px-4 py-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleDelete(bet.id)}
                        >
                          <Trash2 className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: string;
  sub?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-secondary">{icon}</div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={cn("text-lg font-bold", color)}>{value}</p>
            {sub && (
              <p className="text-[10px] text-muted-foreground">{sub}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
