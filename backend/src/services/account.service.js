import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

// Create a new account
export async function createAccount({
  userId,
  name,
  type,
  balance,
  currency,
}) {
  return prisma.account.create({
    data: {
      name,
      type,
      balance,
      currency: currency || "INR",
      userId,
    },
  });
}

// Get all accounts belonging to the logged-in user
export async function getUserAccounts(userId) {
  return prisma.account.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

// Get one account belonging to the logged-in user
export async function getAccountById(userId, accountId) {
  return prisma.account.findFirst({
    where: {
      id: accountId,
      userId,
    },
  });
}

// Update an account belonging to the logged-in user
export async function updateAccount(
  userId,
  accountId,
  { name, type, balance, currency }
) {
  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      userId,
    },
  });

  if (!account) {
    throw new Error("Account not found");
  }

  return prisma.account.update({
    where: {
      id: accountId,
    },
    data: {
      ...(name !== undefined && { name }),
      ...(type !== undefined && { type }),
      ...(balance !== undefined && { balance }),
      ...(currency !== undefined && { currency }),
    },
  });
}

// Delete an account belonging to the logged-in user
export async function deleteAccount(userId, accountId) {
  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      userId,
    },
  });

  if (!account) {
    throw new Error("Account not found");
  }

  // Prevent accidental deletion of an account with transactions
  const transactionCount = await prisma.transaction.count({
    where: {
      accountId,
    },
  });

  if (transactionCount > 0) {
    throw new Error(
      "Cannot delete an account that has transactions"
    );
  }

  return prisma.account.delete({
    where: {
      id: accountId,
    },
  });
}