import type { Role } from "@prisma/client";
import { getDb } from "./prisma";

export async function canViewPrivateContact(
  talentId: string,
  userId?: string | null,
  role?: Role | null
): Promise<boolean> {
  if (!userId) return false;
  if (role === "ADMIN") return true;

  const prisma = getDb();
  const talent = await prisma.talentProfile.findUnique({
    where: { id: talentId },
    select: { userId: true },
  });
  if (!talent) return false;
  if (talent.userId === userId) return true;

  const grant = await prisma.accessGrant.findUnique({
    where: {
      recruiterId_talentId: { recruiterId: userId, talentId },
    },
  });
  if (!grant || grant.revoked) return false;
  if (grant.expiresAt && grant.expiresAt < new Date()) return false;
  return true;
}

export async function logAudit(
  action: string,
  opts: { userId?: string; talentId?: string; metadata?: object; ip?: string }
) {
  const prisma = getDb();
  await prisma.auditLog.create({
    data: {
      action,
      userId: opts.userId,
      talentId: opts.talentId,
      metadata: opts.metadata ?? undefined,
      ipHash: opts.ip ? hashSimple(opts.ip) : undefined,
    },
  });
}

function hashSimple(ip: string): string {
  let h = 0;
  for (let i = 0; i < ip.length; i++) {
    h = (Math.imul(31, h) + ip.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(16);
}
