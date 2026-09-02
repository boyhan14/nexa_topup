import Link from "next/link";
import { ShieldCheck, Zap } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#050816]/85">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:grid-cols-[1.2fr_.8fr_.8fr] lg:px-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-lg font-black">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-cyan-300 text-[#03111f]">
              <Zap size={18} fill="currentColor" />
            </span>
            NEXA <span className="text-cyan-300">TOPUP</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">Top up game dan layanan digital dengan tampilan status yang jelas dari pembayaran sampai proses pengiriman.</p>
        </div>
        <div>
          <h2 className="text-sm font-black text-white">Navigasi</h2>
          <div className="mt-4 grid gap-2 text-sm text-slate-400">
            <Link href="/games" className="hover:text-cyan-200">Katalog game</Link>
            <Link href="/transaction/check" className="hover:text-cyan-200">Cek transaksi</Link>
            <Link href="/login" className="hover:text-cyan-200">Masuk akun</Link>
          </div>
        </div>
        <div>
          <h2 className="text-sm font-black text-white">Keamanan</h2>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-100">
            <ShieldCheck size={16} />
            Status transaksi terlacak
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-slate-500">2026 Nexa Topup. Semua hak dilindungi.</div>
    </footer>
  );
}
