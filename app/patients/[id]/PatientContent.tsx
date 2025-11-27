'use client';

import { useState } from 'react';
import { Patient } from '@/types/patient';

interface PatientContentProps {
  patient: Patient;
  age: number;
  bmi: string;
}

export default function PatientContent({ patient, age, bmi }: PatientContentProps) {
  const [activeView, setActiveView] = useState<'medical-records' | 'patient-info' | 'visit-history'>('medical-records');

  return (
    <>
      {/* Left Panel - Record Navigation */}
      <div className="w-64 bg-gradient-to-b from-gray-100 to-gray-150 border-r-2 border-gray-400 overflow-y-auto shadow-inner">
        <div className="p-3">
          <div className="flex flex-wrap gap-1.5 mb-3">
            <button
              onClick={() => setActiveView('medical-records')}
              className={`px-3 py-1.5 rounded text-xs shadow-sm transition-colors ${
                activeView === 'medical-records'
                  ? 'bg-white border-2 border-blue-600 text-blue-700 font-semibold hover:bg-blue-50'
                  : 'bg-gray-200 border border-gray-400 text-gray-700 hover:bg-gray-300'
              }`}
            >
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
            <button
              onClick={() => setActiveView('patient-info')}
              className={`px-3 py-1.5 rounded text-xs shadow-sm transition-colors ${
                activeView === 'patient-info'
                  ? 'bg-white border-2 border-blue-600 text-blue-700 font-semibold hover:bg-blue-50'
                  : 'bg-gray-200 border border-gray-400 text-gray-700 hover:bg-gray-300'
              }`}
            >
              患者情報
            </button>
            <button
              onClick={() => setActiveView('visit-history')}
              className={`px-3 py-1.5 rounded text-xs shadow-sm transition-colors ${
                activeView === 'visit-history'
                  ? 'bg-white border-2 border-blue-600 text-blue-700 font-semibold hover:bg-blue-50'
                  : 'bg-gray-200 border border-gray-400 text-gray-700 hover:bg-gray-300'
              }`}
            >
              来院履歴
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
      <div className="flex-1 bg-white overflow-y-auto p-6">
        <div className="mb-4">
          {/* Patient Information Section */}
          {activeView === 'patient-info' && (
            <>
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
            </>
          )}

          {/* Visit History Section */}
          {activeView === 'visit-history' && patient.visits && patient.visits.length > 0 && (
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

          {/* Medical Records Section */}
          {activeView === 'medical-records' && patient.medicalRecords && patient.medicalRecords.length > 0 && (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-lg border-2 border-gray-300 shadow-sm">
              <h3 className="font-bold mb-4 text-sm text-gray-800 border-b border-gray-400 pb-1">診療録詳細</h3>
              <div className="space-y-5">
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
                      <div key={record.id} className="bg-white rounded-lg border-2 border-gray-300 shadow-sm p-5">
                        {/* Record Header */}
                        <div className="mb-4 pb-3 border-b-2 border-gray-400">
                          <div className="flex items-center justify-between flex-wrap gap-2">
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
                          <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                            <div className="text-xs font-bold text-blue-800 mb-2">バイタルサイン</div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
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
                        <div className="space-y-4">
                          {record.subjective && (
                            <div>
                              <div className="font-bold text-sm text-gray-700 mb-1.5 flex items-center">
                                <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs mr-2">S</span>
                                <span>Subjective (主観的情報)</span>
                              </div>
                              <div className="pl-8 text-sm text-gray-800 whitespace-pre-line bg-green-50 p-3 rounded border-l-4 border-green-500">
                                {record.subjective}
                              </div>
                            </div>
                          )}
                          
                          {record.objective && (
                            <div>
                              <div className="font-bold text-sm text-gray-700 mb-1.5 flex items-center">
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs mr-2">O</span>
                                <span>Objective (客観的情報)</span>
                              </div>
                              <div className="pl-8 text-sm text-gray-800 whitespace-pre-line bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                                {record.objective}
                              </div>
                            </div>
                          )}

                          {/* Laboratory Results */}
                          {record.laboratoryResults && Object.keys(record.laboratoryResults).length > 0 && (
                            <div className="pl-8">
                              <div className="text-xs font-bold text-gray-600 mb-2">検査結果:</div>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs bg-gray-50 p-2 rounded">
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
                            <div className="pl-8">
                              <div className="text-xs font-bold text-gray-600 mb-1">画像所見:</div>
                              <div className="text-sm text-gray-800 bg-gray-50 p-2 rounded">
                                {record.imagingResults}
                              </div>
                            </div>
                          )}

                          {record.assessment && (
                            <div>
                              <div className="font-bold text-sm text-gray-700 mb-1.5 flex items-center">
                                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs mr-2">A</span>
                                <span>Assessment (評価・診断)</span>
                              </div>
                              <div className="pl-8 text-sm text-gray-800 whitespace-pre-line bg-yellow-50 p-3 rounded border-l-4 border-yellow-500">
                                {record.assessment}
                              </div>
                            </div>
                          )}

                          {record.plan && (
                            <div>
                              <div className="font-bold text-sm text-gray-700 mb-1.5 flex items-center">
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs mr-2">P</span>
                                <span>Plan (治療計画)</span>
                              </div>
                              <div className="pl-8 text-sm text-gray-800 whitespace-pre-line bg-purple-50 p-3 rounded border-l-4 border-purple-500">
                                {record.plan}
                              </div>
                            </div>
                          )}

                          {/* Medications */}
                          {record.medications && record.medications.length > 0 && (
                            <div className="pl-8 mt-3">
                              <div className="text-xs font-bold text-gray-600 mb-2">処方薬:</div>
                              <div className="space-y-2">
                                {record.medications.map((med, idx) => (
                                  <div key={idx} className="bg-white border border-gray-300 rounded p-2 text-sm">
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
                            <div className="pl-8 mt-3 pt-3 border-t border-gray-300">
                              <div className="text-xs font-bold text-gray-600 mb-1">備考:</div>
                              <div className="text-sm text-gray-700">{record.notes}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

