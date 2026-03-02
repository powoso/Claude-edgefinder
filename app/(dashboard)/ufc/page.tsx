import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Swords } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function UFCPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">UFC Module</h1>
        <Badge>PRO</Badge>
      </div>
      <p className="text-muted-foreground text-sm">
        Fighter profiles, matchup breakdowns & AI-powered fight analysis
      </p>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Fighter Matchups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Swords className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              UFC module will be available in Phase 5
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
