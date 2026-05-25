import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  // Verify the caller is an admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if ((profile as any)?.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  // Parse request
  const { email, name } = await request.json();

  if (!email || !name) {
    return NextResponse.json({ error: "Email and name required" }, { status: 400 });
  }

  // Generate a password: first 4 chars of name (lowercase) + random 4 digits
  const namePrefix = name.replace(/\s/g, "").toLowerCase().slice(0, 4);
  const randomDigits = Math.floor(1000 + Math.random() * 9000).toString();
  const generatedPassword = `${namePrefix}${randomDigits}`;

  // Use service role to create the user
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: authData, error: authError } = await serviceClient.auth.admin.createUser({
    email,
    password: generatedPassword,
    email_confirm: true,
    user_metadata: { name },
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  if (authData.user) {
    // Create the public profile
    const { error: profileError } = await serviceClient
      .from("users")
      .insert({
        id: authData.user.id,
        name,
        email,
        role: "agent",
        streak: 0,
        xp: 0,
        level: "rookie",
      });

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }
  }

  return NextResponse.json({
    success: true,
    user: {
      id: authData.user?.id,
      email,
      name,
      password: generatedPassword,
    },
  });
}
