import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { MedicalRecord } from '@/types/patient';
import { saveRecordHistory, createRecordSnapshot } from '@/lib/record-history';
import { requireAuth } from '@/lib/api-auth';

// Helper function to transform Prisma medical record to MedicalRecord type
function transformMedicalRecord(mr: any): MedicalRecord {
  return {
    id: mr.recordId || mr.id,
    date: mr.date,
    type: mr.type as MedicalRecord['type'],
    visitType: mr.visitType || undefined,
    dayOfStay: mr.dayOfStay || undefined,
    progressNote: mr.progressNote || undefined,
    authorId: mr.authorId || undefined,
    authorRole: mr.authorRole || undefined,
    authorName: mr.authorName || undefined,
    laboratoryResults: mr.laboratoryResults as MedicalRecord['laboratoryResults'] || undefined,
    imagingResults: mr.imagingResults || undefined,
    medications: mr.medications as MedicalRecord['medications'] || undefined,
    physician: mr.physician || undefined,
    notes: mr.notes || undefined,
  };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  try {
    // Get authenticated user information
    const auth = await requireAuth(request);

    // Get user details for changedBy field
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { fullName: true, username: true, role: true },
    });

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

    // Find medical record by either database id OR recordId field
    const existingRecord = await prisma.medicalRecord.findFirst({
      where: {
        patientId: id,
        OR: [
          { id: recordId }, // Database UUID
          { recordId: recordId }, // Original recordId field
        ],
        deletedAt: null, // 削除されていない記録のみ
      },
    });

    if (!existingRecord) {
      return NextResponse.json(
        { error: 'Medical record not found' },
        { status: 404 }
      );
    }

    // Save previous data for history
    const previousSnapshot = createRecordSnapshot(existingRecord, 'medical');

    // Update medical record
    const updatedRecord = await prisma.medicalRecord.update({
      where: {
        id: existingRecord.id,
      },
      data: {
        date: recordData.date || existingRecord.date,
        type: recordData.type || existingRecord.type,
        visitType: recordData.visitType !== undefined ? recordData.visitType : existingRecord.visitType,
        dayOfStay: recordData.dayOfStay !== undefined ? recordData.dayOfStay : existingRecord.dayOfStay,
        progressNote: recordData.progressNote !== undefined ? recordData.progressNote : existingRecord.progressNote,
        laboratoryResults: recordData.laboratoryResults !== undefined ? recordData.laboratoryResults : existingRecord.laboratoryResults,
        imagingResults: recordData.imagingResults !== undefined ? recordData.imagingResults : existingRecord.imagingResults,
        medications: recordData.medications !== undefined ? recordData.medications : existingRecord.medications,
        physician: recordData.physician !== undefined ? recordData.physician : existingRecord.physician,
        notes: recordData.notes !== undefined ? recordData.notes : existingRecord.notes,
      },
    });

    // Save update history with user context
    await saveRecordHistory({
      recordType: 'medical',
      recordId: updatedRecord.id,
      originalRecordId: updatedRecord.recordId,
      action: 'update',
      previousData: previousSnapshot,
      newData: createRecordSnapshot(updatedRecord, 'medical'),
      changedBy: user?.fullName || user?.username || auth.userId,
      reason: recordData.reason,
    });

    return NextResponse.json(transformMedicalRecord(updatedRecord), { status: 200 });
  } catch (error) {
    console.error('Error updating medical record:', error);
    return NextResponse.json(
      { error: 'Failed to update medical record' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  try {
    // Get authenticated user information
    const auth = await requireAuth(request);

    // Get user details for changedBy field
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { fullName: true, username: true, role: true },
    });

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

    // Find medical record by either database id OR recordId field
    const existingRecord = await prisma.medicalRecord.findFirst({
      where: {
        patientId: id,
        OR: [
          { id: recordId }, // Database UUID
          { recordId: recordId }, // Original recordId field
        ],
        deletedAt: null, // 削除されていない記録のみ
      },
    });

    if (!existingRecord) {
      return NextResponse.json(
        { error: 'Medical record not found' },
        { status: 404 }
      );
    }

    // Save previous data for history
    const previousSnapshot = createRecordSnapshot(existingRecord, 'medical');

    // Soft delete: Set deletedAt timestamp
    const deletedRecord = await prisma.medicalRecord.update({
      where: {
        id: existingRecord.id,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    // Save delete history with user context
    await saveRecordHistory({
      recordType: 'medical',
      recordId: deletedRecord.id,
      originalRecordId: deletedRecord.recordId,
      action: 'delete',
      previousData: previousSnapshot,
      newData: createRecordSnapshot(deletedRecord, 'medical'),
      changedBy: user?.fullName || user?.username || auth.userId,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting medical record:', error);
    return NextResponse.json(
      { error: 'Failed to delete medical record' },
      { status: 500 }
    );
  }
}


