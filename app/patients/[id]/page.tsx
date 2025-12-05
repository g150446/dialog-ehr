import Link from 'next/link';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import PatientContent from './PatientContent';
import { Patient, Visit, MedicalRecord } from '@/types/patient';

interface PatientDetailPageProps {
  params: {
    id: string;
  };
}

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

export default async function PatientDetailPage({ params }: PatientDetailPageProps) {
  let patient: Patient | null = null;
  
  try {
    const dbPatient = await prisma.patient.findUnique({
      where: { id: params.id },
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

    if (!dbPatient) {
      notFound();
    }

    patient = transformPatient(dbPatient);
  } catch (error) {
    console.error('Failed to load patient:', error);
    notFound();
  }

  if (!patient) {
    notFound();
  }

  const calculateAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(patient.dateOfBirth);
  const bmi = patient.height && patient.weight 
    ? (patient.weight / Math.pow(patient.height / 100, 2)).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 border-b-2 border-blue-800 px-3 md:px-6 py-2 md:py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3 md:gap-6">
          <h1 className="text-white text-base md:text-lg font-semibold tracking-wide">Dialog EHR</h1>
          <div className="h-6 w-px bg-blue-500 hidden md:block"></div>
          <div className="flex gap-2 md:gap-3 text-xs md:text-sm text-blue-100">
            <span className="hover:text-white cursor-pointer">ヘルプ(H)</span>
          </div>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          <button className="px-2 md:px-3 py-1 md:py-1.5 bg-white hover:bg-gray-50 border border-blue-500 rounded text-xs text-gray-700 font-medium shadow-sm transition-colors">
            送信のみ(Z)
          </button>
          <button className="px-2 md:px-3 py-1 md:py-1.5 bg-white hover:bg-gray-50 border border-blue-500 rounded text-xs text-gray-700 font-medium shadow-sm transition-colors">
            診察終了(E)
          </button>
          <button className="px-2 md:px-3 py-1 md:py-1.5 bg-white hover:bg-gray-50 border border-blue-500 rounded text-xs text-gray-700 font-medium shadow-sm transition-colors">
            完了(X)
          </button>
        </div>
      </div>

      {/* Patient Information Bar */}
      <div className="bg-gradient-to-r from-blue-50 to-gray-50 border-b-2 border-gray-300 px-3 md:px-6 py-3 md:py-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-5">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-md flex-shrink-0">
            {patient.gender === '男' || patient.gender === 'Male' ? '♂' : '♀'}
          </div>
          <div className="flex-1 w-full md:w-auto">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-5 flex-wrap">
              <span className="font-bold text-lg md:text-xl text-gray-800">{patient.name}様</span>
              <div className="flex items-center gap-3 md:gap-5 flex-wrap">
                <span className="text-xs md:text-sm text-gray-700 font-medium">{patient.gender}</span>
                <span className="text-xs md:text-sm text-gray-700">
                  {patient.dateOfBirth}生({age}歳)
                </span>
                <span className="text-xs md:text-sm text-gray-700">
                  {patient.height || 0.0}cm / {patient.weight || 0.0}kg / BMI {bmi}
                </span>
                <span className="px-2 md:px-3 py-0.5 md:py-1 bg-red-100 border-2 border-red-400 rounded text-xs text-red-800 font-semibold shadow-sm">
                  未検
                </span>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              <span className="font-medium">患者コード: {patient.patientCode}</span>
              {patient.medicalRecordNumber && (
                <>
                  <span className="mx-2 md:mx-3 text-gray-400">|</span>
                  <span className="font-medium">カルテ番号: {patient.medicalRecordNumber}</span>
                </>
              )}
            </div>
          </div>
          <Link
            href="/"
            className="px-4 md:px-5 py-2 md:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded hover:from-blue-700 hover:to-blue-800 text-xs md:text-sm font-semibold shadow-md transition-all w-full md:w-auto text-center"
          >
            一覧に戻る
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex h-[calc(100vh-180px)] md:h-[calc(100vh-200px)]">
        <PatientContent patient={patient} age={age} bmi={bmi} />
      </div>
    </div>
  );
}


