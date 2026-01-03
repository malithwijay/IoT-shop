import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params;

  // Fetch order
  const { data: order, error: orderErr } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (orderErr || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Fetch items
  const { data: items, error: itemsErr } = await supabaseAdmin
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  if (itemsErr || !items) {
    return NextResponse.json({ error: "Order items not found" }, { status: 404 });
  }

  // Create PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  let y = 800;
  const left = 50;

  const draw = (text: string, size = 12) => {
    page.drawText(text, { x: left, y, size, font });
    y -= size + 6;
  };

  // Header
  draw("IoT Shop - Invoice", 18);
  y -= 6;

  draw(`Order ID: ${orderId}`, 12);
  draw(`Status: ${order.status}`, 12);
  draw(`Date: ${new Date(order.created_at).toLocaleString()}`, 12);
  y -= 10;

  // Shipping
  const ship: any = order.shipping_address || {};
  draw("Shipping Details:", 13);
  draw(`Name: ${ship.name || "-"}`, 12);
  draw(`Phone: ${ship.phone || "-"}`, 12);
  draw(`Address: ${ship.address || "-"}`, 12);
  y -= 10;

  // Items
  draw("Items:", 13);
  y -= 4;

  let total = 0;
  for (const it of items as any[]) {
    const lineTotal = Number(it.price_each) * Number(it.qty);
    total += lineTotal;

    // Wrap long names a bit (simple)
    const line = `${it.title_snapshot}  x${it.qty}  @ ${Number(it.price_each).toFixed(
      2
    )}  = ${lineTotal.toFixed(2)}`;
    draw(line, 11);

    // if page gets too low, create a new page
    if (y < 80) {
      y = 800;
      pdfDoc.addPage([595.28, 841.89]);
    }
  }

  y -= 10;
  draw(`Total: ${total.toFixed(2)} ${order.currency}`, 14);
  y -= 10;
  draw("Thank you for your purchase!", 11);

  const pdfBytes = await pdfDoc.save();

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${orderId}.pdf"`,
    },
  });
}
