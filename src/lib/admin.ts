import "server-only";

import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export type AdminArea = "dashboard" | "catalog" | "orders" | "payments" | "wallets" | "users" | "audit" | "settings";

const permissions: Record<Role, AdminArea[]> = {
  SUPER_ADMIN: ["dashboard", "catalog", "orders", "payments", "wallets", "users", "audit", "settings"],
  ADMIN: ["dashboard", "catalog", "orders", "payments", "wallets", "users"],
  STAFF: ["dashboard", "catalog", "orders"],
  USER: [],
};

export function hasAdminPermission(role: Role, area: AdminArea) {
  return permissions[role].includes(area);
}

export async function requireAdminArea(area: AdminArea) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (!hasAdminPermission(user.role, area)) redirect("/admin");
  return user;
}

export async function requireSuperAdmin() {
  const user = await requireAdminArea("users");
  if (user.role !== Role.SUPER_ADMIN) redirect("/admin");
  return user;
}
