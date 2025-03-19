-- Add status column to Dataset
ALTER TABLE "Dataset" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'PENDING';
