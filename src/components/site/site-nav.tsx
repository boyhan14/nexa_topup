"use client";

import Link from "next/link";
import { Menu, Search, Sparkles, X, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import AccountMenu from "@/app/account-menu";
import { cn } from "@/components/ui/primitives";

type SiteNavProps = {
  user?: { name: string } | null;
};

const navItems = [
  { href: "/games", label: "Game" },
  { href: "/games", label: "Top Up" },
  { href: "/#promo", label: "Promo" },
  { href: "/transaction/check", label: "Cek Transaksi" },
  { href: "/#bantuan", label: "Bantuan" },
];

export default function SiteNav({ user }: SiteNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 12);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    if (!open) {
      return undefined;
    }

    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [open]);

  // Lock body scroll while the mobile menu is open (also helps avoid
  // iOS Safari's scroll/tap quirks with fixed-position overlays)
  useEffect(() => {
    if (open) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
    return undefined;
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-[9999] px-4 pt-4">
      <nav
        className={cn(
          "relative mx-auto flex max-w-7xl items-center justify-between rounded-full px-4 py-3 transition duration-300",
          scrolled ? "border border-white/10 bg-[#071122]/82 shadow-2xl shadow-black/25 backdrop-blur-xl" : "border border-transparent bg-transparent",
        )}
        style={{ isolation: "isolate" }}
      >
        <Link href="/" className="flex items-center gap-2 text-lg font-black text-white" aria-label="Nexa Topup beranda">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-cyan-300 text-[#03111f] shadow-lg shadow-cyan-400/20">
            <Zap size={20} fill="currentColor" />
          </span>
          NEXA <span className="text-cyan-300">TOPUP</span>
        </Link>

        <div className="hidden items-center rounded-full border border-white/10 bg-white/[0.045] p-1 text-sm font-semibold text-slate-300 lg:flex">
          {navItems.map((item) => (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className={cn("nav-link rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-white", pathname === item.href && "nav-link-active text-white")}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <form action="/games" className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-2 text-sm text-slate-400 xl:flex">
            <Search size={16} />
            <input name="q" aria-label="Cari game" placeholder="Cari game" className="w-28 bg-transparent text-sm outline-none placeholder:text-slate-500" />
          </form>
          {user ? (
            <AccountMenu name={user.name} />
          ) : (
            <>
              <Link href="/login" className="rounded-full px-3 py-2 text-sm font-bold text-slate-200 transition hover:text-cyan-200">
                Masuk
              </Link>
              <Link href="/register" className="button px-4 py-2 text-sm">
                Daftar
                <Sparkles size={15} />
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative z-[70] grid h-10 w-10 cursor-pointer touch-manipulation place-items-center rounded-full border border-white/10 bg-white/5 md:hidden"
          style={{ WebkitTapHighlightColor: "transparent" }}
          aria-label="Buka menu"
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          <Menu size={20} />
        </button>
      </nav>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <aside
        id="mobile-navigation"
        className={cn(
          "fixed bottom-0 right-0 top-0 z-[60] w-[min(86vw,24rem)] border-l border-white/10 bg-[#071122] p-5 transition-transform duration-300 md:hidden",
          open ? "translate-x-0" : "translate-x-full",
        )}
        style={{ pointerEvents: open ? "auto" : "none" }}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between">
          <span className="text-lg font-black">
            NEXA <span className="text-cyan-300">TOPUP</span>
          </span>
          <button type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full border border-white/10" aria-label="Tutup menu">
            <X size={19} />
          </button>
        </div>

        <form action="/games" className="mt-7 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-slate-400">
          <Search size={18} />
          <input name="q" aria-label="Cari game" placeholder="Cari game" className="min-w-0 flex-1 bg-transparent outline-none" />
        </form>

        <div className="mt-7 grid gap-2">
          {navItems.map((item) => (
            <Link
              key={`${item.href}-${item.label}-mobile`}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 font-bold text-slate-200"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="mt-7">
          {user ? (
            <AccountMenu name={user.name} />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Link href="/login" onClick={() => setOpen(false)} className="button button-secondary py-3">
                Masuk
              </Link>
              <Link href="/register" onClick={() => setOpen(false)} className="button py-3">
                Daftar
              </Link>
            </div>
          )}
        </div>
      </aside>
    </header>
  );
}