import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { MedicalRecord } from '@/types/patient';

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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const recordData = body;

    // Verify patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: params.id },
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Create medical record
    const medicalRecord = await prisma.medicalRecord.create({
      data: {
        patientId: params.id,
        recordId: recordData.id,
        date: recordData.date,
        type: recordData.type,
        visitType: recordData.visitType,
        dayOfStay: recordData.dayOfStay,
        progressNote: recordData.progressNote,
        vitalSigns: recordData.vitalSigns,
        laboratoryResults: recordData.laboratoryResults,
        imagingResults: recordData.imagingResults,
        medications: recordData.medications,
        physician: recordData.physician,
        notes: recordData.notes,
      },
    });

    return NextResponse.json(transformMedicalRecord(medicalRecord), { status: 201 });
  } catch (error) {
    console.error('Error creating medical record:', error);
    return NextResponse.json(
      { error: 'Failed to create medical record' },
      { status: 500 }
    );
  }
}

