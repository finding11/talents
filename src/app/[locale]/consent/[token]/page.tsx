"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ConsentPage() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch(`/api/consent/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guardianName: fd.get("guardianName"),
        relationship: fd.get("relationship"),
        email: fd.get("email"),
        signature: fd.get("signature"),
      }),
    });
    setLoading(false);
    if (res.ok) setDone(true);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-pitch-400">Consent recorded</h1>
        <p className="mt-4 text-white/70">The talent profile can now be published on Finding11.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-bold text-white">Parental / Guardian Consent</h1>
      <div className="mt-6 space-y-3 text-sm text-white/70">
        <p>I am the legal parent or guardian of the talent named on this profile.</p>
        <p>I consent to the creation and publication of their profile on Finding11.</p>
        <p>
          I understand which data is public and which contact details are only revealed to verified
          recruiters after payment.
        </p>
        <p>I can withdraw consent at any time by contacting talents@finding11.com.</p>
        <p>Recruiters who previously unlocked contact may retain that information.</p>
      </div>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="guardianName">Guardian full name</Label>
          <Input id="guardianName" name="guardianName" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="relationship">Relationship to talent</Label>
          <Input id="relationship" name="relationship" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="email">Guardian email</Label>
          <Input id="email" name="email" type="email" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="signature">Signature (type your full name)</Label>
          <Input id="signature" name="signature" required className="mt-1" />
        </div>
        <label className="flex items-start gap-2 text-sm text-white/70">
          <input type="checkbox" required className="mt-1" />
          I am the legal parent/guardian and I give consent under GDPR.
        </label>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Submitting…" : "Submit consent"}
        </Button>
      </form>
    </div>
  );
}
