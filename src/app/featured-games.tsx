import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { GameCard } from "@/components/site/game-card";
import { EmptyPanel, PageContainer, SectionHeader } from "@/components/ui/primitives";
import { formatRupiah } from "@/lib/money";
import { getPublicGames } from "@/lib/public-catalog";

export default async function FeaturedGames() {
  const games = (await getPublicGames()).slice(0, 6);

  return (
    <section className="bg-[#071122]/72 py-16 sm:py-20" id="game">
      <PageContainer>
        <SectionHeader
          eyebrow="Paling populer"
          title="Game favorit untuk top up cepat"
          description="Katalog aktif dari dashboard ditampilkan dengan harga termurah sebagai sinyal awal sebelum pelanggan memilih nominal."
          action={
            <Link href="/games" className="button button-secondary hidden px-4 py-2 text-sm sm:inline-flex">
              Lihat semua
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          }
        />
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game, index) => (
            <div key={game.id} className="reveal" style={{ animationDelay: `${index * 70}ms` }}>
              <GameCard
                href={`/games/${game.slug}`}
                name={game.name}
                description={game.description}
                category={game.category.name}
                imageUrl={game.bannerUrl ?? game.iconUrl}
                priceLabel={game.products[0] ? `Mulai ${formatRupiah(game.products[0].sellingPrice)}` : "Produk segera tersedia"}
                index={index}
              />
            </div>
          ))}
          {!games.length ? <EmptyPanel title="Belum ada game aktif" description="Tambahkan game aktif dari dashboard admin untuk menampilkan katalog publik." /> : null}
        </div>
      </PageContainer>
    </section>
  );
}
