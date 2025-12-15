import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
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

    // Find medical record by recordId
    const medicalRecord = await prisma.medicalRecord.findFirst({
      where: {
        patientId: id,
        recordId: recordId,
      },
    });

    if (!medicalRecord) {
      return NextResponse.json(
        { error: 'Medical record not found' },
        { status: 404 }
      );
    }

    // Get history for this record
    const history = await prisma.recordHistory.findMany({
      where: {
        recordType: 'medical',
        recordId: medicalRecord.id,
      },
      orderBy: {
        changedAt: 'desc',
      },
    });

    return NextResponse.json(history, { status: 200 });
  } catch (error) {
    console.error('Error fetching medical record history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch medical record history' },
      { status: 500 }
    );
  }
}


