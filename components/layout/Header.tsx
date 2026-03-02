"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import type { Profile } from "@/lib/supabase/types";

export function Header() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);

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
        if (data) setProfile(data as Profile);
      }
    }
    loadProfile();
  }, [supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : profile?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <Zap className="h-5 w-5 text-primary" />
        <span className="text-lg font-bold">EdgeFinder</span>
      </div>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        {profile?.tier === "pro" && (
          <span className="text-xs font-semibold bg-primary/20 text-primary px-2 py-1 rounded-full">
            PRO
          </span>
        )}
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            {profile?.avatar_url && (
              <AvatarImage src={profile.avatar_url} alt={profile.full_name ?? ""} />
            )}
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden sm:block text-sm text-muted-foreground">
            {profile?.full_name ?? profile?.email ?? ""}
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
