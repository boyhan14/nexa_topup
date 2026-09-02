import { getCurrentUser } from "@/lib/auth";
import SiteNav from "@/components/site/site-nav";

export default async function HomeNavigation() {
  const user = await getCurrentUser();
  return <SiteNav user={user ? { name: user.name } : null} />;
}
