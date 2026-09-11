import { ArrowLeft, CheckCircle2, Gamepad2, ShieldCheck, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteFooter from "@/components/site/site-footer";
import SiteNav from "@/components/site/site-nav";
import PageTransition from "@/components/site/page-transition";
import { Badge, PageContainer, PremiumPanel, Shell } from "@/components/ui/primitives";
import { getCurrentUser } from "@/lib/auth";
import { formatRupiah } from "@/lib/money";
import { getActivePaymentMethods, getPublicGame } from "@/lib/public-catalog";
import PurchasePanel from "./purchase-panel";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const game = await getPublicGame(slug);
  if (!game) {
    return { title: "Game Tidak Ditemukan | Nexa TopUp" };
  }

  const minPrice = game.products[0] ? formatRupiah(game.products[0].sellingPrice) : "";
  const title = `Top Up ${game.name} Instan & Terpercaya | Nexa TopUp`;
  const description = `${game.description.slice(0, 140)}... ${minPrice ? `Mulai ${minPrice}.` : ""} Pembayaran aman dengan QRIS, E-Wallet, dan VA.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: game.bannerUrl ? [game.bannerUrl] : game.iconUrl ? [game.iconUrl] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: game.bannerUrl ? [game.bannerUrl] : game.iconUrl ? [game.iconUrl] : [],
    },
  };
}

export default async function GameDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [game, paymentMethods, user] = await Promise.all([getPublicGame(slug), getActivePaymentMethods(), getCurrentUser()]);
  if (!game) notFound();

  const products = game.products.map((product) => ({
    id: product.id,
    name: product.name,
    price: formatRupiah(product.sellingPrice),
    image: product.image,
  }));
  const startingPrice = game.products[0] ? formatRupiah(game.products[0].sellingPrice) : "Produk segera tersedia";

  return (
    <Shell>
      <SiteNav user={user ? { name: user.name } : null} />
      <PageTransition>
        <main className="ambient-grid pt-28">
          <PageContainer className="pb-24 sm:pb-20">
            <Link href="/games" className="inline-flex items-center gap-2 text-sm font-black text-cyan-200 transition hover:text-cyan-100">
              <ArrowLeft size={16} aria-hidden="true" />
              Katalog game
            </Link>

            <section className="reveal mt-6 overflow-hidden rounded-[2rem] border border-white/10 bg-[#071122]/86 shadow-2xl shadow-black/20">
              <div
                className="relative flex min-h-[21rem] items-end bg-gradient-to-br from-cyan-500/80 via-blue-700/70 to-[#071122] p-5 sm:p-8 lg:min-h-[27rem]"
                style={
                  game.bannerUrl
                    ? {
                        backgroundImage: `linear-gradient(180deg, rgba(5,8,22,.15), rgba(5,8,22,.9)), url(${game.bannerUrl})`,
                        backgroundPosition: "center",
                        backgroundSize: "cover",
                      }
                    : undefined
                }
              >
                <div className="hero-scanline absolute inset-0" />
                <div className="relative max-w-3xl">
                  <Badge tone="cyan">
                    <Gamepad2 size={14} aria-hidden="true" />
                    {game.category.name}
                  </Badge>
                  <h1 className="mt-5 text-balance text-4xl font-black text-white sm:text-6xl">{game.name}</h1>
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">{game.description}</p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Badge tone="blue">
                      <Sparkles size={14} aria-hidden="true" />
                      Mulai {startingPrice}
                    </Badge>
                    <Badge tone={products.length ? "green" : "amber"}>{products.length} nominal aktif</Badge>
                  </div>
                </div>
              </div>
            </section>

            <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_23rem]">
              <PurchasePanel
                products={products}
                paymentMethods={paymentMethods}
                user={user ? { id: user.id, name: user.name } : null}
                gameSlug={game.slug}
                gameName={game.name}
                targetConfig={game.targetConfig}
              />

              <aside className="grid content-start gap-4">
                <PremiumPanel as="section">
                  <h2 className="text-lg font-black text-white">Ringkasan game</h2>
                  <dl className="mt-5 grid gap-4 text-sm">
                    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
                      <dt className="text-slate-400">Kategori</dt>
                      <dd className="font-bold text-white">{game.category.name}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
                      <dt className="text-slate-400">Nominal</dt>
                      <dd className="font-bold text-white">{products.length}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-slate-400">Harga awal</dt>
                      <dd className="font-bold text-cyan-200">{startingPrice}</dd>
                    </div>
                  </dl>
                </PremiumPanel>

                <PremiumPanel as="section">
                  <div className="flex items-start gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-emerald-300/25 bg-emerald-400/10 text-emerald-100">
                      <ShieldCheck size={20} aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="font-black text-white">Status terlacak</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-400">Setelah order dibuat, halaman transaksi menampilkan status pembayaran, proses top up, total, dan riwayat update secara real-time.</p>
                    </div>
                  </div>
                  <Link href="/transaction/check" className="button button-secondary mt-5 w-full py-3 text-sm">
                    Cek transaksi
                  </Link>
                </PremiumPanel>

                <PremiumPanel as="section">
                  <h2 className="font-black text-white">Tips sebelum bayar</h2>
                  <div className="mt-4 grid gap-3 text-sm text-slate-400">
                    {[
                      "Pastikan User ID / Zone ID sudah benar.",
                      "Pilih server hanya jika game membutuhkannya.",
                      "Nomor WhatsApp digunakan untuk bukti & pelacakan status.",
                      "Pembayaran QRIS diproses otomatis dalam 10-30 detik."
                    ].map((item) => (
                      <p key={item} className="flex gap-2">
                        <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-cyan-300" aria-hidden="true" />
                        <span>{item}</span>
                      </p>
                    ))}
                  </div>
                </PremiumPanel>
              </aside>
            </div>
          </PageContainer>
        </main>
      </PageTransition>
      <SiteFooter />
    </Shell>
  );
}
