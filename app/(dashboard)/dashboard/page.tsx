export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { GamesDashboard } from "@/components/features/GamesDashboard";
import { TrendingUp, BarChart3, Zap, Target } from "lucide-react";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single();

  const dailyUsed = profile?.daily_analysis_count ?? 0;
  const dailyLimit = profile?.tier === "pro" ? "Unlimited" : "3";

  // Get bet stats
  const { count: totalBets } = await supabase
    .from("bets")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user?.id ?? "");

  const { data: winBets } = await supabase
    .from("bets")
    .select("id")
    .eq("user_id", user?.id ?? "")
    .eq("result", "win");

  const winRate =
    totalBets && totalBets > 0 && winBets
      ? `${((winBets.length / totalBets) * 100).toFixed(0)}%`
      : "--";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">Game Research</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Live odds, line movement & AI-powered analysis
          </p>
        </div>
        <Badge variant={profile?.tier === "pro" ? "default" : "secondary"}>
          {profile?.tier === "pro" ? "PRO" : "FREE"} &middot; {dailyUsed}/
          {dailyLimit} analyses today
        </Badge>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Bets</p>
                <p className="text-lg font-bold">{totalBets ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Target className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Win Rate</p>
                <p className="text-lg font-bold">{winRate}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Zap className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Analyses Today</p>
                <p className="text-lg font-bold">{dailyUsed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <BarChart3 className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Daily Limit</p>
                <p className="text-lg font-bold">{dailyLimit}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Games dashboard with tabs, live odds, and game cards */}
      <GamesDashboard />
    </div>
  );
}
