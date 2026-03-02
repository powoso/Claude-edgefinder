import { NextRequest, NextResponse } from "next/server";
import { getUpcomingGames, parseGameOdds } from "@/lib/api/odds";
import { SPORTS } from "@/lib/utils/constants";

export async function GET(request: NextRequest) {
  const sport = request.nextUrl.searchParams.get("sport");

  if (!sport || !SPORTS.some((s) => s.key === sport)) {
    return NextResponse.json(
      { error: "Invalid or missing sport parameter" },
      { status: 400 }
    );
  }

  try {
    const games = await getUpcomingGames(sport);
    const parsed = games.map(parseGameOdds);

    // Sort by commence time (soonest first)
    parsed.sort(
      (a, b) =>
        new Date(a.commenceTime).getTime() -
        new Date(b.commenceTime).getTime()
    );

    return NextResponse.json({
      games: parsed,
      count: parsed.length,
      sport,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch odds";

    // Return empty games array with demo flag if API key is placeholder
    if (
      message.includes("ODDS_API_KEY") ||
      message.includes("401") ||
      message.includes("403")
    ) {
      return NextResponse.json({
        games: [],
        count: 0,
        sport,
        demo: true,
        message:
          "Set a valid ODDS_API_KEY in .env.local to see live odds",
      });
    }

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
