import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { NoteEditorPage } from "@/components/notes/note-editor-page";

export default async function EditNotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (user.email !== "rishulchanana36@gmail.com") {
    redirect("/notes");
  }

  const { data: note } = await supabase
    .from("founders_notes")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!note) {
    notFound();
  }

  return <NoteEditorPage userId={user.id} existingNote={note} />;
}
