"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Users,
  CheckCircle2,
  Shuffle,
  Flame,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface Agent {
  id: string;
  name: string;
  linkedin_url: string | null;
  pitch: string | null;
  niche_tags: string[];
  role_title: string | null;
  level: string;
  xp: number;
  streak: number;
}

interface PeopleContentProps {
  agents: Agent[];
  connectedIds: Set<string>;
  userId: string;
}

export function PeopleContent({ agents, connectedIds, userId }: PeopleContentProps) {
  const [connected, setConnected] = useState<Set<string>>(connectedIds);
  const [displayAgents, setDisplayAgents] = useState(agents);
  const supabase = createClient();

  const handleConnect = async (agentId: string) => {
    const { error } = await supabase.from("submissions").insert({
      user_id: userId,
      task_id: agentId, // using agent's user ID as the task_id
      task_type: "people",
      proof_url: "connected",
      status: "approved", // auto-approve people connections
      xp_awarded: 10,
    });

    if (error) {
      toast.error("Failed to mark as connected");
      return;
    }

    // Award XP
    const { data: currentUser } = await supabase
      .from("users")
      .select("xp")
      .eq("id", userId)
      .single();

    if (currentUser) {
      await supabase
        .from("users")
        .update({ xp: (currentUser as any).xp + 10 })
        .eq("id", userId);
    }

    setConnected((prev) => new Set([...prev, agentId]));
    toast.success("Connected! +10 XP");
  };

  const handleShuffle = () => {
    setDisplayAgents([...displayAgents].sort(() => Math.random() - 0.5));
    toast.success("Shuffled!");
  };

  const pendingAgents = displayAgents.filter((a) => !connected.has(a.id));
  const connectedAgents = displayAgents.filter((a) => connected.has(a.id));

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-7 w-7 text-purple-400" />
            People
          </h1>
          <p className="text-muted-foreground mt-1">
            Connect with other growth agents in the network. Randomized daily.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleShuffle}>
          <Shuffle className="h-4 w-4 mr-2" />
          Shuffle
        </Button>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{pendingAgents.length} to connect with</span>
        <span>·</span>
        <span>{connected.size} connected</span>
        <span>·</span>
        <span>+10 XP per connection</span>
      </div>

      {/* Pending connections */}
      {pendingAgents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingAgents.map((agent) => (
            <Card key={agent.id} className="border-border/50 hover:border-purple-500/30 transition-colors">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-purple-500/15 flex items-center justify-center text-sm font-bold text-purple-400">
                        {agent.name?.split(" ").map((n) => n[0]).join("").toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-base font-semibold">{agent.name}</h3>
                        {agent.role_title && (
                          <p className="text-xs text-muted-foreground">{agent.role_title}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Flame className="h-3 w-3 text-orange-400" />
                      {agent.streak}
                    </div>
                  </div>

                  {agent.niche_tags && agent.niche_tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {agent.niche_tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {agent.pitch && (
                    <p className="text-sm text-foreground/80">{agent.pitch}</p>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    {agent.linkedin_url && (
                      <a
                        href={agent.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Profile
                        </Button>
                      </a>
                    )}
                    <Button size="sm" onClick={() => handleConnect(agent.id)}>
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Connected
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Already connected */}
      {connectedAgents.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Already Connected ({connectedAgents.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {connectedAgents.map((agent) => (
              <div key={agent.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 opacity-70">
                <div className="h-8 w-8 rounded-full bg-green-500/15 flex items-center justify-center text-xs font-bold text-green-400">
                  {agent.name?.split(" ").map((n) => n[0]).join("").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{agent.name}</p>
                  {agent.role_title && (
                    <p className="text-xs text-muted-foreground">{agent.role_title}</p>
                  )}
                </div>
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {agents.length === 0 && (
        <Card className="border-border/50">
          <CardContent className="pt-6 text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">No agents to connect with yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Once other agents fill out their profiles, they&apos;ll show up here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
