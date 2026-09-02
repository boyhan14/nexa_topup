import { WalletTransactionType } from "@prisma/client";
import { notFound } from "next/navigation";
import { ConfirmButton } from "../../admin-ui";
import { requireAdminArea } from "@/lib/admin";
import { formatRupiah } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { adjustWallet } from "../actions";

export default async function WalletDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminArea("wallets"); const { id } = await params;
  const wallet = await prisma.wallet.findUnique({ where: { id }, include: { user: { select: { name: true, email: true } }, transactions: { orderBy: { createdAt: "desc" } } } });
  if (!wallet) notFound();
  return <div><h1 className="text-3xl font-black">Wallet {wallet.user.name}</h1><p className="mt-2 text-slate-400">{wallet.user.email} · Saldo: <b className="text-cyan-300">{formatRupiah(wallet.balance)}</b></p><div className="mt-6 grid gap-5 xl:grid-cols-2"><section className="rounded-2xl border border-white/10 bg-[#101a31] p-5"><h2 className="font-black">Penyesuaian manual</h2><p className="mt-2 text-sm text-slate-400">Setiap perubahan membuat catatan ledger baru; saldo tidak pernah diubah tanpa transaksi.</p><form action={adjustWallet} className="mt-4 space-y-3"><input name="walletId" type="hidden" value={wallet.id}/><select name="type" className="field">{[WalletTransactionType.DEPOSIT, WalletTransactionType.REFUND, WalletTransactionType.ADJUSTMENT, WalletTransactionType.BONUS].map(type => <option key={type}>{type}</option>)}</select><input name="amount" className="field" inputMode="decimal" placeholder="Nominal; gunakan minus untuk pengurangan" required/><textarea name="reason" className="field" placeholder="Alasan wajib" required/><ConfirmButton message="Catat penyesuaian wallet ini? Nominal dan alasan akan tersimpan di ledger." className="button">Konfirmasi & catat penyesuaian</ConfirmButton></form></section><section className="rounded-2xl border border-white/10 bg-[#101a31] p-5"><h2 className="font-black">Riwayat transaksi</h2><div className="mt-4 space-y-3">{wallet.transactions.map(transaction => <div key={transaction.id} className="flex justify-between border-b border-white/5 pb-3 text-sm"><div><p className="font-bold">{transaction.type}</p><p className="text-slate-400">{transaction.reference} · {transaction.createdAt.toLocaleString("id-ID")}</p></div><b className={transaction.amount.isNegative() ? "text-rose-300" : "text-emerald-300"}>{formatRupiah(transaction.amount)}</b></div>)}{!wallet.transactions.length && <p className="text-sm text-slate-400">Belum ada transaksi.</p>}</div></section></div></div>;
}
