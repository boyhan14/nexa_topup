import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminArea } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import BannerForm from "../banner-form";
import { updateBanner } from "../actions";

export default async function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminArea("catalog");
  const { id } = await params;
  const banner = await prisma.promotionalBanner.findUnique({ where: { id } });
  if (!banner) notFound();

  return (
    <div className="max-w-4xl">
      <Link href="/admin/banners" className="text-sm font-bold text-cyan-300 hover:text-cyan-100">Kembali ke banner</Link>
      <h1 className="mt-4 text-3xl font-black text-white">Edit banner</h1>
      <p className="mt-2 text-sm text-slate-400">Perubahan akan langsung diperhitungkan oleh filter jadwal storefront.</p>
      <section className="mt-7 rounded-2xl border border-white/10 bg-[#101a31] p-5 sm:p-6">
        <BannerForm
          action={updateBanner}
          banner={{
            ...banner,
            startAt: banner.startAt?.toISOString() ?? null,
            endAt: banner.endAt?.toISOString() ?? null,
          }}
        />
      </section>
    </div>
  );
}
