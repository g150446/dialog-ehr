import Link from 'next/link';
import { getAllPatients } from '@/lib/api';
import { Patient } from '@/types/patient';

export default async function HomePage() {
  let patients: Patient[] = [];
  
  try {
    patients = await getAllPatients();
  } catch (error) {
    console.error('Failed to load patients:', error);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 border-b-2 border-blue-800 px-3 md:px-6 py-2 md:py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-0 shadow-md">
        <div className="flex items-center gap-3 md:gap-6 w-full md:w-auto">
          <h1 className="text-white text-base md:text-lg font-semibold tracking-wide">Dialog Hospital</h1>
          <div className="h-6 w-px bg-blue-500 hidden md:block"></div>
          <div className="flex gap-2 md:gap-3 text-xs md:text-sm text-blue-100">
            <span className="hover:text-white cursor-pointer hidden sm:inline">ファイル(F)</span>
            <span className="text-blue-400 hidden sm:inline">・</span>
            <span className="hover:text-white cursor-pointer">ヘルプ(H)</span>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto flex-wrap">
          <button className="px-3 md:px-4 py-1 md:py-1.5 bg-white hover:bg-gray-50 border border-blue-500 rounded text-xs md:text-sm text-gray-700 font-medium shadow-sm transition-colors">
            ログアウト
          </button>
          <div className="flex gap-1 md:gap-1.5">
            <button className="px-2 md:px-3 py-1 md:py-1.5 bg-white hover:bg-gray-50 border border-blue-500 rounded text-xs text-gray-700 shadow-sm transition-colors">
              表示変更
            </button>
            <button className="px-2 md:px-3 py-1 md:py-1.5 bg-white hover:bg-gray-50 border border-blue-500 rounded text-xs text-gray-700 shadow-sm transition-colors">
              最新表示
            </button>
            <button className="px-2 md:px-3 py-1 md:py-1.5 bg-white hover:bg-gray-50 border border-blue-500 rounded text-xs text-gray-700 shadow-sm transition-colors">
              終了(X)
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Navigation Bar */}
      <div className="bg-white border-b-2 border-gray-300 shadow-sm">
        <div className="flex">
          <button className="px-4 md:px-6 py-2 md:py-2.5 text-xs md:text-sm text-gray-600 border-r border-gray-300 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            外来
          </button>
          <button className="px-4 md:px-6 py-2 md:py-2.5 text-xs md:text-sm bg-blue-50 text-blue-700 font-semibold border-b-2 border-blue-600">
            入院
          </button>
        </div>
      </div>

      {/* Controls Above Patient List */}
      <div className="bg-white border-b-2 border-gray-300 px-3 md:px-6 py-3 md:py-4 flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-6 shadow-sm">
        <div className="flex items-center gap-2">
          <button className="px-2 md:px-3 py-1 md:py-1.5 border border-gray-400 rounded bg-white hover:bg-gray-50 text-gray-700 font-medium shadow-sm transition-colors text-sm">‹</button>
          <span className="px-3 md:px-4 py-1 md:py-1.5 bg-white border border-gray-400 rounded text-xs md:text-sm text-gray-700 font-medium shadow-sm">2021/08/15</span>
          <button className="px-2 md:px-3 py-1 md:py-1.5 border border-gray-400 rounded bg-white hover:bg-gray-50 text-gray-700 font-medium shadow-sm transition-colors text-sm">›</button>
          <button className="px-2 md:px-3 py-1 md:py-1.5 border border-gray-400 rounded text-xs md:text-sm ml-2 md:ml-3 bg-white hover:bg-gray-50 text-gray-700 font-medium shadow-sm transition-colors">日</button>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs md:text-sm text-gray-700 font-medium">医師:</label>
          <select className="flex-1 md:flex-none px-2 md:px-3 py-1 md:py-1.5 border border-gray-400 rounded text-xs md:text-sm bg-white text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
            <option>全医師</option>
          </select>
        </div>
        <div className="flex gap-2 md:ml-auto">
          <button className="px-3 md:px-4 py-1 md:py-1.5 border border-gray-400 rounded text-xs md:text-sm bg-white hover:bg-gray-50 text-gray-700 font-medium shadow-sm transition-colors w-full md:w-auto">
            患者指定
          </button>
        </div>
      </div>

      {/* Patient List - Desktop Table */}
      <div className="bg-white overflow-x-auto shadow-inner hidden md:block">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gradient-to-b from-gray-200 to-gray-250 border-b-2 border-gray-400">
            <tr>
              <th className="border border-gray-400 px-3 py-2.5 text-left w-10 text-gray-700 font-semibold">
                <input type="checkbox" className="cursor-pointer" />
              </th>
              <th className="border border-gray-400 px-3 py-2.5 text-left w-14 text-gray-700 font-semibold">No.</th>
              <th className="border border-gray-400 px-3 py-2.5 text-left w-20 text-gray-700 font-semibold">部署</th>
              <th className="border border-gray-400 px-3 py-2.5 text-left w-20 text-gray-700 font-semibold">Bed</th>
              <th className="border border-gray-400 px-3 py-2.5 text-left w-24 text-gray-700 font-semibold">患者コード</th>
              <th className="border border-gray-400 px-3 py-2.5 text-left w-28 text-gray-700 font-semibold">氏名</th>
              <th className="border border-gray-400 px-3 py-2.5 text-left w-20 text-gray-700 font-semibold">年齢</th>
              <th className="border border-gray-400 px-3 py-2.5 text-left w-16 text-gray-700 font-semibold">性別</th>
              <th className="border border-gray-400 px-3 py-2.5 text-left w-28 text-gray-700 font-semibold">入院日</th>
              <th className="border border-gray-400 px-3 py-2.5 text-left w-28 text-gray-700 font-semibold">退院日</th>
              <th className="border border-gray-400 px-3 py-2.5 text-left w-20 text-gray-700 font-semibold">計画</th>
              <th className="border border-gray-400 px-3 py-2.5 text-left w-32 text-gray-700 font-semibold">入院時病名</th>
              <th className="border border-gray-400 px-3 py-2.5 text-left w-32 text-gray-700 font-semibold">DPC病名</th>
              <th className="border border-gray-400 px-3 py-2.5 text-left w-24 text-gray-700 font-semibold">DPC期間I</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient, index) => (
              <tr
                key={patient.id}
                className="hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-300"
              >
                <td className="border border-gray-300 px-3 py-2.5 bg-white">
                  <input type="checkbox" className="cursor-pointer" />
                </td>
                <td className="border border-gray-300 px-3 py-2.5 bg-white text-gray-700">{index + 1}</td>
                <td className="border border-gray-300 px-3 py-2.5 bg-white text-gray-700">{patient.department || '-'}</td>
                <td className="border border-gray-300 px-3 py-2.5 bg-white text-gray-700">{patient.bed || '-'}</td>
                <td className="border border-gray-300 px-3 py-2.5 bg-white text-gray-700 font-mono text-xs">{patient.patientCode}</td>
                <td className="border border-gray-300 px-3 py-2.5 bg-white">
                  <Link
                    href={`/patients/${patient.id}`}
                    className="text-blue-700 hover:text-blue-900 hover:underline font-medium transition-colors"
                  >
                    {patient.name}
                  </Link>
                </td>
                <td className="border border-gray-300 px-3 py-2.5 bg-white text-gray-700">{patient.age}歳</td>
                <td className="border border-gray-300 px-3 py-2.5 bg-white text-gray-700">{patient.gender}</td>
                <td className="border border-gray-300 px-3 py-2.5 bg-white text-gray-700">{patient.admissionDate || '-'}</td>
                <td className="border border-gray-300 px-3 py-2.5 bg-white text-gray-700">{patient.dischargeDate || '-'}</td>
                <td className="border border-gray-300 px-3 py-2.5 bg-white text-center">
                  <span className="text-yellow-600 text-base">{patient.plan ? '★' : '☆'}</span>
                </td>
                <td className="border border-gray-300 px-3 py-2.5 bg-white text-xs text-gray-700">
                  {patient.admissionDiagnosis || '-'}
                </td>
                <td className="border border-gray-300 px-3 py-2.5 bg-white text-xs text-gray-700">
                  {patient.dpcDiagnosis || '-'}
                </td>
                <td className="border border-gray-300 px-3 py-2.5 bg-white text-gray-700">{patient.dpcPeriod || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Patient List - Mobile Card Layout */}
      <div className="bg-white shadow-inner md:hidden p-3 space-y-3">
        {patients.map((patient, index) => (
          <Link
            key={patient.id}
            href={`/patients/${patient.id}`}
            className="block bg-white border-2 border-gray-300 rounded-lg p-4 shadow-sm hover:border-blue-500 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-700 mb-1">{patient.name}</h3>
                <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                  <span className="font-mono">{patient.patientCode}</span>
                  <span>•</span>
                  <span>{patient.age}歳</span>
                  <span>•</span>
                  <span>{patient.gender}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-600 text-lg">{patient.plan ? '★' : '☆'}</span>
                <span className="text-xs text-gray-500">#{index + 1}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 mb-2">
              {patient.department && (
                <div>
                  <span className="text-gray-500">部署:</span> <span className="font-medium">{patient.department}</span>
                </div>
              )}
              {patient.bed && (
                <div>
                  <span className="text-gray-500">Bed:</span> <span className="font-medium">{patient.bed}</span>
                </div>
              )}
              {patient.admissionDate && (
                <div>
                  <span className="text-gray-500">入院日:</span> <span className="font-medium">{patient.admissionDate}</span>
                </div>
              )}
              {patient.dischargeDate && (
                <div>
                  <span className="text-gray-500">退院日:</span> <span className="font-medium">{patient.dischargeDate}</span>
                </div>
              )}
            </div>
            {patient.admissionDiagnosis && (
              <div className="text-xs text-gray-700 mt-2 pt-2 border-t border-gray-200">
                <span className="text-gray-500">入院時病名:</span> <span className="font-medium line-clamp-1">{patient.admissionDiagnosis}</span>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}


