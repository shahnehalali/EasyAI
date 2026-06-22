-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "lastMonthlyReportAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ComplianceSnapshot" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "capturedOn" TIMESTAMP(3) NOT NULL,
    "overall" INTEGER NOT NULL DEFAULT 0,
    "assessments" INTEGER NOT NULL DEFAULT 0,
    "openItems" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplianceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ComplianceSnapshot_organizationId_idx" ON "ComplianceSnapshot"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ComplianceSnapshot_organizationId_capturedOn_key" ON "ComplianceSnapshot"("organizationId", "capturedOn");

-- AddForeignKey
ALTER TABLE "ComplianceSnapshot" ADD CONSTRAINT "ComplianceSnapshot_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
