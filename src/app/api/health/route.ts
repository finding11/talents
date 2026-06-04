import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const diagnostics: Record<string, unknown> = {
    processEnvDatabaseUrl: Boolean(process.env.DATABASE_URL),
  };

  try {
    const { env } = getCloudflareContext();
    diagnostics.workerEnvDatabaseUrl = typeof (env as { DATABASE_URL?: unknown }).DATABASE_URL === "string";
    diagnostics.workerEnvKeys = Object.keys(env).filter(
      (key) => typeof (env as Record<string, unknown>)[key] === "string"
    );
  } catch (error) {
    diagnostics.cloudflareContextError = error instanceof Error ? error.message : String(error);
  }

  try {
    const prisma = getDb();
    const count = await prisma.talentProfile.count();
    diagnostics.dbOk = true;
    diagnostics.talentCount = count;
  } catch (error) {
    diagnostics.dbOk = false;
    diagnostics.dbError = error instanceof Error ? error.message : String(error);
  }

  return NextResponse.json(diagnostics);
}
