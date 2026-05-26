"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface NoteEditorPageProps {
  userId: string;
  existingNote?: {
    id: string;
    title: string;
    slug: string;
    content: string;
    published: boolean;
  };
}

export function NoteEditorPage({ userId, existingNote }: NoteEditorPageProps) {
  const [title, setTitle] = useState(existingNote?.title || "");
  const [content, setContent] = useState(existingNote?.content || "");
  const [published, setPublished] = useState(existingNote?.published || false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 60);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setSaving(true);
    const slug = existingNote?.slug || generateSlug(title);

    if (existingNote) {
      const { error } = await supabase
        .from("founders_notes")
        .update({ title, content, published, slug, updated_at: new Date().toISOString() })
        .eq("id", existingNote.id);

      if (error) {
        toast.error("Failed to update note");
        setSaving(false);
        return;
      }
      toast.success(published ? "Note published!" : "Draft saved");
    } else {
      const { error } = await supabase
        .from("founders_notes")
        .insert({ title, slug, content, published, author_id: userId });

      if (error) {
        toast.error("Failed to create note");
        setSaving(false);
        return;
      }
      toast.success(published ? "Note published!" : "Draft saved");
    }

    setSaving(false);
    router.push("/notes");
    router.refresh();
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background z-10">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/notes" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPublished(!published)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-md hover:bg-white/[0.04]"
            >
              {published ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              {published ? "Public" : "Draft"}
            </button>
            <Button
              onClick={handleSave}
              disabled={saving}
              size="sm"
              className="h-8 text-xs gap-1.5"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </header>

      {/* Editor */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
            className="text-2xl font-bold border-0 px-0 h-auto bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground/40"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note in markdown..."
            className="w-full min-h-[60vh] bg-transparent border-0 text-sm text-muted-foreground leading-relaxed resize-none focus:outline-none placeholder:text-muted-foreground/30 font-mono"
          />
        </motion.div>
      </main>
    </div>
  );
}
