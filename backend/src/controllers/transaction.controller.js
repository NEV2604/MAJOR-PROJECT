import {
  createTransaction,
  getUserTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} from "../services/transaction.service.js";

// Create transaction
export async function create(req, res) {
  try {
    const {
      amount,
      type,
      description,
      date,
      paymentMethod,
      notes,
      accountId,
      categoryId,
    } = req.body;

    if (
      amount === undefined ||
      !type ||
      !date ||
      !accountId
    ) {
      return res.status(400).json({
        success: false,
        message: "Amount, type, date and account are required",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than zero",
      });
    }

    const transaction = await createTransaction({
      userId: req.user.userId,
      amount,
      type,
      description: description?.trim(),
      date: new Date(date),
      paymentMethod: paymentMethod?.trim(),
      notes: notes?.trim(),
      accountId,
      categoryId,
    });

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      transaction,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// Get all transactions
export async function getAll(req, res) {
  try {
    const transactions = await getUserTransactions(
      req.user.userId
    );

    res.json({
      success: true,
      transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve transactions",
    });
  }
}

// Get one transaction
export async function getOne(req, res) {
  try {
    const transaction = await getTransactionById(
      req.user.userId,
      req.params.id
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.json({
      success: true,
      transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve transaction",
    });
  }
}

// Update transaction
export async function update(req, res) {
  try {
    const {
      amount,
      type,
      description,
      date,
      paymentMethod,
      notes,
      accountId,
      categoryId,
    } = req.body;

    if (
      amount !== undefined &&
      Number(amount) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than zero",
      });
    }

    const transaction = await updateTransaction(
      req.user.userId,
      req.params.id,
      {
        amount,
        type,
        description: description?.trim(),
        date: date ? new Date(date) : undefined,
        paymentMethod: paymentMethod?.trim(),
        notes: notes?.trim(),
        accountId,
        categoryId,
      }
    );

    res.json({
      success: true,
      message: "Transaction updated successfully",
      transaction,
    });
  } catch (error) {
    const statusCode =
      error.message === "Transaction not found" ||
      error.message === "Account not found" ||
      error.message === "Category not found"
        ? 404
        : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
}

// Delete transaction
export async function remove(req, res) {
  try {
    await deleteTransaction(
      req.user.userId,
      req.params.id
    );

    res.json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    const statusCode =
      error.message === "Transaction not found"
        ? 404
        : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
}