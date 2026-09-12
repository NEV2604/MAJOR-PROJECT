import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  Receipt,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { apiRequest } from "../../services/api";

const PERIODS = [
  { value: "30", label: "Last 30 Days" },
  { value: "90", label: "Last 90 Days" },
  { value: "365", label: "Last 12 Months" },
  { value: "all", label: "All Time" },
];

function extractTransactions(response) {
  if (Array.isArray(response)) {
    return response;
  }

  return (
    response?.transactions ||
    response?.data?.transactions ||
    response?.data ||
    []
  );
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatCompactCurrency(value) {
  const amount = Number(value || 0);

  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }

  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }

  return `₹${amount.toFixed(0)}`;
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function escapeCsv(value) {
  const stringValue = String(value ?? "");

  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }

  return stringValue;
}

function downloadCsv(transactions) {
  const headers = [
    "Date",
    "Description",
    "Type",
    "Category",
    "Account",
    "Payment Method",
    "Amount",
    "Notes",
  ];

  const rows = transactions.map((transaction) => [
    formatDate(transaction.date),
    transaction.description || "—",
    transaction.type || "—",
    transaction.category?.name || "Uncategorized",
    transaction.account?.name || "—",
    transaction.paymentMethod || "—",
    Number(transaction.amount || 0).toFixed(2),
    transaction.notes || "",
  ]);

  const csv = [
    headers,
    ...rows,
  ]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `capivora-report-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

export default function Reports() {
  const [transactions, setTransactions] = useState([]);
  const [period, setPeriod] = useState("30");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadReportData() {
      setLoading(true);
      setError("");

      try {
        const response = await apiRequest("/transactions");

        const transactionData = extractTransactions(response);

        setTransactions(
          Array.isArray(transactionData)
            ? transactionData
            : []
        );
      } catch (err) {
        console.error("CAPIVORA reports error:", err);

        setError(
          err.message ||
            "Unable to load your financial report."
        );
      } finally {
        setLoading(false);
      }
    }

    loadReportData();
  }, []);

  const filteredTransactions = useMemo(() => {
    if (period === "all") {
      return transactions;
    }

    const days = Number(period);
    const cutoff = new Date();

    cutoff.setDate(cutoff.getDate() - days);
    cutoff.setHours(0, 0, 0, 0);

    return transactions.filter((transaction) => {
      const date = new Date(transaction.date);

      return date >= cutoff;
    });
  }, [transactions, period]);

  const report = useMemo(() => {
    let income = 0;
    let expenses = 0;

    const categoryTotals = {};

    filteredTransactions.forEach((transaction) => {
      const amount = Number(transaction.amount || 0);

      if (transaction.type === "INCOME") {
        income += amount;
      }

      if (transaction.type === "EXPENSE") {
        expenses += amount;

        const category =
          transaction.category?.name ||
          "Uncategorized";

        categoryTotals[category] =
          (categoryTotals[category] || 0) + amount;
      }
    });

    const savings = income - expenses;

    const savingsRate =
      income > 0
        ? (savings / income) * 100
        : 0;

    const topCategories = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return {
      income,
      expenses,
      savings,
      savingsRate,
      transactionCount: filteredTransactions.length,
      topCategories,
    };
  }, [filteredTransactions]);

  const periodLabel =
    PERIODS.find((item) => item.value === period)?.label ||
    "Selected Period";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="rounded-lg border border-[#173d2d] bg-[#07150f] p-2">
              <FileText className="h-4 w-4 text-[#4edea3]" />
            </div>

            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#4edea3]">
              Financial Reporting
            </span>
          </div>

          <h1 className="font-display text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            Reports
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#737373]">
            Review your financial performance using the real
            transactions recorded in CAPIVORA.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-[#181818] bg-[#0a0a0a] p-1">
            <CalendarDays className="ml-2 h-4 w-4 text-[#737373]" />

            <select
              value={period}
              onChange={(event) =>
                setPeriod(event.target.value)
              }
              className="bg-transparent px-2 py-2 text-sm font-semibold text-white outline-none"
            >
              {PERIODS.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                  className="bg-[#0a0a0a]"
                >
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() =>
              downloadCsv(filteredTransactions)
            }
            disabled={
              loading ||
              filteredTransactions.length === 0
            }
            className="green-button inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="card flex min-h-[280px] items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center">
            <Loader2 className="h-7 w-7 animate-spin text-[#4edea3]" />
            <p className="text-sm text-[#737373]">
              Preparing your financial report...
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-xl border border-[#3b2020] bg-[#100707] px-5 py-4">
          <p className="text-sm text-[#ff6b6b]">
            {error}
          </p>
        </div>
      )}

      {/* Report */}
      {!loading && !error && (
        <>
          {/* Report status */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#181818] bg-[#050505] px-5 py-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#4edea3]" />

              <div>
                <p className="text-sm font-semibold text-white">
                  Report ready
                </p>

                <p className="text-xs text-[#555]">
                  {periodLabel} ·{" "}
                  {report.transactionCount} transactions
                  analyzed
                </p>
              </div>
            </div>

            <span className="rounded-full border border-[#183c2d] bg-[#07150f] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#4edea3]">
              Live Data
            </span>
          </div>

          {/* Summary cards */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="card card-hover p-5">
              <div className="mb-5 flex items-center justify-between">
                <div className="rounded-xl border border-[#173d2d] bg-[#07150f] p-2.5">
                  <TrendingUp className="h-5 w-5 text-[#4edea3]" />
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider text-[#555]">
                  Income
                </span>
              </div>

              <p className="text-xs text-[#737373]">
                Total income
              </p>

              <p className="number mt-1 text-2xl font-bold text-white">
                {formatCurrency(report.income)}
              </p>
            </div>

            <div className="card card-hover p-5">
              <div className="mb-5 flex items-center justify-between">
                <div className="rounded-xl border border-[#291919] bg-[#100707] p-2.5">
                  <TrendingDown className="h-5 w-5 text-[#ff6b6b]" />
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider text-[#555]">
                  Expenses
                </span>
              </div>

              <p className="text-xs text-[#737373]">
                Total expenses
              </p>

              <p className="number mt-1 text-2xl font-bold text-white">
                {formatCurrency(report.expenses)}
              </p>
            </div>

            <div className="card card-hover p-5">
              <div className="mb-5 flex items-center justify-between">
                <div className="rounded-xl border border-[#173d2d] bg-[#07150f] p-2.5">
                  <Wallet className="h-5 w-5 text-[#4edea3]" />
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider text-[#555]">
                  Savings
                </span>
              </div>

              <p className="text-xs text-[#737373]">
                Net savings
              </p>

              <p
                className={`number mt-1 text-2xl font-bold ${
                  report.savings >= 0
                    ? "text-white"
                    : "text-[#ff6b6b]"
                }`}
              >
                {formatCurrency(report.savings)}
              </p>
            </div>

            <div className="card card-hover p-5">
              <div className="mb-5 flex items-center justify-between">
                <div className="rounded-xl border border-[#181818] bg-[#111111] p-2.5">
                  <BarChart3 className="h-5 w-5 text-[#a3a3a3]" />
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider text-[#555]">
                  Rate
                </span>
              </div>

              <p className="text-xs text-[#737373]">
                Savings rate
              </p>

              <p className="number mt-1 text-2xl font-bold text-white">
                {report.savingsRate.toFixed(1)}%
              </p>
            </div>
          </section>

          {/* Main report */}
          <section className="grid gap-6 xl:grid-cols-5">
            {/* Spending breakdown */}
            <div className="card overflow-hidden xl:col-span-3">
              <div className="flex items-center justify-between border-b border-[#181818] px-6 py-5">
                <div>
                  <h2 className="font-display text-lg font-bold text-white">
                    Spending Breakdown
                  </h2>

                  <p className="mt-1 text-xs text-[#555]">
                    Highest expense categories for the
                    selected period
                  </p>
                </div>

                <Receipt className="h-5 w-5 text-[#4edea3]" />
              </div>

              <div className="p-6">
                {report.topCategories.length === 0 ? (
                  <div className="flex min-h-[220px] items-center justify-center text-center">
                    <div>
                      <Receipt className="mx-auto mb-3 h-7 w-7 text-[#333]" />

                      <p className="text-sm font-semibold text-[#737373]">
                        No expense data yet
                      </p>

                      <p className="mt-1 text-xs text-[#444]">
                        Add expense transactions to build
                        this report.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {report.topCategories.map(
                      ({ category, amount }, index) => {
                        const percentage =
                          report.expenses > 0
                            ? (amount /
                                report.expenses) *
                              100
                            : 0;

                        return (
                          <div key={category}>
                            <div className="mb-2 flex items-center justify-between gap-4">
                              <div className="flex min-w-0 items-center gap-3">
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#181818] bg-[#050505] text-[10px] font-bold text-[#737373]">
                                  {index + 1}
                                </span>

                                <span className="truncate text-sm font-semibold text-white">
                                  {category}
                                </span>
                              </div>

                              <div className="text-right">
                                <p className="number text-sm font-bold text-white">
                                  {formatCurrency(amount)}
                                </p>

                                <p className="text-[10px] text-[#555]">
                                  {percentage.toFixed(1)}%
                                </p>
                              </div>
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-[#181818]">
                              <div
                                className="h-full rounded-full bg-[#4edea3] transition-all duration-500"
                                style={{
                                  width: `${Math.min(
                                    percentage,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Financial position */}
            <div className="card overflow-hidden xl:col-span-2">
              <div className="border-b border-[#181818] px-6 py-5">
                <h2 className="font-display text-lg font-bold text-white">
                  Financial Position
                </h2>

                <p className="mt-1 text-xs text-[#555]">
                  Summary of your selected reporting period
                </p>
              </div>

              <div className="space-y-6 p-6">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs text-[#737373]">
                      Income
                    </span>

                    <span className="number text-sm font-semibold text-white">
                      {formatCompactCurrency(report.income)}
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-[#181818]">
                    <div
                      className="h-full rounded-full bg-[#4edea3]"
                      style={{
                        width:
                          report.income > 0
                            ? "100%"
                            : "0%",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs text-[#737373]">
                      Expenses
                    </span>

                    <span className="number text-sm font-semibold text-white">
                      {formatCompactCurrency(
                        report.expenses
                      )}
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-[#181818]">
                    <div
                      className="h-full rounded-full bg-[#ff6b6b]"
                      style={{
                        width: `${
                          report.income > 0
                            ? Math.min(
                                (report.expenses /
                                  report.income) *
                                  100,
                                100
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-[#181818] bg-[#050505] p-4">
                  <p className="text-xs text-[#555]">
                    Money retained
                  </p>

                  <p
                    className={`number mt-1 text-xl font-bold ${
                      report.savings >= 0
                        ? "text-[#4edea3]"
                        : "text-[#ff6b6b]"
                    }`}
                  >
                    {formatCurrency(report.savings)}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-[#555]">
                    {report.savings >= 0
                      ? `You retained ${report.savingsRate.toFixed(
                          1
                        )}% of recorded income during this period.`
                      : "Your recorded expenses exceeded income during this period."}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Transactions */}
          <section className="card overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-[#181818] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-white">
                  Report Transactions
                </h2>

                <p className="mt-1 text-xs text-[#555]">
                  Transactions included in this report
                </p>
              </div>

              <span className="rounded-full border border-[#181818] bg-[#050505] px-3 py-1 text-xs font-semibold text-[#737373]">
                {filteredTransactions.length} records
              </span>
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="flex min-h-[180px] items-center justify-center px-6 text-center">
                <div>
                  <Receipt className="mx-auto mb-3 h-7 w-7 text-[#333]" />

                  <p className="text-sm font-semibold text-[#737373]">
                    No transactions in this period
                  </p>

                  <p className="mt-1 text-xs text-[#444]">
                    Try a longer reporting period or add
                    transactions.
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead>
                    <tr className="border-b border-[#181818] bg-[#050505] text-left">
                      <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-[#555]">
                        Transaction
                      </th>

                      <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-[#555]">
                        Category
                      </th>

                      <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-[#555]">
                        Account
                      </th>

                      <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-[#555]">
                        Date
                      </th>

                      <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[#555]">
                        Amount
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {[...filteredTransactions]
                      .sort(
                        (a, b) =>
                          new Date(b.date) -
                          new Date(a.date)
                      )
                      .slice(0, 10)
                      .map((transaction) => {
                        const isIncome =
                          transaction.type === "INCOME";

                        return (
                          <tr
                            key={transaction.id}
                            className="border-b border-[#111] last:border-0 hover:bg-[#080808]"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
                                    isIncome
                                      ? "border-[#173d2d] bg-[#07150f]"
                                      : "border-[#291919] bg-[#100707]"
                                  }`}
                                >
                                  {isIncome ? (
                                    <TrendingUp className="h-4 w-4 text-[#4edea3]" />
                                  ) : (
                                    <TrendingDown className="h-4 w-4 text-[#ff6b6b]" />
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-white">
                                    {transaction.description ||
                                      "Untitled transaction"}
                                  </p>

                                  <p className="text-[11px] text-[#555]">
                                    {transaction.paymentMethod ||
                                      "No payment method"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4 text-sm text-[#a3a3a3]">
                              {transaction.category?.name ||
                                "Uncategorized"}
                            </td>

                            <td className="px-6 py-4 text-sm text-[#a3a3a3]">
                              {transaction.account?.name ||
                                "—"}
                            </td>

                            <td className="px-6 py-4 text-sm text-[#737373]">
                              {formatDate(
                                transaction.date
                              )}
                            </td>

                            <td
                              className={`number px-6 py-4 text-right text-sm font-bold ${
                                isIncome
                                  ? "text-[#4edea3]"
                                  : "text-white"
                              }`}
                            >
                              {isIncome ? "+" : "-"}
                              {formatCurrency(
                                transaction.amount
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <p className="text-center text-[11px] text-[#444]">
            CAPIVORA reports are generated from your recorded
            financial data. Exported CSV files contain only the
            transactions included in the selected period.
          </p>
        </>
      )}
    </div>
  );
}