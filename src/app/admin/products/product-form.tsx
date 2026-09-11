"use client";

import Image from "next/image";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useFormStatus } from "react-dom";

const acceptedTypes = ["image/jpeg", "image/png", "image/webp"];
const maxImageSize = 5 * 1024 * 1024;

type ProductValue = {
  id: string;
  gameId: string;
  name: string;
  sku: string;
  providerPrice: { toString(): string };
  sellingPrice: { toString(): string };
  isActive: boolean;
  image: string | null;
};

function SaveButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return <button className="button md:col-span-2" disabled={pending}>{pending ? "Menyimpan produk..." : editing ? "Simpan perubahan" : "Simpan produk"}</button>;
}

export function ProductForm({ games, action, product }: { games: { id: string; name: string }[]; action: (formData: FormData) => Promise<void>; product?: ProductValue }) {
  const [preview, setPreview] = useState(product?.image ?? "");
  const [removeImage, setRemoveImage] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => () => { if (preview.startsWith("blob:")) URL.revokeObjectURL(preview); }, [preview]);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!acceptedTypes.includes(file.type)) { setError("Gunakan gambar JPG, JPEG, PNG, atau WebP."); event.target.value = ""; return; }
    if (file.size > maxImageSize) { setError("Ukuran gambar maksimal 5 MB."); event.target.value = ""; return; }
    setError("");
    setRemoveImage(false);
    setPreview(URL.createObjectURL(file));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (error) event.preventDefault();
  }

  return <form action={action} onSubmit={handleSubmit} className="mt-4 grid gap-3 md:grid-cols-2">
    {product ? <input name="id" type="hidden" value={product.id} /> : null}
    <select name="gameId" defaultValue={product?.gameId} className="field" required><option value="">Pilih game</option>{games.map((game) => <option key={game.id} value={game.id}>{game.name}</option>)}</select>
    <input name="name" defaultValue={product?.name} className="field" placeholder="Nama produk" required />
    <input name="sku" defaultValue={product?.sku} className="field" placeholder="SKU internal" required />
    <input name="providerPrice" inputMode="decimal" defaultValue={product?.providerPrice.toString()} className="field" placeholder="Harga provider" required />
    <input name="sellingPrice" inputMode="decimal" defaultValue={product?.sellingPrice.toString()} className="field" placeholder="Harga jual" required />
    <label className="flex items-center gap-2"><input name="isActive" type="checkbox" defaultChecked={product?.isActive ?? true} /> Aktif</label>

    <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.025] p-4 md:col-span-2">
      <div className="grid gap-4 sm:grid-cols-[13rem_1fr] sm:items-center">
        <div className="relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-[#071122]">
          {preview && !removeImage ? <Image src={preview} alt="Pratinjau gambar produk" fill unoptimized className="object-cover" /> : <div className="grid h-full place-items-center px-4 text-center text-xs font-bold text-slate-500">Belum ada gambar</div>}
        </div>
        <div className="grid gap-2 text-sm font-bold text-slate-200">
          <span>Gambar Produk</span>
          <label className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-center text-sm text-cyan-100 transition hover:border-cyan-300/40 hover:bg-cyan-300/10">
            <span>Upload gambar produk</span>
            <input name="image" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="sr-only" />
          </label>
          {product?.image ? <label className="flex items-center gap-2 text-xs font-semibold text-slate-400"><input name="removeImage" type="checkbox" checked={removeImage} onChange={(event) => setRemoveImage(event.target.checked)} /> Hapus gambar saat ini</label> : null}
          <span className="text-xs font-medium text-slate-500">JPG, JPEG, PNG, atau WebP. Maksimal 5 MB.</span>
        </div>
      </div>
    </div>

    {error ? <p role="alert" className="rounded-2xl border border-rose-300/25 bg-rose-400/10 p-3 text-sm text-rose-100 md:col-span-2">{error}</p> : null}
    <SaveButton editing={Boolean(product)} />
  </form>;
}
