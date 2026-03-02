"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Zap, CreditCard, Loader2, CheckCircle2 } from "lucide-react";
import type { Profile } from "@/lib/supabase/types";

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const [managingPortal, setManagingPortal] = useState(false);

  const upgraded = searchParams.get("upgraded") === "true";

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (data) {
          const p = data as Profile;
          setProfile(p);
          setFullName(p.full_name ?? "");
        }
      }
    }
    loadProfile();
  }, [supabase]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", profile.id);

    if (error) {
      setMessage("Failed to save changes");
    } else {
      setMessage("Changes saved");
    }
    setSaving(false);
  }

  async function handleUpgrade() {
    setUpgrading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to start checkout");
        setUpgrading(false);
      }
    } catch {
      alert("Failed to start checkout");
      setUpgrading(false);
    }
  }

  async function handleManageSubscription() {
    setManagingPortal(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to open portal");
        setManagingPortal(false);
      }
    } catch {
      alert("Failed to open portal");
      setManagingPortal(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your account and subscription
        </p>
      </div>

      {/* Success banner */}
      {upgraded && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <div>
            <p className="font-medium text-sm text-emerald-400">
              Welcome to Pro!
            </p>
            <p className="text-xs text-muted-foreground">
              You now have unlimited AI analyses and full UFC module access.
            </p>
          </div>
        </div>
      )}

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile</CardTitle>
          <CardDescription>Update your account details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile?.email ?? ""}
                disabled
                className="opacity-60"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            {message && (
              <p className="text-sm text-muted-foreground">{message}</p>
            )}
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Subscription */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Subscription</CardTitle>
              <CardDescription>Manage your plan</CardDescription>
            </div>
            <Badge
              variant={profile?.tier === "pro" ? "default" : "secondary"}
            >
              {profile?.tier === "pro" ? "PRO" : "FREE"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {profile?.tier === "pro" ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <Zap className="h-5 w-5 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Pro Plan — $29/month</p>
                  <p className="text-muted-foreground mt-1">
                    Unlimited AI analyses, full UFC module, bet tracker export
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleManageSubscription}
                disabled={managingPortal}
              >
                {managingPortal ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4 mr-2" />
                )}
                Manage subscription
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Free plan includes:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>3 AI analyses per day</li>
                  <li>Live odds from 10+ sportsbooks</li>
                  <li>Basic bet tracking</li>
                </ul>
              </div>
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                <p className="font-medium text-sm">
                  Upgrade to Pro — $29/month
                </p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  <li className="flex items-center gap-2">
                    <Zap className="h-3 w-3 text-primary" />
                    Unlimited AI analyses
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="h-3 w-3 text-primary" />
                    Full UFC module with fighter breakdowns
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="h-3 w-3 text-primary" />
                    Bet tracker CSV export
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="h-3 w-3 text-primary" />
                    Priority support
                  </li>
                </ul>
                <Button
                  className="mt-3 w-full"
                  onClick={handleUpgrade}
                  disabled={upgrading}
                >
                  {upgrading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  {upgrading ? "Starting checkout..." : "Upgrade to Pro"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
