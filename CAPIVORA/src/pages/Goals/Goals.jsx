import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Flag,
  Loader2,
  Plus,
  RefreshCw,
  Target,
  Trash2,
  Trophy,
  Wallet,
  X,
} from "lucide-react";

import { apiRequest } from "../../services/api";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(date) {
  if (!date) return "No target date";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getProgress(current, target) {
  if (!target || target <= 0) return 0;

  return Math.min(
    Math.max((Number(current || 0) / Number(target)) * 100, 0),
    100
  );
}

function getGoalStatus(progress) {
  if (progress >= 100) {
    return {
      label: "Completed",
      className:
        "bg-[#4edea3]/10 text-[#4edea3]",
      barClass: "bg-[#4edea3]",
    };
  }

  if (progress >= 75) {
    return {
      label: "Almost There",
      className:
        "bg-[#4edea3]/10 text-[#4edea3]",
      barClass: "bg-[#4edea3]",
    };
  }

  if (progress >= 40) {
    return {
      label: "On Track",
      className:
        "bg-[#4edea3]/10 text-[#4edea3]",
      barClass: "bg-[#4edea3]",
    };
  }

  return {
    label: "In Progress",
    className:
      "bg-[#f59e0b]/10 text-[#f59e0b]",
    barClass: "bg-[#f59e0b]",
  };
}

function getMonthsRemaining(targetDate) {
  if (!targetDate) return null;

  const today = new Date();
  const target = new Date(targetDate);

  const months =
    (target.getFullYear() - today.getFullYear()) * 12 +
    (target.getMonth() - today.getMonth());

  return Math.max(months, 0);
}

function GoalIcon({ progress }) {
  if (progress >= 100) {
    return <Trophy size={21} />;
  }

  return <Target size={21} />;
}

export default function Goals() {
  const [goals, setGoals] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    targetDate: "",
  });

  async function loadGoals(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await apiRequest("/goals");

      const data =
        response?.goals ||
        response?.data?.goals ||
        response?.data ||
        response;

      setGoals(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.message ||
          "Unable to load your financial goals."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadGoals();
  }, []);

  const goalStats = useMemo(() => {
    const totalTarget = goals.reduce(
      (sum, goal) =>
        sum + Number(goal.targetAmount || 0),
      0
    );

    const totalCurrent = goals.reduce(
      (sum, goal) =>
        sum + Number(goal.currentAmount || 0),
      0
    );

    const completed = goals.filter(
      (goal) =>
        Number(goal.currentAmount || 0) >=
        Number(goal.targetAmount || 0)
    ).length;

    const overallProgress =
      totalTarget > 0
        ? Math.min(
            (totalCurrent / totalTarget) * 100,
            100
          )
        : 0;

    return {
      totalTarget,
      totalCurrent,
      remaining: Math.max(
        totalTarget - totalCurrent,
        0
      ),
      completed,
      overallProgress,
    };
  }, [goals]);

  function openCreateModal() {
    setEditingGoal(null);

    setForm({
      name: "",
      targetAmount: "",
      currentAmount: "0",
      targetDate: "",
    });

    setFormError("");
    setModalOpen(true);
  }

  function openEditModal(goal) {
    setEditingGoal(goal);

    setForm({
      name: goal.name || "",
      targetAmount: goal.targetAmount || "",
      currentAmount: goal.currentAmount || "0",
      targetDate: goal.targetDate
        ? new Date(goal.targetDate)
            .toISOString()
            .split("T")[0]
        : "",
    });

    setFormError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (submitting) return;

    setModalOpen(false);
    setEditingGoal(null);
    setFormError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const name = form.name.trim();
    const targetAmount = Number(
      form.targetAmount
    );
    const currentAmount = Number(
      form.currentAmount || 0
    );

    if (!name) {
      setFormError("Please enter a goal name.");
      return;
    }

    if (!targetAmount || targetAmount <= 0) {
      setFormError(
        "Please enter a valid target amount."
      );
      return;
    }

    if (currentAmount < 0) {
      setFormError(
        "Current amount cannot be negative."
      );
      return;
    }

    if (currentAmount > targetAmount) {
      setFormError(
        "Current amount cannot exceed the target amount."
      );
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");

      const payload = {
        name,
        targetAmount,
        currentAmount,
        targetDate: form.targetDate || null,
      };

      if (editingGoal) {
        await apiRequest(
          `/goals/${editingGoal.id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );
      } else {
        await apiRequest("/goals", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      closeModal();
      await loadGoals(true);
    } catch (err) {
      setFormError(
        err.message ||
          "Unable to save the goal."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(goal) {
    const confirmed = window.confirm(
      `Delete the "${goal.name}" goal?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await apiRequest(`/goals/${goal.id}`, {
        method: "DELETE",
      });

      await loadGoals(true);
    } catch (err) {
      setError(
        err.message ||
          "Unable to delete the goal."
      );
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <Loader2
              size={30}
              className="mx-auto mb-4 animate-spin text-[#4edea3]"
            />

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#4edea3]">
              Loading goals
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
              Goals
            </h1>

            <p className="mt-2 text-sm text-[#737373] sm:text-base">
              Turn your financial priorities into measurable
              milestones.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => loadGoals(true)}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-xl border border-[#181818] bg-[#0a0a0a] px-4 py-3 text-sm font-semibold text-[#a3a3a3] transition hover:border-[#252525] hover:bg-[#111] hover:text-white disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>

            <button
              type="button"
              onClick={openCreateModal}
              className="green-button flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold"
            >
              <Plus size={18} />

              New goal
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
              onClick={() => loadGoals(true)}
              className="text-xs font-bold text-[#ff6b6b] underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Summary */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="card card-hover p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#737373]">
                Total Target
              </span>

              <div className="rounded-xl border border-[#173d2d] bg-[#0b2118] p-2.5 text-[#4edea3]">
                <Target size={19} />
              </div>
            </div>

            <p className="number text-2xl font-bold text-[#f5f5f5]">
              {formatCurrency(
                goalStats.totalTarget
              )}
            </p>

            <p className="mt-1 text-xs text-[#737373]">
              Across all goals
            </p>
          </div>

          <div className="card card-hover p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#737373]">
                Progress
              </span>

              <div className="rounded-xl border border-[#173d2d] bg-[#0b2118] p-2.5 text-[#4edea3]">
                <Wallet size={19} />
              </div>
            </div>

            <p className="number text-2xl font-bold text-[#4edea3]">
              {formatCurrency(
                goalStats.totalCurrent
              )}
            </p>

            <p className="mt-1 text-xs text-[#737373]">
              Saved toward goals
            </p>
          </div>

          <div className="card card-hover p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#737373]">
                Remaining
              </span>

              <div className="rounded-xl border border-[#173d2d] bg-[#0b2118] p-2.5 text-[#4edea3]">
                <Flag size={19} />
              </div>
            </div>

            <p className="number text-2xl font-bold text-[#f5f5f5]">
              {formatCurrency(
                goalStats.remaining
              )}
            </p>

            <p className="mt-1 text-xs text-[#737373]">
              Still needed
            </p>
          </div>

          <div className="card card-hover p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#737373]">
                Completed
              </span>

              <div className="rounded-xl border border-[#173d2d] bg-[#0b2118] p-2.5 text-[#4edea3]">
                <Trophy size={19} />
              </div>
            </div>

            <p className="number text-2xl font-bold text-[#f5f5f5]">
              {goalStats.completed}
            </p>

            <p className="mt-1 text-xs text-[#737373]">
              Of {goals.length} total goals
            </p>
          </div>
        </div>

        {/* Overall Progress */}
        {goals.length > 0 && (
          <section className="card mb-6 p-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-[#f5f5f5]">
                  Overall Goal Progress
                </h2>

                <p className="mt-1 text-sm text-[#737373]">
                  Combined progress across your financial
                  goals.
                </p>
              </div>

              <span className="number text-xl font-bold text-[#4edea3]">
                {goalStats.overallProgress.toFixed(1)}%
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-[#181818]">
              <div
                className="h-full rounded-full bg-[#4edea3] transition-all"
                style={{
                  width: `${goalStats.overallProgress}%`,
                }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-[#737373]">
              <span>
                {formatCurrency(
                  goalStats.totalCurrent
                )}{" "}
                saved
              </span>

              <span>
                {formatCurrency(
                  goalStats.totalTarget
                )}{" "}
                target
              </span>
            </div>
          </section>
        )}

        {/* Goals */}
        <section className="card overflow-hidden">
          <div className="border-b border-[#181818] p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-[#f5f5f5]">
                  Financial Goals
                </h2>

                <p className="mt-1 text-sm text-[#737373]">
                  Track the milestones that matter to you.
                </p>
              </div>

              <div className="rounded-lg bg-[#111] px-3 py-2 text-xs font-semibold text-[#a3a3a3]">
                {goals.length}{" "}
                {goals.length === 1
                  ? "goal"
                  : "goals"}
              </div>
            </div>
          </div>

          <div className="p-6">
            {goals.length === 0 ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-[#242424] bg-[#050505] px-6 text-center">
                <div className="mb-4 rounded-2xl border border-[#173d2d] bg-[#0b2118] p-4 text-[#4edea3]">
                  <Target size={30} />
                </div>

                <h3 className="text-lg font-bold text-[#f5f5f5]">
                  No financial goals yet
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-[#737373]">
                  Create your first goal to start tracking
                  progress toward a savings milestone.
                </p>

                <button
                  type="button"
                  onClick={openCreateModal}
                  className="green-button mt-5 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold"
                >
                  <Plus size={17} />

                  Create first goal
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {goals.map((goal) => {
                  const target = Number(
                    goal.targetAmount || 0
                  );

                  const current = Number(
                    goal.currentAmount || 0
                  );

                  const progress =
                    getProgress(
                      current,
                      target
                    );

                  const remaining = Math.max(
                    target - current,
                    0
                  );

                  const status =
                    getGoalStatus(progress);

                  const monthsRemaining =
                    getMonthsRemaining(
                      goal.targetDate
                    );

                  const monthlyRequired =
                    monthsRemaining &&
                    monthsRemaining > 0
                      ? remaining /
                        monthsRemaining
                      : remaining;

                  return (
                    <article
                      key={goal.id}
                      className="group rounded-2xl border border-[#181818] bg-[#0a0a0a] p-5 transition hover:border-[#252525] hover:bg-[#0d0d0d]"
                    >
                      {/* Goal Header */}
                      <div className="mb-5 flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#173d2d] bg-[#0b2118] text-[#4edea3]">
                            <GoalIcon
                              progress={progress}
                            />
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate font-display text-lg font-bold text-[#f5f5f5]">
                              {goal.name}
                            </h3>

                            <div className="mt-1 flex items-center gap-2 text-xs text-[#737373]">
                              <CalendarDays size={13} />

                              <span>
                                Target:{" "}
                                {formatDate(
                                  goal.targetDate
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${status.className}`}
                          >
                            {progress.toFixed(0)}%{" "}
                            {status.label}
                          </span>

                          <div className="flex opacity-0 transition group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(
                                  goal
                                )
                              }
                              className="rounded-lg p-2 text-[#737373] hover:bg-[#181818] hover:text-white"
                              title="Edit goal"
                            >
                              <Edit3 size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  goal
                                )
                              }
                              className="rounded-lg p-2 text-[#737373] hover:bg-[#241010] hover:text-[#ff6b6b]"
                              title="Delete goal"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Amounts */}
                      <div className="mb-3 flex items-baseline justify-between">
                        <span className="number text-xl font-bold text-[#f5f5f5]">
                          {formatCurrency(current)}
                        </span>

                        <span className="number text-sm text-[#737373]">
                          of{" "}
                          {formatCurrency(target)}
                        </span>
                      </div>

                      {/* Progress */}
                      <div className="h-2.5 overflow-hidden rounded-full bg-[#181818]">
                        <div
                          className={`h-full rounded-full transition-all ${status.barClass}`}
                          style={{
                            width: `${progress}%`,
                          }}
                        />
                      </div>

                      {/* Footer */}
                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-xl bg-[#050505] p-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#555]">
                            Remaining
                          </p>

                          <p className="number mt-1 text-sm font-semibold text-[#f5f5f5]">
                            {formatCurrency(
                              remaining
                            )}
                          </p>
                        </div>

                        <div className="rounded-xl bg-[#050505] p-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#555]">
                            Monthly Pace
                          </p>

                          <p className="number mt-1 text-sm font-semibold text-[#4edea3]">
                            {formatCurrency(
                              monthlyRequired
                            )}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Goal Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#252525] bg-[#0a0a0a] shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#181818] p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-[#173d2d] bg-[#0b2118] p-2.5 text-[#4edea3]">
                  {editingGoal ? (
                    <Edit3 size={19} />
                  ) : (
                    <Plus size={19} />
                  )}
                </div>

                <div>
                  <h2 className="font-display text-lg font-bold text-[#f5f5f5]">
                    {editingGoal
                      ? "Edit Goal"
                      : "New Goal"}
                  </h2>

                  <p className="mt-1 text-xs text-[#737373]">
                    Define a measurable financial milestone.
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

            {/* Form */}
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

              {/* Name */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#737373]">
                  Goal Name
                </label>

                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="e.g. Emergency Fund"
                  className="w-full rounded-xl border border-[#181818] bg-[#050505] px-4 py-3 text-sm text-[#f5f5f5] outline-none transition placeholder:text-[#444] focus:border-[#4edea3]/50"
                />
              </div>

              {/* Amounts */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#737373]">
                    Target Amount
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[#737373]">
                      ₹
                    </span>

                    <input
                      required
                      type="number"
                      min="1"
                      step="0.01"
                      value={form.targetAmount}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          targetAmount:
                            event.target.value,
                        }))
                      }
                      placeholder="100000"
                      className="number w-full rounded-xl border border-[#181818] bg-[#050505] py-3 pl-10 pr-4 text-sm text-[#f5f5f5] outline-none transition placeholder:text-[#444] focus:border-[#4edea3]/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#737373]">
                    Current Amount
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[#737373]">
                      ₹
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.currentAmount}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          currentAmount:
                            event.target.value,
                        }))
                      }
                      placeholder="0"
                      className="number w-full rounded-xl border border-[#181818] bg-[#050505] py-3 pl-10 pr-4 text-sm text-[#f5f5f5] outline-none transition placeholder:text-[#444] focus:border-[#4edea3]/50"
                    />
                  </div>
                </div>
              </div>

              {/* Target Date */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#737373]">
                  Target Date
                </label>

                <div className="relative">
                  <CalendarDays
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#525252]"
                  />

                  <input
                    type="date"
                    value={form.targetDate}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        targetDate:
                          event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-[#181818] bg-[#050505] py-3 pl-11 pr-4 text-sm text-[#f5f5f5] outline-none transition focus:border-[#4edea3]/50"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="rounded-xl border border-[#181818] bg-[#050505] p-4">
                <div className="flex items-start gap-3">
                  <Target
                    size={18}
                    className="mt-0.5 shrink-0 text-[#4edea3]"
                  />

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#f5f5f5]">
                      Goal preview
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#737373]">
                      {form.name.trim() ||
                        "Your goal"}{" "}
                      •{" "}
                      {formatCurrency(
                        Number(
                          form.currentAmount || 0
                        )
                      )}{" "}
                      of{" "}
                      {formatCurrency(
                        Number(
                          form.targetAmount || 0
                        )
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
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

                  {editingGoal
                    ? "Save changes"
                    : "Create goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}