import { ArrowRight, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import Link from "next/link";
import SiteFooter from "@/components/site/site-footer";
import SiteNav from "@/components/site/site-nav";
import { GameCard } from "@/components/site/game-card";
import PageTransition from "@/components/site/page-transition";
import { Badge, EmptyPanel, PageContainer, SectionHeader, Shell } from "@/components/ui/primitives";
import { getCurrentUser } from "@/lib/auth";
import { formatRupiah } from "@/lib/money";
import { getPublicCategories, getPublicGames } from "@/lib/public-catalog";

export default async function Games({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const category = params.category?.trim() ?? "";
  const [games, categories, user] = await Promise.all([getPublicGames(query, category || undefined), getPublicCategories(), getCurrentUser()]);
  const popularGames = games.filter((game) => game.isFeatured);
  const activeCategory = categories.find((item) => item.slug === category);

  return (
    <Shell>
      <SiteNav user={user ? { name: user.name } : null} />
      <PageTransition>
        <main className="ambient-grid pt-28">
          <PageContainer className="pb-16 sm:pb-20">
            <div className="reveal grid gap-8 rounded-[2rem] border border-white/10 bg-[#071122]/80 p-5 shadow-2xl shadow-black/20 backdrop-blur sm:p-7 lg:grid-cols-[1fr_.8fr]">
              <div>
                <Badge tone="cyan">
                  <Sparkles size={14} aria-hidden="true" />
                  Katalog aktif
                </Badge>
                <h1 className="mt-5 text-balance text-4xl font-black text-white sm:text-5xl">Temukan game dan nominal top up favoritmu.</h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                  Semua game dan harga di halaman ini berasal dari data aktif di dashboard, sehingga pelanggan hanya melihat produk yang siap dijual.
                </p>
              </div>
              <form className="self-end rounded-2xl border border-white/10 bg-white/[0.045] p-3">
                <label className="flex items-center gap-3">
                  <Search size={19} className="text-cyan-200" aria-hidden="true" />
                  <span className="sr-only">Cari game</span>
                  <input name="q" defaultValue={query} className="min-w-0 flex-1 bg-transparent py-2 text-white outline-none placeholder:text-slate-500" placeholder="Cari Mobile Legends, Valorant..." />
                </label>
                {category ? <input type="hidden" name="category" value={category} /> : null}
                <button className="button mt-3 w-full py-3 text-sm" type="submit">
                  Cari game
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              </form>
            </div>

            <section className="mt-8">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                <SlidersHorizontal size={17} aria-hidden="true" />
                Kategori
              </div>
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                <Link className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition ${category ? "border-white/10 bg-white/[0.04] text-slate-300 hover:text-white" : "border-cyan-300/40 bg-cyan-300/10 text-cyan-100"}`} href={query ? `/games?q=${encodeURIComponent(query)}` : "/games"}>
                  Semua
                </Link>
                {categories.map((item) => {
                  const href = `/games?${new URLSearchParams({ ...(query ? { q: query } : {}), category: item.slug }).toString()}`;
                  const active = item.slug === category;
                  return (
                    <Link key={item.id} href={href} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition ${active ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-100" : "border-white/10 bg-white/[0.04] text-slate-300 hover:text-white"}`}>
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </section>

            {popularGames.length ? (
              <section className="mt-10">
                <SectionHeader eyebrow="Popular games" title="Pilihan yang sedang ramai" description={activeCategory ? `Kategori ${activeCategory.name} dengan game unggulan aktif.` : "Game featured dari dashboard muncul lebih dulu untuk membantu pelanggan memilih cepat."} />
                <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {popularGames.slice(0, 3).map((game, index) => (
                    <div key={game.id} className="reveal" style={{ animationDelay: `${index * 80}ms` }}>
                      <GameCard href={`/games/${game.slug}`} name={game.name} description={game.description} category={game.category.name} imageUrl={game.bannerUrl ?? game.iconUrl} priceLabel={game.products[0] ? `Mulai ${formatRupiah(game.products[0].sellingPrice)}` : "Produk segera tersedia"} index={index} />
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="mt-12">
              <SectionHeader
                eyebrow="Semua game"
                title={query || category ? "Hasil katalog" : "Marketplace top up Nexa"}
                description={`${games.length} game tersedia${query ? ` untuk "${query}"` : ""}${activeCategory ? ` di kategori ${activeCategory.name}` : ""}.`}
              />
              <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {games.map((game, index) => (
                  <div key={game.id} className="reveal" style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}>
                    <GameCard href={`/games/${game.slug}`} name={game.name} description={game.description} category={game.category.name} imageUrl={game.bannerUrl ?? game.iconUrl} priceLabel={game.products[0] ? `Mulai ${formatRupiah(game.products[0].sellingPrice)}` : "Produk segera tersedia"} index={index} />
                  </div>
                ))}
                {!games.length ? <EmptyPanel title="Game tidak ditemukan" description="Coba gunakan kata kunci lain atau pilih kategori berbeda." /> : null}
              </div>
            </section>
          </PageContainer>
        </main>
      </PageTransition>
      <SiteFooter />
    </Shell>
  );
}
