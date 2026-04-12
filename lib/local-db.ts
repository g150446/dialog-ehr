import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';

const LOCAL_DB_PATH = path.join(process.cwd(), 'data', 'local-storage.json');
const LEGACY_DB_PATH = path.join(process.cwd(), 'db.json');

type SortDirection = 'asc' | 'desc';

interface LocalPatient {
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
  createdAt: string;
  updatedAt: string;
}

interface LocalVisit {
  id: string;
  patientId: string;
  visitId: string;
  date: string;
  department: string;
  type: string;
  diagnosis?: string;
  notes?: string;
  physician?: string;
  createdAt: string;
  updatedAt: string;
}

interface LocalMedicalRecord {
  id: string;
  patientId: string;
  recordId: string;
  date: string;
  type: string;
  visitType?: string;
  dayOfStay?: number;
  progressNote?: string;
  authorId?: string;
  authorRole?: string;
  authorName?: string;
  laboratoryResults?: Record<string, string | number>;
  imagingResults?: string;
  medications?: Array<Record<string, string>>;
  physician?: string;
  notes?: string;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface LocalMonitoringRecord {
  id: string;
  patientId: string;
  recordId: string;
  date: string;
  temperature?: number;
  systolicBloodPressure?: number;
  diastolicBloodPressure?: number;
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
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface LocalUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: string;
  department?: string;
  licenseNumber?: string;
  isAdmin: boolean;
  isActive: boolean;
  isLocked: boolean;
  failedLoginAttempts: number;
  lastLoginAt?: string | null;
  lastLoginIp?: string | null;
  passwordResetToken?: string | null;
  passwordResetExpiry?: string | null;
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
}

interface LocalAuditLog {
  id: string;
  userId?: string | null;
  username: string;
  action: string;
  resourceType?: string | null;
  resourceId?: string | null;
  details?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
  success: boolean;
  errorMessage?: string | null;
  createdAt: string;
}

interface LocalRecordHistory {
  id: string;
  recordType: string;
  recordId: string;
  originalRecordId: string;
  action: string;
  previousData?: unknown;
  newData?: unknown;
  changedBy?: string;
  changedAt: string;
  reason?: string;
  createdAt: string;
}

interface LocalAppSetting {
  id: string;
  key: string;
  value?: string;
  createdAt: string;
  updatedAt: string;
}

interface LocalStore {
  version: 1;
  initializedAt: string;
  patients: LocalPatient[];
  visits: LocalVisit[];
  medicalRecords: LocalMedicalRecord[];
  monitoringRecords: LocalMonitoringRecord[];
  users: LocalUser[];
  appSettings: LocalAppSetting[];
  auditLogs: LocalAuditLog[];
  recordHistory: LocalRecordHistory[];
}

function nowIso() {
  return new Date().toISOString();
}

function clone<T>(value: T): T {
  if (value === undefined) {
    return value;
  }

  return JSON.parse(JSON.stringify(value)) as T;
}

function sortItems<T extends Record<string, any>>(items: T[], orderBy?: Record<string, SortDirection>) {
  if (!orderBy) {
    return items;
  }

  const [[field, direction]] = Object.entries(orderBy) as Array<[keyof T & string, SortDirection]>;
  const multiplier = direction === 'desc' ? -1 : 1;

  return [...items].sort((a, b) => {
    const left = a[field];
    const right = b[field];

    if (left === right) {
      return 0;
    }

    if (left === undefined || left === null) {
      return 1;
    }

    if (right === undefined || right === null) {
      return -1;
    }

    return left < right ? -1 * multiplier : 1 * multiplier;
  });
}

function matchesCondition(value: any, condition: any): boolean {
  if (condition === null) {
    return value === null || value === undefined;
  }

  if (typeof condition !== 'object' || Array.isArray(condition)) {
    return value === condition;
  }

  if ('contains' in condition) {
    const target = String(value ?? '');
    const search = String(condition.contains ?? '');
    const insensitive = condition.mode === 'insensitive';

    return insensitive
      ? target.toLowerCase().includes(search.toLowerCase())
      : target.includes(search);
  }

  if ('not' in condition) {
    if (condition.not === null) {
      return value !== null && value !== undefined;
    }

    return value !== condition.not;
  }

  if ('in' in condition) {
    return Array.isArray(condition.in) && condition.in.includes(value);
  }

  return Object.entries(condition).every(([nestedKey, nestedValue]) => {
    return matchesCondition(value?.[nestedKey], nestedValue);
  });
}

function matchesWhere<T extends Record<string, any>>(item: T, where?: Record<string, any>): boolean {
  if (!where || Object.keys(where).length === 0) {
    return true;
  }

  const { OR, ...rest } = where;
  const restMatches = Object.entries(rest).every(([key, condition]) => matchesCondition(item[key], condition));

  if (!restMatches) {
    return false;
  }

  if (!OR) {
    return true;
  }

  return Array.isArray(OR) && OR.some((clause) => matchesWhere(item, clause));
}

function selectFields<T extends Record<string, any>>(item: T, select?: Record<string, boolean>) {
  if (!select) {
    return clone(item);
  }

  return Object.entries(select).reduce<Record<string, any>>((result, [key, enabled]) => {
    if (enabled) {
      result[key] = item[key];
    }

    return result;
  }, {});
}

function createDemoUser(): LocalUser {
  const timestamp = nowIso();

  return {
    id: 'demo-admin',
    username: 'admin',
    email: 'admin@example.local',
    passwordHash: bcrypt.hashSync('Admin123!', 12),
    fullName: 'Demo Admin',
    role: 'DOCTOR',
    department: '内科',
    licenseNumber: 'DEMO-ADMIN',
    isAdmin: true,
    isActive: true,
    isLocked: false,
    failedLoginAttempts: 0,
    lastLoginAt: null,
    lastLoginIp: null,
    passwordResetToken: null,
    passwordResetExpiry: null,
    mustChangePassword: false,
    createdAt: timestamp,
    updatedAt: timestamp,
    createdBy: 'system',
  };
}

async function createInitialStore(): Promise<LocalStore> {
  const timestamp = nowIso();
  const raw = await fs.readFile(LEGACY_DB_PATH, 'utf-8');
  const legacy = JSON.parse(raw) as { patients?: Array<Record<string, any>> };
  const legacyPatients = Array.isArray(legacy.patients) ? legacy.patients : [];

  const patients: LocalPatient[] = [];
  const visits: LocalVisit[] = [];
  const medicalRecords: LocalMedicalRecord[] = [];

  for (const patient of legacyPatients) {
    patients.push({
      id: String(patient.id),
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
      allergies: patient.allergies ?? [],
      conditions: patient.conditions ?? [],
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
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    for (const visit of patient.visits ?? []) {
      visits.push({
        id: randomUUID(),
        patientId: String(patient.id),
        visitId: String(visit.id ?? randomUUID()),
        date: visit.date,
        department: visit.department,
        type: visit.type,
        diagnosis: visit.diagnosis,
        notes: visit.notes,
        physician: visit.physician,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }

    for (const record of patient.medicalRecords ?? []) {
      medicalRecords.push({
        id: randomUUID(),
        patientId: String(patient.id),
        recordId: String(record.id ?? randomUUID()),
        date: record.date,
        type: record.type,
        visitType: record.visitType,
        dayOfStay: record.dayOfStay,
        progressNote: record.progressNote,
        laboratoryResults: record.laboratoryResults,
        imagingResults: record.imagingResults,
        medications: record.medications,
        physician: record.physician,
        notes: record.notes,
        deletedAt: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }
  }

  return {
    version: 1,
    initializedAt: timestamp,
    patients,
    visits,
    medicalRecords,
    monitoringRecords: [],
    users: [createDemoUser()],
    appSettings: [],
    auditLogs: [],
    recordHistory: [],
  };
}

async function ensureStoreFile() {
  try {
    await fs.access(LOCAL_DB_PATH);
  } catch {
    const store = await createInitialStore();
    await fs.mkdir(path.dirname(LOCAL_DB_PATH), { recursive: true });
    await fs.writeFile(LOCAL_DB_PATH, JSON.stringify(store, null, 2));
  }
}

async function readStore(): Promise<LocalStore> {
  await ensureStoreFile();
  const raw = await fs.readFile(LOCAL_DB_PATH, 'utf-8');
  return JSON.parse(raw) as LocalStore;
}

async function writeStore(store: LocalStore) {
  await fs.mkdir(path.dirname(LOCAL_DB_PATH), { recursive: true });
  await fs.writeFile(LOCAL_DB_PATH, JSON.stringify(store, null, 2));
}

function materializePatient(store: LocalStore, patient: LocalPatient, include?: Record<string, any>) {
  const result: Record<string, any> = { ...patient };

  if (include?.visits) {
    result.visits = sortItems(
      store.visits.filter((visit) => visit.patientId === patient.id),
      include.visits.orderBy
    );
  }

  if (include?.medicalRecords) {
    result.medicalRecords = sortItems(
      store.medicalRecords.filter((record) => record.patientId === patient.id),
      include.medicalRecords.orderBy
    );
  }

  if (include?.monitoringRecords) {
    result.monitoringRecords = sortItems(
      store.monitoringRecords.filter((record) => record.patientId === patient.id),
      include.monitoringRecords.orderBy
    );
  }

  return result;
}

async function withStore<T>(handler: (store: LocalStore) => T | Promise<T>, persist = false): Promise<T> {
  const store = await readStore();
  const result = await handler(store);

  if (persist) {
    await writeStore(store);
  }

  return clone(result);
}

export const localPrisma = {
  async $connect() {
    await ensureStoreFile();
  },
  async $disconnect() {
    return;
  },
  patient: {
    async findMany(args: { where?: Record<string, any>; include?: Record<string, any> } = {}) {
      return withStore((store) => {
        const patients = store.patients
          .filter((patient) => matchesWhere(patient, args.where))
          .map((patient) => materializePatient(store, patient, args.include));

        return patients;
      });
    },
    async findUnique(args: { where: { id: string }; include?: Record<string, any> }) {
      return withStore((store) => {
        const patient = store.patients.find((item) => item.id === args.where.id);
        return patient ? materializePatient(store, patient, args.include) : null;
      });
    },
    async create(args: { data: Record<string, any>; include?: Record<string, any> }) {
      return withStore((store) => {
        const timestamp = nowIso();
        const { visits, medicalRecords, ...patientData } = args.data;

        const patient: LocalPatient = {
          ...(patientData as Partial<LocalPatient>),
          id: patientData.id ?? randomUUID(),
          createdAt: timestamp,
          updatedAt: timestamp,
        } as LocalPatient;

        store.patients.push(patient);

        for (const visit of visits?.create ?? []) {
          store.visits.push({
            id: randomUUID(),
            patientId: patient.id,
            visitId: visit.visitId ?? visit.id ?? randomUUID(),
            date: visit.date,
            department: visit.department,
            type: visit.type,
            diagnosis: visit.diagnosis,
            notes: visit.notes,
            physician: visit.physician,
            createdAt: timestamp,
            updatedAt: timestamp,
          });
        }

        for (const record of medicalRecords?.create ?? []) {
          store.medicalRecords.push({
            id: randomUUID(),
            patientId: patient.id,
            recordId: record.recordId ?? record.id ?? randomUUID(),
            date: record.date,
            type: record.type,
            visitType: record.visitType,
            dayOfStay: record.dayOfStay,
            progressNote: record.progressNote,
            authorId: record.authorId,
            authorRole: record.authorRole,
            authorName: record.authorName,
            laboratoryResults: record.laboratoryResults,
            imagingResults: record.imagingResults,
            medications: record.medications,
            physician: record.physician,
            notes: record.notes,
            deletedAt: null,
            createdAt: timestamp,
            updatedAt: timestamp,
          });
        }

        return materializePatient(store, patient, args.include);
      }, true);
    },
    async update(args: { where: { id: string }; data: Record<string, any>; include?: Record<string, any> }) {
      return withStore((store) => {
        const patient = store.patients.find((item) => item.id === args.where.id);

        if (!patient) {
          throw new Error(`Patient not found: ${args.where.id}`);
        }

        Object.assign(patient, args.data, { updatedAt: nowIso() });

        return materializePatient(store, patient, args.include);
      }, true);
    },
    async delete(args: { where: { id: string } }) {
      return withStore((store) => {
        const patientIndex = store.patients.findIndex((item) => item.id === args.where.id);

        if (patientIndex === -1) {
          throw new Error(`Patient not found: ${args.where.id}`);
        }

        const [patient] = store.patients.splice(patientIndex, 1);
        store.visits = store.visits.filter((visit) => visit.patientId !== patient.id);
        store.medicalRecords = store.medicalRecords.filter((record) => record.patientId !== patient.id);
        store.monitoringRecords = store.monitoringRecords.filter((record) => record.patientId !== patient.id);

        return patient;
      }, true);
    },
    async count() {
      return withStore((store) => store.patients.length);
    },
  },
  visit: {
    async deleteMany() {
      return withStore((store) => {
        const count = store.visits.length;
        store.visits = [];
        return { count };
      }, true);
    },
  },
  medicalRecord: {
    async findMany(args: { where?: Record<string, any>; orderBy?: Record<string, SortDirection> } = {}) {
      return withStore((store) => sortItems(store.medicalRecords.filter((item) => matchesWhere(item, args.where)), args.orderBy));
    },
    async findFirst(args: { where?: Record<string, any> } = {}) {
      return withStore((store) => store.medicalRecords.find((item) => matchesWhere(item, args.where)) ?? null);
    },
    async create(args: { data: Record<string, any> }) {
      return withStore((store) => {
        const timestamp = nowIso();
        const record: LocalMedicalRecord = {
          id: randomUUID(),
          recordId: args.data.recordId ?? args.data.id ?? randomUUID(),
          patientId: args.data.patientId,
          date: args.data.date,
          type: args.data.type,
          visitType: args.data.visitType,
          dayOfStay: args.data.dayOfStay,
          progressNote: args.data.progressNote,
          authorId: args.data.authorId,
          authorRole: args.data.authorRole,
          authorName: args.data.authorName,
          laboratoryResults: args.data.laboratoryResults,
          imagingResults: args.data.imagingResults,
          medications: args.data.medications,
          physician: args.data.physician,
          notes: args.data.notes,
          deletedAt: null,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        store.medicalRecords.push(record);
        return record;
      }, true);
    },
    async update(args: { where: { id: string }; data: Record<string, any> }) {
      return withStore((store) => {
        const record = store.medicalRecords.find((item) => item.id === args.where.id);

        if (!record) {
          throw new Error(`Medical record not found: ${args.where.id}`);
        }

        Object.assign(record, args.data, { updatedAt: nowIso() });
        return record;
      }, true);
    },
    async delete(args: { where: { id: string } }) {
      return withStore((store) => {
        const index = store.medicalRecords.findIndex((item) => item.id === args.where.id);

        if (index === -1) {
          throw new Error(`Medical record not found: ${args.where.id}`);
        }

        const [record] = store.medicalRecords.splice(index, 1);
        return record;
      }, true);
    },
    async deleteMany() {
      return withStore((store) => {
        const count = store.medicalRecords.length;
        store.medicalRecords = [];
        return { count };
      }, true);
    },
  },
  monitoringRecord: {
    async findMany(args: { where?: Record<string, any>; orderBy?: Record<string, SortDirection> } = {}) {
      return withStore((store) => sortItems(store.monitoringRecords.filter((item) => matchesWhere(item, args.where)), args.orderBy));
    },
    async findFirst(args: { where?: Record<string, any> } = {}) {
      return withStore((store) => store.monitoringRecords.find((item) => matchesWhere(item, args.where)) ?? null);
    },
    async create(args: { data: Record<string, any> }) {
      return withStore((store) => {
        const timestamp = nowIso();
        const record: LocalMonitoringRecord = {
          id: randomUUID(),
          recordId: args.data.recordId ?? randomUUID(),
          patientId: args.data.patientId,
          date: args.data.date instanceof Date ? args.data.date.toISOString() : args.data.date,
          temperature: args.data.temperature,
          systolicBloodPressure: args.data.systolicBloodPressure,
          diastolicBloodPressure: args.data.diastolicBloodPressure,
          heartRate: args.data.heartRate,
          spO2: args.data.spO2,
          oxygenFlow: args.data.oxygenFlow,
          weight: args.data.weight,
          foodIntakeMorning: args.data.foodIntakeMorning,
          foodIntakeLunch: args.data.foodIntakeLunch,
          foodIntakeEvening: args.data.foodIntakeEvening,
          urineOutput: args.data.urineOutput,
          bowelMovementCount: args.data.bowelMovementCount,
          urinationCount: args.data.urinationCount,
          drainOutput: args.data.drainOutput,
          other: args.data.other,
          deletedAt: null,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        store.monitoringRecords.push(record);
        return record;
      }, true);
    },
    async update(args: { where: { id: string }; data: Record<string, any> }) {
      return withStore((store) => {
        const record = store.monitoringRecords.find((item) => item.id === args.where.id);

        if (!record) {
          throw new Error(`Monitoring record not found: ${args.where.id}`);
        }

        const update = { ...args.data };
        if (update.date instanceof Date) {
          update.date = update.date.toISOString();
        }

        Object.assign(record, update, { updatedAt: nowIso() });
        return record;
      }, true);
    },
    async delete(args: { where: { id: string } }) {
      return withStore((store) => {
        const index = store.monitoringRecords.findIndex((item) => item.id === args.where.id);

        if (index === -1) {
          throw new Error(`Monitoring record not found: ${args.where.id}`);
        }

        const [record] = store.monitoringRecords.splice(index, 1);
        return record;
      }, true);
    },
  },
  recordHistory: {
    async findMany(args: { where?: Record<string, any>; orderBy?: Record<string, SortDirection> } = {}) {
      return withStore((store) => sortItems(store.recordHistory.filter((item) => matchesWhere(item, args.where)), args.orderBy));
    },
    async create(args: { data: Record<string, any> }) {
      return withStore((store) => {
        const timestamp = nowIso();
        const history: LocalRecordHistory = {
          id: randomUUID(),
          recordType: args.data.recordType,
          recordId: args.data.recordId,
          originalRecordId: args.data.originalRecordId,
          action: args.data.action,
          previousData: args.data.previousData,
          newData: args.data.newData,
          changedBy: args.data.changedBy,
          changedAt: args.data.changedAt ?? timestamp,
          reason: args.data.reason,
          createdAt: timestamp,
        };

        store.recordHistory.push(history);
        return history;
      }, true);
    },
  },
  appSettings: {
    async findMany() {
      return withStore((store) => store.appSettings);
    },
    async upsert(args: { where: { key: string }; update: Record<string, any>; create: Record<string, any> }) {
      return withStore((store) => {
        const timestamp = nowIso();
        const existing = store.appSettings.find((setting) => setting.key === args.where.key);

        if (existing) {
          Object.assign(existing, args.update, { updatedAt: timestamp });
          return existing;
        }

        const created: LocalAppSetting = {
          id: randomUUID(),
          key: args.create.key,
          value: args.create.value,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        store.appSettings.push(created);
        return created;
      }, true);
    },
  },
  user: {
    async findFirst(args: { where?: Record<string, any>; select?: Record<string, boolean> } = {}) {
      return withStore((store) => {
        const user = store.users.find((item) => matchesWhere(item, args.where));
        return user ? selectFields(user, args.select) : null;
      });
    },
    async findUnique(args: { where: Record<string, string>; select?: Record<string, boolean> }) {
      return withStore((store) => {
        const [[field, value]] = Object.entries(args.where);
        const user = store.users.find((item) => item[field as keyof LocalUser] === value);
        return user ? selectFields(user, args.select) : null;
      });
    },
    async findMany(args: { where?: Record<string, any>; select?: Record<string, boolean>; orderBy?: Record<string, SortDirection> } = {}) {
      return withStore((store) => {
        const users = sortItems(store.users.filter((item) => matchesWhere(item, args.where)), args.orderBy);
        return users.map((user) => selectFields(user, args.select));
      });
    },
    async create(args: { data: Record<string, any>; select?: Record<string, boolean> }) {
      return withStore((store) => {
        const timestamp = nowIso();
        const user: LocalUser = {
          id: randomUUID(),
          username: args.data.username,
          email: args.data.email,
          passwordHash: args.data.passwordHash,
          fullName: args.data.fullName,
          role: args.data.role,
          department: args.data.department,
          licenseNumber: args.data.licenseNumber,
          isAdmin: args.data.isAdmin ?? false,
          isActive: args.data.isActive ?? true,
          isLocked: args.data.isLocked ?? false,
          failedLoginAttempts: args.data.failedLoginAttempts ?? 0,
          lastLoginAt: args.data.lastLoginAt ?? null,
          lastLoginIp: args.data.lastLoginIp ?? null,
          passwordResetToken: args.data.passwordResetToken ?? null,
          passwordResetExpiry: args.data.passwordResetExpiry ?? null,
          mustChangePassword: args.data.mustChangePassword ?? true,
          createdAt: timestamp,
          updatedAt: timestamp,
          createdBy: args.data.createdBy ?? null,
        };

        store.users.push(user);
        return selectFields(user, args.select);
      }, true);
    },
    async update(args: { where: { id: string }; data: Record<string, any>; select?: Record<string, boolean> }) {
      return withStore((store) => {
        const user = store.users.find((item) => item.id === args.where.id);

        if (!user) {
          throw new Error(`User not found: ${args.where.id}`);
        }

        Object.assign(user, args.data, {
          updatedAt: nowIso(),
          lastLoginAt: args.data.lastLoginAt instanceof Date ? args.data.lastLoginAt.toISOString() : args.data.lastLoginAt ?? user.lastLoginAt,
        });

        return selectFields(user, args.select);
      }, true);
    },
    async upsert(args: { where: Record<string, string>; update: Record<string, any>; create: Record<string, any> }) {
      return withStore((store) => {
        const [[field, value]] = Object.entries(args.where);
        const existing = store.users.find((item) => item[field as keyof LocalUser] === value);

        if (existing) {
          Object.assign(existing, args.update, { updatedAt: nowIso() });
          return existing;
        }

        const timestamp = nowIso();
        const created: LocalUser = {
          id: randomUUID(),
          username: args.create.username,
          email: args.create.email,
          passwordHash: args.create.passwordHash,
          fullName: args.create.fullName,
          role: args.create.role,
          department: args.create.department,
          licenseNumber: args.create.licenseNumber,
          isAdmin: args.create.isAdmin ?? false,
          isActive: args.create.isActive ?? true,
          isLocked: args.create.isLocked ?? false,
          failedLoginAttempts: args.create.failedLoginAttempts ?? 0,
          lastLoginAt: args.create.lastLoginAt ?? null,
          lastLoginIp: args.create.lastLoginIp ?? null,
          passwordResetToken: args.create.passwordResetToken ?? null,
          passwordResetExpiry: args.create.passwordResetExpiry ?? null,
          mustChangePassword: args.create.mustChangePassword ?? true,
          createdAt: timestamp,
          updatedAt: timestamp,
          createdBy: args.create.createdBy ?? null,
        };

        store.users.push(created);
        return created;
      }, true);
    },
  },
  auditLog: {
    async create(args: { data: Record<string, any> }) {
      return withStore((store) => {
        const log: LocalAuditLog = {
          id: randomUUID(),
          userId: args.data.user?.connect?.id ?? null,
          username: args.data.username,
          action: args.data.action,
          resourceType: args.data.resourceType ?? null,
          resourceId: args.data.resourceId ?? null,
          details: args.data.details,
          ipAddress: args.data.ipAddress ?? null,
          userAgent: args.data.userAgent ?? null,
          success: args.data.success ?? true,
          errorMessage: args.data.errorMessage ?? null,
          createdAt: nowIso(),
        };

        store.auditLogs.push(log);
        return log;
      }, true);
    },
  },
};
