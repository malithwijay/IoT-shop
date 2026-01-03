"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type CartItem = { id: string; title: string; price: number; qty: number };

export default function CheckoutPage() {
  const router = useRouter();

  const [items, setItems] = useState<CartItem[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    setItems(saved ? JSON.parse(saved) : []);
  }, []);

  const subtotal = useMemo(
    () => items.reduce((sum, x) => sum + Number(x.price) * Number(x.qty), 0),
    [items]
  );

  // Simple for now
  const shipping = items.length > 0 ? 0 : 0;
  const tax = 0;
  const total = subtotal + shipping + tax;

  const placeOrder = async () => {
    setMsg(null);

    if (!name.trim()) return setMsg("Please enter your name.");
    if (!phone.trim()) return setMsg("Please enter your phone number.");
    if (!address.trim()) return setMsg("Please enter your address.");

    setLoading(true);

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    const user = userData?.user;

    if (userErr || !user) {
      setLoading(false);
      router.push(`/login?next=/checkout`);
      return;
    }

    const res = await fetch("/api/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items,
        shipping: { name, phone, address },
        currency: "USD",
        userId: user.id,
      }),
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMsg(json.error || "Failed to create order");
      return;
    }

    localStorage.removeItem("cart");
    window.dispatchEvent(new Event("cart-changed"));
    router.push(`/orders/${json.orderId}`);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
          <p className="mt-2 text-sm text-gray-600">
            Your cart is empty. Add products before checkout.
          </p>

          <button
            onClick={() => router.push("/products")}
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-black text-white px-4 py-2.5 font-medium hover:opacity-90"
          >
            Go to products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
        <p className="mt-2 text-sm text-gray-600">
          Enter shipping details and place your order.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shipping form */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold">Shipping details</h2>
            <p className="mt-1 text-sm text-gray-600">
              We’ll use this information to deliver your items.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Full name</label>
                <input
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-300"
                  placeholder="e.g. Dilan Perera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <input
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-300"
                  placeholder="e.g. +94 77 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Address</label>
                <textarea
                  className="mt-1 w-full min-h-[100px] rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-300"
                  placeholder="Street, city, district, postal code"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              {msg && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {msg}
                </div>
              )}

              <button
                onClick={placeOrder}
                disabled={loading}
                className="w-full rounded-xl bg-black text-white py-2.5 font-medium hover:opacity-90 disabled:opacity-60"
              >
                {loading ? "Placing order..." : "Place order"}
              </button>

              <p className="text-xs text-gray-500">
                Payments can be added later (Stripe/PayHere).
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold">Order summary</h2>

            <div className="mt-4 space-y-3 text-sm">
              {items.map((x) => (
                <div key={x.id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{x.title}</p>
                    <p className="text-xs text-gray-500">
                      {x.qty} × ${Number(x.price).toFixed(2)}
                    </p>
                  </div>
                  <p className="font-medium">
                    ${(Number(x.price) * Number(x.qty)).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>

              <div className="pt-3 border-t flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => router.push("/cart")}
              className="mt-6 w-full rounded-xl border border-gray-200 px-4 py-2.5 hover:bg-gray-50"
            >
              Back to cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
