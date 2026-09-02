"use client";

import { ImagePlus, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState, type ChangeEvent, type FormEvent } from "react";

type BannerValue = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  targetPath: string;
  isActive: boolean;
  sortOrder: number;
  startAt: string | null;
  endAt: string | null;
};

type UploadResponse = { success?: boolean; message?: string; data?: { imageUrl?: string } };

function toInputDate(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function BannerForm({ action, banner }: { action: (formData: FormData) => void | Promise<void>; banner?: BannerValue }) {
  const [imageUrl, setImageUrl] = useState(banner?.imageUrl ?? "");
  const [previewUrl, setPreviewUrl] = useState(banner?.imageUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function uploadImage(file: File) {
    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.set("image", file);

    try {
      const response = await fetch("/api/admin/banners/upload", { method: "POST", body: formData });
      const body = (await response.json().catch(() => null)) as UploadResponse | null;
      if (!response.ok || !body?.success || !body.data?.imageUrl) throw new Error(body?.message ?? "Gagal mengunggah gambar.");
      setImageUrl(body.data.imageUrl);
      setPreviewUrl(body.data.imageUrl);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Gagal mengunggah gambar.");
    } finally {
      setUploading(false);
    }
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    void uploadImage(file);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!imageUrl || uploading) {
      event.preventDefault();
      setError(uploading ? "Tunggu unggahan gambar selesai." : "Unggah gambar banner terlebih dahulu.");
    }
  }

  return (
    <form action={action} onSubmit={handleSubmit} className="mt-5 grid gap-4 md:grid-cols-2">
      {banner ? <input type="hidden" name="id" value={banner.id} /> : null}
      <input type="hidden" name="imageUrl" value={imageUrl} />

      <label className="grid gap-2 text-sm font-bold text-slate-200">
        Judul
        <input name="title" defaultValue={banner?.title} className="field" minLength={2} maxLength={120} required />
      </label>
      <label className="grid gap-2 text-sm font-bold text-slate-200">
        Target path
        <input name="targetPath" defaultValue={banner?.targetPath ?? "/games"} className="field" placeholder="/games" pattern="/(?!/).*" required />
      </label>
      <label className="grid gap-2 text-sm font-bold text-slate-200 md:col-span-2">
        Deskripsi
        <textarea name="description" defaultValue={banner?.description ?? ""} className="field min-h-24 resize-y" maxLength={360} />
      </label>

      <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.025] p-4 md:col-span-2">
        <div className="grid gap-4 sm:grid-cols-[13rem_1fr] sm:items-center">
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-white/10 bg-[#071122]">
            {previewUrl ? <Image src={previewUrl} alt="Pratinjau banner" fill sizes="208px" className="object-cover" /> : <div className="grid h-full place-items-center text-xs font-bold text-slate-500">Belum ada gambar</div>}
          </div>
          <label className="grid gap-2 text-sm font-bold text-slate-200">
            Gambar banner
            <span className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-center text-sm text-cyan-100 transition hover:border-cyan-300/40 hover:bg-cyan-300/10">
              {uploading ? <Loader2 size={17} className="animate-spin" aria-hidden="true" /> : <ImagePlus size={17} aria-hidden="true" />}
              {uploading ? "Mengunggah gambar" : "Pilih gambar JPG, PNG, atau WebP"}
            </span>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="sr-only" />
            <span className="text-xs font-medium text-slate-500">Maksimal 5 MB. Pilihan gambar akan langsung diunggah dan dipratinjau.</span>
          </label>
        </div>
      </div>

      <label className="grid gap-2 text-sm font-bold text-slate-200">
        Urutan tampil
        <input name="sortOrder" type="number" min="0" max="9999" defaultValue={banner?.sortOrder ?? 0} className="field" required />
      </label>
      <label className="flex items-center gap-3 self-end rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-sm font-bold text-slate-200">
        <input name="isActive" type="checkbox" defaultChecked={banner?.isActive ?? true} className="h-4 w-4 accent-cyan-300" />
        Aktifkan banner
      </label>
      <label className="grid gap-2 text-sm font-bold text-slate-200">
        Mulai tampil
        <input name="startAt" type="datetime-local" defaultValue={toInputDate(banner?.startAt ?? null)} className="field" />
      </label>
      <label className="grid gap-2 text-sm font-bold text-slate-200">
        Selesai tampil
        <input name="endAt" type="datetime-local" defaultValue={toInputDate(banner?.endAt ?? null)} className="field" />
      </label>

      {error ? <p role="alert" className="rounded-2xl border border-rose-300/25 bg-rose-400/10 p-3 text-sm text-rose-100 md:col-span-2">{error}</p> : null}
      <button className="button md:col-span-2" disabled={uploading}>{banner ? "Simpan perubahan" : "Buat banner"}</button>
    </form>
  );
}
