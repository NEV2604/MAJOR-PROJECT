import express from "express";

import { getAnalyticsData } from "../controllers/analytics.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getAnalyticsData);

export default router;