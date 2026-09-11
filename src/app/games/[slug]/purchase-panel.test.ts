import { describe, expect, it } from "vitest";
import { isCheckoutSubmitEnabled } from "./purchase-panel";

describe("isCheckoutSubmitEnabled", () => {
  it("menolak checkout saat guest belum mengisi kontak valid", () => {
    expect(
      isCheckoutSubmitEnabled({
        user: null,
        userId: "player-123",
        selectedProduct: { id: "p1", name: "Nominal", price: "Rp 20.000" },
        selectedPayment: { id: "m1", code: "QRIS", name: "QRIS", providerCode: "MIDTRANS" },
        pending: false,
        contact: "",
      }),
    ).toBe(false);
  });

  it("mengizinkan checkout sebagai guest saat mengisi nomor kontak atau email", () => {
    expect(
      isCheckoutSubmitEnabled({
        user: null,
        userId: "player-123",
        selectedProduct: { id: "p1", name: "Nominal", price: "Rp 20.000" },
        selectedPayment: { id: "m1", code: "QRIS", name: "QRIS", providerCode: "MIDTRANS" },
        pending: false,
        contact: "08123456789",
      }),
    ).toBe(true);
  });

  it("mengizinkan checkout saat user sudah login meskipun kontak tidak diisi manual", () => {
    expect(
      isCheckoutSubmitEnabled({
        user: { id: "u1", name: "Adit" },
        userId: "player-123",
        selectedProduct: { id: "p1", name: "Nominal", price: "Rp 20.000" },
        selectedPayment: { id: "m1", code: "QRIS", name: "QRIS", providerCode: "MIDTRANS" },
        pending: false,
      }),
    ).toBe(true);
  });
});
