import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Patient, Visit, MedicalRecord, MonitoringRecord } from '@/types/patient';

// Helper function to transform Prisma patient to Patient type
function transformPatient(patient: any): Patient {
  return {
    id: patient.id,
    patientCode: patient.patientCode,
    name: patient.name,
    nameKana: patient.nameKana || undefined,
    gender: patient.gender as Patient['gender'],
    dateOfBirth: patient.dateOfBirth,
    age: patient.age,
    medicalRecordNumber: patient.medicalRecordNumber,
    phone: patient.phone || undefined,
    email: patient.email || undefined,
    address: patient.address || undefined,
    bloodType: patient.bloodType || undefined,
    allergies: (patient.allergies as string[]) || undefined,
    conditions: (patient.conditions as string[]) || undefined,
    height: patient.height || undefined,
    weight: patient.weight || undefined,
    bmi: patient.bmi || undefined,
    department: patient.department || undefined,
    bed: patient.bed || undefined,
    admissionDate: patient.admissionDate || undefined,
    dischargeDate: patient.dischargeDate || undefined,
    admissionDiagnosis: patient.admissionDiagnosis || undefined,
    dpcDiagnosis: patient.dpcDiagnosis || undefined,
    dpcPeriod: patient.dpcPeriod || undefined,
    wardAttendingPhysician: patient.wardAttendingPhysician || undefined,
    resident: patient.resident || undefined,
    attendingPhysicianA: patient.attendingPhysicianA || undefined,
    attendingPhysicianB: patient.attendingPhysicianB || undefined,
    outpatientAttendingPhysician: patient.outpatientAttendingPhysician || undefined,
    attendingNS: patient.attendingNS || undefined,
    specialNotes: patient.specialNotes || undefined,
    status: patient.status || undefined,
    plan: patient.plan || undefined,
    nutrition: patient.nutrition || undefined,
    path: patient.path || undefined,
    clinicalPath: patient.clinicalPath || undefined,
    nst: patient.nst || undefined,
    rst: patient.rst || undefined,
    chiefComplaint: patient.chiefComplaint || undefined,
    smokingHistory: patient.smokingHistory || undefined,
    drinkingHistory: patient.drinkingHistory || undefined,
    summary: patient.summary || undefined,
    visits: patient.visits?.map((v: any) => ({
      id: v.visitId || v.id,
      date: v.date,
      department: v.department,
      type: v.type as Visit['type'],
      diagnosis: v.diagnosis || undefined,
      notes: v.notes || undefined,
      physician: v.physician || undefined,
    })) || undefined,
    medicalRecords: patient.medicalRecords?.map((mr: any) => ({
      id: mr.recordId || mr.id,
      date: mr.date,
      type: mr.type as MedicalRecord['type'],
      visitType: mr.visitType || undefined,
      dayOfStay: mr.dayOfStay || undefined,
      progressNote: mr.progressNote || undefined,
      laboratoryResults: mr.laboratoryResults as MedicalRecord['laboratoryResults'] || undefined,
      imagingResults: mr.imagingResults || undefined,
      medications: mr.medications as MedicalRecord['medications'] || undefined,
      physician: mr.physician || undefined,
      notes: mr.notes || undefined,
      deletedAt: mr.deletedAt,
    })) || undefined,
    monitoringRecords: patient.monitoringRecords?.map((mr: any) => ({
      id: mr.recordId || mr.id,
      date: mr.date instanceof Date ? mr.date.toISOString() : mr.date,
      temperature: mr.temperature !== null ? mr.temperature : undefined,
      systolicBloodPressure: mr.systolicBloodPressure !== null ? mr.systolicBloodPressure : undefined,
      diastolicBloodPressure: mr.diastolicBloodPressure !== null ? mr.diastolicBloodPressure : undefined,
      heartRate: mr.heartRate !== null ? mr.heartRate : undefined,
      spO2: mr.spO2 !== null ? mr.spO2 : undefined,
      oxygenFlow: mr.oxygenFlow !== null ? mr.oxygenFlow : undefined,
      weight: mr.weight !== null ? mr.weight : undefined,
      foodIntakeMorning: mr.foodIntakeMorning !== null ? mr.foodIntakeMorning : undefined,
      foodIntakeLunch: mr.foodIntakeLunch !== null ? mr.foodIntakeLunch : undefined,
      foodIntakeEvening: mr.foodIntakeEvening !== null ? mr.foodIntakeEvening : undefined,
      urineOutput: mr.urineOutput !== null ? mr.urineOutput : undefined,
      bowelMovementCount: mr.bowelMovementCount !== null ? mr.bowelMovementCount : undefined,
      urinationCount: mr.urinationCount !== null ? mr.urinationCount : undefined,
      drainOutput: mr.drainOutput !== null ? mr.drainOutput : undefined,
      other: mr.other !== null ? mr.other : undefined,
    })) || undefined,
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
      include: {
        visits: {
          orderBy: {
            date: 'desc',
          },
        },
        medicalRecords: {
          orderBy: {
            date: 'desc',
          },
        },
        monitoringRecords: {
          orderBy: {
            date: 'desc',
          },
        },
      },
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Fetch deletion history for deleted medical records
    const deletedRecordIds = patient.medicalRecords
      .filter(mr => mr.deletedAt)
      .map(mr => mr.id);

    const deletionHistory = deletedRecordIds.length > 0
      ? await prisma.recordHistory.findMany({
          where: {
            recordId: { in: deletedRecordIds },
            action: 'delete',
          },
          select: {
            recordId: true,
            changedBy: true,
            changedAt: true,
          },
        })
      : [];

    // Create a map of deletion info
    const deletionInfoMap = new Map(
      deletionHistory.map(h => [h.recordId, { deletedBy: h.changedBy, deletedAt: h.changedAt }])
    );

    // Transform patient and enrich with deletion info
    const transformedPatient = transformPatient(patient);
    if (transformedPatient.medicalRecords) {
      transformedPatient.medicalRecords = transformedPatient.medicalRecords.map(mr => {
        const deletionInfo = deletionInfoMap.get(
          patient.medicalRecords.find(pmr => (pmr.recordId || pmr.id) === mr.id)?.id || ''
        );
        return deletionInfo ? { ...mr, deletedBy: deletionInfo.deletedBy } : mr;
      });
    }

    return NextResponse.json(transformedPatient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patient' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const patientData = body;

    // Update patient and handle nested relations
    const patient = await prisma.patient.update({
      where: { id },
      data: {
        patientCode: patientData.patientCode,
        name: patientData.name,
        nameKana: patientData.nameKana,
        gender: patientData.gender,
        dateOfBirth: patientData.dateOfBirth,
        age: patientData.age,
        medicalRecordNumber: patientData.medicalRecordNumber,
        phone: patientData.phone,
        email: patientData.email,
        address: patientData.address,
        bloodType: patientData.bloodType,
        allergies: patientData.allergies,
        conditions: patientData.conditions,
        height: patientData.height,
        weight: patientData.weight,
        bmi: patientData.bmi,
        department: patientData.department,
        bed: patientData.bed,
        admissionDate: patientData.admissionDate,
        dischargeDate: patientData.dischargeDate,
        admissionDiagnosis: patientData.admissionDiagnosis,
        dpcDiagnosis: patientData.dpcDiagnosis,
        dpcPeriod: patientData.dpcPeriod,
        wardAttendingPhysician: patientData.wardAttendingPhysician,
        resident: patientData.resident,
        attendingPhysicianA: patientData.attendingPhysicianA,
        attendingPhysicianB: patientData.attendingPhysicianB,
        outpatientAttendingPhysician: patientData.outpatientAttendingPhysician,
        attendingNS: patientData.attendingNS,
        specialNotes: patientData.specialNotes,
        status: patientData.status,
        plan: patientData.plan,
        nutrition: patientData.nutrition,
        path: patientData.path,
        clinicalPath: patientData.clinicalPath,
        nst: patientData.nst,
        rst: patientData.rst,
        chiefComplaint: patientData.chiefComplaint,
        smokingHistory: patientData.smokingHistory,
        drinkingHistory: patientData.drinkingHistory,
        summary: patientData.summary,
      },
      include: {
        visits: true,
        medicalRecords: true,
        monitoringRecords: true,
      },
    });

    return NextResponse.json(transformPatient(patient));
  } catch (error) {
    console.error('Error updating patient:', error);
    return NextResponse.json(
      { error: 'Failed to update patient' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.patient.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    return NextResponse.json(
      { error: 'Failed to delete patient' },
      { status: 500 }
    );
  }
}

