"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Shell } from "@/components/ui/primitives";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Shell>
      <main className="grid min-h-screen place-items-center px-5 py-12 text-white">
        <section className="reveal w-full max-w-lg rounded-[2rem] border border-rose-300/20 bg-rose-400/10 p-6 text-center shadow-2xl shadow-black/25 backdrop-blur sm:p-8">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-rose-300/25 bg-rose-400/10 text-rose-100">
            <AlertTriangle size={26} aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-3xl font-black">Halaman gagal dimuat</h1>
          <p className="mt-3 text-sm leading-6 text-rose-100/78">{error.message || "Terjadi kesalahan saat memuat data. Coba muat ulang halaman."}</p>
          <button type="button" onClick={reset} className="button mt-6">
            <RotateCcw size={17} aria-hidden="true" />
            Muat ulang
          </button>
        </section>
      </main>
    </Shell>
  );
}
