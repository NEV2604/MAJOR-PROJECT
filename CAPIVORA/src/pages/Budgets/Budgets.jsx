import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Edit3,
  Loader2,
  PieChart,
  Plus,
  RefreshCw,
  Target,
  Trash2,
  TrendingDown,
  Wallet,
  X,
} from "lucide-react";

import { apiRequest } from "../../services/api";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const CATEGORY_ICONS = {
  Food: "🍽️",
  Shopping: "🛍️",
  Transport: "🚗",
  Entertainment: "🎬",
  Bills: "🧾",
  Health: "❤️",
  Education: "🎓",
  Groceries: "🛒",
  Salary: "💼",
  Freelance: "💻",
  "Other Income": "💰",
};

function formatCurrency(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function getMonthRange(month, year) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 1);

  return {
    start,
    end,
  };
}

function getBudgetStatus(percent) {
  if (percent >= 100) {
    return {
      label: "Over Budget",
      className: "bg-[#ff6b6b]/10 text-[#ff6b6b]",
      barClass: "bg-[#ff6b6b]",
    };
  }

  if (percent >= 90) {
    return {
      label: "Critical",
      className: "bg-[#ff6b6b]/10 text-[#ff6b6b]",
      barClass: "bg-[#ff6b6b]",
    };
  }

  if (percent >= 80) {
    return {
      label: "Near Limit",
      className: "bg-[#f59e0b]/10 text-[#f59e0b]",
      barClass: "bg-[#f59e0b]",
    };
  }

  return {
    label: "Healthy",
    className: "bg-[#4edea3]/10 text-[#4edea3]",
    barClass: "bg-[#4edea3]",
  };
}

function getCategoryIcon(name) {
  return CATEGORY_ICONS[name] || "•";
}

function getMonthLabel(month, year) {
  return `${MONTHS[month]} ${year}`;
}

export default function Budgets() {
  const today = new Date();

  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    categoryId: "",
    amount: "",
  });

  async function loadData(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [budgetResponse, categoryResponse, transactionResponse] =
        await Promise.all([
          apiRequest("/budgets"),
          apiRequest("/categories"),
          apiRequest("/transactions"),
        ]);

      setBudgets(
        budgetResponse.data ||
          budgetResponse.budgets ||
          budgetResponse ||
          []
      );

      setCategories(
        categoryResponse.data ||
          categoryResponse.categories ||
          categoryResponse ||
          []
      );

      setTransactions(
        transactionResponse.data ||
          transactionResponse.transactions ||
          transactionResponse ||
          []
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to load your budgets. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const expenseCategories = useMemo(() => {
    return categories.filter(
      (category) =>
        String(category.type || "").toUpperCase() === "EXPENSE"
    );
  }, [categories]);

  const currentMonthBudgets = useMemo(() => {
    return budgets.filter(
      (budget) =>
        Number(budget.month) === selectedMonth + 1 &&
        Number(budget.year) === selectedYear
    );
  }, [budgets, selectedMonth, selectedYear]);

  const budgetRows = useMemo(() => {
    const { start, end } = getMonthRange(
      selectedMonth,
      selectedYear
    );

    return currentMonthBudgets.map((budget) => {
      const category =
        budget.category ||
        categories.find(
          (item) => item.id === budget.categoryId
        );

      const spent = transactions
        .filter((transaction) => {
          const transactionDate = new Date(transaction.date);

          return (
            transaction.type === "EXPENSE" &&
            transaction.categoryId === budget.categoryId &&
            transactionDate >= start &&
            transactionDate < end
          );
        })
        .reduce(
          (total, transaction) =>
            total + Number(transaction.amount || 0),
          0
        );

      const amount = Number(budget.amount || 0);

      const percent =
        amount > 0 ? Math.round((spent / amount) * 100) : 0;

      const remaining = amount - spent;

      return {
        ...budget,
        categoryName: category?.name || "Uncategorized",
        spent,
        amount,
        percent,
        remaining,
      };
    });
  }, [
    currentMonthBudgets,
    categories,
    transactions,
    selectedMonth,
    selectedYear,
  ]);

  const totals = useMemo(() => {
    const budgeted = budgetRows.reduce(
      (sum, budget) => sum + budget.amount,
      0
    );

    const spent = budgetRows.reduce(
      (sum, budget) => sum + budget.spent,
      0
    );

    const remaining = budgeted - spent;

    const utilization =
      budgeted > 0 ? Math.round((spent / budgeted) * 100) : 0;

    return {
      budgeted,
      spent,
      remaining,
      utilization,
    };
  }, [budgetRows]);

  const unbudgetedExpense = useMemo(() => {
    const { start, end } = getMonthRange(
      selectedMonth,
      selectedYear
    );

    const budgetedCategoryIds = new Set(
      currentMonthBudgets.map(
        (budget) => budget.categoryId
      )
    );

    return transactions
      .filter((transaction) => {
        const transactionDate = new Date(transaction.date);

        return (
          transaction.type === "EXPENSE" &&
          transactionDate >= start &&
          transactionDate < end &&
          !budgetedCategoryIds.has(transaction.categoryId)
        );
      })
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount || 0),
        0
      );
  }, [
    transactions,
    currentMonthBudgets,
    selectedMonth,
    selectedYear,
  ]);

  function openAddModal() {
    setEditingBudget(null);

    setForm({
      categoryId: expenseCategories[0]?.id || "",
      amount: "",
    });

    setFormError("");
    setModalOpen(true);
  }

  function openEditModal(budget) {
    setEditingBudget(budget);

    setForm({
      categoryId: budget.categoryId || "",
      amount: budget.amount || "",
    });

    setFormError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (submitting) return;

    setModalOpen(false);
    setEditingBudget(null);
    setFormError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const amount = Number(form.amount);

    if (!form.categoryId) {
      setFormError("Please select a category.");
      return;
    }

    if (!amount || amount <= 0) {
      setFormError("Please enter a valid budget amount.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");

      const payload = {
        amount,
        month: selectedMonth + 1,
        year: selectedYear,
        categoryId: form.categoryId,
      };

      if (editingBudget) {
        await apiRequest(`/budgets/${editingBudget.id}`, {
          method: "PUT",
          body: JSON.stringify({
            amount,
          }),
        });
      } else {
        await apiRequest("/budgets", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      closeModal();
      await loadData(true);
    } catch (err) {
      setFormError(
        err.message ||
          "Unable to save the budget. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(budget) {
    const confirmed = window.confirm(
      `Delete the ${budget.categoryName} budget for ${getMonthLabel(
        selectedMonth,
        selectedYear
      )}?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await apiRequest(`/budgets/${budget.id}`, {
        method: "DELETE",
      });

      await loadData(true);
    } catch (err) {
      setError(
        err.message ||
          "Unable to delete the budget."
      );
    }
  }

  function changeMonth(direction) {
    if (direction === -1) {
      if (selectedMonth === 0) {
        setSelectedMonth(11);
        setSelectedYear((year) => year - 1);
      } else {
        setSelectedMonth((month) => month - 1);
      }
    } else {
      if (selectedMonth === 11) {
        setSelectedMonth(0);
        setSelectedYear((year) => year + 1);
      } else {
        setSelectedMonth((month) => month + 1);
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[70vh] max-w-[1500px] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-[#4edea3]" />

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#4edea3]">
              Loading budgets
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#4edea3]" />

              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#4edea3]">
                Financial Planning
              </span>
            </div>

            <h1 className="font-display text-4xl font-bold tracking-tight text-[#f5f5f5] sm:text-5xl">
              Budgets
            </h1>

            <p className="mt-2 text-sm text-[#737373] sm:text-base">
              Set spending limits and keep every category under control.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Month Selector */}
            <div className="flex items-center rounded-xl border border-[#181818] bg-[#0a0a0a] p-1">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                className="rounded-lg p-2 text-[#737373] transition hover:bg-[#181818] hover:text-white"
                aria-label="Previous month"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="flex min-w-[150px] items-center justify-center gap-2 px-3 text-sm font-semibold text-[#f5f5f5]">
                <CalendarDays
                  size={16}
                  className="text-[#4edea3]"
                />

                {getMonthLabel(
                  selectedMonth,
                  selectedYear
                )}
              </div>

              <button
                type="button"
                onClick={() => changeMonth(1)}
                className="rounded-lg p-2 text-[#737373] transition hover:bg-[#181818] hover:text-white"
                aria-label="Next month"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-xl border border-[#181818] bg-[#0a0a0a] px-4 py-3 text-sm font-semibold text-[#a3a3a3] transition hover:border-[#252525] hover:bg-[#111] hover:text-white disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={
                  refreshing ? "animate-spin" : ""
                }
              />

              Refresh
            </button>

            <button
              type="button"
              onClick={openAddModal}
              className="green-button flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold"
            >
              <Plus size={18} />

              Add budget
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-[#ff6b6b]/20 bg-[#ff6b6b]/5 px-4 py-3">
            <div className="flex items-center gap-3">
              <AlertCircle
                size={18}
                className="shrink-0 text-[#ff6b6b]"
              />

              <p className="text-sm text-[#ff6b6b]">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadData(true)}
              className="text-xs font-bold text-[#ff6b6b] underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="card card-hover p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#737373]">
                Total Budget
              </span>

              <div className="rounded-xl border border-[#173d2d] bg-[#0b2118] p-2.5 text-[#4edea3]">
                <Target size={19} />
              </div>
            </div>

            <p className="number text-2xl font-bold text-[#f5f5f5]">
              {formatCurrency(totals.budgeted)}
            </p>

            <p className="mt-1 text-xs text-[#737373]">
              {budgetRows.length} active{" "}
              {budgetRows.length === 1
                ? "budget"
                : "budgets"}
            </p>
          </div>

          <div className="card card-hover p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#737373]">
                Spent
              </span>

              <div className="rounded-xl border border-[#3a1818] bg-[#241010] p-2.5 text-[#ff6b6b]">
                <TrendingDown size={19} />
              </div>
            </div>

            <p className="number text-2xl font-bold text-[#ff6b6b]">
              {formatCurrency(totals.spent)}
            </p>

            <p className="mt-1 text-xs text-[#737373]">
              From categorized expenses
            </p>
          </div>

          <div className="card card-hover p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#737373]">
                Remaining
              </span>

              <div className="rounded-xl border border-[#173d2d] bg-[#0b2118] p-2.5 text-[#4edea3]">
                <Wallet size={19} />
              </div>
            </div>

            <p
              className={`number text-2xl font-bold ${
                totals.remaining >= 0
                  ? "text-[#4edea3]"
                  : "text-[#ff6b6b]"
              }`}
            >
              {formatCurrency(totals.remaining)}
            </p>

            <p className="mt-1 text-xs text-[#737373]">
              Across active envelopes
            </p>
          </div>

          <div className="card card-hover p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#737373]">
                Utilization
              </span>

              <div className="rounded-xl border border-[#173d2d] bg-[#0b2118] p-2.5 text-[#4edea3]">
                <PieChart size={19} />
              </div>
            </div>

            <p className="number text-2xl font-bold text-[#f5f5f5]">
              {totals.utilization}%
            </p>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#181818]">
              <div
                className={`h-full rounded-full ${
                  totals.utilization >= 90
                    ? "bg-[#ff6b6b]"
                    : totals.utilization >= 80
                    ? "bg-[#f59e0b]"
                    : "bg-[#4edea3]"
                }`}
                style={{
                  width: `${Math.min(
                    totals.utilization,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Budget Overview */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* Budget List */}
          <section className="card xl:col-span-8 overflow-hidden">
            <div className="border-b border-[#181818] p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold text-[#f5f5f5]">
                    Budget Overview
                  </h2>

                  <p className="mt-1 text-sm text-[#737373]">
                    Envelope tracking for{" "}
                    {getMonthLabel(
                      selectedMonth,
                      selectedYear
                    )}
                  </p>
                </div>

                <div className="rounded-lg bg-[#111] px-3 py-2 text-xs font-semibold text-[#a3a3a3]">
                  {budgetRows.length}{" "}
                  {budgetRows.length === 1
                    ? "category"
                    : "categories"}
                </div>
              </div>
            </div>

            <div className="p-6">
              {budgetRows.length === 0 ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-[#242424] bg-[#050505] px-6 text-center">
                  <div className="mb-4 rounded-2xl border border-[#173d2d] bg-[#0b2118] p-4 text-[#4edea3]">
                    <Target size={28} />
                  </div>

                  <h3 className="text-lg font-bold text-[#f5f5f5]">
                    No budgets for this month
                  </h3>

                  <p className="mt-2 max-w-md text-sm leading-6 text-[#737373]">
                    Create a category budget to start tracking
                    your spending against a monthly limit.
                  </p>

                  <button
                    type="button"
                    onClick={openAddModal}
                    className="green-button mt-5 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold"
                  >
                    <Plus size={17} />

                    Create first budget
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {budgetRows.map((budget) => {
                    const status = getBudgetStatus(
                      budget.percent
                    );

                    return (
                      <div
                        key={budget.id}
                        className="group rounded-xl border border-[#181818] bg-[#0a0a0a] p-4 transition hover:border-[#252525] hover:bg-[#0d0d0d]"
                      >
                        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#181818] text-xl">
                              {getCategoryIcon(
                                budget.categoryName
                              )}
                            </div>

                            <div>
                              <h3 className="font-semibold text-[#f5f5f5]">
                                {budget.categoryName}
                              </h3>

                              <p className="mt-0.5 text-xs text-[#737373]">
                                Cap:{" "}
                                {formatCurrency(
                                  budget.amount
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 sm:text-right">
                            <div>
                              <p className="number text-sm font-bold text-[#f5f5f5]">
                                {formatCurrency(
                                  budget.spent
                                )}{" "}
                                <span className="font-normal text-[#737373]">
                                  /{" "}
                                  {formatCurrency(
                                    budget.amount
                                  )}
                                </span>
                              </p>

                              <span
                                className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${status.className}`}
                              >
                                {budget.percent}%{" "}
                                {status.label}
                              </span>
                            </div>

                            <div className="flex opacity-0 transition group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={() =>
                                  openEditModal(
                                    budget
                                  )
                                }
                                className="rounded-lg p-2 text-[#737373] hover:bg-[#181818] hover:text-white"
                                title="Edit budget"
                              >
                                <Edit3 size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    budget
                                  )
                                }
                                className="rounded-lg p-2 text-[#737373] hover:bg-[#241010] hover:text-[#ff6b6b]"
                                title="Delete budget"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-[#181818]">
                          <div
                            className={`h-full rounded-full transition-all ${status.barClass}`}
                            style={{
                              width: `${Math.min(
                                budget.percent,
                                100
                              )}%`,
                            }}
                          />
                        </div>

                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span className="text-[#737373]">
                            {budget.remaining >= 0
                              ? `${formatCurrency(
                                  budget.remaining
                                )} remaining`
                              : `${formatCurrency(
                                  Math.abs(
                                    budget.remaining
                                  )
                                )} over budget`}
                          </span>

                          <span
                            className={
                              budget.remaining >= 0
                                ? "text-[#4edea3]"
                                : "text-[#ff6b6b]"
                            }
                          >
                            {budget.remaining >= 0
                              ? "Within limit"
                              : "Limit exceeded"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Planning Summary */}
          <aside className="space-y-6 xl:col-span-4">
            <section className="card p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl border border-[#173d2d] bg-[#0b2118] p-2.5 text-[#4edea3]">
                  <CircleDollarSign size={19} />
                </div>

                <div>
                  <h2 className="font-display text-lg font-bold text-[#f5f5f5]">
                    Spending Health
                  </h2>

                  <p className="text-xs text-[#737373]">
                    Current budget utilization
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-[#050505] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#a3a3a3]">
                    Used
                  </span>

                  <span className="number text-lg font-bold text-[#f5f5f5]">
                    {totals.utilization}%
                  </span>
                </div>

                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#181818]">
                  <div
                    className={`h-full rounded-full ${
                      totals.utilization >= 90
                        ? "bg-[#ff6b6b]"
                        : totals.utilization >= 80
                        ? "bg-[#f59e0b]"
                        : "bg-[#4edea3]"
                    }`}
                    style={{
                      width: `${Math.min(
                        totals.utilization,
                        100
                      )}%`,
                    }}
                  />
                </div>

                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-[#737373]">
                    Spent
                  </span>

                  <span className="number font-semibold text-[#f5f5f5]">
                    {formatCurrency(totals.spent)}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-[#737373]">
                    Remaining
                  </span>

                  <span
                    className={`number font-semibold ${
                      totals.remaining >= 0
                        ? "text-[#4edea3]"
                        : "text-[#ff6b6b]"
                    }`}
                  >
                    {formatCurrency(
                      totals.remaining
                    )}
                  </span>
                </div>
              </div>
            </section>

            <section className="card p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-bold text-[#f5f5f5]">
                    Unbudgeted Spending
                  </h2>

                  <p className="mt-1 text-xs text-[#737373]">
                    Expenses without a matching budget
                  </p>
                </div>

                <ArrowRight
                  size={18}
                  className="text-[#737373]"
                />
              </div>

              <p className="number text-2xl font-bold text-[#f5f5f5]">
                {formatCurrency(unbudgetedExpense)}
              </p>

              <div className="mt-4 rounded-xl bg-[#050505] p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle
                    size={16}
                    className="mt-0.5 shrink-0 text-[#f59e0b]"
                  />

                  <p className="text-xs leading-5 text-[#737373]">
                    Add budgets for your frequently used
                    expense categories to get a clearer
                    picture of your monthly spending.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>

      {/* Add / Edit Budget Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#252525] bg-[#0a0a0a] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#181818] p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-[#173d2d] bg-[#0b2118] p-2.5 text-[#4edea3]">
                  {editingBudget ? (
                    <Edit3 size={19} />
                  ) : (
                    <Plus size={19} />
                  )}
                </div>

                <div>
                  <h2 className="font-display text-lg font-bold text-[#f5f5f5]">
                    {editingBudget
                      ? "Edit Budget"
                      : "Add Budget"}
                  </h2>

                  <p className="mt-1 text-xs text-[#737373]">
                    {getMonthLabel(
                      selectedMonth,
                      selectedYear
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="rounded-lg p-2 text-[#737373] transition hover:bg-[#181818] hover:text-white disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              {formError && (
                <div className="flex items-center gap-2 rounded-xl border border-[#ff6b6b]/20 bg-[#ff6b6b]/5 px-3 py-2.5 text-sm text-[#ff6b6b]">
                  <AlertCircle size={16} />

                  {formError}
                </div>
              )}

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#737373]">
                  Expense Category
                </label>

                <select
                  value={form.categoryId}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      categoryId:
                        event.target.value,
                    }))
                  }
                  disabled={Boolean(editingBudget)}
                  className="w-full rounded-xl border border-[#181818] bg-[#050505] px-4 py-3 text-sm text-[#f5f5f5] outline-none transition focus:border-[#4edea3]/50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">
                    Select a category
                  </option>

                  {expenseCategories.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    )
                  )}
                </select>

                {editingBudget && (
                  <p className="mt-2 text-xs text-[#737373]">
                    Category cannot be changed while editing
                    an existing budget.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#737373]">
                  Monthly Limit (INR)
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[#737373]">
                    ₹
                  </span>

                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={form.amount}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        amount:
                          event.target.value,
                      }))
                    }
                    placeholder="10000"
                    className="number w-full rounded-xl border border-[#181818] bg-[#050505] py-3 pl-10 pr-4 text-lg text-[#f5f5f5] outline-none transition focus:border-[#4edea3]/50"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-[#181818] bg-[#050505] p-4">
                <div className="flex items-start gap-3">
                  <Check
                    size={18}
                    className="mt-0.5 shrink-0 text-[#4edea3]"
                  />

                  <div>
                    <p className="text-sm font-semibold text-[#f5f5f5]">
                      {editingBudget
                        ? "Budget update"
                        : "Monthly envelope"}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#737373]">
                      Your budget tracks expense transactions
                      assigned to the selected category during
                      this calendar month.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="rounded-xl border border-[#181818] bg-[#111] px-5 py-3 text-sm font-semibold text-[#a3a3a3] transition hover:bg-[#181818] hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="green-button flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <Check size={17} />
                  )}

                  {editingBudget
                    ? "Save changes"
                    : "Create budget"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}