import { GoogleLogin } from "@react-oauth/google";
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
  Wallet,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
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

    if (!form.email.trim() || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setSubmitting(true);

      await login(form.email.trim(), form.password);

      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.message ||
          "Unable to sign in. Please check your credentials."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSuccess(response) {
    setError("");

    try {
      setSubmitting(true);

      await loginWithGoogle(response.credential);

      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.message ||
          "Unable to sign in with Google. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleGoogleError() {
    setError("Google sign-in was unsuccessful. Please try again.");
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
                <Wallet size={22} className="text-[#4edea3]" />
              </div>

              <div>
                <h1 className="font-display text-xl font-extrabold tracking-tight">
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
                Manage Capital.
                <br />
                <span className="text-[#4edea3]">
                  Master Your Future.
                </span>
              </h2>

              <p className="mt-6 max-w-lg text-sm leading-7 text-[#777]">
                CAPIVORA transforms your financial data into
                actionable intelligence, helping you understand
                your money, plan with confidence, and make
                smarter financial decisions.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  "Smart Analytics",
                  "AI Insights",
                  "Goal Tracking",
                  "Budget Intelligence",
                ].map((feature) => (
                  <div
                    key={feature}
                    className="rounded-full border border-[#1b1b1b] bg-[#0a0a0a] px-3 py-1.5 text-[10px] font-medium text-[#888]"
                  >
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-[#555]">
              <ShieldCheck
                size={14}
                className="text-[#4edea3]"
              />
              Your financial data is protected with secure
              authentication.
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-10 flex items-center gap-3 lg:hidden">
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
                Welcome back
              </p>

              <h2 className="font-display text-3xl font-bold tracking-tight">
                Sign in to CAPIVORA
              </h2>

              <p className="mt-2 text-sm text-[#666]">
                Continue managing your financial future.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-red-900/40 bg-red-950/20 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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
                    className="w-full rounded-xl border border-[#1b1b1b] bg-[#090909] py-3.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-[#444] focus:border-[#2e6d52] focus:ring-1 focus:ring-[#2e6d52]/30"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-xs font-semibold text-[#999]"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-[11px] font-medium text-[#4edea3] hover:text-[#6ffbbe]"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <LockKeyhole
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555]"
                  />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-[#1b1b1b] bg-[#090909] py-3.5 pl-10 pr-11 text-sm text-white outline-none transition placeholder:text-[#444] focus:border-[#2e6d52] focus:ring-1 focus:ring-[#2e6d52]/30"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((current) => !current)
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

              <button
                type="submit"
                disabled={submitting}
                className="green-button flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Signing in..." : "Sign in"}

                {!submitting && <ArrowRight size={17} />}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#171717]" />

              <span className="text-[10px] uppercase tracking-wider text-[#444]">
                or
              </span>

              <div className="h-px flex-1 bg-[#171717]" />
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                theme="filled_black"
                size="large"
                width="400"
                text="signin_with"
                shape="rectangular"
              />
            </div>

            <div className="my-7 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#171717]" />

              <span className="text-[10px] uppercase tracking-wider text-[#444]">
                New to CAPIVORA?
              </span>

              <div className="h-px flex-1 bg-[#171717]" />
            </div>

            <Link
              to="/register"
              className="flex w-full items-center justify-center rounded-xl border border-[#202020] bg-[#090909] py-3.5 text-sm font-semibold text-white transition hover:border-[#333] hover:bg-[#0e0e0e]"
            >
              Create your account
            </Link>

            <p className="mt-8 text-center text-[10px] leading-5 text-[#444]">
              By continuing, you agree to use CAPIVORA
              responsibly for personal financial management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}