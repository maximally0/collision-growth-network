"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import type { Database } from "@/types/database";

type Agent = Pick<
  Database["public"]["Tables"]["users"]["Row"],
  "id" | "name" | "xp" | "streak" | "level" | "avatar_url"
>;

interface LeaderboardContentProps {
  agents: Agent[];
  currentUserId: string;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.03 } },
} as const;

const item = {
  hidden: { opacity: 0, y: 4 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] } },
} as const;

export function LeaderboardContent({ agents, currentUserId }: LeaderboardContentProps) {
  const currentUserRank = agents.findIndex((a) => a.id === currentUserId) + 1;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-2xl">
      <motion.div variants={item}>
        <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
          <Trophy className="h-5 w-5 text-muted-foreground" />
          Leaderboard
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Your rank: #{currentUserRank || "—"}
        </p>
      </motion.div>

      <motion.div variants={item} className="rounded-lg border border-border bg-card divide-y divide-border">
        {agents.map((agent, idx) => (
          <motion.div
            key={agent.id}
            variants={item}
            className={`flex items-center gap-4 px-4 py-3 transition-colors hover:bg-white/[0.02] ${
              agent.id === currentUserId ? "bg-white/[0.04]" : ""
            }`}
          >
            <span className="text-xs font-medium text-muted-foreground w-6 tabular-nums text-right">
              {idx + 1}
            </span>
            <div className="h-7 w-7 rounded-full bg-white/[0.06] flex items-center justify-center text-[10px] font-medium text-muted-foreground">
              {agent.name?.split(" ").map((n) => n[0]).join("").toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {agent.name}
                {agent.id === currentUserId && <span className="text-muted-foreground ml-1 text-xs">(you)</span>}
              </p>
              <p className="text-[10px] text-muted-foreground capitalize">{agent.level?.replace("_", " ")}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium tabular-nums">{agent.xp}</p>
              <p className="text-[10px] text-muted-foreground">{agent.streak}d streak</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
