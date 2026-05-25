"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Crosshair, Archive, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/types/database";

type EngagementTask = Database["public"]["Tables"]["engagement_tasks"]["Row"];
type PeopleTask = Database["public"]["Tables"]["people_tasks"]["Row"];

const priorityStyles: Record<string, string> = {
  low: "bg-muted/50 text-muted-foreground",
  medium: "bg-blue-500/15 text-blue-400",
  high: "bg-orange-500/15 text-orange-400",
  urgent: "bg-red-500/15 text-red-400",
};

export function MissionsPanel({ engagementTasks, peopleTasks }: { engagementTasks: EngagementTask[]; peopleTasks: PeopleTask[] }) {
  const [tab, setTab] = useState<"engage" | "people">("engage");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", post_url: "", creator_name: "", summary: "", action_required: "comment", suggested_angles: "", priority: "medium", expires_days: "3" });
  const supabase = createClient();

  const handleCreate = async () => {
    if (!form.title || !form.post_url) { toast.error("Title and URL are required"); return; }
    const { error } = await supabase.from("engagement_tasks").insert({
      title: form.title,
      post_url: form.post_url,
      creator_name: form.creator_name,
      summary: form.summary,
      action_required: form.action_required,
      suggested_angles: form.suggested_angles.split("\n").filter(Boolean),
      priority: form.priority,
      expires_at: new Date(Date.now() + parseInt(form.expires_days) * 86400000).toISOString(),
    });
    if (error) { toast.error("Failed to create"); return; }
    toast.success("Mission created");
    setForm({ title: "", post_url: "", creator_name: "", summary: "", action_required: "comment", suggested_angles: "", priority: "medium", expires_days: "3" });
    setShowForm(false);
  };

  const handleArchive = async (id: string) => {
    await supabase.from("engagement_tasks").update({ archived: true }).eq("id", id);
    toast.success("Archived");
  };

  const activeTasks = engagementTasks.filter((t) => !t.archived);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Missions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {activeTasks.length} active · {peopleTasks.filter((t) => !t.archived).length} people tasks
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Mission
          </Button>
        )}
      </div>

      {/* Inline create form */}
      {showForm && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Create Engagement Mission</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Collision Conference Recap" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">LinkedIn Post URL *</Label>
              <Input value={form.post_url} onChange={(e) => setForm({ ...form, post_url: e.target.value })} placeholder="https://linkedin.com/posts/..." />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Creator</Label>
              <Input value={form.creator_name} onChange={(e) => setForm({ ...form, creator_name: e.target.value })} placeholder="Who posted this" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Action</Label>
              <select className="w-full h-9 rounded-md border border-border bg-input px-3 text-sm" value={form.action_required} onChange={(e) => setForm({ ...form, action_required: e.target.value })}>
                <option value="comment">Comment</option>
                <option value="repost">Repost</option>
                <option value="react">React</option>
                <option value="follow">Follow</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Priority</Label>
              <select className="w-full h-9 rounded-md border border-border bg-input px-3 text-sm" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Context / Summary</Label>
            <Textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="Why should agents engage with this?" className="min-h-[80px]" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Suggested Angles (one per line)</Label>
            <Textarea value={form.suggested_angles} onChange={(e) => setForm({ ...form, suggested_angles: e.target.value })} placeholder="Talk about X&#10;Mention Y&#10;Connect to Z" className="min-h-[100px]" />
          </div>

          <div className="flex items-center gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Expires in (days)</Label>
              <Input type="number" value={form.expires_days} onChange={(e) => setForm({ ...form, expires_days: e.target.value })} className="w-24" />
            </div>
            <div className="flex-1" />
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Mission</Button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg bg-secondary/30 w-fit">
        <button onClick={() => setTab("engage")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${tab === "engage" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
          Engagement ({activeTasks.length})
        </button>
        <button onClick={() => setTab("people")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${tab === "people" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
          People ({peopleTasks.filter((t) => !t.archived).length})
        </button>
      </div>

      {/* List */}
      {tab === "engage" && (
        <div className="space-y-1.5">
          {activeTasks.map((task) => (
            <div key={task.id} className="group flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors">
              <Crosshair className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{task.title}</p>
                <p className="text-xs text-muted-foreground">{task.creator_name} · {task.action_required} · expires {new Date(task.expires_at).toLocaleDateString()}</p>
              </div>
              <Badge className={`text-[10px] ${priorityStyles[task.priority]}`}>{task.priority}</Badge>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                onClick={() => handleArchive(task.id)}
              >
                <Archive className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          {activeTasks.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No active engagement missions</p>
          )}
        </div>
      )}

      {tab === "people" && (
        <div className="space-y-1.5">
          {peopleTasks.filter((t) => !t.archived).map((task) => (
            <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors">
              <div className="h-7 w-7 rounded-full bg-purple-500/15 flex items-center justify-center text-[10px] font-bold text-purple-400 shrink-0">
                {task.name?.split(" ").map((n) => n[0]).join("").toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{task.name}</p>
                <p className="text-xs text-muted-foreground">{task.role_title} · {task.suggested_action}</p>
              </div>
              <div className="flex gap-1">
                {task.niche_tags?.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
