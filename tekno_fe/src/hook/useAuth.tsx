"use client";
import { useAuthContext } from "@/context/AuthContext";

export function useAuth() {
  const { user, isLoading, isAuthenticated, isAdmin, hasRole, login, logout } =
    useAuthContext();
  return { user, isLoading, isAuthenticated, isAdmin, hasRole, login, logout };
}
