import Link from "next/link";
import { EmptyState, ConfirmButton } from "../admin-ui";
import { requireAdminArea } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { createGame, deleteGame } from "./actions";
import { GameForm } from "./game-form";

export default async function GamesPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; active?: string; page?: string }> }) {
  await requireAdminArea("catalog");
  const query = await searchParams;
  const page = Math.max(Number(query.page) || 1, 1);
  const take = 12;
  const where = {
    ...(query.q ? { name: { contains: query.q, mode: "insensitive" as const } } : {}),
    ...(query.category ? { categoryId: query.category } : {}),
    ...(query.active === "true" || query.active === "false" ? { isActive: query.active === "true" } : {}),
  };
  const [games, categories, total] = await Promise.all([
    prisma.game.findMany({ where, include: { category: true, _count: { select: { products: true } } }, orderBy: { createdAt: "desc" }, skip: (page - 1) * take, take }),
    prisma.gameCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.game.count({ where }),
  ]);

  return <div>
    <h1 className="text-3xl font-black">Game</h1>
    <p className="mt-2 text-slate-400">Katalog game yang tampil di storefront.</p>
    <form className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-[#101a31] p-4 md:grid-cols-4">
      <input name="q" defaultValue={query.q} placeholder="Cari game" className="field" />
      <select name="category" defaultValue={query.category} className="field"><option value="">Semua kategori</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
      <select name="active" defaultValue={query.active} className="field"><option value="">Semua status</option><option value="true">Aktif</option><option value="false">Nonaktif</option></select>
      <button className="button">Filter</button>
    </form>
    <details className="mt-5 rounded-2xl border border-white/10 bg-[#101a31] p-5"><summary className="cursor-pointer font-bold text-cyan-300">Tambah game</summary><GameForm categories={categories} action={createGame} /></details>
    <section className="mt-5 rounded-2xl border border-white/10 bg-[#101a31] p-5"><div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left text-sm"><thead className="border-b border-white/10 text-slate-400"><tr><th className="pb-3">Game</th><th>Kategori</th><th>Status</th><th>Produk</th><th>Aksi</th></tr></thead><tbody>
      {games.map((game) => <tr key={game.id} className="border-b border-white/5"><td className="py-4"><p className="font-bold">{game.name}</p><p className="text-xs text-slate-400">{game.slug}</p></td><td>{game.category.name}</td><td>{game.isActive ? "Aktif" : "Nonaktif"}{game.isFeatured ? " · Unggulan" : ""}</td><td>{game._count.products}</td><td className="space-x-3"><Link className="text-cyan-300" href={`/admin/games/${game.id}`}>Edit</Link><form className="inline" action={deleteGame}><input type="hidden" name="id" value={game.id} /><ConfirmButton message={`Hapus ${game.name}?`} className="text-rose-300">Hapus</ConfirmButton></form></td></tr>)}
      {!games.length ? <tr><td colSpan={5}><EmptyState text="Tidak ada game yang cocok." /></td></tr> : null}
    </tbody></table></div><div className="mt-5 flex justify-between text-sm text-slate-400"><span>{total} data</span><span className="space-x-3">{page > 1 ? <Link href={`?page=${page - 1}`}>← Sebelumnya</Link> : null}<b>{page}/{Math.max(Math.ceil(total / take), 1)}</b>{page < Math.max(Math.ceil(total / take), 1) ? <Link href={`?page=${page + 1}`}>Berikutnya →</Link> : null}</span></div></section>
  </div>;
}
