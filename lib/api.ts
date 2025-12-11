import { Patient, MedicalRecord } from '@/types/patient';

// Use relative paths for Next.js API routes
const API_BASE_URL = '/api';

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
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/medical-records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    if (!response.ok) {
      throw new Error('Failed to save medical record');
    }
    return await response.json();
  } catch (error) {
    console.error('Error saving medical record:', error);
    throw error;
  }
}

export async function searchPatients(query: string): Promise<Patient[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/patients?query=${encodeURIComponent(query)}`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error('Failed to search patients');
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching patients:', error);
    throw error;
  }
}


