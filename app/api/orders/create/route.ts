import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, shipping, currency, userId } = body as {
      items: { id: string; title: string; price: number; qty: number }[];
      shipping: { name: string; phone: string; address: string };
      currency?: string;
      userId?: string;
    };

    if (!items?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const total = items.reduce((sum, x) => sum + Number(x.price) * Number(x.qty), 0);

    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: userId ?? null, // ✅ optional
        status: "pending",
        total,
        currency: currency || "USD",
        shipping_address: shipping,
      })
      .select("id")
      .single();

    if (orderErr) {
      return NextResponse.json({ error: orderErr.message }, { status: 500 });
    }

    const orderItems = items.map((x) => ({
      order_id: order.id,
      product_id: x.id,
      qty: x.qty,
      price_each: x.price,
      title_snapshot: x.title,
    }));

    const { error: itemsErr } = await supabaseAdmin.from("order_items").insert(orderItems);

    if (itemsErr) {
      return NextResponse.json({ error: itemsErr.message }, { status: 500 });
    }

    return NextResponse.json({ orderId: order.id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
