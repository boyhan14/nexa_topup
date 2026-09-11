import { ArrowLeft, CalendarClock, CreditCard, Gamepad2, MessageSquare, ReceiptText, ShieldCheck, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import SiteFooter from "@/components/site/site-footer";
import SiteNav from "@/components/site/site-nav";
import PageTransition from "@/components/site/page-transition";
import { cn, EmptyPanel, PageContainer, PremiumPanel, Shell } from "@/components/ui/primitives";
import { getCurrentUser } from "@/lib/auth";
import { formatRupiah } from "@/lib/money";
import { getPublicTransaction } from "@/lib/public-catalog";
import TransactionLiveCard, { StatusPill } from "./transaction-live-card";

function readTarget(data: unknown) {
  if (!data || typeof data !== "object") return { userId: "-", serverId: "-", contact: "-" };
  const value = data as { userId?: unknown; serverId?: unknown; contact?: unknown };
  return {
    userId: typeof value.userId === "string" ? value.userId : "-",
    serverId: typeof value.serverId === "string" && value.serverId ? value.serverId : "-",
    contact: typeof value.contact === "string" && value.contact ? value.contact : "-",
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
            <Link href="/transaction/check" className="inline-flex items-center gap-2 text-sm font-black text-cyan-200 transition hover:text-cyan-100 print:hidden">
              <ArrowLeft size={16} aria-hidden="true" />
              Cek transaksi
            </Link>

            {!order ? (
              <div className="mt-8 max-w-2xl">
                <EmptyPanel title="Transaksi tidak ditemukan" description="Periksa kembali nomor pesanan. Pastikan reference diawali NXT dan tidak ada spasi tambahan." />
              </div>
            ) : (
              <div className="mt-6 grid gap-8">
                {/* INTERACTIVE LIVE STATUS & QUICK ACTIONS */}
                <TransactionLiveCard
                  reference={order.reference}
                  initialStatus={order.status}
                  initialPaymentStatus={order.paymentStatus}
                  initialFulfillmentStatus={order.fulfillmentStatus}
                  gameName={item?.product.game.name ?? "Game"}
                  productName={item?.productName ?? "Produk"}
                  totalFormatted={formatRupiah(order.total)}
                />

                <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
                  <PremiumPanel>
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <h2 className="text-xl font-black text-white">Rincian Transaksi</h2>
                      <p className="flex items-center gap-1.5 text-xs text-slate-400">
                        <CalendarClock size={14} />
                        {order.createdAt.toLocaleString("id-ID")}
                      </p>
                    </div>

                    <dl className="mt-5 grid gap-4 text-sm">
                      <DetailRow icon={Gamepad2} label="Game" value={item?.product.game.name ?? "-"} />
                      <DetailRow icon={ReceiptText} label="Item / Nominal" value={item?.productName ?? "-"} />
                      <DetailRow icon={UserRound} label="User ID Akun" value={target.userId} />
                      {target.serverId !== "-" ? <DetailRow icon={UserRound} label="Zone / Server" value={target.serverId} /> : null}
                      {target.contact !== "-" ? <DetailRow icon={MessageSquare} label="Kontak WhatsApp" value={target.contact} /> : null}
                      <DetailRow icon={CreditCard} label="Metode Pembayaran" value={order.payment?.paymentMethod.name ?? "-"} />
                      <DetailRow icon={ShieldCheck} label="Total Bayar" value={formatRupiah(order.total)} highlight />
                    </dl>

                    {order.failureReason ? (
                      <p role="alert" className="mt-5 rounded-2xl border border-rose-300/20 bg-rose-400/10 p-4 text-sm text-rose-100">
                        Alasan Gagal: {order.failureReason}
                      </p>
                    ) : null}
                  </PremiumPanel>

                  <PremiumPanel as="aside">
                    <h2 className="text-xl font-black text-white">Riwayat Progres</h2>
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
              </div>
            )}
          </PageContainer>
        </main>
      </PageTransition>
      <SiteFooter />
    </Shell>
  );
}

function DetailRow({ icon: Icon, label, value, highlight = false }: { icon: LucideIcon; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="grid gap-3 border-b border-white/10 pb-4 last:border-b-0 last:pb-0 sm:grid-cols-[12rem_1fr]">
      <dt className="flex items-center gap-2 text-slate-400">
        <Icon size={16} aria-hidden="true" />
        {label}
      </dt>
      <dd className={cn("break-words font-bold", highlight ? "text-cyan-200 text-base" : "text-white")}>{value}</dd>
    </div>
  );
}
