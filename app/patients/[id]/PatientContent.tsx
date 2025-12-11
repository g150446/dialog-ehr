'use client';

import { useState, useEffect } from 'react';
import { Patient, MedicalRecord, MonitoringRecord } from '@/types/patient';
import VitalSignsChart from '@/app/components/VitalSignsChart';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import TextField from '@mui/material/TextField';
import dayjs, { Dayjs } from 'dayjs';

interface PatientContentProps {
  patient: Patient;
  age: number;
  bmi: string;
}

export default function PatientContent({ patient, age, bmi }: PatientContentProps) {
  const [activeView, setActiveView] = useState<'medical-records' | 'patient-info' | 'visit-history' | 'summary'>('medical-records');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [shouldUseTwoColumns, setShouldUseTwoColumns] = useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);
  const [showPastRecordsOnly, setShowPastRecordsOnly] = useState(false);
  const [showMonitoring, setShowMonitoring] = useState(false);
  const [showPastMonitoring, setShowPastMonitoring] = useState(false);
  const [showProgressChart, setShowProgressChart] = useState(false);
  const [isSavingMedicalRecord, setIsSavingMedicalRecord] = useState(false);
  const [isSavingMonitoringRecord, setIsSavingMonitoringRecord] = useState(false);
  
  // Form state for new medical record
  const [newRecord, setNewRecord] = useState({
    progressNote: '',
    vitalSigns: {
      temperature: '',
      bloodPressure: '',
      heartRate: '',
      spO2: '',
      oxygenFlow: ''
    }
  });

  // State for monitoring record inputs
  const [monitoringRecord, setMonitoringRecord] = useState({
    vitalSigns: {
      temperature: '',
      bloodPressure: '',
      heartRate: '',
      spO2: '',
      oxygenFlow: ''
    },
    weight: '',
    foodIntakeMorning: '',
    foodIntakeLunch: '',
    foodIntakeEvening: '',
    urineOutput: '',
    bowelMovementCount: '',
    urinationCount: '',
    drainOutput: '',
    other: ''
  });

  // State for past monitoring record date/time
  const [pastMonitoringDateTime, setPastMonitoringDateTime] = useState({
    date: '',
    time: ''
  });

  // State for summary input (questions/updates)
  const [summaryInput, setSummaryInput] = useState('');

  // Helper function to check if patient is inpatient
  const isInpatient = (patient: Patient): boolean => {
    if (!patient.admissionDate) return false;
    if (!patient.dischargeDate) return true;
    const dischargeDate = new Date(patient.dischargeDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dischargeDate.setHours(0, 0, 0, 0);
    return dischargeDate > today;
  };

  // Calculate day of stay for inpatient records
  const calculateDayOfStay = (admissionDate: string, recordDate: string): number | undefined => {
    if (!admissionDate) return undefined;
    const admission = new Date(admissionDate);
    const record = new Date(recordDate);
    const diffTime = record.getTime() - admission.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays + 1 : undefined;
  };

  // Handle save medical record
  const handleSaveMedicalRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingMedicalRecord(true);

    try {
      const currentDate = new Date().toISOString().split('T')[0];
      const patientIsInpatient = isInpatient(patient);
      const recordType = patientIsInpatient ? '入院診療録' : '外来受診';
      const visitType = patientIsInpatient ? '入院' : '外来';
      
      const dayOfStay = patientIsInpatient && patient.admissionDate
        ? calculateDayOfStay(patient.admissionDate, currentDate)
        : undefined;

      const payload = {
        id: crypto.randomUUID(),
        date: currentDate,
        type: recordType,
        visitType: visitType,
        dayOfStay: dayOfStay,
        progressNote: newRecord.progressNote || null,
        vitalSigns: {
          temperature: newRecord.vitalSigns.temperature || null,
          bloodPressure: newRecord.vitalSigns.bloodPressure || null,
          heartRate: newRecord.vitalSigns.heartRate || null,
          spO2: newRecord.vitalSigns.spO2 || null,
          oxygenFlow: newRecord.vitalSigns.oxygenFlow || null,
        },
      };

      const response = await fetch(`/api/patients/${patient.id}/medical-records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save medical record');
      }

      // Reset form
      setNewRecord({
        progressNote: '',
        vitalSigns: {
          temperature: '',
          bloodPressure: '',
          heartRate: '',
          spO2: '',
          oxygenFlow: ''
        }
      });

      // Reload page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error saving medical record:', error);
      alert('診療録の保存に失敗しました。もう一度お試しください。');
    } finally {
      setIsSavingMedicalRecord(false);
    }
  };

  // Handle save monitoring record
  const handleSaveMonitoringRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingMonitoringRecord(true);

    try {
      let recordDateTime: string;

      // For past monitoring records, use the specified date and time
      if (showPastMonitoring) {
        // Validate date and time are provided
        if (!pastMonitoringDateTime.date || !pastMonitoringDateTime.time) {
          alert('記録日付と記録時間を入力してください。');
          setIsSavingMonitoringRecord(false);
          return;
        }

        // Combine date and time and convert to ISO format
        const dateTimeString = `${pastMonitoringDateTime.date}T${pastMonitoringDateTime.time}:00`;
        const dateTimeObject = new Date(dateTimeString);
        
        // Validate that the date/time is not in the future
        if (dateTimeObject > new Date()) {
          alert('未来の日時は入力できません。');
          setIsSavingMonitoringRecord(false);
          return;
        }
        
        recordDateTime = dateTimeObject.toISOString();
      } else {
        // For new monitoring records, use current timestamp
        recordDateTime = new Date().toISOString();
      }

      const payload = {
        recordId: crypto.randomUUID(),
        date: recordDateTime,
        temperature: monitoringRecord.vitalSigns.temperature || null,
        bloodPressure: monitoringRecord.vitalSigns.bloodPressure || null,
        heartRate: monitoringRecord.vitalSigns.heartRate || null,
        spO2: monitoringRecord.vitalSigns.spO2 || null,
        oxygenFlow: monitoringRecord.vitalSigns.oxygenFlow || null,
        weight: monitoringRecord.weight || null,
        foodIntakeMorning: monitoringRecord.foodIntakeMorning || null,
        foodIntakeLunch: monitoringRecord.foodIntakeLunch || null,
        foodIntakeEvening: monitoringRecord.foodIntakeEvening || null,
        urineOutput: monitoringRecord.urineOutput || null,
        bowelMovementCount: monitoringRecord.bowelMovementCount || null,
        urinationCount: monitoringRecord.urinationCount || null,
        drainOutput: monitoringRecord.drainOutput || null,
        other: monitoringRecord.other || null,
      };

      const response = await fetch(`/api/patients/${patient.id}/monitoring-records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save monitoring record');
      }

      // Reset form
      setMonitoringRecord({
        vitalSigns: {
          temperature: '',
          bloodPressure: '',
          heartRate: '',
          spO2: '',
          oxygenFlow: ''
        },
        weight: '',
        foodIntakeMorning: '',
        foodIntakeLunch: '',
        foodIntakeEvening: '',
        urineOutput: '',
        bowelMovementCount: '',
        urinationCount: '',
        drainOutput: '',
        other: ''
      });

      // Reset past monitoring date/time if applicable
      if (showPastMonitoring) {
        setPastMonitoringDateTime({
          date: '',
          time: ''
        });
      }

      // Reload page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error saving monitoring record:', error);
      alert('モニタリング記録の保存に失敗しました。もう一度お試しください。');
    } finally {
      setIsSavingMonitoringRecord(false);
    }
  };

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

  // Export medical records to JSON file
  const handleExportMedicalRecords = () => {
    if (!patient.medicalRecords || patient.medicalRecords.length === 0) {
      return;
    }

    // Create JSON data with proper formatting
    const jsonData = JSON.stringify(patient.medicalRecords, null, 2);
    
    // Create blob and download
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Use patient name for filename (sanitize for filesystem - preserve Japanese characters)
    // Replace spaces with underscores, remove only problematic filesystem characters
    const sanitizedName = patient.name.replace(/\s+/g, '_').replace(/[<>:"/\\|?*]/g, '');
    link.download = `${sanitizedName}-medical-records.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export summary to JSON file
  const handleExportSummary = () => {
    if (!patient.summary) {
      return;
    }

    // Create JSON object with patient identification and summary data
    const summaryData = {
      patientId: patient.id,
      patientCode: patient.patientCode,
      patientName: patient.name,
      summary: patient.summary,
      exportedAt: new Date().toISOString()
    };

    // Create JSON data with proper formatting
    const jsonData = JSON.stringify(summaryData, null, 2);
    
    // Create blob and download
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Use patient name for filename (sanitize for filesystem - preserve Japanese characters)
    // Replace spaces with underscores, remove only problematic filesystem characters
    const sanitizedName = patient.name.replace(/\s+/g, '_').replace(/[<>:"/\\|?*]/g, '');
    link.download = `${sanitizedName}-summary.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
        <div className="p-3 md:pt-3 md:px-3 md:pb-0">
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
                setShowMonitoring(false);
                setShowPastMonitoring(false);
                setShowProgressChart(false);
                setIsDrawerOpen(false);
              }}
              className={`px-3 py-1.5 rounded text-xs shadow-sm transition-colors ${
                activeView === 'medical-records' && !showPastRecordsOnly && !showMonitoring && !showPastMonitoring && !showProgressChart
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
                setShowMonitoring(false);
                setShowPastMonitoring(false);
                setShowProgressChart(false);
                setIsDrawerOpen(false);
              }}
              className={`px-3 py-1.5 rounded text-xs shadow-sm transition-colors ${
                activeView === 'medical-records' && showPastRecordsOnly && !showMonitoring && !showProgressChart
                  ? 'bg-white border-2 border-blue-600 text-blue-700 font-semibold hover:bg-blue-50'
                  : 'bg-gray-200 border border-gray-400 text-gray-700 hover:bg-gray-300'
              }`}
            >
              過去診療録
            </button>
            <button
              onClick={() => {
                setActiveView('medical-records');
                setShowMonitoring(true);
                setShowPastMonitoring(false);
                setShowPastRecordsOnly(false);
                setShowProgressChart(false);
                setIsDrawerOpen(false);
              }}
              className={`px-3 py-1.5 rounded text-xs shadow-sm transition-colors ${
                activeView === 'medical-records' && showMonitoring && !showPastMonitoring && !showProgressChart
                  ? 'bg-white border-2 border-blue-600 text-blue-700 font-semibold hover:bg-blue-50'
                  : 'bg-gray-200 border border-gray-400 text-gray-700 hover:bg-gray-300'
              }`}
            >
              新規モニタリング記録
            </button>
            <button
              onClick={() => {
                setActiveView('medical-records');
                setShowMonitoring(false);
                setShowPastMonitoring(true);
                setShowPastRecordsOnly(false);
                setShowProgressChart(false);
                setIsDrawerOpen(false);
              }}
              className={`px-3 py-1.5 rounded text-xs shadow-sm transition-colors ${
                activeView === 'medical-records' && showPastMonitoring && !showProgressChart
                  ? 'bg-white border-2 border-blue-600 text-blue-700 font-semibold hover:bg-blue-50'
                  : 'bg-gray-200 border border-gray-400 text-gray-700 hover:bg-gray-300'
              }`}
            >
              過去モニタリング記録
            </button>
            <button
              onClick={() => {
                setActiveView('summary');
                setShowPastRecordsOnly(false);
                setShowMonitoring(false);
                setShowPastMonitoring(false);
                setShowProgressChart(false);
                setIsDrawerOpen(false);
              }}
              className={`px-3 py-1.5 rounded text-xs shadow-sm transition-colors ${
                activeView === 'summary'
                  ? 'bg-white border-2 border-blue-600 text-blue-700 font-semibold hover:bg-blue-50'
                  : 'bg-gray-200 border border-gray-400 text-gray-700 hover:bg-gray-300'
              }`}
            >
              サマリ
            </button>
            <button className="px-3 py-1.5 bg-gray-200 border border-gray-400 rounded text-xs text-gray-700 hover:bg-gray-300 transition-colors">
              カレンダー
            </button>
            <button className="px-3 py-1.5 bg-gray-200 border border-gray-400 rounded text-xs text-gray-700 hover:bg-gray-300 transition-colors">
              指示簿
            </button>
            <button
              onClick={() => {
                setActiveView('medical-records');
                setShowProgressChart(true);
                setShowPastRecordsOnly(false);
                setShowMonitoring(false);
                setShowPastMonitoring(false);
                setIsDrawerOpen(false);
              }}
              className={`px-3 py-1.5 rounded text-xs shadow-sm transition-colors ${
                activeView === 'medical-records' && showProgressChart
                  ? 'bg-white border-2 border-blue-600 text-blue-700 font-semibold hover:bg-blue-50'
                  : 'bg-gray-200 border border-gray-400 text-gray-700 hover:bg-gray-300'
              }`}
            >
              経過表
            </button>
            <button className="px-3 py-1.5 bg-gray-200 border border-gray-400 rounded text-xs text-gray-700 hover:bg-gray-300 transition-colors">
              ワークシート
            </button>
            <button
              onClick={() => {
                setActiveView('patient-info');
                setShowPastRecordsOnly(false);
                setShowMonitoring(false);
                setShowPastMonitoring(false);
                setShowProgressChart(false);
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
                setShowPastRecordsOnly(false);
                setShowMonitoring(false);
                setShowProgressChart(false);
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
            <button
              onClick={() => {
                if (activeView === 'summary' && patient.summary) {
                  handleExportSummary();
                } else if (showPastRecordsOnly && patient.medicalRecords && patient.medicalRecords.length > 0) {
                  handleExportMedicalRecords();
                }
              }}
              disabled={
                !((showPastRecordsOnly && patient.medicalRecords && patient.medicalRecords.length > 0) ||
                  (activeView === 'summary' && patient.summary))
              }
              className={`px-3 py-1.5 rounded text-xs shadow-sm transition-colors ${
                (showPastRecordsOnly && patient.medicalRecords && patient.medicalRecords.length > 0) ||
                (activeView === 'summary' && patient.summary)
                  ? 'bg-white border-2 border-blue-600 text-blue-700 font-semibold hover:bg-blue-50'
                  : 'bg-gray-200 border border-gray-400 text-gray-700 opacity-50 cursor-not-allowed'
              }`}
            >
              エクスポート
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
      <div className={`flex-1 bg-white ${showPastRecordsOnly || (activeView === 'summary' && !shouldUseTwoColumns) ? 'overflow-hidden flex flex-col' : showMonitoring ? 'overflow-y-auto' : 'overflow-y-auto'} ${showPastRecordsOnly || (activeView === 'summary' && !shouldUseTwoColumns) ? 'p-0' : showMonitoring ? 'p-3 md:pt-6 md:px-6 md:pb-0' : 'p-3 md:pt-6 md:px-6 md:pb-0'}`}>
        <div className={showPastRecordsOnly || (activeView === 'summary' && !shouldUseTwoColumns) ? 'flex-1 flex flex-col min-h-0' : showMonitoring ? 'p-0' : activeView === 'summary' && shouldUseTwoColumns ? 'p-3 md:pt-6 md:px-6 md:pb-0' : 'mb-4 p-3 md:pt-6 md:px-6 md:pb-0'}>
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
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 md:p-5 rounded-lg mb-3 md:mb-2 border-2 border-gray-300 shadow-sm">
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
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 md:pt-5 md:px-5 md:pb-2 rounded-lg border-2 border-gray-300 shadow-sm">
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

          {/* Summary View Section */}
          {activeView === 'summary' && (
            <div className={shouldUseTwoColumns ? 'flex gap-4' : 'flex flex-col flex-1 min-h-0'}>
              {/* Landscape Mode: Two Columns */}
              {shouldUseTwoColumns ? (
                <>
                  {/* Left Column: Summary */}
                  <div className="w-1/2 overflow-y-auto">
                    {patient.summary ? (
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 md:pt-5 md:px-5 md:pb-2 rounded-lg border-2 border-gray-300 shadow-sm">
                        <h3 className="font-bold mb-3 md:mb-4 text-xs md:text-sm text-gray-800 border-b border-gray-400 pb-1">サマリ</h3>
                        <div className="text-xs md:text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                          {patient.summary}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 md:pt-5 md:px-5 md:pb-2 rounded-lg border-2 border-gray-300 shadow-sm">
                        <p className="text-xs md:text-sm text-gray-600">サマリがありません。</p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Input Form */}
                  <div className="w-1/2 overflow-y-auto">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 md:pt-5 md:px-5 md:pb-2 rounded-lg border-2 border-gray-300 shadow-sm">
                      <h3 className="font-bold mb-3 md:mb-4 text-xs md:text-sm text-gray-800 border-b border-gray-400 pb-1">サマリへの質問または更新</h3>
                      <div className="space-y-4">
                        <textarea
                          value={summaryInput}
                          onChange={(e) => setSummaryInput(e.target.value)}
                          className="w-full text-xs md:text-sm text-gray-800 bg-white p-2 md:p-3 rounded border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y min-h-[200px]"
                          placeholder="質問または更新内容を入力してください"
                        />
                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => {}}
                            disabled
                            className="px-4 py-2 bg-gray-200 text-gray-500 rounded text-xs md:text-sm font-medium transition-colors cursor-not-allowed opacity-50"
                          >
                            質問
                          </button>
                          <button
                            type="button"
                            onClick={() => {}}
                            disabled
                            className="px-4 py-2 bg-gray-200 text-gray-500 rounded text-xs md:text-sm font-medium transition-colors cursor-not-allowed opacity-50"
                          >
                            更新
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Portrait Mode: Two Scrollable Areas */
                <>
                  {/* Upper Area: Summary */}
                  <div className="flex-1 overflow-y-auto min-h-0 mb-2">
                    {patient.summary ? (
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 md:pt-5 md:px-5 md:pb-2 rounded-lg border-2 border-gray-300 shadow-sm">
                        <h3 className="font-bold mb-3 md:mb-4 text-xs md:text-sm text-gray-800 border-b border-gray-400 pb-1">サマリ</h3>
                        <div className="text-xs md:text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                          {patient.summary}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 md:pt-5 md:px-5 md:pb-2 rounded-lg border-2 border-gray-300 shadow-sm">
                        <p className="text-xs md:text-sm text-gray-600">サマリがありません。</p>
                      </div>
                    )}
                  </div>

                  {/* Lower Area: Input Form */}
                  <div className="flex-1 overflow-y-auto min-h-0">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 md:pt-5 md:px-5 md:pb-2 rounded-lg border-2 border-gray-300 shadow-sm">
                      <h3 className="font-bold mb-3 md:mb-4 text-xs md:text-sm text-gray-800 border-b border-gray-400 pb-1">サマリへの質問または更新</h3>
                      <div className="space-y-4">
                        <textarea
                          value={summaryInput}
                          onChange={(e) => setSummaryInput(e.target.value)}
                          className="w-full text-xs md:text-sm text-gray-800 bg-white p-2 md:p-3 rounded border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y min-h-[200px]"
                          placeholder="質問または更新内容を入力してください"
                        />
                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => {}}
                            disabled
                            className="px-4 py-2 bg-gray-200 text-gray-500 rounded text-xs md:text-sm font-medium transition-colors cursor-not-allowed opacity-50"
                          >
                            質問
                          </button>
                          <button
                            type="button"
                            onClick={() => {}}
                            disabled
                            className="px-4 py-2 bg-gray-200 text-gray-500 rounded text-xs md:text-sm font-medium transition-colors cursor-not-allowed opacity-50"
                          >
                            更新
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Medical Records Section */}
          {activeView === 'medical-records' && (
            <div className={`${shouldUseTwoColumns && !showPastRecordsOnly && !showMonitoring && !showPastMonitoring && !showProgressChart ? 'flex gap-4' : ''} ${shouldUseTwoColumns && (showMonitoring || showPastMonitoring) ? 'flex gap-4' : ''} ${showPastRecordsOnly ? 'flex-1 flex flex-col min-h-0' : ''}`}>
              {/* Progress Chart Section */}
              {showProgressChart && (
                <VitalSignsChart records={patient.monitoringRecords || []} />
              )}

              {/* Left Column: Summary + Past Records */}
              {(shouldUseTwoColumns || showPastRecordsOnly) && !showMonitoring && !showPastMonitoring && !showProgressChart && (
                <div className={showPastRecordsOnly ? 'w-full flex-1 flex flex-col min-h-0' : 'w-1/2'}>
                  {/* Summary Section */}
                  {!showPastRecordsOnly && patient.summary && (
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 md:pt-5 md:px-5 md:pb-2 rounded-lg border-2 border-gray-300 shadow-sm mb-4">
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
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 md:pt-5 md:px-5 md:pb-2 rounded-lg border-2 border-gray-300 shadow-sm">
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

                          {/* Progress Note */}
                          <div className="space-y-3 md:space-y-4">
                            {record.progressNote && (
                              <div>
                                <div className="font-bold text-xs md:text-sm text-gray-700 mb-1.5 flex items-center">
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs mr-2">経過記録</span>
                                  <span>Progress Note</span>
                                </div>
                                <div className="pl-4 md:pl-8 text-xs md:text-sm text-gray-800 whitespace-pre-line bg-blue-50 p-2 md:p-3 rounded border-l-4 border-blue-500">
                                  {record.progressNote}
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
                        <div className="space-y-5 flex-1 overflow-y-auto min-h-0 p-3 md:pt-6 md:px-6 md:pb-0">
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

                                  {/* Progress Note */}
                                  <div className="space-y-3 md:space-y-4">
                                    {record.progressNote && (
                                      <div>
                                        <div className="font-bold text-xs md:text-sm text-gray-700 mb-1.5 flex items-center">
                                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs mr-2">経過記録</span>
                                          <span>Progress Note</span>
                                        </div>
                                        <div className="pl-4 md:pl-8 text-xs md:text-sm text-gray-800 whitespace-pre-line bg-blue-50 p-2 md:p-3 rounded border-l-4 border-blue-500">
                                          {record.progressNote}
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
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 md:pt-5 md:px-5 md:pb-2 rounded-lg border-2 border-gray-300 shadow-sm">
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

              {/* Past Monitoring Records (for monitoring view) */}
              {(showMonitoring || showPastMonitoring) && !showProgressChart && (
                <>
                  {/* Input Forms (portrait) - shown first in portrait mode */}
                  {!shouldUseTwoColumns && showMonitoring && (
                    <div className="w-full mb-4">
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 md:pt-5 md:px-5 md:pb-0 rounded-lg border-2 border-gray-300 shadow-sm">
                        <h3 className="font-bold mb-3 md:mb-4 text-xs md:text-sm text-gray-800 border-b border-gray-400 pb-1">新規モニタリング記録入力</h3>
                        <form onSubmit={handleSaveMonitoringRecord} className="space-y-4">
                          {/* Vital Signs Input */}
                          <div className="mb-3 md:mb-4">
                            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 text-xs md:text-sm">
                              <div>
                                <label className="block text-gray-600 mb-1">体温:</label>
                                <input
                                  type="text"
                                  value={monitoringRecord.vitalSigns.temperature}
                                  onChange={(e) => setMonitoringRecord({
                                    ...monitoringRecord,
                                    vitalSigns: {
                                      ...monitoringRecord.vitalSigns,
                                      temperature: e.target.value
                                    }
                                  })}
                                  className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="℃"
                                />
                              </div>
                              <div>
                                <label className="block text-gray-600 mb-1">血圧:</label>
                                <input
                                  type="text"
                                  value={monitoringRecord.vitalSigns.bloodPressure}
                                  onChange={(e) => setMonitoringRecord({
                                    ...monitoringRecord,
                                    vitalSigns: {
                                      ...monitoringRecord.vitalSigns,
                                      bloodPressure: e.target.value
                                    }
                                  })}
                                  className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="mmHg"
                                />
                              </div>
                              <div>
                                <label className="block text-gray-600 mb-1">心拍数:</label>
                                <input
                                  type="text"
                                  value={monitoringRecord.vitalSigns.heartRate}
                                  onChange={(e) => setMonitoringRecord({
                                    ...monitoringRecord,
                                    vitalSigns: {
                                      ...monitoringRecord.vitalSigns,
                                      heartRate: e.target.value
                                    }
                                  })}
                                  className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="bpm"
                                />
                              </div>
                              <div>
                                <label className="block text-gray-600 mb-1">SpO2:</label>
                                <input
                                  type="text"
                                  value={monitoringRecord.vitalSigns.spO2}
                                  onChange={(e) => setMonitoringRecord({
                                    ...monitoringRecord,
                                    vitalSigns: {
                                      ...monitoringRecord.vitalSigns,
                                      spO2: e.target.value
                                    }
                                  })}
                                  className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="%"
                                />
                              </div>
                              <div>
                                <label className="block text-gray-600 mb-1">酸素流量:</label>
                                <input
                                  type="text"
                                  value={monitoringRecord.vitalSigns.oxygenFlow}
                                  onChange={(e) => setMonitoringRecord({
                                    ...monitoringRecord,
                                    vitalSigns: {
                                      ...monitoringRecord.vitalSigns,
                                      oxygenFlow: e.target.value
                                    }
                                  })}
                                  className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="L/min"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Monitoring Input Fields */}
                          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 text-xs md:text-sm">
                            <div>
                              <label className="block text-gray-600 mb-1">体重:</label>
                              <input
                                type="text"
                                value={monitoringRecord.weight}
                                onChange={(e) => setMonitoringRecord({ ...monitoringRecord, weight: e.target.value })}
                                className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="kg"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-600 mb-1">食事量(朝):</label>
                              <input
                                type="text"
                                value={monitoringRecord.foodIntakeMorning}
                                onChange={(e) => setMonitoringRecord({ ...monitoringRecord, foodIntakeMorning: e.target.value })}
                                className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="割"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-600 mb-1">食事量(昼):</label>
                              <input
                                type="text"
                                value={monitoringRecord.foodIntakeLunch}
                                onChange={(e) => setMonitoringRecord({ ...monitoringRecord, foodIntakeLunch: e.target.value })}
                                className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="割"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-600 mb-1">食事量(夕):</label>
                              <input
                                type="text"
                                value={monitoringRecord.foodIntakeEvening}
                                onChange={(e) => setMonitoringRecord({ ...monitoringRecord, foodIntakeEvening: e.target.value })}
                                className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="割"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-600 mb-1">尿量:</label>
                              <input
                                type="text"
                                value={monitoringRecord.urineOutput}
                                onChange={(e) => setMonitoringRecord({ ...monitoringRecord, urineOutput: e.target.value })}
                                className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="ml"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-600 mb-1">排便回数:</label>
                              <input
                                type="text"
                                value={monitoringRecord.bowelMovementCount}
                                onChange={(e) => setMonitoringRecord({ ...monitoringRecord, bowelMovementCount: e.target.value })}
                                className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="回"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-600 mb-1">排尿回数:</label>
                              <input
                                type="text"
                                value={monitoringRecord.urinationCount}
                                onChange={(e) => setMonitoringRecord({ ...monitoringRecord, urinationCount: e.target.value })}
                                className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="回"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-600 mb-1">ドレーン廃液量:</label>
                              <input
                                type="text"
                                value={monitoringRecord.drainOutput}
                                onChange={(e) => setMonitoringRecord({ ...monitoringRecord, drainOutput: e.target.value })}
                                className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="ml"
                              />
                            </div>
                          </div>
                          <div className="mt-3">
                            <label className="block text-gray-600 mb-1 text-xs md:text-sm">その他:</label>
                            <textarea
                              value={monitoringRecord.other}
                              onChange={(e) => setMonitoringRecord({ ...monitoringRecord, other: e.target.value })}
                              className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y min-h-[100px]"
                              placeholder="その他の情報を入力してください"
                            />
                          </div>

                          {/* Submit Button */}
                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => setMonitoringRecord({
                                vitalSigns: {
                                  temperature: '',
                                  bloodPressure: '',
                                  heartRate: '',
                                  spO2: '',
                                  oxygenFlow: ''
                                },
                                weight: '',
                                foodIntakeMorning: '',
                                foodIntakeLunch: '',
                                foodIntakeEvening: '',
                                urineOutput: '',
                                bowelMovementCount: '',
                                urinationCount: '',
                                drainOutput: '',
                                other: ''
                              })}
                              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs md:text-sm font-medium transition-colors"
                            >
                              クリア
                            </button>
                            <button
                              type="submit"
                              disabled={isSavingMonitoringRecord}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded text-xs md:text-sm font-medium transition-colors shadow-sm"
                            >
                              {isSavingMonitoringRecord ? '保存中...' : '保存'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {!shouldUseTwoColumns && showPastMonitoring && (
                    <div className="w-full mb-4">
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 md:pt-5 md:px-5 md:pb-0 rounded-lg border-2 border-gray-300 shadow-sm">
                        <h3 className="font-bold mb-3 md:mb-4 text-xs md:text-sm text-gray-800 border-b border-gray-400 pb-1">過去モニタリング記録入力</h3>
                        <form onSubmit={handleSaveMonitoringRecord} className="space-y-4">
                          {/* Date and Time Input */}
                          <div className="mb-3 md:mb-4 bg-blue-50 p-3 rounded border border-blue-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs md:text-sm">
                              <div>
                                <label className="block text-gray-700 font-semibold mb-2">記録日付:</label>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                  <DatePicker
                                    value={pastMonitoringDateTime.date ? dayjs(pastMonitoringDateTime.date) : null}
                                    onChange={(newValue: Dayjs | null) => {
                                      setPastMonitoringDateTime({
                                        ...pastMonitoringDateTime,
                                        date: newValue ? newValue.format('YYYY-MM-DD') : ''
                                      });
                                    }}
                                    maxDate={dayjs()}
                                    format="YYYY/MM/DD"
                                    slotProps={{
                                      textField: {
                                        size: 'small',
                                        sx: {
                                          '& .MuiInputBase-root': {
                                            fontSize: '0.875rem',
                                            backgroundColor: 'white',
                                          },
                                          '& .MuiInputBase-input': {
                                            padding: '8px 12px',
                                          }
                                        }
                                      }
                                    }}
                                  />
                                </LocalizationProvider>
                              </div>
                              <div>
                                <label className="block text-gray-700 font-semibold mb-2">記録時間:</label>
                                <input
                                  type="time"
                                  value={pastMonitoringDateTime.time}
                                  onChange={(e) => setPastMonitoringDateTime({
                                    ...pastMonitoringDateTime,
                                    time: e.target.value
                                  })}
                                  className="w-full px-2 py-2 bg-white border border-gray-300 rounded text-gray-800 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Vital Signs Input */}
                          <div className="mb-3 md:mb-4">
                            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 text-xs md:text-sm">
                              <div>
                                <label className="block text-gray-600 mb-1">体温:</label>
                                <input
                                  type="text"
                                  value={monitoringRecord.vitalSigns.temperature}
                                  onChange={(e) => setMonitoringRecord({
                                    ...monitoringRecord,
                                    vitalSigns: {
                                      ...monitoringRecord.vitalSigns,
                                      temperature: e.target.value
                                    }
                                  })}
                                  className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="℃"
                                />
                              </div>
                              <div>
                                <label className="block text-gray-600 mb-1">血圧:</label>
                                <input
                                  type="text"
                                  value={monitoringRecord.vitalSigns.bloodPressure}
                                  onChange={(e) => setMonitoringRecord({
                                    ...monitoringRecord,
                                    vitalSigns: {
                                      ...monitoringRecord.vitalSigns,
                                      bloodPressure: e.target.value
                                    }
                                  })}
                                  className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="mmHg"
                                />
                              </div>
                              <div>
                                <label className="block text-gray-600 mb-1">心拍数:</label>
                                <input
                                  type="text"
                                  value={monitoringRecord.vitalSigns.heartRate}
                                  onChange={(e) => setMonitoringRecord({
                                    ...monitoringRecord,
                                    vitalSigns: {
                                      ...monitoringRecord.vitalSigns,
                                      heartRate: e.target.value
                                    }
                                  })}
                                  className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="bpm"
                                />
                              </div>
                              <div>
                                <label className="block text-gray-600 mb-1">SpO2:</label>
                                <input
                                  type="text"
                                  value={monitoringRecord.vitalSigns.spO2}
                                  onChange={(e) => setMonitoringRecord({
                                    ...monitoringRecord,
                                    vitalSigns: {
                                      ...monitoringRecord.vitalSigns,
                                      spO2: e.target.value
                                    }
                                  })}
                                  className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="%"
                                />
                              </div>
                              <div>
                                <label className="block text-gray-600 mb-1">酸素流量:</label>
                                <input
                                  type="text"
                                  value={monitoringRecord.vitalSigns.oxygenFlow}
                                  onChange={(e) => setMonitoringRecord({
                                    ...monitoringRecord,
                                    vitalSigns: {
                                      ...monitoringRecord.vitalSigns,
                                      oxygenFlow: e.target.value
                                    }
                                  })}
                                  className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="L/min"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Monitoring Input Fields */}
                          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 text-xs md:text-sm">
                            <div>
                              <label className="block text-gray-600 mb-1">体重:</label>
                              <input
                                type="text"
                                value={monitoringRecord.weight}
                                onChange={(e) => setMonitoringRecord({ ...monitoringRecord, weight: e.target.value })}
                                className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="kg"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-600 mb-1">食事量(朝):</label>
                              <input
                                type="text"
                                value={monitoringRecord.foodIntakeMorning}
                                onChange={(e) => setMonitoringRecord({ ...monitoringRecord, foodIntakeMorning: e.target.value })}
                                className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="割"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-600 mb-1">食事量(昼):</label>
                              <input
                                type="text"
                                value={monitoringRecord.foodIntakeLunch}
                                onChange={(e) => setMonitoringRecord({ ...monitoringRecord, foodIntakeLunch: e.target.value })}
                                className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="割"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-600 mb-1">食事量(夕):</label>
                              <input
                                type="text"
                                value={monitoringRecord.foodIntakeEvening}
                                onChange={(e) => setMonitoringRecord({ ...monitoringRecord, foodIntakeEvening: e.target.value })}
                                className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="割"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-600 mb-1">尿量:</label>
                              <input
                                type="text"
                                value={monitoringRecord.urineOutput}
                                onChange={(e) => setMonitoringRecord({ ...monitoringRecord, urineOutput: e.target.value })}
                                className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="ml"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-600 mb-1">排便回数:</label>
                              <input
                                type="text"
                                value={monitoringRecord.bowelMovementCount}
                                onChange={(e) => setMonitoringRecord({ ...monitoringRecord, bowelMovementCount: e.target.value })}
                                className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="回"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-600 mb-1">排尿回数:</label>
                              <input
                                type="text"
                                value={monitoringRecord.urinationCount}
                                onChange={(e) => setMonitoringRecord({ ...monitoringRecord, urinationCount: e.target.value })}
                                className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="回"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-600 mb-1">ドレーン廃液量:</label>
                              <input
                                type="text"
                                value={monitoringRecord.drainOutput}
                                onChange={(e) => setMonitoringRecord({ ...monitoringRecord, drainOutput: e.target.value })}
                                className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="ml"
                              />
                            </div>
                          </div>
                          <div className="mt-3">
                            <label className="block text-gray-600 mb-1 text-xs md:text-sm">その他:</label>
                            <textarea
                              value={monitoringRecord.other}
                              onChange={(e) => setMonitoringRecord({ ...monitoringRecord, other: e.target.value })}
                              className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y min-h-[100px]"
                              placeholder="その他の情報を入力してください"
                            />
                          </div>

                          {/* Submit Button */}
                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setMonitoringRecord({
                                  vitalSigns: {
                                    temperature: '',
                                    bloodPressure: '',
                                    heartRate: '',
                                    spO2: '',
                                    oxygenFlow: ''
                                  },
                                  weight: '',
                                  foodIntakeMorning: '',
                                  foodIntakeLunch: '',
                                  foodIntakeEvening: '',
                                  urineOutput: '',
                                  bowelMovementCount: '',
                                  urinationCount: '',
                                  drainOutput: '',
                                  other: ''
                                });
                                setPastMonitoringDateTime({
                                  date: '',
                                  time: ''
                                });
                              }}
                              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs md:text-sm font-medium transition-colors"
                            >
                              クリア
                            </button>
                            <button
                              type="submit"
                              disabled={isSavingMonitoringRecord}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded text-xs md:text-sm font-medium transition-colors shadow-sm"
                            >
                              {isSavingMonitoringRecord ? '保存中...' : '保存'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Left Column: Past Monitoring Records (landscape) */}
                  {shouldUseTwoColumns && (
                    <div className="w-1/2 overflow-y-auto">
                      {/* Past Monitoring Records */}
                      {patient.monitoringRecords && patient.monitoringRecords.length > 0 ? (
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 md:pt-5 md:px-5 md:pb-2 rounded-lg border-2 border-gray-300 shadow-sm">
                          <h3 className="font-bold mb-3 md:mb-4 text-xs md:text-sm text-gray-800 border-b border-gray-400 pb-1">過去のモニタリング記録</h3>
                      <div className="space-y-5 max-h-[calc(100vh-400px)] overflow-y-auto">
                        {patient.monitoringRecords
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((record) => {
                            const recordDate = new Date(record.date);
                            const dateStr = recordDate.toLocaleDateString('ja-JP', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              weekday: 'short'
                            });
                            const timeStr = recordDate.toLocaleTimeString('ja-JP', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false
                            });
                            
                            return (
                              <div key={record.id} className="bg-white rounded-lg border-2 border-gray-300 shadow-sm p-3 md:p-5">
                                {/* Record Header */}
                                <div className="mb-3 md:mb-4 pb-2 md:pb-3 border-b-2 border-gray-400">
                                  <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded">
                                      【モニタリング記録】
                                    </span>
                                    <span className="font-bold text-gray-800">{dateStr} {timeStr}</span>
                                  </div>
                                </div>

                                {/* Monitoring Data */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
                                  {/* Vital Signs */}
                                  {record.temperature && (
                                    <div>
                                      <span className="text-gray-600">体温:</span>
                                      <span className="ml-1 font-medium text-gray-800">{record.temperature}°C</span>
                                    </div>
                                  )}
                                  {record.bloodPressure && (
                                    <div>
                                      <span className="text-gray-600">血圧:</span>
                                      <span className="ml-1 font-medium text-gray-800">{record.bloodPressure}mmHg</span>
                                    </div>
                                  )}
                                  {record.heartRate && (
                                    <div>
                                      <span className="text-gray-600">心拍数:</span>
                                      <span className="ml-1 font-medium text-gray-800">{record.heartRate}bpm</span>
                                    </div>
                                  )}
                                  {record.spO2 && (
                                    <div>
                                      <span className="text-gray-600">SpO2:</span>
                                      <span className="ml-1 font-medium text-gray-800">{record.spO2}%</span>
                                    </div>
                                  )}
                                  {record.oxygenFlow && (
                                    <div>
                                      <span className="text-gray-600">酸素流量:</span>
                                      <span className="ml-1 font-medium text-gray-800">{record.oxygenFlow}L/min</span>
                                    </div>
                                  )}
                                  {/* Other Monitoring Data */}
                                  {record.weight && (
                                    <div>
                                      <span className="text-gray-600">体重:</span>
                                      <span className="ml-1 font-medium text-gray-800">{record.weight}kg</span>
                                    </div>
                                  )}
                                  {record.foodIntakeMorning && (
                                    <div>
                                      <span className="text-gray-600">食事量(朝):</span>
                                      <span className="ml-1 font-medium text-gray-800">{record.foodIntakeMorning}</span>
                                    </div>
                                  )}
                                  {record.foodIntakeLunch && (
                                    <div>
                                      <span className="text-gray-600">食事量(昼):</span>
                                      <span className="ml-1 font-medium text-gray-800">{record.foodIntakeLunch}</span>
                                    </div>
                                  )}
                                  {record.foodIntakeEvening && (
                                    <div>
                                      <span className="text-gray-600">食事量(夕):</span>
                                      <span className="ml-1 font-medium text-gray-800">{record.foodIntakeEvening}</span>
                                    </div>
                                  )}
                                  {record.urineOutput && (
                                    <div>
                                      <span className="text-gray-600">尿量:</span>
                                      <span className="ml-1 font-medium text-gray-800">{record.urineOutput}ml</span>
                                    </div>
                                  )}
                                  {record.bowelMovementCount && (
                                    <div>
                                      <span className="text-gray-600">排便回数:</span>
                                      <span className="ml-1 font-medium text-gray-800">{record.bowelMovementCount}回</span>
                                    </div>
                                  )}
                                  {record.urinationCount && (
                                    <div>
                                      <span className="text-gray-600">排尿回数:</span>
                                      <span className="ml-1 font-medium text-gray-800">{record.urinationCount}回</span>
                                    </div>
                                  )}
                                  {record.drainOutput && (
                                    <div>
                                      <span className="text-gray-600">ドレーン廃液量:</span>
                                      <span className="ml-1 font-medium text-gray-800">{record.drainOutput}ml</span>
                                    </div>
                                  )}
                                </div>

                                {/* Other Notes */}
                                {record.other && (
                                  <div className="mt-3 md:mt-4 pt-3 border-t border-gray-300">
                                    <div className="text-xs font-bold text-gray-600 mb-1">その他:</div>
                                    <div className="text-xs md:text-sm text-gray-700 whitespace-pre-line">{record.other}</div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 md:pt-5 md:px-5 md:pb-2 rounded-lg border-2 border-gray-300 shadow-sm">
                      <p className="text-xs md:text-sm text-gray-600">過去のモニタリング記録はありません。</p>
                    </div>
                  )}
                    </div>
                  )}

                  {/* Past Monitoring Records (portrait) - shown after input forms */}
                  {!shouldUseTwoColumns && (
                    <div className="w-full">
                      {/* Past Monitoring Records */}
                      {patient.monitoringRecords && patient.monitoringRecords.length > 0 ? (
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 md:pt-5 md:px-5 md:pb-2 rounded-lg border-2 border-gray-300 shadow-sm">
                          <h3 className="font-bold mb-3 md:mb-4 text-xs md:text-sm text-gray-800 border-b border-gray-400 pb-1">過去のモニタリング記録</h3>
                          <div className="space-y-5 max-h-[calc(100vh-400px)] overflow-y-auto">
                            {patient.monitoringRecords
                              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                              .map((record) => {
                                const recordDate = new Date(record.date);
                                const dateStr = recordDate.toLocaleDateString('ja-JP', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  weekday: 'short'
                                });
                                const timeStr = recordDate.toLocaleTimeString('ja-JP', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: false
                                });
                                
                                return (
                                  <div key={record.id} className="bg-white rounded-lg border-2 border-gray-300 shadow-sm p-3 md:p-5">
                                    {/* Record Header */}
                                    <div className="mb-3 md:mb-4 pb-2 md:pb-3 border-b-2 border-gray-400">
                                      <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded">
                                          【モニタリング記録】
                                        </span>
                                        <span className="font-bold text-gray-800">{dateStr} {timeStr}</span>
                                      </div>
                                    </div>

                                    {/* Monitoring Data */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
                                      {/* Vital Signs */}
                                      {record.temperature && (
                                        <div>
                                          <span className="text-gray-600">体温:</span>
                                          <span className="ml-1 font-medium text-gray-800">{record.temperature}°C</span>
                                        </div>
                                      )}
                                      {record.bloodPressure && (
                                        <div>
                                          <span className="text-gray-600">血圧:</span>
                                          <span className="ml-1 font-medium text-gray-800">{record.bloodPressure}mmHg</span>
                                        </div>
                                      )}
                                      {record.heartRate && (
                                        <div>
                                          <span className="text-gray-600">心拍数:</span>
                                          <span className="ml-1 font-medium text-gray-800">{record.heartRate}bpm</span>
                                        </div>
                                      )}
                                      {record.spO2 && (
                                        <div>
                                          <span className="text-gray-600">SpO2:</span>
                                          <span className="ml-1 font-medium text-gray-800">{record.spO2}%</span>
                                        </div>
                                      )}
                                      {record.oxygenFlow && (
                                        <div>
                                          <span className="text-gray-600">酸素流量:</span>
                                          <span className="ml-1 font-medium text-gray-800">{record.oxygenFlow}L/min</span>
                                        </div>
                                      )}
                                      {/* Other Monitoring Data */}
                                      {record.weight && (
                                        <div>
                                          <span className="text-gray-600">体重:</span>
                                          <span className="ml-1 font-medium text-gray-800">{record.weight}kg</span>
                                        </div>
                                      )}
                                      {record.foodIntakeMorning && (
                                        <div>
                                          <span className="text-gray-600">食事量(朝):</span>
                                          <span className="ml-1 font-medium text-gray-800">{record.foodIntakeMorning}</span>
                                        </div>
                                      )}
                                      {record.foodIntakeLunch && (
                                        <div>
                                          <span className="text-gray-600">食事量(昼):</span>
                                          <span className="ml-1 font-medium text-gray-800">{record.foodIntakeLunch}</span>
                                        </div>
                                      )}
                                      {record.foodIntakeEvening && (
                                        <div>
                                          <span className="text-gray-600">食事量(夕):</span>
                                          <span className="ml-1 font-medium text-gray-800">{record.foodIntakeEvening}</span>
                                        </div>
                                      )}
                                      {record.urineOutput && (
                                        <div>
                                          <span className="text-gray-600">尿量:</span>
                                          <span className="ml-1 font-medium text-gray-800">{record.urineOutput}ml</span>
                                        </div>
                                      )}
                                      {record.bowelMovementCount && (
                                        <div>
                                          <span className="text-gray-600">排便回数:</span>
                                          <span className="ml-1 font-medium text-gray-800">{record.bowelMovementCount}回</span>
                                        </div>
                                      )}
                                      {record.urinationCount && (
                                        <div>
                                          <span className="text-gray-600">排尿回数:</span>
                                          <span className="ml-1 font-medium text-gray-800">{record.urinationCount}回</span>
                                        </div>
                                      )}
                                      {record.drainOutput && (
                                        <div>
                                          <span className="text-gray-600">ドレーン廃液量:</span>
                                          <span className="ml-1 font-medium text-gray-800">{record.drainOutput}ml</span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Other Notes */}
                                    {record.other && (
                                      <div className="mt-3 md:mt-4 pt-3 border-t border-gray-300">
                                        <div className="text-xs font-bold text-gray-600 mb-1">その他:</div>
                                        <div className="text-xs md:text-sm text-gray-700 whitespace-pre-line">{record.other}</div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 md:pt-5 md:px-5 md:pb-2 rounded-lg border-2 border-gray-300 shadow-sm">
                          <p className="text-xs md:text-sm text-gray-600">過去のモニタリング記録はありません。</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Right Column: New Medical Record Input Form */}
              {!showPastRecordsOnly && !showMonitoring && !showPastMonitoring && !showProgressChart && (
              <div className={`${shouldUseTwoColumns ? 'w-1/2' : 'w-full'}`}>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 md:pt-5 md:px-5 md:pb-0 rounded-lg border-2 border-gray-300 shadow-sm">
                    <h3 className="font-bold mb-3 md:mb-4 text-xs md:text-sm text-gray-800 border-b border-gray-400 pb-1">新規診療録入力</h3>
                    <form onSubmit={handleSaveMedicalRecord} className="space-y-4">
                      {/* Vital Signs Input */}
                      <div className="mb-3 md:mb-4 p-2 md:p-3 bg-blue-50 rounded border border-blue-200">
                        <div className="text-xs font-bold text-blue-800 mb-2">バイタルサイン</div>
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 text-xs md:text-sm">
                          <div>
                            <label className="block text-gray-600 mb-1">体温:</label>
                            <input
                              type="text"
                              value={newRecord.vitalSigns.temperature}
                              onChange={(e) => setNewRecord({
                                ...newRecord,
                                vitalSigns: {
                                  ...newRecord.vitalSigns,
                                  temperature: e.target.value
                                }
                              })}
                              className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="℃"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-600 mb-1">血圧:</label>
                            <input
                              type="text"
                              value={newRecord.vitalSigns.bloodPressure}
                              onChange={(e) => setNewRecord({
                                ...newRecord,
                                vitalSigns: {
                                  ...newRecord.vitalSigns,
                                  bloodPressure: e.target.value
                                }
                              })}
                              className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="mmHg"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-600 mb-1">心拍数:</label>
                            <input
                              type="text"
                              value={newRecord.vitalSigns.heartRate}
                              onChange={(e) => setNewRecord({
                                ...newRecord,
                                vitalSigns: {
                                  ...newRecord.vitalSigns,
                                  heartRate: e.target.value
                                }
                              })}
                              className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="bpm"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-600 mb-1">SpO2:</label>
                            <input
                              type="text"
                              value={newRecord.vitalSigns.spO2}
                              onChange={(e) => setNewRecord({
                                ...newRecord,
                                vitalSigns: {
                                  ...newRecord.vitalSigns,
                                  spO2: e.target.value
                                }
                              })}
                              className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="%"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-600 mb-1">酸素流量:</label>
                            <input
                              type="text"
                              value={newRecord.vitalSigns.oxygenFlow}
                              onChange={(e) => setNewRecord({
                                ...newRecord,
                                vitalSigns: {
                                  ...newRecord.vitalSigns,
                                  oxygenFlow: e.target.value
                                }
                              })}
                              className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="L/min"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Progress Note */}
                      <div>
                        <div className="font-bold text-xs md:text-sm text-gray-700 mb-1.5 flex items-center">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs mr-2">経過記録</span>
                          <span>Progress Note</span>
                        </div>
                        <textarea
                          value={newRecord.progressNote}
                          onChange={(e) => setNewRecord({ ...newRecord, progressNote: e.target.value })}
                          className="w-full pl-4 md:pl-8 text-xs md:text-sm text-gray-800 bg-blue-50 p-2 md:p-3 rounded border-l-4 border-blue-500 border-t border-r border-b border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y min-h-[150px] md:min-h-[300px]"
                        />
                      </div>

                      {/* Submit Button */}
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setNewRecord({
                            progressNote: '',
                            vitalSigns: {
                              temperature: '',
                              bloodPressure: '',
                              heartRate: '',
                              spO2: '',
                              oxygenFlow: ''
                            }
                          })}
                          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs md:text-sm font-medium transition-colors"
                        >
                          クリア
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingMedicalRecord}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded text-xs md:text-sm font-medium transition-colors shadow-sm"
                        >
                          {isSavingMedicalRecord ? '保存中...' : '保存'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Monitoring Record Input Form (landscape only) */}
              {showMonitoring && !showProgressChart && shouldUseTwoColumns && (
                <div className="w-1/2">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 md:pt-5 md:px-5 md:pb-0 rounded-lg border-2 border-gray-300 shadow-sm">
                    <h3 className="font-bold mb-3 md:mb-4 text-xs md:text-sm text-gray-800 border-b border-gray-400 pb-1">新規モニタリング記録入力</h3>
                    <form onSubmit={handleSaveMonitoringRecord} className="space-y-4">
                      {/* Vital Signs Input */}
                      <div className="mb-3 md:mb-4">
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 text-xs md:text-sm">
                          <div>
                            <label className="block text-gray-600 mb-1">体温:</label>
                            <input
                              type="text"
                              value={monitoringRecord.vitalSigns.temperature}
                              onChange={(e) => setMonitoringRecord({
                                ...monitoringRecord,
                                vitalSigns: {
                                  ...monitoringRecord.vitalSigns,
                                  temperature: e.target.value
                                }
                              })}
                              className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="℃"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-600 mb-1">血圧:</label>
                            <input
                              type="text"
                              value={monitoringRecord.vitalSigns.bloodPressure}
                              onChange={(e) => setMonitoringRecord({
                                ...monitoringRecord,
                                vitalSigns: {
                                  ...monitoringRecord.vitalSigns,
                                  bloodPressure: e.target.value
                                }
                              })}
                              className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="mmHg"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-600 mb-1">心拍数:</label>
                            <input
                              type="text"
                              value={monitoringRecord.vitalSigns.heartRate}
                              onChange={(e) => setMonitoringRecord({
                                ...monitoringRecord,
                                vitalSigns: {
                                  ...monitoringRecord.vitalSigns,
                                  heartRate: e.target.value
                                }
                              })}
                              className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="bpm"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-600 mb-1">SpO2:</label>
                            <input
                              type="text"
                              value={monitoringRecord.vitalSigns.spO2}
                              onChange={(e) => setMonitoringRecord({
                                ...monitoringRecord,
                                vitalSigns: {
                                  ...monitoringRecord.vitalSigns,
                                  spO2: e.target.value
                                }
                              })}
                              className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="%"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-600 mb-1">酸素流量:</label>
                            <input
                              type="text"
                              value={monitoringRecord.vitalSigns.oxygenFlow}
                              onChange={(e) => setMonitoringRecord({
                                ...monitoringRecord,
                                vitalSigns: {
                                  ...monitoringRecord.vitalSigns,
                                  oxygenFlow: e.target.value
                                }
                              })}
                              className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="L/min"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Monitoring Input Fields */}
                      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 text-xs md:text-sm">
                        <div>
                          <label className="block text-gray-600 mb-1">体重:</label>
                          <input
                            type="text"
                            value={monitoringRecord.weight}
                            onChange={(e) => setMonitoringRecord({ ...monitoringRecord, weight: e.target.value })}
                            className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="kg"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 mb-1">食事量(朝):</label>
                          <input
                            type="text"
                            value={monitoringRecord.foodIntakeMorning}
                            onChange={(e) => setMonitoringRecord({ ...monitoringRecord, foodIntakeMorning: e.target.value })}
                            className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="割"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 mb-1">食事量(昼):</label>
                          <input
                            type="text"
                            value={monitoringRecord.foodIntakeLunch}
                            onChange={(e) => setMonitoringRecord({ ...monitoringRecord, foodIntakeLunch: e.target.value })}
                            className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="割"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 mb-1">食事量(夕):</label>
                          <input
                            type="text"
                            value={monitoringRecord.foodIntakeEvening}
                            onChange={(e) => setMonitoringRecord({ ...monitoringRecord, foodIntakeEvening: e.target.value })}
                            className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="割"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 mb-1">尿量:</label>
                          <input
                            type="text"
                            value={monitoringRecord.urineOutput}
                            onChange={(e) => setMonitoringRecord({ ...monitoringRecord, urineOutput: e.target.value })}
                            className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="ml"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 mb-1">排便回数:</label>
                          <input
                            type="text"
                            value={monitoringRecord.bowelMovementCount}
                            onChange={(e) => setMonitoringRecord({ ...monitoringRecord, bowelMovementCount: e.target.value })}
                            className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="回"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 mb-1">排尿回数:</label>
                          <input
                            type="text"
                            value={monitoringRecord.urinationCount}
                            onChange={(e) => setMonitoringRecord({ ...monitoringRecord, urinationCount: e.target.value })}
                            className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="回"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 mb-1">ドレーン廃液量:</label>
                          <input
                            type="text"
                            value={monitoringRecord.drainOutput}
                            onChange={(e) => setMonitoringRecord({ ...monitoringRecord, drainOutput: e.target.value })}
                            className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="ml"
                          />
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="block text-gray-600 mb-1 text-xs md:text-sm">その他:</label>
                        <textarea
                          value={monitoringRecord.other}
                          onChange={(e) => setMonitoringRecord({ ...monitoringRecord, other: e.target.value })}
                          className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y min-h-[100px]"
                          placeholder="その他の情報を入力してください"
                        />
                      </div>

                      {/* Submit Button */}
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setMonitoringRecord({
                            vitalSigns: {
                              temperature: '',
                              bloodPressure: '',
                              heartRate: '',
                              spO2: '',
                              oxygenFlow: ''
                            },
                            weight: '',
                            foodIntakeMorning: '',
                            foodIntakeLunch: '',
                            foodIntakeEvening: '',
                            urineOutput: '',
                            bowelMovementCount: '',
                            urinationCount: '',
                            drainOutput: '',
                            other: ''
                          })}
                          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs md:text-sm font-medium transition-colors"
                        >
                          クリア
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingMonitoringRecord}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded text-xs md:text-sm font-medium transition-colors shadow-sm"
                        >
                          {isSavingMonitoringRecord ? '保存中...' : '保存'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Past Monitoring Record Input Form (landscape only) */}
              {showPastMonitoring && !showProgressChart && shouldUseTwoColumns && (
                <div className="w-1/2">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 md:pt-5 md:px-5 md:pb-0 rounded-lg border-2 border-gray-300 shadow-sm">
                    <h3 className="font-bold mb-3 md:mb-4 text-xs md:text-sm text-gray-800 border-b border-gray-400 pb-1">過去モニタリング記録入力</h3>
                    <form onSubmit={handleSaveMonitoringRecord} className="space-y-4">
                      {/* Date and Time Input */}
                      <div className="mb-3 md:mb-4 bg-blue-50 p-3 rounded border border-blue-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs md:text-sm">
                          <div>
                            <label className="block text-gray-700 font-semibold mb-2">記録日付:</label>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <DatePicker
                                value={pastMonitoringDateTime.date ? dayjs(pastMonitoringDateTime.date) : null}
                                onChange={(newValue: Dayjs | null) => {
                                  setPastMonitoringDateTime({
                                    ...pastMonitoringDateTime,
                                    date: newValue ? newValue.format('YYYY-MM-DD') : ''
                                  });
                                }}
                                maxDate={dayjs()}
                                format="YYYY/MM/DD"
                                slotProps={{
                                  textField: {
                                    size: 'small',
                                    sx: {
                                      '& .MuiInputBase-root': {
                                        fontSize: '0.875rem',
                                        backgroundColor: 'white',
                                      },
                                      '& .MuiInputBase-input': {
                                        padding: '8px 12px',
                                      }
                                    }
                                  }
                                }}
                              />
                            </LocalizationProvider>
                          </div>
                          <div>
                            <label className="block text-gray-700 font-semibold mb-2">記録時間:</label>
                            <input
                              type="time"
                              value={pastMonitoringDateTime.time}
                              onChange={(e) => setPastMonitoringDateTime({
                                ...pastMonitoringDateTime,
                                time: e.target.value
                              })}
                              className="w-full px-2 py-2 bg-white border border-gray-300 rounded text-gray-800 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Vital Signs Input */}
                      <div className="mb-3 md:mb-4">
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 text-xs md:text-sm">
                          <div>
                            <label className="block text-gray-600 mb-1">体温:</label>
                            <input
                              type="text"
                              value={monitoringRecord.vitalSigns.temperature}
                              onChange={(e) => setMonitoringRecord({
                                ...monitoringRecord,
                                vitalSigns: {
                                  ...monitoringRecord.vitalSigns,
                                  temperature: e.target.value
                                }
                              })}
                              className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="℃"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-600 mb-1">血圧:</label>
                            <input
                              type="text"
                              value={monitoringRecord.vitalSigns.bloodPressure}
                              onChange={(e) => setMonitoringRecord({
                                ...monitoringRecord,
                                vitalSigns: {
                                  ...monitoringRecord.vitalSigns,
                                  bloodPressure: e.target.value
                                }
                              })}
                              className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="mmHg"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-600 mb-1">心拍数:</label>
                            <input
                              type="text"
                              value={monitoringRecord.vitalSigns.heartRate}
                              onChange={(e) => setMonitoringRecord({
                                ...monitoringRecord,
                                vitalSigns: {
                                  ...monitoringRecord.vitalSigns,
                                  heartRate: e.target.value
                                }
                              })}
                              className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="bpm"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-600 mb-1">SpO2:</label>
                            <input
                              type="text"
                              value={monitoringRecord.vitalSigns.spO2}
                              onChange={(e) => setMonitoringRecord({
                                ...monitoringRecord,
                                vitalSigns: {
                                  ...monitoringRecord.vitalSigns,
                                  spO2: e.target.value
                                }
                              })}
                              className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="%"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-600 mb-1">酸素流量:</label>
                            <input
                              type="text"
                              value={monitoringRecord.vitalSigns.oxygenFlow}
                              onChange={(e) => setMonitoringRecord({
                                ...monitoringRecord,
                                vitalSigns: {
                                  ...monitoringRecord.vitalSigns,
                                  oxygenFlow: e.target.value
                                }
                              })}
                              className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="L/min"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Monitoring Input Fields */}
                      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 text-xs md:text-sm">
                        <div>
                          <label className="block text-gray-600 mb-1">体重:</label>
                          <input
                            type="text"
                            value={monitoringRecord.weight}
                            onChange={(e) => setMonitoringRecord({ ...monitoringRecord, weight: e.target.value })}
                            className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="kg"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 mb-1">食事量(朝):</label>
                          <input
                            type="text"
                            value={monitoringRecord.foodIntakeMorning}
                            onChange={(e) => setMonitoringRecord({ ...monitoringRecord, foodIntakeMorning: e.target.value })}
                            className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="割"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 mb-1">食事量(昼):</label>
                          <input
                            type="text"
                            value={monitoringRecord.foodIntakeLunch}
                            onChange={(e) => setMonitoringRecord({ ...monitoringRecord, foodIntakeLunch: e.target.value })}
                            className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="割"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 mb-1">食事量(夕):</label>
                          <input
                            type="text"
                            value={monitoringRecord.foodIntakeEvening}
                            onChange={(e) => setMonitoringRecord({ ...monitoringRecord, foodIntakeEvening: e.target.value })}
                            className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="割"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 mb-1">尿量:</label>
                          <input
                            type="text"
                            value={monitoringRecord.urineOutput}
                            onChange={(e) => setMonitoringRecord({ ...monitoringRecord, urineOutput: e.target.value })}
                            className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="ml"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 mb-1">排便回数:</label>
                          <input
                            type="text"
                            value={monitoringRecord.bowelMovementCount}
                            onChange={(e) => setMonitoringRecord({ ...monitoringRecord, bowelMovementCount: e.target.value })}
                            className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="回"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 mb-1">排尿回数:</label>
                          <input
                            type="text"
                            value={monitoringRecord.urinationCount}
                            onChange={(e) => setMonitoringRecord({ ...monitoringRecord, urinationCount: e.target.value })}
                            className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="回"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 mb-1">ドレーン廃液量:</label>
                          <input
                            type="text"
                            value={monitoringRecord.drainOutput}
                            onChange={(e) => setMonitoringRecord({ ...monitoringRecord, drainOutput: e.target.value })}
                            className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="ml"
                          />
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="block text-gray-600 mb-1 text-xs md:text-sm">その他:</label>
                        <textarea
                          value={monitoringRecord.other}
                          onChange={(e) => setMonitoringRecord({ ...monitoringRecord, other: e.target.value })}
                          className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y min-h-[100px]"
                          placeholder="その他の情報を入力してください"
                        />
                      </div>

                      {/* Submit Button */}
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setMonitoringRecord({
                              vitalSigns: {
                                temperature: '',
                                bloodPressure: '',
                                heartRate: '',
                                spO2: '',
                                oxygenFlow: ''
                              },
                              weight: '',
                              foodIntakeMorning: '',
                              foodIntakeLunch: '',
                              foodIntakeEvening: '',
                              urineOutput: '',
                              bowelMovementCount: '',
                              urinationCount: '',
                              drainOutput: '',
                              other: ''
                            });
                            setPastMonitoringDateTime({
                              date: '',
                              time: ''
                            });
                          }}
                          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs md:text-sm font-medium transition-colors"
                        >
                          クリア
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingMonitoringRecord}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded text-xs md:text-sm font-medium transition-colors shadow-sm"
                        >
                          {isSavingMonitoringRecord ? '保存中...' : '保存'}
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


