"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Flame,
  Zap,
  Target,
  MessageSquare,
  Users,
  PenTool,
  Trophy,
  ArrowRight,
  ExternalLink,
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

const levelThresholds = {
  rookie: 0,
  operator: 200,
  growth_agent: 500,
  narrative_captain: 1200,
  ecosystem_lead: 3000,
};

function getNextLevel(currentLevel: string) {
  const levels = Object.keys(levelThresholds);
  const idx = levels.indexOf(currentLevel);
  return idx < levels.length - 1 ? levels[idx + 1] : null;
}

function getLevelProgress(xp: number, currentLevel: string) {
  const levels = Object.entries(levelThresholds);
  const currentIdx = levels.findIndex(([l]) => l === currentLevel);
  if (currentIdx >= levels.length - 1) return 100;
  const currentThreshold = levels[currentIdx][1];
  const nextThreshold = levels[currentIdx + 1][1];
  return Math.min(
    100,
    Math.round(((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100)
  );
}

const priorityColors = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-blue-500/20 text-blue-400",
  high: "bg-orange-500/20 text-orange-400",
  urgent: "bg-destructive/20 text-destructive",
};

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
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Good {getTimeOfDay()}, {profile?.name?.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here are your growth missions for today.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Streak</p>
                <p className="text-2xl font-bold">{profile?.streak || 0} days</p>
              </div>
              <Flame className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">XP</p>
                <p className="text-2xl font-bold">{profile?.xp || 0}</p>
              </div>
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span className="capitalize">{profile?.level?.replace("_", " ")}</span>
                <span className="capitalize">{getNextLevel(profile?.level || "rookie")?.replace("_", " ") || "Max"}</span>
              </div>
              <Progress value={getLevelProgress(profile?.xp || 0, profile?.level || "rookie")} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today&apos;s Missions</p>
                <p className="text-2xl font-bold">{completedToday}/{totalMissions}</p>
              </div>
              <Target className="h-8 w-8 text-accent" />
            </div>
            <Progress value={completionPercent} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Leaderboard</p>
                <p className="text-2xl font-bold">
                  #{leaderboard.findIndex((u) => u.id === profile?.id) + 1 || "—"}
                </p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Narrative of the Week */}
      {narrative && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                <PenTool className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium text-primary uppercase tracking-wider">This Week&apos;s Narrative</p>
                <p className="text-lg font-semibold mt-1">{narrative.weekly_theme}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Monthly: {narrative.monthly_theme}
                </p>
                <p className="text-sm text-muted-foreground">
                  Today&apos;s angle: <span className="text-foreground">{narrative.daily_angle}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mission Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Missions */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-400" />
              Engagement Missions
            </CardTitle>
            <Link href="/engage" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {engagementTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active missions. Check back later.</p>
            ) : (
              engagementTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <Badge className={`text-xs ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {task.creator_name} · {task.action_required}
                    </p>
                  </div>
                  <a href={task.post_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </a>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* People Missions */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-400" />
              People Missions
            </CardTitle>
            <Link href="/people" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {peopleTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No people missions right now.</p>
            ) : (
              peopleTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {task.role_title} · {task.suggested_action}
                    </p>
                    <div className="flex gap-1 mt-1.5">
                      {task.niche_tags?.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <a href={task.profile_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </a>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Post Briefs */}
      {postBriefs.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <PenTool className="h-4 w-4 text-green-400" />
              Today&apos;s Post Briefs
            </CardTitle>
            <Link href="/posting" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {postBriefs.map((brief) => (
              <div key={brief.id} className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{brief.title}</p>
                  <Badge variant="secondary" className="text-xs capitalize">
                    {brief.objective}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{brief.core_idea}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Emotional direction: <span className="text-foreground capitalize">{brief.emotional_direction}</span>
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Mini Leaderboard */}
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            Top Agents
          </CardTitle>
          <Link href="/leaderboard" className="text-xs text-primary hover:underline flex items-center gap-1">
            Full board <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboard.map((agent, idx) => (
              <div key={agent.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                <span className="text-lg font-bold text-muted-foreground w-6">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{agent.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {agent.level?.replace("_", " ")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{agent.xp} XP</p>
                  <p className="text-xs text-muted-foreground">🔥 {agent.streak}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
