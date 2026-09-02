import { ArrowLeft, CalendarClock, CreditCard, Gamepad2, ReceiptText, ShieldCheck, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import SiteFooter from "@/components/site/site-footer";
import SiteNav from "@/components/site/site-nav";
import PageTransition from "@/components/site/page-transition";
import { cn, EmptyPanel, PageContainer, PremiumPanel, Shell } from "@/components/ui/primitives";
import { getCurrentUser } from "@/lib/auth";
import { formatRupiah } from "@/lib/money";
import { getPublicTransaction } from "@/lib/public-catalog";

const statusTone: Record<string, string> = {
  SUCCESS: "border-emerald-300/25 bg-emerald-400/10 text-emerald-100",
  PAID: "border-emerald-300/25 bg-emerald-400/10 text-emerald-100",
  PROCESSING: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
  PENDING_PAYMENT: "border-amber-300/25 bg-amber-300/10 text-amber-100",
  PENDING: "border-amber-300/25 bg-amber-300/10 text-amber-100",
  FAILED: "border-rose-300/25 bg-rose-400/10 text-rose-100",
  EXPIRED: "border-rose-300/25 bg-rose-400/10 text-rose-100",
  CANCELLED: "border-slate-300/15 bg-white/5 text-slate-300",
  REFUNDED: "border-blue-300/25 bg-blue-400/10 text-blue-100",
};

function StatusPill({ value }: { value: string }) {
  return <span className={cn("inline-flex rounded-full border px-3 py-1 text-xs font-black", statusTone[value] ?? "border-white/10 bg-white/5 text-slate-300")}>{value.replaceAll("_", " ")}</span>;
}

function readTarget(data: unknown) {
  if (!data || typeof data !== "object") return { userId: "-", serverId: "-" };
  const value = data as { userId?: unknown; serverId?: unknown };
  return {
    userId: typeof value.userId === "string" ? value.userId : "-",
    serverId: typeof value.serverId === "string" && value.serverId ? value.serverId : "-",
  };
}

export default async function TransactionDetail({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const normalizedReference = decodeURIComponent(reference).trim().toUpperCase();
  const [order, user] = await Promise.all([getPublicTransaction(normalizedReference), getCurrentUser()]);
  const item = order?.items[0];
  const target = readTarget(order?.targetData);

  return (
    <Shell>
      <SiteNav user={user ? { name: user.name } : null} />
      <PageTransition>
        <main className="ambient-grid pt-28">
          <PageContainer className="pb-16 sm:pb-20">
            <Link href="/transaction/check" className="inline-flex items-center gap-2 text-sm font-black text-cyan-200 transition hover:text-cyan-100">
              <ArrowLeft size={16} aria-hidden="true" />
              Cek transaksi
            </Link>

            {!order ? (
              <div className="mt-8 max-w-2xl">
                <EmptyPanel title="Transaksi tidak ditemukan" description="Periksa kembali nomor pesanan. Pastikan reference diawali NXT dan tidak ada spasi tambahan." />
              </div>
            ) : (
              <>
                <section className="reveal mt-6 rounded-[2rem] border border-white/10 bg-[#071122]/86 p-5 shadow-2xl shadow-black/20 sm:p-7">
                  <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
                    <div>
                      <p className="section-eyebrow">Transaction status</p>
                      <h1 className="mt-3 text-balance text-4xl font-black text-white sm:text-5xl">{order.reference}</h1>
                      <p className="mt-4 flex items-center gap-2 text-sm text-slate-400">
                        <CalendarClock size={16} aria-hidden="true" />
                        Dibuat {order.createdAt.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[28rem]">
                      <StatusBox label="Order" value={order.status} />
                      <StatusBox label="Pembayaran" value={order.paymentStatus} />
                      <StatusBox label="Top up" value={order.fulfillmentStatus} />
                    </div>
                  </div>
                </section>

                <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_24rem]">
                  <PremiumPanel>
                    <h2 className="text-xl font-black text-white">Detail transaksi</h2>
                    <dl className="mt-5 grid gap-4 text-sm">
                      <DetailRow icon={Gamepad2} label="Game" value={item?.product.game.name ?? "-"} />
                      <DetailRow icon={ReceiptText} label="Produk" value={item?.productName ?? "-"} />
                      <DetailRow icon={UserRound} label="User ID" value={target.userId} />
                      <DetailRow icon={UserRound} label="Server ID" value={target.serverId} />
                      <DetailRow icon={CreditCard} label="Metode pembayaran" value={order.payment?.paymentMethod.name ?? "-"} />
                      <DetailRow icon={ShieldCheck} label="Total" value={formatRupiah(order.total)} highlight />
                    </dl>
                    {order.failureReason ? (
                      <p role="alert" className="mt-5 rounded-2xl border border-rose-300/20 bg-rose-400/10 p-4 text-sm text-rose-100">{order.failureReason}</p>
                    ) : null}
                  </PremiumPanel>

                  <PremiumPanel as="aside">
                    <h2 className="text-xl font-black text-white">Timeline</h2>
                    <div className="mt-5 grid gap-4">
                      {order.logs.map((log) => (
                        <div key={log.id} className="border-l-2 border-cyan-300/60 pl-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusPill value={log.status} />
                            <span className="text-xs text-slate-500">{log.createdAt.toLocaleString("id-ID")}</span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-400">{log.note ?? "Status diperbarui."}</p>
                        </div>
                      ))}
                      {!order.logs.length ? <p className="text-sm text-slate-400">Belum ada riwayat status.</p> : null}
                    </div>
                  </PremiumPanel>
                </div>
              </>
            )}
          </PageContainer>
        </main>
      </PageTransition>
      <SiteFooter />
    </Shell>
  );
}

function StatusBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <div className="mt-3">
        <StatusPill value={value} />
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value, highlight = false }: { icon: LucideIcon; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="grid gap-3 border-b border-white/10 pb-4 last:border-b-0 last:pb-0 sm:grid-cols-[12rem_1fr]">
      <dt className="flex items-center gap-2 text-slate-400">
        <Icon size={16} aria-hidden="true" />
        {label}
      </dt>
      <dd className={cn("break-words font-bold", highlight ? "text-cyan-200" : "text-white")}>{value}</dd>
    </div>
  );
}
