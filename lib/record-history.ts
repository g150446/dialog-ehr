import { prisma } from './db';

export type RecordType = 'medical' | 'monitoring';
export type RecordAction = 'create' | 'update' | 'delete';

interface SaveHistoryParams {
  recordType: RecordType;
  recordId: string; // データベースのID
  originalRecordId: string; // recordIdフィールドの値
  action: RecordAction;
  previousData?: any;
  newData?: any;
  changedBy?: string;
  reason?: string;
}

/**
 * 記録の変更履歴を保存する共通関数
 */
export async function saveRecordHistory(params: SaveHistoryParams) {
  const {
    recordType,
    recordId,
    originalRecordId,
    action,
    previousData,
    newData,
    changedBy = 'system',
    reason,
  } = params;

  try {
    await prisma.recordHistory.create({
      data: {
        recordType,
        recordId,
        originalRecordId,
        action,
        previousData: previousData ? JSON.parse(JSON.stringify(previousData)) : null,
        newData: newData ? JSON.parse(JSON.stringify(newData)) : null,
        changedBy,
        reason,
      },
    });
  } catch (error) {
    console.error('Error saving record history:', error);
    // 履歴保存の失敗は記録の操作を妨げないようにする
    // ただし、本番環境では適切なログを記録すべき
  }
}

/**
 * 記録の完全なスナップショットを作成
 */
export function createRecordSnapshot(record: any, recordType: RecordType): any {
  if (recordType === 'medical') {
    return {
      id: record.id,
      recordId: record.recordId,
      patientId: record.patientId,
      date: record.date,
      type: record.type,
      visitType: record.visitType,
      dayOfStay: record.dayOfStay,
      progressNote: record.progressNote,
      vitalSigns: record.vitalSigns,
      laboratoryResults: record.laboratoryResults,
      imagingResults: record.imagingResults,
      medications: record.medications,
      physician: record.physician,
      notes: record.notes,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      deletedAt: record.deletedAt,
    };
  } else if (recordType === 'monitoring') {
    return {
      id: record.id,
      recordId: record.recordId,
      patientId: record.patientId,
      date: record.date,
      temperature: record.temperature,
      systolicBloodPressure: record.systolicBloodPressure,
      diastolicBloodPressure: record.diastolicBloodPressure,
      heartRate: record.heartRate,
      spO2: record.spO2,
      oxygenFlow: record.oxygenFlow,
      weight: record.weight,
      foodIntakeMorning: record.foodIntakeMorning,
      foodIntakeLunch: record.foodIntakeLunch,
      foodIntakeEvening: record.foodIntakeEvening,
      urineOutput: record.urineOutput,
      bowelMovementCount: record.bowelMovementCount,
      urinationCount: record.urinationCount,
      drainOutput: record.drainOutput,
      other: record.other,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      deletedAt: record.deletedAt,
    };
  }
  return record;
}


