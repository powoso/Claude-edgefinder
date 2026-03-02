export const dynamic = "force-dynamic";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Zap,
  TrendingUp,
  BarChart3,
  Swords,
  ArrowRight,
  Shield,
  Brain,
} from "lucide-react";

export default async function LandingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">EdgeFinder</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 lg:py-32">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary mb-6">
            <Brain className="h-3 w-3" />
            Powered by Claude AI
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight max-w-3xl mx-auto">
            Find the edge that
            <span className="text-primary"> sharp bettors</span> see
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            AI-powered sports betting research platform. Get real-time odds from
            10+ sportsbooks, track line movement, and get data-driven analysis
            that casual bettors miss.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Start for free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                Sign in
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            3 free AI analyses per day. No credit card required.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-border">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl lg:text-3xl font-bold text-center mb-12">
            Everything you need to bet smarter
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<TrendingUp className="h-6 w-6 text-primary" />}
              title="Live Odds"
              description="Real-time odds from 10+ sportsbooks. Spot the best lines instantly across NFL, NBA, MLB & UFC."
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6 text-emerald-400" />}
              title="Line Movement"
              description="Track how lines move from open to current. Color-coded sharp money indicators show where the smart money is."
            />
            <FeatureCard
              icon={<Brain className="h-6 w-6 text-amber-400" />}
              title="AI Analysis"
              description="One-click deep research on any game. Claude AI analyzes odds, trends, injuries, weather & more."
            />
            <FeatureCard
              icon={<Swords className="h-6 w-6 text-blue-400" />}
              title="UFC Module"
              description="Fighter stats, matchup comparisons, stylistic breakdowns & AI-generated prop bet suggestions."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 border-t border-border">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl lg:text-3xl font-bold text-center mb-12">
            Simple pricing
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-lg font-semibold">Free</h3>
              <p className="text-3xl font-bold mt-2">
                $0<span className="text-sm font-normal text-muted-foreground">/mo</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />3 AI analyses/day
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Live odds from 10+ books
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Line movement tracking
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Basic bet tracker
                </li>
              </ul>
              <Link href="/signup" className="block mt-6">
                <Button variant="outline" className="w-full">
                  Get started
                </Button>
              </Link>
            </div>
            {/* Pro */}
            <div className="rounded-lg border-2 border-primary bg-card p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                MOST POPULAR
              </div>
              <h3 className="text-lg font-semibold">Pro</h3>
              <p className="text-3xl font-bold mt-2">
                $29<span className="text-sm font-normal text-muted-foreground">/mo</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Unlimited AI analyses
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Full UFC module
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Fighter matchup AI
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Bet tracker CSV export
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Priority support
                </li>
              </ul>
              <Link href="/signup" className="block mt-6">
                <Button className="w-full">Start free trial</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">EdgeFinder</span>
          </div>
          <p>For entertainment and research purposes only.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="p-2 rounded-lg bg-secondary w-fit">{icon}</div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
