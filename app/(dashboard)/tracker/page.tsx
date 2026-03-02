import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function TrackerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bet Tracker</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Log, track, and analyze your betting performance
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Bets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              Bet tracking will be available in Phase 4
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
