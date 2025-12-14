#!/bin/bash

# Setup script for nginx Ollama reverse proxy
# This script helps configure nginx to use the Ollama configuration

set -e

echo "Setting up nginx for Ollama HTTPS reverse proxy..."
echo ""

# Detect Homebrew prefix
if [ -d "/opt/homebrew" ]; then
    NGINX_PREFIX="/opt/homebrew"
    echo "Detected Apple Silicon Mac (Homebrew in /opt/homebrew)"
elif [ -d "/usr/local" ]; then
    NGINX_PREFIX="/usr/local"
    echo "Detected Intel Mac (Homebrew in /usr/local)"
else
    echo "Error: Could not detect Homebrew installation"
    exit 1
fi

NGINX_ETC="${NGINX_PREFIX}/etc/nginx"
NGINX_SERVERS="${NGINX_ETC}/servers"
NGINX_CONF="${NGINX_ETC}/nginx.conf"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_FILE="${PROJECT_ROOT}/nginx/ollama.conf"

echo "Project root: ${PROJECT_ROOT}"
echo "Config file: ${CONFIG_FILE}"
echo ""

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
    echo "Error: nginx is not installed"
    echo "Please install nginx first:"
    echo "  brew install nginx"
    exit 1
fi

echo "✓ nginx is installed"
echo ""

# Create servers directory if it doesn't exist
if [ ! -d "${NGINX_SERVERS}" ]; then
    echo "Creating nginx servers directory..."
    sudo mkdir -p "${NGINX_SERVERS}"
    echo "✓ Created ${NGINX_SERVERS}"
else
    echo "✓ Servers directory exists: ${NGINX_SERVERS}"
fi
echo ""

# Check if config file exists
if [ ! -f "${CONFIG_FILE}" ]; then
    echo "Error: Configuration file not found: ${CONFIG_FILE}"
    exit 1
fi

# Create symlink or copy
if [ -L "${NGINX_SERVERS}/ollama.conf" ]; then
    echo "Symlink already exists, removing old one..."
    sudo rm "${NGINX_SERVERS}/ollama.conf"
fi

if [ -f "${NGINX_SERVERS}/ollama.conf" ]; then
    echo "Configuration file already exists at ${NGINX_SERVERS}/ollama.conf"
    read -p "Overwrite? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo rm "${NGINX_SERVERS}/ollama.conf"
    else
        echo "Skipping file creation"
        exit 0
    fi
fi

echo "Creating symlink to configuration file..."
sudo ln -s "${CONFIG_FILE}" "${NGINX_SERVERS}/ollama.conf"
echo "✓ Created symlink: ${NGINX_SERVERS}/ollama.conf -> ${CONFIG_FILE}"
echo ""

# Check if main nginx.conf includes servers directory
if ! grep -q "include servers/\*.conf;" "${NGINX_CONF}" 2>/dev/null; then
    echo "Warning: Main nginx.conf doesn't include servers/*.conf"
    echo "You may need to add this line to the http block in ${NGINX_CONF}:"
    echo "  include servers/*.conf;"
    echo ""
    read -p "Would you like to add it automatically? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Try to add it after the http { line
        if grep -q "^http {" "${NGINX_CONF}" 2>/dev/null; then
            # Use a temporary file for safety
            TMP_FILE=$(mktemp)
            awk '/^http \{/ {print; print "    include servers/*.conf;"; next}1' "${NGINX_CONF}" > "${TMP_FILE}"
            sudo mv "${TMP_FILE}" "${NGINX_CONF}"
            echo "✓ Added include directive to nginx.conf"
        else
            echo "Could not automatically add include directive. Please add it manually."
        fi
    fi
    echo ""
fi

# Test nginx configuration
echo "Testing nginx configuration..."
if sudo nginx -t; then
    echo "✓ nginx configuration is valid"
else
    echo "✗ nginx configuration test failed"
    exit 1
fi
echo ""

echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Make sure Ollama is running: curl http://localhost:11434/api/tags"
echo "2. Start nginx:"
echo "   brew services start nginx"
echo "   (or: sudo nginx)"
echo "3. Test the setup:"
echo "   curl -k https://localhost:443/api/tags"
echo ""
