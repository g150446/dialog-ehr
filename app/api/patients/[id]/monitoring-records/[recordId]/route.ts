import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { MonitoringRecord } from '@/types/patient';

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  try {
    const { id, recordId } = await params;
    const body = await request.json();
    const recordData = body;

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

    // Verify monitoring record exists
    const existingRecord = await prisma.monitoringRecord.findFirst({
      where: {
        patientId: id,
        recordId: recordId,
      },
    });

    if (!existingRecord) {
      return NextResponse.json(
        { error: 'Monitoring record not found' },
        { status: 404 }
      );
    }

    // Helper function to parse float or return undefined
    const parseFloatOrUndefined = (value: string | null | undefined): number | undefined => {
      if (value === null || value === undefined || value === '') return undefined;
      const parsed = parseFloat(String(value));
      return isNaN(parsed) ? undefined : parsed;
    };

    // Helper function to parse int or return undefined
    const parseIntOrUndefined = (value: string | null | undefined): number | undefined => {
      if (value === null || value === undefined || value === '') return undefined;
      const parsed = parseInt(value);
      return isNaN(parsed) ? undefined : parsed;
    };

    // Helper function to return string or undefined
    const stringOrUndefined = (value: string | null | undefined): string | undefined => {
      return (value === null || value === undefined || value === '') ? undefined : value;
    };

    // Update monitoring record
    // Use current timestamp if date is provided as string, otherwise use the provided DateTime
    const recordDate = recordData.date 
      ? (typeof recordData.date === 'string' ? new Date(recordData.date) : recordData.date)
      : new Date();
    
    const updateData = {
      date: recordDate,
      temperature: parseFloatOrUndefined(recordData.temperature),
      systolicBloodPressure: parseFloatOrUndefined(recordData.systolicBloodPressure),
      diastolicBloodPressure: parseFloatOrUndefined(recordData.diastolicBloodPressure),
      heartRate: parseFloatOrUndefined(recordData.heartRate),
      spO2: parseFloatOrUndefined(recordData.spO2),
      oxygenFlow: parseFloatOrUndefined(recordData.oxygenFlow),
      weight: parseFloatOrUndefined(recordData.weight),
      foodIntakeMorning: stringOrUndefined(recordData.foodIntakeMorning),
      foodIntakeLunch: stringOrUndefined(recordData.foodIntakeLunch),
      foodIntakeEvening: stringOrUndefined(recordData.foodIntakeEvening),
      urineOutput: parseFloatOrUndefined(recordData.urineOutput),
      bowelMovementCount: parseIntOrUndefined(recordData.bowelMovementCount),
      urinationCount: parseIntOrUndefined(recordData.urinationCount),
      drainOutput: parseFloatOrUndefined(recordData.drainOutput),
      other: stringOrUndefined(recordData.other),
    };

    const monitoringRecord = await prisma.monitoringRecord.update({
      where: {
        id: existingRecord.id,
      },
      data: updateData,
    });

    return NextResponse.json(transformMonitoringRecord(monitoringRecord), { status: 200 });
  } catch (error) {
    console.error('Error updating monitoring record:', error);
    return NextResponse.json(
      { error: 'Failed to update monitoring record' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  try {
    const { id, recordId } = await params;

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

    // Find monitoring record by recordId
    const existingRecord = await prisma.monitoringRecord.findFirst({
      where: {
        patientId: id,
        recordId: recordId,
      },
    });

    if (!existingRecord) {
      return NextResponse.json(
        { error: 'Monitoring record not found' },
        { status: 404 }
      );
    }

    // Delete monitoring record
    await prisma.monitoringRecord.delete({
      where: {
        id: existingRecord.id,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting monitoring record:', error);
    return NextResponse.json(
      { error: 'Failed to delete monitoring record' },
      { status: 500 }
    );
  }
}

