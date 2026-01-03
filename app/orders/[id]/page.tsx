import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/server";

function statusBadge(status: string) {
  const s = (status || "").toLowerCase();

  if (s === "paid" || s === "completed") {
    return "bg-green-50 text-green-700 border-green-200";
  }
  if (s === "cancelled" || s === "canceled") {
    return "bg-red-50 text-red-700 border-red-200";
  }
  if (s === "shipped") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }
  return "bg-yellow-50 text-yellow-800 border-yellow-200"; // pending/default
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: orderId } = await params;

  const { data: order, error: orderErr } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (orderErr || !order) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <h1 className="text-2xl font-bold">Order not found</h1>
          <p className="mt-2 text-sm text-gray-600">
            This order does not exist or you don’t have access to it.
          </p>
          <Link
            href="/products"
            className="inline-flex mt-6 items-center justify-center rounded-xl bg-black text-white px-4 py-2.5 font-medium hover:opacity-90"
          >
            Go to products
          </Link>
        </div>
      </div>
    );
  }

  const { data: items } = await supabaseAdmin
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  const ship: any = order.shipping_address || {};
  const created = order.created_at
    ? new Date(order.created_at).toLocaleString()
    : "-";

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order confirmed</h1>
          <p className="mt-2 text-sm text-gray-600">
            Your order has been placed successfully.
          </p>
        </div>

        <div className="flex gap-3">
          <a
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-4 py-2.5 hover:bg-gray-50"
            href={`/api/orders/${orderId}/invoice`}
          >
            Download invoice (PDF)
          </a>

          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-xl bg-black text-white px-4 py-2.5 font-medium hover:opacity-90"
          >
            Continue shopping
          </Link>
        </div>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Items</h2>
              <span
                className={`text-xs font-medium border rounded-full px-3 py-1 ${statusBadge(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {items?.map((x: any) => (
                <div
                  key={x.id}
                  className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3 last:border-b-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{x.title_snapshot}</p>
                    <p className="text-xs text-gray-500">
                      Qty: {x.qty} × ${Number(x.price_each).toFixed(2)}
                    </p>
                  </div>

                  <p className="font-semibold">
                    ${(Number(x.price_each) * Number(x.qty)).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold">Shipping details</h2>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-gray-500 text-xs">Name</p>
                <p className="font-medium">{ship.name || "-"}</p>
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-gray-500 text-xs">Phone</p>
                <p className="font-medium">{ship.phone || "-"}</p>
              </div>

              <div className="rounded-xl border border-gray-200 p-4 sm:col-span-2">
                <p className="text-gray-500 text-xs">Address</p>
                <p className="font-medium">{ship.address || "-"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Summary */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold">Order summary</h2>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Order ID</span>
                <span className="font-medium break-all text-right">{order.id}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Date</span>
                <span className="font-medium">{created}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Currency</span>
                <span className="font-medium">{order.currency || "USD"}</span>
              </div>

              <div className="pt-3 border-t flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold">
                  ${Number(order.total).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <a
                href={`/api/orders/${orderId}/invoice`}
                className="inline-flex w-full items-center justify-center rounded-xl bg-black text-white px-4 py-2.5 font-medium hover:opacity-90"
              >
                Download invoice
              </a>

              <Link
                href="/cart"
                className="inline-flex w-full items-center justify-center rounded-xl border border-gray-200 px-4 py-2.5 hover:bg-gray-50"
              >
                Back to cart
              </Link>
            </div>

            <p className="mt-3 text-xs text-gray-500">
              Invoice is generated instantly from your order.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
