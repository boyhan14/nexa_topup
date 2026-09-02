import { NextResponse } from "next/server";
import { getPublicBanners } from "@/lib/public-catalog";

export async function GET() {
  try {
    const banners = await getPublicBanners();
    return NextResponse.json({ success: true, data: banners });
  } catch {
    return NextResponse.json({ success: false, message: "Banner promosi tidak dapat dimuat." }, { status: 500 });
  }
}
