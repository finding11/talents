import { NextResponse } from "next/server";
import { getDb } from "@/lib/prisma";
import { bootstrapStaging } from "@/lib/staging-bootstrap";
import { readRuntimeEnv } from "@/lib/runtime-env";

export const dynamic = "force-dynamic";

function isStagingHost(): boolean {
  const url = readRuntimeEnv("NEXT_PUBLIC_APP_URL") ?? readRuntimeEnv("NEXTAUTH_URL") ?? "";
  return url.includes("workers.dev") || url.includes("staging.");
}

/** One-time staging setup: demo highlight videos + Worker-safe demo passwords. */
export async function POST() {
  if (!isStagingHost()) {
    return NextResponse.json({ error: "Not available outside staging" }, { status: 403 });
  }

  try {
    const prisma = getDb();
    const result = await bootstrapStaging(prisma);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Bootstrap failed" },
      { status: 500 }
    );
  }
}
