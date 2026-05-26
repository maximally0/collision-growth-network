import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NotesListPage } from "@/components/notes/notes-list-page";

export default async function NotesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: notes } = await supabase
    .from("founders_notes")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  // Check if this user is the founder (can create notes)
  const isFounder = user.email === "rishulchanana36@gmail.com";

  // If founder, also get drafts
  let drafts: any[] = [];
  if (isFounder) {
    const { data } = await supabase
      .from("founders_notes")
      .select("*")
      .eq("published", false)
      .order("created_at", { ascending: false });
    drafts = data || [];
  }

  return (
    <NotesListPage
      user={profile}
      notes={notes || []}
      drafts={drafts}
      isFounder={isFounder}
    />
  );
}
