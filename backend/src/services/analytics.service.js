import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

function getMonthKey(date) {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
}

function getMonthLabel(date) {
  return date.toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
}

function getLastSixMonths() {
  const months = [];
  const now = new Date();

  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - i,
      1
    );

    months.push({
      key: getMonthKey(date),
      month: getMonthLabel(date),
      income: 0,
      expenses: 0,
    });
  }

  return months;
}

export async function getAnalytics(userId) {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    include: {
      category: true,
      account: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  // --------------------------------------------------
  // Overall financial summary
  // --------------------------------------------------

  const totalIncome = transactions
    .filter((transaction) => transaction.type === "INCOME")
    .reduce(
      (sum, transaction) => sum + Number(transaction.amount),
      0
    );

  const totalExpenses = transactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .reduce(
      (sum, transaction) => sum + Number(transaction.amount),
      0
    );

  const netSavings = totalIncome - totalExpenses;

  const savingsRate =
    totalIncome > 0
      ? Number(
          ((netSavings / totalIncome) * 100).toFixed(2)
        )
      : 0;

  // --------------------------------------------------
  // Expense breakdown by category
  // --------------------------------------------------

  const categoryMap = {};

  transactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .forEach((transaction) => {
      const categoryName =
        transaction.category?.name || "Uncategorized";

      categoryMap[categoryName] =
        (categoryMap[categoryName] || 0) +
        Number(transaction.amount);
    });

  const expenseByCategory = Object.entries(categoryMap)
    .map(([category, amount]) => ({
      category,
      amount: Number(amount.toFixed(2)),
    }))
    .sort((a, b) => b.amount - a.amount);

  // --------------------------------------------------
  // Monthly income vs expenses
  // Always return the latest 6 calendar months.
  // Months without transactions remain zero.
  // --------------------------------------------------

  const monthlyTrend = getLastSixMonths();

  const monthlyMap = {};

  transactions.forEach((transaction) => {
    if (
      transaction.type !== "INCOME" &&
      transaction.type !== "EXPENSE"
    ) {
      return;
    }

    const date = new Date(transaction.date);
    const key = getMonthKey(date);

    if (!monthlyMap[key]) {
      monthlyMap[key] = {
        income: 0,
        expenses: 0,
      };
    }

    if (transaction.type === "INCOME") {
      monthlyMap[key].income += Number(
        transaction.amount
      );
    }

    if (transaction.type === "EXPENSE") {
      monthlyMap[key].expenses += Number(
        transaction.amount
      );
    }
  });

  const completedMonthlyTrend = monthlyTrend.map(
    (month) => {
      const data = monthlyMap[month.key];

      const income = data?.income || 0;
      const expenses = data?.expenses || 0;

      return {
        month: month.month,
        monthKey: month.key,
        income: Number(income.toFixed(2)),
        expenses: Number(expenses.toFixed(2)),
        savings: Number(
          (income - expenses).toFixed(2)
        ),
      };
    }
  );

  // --------------------------------------------------
  // Top spending category
  // --------------------------------------------------

  const topSpendingCategory =
    expenseByCategory.length > 0
      ? expenseByCategory[0]
      : null;

  // --------------------------------------------------
  // Final response
  // --------------------------------------------------

  return {
    summary: {
      totalIncome: Number(totalIncome.toFixed(2)),
      totalExpenses: Number(totalExpenses.toFixed(2)),
      netSavings: Number(netSavings.toFixed(2)),
      savingsRate,
    },

    expenseByCategory,

    monthlyTrend: completedMonthlyTrend,

    topSpendingCategory,
  };
}