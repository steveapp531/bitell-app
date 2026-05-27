import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getPayables, createPayable, updatePayable, deletePayable } from "../controllers/payables.controller.js";

const router = Router();

router.use(protect);

router.get("/", getPayables);
router.post("/", createPayable);
router.put("/:id", updatePayable);
router.delete("/:id", deletePayable);

export default router;
