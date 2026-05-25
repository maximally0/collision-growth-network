"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, PenTool, Clock, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import type { Database } from "@/types/database";

type PostBrief = Database["public"]["Tables"]["post_briefs"]["Row"];

const objectiveColors: Record<string, string> = {
  authority: "bg-blue-500/15 text-blue-400",
  relatability: "bg-pink-500/15 text-pink-400",
  recruiting: "bg-green-500/15 text-green-400",
  storytelling: "bg-purple-500/15 text-purple-400",
  controversy: "bg-red-500/15 text-red-400",
  curiosity: "bg-yellow-500/15 text-yellow-400",
  engagement: "bg-orange-500/15 text-orange-400",
};

export function BriefsPanel({ postBriefs }: { postBriefs: PostBrief[] }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", objective: "authority", core_idea: "", structure: "", emotional_direction: "thoughtful", deadline_days: "2" });
  const supabase = createClient();

  const handleCreate = async () => {
    if (!form.title || !form.core_idea) { toast.error("Title and core idea required"); return; }
    const { error } = await supabase.from("post_briefs").insert({
      title: form.title,
      objective: form.objective,
      core_idea: form.core_idea,
      structure: form.structure,
      emotional_direction: form.emotional_direction,
      deadline: new Date(Date.now() + parseInt(form.deadline_days) * 86400000).toISOString(),
    });
    if (error) { toast.error("Failed"); return; }
    toast.success("Brief created");
    setForm({ title: "", objective: "authority", core_idea: "", structure: "", emotional_direction: "thoughtful", deadline_days: "2" });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Post Briefs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Content direction for your agents
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Brief
          </Button>
        )}
      </div>

      {/* Inline create form */}
      {showForm && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Create Post Brief</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Brief title" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Objective</Label>
              <select className="w-full h-9 rounded-md border border-border bg-input px-3 text-sm" value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })}>
                <option value="authority">Authority</option>
                <option value="relatability">Relatability</option>
                <option value="recruiting">Recruiting</option>
                <option value="storytelling">Storytelling</option>
                <option value="controversy">Controversy</option>
                <option value="curiosity">Curiosity</option>
                <option value="engagement">Engagement</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Emotional Direction</Label>
              <select className="w-full h-9 rounded-md border border-border bg-input px-3 text-sm" value={form.emotional_direction} onChange={(e) => setForm({ ...form, emotional_direction: e.target.value })}>
                <option value="thoughtful">Thoughtful</option>
                <option value="ambitious">Ambitious</option>
                <option value="reflective">Reflective</option>
                <option value="funny">Funny</option>
                <option value="sharp">Sharp</option>
                <option value="hopeful">Hopeful</option>
                <option value="chaotic">Chaotic energy</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Core Idea *</Label>
            <Textarea value={form.core_idea} onChange={(e) => setForm({ ...form, core_idea: e.target.value })} placeholder="One sentence thesis — what should this post communicate?" className="min-h-[70px]" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Structure</Label>
            <Textarea value={form.structure} onChange={(e) => setForm({ ...form, structure: e.target.value })} placeholder="Hook → Personal observation → Insight → Punchline → CTA" className="min-h-[100px]" />
          </div>

          <div className="flex items-center gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Deadline (days)</Label>
              <Input type="number" value={form.deadline_days} onChange={(e) => setForm({ ...form, deadline_days: e.target.value })} className="w-24" />
            </div>
            <div className="flex-1" />
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Brief</Button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-2">
        {postBriefs.map((brief) => (
          <div key={brief.id} className="p-4 rounded-xl border border-border/30 bg-secondary/10 hover:bg-secondary/20 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <PenTool className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-sm font-medium flex-1">{brief.title}</p>
              <Badge className={`text-[10px] ${objectiveColors[brief.objective] || "bg-muted text-muted-foreground"}`}>
                {brief.objective}
              </Badge>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" />
                {formatDistanceToNow(new Date(brief.deadline), { addSuffix: true })}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{brief.core_idea}</p>
            <p className="text-[10px] text-muted-foreground mt-1 capitalize">
              Tone: {brief.emotional_direction}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
