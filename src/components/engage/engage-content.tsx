"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ExternalLink,
  Clock,
  CheckCircle2,
  MessageSquare,
  Upload,
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

const priorityColors = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-blue-500/20 text-blue-400",
  high: "bg-orange-500/20 text-orange-400",
  urgent: "bg-destructive/20 text-destructive",
};

const actionIcons = {
  comment: "💬",
  repost: "🔄",
  react: "👍",
  follow: "➕",
  connect: "🤝",
  dm: "✉️",
};

function EngageCard({
  task,
  isCompleted,
  onComplete,
  userId,
}: {
  task: EngagementTask;
  isCompleted: boolean;
  onComplete: (id: string) => void;
  userId: string;
}) {
  const [proofUrl, setProofUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const supabase = createClient();

  const handleSubmit = async () => {
    if (!proofUrl.trim()) {
      toast.error("Please provide a proof URL");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("submissions").insert({
      user_id: userId,
      task_id: task.id,
      task_type: "engagement",
      proof_url: proofUrl,
      status: "pending",
      xp_awarded: 0,
    });
    if (error) {
      toast.error("Failed to submit. Try again.");
    } else {
      toast.success("Mission submitted! Awaiting review.");
      onComplete(task.id);
      setProofUrl("");
      setShowSubmit(false);
    }
    setSubmitting(false);
  };

  return (
    <Card className={`border-border/50 transition-all ${isCompleted ? "opacity-60" : ""}`}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="text-2xl">{actionIcons[task.action_required]}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-semibold">{task.title}</h3>
              <Badge className={`text-xs ${priorityColors[task.priority]}`}>
                {task.priority}
              </Badge>
              {isCompleted && (
                <Badge className="bg-green-500/20 text-green-400 text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Done
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground mt-1">
              by <span className="text-foreground">{task.creator_name}</span>
            </p>

            <p className="text-sm mt-2">{task.summary}</p>

            <div className="mt-3 p-3 rounded-lg bg-secondary/50">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Suggested Angles
              </p>
              <ul className="space-y-1">
                {task.suggested_angles?.map((angle, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2">
                    <span className="text-primary">→</span> {angle}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                Expires {formatDistanceToNow(new Date(task.expires_at), { addSuffix: true })}
              </div>

              <div className="flex items-center gap-2">
                <a href={task.post_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Open Post
                  </Button>
                </a>

                {!isCompleted && !showSubmit && (
                  <Button size="sm" onClick={() => setShowSubmit(true)}>
                    <Upload className="h-3 w-3 mr-1" />
                    Submit
                  </Button>
                )}
              </div>
            </div>

            {/* Inline submit form */}
            {showSubmit && !isCompleted && (
              <div className="mt-4 p-3 rounded-lg border border-primary/30 bg-primary/5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium">Submit proof of engagement</p>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowSubmit(false)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <Input
                  placeholder="Paste link to your comment or screenshot URL"
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowSubmit(false)}>Cancel</Button>
                  <Button size="sm" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Mission"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function EngageContent({ tasks, completedTaskIds, userId }: EngageContentProps) {
  const [completed, setCompleted] = useState<Set<string>>(completedTaskIds);

  const handleComplete = (id: string) => {
    setCompleted((prev) => new Set([...prev, id]));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <MessageSquare className="h-7 w-7 text-blue-400" />
          Engagement Missions
        </h1>
        <p className="text-muted-foreground mt-1">
          Engage with these posts to grow the ecosystem. Quality over quantity.
        </p>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{tasks.length} active missions</span>
        <span>·</span>
        <span>{completed.size} completed</span>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <EngageCard
            key={task.id}
            task={task}
            isCompleted={completed.has(task.id)}
            onComplete={handleComplete}
            userId={userId}
          />
        ))}

        {tasks.length === 0 && (
          <Card className="border-border/50">
            <CardContent className="pt-6 text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No active engagement missions</p>
              <p className="text-sm text-muted-foreground mt-1">
                Check back soon — new missions drop daily.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
