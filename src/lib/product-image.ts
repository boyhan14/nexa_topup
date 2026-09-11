import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

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

export async function saveProductImage(file: File, folder = "products") {
  if (!(file.type in imageTypes)) throw new Error("Gunakan gambar JPG, JPEG, PNG, atau WebP.");
  if (file.size <= 0 || file.size > MAX_IMAGE_SIZE) throw new Error("Ukuran gambar maksimal 5 MB.");

  const mimeType = file.type as keyof typeof imageTypes;
  const buffer = Buffer.from(await file.arrayBuffer());
  if (!hasValidSignature(buffer, mimeType)) throw new Error("Isi file gambar tidak valid.");

  const filename = `${randomUUID()}.${imageTypes[mimeType]}`;
  const directory = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), buffer, { flag: "wx" });
  return `/uploads/${folder}/${filename}`;
}

export async function deleteProductImage(image: string | null | undefined, folder = "products") {
  if (!image || !new RegExp(`^\\/uploads\\/${folder}\\/[a-f0-9-]+\\.(?:jpg|png|webp)$`, "i").test(image)) return;
  await unlink(path.join(process.cwd(), "public", image.slice(1))).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "ENOENT") throw error;
  });
}