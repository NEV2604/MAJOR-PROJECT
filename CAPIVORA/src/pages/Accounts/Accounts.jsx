import React, { useEffect, useMemo, useState } from "react";
import {
  Banknote,
  Wallet,
  CreditCard,
  Landmark,
  PiggyBank,
  BriefcaseBusiness,
  Plus,
  Pencil,
  Trash2,
  X,
  RefreshCw,
} from "lucide-react";

import { apiRequest } from "../../services/api";

const ACCOUNT_TYPES = [
  { value: "BANK", label: "Bank Account", icon: Landmark },
  { value: "SAVINGS", label: "Savings Account", icon: PiggyBank },
  { value: "CREDIT_CARD", label: "Credit Card", icon: CreditCard },
  { value: "CASH", label: "Cash", icon: Banknote },
  { value: "WALLET", label: "Wallet", icon: Wallet },
  { value: "INVESTMENT", label: "Investment", icon: BriefcaseBusiness },
];

function getAccountType(type) {
  return (
    ACCOUNT_TYPES.find((item) => item.value === type) ||
    ACCOUNT_TYPES[0]
  );
}

function formatCurrency(value, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function AccountIcon({ type }) {
  const accountType = getAccountType(type);
  const Icon = accountType.icon;

  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#183d2e] bg-[#0c1712]">
      <Icon size={20} className="text-[#4edea3]" />
    </div>
  );
}

function AccountModal({
  open,
  onClose,
  onSaved,
  editingAccount,
}) {
  const [form, setForm] = useState({
    name: "",
    type: "BANK",
    balance: "",
    currency: "INR",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingAccount) {
      setForm({
        name: editingAccount.name || "",
        type: editingAccount.type || "BANK",
        balance: String(editingAccount.balance ?? ""),
        currency: editingAccount.currency || "INR",
      });
    } else {
      setForm({
        name: "",
        type: "BANK",
        balance: "",
        currency: "INR",
      });
    }

    setError("");
  }, [editingAccount, open]);

  if (!open) return null;

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Please enter an account name.");
      return;
    }

    if (form.balance === "" || Number.isNaN(Number(form.balance))) {
      setError("Please enter a valid balance.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: form.name.trim(),
        type: form.type,
        balance: Number(form.balance),
        currency: form.currency,
      };

      if (editingAccount) {
        await apiRequest(`/accounts/${editingAccount.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest("/accounts", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      await onSaved();
      onClose();
    } catch (err) {
      setError(
        err.message ||
          "Unable to save the account. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-[#242424] bg-[#0a0a0a] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#181818] px-6 py-5">
          <div>
            <h2 className="font-display text-lg font-bold text-white">
              {editingAccount ? "Edit Account" : "Add Account"}
            </h2>

            <p className="mt-1 text-xs text-[#666]">
              {editingAccount
                ? "Update your account details."
                : "Add a financial account to CAPIVORA."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#666] transition hover:bg-[#151515] hover:text-white"
          >
            <X size={19} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {error && (
            <div className="rounded-xl border border-red-900/40 bg-red-950/20 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="account-name"
              className="mb-2 block text-xs font-semibold text-[#999]"
            >
              Account name
            </label>

            <input
              id="account-name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. ICICI Bank"
              className="w-full rounded-xl border border-[#1b1b1b] bg-[#050505] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#444] focus:border-[#2e6d52] focus:ring-1 focus:ring-[#2e6d52]/30"
            />
          </div>

          <div>
            <label
              htmlFor="account-type"
              className="mb-2 block text-xs font-semibold text-[#999]"
            >
              Account type
            </label>

            <select
              id="account-type"
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#1b1b1b] bg-[#050505] px-4 py-3 text-sm text-white outline-none focus:border-[#2e6d52]"
            >
              {ACCOUNT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="account-balance"
              className="mb-2 block text-xs font-semibold text-[#999]"
            >
              Current balance
            </label>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#666]">
                ₹
              </span>

              <input
                id="account-balance"
                name="balance"
                type="number"
                step="0.01"
                value={form.balance}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full rounded-xl border border-[#1b1b1b] bg-[#050505] py-3 pl-9 pr-4 text-sm text-white outline-none transition placeholder:text-[#444] focus:border-[#2e6d52] focus:ring-1 focus:ring-[#2e6d52]/30"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="account-currency"
              className="mb-2 block text-xs font-semibold text-[#999]"
            >
              Currency
            </label>

            <select
              id="account-currency"
              name="currency"
              value={form.currency}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#1b1b1b] bg-[#050505] px-4 py-3 text-sm text-white outline-none focus:border-[#2e6d52]"
            >
              <option value="INR">INR — Indian Rupee</option>
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="GBP">GBP — British Pound</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-[#242424] bg-[#0d0d0d] py-3 text-sm font-semibold text-[#aaa] transition hover:bg-[#151515] hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="green-button flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editingAccount
                  ? "Save changes"
                  : "Add account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  async function loadAccounts() {
    try {
      setError("");

      const response = await apiRequest("/accounts");

      setAccounts(
        response.accounts ||
          response.data?.accounts ||
          response.data ||
          []
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to load your accounts."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAccounts();
  }, []);

  async function handleDelete(account) {
    const confirmed = window.confirm(
      `Delete "${account.name}"? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(account.id);

      await apiRequest(`/accounts/${account.id}`, {
        method: "DELETE",
      });

      await loadAccounts();
    } catch (err) {
      setError(
        err.message ||
          "Unable to delete this account."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function openAddModal() {
    setEditingAccount(null);
    setModalOpen(true);
  }

  function openEditModal(account) {
    setEditingAccount(account);
    setModalOpen(true);
  }

  const totalBalance = useMemo(() => {
    return accounts.reduce(
      (sum, account) => sum + Number(account.balance || 0),
      0
    );
  }, [accounts]);

  return (
    <div className="min-h-screen bg-black p-5 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4edea3]">
              Financial accounts
            </p>

            <h1 className="font-display mt-2 text-3xl font-extrabold tracking-tight text-white">
              Accounts
            </h1>

            <p className="mt-2 text-sm text-[#737373]">
              Manage your bank accounts, wallets, cards and investments.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={loadAccounts}
              className="flex items-center gap-2 rounded-xl border border-[#202020] bg-[#0a0a0a] px-4 py-3 text-xs font-semibold text-[#999] transition hover:border-[#333] hover:text-white"
            >
              <RefreshCw size={14} />
              Refresh
            </button>

            <button
              onClick={openAddModal}
              className="green-button flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-bold"
            >
              <Plus size={16} />
              Add account
            </button>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <div className="card green-glow p-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#4edea3]">
              <Wallet size={15} />
              Total balance
            </div>

            <p className="number mt-3 text-3xl font-extrabold text-white">
              {formatCurrency(totalBalance)}
            </p>

            <p className="mt-2 text-xs text-[#666]">
              Combined balance across your accounts
            </p>
          </div>

          <div className="card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#737373]">
              Total accounts
            </p>

            <p className="number mt-3 text-3xl font-extrabold text-white">
              {accounts.length}
            </p>

            <p className="mt-2 text-xs text-[#666]">
              Financial accounts connected to CAPIVORA
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-900/40 bg-red-950/20 px-5 py-4">
            <p className="text-sm font-semibold text-red-300">
              Unable to load accounts
            </p>

            <p className="mt-1 text-xs text-red-400/80">
              {error}
            </p>
          </div>
        )}

        {loading ? (
          <div className="card flex min-h-[300px] items-center justify-center">
            <div className="text-center">
              <RefreshCw
                size={25}
                className="mx-auto animate-spin text-[#4edea3]"
              />

              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#666]">
                Loading accounts
              </p>
            </div>
          </div>
        ) : accounts.length === 0 ? (
          <div className="card flex min-h-[350px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#183d2e] bg-[#0c1712]">
              <Wallet size={25} className="text-[#4edea3]" />
            </div>

            <h2 className="mt-5 font-display text-xl font-bold text-white">
              No accounts yet
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-[#666]">
              Add your first bank account, wallet, savings account,
              credit card or investment account to start managing
              your finances.
            </p>

            <button
              onClick={openAddModal}
              className="green-button mt-6 flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold"
            >
              <Plus size={17} />
              Add your first account
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {accounts.map((account) => {
              const accountType = getAccountType(account.type);

              return (
                <div
                  key={account.id}
                  className="card card-hover group p-5"
                >
                  <div className="flex items-start justify-between">
                    <AccountIcon type={account.type} />

                    <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                      <button
                        onClick={() => openEditModal(account)}
                        className="rounded-lg p-2 text-[#666] hover:bg-[#151515] hover:text-white"
                        title="Edit account"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        onClick={() => handleDelete(account)}
                        disabled={deletingId === account.id}
                        className="rounded-lg p-2 text-[#666] hover:bg-[#180d0d] hover:text-[#ff6b6b]"
                        title="Delete account"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="truncate text-base font-bold text-white">
                      {account.name}
                    </p>

                    <p className="mt-1 text-xs text-[#666]">
                      {accountType.label}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-[#181818] pt-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#555]">
                      Current balance
                    </p>

                    <p className="number mt-2 text-2xl font-extrabold text-white">
                      {formatCurrency(
                        account.balance,
                        account.currency || "INR"
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AccountModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={loadAccounts}
        editingAccount={editingAccount}
      />
    </div>
  );
}