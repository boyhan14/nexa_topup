"use client";
export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="rounded-2xl border border-rose-400/30 bg-rose-950/30 p-6"><h2 className="text-xl font-black">Data admin gagal dimuat</h2><p className="mt-2 text-sm text-rose-200">Silakan coba kembali. Jika masalah berlanjut, periksa koneksi database dan log server.</p><button onClick={reset} className="mt-4 rounded-lg bg-rose-300 px-4 py-2 font-bold text-slate-950">Coba lagi</button></div>;
}
