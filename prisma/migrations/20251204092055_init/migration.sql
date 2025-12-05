-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "patientCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameKana" TEXT,
    "gender" TEXT NOT NULL,
    "dateOfBirth" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "medicalRecordNumber" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "bloodType" TEXT,
    "allergies" JSONB,
    "conditions" JSONB,
    "height" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "bmi" DOUBLE PRECISION,
    "department" TEXT,
    "bed" TEXT,
    "admissionDate" TEXT,
    "dischargeDate" TEXT,
    "admissionDiagnosis" TEXT,
    "dpcDiagnosis" TEXT,
    "dpcPeriod" TEXT,
    "wardAttendingPhysician" TEXT,
    "resident" TEXT,
    "attendingPhysicianA" TEXT,
    "attendingPhysicianB" TEXT,
    "outpatientAttendingPhysician" TEXT,
    "attendingNS" TEXT,
    "specialNotes" TEXT,
    "status" TEXT,
    "plan" BOOLEAN DEFAULT false,
    "nutrition" TEXT,
    "path" BOOLEAN DEFAULT false,
    "clinicalPath" BOOLEAN DEFAULT false,
    "nst" BOOLEAN DEFAULT false,
    "rst" BOOLEAN DEFAULT false,
    "chiefComplaint" TEXT,
    "smokingHistory" TEXT,
    "drinkingHistory" TEXT,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visits" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "diagnosis" TEXT,
    "notes" TEXT,
    "physician" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_records" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "visitType" TEXT,
    "dayOfStay" INTEGER,
    "progressNote" TEXT,
    "vitalSigns" JSONB,
    "laboratoryResults" JSONB,
    "imagingResults" TEXT,
    "medications" JSONB,
    "physician" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patients_patientCode_key" ON "patients"("patientCode");

-- CreateIndex
CREATE INDEX "patients_patientCode_idx" ON "patients"("patientCode");

-- CreateIndex
CREATE INDEX "patients_medicalRecordNumber_idx" ON "patients"("medicalRecordNumber");

-- CreateIndex
CREATE INDEX "visits_patientId_idx" ON "visits"("patientId");

-- CreateIndex
CREATE INDEX "visits_date_idx" ON "visits"("date");

-- CreateIndex
CREATE INDEX "medical_records_patientId_idx" ON "medical_records"("patientId");

-- CreateIndex
CREATE INDEX "medical_records_date_idx" ON "medical_records"("date");

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
