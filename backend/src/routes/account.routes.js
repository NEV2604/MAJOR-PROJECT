import express from "express";

import {
  create,
  getAll,
  getOne,
  update,
  remove,
} from "../controllers/account.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// All account routes require authentication
router.use(authenticate);

// Create an account
router.post("/", create);

// Get all accounts for the logged-in user
router.get("/", getAll);

// Get one account
router.get("/:id", getOne);

// Update an account
router.put("/:id", update);

// Delete an account
router.delete("/:id", remove);

export default router;