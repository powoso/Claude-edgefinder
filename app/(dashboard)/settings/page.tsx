"use client";

import { useState, useEffect } from "react";
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
import type { Profile } from "@/lib/supabase/types";

export default function SettingsPage() {
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your account and subscription
        </p>
      </div>

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
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                You have unlimited AI analyses, full UFC module access, and bet
                tracker export.
              </p>
              <Button variant="outline" disabled>
                Manage subscription (coming in Phase 6)
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
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
                  <li>Unlimited AI analyses</li>
                  <li>Full UFC module with fighter breakdowns</li>
                  <li>Bet tracker CSV export</li>
                  <li>Priority support</li>
                </ul>
                <Button className="mt-3" disabled>
                  Upgrade (coming in Phase 6)
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
