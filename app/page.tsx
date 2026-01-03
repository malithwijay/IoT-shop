import Link from "next/link";
import Image from "next/image";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/getUserRole";

type Product = {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  stock: number;
  category?: string | null;
  image_url?: string | null;
};

function ProductCard({ p }: { p: Product }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition">
      <div className="relative h-52 bg-gray-100">
        {p.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.image_url}
            alt={p.title}
            className="h-full w-full object-cover group-hover:scale-[1.04] transition-transform"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-500">
            No image
          </div>
        )}
      </div>

      <div className="p-5">
        <p className="font-semibold truncate">{p.title}</p>
        <p className="text-xs text-gray-500 mt-1">{p.category ?? "Uncategorized"}</p>

        <div className="mt-3 flex items-center justify-between">
          <p className="font-bold">${Number(p.price).toFixed(2)}</p>
          <Link href="/products" className="text-sm font-medium hover:underline">
            View →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const role = await getUserRole();
  const isAdmin = role === "admin";

  const { data: featured } = await supabaseAdmin
    .from("products")
    .select("id,title,price,stock,category,image_url,is_active,created_at")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(6);

  const starterTiles = [
    { t: "Starter Kit 1", s: "Boards", img: "/images/home/starter1.jpg" },
    { t: "Starter Kit 2", s: "Wi-Fi + BLE", img: "/images/home/starter2.jpg" },
    { t: "Starter Kit 3", s: "Motion / Temp", img: "/images/home/starter3.jpeg" },
  ];

  return (
    <main className="w-full bg-white">
      {/* HERO — tight spacing (no forced full-screen height) */}
      <section className="relative w-full overflow-hidden">
        {/* background blobs */}
        <div className="pointer-events-none absolute -top-40 -right-40 h-[520px] w-[520px] rounded-full bg-gray-100 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[520px] w-[520px] rounded-full bg-gray-100 blur-3xl" />

        {/* ✅ Reduce space under navbar */}
        <div className="relative w-full px-6 md:px-16 xl:px-24 pt-10 md:pt-12 pb-8 md:pb-10">
          <div className="grid w-full grid-cols-1 xl:grid-cols-2 gap-10 xl:gap-14 items-center">
            {/* LEFT */}
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-1 text-xs">
                ⚡ Fast delivery • Genuine parts • Best prices
              </span>

              <h1 className="mt-5 text-4xl md:text-5xl xl:text-6xl font-bold leading-tight">
                Build smarter with <span className="text-gray-500">IoT parts</span>
              </h1>

              <p className="mt-4 text-base md:text-lg text-gray-600 max-w-xl">
                Arduino, ESP32, sensors, robotics and modules for your next innovation.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/products"
                  className="rounded-xl bg-black px-6 py-3 text-white font-medium text-center hover:opacity-90"
                >
                  Shop products
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    className="rounded-xl border px-6 py-3 font-medium text-center hover:bg-gray-50"
                  >
                    Admin dashboard
                  </Link>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {["Arduino", "ESP32", "Sensors", "Modules", "Robotics"].map((c) => (
                  <Link
                    key={c}
                    href={`/products?category=${encodeURIComponent(c)}`}
                    className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    {c}
                  </Link>
                ))}
              </div>
            </div>

            {/* RIGHT */}
            <div className="rounded-3xl border bg-white p-6 md:p-7 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs text-gray-500">Limited offer</p>
                  <p className="text-2xl font-bold">Starter kits</p>
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs">
                  Up to 20% OFF
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {starterTiles.map((x) => (
                  <div key={x.t} className="rounded-2xl border bg-gray-50 p-4">
                    <div className="relative h-24 mb-3 rounded-xl overflow-hidden bg-gray-100">
                      <Image
                        src={x.img}
                        alt={x.t}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 33vw, 220px"
                      />
                    </div>
                    <p className="font-semibold text-sm">{x.t}</p>
                    <p className="text-xs text-gray-500">{x.s}</p>
                  </div>
                ))}
              </div>

              <Link
                href="/products"
                className="mt-6 block w-full rounded-2xl bg-black py-3 text-center text-white font-medium hover:opacity-90"
              >
                Browse best sellers
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED — reduce top/bottom spacing */}
      <section className="w-full px-6 md:px-16 xl:px-24 pt-6 pb-10">
        <div className="flex justify-between items-end gap-4 mb-5">
          <div>
            <h2 className="text-3xl font-bold">Featured products</h2>
            <p className="text-gray-600 mt-1">Popular picks for makers</p>
          </div>
          <Link href="/products" className="font-medium hover:underline">
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {(featured ?? []).map((p: any) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </section>
    </main>
  );
}
