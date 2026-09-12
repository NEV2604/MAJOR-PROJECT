import express from "express";

import { getDashboard } from "../controllers/dashboard.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Dashboard requires authentication
router.use(authenticate);

// Get dashboard data
router.get("/", getDashboard);

export default router;