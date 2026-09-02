import Image from "next/image";
import Link from "next/link";
import { Badge, PremiumPanel } from "@/components/ui/primitives";
import { getBannerState } from "@/lib/banner";
import { requireAdminArea } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { ConfirmButton, EmptyState } from "../admin-ui";
import { createBanner, deleteBanner, toggleBanner } from "./actions";
import BannerForm from "./banner-form";

const stateTone = { ACTIVE: "green", INACTIVE: "neutral", SCHEDULED: "blue", EXPIRED: "rose" } as const;
const stateLabel = { ACTIVE: "Aktif", INACTIVE: "Nonaktif", SCHEDULED: "Terjadwal", EXPIRED: "Berakhir" } as const;

function formatDate(value: Date | null) {
  return value ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(value) : "Tanpa batas";
}

export default async function BannersPage() {
  await requireAdminArea("catalog");
  const banners = await prisma.promotionalBanner.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
  const now = new Date();

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-eyebrow">Storefront promotion</p>
          <h1 className="mt-2 text-3xl font-black text-white">Banner promosi</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Atur visual promo, tujuan internal, jadwal, dan urutan banner yang tampil di beranda Nexa Topup.</p>
        </div>
        <Badge tone="cyan">{banners.length} banner</Badge>
      </div>

      <details className="mt-7 rounded-2xl border border-white/10 bg-[#101a31] p-5" open={!banners.length}>
        <summary className="cursor-pointer font-bold text-cyan-300">Tambah banner promosi</summary>
        <BannerForm action={createBanner} />
      </details>

      <PremiumPanel className="mt-6 overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-white/10 text-xs font-black uppercase text-slate-500">
              <tr><th className="px-5 py-4">Preview</th><th className="py-4">Judul</th><th className="py-4">Status</th><th className="py-4">Jadwal</th><th className="py-4">Urutan</th><th className="py-4">Target</th><th className="px-5 py-4 text-right">Aksi</th></tr>
            </thead>
            <tbody>
              {banners.map((banner) => {
                const state = getBannerState(banner, now);
                return (
                  <tr key={banner.id} className="border-b border-white/5 last:border-0">
                    <td className="px-5 py-4"><div className="relative h-14 w-28 overflow-hidden rounded-xl border border-white/10 bg-[#071122]"><Image src={banner.imageUrl} alt={banner.title} fill sizes="112px" className="object-cover" /></div></td>
                    <td className="py-4"><p className="max-w-56 truncate font-black text-white">{banner.title}</p><p className="mt-1 max-w-64 truncate text-xs text-slate-500">{banner.description ?? "Tanpa deskripsi"}</p></td>
                    <td className="py-4"><Badge tone={stateTone[state]}>{stateLabel[state]}</Badge></td>
                    <td className="py-4 text-xs leading-5 text-slate-400"><p>Mulai: {formatDate(banner.startAt)}</p><p>Selesai: {formatDate(banner.endAt)}</p></td>
                    <td className="py-4 font-black text-cyan-200">{banner.sortOrder}</td>
                    <td className="py-4 font-mono text-xs text-slate-300">{banner.targetPath}</td>
                    <td className="px-5 py-4"><div className="flex justify-end gap-3 text-sm font-bold"><Link href={`/admin/banners/${banner.id}`} className="text-cyan-300 hover:text-cyan-100">Edit</Link><form action={toggleBanner}><input type="hidden" name="id" value={banner.id} /><button className="text-slate-300 hover:text-white">{banner.isActive ? "Nonaktifkan" : "Aktifkan"}</button></form><form action={deleteBanner}><input type="hidden" name="id" value={banner.id} /><ConfirmButton message={`Hapus banner ${banner.title}?`} className="text-rose-300 hover:text-rose-100">Hapus</ConfirmButton></form></div></td>
                  </tr>
                );
              })}
              {!banners.length ? <tr><td colSpan={7} className="px-5"><EmptyState text="Belum ada banner promosi. Tambahkan banner pertama untuk menampilkannya di beranda." /></td></tr> : null}
            </tbody>
          </table>
        </div>
      </PremiumPanel>
    </div>
  );
}
