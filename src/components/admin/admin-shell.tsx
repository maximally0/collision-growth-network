"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Inbox,
  Crosshair,
  Users,
  Sparkles,
  PenTool,
  BarChart3,
} from "lucide-react";
import { ReviewsPanel } from "./panels/reviews-panel";
import { MissionsPanel } from "./panels/missions-panel";
import { UsersPanel } from "./panels/users-panel";
import { NarrativesPanel } from "./panels/narratives-panel";
import { BriefsPanel } from "./panels/briefs-panel";
import { OverviewPanel } from "./panels/overview-panel";
import type { Database } from "@/types/database";

type Submission = Database["public"]["Tables"]["submissions"]["Row"];
type User = Database["public"]["Tables"]["users"]["Row"];
type EngagementTask = Database["public"]["Tables"]["engagement_tasks"]["Row"];
type PeopleTask = Database["public"]["Tables"]["people_tasks"]["Row"];
type Narrative = Database["public"]["Tables"]["narratives"]["Row"];
type PostBrief = Database["public"]["Tables"]["post_briefs"]["Row"];

interface AdminShellProps {
  pendingSubmissions: Submission[];
  users: User[];
  engagementTasks: EngagementTask[];
  peopleTasks: PeopleTask[];
  narratives: Narrative[];
  postBriefs: PostBrief[];
}

const sections = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "reviews", label: "Reviews", icon: Inbox },
  { id: "missions", label: "Missions", icon: Crosshair },
  { id: "narratives", label: "Narratives", icon: Sparkles },
  { id: "briefs", label: "Briefs", icon: PenTool },
  { id: "users", label: "Users", icon: Users },
] as const;

type SectionId = (typeof sections)[number]["id"];

export function AdminShell({
  pendingSubmissions,
  users,
  engagementTasks,
  peopleTasks,
  narratives,
  postBriefs,
}: AdminShellProps) {
  const [active, setActive] = useState<SectionId>("overview");

  return (
    <div className="flex h-[calc(100vh-2rem)] lg:h-[calc(100vh-4rem)] -m-4 sm:-m-6 lg:-m-8">
      {/* Left rail */}
      <nav className="w-14 sm:w-48 shrink-0 border-r border-border/60 bg-card/30 flex flex-col">
        <div className="px-2 sm:px-4 py-5 border-b border-border/40">
          <p className="hidden sm:block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Command Center
          </p>
          <p className="sm:hidden text-xs font-bold text-center text-muted-foreground">CC</p>
        </div>

        <div className="flex-1 py-3 px-1 sm:px-2 space-y-0.5">
          {sections.map((section) => {
            const isActive = active === section.id;
            const count =
              section.id === "reviews" ? pendingSubmissions.length :
              section.id === "missions" ? engagementTasks.filter((t) => !t.archived).length :
              section.id === "users" ? users.length :
              section.id === "narratives" ? narratives.length :
              section.id === "briefs" ? postBriefs.length : null;

            return (
              <button
                key={section.id}
                onClick={() => setActive(section.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-2 sm:px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-foreground/10 text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                )}
              >
                <section.icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
                <span className="hidden sm:inline flex-1 text-left">{section.label}</span>
                {count !== null && count > 0 && (
                  <span className={cn(
                    "hidden sm:inline text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                    section.id === "reviews" && count > 0
                      ? "bg-orange-500/20 text-orange-400"
                      : "bg-foreground/10 text-muted-foreground"
                  )}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
          {active === "overview" && (
            <OverviewPanel
              submissions={pendingSubmissions}
              users={users}
              engagementTasks={engagementTasks}
              peopleTasks={peopleTasks}
              narratives={narratives}
              postBriefs={postBriefs}
              onNavigate={(s) => setActive(s as SectionId)}
            />
          )}
          {active === "reviews" && (
            <ReviewsPanel submissions={pendingSubmissions} users={users} />
          )}
          {active === "missions" && (
            <MissionsPanel engagementTasks={engagementTasks} peopleTasks={peopleTasks} />
          )}
          {active === "narratives" && (
            <NarrativesPanel narratives={narratives} />
          )}
          {active === "briefs" && (
            <BriefsPanel postBriefs={postBriefs} />
          )}
          {active === "users" && (
            <UsersPanel users={users} />
          )}
        </div>
      </div>
    </div>
  );
}
