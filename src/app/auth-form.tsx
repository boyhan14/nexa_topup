"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowLeft, LockKeyhole, Mail, ShieldCheck, Sparkles, UserRound, Zap } from "lucide-react";
import { LoadingSpinner, Shell } from "@/components/ui/primitives";

type Mode = "login" | "register";

const inputClassName = "field mt-2";

async function readResponseBody(response: Response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as { error?: string; user?: { role?: string } };
  } catch {
    return null;
  }
}

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const isLogin = mode === "login";
  const pageError = searchParams.get("error") ?? "";
  const requestedNext = searchParams.get("next");
  const next = requestedNext?.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : isLogin ? "/" : "/games";
  const googleHref = `/api/auth/google/start?mode=${mode}&next=${encodeURIComponent(next)}`;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    let response: Response;
    try {
      response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))),
      });
    } catch {
      setError("Tidak dapat terhubung ke server. Coba lagi.");
      setPending(false);
      return;
    }

    const body = await readResponseBody(response);
    if (!response.ok) {
      setError(body?.error ?? "Terjadi kesalahan. Coba lagi.");
      setPending(false);
      return;
    }

    router.push(body?.user?.role === "SUPER_ADMIN" ? "/admin" : next);
    router.refresh();
  }

  return (
    <Shell>
      <main className="ambient-grid grid min-h-screen place-items-center px-5 py-12 text-white">
        <section className="reveal w-full max-w-md rounded-[2rem] border border-white/10 bg-[#071122]/86 p-6 shadow-2xl shadow-black/25 backdrop-blur sm:p-7">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-black text-cyan-200 transition hover:text-cyan-100">
            <ArrowLeft size={16} aria-hidden="true" />
            Nexa Topup
          </Link>
          <div className="mt-7 flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-300 text-[#03111f] shadow-lg shadow-cyan-400/20">
              <Zap size={22} fill="currentColor" aria-hidden="true" />
            </span>
            <div>
              <p className="section-eyebrow">{isLogin ? "Welcome back" : "Create account"}</p>
              <h1 className="mt-1 text-3xl font-black">{isLogin ? "Masuk" : "Buat akun"}</h1>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-400">
            {isLogin ? "Gunakan akun Nexa Topup untuk melanjutkan checkout dan memantau transaksi." : "Daftar untuk membuat transaksi top up. Password minimal 12 karakter."}
          </p>
        {(error || pageError) && (
          <p role="alert" className="mt-5 rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
            {error || pageError}
          </p>
        )}
        <a href={googleHref} className="interactive-lift mt-6 flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white px-4 py-3 font-bold text-slate-950 transition hover:bg-slate-100">
          <span className="grid h-6 w-6 place-items-center rounded-full border border-slate-200 text-sm font-black text-blue-600">G</span>
          {isLogin ? "Masuk dengan Google" : "Daftar dengan Google"}
        </a>
        <div className="mt-6 flex items-center gap-3 text-xs font-bold uppercase text-slate-500">
          <span className="h-px flex-1 bg-white/10" />
          atau
          <span className="h-px flex-1 bg-white/10" />
        </div>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {!isLogin && (
            <label className="block text-sm font-medium">
              <span className="flex items-center gap-2"><UserRound size={15} className="text-cyan-300" aria-hidden="true" /> Nama</span>
              <input name="name" required minLength={2} maxLength={100} className={inputClassName} />
            </label>
          )}
          <label className="block text-sm font-medium">
            <span className="flex items-center gap-2"><Mail size={15} className="text-cyan-300" aria-hidden="true" /> Email</span>
            <input name="email" type="email" required autoComplete="email" className={inputClassName} />
          </label>
          <label className="block text-sm font-medium">
            <span className="flex items-center gap-2"><LockKeyhole size={15} className="text-cyan-300" aria-hidden="true" /> Password</span>
            <input name="password" type="password" required minLength={isLogin ? 1 : 12} autoComplete={isLogin ? "current-password" : "new-password"} className={inputClassName} />
          </label>
          <button disabled={pending} className="button w-full py-3">
            {pending ? <LoadingSpinner label="Memproses" /> : isLogin ? "Masuk" : "Daftar"}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-400">
          {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
          <Link className="font-bold text-cyan-300" href={isLogin ? "/register" : "/login"}>
            {isLogin ? "Daftar" : "Masuk"}
          </Link>
        </p>
          <p className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">
            {isLogin ? <ShieldCheck size={14} className="text-emerald-300" aria-hidden="true" /> : <Sparkles size={14} className="text-cyan-300" aria-hidden="true" />}
            Sesi akun dilindungi cookie aman dan validasi server.
          </p>
        </section>
      </main>
    </Shell>
  );
}
