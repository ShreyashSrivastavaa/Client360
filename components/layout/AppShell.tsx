"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  ChevronDown,
  Menu,
  X,
  Plus,
  LogOut,
  Database,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { usePeriod, PERIOD_OPTIONS } from "@/lib/period-context";
import { RoleBadge } from "@/components/ui/Badge";
import { useToast } from "@/lib/toast-context";
import { apiFetch } from "@/lib/api-client";

interface AppShellProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageDescription?: string;
}

export function AppShell({ children, pageTitle, pageDescription }: AppShellProps) {
  const pathname = usePathname();
  const { user, organization, role, logout } = useAuth();
  const { period, setPeriod, periodLabel, customStart, setCustomStart, customEnd, setCustomEnd } = usePeriod();
  const { success, error } = useToast();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const navItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Clients", href: "/clients" },
    { label: "Uploads", href: "/uploads" },
    { label: "Settings", href: "/settings" },
  ];

  const handleLoadDemoData = async () => {
    setIsSeeding(true);
    try {
      const res = await apiFetch<{ message: string }>("/api/demo/load", { method: "POST" });
      success(res.message || "Sample demo dataset loaded successfully!");
      window.location.reload();
    } catch (err: any) {
      error(err.message || "Failed to load sample data");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff] text-[#1a1a1a] antialiased selection:bg-[#fff6d4] selection:text-[#1a1a1a]">
      {/* Top Bar — Minimal app chrome */}
      <header className="h-14 border-b border-[#eaeaea] bg-[#ffffff] sticky top-0 z-40 px-4 sm:px-6">
        <div className="max-w-[1080px] h-full mx-auto flex items-center justify-between gap-4">
          {/* Left: Workspace name + Nav */}
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm font-bold text-[#1a1a1a] hover:opacity-80 transition-opacity"
            >
              <span className="w-2 h-2 rounded-full bg-[#ffb84d]" />
              <span>{organization?.name || "Client360"}</span>
            </Link>

            <span className="text-[#eaeaea] hidden md:inline">|</span>

            {/* Inline Navigation Links */}
            <nav className="hidden md:flex items-center gap-4 text-sm">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard" || pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`transition-colors py-1 ${
                      isActive
                        ? "text-[#1a1a1a] font-bold border-b-2 border-[#1a1a1a]"
                        : "text-[#6f6f6f] hover:text-[#1a1a1a]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-3">
            {/* Period Selector */}
            <div className="relative">
              <button
                onClick={() => setPeriodDropdownOpen(!periodDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] border border-[#eaeaea] bg-white hover:border-[#1a1a1a] text-xs text-[#1a1a1a] transition-all"
              >
                <Calendar className="w-3.5 h-3.5 text-[#6f6f6f] shrink-0" />
                <span>{periodLabel}</span>
                <ChevronDown className="w-3 h-3 text-[#838383]" />
              </button>

              {periodDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setPeriodDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-52 rounded-[4px] bg-white border border-[#eaeaea] py-1 z-50">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.21px] text-[#838383] border-b border-[#eaeaea]">
                      Select Period
                    </div>
                    {PERIOD_OPTIONS.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => {
                          setPeriod(opt.key);
                          setPeriodDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${
                          period === opt.key
                            ? "bg-[#f7f7f7] text-[#1a1a1a] font-bold"
                            : "text-[#6f6f6f] hover:bg-[#f7f7f7] hover:text-[#1a1a1a]"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {period === opt.key && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a]" />
                        )}
                      </button>
                    ))}

                    {/* Custom range input fields if Custom is selected */}
                    {period === "custom" && (
                      <div className="p-2.5 border-t border-[#eaeaea] space-y-2">
                        <label className="text-[10px] uppercase font-bold text-[#838383] block">
                          From:
                        </label>
                        <input
                          type="date"
                          value={customStart}
                          onChange={(e) => setCustomStart(e.target.value)}
                          className="input-rows-default w-full text-xs py-1"
                        />
                        <label className="text-[10px] uppercase font-bold text-[#838383] block">
                          To:
                        </label>
                        <input
                          type="date"
                          value={customEnd}
                          onChange={(e) => setCustomEnd(e.target.value)}
                          className="input-rows-default w-full text-xs py-1"
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Re-seed Quick Ghost Link */}
            <button
              onClick={handleLoadDemoData}
              disabled={isSeeding}
              title="Reload sample data"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#838383] hover:text-[#1a1a1a] transition-colors"
            >
              <Database className="w-3 h-3" />
              <span>{isSeeding ? "Seeding..." : "Demo data"}</span>
            </button>

            {/* Primary Action Button: Ink fill, Paper text, 4px radius */}
            {role !== "member" && (
              <Link
                href="/uploads"
                className="btn-rows-primary hidden sm:inline-flex text-xs py-1.5 px-3"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload CSV</span>
              </Link>
            )}

            {/* User status */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#eaeaea]">
              <RoleBadge role={role} />
              <button
                onClick={logout}
                title="Sign out"
                className="text-[#838383] hover:text-[#1a1a1a] p-1 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-[#1a1a1a] p-1.5 rounded-[4px] border border-[#eaeaea] hover:bg-[#f7f7f7]"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area — Centered, max-width 1080px */}
      <main className="flex-1 w-full max-w-[1080px] mx-auto px-4 sm:px-6 py-8">
        {(pageTitle || pageDescription) && (
          <div className="mb-8 pb-4 border-b border-[#eaeaea]">
            {pageTitle && (
              <h1 className="text-rows-heading">
                {pageTitle}
              </h1>
            )}
            {pageDescription && (
              <p className="text-sm text-[#6f6f6f] mt-1.5">
                {pageDescription}
              </p>
            )}
          </div>
        )}
        {children}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-[#eaeaea] py-6 px-4">
        <div className="max-w-[1080px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#838383]">
          <div>
            <span>Client360 — B2B Profitability Engine</span>
          </div>
          <div className="flex items-center gap-4 text-[#6f6f6f]">
            <Link href="/privacy" className="hover:text-[#1a1a1a] transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[#1a1a1a] transition-colors">
              Terms
            </Link>
            <a
              href="https://github.com/ShreyashSrivastavaa/Client360"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#1a1a1a] transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/20"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-[#eaeaea] flex flex-col justify-between p-4 z-50">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#eaeaea]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ffb84d]" />
                  <span className="font-bold text-sm text-[#1a1a1a]">Client360</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[#838383] hover:text-[#1a1a1a] p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <nav className="mt-4 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-[4px] text-sm text-[#1a1a1a] hover:bg-[#f7f7f7]"
                  >
                    <span>{item.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#838383]" />
                  </Link>
                ))}
              </nav>
            </div>
            <div className="pt-4 border-t border-[#eaeaea] space-y-3">
              <div className="flex items-center justify-between text-xs text-[#838383]">
                <span>{user?.email}</span>
                <RoleBadge role={role} />
              </div>
              <button
                onClick={logout}
                className="btn-rows-outlined w-full text-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
