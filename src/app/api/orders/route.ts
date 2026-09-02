import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createMidtransPayment } from "@/lib/payment/midtrans";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decimal } from "@/lib/money";

const schema = z.object({ productId: z.string().cuid(), paymentMethodId: z.string().cuid(), target: z.object({ userId: z.string().trim().min(1).max(100), serverId: z.string().trim().max(100).optional() }) });
const error = (message: string, status: number) => NextResponse.json({ success: false, message }, { status });

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return error("Silakan masuk sebelum membuat transaksi.", 401);
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return error("Data checkout tidak valid.", 400);
  const key = request.headers.get("Idempotency-Key");
  if (!key || key.length > 120) return error("Idempotency-Key wajib disertakan.", 400);
  const existing = await prisma.order.findUnique({ where: { idempotencyKey: key }, include: { payment: true } });
  if (existing?.payment) return NextResponse.json({ success: true, data: { reference: existing.reference, paymentUrl: null } });
  const product = await prisma.gameProduct.findFirst({ where: { id: parsed.data.productId, isActive: true, game: { isActive: true } }, include: { game: true } });
  const method = await prisma.paymentMethod.findFirst({ where: { id: parsed.data.paymentMethodId, isActive: true } });
  if (!product || !method) return error("Produk atau metode pembayaran tidak tersedia.", 404);
  const reference = `NXT-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;
  const total = product.sellingPrice;
  const order = await prisma.$transaction(async (tx) => tx.order.create({ data: { reference, userId: user.id, idempotencyKey: key, targetData: parsed.data.target, subtotal: total, adminFee: decimal("0"), discount: decimal("0"), total, items: { create: { productId: product.id, productName: product.name, unitPrice: total } }, logs: { create: { status: "PENDING_PAYMENT", note: "Pesanan dibuat, menunggu pembayaran." } }, payment: { create: { paymentMethodId: method.id, gatewayReference: reference, amount: total } } } }));
  try {
    const gateway = await createMidtransPayment({
      reference,
      amount: Number(total),
      customer: user,
      itemName: `${product.game.name} - ${product.name}`,
      finishUrl: `${process.env.APP_URL}/transactions/${reference}`,
      pendingUrl: `${process.env.APP_URL}/transactions/${reference}`,
      errorUrl: `${process.env.APP_URL}/transactions/${reference}`,
    });
    await prisma.payment.update({ where: { orderId: order.id }, data: { gatewayReference: gateway.gatewayReference, status: "PENDING" } });
    return NextResponse.json({ success: true, data: { reference, paymentUrl: gateway.paymentUrl ?? null, snapToken: gateway.snapToken ?? null } }, { status: 201 });
  } catch (cause) {
    const message = cause instanceof Error && cause.message === "PAYMENT_NOT_CONFIGURED" ? "Payment gateway belum dikonfigurasi." : "Gagal membuat pembayaran. Coba lagi.";
    await prisma.$transaction(async (tx) => { await tx.payment.update({ where: { orderId: order.id }, data: { status: "FAILED" } }); await tx.order.update({ where: { id: order.id }, data: { status: "FAILED", paymentStatus: "FAILED", failureReason: message } }); await tx.orderStatusLog.create({ data: { orderId: order.id, status: "FAILED", note: message } }); });
    return error(message, 503);
  }
}
