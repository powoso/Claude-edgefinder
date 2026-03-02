import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";

export default function AnalysisPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">AI Analysis</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Analysis Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Zap className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              AI analysis view will be available in Phase 3
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
