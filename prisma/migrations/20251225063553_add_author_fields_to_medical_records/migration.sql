/*
  Warnings:

  - You are about to drop the column `vitalSigns` on the `medical_records` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "medical_records" DROP COLUMN "vitalSigns",
ADD COLUMN     "authorId" TEXT,
ADD COLUMN     "authorName" TEXT,
ADD COLUMN     "authorRole" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "monitoring_records" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "record_history" (
    "id" TEXT NOT NULL,
    "recordType" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "originalRecordId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "previousData" JSONB,
    "newData" JSONB,
    "changedBy" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "record_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "record_history_recordType_recordId_idx" ON "record_history"("recordType", "recordId");

-- CreateIndex
CREATE INDEX "record_history_originalRecordId_idx" ON "record_history"("originalRecordId");

-- CreateIndex
CREATE INDEX "record_history_changedAt_idx" ON "record_history"("changedAt");

-- CreateIndex
CREATE INDEX "medical_records_deletedAt_idx" ON "medical_records"("deletedAt");

-- CreateIndex
CREATE INDEX "monitoring_records_deletedAt_idx" ON "monitoring_records"("deletedAt");
