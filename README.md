# Electronic Health Record System

An electronic health record (EHR) system built with Next.js, TypeScript, Tailwind CSS, and PostgreSQL. This application provides comprehensive patient management capabilities, allowing healthcare providers to view patient lists and access detailed medical records.

## Features

- Patient list management with intuitive table layout
- Comprehensive patient detail pages with full medical information
- Seamless navigation between list and detail views
- Voice input using MediaRecorder API and Whisper transcription
- RESTful API backend integration with Next.js API routes
- PostgreSQL database for reliable data storage
- Responsive design optimized for desktop and mobile devices
- Modern UI built with Tailwind CSS

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Docker and Docker Compose (for PostgreSQL database)
- Python 3.8+ (for Whisper transcription server, optional - only needed for voice input feature)

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

#### HTTPS Setup for Voice Input (Optional)

If you need to access the application via a hostname other than `localhost` (e.g., via Tailscale VPN), you'll need to enable HTTPS for the MediaRecorder API to work. Browsers require HTTPS for MediaRecorder API when accessing via non-localhost hostnames.

**Quick Setup:**

1. **Install mkcert** (if not already installed):
   ```bash
   # macOS
   brew install mkcert
   
   # Linux
   sudo apt install libnss3-tools
   wget -qO - https://dl.filippo.io/mkcert/install | sudo bash
   
   # Windows
   choco install mkcert
   ```

2. **Install the local CA**:
   ```bash
   mkcert -install
   ```

3. **Generate SSL certificates** (replace `macbook-m1` with your actual hostname):
   ```bash
   mkcert -key-file localhost-key.pem -cert-file localhost.pem localhost 127.0.0.1 ::1 macbook-m1
   ```

4. **Run the dev server with HTTPS**:
   ```bash
   npm run dev:https
   ```

5. **Access via HTTPS**:
   - `https://localhost:3000` (works)
   - `https://macbook-m1:3000` (works via Tailscale)

**Note:** The certificate files (`localhost.pem` and `localhost-key.pem`) are already excluded from git via `.gitignore`.

**Alternative:** If you don't want to set up HTTPS, you can use SSH port forwarding:
```bash
ssh -L 3000:localhost:3000 user@macbook-m1
```
Then access via `http://localhost:3000` from your remote machine.

### 7. Start Whisper Transcription Server (Optional - for Voice Input)

The voice input feature requires a Whisper transcription server running separately. This is a Python FastAPI server that handles audio transcription.

**Setup:**

1. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Start the Whisper server** (in a separate terminal):
   ```bash
   python whisper_server.py
   ```

   The server will automatically detect if SSL certificates (`localhost-key.pem` and `localhost.pem`) exist:
   - **If certificates exist**: Server starts with HTTPS on `https://localhost:9000`
   - **If certificates don't exist**: Server starts with HTTP on `http://localhost:9000`

   The server automatically downloads the Whisper model on first run.

**Important:** 
- If you're running the Next.js app with HTTPS (`npm run dev:https`), the Whisper server **must also use HTTPS** to avoid mixed content errors.
- To enable HTTPS for the Whisper server, ensure the same SSL certificates (`localhost-key.pem` and `localhost.pem`) used for Next.js are in the directory where you run `whisper_server.py`.
- If you're running Next.js with HTTP (`npm run dev`), the Whisper server can use HTTP.

**Note:** The Whisper server must be running for the voice input feature to work. The server uses the `small` model by default, which provides a good balance between accuracy and speed. You can modify the model size in `whisper_server.py` if needed.

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

- `npm run dev` - Start the Next.js development server (HTTP)
- `npm run dev:https` - Start the Next.js development server with HTTPS (requires SSL certificates)
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


