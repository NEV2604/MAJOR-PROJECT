import express from "express";

import {
  create,
  getAll,
  getOne,
  update,
  remove,
} from "../controllers/category.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// All category routes require authentication
router.use(authenticate);

// Create category
router.post("/", create);

// Get all categories
router.get("/", getAll);

// Get one category
router.get("/:id", getOne);

// Update category
router.put("/:id", update);

// Delete category
router.delete("/:id", remove);

export default router;