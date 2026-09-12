import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CircleDollarSign,
  Loader2,
  PieChart as PieChartIcon,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { apiRequest } from "../../services/api";

const formatCurrency = (value) => {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatChartCurrency = (value) => {
  const amount = Number(value || 0);

  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }

  if (amount >= 1000) {
    return `₹${Math.round(amount / 1000)}K`;
  }

  return `₹${amount}`;
};

const formatPercent = (value) => {
  const number = Number(value || 0);

  return `${number.toFixed(1)}%`;
};

const formatMonth = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });
  }

  return String(value);
};

const getAnalyticsPayload = (response) => {
  if (response?.analytics) {
    return response.analytics;
  }

  if (response?.data?.analytics) {
    return response.data.analytics;
  }

  if (response?.data) {
    return response.data;
  }

  return response || {};
};

const getCategoryData = (analytics) => {
  const data =
    analytics?.expenseByCategory ||
    analytics?.expensesByCategory ||
    analytics?.categoryBreakdown ||
    [];

  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((item) => ({
      name:
        item.categoryName ||
        item.category ||
        item.name ||
        "Other",
      value: Number(
        item.amount ??
          item.total ??
          item.value ??
          item.expenses ??
          0
      ),
    }))
    .filter((item) => item.value > 0);
};

const getMonthlyData = (analytics) => {
  const data =
    analytics?.monthlyTrend ||
    analytics?.monthlyTrends ||
    analytics?.monthlyData ||
    [];

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((item) => ({
    month:
      item.monthName ||
      item.month ||
      item.label ||
      formatMonth(item.date),
    income: Number(
      item.income ??
        item.totalIncome ??
        0
    ),
    expenses: Number(
      item.expenses ??
        item.totalExpenses ??
        item.expense ??
        0
    ),
    savings: Number(
      item.savings ??
        item.netSavings ??
        0
    ),
  }));
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-[#252525] bg-[#0a0a0a] px-4 py-3 shadow-2xl">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#737373]">
        {label}
      </p>

      {payload.map((entry) => (
        <div
          key={entry.dataKey}
          className="flex items-center justify-between gap-6 text-sm"
        >
          <span className="text-[#a3a3a3]">
            {entry.name}
          </span>

          <span className="font-semibold text-[#f5f5f5]">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

const PIE_COLORS = [
  "#4EDEA3",
  "#10B981",
  "#34D399",
  "#6EE7B7",
  "#A7F3D0",
  "#059669",
  "#047857",
  "#065F46",
];

export default function Analytics() {
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadAnalytics() {
      try {
        setLoading(true);
        setError("");

        const response = await apiRequest("/analytics");

        if (mounted) {
          setAnalytics(getAnalyticsPayload(response));
        }
      } catch (err) {
        if (mounted) {
          setError(
            err.message ||
              "Unable to load analytics."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadAnalytics();

    return () => {
      mounted = false;
    };
  }, []);

  const totalIncome = Number(
    analytics?.totalIncome ??
      analytics?.income ??
      analytics?.summary?.totalIncome ??
      0
  );

  const totalExpenses = Number(
    analytics?.totalExpenses ??
      analytics?.expenses ??
      analytics?.summary?.totalExpenses ??
      0
  );

  const netSavings = Number(
    analytics?.netSavings ??
      analytics?.savings ??
      analytics?.summary?.netSavings ??
      totalIncome - totalExpenses
  );

  const savingsRate = Number(
    analytics?.savingsRate ??
      analytics?.summary?.savingsRate ??
      (totalIncome > 0
        ? (netSavings / totalIncome) * 100
        : 0)
  );

  const topSpendingCategory =
    analytics?.topSpendingCategory ||
    analytics?.summary?.topSpendingCategory ||
    null;

  const categoryData = useMemo(
    () => getCategoryData(analytics),
    [analytics]
  );

  const monthlyData = useMemo(
    () => getMonthlyData(analytics),
    [analytics]
  );

  const highestCategory = useMemo(() => {
    if (!categoryData.length) {
      return null;
    }

    return [...categoryData].sort(
      (a, b) => b.value - a.value
    )[0];
  }, [categoryData]);

  const calculatedTopCategory =
    typeof topSpendingCategory === "string"
      ? topSpendingCategory
      : topSpendingCategory?.category ||
        topSpendingCategory?.name ||
        highestCategory?.name ||
        "No data";

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-[#4edea3]" />

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4edea3]">
            Analyzing your finances
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="card border-[#3b2020] p-8 text-center">
          <Activity className="mx-auto mb-4 h-10 w-10 text-[#ff6b6b]" />

          <h2 className="font-display text-xl font-bold text-white">
            Analytics unavailable
          </h2>

          <p className="mt-2 text-sm text-[#a3a3a3]">
            {error}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="green-button mt-6 rounded-xl px-5 py-2.5 text-sm font-bold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex items-center gap-2">
            <div className="rounded-lg border border-[#173d2d] bg-[#07150f] p-2">
              <BarChart3 className="h-4 w-4 text-[#4edea3]" />
            </div>

            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#4edea3]">
              Financial Intelligence
            </span>
          </div>

          <h1 className="font-display text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            Analytics
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#737373]">
            Understand where your money goes, how much you save,
            and how your financial behavior changes over time.
          </p>
        </div>

        <div className="flex max-w-full items-center gap-2 overflow-hidden rounded-xl border border-[#181818] bg-[#0a0a0a] px-4 py-2.5">
          <CalendarDays className="h-4 w-4 shrink-0 text-[#737373]" />

          <span className="truncate text-xs font-semibold text-[#a3a3a3]">
            Based on your recorded transactions
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card card-hover min-w-0 p-5">
          <div className="mb-5 flex items-center justify-between">
            <div className="rounded-xl border border-[#173d2d] bg-[#07150f] p-2.5">
              <ArrowUpRight className="h-5 w-5 text-[#4edea3]" />
            </div>

            <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
              Income
            </span>
          </div>

          <p className="number truncate text-2xl font-bold text-white">
            {formatCurrency(totalIncome)}
          </p>

          <p className="mt-1 text-xs text-[#737373]">
            Total recorded income
          </p>
        </div>

        <div className="card card-hover min-w-0 p-5">
          <div className="mb-5 flex items-center justify-between">
            <div className="rounded-xl border border-[#292020] bg-[#130909] p-2.5">
              <ArrowDownRight className="h-5 w-5 text-[#ff6b6b]" />
            </div>

            <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
              Expenses
            </span>
          </div>

          <p className="number truncate text-2xl font-bold text-white">
            {formatCurrency(totalExpenses)}
          </p>

          <p className="mt-1 text-xs text-[#737373]">
            Total recorded expenses
          </p>
        </div>

        <div className="card card-hover green-glow min-w-0 p-5">
          <div className="mb-5 flex items-center justify-between">
            <div className="rounded-xl border border-[#173d2d] bg-[#07150f] p-2.5">
              <Wallet className="h-5 w-5 text-[#4edea3]" />
            </div>

            <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
              Net Savings
            </span>
          </div>

          <p
            className={`number truncate text-2xl font-bold ${
              netSavings >= 0
                ? "text-[#4edea3]"
                : "text-[#ff6b6b]"
            }`}
          >
            {formatCurrency(netSavings)}
          </p>

          <p className="mt-1 text-xs text-[#737373]">
            Income minus expenses
          </p>
        </div>

        <div className="card card-hover min-w-0 p-5">
          <div className="mb-5 flex items-center justify-between">
            <div className="rounded-xl border border-[#173d2d] bg-[#07150f] p-2.5">
              <TrendingUp className="h-5 w-5 text-[#4edea3]" />
            </div>

            <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
              Savings Rate
            </span>
          </div>

          <p className="number truncate text-2xl font-bold text-white">
            {formatPercent(savingsRate)}
          </p>

          <p className="mt-1 text-xs text-[#737373]">
            Percentage of income saved
          </p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid min-w-0 gap-6 xl:grid-cols-[1.6fr_1fr]">
        {/* Monthly Trend */}
        <section className="card min-w-0 overflow-hidden p-5 md:p-6">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#4edea3]" />

                <h2 className="font-display text-lg font-bold text-white">
                  Income vs Expenses
                </h2>
              </div>

              <p className="mt-1 text-sm text-[#737373]">
                Monthly financial performance
              </p>
            </div>
          </div>

          <div className="h-[320px] w-full min-w-0">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <AreaChart
                  data={monthlyData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 15,
                    bottom: 5,
                  }}
                >
                  <defs>
                    <linearGradient
                      id="incomeGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#4edea3"
                        stopOpacity={0.3}
                      />

                      <stop
                        offset="100%"
                        stopColor="#4edea3"
                        stopOpacity={0}
                      />
                    </linearGradient>

                    <linearGradient
                      id="expenseGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#ff6b6b"
                        stopOpacity={0.18}
                      />

                      <stop
                        offset="100%"
                        stopColor="#ff6b6b"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    stroke="#181818"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#737373",
                      fontSize: 11,
                    }}
                    tickMargin={10}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    width={60}
                    tick={{
                      fill: "#737373",
                      fontSize: 11,
                    }}
                    tickFormatter={formatChartCurrency}
                    tickMargin={6}
                  />

                  <Tooltip
                    content={<CustomTooltip />}
                  />

                  <Area
                    type="monotone"
                    dataKey="income"
                    name="Income"
                    stroke="#4edea3"
                    strokeWidth={2}
                    fill="url(#incomeGradient)"
                    dot={{
                      r: 3,
                      strokeWidth: 2,
                      fill: "#0a0a0a",
                    }}
                    activeDot={{
                      r: 5,
                      strokeWidth: 2,
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="expenses"
                    name="Expenses"
                    stroke="#ff6b6b"
                    strokeWidth={2}
                    fill="url(#expenseGradient)"
                    dot={{
                      r: 3,
                      strokeWidth: 2,
                      fill: "#0a0a0a",
                    }}
                    activeDot={{
                      r: 5,
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-[#202020]">
                <BarChart3 className="mb-3 h-9 w-9 text-[#333]" />

                <p className="text-sm font-semibold text-[#a3a3a3]">
                  Not enough data yet
                </p>

                <p className="mt-1 text-xs text-[#555]">
                  Add transactions to build your monthly trend.
                </p>
              </div>
            )}
          </div>

          {/* Chart Legend */}
          {monthlyData.length > 0 && (
            <div className="mt-4 flex items-center gap-6 border-t border-[#181818] pt-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#4edea3]" />
                <span className="text-xs font-medium text-[#737373]">
                  Income
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff6b6b]" />
                <span className="text-xs font-medium text-[#737373]">
                  Expenses
                </span>
              </div>
            </div>
          )}
        </section>

        {/* Expense Breakdown */}
        <section className="card min-w-0 overflow-hidden p-5 md:p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-[#4edea3]" />

              <h2 className="font-display text-lg font-bold text-white">
                Expense Breakdown
              </h2>
            </div>

            <p className="mt-1 text-sm text-[#737373]">
              Where your money is being spent
            </p>
          </div>

          {categoryData.length > 0 ? (
            <>
              <div className="relative h-[240px]">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {categoryData.map(
                        (entry, index) => (
                          <Cell
                            key={`${entry.name}-${index}`}
                            fill={
                              PIE_COLORS[
                                index %
                                  PIE_COLORS.length
                              ]
                            }
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip
                      formatter={(value) =>
                        formatCurrency(value)
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="number text-xl font-bold text-white">
                      {formatCurrency(totalExpenses)}
                    </p>

                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#737373]">
                      Total
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {categoryData
                  .slice(0, 6)
                  .map((category, index) => {
                    const percentage =
                      totalExpenses > 0
                        ? (category.value /
                            totalExpenses) *
                          100
                        : 0;

                    return (
                      <div
                        key={category.name}
                        className="flex items-center justify-between gap-3"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{
                              background:
                                PIE_COLORS[
                                  index %
                                    PIE_COLORS.length
                                ],
                            }}
                          />

                          <span className="truncate text-sm text-[#a3a3a3]">
                            {category.name}
                          </span>
                        </div>

                        <div className="flex shrink-0 items-center gap-3">
                          <span className="number text-sm font-semibold text-white">
                            {formatCurrency(
                              category.value
                            )}
                          </span>

                          <span className="w-12 text-right text-xs text-[#555]">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </>
          ) : (
            <div className="flex h-[380px] flex-col items-center justify-center rounded-xl border border-dashed border-[#202020]">
              <PieChartIcon className="mb-3 h-9 w-9 text-[#333]" />

              <p className="text-sm font-semibold text-[#a3a3a3]">
                No expense breakdown yet
              </p>

              <p className="mt-1 text-center text-xs text-[#555]">
                Categorized expenses will appear here.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Insights */}
      <section className="card p-5 md:p-6">
        <div className="mb-6 flex items-center gap-2">
          <CircleDollarSign className="h-5 w-5 text-[#4edea3]" />

          <div>
            <h2 className="font-display text-lg font-bold text-white">
              Financial Insights
            </h2>

            <p className="mt-1 text-sm text-[#737373]">
              Signals generated from your actual financial activity
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-[#181818] bg-[#050505] p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#555]">
              Top Spending Category
            </p>

            <p className="mt-3 font-display text-xl font-bold text-white">
              {calculatedTopCategory}
            </p>

            {highestCategory && (
              <p className="mt-1 text-sm text-[#737373]">
                {formatCurrency(
                  highestCategory.value
                )}{" "}
                recorded
              </p>
            )}
          </div>

          <div className="rounded-xl border border-[#181818] bg-[#050505] p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#555]">
              Savings Position
            </p>

            <p
              className={`mt-3 font-display text-xl font-bold ${
                netSavings >= 0
                  ? "text-[#4edea3]"
                  : "text-[#ff6b6b]"
              }`}
            >
              {netSavings >= 0
                ? "Positive"
                : "Negative"}
            </p>

            <p className="mt-1 text-sm text-[#737373]">
              {formatCurrency(netSavings)} net savings
            </p>
          </div>

          <div className="rounded-xl border border-[#181818] bg-[#050505] p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#555]">
              Savings Rate
            </p>

            <p className="mt-3 font-display text-xl font-bold text-white">
              {formatPercent(savingsRate)}
            </p>

            <p className="mt-1 text-sm text-[#737373]">
              Of recorded income retained
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}