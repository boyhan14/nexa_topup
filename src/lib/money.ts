import { Prisma } from "@prisma/client";
import { z } from "zod";

export const moneySchema = z.string().trim().regex(/^\d+(\.\d{1,2})?$/, "Nominal harus berupa angka dengan maksimal 2 desimal.");

export function decimal(value: string) {
  return new Prisma.Decimal(value);
}

export function formatRupiah(value: Prisma.Decimal | string | number | null | undefined) {
  return `Rp ${Number(value?.toString() ?? 0).toLocaleString("id-ID", { maximumFractionDigits: 2 })}`;
}
