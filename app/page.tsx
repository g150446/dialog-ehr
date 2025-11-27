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
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 border-b-2 border-blue-800 px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-6">
          <h1 className="text-white text-lg font-semibold tracking-wide">Dialog Hospital</h1>
          <div className="h-6 w-px bg-blue-500"></div>
          <div className="flex gap-3 text-sm text-blue-100">
            <span className="hover:text-white cursor-pointer">ファイル(F)</span>
            <span className="text-blue-400">・</span>
            <span className="hover:text-white cursor-pointer">ヘルプ(H)</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-1.5 bg-white hover:bg-gray-50 border border-blue-500 rounded text-sm text-gray-700 font-medium shadow-sm transition-colors">
            ログアウト
          </button>
          <div className="flex gap-1.5">
            <button className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-blue-500 rounded text-xs text-gray-700 shadow-sm transition-colors">
              表示変更
            </button>
            <button className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-blue-500 rounded text-xs text-gray-700 shadow-sm transition-colors">
              最新表示
            </button>
            <button className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-blue-500 rounded text-xs text-gray-700 shadow-sm transition-colors">
              終了(X)
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Navigation Bar */}
      <div className="bg-white border-b-2 border-gray-300 shadow-sm">
        <div className="flex">
          <button className="px-6 py-2.5 text-sm text-gray-600 border-r border-gray-300 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            外来
          </button>
          <button className="px-6 py-2.5 text-sm bg-blue-50 text-blue-700 font-semibold border-b-2 border-blue-600">
            入院
          </button>
        </div>
      </div>

      {/* Controls Above Patient List */}
      <div className="bg-white border-b-2 border-gray-300 px-6 py-4 flex items-center gap-6 shadow-sm">
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 border border-gray-400 rounded bg-white hover:bg-gray-50 text-gray-700 font-medium shadow-sm transition-colors">‹</button>
          <span className="px-4 py-1.5 bg-white border border-gray-400 rounded text-sm text-gray-700 font-medium shadow-sm">2021/08/15</span>
          <button className="px-3 py-1.5 border border-gray-400 rounded bg-white hover:bg-gray-50 text-gray-700 font-medium shadow-sm transition-colors">›</button>
          <button className="px-3 py-1.5 border border-gray-400 rounded text-sm ml-3 bg-white hover:bg-gray-50 text-gray-700 font-medium shadow-sm transition-colors">日</button>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700 font-medium">医師:</label>
          <select className="px-3 py-1.5 border border-gray-400 rounded text-sm bg-white text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
            <option>全医師</option>
          </select>
        </div>
        <div className="flex gap-2 ml-auto">
          <button className="px-4 py-1.5 border border-gray-400 rounded text-sm bg-white hover:bg-gray-50 text-gray-700 font-medium shadow-sm transition-colors">
            患者指定
          </button>
        </div>
      </div>

      {/* Patient List Table */}
      <div className="bg-white overflow-x-auto shadow-inner">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gradient-to-b from-gray-200 to-gray-250 border-b-2 border-gray-400">
            <tr>
              <th className="border border-gray-400 px-3 py-2.5 text-left w-10 text-gray-700 font-semibold">
                <input type="checkbox" className="cursor-pointer" />
              </th>
              <th className="border border-gray-400 px-3 py-2.5 text-left w-14 text-gray-700 font-semibold">No.</th>
              <th className="border border-gray-400 px-3 py-2.5 text-left w-20 text-gray-700 font-semibold">部署</th>
              <th className="border border-gray-400 px-3 py-2.5 text-left w-20 text-gray-700 font-semibold">Bed</th>
              <th className="border border-gray-400 px-3 py-2.5 text-left w-16 text-gray-700 font-semibold">特記</th>
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
                <td className="border border-gray-300 px-3 py-2.5 bg-white text-gray-700">{patient.specialNotes || '-'}</td>
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
    </div>
  );
}


