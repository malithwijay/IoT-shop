import { supabaseAdmin } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function getUserRole() {
  const cookieStore = cookies();

  const supabase = supabaseAdmin;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return profile?.role ?? null;
}
