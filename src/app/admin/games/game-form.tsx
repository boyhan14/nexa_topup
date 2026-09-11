"use client";

import Image from "next/image";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useFormStatus } from "react-dom";

const acceptedTypes = ["image/jpeg", "image/png", "image/webp"];
const maxImageSize = 5 * 1024 * 1024;

type GameValue = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  description: string;
  bannerUrl: string | null;
  iconUrl: string | null;
  isActive: boolean;
  isFeatured: boolean;
};

function SaveButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return <button className="button md:col-span-2" disabled={pending}>{pending ? "Menyimpan game..." : editing ? "Simpan perubahan" : "Simpan game"}</button>;
}

export function GameForm({ categories, action, game }: { categories: { id: string; name: string }[]; action: (formData: FormData) => Promise<void>; game?: GameValue }) {
  const [preview, setPreview] = useState(game?.bannerUrl ?? "");
  const [removeBanner, setRemoveBanner] = useState(false);
  const [error, setError] = useState("");
  const [slug, setSlug] = useState(game?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(game));

  function toSlug(value: string) {
    return value.toLowerCase().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-{2,}/g, "-").replace(/^-|-$/g, "");
  }

  function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
    if (!slugTouched) {
      setSlug(toSlug(event.target.value));
    }
  }

  function handleSlugChange(event: ChangeEvent<HTMLInputElement>) {
    setSlugTouched(true);
    setSlug(toSlug(event.target.value));
  }

  useEffect(() => () => { if (preview.startsWith("blob:")) URL.revokeObjectURL(preview); }, [preview]);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!acceptedTypes.includes(file.type)) { setError("Gunakan gambar JPG, JPEG, PNG, atau WebP."); event.target.value = ""; return; }
    if (file.size > maxImageSize) { setError("Ukuran gambar maksimal 5 MB."); event.target.value = ""; return; }
    setError("");
    setRemoveBanner(false);
    setPreview(URL.createObjectURL(file));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (error) event.preventDefault();
  }

  return <form action={action} onSubmit={handleSubmit} className="mt-4 grid gap-3 md:grid-cols-2">
    {game ? <input type="hidden" name="id" value={game.id} /> : null}
    <input className="field" name="name" defaultValue={game?.name} placeholder="Nama" required onChange={handleNameChange} />
    <div>
      <input className="field" name="slug" value={slug} onChange={handleSlugChange} placeholder="slug-game" required />
      <p className="mt-1 text-xs text-slate-400">Hanya huruf kecil, angka, dan strip (-). Otomatis terisi dari nama.</p>
    </div>
    <select className="field" name="categoryId" defaultValue={game?.categoryId} required><option value="">Pilih kategori</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
    <input className="field" name="iconUrl" defaultValue={game?.iconUrl ?? ""} placeholder="URL ikon (opsional)" />
    <textarea className="field md:col-span-2" name="description" defaultValue={game?.description} placeholder="Deskripsi" required />
    <input type="hidden" name="bannerUrl" value={game?.bannerUrl ?? ""} />

    <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.025] p-4 md:col-span-2">
      <div className="grid gap-4 sm:grid-cols-[18rem_1fr] sm:items-center">
        <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-[#071122]">
          {preview && !removeBanner ? <Image src={preview} alt="Pratinjau banner game" fill unoptimized className="object-cover" /> : <div className="grid h-full place-items-center px-4 text-center text-xs font-bold text-slate-500">Belum ada gambar</div>}
        </div>
        <div className="grid gap-2 text-sm font-bold text-slate-200">
          <span>Gambar hero game</span>
          <label className="flex min-h-12 cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-center text-sm text-cyan-100 transition hover:border-cyan-300/40 hover:bg-cyan-300/10">
            <span>Upload gambar game</span>
            <input name="bannerImage" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="sr-only" />
          </label>
          {game?.bannerUrl ? <label className="flex items-center gap-2 text-xs font-semibold text-slate-400"><input name="removeBanner" type="checkbox" checked={removeBanner} onChange={(event) => setRemoveBanner(event.target.checked)} /> Hapus gambar saat ini</label> : null}
          <span className="text-xs font-medium text-slate-500">JPG, JPEG, PNG, atau WebP. Maksimal 5 MB.</span>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-5"><label><input name="isActive" type="checkbox" defaultChecked={game?.isActive ?? true} /> Aktif</label><label><input name="isFeatured" type="checkbox" defaultChecked={game?.isFeatured ?? false} /> Unggulan</label></div>
    {error ? <p role="alert" className="rounded-2xl border border-rose-300/25 bg-rose-400/10 p-3 text-sm text-rose-100 md:col-span-2">{error}</p> : null}
    <SaveButton editing={Boolean(game)} />
  </form>;
}
