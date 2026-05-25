import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { EngageContent } from "@/components/engage/engage-content";

export default async function EngagePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: tasks } = await supabase
    .from("engagement_tasks")
    .select("*")
    .eq("archived", false)
    .gte("expires_at", new Date().toISOString())
    .order("priority", { ascending: false });

  const { data: submissions } = await supabase
    .from("submissions")
    .select("task_id")
    .eq("user_id", user.id)
    .eq("task_type", "engagement");

  const completedTaskIds = new Set(submissions?.map((s) => s.task_id) || []);

  return (
    <EngageContent
      tasks={tasks || []}
      completedTaskIds={completedTaskIds}
      userId={user.id}
    />
  );
}
