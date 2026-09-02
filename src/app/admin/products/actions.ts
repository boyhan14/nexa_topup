"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdminArea } from "@/lib/admin";
import { audit } from "@/lib/audit";
import { decimal, moneySchema } from "@/lib/money";
import { prisma } from "@/lib/prisma";
const schema = z.object({ gameId: z.string().cuid(), name: z.string().trim().min(2).max(120), sku: z.string().trim().min(2).max(100), providerPrice: moneySchema, sellingPrice: moneySchema, isActive: z.boolean() });
function data(form: FormData) { const x = schema.parse({ ...Object.fromEntries(form), isActive: form.get("isActive") === "on" }); return { ...x, providerPrice: decimal(x.providerPrice), sellingPrice: decimal(x.sellingPrice) }; }
function done(message: string) { revalidatePath("/admin/products"); revalidatePath("/admin"); revalidatePath("/"); revalidatePath("/games"); redirect(`/admin/products?message=${encodeURIComponent(message)}`); }
export async function createProduct(form: FormData) { const actor = await requireAdminArea("catalog"); const value = data(form); const product = await prisma.gameProduct.create({ data: value }); await audit(actor.id, "CREATE", "GameProduct", product.id, { ...value, providerPrice: value.providerPrice.toString(), sellingPrice: value.sellingPrice.toString() }); done("Produk ditambahkan."); }
export async function updateProduct(form: FormData) { const actor = await requireAdminArea("catalog"); const id = z.string().cuid().parse(form.get("id")); const value = data(form); const product = await prisma.gameProduct.update({ where: { id }, data: value }); await audit(actor.id, "UPDATE", "GameProduct", id, { ...value, providerPrice: value.providerPrice.toString(), sellingPrice: value.sellingPrice.toString() }); done(`Produk ${product.name} diperbarui.`); }
export async function deleteProduct(form: FormData) { const actor = await requireAdminArea("catalog"); const id = z.string().cuid().parse(form.get("id")); const product = await prisma.gameProduct.findUnique({ where: { id }, include: { _count: { select: { orderItems: true, providerProducts: true } } } }); if (!product) throw new Error("Produk tidak ditemukan."); if (product._count.orderItems || product._count.providerProducts) throw new Error("Produk yang telah dipakai pesanan/provider tidak dapat dihapus."); await prisma.gameProduct.delete({ where: { id } }); await audit(actor.id, "DELETE", "GameProduct", id, { name: product.name }); done("Produk dihapus."); }
