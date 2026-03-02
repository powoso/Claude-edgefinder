import { NextResponse } from "next/server";

// Phase 2: The Odds API proxy
export async function GET() {
  return NextResponse.json(
    { message: "Odds API endpoint — coming in Phase 2" },
    { status: 501 }
  );
}
