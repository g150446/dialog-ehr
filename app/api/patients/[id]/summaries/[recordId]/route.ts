import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { PatientSummary } from '@/types/patient';
import { saveRecordHistory, createRecordSnapshot } from '@/lib/record-history';
import { requireAuth } from '@/lib/api-auth';

function transformPatientSummary(ps: any): PatientSummary {
  return {
    id: ps.recordId || ps.id,
    recordId: ps.recordId || ps.id,
    patientId: ps.patientId,
    title: ps.title,
    content: ps.content,
    authorId: ps.authorId || undefined,
    authorRole: ps.authorRole || undefined,
    authorName: ps.authorName || undefined,
    createdAt: ps.createdAt,
    updatedAt: ps.updatedAt,
    deletedAt: ps.deletedAt,
  };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  try {
    const auth = await requireAuth(request);

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { fullName: true, username: true, role: true },
    });

    const { id, recordId } = await params;
    const body = await request.json();
    const recordData = body;

    const patient = await prisma.patient.findUnique({
      where: { id },
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    const existingRecord = await prisma.patientSummary.findFirst({
      where: {
        patientId: id,
        OR: [
          { id: recordId },
          { recordId: recordId },
        ],
        deletedAt: null,
      },
    });

    if (!existingRecord) {
      return NextResponse.json(
        { error: 'Patient summary not found' },
        { status: 404 }
      );
    }

    const previousSnapshot = createRecordSnapshot(existingRecord, 'summary');

    const updatedRecord = await prisma.patientSummary.update({
      where: {
        id: existingRecord.id,
      },
      data: {
        title: recordData.title !== undefined ? recordData.title : existingRecord.title,
        content: recordData.content !== undefined ? recordData.content : existingRecord.content,
      },
    });

    await saveRecordHistory({
      recordType: 'summary',
      recordId: updatedRecord.id,
      originalRecordId: updatedRecord.recordId,
      action: 'update',
      previousData: previousSnapshot,
      newData: createRecordSnapshot(updatedRecord, 'summary'),
      changedBy: user?.fullName || user?.username || auth.userId,
      reason: recordData.reason,
    });

    return NextResponse.json(transformPatientSummary(updatedRecord), { status: 200 });
  } catch (error) {
    console.error('Error updating patient summary:', error);
    return NextResponse.json(
      { error: 'Failed to update patient summary' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  try {
    const auth = await requireAuth(request);

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { fullName: true, username: true, role: true },
    });

    const { id, recordId } = await params;

    const patient = await prisma.patient.findUnique({
      where: { id },
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    const existingRecord = await prisma.patientSummary.findFirst({
      where: {
        patientId: id,
        OR: [
          { id: recordId },
          { recordId: recordId },
        ],
        deletedAt: null,
      },
    });

    if (!existingRecord) {
      return NextResponse.json(
        { error: 'Patient summary not found' },
        { status: 404 }
      );
    }

    const previousSnapshot = createRecordSnapshot(existingRecord, 'summary');

    const deletedRecord = await prisma.patientSummary.update({
      where: {
        id: existingRecord.id,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    await saveRecordHistory({
      recordType: 'summary',
      recordId: deletedRecord.id,
      originalRecordId: deletedRecord.recordId,
      action: 'delete',
      previousData: previousSnapshot,
      newData: createRecordSnapshot(deletedRecord, 'summary'),
      changedBy: user?.fullName || user?.username || auth.userId,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting patient summary:', error);
    return NextResponse.json(
      { error: 'Failed to delete patient summary' },
      { status: 500 }
    );
  }
}
