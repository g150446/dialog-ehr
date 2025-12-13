import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateBloodPressure() {
  try {
    // Find all monitoring records with bloodPressure field
    const records = await prisma.monitoringRecord.findMany({
      where: {
        bloodPressure: {
          not: null,
        },
      },
    });

    console.log(`Found ${records.length} monitoring records with bloodPressure field`);

    let successCount = 0;
    let skipCount = 0;

    for (const record of records) {
      if (!record.bloodPressure) {
        skipCount++;
        continue;
      }

      // Parse blood pressure string (e.g., "120/80")
      const parts = record.bloodPressure.split('/');
      if (parts.length === 2) {
        const systolic = parseFloat(parts[0].trim());
        const diastolic = parseFloat(parts[1].trim());

        if (!isNaN(systolic) && !isNaN(diastolic)) {
          await prisma.monitoringRecord.update({
            where: { id: record.id },
            data: {
              systolicBloodPressure: systolic,
              diastolicBloodPressure: diastolic,
            },
          });

          const dateStr = record.date instanceof Date ? record.date.toISOString() : record.date;
          console.log(`Updated record ${record.id} (Date: ${dateStr}): ${record.bloodPressure} -> ${systolic}/${diastolic}`);
          successCount++;
        } else {
          console.log(`Skipped record ${record.id}: Invalid blood pressure format "${record.bloodPressure}"`);
          skipCount++;
        }
      } else {
        console.log(`Skipped record ${record.id}: Invalid blood pressure format "${record.bloodPressure}" (expected format: "systolic/diastolic")`);
        skipCount++;
      }
    }

    console.log(`\n✅ Migration completed!`);
    console.log(`   Successfully migrated: ${successCount} records`);
    console.log(`   Skipped: ${skipCount} records`);

  } catch (error) {
    console.error('Error migrating blood pressure data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateBloodPressure();

