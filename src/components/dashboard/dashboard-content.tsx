"use client";

import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import {
  Flame,
  Zap,
  Target,
  MessageSquare,
  Users,
  PenTool,
  Trophy,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import type { Database } from "@/types/database";

type User = Database["public"]["Tables"]["users"]["Row"];
type EngagementTask = Database["public"]["Tables"]["engagement_tasks"]["Row"];
type PeopleTask = Database["public"]["Tables"]["people_tasks"]["Row"];
type PostBrief = Database["public"]["Tables"]["post_briefs"]["Row"];
type Narrative = Database["public"]["Tables"]["narratives"]["Row"];
type Submission = Database["public"]["Tables"]["submissions"]["Row"];

interface DashboardContentProps {
  profile: User | null;
  engagementTasks: EngagementTask[];
  peopleTasks: PeopleTask[];
  postBriefs: PostBrief[];
  narrative: Narrative | null;
  todaySubmissions: Submission[];
  leaderboard: Pick<User, "id" | "name" | "xp" | "streak" | "level">[];
}

const levelThresholds: Record<string, number> = {
  rookie: 0,
  operator: 200,
  growth_agent: 500,
  narrative_captain: 1200,
  ecosystem_lead: 3000,
};

function getLevelProgress(xp: number, currentLevel: string) {
  const levels = Object.entries(levelThresholds);
  const currentIdx = levels.findIndex(([l]) => l === currentLevel);
  if (currentIdx >= levels.length - 1) return 100;
  const currentThreshold = levels[currentIdx][1];
  const nextThreshold = levels[currentIdx + 1][1];
  return Math.min(100, Math.round(((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100));
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
} as const;

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
} as const;

export function DashboardContent({
  profile,
  engagementTasks,
  peopleTasks,
  postBriefs,
  narrative,
  todaySubmissions,
  leaderboard,
}: DashboardContentProps) {
  const totalMissions = engagementTasks.length + peopleTasks.length + postBriefs.length;
  const completedToday = todaySubmissions.length;
  const completionPercent = totalMissions > 0 ? Math.round((completedToday / totalMissions) * 100) : 0;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 max-w-5xl"
    >
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-semibold tracking-tight">
          {getTimeOfDay()}, {profile?.name?.split(" ")[0]}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here&apos;s your growth overview for today.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between mb-2">
            <Flame className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-semibold tabular-nums">{profile?.streak || 0}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Day streak</p>
        </div>

        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between mb-2">
            <Zap className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-semibold tabular-nums">{profile?.xp || 0}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Total XP</p>
          <div className="mt-2">
            <Progress value={getLevelProgress(profile?.xp || 0, profile?.level || "rookie")} className="h-1" />
          </div>
        </div>

        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between mb-2">
            <Target className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-semibold tabular-nums">{completedToday}/{totalMissions}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Missions today</p>
          <div className="mt-2">
            <Progress value={completionPercent} className="h-1" />
          </div>
        </div>

        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between mb-2">
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-semibold tabular-nums">
            #{leaderboard.findIndex((u) => u.id === profile?.id) + 1 || "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Leaderboard</p>
        </div>
      </motion.div>

      {/* Narrative */}
      {narrative && (
        <motion.div variants={item} className="p-4 rounded-lg border border-border bg-card">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-2">This week&apos;s narrative</p>
          <p className="text-sm font-medium">{narrative.weekly_theme}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Today: {narrative.daily_angle}
          </p>
        </motion.div>
      )}

      {/* Missions grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Engagement */}
        <motion.div variants={item} className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium">Engagement</span>
            </div>
            <Link href="/engage" className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-2">
            {engagementTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground p-3">No active missions</p>
            ) : (
              engagementTasks.slice(0, 3).map((task) => (
                <a key={task.id} href={task.post_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-white/[0.03] transition-colors group">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate group-hover:text-foreground">{task.title}</p>
                    <p className="text-[10px] text-muted-foreground">{task.creator_name} · {task.action_required}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground capitalize">{task.priority}</span>
                </a>
              ))
            )}
          </div>
        </motion.div>

        {/* People */}
        <motion.div variants={item} className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium">People</span>
            </div>
            <Link href="/people" className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-2">
            {peopleTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground p-3">No people missions</p>
            ) : (
              peopleTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-white/[0.03] transition-colors">
                  <div className="h-6 w-6 rounded-full bg-white/[0.06] flex items-center justify-center text-[9px] font-medium text-muted-foreground">
                    {task.name?.split(" ").map((n) => n[0]).join("").toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{task.name}</p>
                    <p className="text-[10px] text-muted-foreground">{task.role_title}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Post Briefs */}
      {postBriefs.length > 0 && (
        <motion.div variants={item} className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <PenTool className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium">Post Briefs</span>
            </div>
            <Link href="/posting" className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-2">
            {postBriefs.map((brief) => (
              <div key={brief.id} className="px-3 py-2.5 rounded-md hover:bg-white/[0.03] transition-colors">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium">{brief.title}</p>
                  <span className="text-[10px] text-muted-foreground capitalize">{brief.objective}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{brief.core_idea}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Leaderboard */}
      <motion.div variants={item} className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Trophy className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium">Top Agents</span>
          </div>
          <Link href="/leaderboard" className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors">
            View all <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="p-2">
          {leaderboard.map((agent, idx) => (
            <div key={agent.id} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/[0.03] transition-colors">
              <span className="text-xs font-medium text-muted-foreground w-4 tabular-nums">{idx + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">
                  {agent.name}
                  {agent.id === profile?.id && <span className="text-muted-foreground ml-1">(you)</span>}
                </p>
              </div>
              <span className="text-[10px] text-muted-foreground tabular-nums">{agent.xp} XP</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}
