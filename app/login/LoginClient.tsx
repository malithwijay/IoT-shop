"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const next = searchParams.get("next") || "/products";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const onLogin = async () => {
    setMsg(null);

    if (!email.trim()) return setMsg("Please enter your email.");
    if (!password) return setMsg("Please enter your password.");

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) return setMsg(error.message);

    router.push(next);
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4 py-10 bg-gradient-to-b from-white to-gray-50">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-gray-600">
            Log in to continue shopping IoT parts.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-300"
                placeholder="you@email.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Password</label>

                {/* Optional: Later you can build /forgot-password */}
                <span className="text-xs text-gray-500">Forgot password?</span>
              </div>

              <div className="mt-1 flex items-center rounded-xl border border-gray-200 bg-white focus-within:ring-2 focus-within:ring-black/10 focus-within:border-gray-300">
                <input
                  className="w-full rounded-xl px-3 py-2 outline-none bg-transparent"
                  placeholder="••••••••"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="px-3 py-2 text-xs text-gray-600 hover:text-gray-900"
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {msg && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {msg}
              </div>
            )}

            <button
              className="w-full rounded-xl bg-black text-white py-2.5 font-medium hover:opacity-90 disabled:opacity-60"
              onClick={onLogin}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="text-center text-sm text-gray-600">
              Don’t have an account?{" "}
              <Link className="font-medium text-black hover:underline" href={`/register?next=${encodeURIComponent(next)}`}>
                Register
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          Secure login powered by Supabase.
        </div>
      </div>
    </div>
  );
}
