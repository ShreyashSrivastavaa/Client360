"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UploadCloud,
  Settings,
  LogOut,
  ChevronDown,
  Layers,
  Menu,
  X,
  PlusCircle,
  Database,
  Calendar,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { usePeriod, PERIOD_OPTIONS, PeriodKey } from "@/lib/period-context";
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
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Clients", href: "/clients", icon: Users },
    { label: "Uploads", href: "/uploads", icon: UploadCloud },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  const handleLoadDemoData = async () => {
    setIsSeeding(true);
    try {
      const res = await apiFetch<{ message: string }>("/api/demo/load", { method: "POST" });
      success(res.message || "Sample demo dataset loaded successfully!");
      // Trigger a soft refresh by reloading the page state
      window.location.reload();
    } catch (err: any) {
      error(err.message || "Failed to load sample data");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#090a0f] text-zinc-100 antialiased selection:bg-indigo-500/30">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-zinc-800/80 bg-[#0d0e15]/95 backdrop-blur-xl shrink-0 z-30 sticky top-0 h-screen justify-between">
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand header */}
          <div className="h-16 flex items-center gap-3 px-5 border-b border-zinc-800/80">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white text-base">ProfitLens</span>
                <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded">
                  MVP
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 font-medium truncate max-w-[140px]">
                {organization?.name || "Workspace"}
              </span>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="p-3 space-y-1">
            <div className="px-3 pt-3 pb-2 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
              Main Menu
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard" || pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-indigo-400" : "text-zinc-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Quick Demo Seed action banner */}
          <div className="px-3 py-2 mt-auto">
            <div className="p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-900/60 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Demo Environment</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Need fresh mock data? Re-seed 18 accounts across 12 months with 1 click.
              </p>
              <button
                onClick={handleLoadDemoData}
                disabled={isSeeding}
                className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 transition-colors disabled:opacity-50"
              >
                <Database className="w-3.5 h-3.5" />
                <span>{isSeeding ? "Seeding..." : "Load Demo Data"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/40">
          <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/40 border border-zinc-800/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-indigo-300 shrink-0">
                {user?.fullName?.charAt(0) || "U"}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white truncate max-w-[100px]">
                  {user?.fullName || "User"}
                </span>
                <RoleBadge role={role} />
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="text-zinc-400 hover:text-rose-400 p-1.5 rounded-md hover:bg-zinc-800/60 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-zinc-800/80 bg-[#0d0e15]/80 backdrop-blur-xl sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden text-zinc-400 hover:text-white p-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800/50"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex flex-col min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-white truncate tracking-tight">
                {pageTitle || "Dashboard"}
              </h1>
              {pageDescription && (
                <p className="text-xs text-zinc-400 truncate hidden sm:block">
                  {pageDescription}
                </p>
              )}
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5">
            {/* Period Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setPeriodDropdownOpen(!periodDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700/80 hover:border-zinc-600 text-xs font-medium text-zinc-200 shadow-sm transition-all"
              >
                <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>{periodLabel}</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {periodDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setPeriodDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-52 rounded-xl bg-zinc-900 border border-zinc-700 shadow-2xl py-1.5 z-50">
                    <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                      Select Time Range
                    </div>
                    {PERIOD_OPTIONS.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => {
                          setPeriod(opt.key);
                          setPeriodDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                          period === opt.key
                            ? "bg-indigo-600/20 text-indigo-300 font-semibold"
                            : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {period === opt.key && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        )}
                      </button>
                    ))}

                    {/* Custom range input fields if Custom is selected */}
                    {period === "custom" && (
                      <div className="p-3 border-t border-zinc-800 space-y-2">
                        <label className="text-[11px] text-zinc-400 block">From:</label>
                        <input
                          type="date"
                          value={customStart}
                          onChange={(e) => setCustomStart(e.target.value)}
                          className="w-full text-xs bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-zinc-200"
                        />
                        <label className="text-[11px] text-zinc-400 block">To:</label>
                        <input
                          type="date"
                          value={customEnd}
                          onChange={(e) => setCustomEnd(e.target.value)}
                          className="w-full text-xs bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-zinc-200"
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Quick Upload Action Button */}
            {role !== "member" && (
              <Link
                href="/uploads"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Upload CSV</span>
              </Link>
            )}
          </div>
        </header>

        {/* Mobile Slide-Over Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-64 bg-[#0d0e15] border-r border-zinc-800 p-4 flex flex-col justify-between z-10">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                      <Layers className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-white">ProfitLens</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-zinc-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                          isActive
                            ? "bg-indigo-600/20 text-indigo-300"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-zinc-800">
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-medium text-rose-400"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
