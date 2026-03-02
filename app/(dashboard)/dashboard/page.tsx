export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SPORTS } from "@/lib/utils/constants";
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
                <p className="text-xs text-muted-foreground">Live Games</p>
                <p className="text-lg font-bold">--</p>
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
                <p className="text-xs text-muted-foreground">Edges Found</p>
                <p className="text-lg font-bold">--</p>
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
                <p className="text-xs text-muted-foreground">Analyses</p>
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
                <p className="text-xs text-muted-foreground">Win Rate</p>
                <p className="text-lg font-bold">--</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sport tabs placeholder */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {SPORTS.map((sport) => (
          <button
            key={sport.key}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors whitespace-nowrap"
          >
            {sport.label}
          </button>
        ))}
      </div>

      {/* Games placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upcoming Games</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              Live odds and games will appear here in Phase 2
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Connect The Odds API to start seeing live data
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
