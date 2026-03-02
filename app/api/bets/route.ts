import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { calculateProfitLoss } from "@/lib/utils/calculations";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: bets, error } = await supabase
    .from("bets")
    .select("*")
    .eq("user_id", user.id)
    .order("game_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ bets });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { sport, game_description, bet_type, selection, odds, stake, game_date, result, closing_line, notes } = body;

  if (!sport || !game_description || !bet_type || !selection || odds === undefined || !stake || !game_date) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  let profit_loss = null;
  if (result && result !== "pending") {
    profit_loss = calculateProfitLoss(stake, odds, result);
  }

  const { data, error } = await supabase
    .from("bets")
    .insert({
      user_id: user.id,
      sport,
      game_description,
      bet_type,
      selection,
      odds,
      stake,
      game_date,
      result: result || "pending",
      profit_loss,
      closing_line: closing_line || null,
      notes: notes || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ bet: data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, result, closing_line, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing bet id" }, { status: 400 });
  }

  // Calculate profit/loss if result is being set
  const updateData: Record<string, unknown> = { ...updates };
  if (result) {
    updateData.result = result;
    // Get the bet to calculate P/L
    const { data: existing } = await supabase
      .from("bets")
      .select("odds, stake")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (existing && result !== "pending") {
      updateData.profit_loss = calculateProfitLoss(
        existing.stake,
        existing.odds,
        result
      );
    }
  }
  if (closing_line !== undefined) {
    updateData.closing_line = closing_line;
  }

  const { data, error } = await supabase
    .from("bets")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ bet: data });
}

export async function DELETE(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing bet id" }, { status: 400 });
  }

  const { error } = await supabase
    .from("bets")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}
