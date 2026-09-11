import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  const { reference } = await params;
  const normalizedReference = decodeURIComponent(reference).trim().toUpperCase();

  const order = await prisma.order.findUnique({
    where: { reference: normalizedReference },
    select: {
      id: true,
      reference: true,
      status: true,
      paymentStatus: true,
      fulfillmentStatus: true,
      failureReason: true,
      updatedAt: true,
      payment: {
        select: {
          status: true,
          paidAt: true,
        },
      },
      logs: {
        select: {
          id: true,
          status: true,
          note: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!order) {
    return NextResponse.json(
      { success: false, message: "Pesanan tidak ditemukan." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      reference: order.reference,
      status: order.status,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      failureReason: order.failureReason,
      paidAt: order.payment?.paidAt ?? null,
      updatedAt: order.updatedAt,
      logs: order.logs,
    },
  });
}

