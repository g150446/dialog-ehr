import Link from 'next/link';
import { getPatientById } from '@/lib/api';
import { notFound } from 'next/navigation';
import PatientContent from './PatientContent';

interface PatientDetailPageProps {
  params: {
    id: string;
  };
}

export default async function PatientDetailPage({ params }: PatientDetailPageProps) {
  let patient;
  
  try {
    patient = await getPatientById(params.id);
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
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 border-b-2 border-blue-800 px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-6">
          <h1 className="text-white text-lg font-semibold tracking-wide">Dialog Hospital</h1>
          <div className="h-6 w-px bg-blue-500"></div>
          <div className="flex gap-3 text-sm text-blue-100">
            <span className="hover:text-white cursor-pointer">ヘルプ(H)</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-blue-500 rounded text-xs text-gray-700 font-medium shadow-sm transition-colors">
            送信のみ(Z)
          </button>
          <button className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-blue-500 rounded text-xs text-gray-700 font-medium shadow-sm transition-colors">
            診察終了(E)
          </button>
          <button className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-blue-500 rounded text-xs text-gray-700 font-medium shadow-sm transition-colors">
            完了(X)
          </button>
        </div>
      </div>

      {/* Patient Information Bar */}
      <div className="bg-gradient-to-r from-blue-50 to-gray-50 border-b-2 border-gray-300 px-6 py-4 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
            {patient.gender === '男' || patient.gender === 'Male' ? '♂' : '♀'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-5 flex-wrap">
              <span className="font-bold text-xl text-gray-800">{patient.name}様</span>
              <span className="text-sm text-gray-700 font-medium">{patient.gender}</span>
              <span className="text-sm text-gray-700">
                {patient.dateOfBirth}生({age}歳)
              </span>
              <span className="text-sm text-gray-700">
                {patient.height || 0.0}cm / {patient.weight || 0.0}kg / BMI {bmi}
              </span>
              <span className="px-3 py-1 bg-red-100 border-2 border-red-400 rounded text-xs text-red-800 font-semibold shadow-sm">
                未検
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              <span className="font-medium">患者コード: {patient.patientCode}</span>
              {patient.medicalRecordNumber && (
                <>
                  <span className="mx-3 text-gray-400">|</span>
                  <span className="font-medium">カルテ番号: {patient.medicalRecordNumber}</span>
                </>
              )}
            </div>
          </div>
          <Link
            href="/"
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded hover:from-blue-700 hover:to-blue-800 text-sm font-semibold shadow-md transition-all"
          >
            一覧に戻る
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex h-[calc(100vh-200px)]">
        <PatientContent patient={patient} age={age} bmi={bmi} />
      </div>
    </div>
  );
}


