import { PrismaClient } from "@prisma/client";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

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
  let url = process.env.DATABASE_URL;

  if (!url) {
    try {
      const workerEnv = getCloudflareContext().env as { DATABASE_URL?: string };
      if (typeof workerEnv.DATABASE_URL === "string") {
        url = workerEnv.DATABASE_URL;
        process.env.DATABASE_URL = url;
      }
    } catch {
      // Not running inside the OpenNext worker (e.g. next build).
    }
  }

  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  return normalizeDatabaseUrl(url);
}

function createPrismaClient(): PrismaClient {
  const connectionString = readDatabaseUrl();

  // Required for Neon on Cloudflare Workers (see neondatabase/serverless#128).
  neonConfig.webSocketConstructor = WebSocket;
  neonConfig.fetchFunction = fetch;

  const adapter = new PrismaNeon({ connectionString, maxUses: 1 });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

/** Lazy singleton — avoids requiring DATABASE_URL during Next.js build. */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
