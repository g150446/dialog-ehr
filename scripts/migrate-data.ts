import 'dotenv/config';
import { prisma } from '../lib/db';
import * as fs from 'fs';
import * as path from 'path';

interface JsonPatient {
  id: string;
  patientCode: string;
  name: string;
  nameKana?: string;
  gender: string;
  dateOfBirth: string;
  age: number;
  medicalRecordNumber: string;
  phone?: string;
  email?: string;
  address?: string;
  bloodType?: string;
  allergies?: string[];
  conditions?: string[];
  height?: number;
  weight?: number;
  bmi?: number;
  chiefComplaint?: string;
  smokingHistory?: string;
  drinkingHistory?: string;
  specialNotes?: string;
  summary?: string;
  department?: string;
  bed?: string;
  admissionDate?: string;
  dischargeDate?: string;
  admissionDiagnosis?: string;
  dpcDiagnosis?: string;
  dpcPeriod?: string;
  wardAttendingPhysician?: string;
  resident?: string;
  attendingPhysicianA?: string;
  attendingPhysicianB?: string;
  outpatientAttendingPhysician?: string;
  attendingNS?: string;
  status?: string;
  plan?: boolean;
  nutrition?: string;
  path?: boolean;
  clinicalPath?: boolean;
  nst?: boolean;
  rst?: boolean;
  visits?: Array<{
    id: string;
    date: string;
    department: string;
    type: string;
    diagnosis?: string;
    notes?: string;
    physician?: string;
  }>;
  medicalRecords?: Array<{
    id: string;
    date: string;
    type: string;
    visitType?: string;
    dayOfStay?: number;
    progressNote?: string;
    vitalSigns?: any;
    laboratoryResults?: any;
    imagingResults?: string;
    medications?: any[];
    physician?: string;
    notes?: string;
  }>;
}

async function migrateData() {
  try {
    console.log('Starting data migration...');

    // Read db.json
    const dbPath = path.join(process.cwd(), 'db.json');
    const dbContent = fs.readFileSync(dbPath, 'utf-8');
    const dbData = JSON.parse(dbContent);

    if (!dbData.patients || !Array.isArray(dbData.patients)) {
      throw new Error('Invalid db.json format: patients array not found');
    }

    const patients: JsonPatient[] = dbData.patients;
    console.log(`Found ${patients.length} patients to migrate`);

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('Clearing existing data...');
    await prisma.medicalRecord.deleteMany();
    await prisma.visit.deleteMany();
    await prisma.patient.deleteMany();
    console.log('Existing data cleared');

    // Migrate patients
    for (let i = 0; i < patients.length; i++) {
      const patient = patients[i];
      console.log(`Migrating patient ${i + 1}/${patients.length}: ${patient.name} (${patient.patientCode})`);

      try {
        await prisma.patient.create({
          data: {
            patientCode: patient.patientCode,
            name: patient.name,
            nameKana: patient.nameKana,
            gender: patient.gender,
            dateOfBirth: patient.dateOfBirth,
            age: patient.age,
            medicalRecordNumber: patient.medicalRecordNumber,
            phone: patient.phone,
            email: patient.email,
            address: patient.address,
            bloodType: patient.bloodType,
            allergies: patient.allergies || [],
            conditions: patient.conditions || [],
            height: patient.height,
            weight: patient.weight,
            bmi: patient.bmi,
            chiefComplaint: patient.chiefComplaint,
            smokingHistory: patient.smokingHistory,
            drinkingHistory: patient.drinkingHistory,
            specialNotes: patient.specialNotes,
            summary: patient.summary,
            department: patient.department,
            bed: patient.bed,
            admissionDate: patient.admissionDate,
            dischargeDate: patient.dischargeDate,
            admissionDiagnosis: patient.admissionDiagnosis,
            dpcDiagnosis: patient.dpcDiagnosis,
            dpcPeriod: patient.dpcPeriod,
            wardAttendingPhysician: patient.wardAttendingPhysician,
            resident: patient.resident,
            attendingPhysicianA: patient.attendingPhysicianA,
            attendingPhysicianB: patient.attendingPhysicianB,
            outpatientAttendingPhysician: patient.outpatientAttendingPhysician,
            attendingNS: patient.attendingNS,
            status: patient.status,
            plan: patient.plan ?? false,
            nutrition: patient.nutrition,
            path: patient.path ?? false,
            clinicalPath: patient.clinicalPath ?? false,
            nst: patient.nst ?? false,
            rst: patient.rst ?? false,
            visits: {
              create: (patient.visits || []).map((visit) => ({
                visitId: visit.id,
                date: visit.date,
                department: visit.department,
                type: visit.type,
                diagnosis: visit.diagnosis,
                notes: visit.notes,
                physician: visit.physician,
              })),
            },
            medicalRecords: {
              create: (patient.medicalRecords || []).map((record) => ({
                recordId: record.id,
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
              })),
            },
          },
        });

        console.log(`✓ Successfully migrated patient: ${patient.name}`);
      } catch (error) {
        console.error(`✗ Failed to migrate patient ${patient.name}:`, error);
        throw error;
      }
    }

    console.log('\n✅ Data migration completed successfully!');
    console.log(`Migrated ${patients.length} patients`);

    // Print summary
    const totalVisits = patients.reduce((sum, p) => sum + (p.visits?.length || 0), 0);
    const totalRecords = patients.reduce((sum, p) => sum + (p.medicalRecords?.length || 0), 0);
    console.log(`Total visits: ${totalVisits}`);
    console.log(`Total medical records: ${totalRecords}`);
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateData()
  .then(() => {
    console.log('Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });

