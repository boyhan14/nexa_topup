import { describe, expect, it } from "vitest";
import { mapMidtransStatus, midtransSignature } from "./midtrans";

describe("midtrans helpers", () => {
  it("maps settled payment to paid", () => {
    expect(mapMidtransStatus("settlement")).toBe("PAID");
    expect(mapMidtransStatus("capture", "accept")).toBe("PAID");
  });

  it("verifies built signature for notification", () => {
    const key = "Mid-server-test-key";
    const signature = midtransSignature("NX-20260902-ABC123", "200", "100000", key);
    expect(signature).toBe("a03416b85768dbe40eae0af9ceffe7863b79abf2a04371be6144c68ffc2e664e93284878ab7a80e62be3d8506165be955091249ead18f9141b5655ba44d5853f");
  });
});
