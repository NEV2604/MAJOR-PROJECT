import express from "express";

import { ask } from "../controllers/ai.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.post("/ask", ask);

export default router;