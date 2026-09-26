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
      window.location.reload();
    } catch (err: any) {
      error(err.message || "Failed to load sample data");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f7f7f8] text-[#121217] antialiased selection:bg-[#ffc233] selection:text-[#121217]">
      {/* Desktop Sidebar (White #ffffff, hairline #d1d1db border) */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-[#d1d1db] bg-white shrink-0 z-30 sticky top-0 h-screen justify-between">
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand header */}
          <div className="h-16 flex items-center gap-3 px-5 border-b border-[#d1d1db]">
            <div className="w-8 h-8 rounded-lg bg-[#5423e7] flex items-center justify-center shadow-sm">
              <span className="text-white text-base font-extrabold">P</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold tracking-tight text-[#121217] text-base">
                  ProfitLens
                </span>
                <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-[#ffc233] text-[#121217] rounded">
                  PRO
                </span>
              </div>
              <span className="text-[11px] text-[#6c6c89] font-medium truncate max-w-[140px]">
                {organization?.name || "Workspace"}
              </span>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="p-3 space-y-1">
            <div className="px-3 pt-3 pb-2 text-[11px] font-semibold tracking-[2px] text-[#6c6c89] uppercase">
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
                      ? "bg-[#5423e7] text-white shadow-sm font-semibold"
                      : "text-[#6c6c89] hover:text-[#121217] hover:bg-[#f7f7f8]"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-[#6c6c89]"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Lemon Zest Quick Action Banner */}
          <div className="px-3 py-2 mt-auto">
            <div className="p-3.5 rounded-2xl border border-[#ffc233]/40 bg-[#ffc233]/15 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#121217]">
                <Sparkles className="w-3.5 h-3.5 text-[#996500]" />
                <span>Demo Environment</span>
              </div>
              <p className="text-[11px] text-[#6c6c89] leading-relaxed">
                Need fresh mock data? Re-seed 18 accounts across 12 months with 1 click.
              </p>
              <button
                onClick={handleLoadDemoData}
                disabled={isSeeding}
                className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-[#f7f7f8] text-[#121217] border border-[#d1d1db] transition-colors disabled:opacity-50 shadow-sm"
              >
                <Database className="w-3.5 h-3.5 text-[#5423e7]" />
                <span>{isSeeding ? "Seeding..." : "Load Demo Data"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-[#d1d1db] bg-white">
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#f7f7f8] border border-[#d1d1db]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#5423e7] text-white flex items-center justify-center text-xs font-bold shrink-0">
                {user?.fullName?.charAt(0) || "U"}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-[#121217] truncate max-w-[100px]">
                  {user?.fullName || "User"}
                </span>
                <RoleBadge role={role} />
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="text-[#6c6c89] hover:text-[#d50b3e] p-1.5 rounded-md hover:bg-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-[#d1d1db] bg-white sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden text-[#6c6c89] hover:text-[#121217] p-1.5 rounded-lg border border-[#d1d1db] hover:bg-[#f7f7f8]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex flex-col min-w-0">
              <h1 className="text-base sm:text-lg font-display font-bold text-[#121217] truncate tracking-tight">
                {pageTitle || "Dashboard"}
              </h1>
              {pageDescription && (
                <p className="text-xs text-[#6c6c89] truncate hidden sm:block">
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
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#d1d1db] hover:border-[#6c6c89] text-xs font-medium text-[#121217] shadow-sm transition-all"
              >
                <Calendar className="w-3.5 h-3.5 text-[#5423e7] shrink-0" />
                <span>{periodLabel}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#6c6c89]" />
              </button>

              {periodDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setPeriodDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-52 rounded-2xl bg-white border border-[#d1d1db] shadow-xl py-1.5 z-50">
                    <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-[2px] text-[#6c6c89] border-b border-[#d1d1db]">
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
                            ? "bg-[#5423e7]/10 text-[#5423e7] font-semibold"
                            : "text-[#121217] hover:bg-[#f7f7f8]"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {period === opt.key && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#5423e7]" />
                        )}
                      </button>
                    ))}

                    {/* Custom range input fields if Custom is selected */}
                    {period === "custom" && (
                      <div className="p-3 border-t border-[#d1d1db] space-y-2">
                        <label className="text-[11px] text-[#6c6c89] block">From:</label>
                        <input
                          type="date"
                          value={customStart}
                          onChange={(e) => setCustomStart(e.target.value)}
                          className="w-full text-xs bg-[#f7f7f8] border border-[#d1d1db] rounded px-2 py-1 text-[#121217]"
                        />
                        <label className="text-[11px] text-[#6c6c89] block">To:</label>
                        <input
                          type="date"
                          value={customEnd}
                          onChange={(e) => setCustomEnd(e.target.value)}
                          className="w-full text-xs bg-[#f7f7f8] border border-[#d1d1db] rounded px-2 py-1 text-[#121217]"
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Quick Upload Action Button (#121217 8px radius) */}
            {role !== "member" && (
              <Link
                href="/uploads"
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#121217] hover:bg-[#272730] text-white text-xs font-semibold shadow-sm transition-all"
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
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-64 bg-white border-r border-[#d1d1db] p-4 flex flex-col justify-between z-10">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#d1d1db]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#5423e7] text-white flex items-center justify-center font-bold text-xs">
                      P
                    </div>
                    <span className="font-bold text-[#121217]">ProfitLens</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[#6c6c89] hover:text-[#121217]"
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
                            ? "bg-[#5423e7] text-white font-semibold"
                            : "text-[#6c6c89] hover:text-[#121217]"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-[#d1d1db]">
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#f7f7f8] border border-[#d1d1db] text-xs font-semibold text-[#d50b3e]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1200px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
