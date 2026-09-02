"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdminArea } from "@/lib/admin";
import { audit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

const gameSchema = z.object({
  name: z.string().trim().min(2).max(120), slug: z.string().trim().regex(/^[a-z0-9-]{2,120}$/),
  categoryId: z.string().cuid(), description: z.string().trim().min(2).max(4000),
  bannerUrl: z.union([z.literal(""), z.string().url()]).transform((v) => v || null),
  iconUrl: z.union([z.literal(""), z.string().url()]).transform((v) => v || null),
  isActive: z.boolean(), isFeatured: z.boolean(),
});
function payload(data: FormData) { return gameSchema.parse({ ...Object.fromEntries(data), isActive: data.get("isActive") === "on", isFeatured: data.get("isFeatured") === "on" }); }
function done(message: string) { revalidatePath("/admin/games"); revalidatePath("/admin"); revalidatePath("/"); revalidatePath("/games"); redirect(`/admin/games?message=${encodeURIComponent(message)}`); }
export async function createGame(form: FormData) { const actor = await requireAdminArea("catalog"); const data = payload(form); const game = await prisma.game.create({ data }); await audit(actor.id, "CREATE", "Game", game.id, data); done("Game berhasil ditambahkan."); }
export async function updateGame(form: FormData) { const actor = await requireAdminArea("catalog"); const id = z.string().cuid().parse(form.get("id")); const data = payload(form); const game = await prisma.game.update({ where: { id }, data }); await audit(actor.id, "UPDATE", "Game", id, data); done(`Game ${game.name} diperbarui.`); }
export async function deleteGame(form: FormData) { const actor = await requireAdminArea("catalog"); const id = z.string().cuid().parse(form.get("id")); const game = await prisma.game.findUnique({ where: { id }, include: { _count: { select: { products: true } } } }); if (!game) throw new Error("Game tidak ditemukan."); if (game._count.products) throw new Error("Game yang masih memiliki produk tidak dapat dihapus."); await prisma.game.delete({ where: { id } }); await audit(actor.id, "DELETE", "Game", id, { name: game.name }); done("Game dihapus."); }
