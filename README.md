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

### 7. Login with Default Admin Account

The system creates a default admin account during initial setup:

- **Username:** `admin`
- **Password:** `Admin123!`

**IMPORTANT:** You should change the default password immediately after your first login for security reasons.

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


