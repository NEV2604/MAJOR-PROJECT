import {
  createGoal,
  getUserGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
} from "../services/goal.service.js";

export async function create(req, res) {
  try {
    const {
      name,
      targetAmount,
      currentAmount,
      targetDate,
    } = req.body;

    if (!name || targetAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name and target amount are required",
      });
    }

    if (Number(targetAmount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Target amount must be greater than zero",
      });
    }

    if (
      currentAmount !== undefined &&
      Number(currentAmount) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Current amount cannot be negative",
      });
    }

    const goal = await createGoal({
      userId: req.user.userId,
      name: name.trim(),
      targetAmount,
      currentAmount,
      targetDate,
    });

    res.status(201).json({
      success: true,
      message: "Goal created successfully",
      goal,
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
    const goals = await getUserGoals(req.user.userId);

    res.json({
      success: true,
      goals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve goals",
    });
  }
}

export async function getOne(req, res) {
  try {
    const goal = await getGoalById(
      req.user.userId,
      req.params.id
    );

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found",
      });
    }

    res.json({
      success: true,
      goal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve goal",
    });
  }
}

export async function update(req, res) {
  try {
    const {
      name,
      targetAmount,
      currentAmount,
      targetDate,
    } = req.body;

    if (
      targetAmount !== undefined &&
      Number(targetAmount) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Target amount must be greater than zero",
      });
    }

    if (
      currentAmount !== undefined &&
      Number(currentAmount) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Current amount cannot be negative",
      });
    }

    const goal = await updateGoal(
      req.user.userId,
      req.params.id,
      {
        name: name !== undefined ? name.trim() : undefined,
        targetAmount,
        currentAmount,
        targetDate,
      }
    );

    res.json({
      success: true,
      message: "Goal updated successfully",
      goal,
    });
  } catch (error) {
    const statusCode =
      error.message === "Goal not found" ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
}

export async function remove(req, res) {
  try {
    await deleteGoal(
      req.user.userId,
      req.params.id
    );

    res.json({
      success: true,
      message: "Goal deleted successfully",
    });
  } catch (error) {
    const statusCode =
      error.message === "Goal not found" ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
}