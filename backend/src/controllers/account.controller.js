import {
  createAccount,
  getUserAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
} from "../services/account.service.js";

// Create account
export async function create(req, res) {
  try {
    const { name, type, balance, currency } = req.body;

    if (!name || !type || balance === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name, type and balance are required",
      });
    }

    const account = await createAccount({
      userId: req.user.userId,
      name: name.trim(),
      type,
      balance,
      currency,
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      account,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// Get all accounts
export async function getAll(req, res) {
  try {
    const accounts = await getUserAccounts(req.user.userId);

    res.json({
      success: true,
      accounts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve accounts",
    });
  }
}

// Get one account
export async function getOne(req, res) {
  try {
    const account = await getAccountById(
      req.user.userId,
      req.params.id
    );

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    res.json({
      success: true,
      account,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve account",
    });
  }
}

// Update account
export async function update(req, res) {
  try {
    const { name, type, balance, currency } = req.body;

    const account = await updateAccount(
      req.user.userId,
      req.params.id,
      {
        name: name?.trim(),
        type,
        balance,
        currency,
      }
    );

    res.json({
      success: true,
      message: "Account updated successfully",
      account,
    });
  } catch (error) {
    const statusCode =
      error.message === "Account not found" ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
}

// Delete account
export async function remove(req, res) {
  try {
    await deleteAccount(
      req.user.userId,
      req.params.id
    );

    res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    const statusCode =
      error.message === "Account not found" ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
}