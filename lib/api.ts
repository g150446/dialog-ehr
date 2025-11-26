import { Patient } from '@/types/patient';

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


