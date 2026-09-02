"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Role = "SUPER_ADMIN" | "ADMIN" | "STAFF" | "USER";
type ManagedUser = { id: string; name: string; email: string; role: Role; isBanned: boolean; createdAt: Date };
const assignableRoles: Role[] = ["USER", "STAFF", "ADMIN"];

export default function UserManagement({ users }: { users: ManagedUser[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function updateUser(id: string, update: Partial<Pick<ManagedUser, "role" | "isBanned">>) {
    setPendingId(id); setError("");
    const response = await fetch(`/api/admin/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(update) });
    const body = await response.json();
    if (!response.ok) setError(body.error ?? "Perubahan pengguna gagal.");
    else router.refresh();
    setPendingId(null);
  }

  return <section className="mt-8 rounded-2xl border border-white/10 bg-[#101a31] p-5"><div><h2 className="text-xl font-black">Manajemen pengguna</h2><p className="mt-1 text-sm text-slate-400">Ubah peran atau blokir akun selain SUPER_ADMIN.</p></div>{error && <p role="alert" className="mt-4 text-sm text-rose-300">{error}</p>}<div className="mt-5 overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="border-b border-white/10 text-slate-400"><tr><th className="pb-3 font-medium">Pengguna</th><th className="pb-3 font-medium">Peran</th><th className="pb-3 font-medium">Status</th><th className="pb-3 font-medium">Aksi</th></tr></thead><tbody>{users.map((user) => { const pending = pendingId === user.id; const protectedUser = user.role === "SUPER_ADMIN"; return <tr key={user.id} className="border-b border-white/5 last:border-0"><td className="py-4"><p className="font-bold">{user.name}</p><p className="text-slate-400">{user.email}</p></td><td className="py-4"><select value={user.role} disabled={pending || protectedUser} onChange={(event) => updateUser(user.id, { role: event.target.value as Role })} className="rounded-lg border border-white/10 bg-slate-950 px-2 py-1 text-white disabled:opacity-60">{protectedUser ? <option value="SUPER_ADMIN">SUPER_ADMIN</option> : assignableRoles.map((role) => <option key={role} value={role}>{role}</option>)}</select></td><td className="py-4"><span className={user.isBanned ? "rounded-full bg-rose-500/15 px-2 py-1 text-rose-300" : "rounded-full bg-emerald-500/15 px-2 py-1 text-emerald-300"}>{user.isBanned ? "Diblokir" : "Aktif"}</span></td><td className="py-4"><button disabled={pending || protectedUser} onClick={() => updateUser(user.id, { isBanned: !user.isBanned })} className="rounded-lg border border-white/15 px-3 py-1.5 font-bold disabled:cursor-not-allowed disabled:opacity-50">{pending ? "Menyimpan…" : user.isBanned ? "Buka blokir" : "Blokir"}</button></td></tr>; })}</tbody></table></div></section>;
}
