"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatRegisterError } from "@/lib/format-error";

export default function RecruiterSignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: fd.get("email"),
        password: fd.get("password"),
        role: "RECRUITER",
        orgName: fd.get("orgName"),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(formatRegisterError(data.error, data.detail));
      return;
    }
    router.push("/en/login");
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-bold text-white">Join as recruiter</h1>
      <p className="mt-2 text-sm text-white/60">
        Browse for free. Pay only when you unlock a talent&apos;s contact details.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="orgName">Organization / club name</Label>
          <Input id="orgName" name="orgName" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="email">Work email</Label>
          <Input id="email" name="email" type="email" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" minLength={8} required className="mt-1" />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating…" : "Create recruiter account"}
        </Button>
      </form>
    </div>
  );
}
