import ProductsGrid from "@/components/ProductsGrid";
import { supabaseAdmin } from "@/lib/supabase/server";

export default async function ProductsPage() {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-xl font-bold">Products</h1>
        <p className="mt-4 text-red-700">Error: {error.message}</p>
      </div>
    );
  }

  const products = Array.isArray(data) ? data : [];

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <p className="text-sm text-gray-600">
          Arduino boards, sensors, modules, and IoT accessories.
        </p>
      </div>

      <ProductsGrid products={products} />
    </div>
  );
}
