"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "./api-client";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
}

export interface OrgProfile {
  id: string;
  name: string;
  industry: string | null;
  profitableMarginThreshold: number;
  lowMarginThreshold: number;
}

interface AuthContextType {
  user: UserProfile | null;
  organization: OrgProfile | null;
  role: "owner" | "admin" | "member" | null;
  isLoading: boolean;
  refreshAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [organization, setOrganization] = useState<OrgProfile | null>(null);
  const [role, setRole] = useState<"owner" | "admin" | "member" | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshAuth = useCallback(async () => {
    try {
      const data = await apiFetch<{
        user: UserProfile;
        organization: OrgProfile;
        role: "owner" | "admin" | "member";
      }>("/api/auth/me");

      setUser(data.user);
      setOrganization(data.organization);
      setRole(data.role);
    } catch {
      setUser(null);
      setOrganization(null);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      setOrganization(null);
      setRole(null);
      router.push("/login");
    }
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        role,
        isLoading,
        refreshAuth,
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
