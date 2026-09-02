export type BannerSchedule = {
  isActive: boolean;
  startAt: Date | null;
  endAt: Date | null;
};

export type BannerState = "ACTIVE" | "INACTIVE" | "SCHEDULED" | "EXPIRED";

export function isInternalTargetPath(value: string) {
  const targetPath = value.trim();
  if (!targetPath.startsWith("/") || targetPath.startsWith("//")) return false;

  try {
    const resolved = new URL(targetPath, "https://nexa.local");
    const decoded = decodeURIComponent(targetPath);
    return resolved.origin === "https://nexa.local" && !targetPath.includes("\\") && !decoded.startsWith("//") && !decoded.includes("\\");
  } catch {
    return false;
  }
}

export function getBannerState(banner: BannerSchedule, now = new Date()): BannerState {
  if (!banner.isActive) return "INACTIVE";
  if (banner.startAt && now < banner.startAt) return "SCHEDULED";
  if (banner.endAt && now > banner.endAt) return "EXPIRED";
  return "ACTIVE";
}
