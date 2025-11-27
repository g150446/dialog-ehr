# Patient Detail Page Specification

## Overview

The Patient Detail Page provides a comprehensive view of an individual patient's complete medical record. It displays patient information organized into logical sections, including basic demographics, medical history, admission details, staff assignments, visit history, and detailed medical records in SOAP format. The page features a view toggle system that allows users to switch between viewing medical records, patient information, or visit history. By default, the page displays medical records. The page serves as the primary interface for healthcare providers to review and manage patient records.

**Page Route**: `/patients/[id]` (dynamic route)  
**Component Files**: 
  - `app/patients/[id]/page.tsx` (Server Component - data fetching)
  - `app/patients/[id]/PatientContent.tsx` (Client Component - view state and interactivity)
**Page Type**: Hybrid (Server Component with Client Component for interactivity)  
**404 Handler**: `app/patients/[id]/not-found.tsx`

## User Roles

- **Primary Users**: Healthcare providers, primarily doctors and nurses
- **Secondary Users**: Administrative staff, medical records personnel
- **Permissions**: All authenticated users can view patient details
- **Use Cases**:
  - Review complete patient medical history
  - View admission and discharge information
  - Access visit history and clinical notes
  - Navigate to order entry and other clinical functions
  - Review staff assignments and care team

## Functional Requirements

### Core Features

1. **Patient Data Display**
   - Display patient information retrieved from API endpoint `GET /patients/:id`
   - Show comprehensive patient data in organized sections
   - Support real-time data loading (no caching)
   - Handle patient not found scenarios (404)

2. **Information Sections**
   - **Basic Information**: Name, gender, date of birth, patient code, contact information
   - **Medical Information**: Height, weight, BMI, blood type, allergies, conditions, chief complaint, smoking history, drinking history
   - **Admission Information**: Department, bed, admission/discharge dates, diagnoses
   - **Staff Information**: Ward attending physician, resident, attending physicians
   - **Visit History**: Chronological list of patient visits with dates, departments, diagnoses, physicians, and notes
   - **Medical Records**: Detailed SOAP-format medical records with vital signs, laboratory results, imaging results, medications, and clinical notes

3. **Calculations**
   - **Age Calculation**: Calculate current age from date of birth
   - **BMI Calculation**: Calculate Body Mass Index from height and weight
   - Display calculated values with appropriate formatting

4. **Navigation**
   - Navigate back to patient list via "一覧に戻る" button
   - Route: `/` (root route)
   - Maintain navigation state
   - Toggle between views using sidebar buttons: "カルテ(1)", "患者情報", "来院履歴"
   - View state managed client-side using React useState hook

5. **Header Actions**
   - Other patient search ("他患者を聞く")
   - Patient call ("患者呼出")
   - Send only ("送信のみ(Z)")
   - End examination ("診察終了(E)")
   - Complete ("完了(X)")
   - Menu items: Help ("ヘルプ(H)")

6. **Left Sidebar Navigation**
   - Record type buttons:
     - カルテ (Chart) - Shows medical records view, active when medical records are displayed
     - カレンダー (Calendar) - Placeholder
     - 指示簿 (Order Book) - Placeholder
     - 経過表 (Progress Sheet) - Placeholder
     - ワークシート (Worksheet) - Placeholder
     - 患者情報 (Patient Information) - Shows patient information view only
     - 来院履歴 (Visit History) - Shows visit history view only
   - Filter buttons:
     - ALL
     - カルテ種 (Chart Type) - Active state
     - 記事 (Article)
   - Record date navigation:
     - Year display: "2021年(令和03年)"
     - Month display: "05月"
     - Date entry: "27日(木)(再)整形外科"
   - Favorite functions section:
     - オーダ機能1 (Order Function 1)
     - オーダ機能2 (Order Function 2)
   - Quick action buttons:
     - ★投薬 (a) - Medication
     - ★注射 (b) - Injection
     - 検査結果照会 (l) - Test Results Inquiry
     - 所見歴 (m) - Findings History
     - ★検査・放射線 (e) - Tests & Radiology
     - ★処置・指導 (d) - Procedures & Instructions

7. **View Toggle Functionality**
   - The page uses a client-side state to manage which content section is displayed
   - Three possible views: `'medical-records'`, `'patient-info'`, `'visit-history'`
   - Default view: `'medical-records'` (shows medical records on page load)
   - Clicking "カルテ(1)" button: Shows medical records view
   - Clicking "患者情報" button: Shows ONLY patient information section (hides medical records)
   - Clicking "来院履歴" button: Shows ONLY visit history section (hides medical records)
   - Only one view is displayed at a time (exclusive view switching)
   - Active button styling: White background with blue border (`bg-white border-2 border-blue-600`)
   - Inactive button styling: Gray background (`bg-gray-200 border border-gray-400`)

## UI Layout

### Two-Panel Layout

The page uses a two-panel horizontal layout:

1. **Left Sidebar** (Width: 256px / `w-64`)
   - Background: Gradient (`from-gray-100 to-gray-150`)
   - Border: 2px solid gray-400 on right
   - Scrollable: Vertical scroll enabled
   - Padding: 12px (`p-3`)
   - Content: Record type navigation, filters, date navigation, favorite functions, and quick action buttons

2. **Center Content Panel** (Flex: 1 / `flex-1`)
   - Background: White
   - Scrollable: Vertical scroll enabled
   - Padding: 24px (`p-6`)
   - Content: Patient information sections

### Page Structure

1. **Top Header Bar** (`bg-gradient-to-r from-blue-600 to-blue-700`)
   - Hospital name: "Narrative Hospital"
   - Menu items (Help)
   - Action buttons (Other patient search, Patient call, Send only, End examination, Complete)
   - Height: Auto (py-3 padding)
   - Border: 2px solid blue-800 at bottom

2. **Patient Information Bar** (`bg-gradient-to-r from-blue-50 to-gray-50`)
   - Gender icon (circular badge with ♂ or ♀)
   - Patient name with honorific ("様")
   - Demographics: Gender, date of birth, age
   - Physical stats: Height, weight, BMI
   - Status badge: "未検" (unexamined) - red background
   - Patient code and medical record number
   - "一覧に戻る" (Return to List) button
   - Padding: px-6 py-4

3. **Main Content Area** (Height: `calc(100vh - 200px)`)
   - Two-panel layout as described above
   - Fixed height with vertical scrolling

### Information Sections

Each information section follows a consistent design pattern:

- **Section Container**: Gradient background (`from-gray-50 to-gray-100`), rounded corners (`rounded-lg`), border (`border-2 border-gray-300`), shadow (`shadow-sm`), padding (`p-5`)
- **Section Header**: Bold text (`font-bold`), small size (`text-sm`), bottom border (`border-b border-gray-400`), padding bottom (`pb-1`)
- **Content Grid**: Two-column grid (`grid-cols-2`), gap spacing (`gap-4`), small text (`text-sm`)
- **Field Display**: Label in medium gray (`text-gray-600 font-medium`), value in dark gray (`text-gray-800`)

#### Section Details

1. **基本情報 (Basic Information)**
   - Fields: Name (with kana), Gender, Date of Birth, Patient Code, Phone, Email, Address
   - Layout: Two-column grid, address spans full width

2. **医療情報 (Medical Information)**
   - Fields: Height, Weight, BMI, Blood Type, Allergies, Conditions
   - Layout: Two-column grid, allergies and conditions span full width
   - Conditional: Only displays if relevant data exists

3. **入院情報 (Admission Information)**
   - Fields: Department, Bed, Admission Date, Discharge Date, Admission Diagnosis, DPC Diagnosis
   - Layout: Two-column grid, diagnoses span full width
   - Conditional: Only displays if admission data exists

4. **担当医情報 (Staff Information)**
   - Fields: Ward Attending Physician, Resident, Attending Physician A
   - Layout: Two-column grid
   - Conditional: Only displays if staff data exists

5. **来院履歴 (Visit History)**
   - Display: Chronological list of visits
   - Each visit card: Left border (`border-l-4 border-blue-600`), white background, padding, shadow
   - Visit details: Date, Department, Diagnosis, Physician, Notes
   - Conditional: Only displays if visits exist

## Data Model

### Patient Interface

The page displays the complete `Patient` interface from `types/patient.ts`:

```typescript
interface Patient {
  id: string;                              // Used for routing
  patientCode: string;                      // Displayed in info bar
  name: string;                            // Displayed with honorific
  nameKana?: string;                       // Displayed in parentheses after name
  gender: '男' | '女' | 'Male' | 'Female'; // Used for icon and display
  dateOfBirth: string;                     // Used for age calculation
  age: number;                             // May be calculated or provided
  medicalRecordNumber: string;             // Displayed in info bar
  
  // Contact Information
  phone?: string;
  email?: string;
  address?: string;
  
  // Medical Information
  bloodType?: string;
  allergies?: string[];
  conditions?: string[];
  height?: number;                          // cm, used for BMI calculation
  weight?: number;                          // kg, used for BMI calculation
  bmi?: number;                            // May be calculated or provided
  
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
  
  // Additional Medical Information
  chiefComplaint?: string;
  smokingHistory?: string;
  drinkingHistory?: string;
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
  
  // SOAP format
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  
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
```

### Data Display Mapping

- **Info Bar**: name, gender, dateOfBirth, age (calculated), height, weight, BMI (calculated), patientCode, medicalRecordNumber
- **Basic Info Section**: name, nameKana, gender, dateOfBirth, age (calculated), patientCode, phone, email, address
- **Medical Info Section**: height, weight, BMI (calculated), bloodType, allergies, conditions, chiefComplaint, smokingHistory, drinkingHistory
- **Admission Info Section**: department, bed, admissionDate, dischargeDate, admissionDiagnosis, dpcDiagnosis
- **Staff Info Section**: wardAttendingPhysician, resident, attendingPhysicianA
- **Visit History Section**: visits array (all fields)
- **Medical Records Section**: medicalRecords array (all fields, displayed in SOAP format)

## API Contract

### Endpoint

**GET** `/patients/:id`

**Base URL**: `http://localhost:3001` (configurable via `NEXT_PUBLIC_API_URL`)

**Implementation**: `lib/api.ts` - `getPatientById(id: string)`

### Request

- **Method**: GET
- **Path Parameter**: `id` (string) - Patient ID
- **Headers**: None required
- **Query Parameters**: None
- **Cache**: `no-store` (always fetches fresh data)

### Response

**Success Response** (200 OK):
```json
{
  "id": "1",
  "patientCode": "P001",
  "name": "山田 太郎",
  "nameKana": "ヤマダ タロウ",
  "gender": "男",
  "dateOfBirth": "1941-05-15",
  "age": 80,
  "medicalRecordNumber": "MR001",
  "phone": "03-1234-5678",
  "email": "yamada@example.com",
  "address": "東京都渋谷区1-2-3",
  "bloodType": "A型",
  "allergies": ["ペニシリン"],
  "conditions": ["高血圧", "糖尿病"],
  "height": 170,
  "weight": 75,
  "bmi": 26.0,
  "department": "5105",
  "bed": "02",
  "admissionDate": "2021/08/11",
  "dischargeDate": "2021/08/15",
  "admissionDiagnosis": "左鼡径ヘルニ",
  "dpcDiagnosis": "左内鼡径ヘル",
  "dpcPeriod": "08/12",
  "wardAttendingPhysician": "田中 医師",
  "resident": "佐藤 医師",
  "attendingPhysicianA": "鈴木 医師",
  "visits": [
    {
      "id": "v1",
      "date": "2021-08-11",
      "department": "整形外科",
      "type": "入院",
      "diagnosis": "左鼡径ヘルニ",
      "physician": "田中 医師",
      "notes": "入院。手術予定。"
    }
  ]
}
```

**Response Type**: `Patient` (single Patient object)

### Error Handling

- **404 Not Found**: Redirects to `not-found.tsx` page
- **Network Error**: Logged to console, redirects to not-found
- **Invalid Data**: Handled gracefully with conditional rendering

**Error Response Handling**:
```typescript
try {
  patient = await getPatientById(params.id);
} catch (error) {
  console.error('Failed to load patient:', error);
  notFound(); // Redirects to not-found.tsx
}

if (!patient) {
  notFound();
}
```

## Business Rules

### Age Calculation

**Formula**:
```typescript
const calculateAge = (dateOfBirth: string) => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};
```

**Rules**:
- Calculate from `dateOfBirth` field (format: `YYYY-MM-DD`)
- Account for month and day (not just year difference)
- Decrement age if birthday hasn't occurred this year
- Display format: `{dateOfBirth}生({age}歳)`
- Example: `1941-05-15生(80歳)`

### BMI Calculation

**Formula**:
```typescript
const bmi = patient.height && patient.weight 
  ? (patient.weight / Math.pow(patient.height / 100, 2)).toFixed(1)
  : '0.0';
```

**Rules**:
- Calculate only if both height and weight are provided
- Height in cm, weight in kg
- Formula: `weight / (height/100)^2`
- Display with 1 decimal place
- Default to "0.0" if data missing
- Display format: `{height}cm / {weight}kg / BMI {bmi}`
- Example: `170cm / 75kg / BMI 26.0`

### Gender Icon Display

**Rules**:
- `gender === '男'` or `gender === 'Male'`: Display ♂ (male symbol)
- `gender === '女'` or `gender === 'Female'`: Display ♀ (female symbol)
- Icon displayed in circular badge (56px × 56px)
- Background: Gradient (`from-blue-600 to-blue-700`)
- White icon color, bold font, size: `text-xl`

### Status Badge

**Current Implementation**:
- Always displays "未検" (unexamined)
- Red background (`bg-red-100`)
- Red border (`border-2 border-red-400`)
- Red text (`text-red-800`)
- Small text (`text-xs`), semibold font

**Future Enhancement**: Should be dynamic based on patient status

### Conditional Section Rendering

**View-Based Rendering**:
- The page uses an `activeView` state to control which content section is displayed
- Three possible views: `'medical-records'`, `'patient-info'`, `'visit-history'`
- Only one view is displayed at a time (exclusive rendering)
- Default view on page load: `'medical-records'`

**Section-Specific Rules**:
- **Patient Information Section**: Only displays when `activeView === 'patient-info'`
  - **Admission Information**: Only displays if `admissionDate` or `department` exists
  - **Staff Information**: Only displays if `wardAttendingPhysician` or `attendingPhysicianA` exists
  - **Medical Information**: Always displays within patient info view, but fields conditionally rendered
  - **Basic Information**: Always displays within patient info view, but optional fields conditionally rendered
- **Visit History Section**: Only displays when `activeView === 'visit-history'` and `visits` array exists with length > 0
- **Medical Records Section**: Only displays when `activeView === 'medical-records'` and `medicalRecords` array exists with length > 0

### Visit History Display

**Rules**:
- Display visits in chronological order (as provided by API)
- Each visit shows:
  - Date and Department (bold, main line)
  - Diagnosis (if available)
  - Physician (if available)
  - Notes (if available, smaller text)
- Visit cards have left border accent (blue-600)
- White background with shadow
- Spacing between visits: `space-y-3`
- Only displayed when `activeView === 'visit-history'`

### Medical Records Display

**Rules**:
- Display medical records sorted by date (newest first)
- Each record displays in SOAP format with color-coded sections:
  - **S (Subjective)**: Green background (`bg-green-50`), green left border (`border-green-500`)
  - **O (Objective)**: Blue background (`bg-blue-50`), blue left border (`border-blue-500`)
  - **A (Assessment)**: Yellow background (`bg-yellow-50`), yellow left border (`border-yellow-500`)
  - **P (Plan)**: Purple background (`bg-purple-50`), purple left border (`border-purple-500`)
- Record header displays:
  - Record type badge (e.g., 【初診】, 【再診】)
  - Date formatted in Japanese locale
  - Visit type badge (if applicable)
  - Day of stay badge for inpatient records (if applicable)
  - Physician name (if available)
- Vital signs displayed in a grid format when available
- Laboratory results displayed in a grid format when available
- Imaging results displayed as text when available
- Medications displayed as cards with name, dosage, frequency, and duration
- Only displayed when `activeView === 'medical-records'`

### Field Display Formatting

1. **Name**: `{name}様` (with honorific)
2. **Name with Kana**: `{name} ({nameKana})` if kana exists
3. **Date of Birth**: `{dateOfBirth} ({age}歳)`
4. **Physical Stats**: `{height}cm / {weight}kg / BMI {bmi}`
5. **Allergies**: Joined with comma: `{allergies.join(', ')}`
6. **Conditions**: Joined with comma: `{conditions.join(', ')}`
7. **Patient Code**: Monospace font (`font-mono`)

## Error Handling

### Error Scenarios

1. **Patient Not Found (404)**
   - **Behavior**: Redirect to `not-found.tsx` page
   - **Implementation**: `notFound()` function from Next.js
   - **User Impact**: User sees 404 page with option to return to list

2. **API Connection Failure**
   - **Behavior**: Log error to console, redirect to not-found
   - **User Impact**: User sees 404 page
   - **Fallback**: `notFound()` called in catch block

3. **Invalid Patient ID**
   - **Behavior**: API returns 404, handled as above
   - **User Impact**: User sees 404 page

4. **Missing Required Fields**
   - **Behavior**: Conditional rendering handles missing optional fields
   - **User Impact**: Sections or fields simply don't display
   - **Required Fields**: `id`, `patientCode`, `name`, `gender`, `dateOfBirth`, `age`, `medicalRecordNumber`

### Error Logging

All errors are logged to the browser console:
```typescript
console.error('Failed to load patient:', error);
```

### 404 Page

The `not-found.tsx` component handles patient not found scenarios:
- Displays appropriate error message
- Provides navigation back to patient list
- Styled consistently with application theme

## Accessibility

### Current Implementation

1. **Semantic HTML**
   - Proper heading hierarchy (`h1`, `h2`, `h3`)
   - Semantic sections and containers
   - Proper link usage

2. **Navigation**
   - Links use semantic `<Link>` component
   - Proper href attributes
   - Clear navigation labels

3. **Form Controls**
   - Buttons use semantic `<button>` elements
   - Proper button labels in Japanese

### Accessibility Improvements (Future)

1. **ARIA Labels**: Add aria-labels to buttons and interactive elements
2. **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
3. **Screen Reader Support**: Add aria-live regions for dynamic content
4. **Focus Management**: Proper focus indicators on interactive elements
5. **Color Contrast**: Ensure sufficient contrast for all text elements
6. **Alt Text**: Add alt text for gender icons (currently decorative)
7. **Skip Links**: Add skip navigation links for main content

## Performance Considerations

1. **Data Loading**
   - Server-side rendering (SSR) via Next.js App Router
   - Patient data fetched server-side in `page.tsx`
   - No client-side data fetching
   - Fresh data on each page load (`cache: 'no-store'`)
   - Data passed as props to client component

2. **Rendering**
   - Conditional rendering reduces DOM size - only active view section is rendered
   - View state managed client-side using React useState hook
   - Efficient React rendering with proper keys for visit lists and medical records
   - Fixed height layout prevents layout shifts
   - Client component handles only view switching (no data fetching)

3. **Calculations**
   - Age and BMI calculated on server side
   - Calculations performed once per render
   - No performance impact for typical patient data

4. **Optimization Opportunities** (Future)
   - Implement client-side caching with revalidation
   - Add loading states and skeletons
   - Optimize image loading for future image additions
   - Implement code splitting for sidebar components

## Testing Requirements

### Unit Tests

1. **Component Rendering**
   - Renders patient information correctly
   - Displays all sections when data available
   - Hides sections when data missing
   - Handles patient not found scenario

2. **Calculations**
   - Age calculation correct for various dates
   - BMI calculation correct for various heights/weights
   - Handles missing height/weight gracefully

3. **Data Formatting**
   - Name displays with honorific
   - Dates formatted correctly
   - Arrays (allergies, conditions) joined correctly

### Integration Tests

1. **API Integration**
   - Successfully fetches patient data by ID
   - Handles 404 responses correctly
   - Handles API errors gracefully
   - Displays data correctly after fetch

2. **Navigation**
   - "一覧に戻る" button navigates correctly
   - Patient ID in URL matches displayed patient
   - Browser history maintained

### E2E Tests

1. **User Flow**
   - Navigate from list → Detail page → Verify data → Return to list
   - Verify all sections display correctly
   - Verify calculations are correct
   - Verify conditional rendering works

2. **Error Scenarios**
   - Invalid patient ID → 404 page displayed
   - API failure → 404 page displayed
   - Network timeout → Error handled gracefully

3. **Interactive Elements**
   - Sidebar buttons render correctly (functionality future)
   - Action buttons render correctly (functionality future)
   - Navigation works correctly

## Future Enhancements

1. **Functionality**
   - Implement sidebar navigation (Calendar, Order Book, etc.)
   - Implement header action buttons
   - Implement left sidebar quick actions
   - Add edit functionality for patient data
   - Add clinical note entry
   - Add order entry integration
   - Implement record date navigation
   - Add filtering for visit history

2. **UI/UX**
   - Add loading skeleton while data loads
   - Improve responsive design for mobile/tablet
   - Add print functionality
   - Add export functionality
   - Improve status badge to be dynamic
   - Add patient photo display
   - Add timeline view for visit history

3. **Data**
   - Add more detailed medical history
   - Add medication history
   - Add lab results integration
   - Add imaging results integration
   - Add vital signs history
   - Add care plan information

4. **Performance**
   - Implement client-side caching with revalidation
   - Add optimistic updates for edits
   - Optimize rendering for large visit histories

## Related Documentation

- **Data Model**: `types/patient.ts`
- **API Implementation**: `lib/api.ts`
- **Component Implementation**: 
  - Server Component: `app/patients/[id]/page.tsx`
  - Client Component: `app/patients/[id]/PatientContent.tsx` (handles view state and interactive elements)
- **404 Handler**: `app/patients/[id]/not-found.tsx`
- **Patient List Page**: `docs/specifications/pages/patient-list.md`

