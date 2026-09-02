"use client";

import { BarChart3, Boxes, CreditCard, Gamepad2, LayoutDashboard, Megaphone, Menu, Package, ReceiptText, Settings, ShieldCheck, Users, Wallet, X, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/components/ui/primitives";
import LogoutButton from "./logout-button";

type Role = "SUPER_ADMIN" | "ADMIN" | "STAFF" | "USER";
type Item = { href: string; label: string; icon: typeof LayoutDashboard; roles: Role[] };

const items: Item[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["SUPER_ADMIN", "ADMIN", "STAFF"] },
  { href: "/admin/games", label: "Game", icon: Gamepad2, roles: ["SUPER_ADMIN", "ADMIN", "STAFF"] },
  { href: "/admin/banners", label: "Promosi", icon: Megaphone, roles: ["SUPER_ADMIN", "ADMIN", "STAFF"] },
  { href: "/admin/categories", label: "Kategori Game", icon: Boxes, roles: ["SUPER_ADMIN", "ADMIN", "STAFF"] },
  { href: "/admin/products", label: "Produk", icon: Package, roles: ["SUPER_ADMIN", "ADMIN", "STAFF"] },
  { href: "/admin/providers", label: "Provider", icon: ShieldCheck, roles: ["SUPER_ADMIN", "ADMIN"] },
  { href: "/admin/orders", label: "Pesanan", icon: ReceiptText, roles: ["SUPER_ADMIN", "ADMIN", "STAFF"] },
  { href: "/admin/payments", label: "Pembayaran", icon: CreditCard, roles: ["SUPER_ADMIN", "ADMIN"] },
  { href: "/admin/wallets", label: "Wallet", icon: Wallet, roles: ["SUPER_ADMIN", "ADMIN"] },
  { href: "/admin/users", label: "Pengguna", icon: Users, roles: ["SUPER_ADMIN", "ADMIN"] },
  { href: "/admin/audit-logs", label: "Audit Log", icon: BarChart3, roles: ["SUPER_ADMIN"] },
  { href: "/admin/settings", label: "Settings", icon: Settings, roles: ["SUPER_ADMIN"] },
];

export default function AdminShell({ children, user }: { children: React.ReactNode; user: { name: string; email: string; role: Role } }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const visible = items.filter((item) => item.roles.includes(user.role));
  const current = visible.find((item) => pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`)));

  const navigation = (
    <nav className="grid gap-1" aria-label="Navigasi admin">
      {visible.map((item) => {
        const Icon = item.icon;
        const active = current?.href === item.href;
        return (
          <Link
            onClick={() => setOpen(false)}
            key={item.href}
            href={item.href}
            className={cn(
              "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold transition",
              active ? "bg-cyan-300 text-[#03111f] shadow-lg shadow-cyan-950/20" : "text-slate-300 hover:bg-white/[0.065] hover:text-white",
            )}
          >
            <Icon size={18} aria-hidden="true" />
            <span className="min-w-0 truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-white/10 bg-[#071122]/96 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl lg:block">
        <Brand />
        <div className="mt-8">{navigation}</div>
      </aside>

      <div className={cn("fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition lg:hidden", open ? "opacity-100" : "pointer-events-none opacity-0")} onClick={() => setOpen(false)} />
      <aside className={cn("fixed inset-y-0 left-0 z-[60] w-[min(86vw,20rem)] border-r border-white/10 bg-[#071122] p-4 transition-transform duration-300 lg:hidden", open ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex items-center justify-between">
          <Brand compact />
          <button onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full border border-white/10" aria-label="Tutup menu admin">
            <X size={19} aria-hidden="true" />
          </button>
        </div>
        <div className="mt-8">{navigation}</div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-[#050816]/88 px-5 backdrop-blur-xl lg:px-8">
          <button className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-slate-200 lg:hidden" onClick={() => setOpen(true)} aria-label="Buka menu admin">
            <Menu size={20} aria-hidden="true" />
          </button>
          <div className="hidden text-sm text-slate-400 sm:block">
            Admin / <span className="font-bold text-white">{current?.label ?? "Dashboard"}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-2 text-right sm:block">
              <p className="max-w-40 truncate text-sm font-black">{user.name}</p>
              <p className="text-xs font-bold text-cyan-300">{user.role}</p>
            </div>
            <LogoutButton />
          </div>
        </header>
        <main className="min-h-[calc(100vh-4rem)] p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/admin" className="flex items-center gap-2 px-1 text-xl font-black" aria-label="Nexa Topup admin dashboard">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-cyan-300 text-[#03111f] shadow-lg shadow-cyan-400/20">
        <Zap size={20} fill="currentColor" aria-hidden="true" />
      </span>
      {!compact ? (
        <span>
          NEXA <span className="text-cyan-300">TOPUP</span>
        </span>
      ) : null}
    </Link>
  );
}
