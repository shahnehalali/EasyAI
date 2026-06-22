-- AlterTable
ALTER TABLE "ChecklistTemplate" ADD COLUMN     "autoActivate" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Framework" ADD COLUMN     "lastReviewedAt" TIMESTAMP(3),
ADD COLUMN     "sourceNote" TEXT;
