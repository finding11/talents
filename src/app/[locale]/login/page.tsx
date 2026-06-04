"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RoleToggle, type AccountRole } from "@/components/role-toggle";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/en/dashboard";
  const authError = searchParams.get("error");
  const defaultRole: AccountRole =
    searchParams.get("role") === "recruiter" ? "RECRUITER" : "TALENT";

  const [role, setRole] = useState<AccountRole>(defaultRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    authError === "CredentialsSignin"
      ? "Invalid email or password"
      : authError
        ? "Sign in failed. Please try again."
        : ""
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Invalid email or password");
        setLoading(false);
        return;
      }

      window.location.assign(callbackUrl.startsWith("/") ? callbackUrl : "/en/dashboard");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  const signupHref =
    role === "RECRUITER"
      ? ({ pathname: "/signup" as const, query: { role: "recruiter" } })
      : ({ pathname: "/signup" as const, query: { role: "talent" } });

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-white">Welcome back</h1>
      <p className="mt-2 text-sm text-white/60">Sign in to your Finding11 account</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <RoleToggle role={role} onChange={setRole} />

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1"
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : role === "TALENT" ? "Sign in as talent" : "Sign in as recruiter"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-white/50">
        New here?{" "}
        <Link href={signupHref} className="text-pitch-400 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
