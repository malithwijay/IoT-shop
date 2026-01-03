import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

async function requireAdmin(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return { error: "Missing token", status: 401 as const };

  const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
  const user = userData?.user;

  if (userErr || !user) return { error: "Invalid token", status: 401 as const };

  const { data: profile, error: profErr } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profErr || !profile || profile.role !== "admin") {
    return { error: "Admin only", status: 403 as const };
  }

  return { user };
}

export async function GET(req: Request) {
  const check = await requireAdmin(req);
  if ("error" in check) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products: data ?? [] });
}
