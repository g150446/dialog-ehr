# Patient List Page Specification

## Overview

The Patient List Page is the primary inpatient management interface for the Narrative Hospital EHR system. It displays all admitted patients in a comprehensive table format, allowing healthcare providers to quickly view patient information and navigate to detailed patient records.

**Page Route**: `/` (root route)  
**Component File**: `app/page.tsx`  
**Page Type**: Server Component (Next.js App Router)

## User Roles

- **Primary Users**: Healthcare providers including doctors, nurses, and administrative staff
- **Permissions**: All authenticated users can view the patient list
- **Use Cases**:
  - View all admitted patients at a glance
  - Navigate to individual patient records
  - Filter patients by date and doctor
  - Access patient information for clinical decision-making

## Functional Requirements

### Core Features

1. **Patient Data Display**
   - Display all patients retrieved from the API endpoint `GET /patients`
   - Show patient data in a structured table format with 15 columns
   - Support real-time data loading (no caching)
   - Handle empty states gracefully

2. **Navigation**
   - Navigate to patient detail page via clickable patient name links
   - Route format: `/patients/{patientId}`
   - Maintain navigation state and browser history

3. **Date Navigation Controls**
   - Previous day navigation button (`‹`)
   - Next day navigation button (`›`)
   - Current date display (format: `YYYY/MM/DD`)
   - Day view toggle button (currently displays "日")
   - Date selection functionality (future enhancement)

4. **Filtering and Search**
   - Doctor filter dropdown (currently displays "全医師" - All Doctors)
   - Patient specification/search button ("患者指定")
   - Filter functionality (future enhancement)

5. **Navigation Tabs**
   - Outpatient tab ("外来") - inactive state
   - Inpatient tab ("入院") - active state (current view)
   - Tab switching functionality (future enhancement)

6. **Header Actions**
   - Logout button ("ログアウト")
   - Display change button ("表示変更")
   - Refresh button ("最新表示")
   - Exit button ("終了(X)")
   - Menu items: File ("ファイル(F)"), Help ("ヘルプ(H)")

## UI Components

### Layout Structure

The page follows a vertical layout with the following sections:

1. **Top Header Bar** (`bg-gradient-to-r from-blue-600 to-blue-700`)
   - Hospital name: "Narrative Hospital"
   - Menu items (File, Help)
   - Action buttons (Logout, Display Change, Refresh, Exit)
   - Height: Auto (py-3 padding)
   - Border: 2px solid blue-800 at bottom

2. **Secondary Navigation Bar** (`bg-white`)
   - Tab buttons for Outpatient/Inpatient views
   - Active tab highlighted with blue background and border
   - Border: 2px solid gray-300 at bottom

3. **Controls Section** (`bg-white`)
   - Date navigation controls (previous/next buttons, date display, day view toggle)
   - Doctor filter dropdown
   - Patient specification button
   - Horizontal layout with flexbox
   - Padding: px-6 py-4

4. **Patient List Table** (`bg-white`)
   - Full-width table with horizontal scroll support
   - Sticky header with gradient background
   - Responsive row hover effects
   - Border styling throughout

### Table Columns

The patient table displays the following columns in order:

1. **Checkbox** (width: 40px) - For bulk selection (future feature)
2. **No.** (width: 56px) - Sequential row number (1-indexed)
3. **部署** (Department) (width: 80px) - Patient department code
4. **Bed** (width: 80px) - Bed assignment
5. **特記** (Special Notes) (width: 64px) - Special patient notes
6. **患者コード** (Patient Code) (width: 96px) - Unique patient identifier (monospace font)
7. **氏名** (Name) (width: 112px) - Patient full name (clickable link)
8. **年齢** (Age) (width: 80px) - Patient age with "歳" suffix
9. **性別** (Gender) (width: 64px) - Patient gender (男/女)
10. **入院日** (Admission Date) (width: 112px) - Date of admission
11. **退院日** (Discharge Date) (width: 112px) - Date of discharge
12. **計画** (Plan) (width: 80px) - Plan indicator (★/☆)
13. **入院時病名** (Admission Diagnosis) (width: 128px) - Diagnosis at admission
14. **DPC病名** (DPC Diagnosis) (width: 128px) - DPC diagnosis code
15. **DPC期間I** (DPC Period) (width: 96px) - DPC period indicator

### Styling Details

- **Table Header**: Gradient background (`from-gray-200 to-gray-250`), 2px bottom border (`border-gray-400`), semibold font
- **Table Rows**: 
  - Hover effect: `hover:bg-blue-50` background color
  - Border: `border-gray-300` between rows
  - Cursor: pointer on hover
- **Patient Name Links**: Blue color (`text-blue-700`), underline on hover, medium font weight
- **Empty Fields**: Display "-" character
- **Plan Indicator**: 
  - ★ (yellow-600) for `plan: true`
  - ☆ (gray) for `plan: false`

## Data Model

### Patient Interface

The page displays data from the `Patient` interface defined in `types/patient.ts`. The following fields are displayed in the table:

```typescript
interface Patient {
  id: string;                    // Used for routing (not displayed)
  patientCode: string;           // Column: 患者コード
  name: string;                  // Column: 氏名 (clickable)
  age: number;                   // Column: 年齢 (calculated/displayed)
  gender: '男' | '女' | 'Male' | 'Female';  // Column: 性別
  department?: string;            // Column: 部署
  bed?: string;                  // Column: Bed
  specialNotes?: string;         // Column: 特記
  admissionDate?: string;        // Column: 入院日
  dischargeDate?: string;        // Column: 退院日
  plan?: boolean;                // Column: 計画 (★/☆)
  admissionDiagnosis?: string;   // Column: 入院時病名
  dpcDiagnosis?: string;         // Column: DPC病名
  dpcPeriod?: string;            // Column: DPC期間I
  // Other fields not displayed in table:
  nameKana?: string;
  dateOfBirth: string;
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
  wardAttendingPhysician?: string;
  resident?: string;
  attendingPhysicianA?: string;
  // ... other fields
}
```

## API Contract

### Endpoint

**GET** `/patients`

**Base URL**: `http://localhost:3001` (configurable via `NEXT_PUBLIC_API_URL`)

**Implementation**: `lib/api.ts` - `getAllPatients()`

### Request

- **Method**: GET
- **Headers**: None required
- **Query Parameters**: None
- **Cache**: `no-store` (always fetches fresh data)

### Response

**Success Response** (200 OK):
```json
[
  {
    "id": "1",
    "patientCode": "P001",
    "name": "山田 太郎",
    "age": 80,
    "gender": "男",
    "department": "5105",
    "bed": "02",
    "admissionDate": "2021/08/11",
    "dischargeDate": "2021/08/15",
    "plan": true,
    "admissionDiagnosis": "左鼡径ヘルニ",
    "dpcDiagnosis": "左内鼡径ヘル",
    "dpcPeriod": "08/12",
    // ... other fields
  }
]
```

**Response Type**: `Patient[]` (array of Patient objects)

### Error Handling

- **Network Error**: Logged to console, empty array displayed
- **HTTP Error**: Logged to console, empty array displayed
- **Invalid Data**: Handled gracefully with fallback values

**Error Response Handling**:
```typescript
try {
  patients = await getAllPatients();
} catch (error) {
  console.error('Failed to load patients:', error);
  // Falls back to empty array
}
```

## Business Rules

### Data Display Rules

1. **Age Display**
   - Format: `{age}歳`
   - Example: `80歳`
   - Source: `patient.age` field (number)

2. **Plan Indicator**
   - `plan === true`: Display ★ (star symbol, yellow-600 color)
   - `plan === false` or `undefined`: Display ☆ (empty star, default color)
   - Centered alignment in table cell

3. **Empty Field Handling**
   - If field value is `null`, `undefined`, or empty string: Display "-"
   - Applies to: department, bed, specialNotes, admissionDate, dischargeDate, admissionDiagnosis, dpcDiagnosis, dpcPeriod

4. **Patient Code Display**
   - Monospace font (`font-mono`)
   - Smaller text size (`text-xs`)
   - Preserves exact formatting

5. **Patient Name Links**
   - Clickable link to `/patients/{patient.id}`
   - Blue color (`text-blue-700`)
   - Hover effect: darker blue (`hover:text-blue-900`) with underline
   - Medium font weight

6. **Row Numbering**
   - Sequential numbering starting from 1
   - Based on array index: `index + 1`
   - Displayed in "No." column

### Interaction Rules

1. **Table Row Hover**
   - Background color changes to `bg-blue-50` on hover
   - Cursor changes to pointer
   - Smooth transition effect

2. **Navigation**
   - Clicking patient name navigates to detail page
   - Uses Next.js `Link` component for client-side navigation
   - Preserves browser history

3. **Date Controls** (Current Implementation)
   - Date display shows hardcoded value: "2021/08/15"
   - Previous/Next buttons present but not functional (future enhancement)
   - Day view button present but not functional (future enhancement)

## Error Handling

### Error Scenarios

1. **API Connection Failure**
   - **Behavior**: Log error to console, display empty table
   - **User Impact**: No error message displayed to user
   - **Fallback**: Empty array `[]` used for rendering

2. **Invalid Response Format**
   - **Behavior**: JavaScript error may occur, caught by try-catch
   - **User Impact**: Empty table displayed
   - **Prevention**: TypeScript types provide compile-time safety

3. **Empty Patient List**
   - **Behavior**: Table displays with no rows
   - **User Impact**: User sees empty table (no "no patients" message)

### Error Logging

All errors are logged to the browser console:
```typescript
console.error('Failed to load patients:', error);
```

## Accessibility

### Current Implementation

1. **Semantic HTML**
   - Uses `<table>`, `<thead>`, `<tbody>` elements
   - Proper table structure with headers

2. **Form Controls**
   - Checkbox inputs with proper labels (implicit via table structure)
   - Select dropdown for doctor filter

3. **Navigation**
   - Links use semantic `<Link>` component
   - Proper href attributes

### Accessibility Improvements (Future)

1. **ARIA Labels**: Add aria-labels to buttons and controls
2. **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
3. **Screen Reader Support**: Add aria-live regions for dynamic content
4. **Focus Management**: Proper focus indicators on interactive elements
5. **Table Accessibility**: Add `scope` attributes to table headers
6. **Empty State**: Add aria-label for empty table state

## Performance Considerations

1. **Data Loading**
   - Server-side rendering (SSR) via Next.js App Router
   - No client-side data fetching
   - Fresh data on each page load (`cache: 'no-store'`)

2. **Rendering**
   - Table renders all patients at once (no pagination currently)
   - Horizontal scroll for wide table on smaller screens
   - Efficient React rendering with proper keys

3. **Optimization Opportunities** (Future)
   - Implement pagination for large patient lists
   - Add virtual scrolling for very large datasets
   - Implement client-side filtering/search
   - Add loading states and skeletons

## Testing Requirements

### Unit Tests

1. **Component Rendering**
   - Renders table with correct number of columns
   - Displays patient data correctly
   - Handles empty patient list

2. **Data Formatting**
   - Age displays with "歳" suffix
   - Plan indicator shows correct symbol
   - Empty fields display "-"

3. **Navigation**
   - Patient name links have correct href
   - Links navigate to correct patient detail page

### Integration Tests

1. **API Integration**
   - Successfully fetches patient data
   - Handles API errors gracefully
   - Displays data correctly after fetch

2. **Navigation Flow**
   - Clicking patient name navigates correctly
   - Browser history maintained

### E2E Tests

1. **User Flow**
   - Load page → See patient list → Click patient name → Navigate to detail page
   - Verify all columns display correctly
   - Verify hover effects work

2. **Error Scenarios**
   - API failure → Empty table displayed
   - Network timeout → Error handled gracefully

## Future Enhancements

1. **Functionality**
   - Implement date navigation (previous/next day)
   - Implement doctor filter functionality
   - Implement patient search/specification
   - Implement tab switching (Outpatient/Inpatient)
   - Implement bulk selection with checkboxes
   - Add pagination for large patient lists
   - Add sorting by column headers
   - Add export functionality

2. **UI/UX**
   - Add loading skeleton while data loads
   - Add "No patients found" message
   - Improve responsive design for mobile
   - Add column visibility toggle
   - Add column resizing

3. **Performance**
   - Implement virtual scrolling
   - Add client-side caching with revalidation
   - Optimize table rendering for large datasets

## Related Documentation

- **Data Model**: `types/patient.ts`
- **API Implementation**: `lib/api.ts`
- **Component Implementation**: `app/page.tsx`
- **Patient Detail Page**: `docs/specifications/pages/patient-detail.md`

