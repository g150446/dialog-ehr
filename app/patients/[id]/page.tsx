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
      <div className="bg-blue-100 border-b border-blue-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">カルテ・オーダー入力・[カルテ一覧]</h1>
          <div className="flex gap-2 text-sm">
            <span>ファイル(E)</span>
            <span>・</span>
            <span>表示(V)</span>
            <span>・</span>
            <span>ヘルプ(H)</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">
            他患者を聞く
          </button>
          <button className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">
            患者呼出
          </button>
          <button className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">
            送信のみ(Z)
          </button>
          <button className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">
            診察終了(E)
          </button>
          <button className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">
            完了(X)
          </button>
        </div>
      </div>

      {/* Patient Information Bar */}
      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
            {patient.gender === '男' || patient.gender === 'Male' ? '♂' : '♀'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-lg">{patient.name}様</span>
              <span className="text-sm">{patient.gender}</span>
              <span className="text-sm">
                {patient.dateOfBirth}生({age}歳)
              </span>
              <span className="text-sm">
                {patient.height || 0.0}cm / {patient.weight || 0.0}kg / BMI {bmi}
              </span>
              <span className="px-2 py-1 bg-red-100 border border-red-300 rounded text-xs text-red-700">
                未検
              </span>
            </div>
            <div className="mt-1 text-xs text-gray-600">
              <span>患者コード: {patient.patientCode}</span>
              {patient.medicalRecordNumber && (
                <>
                  <span className="mx-2">|</span>
                  <span>カルテ番号: {patient.medicalRecordNumber}</span>
                </>
              )}
            </div>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            一覧に戻る
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex h-[calc(100vh-200px)]">
        {/* Left Panel - Record Navigation */}
        <div className="w-64 bg-gray-100 border-r border-gray-300 overflow-y-auto">
          <div className="p-2">
            <div className="flex flex-wrap gap-1 mb-2">
              <button className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-semibold">
                カルテ(1)
              </button>
              <button className="px-2 py-1 bg-gray-200 border border-gray-300 rounded text-xs">
                カレンダー(2)
              </button>
              <button className="px-2 py-1 bg-gray-200 border border-gray-300 rounded text-xs">
                指示簿(3)
              </button>
              <button className="px-2 py-1 bg-gray-200 border border-gray-300 rounded text-xs">
                経過表(4)
              </button>
              <button className="px-2 py-1 bg-gray-200 border border-gray-300 rounded text-xs">
                ワークシート(5)
              </button>
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              <button className="px-2 py-1 bg-gray-200 border border-gray-300 rounded text-xs">
                ALL
              </button>
              <button className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-semibold">
                カルテ種
              </button>
              <button className="px-2 py-1 bg-gray-200 border border-gray-300 rounded text-xs">
                記事
              </button>
            </div>
            <div className="mt-4">
              <div className="text-xs font-semibold mb-2">■記載日</div>
              <div className="text-xs mb-1">2021年(令和03年)</div>
              <div className="text-xs mb-1 pl-2">05月</div>
              <div className="text-xs mb-1 pl-4">27日(木)(再)整形外科</div>
            </div>
          </div>
        </div>

        {/* Central Panel - Record Details */}
        <div className="flex-1 bg-white overflow-y-auto p-4">
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-3">患者情報</h2>
            
            {/* Personal Details Section */}
            <div className="bg-gray-50 p-4 rounded mb-4">
              <h3 className="font-semibold mb-3 text-sm">基本情報</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">氏名:</span>
                  <span className="ml-2 font-semibold">{patient.name}</span>
                  {patient.nameKana && (
                    <span className="ml-2 text-gray-500">({patient.nameKana})</span>
                  )}
                </div>
                <div>
                  <span className="text-gray-600">性別:</span>
                  <span className="ml-2">{patient.gender}</span>
                </div>
                <div>
                  <span className="text-gray-600">生年月日:</span>
                  <span className="ml-2">{patient.dateOfBirth} ({age}歳)</span>
                </div>
                <div>
                  <span className="text-gray-600">患者コード:</span>
                  <span className="ml-2">{patient.patientCode}</span>
                </div>
                {patient.phone && (
                  <div>
                    <span className="text-gray-600">電話番号:</span>
                    <span className="ml-2">{patient.phone}</span>
                  </div>
                )}
                {patient.email && (
                  <div>
                    <span className="text-gray-600">メール:</span>
                    <span className="ml-2">{patient.email}</span>
                  </div>
                )}
                {patient.address && (
                  <div className="col-span-2">
                    <span className="text-gray-600">住所:</span>
                    <span className="ml-2">{patient.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Medical Information Section */}
            <div className="bg-gray-50 p-4 rounded mb-4">
              <h3 className="font-semibold mb-3 text-sm">医療情報</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {patient.height && (
                  <div>
                    <span className="text-gray-600">身長:</span>
                    <span className="ml-2">{patient.height}cm</span>
                  </div>
                )}
                {patient.weight && (
                  <div>
                    <span className="text-gray-600">体重:</span>
                    <span className="ml-2">{patient.weight}kg</span>
                  </div>
                )}
                {patient.bmi && (
                  <div>
                    <span className="text-gray-600">BMI:</span>
                    <span className="ml-2">{bmi}</span>
                  </div>
                )}
                {patient.bloodType && (
                  <div>
                    <span className="text-gray-600">血液型:</span>
                    <span className="ml-2">{patient.bloodType}</span>
                  </div>
                )}
                {patient.allergies && patient.allergies.length > 0 && (
                  <div className="col-span-2">
                    <span className="text-gray-600">アレルギー:</span>
                    <span className="ml-2">{patient.allergies.join(', ')}</span>
                  </div>
                )}
                {patient.conditions && patient.conditions.length > 0 && (
                  <div className="col-span-2">
                    <span className="text-gray-600">既往歴:</span>
                    <span className="ml-2">{patient.conditions.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Admission Information Section */}
            {(patient.admissionDate || patient.department) && (
              <div className="bg-gray-50 p-4 rounded mb-4">
                <h3 className="font-semibold mb-3 text-sm">入院情報</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {patient.department && (
                    <div>
                      <span className="text-gray-600">部署:</span>
                      <span className="ml-2">{patient.department}</span>
                    </div>
                  )}
                  {patient.bed && (
                    <div>
                      <span className="text-gray-600">ベッド:</span>
                      <span className="ml-2">{patient.bed}</span>
                    </div>
                  )}
                  {patient.admissionDate && (
                    <div>
                      <span className="text-gray-600">入院日:</span>
                      <span className="ml-2">{patient.admissionDate}</span>
                    </div>
                  )}
                  {patient.dischargeDate && (
                    <div>
                      <span className="text-gray-600">退院日:</span>
                      <span className="ml-2">{patient.dischargeDate}</span>
                    </div>
                  )}
                  {patient.admissionDiagnosis && (
                    <div className="col-span-2">
                      <span className="text-gray-600">入院時病名:</span>
                      <span className="ml-2">{patient.admissionDiagnosis}</span>
                    </div>
                  )}
                  {patient.dpcDiagnosis && (
                    <div className="col-span-2">
                      <span className="text-gray-600">DPC病名:</span>
                      <span className="ml-2">{patient.dpcDiagnosis}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Staff Information Section */}
            {(patient.wardAttendingPhysician || patient.attendingPhysicianA) && (
              <div className="bg-gray-50 p-4 rounded mb-4">
                <h3 className="font-semibold mb-3 text-sm">担当医情報</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {patient.wardAttendingPhysician && (
                    <div>
                      <span className="text-gray-600">病棟主治医:</span>
                      <span className="ml-2">{patient.wardAttendingPhysician}</span>
                    </div>
                  )}
                  {patient.resident && (
                    <div>
                      <span className="text-gray-600">研修医:</span>
                      <span className="ml-2">{patient.resident}</span>
                    </div>
                  )}
                  {patient.attendingPhysicianA && (
                    <div>
                      <span className="text-gray-600">担当医A:</span>
                      <span className="ml-2">{patient.attendingPhysicianA}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Visit History Section */}
            {patient.visits && patient.visits.length > 0 && (
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-semibold mb-3 text-sm">来院履歴</h3>
                <div className="space-y-2">
                  {patient.visits.map((visit) => (
                    <div key={visit.id} className="border-l-4 border-blue-500 pl-3 py-2 text-sm">
                      <div className="font-semibold">{visit.date} - {visit.department}</div>
                      {visit.diagnosis && (
                        <div className="text-gray-600 mt-1">診断: {visit.diagnosis}</div>
                      )}
                      {visit.physician && (
                        <div className="text-gray-600">担当医: {visit.physician}</div>
                      )}
                      {visit.notes && (
                        <div className="text-gray-600 mt-1">{visit.notes}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Action Buttons */}
        <div className="w-48 bg-gray-100 border-l border-gray-300 overflow-y-auto p-2">
          <div className="mb-4">
            <div className="text-xs font-semibold mb-2">お気に入り</div>
            <button className="w-full text-left px-2 py-1 text-xs bg-white border border-gray-300 rounded mb-1 hover:bg-gray-50">
              オーダ機能1
            </button>
            <button className="w-full text-left px-2 py-1 text-xs bg-white border border-gray-300 rounded mb-1 hover:bg-gray-50">
              オーダ機能2
            </button>
          </div>
          <div className="space-y-1">
            <button className="w-full text-left px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50">
              ★投薬 (a)
            </button>
            <button className="w-full text-left px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50">
              ★注射 (b)
            </button>
            <button className="w-full text-left px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50">
              検査結果照会 (l)
            </button>
            <button className="w-full text-left px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50">
              所見歴 (m)
            </button>
            <button className="w-full text-left px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50">
              ★検査・放射線 (e)
            </button>
            <button className="w-full text-left px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50">
              ★処置・指導 (d)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


