CREATE TABLE "PromotionalBanner" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT NOT NULL,
    "targetPath" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromotionalBanner_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PromotionalBanner_isActive_sortOrder_idx" ON "PromotionalBanner"("isActive", "sortOrder");
CREATE INDEX "PromotionalBanner_startAt_idx" ON "PromotionalBanner"("startAt");
CREATE INDEX "PromotionalBanner_endAt_idx" ON "PromotionalBanner"("endAt");
