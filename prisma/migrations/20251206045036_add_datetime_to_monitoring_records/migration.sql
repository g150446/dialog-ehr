-- Step 1: Add a temporary column for the new DateTime type
ALTER TABLE "monitoring_records" ADD COLUMN "date_new" TIMESTAMP(3);

-- Step 2: Convert existing date strings to DateTime with example times
-- Distribute times across records: 08:00, 12:00, 18:00, 20:00
-- Use hash of id to assign times consistently
UPDATE "monitoring_records"
SET "date_new" = (
  CASE 
    WHEN (ABS(HASHTEXT(id)) % 4) = 0 THEN 
      (date::date + INTERVAL '8 hours')::timestamp
    WHEN (ABS(HASHTEXT(id)) % 4) = 1 THEN 
      (date::date + INTERVAL '12 hours')::timestamp
    WHEN (ABS(HASHTEXT(id)) % 4) = 2 THEN 
      (date::date + INTERVAL '18 hours')::timestamp
    ELSE 
      (date::date + INTERVAL '20 hours')::timestamp
  END
);

-- Step 3: Drop the old column and rename the new one
ALTER TABLE "monitoring_records" DROP COLUMN "date";
ALTER TABLE "monitoring_records" RENAME COLUMN "date_new" TO "date";

-- Step 4: Make the column NOT NULL (it should already be populated)
ALTER TABLE "monitoring_records" ALTER COLUMN "date" SET NOT NULL;

-- Step 5: Recreate the index
CREATE INDEX "monitoring_records_date_idx" ON "monitoring_records"("date");
