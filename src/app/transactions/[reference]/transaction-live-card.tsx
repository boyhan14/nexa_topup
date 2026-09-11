"use client";

import { Check, CheckCircle2, Clock, Copy, Printer, RefreshCw, Share2, Sparkles, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/components/ui/primitives";

const statusTone: Record<string, string> = {
  SUCCESS: "border-emerald-300/30 bg-emerald-400/15 text-emerald-100",
  PAID: "border-emerald-300/30 bg-emerald-400/15 text-emerald-100",
  PROCESSING: "border-cyan-300/30 bg-cyan-300/15 text-cyan-100 animate-pulse",
  PENDING_PAYMENT: "border-amber-300/30 bg-amber-300/15 text-amber-100",
  PENDING: "border-amber-300/30 bg-amber-300/15 text-amber-100",
  FAILED: "border-rose-300/30 bg-rose-400/15 text-rose-100",
  EXPIRED: "border-rose-300/30 bg-rose-400/15 text-rose-100",
  CANCELLED: "border-slate-300/15 bg-white/5 text-slate-300",
  REFUNDED: "border-blue-300/30 bg-blue-400/15 text-blue-100",
};

export function StatusPill({ value }: { value: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black tracking-wide", statusTone[value] ?? "border-white/10 bg-white/5 text-slate-300")}>
      {value === "SUCCESS" || value === "PAID" ? (
        <CheckCircle2 size={13} className="text-emerald-300" />
      ) : value === "FAILED" || value === "EXPIRED" ? (
        <XCircle size={13} className="text-rose-300" />
      ) : (
        <Clock size={13} className="text-amber-300" />
      )}
      {value.replaceAll("_", " ")}
    </span>
  );
}

export default function TransactionLiveCard({
  reference,
  initialStatus,
  initialPaymentStatus,
  initialFulfillmentStatus,
  gameName,
  productName,
  totalFormatted,
}: {
  reference: string;
  initialStatus: string;
  initialPaymentStatus: string;
  initialFulfillmentStatus: string;
  gameName: string;
  productName: string;
  totalFormatted: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [paymentStatus, setPaymentStatus] = useState(initialPaymentStatus);
  const [fulfillmentStatus, setFulfillmentStatus] = useState(initialFulfillmentStatus);
  const [copied, setCopied] = useState(false);
  const [isPolling, setIsPolling] = useState(
    initialPaymentStatus === "PENDING" || initialStatus === "PENDING_PAYMENT" || initialStatus === "PROCESSING"
  );
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    if (!isPolling) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${reference}`);
        if (!res.ok) return;
        const json = await res.json();
        if (json.success && json.data) {
          const d = json.data;
          setStatus(d.status);
          setPaymentStatus(d.paymentStatus);
          setFulfillmentStatus(d.fulfillmentStatus);
          setLastChecked(new Date());

          if (d.status === "SUCCESS" || d.status === "FAILED" || d.status === "EXPIRED" || d.status === "CANCELLED") {
            setIsPolling(false);
          }
        }
      } catch (err) {
        console.error("Gagal polling status pesanan:", err);
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [isPolling, reference]);

  function copyReference() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function shareWhatsApp() {
    const text = `Halo, saya mengecek transaksi top-up Nexa:\nNomor: ${reference}\nItem: ${productName} (${gameName})\nTotal: ${totalFormatted}\nStatus: ${status}\nLink: ${typeof window !== "undefined" ? window.location.href : ""}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  }

  function printReceipt() {
    if (typeof window !== "undefined") {
      window.print();
    }
  }

  const isSuccess = status === "SUCCESS" || paymentStatus === "PAID";

  return (
    <div className="grid gap-6">
      {/* SUCCESS CELEBRATION BANNER */}
      {isSuccess ? (
        <div className="checkout-success flex items-center justify-between gap-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 sm:p-5 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20">
              <Sparkles size={24} />
            </span>
            <div>
              <p className="text-base font-black text-emerald-100 sm:text-lg">Pembayaran Dikonfirmasi!</p>
              <p className="text-xs text-emerald-200/80 sm:text-sm">
                {fulfillmentStatus === "SUCCESS"
                  ? "Item game telah berhasil masuk ke akun Anda."
                  : "Sistem sedang memproses pengiriman produk ke akun game Anda."}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* LIVE STATUS SUMMARY BAR */}
      <section className="rounded-[2rem] border border-white/10 bg-[#071122]/86 p-5 shadow-2xl shadow-black/20 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="section-eyebrow">Status Transaksi Real-time</p>
              {isPolling ? (
                <span className="flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-0.5 text-xs font-bold text-cyan-300">
                  <RefreshCw size={12} className="animate-spin text-cyan-300" />
                  Live Auto-Refresh
                </span>
              ) : null}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h1 className="text-balance text-3xl font-black text-white sm:text-4xl">{reference}</h1>
              <button
                type="button"
                onClick={copyReference}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 transition hover:border-cyan-300/40 hover:text-white"
                title="Salin nomor referensi"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copied ? "Tersalin!" : "Salin"}
              </button>
            </div>

            {lastChecked ? (
              <p className="mt-2 text-xs text-slate-400">
                Pembaruan terakhir: {lastChecked.toLocaleTimeString("id-ID")}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-3 gap-2 lg:min-w-[28rem]">
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-center sm:p-4">
              <p className="text-xs font-bold text-slate-400">Status Order</p>
              <div className="mt-2 flex justify-center">
                <StatusPill value={status} />
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-center sm:p-4">
              <p className="text-xs font-bold text-slate-400">Pembayaran</p>
              <div className="mt-2 flex justify-center">
                <StatusPill value={paymentStatus} />
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-center sm:p-4">
              <p className="text-xs font-bold text-slate-400">Pengiriman</p>
              <div className="mt-2 flex justify-center">
                <StatusPill value={fulfillmentStatus} />
              </div>
            </div>
          </div>
        </div>

        {/* QUICK ACTION BUTTONS */}
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5 print:hidden">
          <button
            type="button"
            onClick={shareWhatsApp}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/20"
          >
            <Share2 size={15} />
            Bagikan ke WhatsApp
          </button>

          <button
            type="button"
            onClick={printReceipt}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <Printer size={15} />
            Cetak / Simpan Struk
          </button>
        </div>
      </section>
    </div>
  );
}

