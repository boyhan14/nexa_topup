import Link from "next/link";
import { ConfirmButton, EmptyState } from "../admin-ui";
import { requireAdminArea } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { createCategory, deleteCategory } from "./actions";

export default async function CategoriesPage() {
  await requireAdminArea("catalog");
  const categories = await prisma.gameCategory.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { games: true } } } });
  return <div><h1 className="text-3xl font-black">Kategori Game</h1><p className="mt-2 text-slate-400">Kelola kategori katalog game.</p><form action={createCategory} className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-[#101a31] p-5 md:grid-cols-[1fr_1fr_auto]"><input name="name" required placeholder="Nama kategori" className="field"/><input name="slug" required placeholder="slug-kategori" className="field"/><button className="button">Tambah</button></form><section className="mt-6 rounded-2xl border border-white/10 bg-[#101a31] p-5"><div className="overflow-x-auto"><table className="w-full min-w-[500px] text-left text-sm"><thead className="border-b border-white/10 text-slate-400"><tr><th className="pb-3">Nama</th><th className="pb-3">Slug</th><th className="pb-3">Game</th><th className="pb-3">Aksi</th></tr></thead><tbody>{categories.map((category) => <tr key={category.id} className="border-b border-white/5"><td className="py-3 font-bold">{category.name}</td><td className="py-3 text-slate-400">{category.slug}</td><td className="py-3">{category._count.games}</td><td className="space-x-3 py-3"><Link className="text-cyan-300" href={`/admin/categories/${category.id}`}>Edit</Link><form className="inline" action={deleteCategory}><input type="hidden" name="id" value={category.id}/><ConfirmButton message={`Hapus kategori ${category.name}?`} className="text-rose-300">Hapus</ConfirmButton></form></td></tr>)}{!categories.length&&<tr><td colSpan={4}><EmptyState text="Belum ada kategori."/></td></tr>}</tbody></table></div></section></div>;
}
