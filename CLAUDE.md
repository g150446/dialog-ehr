# Claude Code Instructions

This file contains important instructions for Claude Code when working on this project.

## Development Server

### When to Use HTTP vs HTTPS

**Use HTTP (for Claude's own testing):**
```bash
npm run dev > /tmp/dev-server.log 2>&1 &
```

Use HTTP mode when:
- Testing APIs with curl
- Running automated tests
- Backend-only testing
- No browser interaction required

**Use HTTPS (when asking user to test):**
```bash
npm run dev:https > /tmp/dev-server.log 2>&1 &
```

Use HTTPS mode when:
- Asking user to test in browser
- Testing voice input features (MediaRecorder API)
- Testing authentication flows in browser
- User needs to access via non-localhost hostname

### Why This Distinction?

- HTTP is simpler for API testing with curl
- HTTPS is required for browser features like MediaRecorder API
- HTTPS requires self-signed certificate acceptance in browser

### Checking Server Status

After starting the server, verify it's running:
```bash
tail -30 /tmp/dev-server.log
```

Expected output should show:
```
- Local:         https://localhost:3000
- Network:       https://0.0.0.0:3000
```

### Stopping the Dev Server

**IMPORTANT:** Always stop the dev server after completing your tests.

```bash
pkill -f "next dev"
```

Verify it's stopped:
```bash
ps aux | grep "next dev" | grep -v grep || echo "No dev server running"
```

**When to Stop:**
- After completing API tests with curl
- After finishing any testing session
- Before ending the conversation
- When switching between HTTP and HTTPS modes

## SSL Certificates

The project uses self-signed certificates:
- `localhost-key.pem` (private key)
- `localhost.pem` (certificate)

These are already set up in the project root directory.

## Important Notes

- Always use HTTPS URLs when testing (https://localhost:3000)
- Self-signed certificate warnings in browser are expected
- The server binds to 0.0.0.0 to allow remote access
