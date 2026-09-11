"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdminArea } from "@/lib/admin";
import { audit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { deleteProductImage, saveProductImage } from "@/lib/product-image";

const gameSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim()
    .transform((v) => v.toLowerCase().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-{2,}/g, "-").replace(/^-|-$/g, ""))
    .pipe(z.string().regex(/^[a-z0-9-]{2,120}$/, "Slug hanya boleh berisi huruf kecil, angka, dan strip (-).")),
  categoryId: z.string().cuid(), description: z.string().trim().min(2).max(4000),
  bannerUrl: z.union([z.literal(""), z.string().url(), z.string().regex(/^\/uploads\/games\/[a-f0-9-]+\.(?:jpg|png|webp)$/i)]).transform((v) => v || null),
  iconUrl: z.union([z.literal(""), z.string().url()]).transform((v) => v || null),
  isActive: z.boolean(), isFeatured: z.boolean(),
});
function payload(data: FormData) { return gameSchema.parse({ ...Object.fromEntries(data), isActive: data.get("isActive") === "on", isFeatured: data.get("isFeatured") === "on" }); }
function done(message: string) { revalidatePath("/admin/games"); revalidatePath("/admin"); revalidatePath("/"); revalidatePath("/games"); redirect(`/admin/games?message=${encodeURIComponent(message)}`); }
async function getNewBanner(form: FormData) { const file = form.get("bannerImage"); return file instanceof File && file.size > 0 ? saveProductImage(file, "games") : null; }
export async function createGame(form: FormData) { const actor = await requireAdminArea("catalog"); const data = payload(form); const bannerUrl = await getNewBanner(form); let persisted = false; try { const game = await prisma.game.create({ data: { ...data, bannerUrl: bannerUrl ?? data.bannerUrl } }); persisted = true; await audit(actor.id, "CREATE", "Game", game.id, { ...data, bannerUrl: game.bannerUrl }); done("Game berhasil ditambahkan."); } catch (error) { if (!persisted) await deleteProductImage(bannerUrl, "games"); throw error; } }
export async function updateGame(form: FormData) { const actor = await requireAdminArea("catalog"); const id = z.string().cuid().parse(form.get("id")); const current = await prisma.game.findUnique({ where: { id }, select: { bannerUrl: true } }); if (!current) throw new Error("Game tidak ditemukan."); const data = payload(form); const newBanner = await getNewBanner(form); const bannerUrl = newBanner ?? (form.get("removeBanner") === "on" ? null : data.bannerUrl); let persisted = false; try { const game = await prisma.game.update({ where: { id }, data: { ...data, bannerUrl } }); persisted = true; if (current.bannerUrl !== game.bannerUrl) await deleteProductImage(current.bannerUrl, "games"); await audit(actor.id, "UPDATE", "Game", id, { ...data, bannerUrl }); done(`Game ${game.name} diperbarui.`); } catch (error) { if (!persisted) await deleteProductImage(newBanner, "games"); throw error; } }
export async function deleteGame(form: FormData) { const actor = await requireAdminArea("catalog"); const id = z.string().cuid().parse(form.get("id")); const game = await prisma.game.findUnique({ where: { id }, include: { _count: { select: { products: true } } } }); if (!game) throw new Error("Game tidak ditemukan."); if (game._count.products) throw new Error("Game yang masih memiliki produk tidak dapat dihapus."); await prisma.game.delete({ where: { id } }); await deleteProductImage(game.bannerUrl, "games"); await audit(actor.id, "DELETE", "Game", id, { name: game.name }); done("Game dihapus."); }
