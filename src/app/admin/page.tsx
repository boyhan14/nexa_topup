import { Activity, BadgeDollarSign, Boxes, Clock3, Gamepad2, Package, ReceiptText, TrendingUp, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { requireAdminArea } from "@/lib/admin";
import { formatRupiah } from "@/lib/money";
import { prisma } from "@/lib/prisma";

const statusTone: Record<string, string> = {
  SUCCESS: "border-emerald-300/25 bg-emerald-400/10 text-emerald-100",
  PAID: "border-emerald-300/25 bg-emerald-400/10 text-emerald-100",
  PROCESSING: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
  PENDING_PAYMENT: "border-amber-300/25 bg-amber-300/10 text-amber-100",
  PENDING: "border-amber-300/25 bg-amber-300/10 text-amber-100",
  FAILED: "border-rose-300/25 bg-rose-400/10 text-rose-100",
};

export default async function AdminDashboard() {
  await requireAdminArea("dashboard");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);

  const [users, games, activeGames, products, orders, todayOrders, success, pending, failed, revenue, todayRevenue, recent, topProducts, paymentSummary, weekOrders] = await Promise.all([
    prisma.user.count(),
    prisma.game.count(),
    prisma.game.count({ where: { isActive: true } }),
    prisma.gameProduct.count(),
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.order.count({ where: { status: "SUCCESS" } }),
    prisma.order.count({ where: { status: { in: ["PENDING_PAYMENT", "PAID", "PROCESSING"] } } }),
    prisma.order.count({ where: { status: "FAILED" } }),
    prisma.order.aggregate({ where: { status: "SUCCESS" }, _sum: { total: true } }),
    prisma.order.aggregate({ where: { status: "SUCCESS", createdAt: { gte: today } }, _sum: { total: true } }),
    prisma.order.findMany({ take: 8, orderBy: { createdAt: "desc" }, select: { id: true, reference: true, status: true, total: true, user: { select: { email: true } } } }),
    prisma.orderItem.groupBy({ by: ["productName"], _sum: { quantity: true }, orderBy: { _sum: { quantity: "desc" } }, take: 5 }),
    prisma.payment.groupBy({ by: ["status"], _count: { _all: true }, _sum: { amount: true } }),
    prisma.order.findMany({ where: { createdAt: { gte: sevenDaysAgo } }, select: { createdAt: true, total: true, status: true } }),
  ]);

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(sevenDaysAgo);
    date.setDate(date.getDate() + index);
    const entries = weekOrders.filter((order) => order.createdAt.toDateString() === date.toDateString() && order.status === "SUCCESS");
    return {
      label: date.toLocaleDateString("id-ID", { weekday: "short" }),
      total: entries.reduce((sum, order) => sum + Number(order.total), 0),
      count: entries.length,
    };
  });
  const max = Math.max(...days.map((day) => day.total), 1);
  const cards = [
    { label: "Total pengguna", value: users, icon: Users },
    { label: "Total game", value: games, icon: Gamepad2 },
    { label: "Game aktif", value: activeGames, icon: Boxes },
    { label: "Total produk", value: products, icon: Package },
    { label: "Total order", value: orders, icon: ReceiptText },
    { label: "Order hari ini", value: todayOrders, icon: Clock3 },
    { label: "Order sukses", value: success, icon: TrendingUp },
    { label: "Order pending", value: pending, icon: Activity },
    { label: "Order gagal", value: failed, icon: BadgeDollarSign },
  ];

  return (
    <div className="reveal">
      <section className="rounded-[2rem] border border-white/10 bg-[#071122]/86 p-5 shadow-2xl shadow-black/20 sm:p-7">
        <p className="section-eyebrow">Overview</p>
        <div className="mt-3 grid gap-5 xl:grid-cols-[1fr_auto] xl:items-end">
          <div>
            <h1 className="text-3xl font-black text-white sm:text-4xl">Dashboard operasional</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Pantau katalog, transaksi, pembayaran, dan omzet sukses dari PostgreSQL dalam satu layar yang mudah dipindai.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <RevenueCard label="Total omzet sukses" value={formatRupiah(revenue._sum.total)} />
            <RevenueCard label="Omzet hari ini" value={formatRupiah(todayRevenue._sum.total)} />
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card, index) => (
          <Metric key={card.label} label={card.label} value={card.value.toLocaleString("id-ID")} icon={card.icon} delay={index} />
        ))}
      </section>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.45fr_1fr]">
        <section className="rounded-2xl border border-white/10 bg-[#0d172c]/88 p-5 shadow-xl shadow-black/10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="section-eyebrow">Revenue</p>
              <h2 className="mt-2 text-xl font-black text-white">Omzet 7 hari terakhir</h2>
            </div>
            <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-black text-cyan-100">SUCCESS only</span>
          </div>
          <div className="mt-6 flex h-56 items-end gap-3">
            {days.map((day) => (
              <div key={day.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <span className="w-full truncate text-center text-xs text-slate-500">{formatRupiah(day.total)}</span>
                <div className="w-full rounded-t-2xl bg-gradient-to-t from-blue-600 to-cyan-300 shadow-lg shadow-cyan-950/20 transition hover:brightness-110" style={{ height: `${Math.max((day.total / max) * 160, 6)}px` }} title={`${day.count} order`} />
                <span className="text-xs font-bold text-slate-400">{day.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#0d172c]/88 p-5 shadow-xl shadow-black/10">
          <p className="section-eyebrow">Payment</p>
          <h2 className="mt-2 text-xl font-black text-white">Ringkasan pembayaran</h2>
          <div className="mt-5 grid gap-3">
            {paymentSummary.length === 0 ? (
              <Empty text="Belum ada transaksi pembayaran." />
            ) : (
              paymentSummary.map((item) => (
                <div key={item.status} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <StatusPill value={item.status} />
                    <span className="text-sm font-black text-white">{item._count._all}</span>
                  </div>
                  <p className="mt-3 text-sm font-bold text-cyan-200">{formatRupiah(item._sum.amount)}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-[#0d172c]/88 p-5 shadow-xl shadow-black/10">
          <p className="section-eyebrow">Orders</p>
          <h2 className="mt-2 text-xl font-black text-white">Transaksi terbaru</h2>
          <div className="mt-5 grid gap-3">
            {recent.length === 0 ? (
              <Empty text="Belum ada pesanan." />
            ) : (
              recent.map((order) => (
                <div key={order.id} className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div className="min-w-0">
                    <p className="truncate font-black text-white">{order.reference}</p>
                    <p className="mt-1 truncate text-sm text-slate-400">{order.user?.email ?? "Guest"}</p>
                  </div>
                  <div className="sm:text-right">
                    <StatusPill value={order.status} />
                    <p className="mt-2 text-sm font-bold text-cyan-200">{formatRupiah(order.total)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#0d172c]/88 p-5 shadow-xl shadow-black/10">
          <p className="section-eyebrow">Catalog</p>
          <h2 className="mt-2 text-xl font-black text-white">Produk terlaris</h2>
          <div className="mt-5 grid gap-3">
            {topProducts.length === 0 ? (
              <Empty text="Belum ada item pesanan." />
            ) : (
              topProducts.map((product, index) => (
                <div key={product.productName} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                  <div className="min-w-0">
                    <p className="truncate font-black text-white">{product.productName}</p>
                    <p className="mt-1 text-xs font-bold text-slate-500">Rank {index + 1}</p>
                  </div>
                  <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-sm font-black text-cyan-100">{product._sum.quantity ?? 0} terjual</span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function RevenueCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
      <p className="text-xs font-bold text-cyan-100/80">{label}</p>
      <p className="mt-2 text-xl font-black text-cyan-100">{value}</p>
    </article>
  );
}

function Metric({ label, value, icon: Icon, delay }: { label: string; value: string; icon: LucideIcon; delay: number }) {
  return (
    <article className="reveal rounded-2xl border border-white/10 bg-[#0d172c]/88 p-5 shadow-xl shadow-black/10" style={{ animationDelay: `${Math.min(delay, 8) * 45}ms` }}>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-bold text-slate-400">{label}</p>
        <span className="grid h-10 w-10 place-items-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
          <Icon size={19} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 text-3xl font-black text-white">{value}</p>
    </article>
  );
}

function StatusPill({ value }: { value: string }) {
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${statusTone[value] ?? "border-white/10 bg-white/5 text-slate-300"}`}>{value.replaceAll("_", " ")}</span>;
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-5 text-sm text-slate-400">{text}</p>;
}
