import React from "react";
import {
  CheckCircle2,
  Lock,
  LogOut,
  Mail,
  ShieldCheck,
  User,
  WalletCards,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

function getInitials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  );
}

function SettingRow({
  icon: Icon,
  title,
  description,
  children,
}) {
  return (
    <div className="flex items-center justify-between gap-5 border-b border-[#111] px-5 py-5 last:border-b-0">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#181818] bg-[#050505]">
          <Icon className="h-4 w-4 text-[#a3a3a3]" />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">
            {title}
          </p>

          <p className="mt-1 text-xs leading-5 text-[#555]">
            {description}
          </p>
        </div>
      </div>

      <div className="shrink-0">
        {children}
      </div>
    </div>
  );
}

export default function Settings() {
  const { user, logout } = useAuth();

  const name = user?.name || "CAPIVORA User";
  const email = user?.email || "No email available";
  const initials = getInitials(name);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      {/* Page Header */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <div className="rounded-lg border border-[#181818] bg-[#050505] p-2">
            <User className="h-4 w-4 text-[#a3a3a3]" />
          </div>

          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#666]">
            Account Settings
          </span>
        </div>

        <h1 className="font-display text-3xl font-extrabold tracking-tight text-white md:text-4xl">
          Settings
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#737373]">
          Manage your account and security settings.
        </p>
      </div>

      {/* Profile */}
      <section className="card overflow-hidden">
        <div className="border-b border-[#181818] px-6 py-5">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-[#a3a3a3]" />

            <div>
              <h2 className="font-display text-lg font-bold text-white">
                Profile
              </h2>

              <p className="mt-1 text-xs text-[#555]">
                Your authenticated CAPIVORA account.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-[#222] bg-[#0a0a0a]">
              <span className="font-display text-2xl font-bold text-[#d4d4d4]">
                {initials}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-display text-xl font-bold text-white">
                {name}
              </p>

              <div className="mt-2 flex items-center gap-2 text-sm text-[#737373]">
                <Mail className="h-4 w-4 shrink-0" />

                <span className="truncate">
                  {email}
                </span>
              </div>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#202020] bg-[#050505] px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4edea3]" />

              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#737373]">
                Active
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="card overflow-hidden">
        <div className="border-b border-[#181818] px-6 py-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-[#a3a3a3]" />

            <div>
              <h2 className="font-display text-lg font-bold text-white">
                Security
              </h2>

              <p className="mt-1 text-xs text-[#555]">
                Authentication and current session status.
              </p>
            </div>
          </div>
        </div>

        <div>
          <SettingRow
            icon={Lock}
            title="Authentication"
            description="Your CAPIVORA account is protected by authenticated access."
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#4edea3]" />

              <span className="text-xs font-semibold text-[#737373]">
                Protected
              </span>
            </div>
          </SettingRow>

          <SettingRow
            icon={ShieldCheck}
            title="Session"
            description="This browser currently has an active CAPIVORA session."
          >
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4edea3]" />

              <span className="text-xs font-semibold text-[#737373]">
                Active
              </span>
            </div>
          </SettingRow>

          <SettingRow
            icon={WalletCards}
            title="Financial workspace"
            description="Your accounts, transactions, budgets, goals, analytics, and AI data belong to your authenticated account."
          >
            <span className="rounded-lg border border-[#181818] bg-[#050505] px-3 py-1.5 text-xs font-semibold text-[#666]">
              Connected
            </span>
          </SettingRow>
        </div>
      </section>

      {/* Sign Out */}
      <section className="overflow-hidden rounded-2xl border border-[#241515] bg-[#070707]">
        <div className="p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#291919] bg-[#100707]">
                <LogOut className="h-4 w-4 text-[#ff6b6b]" />
              </div>

              <div>
                <h2 className="text-sm font-bold text-white">
                  Sign out
                </h2>

                <p className="mt-1 max-w-xl text-xs leading-5 text-[#555]">
                  End your current CAPIVORA session on this browser.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#392020] bg-[#100707] px-4 py-2.5 text-sm font-bold text-[#ff6b6b] transition-all duration-200 hover:border-[#512727] hover:bg-[#160909]"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </section>

      <p className="pb-2 text-center text-[11px] text-[#333]">
        CAPIVORA · Manage Capital. Master Your Future.
      </p>
    </div>
  );
}