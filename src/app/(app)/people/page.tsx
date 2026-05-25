import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PeopleContent } from "@/components/people/people-content";

export default async function PeoplePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get all agents who have filled out their pitch (excluding current user)
  const { data: agents } = await supabase
    .from("users")
    .select("id, name, linkedin_url, pitch, niche_tags, role_title, level, xp, streak")
    .neq("id", user.id)
    .not("pitch", "is", null)
    .not("linkedin_url", "is", null);

  // Get which agents the current user has already connected with (submitted proof for)
  const { data: submissions } = await supabase
    .from("submissions")
    .select("task_id")
    .eq("user_id", user.id)
    .eq("task_type", "people");

  const connectedIds = new Set(submissions?.map((s) => s.task_id) || []);

  // Shuffle the agents randomly
  const shuffled = (agents || []).sort(() => Math.random() - 0.5);

  return (
    <PeopleContent
      agents={shuffled}
      connectedIds={connectedIds}
      userId={user.id}
    />
  );
}
