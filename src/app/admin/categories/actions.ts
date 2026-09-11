"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminArea } from "@/lib/admin";
import { audit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim()
    .transform((v) => v.toLowerCase().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-{2,}/g, "-").replace(/^-|-$/g, ""))
    .pipe(z.string().min(2).max(80).regex(/^[a-z0-9-]+$/, "Slug hanya boleh berisi huruf kecil, angka, dan strip (-).")),
});
export async function createCategory(formData: FormData) { const actor = await requireAdminArea("catalog"); const data = schema.parse(Object.fromEntries(formData)); const category = await prisma.gameCategory.create({ data }); await audit(actor.id, "CREATE", "GameCategory", category.id, data); revalidatePath("/admin/categories"); }
export async function updateCategory(formData: FormData) { const actor = await requireAdminArea("catalog"); const id = z.string().cuid().parse(formData.get("id")); const data = schema.parse(Object.fromEntries(formData)); await prisma.gameCategory.update({ where: { id }, data }); await audit(actor.id, "UPDATE", "GameCategory", id, data); revalidatePath("/admin/categories"); revalidatePath(`/admin/categories/${id}`); }
export async function deleteCategory(formData: FormData) { const actor = await requireAdminArea("catalog"); const id = z.string().cuid().parse(formData.get("id")); const category = await prisma.gameCategory.findUnique({ where: { id }, include: { _count: { select: { games: true } } } }); if (!category || category._count.games > 0) throw new Error("Kategori yang masih memiliki game tidak dapat dihapus."); await prisma.gameCategory.delete({ where: { id } }); await audit(actor.id, "DELETE", "GameCategory", id, { name: category.name }); revalidatePath("/admin/categories"); }
