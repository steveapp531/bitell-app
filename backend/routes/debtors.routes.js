import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  getDebtors,
  createDebtor,
  updateDebtor,
  deleteDebtor,
} from "../controllers/debtors.controller.js";

const router = Router();

router.use(protect);

router.get("/", getDebtors);
router.post("/", createDebtor);
router.put("/:id", updateDebtor);
router.delete("/:id", deleteDebtor);

export default router;
