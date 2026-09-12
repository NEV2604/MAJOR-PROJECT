import {
  createCategory,
  getUserCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../services/category.service.js";

// Create category
export async function create(req, res) {
  try {
    const { name, type } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: "Name and type are required",
      });
    }

    const category = await createCategory({
      userId: req.user.userId,
      name: name.trim(),
      type,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// Get all categories
export async function getAll(req, res) {
  try {
    const categories = await getUserCategories(
      req.user.userId
    );

    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve categories",
    });
  }
}

// Get one category
export async function getOne(req, res) {
  try {
    const category = await getCategoryById(
      req.user.userId,
      req.params.id
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve category",
    });
  }
}

// Update category
export async function update(req, res) {
  try {
    const { name, type } = req.body;

    const category = await updateCategory(
      req.user.userId,
      req.params.id,
      {
        name: name?.trim(),
        type,
      }
    );

    res.json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    const statusCode =
      error.message === "Category not found" ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
}

// Delete category
export async function remove(req, res) {
  try {
    await deleteCategory(
      req.user.userId,
      req.params.id
    );

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    const statusCode =
      error.message === "Category not found" ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
}