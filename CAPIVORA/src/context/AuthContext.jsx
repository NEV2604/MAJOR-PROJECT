import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getCurrentUser,
  loginUser,
  registerUser,
} from "../services/auth.service";

import { apiRequest } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("capivora_user");

    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem("capivora_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await getCurrentUser();

        setUser(response.user);

        localStorage.setItem(
          "capivora_user",
          JSON.stringify(response.user)
        );
      } catch {
        localStorage.removeItem("capivora_token");
        localStorage.removeItem("capivora_user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  async function login(email, password) {
    const response = await loginUser(email, password);

    localStorage.setItem("capivora_token", response.token);
    localStorage.setItem(
      "capivora_user",
      JSON.stringify(response.user)
    );

    setUser(response.user);

    return response;
  }

  async function loginWithGoogle(credential) {
    const response = await apiRequest("/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
    });

    localStorage.setItem("capivora_token", response.token);
    localStorage.setItem(
      "capivora_user",
      JSON.stringify(response.user)
    );

    setUser(response.user);

    return response;
  }

  async function register(name, email, password) {
    const response = await registerUser(
      name,
      email,
      password
    );

    localStorage.setItem("capivora_token", response.token);
    localStorage.setItem(
      "capivora_user",
      JSON.stringify(response.user)
    );

    setUser(response.user);

    return response;
  }

  function logout() {
    localStorage.removeItem("capivora_token");
    localStorage.removeItem("capivora_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        loginWithGoogle,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}