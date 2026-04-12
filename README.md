# Dialog EHR

Dialog EHR is an **open-source** Electronic Health Record demo built with Next.js, TypeScript, Tailwind CSS, and Prisma.

The project now runs in two modes:

| Mode | Use case | Database required |
| --- | --- | --- |
| `local` | Small-scale testing with a few demo patients and a test login | No |
| `postgres` | Advanced development and migration testing | Yes |

`local` mode is the default. It initializes test data from `db.json` and persists runtime changes to `data/local-storage.json`.

## Features

- Patient list and patient detail views
- Medical record and monitoring record APIs
- Session-based authentication
- Demo login account for local testing
- Optional HTTPS development mode for secure browser APIs
- Optional PostgreSQL + Prisma workflow

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env`

```bash
cp .env.example .env
```

The default `.env.example` already enables local mode:

```bash
EHR_STORAGE_MODE=local
```

### 3. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Log in

| Field | Value |
| --- | --- |
| Login ID | `admin` |
| Username | `admin` |
| Password name | `Admin123!` |
| Password | `Admin123!` |

## Local mode

Local mode is intended for development with only a handful of test patients and a demo account.

- No PostgreSQL setup is required
- Initial patient data is read from `db.json`
- Runtime data is saved to `data/local-storage.json`
- `data/local-storage.json` is ignored by git

To reset the local dataset:

```bash
rm -f data/local-storage.json
```

Then restart the app.

## HTTPS mode

Use HTTPS when testing features that require a secure browser context, such as MediaRecorder-based voice input.

```bash
npm run dev:https
```

If you do not already have certificates:

```bash
mkcert -install
mkcert -key-file localhost-key.pem -cert-file localhost.pem localhost 127.0.0.1 ::1
```

Then open `https://localhost:3000`.

## Optional PostgreSQL mode

Switch to PostgreSQL only when you need the Prisma/PostgreSQL-backed workflow.

### 1. Update `.env`

```bash
EHR_STORAGE_MODE=postgres
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/dialog_ehr?schema=public"
POSTGRES_USER=postgres
POSTGRES_PASSWORD=YOUR_PASSWORD
POSTGRES_DB=dialog_ehr
POSTGRES_PORT=5432
```

### 2. Start PostgreSQL

```bash
npm run db:up
```

### 3. Run migrations

```bash
npm run db:generate
npm run db:migrate
```

### 4. Seed patient data

```bash
npm run db:seed
```

### 5. Optional: seed the admin user

```bash
npx tsx scripts/seed-admin.ts
```

## Environment variables

| Variable | Purpose | Default |
| --- | --- | --- |
| `EHR_STORAGE_MODE` | `local` or `postgres` | `local` |
| `DATABASE_URL` | PostgreSQL connection string | unused in local mode |
| `SESSION_SECRET` | `iron-session` secret | development fallback |
| `MAX_FAILED_LOGIN_ATTEMPTS` | Account lock threshold | `5` |

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start local HTTP dev server |
| `npm run dev:https` | Start local HTTPS dev server |
| `npm run build` | Build the app |
| `npm run start` | Start the production server after build |
| `npm run db:up` | Start PostgreSQL with Docker |
| `npm run db:down` | Stop PostgreSQL |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Import `db.json` into PostgreSQL |
| `npm run db:verify` | Verify PostgreSQL schema |

## Project structure

```text
app/                   Next.js routes and API routes
lib/                   Session, auth, DB access, local storage helpers
prisma/                Prisma schema and migrations
scripts/               Data migration and utility scripts
db.json                Source patient data for local initialization
data/local-storage.json Generated local runtime data (not committed)
```

## Notes

- Local mode is the recommended setup for test patients and test login accounts.
- PostgreSQL mode remains available for teams that still want DB-backed development.
- This repository is an **open-source** EHR demo and development environment, not a commercial EHR product.
