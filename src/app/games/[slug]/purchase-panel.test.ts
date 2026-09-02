import { describe, expect, it } from "vitest";
import { isCheckoutSubmitEnabled } from "./purchase-panel";

describe("isCheckoutSubmitEnabled", () => {
  it("menolak checkout saat user belum login", () => {
    expect(
      isCheckoutSubmitEnabled({
        user: null,
        userId: "player-123",
        selectedProduct: { id: "p1", name: "Nominal", price: "Rp 20.000" },
        selectedPayment: { id: "m1", code: "QRIS", name: "QRIS", providerCode: "MIDTRANS" },
        pending: false,
      }),
    ).toBe(false);
  });

  it("mengizinkan checkout saat semua data valid dan user sudah login", () => {
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
