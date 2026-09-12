import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

export async function createBudget({
  userId,
  amount,
  month,
  year,
  categoryId,
}) {
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      userId,
    },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  return prisma.budget.create({
    data: {
      amount,
      month,
      year,
      categoryId,
      userId,
    },
    include: {
      category: true,
    },
  });
}

export async function getUserBudgets(userId) {
  return prisma.budget.findMany({
    where: { userId },
    include: {
      category: true,
    },
    orderBy: [
      { year: "desc" },
      { month: "desc" },
    ],
  });
}

export async function getBudgetById(userId, budgetId) {
  return prisma.budget.findFirst({
    where: {
      id: budgetId,
      userId,
    },
    include: {
      category: true,
    },
  });
}

export async function updateBudget(
  userId,
  budgetId,
  { amount, month, year, categoryId }
) {
  const budget = await prisma.budget.findFirst({
    where: {
      id: budgetId,
      userId,
    },
  });

  if (!budget) {
    throw new Error("Budget not found");
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

  return prisma.budget.update({
    where: {
      id: budgetId,
    },
    data: {
      ...(amount !== undefined && { amount }),
      ...(month !== undefined && { month }),
      ...(year !== undefined && { year }),
      ...(categoryId !== undefined && { categoryId }),
    },
    include: {
      category: true,
    },
  });
}

export async function deleteBudget(userId, budgetId) {
  const budget = await prisma.budget.findFirst({
    where: {
      id: budgetId,
      userId,
    },
  });

  if (!budget) {
    throw new Error("Budget not found");
  }

  await prisma.budget.delete({
    where: {
      id: budgetId,
    },
  });

  return true;
}