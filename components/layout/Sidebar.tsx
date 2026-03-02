"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  TrendingUp,
  Swords,
  Settings,
  Zap,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Bet Tracker",
    href: "/tracker",
    icon: TrendingUp,
  },
  {
    name: "UFC",
    href: "/ufc",
    icon: Swords,
    pro: true,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 border-r border-border bg-card">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-border">
        <Zap className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold">EdgeFinder</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.name}
              {item.pro && (
                <span className="ml-auto text-[10px] font-semibold bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                  PRO
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
          <p className="text-xs font-medium text-primary">Upgrade to Pro</p>
          <p className="text-xs text-muted-foreground mt-1">
            Unlimited AI analysis, UFC module & more
          </p>
          <Link
            href="/settings"
            className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
          >
            $29/mo &rarr;
          </Link>
        </div>
      </div>
    </aside>
  );
}
