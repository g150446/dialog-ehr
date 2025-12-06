import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateMonitoringFoodIntake() {
  try {
    // Find all monitoring records with food intake in % format
    const records = await prisma.monitoringRecord.findMany({
      where: {
        OR: [
          { foodIntakeMorning: { contains: '%' } },
          { foodIntakeLunch: { contains: '%' } },
          { foodIntakeEvening: { contains: '%' } },
        ],
      },
    });

    console.log(`Found ${records.length} monitoring records with % format food intake`);

    for (const record of records) {
      const updates: any = {};

      // Convert % to 割 (1割 = 10%)
      if (record.foodIntakeMorning && record.foodIntakeMorning.includes('%')) {
        const percent = parseFloat(record.foodIntakeMorning.replace('%', ''));
        const wari = percent / 10;
        updates.foodIntakeMorning = wari % 1 === 0 ? `${wari}割` : `${wari}割`;
      }

      if (record.foodIntakeLunch && record.foodIntakeLunch.includes('%')) {
        const percent = parseFloat(record.foodIntakeLunch.replace('%', ''));
        const wari = percent / 10;
        updates.foodIntakeLunch = wari % 1 === 0 ? `${wari}割` : `${wari}割`;
      }

      if (record.foodIntakeEvening && record.foodIntakeEvening.includes('%')) {
        const percent = parseFloat(record.foodIntakeEvening.replace('%', ''));
        const wari = percent / 10;
        updates.foodIntakeEvening = wari % 1 === 0 ? `${wari}割` : `${wari}割`;
      }

      if (Object.keys(updates).length > 0) {
        await prisma.monitoringRecord.update({
          where: { id: record.id },
          data: updates,
        });

        console.log(`Updated record ${record.id} (Date: ${record.date}):`);
        if (updates.foodIntakeMorning) console.log(`  朝: ${record.foodIntakeMorning} -> ${updates.foodIntakeMorning}`);
        if (updates.foodIntakeLunch) console.log(`  昼: ${record.foodIntakeLunch} -> ${updates.foodIntakeLunch}`);
        if (updates.foodIntakeEvening) console.log(`  夕: ${record.foodIntakeEvening} -> ${updates.foodIntakeEvening}`);
      }
    }

    console.log('\n✅ All monitoring records updated successfully!');

  } catch (error) {
    console.error('Error updating monitoring records:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateMonitoringFoodIntake();

