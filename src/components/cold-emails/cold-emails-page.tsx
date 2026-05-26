"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Plus, ArrowLeft, Send, MessageSquare, Calendar, CheckCircle, X } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import type { Database } from "@/types/database";

type User = Database["public"]["Tables"]["users"]["Row"];

interface ColdEmail {
  id: string;
  prospect_name: string;
  prospect_email: string;
  company: string | null;
  status: string;
  subject: string | null;
  notes: string | null;
  sent_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface ColdEmailsPageProps {
  user: User;
  emails: ColdEmail[];
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  draft: { label: "Draft", color: "text-muted-foreground bg-white/[0.06]", icon: Mail },
  sent: { label: "Sent", color: "text-blue-400 bg-blue-500/10", icon: Send },
  replied: { label: "Replied", color: "text-amber-400 bg-amber-500/10", icon: MessageSquare },
  meeting_booked: { label: "Meeting", color: "text-emerald-400 bg-emerald-500/10", icon: Calendar },
  closed: { label: "Closed", color: "text-purple-400 bg-purple-500/10", icon: CheckCircle },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const } },
};

export function ColdEmailsPage({ user, emails: initialEmails }: ColdEmailsPageProps) {
  const [emails, setEmails] = useState(initialEmails);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [form, setForm] = useState({
    prospect_name: "",
    prospect_email: "",
    company: "",
    subject: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const filteredEmails = filter === "all" ? emails : emails.filter((e) => e.status === filter);

  const handleAdd = async () => {
    if (!form.prospect_name || !form.prospect_email) {
      toast.error("Name and email are required");
      return;
    }

    setSaving(true);
    const { data, error } = await supabase
      .from("cold_emails")
      .insert({
        prospect_name: form.prospect_name,
        prospect_email: form.prospect_email,
        company: form.company || null,
        subject: form.subject || null,
        notes: form.notes || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to add email");
      setSaving(false);
      return;
    }

    setEmails([data, ...emails]);
    setForm({ prospect_name: "", prospect_email: "", company: "", subject: "", notes: "" });
    setShowForm(false);
    setSaving(false);
    toast.success("Prospect added");
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const updates: any = { status: newStatus, updated_at: new Date().toISOString() };
    if (newStatus === "sent" && !emails.find((e) => e.id === id)?.sent_at) {
      updates.sent_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("cold_emails")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast.error("Failed to update");
      return;
    }

    setEmails(emails.map((e) => (e.id === id ? { ...e, ...updates } : e)));
    toast.success(`Status updated to ${statusConfig[newStatus]?.label}`);
  };

  const stats = {
    total: emails.length,
    sent: emails.filter((e) => e.status !== "draft").length,
    replied: emails.filter((e) => ["replied", "meeting_booked", "closed"].includes(e.status)).length,
    meetings: emails.filter((e) => ["meeting_booked", "closed"].includes(e.status)).length,
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-semibold">Cold Email Tracker</span>
            </div>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            size="sm"
            className="h-8 text-xs gap-1.5"
          >
            {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {showForm ? "Cancel" : "Add Prospect"}
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Stats */}
          <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg border border-border bg-card">
              <p className="text-xl font-semibold tabular-nums">{stats.total}</p>
              <p className="text-[10px] text-muted-foreground">Total prospects</p>
            </div>
            <div className="p-3 rounded-lg border border-border bg-card">
              <p className="text-xl font-semibold tabular-nums">{stats.sent}</p>
              <p className="text-[10px] text-muted-foreground">Emails sent</p>
            </div>
            <div className="p-3 rounded-lg border border-border bg-card">
              <p className="text-xl font-semibold tabular-nums">{stats.replied}</p>
              <p className="text-[10px] text-muted-foreground">Replies</p>
            </div>
            <div className="p-3 rounded-lg border border-border bg-card">
              <p className="text-xl font-semibold tabular-nums">{stats.meetings}</p>
              <p className="text-[10px] text-muted-foreground">Meetings booked</p>
            </div>
          </motion.div>

          {/* Add Form */}
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 rounded-lg border border-border bg-card space-y-3"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  placeholder="Prospect name"
                  value={form.prospect_name}
                  onChange={(e) => setForm({ ...form, prospect_name: e.target.value })}
                  className="h-9 text-sm"
                />
                <Input
                  placeholder="Email address"
                  type="email"
                  value={form.prospect_email}
                  onChange={(e) => setForm({ ...form, prospect_email: e.target.value })}
                  className="h-9 text-sm"
                />
                <Input
                  placeholder="Company (optional)"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="h-9 text-sm"
                />
                <Input
                  placeholder="Subject line (optional)"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="h-9 text-sm"
                />
              </div>
              <Input
                placeholder="Notes (optional)"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="h-9 text-sm"
              />
              <Button onClick={handleAdd} disabled={saving} size="sm" className="h-8 text-xs">
                {saving ? "Adding..." : "Add Prospect"}
              </Button>
            </motion.div>
          )}

          {/* Filters */}
          <motion.div variants={item} className="flex items-center gap-1.5 flex-wrap">
            {[
              { key: "all", label: "All" },
              { key: "draft", label: "Draft" },
              { key: "sent", label: "Sent" },
              { key: "replied", label: "Replied" },
              { key: "meeting_booked", label: "Meeting" },
              { key: "closed", label: "Closed" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filter === f.key
                    ? "bg-white/[0.1] text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </motion.div>

          {/* Email List */}
          <motion.div variants={item} className="space-y-1.5">
            {filteredEmails.length === 0 ? (
              <div className="text-center py-16">
                <Mail className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No prospects yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Add your first prospect to get started.</p>
              </div>
            ) : (
              filteredEmails.map((email) => {
                const config = statusConfig[email.status] || statusConfig.draft;
                const StatusIcon = config.icon;
                return (
                  <div
                    key={email.id}
                    className="p-3 rounded-lg border border-border bg-card hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 ${config.color}`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">{email.prospect_name}</p>
                            {email.company && (
                              <span className="text-[10px] text-muted-foreground">@ {email.company}</span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {email.prospect_email}
                            {email.subject && <span> · {email.subject}</span>}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-muted-foreground hidden sm:block">
                          {formatDistanceToNow(new Date(email.created_at), { addSuffix: true })}
                        </span>
                        <select
                          value={email.status}
                          onChange={(e) => updateStatus(email.id, e.target.value)}
                          className="text-[11px] bg-transparent border border-border rounded-md px-2 py-1 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                        >
                          <option value="draft">Draft</option>
                          <option value="sent">Sent</option>
                          <option value="replied">Replied</option>
                          <option value="meeting_booked">Meeting</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                    </div>
                    {email.notes && (
                      <p className="text-[11px] text-muted-foreground mt-2 ml-10 line-clamp-1">
                        {email.notes}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
