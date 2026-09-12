import {
  createBudget,
  getUserBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
} from "../services/budget.service.js";

export async function create(req, res) {
  try {
    const { amount, month, year, categoryId } = req.body;

    if (
      amount === undefined ||
      month === undefined ||
      year === undefined ||
      !categoryId
    ) {
      return res.status(400).json({
        success: false,
        message: "Amount, month, year and category are required",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than zero",
      });
    }

    if (Number(month) < 1 || Number(month) > 12) {
      return res.status(400).json({
        success: false,
        message: "Month must be between 1 and 12",
      });
    }

    if (Number(year) < 2000) {
      return res.status(400).json({
        success: false,
        message: "Invalid year",
      });
    }

    const budget = await createBudget({
      userId: req.user.userId,
      amount,
      month: Number(month),
      year: Number(year),
      categoryId,
    });

    res.status(201).json({
      success: true,
      message: "Budget created successfully",
      budget,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getAll(req, res) {
  try {
    const budgets = await getUserBudgets(req.user.userId);

    res.json({
      success: true,
      budgets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve budgets",
    });
  }
}

export async function getOne(req, res) {
  try {
    const budget = await getBudgetById(
      req.user.userId,
      req.params.id
    );

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    res.json({
      success: true,
      budget,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve budget",
    });
  }
}

export async function update(req, res) {
  try {
    const { amount, month, year, categoryId } = req.body;

    if (amount !== undefined && Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than zero",
      });
    }

    if (
      month !== undefined &&
      (Number(month) < 1 || Number(month) > 12)
    ) {
      return res.status(400).json({
        success: false,
        message: "Month must be between 1 and 12",
      });
    }

    const budget = await updateBudget(
      req.user.userId,
      req.params.id,
      {
        amount,
        month: month !== undefined ? Number(month) : undefined,
        year: year !== undefined ? Number(year) : undefined,
        categoryId,
      }
    );

    res.json({
      success: true,
      message: "Budget updated successfully",
      budget,
    });
  } catch (error) {
    const statusCode =
      error.message === "Budget not found" ||
      error.message === "Category not found"
        ? 404
        : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
}

export async function remove(req, res) {
  try {
    await deleteBudget(
      req.user.userId,
      req.params.id
    );

    res.json({
      success: true,
      message: "Budget deleted successfully",
    });
  } catch (error) {
    const statusCode =
      error.message === "Budget not found" ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
}