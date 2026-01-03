"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const onRegister = async () => {
    setMsg(null);

    if (!fullName.trim()) return setMsg("Please enter your name.");
    if (!email.trim()) return setMsg("Please enter your email.");
    if (password.length < 6) return setMsg("Password must be at least 6 characters.");

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    setLoading(false);

    if (error) return setMsg(error.message);

    // If email confirmation is ON, user may need to confirm.
    router.push("/login");
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4 py-10 bg-gradient-to-b from-white to-gray-50">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Buy Arduino & IoT parts with a modern shopping experience.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Full name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Dilan Perera"
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-300"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                type="email"
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-300"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 flex items-center rounded-xl border border-gray-200 bg-white focus-within:ring-2 focus-within:ring-black/10 focus-within:border-gray-300">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  type={showPw ? "text" : "password"}
                  className="w-full rounded-xl px-3 py-2 outline-none bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="px-3 py-2 text-xs text-gray-600 hover:text-gray-900"
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">Minimum 6 characters.</p>
            </div>

            {msg && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {msg}
              </div>
            )}

            <button
              onClick={onRegister}
              disabled={loading}
              className="w-full rounded-xl bg-black text-white py-2.5 font-medium hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create account"}
            </button>

            <div className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link className="font-medium text-black hover:underline" href="/login">
                Login
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          By continuing, you agree to our Terms & Privacy Policy.
        </div>
      </div>
    </div>
  );
}
