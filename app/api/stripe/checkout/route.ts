import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/api/stripe";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id, email, tier")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (profile.tier === "pro") {
      return NextResponse.json(
        { error: "Already on Pro plan" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;

    if (!priceId || priceId === "placeholder") {
      return NextResponse.json(
        { error: "Stripe price ID not configured. Set NEXT_PUBLIC_STRIPE_PRICE_ID in .env.local" },
        { status: 500 }
      );
    }

    // Get or create Stripe customer
    let customerId = profile.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email ?? user.email ?? undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?cancelled=true`,
      metadata: { supabase_user_id: user.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Checkout failed" },
      { status: 500 }
    );
  }
}
