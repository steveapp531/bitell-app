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
import chatRoutes from "./routes/chat.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { checkEmailConfig, verifyEmailTransporter } from "./utils/email.js";

const app = express();
const PORT = process.env.PORT || 5000;

await connectDB();

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map(origin => origin.trim());

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

app.use((req, res, next) => {
  req.setTimeout(600000);
  res.setTimeout(600000);
  next();
});

app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", message: "Bitell API v2 running" })
);
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/debtors", debtorsRoutes);
app.use("/api/chat", chatRoutes);

app.use(errorHandler);

checkEmailConfig();
verifyEmailTransporter();

app.listen(PORT, () => {
  console.log(`\n🚀  Bitell API v2 running at http://localhost:${PORT}`);
  console.log(`    Auth:    /api/auth/register | /api/auth/login`);
  console.log(`    Upload:  /api/upload  (JWT required)`);
  console.log(`    Stats:   /api/stats/public\n`);
});

export default app;
