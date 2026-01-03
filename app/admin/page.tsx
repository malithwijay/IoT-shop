"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type ProductRow = {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  stock: number;
  category?: string | null;
  is_active: boolean;
  image_url?: string | null;
};

export default function AdminPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // create form
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // list/edit/delete
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [editing, setEditing] = useState<ProductRow | null>(null);

  // ✅ edit image state
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const getToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  };

  // ✅ Admin gate (CLIENT)
  useEffect(() => {
    const run = async () => {
      setChecking(true);

      const { data: userData, error: userErr } = await supabase.auth.getUser();
      const user = userData?.user;

      if (userErr || !user) {
        router.replace("/login?next=/admin");
        return;
      }

      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const admin = !profileErr && profile?.role === "admin";

      if (!admin) {
        // ✅ not admin => block
        router.replace("/products"); // change if you prefer "/"
        return;
      }

      setIsAdmin(true);
      setChecking(false);

      await loadProducts();
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // ✅ safe JSON parsing
  const loadProducts = async () => {
    setMsg(null);

    const token = await getToken();
    if (!token) return;

    const res = await fetch("/api/admin/products", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const text = await res.text();

    let json: any = null;
    try {
      json = JSON.parse(text);
    } catch {
      setMsg(
        "API error: /api/admin/products returned non-JSON. Check app/api/admin/products/route.ts"
      );
      return;
    }

    if (!res.ok) {
      setMsg(json.error || "Failed to load products");
      return;
    }

    setProducts(json.products || []);
  };

  const uploadImageIfAny = async (file: File | null): Promise<string | null> => {
    if (!file) return null;

    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "image/jpeg",
      });

    if (uploadError) throw new Error(uploadError.message);

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return data.publicUrl || null;
  };

  const createProduct = async () => {
    setMsg(null);

    if (!title.trim()) return setMsg("Please enter a title.");
    if (price < 0) return setMsg("Price must be 0 or more.");
    if (stock < 0) return setMsg("Stock must be 0 or more.");

    setLoading(true);

    try {
      const token = await getToken();
      if (!token) {
        setLoading(false);
        router.replace("/login?next=/admin");
        return;
      }

      const imageUrl = await uploadImageIfAny(imageFile);

      const res = await fetch("/api/admin/products/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          category,
          price,
          stock,
          description,
          is_active: isActive,
          image_url: imageUrl,
        }),
      });

      const text = await res.text();
      let json: any = null;

      try {
        json = JSON.parse(text);
      } catch {
        setLoading(false);
        setMsg("Create API returned non-JSON. Check /api/admin/products/create.");
        return;
      }

      setLoading(false);

      if (!res.ok) {
        setMsg(json.error || "Failed to create product");
        return;
      }

      // reset form
      setTitle("");
      setCategory("");
      setPrice(0);
      setStock(0);
      setDescription("");
      setIsActive(true);
      setImageFile(null);
      setImagePreview(null);

      setMsg("✅ Product created!");
      await loadProducts();
    } catch (e: any) {
      setLoading(false);
      setMsg(e?.message || "Upload/Create failed");
    }
  };

  const updateProduct = async (id: string, patch: Partial<ProductRow>) => {
    setMsg(null);

    const token = await getToken();
    if (!token) return;

    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(patch),
    });

    const text = await res.text();
    let json: any = null;

    try {
      json = JSON.parse(text);
    } catch {
      setMsg(
        "Update API returned non-JSON. Check app/api/admin/products/[id]/route.ts"
      );
      return;
    }

    if (!res.ok) {
      setMsg(json.error || "Update failed");
      return;
    }

    setMsg("✅ Product updated");
    setEditing(null);

    // ✅ clear edit image state
    setEditImageFile(null);
    setEditImagePreview(null);

    await loadProducts();
  };

  const deleteProduct = async (id: string) => {
    const ok = confirm("Delete this product?");
    if (!ok) return;

    setMsg(null);

    const token = await getToken();
    if (!token) return;

    const res = await fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const text = await res.text();
    let json: any = null;

    try {
      json = JSON.parse(text);
    } catch {
      setMsg(
        "Delete API returned non-JSON. Check app/api/admin/products/[id]/route.ts"
      );
      return;
    }

    if (!res.ok) {
      setMsg(json.error || "Delete failed");
      return;
    }

    setMsg("🗑️ Product deleted");
    await loadProducts();
  };

  if (checking) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          Checking admin access...
        </div>
      </div>
    );
  }

  // (If not admin, we already redirected. This is just a safe fallback.)
  if (!isAdmin) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Create, edit, and delete products.
        </p>
      </div>

      {/* Create product */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-semibold">Create product</h2>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700">
              Product image
            </label>
            <div className="mt-1 flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  setImageFile(f);
                  setImagePreview(f ? URL.createObjectURL(f) : null);
                }}
                className="block w-full text-sm"
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-16 w-16 rounded-xl border object-cover"
                />
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              JPG/PNG/WebP recommended. Keep under ~1–2MB.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Title</label>
            <input
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Arduino Uno R3"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Category</label>
            <input
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Arduino / Sensors / Modules"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              min={0}
              step="0.01"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Stock</label>
            <input
              type="number"
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              min={0}
              step="1"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              className="mt-1 w-full min-h-[110px] rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short product description..."
            />
          </div>

          <div className="md:col-span-2 flex items-center gap-3">
            <input
              id="active"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <label htmlFor="active" className="text-sm text-gray-700">
              Active (show on products page)
            </label>
          </div>
        </div>

        {msg && (
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
            {msg}
          </div>
        )}

        <button
          onClick={createProduct}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-black text-white py-2.5 font-medium hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create product"}
        </button>
      </div>

      {/* List + edit + delete */}
      <div className="mt-8 bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">All products</h2>
          <button
            onClick={loadProducts}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>

        {products.length === 0 ? (
          <p className="mt-4 text-sm text-gray-600">No products yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {products.map((p) => (
              <div
                key={p.id}
                className="border border-gray-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl border bg-gray-50 overflow-hidden flex items-center justify-center">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] text-gray-400">No img</span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold truncate">{p.title}</p>
                    <p className="text-xs text-gray-500">
                      ${Number(p.price).toFixed(2)} • Stock {p.stock} •{" "}
                      {p.is_active ? "Active" : "Hidden"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditing(p);
                      setEditImageFile(null);
                      setEditImagePreview(null);
                    }}
                    className="rounded-xl border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteProduct(p.id)}
                    className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit modal */}
        {editing && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Edit product</h3>
                <button
                  onClick={() => {
                    setEditing(null);
                    setEditImageFile(null);
                    setEditImagePreview(null);
                  }}
                  className="text-sm text-gray-500 hover:text-black"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {/* ✅ Edit Image */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Product image
                  </label>

                  <div className="mt-2 flex items-center gap-4">
                    <div className="h-16 w-16 rounded-xl border bg-gray-50 overflow-hidden flex items-center justify-center">
                      {editImagePreview ? (
                        <img
                          src={editImagePreview}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      ) : editing.image_url ? (
                        <img
                          src={editing.image_url}
                          alt="Current"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] text-gray-400">No img</span>
                      )}
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0] || null;
                        setEditImageFile(f);
                        setEditImagePreview(f ? URL.createObjectURL(f) : null);
                      }}
                      className="block w-full text-sm"
                    />
                  </div>

                  <p className="mt-1 text-xs text-gray-500">
                    Choose a new image to replace the current one.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Title</label>
                  <input
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
                    value={editing.title}
                    onChange={(e) =>
                      setEditing({ ...editing, title: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Price
                    </label>
                    <input
                      type="number"
                      className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
                      value={editing.price}
                      onChange={(e) =>
                        setEditing({ ...editing, price: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Stock
                    </label>
                    <input
                      type="number"
                      className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
                      value={editing.stock}
                      onChange={(e) =>
                        setEditing({ ...editing, stock: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={editing.is_active}
                    onChange={(e) =>
                      setEditing({ ...editing, is_active: e.target.checked })
                    }
                  />
                  Active (visible on products page)
                </label>

                {/* ✅ Save changes uploads image if selected */}
                <button
                  onClick={async () => {
                    let newImageUrl: string | null | undefined = undefined;

                    if (editImageFile) {
                      try {
                        newImageUrl = await uploadImageIfAny(editImageFile);
                      } catch (e: any) {
                        setMsg(e?.message || "Image upload failed");
                        return;
                      }
                    }

                    await updateProduct(editing.id, {
                      title: editing.title,
                      price: editing.price,
                      stock: editing.stock,
                      is_active: editing.is_active,
                      ...(newImageUrl !== undefined
                        ? { image_url: newImageUrl }
                        : {}),
                    });
                  }}
                  className="mt-2 w-full rounded-xl bg-black text-white py-2.5 font-medium hover:opacity-90"
                >
                  Save changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
