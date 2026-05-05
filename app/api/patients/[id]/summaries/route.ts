import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import { PatientSummary } from '@/types/patient';

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

    const patientSummaries = await prisma.patientSummary.findMany({
      where: {
        patientId: id,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(patientSummaries.map(transformPatientSummary), { status: 200 });
  } catch (error) {
    console.error('Error fetching patient summaries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patient summaries' },
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

    const patientSummary = await prisma.patientSummary.create({
      data: {
        patientId: id,
        recordId: recordData.id || crypto.randomUUID(),
        title: recordData.title,
        content: recordData.content,
        authorId: auth.userId,
        authorRole: user?.role || auth.userRole,
        authorName: user?.fullName,
      },
    });

    return NextResponse.json(transformPatientSummary(patientSummary), { status: 201 });
  } catch (error) {
    console.error('Error creating patient summary:', error);
    return NextResponse.json(
      { error: 'Failed to create patient summary' },
      { status: 500 }
    );
  }
}
