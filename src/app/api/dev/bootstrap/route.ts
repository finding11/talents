import { NextResponse } from "next/server";
import { getDb } from "@/lib/prisma";
import { bootstrapStaging, isStagingHost } from "@/lib/staging-bootstrap";

export const dynamic = "force-dynamic";

async function runBootstrap() {
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

/** One-time staging setup: demo highlight videos + Worker-safe demo passwords. */
export async function GET() {
  return runBootstrap();
}

export async function POST() {
  return runBootstrap();
}
