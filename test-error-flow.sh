#!/bin/bash

echo "=== InstaAlert Error Tracking Flow Test ==="
echo ""

# Start server
echo "1. Starting server..."
cd server && npm start &
SERVER_PID=$!
sleep 3

echo "2. Testing API key generation (requires valid JWT - manual step)"
echo "   POST /apikey/generate with serverName and Bearer token"
echo ""

echo "3. Testing error report endpoint (requires valid API key)"
echo "   POST /api/error/report with x-api-key header"
echo ""

echo "4. To test the npm package:"
echo "   cd instalert-node"
echo "   Create test-server.js with the example from README.md"
echo "   node test-server.js"
echo ""

echo "=== Setup Instructions ==="
echo "1. Start MongoDB"
echo "2. Create an organization via the frontend"
echo "3. Generate an API key via POST /apikey/generate"
echo "4. Use that key in your server with instalert-node"
echo "5. Trigger an error - watch the AI check for similarity"
echo "6. Check email for notifications"

# Cleanup
kill $SERVER_PID 2>/dev/null
