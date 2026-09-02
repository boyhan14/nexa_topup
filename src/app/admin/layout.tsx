import { getCurrentUser } from "@/lib/auth";
import AdminShell from "./admin-shell";
import { AdminToast } from "./admin-ui";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || user.role === "USER") return children;
  return <AdminShell user={user}>{children}<AdminToast /></AdminShell>;
}
