import { GoogleGenAI } from "@google/genai";
import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function askFinancialAssistant(userId, question) {
  const [accounts, transactions, budgets, goals] =
    await Promise.all([
      prisma.account.findMany({
        where: { userId },
      }),

      prisma.transaction.findMany({
        where: { userId },
        include: {
          category: true,
          account: true,
        },
        orderBy: {
          date: "desc",
        },
        take: 100,
      }),

      prisma.budget.findMany({
        where: { userId },
        include: {
          category: true,
        },
      }),

      prisma.goal.findMany({
        where: { userId },
      }),
    ]);

  const totalBalance = accounts.reduce(
    (sum, account) => sum + Number(account.balance),
    0
  );

  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const financialContext = {
    totalBalance,
    totalIncome,
    totalExpenses,
    netSavings: totalIncome - totalExpenses,

    accounts: accounts.map((account) => ({
      name: account.name,
      type: account.type,
      balance: Number(account.balance),
      currency: account.currency,
    })),

    transactions: transactions.map((transaction) => ({
      amount: Number(transaction.amount),
      type: transaction.type,
      description: transaction.description,
      date: transaction.date,
      category: transaction.category?.name || "Uncategorized",
      account: transaction.account?.name,
    })),

    budgets: budgets.map((budget) => ({
      category: budget.category?.name,
      amount: Number(budget.amount),
      month: budget.month,
      year: budget.year,
    })),

    goals: goals.map((goal) => ({
      name: goal.name,
      targetAmount: Number(goal.targetAmount),
      currentAmount: Number(goal.currentAmount),
      targetDate: goal.targetDate,
    })),
  };

  const prompt = `
You are CAPIVORA's personal financial assistant.

Help the user understand their finances using ONLY the financial
data provided below.

Rules:
- Never invent financial information.
- Never invent transactions, balances, income, expenses, budgets, or goals.
- Do not claim access to external bank accounts.
- Explain financial information clearly.
- Give practical general financial guidance.
- If the available data is insufficient, say so.
- Keep responses concise and useful.

USER QUESTION:
${question}

USER FINANCIAL DATA:
${JSON.stringify(financialContext, null, 2)}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
  });

  return {
    answer: response.text,
  };
}