import { NextResponse } from "next/server";
import { mapMidtransStatus, midtransSignature } from "@/lib/payment/midtrans";
import { prisma } from "@/lib/prisma";

type Notification = { order_id?: string; status_code?: string; gross_amount?: string; signature_key?: string; transaction_status?: string; transaction_id?: string; fraud_status?: string };

export async function POST(request: Request) {
  const key = process.env.MIDTRANS_SERVER_KEY;
  const body = await request.json().catch(() => null) as Notification | null;
  if (!key || !body?.order_id || !body.status_code || !body.gross_amount || !body.signature_key) return NextResponse.json({ message: "Webhook tidak valid." }, { status: 400 });

  const signature = midtransSignature(body.order_id, body.status_code, body.gross_amount, key);
  if (signature !== body.signature_key) return NextResponse.json({ message: "Signature tidak valid." }, { status: 401 });

  const payment = await prisma.payment.findFirst({ where: { gatewayReference: body.order_id }, include: { order: true } });
  if (!payment) return NextResponse.json({ message: "Pembayaran tidak ditemukan." }, { status: 404 });

  const transactionStatus = body.transaction_status ?? "pending";
  const mappedStatus = mapMidtransStatus(transactionStatus, body.fraud_status);
  const paid = mappedStatus === "PAID";
  const failed = mappedStatus === "FAILED" || mappedStatus === "EXPIRED" || mappedStatus === "CANCELLED";
  if (!paid && !failed) return NextResponse.json({ success: true });

  await prisma.$transaction(async (tx) => {
    const current = await tx.payment.findUnique({ where: { id: payment.id } });
    if (current?.status === "PAID" || current?.status === "FAILED" || current?.status === "EXPIRED" || current?.status === "REFUNDED") return;

    const paymentStatus = mappedStatus === "PAID" ? "PAID" : mappedStatus === "EXPIRED" ? "EXPIRED" : "FAILED";
    const orderStatus = mappedStatus === "PAID" ? "PAID" : mappedStatus === "EXPIRED" ? "EXPIRED" : mappedStatus === "CANCELLED" ? "CANCELLED" : "FAILED";
    const note = paid ? "Pembayaran dikonfirmasi oleh Midtrans. Menunggu top-up provider." : `Pembayaran ${transactionStatus}.`;

    await tx.payment.update({ where: { id: payment.id }, data: { status: paymentStatus, paidAt: paid ? new Date() : null, gatewayReference: body.transaction_id ?? body.order_id } });
    await tx.order.update({ where: { id: payment.orderId }, data: { status: orderStatus, paymentStatus, fulfillmentStatus: "PENDING", failureReason: paid ? null : `Midtrans: ${transactionStatus}`, providerReference: body.transaction_id ?? null } });
    await tx.orderStatusLog.create({ data: { orderId: payment.orderId, status: orderStatus, note } });
  });

  return NextResponse.json({ success: true });
}
