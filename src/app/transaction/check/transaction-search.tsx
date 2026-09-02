"use client";

import { Search } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function TransactionSearch() {
  const router = useRouter();
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = reference.trim().toUpperCase();
    if (!value) {
      setError("Masukkan nomor pesanan terlebih dahulu.");
      return;
    }
    router.push(`/transactions/${encodeURIComponent(value)}`);
  }

  return (
    <form onSubmit={submit} className="mt-7 rounded-2xl border border-white/10 bg-white/[0.045] p-3">
      <label className="flex items-center gap-3">
        <Search size={19} className="text-cyan-200" aria-hidden="true" />
        <span className="sr-only">Nomor pesanan</span>
        <input value={reference} onChange={(event) => { setReference(event.target.value); setError(""); }} placeholder="Contoh: NXT-20260001" className="min-w-0 flex-1 bg-transparent py-3 text-white outline-none placeholder:text-slate-500" />
      </label>
      {error ? <p role="alert" className="mt-3 text-sm text-rose-200">{error}</p> : null}
      <button className="button mt-3 w-full py-3" type="submit">Lacak pesanan</button>
    </form>
  );
}
