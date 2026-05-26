import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NoteEditorPage } from "@/components/notes/note-editor-page";

export default async function NewNotePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Only the founder can create notes
  if (user.email !== "rishulchanana36@gmail.com") {
    redirect("/notes");
  }

  return <NoteEditorPage userId={user.id} />;
}
