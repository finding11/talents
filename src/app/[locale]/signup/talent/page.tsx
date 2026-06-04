"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatRegisterError } from "@/lib/format-error";

export default function TalentSignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showGuardian, setShowGuardian] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const birthDate = fd.get("birthDate") as string;
    if (birthDate) {
      const bd = new Date(birthDate);
      const today = new Date();
      let age = today.getFullYear() - bd.getFullYear();
      const m = today.getMonth() - bd.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
      setShowGuardian(age < 18);
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: fd.get("email"),
        password: fd.get("password"),
        role: "TALENT",
        displayName: fd.get("displayName"),
        birthDate: birthDate || undefined,
        guardianEmail: fd.get("guardianEmail") || undefined,
        guardianName: fd.get("guardianName") || undefined,
        relationship: fd.get("relationship") || undefined,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(formatRegisterError(data.error, data.detail));
      return;
    }
    if (data.needsConsent && data.consentUrl) {
      alert(`Guardian must sign consent at: ${data.consentUrl}`);
    }
    router.push("/en/login");
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-bold text-white">Create your talent profile</h1>
      <p className="mt-2 text-sm text-white/60">Free forever — showcase your skills to scouts worldwide.</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="displayName">Display name</Label>
          <Input id="displayName" name="displayName" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="password">Password (min 8 characters)</Label>
          <Input id="password" name="password" type="password" minLength={8} required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="birthDate">Date of birth</Label>
          <Input
            id="birthDate"
            name="birthDate"
            type="date"
            className="mt-1"
            onChange={(e) => {
              if (!e.target.value) return;
              const bd = new Date(e.target.value);
              const today = new Date();
              let age = today.getFullYear() - bd.getFullYear();
              const m = today.getMonth() - bd.getMonth();
              if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
              setShowGuardian(age < 18);
            }}
          />
        </div>
        {showGuardian && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 space-y-3">
            <p className="text-sm text-amber-200">Parent/guardian consent required (under 18)</p>
            <div>
              <Label htmlFor="guardianName">Guardian full name</Label>
              <Input id="guardianName" name="guardianName" required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="relationship">Relationship</Label>
              <Input id="relationship" name="relationship" placeholder="Parent, legal guardian…" required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="guardianEmail">Guardian email</Label>
              <Input id="guardianEmail" name="guardianEmail" type="email" required className="mt-1" />
            </div>
          </div>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating…" : "Create profile"}
        </Button>
      </form>
    </div>
  );
}
