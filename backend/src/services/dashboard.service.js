import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

export async function getDashboardData(userId) {
  // Get all accounts belonging to the user
  const accounts = await prisma.account.findMany({
    where: {
      userId,
    },
  });

  // Calculate total balance
  const totalBalance = accounts.reduce(
    (total, account) => total + Number(account.balance),
    0
  );

  // Get all transactions belonging to the user
  const transactions = await prisma.transaction.findMany({
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

  // Calculate total income
  const totalIncome = transactions
    .filter((transaction) => transaction.type === "INCOME")
    .reduce(
      (total, transaction) => total + Number(transaction.amount),
      0
    );

  // Calculate total expenses
  const totalExpenses = transactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .reduce(
      (total, transaction) => total + Number(transaction.amount),
      0
    );

  // Calculate savings
  const savings = totalIncome - totalExpenses;

  // Calculate savings rate
  const savingsRate =
    totalIncome > 0
      ? Number(((savings / totalIncome) * 100).toFixed(2))
      : 0;

  // Get the five most recent transactions
  const recentTransactions = transactions.slice(0, 5);

  return {
    summary: {
      totalBalance,
      totalIncome,
      totalExpenses,
      savings,
      savingsRate,
    },
    accounts,
    recentTransactions,
  };
}