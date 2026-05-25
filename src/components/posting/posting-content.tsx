"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PenTool,
  CheckCircle2,
  Upload,
  Clock,
  Sparkles,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import type { Database } from "@/types/database";

type PostBrief = Database["public"]["Tables"]["post_briefs"]["Row"];
type Narrative = Database["public"]["Tables"]["narratives"]["Row"];

interface PostingContentProps {
  briefs: PostBrief[];
  narrative: Narrative | null;
  completedBriefIds: Set<string>;
  userId: string;
}

const objectiveColors: Record<string, string> = {
  authority: "bg-blue-500/20 text-blue-400",
  relatability: "bg-pink-500/20 text-pink-400",
  recruiting: "bg-green-500/20 text-green-400",
  storytelling: "bg-purple-500/20 text-purple-400",
  controversy: "bg-red-500/20 text-red-400",
  curiosity: "bg-yellow-500/20 text-yellow-400",
  engagement: "bg-orange-500/20 text-orange-400",
};

function BriefCard({ brief, isCompleted, onComplete, userId }: { brief: PostBrief; isCompleted: boolean; onComplete: (id: string) => void; userId: string }) {
  const [proofUrl, setProofUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const supabase = createClient();

  const handleSubmit = async () => {
    if (!proofUrl.trim()) { toast.error("Paste your LinkedIn post link"); return; }
    setSubmitting(true);
    const { error } = await supabase.from("submissions").insert({
      user_id: userId,
      task_id: brief.id,
      task_type: "post",
      proof_url: proofUrl,
      status: "pending",
      xp_awarded: 0,
    });
    if (error) { toast.error("Failed to submit."); }
    else {
      toast.success("Post submitted! +30 XP pending review.");
      onComplete(brief.id);
      setProofUrl("");
      setShowSubmit(false);
    }
    setSubmitting(false);
  };

  return (
    <Card className={`border-border/50 transition-all ${isCompleted ? "opacity-60" : ""}`}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold">{brief.title}</h3>
              <Badge className={objectiveColors[brief.objective] || "bg-muted text-muted-foreground"}>
                {brief.objective}
              </Badge>
              {isCompleted && (
                <Badge className="bg-green-500/20 text-green-400 text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Posted
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(brief.deadline), { addSuffix: true })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Core Idea</p>
                <p className="text-sm mt-1">{brief.core_idea}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Emotional Direction</p>
                <p className="text-sm mt-1 capitalize">{brief.emotional_direction}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Structure</p>
              <p className="text-sm mt-1 whitespace-pre-line">{brief.structure}</p>
            </div>
          </div>

          {brief.reference_urls && brief.reference_urls.length > 0 && (
            <div className="p-3 rounded-lg bg-secondary/50">
              <p className="text-xs font-medium text-muted-foreground mb-2">Reference Posts</p>
              <ul className="space-y-1">
                {brief.reference_urls.map((ref, i) => (
                  <li key={i} className="text-sm text-primary hover:underline">
                    <a href={ref} target="_blank" rel="noopener noreferrer">
                      Reference {i + 1} →
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!isCompleted && !showSubmit && (
            <div className="flex justify-end">
              <Button onClick={() => setShowSubmit(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Submit Post
              </Button>
            </div>
          )}

          {showSubmit && !isCompleted && (
            <div className="p-3 rounded-lg border border-primary/30 bg-primary/5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium">Paste your published LinkedIn post link</p>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowSubmit(false)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <Input
                placeholder="https://linkedin.com/posts/..."
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowSubmit(false)}>Cancel</Button>
                <Button size="sm" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit (+30 XP)"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function PostingContent({ briefs, narrative, completedBriefIds, userId }: PostingContentProps) {
  const [completed, setCompleted] = useState<Set<string>>(completedBriefIds);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <PenTool className="h-7 w-7 text-green-400" />
          Posting System
        </h1>
        <p className="text-muted-foreground mt-1">
          Your daily post briefs. Write in your voice, aligned with the narrative.
        </p>
      </div>

      {narrative && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-xs font-medium text-primary uppercase tracking-wider">Active Narrative</p>
                <p className="text-lg font-semibold mt-1">{narrative.monthly_theme}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This week: <span className="text-foreground">{narrative.weekly_theme}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Today&apos;s angle: <span className="text-foreground">{narrative.daily_angle}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {briefs.map((brief) => (
          <BriefCard
            key={brief.id}
            brief={brief}
            isCompleted={completed.has(brief.id)}
            onComplete={(id) => setCompleted((prev) => new Set([...prev, id]))}
            userId={userId}
          />
        ))}

        {briefs.length === 0 && (
          <Card className="border-border/50">
            <CardContent className="pt-6 text-center py-12">
              <PenTool className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No post briefs right now</p>
              <p className="text-sm text-muted-foreground mt-1">
                New briefs will be assigned based on the weekly narrative.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
