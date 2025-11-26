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


