import { NextResponse } from "next/server";

// Phase 6: Stripe webhook handler
export async function POST() {
  return NextResponse.json(
    { message: "Stripe webhook — coming in Phase 6" },
    { status: 501 }
  );
}
