"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ExternalLink,
  Clock,
  Check,
  MessageSquare,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import type { Database } from "@/types/database";

type EngagementTask = Database["public"]["Tables"]["engagement_tasks"]["Row"];

interface EngageContentProps {
  tasks: EngagementTask[];
  completedTaskIds: Set<string>;
  userId: string;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
} as const;

const item = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] } },
} as const;

function EngageCard({ task, isCompleted, onComplete, userId }: { task: EngagementTask; isCompleted: boolean; onComplete: (id: string) => void; userId: string }) {
  const [proofUrl, setProofUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const supabase = createClient();

  const handleSubmit = async () => {
    if (!proofUrl.trim()) { toast.error("Provide a proof URL"); return; }
    setSubmitting(true);
    const { error } = await supabase.from("submissions").insert({
      user_id: userId, task_id: task.id, task_type: "engagement", proof_url: proofUrl, status: "pending", xp_awarded: 0,
    });
    if (error) { toast.error("Failed"); } else { toast.success("Submitted"); onComplete(task.id); setProofUrl(""); setShowSubmit(false); }
    setSubmitting(false);
  };

  return (
    <motion.div
      variants={item}
      className={`rounded-lg border border-border bg-card p-4 transition-opacity ${isCompleted ? "opacity-50" : ""}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium">{task.title}</h3>
            {isCompleted && <Check className="h-3.5 w-3.5 text-muted-foreground" />}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {task.creator_name} · {task.action_required}
          </p>
          <p className="text-xs text-muted-foreground mt-2">{task.summary}</p>

          {task.suggested_angles && task.suggested_angles.length > 0 && (
            <div className="mt-3 space-y-1">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Angles</p>
              {task.suggested_angles.map((angle, i) => (
                <p key={i} className="text-xs text-foreground/70">· {angle}</p>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="text-[10px] text-muted-foreground capitalize px-2 py-0.5 rounded border border-border">
            {task.priority}
          </span>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(task.expires_at), { addSuffix: true })}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <a href={task.post_url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
          Open post <ExternalLink className="h-3 w-3" />
        </a>

        {!isCompleted && !showSubmit && (
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setShowSubmit(true)}>
            Submit proof
          </Button>
        )}
      </div>

      {showSubmit && !isCompleted && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-3 pt-3 border-t border-border space-y-2"
        >
          <div className="flex gap-2">
            <Input
              placeholder="Paste proof link..."
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
              className="h-8 text-xs"
            />
            <Button size="sm" className="h-8 text-xs px-3" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "..." : "Submit"}
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowSubmit(false)}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export function EngageContent({ tasks, completedTaskIds, userId }: EngageContentProps) {
  const [completed, setCompleted] = useState<Set<string>>(completedTaskIds);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-3xl">
      <motion.div variants={item}>
        <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
          Engagement
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          {tasks.length} missions · {completed.size} completed
        </p>
      </motion.div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <EngageCard
            key={task.id}
            task={task}
            isCompleted={completed.has(task.id)}
            onComplete={(id) => setCompleted((prev) => new Set([...prev, id]))}
            userId={userId}
          />
        ))}

        {tasks.length === 0 && (
          <motion.div variants={item} className="text-center py-16">
            <p className="text-sm text-muted-foreground">No active missions</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
