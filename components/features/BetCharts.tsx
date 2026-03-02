"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format, parseISO, startOfMonth, eachMonthOfInterval } from "date-fns";
import type { Bet } from "@/lib/supabase/types";

interface BetChartsProps {
  bets: Bet[];
}

export function BetCharts({ bets }: BetChartsProps) {
  const settled = useMemo(
    () =>
      bets
        .filter((b) => b.result && b.result !== "pending" && b.profit_loss !== null)
        .sort(
          (a, b) =>
            new Date(a.game_date).getTime() - new Date(b.game_date).getTime()
        ),
    [bets]
  );

  // Cumulative P/L over time
  const cumulativePL = useMemo(() => {
    let running = 0;
    return settled.map((bet) => {
      running += Number(bet.profit_loss) || 0;
      return {
        date: format(parseISO(bet.game_date), "MMM d"),
        pl: parseFloat(running.toFixed(2)),
        game: bet.game_description,
      };
    });
  }, [settled]);

  // Monthly P/L
  const monthlyPL = useMemo(() => {
    if (settled.length === 0) return [];

    const dates = settled.map((b) => parseISO(b.game_date));
    const months = eachMonthOfInterval({
      start: startOfMonth(dates[0]),
      end: startOfMonth(dates[dates.length - 1]),
    });

    return months.map((month) => {
      const monthStr = format(month, "yyyy-MM");
      const monthBets = settled.filter(
        (b) => format(parseISO(b.game_date), "yyyy-MM") === monthStr
      );
      const pl = monthBets.reduce(
        (sum, b) => sum + (Number(b.profit_loss) || 0),
        0
      );
      return {
        month: format(month, "MMM yy"),
        pl: parseFloat(pl.toFixed(2)),
        bets: monthBets.length,
      };
    });
  }, [settled]);

  // Win/loss by sport
  const sportBreakdown = useMemo(() => {
    const map: Record<string, { wins: number; losses: number; pushes: number }> = {};
    settled.forEach((b) => {
      if (!map[b.sport]) map[b.sport] = { wins: 0, losses: 0, pushes: 0 };
      if (b.result === "win") map[b.sport].wins++;
      else if (b.result === "loss") map[b.sport].losses++;
      else if (b.result === "push") map[b.sport].pushes++;
    });
    return Object.entries(map).map(([sport, data]) => ({
      sport,
      ...data,
      total: data.wins + data.losses + data.pushes,
    }));
  }, [settled]);

  // Bet type distribution
  const betTypeDist = useMemo(() => {
    const map: Record<string, number> = {};
    bets.forEach((b) => {
      map[b.bet_type] = (map[b.bet_type] || 0) + 1;
    });
    return Object.entries(map).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count,
    }));
  }, [bets]);

  if (settled.length < 2) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Need at least 2 settled bets to show charts
          </p>
        </CardContent>
      </Card>
    );
  }

  const COLORS = ["hsl(239, 84%, 67%)", "hsl(142, 71%, 45%)", "hsl(43, 96%, 56%)", "hsl(0, 84%, 60%)"];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Cumulative P/L */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Cumulative P/L</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={cumulativePL}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 15%, 18%)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "hsl(220, 10%, 55%)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "hsl(220, 10%, 55%)" }}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(228, 18%, 14%)",
                  border: "1px solid hsl(228, 15%, 22%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "hsl(220, 20%, 95%)" }}
                formatter={(value) => [`$${Number(value).toFixed(2)}`, "P/L"]}
              />
              <Line
                type="monotone"
                dataKey="pl"
                stroke="hsl(239, 84%, 67%)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly P/L */}
      {monthlyPL.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Monthly P/L</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyPL}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(228, 15%, 18%)"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: "hsl(220, 10%, 55%)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "hsl(220, 10%, 55%)" }}
                  tickLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(228, 18%, 14%)",
                    border: "1px solid hsl(228, 15%, 22%)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [`$${Number(value).toFixed(2)}`, "P/L"]}
                />
                <Bar
                  dataKey="pl"
                  fill="hsl(239, 84%, 67%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Bet Type Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Bet Types</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={betTypeDist}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name} (${value})`}
                labelLine={false}
              >
                {betTypeDist.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(228, 18%, 14%)",
                  border: "1px solid hsl(228, 15%, 22%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sport Breakdown */}
      {sportBreakdown.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Performance by Sport</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sportBreakdown.map((s) => {
                const pct = s.total > 0 ? (s.wins / s.total) * 100 : 0;
                return (
                  <div key={s.sport} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">{s.sport}</span>
                      <span className="text-muted-foreground">
                        {s.wins}W-{s.losses}L
                        {s.pushes > 0 ? `-${s.pushes}P` : ""} ({pct.toFixed(0)}
                        %)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-secondary overflow-hidden flex">
                      <div
                        className="h-full bg-emerald-500"
                        style={{
                          width: `${s.total > 0 ? (s.wins / s.total) * 100 : 0}%`,
                        }}
                      />
                      <div
                        className="h-full bg-red-500"
                        style={{
                          width: `${s.total > 0 ? (s.losses / s.total) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
