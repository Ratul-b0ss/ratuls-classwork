"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/admin/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="card-dark p-8">
          <div className="text-center mb-8">
            <div className="w-10 h-10 rounded border border-[#2a2a2a] flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-sm font-semibold">CS</span>
            </div>
            <h1 className="text-sm font-medium text-white mb-1">Admin Login</h1>
            <p className="text-xs text-[#555]">Sign in to manage the portal</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="text-xs text-[#888] mb-1.5 block">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="input-dark w-full h-10 px-3 text-sm"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-xs text-[#888] mb-1.5 block">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="input-dark w-full h-10 px-3 text-sm"
              />
            </div>

            {error && (
              <div className="bg-[#141414] rounded px-3 py-2 border border-[#888]/30">
                <p className="text-xs text-[#888]">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-10 text-sm disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
