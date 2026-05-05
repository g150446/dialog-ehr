import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import { ReferralLetter } from '@/types/patient';

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const patient = await prisma.patient.findUnique({
      where: { id },
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    const referralLetters = await prisma.referralLetter.findMany({
      where: {
        patientId: id,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(referralLetters.map(transformReferralLetter), { status: 200 });
  } catch (error) {
    console.error('Error fetching referral letters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch referral letters' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { fullName: true, role: true },
    });

    const { id } = await params;
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

    const referralLetter = await prisma.referralLetter.create({
      data: {
        patientId: id,
        recordId: recordData.id || crypto.randomUUID(),
        destinationHospital: recordData.destinationHospital,
        content: recordData.content,
        authorId: auth.userId,
        authorRole: user?.role || auth.userRole,
        authorName: user?.fullName,
      },
    });

    return NextResponse.json(transformReferralLetter(referralLetter), { status: 201 });
  } catch (error) {
    console.error('Error creating referral letter:', error);
    return NextResponse.json(
      { error: 'Failed to create referral letter' },
      { status: 500 }
    );
  }
}
