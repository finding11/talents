"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { formatEUR } from "@/lib/utils";

type ContactGateProps = {
  talentId: string;
  talentSlug: string;
  displayName: string;
  priceCents: number;
  locale: string;
  canView: boolean;
  contact?: {
    email?: string | null;
    phone?: string | null;
    agentName?: string | null;
    agentEmail?: string | null;
    agentPhone?: string | null;
    agentOnly?: boolean;
  } | null;
};

export function ContactGate({
  talentId,
  talentSlug,
  displayName,
  priceCents,
  locale,
  canView,
  contact,
}: ContactGateProps) {
  const [loading, setLoading] = useState(false);

  async function handleUnlock() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ talentId, talentSlug }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  if (canView && contact) {
    return (
      <div className="rounded-xl border border-pitch-500/30 bg-pitch-500/10 p-6">
        <h3 className="font-semibold text-pitch-400">Contact unlocked</h3>
        <dl className="mt-4 space-y-2 text-sm">
          {contact.agentOnly ? (
            <>
              {contact.agentName && (
                <div>
                  <dt className="text-white/50">Agent</dt>
                  <dd className="text-white">{contact.agentName}</dd>
                </div>
              )}
              {contact.agentEmail && (
                <div>
                  <dt className="text-white/50">Agent email</dt>
                  <dd>
                    <a href={`mailto:${contact.agentEmail}`} className="text-pitch-400 hover:underline">
                      {contact.agentEmail}
                    </a>
                  </dd>
                </div>
              )}
              {contact.agentPhone && (
                <div>
                  <dt className="text-white/50">Agent phone</dt>
                  <dd className="text-white">{contact.agentPhone}</dd>
                </div>
              )}
            </>
          ) : (
            <>
              {contact.email && (
                <div>
                  <dt className="text-white/50">Email</dt>
                  <dd>
                    <a href={`mailto:${contact.email}`} className="text-pitch-400 hover:underline">
                      {contact.email}
                    </a>
                  </dd>
                </div>
              )}
              {contact.phone && (
                <div>
                  <dt className="text-white/50">Phone</dt>
                  <dd className="text-white">{contact.phone}</dd>
                </div>
              )}
            </>
          )}
        </dl>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-navy-800/80 p-6 text-center">
      <h3 className="font-semibold text-white">Contact details protected</h3>
      <p className="mt-2 text-sm text-white/60">
        Unlock {displayName}&apos;s contact info to connect directly.
      </p>
      <p className="mt-4 text-2xl font-bold text-pitch-400">{formatEUR(priceCents, locale)}</p>
      <p className="mt-1 text-xs text-white/40">One-time unlock · Refunds within 3 days if invalid</p>
      <Button className="mt-6 w-full" size="lg" onClick={handleUnlock} disabled={loading}>
        {loading ? "Redirecting…" : `Unlock contact — ${formatEUR(priceCents, locale)}`}
      </Button>
    </div>
  );
}
