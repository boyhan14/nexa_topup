import { ArrowLeft, Clock3, ReceiptText, ShieldCheck } from "lucide-react";
import Link from "next/link";
import SiteFooter from "@/components/site/site-footer";
import SiteNav from "@/components/site/site-nav";
import PageTransition from "@/components/site/page-transition";
import { Badge, PageContainer, PremiumPanel, Shell } from "@/components/ui/primitives";
import { getCurrentUser } from "@/lib/auth";
import TransactionSearch from "./transaction-search";

export default async function TransactionCheck() {
  const user = await getCurrentUser();

  return (
    <Shell>
      <SiteNav user={user ? { name: user.name } : null} />
      <PageTransition>
        <main className="ambient-grid grid min-h-screen place-items-center px-5 py-28">
          <PageContainer className="grid items-center gap-8 lg:grid-cols-[.95fr_1.05fr]">
            <div className="reveal">
              <Link href="/" className="inline-flex items-center gap-2 text-sm font-black text-cyan-200 transition hover:text-cyan-100">
                <ArrowLeft size={16} aria-hidden="true" />
                Beranda
              </Link>
              <Badge tone="blue">
                <ReceiptText size={14} aria-hidden="true" />
                Transaction tracker
              </Badge>
              <h1 className="mt-5 text-balance text-4xl font-black text-white sm:text-5xl">Cek status pembayaran dan proses top up.</h1>
              <p className="mt-4 max-w-xl leading-7 text-slate-400">Masukkan nomor pesanan untuk melihat status pembayaran, status pengiriman, total, metode bayar, dan riwayat update dari database.</p>
            </div>
            <PremiumPanel className="reveal reveal-delay-2 w-full">
              <div className="flex items-start gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-200">
                  <Clock3 size={22} aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-2xl font-black text-white">Lacak pesanan</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">Data pelanggan disamarkan, tetapi status utama tetap terlihat jelas.</p>
                </div>
              </div>
              <TransactionSearch />
              <p className="mt-5 flex gap-2 text-xs leading-5 text-slate-500">
                <ShieldCheck size={15} className="mt-0.5 shrink-0 text-emerald-300" aria-hidden="true" />
                Reference order digunakan hanya untuk mencari transaksi terkait di sistem Nexa Topup.
              </p>
            </PremiumPanel>
          </PageContainer>
        </main>
      </PageTransition>
      <SiteFooter />
    </Shell>
  );
}
