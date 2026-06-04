import { cache } from "react";
import { PrismaClient } from "@prisma/client";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeonHTTP } from "@prisma/adapter-neon";
import { getCloudflareContext } from "@opennextjs/cloudflare";

function normalizeDatabaseUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete("channel_binding");
    return parsed.toString();
  } catch {
    return url.replace(/([?&])channel_binding=[^&]*&?/g, "$1").replace(/[?&]$/, "");
  }
}

function readDatabaseUrl(): string {
  let url: string | undefined;

  try {
    const workerEnv = getCloudflareContext().env as { DATABASE_URL?: string };
    if (typeof workerEnv.DATABASE_URL === "string") {
      url = workerEnv.DATABASE_URL;
    }
  } catch {
    // Build step or dev without worker context.
  }

  url ??= process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  process.env.DATABASE_URL ??= url;
  return normalizeDatabaseUrl(url);
}

function createPrismaClient(): PrismaClient {
  const connectionString = readDatabaseUrl();

  neonConfig.fetchFunction = fetch;

  const adapter = new PrismaNeonHTTP(connectionString, {});

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

/** Per-request Prisma client — required for Cloudflare Workers (OpenNext). */
export const getDb = cache(() => createPrismaClient());

/** For static/ISR routes that need async Cloudflare context. */
export async function getDbAsync() {
  await getCloudflareContext({ async: true });
  return createPrismaClient();
}
