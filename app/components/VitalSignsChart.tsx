'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { MonitoringRecord } from '@/types/patient';

interface VitalSignsChartProps {
  records: MonitoringRecord[];
}

interface ChartDataPoint {
  dateTime: number; // 一意の識別子（タイムスタンプ）
  date: string; // 表示用の日付
  temperature?: number;
  systolic?: number;
  diastolic?: number;
  pulse?: number;
  weight?: number;
  breakfastIntake?: string;
  lunchIntake?: string;
  dinnerIntake?: string;
  urineOutput?: number;
  bowelMovements?: number;
  urinations?: number;
  drainOutput?: number;
}

export default function VitalSignsChart({ records }: VitalSignsChartProps) {
  // データがない場合のメッセージ表示
  if (!records || records.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6 bg-gray-50">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          経過表
        </h1>
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-600">モニタリングデータがありません。</p>
        </div>
      </div>
    );
  }

  // データを日付順にソートし、チャート用に変換
  const sortedRecords = [...records].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // 日付範囲を取得（タイトル用）
  const startDate = new Date(sortedRecords[0].date);
  const endDate = new Date(sortedRecords[sortedRecords.length - 1].date);
  
  const formatDateForTitle = (date: Date): string => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
  };

  const titleText = `経過表(${formatDateForTitle(startDate)}から${formatDateForTitle(endDate)})`;

  // 日付を正規化（時刻を0:00:00にして日付のみを取得）
  const normalizeDateToMidnight = (dateString: string): Date => {
    const date = new Date(dateString);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  const chartData: ChartDataPoint[] = sortedRecords.map((record) => {
    const date = new Date(record.date);
    const dateTime = date.getTime(); // 一意の識別子として元のタイムスタンプを使用
    // 1日単位で表示するため、日付のみを使用（時刻は無視）
    const shortDate = `${date.getMonth() + 1}/${date.getDate()}`;

    // 血圧を収縮期/拡張期に分割
    let systolic: number | undefined;
    let diastolic: number | undefined;
    if (record.bloodPressure) {
      const parts = record.bloodPressure.split('/');
      if (parts.length === 2) {
        systolic = parseInt(parts[0]);
        diastolic = parseInt(parts[1]);
      }
    }

    return {
      dateTime,
      date: shortDate,
      temperature: record.temperature,
      systolic,
      diastolic,
      pulse: record.heartRate,
      weight: record.weight,
      breakfastIntake: record.foodIntakeMorning || '',
      lunchIntake: record.foodIntakeLunch || '',
      dinnerIntake: record.foodIntakeEvening || '',
      urineOutput: record.urineOutput,
      bowelMovements: record.bowelMovementCount,
      urinations: record.urinationCount,
      drainOutput: record.drainOutput,
    };
  });

  // ユニークな日付のticksを計算（X軸に表示する日付のリスト）
  const uniqueDateMap = new Map<string, number>();
  chartData.forEach((point) => {
    const normalizedDate = normalizeDateToMidnight(new Date(point.dateTime).toISOString());
    const dateKey = point.date;
    if (!uniqueDateMap.has(dateKey)) {
      // その日の最初のデータポイントのタイムスタンプを使用
      uniqueDateMap.set(dateKey, normalizedDate.getTime());
    }
  });
  const uniqueDateTicks = Array.from(uniqueDateMap.values());

  // タイムスタンプを日付表示に変換する関数
  const formatTimestampToShortDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gray-50">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
        {titleText}
      </h1>

      {/* 体温グラフ */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h2 className="text-sm font-bold text-gray-700 mb-2">体温 (℃)</h2>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="dateTime"
              type="number"
              domain={['dataMin', 'dataMax']}
              ticks={uniqueDateTicks}
              tickFormatter={formatTimestampToShortDate}
              tick={{ fontSize: 12 }}
              stroke="#666"
            />
            <YAxis
              domain={[35, 38]}
              ticks={[35, 36, 37, 38]}
              tick={{ fontSize: 12 }}
              stroke="#666"
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="temperature"
              name="体温"
              stroke="#e91e63"
              strokeWidth={2.5}
              dot={{ fill: '#e91e63', r: 4 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 血圧グラフ */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h2 className="text-sm font-bold text-gray-700 mb-2">血圧 (mmHg)</h2>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="dateTime"
              type="number"
              domain={['dataMin', 'dataMax']}
              ticks={uniqueDateTicks}
              tickFormatter={formatTimestampToShortDate}
              tick={{ fontSize: 12 }}
              stroke="#666"
            />
            <YAxis
              domain={[80, 140]}
              ticks={[80, 100, 120, 140]}
              tick={{ fontSize: 12 }}
              stroke="#666"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="systolic"
              stroke="#e74c3c"
              strokeWidth={2.5}
              dot={{ fill: '#e74c3c', r: 4 }}
              name="収縮期"
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="diastolic"
              stroke="#f39c12"
              strokeWidth={2.5}
              dot={{ fill: '#f39c12', r: 4 }}
              name="拡張期"
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 脈拍グラフ */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h2 className="text-sm font-bold text-gray-700 mb-2">脈拍 (bpm)</h2>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="dateTime"
              type="number"
              domain={['dataMin', 'dataMax']}
              ticks={uniqueDateTicks}
              tickFormatter={formatTimestampToShortDate}
              tick={{ fontSize: 12 }}
              stroke="#666"
            />
            <YAxis
              domain={[60, 90]}
              ticks={[60, 70, 80, 90]}
              tick={{ fontSize: 12 }}
              stroke="#666"
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="pulse"
              name="脈拍"
              stroke="#3498db"
              strokeWidth={2.5}
              dot={{ fill: '#3498db', r: 4 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* データテーブル */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#e8f4f8]">
                <th className="border border-gray-300 px-4 py-2 text-left font-bold text-gray-700">
                  日付
                </th>
                {chartData.map((data, index) => (
                  <th
                    key={index}
                    className="border border-gray-300 px-4 py-2 text-center font-bold text-gray-700"
                  >
                    {data.date}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-gray-600">
              <DataRow
                label="体重(kg)"
                values={chartData.map((d) => d.weight ?? '')}
                isEven={false}
              />
              <DataRow
                label="食事量(朝)"
                values={chartData.map((d) => d.breakfastIntake ?? '')}
                isEven={true}
              />
              <DataRow
                label="食事量(昼)"
                values={chartData.map((d) => d.lunchIntake ?? '')}
                isEven={false}
              />
              <DataRow
                label="食事量(夕)"
                values={chartData.map((d) => d.dinnerIntake ?? '')}
                isEven={true}
              />
              <DataRow
                label="尿量(ml)"
                values={chartData.map((d) => d.urineOutput ?? '')}
                isEven={false}
              />
              <DataRow
                label="排便回数"
                values={chartData.map((d) => d.bowelMovements ?? '')}
                isEven={true}
              />
              <DataRow
                label="排尿回数"
                values={chartData.map((d) => d.urinations ?? '')}
                isEven={false}
              />
              <DataRow
                label="ドレーン廃液量(ml)"
                values={chartData.map((d) => d.drainOutput ?? '')}
                isEven={true}
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface DataRowProps {
  label: string;
  values: (string | number)[];
  isEven: boolean;
}

function DataRow({ label, values, isEven }: DataRowProps) {
  return (
    <tr className={isEven ? 'bg-gray-50' : 'bg-white'}>
      <td className="border border-gray-300 px-4 py-2 font-medium text-gray-700">
        {label}
      </td>
      {values.map((value, index) => (
        <td
          key={index}
          className="border border-gray-300 px-4 py-2 text-center"
        >
          {value}
        </td>
      ))}
    </tr>
  );
}

// カスタムTooltipコンポーネント
function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (active && payload && payload.length) {
    // dateTimeを日付と時間にフォーマット
    const dateTime = payload[0].payload.dateTime;
    const date = new Date(dateTime);
    const formattedDate = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

    return (
      <div className="bg-white border border-gray-300 rounded shadow-lg p-3">
        <p className="text-sm font-semibold text-gray-700 mb-2">{formattedDate}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name || entry.dataKey}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

