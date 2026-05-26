import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ColdEmailsPage } from "@/components/cold-emails/cold-emails-page";

export default async function ColdEmailsRoute() {
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

  // Only admins and captains can access
  if (!profile || (profile.role !== "admin" && profile.role !== "captain")) {
    redirect("/");
  }

  const { data: emails } = await supabase
    .from("cold_emails")
    .select("*")
    .order("created_at", { ascending: false });

  return <ColdEmailsPage user={profile} emails={emails || []} />;
}
