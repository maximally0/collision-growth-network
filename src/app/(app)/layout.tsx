import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  return (
    <div className="min-h-screen lg:pl-64">
      <MobileNav user={profile} />
      <Sidebar user={profile} />
      <main className="p-4 sm:p-6 lg:p-8" style={{ paddingBottom: "200px" }}>
        {children}
      </main>
    </div>
  );
}
