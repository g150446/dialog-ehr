import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ReferralLetter } from '@/types/patient';
import { saveRecordHistory, createRecordSnapshot } from '@/lib/record-history';
import { requireAuth } from '@/lib/api-auth';

function transformReferralLetter(rl: any): ReferralLetter {
  return {
    id: rl.recordId || rl.id,
    recordId: rl.recordId || rl.id,
    patientId: rl.patientId,
    destinationHospital: rl.destinationHospital,
    content: rl.content,
    authorId: rl.authorId || undefined,
    authorRole: rl.authorRole || undefined,
    authorName: rl.authorName || undefined,
    createdAt: rl.createdAt,
    updatedAt: rl.updatedAt,
    deletedAt: rl.deletedAt,
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

    const existingRecord = await prisma.referralLetter.findFirst({
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
        { error: 'Referral letter not found' },
        { status: 404 }
      );
    }

    const previousSnapshot = createRecordSnapshot(existingRecord, 'referral');

    const updatedRecord = await prisma.referralLetter.update({
      where: {
        id: existingRecord.id,
      },
      data: {
        destinationHospital: recordData.destinationHospital !== undefined ? recordData.destinationHospital : existingRecord.destinationHospital,
        content: recordData.content !== undefined ? recordData.content : existingRecord.content,
      },
    });

    await saveRecordHistory({
      recordType: 'referral',
      recordId: updatedRecord.id,
      originalRecordId: updatedRecord.recordId,
      action: 'update',
      previousData: previousSnapshot,
      newData: createRecordSnapshot(updatedRecord, 'referral'),
      changedBy: user?.fullName || user?.username || auth.userId,
      reason: recordData.reason,
    });

    return NextResponse.json(transformReferralLetter(updatedRecord), { status: 200 });
  } catch (error) {
    console.error('Error updating referral letter:', error);
    return NextResponse.json(
      { error: 'Failed to update referral letter' },
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

    const existingRecord = await prisma.referralLetter.findFirst({
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
        { error: 'Referral letter not found' },
        { status: 404 }
      );
    }

    const previousSnapshot = createRecordSnapshot(existingRecord, 'referral');

    const deletedRecord = await prisma.referralLetter.update({
      where: {
        id: existingRecord.id,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    await saveRecordHistory({
      recordType: 'referral',
      recordId: deletedRecord.id,
      originalRecordId: deletedRecord.recordId,
      action: 'delete',
      previousData: previousSnapshot,
      newData: createRecordSnapshot(deletedRecord, 'referral'),
      changedBy: user?.fullName || user?.username || auth.userId,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting referral letter:', error);
    return NextResponse.json(
      { error: 'Failed to delete referral letter' },
      { status: 500 }
    );
  }
}
