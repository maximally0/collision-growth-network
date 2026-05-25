"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Crown, Flame } from "lucide-react";
import type { Database } from "@/types/database";

type Agent = Pick<
  Database["public"]["Tables"]["users"]["Row"],
  "id" | "name" | "xp" | "streak" | "level" | "avatar_url"
>;

interface LeaderboardContentProps {
  agents: Agent[];
  currentUserId: string;
}

const levelColors: Record<string, string> = {
  rookie: "text-muted-foreground",
  operator: "text-blue-400",
  growth_agent: "text-purple-400",
  narrative_captain: "text-orange-400",
  ecosystem_lead: "text-yellow-400",
};

const rankIcons = [
  <Crown key="1" className="h-5 w-5 text-yellow-400" />,
  <Medal key="2" className="h-5 w-5 text-gray-300" />,
  <Medal key="3" className="h-5 w-5 text-amber-600" />,
];

export function LeaderboardContent({ agents, currentUserId }: LeaderboardContentProps) {
  const currentUserRank = agents.findIndex((a) => a.id === currentUserId) + 1;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Trophy className="h-7 w-7 text-yellow-500" />
          Leaderboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Top growth agents ranked by XP. Your rank: #{currentUserRank || "—"}
        </p>
      </div>

      {/* Top 3 Podium */}
      {agents.length >= 3 && (
        <div className="grid grid-cols-3 gap-4">
          {[1, 0, 2].map((idx) => {
            const agent = agents[idx];
            if (!agent) return null;
            const isCenter = idx === 0;
            return (
              <Card
                key={agent.id}
                className={`border-border/50 ${
                  isCenter ? "ring-2 ring-yellow-500/30 -mt-4" : ""
                } ${agent.id === currentUserId ? "bg-primary/5" : ""}`}
              >
                <CardContent className="pt-6 text-center">
                  <div className="flex justify-center mb-2">
                    {rankIcons[idx]}
                  </div>
                  <Avatar className="h-12 w-12 mx-auto mb-2">
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {agent.name?.split(" ").map((n) => n[0]).join("").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-semibold truncate">{agent.name}</p>
                  <p className={`text-xs capitalize ${levelColors[agent.level || "rookie"]}`}>
                    {agent.level?.replace("_", " ")}
                  </p>
                  <p className="text-lg font-bold mt-2">{agent.xp} XP</p>
                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <Flame className="h-3 w-3 text-orange-500" />
                    {agent.streak} day streak
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Full List */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">All Agents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {agents.map((agent, idx) => (
              <div
                key={agent.id}
                className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                  agent.id === currentUserId
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-secondary/50"
                }`}
              >
                <span className="text-lg font-bold text-muted-foreground w-8 text-center">
                  {idx + 1}
                </span>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-secondary text-xs">
                    {agent.name?.split(" ").map((n) => n[0]).join("").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">
                      {agent.name}
                      {agent.id === currentUserId && (
                        <span className="text-primary ml-1">(you)</span>
                      )}
                    </p>
                    <Badge
                      variant="secondary"
                      className={`text-xs capitalize ${levelColors[agent.level || "rookie"]}`}
                    >
                      {agent.level?.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{agent.xp} XP</p>
                  <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                    <Flame className="h-3 w-3 text-orange-500" />
                    {agent.streak}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
