#!/bin/bash

# Test script for Ollama HTTPS access via nginx
# This script tests the Ollama API through the nginx reverse proxy

echo "Testing Ollama HTTPS access via nginx..."
echo ""

# Check if nginx is running
echo "0. Checking if nginx is running..."
if lsof -i :443 | grep -q nginx; then
    echo "   ✓ nginx is running on port 443"
else
    echo "   ✗ nginx is not running on port 443"
    echo "   Please start nginx first:"
    echo "     brew services start nginx"
    echo "     (or: sudo nginx)"
    exit 1
fi

# Check if Ollama is running on the default port
echo ""
echo "1. Checking if Ollama is running on port 11434..."
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "   ✓ Ollama is running on port 11434"
else
    echo "   ✗ Ollama is not running on port 11434"
    echo "   Please start Ollama first: ollama serve"
    exit 1
fi

echo ""
echo "2. Testing HTTPS access via nginx (localhost:443)..."
echo "   Using -k flag to skip certificate verification (self-signed cert)"
echo ""

# Test 1: List available models via localhost
echo "   Testing: GET /api/tags (list models)"
response=$(curl -k -s -w "\nHTTP Status: %{http_code}\n" https://localhost:443/api/tags 2>&1)
http_code=$(echo "$response" | tail -1 | grep -o '[0-9]\{3\}' || echo "000")
if [ "$http_code" = "200" ]; then
    echo "   ✓ Success! Models retrieved:"
    echo "$response" | head -1 | python3 -m json.tool 2>/dev/null | grep '"name"' | head -3 || echo "$response" | head -1
else
    echo "   ✗ Failed with HTTP $http_code"
    echo "$response" | tail -10
fi
echo ""

# Test 2: Test with macbook-m1 hostname
echo "3. Testing HTTPS access via nginx (macbook-m1:443)..."
response=$(curl -k -s -w "\nHTTP Status: %{http_code}\n" https://macbook-m1:443/api/tags 2>&1)
http_code=$(echo "$response" | tail -1 | grep -o '[0-9]\{3\}' || echo "000")
if [ "$http_code" = "200" ]; then
    echo "   ✓ Success! nginx handles Tailscale hostname correctly"
    echo "$response" | head -1 | python3 -m json.tool 2>/dev/null | grep '"name"' | head -3 || echo "$response" | head -1
elif [ "$http_code" = "403" ]; then
    echo "   ⚠ Returned HTTP 403"
    echo "   Check nginx configuration and server_name directive"
    echo "$response" | tail -5
else
    echo "   ⚠ Returned HTTP $http_code"
    echo "$response" | tail -5
fi
echo ""

# Test 3: Test a simple generate request (if ehr-gemma model exists)
echo "4. Testing model generation with ehr-gemma..."
echo "   Testing: POST /api/generate"
response=$(curl -k -s -X POST https://localhost:443/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "ehr-gemma",
    "prompt": "Hello",
    "stream": false
  }' \
  -w "\nHTTP Status: %{http_code}\n" 2>&1)
http_code=$(echo "$response" | tail -1 | grep -o '[0-9]\{3\}' || echo "000")
if [ "$http_code" = "200" ]; then
    echo "   ✓ Success! Model generated response"
    echo "$response" | head -1 | python3 -m json.tool 2>/dev/null | grep -E '(response|done)' | head -2 || echo "Response received"
else
    echo "   ✗ Failed with HTTP $http_code"
    echo "$response" | tail -5
fi
echo ""

echo "Summary:"
echo "  - localhost:443 should work for local testing"
echo "  - macbook-m1:443 should work for remote access via Tailscale"
echo "  - Use 'https://localhost:443' or 'https://macbook-m1:443' in your application settings"
echo ""
echo "Working test commands:"
echo "  curl -k https://localhost:443/api/tags"
echo "  curl -k https://macbook-m1:443/api/tags"
