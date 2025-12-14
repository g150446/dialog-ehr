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

## Ollama HTTPS Setup with nginx

To access Ollama's EHR-Gemma model via HTTPS, we use nginx as a reverse proxy.

### Prerequisites

1. **Install nginx:**
   ```bash
   brew install nginx
   ```

2. **Generate SSL certificates for Ollama** (if not already done):
   ```bash
   # Create SSL certificates directory (directory name is arbitrary)
   mkdir -p ~/caddy-certs
   mkcert -key-file ~/caddy-certs/macbook-m1.key -cert-file ~/caddy-certs/macbook-m1.crt macbook-m1 localhost 127.0.0.1
   ```

### Step 1: Setup nginx Configuration

The nginx configuration is located in the `nginx/` directory of this repository.

Run the setup script:

```bash
cd /path/to/dialog-ehr
./nginx/setup.sh
```

This script will:
- Create the nginx servers directory if needed
- Link the configuration file to nginx's servers directory
- Update the main nginx config to include server configs
- Test the configuration

Alternatively, you can manually set it up:

```bash
# Create servers directory
sudo mkdir -p /opt/homebrew/etc/nginx/servers
# (or /usr/local/etc/nginx/servers for Intel Mac)

# Link the config file
sudo ln -s $(pwd)/nginx/ollama.conf /opt/homebrew/etc/nginx/servers/ollama.conf

# Ensure main nginx.conf includes servers
# Edit /opt/homebrew/etc/nginx/nginx.conf and add:
#   include servers/*.conf;
```

### Step 2: Start Ollama

Make sure Ollama is running on the default port:

```bash
ollama serve
```

Or if it's already running as a service, verify it's accessible:

```bash
curl http://localhost:11434/api/tags
```

### Step 3: Start nginx

Start nginx using Homebrew services (recommended):

```bash
brew services start nginx
```

Or start manually:

```bash
sudo nginx
```

Verify nginx is running:

```bash
brew services list | grep nginx
# or
lsof -i :443 | grep nginx
```

### Step 4: Test the Setup

Run the test script:

```bash
./test-ollama-https.sh
```

Or test manually with curl:

```bash
# List available models (localhost)
curl -k https://localhost:443/api/tags

# List available models (Tailscale hostname)
curl -k https://macbook-m1:443/api/tags

# Test generation (if ehr-gemma model exists)
curl -k -X POST https://localhost:443/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "ehr-gemma",
    "prompt": "Hello",
    "stream": false
  }'
```

**Note:** The `-k` flag skips certificate verification. For production use, you should add the certificate to your system's trust store.

### Step 5: Configure in Application

In your application settings, set the Ollama server URL to:

```
https://localhost:443
```

Or for remote access via Tailscale:

```
https://macbook-m1:443
```

### Troubleshooting

1. **nginx won't start:**
   - Check if port 443 is already in use: `lsof -i :443`
   - Make sure you have permission to bind to port 443 (may need `sudo`)
   - Test configuration: `sudo nginx -t`
   - Check nginx error logs: `tail -f /opt/homebrew/var/log/nginx/error.log`

2. **Certificate errors:**
   - Verify certificates exist: `ls -la ~/caddy-certs/` (or your SSL certificates directory)
   - Check certificate paths in `nginx/ollama.conf` match your setup
   - Regenerate certificates if needed
   - Use `-k` flag in curl for testing

3. **Connection refused:**
   - Verify Ollama is running: `curl http://localhost:11434/api/tags`
   - Check nginx is running: `brew services list | grep nginx`
   - Verify nginx config is linked: `ls -la /opt/homebrew/etc/nginx/servers/ollama.conf`

4. **403 Forbidden errors:**
   - Check nginx error logs: `tail -f /opt/homebrew/var/log/nginx/ollama_error.log`
   - Verify `server_name` in config includes your hostname
   - Ensure main nginx.conf includes `servers/*.conf`

5. **Hostname resolution:**
   - If using `macbook-m1`, make sure it resolves (check Tailscale or `/etc/hosts`)
   - For local testing, use `localhost:443`

### Running nginx as a Service

nginx is already set up as a service via Homebrew:

```bash
# Start nginx
brew services start nginx

# Stop nginx
brew services stop nginx

# Restart nginx
brew services restart nginx

# Check status
brew services list | grep nginx
```

### Future: Running Ollama on Different Machine

If you move Ollama to a different machine, update the upstream in `nginx/ollama.conf`:

```nginx
upstream ollama_backend {
    server ollama-server-ip-or-hostname:11434;
}
```

Then reload nginx:

```bash
sudo nginx -s reload
```

See `nginx/README.md` for more details.



