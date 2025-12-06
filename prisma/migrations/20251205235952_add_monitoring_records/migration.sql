-- CreateTable
CREATE TABLE "monitoring_records" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION,
    "bloodPressure" TEXT,
    "heartRate" DOUBLE PRECISION,
    "spO2" DOUBLE PRECISION,
    "oxygenFlow" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "foodIntakeMorning" TEXT,
    "foodIntakeLunch" TEXT,
    "foodIntakeEvening" TEXT,
    "urineOutput" DOUBLE PRECISION,
    "bowelMovementCount" INTEGER,
    "urinationCount" INTEGER,
    "drainOutput" DOUBLE PRECISION,
    "other" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monitoring_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "monitoring_records_patientId_idx" ON "monitoring_records"("patientId");

-- CreateIndex
CREATE INDEX "monitoring_records_date_idx" ON "monitoring_records"("date");

-- AddForeignKey
ALTER TABLE "monitoring_records" ADD CONSTRAINT "monitoring_records_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
