ALTER TABLE "Game" ADD COLUMN "targetConfig" JSONB NOT NULL DEFAULT '{}';

ALTER TABLE "Order" ADD COLUMN "providerReference" TEXT;
ALTER TABLE "Order" ADD COLUMN "failureReason" TEXT;
