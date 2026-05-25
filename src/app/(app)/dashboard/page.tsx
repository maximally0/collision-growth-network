import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [
    { data: profile },
    { data: engagementTasks },
    { data: peopleTasks },
    { data: postBriefs },
    { data: narrative },
    { data: submissions },
    { data: leaderboard },
  ] = await Promise.all([
    supabase.from("users").select("*").eq("id", user.id).single(),
    supabase
      .from("engagement_tasks")
      .select("*")
      .eq("archived", false)
      .gte("expires_at", new Date().toISOString())
      .order("priority", { ascending: false })
      .limit(5),
    supabase
      .from("people_tasks")
      .select("*")
      .eq("archived", false)
      .gte("expires_at", new Date().toISOString())
      .limit(5),
    supabase
      .from("post_briefs")
      .select("*")
      .gte("deadline", new Date().toISOString())
      .order("deadline", { ascending: true })
      .limit(3),
    supabase
      .from("narratives")
      .select("*")
      .eq("active", true)
      .single(),
    supabase
      .from("submissions")
      .select("*")
      .eq("user_id", user.id)
      .gte("submitted_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
    supabase
      .from("users")
      .select("id, name, xp, streak, level")
      .order("xp", { ascending: false })
      .limit(5),
  ]);

  return (
    <DashboardContent
      profile={profile}
      engagementTasks={engagementTasks || []}
      peopleTasks={peopleTasks || []}
      postBriefs={postBriefs || []}
      narrative={narrative}
      todaySubmissions={submissions || []}
      leaderboard={leaderboard || []}
    />
  );
}
