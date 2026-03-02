import { createClient } from "@/lib/supabase/server";
import {
  buildAnalysisPrompt,
  createAnalysisStream,
  type AnalysisInput,
} from "@/lib/api/claude";
import { TIER_LIMITS } from "@/lib/utils/constants";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check daily limit
    const { data: profile } = await supabase
      .from("profiles")
      .select("tier, daily_analysis_count, daily_analysis_reset_at")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const tier = (profile.tier as "free" | "pro") ?? "free";
    let dailyCount = profile.daily_analysis_count ?? 0;

    // Reset daily count if it's a new day
    const resetAt = new Date(profile.daily_analysis_reset_at);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (resetAt < today) {
      dailyCount = 0;
      await supabase
        .from("profiles")
        .update({
          daily_analysis_count: 0,
          daily_analysis_reset_at: new Date().toISOString(),
        })
        .eq("id", user.id);
    }

    const limit = TIER_LIMITS[tier].dailyAnalyses;
    if (dailyCount >= limit) {
      return new Response(
        JSON.stringify({
          error: "Daily analysis limit reached",
          limit,
          used: dailyCount,
          tier,
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    const body = (await request.json()) as {
      game: AnalysisInput;
      eventId: string;
    };

    if (!body.game || !body.eventId) {
      return new Response(
        JSON.stringify({ error: "Missing game data or eventId" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Build prompt and stream
    const prompt = buildAnalysisPrompt(body.game);
    const result = createAnalysisStream(prompt);

    // Increment daily count
    await supabase
      .from("profiles")
      .update({ daily_analysis_count: dailyCount + 1 })
      .eq("id", user.id);

    // Return streaming response using Vercel AI SDK
    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Analysis error:", error);
    const message =
      error instanceof Error ? error.message : "Analysis failed";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
