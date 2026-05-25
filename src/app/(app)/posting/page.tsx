import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PostingContent } from "@/components/posting/posting-content";

export default async function PostingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: briefs }, { data: narrative }, { data: submissions }] = await Promise.all([
    supabase
      .from("post_briefs")
      .select("*")
      .gte("deadline", new Date().toISOString())
      .order("deadline", { ascending: true }),
    supabase.from("narratives").select("*").eq("active", true).single(),
    supabase
      .from("submissions")
      .select("task_id")
      .eq("user_id", user.id)
      .eq("task_type", "post"),
  ]);

  const completedBriefIds = new Set(submissions?.map((s) => s.task_id) || []);

  return (
    <PostingContent
      briefs={briefs || []}
      narrative={narrative}
      completedBriefIds={completedBriefIds}
      userId={user.id}
    />
  );
}
