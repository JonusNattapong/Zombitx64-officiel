-- AlterTable
ALTER TABLE "Product" ADD COLUMN "extendedMetrics" JSONB;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN "currency" TEXT;
ALTER TABLE "Transaction" ADD COLUMN "subscriptionId" TEXT;
ALTER TABLE "Transaction" ADD COLUMN "walletAddress" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "recoveryCodes" JSONB;
ALTER TABLE "User" ADD COLUMN "twoFactorSecret" TEXT;
