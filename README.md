# Dialog EHR

> **⚠️ Note:** This application is currently intended as a **hackathon demo / prototype**. It may be developed further for real clinical use in the future.
>
> **License:** Apache 2.0

Dialog EHR is an **open-source** Electronic Health Record system built with Next.js, TypeScript, Tailwind CSS, and Prisma.

The project runs in two modes:

| Mode | Use case | Database required |
| --- | --- | --- |
| `local` | Small-scale testing with a few demo patients and a test login | No |
| `postgres` | Advanced development and migration testing | Yes |

`local` mode is the default. It initializes test data from `db.json` and persists runtime changes to `data/local-storage.json`.

## Features

- Patient list and patient detail views
- Medical record and monitoring record APIs
- Session-based authentication (can be disabled for demo mode)
- Demo login account for local testing
- Optional HTTPS development mode for secure browser APIs
- Optional PostgreSQL + Prisma workflow
- Referral letters and patient summaries

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env`

```bash
cp .env.example .env
```

The default `.env.example` already enables local mode with open access (no login required):

```bash
EHR_STORAGE_MODE=local
EHR_AUTH_REQUIRED=false
```

### 3. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The app is accessible without login in the default configuration.

### 4. Optional: enable login

To require authentication, set in your `.env`:

```bash
EHR_AUTH_REQUIRED=true
```

Then restart the app. Use the demo account to log in:

| Field | Value |
| --- | --- |
| Username | `admin` |
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
| `EHR_AUTH_REQUIRED` | `true` to require login, `false` for open access | `false` |
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

## Deploying to a VPS (Ubuntu)

This section describes how to deploy the app in production on an Ubuntu VPS using PM2.

### 1. Install Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
```

### 2. Install PM2

```bash
npm install -g pm2
```

### 3. Clone the repository

```bash
git clone https://github.com/g150446/dialog-ehr.git /root/dialog-ehr
cd /root/dialog-ehr
```

### 4. Create `.env`

```bash
EHR_STORAGE_MODE=local
EHR_AUTH_REQUIRED=false
SESSION_SECRET="your-random-32-char-secret"
SQUARE_ACCESS_TOKEN=your_token
SQUARE_LOCATION_ID=your_location_id
SQUARE_DEVICE_ID=your_device_id
```

### 5. Copy patient data

`data/local-storage.json` is not committed to git. Copy it from your local machine:

```bash
scp data/local-storage.json root@<your-vps-ip>:/root/dialog-ehr/data/
```

Or reset to defaults on the server:

```bash
# Just start the app — it initializes from db.json on first run
```

### 6. Build and start

```bash
npm install
npm run build
pm2 start npm --name "dialog-ehr" -- start
```

### 7. Set up Nginx reverse proxy (port 80)

```bash
apt-get install -y nginx
```

Create `/etc/nginx/sites-available/dialog-ehr`:

```nginx
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
ln -sf /etc/nginx/sites-available/dialog-ehr /etc/nginx/sites-enabled/dialog-ehr
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx && systemctl enable nginx
```

### 8. Auto-start on reboot

```bash
pm2 save
pm2 startup systemd -u root --hp /root
# Run the printed command to enable the systemd service
```

## PM2 quick reference

| Command | Purpose |
| --- | --- |
| `pm2 start npm --name "dialog-ehr" -- start` | Start the app |
| `pm2 stop dialog-ehr` | Stop the app |
| `pm2 restart dialog-ehr` | Restart the app |
| `pm2 reload dialog-ehr` | Zero-downtime reload |
| `pm2 list` | Show running processes and status |
| `pm2 logs dialog-ehr` | Tail live logs |
| `pm2 logs dialog-ehr --lines 50` | Show last 50 log lines |
| `pm2 monit` | Live CPU/memory monitor |
| `pm2 save` | Persist current process list for auto-restart |
| `pm2 startup` | Generate systemd startup command |
| `pm2 delete dialog-ehr` | Remove the app from PM2 |

## Notes

- Local mode is the recommended setup for test patients and test login accounts.
- PostgreSQL mode remains available for teams that still want DB-backed development.
- This repository is an **open-source** EHR demo and development environment, not a commercial EHR product.
- Authentication can be disabled entirely by setting `EHR_AUTH_REQUIRED=false`. This is useful for demos and prototyping.
