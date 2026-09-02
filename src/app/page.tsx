import { Check, ChevronRight, Clock3, CreditCard, Search, ShieldCheck, Zap } from "lucide-react";
import FeaturedGames from "@/app/featured-games";
import HomeNavigation from "@/app/home-navigation";
import SiteFooter from "@/components/site/site-footer";
import PageTransition from "@/components/site/page-transition";
import PromoBannerCarousel from "@/components/site/promo-banner-carousel";
import { Badge, PageContainer, PremiumPanel, Shell } from "@/components/ui/primitives";
import { MagneticCTA } from "@/components/ui/magnetic-cta";
import { services } from "@/lib/catalog";
import { formatRupiah } from "@/lib/money";
import { getPublicBannersSafely, getPublicGames } from "@/lib/public-catalog";

const assurances = [
  { label: "Proses instan", icon: Zap },
  { label: "Pembayaran aman", icon: ShieldCheck },
  { label: "Status terlacak", icon: Clock3 },
];

export default async function Home() {
  const [allGames, banners] = await Promise.all([getPublicGames(), getPublicBannersSafely()]);
  const heroGames = allGames.slice(0, 3);

  return (
    <Shell>
      <HomeNavigation />
      <PageTransition>
        <main className="ambient-grid">
          {banners.length ? (
            <section className="pt-24 sm:pt-28">
              <PageContainer>
                <PromoBannerCarousel banners={banners} />
              </PageContainer>
            </section>
          ) : null}

          <section className={`relative ${banners.length ? "pt-12 sm:pt-16 lg:pt-20" : "pt-28 sm:pt-32 lg:pt-36"}`}>
            <PageContainer className="grid min-h-[calc(100vh-7rem)] items-center gap-12 pb-16 lg:grid-cols-[1.02fr_.98fr] lg:pb-20">
              <div className="reveal max-w-3xl">
                <Badge tone="cyan">
                  <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(0,217,255,.8)]" />
                  Modern gaming commerce
                </Badge>
                <h1 className="mt-6 text-balance text-4xl font-black leading-[1.04] text-white sm:text-6xl lg:text-7xl">
                  Top Up Game. <span className="text-cyan-300">Instant.</span> Secure. Simple.
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                  Isi ulang game favoritmu dalam hitungan detik dengan alur pembayaran yang jelas, status transaksi real-time, dan pengalaman yang nyaman di semua perangkat.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <MagneticCTA href="/games">Mulai Top Up</MagneticCTA>
                  <MagneticCTA href="/games" variant="secondary">Jelajahi Game</MagneticCTA>
                </div>
                <form action="/games" className="mt-9 flex max-w-xl items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] p-2 shadow-2xl shadow-black/20 backdrop-blur">
                  <Search className="ml-3 shrink-0 text-cyan-200" size={20} aria-hidden="true" />
                  <input name="q" aria-label="Cari game atau produk" placeholder="Cari game atau produk..." className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500" />
                  <button className="button px-5 py-3 text-sm" type="submit">Cari</button>
                </form>
                <div className="mt-7 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
                  {assurances.map(({ label, icon: Icon }) => (
                    <span className="flex items-center gap-2" key={label}>
                      <Icon size={16} className="text-cyan-300" aria-hidden="true" />
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="reveal reveal-delay-2 relative min-h-[31rem] lg:min-h-[39rem]">
                <div className="hero-visual float-soft absolute inset-x-2 top-6 overflow-hidden rounded-[2rem] border border-white/10 p-5 shadow-2xl shadow-cyan-950/25 sm:inset-x-8 lg:inset-x-0">
                  <div className="hero-scanline absolute inset-0" />
                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black uppercase text-cyan-200">Live checkout</p>
                      <h2 className="mt-2 text-2xl font-black">Nexa Fastlane</h2>
                    </div>
                    <span className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-200">
                      <CreditCard size={22} aria-hidden="true" />
                    </span>
                  </div>
                  <div className="relative mt-8 grid gap-3">
                    {heroGames.length ? (
                      heroGames.map((game, index) => (
                        <div key={game.id} className="interactive-lift flex items-center gap-4 rounded-2xl border border-white/10 bg-[#050816]/70 p-3 backdrop-blur" style={{ animationDelay: `${index * 90}ms` }}>
                          <div
                            className="h-16 w-16 shrink-0 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-700"
                            style={
                              game.iconUrl || game.bannerUrl
                                ? {
                                    backgroundImage: `linear-gradient(180deg, rgba(5,8,22,.08), rgba(5,8,22,.52)), url(${game.iconUrl ?? game.bannerUrl})`,
                                    backgroundPosition: "center",
                                    backgroundSize: "cover",
                                  }
                                : undefined
                            }
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-black">{game.name}</p>
                            <p className="text-sm text-slate-400">{game.products[0] ? `Mulai ${formatRupiah(game.products[0].sellingPrice)}` : "Produk segera tersedia"}</p>
                          </div>
                          <ChevronRight className="text-cyan-200" size={18} aria-hidden="true" />
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-white/15 p-5 text-sm text-slate-400">Game aktif akan tampil di sini setelah ditambahkan dari dashboard.</div>
                    )}
                  </div>
                  <div className="relative mt-8 grid grid-cols-3 gap-3">
                    {["Data", "Produk", "Bayar"].map((step, index) => (
                      <div key={step} className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-center">
                        <p className="text-xl font-black text-cyan-200">{index + 1}</p>
                        <p className="mt-1 text-xs font-bold text-slate-300">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute bottom-5 left-0 right-10 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-emerald-100 shadow-2xl shadow-emerald-950/20 backdrop-blur sm:left-10 lg:left-8">
                  <div className="flex items-center gap-3">
                    <Check size={20} aria-hidden="true" />
                    <div>
                      <p className="font-black">Pembayaran terverifikasi</p>
                      <p className="text-sm text-emerald-100/75">Status order diperbarui dari gateway pembayaran.</p>
                    </div>
                  </div>
                </div>
              </div>
            </PageContainer>
          </section>

          <FeaturedGames />

          <section id="layanan" className="py-16 sm:py-20">
            <PageContainer>
              <div className="reveal">
                <p className="section-eyebrow">Satu tempat, semua kebutuhan</p>
                <h2 className="mt-3 max-w-2xl text-3xl font-black text-white sm:text-4xl">Layanan digital yang cepat dipahami dan mudah dilacak.</h2>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {services.map(({ name, desc, icon: Icon }, index) => (
                  <PremiumPanel key={name} as="article" className={`reveal reveal-delay-${Math.min(index, 3)}`}>
                    <span className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-200">
                      <Icon size={22} aria-hidden="true" />
                    </span>
                    <h3 className="mt-7 text-lg font-black text-white">{name}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{desc}</p>
                  </PremiumPanel>
                ))}
              </div>
            </PageContainer>
          </section>

          <section id="promo" className="border-y border-white/10 bg-white/[0.025] py-10">
            <PageContainer className="grid gap-4 md:grid-cols-3">
              {[["< 1 menit", "Rata-rata proses transaksi"], ["100% aman", "Pembayaran terenkripsi"], ["24/7", "Riwayat transaksi dapat dilacak"]].map(([metric, label]) => (
                <div key={metric} className="rounded-2xl border border-white/10 bg-[#081122]/80 p-5">
                  <p className="text-3xl font-black text-cyan-300">{metric}</p>
                  <p className="mt-2 text-sm text-slate-400">{label}</p>
                </div>
              ))}
            </PageContainer>
          </section>

          <section id="bantuan" className="py-16 sm:py-20">
            <PageContainer className="grid gap-8 lg:grid-cols-[.9fr_1.1fr]">
              <div>
                <p className="section-eyebrow">Alur jelas</p>
                <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">Transaksi tanpa tebak-tebakan.</h2>
                <p className="mt-4 max-w-md leading-7 text-slate-400">Setiap pembayaran dan proses pengiriman punya status terpisah, jadi pelanggan dan admin melihat progres yang sama dari database.</p>
              </div>
              <div className="grid gap-3">
                {[
                  ["Pilih produk", "Temukan nominal aktif sesuai data katalog."],
                  ["Masukkan ID akun", "Isi Player ID dan Server ID jika dibutuhkan."],
                  ["Bayar dan pantau", "Lanjut ke gateway pembayaran dan cek status order."],
                ].map(([title, description], index) => (
                  <div key={title} className="interactive-lift flex gap-4 rounded-2xl border border-white/10 bg-[#0d172c]/80 p-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cyan-300 text-sm font-black text-[#03111f]">{index + 1}</span>
                    <div>
                      <h3 className="font-black text-white">{title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </PageContainer>
          </section>
        </main>
      </PageTransition>
      <SiteFooter />
    </Shell>
  );
}
