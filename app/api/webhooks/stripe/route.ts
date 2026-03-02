import { NextResponse } from "next/server";
import { getStripe } from "@/lib/api/stripe";
import { createServerClient } from "@supabase/ssr";

// Disable body parsing for webhook signature verification
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret || webhookSecret === "placeholder") {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  // Create admin Supabase client for webhook processing
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  );

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.supabase_user_id;
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.toString();

        if (userId) {
          await supabase
            .from("profiles")
            .update({
              tier: "pro",
              stripe_subscription_id: subscriptionId,
            })
            .eq("id", userId);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.toString();

        if (customerId) {
          const isActive =
            subscription.status === "active" ||
            subscription.status === "trialing";

          await supabase
            .from("profiles")
            .update({ tier: isActive ? "pro" : "free" })
            .eq("stripe_customer_id", customerId);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.toString();

        if (customerId) {
          await supabase
            .from("profiles")
            .update({
              tier: "free",
              stripe_subscription_id: null,
            })
            .eq("stripe_customer_id", customerId);
        }
        break;
      }
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
