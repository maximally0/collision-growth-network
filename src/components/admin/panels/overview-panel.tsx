"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Inbox,
  Crosshair,
  Users,
  Sparkles,
  PenTool,
  TrendingUp,
  Flame,
  ArrowRight,
} from "lucide-react";
import type { Database } from "@/types/database";

type Submission = Database["public"]["Tables"]["submissions"]["Row"];
type User = Database["public"]["Tables"]["users"]["Row"];
type EngagementTask = Database["public"]["Tables"]["engagement_tasks"]["Row"];
type PeopleTask = Database["public"]["Tables"]["people_tasks"]["Row"];
type Narrative = Database["public"]["Tables"]["narratives"]["Row"];
type PostBrief = Database["public"]["Tables"]["post_briefs"]["Row"];

interface OverviewPanelProps {
  submissions: Submission[];
  users: User[];
  engagementTasks: EngagementTask[];
  peopleTasks: PeopleTask[];
  narratives: Narrative[];
  postBriefs: PostBrief[];
  onNavigate: (section: string) => void;
}

export function OverviewPanel({
  submissions,
  users,
  engagementTasks,
  peopleTasks,
  narratives,
  postBriefs,
  onNavigate,
}: OverviewPanelProps) {
  const activeNarrative = narratives.find((n) => n.active);
  const topAgents = users.slice(0, 5);
  const totalXP = users.reduce((sum, u) => sum + (u.xp || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Network health at a glance
        </p>
      </div>

      {/* Metric grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button onClick={() => onNavigate("reviews")} className="text-left">
          <Card className="border-border/40 hover:border-orange-500/40 transition-colors cursor-pointer group">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center justify-between mb-3">
                <Inbox className="h-4 w-4 text-orange-400" />
                <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-2xl font-bold">{submissions.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Pending reviews</p>
            </CardContent>
          </Card>
        </button>

        <button onClick={() => onNavigate("users")} className="text-left">
          <Card className="border-border/40 hover:border-primary/40 transition-colors cursor-pointer group">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center justify-between mb-3">
                <Users className="h-4 w-4 text-primary" />
                <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Growth agents</p>
            </CardContent>
          </Card>
        </button>

        <button onClick={() => onNavigate("missions")} className="text-left">
          <Card className="border-border/40 hover:border-blue-500/40 transition-colors cursor-pointer group">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center justify-between mb-3">
                <Crosshair className="h-4 w-4 text-blue-400" />
                <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-2xl font-bold">{engagementTasks.filter((t) => !t.archived).length + peopleTasks.filter((t) => !t.archived).length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Active missions</p>
            </CardContent>
          </Card>
        </button>

        <Card className="border-border/40">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="h-4 w-4 text-green-400" />
            </div>
            <p className="text-2xl font-bold">{totalXP.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total XP earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Active narrative */}
      {activeNarrative && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Active Narrative</span>
          </div>
          <p className="text-base font-semibold">{activeNarrative.monthly_theme}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
            <div className="text-sm">
              <span className="text-muted-foreground">Weekly:</span>{" "}
              <span className="text-foreground">{activeNarrative.weekly_theme}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Today:</span>{" "}
              <span className="text-foreground">{activeNarrative.daily_angle}</span>
            </div>
          </div>
        </div>
      )}

      {/* Top agents */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Top Agents</h2>
          <button onClick={() => onNavigate("users")} className="text-xs text-primary hover:underline">
            View all →
          </button>
        </div>
        <div className="space-y-2">
          {topAgents.map((agent, idx) => (
            <div key={agent.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
              <span className="text-sm font-bold text-muted-foreground w-5">{idx + 1}</span>
              <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-bold text-primary">
                {agent.name?.split(" ").map((n) => n[0]).join("").toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{agent.name}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Flame className="h-3 w-3 text-orange-400" />{agent.streak}</span>
                <span className="font-semibold text-foreground">{agent.xp} XP</span>
              </div>
              <Badge variant="secondary" className="text-[10px] capitalize">{agent.role}</Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-secondary/30 p-4 text-center">
          <p className="text-lg font-bold">{postBriefs.length}</p>
          <p className="text-xs text-muted-foreground">Post briefs</p>
        </div>
        <div className="rounded-lg bg-secondary/30 p-4 text-center">
          <p className="text-lg font-bold">{narratives.length}</p>
          <p className="text-xs text-muted-foreground">Narratives</p>
        </div>
        <div className="rounded-lg bg-secondary/30 p-4 text-center">
          <p className="text-lg font-bold">{users.filter((u) => u.role === "admin").length}</p>
          <p className="text-xs text-muted-foreground">Admins</p>
        </div>
      </div>
    </div>
  );
}
