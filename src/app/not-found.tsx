import Link from "next/link";
import { SearchX } from "lucide-react";
import { EmptyPanel, Shell } from "@/components/ui/primitives";

export default function NotFound() {
  return (
    <Shell>
      <main className="grid min-h-screen place-items-center px-5 py-12">
        <section className="w-full max-w-lg text-center">
          <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.045] text-cyan-200">
            <SearchX size={26} aria-hidden="true" />
          </span>
          <EmptyPanel title="Halaman tidak ditemukan" description="Konten yang kamu cari belum tersedia atau sudah dipindahkan." />
          <Link href="/" className="button mt-6">Kembali ke beranda</Link>
        </section>
      </main>
    </Shell>
  );
}
