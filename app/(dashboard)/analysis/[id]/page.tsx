export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import { ConfidenceMeterServer } from "@/components/features/ConfidenceMeterServer";

export default async function AnalysisPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: analysis } = await supabase
    .from("analyses")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!analysis) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Analysis not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const content = analysis.analysis_content as {
    raw?: string;
    summary?: string;
    edges?: string;
    lineMovement?: string;
    recommendation?: string;
    hiddenFactors?: string;
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <Card className="border-primary/30">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">
                {analysis.away_team} @ {analysis.home_team}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge>{analysis.sport}</Badge>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {new Date(analysis.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis.confidence_score && (
            <ConfidenceMeterServer score={analysis.confidence_score} />
          )}

          {/* Render raw analysis as formatted text */}
          {content.raw && (
            <div className="space-y-1">
              {content.raw.split("\n").map((line: string, i: number) => {
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
                    <p
                      key={i}
                      className="text-sm text-muted-foreground ml-3 my-0.5"
                    >
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
