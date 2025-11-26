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
      <div className="bg-blue-100 border-b border-blue-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">入院(医師)1</h1>
          <div className="flex gap-2 text-sm">
            <span>ファイル(F)</span>
            <span>・</span>
            <span>ヘルプ(H)</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 bg-white border border-gray-300 rounded text-sm">
            ログアウト
          </button>
          <div className="flex gap-1">
            <button className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">
              表示変更
            </button>
            <button className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">
              最新表示
            </button>
            <button className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">
              終了(X)
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Navigation Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          <button className="px-4 py-2 text-sm border-r border-gray-200 hover:bg-gray-50">
            外来(医師)
          </button>
          <button className="px-4 py-2 text-sm border-r border-gray-200 bg-white font-semibold">
            入院(医師)1
          </button>
          <button className="px-4 py-2 text-sm border-r border-gray-200 hover:bg-gray-50">
            入院(医師)2
          </button>
          <button className="px-4 py-2 text-sm border-r border-gray-200 hover:bg-gray-50">
            クリニック(外来)
          </button>
          <button className="px-4 py-2 text-sm hover:bg-gray-50">
            クリニック(診察終了含む)
          </button>
        </div>
      </div>

      {/* Controls Above Patient List */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button className="px-2 py-1 border border-gray-300 rounded">‹</button>
          <span className="px-3 py-1 bg-white border border-gray-300 rounded">2021/08/15</span>
          <button className="px-2 py-1 border border-gray-300 rounded">›</button>
          <button className="px-2 py-1 border border-gray-300 rounded text-sm ml-2">日</button>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm">医師:</label>
          <select className="px-2 py-1 border border-gray-300 rounded text-sm">
            <option>全医師</option>
          </select>
        </div>
        <div className="flex gap-2 ml-auto">
          <button className="px-3 py-1 border border-gray-300 rounded text-sm">
            患者指定
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded text-sm">
            医師カルテへ
          </button>
        </div>
      </div>

      {/* Patient List Table */}
      <div className="bg-white overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-100 border-b-2 border-gray-300">
            <tr>
              <th className="border border-gray-300 px-2 py-1 text-left w-8">
                <input type="checkbox" />
              </th>
              <th className="border border-gray-300 px-2 py-1 text-left w-12">No.</th>
              <th className="border border-gray-300 px-2 py-1 text-left w-16">部署</th>
              <th className="border border-gray-300 px-2 py-1 text-left w-16">Bed</th>
              <th className="border border-gray-300 px-2 py-1 text-left w-12">特記</th>
              <th className="border border-gray-300 px-2 py-1 text-left w-20">患者コード</th>
              <th className="border border-gray-300 px-2 py-1 text-left w-24">氏名</th>
              <th className="border border-gray-300 px-2 py-1 text-left w-16">年齢</th>
              <th className="border border-gray-300 px-2 py-1 text-left w-12">性別</th>
              <th className="border border-gray-300 px-2 py-1 text-left w-24">入院日</th>
              <th className="border border-gray-300 px-2 py-1 text-left w-24">退院日</th>
              <th className="border border-gray-300 px-2 py-1 text-left w-16">計画</th>
              <th className="border border-gray-300 px-2 py-1 text-left w-16">入院時病名</th>
              <th className="border border-gray-300 px-2 py-1 text-left w-20">DPC病名</th>
              <th className="border border-gray-300 px-2 py-1 text-left w-20">DPC期間I</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient, index) => (
              <tr
                key={patient.id}
                className="hover:bg-blue-50 cursor-pointer"
              >
                <td className="border border-gray-300 px-2 py-1">
                  <input type="checkbox" />
                </td>
                <td className="border border-gray-300 px-2 py-1">{index + 1}</td>
                <td className="border border-gray-300 px-2 py-1">{patient.department || '-'}</td>
                <td className="border border-gray-300 px-2 py-1">{patient.bed || '-'}</td>
                <td className="border border-gray-300 px-2 py-1">{patient.specialNotes || '-'}</td>
                <td className="border border-gray-300 px-2 py-1">{patient.patientCode}</td>
                <td className="border border-gray-300 px-2 py-1">
                  <Link
                    href={`/patients/${patient.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {patient.name}
                  </Link>
                </td>
                <td className="border border-gray-300 px-2 py-1">{patient.age}歳</td>
                <td className="border border-gray-300 px-2 py-1">{patient.gender}</td>
                <td className="border border-gray-300 px-2 py-1">{patient.admissionDate || '-'}</td>
                <td className="border border-gray-300 px-2 py-1">{patient.dischargeDate || '-'}</td>
                <td className="border border-gray-300 px-2 py-1 text-center">
                  {patient.plan ? '★' : '☆'}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-xs">
                  {patient.admissionDiagnosis || '-'}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-xs">
                  {patient.dpcDiagnosis || '-'}
                </td>
                <td className="border border-gray-300 px-2 py-1">{patient.dpcPeriod || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


