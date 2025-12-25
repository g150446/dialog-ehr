'use client';

import { useState, useEffect } from 'react';
import { MedicalRecord } from '@/types/patient';

interface EditMedicalRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: MedicalRecord | null;
  patientId: string;
  onSave: () => void;
}

export default function EditMedicalRecordModal({
  isOpen,
  onClose,
  record,
  patientId,
  onSave,
}: EditMedicalRecordModalProps) {
  const [progressNote, setProgressNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (record) {
      setProgressNote(record.progressNote || '');
    }
  }, [record]);

  const handleSave = async () => {
    if (!record) return;

    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/patients/${patientId}/medical-records/${record.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            progressNote: progressNote,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update record');
      }

      alert('診療録を更新しました。');
      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating record:', error);
      alert('更新に失敗しました。');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-300 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">診療録編集</h2>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
            aria-label="閉じる"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2">
              記録日: {new Date(record.date).toLocaleDateString('ja-JP')}
            </div>
            {record.authorName && (
              <div className="text-sm text-gray-600">
                記載者: {record.authorName}
              </div>
            )}
          </div>

          <div>
            <label className="block font-bold text-sm text-gray-700 mb-2">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs mr-2">
                経過記録
              </span>
              Progress Note
            </label>
            <textarea
              value={progressNote}
              onChange={(e) => setProgressNote(e.target.value)}
              disabled={isSaving}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[300px] disabled:bg-gray-100"
              placeholder="S: 主訴・症状&#10;O: 客観的所見&#10;A: 評価・診断&#10;P: 治療計画"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-300 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors text-sm disabled:opacity-50"
            disabled={isSaving}
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
            disabled={isSaving}
          >
            {isSaving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
