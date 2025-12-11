import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Patient, Visit, MedicalRecord } from '@/types/patient';
import { Prisma } from '@prisma/client';

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
      vitalSigns: mr.vitalSigns as MedicalRecord['vitalSigns'] || undefined,
      laboratoryResults: mr.laboratoryResults as MedicalRecord['laboratoryResults'] || undefined,
      imagingResults: mr.imagingResults || undefined,
      medications: mr.medications as MedicalRecord['medications'] || undefined,
      physician: mr.physician || undefined,
      notes: mr.notes || undefined,
    })) || undefined,
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');

    let whereClause: any = {};

    if (query && query.trim()) {
      const searchQuery = query.trim();
      
      // Helper function to convert Japanese era to Western year
      const convertEraToYear = (dateStr: string): string | null => {
        const eraMatch = dateStr.match(/^([HSMR])(\d+)\/(\d+)\/(\d+)$/);
        if (eraMatch) {
          const [, era, year, month, day] = eraMatch;
          let baseYear = 0;
          if (era === 'H' || era === 'h') baseYear = 1988; // Heisei
          else if (era === 'S' || era === 's') baseYear = 1925; // Showa
          else if (era === 'M' || era === 'm') baseYear = 1867; // Meiji
          else if (era === 'R' || era === 'r') baseYear = 2018; // Reiwa
          const westernYear = baseYear + parseInt(year);
          return `${westernYear}/${month}/${day}`;
        }
        return null;
      };

      // Try to convert era date format
      const convertedDate = convertEraToYear(searchQuery);
      const dateToSearch = convertedDate || searchQuery;

      whereClause = {
        OR: [
          { patientCode: { contains: searchQuery, mode: Prisma.QueryMode.insensitive } },
          { nameKana: { contains: searchQuery, mode: Prisma.QueryMode.insensitive } },
          { name: { contains: searchQuery, mode: Prisma.QueryMode.insensitive } },
          { dateOfBirth: { contains: dateToSearch, mode: Prisma.QueryMode.insensitive } },
          { department: { contains: searchQuery, mode: Prisma.QueryMode.insensitive } },
        ],
      };
    }

    const patients = await prisma.patient.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
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
      },
    });

    const transformedPatients = patients.map(transformPatient);

    return NextResponse.json(transformedPatients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const patientData = body;

    // Create patient with nested visits and medical records
    const patient = await prisma.patient.create({
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
        visits: {
          create: patientData.visits?.map((v: any) => ({
            visitId: v.id,
            date: v.date,
            department: v.department,
            type: v.type,
            diagnosis: v.diagnosis,
            notes: v.notes,
            physician: v.physician,
          })) || [],
        },
        medicalRecords: {
          create: patientData.medicalRecords?.map((mr: any) => ({
            recordId: mr.id,
            date: mr.date,
            type: mr.type,
            visitType: mr.visitType,
            dayOfStay: mr.dayOfStay,
            progressNote: mr.progressNote,
            vitalSigns: mr.vitalSigns,
            laboratoryResults: mr.laboratoryResults,
            imagingResults: mr.imagingResults,
            medications: mr.medications,
            physician: mr.physician,
            notes: mr.notes,
          })) || [],
        },
      },
      include: {
        visits: true,
        medicalRecords: true,
      },
    });

    return NextResponse.json(transformPatient(patient), { status: 201 });
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json(
      { error: 'Failed to create patient' },
      { status: 500 }
    );
  }
}

