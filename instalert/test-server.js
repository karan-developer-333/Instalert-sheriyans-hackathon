/**
 * Test Server — for testing InstaAlert error reporting via API key
 * 
 * This simulates a production server that has various routes,
 * some of which throw errors. The global error handler catches
 * them and reports to InstaAlert using the API key.
 * 
 * Usage:
 *   1. Generate an API key from the InstaAlert dashboard (/dashboard/api-keys)
 *   2. Paste it below in INSTALERT_API_KEY
 *   3. Run: node test-server.js
 *   4. Hit the error routes to trigger reports
 */

import express from "express";
import { createRequire } from 'module';

// ===== CONFIGURATION =====
const PORT = 4000;
const INSTALERT_API_KEY = process.env.INSTALERT_API_KEY || "ik_live_YOUR_KEY_HERE";
const SERVER_NAME = "test-server";
// =========================

const require = createRequire(import.meta.url);
const { init: instalertInit, expressMiddleware, captureError } = require('./index.js');

const app = express();
app.use(express.json());

// ---------- InstaAlert Error Tracking ----------
instalertInit({
  apiKey: INSTALERT_API_KEY,
  serverName: SERVER_NAME,
  metadata: {
    environment: 'test',
    version: '1.0.0'
  }
});

// Health check (this works fine)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// ---------- WORKING ROUTES ----------
app.get("/", (req, res) => {
  res.json({
    name: "Test Server",
    status: "running",
    routes: {
      "GET /":              "This info page",
      "GET /api/health":    "Health check (works fine)",
      "GET /api/users":     "Returns users (works fine)",
      "GET /api/crash":     "💥 Throws a TypeError",
      "GET /api/timeout":   "💥 Simulates a timeout error",
      "GET /api/db-error":  "💥 Simulates a database connection error",
      "GET /api/auth-fail": "💥 Simulates an auth failure",
      "GET /api/not-found": "💥 Simulates a resource not found error",
      "POST /api/payment":  "💥 Simulates a payment processing error",
    },
  });
});

app.get("/api/users", (req, res) => {
  res.json([
    { id: 1, name: "Karan", email: "karan@demo.com" },
    { id: 2, name: "Manas", email: "manas@demo.com" },
    { id: 3, name: "Rahul", email: "rahul@demo.com" },
  ]);
});

// ---------- ERROR ROUTES ----------

// 1. TypeError — accessing property of undefined
app.get("/api/crash", (req, res) => {
  const user = undefined;
  // This will throw: Cannot read properties of undefined (reading 'name')
  res.json({ name: user.name });
});

// 2. Timeout error
app.get("/api/timeout", (req, res) => {
  const err = new Error("Request timed out after 30000ms — upstream service not responding");
  err.statusCode = 504;
  throw err;
});

// 3. Database connection error
app.get("/api/db-error", (req, res) => {
  const err = new Error("MongoServerError: connection pool cleared, retries exhausted — ECONNREFUSED 127.0.0.1:27017");
  err.statusCode = 503;
  throw err;
});

// 4. Auth failure
app.get("/api/auth-fail", (req, res) => {
  const err = new Error("JsonWebTokenError: jwt malformed — invalid token signature");
  err.statusCode = 401;
  throw err;
});

// 5. Resource not found
app.get("/api/not-found", (req, res) => {
  const err = new Error("Resource not found: Order #ORD-99281 does not exist");
  err.statusCode = 404;
  throw err;
});

// 6. Payment processing error
app.post("/api/payment", (req, res) => {
  const err = new Error("PaymentProcessingError: Card declined — insufficient funds (code: card_declined)");
  err.statusCode = 402;
  throw err;
});

// Use express middleware to capture request errors
app.use(expressMiddleware());

// ---------- START ----------
app.listen(PORT, () => {
  console.log(`\n🚀 Test server running on http://localhost:${PORT}`);
  console.log(`🔑 API Key: ${INSTALERT_API_KEY.substring(0, 15)}...`);
  console.log(`🖥️  Server Name: ${SERVER_NAME}`);
  console.log(`\n📋 Try these error routes:`);
  console.log(`   curl http://localhost:${PORT}/api/crash`);
  console.log(`   curl http://localhost:${PORT}/api/timeout`);
  console.log(`   curl http://localhost:${PORT}/api/db-error`);
  console.log(`   curl http://localhost:${PORT}/api/auth-fail`);
  console.log(`   curl http://localhost:${PORT}/api/not-found`);
  console.log(`   curl -X POST http://localhost:${PORT}/api/payment`);
  console.log(``);
});
