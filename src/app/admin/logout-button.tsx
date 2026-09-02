"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); router.replace("/login"); router.refresh(); }
  return <button className="rounded-xl border border-white/20 px-4 py-2 text-sm font-bold" onClick={logout}>Keluar</button>;
}
