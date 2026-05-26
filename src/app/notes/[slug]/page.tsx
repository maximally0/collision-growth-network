import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { NoteDetailPage } from "@/components/notes/note-detail-page";

export default async function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const isFounder = user.email === "rishulchanana36@gmail.com";

  // Founder can see all notes, others only published
  let query = supabase.from("founders_notes").select("*").eq("slug", slug).single();
  if (!isFounder) {
    query = supabase.from("founders_notes").select("*").eq("slug", slug).eq("published", true).single();
  }

  const { data: note } = await query;

  if (!note) {
    notFound();
  }

  return <NoteDetailPage note={note} isFounder={isFounder} />;
}
