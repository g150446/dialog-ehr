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
- mkcert (for HTTPS/SSL certificates - required for `npm run dev:https` or voice input)
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

**Important:**
- When prompted, name your migration (e.g., "init")
- If you see "Drift detected" or schema mismatch errors, run `npx prisma migrate reset` (⚠️ **WARNING: This deletes all data**) or `npx prisma migrate dev` to resolve it
- After migrations complete, verify the schema is in sync (see Step 4.5 below)

#### 4.5. Verify Database Schema (Recommended)

Verify that the database schema matches the Prisma schema to prevent runtime errors:

```bash
npm run db:verify
```

This will check:
- ✅ All migrations are applied
- ✅ Critical tables exist
- ✅ Critical columns exist (including `authorId`, `authorRole`, `authorName` in `medical_records`)
- ✅ Prisma Client is generated correctly

**If verification fails:** Run `npx prisma migrate dev` to sync the schema, then verify again.

### 5. Seed the Database

Import existing patient data from `db.json`:

```bash
npm run db:seed
```

This will migrate all patient data, visits, and medical records from the JSON file to PostgreSQL.

**Optional:** After seeding, create the default admin user:

```bash
npx tsx scripts/seed-admin.ts
```

Default admin credentials:
- Username: `admin`
- Password: `Admin123!`
- ⚠️ **Important:** Change the password after first login!

### 6. Generate SSL Certificates (Required for HTTPS)

SSL certificates are required if you want to:
- Run the development server with HTTPS (`npm run dev:https`)
- Access the app via Tailscale or remote hostname
- Use the voice input feature from non-localhost addresses

**Steps:**

1. **Check if mkcert is installed**:
   ```bash
   which mkcert
   ```

   If not installed, install mkcert:
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

3. **Get your machine's hostname** (needed for remote access):
   ```bash
   hostname
   ```

   Example output: `hirotonoMacBook-Air.local` or `macbook-m1`

4. **Generate SSL certificates** (replace `YOUR-HOSTNAME` with your actual hostname from step 3):
   ```bash
   mkcert -key-file localhost-key.pem -cert-file localhost.pem localhost 127.0.0.1 ::1 YOUR-HOSTNAME
   ```

   Example:
   ```bash
   mkcert -key-file localhost-key.pem -cert-file localhost.pem localhost 127.0.0.1 ::1 hirotonoMacBook-Air hirotonoMacBook-Air.local
   ```

5. **Verify certificate files were created**:
   ```bash
   ls -lh localhost*.pem
   ```

   You should see:
   - `localhost-key.pem` (private key)
   - `localhost.pem` (certificate)

**Note:** The certificate files are already excluded from git via `.gitignore`. They will expire in 3 years and you'll need to regenerate them.

**⚠️ Important:** If you skip this step and try to run `npm run dev:https`, you will get an error:
```
Error: ENOENT: no such file or directory, open 'localhost-key.pem'
```

**Skip this step only if:** You only need local HTTP access (`npm run dev`) and don't need voice input or remote access. If you plan to use HTTPS mode, you **must** complete this step first.

### 7. Start the Development Server

**Option A: HTTP (for local development only)**
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

**Option B: HTTPS (for remote access or voice input)**
```bash
npm run dev:https
```
Access via:
- `https://localhost:3000` (local access)
- `https://YOUR-HOSTNAME:3000` (remote/Tailscale access)

**⚠️ IMPORTANT:** Running `npm run dev:https` **requires SSL certificates from Step 6**. 

**If you see this error:**
```
Error: ENOENT: no such file or directory, open 'localhost-key.pem'
```

**This means:** You skipped Step 6 (Generate SSL Certificates) or the certificate files don't exist. You **must** complete Step 6 before running `npm run dev:https`. See the [Troubleshooting section](#error-enoent-no-such-file-or-directory-open-localhost-keypem) below for detailed fix instructions.

**To stop the development server:**
- If running in foreground: Press `Ctrl+C` in the terminal
- If running in background: Find and kill the process:
  ```bash
  # Find and kill process on port 3000
  lsof -ti:3000 | xargs kill -9

  # Or find the process ID first
  lsof -ti:3000
  # Then kill it
  kill -9 <PID>
  ```

### 8. Start Whisper Transcription Server (Optional - for Voice Input)

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

### Setup Verification Checklist

After completing the setup, verify everything is working:

```bash
# 1. Verify database schema is in sync
npm run db:verify

# 2. Check that patients were seeded
npm run db:check

# 3. Start the development server
npm run dev
# or
npm run dev:https
```

**Expected results:**
- ✅ Schema verification passes (all tables and columns exist)
- ✅ Patient count shows 3 patients
- ✅ Development server starts without errors
- ✅ Patient list page loads without errors

If any step fails, see the [Troubleshooting](#troubleshooting) section below.

## Troubleshooting

### Error: ENOENT: no such file or directory, open 'localhost-key.pem'

**Problem:** You tried to run `npm run dev:https` but the SSL certificate files don't exist.

**Error message you'll see:**
```
⚠ Self-signed certificates are currently an experimental feature, use with caution.
Unhandled Rejection: Error: ENOENT: no such file or directory, open '/path/to/dialog-ehr/localhost-key.pem'
```

**Why this happens:**
- You skipped Step 6 (Generate SSL Certificates) in the setup process
- The certificate files (`localhost-key.pem` and `localhost.pem`) were deleted or never created
- You're trying to run HTTPS mode without the required SSL certificates

**Solution:** Complete Step 6 (Generate SSL Certificates) before running the HTTPS dev server:

```bash
# 1. Check if mkcert is installed
which mkcert

# 2. Install mkcert if needed (macOS)
brew install mkcert

# 3. Install the local CA (if not already installed)
mkcert -install

# 4. Get your machine's hostname
hostname
# Example output: hirotonoMacBook-Air.local

# 5. Generate SSL certificates (replace YOUR-HOSTNAME with your actual hostname from step 4)
mkcert -key-file localhost-key.pem -cert-file localhost.pem localhost 127.0.0.1 ::1 YOUR-HOSTNAME

# Example with actual hostname:
# mkcert -key-file localhost-key.pem -cert-file localhost.pem localhost 127.0.0.1 ::1 hirotonoMacBook-Air.local

# 6. Verify certificate files were created
ls -lh localhost*.pem
# You should see:
# - localhost-key.pem (private key)
# - localhost.pem (certificate)

# 7. Now you can run HTTPS server
npm run dev:https
```

**Alternative:** If you don't need HTTPS, use HTTP mode instead:
```bash
npm run dev
```

**Note:** The certificate files are excluded from git (via `.gitignore`), so each developer needs to generate them in their own environment. Certificates expire in 3 years and will need to be regenerated.

### Error: The column `medical_records.authorId` does not exist in the current database

**Problem:** The database schema is out of sync with the Prisma schema. This happens when:
- The Prisma schema was updated but migrations weren't run
- Migrations were applied in a different order than expected
- The database was manually modified

**Error message you'll see:**
```
Invalid `prisma.patient.findMany()` invocation
The column `medical_records.authorId` does not exist in the current database.
```

**Why this happens:**
- The Prisma schema defines fields (like `authorId`, `authorRole`, `authorName` in `MedicalRecord`) that don't exist in the actual database
- Prisma Client was generated with the schema, but the database wasn't updated to match

**Solution:** Run database migrations to sync the schema:

```bash
# 1. Verify what's wrong (optional but recommended)
npm run db:verify

# 2. Check migration status
npx prisma migrate status

# 3. If migrations are pending or schema is out of sync, run migrations
npx prisma migrate dev

# 4. Regenerate Prisma Client (usually done automatically, but can run manually)
npx prisma generate

# 5. Verify the schema is now correct
npm run db:verify

# 6. Restart your development server
npm run dev
# or
npm run dev:https
```

**Prevention:** Always run `npm run db:verify` after setup or after pulling new migrations to catch schema mismatches early.

**If migrations fail or you're in a development environment**, you can reset the database (⚠️ **WARNING: This deletes all data**):

```bash
# Reset database and reapply all migrations
npx prisma migrate reset

# Then reseed the database
npm run db:seed
```

**Prevention:** Always run `npx prisma migrate dev` after updating the Prisma schema to ensure the database stays in sync.

### Database Connection Error: Authentication failed

**Problem:** Cannot connect to PostgreSQL database.

**Solution:**

1. Make sure PostgreSQL container is running:
   ```bash
   npm run db:up
   ```

2. Check your `.env` file has the correct credentials:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dialog_ehr?schema=public"
   POSTGRES_PASSWORD=postgres
   ```

3. Restart the PostgreSQL container:
   ```bash
   npm run db:down
   npm run db:up
   ```

### Voice Input Not Working

**Problem:** Voice recording button doesn't work or shows errors.

**Solutions:**

1. **If accessing via non-localhost hostname:** You need HTTPS. Complete Step 6 and run `npm run dev:https`.

2. **Whisper server not running:** Start the Whisper transcription server:
   ```bash
   pip install -r requirements.txt
   python whisper_server.py
   ```

3. **Browser doesn't support MediaRecorder API:** Use a modern browser (Chrome, Edge, Firefox, Safari).

## Security Best Practices

### Critical Security Configuration

**IMPORTANT:** This repository includes default configuration that is **NOT secure for production use**. Before deploying to production, you MUST implement the following security measures:

#### 1. Restrict Database Port Access

The `docker-compose.yml` has been configured to bind PostgreSQL to localhost only:

```yaml
ports:
  - "127.0.0.1:5432:5432"  # Only accessible from localhost
```

**What this prevents:** Direct access to your PostgreSQL database from the internet. Without this restriction, attackers can scan for open PostgreSQL ports and attempt to gain access.

**Verification:**
```bash
# Check that PostgreSQL is only bound to localhost
ss -tlnp | grep 5432
# Should show: 127.0.0.1:5432 (NOT 0.0.0.0:5432)
```

#### 2. Use Strong Database Passwords

The default password `postgres` is **extremely insecure** and must be changed for production.

**Generate a strong password:**
```bash
openssl rand -base64 32
```

**Update your `.env` file:**
```env
POSTGRES_PASSWORD=YOUR_GENERATED_STRONG_PASSWORD_HERE
DATABASE_URL="postgresql://postgres:YOUR_GENERATED_STRONG_PASSWORD_HERE@localhost:5432/dialog_ehr?schema=public"
```

**IMPORTANT:**
- Never commit the `.env` file to version control (it's already in `.gitignore`)
- Use different passwords for development, testing, and production environments
- Store production passwords in a secure secrets management system

#### 3. Additional Production Security Measures

For production deployments, also consider:

- **Enable firewall:** Use `ufw` or `iptables` to restrict incoming connections
- **Use SSL/TLS:** Enable SSL for PostgreSQL connections
- **Regular backups:** Implement automated database backups
- **Monitor access logs:** Set up alerting for suspicious database access patterns
- **Network isolation:** Use Docker networks to isolate database from public internet
- **Keep software updated:** Regularly update PostgreSQL, Node.js, and dependencies

**Example firewall setup:**
```bash
sudo ufw enable
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
# Do NOT allow 5432/tcp (PostgreSQL should not be accessible from internet)
```

### Real-World Security Incident

This security guidance was added after a ransomware attack on a development instance where:
- PostgreSQL port 5432 was exposed to the internet (0.0.0.0:5432)
- Default password `postgres` was used
- No firewall was enabled
- The database was completely deleted and replaced with a ransom note

**The attack happened within hours of the database being exposed.** This demonstrates how quickly automated scanners find and exploit insecure configurations.

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
- `npm run db:verify` - Verify database schema is in sync (prevents runtime errors)
- `npm run db:check` - Check if patient data exists in database
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

## Infrastructure Components

This application uses several infrastructure components for enhanced functionality and remote access:

### Ollama

[Ollama](https://ollama.ai/) is a local LLM (Large Language Model) runtime that allows you to run AI models locally on your machine. This project uses the **ehr-gemma** model, which is specifically trained for Electronic Health Record (EHR) data extraction and processing.

**Purpose in this project:**
- Extracts structured medical data (vital signs, measurements) from natural language input
- Processes Japanese medical terminology and converts it to structured JSON format
- Runs locally for privacy and data security (no data sent to external services)

**Setup:**
1. Install Ollama: `brew install ollama` (or download from [ollama.ai](https://ollama.ai))
2. Pull the ehr-gemma model: `ollama pull ehr-gemma`
3. Start Ollama server: `ollama serve` (runs on `http://localhost:11434` by default)

**Access via HTTPS:**
- The application accesses Ollama through an nginx reverse proxy for HTTPS support
- Configure the Ollama server URL in the application settings (Settings page)
- Default: `https://localhost:443` (local) or `https://macbook-m1:443` (via Tailscale)

See `HTTPS_SETUP.md` for detailed setup instructions.

### Tailscale

[Tailscale](https://tailscale.com/) is a VPN service that creates a secure mesh network between your devices using WireGuard. It allows you to access services running on remote machines as if they were on your local network.

**Purpose in this project:**
- Enables remote access to the EHR application from other devices
- Allows healthcare providers to access patient data securely from different locations
- Provides secure, encrypted connections without complex firewall configuration

**Setup:**
1. Install Tailscale on your machine: `brew install tailscale` (or download from [tailscale.com](https://tailscale.com))
2. Sign in to your Tailscale account
3. Your machine will get a hostname (e.g., `macbook-m1`) that other Tailscale devices can access
4. Access the application via `https://macbook-m1:3000` from any device on your Tailscale network

**Benefits:**
- No need to expose ports to the public internet
- Automatic encryption and authentication
- Works behind NAT/firewalls without configuration
- Easy device management through Tailscale dashboard

### nginx

[nginx](https://nginx.org/) is a high-performance web server and reverse proxy. In this project, nginx is used as a reverse proxy to provide HTTPS access to the Ollama server.

**Purpose in this project:**
- Provides HTTPS termination for Ollama API requests
- Enables secure access to Ollama from the Next.js application
- Supports both localhost and Tailscale hostname access
- Handles SSL/TLS certificate management

**Setup:**
1. Install nginx: `brew install nginx`
2. Run the setup script: `./nginx/setup.sh`
3. Start nginx: `brew services start nginx`
4. nginx will proxy requests from `https://localhost:443` or `https://macbook-m1:443` to Ollama at `http://localhost:11434`

**Configuration:**
- Configuration file: `nginx/ollama.conf`
- SSL certificates: Uses certificates from `~/caddy-certs/` (generated with mkcert)
- Logs: `/opt/homebrew/var/log/nginx/ollama_*.log`

See `nginx/README.md` and `HTTPS_SETUP.md` for detailed setup and troubleshooting.

## Documentation

Specification documents for each page and feature are available in the `docs/specifications/` directory. These documents provide detailed information about:
- Page layouts and UI components
- Data models and API contracts
- Business rules and validation logic
- User interactions and workflows

For example:
- `docs/specifications/pages/patient-list.md` - Patient list page specifications
- `docs/specifications/pages/patient-detail.md` - Patient detail page specifications


