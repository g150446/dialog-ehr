# Electronic Health Record System

An electronic health record (EHR) system built with Next.js, TypeScript, Tailwind CSS, and PostgreSQL. This application provides comprehensive patient management capabilities, allowing healthcare providers to view patient lists and access detailed medical records.

## Features

- Patient list management with intuitive table layout
- Comprehensive patient detail pages with full medical information
- Seamless navigation between list and detail views
- RESTful API backend integration with Next.js API routes
- PostgreSQL database for reliable data storage
- Responsive design optimized for desktop and mobile devices
- Modern UI built with Tailwind CSS

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Docker and Docker Compose (for PostgreSQL database)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory (you can copy from `.env.example`):

```bash
cp .env.example .env
```

The default configuration uses:
- Database URL: `postgresql://postgres:postgres@localhost:5432/dialog_ehr?schema=public`
- PostgreSQL credentials: `postgres/postgres`
- Database name: `dialog_ehr`
- Port: `5432`

### 3. Start PostgreSQL Database

Start the PostgreSQL container using Docker Compose:

```bash
npm run db:up
```

This will start a PostgreSQL 16 container in the background. The database will be available at `localhost:5432`.

### 4. Run Database Migrations

Generate Prisma Client and create the database schema:

```bash
npm run db:generate
npm run db:migrate
```

When prompted, name your migration (e.g., "init").

### 5. Seed the Database

Import existing patient data from `db.json`:

```bash
npm run db:seed
```

This will migrate all patient data, visits, and medical records from the JSON file to PostgreSQL.

### 6. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Management

### Start/Stop Database

```bash
# Start PostgreSQL container
npm run db:up

# Stop PostgreSQL container
npm run db:down
```

### Database Migrations

```bash
# Create and apply a new migration
npm run db:migrate

# Generate Prisma Client (after schema changes)
npm run db:generate
```

### Database GUI

Access Prisma Studio to view and edit data in a visual interface:

```bash
npm run db:studio
```

This will open Prisma Studio at `http://localhost:5555`.

### Seed Data

To re-import data from `db.json` (this will clear existing data):

```bash
npm run db:seed
```

## Project Structure

```
dialog-ehr/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── patients/      # Patient API endpoints
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Patient list page
│   ├── globals.css        # Global styles
│   └── patients/
│       └── [id]/
│           ├── page.tsx   # Patient detail page
│           └── not-found.tsx
├── prisma/
│   └── schema.prisma      # Prisma schema definition
├── scripts/
│   └── migrate-data.ts    # Data migration script
├── types/
│   └── patient.ts         # TypeScript interfaces
├── lib/
│   ├── api.ts            # API client utilities
│   └── db.ts             # Prisma client instance
├── docker-compose.yml     # PostgreSQL container configuration
├── db.json               # Legacy database file (for migration)
└── package.json
```

## Sample Data

The development environment includes sample patient records for testing:
1. 山田 太郎 (Yamada Taro) - 80 years old, male
2. 佐藤 花子 (Sato Hanako) - 89 years old, female
3. 鈴木 次郎 (Suzuki Jiro) - 44 years old, male

## API Endpoints

The Next.js API routes provide the following endpoints:
- `GET /api/patients` - Retrieve all patients
- `GET /api/patients/:id` - Retrieve a specific patient by ID
- `POST /api/patients` - Create a new patient
- `PUT /api/patients/:id` - Update a patient
- `DELETE /api/patients/:id` - Delete a patient
- `POST /api/patients/:id/medical-records` - Create a medical record for a patient

## Development

### Available Scripts

- `npm run dev` - Start the Next.js development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run db:up` - Start PostgreSQL container
- `npm run db:down` - Stop PostgreSQL container
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma Client
- `npm run db:seed` - Import data from db.json
- `npm run db:studio` - Open Prisma Studio GUI

### Development Workflow

1. Ensure PostgreSQL is running: `npm run db:up`
2. Start the development server: `npm run dev`
3. Make schema changes in `prisma/schema.prisma`
4. Run migrations: `npm run db:migrate`
5. Generate Prisma Client: `npm run db:generate`

## Technologies Used

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- PostgreSQL (via Docker)
- Prisma ORM
- Next.js API Routes

## Documentation

Specification documents for each page and feature are available in the `docs/specifications/` directory. These documents provide detailed information about:
- Page layouts and UI components
- Data models and API contracts
- Business rules and validation logic
- User interactions and workflows

For example:
- `docs/specifications/pages/patient-list.md` - Patient list page specifications
- `docs/specifications/pages/patient-detail.md` - Patient detail page specifications


