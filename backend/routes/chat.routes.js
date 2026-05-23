import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { chat } from "../controllers/chat.controller.js";

const router = Router();

router.post("/", protect, chat);

export default router;
