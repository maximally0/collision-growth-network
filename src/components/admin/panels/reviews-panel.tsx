"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  Inbox,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/types/database";

type Submission = Database["public"]["Tables"]["submissions"]["Row"];
type User = Database["public"]["Tables"]["users"]["Row"];

const xpRewards = { engagement: 5, people: 10, post: 30 };

export function ReviewsPanel({ submissions: initial, users }: { submissions: Submission[]; users: User[] }) {
  const [submissions, setSubmissions] = useState(initial);
  const supabase = createClient();

  const getUserName = (id: string) => users.find((u) => u.id === id)?.name || "Unknown";

  const handleReview = async (sub: Submission, approved: boolean) => {
    const xp = approved ? xpRewards[sub.task_type] : 0;
    const { error } = await supabase
      .from("submissions")
      .update({ status: approved ? "approved" : "rejected", xp_awarded: xp, reviewed_at: new Date().toISOString() })
      .eq("id", sub.id);
    if (error) { toast.error("Failed"); return; }
    if (approved) {
      const { data: u } = await supabase.from("users").select("xp").eq("id", sub.user_id).single();
      if (u) await supabase.from("users").update({ xp: (u as any).xp + xp }).eq("id", sub.user_id);
    }
    setSubmissions((prev) => prev.filter((s) => s.id !== sub.id));
    toast.success(approved ? `Approved · +${xp} XP` : "Rejected");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reviews</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {submissions.length} submission{submissions.length !== 1 ? "s" : ""} awaiting your review
        </p>
      </div>

      {submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-16 w-16 rounded-2xl bg-green-500/10 flex items-center justify-center mb-4">
            <Inbox className="h-7 w-7 text-green-400" />
          </div>
          <p className="text-base font-medium">All clear</p>
          <p className="text-sm text-muted-foreground mt-1">No pending submissions right now</p>
        </div>
      ) : (
        <div className="space-y-2">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="flex items-center gap-4 p-4 rounded-xl bg-secondary/20 border border-border/30 hover:border-border/60 transition-colors"
            >
              {/* Avatar */}
              <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                {getUserName(sub.user_id).split(" ").map((n) => n[0]).join("").toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{getUserName(sub.user_id)}</p>
                  <Badge variant="secondary" className="text-[10px] capitalize shrink-0">{sub.task_type}</Badge>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <a
                    href={sub.proof_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    View proof <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                  <span className="text-xs text-muted-foreground">
                    · {new Date(sub.submitted_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => handleReview(sub, false)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  className="h-8 px-3 text-xs"
                  onClick={() => handleReview(sub, true)}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                  +{xpRewards[sub.task_type]}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
