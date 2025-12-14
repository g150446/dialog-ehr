# nginx Configuration for Ollama HTTPS

This directory contains the nginx configuration for exposing Ollama via HTTPS.

## Installation

1. **Install nginx** (if not already installed):
   ```bash
   brew install nginx
   ```

2. **Create nginx servers directory** (if it doesn't exist):
   ```bash
   sudo mkdir -p /opt/homebrew/etc/nginx/servers
   # or for Intel Mac:
   sudo mkdir -p /usr/local/etc/nginx/servers
   ```

3. **Link or copy the configuration file**:
   ```bash
   # Option 1: Create a symlink (recommended - updates automatically)
   sudo ln -s $(pwd)/nginx/ollama.conf /opt/homebrew/etc/nginx/servers/ollama.conf
   
   # Option 2: Copy the file
   sudo cp nginx/ollama.conf /opt/homebrew/etc/nginx/servers/ollama.conf
   ```

4. **Update the main nginx config** to include server configs:
   
   Edit `/opt/homebrew/etc/nginx/nginx.conf` (or `/usr/local/etc/nginx/nginx.conf` for Intel Mac) and ensure it includes:
   ```nginx
   http {
       ...
       include servers/*.conf;
       ...
   }
   ```

5. **Test the configuration**:
   ```bash
   sudo nginx -t
   ```

6. **Start nginx**:
   ```bash
   # Using brew services (recommended)
   brew services start nginx
   
   # Or manually
   sudo nginx
   ```

## Configuration Details

- **Port**: 443 (HTTPS)
- **SSL Certificates**: Uses certificates from `~/caddy-certs/` (SSL certificates directory - name is arbitrary)
- **Upstream**: Points to `127.0.0.1:11434` (local Ollama)
- **Server Names**: Accepts both `localhost` and `macbook-m1`

## Future: Running Ollama on Different Machine

If you move Ollama to a different machine, update the upstream in `ollama.conf`:

```nginx
upstream ollama_backend {
    server ollama-server-ip-or-hostname:11434;
}
```

Then reload nginx:
```bash
sudo nginx -s reload
```

## Troubleshooting

- **Check nginx status**: `brew services list | grep nginx`
- **View nginx logs**: `tail -f /opt/homebrew/var/log/nginx/ollama_error.log`
- **Test configuration**: `sudo nginx -t`
- **Reload configuration**: `sudo nginx -s reload`
- **Stop nginx**: `brew services stop nginx` or `sudo nginx -s stop`

## Notes

- Make sure Ollama is running on port 11434 before starting nginx
- Ensure SSL certificates exist at the specified paths
- Port 443 requires root/sudo privileges to bind
