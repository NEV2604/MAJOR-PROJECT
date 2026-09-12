import React, { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  PiggyBank,
  TrendingUp,
  ReceiptText,
  RefreshCw,
} from "lucide-react";

import { apiRequest } from "../../services/api";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  positive,
}) {
  return (
    <div className="card card-hover p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#737373]">
            {title}
          </p>

          <p className="number mt-3 text-2xl font-bold text-white">
            {value}
          </p>

          {description && (
            <p
              className={`mt-2 text-xs ${
                positive === true
                  ? "text-[#4edea3]"
                  : positive === false
                    ? "text-[#ff6b6b]"
                    : "text-[#737373]"
              }`}
            >
              {description}
            </p>
          )}
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#183d2e] bg-[#0c1712]">
          <Icon size={19} className="text-[#4edea3]" />
        </div>
      </div>
    </div>
  );
}

function TransactionRow({ transaction }) {
  const isIncome = transaction.type === "INCOME";

  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#181818] py-4 last:border-b-0">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isIncome ? "bg-[#0c1712]" : "bg-[#15100f]"
          }`}
        >
          {isIncome ? (
            <ArrowDownRight
              size={18}
              className="text-[#4edea3]"
            />
          ) : (
            <ArrowUpRight
              size={18}
              className="text-[#ff8a8a]"
            />
          )}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">
            {transaction.description ||
              "Untitled transaction"}
          </p>

          <p className="mt-1 truncate text-xs text-[#737373]">
            {transaction.category?.name ||
              transaction.category ||
              "Uncategorized"}
            {" • "}
            {transaction.account?.name ||
              transaction.account ||
              "Account"}
          </p>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p
          className={`number text-sm font-semibold ${
            isIncome ? "text-[#4edea3]" : "text-white"
          }`}
        >
          {isIncome ? "+" : "-"}
          {formatCurrency(transaction.amount)}
        </p>

        <p className="mt-1 text-[10px] text-[#555]">
          {new Date(
            transaction.date
          ).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setError("");

      const response = await apiRequest("/dashboard");

      /*
       * Backend response:
       *
       * {
       *   success: true,
       *   dashboard: {
       *     summary: {
       *       totalBalance,
       *       totalIncome,
       *       totalExpenses,
       *       savings,
       *       savingsRate
       *     },
       *     accounts,
       *     recentTransactions
       *   }
       * }
       *
       * Flatten summary so the UI can directly use
       * dashboard.totalBalance, dashboard.totalIncome, etc.
       */

      const dashboardResponse =
        response?.dashboard ||
        response?.data?.dashboard ||
        response?.data ||
        response;

      const dashboardData = {
        ...(dashboardResponse?.summary || {}),
        accounts: dashboardResponse?.accounts || [],
        recentTransactions:
          dashboardResponse?.recentTransactions || [],
      };

      setDashboard(dashboardData);
    } catch (err) {
      setError(
        err.message ||
          "Unable to load your financial dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <RefreshCw
            size={28}
            className="mx-auto animate-spin text-[#4edea3]"
          />

          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#737373]">
            Loading your finances
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-900/40 bg-red-950/20 p-6">
            <p className="text-sm font-semibold text-red-300">
              Unable to load dashboard
            </p>

            <p className="mt-2 text-sm text-red-400/80">
              {error}
            </p>

            <button
              onClick={loadDashboard}
              className="mt-5 rounded-lg border border-[#333] bg-[#111] px-4 py-2 text-xs font-semibold text-white hover:bg-[#181818]"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const recentTransactions =
    dashboard?.recentTransactions || [];

  const savingsRate = Number(
    dashboard?.savingsRate || 0
  );

  return (
    <div className="min-h-screen bg-black p-5 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4edea3]">
              Financial overview
            </p>

            <h1 className="font-display mt-2 text-3xl font-extrabold tracking-tight text-white">
              Your Dashboard
            </h1>

            <p className="mt-2 text-sm text-[#737373]">
              A clear view of your financial position.
            </p>
          </div>

          <button
            onClick={loadDashboard}
            className="flex w-fit items-center gap-2 rounded-lg border border-[#202020] bg-[#0a0a0a] px-4 py-2.5 text-xs font-semibold text-[#a3a3a3] transition hover:border-[#333] hover:text-white"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {/* Total Balance */}
        <div className="mb-6 rounded-2xl border border-[#183d2e] bg-[#07110c] p-6 green-glow">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#4edea3]">
                <Wallet size={15} />
                Total Balance
              </div>

              <p className="number mt-3 text-4xl font-extrabold tracking-tight text-white">
                {formatCurrency(
                  dashboard?.totalBalance
                )}
              </p>

              <p className="mt-2 text-xs text-[#737373]">
                Across all your connected accounts
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#183d2e] bg-[#0c1712]">
              <TrendingUp
                size={25}
                className="text-[#4edea3]"
              />
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Income"
            value={formatCurrency(
              dashboard?.totalIncome
            )}
            icon={ArrowDownRight}
            description="Recorded income"
            positive
          />

          <StatCard
            title="Total Expenses"
            value={formatCurrency(
              dashboard?.totalExpenses
            )}
            icon={ArrowUpRight}
            description="Recorded spending"
          />

          <StatCard
            title="Net Savings"
            value={formatCurrency(
              dashboard?.savings
            )}
            icon={PiggyBank}
            description="Income minus expenses"
            positive={
              Number(dashboard?.savings || 0) >= 0
            }
          />

          <StatCard
            title="Savings Rate"
            value={`${savingsRate.toFixed(1)}%`}
            icon={TrendingUp}
            description="Based on recorded income"
            positive={savingsRate >= 20}
          />
        </div>

        {/* Lower Section */}
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">

          {/* Recent Transactions */}
          <section className="card p-5">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-white">
                  Recent Transactions
                </h2>

                <p className="mt-1 text-xs text-[#737373]">
                  Your latest financial activity
                </p>
              </div>

              <ReceiptText
                size={19}
                className="text-[#4edea3]"
              />
            </div>

            {recentTransactions.length === 0 ? (
              <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#111]">
                  <ReceiptText
                    size={21}
                    className="text-[#555]"
                  />
                </div>

                <p className="mt-4 text-sm font-semibold text-[#aaa]">
                  No transactions yet
                </p>

                <p className="mt-1 max-w-xs text-xs leading-5 text-[#555]">
                  Add your first income or expense to start
                  building your financial picture.
                </p>
              </div>
            ) : (
              <div className="mt-3">
                {recentTransactions.map(
                  (transaction) => (
                    <TransactionRow
                      key={transaction.id}
                      transaction={transaction}
                    />
                  )
                )}
              </div>
            )}
          </section>

          {/* Financial Health */}
          <section className="card p-5">
            <div className="mb-6">
              <h2 className="font-display text-lg font-bold text-white">
                Financial Health
              </h2>

              <p className="mt-1 text-xs text-[#737373]">
                Based on your current recorded activity
              </p>
            </div>

            <div className="rounded-xl border border-[#181818] bg-[#050505] p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#737373]">
                  Savings rate
                </span>

                <span className="number text-sm font-bold text-[#4edea3]">
                  {savingsRate.toFixed(1)}%
                </span>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#181818]">
                <div
                  className="h-full rounded-full bg-[#4edea3] transition-all"
                  style={{
                    width: `${Math.min(
                      Math.max(savingsRate, 0),
                      100
                    )}%`,
                  }}
                />
              </div>

              <p className="mt-4 text-xs leading-5 text-[#666]">
                {savingsRate >= 20
                  ? "Your recorded savings rate is looking healthy."
                  : savingsRate > 0
                    ? "There is room to strengthen your savings rate."
                    : "Add income and expense transactions to measure your savings rate."}
              </p>
            </div>

            <div className="mt-4 rounded-xl border border-[#181818] bg-[#050505] p-5">
              <p className="text-xs uppercase tracking-[0.12em] text-[#555]">
                Net savings
              </p>

              <p className="number mt-2 text-2xl font-bold text-white">
                {formatCurrency(
                  dashboard?.savings
                )}
              </p>

              <p className="mt-2 text-xs text-[#666]">
                Current recorded financial surplus.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}