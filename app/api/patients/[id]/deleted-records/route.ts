import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { MedicalRecord, MonitoringRecord } from '@/types/patient';

// Helper function to transform Prisma medical record to MedicalRecord type
function transformMedicalRecord(mr: any): MedicalRecord {
  return {
    id: mr.recordId || mr.id,
    date: mr.date,
    type: mr.type as MedicalRecord['type'],
    visitType: mr.visitType || undefined,
    dayOfStay: mr.dayOfStay || undefined,
    progressNote: mr.progressNote || undefined,
    vitalSigns: mr.vitalSigns as MedicalRecord['vitalSigns'] || undefined,
    laboratoryResults: mr.laboratoryResults as MedicalRecord['laboratoryResults'] || undefined,
    imagingResults: mr.imagingResults || undefined,
    medications: mr.medications as MedicalRecord['medications'] || undefined,
    physician: mr.physician || undefined,
    notes: mr.notes || undefined,
  };
}

// Helper function to transform Prisma monitoring record to MonitoringRecord type
function transformMonitoringRecord(mr: any): MonitoringRecord {
  return {
    id: mr.recordId || mr.id,
    date: mr.date instanceof Date ? mr.date.toISOString() : mr.date,
    temperature: mr.temperature || undefined,
    systolicBloodPressure: mr.systolicBloodPressure || undefined,
    diastolicBloodPressure: mr.diastolicBloodPressure || undefined,
    heartRate: mr.heartRate || undefined,
    spO2: mr.spO2 || undefined,
    oxygenFlow: mr.oxygenFlow || undefined,
    weight: mr.weight || undefined,
    foodIntakeMorning: mr.foodIntakeMorning || undefined,
    foodIntakeLunch: mr.foodIntakeLunch || undefined,
    foodIntakeEvening: mr.foodIntakeEvening || undefined,
    urineOutput: mr.urineOutput || undefined,
    bowelMovementCount: mr.bowelMovementCount || undefined,
    urinationCount: mr.urinationCount || undefined,
    drainOutput: mr.drainOutput || undefined,
    other: mr.other || undefined,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify patient exists
    const patient = await prisma.patient.findUnique({
      where: { id },
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Get deleted medical records
    const deletedMedicalRecords = await prisma.medicalRecord.findMany({
      where: {
        patientId: id,
        deletedAt: { not: null },
      },
      orderBy: {
        deletedAt: 'desc',
      },
    });

    // Get deleted monitoring records
    const deletedMonitoringRecords = await prisma.monitoringRecord.findMany({
      where: {
        patientId: id,
        deletedAt: { not: null },
      },
      orderBy: {
        deletedAt: 'desc',
      },
    });

    return NextResponse.json({
      medicalRecords: deletedMedicalRecords.map(transformMedicalRecord),
      monitoringRecords: deletedMonitoringRecords.map(transformMonitoringRecord),
    });
  } catch (error) {
    console.error('Error fetching deleted records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deleted records' },
      { status: 500 }
    );
  }
}


