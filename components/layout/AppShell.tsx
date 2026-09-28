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
  Menu,
  X,
  Database,
  Calendar,
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
    { label: "DASHBOARD", href: "/dashboard", icon: LayoutDashboard },
    { label: "CLIENTS", href: "/clients", icon: Users },
    { label: "UPLOADS", href: "/uploads", icon: UploadCloud },
    { label: "SETTINGS", href: "/settings", icon: Settings },
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
    <div className="min-h-screen flex bg-[#823513] text-[#faae33] antialiased selection:bg-[#faae33] selection:text-[#281006]">
      {/* Desktop Sidebar: Charred Clove #281006 with Cardamom Brown border */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-[#6b2e12] bg-[#281006] shrink-0 z-30 sticky top-0 h-screen justify-between">
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand header */}
          <div className="h-18 flex items-center gap-3 px-5 border-b border-[#6b2e12]">
            <div className="w-9 h-9 rounded-full bg-[#faae33] text-[#281006] flex items-center justify-center font-salmond font-bold text-lg">
              HT
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-salmond text-xl tracking-tight text-[#faae33]">
                  CLIENT360
                </span>
                <span className="px-2 py-0.5 text-[10px] font-salmond bg-[#faae33] text-[#281006] rounded-full font-bold">
                  PRO
                </span>
              </div>
              <span className="text-[11px] text-[#faae33]/70 truncate max-w-[140px] uppercase font-mono tracking-wider">
                {organization?.name || "Workspace"}
              </span>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="p-3 space-y-1.5">
            <div className="px-3 pt-3 pb-2 text-[11px] font-salmond tracking-[2px] text-[#faae33]/60 uppercase">
              MAIN MENU
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
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-full text-xs font-salmond tracking-wider uppercase transition-all ${
                    isActive
                      ? "bg-[#faae33] text-[#281006] font-bold"
                      : "text-[#faae33]/80 hover:text-[#faae33] hover:bg-[#402011]"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#281006]" : "text-[#faae33]"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Demo Data Quick Action (Dark Spice card) */}
          <div className="px-3 py-2 mt-auto">
            <div className="p-3.5 rounded-[6px] border border-[#6b2e12] bg-[#402011] flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-salmond text-[#faae33] uppercase">
                <Sparkles className="w-3.5 h-3.5 text-[#faae33]" />
                <span>DEMO ENVIRONMENT</span>
              </div>
              <p className="text-[11px] text-[#faae33]/70 leading-relaxed font-graphikx">
                Reset mock database with 18 accounts across 12 months with 1 click.
              </p>
              <button
                onClick={handleLoadDemoData}
                disabled={isSeeding}
                className="btn-ghost-outline w-full flex items-center justify-center gap-1.5 text-xs font-salmond uppercase disabled:opacity-50"
              >
                <Database className="w-3.5 h-3.5 text-[#faae33]" />
                <span>{isSeeding ? "SEEDING..." : "RE-SEED TURSO"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-[#6b2e12] bg-[#281006]">
          <div className="flex items-center justify-between p-2 rounded-[6px] bg-[#402011] border border-[#6b2e12]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#faae33] text-[#281006] flex items-center justify-center text-xs font-bold shrink-0">
                {user?.fullName?.charAt(0) || "U"}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-[#faae33] truncate max-w-[100px]">
                  {user?.fullName || "User"}
                </span>
                <RoleBadge role={role} />
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="text-[#faae33]/70 hover:text-[#d1255c] p-1.5 rounded-full hover:bg-[#281006] transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#823513]">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-[#6b2e12] bg-[#281006] sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden text-[#faae33] hover:text-[#faae33] p-1.5 rounded-full border border-[#6b2e12] hover:bg-[#402011]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex flex-col min-w-0">
              <h1 className="text-lg sm:text-2xl font-salmond font-bold text-[#faae33] truncate tracking-wide">
                {pageTitle || "DASHBOARD"}
              </h1>
              {pageDescription && (
                <p className="text-xs text-[#faae33]/70 truncate hidden sm:block font-graphikx">
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
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#402011] border border-[#6b2e12] hover:border-[#faae33] text-xs font-salmond tracking-wider text-[#faae33] transition-all"
              >
                <Calendar className="w-3.5 h-3.5 text-[#faae33] shrink-0" />
                <span>{periodLabel.toUpperCase()}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#faae33]" />
              </button>

              {periodDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setPeriodDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-56 rounded-[6px] bg-[#402011] border border-[#6b2e12] shadow-2xl py-1.5 z-50">
                    <div className="px-3 py-1 text-[10px] font-salmond uppercase tracking-[2px] text-[#faae33]/60 border-b border-[#6b2e12]">
                      SELECT TIME RANGE
                    </div>
                    {PERIOD_OPTIONS.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => {
                          setPeriod(opt.key);
                          setPeriodDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs font-salmond uppercase tracking-wider flex items-center justify-between transition-colors ${
                          period === opt.key
                            ? "bg-[#faae33] text-[#281006] font-bold"
                            : "text-[#faae33] hover:bg-[#6b2e12]"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {period === opt.key && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#281006]" />
                        )}
                      </button>
                    ))}

                    {/* Custom range input fields if Custom is selected */}
                    {period === "custom" && (
                      <div className="p-3 border-t border-[#6b2e12] space-y-2">
                        <label className="text-[11px] text-[#faae33]/70 block font-salmond uppercase">From:</label>
                        <input
                          type="date"
                          value={customStart}
                          onChange={(e) => setCustomStart(e.target.value)}
                          className="tiger-input w-full text-xs py-1"
                        />
                        <label className="text-[11px] text-[#faae33]/70 block font-salmond uppercase">To:</label>
                        <input
                          type="date"
                          value={customEnd}
                          onChange={(e) => setCustomEnd(e.target.value)}
                          className="tiger-input w-full text-xs py-1"
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
                className="btn-primary-filled hidden sm:flex items-center gap-1.5 text-xs font-salmond"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>UPLOAD CSV</span>
              </Link>
            )}
          </div>
        </header>

        {/* Dotted divider below header */}
        <div className="dotted-divider opacity-50" />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-[#281006]/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-[#281006] border-r border-[#6b2e12] flex flex-col justify-between p-4 z-50">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#6b2e12]">
                <span className="font-salmond text-xl font-bold text-[#faae33]">CLIENT360</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[#faae33] p-1 rounded-full hover:bg-[#402011]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="mt-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-full text-sm font-salmond uppercase tracking-wider text-[#faae33] hover:bg-[#402011]"
                  >
                    <item.icon className="w-4 h-4 text-[#faae33]" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
            <button
              onClick={logout}
              className="btn-ghost-outline w-full flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>SIGN OUT</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
