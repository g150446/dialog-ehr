export interface Patient {
  id: string;
  patientCode: string;
  name: string;
  nameKana?: string;
  gender: '男' | '女' | 'Male' | 'Female';
  dateOfBirth: string;
  age: number;
  medicalRecordNumber: string;
  
  // Contact Information
  phone?: string;
  email?: string;
  address?: string;
  
  // Medical Information
  bloodType?: string;
  allergies?: string[];
  conditions?: string[];
  height?: number; // cm
  weight?: number; // kg
  bmi?: number;
  
  // Admission Information
  department?: string;
  bed?: string;
  admissionDate?: string;
  dischargeDate?: string;
  admissionDiagnosis?: string;
  dpcDiagnosis?: string;
  dpcPeriod?: string;
  
  // Staff Information
  wardAttendingPhysician?: string;
  resident?: string;
  attendingPhysicianA?: string;
  attendingPhysicianB?: string;
  outpatientAttendingPhysician?: string;
  attendingNS?: string;
  
  // Status and Flags
  specialNotes?: string;
  status?: string;
  plan?: boolean;
  nutrition?: string;
  path?: boolean;
  clinicalPath?: boolean;
  nst?: boolean;
  rst?: boolean;
  
  // Visit History
  visits?: Visit[];
  
  // Medical Records
  medicalRecords?: MedicalRecord[];
  
  // Monitoring Records
  monitoringRecords?: MonitoringRecord[];
  
  // Additional Medical Information
  chiefComplaint?: string;
  smokingHistory?: string;
  drinkingHistory?: string;
  
  // Summary
  summary?: string;
}

export interface Visit {
  id: string;
  date: string;
  department: string;
  type: '外来' | '入院' | 'Outpatient' | 'Inpatient';
  diagnosis?: string;
  notes?: string;
  physician?: string;
}

export interface MedicalRecord {
  id: string;
  date: string;
  type: '初診' | '再診' | '外来受診' | '入院診療録';
  visitType?: '外来' | '入院';
  dayOfStay?: number; // For inpatient records (e.g., 入院2日目)
  
  // Progress note (unified SOAP format)
  progressNote?: string;
  
  // Additional fields
  vitalSigns?: {
    temperature?: string;
    bloodPressure?: string;
    heartRate?: string;
    spO2?: string;
    oxygenFlow?: string;
  };
  
  laboratoryResults?: {
    [key: string]: string | number;
  };
  
  imagingResults?: string;
  
  medications?: {
    name: string;
    dosage: string;
    frequency: string;
    duration?: string;
  }[];
  
  physician?: string;
  notes?: string;
}

export interface MonitoringRecord {
  id: string;
  date: string;
  temperature?: number;
  bloodPressure?: string;
  heartRate?: number;
  spO2?: number;
  oxygenFlow?: number;
  weight?: number;
  foodIntakeMorning?: string;
  foodIntakeLunch?: string;
  foodIntakeEvening?: string;
  urineOutput?: number;
  bowelMovementCount?: number;
  urinationCount?: number;
  drainOutput?: number;
  other?: string;
}


