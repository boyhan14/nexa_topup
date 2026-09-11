import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AdminShell from "./admin-shell";
import { AdminToast } from "./admin-ui";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role === "USER") redirect("/");
  return <AdminShell user={user}>{children}<AdminToast /></AdminShell>;
}
