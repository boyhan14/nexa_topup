"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { isInternalTargetPath } from "@/lib/banner";
import { requireAdminArea } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const uploadedImagePath = z.string().regex(/^\/uploads\/banners\/[a-f0-9-]+\.(?:jpg|png|webp)$/i, "Upload gambar banner yang valid.");
const optionalDate = z.preprocess((value) => (typeof value === "string" && value.trim() === "" ? null : value), z.coerce.date().nullable());

const bannerSchema = z
  .object({
    title: z.string().trim().min(2).max(120),
    description: z.string().trim().max(360).transform((value) => value || null),
    imageUrl: uploadedImagePath,
    targetPath: z.string().trim().min(1).max(500).refine(isInternalTargetPath, "Target harus berupa path internal, misalnya /games."),
    isActive: z.boolean(),
    sortOrder: z.coerce.number().int().min(0).max(9999),
    startAt: optionalDate,
    endAt: optionalDate,
  })
  .superRefine((data, context) => {
    if (data.startAt && data.endAt && data.endAt < data.startAt) {
      context.addIssue({ code: "custom", path: ["endAt"], message: "Waktu selesai tidak boleh sebelum waktu mulai." });
    }
  });

function payload(formData: FormData) {
  return bannerSchema.parse({
    ...Object.fromEntries(formData),
    isActive: formData.get("isActive") === "on",
  });
}

function done(message: string) {
  revalidatePath("/");
  revalidatePath("/admin/banners");
  redirect(`/admin/banners?message=${encodeURIComponent(message)}`);
}

export async function createBanner(formData: FormData) {
  const actor = await requireAdminArea("catalog");
  const data = payload(formData);
  const banner = await prisma.promotionalBanner.create({ data });
  await audit(actor.id, "CREATE", "PromotionalBanner", banner.id, data);
  done("Banner promosi berhasil dibuat.");
}

export async function updateBanner(formData: FormData) {
  const actor = await requireAdminArea("catalog");
  const id = z.string().cuid().parse(formData.get("id"));
  const data = payload(formData);
  const banner = await prisma.promotionalBanner.update({ where: { id }, data });
  await audit(actor.id, "UPDATE", "PromotionalBanner", banner.id, data);
  done(`Banner ${banner.title} diperbarui.`);
}

export async function toggleBanner(formData: FormData) {
  const actor = await requireAdminArea("catalog");
  const id = z.string().cuid().parse(formData.get("id"));
  const banner = await prisma.promotionalBanner.findUnique({ where: { id }, select: { id: true, title: true, isActive: true } });
  if (!banner) throw new Error("Banner tidak ditemukan.");
  const isActive = !banner.isActive;
  await prisma.promotionalBanner.update({ where: { id }, data: { isActive } });
  await audit(actor.id, "TOGGLE", "PromotionalBanner", id, { title: banner.title, isActive });
  done(`Banner ${isActive ? "diaktifkan" : "dinonaktifkan"}.`);
}

export async function deleteBanner(formData: FormData) {
  const actor = await requireAdminArea("catalog");
  const id = z.string().cuid().parse(formData.get("id"));
  const banner = await prisma.promotionalBanner.findUnique({ where: { id }, select: { id: true, title: true, imageUrl: true } });
  if (!banner) throw new Error("Banner tidak ditemukan.");
  await prisma.promotionalBanner.delete({ where: { id } });
  await audit(actor.id, "DELETE", "PromotionalBanner", id, { title: banner.title, imageUrl: banner.imageUrl });
  done("Banner promosi dihapus.");
}
