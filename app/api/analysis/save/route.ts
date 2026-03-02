import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { extractConfidenceScore, parseAnalysisSections } from "@/lib/api/claude";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      eventId,
      sport,
      homeTeam,
      awayTeam,
      analysisContent,
      confidenceScore: providedScore,
      oddsSnapshot,
    } = body;

    if (!eventId || !sport || !homeTeam || !awayTeam || !analysisContent) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const parsedSections = parseAnalysisSections(analysisContent);
    const score = providedScore || extractConfidenceScore(analysisContent);

    const { data, error } = await supabase
      .from("analyses")
      .insert({
        user_id: user.id,
        sport,
        event_id: eventId,
        home_team: homeTeam,
        away_team: awayTeam,
        analysis_content: {
          raw: analysisContent,
          ...parsedSections,
        },
        confidence_score: score,
        odds_snapshot: oddsSnapshot || {},
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to save analysis" },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: data.id, saved: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to save analysis" },
      { status: 500 }
    );
  }
}
