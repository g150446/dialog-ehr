import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  try {
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

    const referralLetter = await prisma.referralLetter.findFirst({
      where: {
        patientId: id,
        recordId: recordId,
      },
    });

    if (!referralLetter) {
      return NextResponse.json(
        { error: 'Referral letter not found' },
        { status: 404 }
      );
    }

    const history = await prisma.recordHistory.findMany({
      where: {
        recordType: 'referral',
        recordId: referralLetter.id,
      },
      orderBy: {
        changedAt: 'desc',
      },
    });

    return NextResponse.json(history, { status: 200 });
  } catch (error) {
    console.error('Error fetching referral letter history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch referral letter history' },
      { status: 500 }
    );
  }
}
