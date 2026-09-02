import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { audit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth";
import { hasAdminPermission } from "@/lib/admin";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const imageTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

function hasValidSignature(buffer: Buffer, mimeType: keyof typeof imageTypes) {
  if (mimeType === "image/jpeg") return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mimeType === "image/png") return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  return buffer.length >= 12 && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, message: "Autentikasi diperlukan." }, { status: 401 });
  if (!hasAdminPermission(user.role, "catalog")) return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });

  const formData = await request.formData();
  const image = formData.get("image");
  if (!(image instanceof File)) return NextResponse.json({ success: false, message: "Pilih file gambar terlebih dahulu." }, { status: 400 });
  if (!(image.type in imageTypes)) return NextResponse.json({ success: false, message: "Gunakan gambar JPG, PNG, atau WebP." }, { status: 400 });
  if (image.size <= 0 || image.size > MAX_IMAGE_SIZE) return NextResponse.json({ success: false, message: "Ukuran gambar maksimal 5 MB." }, { status: 400 });

  const mimeType = image.type as keyof typeof imageTypes;
  const buffer = Buffer.from(await image.arrayBuffer());
  if (!hasValidSignature(buffer, mimeType)) return NextResponse.json({ success: false, message: "Isi file gambar tidak valid." }, { status: 400 });

  const extension = imageTypes[mimeType];
  const filename = `${randomUUID()}.${extension}`;
  const directory = path.join(process.cwd(), "public", "uploads", "banners");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), buffer, { flag: "wx" });

  await audit(user.id, "UPLOAD", "PromotionalBannerImage", filename, { mimeType, size: image.size });
  return NextResponse.json({ success: true, data: { imageUrl: `/uploads/banners/${filename}` } });
}
