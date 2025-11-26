import Link from 'next/link';
import { getPatientById } from '@/lib/api';
import { notFound } from 'next/navigation';

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
          <h1 className="text-white text-lg font-semibold tracking-wide">Narrative Hospital</h1>
          <div className="h-6 w-px bg-blue-500"></div>
          <h2 className="text-blue-100 text-base font-medium">カルテ・オーダー入力・[カルテ一覧]</h2>
          <div className="h-6 w-px bg-blue-500"></div>
          <div className="flex gap-3 text-sm text-blue-100">
            <span className="hover:text-white cursor-pointer">ファイル(E)</span>
            <span className="text-blue-400">・</span>
            <span className="hover:text-white cursor-pointer">表示(V)</span>
            <span className="text-blue-400">・</span>
            <span className="hover:text-white cursor-pointer">ヘルプ(H)</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-blue-500 rounded text-xs text-gray-700 font-medium shadow-sm transition-colors">
            他患者を聞く
          </button>
          <button className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-blue-500 rounded text-xs text-gray-700 font-medium shadow-sm transition-colors">
            患者呼出
          </button>
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
        {/* Left Panel - Record Navigation */}
        <div className="w-64 bg-gradient-to-b from-gray-100 to-gray-150 border-r-2 border-gray-400 overflow-y-auto shadow-inner">
          <div className="p-3">
            <div className="flex flex-wrap gap-1.5 mb-3">
              <button className="px-3 py-1.5 bg-white border-2 border-blue-600 rounded text-xs font-semibold text-blue-700 shadow-sm hover:bg-blue-50 transition-colors">
                カルテ(1)
              </button>
              <button className="px-3 py-1.5 bg-gray-200 border border-gray-400 rounded text-xs text-gray-700 hover:bg-gray-300 transition-colors">
                カレンダー(2)
              </button>
              <button className="px-3 py-1.5 bg-gray-200 border border-gray-400 rounded text-xs text-gray-700 hover:bg-gray-300 transition-colors">
                指示簿(3)
              </button>
              <button className="px-3 py-1.5 bg-gray-200 border border-gray-400 rounded text-xs text-gray-700 hover:bg-gray-300 transition-colors">
                経過表(4)
              </button>
              <button className="px-3 py-1.5 bg-gray-200 border border-gray-400 rounded text-xs text-gray-700 hover:bg-gray-300 transition-colors">
                ワークシート(5)
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              <button className="px-3 py-1.5 bg-gray-200 border border-gray-400 rounded text-xs text-gray-700 hover:bg-gray-300 transition-colors">
                ALL
              </button>
              <button className="px-3 py-1.5 bg-white border-2 border-blue-600 rounded text-xs font-semibold text-blue-700 shadow-sm hover:bg-blue-50 transition-colors">
                カルテ種
              </button>
              <button className="px-3 py-1.5 bg-gray-200 border border-gray-400 rounded text-xs text-gray-700 hover:bg-gray-300 transition-colors">
                記事
              </button>
            </div>
            <div className="mt-5 pt-3 border-t border-gray-400">
              <div className="text-xs font-bold mb-2 text-gray-700">■記載日</div>
              <div className="text-xs mb-1.5 text-gray-700 font-medium">2021年(令和03年)</div>
              <div className="text-xs mb-1.5 pl-2 text-gray-600">05月</div>
              <div className="text-xs mb-1.5 pl-4 text-gray-600">27日(木)(再)整形外科</div>
            </div>
          </div>
        </div>

        {/* Central Panel - Record Details */}
        <div className="flex-1 bg-white overflow-y-auto p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-5 text-gray-800 border-b-2 border-gray-300 pb-2">患者情報</h2>
            
            {/* Personal Details Section */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-lg mb-5 border-2 border-gray-300 shadow-sm">
              <h3 className="font-bold mb-4 text-sm text-gray-800 border-b border-gray-400 pb-1">基本情報</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="py-1">
                  <span className="text-gray-600 font-medium">氏名:</span>
                  <span className="ml-2 font-semibold text-gray-800">{patient.name}</span>
                  {patient.nameKana && (
                    <span className="ml-2 text-gray-500">({patient.nameKana})</span>
                  )}
                </div>
                <div className="py-1">
                  <span className="text-gray-600 font-medium">性別:</span>
                  <span className="ml-2 text-gray-800">{patient.gender}</span>
                </div>
                <div className="py-1">
                  <span className="text-gray-600 font-medium">生年月日:</span>
                  <span className="ml-2 text-gray-800">{patient.dateOfBirth} ({age}歳)</span>
                </div>
                <div className="py-1">
                  <span className="text-gray-600 font-medium">患者コード:</span>
                  <span className="ml-2 text-gray-800 font-mono">{patient.patientCode}</span>
                </div>
                {patient.phone && (
                  <div className="py-1">
                    <span className="text-gray-600 font-medium">電話番号:</span>
                    <span className="ml-2 text-gray-800">{patient.phone}</span>
                  </div>
                )}
                {patient.email && (
                  <div className="py-1">
                    <span className="text-gray-600 font-medium">メール:</span>
                    <span className="ml-2 text-gray-800">{patient.email}</span>
                  </div>
                )}
                {patient.address && (
                  <div className="col-span-2 py-1">
                    <span className="text-gray-600 font-medium">住所:</span>
                    <span className="ml-2 text-gray-800">{patient.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Medical Information Section */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-lg mb-5 border-2 border-gray-300 shadow-sm">
              <h3 className="font-bold mb-4 text-sm text-gray-800 border-b border-gray-400 pb-1">医療情報</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {patient.height && (
                  <div className="py-1">
                    <span className="text-gray-600 font-medium">身長:</span>
                    <span className="ml-2 text-gray-800">{patient.height}cm</span>
                  </div>
                )}
                {patient.weight && (
                  <div className="py-1">
                    <span className="text-gray-600 font-medium">体重:</span>
                    <span className="ml-2 text-gray-800">{patient.weight}kg</span>
                  </div>
                )}
                {patient.bmi && (
                  <div className="py-1">
                    <span className="text-gray-600 font-medium">BMI:</span>
                    <span className="ml-2 text-gray-800 font-semibold">{bmi}</span>
                  </div>
                )}
                {patient.bloodType && (
                  <div className="py-1">
                    <span className="text-gray-600 font-medium">血液型:</span>
                    <span className="ml-2 text-gray-800">{patient.bloodType}</span>
                  </div>
                )}
                {patient.allergies && patient.allergies.length > 0 && (
                  <div className="col-span-2 py-1">
                    <span className="text-gray-600 font-medium">アレルギー:</span>
                    <span className="ml-2 text-gray-800">{patient.allergies.join(', ')}</span>
                  </div>
                )}
                {patient.conditions && patient.conditions.length > 0 && (
                  <div className="col-span-2 py-1">
                    <span className="text-gray-600 font-medium">既往歴:</span>
                    <span className="ml-2 text-gray-800">{patient.conditions.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Admission Information Section */}
            {(patient.admissionDate || patient.department) && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-lg mb-5 border-2 border-gray-300 shadow-sm">
                <h3 className="font-bold mb-4 text-sm text-gray-800 border-b border-gray-400 pb-1">入院情報</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {patient.department && (
                    <div className="py-1">
                      <span className="text-gray-600 font-medium">部署:</span>
                      <span className="ml-2 text-gray-800">{patient.department}</span>
                    </div>
                  )}
                  {patient.bed && (
                    <div className="py-1">
                      <span className="text-gray-600 font-medium">ベッド:</span>
                      <span className="ml-2 text-gray-800">{patient.bed}</span>
                    </div>
                  )}
                  {patient.admissionDate && (
                    <div className="py-1">
                      <span className="text-gray-600 font-medium">入院日:</span>
                      <span className="ml-2 text-gray-800">{patient.admissionDate}</span>
                    </div>
                  )}
                  {patient.dischargeDate && (
                    <div className="py-1">
                      <span className="text-gray-600 font-medium">退院日:</span>
                      <span className="ml-2 text-gray-800">{patient.dischargeDate}</span>
                    </div>
                  )}
                  {patient.admissionDiagnosis && (
                    <div className="col-span-2 py-1">
                      <span className="text-gray-600 font-medium">入院時病名:</span>
                      <span className="ml-2 text-gray-800">{patient.admissionDiagnosis}</span>
                    </div>
                  )}
                  {patient.dpcDiagnosis && (
                    <div className="col-span-2 py-1">
                      <span className="text-gray-600 font-medium">DPC病名:</span>
                      <span className="ml-2 text-gray-800">{patient.dpcDiagnosis}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Staff Information Section */}
            {(patient.wardAttendingPhysician || patient.attendingPhysicianA) && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-lg mb-5 border-2 border-gray-300 shadow-sm">
                <h3 className="font-bold mb-4 text-sm text-gray-800 border-b border-gray-400 pb-1">担当医情報</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {patient.wardAttendingPhysician && (
                    <div className="py-1">
                      <span className="text-gray-600 font-medium">病棟主治医:</span>
                      <span className="ml-2 text-gray-800">{patient.wardAttendingPhysician}</span>
                    </div>
                  )}
                  {patient.resident && (
                    <div className="py-1">
                      <span className="text-gray-600 font-medium">研修医:</span>
                      <span className="ml-2 text-gray-800">{patient.resident}</span>
                    </div>
                  )}
                  {patient.attendingPhysicianA && (
                    <div className="py-1">
                      <span className="text-gray-600 font-medium">担当医A:</span>
                      <span className="ml-2 text-gray-800">{patient.attendingPhysicianA}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Visit History Section */}
            {patient.visits && patient.visits.length > 0 && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-lg border-2 border-gray-300 shadow-sm">
                <h3 className="font-bold mb-4 text-sm text-gray-800 border-b border-gray-400 pb-1">来院履歴</h3>
                <div className="space-y-3">
                  {patient.visits.map((visit) => (
                    <div key={visit.id} className="border-l-4 border-blue-600 pl-4 py-2.5 text-sm bg-white rounded-r shadow-sm">
                      <div className="font-semibold text-gray-800">{visit.date} - {visit.department}</div>
                      {visit.diagnosis && (
                        <div className="text-gray-700 mt-1.5">診断: <span className="font-medium">{visit.diagnosis}</span></div>
                      )}
                      {visit.physician && (
                        <div className="text-gray-700 mt-1">担当医: <span className="font-medium">{visit.physician}</span></div>
                      )}
                      {visit.notes && (
                        <div className="text-gray-600 mt-1.5 text-xs">{visit.notes}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Action Buttons */}
        <div className="w-48 bg-gradient-to-b from-gray-100 to-gray-150 border-l-2 border-gray-400 overflow-y-auto p-3 shadow-inner">
          <div className="mb-5 pb-3 border-b border-gray-400">
            <div className="text-xs font-bold mb-2.5 text-gray-700">お気に入り</div>
            <button className="w-full text-left px-3 py-2 text-xs bg-white border-2 border-gray-400 rounded mb-1.5 hover:bg-gray-50 hover:border-blue-500 transition-colors shadow-sm">
              オーダ機能1
            </button>
            <button className="w-full text-left px-3 py-2 text-xs bg-white border-2 border-gray-400 rounded mb-1.5 hover:bg-gray-50 hover:border-blue-500 transition-colors shadow-sm">
              オーダ機能2
            </button>
          </div>
          <div className="space-y-1.5">
            <button className="w-full text-left px-3 py-2 text-xs bg-white border-2 border-gray-400 rounded hover:bg-gray-50 hover:border-blue-500 transition-colors shadow-sm">
              ★投薬 (a)
            </button>
            <button className="w-full text-left px-3 py-2 text-xs bg-white border-2 border-gray-400 rounded hover:bg-gray-50 hover:border-blue-500 transition-colors shadow-sm">
              ★注射 (b)
            </button>
            <button className="w-full text-left px-3 py-2 text-xs bg-white border-2 border-gray-400 rounded hover:bg-gray-50 hover:border-blue-500 transition-colors shadow-sm">
              検査結果照会 (l)
            </button>
            <button className="w-full text-left px-3 py-2 text-xs bg-white border-2 border-gray-400 rounded hover:bg-gray-50 hover:border-blue-500 transition-colors shadow-sm">
              所見歴 (m)
            </button>
            <button className="w-full text-left px-3 py-2 text-xs bg-white border-2 border-gray-400 rounded hover:bg-gray-50 hover:border-blue-500 transition-colors shadow-sm">
              ★検査・放射線 (e)
            </button>
            <button className="w-full text-left px-3 py-2 text-xs bg-white border-2 border-gray-400 rounded hover:bg-gray-50 hover:border-blue-500 transition-colors shadow-sm">
              ★処置・指導 (d)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


