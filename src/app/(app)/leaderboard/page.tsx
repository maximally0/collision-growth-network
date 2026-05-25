import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LeaderboardContent } from "@/components/leaderboard/leaderboard-content";

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: agents } = await supabase
    .from("users")
    .select("id, name, xp, streak, level, avatar_url")
    .order("xp", { ascending: false });

  return (
    <LeaderboardContent agents={agents || []} currentUserId={user.id} />
  );
}
