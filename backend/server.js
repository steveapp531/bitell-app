import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { connectDB } from "./utils/db.js";
import authRoutes from "./routes/auth.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import statsRoutes from "./routes/stats.routes.js";
import onboardingRoutes from "./routes/onboarding.routes.js";
import debtorsRoutes from "./routes/debtors.routes.js";
import payablesRoutes from "./routes/payables.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { checkEmailConfig, verifyEmailTransporter } from "./utils/email.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
await connectDB();

// CORS Configuration - FIXED
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map(origin => origin.trim())
  .filter(origin => origin.length > 0);

// Enhanced CORS middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is allowed
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      console.warn(`Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error(`CORS policy blocked request from ${origin}`));
    }
  },
  credentials: true, // Allow cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Credentials'
  ],
  exposedHeaders: ['Authorization', 'Content-Type'],
  optionsSuccessStatus: 200,
  preflightContinue: false,
}));

// Handle preflight requests explicitly
app.options('*', cors());

// Body parsing middleware with increased limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Timeout configuration
app.use((req, res, next) => {
  req.setTimeout(600000);
  res.setTimeout(600000);
  next();
});

// Request logging middleware (helpful for debugging)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ 
    status: "ok", 
    message: "Bitell API v2 running",
    timestamp: new Date().toISOString(),
    allowedOrigins: allowedOrigins
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/debtors", debtorsRoutes);
app.use("/api/payables", payablesRoutes);
app.use("/api/chat", chatRoutes);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    error: "Not Found", 
    message: `Route ${req.method} ${req.path} does not exist` 
  });
});

// Error handling middleware
app.use(errorHandler);

// Initialize email services
checkEmailConfig();
verifyEmailTransporter();

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀  Bitell API v2 running at http://localhost:${PORT}`);
  console.log(`📡  CORS enabled for origins: ${allowedOrigins.join(', ')}`);
  console.log(`🔗  Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐  Auth endpoints:`);
  console.log(`     POST /api/auth/register`);
  console.log(`     POST /api/auth/login`);
  console.log(`     POST /api/auth/logout`);
  console.log(`📤  Upload:    /api/upload (JWT required)`);
  console.log(`📊  Stats:     /api/stats/public`);
  console.log(`💬  Chat:      /api/chat`);
  console.log(`👥  Debtors:   /api/debtors`);
  console.log(`💰  Payables:  /api/payables`);
  console.log(`📝  Onboarding: /api/onboarding`);
  console.log(`✨  Server ready!\n`);
});

export default app;