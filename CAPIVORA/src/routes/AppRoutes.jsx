import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import Dashboard from "../pages/Dashboard/Dashboard";
import Accounts from "../pages/Accounts/Accounts";
import Transactions from "../pages/Transactions/Transactions";
import Budgets from "../pages/Budgets/Budgets";
import Goals from "../pages/Goals/Goals";
import Analytics from "../pages/Analytics/Analytics";
import AI from "../pages/AI/AI";
import Reports from "../pages/Reports/Reports";
import Settings from "../pages/Settings/Settings";
import AppLayout from "../layouts/AppLayout";

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#173d2d] border-t-[#4edea3]" />

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4edea3]">
          Loading CAPIVORA
        </p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />

        <Route
          path="accounts"
          element={<Accounts />}
        />

        <Route
          path="transactions"
          element={<Transactions />}
        />

        <Route
          path="budgets"
          element={<Budgets />}
        />

        <Route
          path="goals"
          element={<Goals />}
        />

        <Route
          path="analytics"
          element={<Analytics />}
        />

        <Route
          path="ai"
          element={<AI />}
        />

        <Route
          path="reports"
          element={<Reports />}
        />

        <Route
          path="settings"
          element={<Settings />}
        />
      </Route>

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}