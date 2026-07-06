-- AlterTable
ALTER TABLE "Thread" ADD COLUMN     "translations" JSONB;

-- AlterTable
ALTER TABLE "ThreadPost" ADD COLUMN     "translations" JSONB;
