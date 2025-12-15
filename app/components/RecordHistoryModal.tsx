'use client';

import { useEffect, useState } from 'react';

interface RecordHistory {
  id: string;
  action: 'create' | 'update' | 'delete';
  previousData: any;
  newData: any;
  changedBy: string | null;
  changedAt: string;
  reason: string | null;
}

interface RecordHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordId: string;
  recordType: 'medical' | 'monitoring';
  patientId: string;
}

export default function RecordHistoryModal({
  isOpen,
  onClose,
  recordId,
  recordType,
  patientId,
}: RecordHistoryModalProps) {
  const [history, setHistory] = useState<RecordHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && recordId) {
      fetchHistory();
    }
  }, [isOpen, recordId]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint =
        recordType === 'medical'
          ? `/api/patients/${patientId}/medical-records/${recordId}/history`
          : `/api/patients/${patientId}/monitoring-records/${recordId}/history`;

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('履歴の取得に失敗しました');
      }
      const data = await response.json();
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '履歴の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'create':
        return '作成';
      case 'update':
        return '編集';
      case 'delete':
        return '削除';
      default:
        return action;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFieldChanges = (previous: any, current: any) => {
    if (!previous && !current) return [];
    if (!previous) return Object.keys(current || {}).map((key) => ({ field: key, old: null, new: current[key] }));
    if (!current) return Object.keys(previous || {}).map((key) => ({ field: key, old: previous[key], new: null }));

    const changes: Array<{ field: string; old: any; new: any }> = [];
    const allKeys = new Set([...Object.keys(previous || {}), ...Object.keys(current || {})]);

    allKeys.forEach((key) => {
      const oldValue = previous[key];
      const newValue = current[key];
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({ field: key, old: oldValue, new: newValue });
      }
    });

    return changes;
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '(なし)';
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-300 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">記録履歴</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="閉じる"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="text-center py-8 text-gray-600">読み込み中...</div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-4 text-red-800 text-sm">
              {error}
            </div>
          )}

          {!loading && !error && history.length === 0 && (
            <div className="text-center py-8 text-gray-600">履歴がありません</div>
          )}

          {!loading && !error && history.length > 0 && (
            <div className="space-y-4">
              {history.map((item) => {
                const changes = getFieldChanges(item.previousData, item.newData);
                return (
                  <div key={item.id} className="border border-gray-300 rounded-lg p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded text-xs font-bold ${getActionColor(item.action)}`}>
                          {getActionLabel(item.action)}
                        </span>
                        <span className="text-sm text-gray-600">{formatDate(item.changedAt)}</span>
                      </div>
                      {item.changedBy && (
                        <span className="text-xs text-gray-500">変更者: {item.changedBy}</span>
                      )}
                    </div>

                    {/* Changes */}
                    {changes.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="text-xs font-bold text-gray-700 mb-2">変更内容:</div>
                        {changes.map((change, idx) => (
                          <div key={idx} className="bg-gray-50 rounded p-3 text-xs">
                            <div className="font-medium text-gray-800 mb-1">{change.field}:</div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <div className="text-gray-600 mb-1">変更前:</div>
                                <div className="bg-red-50 p-2 rounded text-gray-800 break-words">
                                  {formatValue(change.old)}
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-600 mb-1">変更後:</div>
                                <div className="bg-green-50 p-2 rounded text-gray-800 break-words">
                                  {formatValue(change.new)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {item.reason && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-xs font-bold text-gray-700 mb-1">変更理由:</div>
                        <div className="text-xs text-gray-600">{item.reason}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-300 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors text-sm"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}


