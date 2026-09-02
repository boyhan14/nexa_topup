import { createHash } from "crypto";

export type PaymentRequest = {
  reference: string;
  amount: number;
  customer: { name: string; email: string };
  itemName: string;
  finishUrl: string;
  pendingUrl?: string;
  errorUrl?: string;
};

export function getMidtransClientKey() {
  return process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "";
}

export function getMidtransConfig() {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (process.env.PAYMENT_PROVIDER !== "midtrans" || !serverKey) return null;
  return {
    serverKey,
    clientKey: getMidtransClientKey(),
    baseUrl: process.env.MIDTRANS_IS_PRODUCTION === "true" ? "https://app.midtrans.com" : "https://app.sandbox.midtrans.com",
  };
}

export function midtransSignature(orderId: string, statusCode: string, grossAmount: string, serverKey: string) {
  return createHash("sha512").update(`${orderId}${statusCode}${grossAmount}${serverKey}`).digest("hex");
}

export function mapMidtransStatus(transactionStatus: string, fraudStatus?: string): "PAID" | "PENDING" | "FAILED" | "EXPIRED" | "CANCELLED" {
  if (transactionStatus === "settlement") return "PAID";
  if (transactionStatus === "capture" && fraudStatus === "accept") return "PAID";
  if (transactionStatus === "pending") return "PENDING";
  if (transactionStatus === "deny") return "FAILED";
  if (transactionStatus === "cancel") return "CANCELLED";
  if (transactionStatus === "expire") return "EXPIRED";
  if (transactionStatus === "failure") return "FAILED";
  return "PENDING";
}

export async function createMidtransPayment(input: PaymentRequest) {
  const settings = getMidtransConfig();
  if (!settings) throw new Error("PAYMENT_NOT_CONFIGURED");

  const response = await fetch(`${settings.baseUrl}/snap/v1/transactions`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${settings.serverKey}:`).toString("base64")}`,
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: input.reference,
        gross_amount: input.amount,
      },
      item_details: [{
        id: input.reference,
        price: input.amount,
        quantity: 1,
        name: input.itemName.slice(0, 50),
      }],
      customer_details: {
        first_name: input.customer.name,
        email: input.customer.email,
      },
      callbacks: {
        finish: input.finishUrl,
        pending: input.pendingUrl ?? input.finishUrl,
        error: input.errorUrl ?? input.finishUrl,
      },
    }),
  });

  const body = (await response.json().catch(() => null)) as { token?: string; redirect_url?: string; transaction_id?: string } | null;
  if (!response.ok || !body?.token) {
    const message = body && "error_messages" in body && Array.isArray((body as { error_messages?: string[] }).error_messages) ? (body as { error_messages?: string[] }).error_messages?.join(", ") : "PAYMENT_CREATE_FAILED";
    throw new Error(message || "PAYMENT_CREATE_FAILED");
  }

  return {
    gatewayReference: input.reference,
    paymentUrl: body.redirect_url ?? null,
    snapToken: body.token,
    transactionId: body.transaction_id ?? null,
  };
}
