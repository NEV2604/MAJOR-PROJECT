import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
  Wallet,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (form.password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);

      await register(
        form.name.trim(),
        form.email.trim(),
        form.password
      );

      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.message ||
          "Unable to create your account. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="relative hidden overflow-hidden border-r border-[#181818] bg-[#050505] lg:flex">
          <div className="absolute left-[-180px] top-[-180px] h-[500px] w-[500px] rounded-full bg-[#4edea3]/5 blur-[120px]" />

          <div className="absolute bottom-[-200px] right-[-150px] h-[500px] w-[500px] rounded-full bg-[#4edea3]/5 blur-[130px]" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#252525] bg-[#101010]">
                <Wallet
                  size={22}
                  className="text-[#4edea3]"
                />
              </div>

              <div>
                <h1 className="font-display text-xl font-extrabold">
                  CAPIVORA
                </h1>

                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#4edea3]">
                  Financial Intelligence
                </p>
              </div>
            </div>

            <div className="max-w-xl">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#183d2e] bg-[#0c1712] text-[#4edea3]">
                <Sparkles size={23} />
              </div>

              <h2 className="font-display text-4xl font-extrabold leading-tight xl:text-5xl">
                Build Better
                <br />
                <span className="text-[#4edea3]">
                  Financial Habits.
                </span>
              </h2>

              <p className="mt-6 max-w-lg text-sm leading-7 text-[#777]">
                Bring your accounts, transactions, budgets,
                goals and financial insights together in one
                intelligent platform.
              </p>

              <div className="mt-8 space-y-3">
                {[
                  "Track your money in one place",
                  "Understand where your money goes",
                  "Set and monitor meaningful goals",
                  "Use AI to understand your finances",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-[#888]"
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#153b2b]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#4edea3]" />
                    </div>

                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-[#555]">
              <ShieldCheck
                size={14}
                className="text-[#4edea3]"
              />
              Secure account authentication powered by JWT.
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#252525] bg-[#101010]">
                <Wallet
                  size={20}
                  className="text-[#4edea3]"
                />
              </div>

              <div>
                <h1 className="font-display text-lg font-extrabold">
                  CAPIVORA
                </h1>

                <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#4edea3]">
                  Financial Intelligence
                </p>
              </div>
            </div>

            <div className="mb-8">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#4edea3]">
                Get started
              </p>

              <h2 className="font-display text-3xl font-bold tracking-tight">
                Create your account
              </h2>

              <p className="mt-2 text-sm text-[#666]">
                Start building a smarter financial future.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-red-900/40 bg-red-950/20 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-xs font-semibold text-[#999]"
                >
                  Full name
                </label>

                <div className="relative">
                  <UserRound
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555]"
                  />

                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="w-full rounded-xl border border-[#1b1b1b] bg-[#090909] py-3.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-[#444] focus:border-[#2e6d52] focus:ring-1 focus:ring-[#2e6d52]/30"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-semibold text-[#999]"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555]"
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-[#1b1b1b] bg-[#090909] py-3.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-[#444] focus:border-[#2e6d52] focus:ring-1 focus:ring-[#2e6d52]/30"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-xs font-semibold text-[#999]"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555]"
                  />

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    className="w-full rounded-xl border border-[#1b1b1b] bg-[#090909] py-3.5 pl-10 pr-11 text-sm text-white outline-none placeholder:text-[#444] focus:border-[#2e6d52] focus:ring-1 focus:ring-[#2e6d52]/30"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#555] hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-xs font-semibold text-[#999]"
                >
                  Confirm password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555]"
                  />

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat your password"
                    className="w-full rounded-xl border border-[#1b1b1b] bg-[#090909] py-3.5 pl-10 pr-11 text-sm text-white outline-none placeholder:text-[#444] focus:border-[#2e6d52] focus:ring-1 focus:ring-[#2e6d52]/30"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (current) => !current
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#555] hover:text-white"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="green-button mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Creating account..."
                  : "Create account"}

                {!submitting && (
                  <ArrowRight size={17} />
                )}
              </button>
            </form>

            <div className="my-7 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#171717]" />

              <span className="text-[10px] uppercase tracking-wider text-[#444]">
                Already registered?
              </span>

              <div className="h-px flex-1 bg-[#171717]" />
            </div>

            <Link
              to="/login"
              className="flex w-full items-center justify-center rounded-xl border border-[#202020] bg-[#090909] py-3.5 text-sm font-semibold text-white transition hover:border-[#333] hover:bg-[#0e0e0e]"
            >
              Sign in instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}