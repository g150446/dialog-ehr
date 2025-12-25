import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createMonitoringRecord() {
  try {
    // Find an inpatient patient (has admissionDate and no dischargeDate or future dischargeDate)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const patients = await prisma.patient.findMany({
      where: {
        admissionDate: {
          not: null,
        },
      },
      include: {
        monitoringRecords: {
          orderBy: {
            date: 'desc',
          },
        },
      },
    });

    if (patients.length === 0) {
      console.log('No inpatient patients found. Please create a patient with admissionDate first.');
      return;
    }

    // Find a patient who is on day 2 (admitted yesterday or earlier, but not discharged)
    let targetPatient = null;
    
    for (const patient of patients) {
      if (!patient.admissionDate) continue;
      
      const admissionDate = new Date(patient.admissionDate);
      admissionDate.setHours(0, 0, 0, 0);
      
      // Check if patient is discharged
      if (patient.dischargeDate) {
        const dischargeDate = new Date(patient.dischargeDate);
        dischargeDate.setHours(0, 0, 0, 0);
        if (dischargeDate <= today) continue; // Already discharged
      }
      
      // Calculate days since admission
      const daysSinceAdmission = Math.floor((today.getTime() - admissionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // We want a patient who is on day 2 (admitted 1 day ago)
      // But we'll use the first inpatient patient and create day 1 record
      if (daysSinceAdmission >= 1) {
        targetPatient = patient;
        break;
      }
    }

    // If no patient on day 2+, use the first inpatient
    if (!targetPatient && patients.length > 0) {
      targetPatient = patients[0];
    }

    if (!targetPatient) {
      console.log('No suitable inpatient patient found.');
      return;
    }

    console.log(`Found patient: ${targetPatient.name} (ID: ${targetPatient.id})`);
    console.log(`Admission Date: ${targetPatient.admissionDate}`);

    // Parse admission date (handle YYYY/MM/DD format)
    const admissionDateStr = targetPatient.admissionDate!;
    const [year, month, day] = admissionDateStr.split('/').map(Number);
    
    // Calculate day 1 date (admission date + 1 day) - 入院1日目は入院日の翌日
    // Use Date object for calculation, then set time to 14:00 (2 PM) as example
    const admissionDate = new Date(year, month - 1, day);
    const day1Date = new Date(admissionDate);
    day1Date.setDate(day1Date.getDate() + 1);
    day1Date.setHours(14, 0, 0, 0); // Set to 14:00 (2 PM) as example time
    
    console.log(`Admission date: ${year}/${month}/${day}`);
    console.log(`Day 1 date (入院1日目): ${day1Date.toISOString()}`);

    // Check if day 1 record already exists (check by date part only)
    const day1DateStart = new Date(day1Date);
    day1DateStart.setHours(0, 0, 0, 0);
    const day1DateEnd = new Date(day1DateStart);
    day1DateEnd.setHours(23, 59, 59, 999);
    
    const existingRecord = await prisma.monitoringRecord.findFirst({
      where: {
        patientId: targetPatient.id,
        date: {
          gte: day1DateStart,
          lte: day1DateEnd,
        },
      },
    });

    if (existingRecord) {
      console.log(`Day 1 monitoring record already exists for ${day1Date.toISOString()}`);
      console.log('Deleting existing record to recreate with correct data...');
      await prisma.monitoringRecord.delete({
        where: {
          id: existingRecord.id,
        },
      });
    }

    // Create sample day 1 monitoring record data
    const monitoringRecord = await prisma.monitoringRecord.create({
      data: {
        patientId: targetPatient.id,
        recordId: `MON-${Date.now()}`,
        date: day1Date,
        // Vital Signs
        temperature: 36.8,
        systolicBloodPressure: 120,
        diastolicBloodPressure: 80,
        heartRate: 72,
        spO2: 98,
        oxygenFlow: 0,
        // Monitoring Data
        weight: targetPatient.weight || 65.5,
        foodIntakeMorning: '8割',
        foodIntakeLunch: '9割',
        foodIntakeEvening: '7.5割',
        urineOutput: 1200,
        bowelMovementCount: 1,
        urinationCount: 5,
        drainOutput: 0,
        other: '経過良好。特に問題なし。',
      },
    });

    console.log('\n✅ Successfully created day 1 monitoring record:');
    console.log('Record ID:', monitoringRecord.id);
    console.log('Date:', monitoringRecord.date instanceof Date ? monitoringRecord.date.toISOString() : monitoringRecord.date);
    console.log('Temperature:', monitoringRecord.temperature, '°C');
    console.log('Blood Pressure:', `${monitoringRecord.systolicBloodPressure}/${monitoringRecord.diastolicBloodPressure}`, 'mmHg');
    console.log('Heart Rate:', monitoringRecord.heartRate, 'bpm');
    console.log('SpO2:', monitoringRecord.spO2, '%');
    console.log('Weight:', monitoringRecord.weight, 'kg');
    console.log('Food Intake:', `朝${monitoringRecord.foodIntakeMorning} 昼${monitoringRecord.foodIntakeLunch} 夕${monitoringRecord.foodIntakeEvening}`);
    console.log('Urine Output:', monitoringRecord.urineOutput, 'ml');
    console.log('Bowel Movements:', monitoringRecord.bowelMovementCount, 'times');
    console.log('Urination:', monitoringRecord.urinationCount, 'times');

  } catch (error) {
    console.error('Error creating monitoring record:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMonitoringRecord();

