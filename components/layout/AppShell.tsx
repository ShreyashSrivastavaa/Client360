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
  Sparkles,
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
  eyebrow?: string;
}

export function AppShell({ children, pageTitle, pageDescription, eyebrow }: AppShellProps) {
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
    <div className="min-h-screen flex flex-col bg-[#ffffff] text-[#272727] antialiased selection:bg-[#d6e5ff] selection:text-[#7451f2]">
      {/* Top Bar — Zams minimal header ~64px */}
      <header className="h-16 border-b border-[#e0e0e0] bg-[#ffffff] sticky top-0 z-40 px-4 sm:px-8">
        <div className="max-w-[1200px] h-full mx-auto flex items-center justify-between gap-4">
          {/* Left: Brand + Nav */}
          <div className="flex items-center gap-8">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 text-base font-bold text-[#272727] hover:opacity-90 transition-opacity"
            >
              {/* Zams starburst mark */}
              <div className="w-5 h-5 rounded-[4px] bg-[#7451f2] flex items-center justify-center text-white">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold tracking-tight text-[#272727]">
                {organization?.name || "Client360"}
              </span>
            </Link>

            <span className="text-[#e0e0e0] hidden md:inline">|</span>

            {/* Inline Nav Links */}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard" || pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-xs uppercase tracking-[0.24px] font-medium transition-colors py-1 border-b-2 ${
                      isActive
                        ? "text-[#7451f2] border-[#7451f2]"
                        : "text-[#272727] border-transparent hover:text-[#7451f2]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Period Selector */}
            <div className="relative">
              <button
                onClick={() => setPeriodDropdownOpen(!periodDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-[4px] border border-[#e0e0e0] bg-[#ffffff] hover:border-[#272727] text-xs text-[#272727] transition-all"
              >
                <Calendar className="w-3.5 h-3.5 text-[#5d5d5d] shrink-0" />
                <span className="font-medium">{periodLabel}</span>
                <ChevronDown className="w-3 h-3 text-[#858585]" />
              </button>

              {periodDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setPeriodDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-56 rounded-[4px] bg-[#ffffff] border border-[#e0e0e0] py-1 z-50 shadow-sm">
                    <div className="px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.22px] text-[#858585] border-b border-[#e0e0e0]">
                      Select Reporting Period
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
                            ? "bg-[#f6f6f6] text-[#7451f2] font-semibold"
                            : "text-[#5d5d5d] hover:bg-[#f6f6f6] hover:text-[#272727]"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {period === opt.key && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#7451f2]" />
                        )}
                      </button>
                    ))}

                    {/* Custom range input fields */}
                    {period === "custom" && (
                      <div className="p-3 border-t border-[#e0e0e0] space-y-2 bg-[#f6f6f6]">
                        <label className="text-[11px] font-mono uppercase tracking-[0.22px] text-[#858585] block">
                          From:
                        </label>
                        <input
                          type="date"
                          value={customStart}
                          onChange={(e) => setCustomStart(e.target.value)}
                          className="input-default w-full text-xs py-1"
                        />
                        <label className="text-[11px] font-mono uppercase tracking-[0.22px] text-[#858585] block">
                          To:
                        </label>
                        <input
                          type="date"
                          value={customEnd}
                          onChange={(e) => setCustomEnd(e.target.value)}
                          className="input-default w-full text-xs py-1"
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Quick Demo Data reload */}
            <button
              onClick={handleLoadDemoData}
              disabled={isSeeding}
              title="Reload sample 12-month CFO dataset"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#858585] hover:text-[#272727] transition-colors px-2 py-1"
            >
              <Database className="w-3.5 h-3.5 text-[#7451f2]" />
              <span className="font-mono text-[11px] uppercase tracking-[0.22px]">
                {isSeeding ? "Seeding..." : "Demo Data"}
              </span>
            </button>

            {/* Primary Action Button: Filled Iris Violet, 4px radius, 0px 2px 4px shadow */}
            {role !== "member" && (
              <Link
                href="/uploads"
                className="btn-primary hidden sm:inline-flex text-xs py-1.5 px-3"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload CSV</span>
              </Link>
            )}

            {/* User status */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#e0e0e0]">
              <RoleBadge role={role} />
              <button
                onClick={logout}
                title="Sign out"
                className="text-[#858585] hover:text-[#272727] p-1 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-[#272727] p-1.5 rounded-[4px] border border-[#e0e0e0] hover:bg-[#f6f6f6]"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area — Centered, max-width 1200px */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-8 py-8">
        {(pageTitle || pageDescription || eyebrow) && (
          <div className="mb-8 pb-4 border-b border-[#e0e0e0]">
            {eyebrow && (
              <div className="font-mono text-[11px] uppercase tracking-[0.22px] text-[#858585] mb-1">
                {eyebrow}
              </div>
            )}
            {pageTitle && (
              <h1 className="font-serif text-3xl sm:text-4xl text-[#272727] tracking-tight font-normal">
                {pageTitle}
              </h1>
            )}
            {pageDescription && (
              <p className="text-sm text-[#5d5d5d] mt-1.5 leading-relaxed">
                {pageDescription}
              </p>
            )}
          </div>
        )}
        {children}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-[#e0e0e0] py-6 px-4 bg-[#ffffff]">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#858585]">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[#272727]">Client360</span>
            <span>—</span>
            <span>B2B Client Profitability Platform</span>
          </div>
          <div className="flex items-center gap-6 text-[#5d5d5d]">
            <Link href="/privacy" className="hover:text-[#7451f2] transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[#7451f2] transition-colors">
              Terms
            </Link>
            <a
              href="https://github.com/ShreyashSrivastavaa/Client360"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#7451f2] transition-colors"
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
            className="fixed inset-0 bg-[#272727]/30"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed right-0 top-0 bottom-0 w-64 bg-[#ffffff] p-6 shadow-xl flex flex-col justify-between border-l border-[#e0e0e0]">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#e0e0e0]">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-[4px] bg-[#7451f2] flex items-center justify-center text-white">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-[#272727]">Client360</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-[4px] hover:bg-[#f6f6f6] text-[#858585]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="flex flex-col space-y-3">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs uppercase tracking-[0.24px] font-medium text-[#272727] hover:text-[#7451f2] py-1"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="pt-4 border-t border-[#e0e0e0] space-y-3">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLoadDemoData();
                  }}
                  className="w-full btn-secondary text-xs py-2 justify-center"
                >
                  <Database className="w-3.5 h-3.5 text-[#7451f2]" />
                  <span>Reload Demo Data</span>
                </button>

                {role !== "member" && (
                  <Link
                    href="/uploads"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full btn-primary text-xs py-2 justify-center"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload CSV</span>
                  </Link>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-[#e0e0e0] flex items-center justify-between">
              <RoleBadge role={role} />
              <button
                onClick={logout}
                className="text-xs text-[#858585] hover:text-[#e11d48] flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
