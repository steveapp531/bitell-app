import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { completeOnboarding } from "../controllers/onboarding.controller.js";

const router = Router();

router.post("/complete", protect, completeOnboarding);

export default router;
