import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

export async function createGoal({
  userId,
  name,
  targetAmount,
  currentAmount,
  targetDate,
}) {
  return prisma.goal.create({
    data: {
      name,
      targetAmount,
      currentAmount: currentAmount || 0,
      targetDate: targetDate ? new Date(targetDate) : null,
      userId,
    },
  });
}

export async function getUserGoals(userId) {
  return prisma.goal.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getGoalById(userId, goalId) {
  return prisma.goal.findFirst({
    where: {
      id: goalId,
      userId,
    },
  });
}

export async function updateGoal(
  userId,
  goalId,
  { name, targetAmount, currentAmount, targetDate }
) {
  const goal = await prisma.goal.findFirst({
    where: {
      id: goalId,
      userId,
    },
  });

  if (!goal) {
    throw new Error("Goal not found");
  }

  return prisma.goal.update({
    where: {
      id: goalId,
    },
    data: {
      ...(name !== undefined && { name }),
      ...(targetAmount !== undefined && { targetAmount }),
      ...(currentAmount !== undefined && { currentAmount }),
      ...(targetDate !== undefined && {
        targetDate: targetDate ? new Date(targetDate) : null,
      }),
    },
  });
}

export async function deleteGoal(userId, goalId) {
  const goal = await prisma.goal.findFirst({
    where: {
      id: goalId,
      userId,
    },
  });

  if (!goal) {
    throw new Error("Goal not found");
  }

  await prisma.goal.delete({
    where: {
      id: goalId,
    },
  });

  return true;
}