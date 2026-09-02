import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

const updateUserSchema = z.object({
  role: z.enum([Role.ADMIN, Role.STAFF, Role.USER]).optional(),
  isBanned: z.boolean().optional(),
}).refine((data) => data.role !== undefined || data.isBanned !== undefined);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Origin permintaan tidak valid." }, { status: 403 });
  }
  const currentUser = await getCurrentUser();
  if (!currentUser || (currentUser.role !== Role.SUPER_ADMIN && currentUser.role !== Role.ADMIN)) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  }

  const input = updateUserSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Perubahan pengguna tidak valid." }, { status: 400 });

  const { id } = await params;
  if (id === currentUser.id) {
    return NextResponse.json({ error: "Akun sendiri tidak dapat diubah dari dashboard ini." }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
  if (!target) return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
  if (target.role === Role.SUPER_ADMIN) {
    return NextResponse.json({ error: "Akun SUPER_ADMIN lain tidak dapat diubah." }, { status: 403 });
  }
  if (currentUser.role === Role.ADMIN && input.data.role === Role.ADMIN) {
    return NextResponse.json({ error: "ADMIN tidak dapat menetapkan role ADMIN." }, { status: 403 });
  }

  const user = await prisma.user.update({
    where: { id },
    data: input.data,
    select: { id: true, name: true, email: true, role: true, isBanned: true },
  });
  await audit(currentUser.id, "UPDATE_USER", "User", user.id, { before: { role: target.role }, after: { role: user.role, isBanned: user.isBanned } });
  return NextResponse.json({ user });
}
