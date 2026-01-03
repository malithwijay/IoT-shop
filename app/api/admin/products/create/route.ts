import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ include image_url here
    const { title, description, price, stock, category, is_active, image_url } =
      body as {
        title: string;
        description?: string;
        price: number;
        stock: number;
        category?: string;
        is_active?: boolean;
        image_url?: string | null;
      };

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const p = Number(price);
    const s = Number(stock);

    if (Number.isNaN(p) || p < 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }

    if (!Number.isInteger(s) || s < 0) {
      return NextResponse.json({ error: "Invalid stock" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("products")
      .insert({
        title: title.trim(),
        description: description?.trim() || null,
        price: p,
        stock: s,
        category: category?.trim() || null,
        is_active: is_active ?? true,
        image_url: image_url ?? null, // ✅ now defined
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, product: data });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
