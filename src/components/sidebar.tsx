"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  PenTool,
  Trophy,
  Settings,
  LogOut,
  Shield,
} from "lucide-react";
import type { Database } from "@/types/database";

type User = Database["public"]["Tables"]["users"]["Row"];

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/engage", label: "Engage", icon: MessageSquare },
  { href: "/people", label: "People", icon: Users },
  { href: "/posting", label: "Posting", icon: PenTool },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

export function Sidebar({ user }: { user: User | null }) {
  const pathname = usePathname();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "?";

  return (
    <aside className="hidden lg:flex fixed top-0 left-0 flex-col w-60 h-screen border-r border-border bg-background z-30">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-border">
        <Link href="/" className="text-sm font-semibold tracking-tight hover:text-muted-foreground transition-colors">
          ← Collision
        </Link>
      </div>

      {/* User */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-medium text-white/70">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate text-foreground">{user?.name}</p>
            <p className="text-[10px] text-muted-foreground">{user?.xp} XP · {user?.streak}d streak</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors",
                isActive
                  ? "bg-white/[0.08] text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

        {user?.role === "admin" && (
          <>
            <div className="pt-4 pb-1.5">
              <p className="px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                Admin
              </p>
            </div>
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors",
                pathname.startsWith("/admin")
                  ? "bg-white/[0.08] text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
              )}
            >
              <Shield className="h-4 w-4" />
              Command Center
            </Link>
          </>
        )}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-3 border-t border-border space-y-0.5">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors",
            pathname === "/settings"
              ? "bg-white/[0.08] text-foreground font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
