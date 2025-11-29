'use client';

import { useState, useEffect } from 'react';
import { Patient, MedicalRecord } from '@/types/patient';

interface PatientContentProps {
  patient: Patient;
  age: number;
  bmi: string;
}

export default function PatientContent({ patient, age, bmi }: PatientContentProps) {
  const [activeView, setActiveView] = useState<'medical-records' | 'patient-info' | 'visit-history'>('medical-records');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [shouldUseTwoColumns, setShouldUseTwoColumns] = useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);
  const [showPastRecordsOnly, setShowPastRecordsOnly] = useState(false);
  
  // Form state for new medical record
  const [newRecord, setNewRecord] = useState({
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
    notes: ''
  });

  // Aspect ratio detection
  useEffect(() => {
    const checkLayout = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        const height = window.innerHeight;
        setShouldUseTwoColumns(width > height);
      }
    };
    
    checkLayout();
    window.addEventListener('resize', checkLayout);
    return () => window.removeEventListener('resize', checkLayout);
  }, []);

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsDrawerOpen(true)}
        className="fixed top-24 right-4 z-40 md:hidden bg-blue-600 text-white p-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
        aria-label="メニューを開く"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Drawer Overlay */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Left Panel - Record Navigation */}
      <div className={`fixed md:static top-0 left-0 h-full md:h-auto w-64 bg-gradient-to-b from-gray-100 to-gray-150 border-r-2 border-gray-400 overflow-y-auto shadow-inner z-50 md:z-auto transform transition-transform duration-300 ease-in-out ${
        isDrawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="p-3">
          {/* Mobile Close Button */}
          <div className="flex justify-end mb-3 md:hidden">
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="text-gray-700 hover:text-gray-900 p-1"
              aria-label="メニューを閉じる"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            <button
              onClick={() => {
                setActiveView('medical-records');
                setShowPastRecordsOnly(false);
                setIsDrawerOpen(false);
              }}
              className={`px-3 py-1.5 rounded text-xs shadow-sm transition-colors ${
                activeView === 'medical-records' && !showPastRecordsOnly
                  ? 'bg-white border-2 border-blue-600 text-blue-700 font-semibold hover:bg-blue-50'
                  : 'bg-gray-200 border border-gray-400 text-gray-700 hover:bg-gray-300'
              }`}
            >
              新規診療録
            </button>
            <button
              onClick={() => {
                setActiveView('medical-records');
                setShowPastRecordsOnly(true);
                setIsDrawerOpen(false);
              }}
              className={`px-3 py-1.5 rounded text-xs shadow-sm transition-colors ${
                activeView === 'medical-records' && showPastRecordsOnly
                  ? 'bg-white border-2 border-blue-600 text-blue-700 font-semibold hover:bg-blue-50'
                  : 'bg-gray-200 border border-gray-400 text-gray-700 hover:bg-gray-300'
              }`}
            >
              過去診療録
            </button>
            <button className="px-3 py-1.5 bg-gray-200 border border-gray-400 rounded text-xs text-gray-700 hover:bg-gray-300 transition-colors">
              カレンダー
            </button>
            <button className="px-3 py-1.5 bg-gray-200 border border-gray-400 rounded text-xs text-gray-700 hover:bg-gray-300 transition-colors">
              指示簿
            </button>
            <button className="px-3 py-1.5 bg-gray-200 border border-gray-400 rounded text-xs text-gray-700 hover:bg-gray-300 transition-colors">
              経過表
            </button>
            <button className="px-3 py-1.5 bg-gray-200 border border-gray-400 rounded text-xs text-gray-700 hover:bg-gray-300 transition-colors">
              ワークシート
            </button>
            <button
              onClick={() => {
                setActiveView('patient-info');
                setIsDrawerOpen(false);
              }}
              className={`px-3 py-1.5 rounded text-xs shadow-sm transition-colors ${
                activeView === 'patient-info'
                  ? 'bg-white border-2 border-blue-600 text-blue-700 font-semibold hover:bg-blue-50'
                  : 'bg-gray-200 border border-gray-400 text-gray-700 hover:bg-gray-300'
              }`}
            >
              患者情報
            </button>
            <button
              onClick={() => {
                setActiveView('visit-history');
                setIsDrawerOpen(false);
              }}
              className={`px-3 py-1.5 rounded text-xs shadow-sm transition-colors ${
                activeView === 'visit-history'
                  ? 'bg-white border-2 border-blue-600 text-blue-700 font-semibold hover:bg-blue-50'
                  : 'bg-gray-200 border border-gray-400 text-gray-700 hover:bg-gray-300'
              }`}
            >
              来院履歴
            </button>
          </div>

          <div className="mt-5 pt-3 border-t border-gray-400">
            <div className="text-xs font-bold mb-2.5 text-gray-700">お気に入り</div>
            <button className="w-full text-left px-3 py-2 text-xs bg-white border-2 border-gray-400 rounded mb-1.5 hover:bg-gray-50 hover:border-blue-500 transition-colors shadow-sm">
              オーダ機能1
            </button>
            <button className="w-full text-left px-3 py-2 text-xs bg-white border-2 border-gray-400 rounded mb-1.5 hover:bg-gray-50 hover:border-blue-500 transition-colors shadow-sm">
              オーダ機能2
            </button>
          </div>
          <div className="mt-5 pt-3 border-t border-gray-400">
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

      {/* Central Panel - Record Details */}
      <div className={`flex-1 bg-white ${showPastRecordsOnly ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'} ${showPastRecordsOnly ? 'p-0' : 'p-3 md:p-6'}`}>
        <div className={showPastRecordsOnly ? 'flex-1 flex flex-col min-h-0' : 'mb-4 p-3 md:p-6'}>
          {/* Patient Information Section */}
          {activeView === 'patient-info' && (
            <>
              <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-5 text-gray-800 border-b-2 border-gray-300 pb-2">患者情報</h2>
              
              {/* Personal Details Section */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 md:p-5 rounded-lg mb-3 md:mb-5 border-2 border-gray-300 shadow-sm">
                <h3 className="font-bold mb-3 md:mb-4 text-xs md:text-sm text-gray-800 border-b border-gray-400 pb-1">基本情報</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
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
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 md:p-5 rounded-lg mb-3 md:mb-5 border-2 border-gray-300 shadow-sm">
                <h3 className="font-bold mb-3 md:mb-4 text-xs md:text-sm text-gray-800 border-b border-gray-400 pb-1">医療情報</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
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
                  {patient.chiefComplaint && (
                    <div className="col-span-2 py-1">
                      <span className="text-gray-600 font-medium">主訴:</span>
                      <span className="ml-2 text-gray-800">{patient.chiefComplaint}</span>
                    </div>
                  )}
                  {patient.smokingHistory && (
                    <div className="col-span-2 py-1">
                      <span className="text-gray-600 font-medium">喫煙:</span>
                      <span className="ml-2 text-gray-800">{patient.smokingHistory}</span>
                    </div>
                  )}
                  {patient.drinkingHistory && (
                    <div className="col-span-2 py-1">
                      <span className="text-gray-600 font-medium">飲酒:</span>
                      <span className="ml-2 text-gray-800">{patient.drinkingHistory}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Admission Information Section */}
              {(patient.admissionDate || patient.department) && (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 md:p-5 rounded-lg mb-3 md:mb-5 border-2 border-gray-300 shadow-sm">
                  <h3 className="font-bold mb-3 md:mb-4 text-xs md:text-sm text-gray-800 border-b border-gray-400 pb-1">入院情報</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
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
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 md:p-5 rounded-lg mb-3 md:mb-5 border-2 border-gray-300 shadow-sm">
                  <h3 className="font-bold mb-3 md:mb-4 text-xs md:text-sm text-gray-800 border-b border-gray-400 pb-1">担当医情報</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
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
            </>
          )}

          {/* Visit History Section */}
          {activeView === 'visit-history' && patient.visits && patient.visits.length > 0 && (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 md:p-5 rounded-lg border-2 border-gray-300 shadow-sm">
              <h3 className="font-bold mb-3 md:mb-4 text-xs md:text-sm text-gray-800 border-b border-gray-400 pb-1">来院履歴</h3>
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

          {/* Medical Records Section */}
          {activeView === 'medical-records' && (
            <div className={`${shouldUseTwoColumns && !showPastRecordsOnly ? 'flex gap-4' : ''} ${showPastRecordsOnly ? 'flex-1 flex flex-col min-h-0' : ''}`}>
              {/* Left Column: Summary + Past Records */}
              {(shouldUseTwoColumns || showPastRecordsOnly) && (
                <div className={showPastRecordsOnly ? 'w-full flex-1 flex flex-col min-h-0' : 'w-1/2'}>
                  {/* Summary Section */}
                  {!showPastRecordsOnly && patient.summary && (
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 md:p-5 rounded-lg border-2 border-gray-300 shadow-sm mb-4">
                      <div className="flex items-center justify-between border-b border-gray-400 pb-1 mb-3 md:mb-4">
                        <h3 className="font-bold text-xs md:text-sm text-gray-800">サマリ</h3>
                        <button
                          onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                          className="text-gray-600 hover:text-gray-800 transition-colors p-1 rounded hover:bg-gray-200"
                          aria-label={isSummaryExpanded ? 'サマリを折りたたむ' : 'サマリを展開'}
                          aria-expanded={isSummaryExpanded}
                        >
                          <svg 
                            className={`w-4 h-4 transition-transform ${isSummaryExpanded ? '' : 'rotate-180'}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                      {isSummaryExpanded && (
                        <div className="text-xs md:text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                          {patient.summary}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Past Medical Records */}
                  {patient.medicalRecords && patient.medicalRecords.length > 0 && (
                    <>
                      {!showPastRecordsOnly ? (
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 md:p-5 rounded-lg border-2 border-gray-300 shadow-sm">
                          <h3 className="font-bold mb-3 md:mb-4 text-xs md:text-sm text-gray-800 border-b border-gray-400 pb-1">過去診療録</h3>
                          <div className="space-y-5 max-h-[calc(100vh-400px)] overflow-y-auto">
                            {patient.medicalRecords
                              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                              .map((record) => {
                      const recordDate = new Date(record.date);
                      const dateStr = recordDate.toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'short'
                      });
                      
                      return (
                        <div key={record.id} className="bg-white rounded-lg border-2 border-gray-300 shadow-sm p-3 md:p-5">
                          {/* Record Header */}
                          <div className="mb-3 md:mb-4 pb-2 md:pb-3 border-b-2 border-gray-400">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                              <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded">
                                  【{record.type}】
                                </span>
                                <span className="font-bold text-gray-800">{dateStr}</span>
                                {record.visitType && (
                                  <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                                    {record.visitType}
                                  </span>
                                )}
                                {record.dayOfStay && (
                                  <span className="px-2 py-1 bg-orange-200 text-orange-800 text-xs rounded font-medium">
                                    入院{record.dayOfStay}日目
                                  </span>
                                )}
                              </div>
                              {record.physician && (
                                <span className="text-sm text-gray-600">担当医: {record.physician}</span>
                              )}
                            </div>
                          </div>

                          {/* Vital Signs */}
                          {record.vitalSigns && (
                            <div className="mb-3 md:mb-4 p-2 md:p-3 bg-blue-50 rounded border border-blue-200">
                              <div className="text-xs font-bold text-blue-800 mb-2">バイタルサイン</div>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-xs md:text-sm">
                                {record.vitalSigns.temperature && (
                                  <div>
                                    <span className="text-gray-600">体温:</span>
                                    <span className="ml-1 font-medium text-gray-800">{record.vitalSigns.temperature}</span>
                                  </div>
                                )}
                                {record.vitalSigns.bloodPressure && (
                                  <div>
                                    <span className="text-gray-600">血圧:</span>
                                    <span className="ml-1 font-medium text-gray-800">{record.vitalSigns.bloodPressure}</span>
                                  </div>
                                )}
                                {record.vitalSigns.heartRate && (
                                  <div>
                                    <span className="text-gray-600">心拍数:</span>
                                    <span className="ml-1 font-medium text-gray-800">{record.vitalSigns.heartRate}</span>
                                  </div>
                                )}
                                {record.vitalSigns.spO2 && (
                                  <div>
                                    <span className="text-gray-600">SpO2:</span>
                                    <span className="ml-1 font-medium text-gray-800">{record.vitalSigns.spO2}</span>
                                  </div>
                                )}
                                {record.vitalSigns.oxygenFlow && (
                                  <div>
                                    <span className="text-gray-600">酸素流量:</span>
                                    <span className="ml-1 font-medium text-gray-800">{record.vitalSigns.oxygenFlow}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* SOAP Format */}
                          <div className="space-y-3 md:space-y-4">
                            {record.subjective && (
                              <div>
                                <div className="font-bold text-xs md:text-sm text-gray-700 mb-1.5 flex items-center">
                                  <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs mr-2">S</span>
                                  <span>Subjective (主観的情報)</span>
                                </div>
                                <div className="pl-4 md:pl-8 text-xs md:text-sm text-gray-800 whitespace-pre-line bg-green-50 p-2 md:p-3 rounded border-l-4 border-green-500">
                                  {record.subjective}
                                </div>
                              </div>
                            )}
                            
                            {record.objective && (
                              <div>
                                <div className="font-bold text-xs md:text-sm text-gray-700 mb-1.5 flex items-center">
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs mr-2">O</span>
                                  <span>Objective (客観的情報)</span>
                                </div>
                                <div className="pl-4 md:pl-8 text-xs md:text-sm text-gray-800 whitespace-pre-line bg-blue-50 p-2 md:p-3 rounded border-l-4 border-blue-500">
                                  {record.objective}
                                </div>
                              </div>
                            )}

                            {/* Laboratory Results */}
                            {record.laboratoryResults && Object.keys(record.laboratoryResults).length > 0 && (
                              <div className="pl-4 md:pl-8">
                                <div className="text-xs font-bold text-gray-600 mb-2">検査結果:</div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs bg-gray-50 p-2 rounded">
                                  {Object.entries(record.laboratoryResults).map(([key, value]) => (
                                    <div key={key} className="flex justify-between">
                                      <span className="text-gray-600">{key}:</span>
                                      <span className="font-medium text-gray-800 ml-2">{String(value)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Imaging Results */}
                            {record.imagingResults && (
                              <div className="pl-4 md:pl-8">
                                <div className="text-xs font-bold text-gray-600 mb-1">画像所見:</div>
                                <div className="text-xs md:text-sm text-gray-800 bg-gray-50 p-2 rounded">
                                  {record.imagingResults}
                                </div>
                              </div>
                            )}

                            {record.assessment && (
                              <div>
                                <div className="font-bold text-xs md:text-sm text-gray-700 mb-1.5 flex items-center">
                                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs mr-2">A</span>
                                  <span>Assessment (評価・診断)</span>
                                </div>
                                <div className="pl-4 md:pl-8 text-xs md:text-sm text-gray-800 whitespace-pre-line bg-yellow-50 p-2 md:p-3 rounded border-l-4 border-yellow-500">
                                  {record.assessment}
                                </div>
                              </div>
                            )}

                            {record.plan && (
                              <div>
                                <div className="font-bold text-xs md:text-sm text-gray-700 mb-1.5 flex items-center">
                                  <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs mr-2">P</span>
                                  <span>Plan (治療計画)</span>
                                </div>
                                <div className="pl-4 md:pl-8 text-xs md:text-sm text-gray-800 whitespace-pre-line bg-purple-50 p-2 md:p-3 rounded border-l-4 border-purple-500">
                                  {record.plan}
                                </div>
                              </div>
                            )}

                            {/* Medications */}
                            {record.medications && record.medications.length > 0 && (
                              <div className="pl-4 md:pl-8 mt-3">
                                <div className="text-xs font-bold text-gray-600 mb-2">処方薬:</div>
                                <div className="space-y-2">
                                  {record.medications.map((med, idx) => (
                                    <div key={idx} className="bg-white border border-gray-300 rounded p-2 text-xs md:text-sm">
                                      <div className="font-medium text-gray-800">{med.name}</div>
                                      <div className="text-gray-600 text-xs mt-1">
                                        {med.dosage} / {med.frequency}
                                        {med.duration && ` / ${med.duration}`}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {record.notes && (
                              <div className="pl-4 md:pl-8 mt-3 pt-3 border-t border-gray-300">
                                <div className="text-xs font-bold text-gray-600 mb-1">備考:</div>
                                <div className="text-xs md:text-sm text-gray-700">{record.notes}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-5 flex-1 overflow-y-auto min-h-0 p-3 md:p-6">
                          {patient.medicalRecords
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map((record) => {
                              const recordDate = new Date(record.date);
                              const dateStr = recordDate.toLocaleDateString('ja-JP', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                weekday: 'short'
                              });
                              
                              return (
                                <div key={record.id} className="bg-white rounded-lg border-2 border-gray-300 shadow-sm p-3 md:p-5">
                                  {/* Record Header */}
                                  <div className="mb-3 md:mb-4 pb-2 md:pb-3 border-b-2 border-gray-400">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                      <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded">
                                          【{record.type}】
                                        </span>
                                        <span className="font-bold text-gray-800">{dateStr}</span>
                                        {record.visitType && (
                                          <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                                            {record.visitType}
                                          </span>
                                        )}
                                        {record.dayOfStay && (
                                          <span className="px-2 py-1 bg-orange-200 text-orange-800 text-xs rounded font-medium">
                                            入院{record.dayOfStay}日目
                                          </span>
                                        )}
                                      </div>
                                      {record.physician && (
                                        <span className="text-sm text-gray-600">担当医: {record.physician}</span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Vital Signs */}
                                  {record.vitalSigns && (
                                    <div className="mb-3 md:mb-4 p-2 md:p-3 bg-blue-50 rounded border border-blue-200">
                                      <div className="text-xs font-bold text-blue-800 mb-2">バイタルサイン</div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-xs md:text-sm">
                                        {record.vitalSigns.temperature && (
                                          <div>
                                            <span className="text-gray-600">体温:</span>
                                            <span className="ml-1 font-medium text-gray-800">{record.vitalSigns.temperature}</span>
                                          </div>
                                        )}
                                        {record.vitalSigns.bloodPressure && (
                                          <div>
                                            <span className="text-gray-600">血圧:</span>
                                            <span className="ml-1 font-medium text-gray-800">{record.vitalSigns.bloodPressure}</span>
                                          </div>
                                        )}
                                        {record.vitalSigns.heartRate && (
                                          <div>
                                            <span className="text-gray-600">心拍数:</span>
                                            <span className="ml-1 font-medium text-gray-800">{record.vitalSigns.heartRate}</span>
                                          </div>
                                        )}
                                        {record.vitalSigns.spO2 && (
                                          <div>
                                            <span className="text-gray-600">SpO2:</span>
                                            <span className="ml-1 font-medium text-gray-800">{record.vitalSigns.spO2}</span>
                                          </div>
                                        )}
                                        {record.vitalSigns.oxygenFlow && (
                                          <div>
                                            <span className="text-gray-600">酸素流量:</span>
                                            <span className="ml-1 font-medium text-gray-800">{record.vitalSigns.oxygenFlow}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* SOAP Format */}
                                  <div className="space-y-3 md:space-y-4">
                                    {record.subjective && (
                                      <div>
                                        <div className="font-bold text-xs md:text-sm text-gray-700 mb-1.5 flex items-center">
                                          <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs mr-2">S</span>
                                          <span>Subjective (主観的情報)</span>
                                        </div>
                                        <div className="pl-4 md:pl-8 text-xs md:text-sm text-gray-800 whitespace-pre-line bg-green-50 p-2 md:p-3 rounded border-l-4 border-green-500">
                                          {record.subjective}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {record.objective && (
                                      <div>
                                        <div className="font-bold text-xs md:text-sm text-gray-700 mb-1.5 flex items-center">
                                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs mr-2">O</span>
                                          <span>Objective (客観的情報)</span>
                                        </div>
                                        <div className="pl-4 md:pl-8 text-xs md:text-sm text-gray-800 whitespace-pre-line bg-blue-50 p-2 md:p-3 rounded border-l-4 border-blue-500">
                                          {record.objective}
                                        </div>
                                      </div>
                                    )}

                                    {/* Laboratory Results */}
                                    {record.laboratoryResults && Object.keys(record.laboratoryResults).length > 0 && (
                                      <div className="pl-4 md:pl-8">
                                        <div className="text-xs font-bold text-gray-600 mb-2">検査結果:</div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs bg-gray-50 p-2 rounded">
                                          {Object.entries(record.laboratoryResults).map(([key, value]) => (
                                            <div key={key} className="flex justify-between">
                                              <span className="text-gray-600">{key}:</span>
                                              <span className="font-medium text-gray-800 ml-2">{String(value)}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Imaging Results */}
                                    {record.imagingResults && (
                                      <div className="pl-4 md:pl-8">
                                        <div className="text-xs font-bold text-gray-600 mb-1">画像所見:</div>
                                        <div className="text-xs md:text-sm text-gray-800 bg-gray-50 p-2 rounded">
                                          {record.imagingResults}
                                        </div>
                                      </div>
                                    )}

                                    {record.assessment && (
                                      <div>
                                        <div className="font-bold text-xs md:text-sm text-gray-700 mb-1.5 flex items-center">
                                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs mr-2">A</span>
                                          <span>Assessment (評価・診断)</span>
                                        </div>
                                        <div className="pl-4 md:pl-8 text-xs md:text-sm text-gray-800 whitespace-pre-line bg-yellow-50 p-2 md:p-3 rounded border-l-4 border-yellow-500">
                                          {record.assessment}
                                        </div>
                                      </div>
                                    )}

                                    {record.plan && (
                                      <div>
                                        <div className="font-bold text-xs md:text-sm text-gray-700 mb-1.5 flex items-center">
                                          <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs mr-2">P</span>
                                          <span>Plan (治療計画)</span>
                                        </div>
                                        <div className="pl-4 md:pl-8 text-xs md:text-sm text-gray-800 whitespace-pre-line bg-purple-50 p-2 md:p-3 rounded border-l-4 border-purple-500">
                                          {record.plan}
                                        </div>
                                      </div>
                                    )}

                                    {/* Medications */}
                                    {record.medications && record.medications.length > 0 && (
                                      <div className="pl-4 md:pl-8 mt-3">
                                        <div className="text-xs font-bold text-gray-600 mb-2">処方薬:</div>
                                        <div className="space-y-2">
                                          {record.medications.map((med, idx) => (
                                            <div key={idx} className="bg-white border border-gray-300 rounded p-2 text-xs md:text-sm">
                                              <div className="font-medium text-gray-800">{med.name}</div>
                                              <div className="text-gray-600 text-xs mt-1">
                                                {med.dosage} / {med.frequency}
                                                {med.duration && ` / ${med.duration}`}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {record.notes && (
                                      <div className="pl-4 md:pl-8 mt-3 pt-3 border-t border-gray-300">
                                        <div className="text-xs font-bold text-gray-600 mb-1">備考:</div>
                                        <div className="text-xs md:text-sm text-gray-700">{record.notes}</div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </>
                  )}

                  {/* Show message if no records */}
                  {(!patient.medicalRecords || patient.medicalRecords.length === 0) && (
                    <>
                      {!showPastRecordsOnly ? (
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 md:p-5 rounded-lg border-2 border-gray-300 shadow-sm">
                          <p className="text-xs md:text-sm text-gray-600">診療録がありません。</p>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <p className="text-xs md:text-sm text-gray-600">診療録がありません。</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Right Column: New Medical Record Input Form */}
              {!showPastRecordsOnly && (
              <div className={`${shouldUseTwoColumns ? 'w-1/2' : 'w-full'}`}>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 md:p-5 rounded-lg border-2 border-gray-300 shadow-sm">
                    <h3 className="font-bold mb-3 md:mb-4 text-xs md:text-sm text-gray-800 border-b border-gray-400 pb-1">新規診療録入力</h3>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      // Handle form submission
                      console.log('New record:', newRecord);
                      alert('診療録を保存しました（開発中）');
                      setNewRecord({
                        subjective: '',
                        objective: '',
                        assessment: '',
                        plan: '',
                        notes: ''
                      });
                    }} className="space-y-4">
                      {/* S - Subjective */}
                      <div>
                        <div className="font-bold text-xs md:text-sm text-gray-700 mb-1.5 flex items-center">
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs mr-2">S</span>
                          <span>Subjective (主観的情報)</span>
                        </div>
                        <textarea
                          value={newRecord.subjective}
                          onChange={(e) => setNewRecord({ ...newRecord, subjective: e.target.value })}
                          className="w-full pl-4 md:pl-8 text-xs md:text-sm text-gray-800 bg-green-50 p-2 md:p-3 rounded border-l-4 border-green-500 border-t border-r border-b border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-y min-h-[80px]"
                          placeholder="主観的情報を入力してください"
                        />
                      </div>

                      {/* O - Objective */}
                      <div>
                        <div className="font-bold text-xs md:text-sm text-gray-700 mb-1.5 flex items-center">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs mr-2">O</span>
                          <span>Objective (客観的情報)</span>
                        </div>
                        <textarea
                          value={newRecord.objective}
                          onChange={(e) => setNewRecord({ ...newRecord, objective: e.target.value })}
                          className="w-full pl-4 md:pl-8 text-xs md:text-sm text-gray-800 bg-blue-50 p-2 md:p-3 rounded border-l-4 border-blue-500 border-t border-r border-b border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y min-h-[80px]"
                          placeholder="客観的情報を入力してください"
                        />
                      </div>

                      {/* A - Assessment */}
                      <div>
                        <div className="font-bold text-xs md:text-sm text-gray-700 mb-1.5 flex items-center">
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs mr-2">A</span>
                          <span>Assessment (評価・診断)</span>
                        </div>
                        <textarea
                          value={newRecord.assessment}
                          onChange={(e) => setNewRecord({ ...newRecord, assessment: e.target.value })}
                          className="w-full pl-4 md:pl-8 text-xs md:text-sm text-gray-800 bg-yellow-50 p-2 md:p-3 rounded border-l-4 border-yellow-500 border-t border-r border-b border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-y min-h-[80px]"
                          placeholder="評価・診断を入力してください"
                        />
                      </div>

                      {/* P - Plan */}
                      <div>
                        <div className="font-bold text-xs md:text-sm text-gray-700 mb-1.5 flex items-center">
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs mr-2">P</span>
                          <span>Plan (治療計画)</span>
                        </div>
                        <textarea
                          value={newRecord.plan}
                          onChange={(e) => setNewRecord({ ...newRecord, plan: e.target.value })}
                          className="w-full pl-4 md:pl-8 text-xs md:text-sm text-gray-800 bg-purple-50 p-2 md:p-3 rounded border-l-4 border-purple-500 border-t border-r border-b border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-y min-h-[80px]"
                          placeholder="治療計画を入力してください"
                        />
                      </div>

                      {/* Free Text Area */}
                      <div>
                        <div className="font-bold text-xs md:text-sm text-gray-700 mb-1.5">備考・その他</div>
                        <textarea
                          value={newRecord.notes}
                          onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                          className="w-full text-xs md:text-sm text-gray-800 bg-white p-2 md:p-3 rounded border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y min-h-[100px]"
                          placeholder="備考やその他の情報を自由に入力してください"
                        />
                      </div>

                      {/* Submit Button */}
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setNewRecord({
                            subjective: '',
                            objective: '',
                            assessment: '',
                            plan: '',
                            notes: ''
                          })}
                          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs md:text-sm font-medium transition-colors"
                        >
                          クリア
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs md:text-sm font-medium transition-colors shadow-sm"
                        >
                          保存
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

