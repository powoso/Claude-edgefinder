"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Swords, Lock, Zap, Loader2 } from "lucide-react";
import { UFCDashboard } from "@/components/features/UFCDashboard";
import Link from "next/link";

export default function UFCPage() {
  const supabase = createClient();
  const [tier, setTier] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTier() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("tier")
          .eq("id", user.id)
          .single();
        setTier(data?.tier ?? "free");
      } else {
        setTier("free");
      }
      setLoading(false);
    }
    loadTier();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (tier !== "pro") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Swords className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">UFC Module</h1>
          <Badge>PRO</Badge>
        </div>
        <Card className="max-w-lg">
          <CardContent className="flex flex-col items-center text-center py-12 space-y-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-lg">Pro Feature</p>
              <p className="text-sm text-muted-foreground mt-1">
                The UFC module with fighter profiles, matchup comparisons, and
                AI-powered fight analysis is available on the Pro plan.
              </p>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 text-left">
              <li className="flex items-center gap-2">
                <Zap className="h-3 w-3 text-primary" />
                Fighter stat comparison bars
              </li>
              <li className="flex items-center gap-2">
                <Zap className="h-3 w-3 text-primary" />
                Recent form & fight history
              </li>
              <li className="flex items-center gap-2">
                <Zap className="h-3 w-3 text-primary" />
                AI-powered fighter breakdowns
              </li>
            </ul>
            <Link href="/settings">
              <Button>
                <Zap className="h-4 w-4 mr-2" />
                Upgrade to Pro — $29/mo
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Swords className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">UFC Module</h1>
        <Badge>PRO</Badge>
      </div>
      <p className="text-muted-foreground text-sm">
        Fighter profiles, matchup comparisons & AI-powered fight analysis
      </p>
      <UFCDashboard />
    </div>
  );
}
