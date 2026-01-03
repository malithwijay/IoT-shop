"use client";

import { useMemo, useState } from "react";
import AddToCartButton from "@/components/AddToCartButton";

type Product = {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  stock: number;
  category?: string | null;
  image_url?: string | null; // ✅ added
};

export default function ProductsGrid({
  products = [],
}: {
  products?: Product[];
}) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      if (p?.category) set.add(p.category);
    }
    return ["all", ...Array.from(set).sort()];
  }, [products]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return products.filter((p) => {
      const matchesQuery =
        !query ||
        (p.title ?? "").toLowerCase().includes(query) ||
        (p.description ?? "").toLowerCase().includes(query);

      const matchesCategory =
        category === "all" || (p.category ?? "") === category;

      return matchesQuery && matchesCategory;
    });
  }, [products, q, category]);

  return (
    <>
      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search Arduino, sensors, ESP32..."
            className="w-full md:w-[360px] rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-300"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full md:w-[220px] rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-300"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All categories" : c}
              </option>
            ))}
          </select>
        </div>

        <div className="text-sm text-gray-600">
          Showing{" "}
          <span className="font-medium text-gray-900">{filtered.length}</span>{" "}
          items
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="border border-gray-200 rounded-2xl p-8 bg-white">
          <p className="font-semibold">No products found</p>
          <p className="text-sm text-gray-600 mt-1">
            Try a different search or select another category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="group bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* ✅ Image */}
              <div className="h-44 bg-gray-50 overflow-hidden flex items-center justify-center">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="text-xs text-gray-500 border rounded-full px-3 py-1 bg-white">
                    No image
                  </div>
                )}
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-lg leading-snug truncate">
                      {p.title}
                    </h2>
                    <p className="mt-1 text-xs text-gray-500">
                      {p.category ?? "Uncategorized"}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-bold text-lg">
                      ${Number(p.price).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {p.stock > 0 ? `Stock: ${p.stock}` : "Out of stock"}
                    </p>
                  </div>
                </div>

                {p.description && (
                  <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                    {p.description}
                  </p>
                )}

                <div className="mt-4">
                  <AddToCartButton product={p as any} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
