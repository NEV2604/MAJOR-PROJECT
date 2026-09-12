import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  { name: "Food", type: "EXPENSE" },
  { name: "Shopping", type: "EXPENSE" },
  { name: "Transport", type: "EXPENSE" },
  { name: "Entertainment", type: "EXPENSE" },
  { name: "Bills", type: "EXPENSE" },
  { name: "Health", type: "EXPENSE" },
  { name: "Education", type: "EXPENSE" },
  { name: "Groceries", type: "EXPENSE" },
  { name: "Salary", type: "INCOME" },
  { name: "Freelance", type: "INCOME" },
  { name: "Other Income", type: "INCOME" },
];

// Create a category
export async function createCategory({
  userId,
  name,
  type,
}) {
  return prisma.category.create({
    data: {
      name,
      type,
      userId,
    },
  });
}

// Get all categories for the logged-in user
export async function getUserCategories(userId) {
  let categories = await prisma.category.findMany({
    where: {
      userId,
    },
    orderBy: {
      name: "asc",
    },
  });

  // Create default categories if the user has none
  if (categories.length === 0) {
    await prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map((category) => ({
        name: category.name,
        type: category.type,
        userId,
      })),
    });

    categories = await prisma.category.findMany({
      where: {
        userId,
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  return categories;
}

// Get one category
export async function getCategoryById(
  userId,
  categoryId
) {
  return prisma.category.findFirst({
    where: {
      id: categoryId,
      userId,
    },
  });
}

// Update a category
export async function updateCategory(
  userId,
  categoryId,
  { name, type }
) {
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      userId,
    },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  return prisma.category.update({
    where: {
      id: categoryId,
    },
    data: {
      ...(name !== undefined && { name }),
      ...(type !== undefined && { type }),
    },
  });
}

// Delete a category
export async function deleteCategory(
  userId,
  categoryId
) {
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      userId,
    },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  return prisma.category.delete({
    where: {
      id: categoryId,
    },
  });
}