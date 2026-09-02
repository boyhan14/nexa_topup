import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function audit(actorId: string | null | undefined, action: string, entity: string, entityId?: string, metadata?: Prisma.InputJsonValue) {
  await prisma.auditLog.create({ data: { actorId: actorId ?? null, action, entity, entityId, metadata } });
}
