import { Patient, MedicalRecord } from '@/types/patient';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function getAllPatients(): Promise<Patient[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/patients`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch patients');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching patients:', error);
    throw error;
  }
}

export async function getPatientById(id: string): Promise<Patient> {
  try {
    const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch patient with id ${id}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching patient ${id}:`, error);
    throw error;
  }
}

export async function saveMedicalRecord(patientId: string, record: MedicalRecord): Promise<MedicalRecord> {
  try {
    // TODO: Implement actual API call when backend is ready
    // For now, just log and return the record
    console.log('Saving medical record for patient:', patientId, record);
    
    // Placeholder: In a real implementation, this would POST to the API
    // const response = await fetch(`${API_BASE_URL}/patients/${patientId}/medical-records`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(record),
    // });
    // if (!response.ok) {
    //   throw new Error('Failed to save medical record');
    // }
    // return await response.json();
    
    return record;
  } catch (error) {
    console.error('Error saving medical record:', error);
    throw error;
  }
}


