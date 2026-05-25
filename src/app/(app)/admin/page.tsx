import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if ((profile as any)?.role !== "admin") {
    redirect("/dashboard");
  }

  const [
    { data: pendingSubmissions },
    { data: users },
    { data: engagementTasks },
    { data: peopleTasks },
    { data: narratives },
    { data: postBriefs },
  ] = await Promise.all([
    supabase
      .from("submissions")
      .select("*")
      .eq("status", "pending")
      .order("submitted_at", { ascending: false }),
    supabase.from("users").select("*").order("xp", { ascending: false }),
    supabase.from("engagement_tasks").select("*").order("created_at", { ascending: false }).limit(50),
    supabase.from("people_tasks").select("*").order("created_at", { ascending: false }).limit(50),
    supabase.from("narratives").select("*").order("created_at", { ascending: false }),
    supabase.from("post_briefs").select("*").order("created_at", { ascending: false }).limit(50),
  ]);

  return (
    <AdminShell
      pendingSubmissions={pendingSubmissions || []}
      users={users || []}
      engagementTasks={engagementTasks || []}
      peopleTasks={peopleTasks || []}
      narratives={narratives || []}
      postBriefs={postBriefs || []}
    />
  );
}
