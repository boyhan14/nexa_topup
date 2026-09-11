"use client";

import { CheckCircle2, ChevronRight, CreditCard, HelpCircle, LockKeyhole, MessageSquareText, QrCode, Sparkles, Store, UserRound, Wallet } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cn, EmptyPanel, LoadingSpinner, StepIndicator } from "@/components/ui/primitives";

type Product = { id: string; name: string; price: string; image?: string | null };
type PaymentMethod = { id: string; code: string; name: string; providerCode: string };
type UserSummary = { id: string; name: string };
type OrderResponse = { success?: boolean; message?: string; data?: { reference?: string; paymentUrl?: string | null; snapToken?: string | null } };

export function isCheckoutSubmitEnabled({
  user,
  userId,
  selectedProduct,
  selectedPayment,
  pending,
  contact,
}: {
  user: UserSummary | null;
  userId: string;
  selectedProduct: Product | null;
  selectedPayment: PaymentMethod | null;
  pending: boolean;
  contact?: string;
}) {
  const hasContactOrUser = Boolean(user || (contact && contact.trim().length >= 3));
  return Boolean(hasContactOrUser && userId.trim() && selectedProduct && selectedPayment && !pending);
}

const steps = ["Akun Game", "Nominal", "Pembayaran", "Kontak & Bayar"];

function idempotencyKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `nexa-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function PurchasePanel({
  products,
  paymentMethods,
  user,
  gameSlug = "",
  gameName = "Game",
  targetConfig,
}: {
  products: Product[];
  paymentMethods: PaymentMethod[];
  user: UserSummary | null;
  gameSlug?: string;
  gameName?: string;
  targetConfig?: unknown;
}) {
  const router = useRouter();
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id ?? "");
  const [selectedPaymentId, setSelectedPaymentId] = useState(paymentMethods[0]?.id ?? "");
  const [userId, setUserId] = useState("");
  const [serverId, setServerId] = useState("");
  const [contact, setContact] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activePaymentTab, setActivePaymentTab] = useState<"ALL" | "EWALLET" | "VA" | "RETAIL">("ALL");

  const selectedProduct = useMemo(() => products.find((product) => product.id === selectedProductId) ?? null, [products, selectedProductId]);
  const selectedPayment = useMemo(() => paymentMethods.find((method) => method.id === selectedPaymentId) ?? null, [paymentMethods, selectedPaymentId]);

  // Dynamic game account field labels & placeholders
  const targetFields = useMemo(() => {
    if (targetConfig && typeof targetConfig === "object" && "fields" in targetConfig) {
      const cfg = targetConfig as { fields?: Array<{ label?: string; placeholder?: string; help?: string }> };
      if (Array.isArray(cfg.fields) && cfg.fields.length > 0) {
        return {
          field1Label: cfg.fields[0]?.label || "User ID / Player ID",
          field1Placeholder: cfg.fields[0]?.placeholder || "Masukkan Player ID",
          field1Help: cfg.fields[0]?.help || "",
          field2Label: cfg.fields[1]?.label || "",
          field2Placeholder: cfg.fields[1]?.placeholder || "",
          field2Required: Boolean(cfg.fields[1]),
          field2Help: cfg.fields[1]?.help || "",
          isServerSelect: false,
          servers: [],
        };
      }
    }
    const slug = gameSlug.toLowerCase();
    if (slug.includes("mobile-legends") || slug.includes("mlbb")) {
      return {
        field1Label: "User ID",
        field1Placeholder: "Contoh: 12345678",
        field1Help: "Buka profil MLBB Anda, User ID tertera di samping avatar.",
        field2Label: "Zone ID",
        field2Placeholder: "Contoh: 2104",
        field2Required: true,
        field2Help: "4-5 digit di dalam kurung di samping User ID.",
        isServerSelect: false,
        servers: [],
      };
    }
    if (slug.includes("genshin") || slug.includes("honkai")) {
      return {
        field1Label: "UID Akun",
        field1Placeholder: "Contoh: 812345678",
        field1Help: "UID tertera di pojok kanan bawah layar game.",
        field2Label: "Server Akun",
        field2Placeholder: "Pilih Server",
        field2Required: true,
        field2Help: "Pilih server tempat karakter Anda dibuat.",
        isServerSelect: true,
        servers: ["Asia", "America", "Europe", "TW/HK/MO"],
      };
    }
    if (slug.includes("valorant")) {
      return {
        field1Label: "Riot ID & Tagline",
        field1Placeholder: "Contoh: Player#ID1",
        field1Help: "Format: Username#Tagline Anda di Riot Games.",
        field2Label: "",
        field2Placeholder: "",
        field2Required: false,
        field2Help: "",
        isServerSelect: false,
        servers: [],
      };
    }
    if (slug.includes("free-fire")) {
      return {
        field1Label: "Player ID",
        field1Placeholder: "Contoh: 1234567890",
        field1Help: "Buka profil Free Fire Anda untuk melihat ID.",
        field2Label: "",
        field2Placeholder: "",
        field2Required: false,
        field2Help: "",
        isServerSelect: false,
        servers: [],
      };
    }
    return {
      field1Label: "User ID / Player ID",
      field1Placeholder: "Masukkan User ID game Anda",
      field1Help: "Pastikan ID akun tujuan sudah benar.",
      field2Label: "Server ID",
      field2Placeholder: "Opsional (jika ada)",
      field2Required: false,
      field2Help: "",
      isServerSelect: false,
      servers: [],
    };
  }, [gameSlug, targetConfig]);

  // Categorized payment methods
  const categorizedPayments = useMemo(() => {
    const ewallet = paymentMethods.filter((m) => {
      const c = (m.code + m.name).toUpperCase();
      return c.includes("QRIS") || c.includes("GOPAY") || c.includes("OVO") || c.includes("DANA") || c.includes("SHOPEEPAY");
    });
    const va = paymentMethods.filter((m) => {
      const c = (m.code + m.name).toUpperCase();
      return c.includes("VA") || c.includes("BCA") || c.includes("BNI") || c.includes("BRI") || c.includes("MANDIRI") || c.includes("PERMATA") || c.includes("BSI");
    });
    const retail = paymentMethods.filter((m) => {
      const c = (m.code + m.name).toUpperCase();
      return c.includes("INDOMARET") || c.includes("ALFAMART") || c.includes("RETAIL");
    });
    return { ewallet, va, retail };
  }, [paymentMethods]);

  const displayedPayments = useMemo(() => {
    if (activePaymentTab === "EWALLET") return categorizedPayments.ewallet;
    if (activePaymentTab === "VA") return categorizedPayments.va;
    if (activePaymentTab === "RETAIL") return categorizedPayments.retail;
    return paymentMethods;
  }, [activePaymentTab, categorizedPayments, paymentMethods]);

  const currentStep = success ? 3 : (selectedPayment && selectedProduct && userId.trim()) ? 2 : userId.trim() ? 1 : 0;
  const canSubmit = isCheckoutSubmitEnabled({ user, userId, selectedProduct, selectedPayment, pending, contact });

  async function loadSnapScript() {
    if (typeof window === "undefined") return;
    if ((window as typeof window & { snap?: { pay: (token: string, options?: Record<string, unknown>) => void } }).snap) return;

    const isProd = process.env.NEXT_PUBLIC_MIDTRANS_PRODUCTION === "true";
    const scriptSrc = isProd ? "https://app.midtrans.com/snap/snap.js" : "https://app.sandbox.midtrans.com/snap/snap.js";

    const script = document.createElement("script");
    script.src = scriptSrc;
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
    if (!user && !contact.trim()) {
      setError("Silakan masukkan Nomor WhatsApp atau Email untuk bukti transaksi.");
      return;
    }
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
          contact: contact.trim() || undefined,
          target: {
            userId: userId.trim(),
            serverId: serverId.trim() || undefined,
          },
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
            router.push(`/transactions/${reference}`);
          },
          onPending: () => {
            router.push(`/transactions/${reference}`);
          },
          onError: () => {
            router.push(`/transactions/${reference}`);
          },
          onClose: () => {
            router.push(`/transactions/${reference}`);
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
        router.push(paymentUrl);
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
        {/* STEP 1: DATA AKUN */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-cyan-400/20 text-xs font-black text-cyan-300">1</span>
              <UserRound size={18} className="text-cyan-300" aria-hidden="true" />
              <h2 className="text-lg font-black text-white sm:text-xl">Masukkan data akun {gameName}</h2>
            </div>
            <span className="text-xs text-slate-400">Langkah 1 dari 4</span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-bold text-slate-200">
                {targetFields.field1Label}
                <input
                  value={userId}
                  onChange={(event) => {
                    setUserId(event.target.value);
                    setError("");
                  }}
                  className="field mt-2"
                  placeholder={targetFields.field1Placeholder}
                  autoComplete="off"
                />
              </label>
              {targetFields.field1Help ? (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400">
                  <HelpCircle size={13} className="text-cyan-300/70 shrink-0" />
                  {targetFields.field1Help}
                </p>
              ) : null}
            </div>

            {targetFields.field2Label ? (
              <div>
                <label className="block text-sm font-bold text-slate-200">
                  {targetFields.field2Label}
                  {targetFields.isServerSelect ? (
                    <select
                      value={serverId}
                      onChange={(event) => setServerId(event.target.value)}
                      className="field mt-2"
                    >
                      <option value="">Pilih Server</option>
                      {targetFields.servers.map((srv) => (
                        <option key={srv} value={srv}>
                          {srv}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={serverId}
                      onChange={(event) => setServerId(event.target.value)}
                      className="field mt-2"
                      placeholder={targetFields.field2Placeholder}
                      autoComplete="off"
                    />
                  )}
                </label>
                {targetFields.field2Help ? (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400">
                    <HelpCircle size={13} className="text-cyan-300/70 shrink-0" />
                    {targetFields.field2Help}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        {/* STEP 2: PILIH NOMINAL */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-cyan-400/20 text-xs font-black text-cyan-300">2</span>
              <Sparkles size={18} className="text-cyan-300" aria-hidden="true" />
              <h2 className="text-lg font-black text-white sm:text-xl">Pilih nominal item</h2>
            </div>
            <span className="text-xs text-slate-400">{products.length} pilihan</span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                    "checkout-choice interactive-lift relative min-h-24 rounded-2xl border p-3.5 text-left transition",
                    selected
                      ? "checkout-choice-active border-cyan-300/60 bg-cyan-300/10 shadow-[0_0_0_1px_rgba(0,217,255,.24)]"
                      : "border-white/10 bg-white/[0.035] hover:border-white/20",
                  )}
                  aria-pressed={selected}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-cyan-400/20 to-blue-700/30 text-xs font-black text-cyan-200">
                        {product.image ? (
                          <Image src={product.image} alt="" fill sizes="40px" className="object-cover" />
                        ) : (
                          <span aria-hidden="true">💎</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="block truncate font-black text-white text-sm">{product.name}</span>
                        <span className="mt-1 block text-xs font-bold text-cyan-300">{product.price}</span>
                      </div>
                    </div>
                    {selected ? <CheckCircle2 size={18} className="text-cyan-300 shrink-0" aria-hidden="true" /> : null}
                  </div>
                </button>
              );
            })}
            {!products.length ? <EmptyPanel title="Produk belum tersedia" description="Produk aktif untuk game ini belum ditambahkan dari dashboard." /> : null}
          </div>
        </div>

        {/* STEP 3: METODE PEMBAYARAN */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-cyan-400/20 text-xs font-black text-cyan-300">3</span>
              <CreditCard size={18} className="text-cyan-300" aria-hidden="true" />
              <h2 className="text-lg font-black text-white sm:text-xl">Pilih metode pembayaran</h2>
            </div>
            <span className="text-xs text-slate-400">{paymentMethods.length} metode</span>
          </div>

          {/* Payment Category Filter Tabs */}
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { id: "ALL", label: "Semua", count: paymentMethods.length },
              { id: "EWALLET", label: "⚡ QRIS & E-Wallet", count: categorizedPayments.ewallet.length },
              { id: "VA", label: "🏦 Virtual Account", count: categorizedPayments.va.length },
              { id: "RETAIL", label: "🏪 Minimarket", count: categorizedPayments.retail.length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActivePaymentTab(tab.id as typeof activePaymentTab)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-bold transition",
                  activePaymentTab === tab.id
                    ? "bg-cyan-300/20 border border-cyan-300/50 text-cyan-200"
                    : "bg-white/5 border border-white/10 text-slate-400 hover:text-white",
                )}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {displayedPayments.map((method) => {
              const selected = selectedPaymentId === method.id;
              const isQris = method.code.toUpperCase().includes("QRIS");
              const isVa = method.code.toUpperCase().includes("VA");
              return (
                <button
                  type="button"
                  key={method.id}
                  onClick={() => {
                    setSelectedPaymentId(method.id);
                    setError("");
                  }}
                  className={cn(
                    "checkout-choice interactive-lift rounded-2xl border p-3.5 text-left transition",
                    selected
                      ? "checkout-choice-active border-cyan-300/60 bg-cyan-300/10 shadow-[0_0_0_1px_rgba(0,217,255,.24)]"
                      : "border-white/10 bg-white/[0.035] hover:border-white/20",
                  )}
                  aria-pressed={selected}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-cyan-200">
                        {isQris ? <QrCode size={20} /> : isVa ? <Wallet size={20} /> : <Store size={20} />}
                      </div>
                      <div>
                        <span className="block font-black text-white text-sm">{method.name}</span>
                        <span className="mt-0.5 block text-xs font-semibold text-slate-400">
                          {selectedProduct?.price ?? "Proses Instan"}
                        </span>
                      </div>
                    </div>
                    {selected ? <CheckCircle2 size={18} className="text-cyan-300 shrink-0" aria-hidden="true" /> : null}
                  </div>
                </button>
              );
            })}
            {!displayedPayments.length ? (
              <div className="sm:col-span-2 lg:col-span-3">
                <EmptyPanel title="Metode tidak ditemukan" description="Tidak ada metode pembayaran pada kategori ini." />
              </div>
            ) : null}
          </div>
        </div>

        {/* STEP 4: KONTAK BUKTI TRANSAKSI & CHECKOUT */}
        <div className="rounded-2xl border border-white/10 bg-[#0d172c]/90 p-5 shadow-xl">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-cyan-400/20 text-xs font-black text-cyan-300">4</span>
              <MessageSquareText size={18} className="text-cyan-300" aria-hidden="true" />
              <h2 className="text-lg font-black text-white sm:text-xl">Nomor WhatsApp / Bukti Pesanan</h2>
            </div>
            {user ? (
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
                Akun Terhubung
              </span>
            ) : (
              <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-0.5 text-xs font-bold text-cyan-300">
                Mode Guest
              </span>
            )}
          </div>

          <div className="mt-4">
            <label className="block text-sm font-bold text-slate-200">
              No. WhatsApp atau Email
              <input
                value={contact}
                onChange={(event) => {
                  setContact(event.target.value);
                  setError("");
                }}
                className="field mt-2"
                placeholder={user ? `Opsional (default: ${user.name})` : "Contoh: 08123456789 atau email@domain.com"}
                autoComplete="tel"
              />
            </label>
            <p className="mt-1.5 text-xs text-slate-400">
              Bukti pembayaran dan nomor referensi transaksi akan dikaitkan ke kontak ini untuk pelacakan mudah.
            </p>
          </div>

          {/* TOTAL & CONFIRMATION BOX */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-slate-400">Total Tagihan</p>
                <p className="mt-1 text-2xl font-black text-cyan-300">{selectedProduct?.price ?? "-"}</p>
                {selectedProduct && selectedPayment ? (
                  <p className="mt-1 text-xs text-slate-400">
                    {selectedProduct.name} via <span className="font-semibold text-white">{selectedPayment.name}</span>
                  </p>
                ) : null}
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
                <LockKeyhole size={22} aria-hidden="true" />
              </div>
            </div>

            {error ? (
              <p role="alert" className="mt-4 rounded-xl border border-rose-300/20 bg-rose-400/10 p-3 text-sm text-rose-100">
                {error}
              </p>
            ) : null}
            {success ? (
              <p role="status" className="checkout-success mt-4 flex items-center gap-2 rounded-xl border border-emerald-300/20 bg-emerald-400/10 p-3 text-sm text-emerald-100">
                <CheckCircle2 size={18} aria-hidden="true" />
                {success}
              </p>
            ) : null}

            <button
              type="button"
              disabled={!canSubmit}
              onClick={checkout}
              className="button mt-5 w-full py-3.5 text-base font-black"
              aria-live="polite"
            >
              {pending ? (
                <LoadingSpinner label="Membuat pesanan..." />
              ) : (
                <span className="flex items-center gap-2">
                  <span>Bayar Sekarang</span>
                  <ChevronRight size={18} />
                </span>
              )}
            </button>

            {!user ? (
              <p className="mt-3 text-center text-xs text-slate-400">
                Punya akun?{" "}
                <Link href={`/login?next=/games/${gameSlug || "adit-pecut"}`} className="font-bold text-cyan-300 hover:underline">
                  Masuk di sini
                </Link>{" "}
                untuk kumpulkan poin & simpan riwayat.
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* STICKY MOBILE BOTTOM BAR */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between border-t border-white/10 bg-[#071122]/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="min-w-0 pr-3">
          <p className="text-xs text-slate-400 truncate">{selectedProduct?.name ?? "Pilih nominal"}</p>
          <p className="text-lg font-black text-cyan-300">{selectedProduct?.price ?? "-"}</p>
        </div>
        <button
          type="button"
          disabled={!canSubmit}
          onClick={checkout}
          className="button px-5 py-2.5 text-sm font-black whitespace-nowrap shrink-0"
        >
          {pending ? <LoadingSpinner label="..." /> : "Beli Sekarang"}
        </button>
      </div>
    </section>
  );
}
