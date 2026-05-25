"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Flame, Search, Plus, X, Copy, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/types/database";

type User = Database["public"]["Tables"]["users"]["Row"];

const levelColors: Record<string, string> = {
  rookie: "text-muted-foreground",
  operator: "text-blue-400",
  growth_agent: "text-purple-400",
  narrative_captain: "text-orange-400",
  ecosystem_lead: "text-yellow-400",
};

const roleStyles: Record<string, string> = {
  agent: "bg-muted/50 text-muted-foreground",
  captain: "bg-blue-500/15 text-blue-400",
  admin: "bg-primary/15 text-primary",
};

export function UsersPanel({ users: initial }: { users: User[] }) {
  const [users, setUsers] = useState(initial);
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [creating, setCreating] = useState(false);
  const [createdUser, setCreatedUser] = useState<{ email: string; name: string; password: string } | null>(null);
  const supabase = createClient();

  const handleRoleChange = async (userId: string, newRole: string) => {
    const { error } = await supabase.from("users").update({ role: newRole }).eq("id", userId);
    if (error) { toast.error("Failed"); return; }
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole as any } : u));
    toast.success(`Role → ${newRole}`);
  };

  const handleCreateUser = async () => {
    if (!newName.trim() || !newEmail.trim()) {
      toast.error("Name and email required");
      return;
    }
    setCreating(true);

    const res = await fetch("/api/admin/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, email: newEmail }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Failed to create user");
      setCreating(false);
      return;
    }

    setCreatedUser({ email: data.user.email, name: data.user.name, password: data.user.password });
    toast.success("Agent created!");
    setCreating(false);
  };

  const handleCopyCredentials = () => {
    if (!createdUser) return;
    const text = `Email: ${createdUser.email}\nPassword: ${createdUser.password}`;
    navigator.clipboard.writeText(text);
    toast.success("Credentials copied to clipboard");
  };

  const handleDoneCreating = () => {
    setShowAddForm(false);
    setCreatedUser(null);
    setNewName("");
    setNewEmail("");
    // Refresh would be ideal but for now just close
    window.location.reload();
  };

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {users.length} agents in the network
          </p>
        </div>
        {!showAddForm && (
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Agent
          </Button>
        )}
      </div>

      {/* Add agent form */}
      {showAddForm && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Add New Agent</h2>
            <Button variant="ghost" size="sm" onClick={() => { setShowAddForm(false); setCreatedUser(null); setNewName(""); setNewEmail(""); }}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {!createdUser ? (
            <>
              <p className="text-sm text-muted-foreground">
                Enter their name and email. A password will be auto-generated for them.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Full Name *</Label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Maya Johnson"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Email *</Label>
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="maya@example.com"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => { setShowAddForm(false); setNewName(""); setNewEmail(""); }}>Cancel</Button>
                <Button onClick={handleCreateUser} disabled={creating}>
                  {creating ? "Creating..." : "Create Agent"}
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">Agent created successfully</span>
              </div>

              <div className="rounded-lg bg-background border border-border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Credentials</span>
                  <Button variant="ghost" size="sm" onClick={handleCopyCredentials}>
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    Copy
                  </Button>
                </div>
                <div className="space-y-1 font-mono text-sm">
                  <p><span className="text-muted-foreground">Name:</span> {createdUser.name}</p>
                  <p><span className="text-muted-foreground">Email:</span> {createdUser.email}</p>
                  <p><span className="text-muted-foreground">Password:</span> <span className="text-primary font-semibold">{createdUser.password}</span></p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Share these credentials with the agent. They can change their password later.
              </p>

              <div className="flex items-center gap-3">
                <Button onClick={handleDoneCreating}>Done</Button>
                <Button variant="outline" onClick={() => { setCreatedUser(null); setNewName(""); setNewEmail(""); }}>
                  Add Another
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* User list */}
      <div className="space-y-1">
        {filtered.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors group"
          >
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
              {user.name?.split(" ").map((n) => n[0]).join("").toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>

            <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Flame className="h-3 w-3 text-orange-400" />
                {user.streak}
              </span>
              <span className="font-medium text-foreground">{user.xp} XP</span>
            </div>

            <Badge variant="secondary" className={`text-[10px] capitalize hidden sm:inline-flex ${levelColors[user.level || "rookie"]}`}>
              {user.level?.replace("_", " ")}
            </Badge>

            <select
              className={`h-7 rounded-md border-0 px-2 text-[11px] font-medium cursor-pointer ${roleStyles[user.role] || roleStyles.agent}`}
              value={user.role}
              onChange={(e) => handleRoleChange(user.id, e.target.value)}
            >
              <option value="agent">Agent</option>
              <option value="captain">Captain</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No users match your search</p>
        )}
      </div>
    </div>
  );
}
