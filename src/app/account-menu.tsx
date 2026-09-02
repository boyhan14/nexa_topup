"use client";

import { LogOut, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AccountMenu({ name }: { name: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function logout() {
    setPending(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <div className="hidden items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-cyan-100 sm:flex">
        <UserRound size={16} className="text-cyan-300" />
        <span className="max-w-28 truncate text-sm font-bold">{name}</span>
      </div>
      <button
        type="button"
        onClick={logout}
        disabled={pending}
        aria-label="Keluar dari akun"
        className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-slate-200 transition hover:border-rose-300/60 hover:text-rose-200 disabled:opacity-60"
      >
        <LogOut size={16} />
      </button>
    </div>
  );
}
