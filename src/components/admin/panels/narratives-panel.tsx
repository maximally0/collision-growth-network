"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Sparkles, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/types/database";

type Narrative = Database["public"]["Tables"]["narratives"]["Row"];

export function NarrativesPanel({ narratives }: { narratives: Narrative[] }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ monthly_theme: "", weekly_theme: "", daily_angle: "", duration_days: "30" });
  const supabase = createClient();

  const handleCreate = async () => {
    if (!form.monthly_theme) { toast.error("Monthly theme required"); return; }
    await supabase.from("narratives").update({ active: false }).eq("active", true);
    const { error } = await supabase.from("narratives").insert({
      monthly_theme: form.monthly_theme,
      weekly_theme: form.weekly_theme,
      daily_angle: form.daily_angle,
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date(Date.now() + parseInt(form.duration_days) * 86400000).toISOString().split("T")[0],
      active: true,
    });
    if (error) { toast.error("Failed"); return; }
    toast.success("Narrative activated");
    setForm({ monthly_theme: "", weekly_theme: "", daily_angle: "", duration_days: "30" });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Narratives</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Coordinate the story your network tells
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Narrative
          </Button>
        )}
      </div>

      {/* Inline create form */}
      {showForm && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Create Narrative</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Monthly Theme *</Label>
            <Input value={form.monthly_theme} onChange={(e) => setForm({ ...form, monthly_theme: e.target.value })} placeholder="The big idea for the month" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Weekly Theme</Label>
              <Input value={form.weekly_theme} onChange={(e) => setForm({ ...form, weekly_theme: e.target.value })} placeholder="This week's focus" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Daily Angle</Label>
              <Input value={form.daily_angle} onChange={(e) => setForm({ ...form, daily_angle: e.target.value })} placeholder="Today's specific angle" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Duration (days)</Label>
              <Input type="number" value={form.duration_days} onChange={(e) => setForm({ ...form, duration_days: e.target.value })} className="w-24" />
            </div>
            <p className="text-xs text-muted-foreground flex-1">Previous active narrative will be deactivated.</p>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Activate Narrative</Button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {narratives.map((n) => (
          <div
            key={n.id}
            className={`p-5 rounded-xl border transition-colors ${
              n.active
                ? "border-primary/30 bg-primary/5"
                : "border-border/30 bg-secondary/10 hover:bg-secondary/20"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className={`h-3.5 w-3.5 ${n.active ? "text-primary" : "text-muted-foreground"}`} />
              {n.active && <Badge className="bg-primary/20 text-primary text-[10px]">Active</Badge>}
              <span className="text-[10px] text-muted-foreground ml-auto">
                {n.start_date} → {n.end_date}
              </span>
            </div>
            <p className="text-sm font-semibold">{n.monthly_theme}</p>
            <div className="mt-2 space-y-1">
              <p className="text-xs"><span className="text-muted-foreground">Weekly:</span> {n.weekly_theme}</p>
              <p className="text-xs"><span className="text-muted-foreground">Daily:</span> {n.daily_angle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
