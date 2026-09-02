"use client";

import { CheckCircle2, CreditCard, LockKeyhole, UserRound } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cn, EmptyPanel, LoadingSpinner, StepIndicator } from "@/components/ui/primitives";

type Product = { id: string; name: string; price: string };
type PaymentMethod = { id: string; code: string; name: string; providerCode: string };
type UserSummary = { id: string; name: string };
type OrderResponse = { success?: boolean; message?: string; data?: { reference?: string; paymentUrl?: string | null; snapToken?: string | null } };

export function isCheckoutSubmitEnabled({
  user,
  userId,
  selectedProduct,
  selectedPayment,
  pending,
}: {
  user: UserSummary | null;
  userId: string;
  selectedProduct: Product | null;
  selectedPayment: PaymentMethod | null;
  pending: boolean;
}) {
  return Boolean(user && userId.trim() && selectedProduct && selectedPayment && !pending);
}

const steps = ["Data", "Produk", "Pembayaran", "Selesai"];

function idempotencyKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `nexa-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function PurchasePanel({
  products,
  paymentMethods,
  user,
}: {
  products: Product[];
  paymentMethods: PaymentMethod[];
  user: UserSummary | null;
}) {
  const router = useRouter();
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id ?? "");
  const [selectedPaymentId, setSelectedPaymentId] = useState(paymentMethods[0]?.id ?? "");
  const [userId, setUserId] = useState("");
  const [serverId, setServerId] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedProduct = useMemo(() => products.find((product) => product.id === selectedProductId) ?? null, [products, selectedProductId]);
  const selectedPayment = useMemo(() => paymentMethods.find((method) => method.id === selectedPaymentId) ?? null, [paymentMethods, selectedPaymentId]);
  const currentStep = success ? 3 : selectedPayment && selectedProduct && userId.trim() ? 2 : userId.trim() ? 1 : 0;
  const canSubmit = isCheckoutSubmitEnabled({ user, userId, selectedProduct, selectedPayment, pending });

  async function loadSnapScript() {
    if (typeof window === "undefined") return;
    if ((window as typeof window & { snap?: { pay: (token: string, options?: Record<string, unknown>) => void } }).snap) return;

    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.async = true;
    script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "");
    document.body.appendChild(script);

    await new Promise<void>((resolve, reject) => {
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Snap script gagal dimuat."));
    });
  }

  async function checkout() {
    if (!selectedProduct || !selectedPayment || !userId.trim()) return;
    setPending(true);
    setError("");
    setSuccess("");

    let response: Response;
    try {
      response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey(),
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          paymentMethodId: selectedPayment.id,
          target: { userId: userId.trim(), serverId: serverId.trim() || undefined },
        }),
      });
    } catch {
      setPending(false);
      setError("Tidak dapat terhubung ke server. Coba lagi.");
      return;
    }

    const body = (await response.json().catch(() => null)) as OrderResponse | null;
    if (!response.ok || !body?.success) {
      setPending(false);
      if (response.status === 401) {
        setError("Silakan masuk sebelum membuat transaksi.");
        return;
      }
      setError(body?.message ?? "Gagal membuat transaksi. Coba lagi.");
      return;
    }

    const reference = body.data?.reference;
    const snapToken = body.data?.snapToken;
    const paymentUrl = body.data?.paymentUrl;
    setSuccess(reference ? `Order ${reference} dibuat.` : "Order berhasil dibuat.");

    if (snapToken) {
      try {
        setPending(false);
        await loadSnapScript();
        const snap = (window as typeof window & { snap?: { pay: (token: string, options?: Record<string, unknown>) => void } }).snap;
        if (!snap) {
          throw new Error("Midtrans Snap belum siap.");
        }

        snap.pay(snapToken, {
          onSuccess: () => {
            window.location.href = `/transactions/${reference}`;
          },
          onPending: () => {
            window.location.href = `/transactions/${reference}`;
          },
          onError: () => {
            window.location.href = `/transactions/${reference}`;
          },
          onClose: () => {
            window.location.href = `/transactions/${reference}`;
          },
        });
        return;
      } catch {
        setError("Midtrans Snap gagal dimuat. Coba lagi.");
        return;
      }
    }

    if (paymentUrl) {
      window.setTimeout(() => {
        window.location.href = paymentUrl;
      }, 420);
      return;
    }
    if (reference) {
      window.setTimeout(() => router.push(`/transactions/${reference}`), 420);
      return;
    }
    setPending(false);
  }

  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-[#081122]/82 p-5 shadow-2xl shadow-black/20 backdrop-blur sm:p-6">
      <StepIndicator steps={steps} current={currentStep} />

      <div className="mt-7 grid gap-7">
        <div>
          <div className="flex items-center gap-2">
            <UserRound size={18} className="text-cyan-300" aria-hidden="true" />
            <h2 className="text-xl font-black text-white">Data akun game</h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-bold text-slate-200">
              User ID / Player ID
              <input value={userId} onChange={(event) => setUserId(event.target.value)} className="field mt-2" placeholder="Masukkan Player ID" autoComplete="off" />
            </label>
            <label className="block text-sm font-bold text-slate-200">
              Server ID
              <input value={serverId} onChange={(event) => setServerId(event.target.value)} className="field mt-2" placeholder="Opsional" autoComplete="off" />
            </label>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-black text-white">Pilih nominal</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {products.map((product) => {
              const selected = selectedProductId === product.id;
              return (
                <button
                  type="button"
                  key={product.id}
                  onClick={() => {
                    setSelectedProductId(product.id);
                    setError("");
                  }}
                  className={cn(
                    "checkout-choice interactive-lift min-h-28 rounded-2xl border p-4 text-left transition",
                    selected ? "checkout-choice-active border-cyan-300/60 bg-cyan-300/10 shadow-[0_0_0_1px_rgba(0,217,255,.24)]" : "border-white/10 bg-white/[0.035]",
                  )}
                  aria-pressed={selected}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span>
                      <span className="block font-black text-white">{product.name}</span>
                      <span className="mt-2 block text-sm font-bold text-cyan-200">{product.price}</span>
                    </span>
                    {selected ? <CheckCircle2 size={20} className="text-cyan-300" aria-hidden="true" /> : null}
                  </span>
                </button>
              );
            })}
            {!products.length ? <EmptyPanel title="Produk belum tersedia" description="Produk aktif untuk game ini belum ditambahkan dari dashboard." /> : null}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-cyan-300" aria-hidden="true" />
            <h2 className="text-xl font-black text-white">Metode pembayaran</h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {paymentMethods.map((method) => {
              const selected = selectedPaymentId === method.id;
              return (
                <button
                  type="button"
                  key={method.id}
                  onClick={() => {
                    setSelectedPaymentId(method.id);
                    setError("");
                  }}
                  className={cn(
                    "checkout-choice interactive-lift rounded-2xl border p-4 text-left transition",
                    selected ? "checkout-choice-active border-cyan-300/60 bg-cyan-300/10" : "border-white/10 bg-white/[0.035]",
                  )}
                  aria-pressed={selected}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span>
                      <span className="block font-black text-white">{method.name}</span>
                      <span className="mt-1 block text-xs font-bold uppercase text-slate-500">{method.providerCode} / {method.code}</span>
                    </span>
                    {selected ? <CheckCircle2 size={20} className="text-cyan-300" aria-hidden="true" /> : null}
                  </span>
                </button>
              );
            })}
            {!paymentMethods.length ? <EmptyPanel title="Metode pembayaran belum aktif" description="Aktifkan metode pembayaran dari dashboard admin sebelum checkout tersedia." /> : null}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">Total pembayaran</p>
              <p className="mt-1 text-2xl font-black text-cyan-200">{selectedProduct?.price ?? "-"}</p>
            </div>
            <LockKeyhole size={22} className="text-slate-500" aria-hidden="true" />
          </div>
          {error ? (
            <p role="alert" className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-400/10 p-3 text-sm text-rose-100">
              {error} {error.includes("masuk") ? <Link href="/login" className="font-black text-white underline">Masuk sekarang</Link> : null}
            </p>
          ) : null}
          {success ? (
            <p role="status" className="checkout-success mt-4 flex items-center gap-2 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-3 text-sm text-emerald-100">
              <CheckCircle2 size={18} aria-hidden="true" />
              {success}
            </p>
          ) : null}
          {!user ? (
            <Link href="/login?next=/games/adit-pecut" className="button mt-4 w-full py-3">
              Masuk dulu untuk bayar
            </Link>
          ) : (
            <button type="button" disabled={!canSubmit} onClick={checkout} className="button mt-4 w-full py-3" aria-live="polite">
              {pending ? <LoadingSpinner label="Membuat transaksi" /> : "Bayar Sekarang"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
