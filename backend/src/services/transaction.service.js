import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

// Create a transaction
export async function createTransaction({
  userId,
  amount,
  type,
  description,
  date,
  paymentMethod,
  notes,
  accountId,
  categoryId,
}) {
  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      userId,
    },
  });

  if (!account) {
    throw new Error("Account not found");
  }

  if (categoryId) {
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId,
      },
    });

    if (!category) {
      throw new Error("Category not found");
    }
  }

  return prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: {
        amount,
        type,
        description,
        date,
        paymentMethod,
        notes,
        userId,
        accountId,
        categoryId,
      },
    });

    if (type === "INCOME") {
      await tx.account.update({
        where: {
          id: accountId,
        },
        data: {
          balance: {
            increment: amount,
          },
        },
      });
    }

    if (type === "EXPENSE") {
      await tx.account.update({
        where: {
          id: accountId,
        },
        data: {
          balance: {
            decrement: amount,
          },
        },
      });
    }

    return transaction;
  });
}

// Get all transactions
export async function getUserTransactions(userId) {
  return prisma.transaction.findMany({
    where: {
      userId,
    },
    include: {
      account: true,
      category: true,
    },
    orderBy: {
      date: "desc",
    },
  });
}

// Get one transaction
export async function getTransactionById(userId, transactionId) {
  return prisma.transaction.findFirst({
    where: {
      id: transactionId,
      userId,
    },
    include: {
      account: true,
      category: true,
    },
  });
}

// Update a transaction
export async function updateTransaction(
  userId,
  transactionId,
  {
    amount,
    type,
    description,
    date,
    paymentMethod,
    notes,
    accountId,
    categoryId,
  }
) {
  const existingTransaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      userId,
    },
  });

  if (!existingTransaction) {
    throw new Error("Transaction not found");
  }

  const newAccountId = accountId || existingTransaction.accountId;
  const newAmount =
    amount !== undefined ? amount : existingTransaction.amount;
  const newType = type || existingTransaction.type;

  const newAccount = await prisma.account.findFirst({
    where: {
      id: newAccountId,
      userId,
    },
  });

  if (!newAccount) {
    throw new Error("Account not found");
  }

  if (categoryId) {
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId,
      },
    });

    if (!category) {
      throw new Error("Category not found");
    }
  }

  return prisma.$transaction(async (tx) => {
    // Reverse the effect of the original transaction
    if (existingTransaction.type === "INCOME") {
      await tx.account.update({
        where: {
          id: existingTransaction.accountId,
        },
        data: {
          balance: {
            decrement: existingTransaction.amount,
          },
        },
      });
    }

    if (existingTransaction.type === "EXPENSE") {
      await tx.account.update({
        where: {
          id: existingTransaction.accountId,
        },
        data: {
          balance: {
            increment: existingTransaction.amount,
          },
        },
      });
    }

    // Apply the new transaction effect
    if (newType === "INCOME") {
      await tx.account.update({
        where: {
          id: newAccountId,
        },
        data: {
          balance: {
            increment: newAmount,
          },
        },
      });
    }

    if (newType === "EXPENSE") {
      await tx.account.update({
        where: {
          id: newAccountId,
        },
        data: {
          balance: {
            decrement: newAmount,
          },
        },
      });
    }

    return tx.transaction.update({
      where: {
        id: transactionId,
      },
      data: {
        ...(amount !== undefined && { amount }),
        ...(type !== undefined && { type }),
        ...(description !== undefined && {
          description,
        }),
        ...(date !== undefined && { date }),
        ...(paymentMethod !== undefined && {
          paymentMethod,
        }),
        ...(notes !== undefined && { notes }),
        ...(accountId !== undefined && { accountId }),
        ...(categoryId !== undefined && { categoryId }),
      },
    });
  });
}

// Delete a transaction
export async function deleteTransaction(userId, transactionId) {
  const existingTransaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      userId,
    },
  });

  if (!existingTransaction) {
    throw new Error("Transaction not found");
  }

  return prisma.$transaction(async (tx) => {
    // Reverse the transaction's effect on the account balance
    if (existingTransaction.type === "INCOME") {
      await tx.account.update({
        where: {
          id: existingTransaction.accountId,
        },
        data: {
          balance: {
            decrement: existingTransaction.amount,
          },
        },
      });
    }

    if (existingTransaction.type === "EXPENSE") {
      await tx.account.update({
        where: {
          id: existingTransaction.accountId,
        },
        data: {
          balance: {
            increment: existingTransaction.amount,
          },
        },
      });
    }

    await tx.transaction.delete({
      where: {
        id: transactionId,
      },
    });

    return true;
  });
}