"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { apiFetch } from "@/lib/api-client";
import { RoleBadge } from "@/components/ui/Badge";
import {
  Building2,
  Sliders,
  Users,
  UserCheck,
  Database,
  Trash2,
  Plus,
  RefreshCw,
  Check,
  AlertTriangle,
  Mail,
  Shield,
} from "lucide-react";

interface MemberItem {
  id: string;
  role: string;
  status: string;
  invitedEmail: string | null;
  createdAt: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
}

export default function SettingsPage() {
  const { user, organization, role, refreshAuth, logout } = useAuth();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<"profile" | "thresholds" | "team" | "account" | "data">("profile");

  // Profile Form state
  const [orgName, setOrgName] = useState("");
  const [industry, setIndustry] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Thresholds state
  const [profitableThreshold, setProfitableThreshold] = useState("20.0");
  const [lowMarginThreshold, setLowMarginThreshold] = useState("5.0");
  const [isSavingThresholds, setIsSavingThresholds] = useState(false);

  // Team state
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [isInviting, setIsInviting] = useState(false);
  const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null);

  // Demo Data state
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  useEffect(() => {
    if (organization) {
      setOrgName(organization.name || "");
      setIndustry(organization.industry || "");
      setProfitableThreshold(organization.profitableMarginThreshold?.toString() || "20.0");
      setLowMarginThreshold(organization.lowMarginThreshold?.toString() || "5.0");
    }
  }, [organization]);

  const fetchMembers = async () => {
    setLoadingMembers(true);
    try {
      const res = await apiFetch<MemberItem[]>("/api/org/members");
      setMembers(Array.isArray(res) ? res : (res as any).data || []);
    } catch (err: any) {
      console.error("Failed to load members:", err);
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    if (activeTab === "team") {
      fetchMembers();
    }
  }, [activeTab]);

  // Save Company Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "member") {
      error("Members cannot modify company profile.");
      return;
    }
    setIsSavingProfile(true);
    try {
      await apiFetch("/api/org", {
        method: "PATCH",
        body: JSON.stringify({ name: orgName, industry }),
      });
      success("Company profile saved successfully!");
      refreshAuth();
    } catch (err: any) {
      error(err.message || "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Save Margin Thresholds & Recalculate
  const handleSaveThresholds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "member") {
      error("Members cannot adjust margin thresholds.");
      return;
    }

    const p = parseFloat(profitableThreshold);
    const l = parseFloat(lowMarginThreshold);

    if (isNaN(p) || isNaN(l) || l >= p) {
      error("Profitable margin threshold must be strictly greater than low-margin threshold.");
      return;
    }

    setIsSavingThresholds(true);
    try {
      await apiFetch("/api/org", {
        method: "PATCH",
        body: JSON.stringify({
          profitableMarginThreshold: p,
          lowMarginThreshold: l,
        }),
      });
      success("Thresholds updated and all client classifications recalculated!", "Recalculation Complete");
      refreshAuth();
    } catch (err: any) {
      error(err.message || "Failed to update thresholds");
    } finally {
      setIsSavingThresholds(false);
    }
  };

  // Invite Member
  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setIsInviting(true);
    try {
      const res = await apiFetch<{ message: string }>("/api/org/members", {
        method: "POST",
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      success(res.message || "Invitation created successfully!");
      setInviteEmail("");
      setInviteModalOpen(false);
      fetchMembers();
    } catch (err: any) {
      error(err.message || "Failed to invite member");
    } finally {
      setIsInviting(false);
    }
  };

  // Remove Member
  const handleRemoveMember = async (id: string) => {
    try {
      await apiFetch(`/api/org/members/${id}`, { method: "DELETE" });
      success("Member removed from workspace.");
      setDeleteMemberId(null);
      fetchMembers();
    } catch (err: any) {
      error(err.message || "Failed to remove member");
    }
  };

  // Load Demo Data
  const handleLoadDemo = async () => {
    setIsSeeding(true);
    try {
      await apiFetch("/api/demo/load", { method: "POST" });
      success("Sample dataset reloaded with 18 accounts across 12 months!");
    } catch (err: any) {
      error(err.message || "Failed to reload demo data");
    } finally {
      setIsSeeding(false);
    }
  };

  // Clear Demo Data
  const handleClearData = async () => {
    setIsClearing(true);
    try {
      await apiFetch("/api/demo/clear", { method: "POST" });
      success("All organization transactions and clients cleared.");
      setClearConfirmOpen(false);
    } catch (err: any) {
      error(err.message || "Failed to clear data");
    } finally {
      setIsClearing(false);
    }
  };

  const tabs = [
    { key: "profile", label: "Company Profile", icon: Building2 },
    { key: "thresholds", label: "Margin Thresholds", icon: Sliders },
    { key: "team", label: "Team Members", icon: Users },
    { key: "account", label: "My Account", icon: UserCheck },
    { key: "data", label: "Demo & Data Tools", icon: Database },
  ];

  return (
    <AppShell
      pageTitle="Settings & Configuration"
      pageDescription="Configure company profile, margin classification rules, team access, and sample data"
    >
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Settings Navigation Sidebar */}
        <div className="w-full md:w-60 glass-panel p-2 rounded-xl border border-zinc-800 shrink-0 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${
                  isActive
                    ? "bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-850"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-zinc-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 w-full glass-panel p-6 rounded-xl border border-zinc-800">
          {/* TAB 1: Company Profile */}
          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="space-y-5 max-w-xl">
              <div>
                <h3 className="text-base font-bold text-white">Company Profile</h3>
                <p className="text-xs text-zinc-400">
                  General workspace information for reporting headers and exports
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    disabled={role === "member"}
                    className="w-full text-xs bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                    placeholder="Acme Global Inc"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Industry / Sector
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    disabled={role === "member"}
                    className="w-full text-xs bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                  >
                    <option value="">-- Select Industry --</option>
                    <option value="B2B SaaS & Professional Services">
                      B2B SaaS & Professional Services
                    </option>
                    <option value="Agency & Consulting">Agency & Consulting</option>
                    <option value="Wholesale & Distribution">Wholesale & Distribution</option>
                    <option value="Manufacturing & Industrial">Manufacturing & Industrial</option>
                    <option value="Financial & Legal Services">Financial & Legal Services</option>
                    <option value="Healthcare & BioTech">Healthcare & BioTech</option>
                  </select>
                </div>
              </div>

              {role !== "member" && (
                <div className="pt-4 border-t border-zinc-800">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {isSavingProfile ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>Save Profile Changes</span>
                  </button>
                </div>
              )}
            </form>
          )}

          {/* TAB 2: Margin Thresholds */}
          {activeTab === "thresholds" && (
            <form onSubmit={handleSaveThresholds} className="space-y-6 max-w-xl">
              <div>
                <h3 className="text-base font-bold text-white">Margin Classification Rules</h3>
                <p className="text-xs text-zinc-400">
                  Tune the gross profit percentage thresholds that determine account classifications
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-xs font-bold text-emerald-300">
                      Profitable Threshold (% and above)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={profitableThreshold}
                      onChange={(e) => setProfitableThreshold(e.target.value)}
                      disabled={role === "member"}
                      className="w-28 text-sm font-bold bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                      required
                    />
                    <span className="text-sm font-bold text-zinc-400">%</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">Default: ≥ 20.0% gross margin</p>
                </div>

                <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="text-xs font-bold text-amber-300">
                      Low-Margin Floor (% and above)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={lowMarginThreshold}
                      onChange={(e) => setLowMarginThreshold(e.target.value)}
                      disabled={role === "member"}
                      className="w-28 text-sm font-bold bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500"
                      required
                    />
                    <span className="text-sm font-bold text-zinc-400">%</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">Default: 5.0% to 19.99%</p>
                </div>
              </div>

              {/* Visual classification spectrum */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <span className="text-xs font-semibold text-zinc-300 block">
                  Classification Spectrum Preview:
                </span>
                <div className="h-6 w-full rounded-lg overflow-hidden flex text-[10px] font-bold text-center">
                  <div className="bg-rose-500/80 text-white flex items-center justify-center w-1/4">
                    Loss-Making (&lt;{lowMarginThreshold}%)
                  </div>
                  <div className="bg-amber-500/80 text-black flex items-center justify-center w-1/3">
                    Low-Margin ({lowMarginThreshold}% – {profitableThreshold}%)
                  </div>
                  <div className="bg-emerald-500/80 text-black flex items-center justify-center flex-1">
                    Profitable (≥{profitableThreshold}%)
                  </div>
                </div>
              </div>

              {role !== "member" && (
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSavingThresholds}
                    className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {isSavingThresholds ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sliders className="w-3.5 h-3.5" />
                    )}
                    <span>Save Thresholds & Recalculate Portfolio</span>
                  </button>
                </div>
              )}
            </form>
          )}

          {/* TAB 3: Team Members */}
          {activeTab === "team" && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                <div>
                  <h3 className="text-base font-bold text-white">Team Members</h3>
                  <p className="text-xs text-zinc-400">
                    Manage workspace roles (Owner, Admin, Member)
                  </p>
                </div>
                {role !== "member" && (
                  <button
                    onClick={() => setInviteModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/20 self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Invite Member</span>
                  </button>
                )}
              </div>

              <div className="overflow-x-auto rounded-lg border border-zinc-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900 border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase">
                    <tr>
                      <th className="py-3 px-4">Member Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850">
                    {loadingMembers ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-zinc-400">
                          Loading team members...
                        </td>
                      </tr>
                    ) : members.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-zinc-400">
                          No team members found.
                        </td>
                      </tr>
                    ) : (
                      members.map((m) => (
                        <tr key={m.id} className="hover:bg-zinc-900/40">
                          <td className="py-3 px-4 font-semibold text-white">
                            {m.user?.fullName || "Invited Colleague"}
                          </td>
                          <td className="py-3 px-4 text-zinc-300 font-mono text-[11px]">
                            {m.user?.email || m.invitedEmail}
                          </td>
                          <td className="py-3 px-4">
                            <RoleBadge role={m.role} />
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-[10px] font-medium px-2 py-0.5 rounded capitalize ${
                                m.status === "active"
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-amber-500/10 text-amber-400"
                              }`}
                            >
                              {m.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {role !== "member" && m.role !== "owner" && (
                              <button
                                onClick={() => setDeleteMemberId(m.id)}
                                className="p-1 rounded text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: My Account */}
          {activeTab === "account" && (
            <div className="space-y-6 max-w-xl">
              <div>
                <h3 className="text-base font-bold text-white">My Account</h3>
                <p className="text-xs text-zinc-400">Your personal profile and credentials</p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-base font-bold text-white shadow-lg shadow-indigo-600/20">
                      {user?.fullName?.charAt(0) || "U"}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{user?.fullName}</div>
                      <div className="text-xs text-zinc-400 font-mono">{user?.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-zinc-800 text-xs text-zinc-400">
                    <span>Role in Organization:</span>
                    <RoleBadge role={role} />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={logout}
                    className="px-4 py-2 rounded-lg bg-rose-600/15 hover:bg-rose-600/25 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-colors"
                  >
                    Sign Out of ProfitLens
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Demo & Data Tools */}
          {activeTab === "data" && (
            <div className="space-y-6 max-w-xl">
              <div>
                <h3 className="text-base font-bold text-white">Demo & Data Management</h3>
                <p className="text-xs text-zinc-400">
                  Tools to seed realistic demo data or reset workspace data for testing
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Database className="w-4 h-4 text-indigo-400" />
                    <span>Load 12-Month Realistic Sample Dataset</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Seeds 18 realistic B2B client accounts across 12 monthly periods with software
                    subscriptions, engineering services, support, discounts, and SLA credits.
                  </p>
                  <button
                    onClick={handleLoadDemo}
                    disabled={isSeeding || role === "member"}
                    className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 border border-zinc-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    {isSeeding ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>{isSeeding ? "Reloading Dataset..." : "Load Sample Data"}</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-rose-500/25 bg-rose-950/15 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span>Clear All Organization Data</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Deletes all transactions, client records, and upload files for this organization.
                    Leaves an empty workspace ready for fresh CSV testing.
                  </p>
                  <button
                    onClick={() => setClearConfirmOpen(true)}
                    disabled={role === "member"}
                    className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white shadow-lg shadow-rose-600/20 disabled:opacity-50 transition-colors"
                  >
                    Clear All Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form
            onSubmit={handleInviteMember}
            className="glass-panel p-6 rounded-2xl border border-zinc-700 max-w-md w-full space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white">Invite New Team Member</h3>
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-zinc-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-300 mb-1">Assigned Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="member">Member (Read-only dashboard access)</option>
                  <option value="admin">Admin (Can upload data & adjust thresholds)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isInviting}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 disabled:opacity-50"
              >
                {isInviting ? "Inviting..." : "Send Invitation"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Member Confirmation Modal */}
      {deleteMemberId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel p-6 rounded-2xl border border-zinc-700 max-w-sm w-full space-y-4">
            <h3 className="text-sm font-bold text-white">Remove Team Member?</h3>
            <p className="text-xs text-zinc-300">
              This will revoke their access to this company workspace immediately.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setDeleteMemberId(null)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 text-xs text-zinc-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveMember(deleteMemberId)}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white"
              >
                Confirm Removal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Data Confirmation Modal */}
      {clearConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel p-6 rounded-2xl border border-zinc-700 max-w-md w-full space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Reset & Clear All Data?</h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Are you sure you want to clear all data for{" "}
              <strong>{organization?.name}</strong>? This will remove all clients, transactions,
              and past uploads. You will be left with an empty dashboard ready for new uploads.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setClearConfirmOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 text-xs text-zinc-300"
              >
                Cancel
              </button>
              <button
                onClick={handleClearData}
                disabled={isClearing}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white shadow-lg shadow-rose-600/20 disabled:opacity-50"
              >
                {isClearing ? "Clearing..." : "Yes, Clear All Data"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
