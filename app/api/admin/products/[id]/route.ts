import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const update: any = {};

    if (body.title !== undefined) update.title = String(body.title).trim();
    if (body.description !== undefined)
      update.description = body.description ? String(body.description) : null;

    if (body.category !== undefined)
      update.category = body.category ? String(body.category) : null;

    if (body.image_url !== undefined)
      update.image_url = body.image_url ? String(body.image_url) : null;

    if (body.is_active !== undefined) update.is_active = !!body.is_active;

    if (body.price !== undefined) {
      const p = Number(body.price);
      if (Number.isNaN(p) || p < 0) {
        return NextResponse.json({ error: "Invalid price" }, { status: 400 });
      }
      update.price = p;
    }

    if (body.stock !== undefined) {
      const s = Number(body.stock);
      if (!Number.isInteger(s) || s < 0) {
        return NextResponse.json({ error: "Invalid stock" }, { status: 400 });
      }
      update.stock = s;
    }

    const { data, error } = await supabaseAdmin
      .from("products")
      .update(update)
      .eq("id", id)
      .select("*")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, product: data }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabaseAdmin.from("products").delete().eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
