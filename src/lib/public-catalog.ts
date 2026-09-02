import "server-only";

import { prisma } from "@/lib/prisma";

export async function getPublicGames(query?: string, categorySlug?: string) {
  return prisma.game.findMany({
    where: {
      isActive: true,
      ...(query ? { name: { contains: query, mode: "insensitive" } } : {}),
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    },
    include: {
      category: { select: { name: true, slug: true } },
      products: { where: { isActive: true }, select: { sellingPrice: true }, orderBy: { sellingPrice: "asc" }, take: 1 },
    },
    orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
  });
}

export async function getPublicCategories() {
  return prisma.gameCategory.findMany({
    where: { games: { some: { isActive: true } } },
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });
}

export async function getPublicGame(slug: string) {
  return prisma.game.findFirst({
    where: { slug, isActive: true },
    include: {
      category: { select: { name: true, slug: true } },
      products: { where: { isActive: true }, orderBy: { sellingPrice: "asc" } },
    },
  });
}

export async function getActivePaymentMethods() {
  return prisma.paymentMethod.findMany({
    where: { isActive: true },
    select: { id: true, code: true, name: true, providerCode: true },
    orderBy: { name: "asc" },
  });
}

export async function getPublicTransaction(reference: string) {
  return prisma.order.findUnique({
    where: { reference },
    include: {
      items: { include: { product: { include: { game: { include: { category: true } } } } } },
      payment: { include: { paymentMethod: true } },
      logs: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function getPublicBanners() {
  const now = new Date();
  return prisma.promotionalBanner.findMany({
    where: {
      isActive: true,
      AND: [
        { OR: [{ startAt: null }, { startAt: { lte: now } }] },
        { OR: [{ endAt: null }, { endAt: { gte: now } }] },
      ],
    },
    select: { id: true, title: true, description: true, imageUrl: true, targetPath: true, sortOrder: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function getPublicBannersSafely() {
  try {
    return await getPublicBanners();
  } catch (error) {
    console.error("Unable to load promotional banners", error);
    return [];
  }
}
