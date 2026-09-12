import express from "express";

import {
  create,
  getAll,
  getOne,
  update,
  remove,
} from "../controllers/transaction.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// All transaction routes require authentication
router.use(authenticate);

// Create a transaction
router.post("/", create);

// Get all transactions
router.get("/", getAll);

// Get one transaction
router.get("/:id", getOne);

// Update a transaction
router.put("/:id", update);

// Delete a transaction
router.delete("/:id", remove);

export default router;