# HTTPS Setup for MediaRecorder API

## Problem

When accessing the site via Tailscale hostname (e.g., `macbook-m1:3000`), the MediaRecorder API doesn't work because browsers require HTTPS for non-localhost hostnames.

## Solution: Enable HTTPS for Next.js Dev Server

### Step 1: Install mkcert

**macOS:**
```bash
brew install mkcert
```

**Linux:**
```bash
sudo apt install libnss3-tools
wget -qO - https://dl.filippo.io/mkcert/install | sudo bash
```

**Windows:**
```bash
choco install mkcert
```

### Step 2: Install Local CA

```bash
mkcert -install
```

### Step 3: Generate SSL Certificates

Generate certificates for both localhost and your Tailscale hostname:

```bash
# Replace 'macbook-m1' with your actual Tailscale hostname
mkcert -key-file localhost-key.pem -cert-file localhost.pem localhost 127.0.0.1 ::1 macbook-m1
```

This creates:
- `localhost.pem` (certificate)
- `localhost-key.pem` (private key)

### Step 4: Add to .gitignore

Make sure these certificate files are not committed:

```bash
echo "localhost.pem" >> .gitignore
echo "localhost-key.pem" >> .gitignore
```

### Step 5: Run with HTTPS

Use the new dev script:

```bash
npm run dev:https
```

Then access your site at:
- `https://localhost:3000` (works)
- `https://macbook-m1:3000` (works via Tailscale)

## Alternative: Use localhost with Port Forwarding

If you don't want to set up HTTPS, you can use SSH port forwarding:

```bash
ssh -L 3000:localhost:3000 user@macbook-m1
```

Then access via `http://localhost:3000` from your remote machine.

