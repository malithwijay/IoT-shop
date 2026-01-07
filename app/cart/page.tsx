"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type CartItem = {
  id: string;
  title: string;
  price: number;
  qty: number;
};

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    setItems(saved ? JSON.parse(saved) : []);
  }, []);

  const subtotal = useMemo(
    () => items.reduce((sum, x) => sum + Number(x.price) * Number(x.qty), 0),
    [items]
  );

  // For now: simple values (you can connect later)
  const shipping: number = items.length > 0 ? 0 : 0;

  const tax = 0;
  const total = subtotal + shipping + tax;

  const save = (next: CartItem[]) => {
    setItems(next);
    localStorage.setItem("cart", JSON.stringify(next));
    window.dispatchEvent(new Event("cart-changed"));
  };

  const inc = (id: string) => {
    save(items.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x)));
  };

  const dec = (id: string) => {
    save(
      items.map((x) =>
        x.id === id ? { ...x, qty: Math.max(1, x.qty - 1) } : x
      )
    );
  };

  const removeItem = (id: string) => {
    save(items.filter((x) => x.id !== id));
  };

  const clear = () => {
    save([]);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Your Cart</h1>
        <p className="mt-2 text-sm text-gray-600">
          Review your items and proceed to checkout.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <p className="text-lg font-semibold">Cart is empty</p>
          <p className="mt-1 text-sm text-gray-600">
            Add Arduino boards, sensors, and IoT parts to start an order.
          </p>

          <Link
            className="inline-flex mt-6 items-center justify-center rounded-xl bg-black text-white px-4 py-2.5 font-medium hover:opacity-90"
            href="/products"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {items.length} item{items.length > 1 ? "s" : ""}
              </p>

              <button
                onClick={clear}
                className="text-sm rounded-xl border border-gray-200 px-3 py-1.5 hover:bg-gray-50"
              >
                Clear cart
              </button>
            </div>

            {items.map((x) => (
              <div
                key={x.id}
                className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                {/* Left info */}
                <div className="min-w-0">
                  <p className="font-semibold text-lg truncate">{x.title}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    ${Number(x.price).toFixed(2)} each
                  </p>
                </div>

                {/* Right controls */}
                <div className="flex items-center justify-between sm:justify-end gap-4">
                  {/* Quantity stepper */}
                  <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => dec(x.id)}
                      className="px-3 py-2 hover:bg-gray-50"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <div className="px-4 py-2 text-sm font-medium min-w-[44px] text-center">
                      {x.qty}
                    </div>
                    <button
                      onClick={() => inc(x.id)}
                      className="px-3 py-2 hover:bg-gray-50"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-right min-w-[90px]">
                    <p className="font-semibold">
                      ${(Number(x.price) * Number(x.qty)).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeItem(x.id)}
                      className="text-xs text-gray-600 hover:text-black underline underline-offset-4"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <Link
                className="rounded-xl border border-gray-200 px-4 py-2.5 hover:bg-gray-50"
                href="/products"
              >
                Continue shopping
              </Link>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold">Order Summary</h2>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                  </span>
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

              <Link
                href="/checkout"
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-black text-white px-4 py-2.5 font-medium hover:opacity-90"
              >
                Checkout
              </Link>

              <p className="mt-3 text-xs text-gray-500">
                Taxes & shipping can be calculated later.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
