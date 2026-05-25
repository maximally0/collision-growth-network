"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings, User, FileText, Save, Users, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/types/database";

type UserProfile = Database["public"]["Tables"]["users"]["Row"];

interface SettingsContentProps {
  profile: UserProfile | null;
}

export function SettingsContent({ profile }: SettingsContentProps) {
  const [name, setName] = useState(profile?.name || "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedin_url || "");
  const [roleTitle, setRoleTitle] = useState(profile?.role_title || "");
  const [pitch, setPitch] = useState(profile?.pitch || "");
  const [nicheTags, setNicheTags] = useState<string[]>(profile?.niche_tags || []);
  const [tagInput, setTagInput] = useState("");
  const [personalityMd, setPersonalityMd] = useState(profile?.personality_md || "");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);

    const { error } = await supabase
      .from("users")
      .update({
        name,
        linkedin_url: linkedinUrl,
        role_title: roleTitle,
        pitch,
        niche_tags: nicheTags,
        personality_md: personalityMd,
      })
      .eq("id", profile.id);

    if (error) {
      toast.error("Failed to save settings");
    } else {
      toast.success("Settings saved!");
    }
    setSaving(false);
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !nicheTags.includes(tag) && nicheTags.length < 5) {
      setNicheTags([...nicheTags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setNicheTags(nicheTags.filter((t) => t !== tag));
  };

  const generatePersonalityTemplate = () => {
    const template = `# Personality Profile

## Voice & Tone
- Writing style: [lowercase/normal]
- Post length: [short-form/long-form]
- Emoji usage: [none/minimal/frequent]
- Formatting: [line breaks heavy/paragraph style]
- Approach: [storytelling/direct/mixed]

## Personality
- Energy: [loud/calm/chaotic]
- Humor: [funny/serious/dry wit]
- Vibe: [founder/operator/builder/creative]
- Depth: [intellectual/relatable/both]
- Polish: [polished/raw/authentic mess]

## Content Pillars
1. [Topic 1]
2. [Topic 2]
3. [Topic 3]

## Background
- Building: [what you're working on]
- Struggle: [biggest challenge]
- Passion: [what excites you]

## Inspirations
- [Creator 1]
- [Creator 2]
- [Creator 3]

## Audience
- Target: [who you want to attract]
- Value: [what you offer them]

## Rules
- Never post about: [topics to avoid]
- Hook style: [question/bold claim/story opener]
- CTA style: [soft ask/direct/none]
- Vocabulary: [words you naturally use]
`;
    setPersonalityMd(template);
    toast.success("Template loaded! Fill in your details.");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-7 w-7" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your profile, network presence, and personality.
        </p>
      </div>

      {/* Profile Settings */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-title">Role / Title</Label>
              <Input
                id="role-title"
                placeholder="e.g. Founder @ BuildFast"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input
              id="linkedin"
              placeholder="https://linkedin.com/in/yourprofile"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Level: <span className="text-foreground capitalize">{profile?.level?.replace("_", " ")}</span></span>
            <span>XP: <span className="text-foreground">{profile?.xp}</span></span>
            <span>Streak: <span className="text-foreground">{profile?.streak} days</span></span>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Network Profile — shows up in People Missions */}
      <Card className="border-purple-500/30 bg-purple-500/5">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-400" />
            Network Profile
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            This is what other agents see in the People section. Fill this out to appear in the network.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pitch">Your Pitch</Label>
            <Textarea
              id="pitch"
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              placeholder="Why should someone connect with you? What are you building? What value do you bring to the network?"
              className="min-h-[100px]"
              maxLength={280}
            />
            <p className="text-xs text-muted-foreground text-right">{pitch.length}/280</p>
          </div>

          <div className="space-y-2">
            <Label>Niche Tags (up to 5)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. ai founder, content creator"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
              />
              <Button variant="outline" size="sm" onClick={addTag} disabled={nicheTags.length >= 5}>
                Add
              </Button>
            </div>
            {nicheTags.length > 0 && (
              <div className="flex gap-1.5 flex-wrap mt-2">
                {nicheTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs flex items-center gap-1">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {(!linkedinUrl || !pitch) && (
            <p className="text-xs text-orange-400">
              ⚠ Fill in your LinkedIn URL and pitch to appear in the People section.
            </p>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Personality.md */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              personality.md
            </CardTitle>
            <Button variant="outline" size="sm" onClick={generatePersonalityTemplate}>
              Load Template
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            This defines your unique voice. Post briefs will be personalized based on this.
          </p>
        </CardHeader>
        <CardContent>
          <Textarea
            value={personalityMd}
            onChange={(e) => setPersonalityMd(e.target.value)}
            placeholder="Define your writing style, personality, content pillars, and voice..."
            className="min-h-[400px] font-mono text-sm"
          />
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
