"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { signOut } from "@/lib/supabase/auth";

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={[
        "px-3 py-2 rounded-lg text-sm font-medium transition",
        active
          ? "bg-gray-100 text-black"
          : "text-gray-600 hover:text-black hover:bg-gray-50",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export default function Navbar() {
  const router = useRouter();

  const [email, setEmail] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  const initials = useMemo(
    () => (email ? email[0].toUpperCase() : "U"),
    [email]
  );

  const updateCartCount = () => {
    const saved = localStorage.getItem("cart");
    const cart = saved ? JSON.parse(saved) : [];
    const count = Array.isArray(cart)
      ? cart.reduce((s, x) => s + Number(x.qty || 0), 0)
      : 0;
    setCartCount(count);
  };

  const refreshRole = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data?.user) {
      setIsAdmin(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    setIsAdmin(profile?.role === "admin");
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });

    refreshRole();
    updateCartCount();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      refreshRole();
      updateCartCount();
    });

    window.addEventListener("cart-changed", updateCartCount);

    return () => {
      sub.subscription.unsubscribe();
      window.removeEventListener("cart-changed", updateCartCount);
    };
  }, []);

  const onLogout = async () => {
    await signOut();
    setMenuOpen(false);
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200">
      <nav className="w-full px-6 lg:px-12 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-black text-white flex items-center justify-center font-bold">
            IoT
          </div>
          <div className="leading-tight">
            <p className="font-bold">IoT Shop</p>
            <p className="text-xs text-gray-500">Arduino & sensors</p>
          </div>
        </Link>

        <div className="ml-10 hidden md:flex items-center gap-1">
          <NavLink href="/products" label="Products" />
          <NavLink href="/cart" label={`Cart (${cartCount})`} />
          <NavLink href="/checkout" label="Checkout" />
          {isAdmin && <NavLink href="/admin" label="Admin" />}
        </div>

        <div className="ml-auto relative">
          {!email ? (
            <div className="flex gap-2">
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-lg bg-black text-white text-sm"
              >
                Register
              </Link>
            </div>
          ) : (
            <button
              onClick={() => setMenuOpen((s) => !s)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border hover:bg-gray-50"
            >
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold">
                {initials}
              </div>
              <span className="hidden sm:block text-sm truncate max-w-[160px]">
                {email}
              </span>
              <span className="text-xs">▾</span>
            </button>
          )}

          {menuOpen && email && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border bg-white shadow-lg">
              <div className="p-3 border-b">
                <p className="text-xs text-gray-500">Signed in as</p>
                <p className="text-sm font-medium truncate">{email}</p>
              </div>

              <div className="p-2">
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    Admin dashboard
                  </Link>
                )}
                <Link
                  href="/cart"
                  className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Cart ({cartCount})
                </Link>
                <button
                  onClick={onLogout}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
