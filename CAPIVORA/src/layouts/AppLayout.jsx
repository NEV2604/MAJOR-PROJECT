import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  WalletCards,
  PiggyBank,
  Target,
  BarChart3,
  Bot,
  FileText,
  Settings,
  Menu,
  X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const navigation = [
  {
    label: "Overview",
    items: [
      {
        name: "Dashboard",
        path: "/",
        icon: LayoutDashboard,
      },
      {
        name: "Transactions",
        path: "/transactions",
        icon: ArrowLeftRight,
      },
      {
        name: "Accounts",
        path: "/accounts",
        icon: WalletCards,
      },
    ],
  },
  {
    label: "Plan",
    items: [
      {
        name: "Budgets",
        path: "/budgets",
        icon: PiggyBank,
      },
      {
        name: "Goals",
        path: "/goals",
        icon: Target,
      },
    ],
  },
  {
    label: "Insights",
    items: [
      {
        name: "Analytics",
        path: "/analytics",
        icon: BarChart3,
      },
      {
        name: "AI Assistant",
        path: "/ai",
        icon: Bot,
      },
      {
        name: "Reports",
        path: "/reports",
        icon: FileText,
      },
    ],
  },
];

function Sidebar({ onNavigate }) {
  const { user } = useAuth();

  return (
    <aside className="flex h-full w-[260px] flex-col border-r border-[#181818] bg-[#050505]">
      {/* Logo */}
      <div className="flex h-20 items-center border-b border-[#181818] px-6">
        <div>
          <h1 className="font-display text-xl font-extrabold tracking-[0.18em] text-white">
            CAPIVORA
          </h1>

          <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#737373]">
            Manage Capital. Master Your Future.
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {navigation.map((section) => (
          <div
            key={section.label}
            className="mb-6"
          >
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#525252]">
              {section.label}
            </p>

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/"}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                        isActive
                          ? "bg-[#10281e] text-[#4edea3]"
                          : "text-[#a3a3a3] hover:bg-[#111111] hover:text-white"
                      }`
                    }
                  >
                    <Icon
                      size={18}
                      strokeWidth={1.8}
                    />

                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Navigation + User */}
      <div className="border-t border-[#181818] p-3">
        <NavLink
          to="/settings"
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
              isActive
                ? "bg-[#10281e] text-[#4edea3]"
                : "text-[#a3a3a3] hover:bg-[#111111] hover:text-white"
            }`
          }
        >
          <Settings
            size={18}
            strokeWidth={1.8}
          />

          <span>Settings</span>
        </NavLink>

        {/* User Card */}
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-[#181818] bg-[#0a0a0a] p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#173d2d] text-sm font-bold text-[#4edea3]">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {user?.name || "User"}
            </p>

            <p className="truncate text-xs text-[#737373]">
              {user?.email || ""}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function MobileHeader({ onMenu }) {
  const { user } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-[#181818] bg-[#050505] px-4 lg:hidden">
      <div>
        <h1 className="font-display text-lg font-extrabold tracking-[0.16em] text-white">
          CAPIVORA
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-xs font-semibold text-white">
            {user?.name}
          </p>

          <p className="text-[10px] text-[#737373]">
            {user?.email}
          </p>
        </div>

        <button
          onClick={onMenu}
          className="rounded-lg border border-[#242424] p-2 text-[#a3a3a3] transition hover:text-white"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </div>
    </header>
  );
}

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-[#f5f5f5]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/70"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />

          <div className="relative h-full w-[280px]">
            <div className="absolute right-3 top-4 z-10">
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg border border-[#242424] bg-[#0a0a0a] p-2 text-[#a3a3a3] transition hover:text-white"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <Sidebar
              onNavigate={() =>
                setMobileOpen(false)
              }
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="lg:pl-[260px]">
        <MobileHeader
          onMenu={() => setMobileOpen(true)}
        />

        <main className="min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}