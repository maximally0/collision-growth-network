"use client";

import { motion } from "framer-motion";
import { BookOpen, Mail, ArrowRight, LogOut, Lock, TrendingUp } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type User = Database["public"]["Tables"]["users"]["Row"];

interface HubPageProps {
  user: User | null;
  authEmail: string;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const } },
};

export function HubPage({ user, authEmail }: HubPageProps) {
  const supabase = createClient();
  const isAdminOrCaptain = user?.role === "admin" || user?.role === "captain";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold tracking-tight">Collision</span>
          <span className="text-xs text-muted-foreground">/ {user?.name}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="w-full max-w-3xl"
        >
          {/* Welcome */}
          <motion.div variants={item} className="text-center mb-12">
            <h1 className="text-3xl font-semibold tracking-tight">
              Welcome back, {user?.name?.split(" ")[0]}
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Choose where you want to go.
            </p>
          </motion.div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* LinkedIn Growth */}
            <motion.div variants={item}>
              <Link
                href="/dashboard"
                className="group block p-6 rounded-xl border border-border bg-card hover:border-white/20 hover:bg-white/[0.02] transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-blue-400" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h2 className="text-sm font-semibold mb-1">LinkedIn Growth</h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Engagement missions, posting briefs, people to connect with, and your growth dashboard.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-medium">
                    {user?.xp || 0} XP
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-muted-foreground font-medium">
                    {user?.streak || 0}d streak
                  </span>
                </div>
              </Link>
            </motion.div>

            {/* Founder's Notes */}
            <motion.div variants={item}>
              <Link
                href="/notes"
                className="group block p-6 rounded-xl border border-border bg-card hover:border-white/20 hover:bg-white/[0.02] transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-amber-400" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h2 className="text-sm font-semibold mb-1">Founder&apos;s Notes</h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Thoughts, updates, and lessons from the founder. Read the latest on where we&apos;re headed.
                </p>
                <div className="mt-4">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-medium">
                    Public
                  </span>
                </div>
              </Link>
            </motion.div>

            {/* Cold Email Tracker */}
            <motion.div variants={item}>
              {isAdminOrCaptain ? (
                <Link
                  href="/cold-emails"
                  className="group block p-6 rounded-xl border border-border bg-card hover:border-white/20 hover:bg-white/[0.02] transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-emerald-400" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h2 className="text-sm font-semibold mb-1">Cold Email Tracker</h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Track outreach, follow-ups, and meetings booked. Simple pipeline for cold emails.
                  </p>
                  <div className="mt-4">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">
                      Captains & Admins
                    </span>
                  </div>
                </Link>
              ) : (
                <div className="block p-6 rounded-xl border border-border bg-card opacity-50 cursor-not-allowed">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-emerald-400" />
                    </div>
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <h2 className="text-sm font-semibold mb-1">Cold Email Tracker</h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Track outreach, follow-ups, and meetings booked. Simple pipeline for cold emails.
                  </p>
                  <div className="mt-4">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-muted-foreground font-medium">
                      Captains & Admins only
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
