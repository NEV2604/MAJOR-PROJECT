import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  CreditCard,
  Edit3,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  WalletCards,
  X,
} from "lucide-react";

import { apiRequest } from "../../services/api";

const transactionTypes = [
  { value: "EXPENSE", label: "Expense" },
  { value: "INCOME", label: "Income" },
];

const paymentMethods = [
  "UPI",
  "Debit Card",
  "Credit Card",
  "Bank Transfer",
  "Cash",
  "Other",
];

function formatCurrency(amount, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(Number(amount || 0));
}

function formatDate(date) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getAccountTypeLabel(type) {
  const labels = {
    BANK: "Bank Account",
    SAVINGS: "Savings Account",
    CREDIT_CARD: "Credit Card",
    CASH: "Cash",
    WALLET: "Wallet",
    INVESTMENT: "Investment",
  };

  return labels[type] || type;
}

function getInitialForm() {
  return {
    type: "EXPENSE",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "UPI",
    notes: "",
    accountId: "",
    categoryId: "",
  };
}

function StatCard({ label, value, icon: Icon, positive }) {
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#737373]">
          {label}
        </p>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#183b2d] bg-[#0b2118] text-[#4edea3]">
          <Icon size={17} strokeWidth={1.8} />
        </div>
      </div>

      <p
        className={`number text-2xl font-bold ${
          positive === true
            ? "text-[#4edea3]"
            : positive === false
              ? "text-[#ff6b6b]"
              : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function TypeBadge({ type }) {
  const income = type === "INCOME";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
        income
          ? "bg-[#0b2118] text-[#4edea3]"
          : "bg-[#241010] text-[#ff8a8a]"
      }`}
    >
      {income ? (
        <ArrowDownLeft size={12} />
      ) : (
        <ArrowUpRight size={12} />
      )}

      {income ? "Income" : "Expense"}
    </span>
  );
}

function Modal({
  form,
  setForm,
  accounts,
  categories,
  editingTransaction,
  submitting,
  error,
  onClose,
  onSubmit,
}) {
  /*
   * FIX:
   * Category types from the API are normalized before comparison.
   * This prevents categories from disappearing because of
   * capitalization or unexpected casing.
   */
  const availableCategories = categories.filter(
    (category) =>
      String(category.type || "").toUpperCase() ===
      String(form.type || "").toUpperCase()
  );

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleTypeChange(value) {
    setForm((current) => ({
      ...current,
      type: value,
      categoryId: "",
    }));
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#242424] bg-[#0a0a0a] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#181818] px-6 py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4edea3]">
              {editingTransaction
                ? "Edit transaction"
                : "New transaction"}
            </p>

            <h2 className="mt-1 font-display text-xl font-bold text-white">
              {editingTransaction
                ? "Update transaction"
                : "Add transaction"}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg border border-[#242424] p-2 text-[#737373] transition hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 p-6">
          {error && (
            <div className="rounded-xl border border-[#482020] bg-[#180d0d] px-4 py-3 text-sm text-[#ff8a8a]">
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block text-xs font-semibold text-[#a3a3a3]">
              Transaction type
            </label>

            <div className="grid grid-cols-2 gap-2">
              {transactionTypes.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleTypeChange(item.value)}
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    form.type === item.value
                      ? "border-[#286f51] bg-[#10281e] text-[#4edea3]"
                      : "border-[#242424] bg-[#050505] text-[#737373] hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-semibold text-[#a3a3a3]">
                Amount
              </label>

              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(e) =>
                  updateField("amount", e.target.value)
                }
                placeholder="0.00"
                className="w-full rounded-xl border border-[#242424] bg-[#050505] px-4 py-3 text-white outline-none transition placeholder:text-[#444] focus:border-[#286f51]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-[#a3a3a3]">
                Date
              </label>

              <div className="relative">
                <CalendarDays
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#525252]"
                />

                <input
                  required
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    updateField("date", e.target.value)
                  }
                  className="w-full rounded-xl border border-[#242424] bg-[#050505] py-3 pl-11 pr-4 text-white outline-none focus:border-[#286f51]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-[#a3a3a3]">
              Description
            </label>

            <input
              required
              type="text"
              value={form.description}
              onChange={(e) =>
                updateField("description", e.target.value)
              }
              placeholder="e.g. Swiggy order"
              className="w-full rounded-xl border border-[#242424] bg-[#050505] px-4 py-3 text-white outline-none transition placeholder:text-[#444] focus:border-[#286f51]"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-semibold text-[#a3a3a3]">
                Account
              </label>

              <select
                required
                value={form.accountId}
                onChange={(e) =>
                  updateField("accountId", e.target.value)
                }
                className="w-full appearance-none rounded-xl border border-[#242424] bg-[#050505] px-4 py-3 text-sm text-white outline-none focus:border-[#286f51]"
              >
                <option value="">Select account</option>

                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} —{" "}
                    {getAccountTypeLabel(account.type)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-[#a3a3a3]">
                Category
              </label>

              <select
                value={form.categoryId}
                onChange={(e) =>
                  updateField("categoryId", e.target.value)
                }
                className="w-full appearance-none rounded-xl border border-[#242424] bg-[#050505] px-4 py-3 text-sm text-white outline-none focus:border-[#286f51]"
              >
                <option value="">Uncategorized</option>

                {availableCategories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-[#a3a3a3]">
              Payment method
            </label>

            <select
              value={form.paymentMethod}
              onChange={(e) =>
                updateField("paymentMethod", e.target.value)
              }
              className="w-full appearance-none rounded-xl border border-[#242424] bg-[#050505] px-4 py-3 text-sm text-white outline-none focus:border-[#286f51]"
            >
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-[#a3a3a3]">
              Notes{" "}
              <span className="text-[#525252]">
                (optional)
              </span>
            </label>

            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) =>
                updateField("notes", e.target.value)
              }
              placeholder="Add any additional details..."
              className="w-full resize-none rounded-xl border border-[#242424] bg-[#050505] px-4 py-3 text-sm text-white outline-none placeholder:text-[#444] focus:border-[#286f51]"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-[#181818] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#242424] px-5 py-3 text-sm font-semibold text-[#a3a3a3] transition hover:bg-[#111] hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                submitting || accounts.length === 0
              }
              className="green-button rounded-xl px-5 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Saving..."
                : editingTransaction
                  ? "Save changes"
                  : "Add transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [accountFilter, setAccountFilter] =
    useState("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState(null);

  const [form, setForm] = useState(getInitialForm());
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  async function loadData(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [
        transactionResponse,
        accountResponse,
        categoryResponse,
      ] = await Promise.all([
        apiRequest("/transactions"),
        apiRequest("/accounts"),
        apiRequest("/categories"),
      ]);

      setTransactions(
        transactionResponse.data ||
          transactionResponse.transactions ||
          transactionResponse ||
          []
      );

      setAccounts(
        accountResponse.data ||
          accountResponse.accounts ||
          accountResponse ||
          []
      );

      setCategories(
        categoryResponse.data ||
          categoryResponse.categories ||
          categoryResponse ||
          []
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to load your transactions."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return transactions
      .filter((transaction) => {
        if (
          typeFilter !== "ALL" &&
          transaction.type !== typeFilter
        ) {
          return false;
        }

        if (
          accountFilter !== "ALL" &&
          transaction.accountId !== accountFilter
        ) {
          return false;
        }

        if (!query) {
          return true;
        }

        const searchableText = [
          transaction.description,
          transaction.notes,
          transaction.paymentMethod,
          transaction.category?.name,
          transaction.account?.name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      })
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      );
  }, [
    transactions,
    search,
    typeFilter,
    accountFilter,
  ]);

  const totals = useMemo(() => {
    return transactions.reduce(
      (result, transaction) => {
        const amount = Number(
          transaction.amount || 0
        );

        if (transaction.type === "INCOME") {
          result.income += amount;
        }

        if (transaction.type === "EXPENSE") {
          result.expenses += amount;
        }

        return result;
      },
      {
        income: 0,
        expenses: 0,
      }
    );
  }, [transactions]);

  function openCreateModal() {
    setEditingTransaction(null);

    setForm({
      ...getInitialForm(),
      accountId: accounts[0]?.id || "",
    });

    setFormError("");
    setModalOpen(true);
  }

  function openEditModal(transaction) {
    setEditingTransaction(transaction);

    setForm({
      type: transaction.type || "EXPENSE",
      amount: transaction.amount || "",
      description: transaction.description || "",
      date: transaction.date
        ? new Date(transaction.date)
            .toISOString()
            .split("T")[0]
        : new Date().toISOString().split("T")[0],
      paymentMethod:
        transaction.paymentMethod || "UPI",
      notes: transaction.notes || "",
      accountId: transaction.accountId || "",
      categoryId: transaction.categoryId || "",
    });

    setFormError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (submitting) return;

    setModalOpen(false);
    setEditingTransaction(null);
    setFormError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.accountId) {
      setFormError("Please select an account.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");

      const payload = {
        type: form.type,
        amount: Number(form.amount),
        description: form.description.trim(),
        date: form.date,
        paymentMethod: form.paymentMethod,
        notes: form.notes.trim() || undefined,
        accountId: form.accountId,
        categoryId: form.categoryId || undefined,
      };

      if (editingTransaction) {
        await apiRequest(
          `/transactions/${editingTransaction.id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );
      } else {
        await apiRequest("/transactions", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      closeModal();
      await loadData(true);
    } catch (err) {
      setFormError(
        err.message ||
          "Unable to save the transaction."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(transaction) {
    const confirmed = window.confirm(
      `Delete "${
        transaction.description ||
        "this transaction"
      }"?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await apiRequest(
        `/transactions/${transaction.id}`,
        {
          method: "DELETE",
        }
      );

      await loadData(true);
    } catch (err) {
      setError(
        err.message ||
          "Unable to delete the transaction."
      );
    }
  }

  function getAccountName(transaction) {
    if (transaction.account?.name) {
      return transaction.account.name;
    }

    const account = accounts.find(
      (item) => item.id === transaction.accountId
    );

    return account?.name || "Unknown account";
  }

  function getCategoryName(transaction) {
    if (transaction.category?.name) {
      return transaction.category.name;
    }

    const category = categories.find(
      (item) => item.id === transaction.categoryId
    );

    return category?.name || "Uncategorized";
  }

  return (
    <div className="min-h-screen bg-black px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#4edea3]">
              Financial activity
            </p>

            <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Transactions
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-[#737373]">
              Track your income and expenses with
              complete visibility across your financial
              accounts.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#242424] bg-[#0a0a0a] px-5 py-3 text-sm font-semibold text-[#a3a3a3] transition hover:border-[#333] hover:text-white disabled:opacity-50"
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
              onClick={openCreateModal}
              className="green-button flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold"
            >
              <Plus size={18} />
              Add transaction
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <StatCard
            label="Total income"
            value={formatCurrency(totals.income)}
            icon={ArrowDownLeft}
            positive
          />

          <StatCard
            label="Total expenses"
            value={formatCurrency(totals.expenses)}
            icon={ArrowUpRight}
            positive={false}
          />

          <StatCard
            label="Net savings"
            value={formatCurrency(
              totals.income - totals.expenses
            )}
            icon={WalletCards}
            positive={
              totals.income - totals.expenses >= 0
            }
          />
        </div>

        {/* Main card */}
        <div className="card overflow-hidden">
          {/* Filters */}
          <div className="border-b border-[#181818] p-4 sm:p-5">
            <div className="flex flex-col gap-3 xl:flex-row">
              <div className="relative flex-1">
                <Search
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#525252]"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search transactions..."
                  className="w-full rounded-xl border border-[#242424] bg-[#050505] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-[#525252] focus:border-[#286f51]"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Filter
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#525252]"
                  />

                  <select
                    value={typeFilter}
                    onChange={(e) =>
                      setTypeFilter(e.target.value)
                    }
                    className="w-full appearance-none rounded-xl border border-[#242424] bg-[#050505] py-3 pl-9 pr-9 text-sm text-[#a3a3a3] outline-none focus:border-[#286f51] sm:w-40"
                  >
                    <option value="ALL">
                      All types
                    </option>

                    <option value="INCOME">
                      Income
                    </option>

                    <option value="EXPENSE">
                      Expense
                    </option>
                  </select>
                </div>

                <div className="relative">
                  <CreditCard
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#525252]"
                  />

                  <select
                    value={accountFilter}
                    onChange={(e) =>
                      setAccountFilter(e.target.value)
                    }
                    className="w-full appearance-none rounded-xl border border-[#242424] bg-[#050505] py-3 pl-9 pr-9 text-sm text-[#a3a3a3] outline-none focus:border-[#286f51] sm:w-52"
                  >
                    <option value="ALL">
                      All accounts
                    </option>

                    {accounts.map((account) => (
                      <option
                        key={account.id}
                        value={account.id}
                      >
                        {account.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mx-5 mt-5 rounded-xl border border-[#482020] bg-[#180d0d] px-4 py-3 text-sm text-[#ff8a8a]">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="flex min-h-[420px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#173d2d] border-t-[#4edea3]" />

                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4edea3]">
                  Loading transactions
                </p>
              </div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            /* Empty state */
            <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#183b2d] bg-[#0b2118] text-[#4edea3]">
                <ArrowLeftRightIcon />
              </div>

              <h2 className="font-display text-xl font-bold text-white">
                {transactions.length === 0
                  ? "No transactions yet"
                  : "No matching transactions"}
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-[#737373]">
                {transactions.length === 0
                  ? "Start recording your income and expenses to build your financial picture."
                  : "Try changing your search or filters to find the transaction you're looking for."}
              </p>

              {transactions.length === 0 && (
                <button
                  onClick={openCreateModal}
                  disabled={accounts.length === 0}
                  className="green-button mt-6 flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus size={17} />
                  Add your first transaction
                </button>
              )}

              {accounts.length === 0 &&
                transactions.length === 0 && (
                  <p className="mt-3 text-xs text-[#525252]">
                    Add a financial account before creating
                    a transaction.
                  </p>
                )}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-[#181818] bg-[#050505] text-left">
                      <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#525252]">
                        Transaction
                      </th>

                      <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#525252]">
                        Category
                      </th>

                      <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#525252]">
                        Account
                      </th>

                      <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#525252]">
                        Date
                      </th>

                      <th className="px-5 py-4 text-right text-[10px] font-bold uppercase tracking-[0.15em] text-[#525252]">
                        Amount
                      </th>

                      <th className="px-5 py-4 text-right text-[10px] font-bold uppercase tracking-[0.15em] text-[#525252]">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredTransactions.map(
                      (transaction) => {
                        const income =
                          transaction.type === "INCOME";

                        return (
                          <tr
                            key={transaction.id}
                            className="group border-b border-[#111111] transition hover:bg-[#0b0b0b]"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                                    income
                                      ? "bg-[#0b2118] text-[#4edea3]"
                                      : "bg-[#180d0d] text-[#ff6b6b]"
                                  }`}
                                >
                                  {income ? (
                                    <ArrowDownLeft
                                      size={18}
                                    />
                                  ) : (
                                    <ArrowUpRight
                                      size={18}
                                    />
                                  )}
                                </div>

                                <div>
                                  <p className="max-w-[240px] truncate text-sm font-semibold text-white">
                                    {transaction.description ||
                                      "Untitled transaction"}
                                  </p>

                                  <p className="mt-1 text-xs text-[#525252]">
                                    {transaction.paymentMethod ||
                                      "Payment method not specified"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <div>
                                <p className="text-sm text-[#a3a3a3]">
                                  {getCategoryName(
                                    transaction
                                  )}
                                </p>

                                <div className="mt-1">
                                  <TypeBadge
                                    type={
                                      transaction.type
                                    }
                                  />
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <p className="text-sm font-medium text-[#d4d4d4]">
                                {getAccountName(transaction)}
                              </p>
                            </td>

                            <td className="px-5 py-4">
                              <p className="text-sm text-[#a3a3a3]">
                                {formatDate(
                                  transaction.date
                                )}
                              </p>
                            </td>

                            <td className="px-5 py-4 text-right">
                              <p
                                className={`number text-sm font-bold ${
                                  income
                                    ? "text-[#4edea3]"
                                    : "text-white"
                                }`}
                              >
                                {income ? "+" : "-"}
                                {formatCurrency(
                                  transaction.amount
                                )}
                              </p>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex justify-end gap-1 opacity-0 transition group-hover:opacity-100">
                                <button
                                  onClick={() =>
                                    openEditModal(
                                      transaction
                                    )
                                  }
                                  className="rounded-lg p-2 text-[#737373] transition hover:bg-[#181818] hover:text-white"
                                  title="Edit"
                                >
                                  <Edit3 size={16} />
                                </button>

                                <button
                                  onClick={() =>
                                    handleDelete(
                                      transaction
                                    )
                                  }
                                  className="rounded-lg p-2 text-[#737373] transition hover:bg-[#180d0d] hover:text-[#ff6b6b]"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y divide-[#181818] lg:hidden">
                {filteredTransactions.map(
                  (transaction) => {
                    const income =
                      transaction.type === "INCOME";

                    return (
                      <div
                        key={transaction.id}
                        className="p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                income
                                  ? "bg-[#0b2118] text-[#4edea3]"
                                  : "bg-[#180d0d] text-[#ff6b6b]"
                              }`}
                            >
                              {income ? (
                                <ArrowDownLeft size={18} />
                              ) : (
                                <ArrowUpRight size={18} />
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-white">
                                {transaction.description ||
                                  "Untitled transaction"}
                              </p>

                              <p className="mt-1 text-xs text-[#737373]">
                                {getCategoryName(
                                  transaction
                                )}
                              </p>
                            </div>
                          </div>

                          <p
                            className={`number shrink-0 text-sm font-bold ${
                              income
                                ? "text-[#4edea3]"
                                : "text-white"
                            }`}
                          >
                            {income ? "+" : "-"}
                            {formatCurrency(
                              transaction.amount
                            )}
                          </p>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <TypeBadge
                            type={transaction.type}
                          />

                          <span className="rounded-full bg-[#111111] px-2.5 py-1 text-[10px] font-semibold text-[#737373]">
                            {getAccountName(transaction)}
                          </span>

                          <span className="rounded-full bg-[#111111] px-2.5 py-1 text-[10px] font-semibold text-[#737373]">
                            {formatDate(transaction.date)}
                          </span>
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                          <button
                            onClick={() =>
                              openEditModal(transaction)
                            }
                            className="flex items-center gap-2 rounded-lg border border-[#242424] px-3 py-2 text-xs font-semibold text-[#a3a3a3] hover:text-white"
                          >
                            <Edit3 size={14} />
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(transaction)
                            }
                            className="flex items-center gap-2 rounded-lg border border-[#302020] px-3 py-2 text-xs font-semibold text-[#ff6b6b] hover:bg-[#180d0d]"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {modalOpen && (
        <Modal
          form={form}
          setForm={setForm}
          accounts={accounts}
          categories={categories}
          editingTransaction={editingTransaction}
          submitting={submitting}
          error={formError}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

function ArrowLeftRightIcon() {
  return (
    <div className="flex items-center gap-1">
      <ArrowDownLeft size={18} />
      <ArrowUpRight size={18} />
    </div>
  );
}