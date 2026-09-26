"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { apiFetch } from "@/lib/api-client";
import { TableSkeleton } from "@/components/ui/Skeleton";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Download,
  ArrowRight,
  X,
  RefreshCw,
  Info,
  Check,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface UploadHistoryItem {
  id: string;
  fileName: string;
  uploadType: string;
  status: string;
  totalRows: number;
  validRows: number;
  failedRows: number;
  errorLog: string | null;
  createdAt: string;
  uploadedBy?: { fullName: string; email: string };
}

interface ParsedUploadResponse {
  fileName: string;
  uploadType: "combined" | "sales" | "cost";
  totalRows: number;
  headers: string[];
  autoMapping: Record<string, string>;
  sampleRows: Record<string, string>[];
  rawCsvText: string;
}

export default function UploadsPage() {
  const { organization, role } = useAuth();
  const { success, error } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploads, setUploads] = useState<UploadHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload wizard flow states: 'idle' -> 'mapping' -> 'importing'
  const [step, setStep] = useState<"idle" | "mapping">("idle");
  const [uploadType, setUploadType] = useState<"combined" | "sales" | "cost">("combined");
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Parsed file state for column mapping
  const [parsedData, setParsedData] = useState<ParsedUploadResponse | null>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});

  // Modals
  const [viewErrorsItem, setViewErrorsItem] = useState<UploadHistoryItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchUploads = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    try {
      const res = await apiFetch<{ data: UploadHistoryItem[] }>(`/api/uploads?limit=50`);
      const list = Array.isArray(res) ? res : (res as any).data || [];
      setUploads(list);
    } catch (err: any) {
      console.error("Failed to load uploads:", err);
    } finally {
      setLoading(false);
    }
  }, [organization]);

  useEffect(() => {
    fetchUploads();
  }, [fetchUploads]);

  // Handle file selection
  const handleFileDrop = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      error("Only CSV files (.csv) are supported.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      error("File exceeds maximum allowed size of 10MB.");
      return;
    }

    setIsParsing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("uploadType", uploadType);

      const res = await apiFetch<ParsedUploadResponse>("/api/uploads", {
        method: "POST",
        body: formData,
      });

      setParsedData(res);
      setColumnMapping(res.autoMapping);
      setStep("mapping");
      success(`Parsed ${res.headers.length} headers across ${res.totalRows} rows. Please review column mappings.`);
    } catch (err: any) {
      error(err.message || "Failed to parse CSV file");
    } finally {
      setIsParsing(false);
    }
  };

  // Confirm import and process transactions
  const handleConfirmImport = async () => {
    if (!parsedData) return;

    if (!columnMapping.clientName || !columnMapping.transactionDate || !columnMapping.amount) {
      error("Client Name, Date, and Amount mappings are required.");
      return;
    }

    setIsImporting(true);
    try {
      const res = await apiFetch<{
        uploadId: string;
        totalRows: number;
        validRows: number;
        failedRows: number;
      }>("/api/uploads/confirm", {
        method: "POST",
        body: JSON.stringify({
          fileName: parsedData.fileName,
          uploadType: parsedData.uploadType,
          columnMapping,
          rawCsvText: parsedData.rawCsvText,
        }),
      });

      success(
        `Successfully imported ${res.validRows} rows! Profitability engine recalculated.`,
        "Import Complete"
      );

      // Reset wizard and refresh uploads
      setStep("idle");
      setParsedData(null);
      fetchUploads();
      router.push("/dashboard");
    } catch (err: any) {
      error(err.message || "Failed to confirm and import data");
    } finally {
      setIsImporting(false);
    }
  };

  // Rollback / Delete Upload
  const handleDeleteUpload = async (id: string) => {
    try {
      await apiFetch(`/api/uploads/${id}`, { method: "DELETE" });
      success("Upload deleted and all associated transactions rolled back.", "Rollback Complete");
      setDeleteConfirmId(null);
      fetchUploads();
    } catch (err: any) {
      error(err.message || "Failed to delete upload");
    }
  };

  return (
    <AppShell
      pageTitle="Data Uploads & Ingestion"
      pageDescription="Import sales revenue and cost expenses via CSV with automatic field mapping and validation"
    >
      <div className="space-y-6">
        {/* Upload Wizard Section */}
        {role !== "member" ? (
          <div className="glass-panel p-6 rounded-xl border border-zinc-800/80">
            {step === "idle" ? (
              <div className="space-y-5">
                {/* Upload Format Selector & Template Links */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Import New CSV File</h3>
                    <p className="text-xs text-zinc-400">
                      Upload your transaction data. Up to 10MB per file.
                    </p>
                  </div>

                  {/* Sample CSV Download buttons */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400 hidden sm:inline">Templates:</span>
                    <a
                      href="/api/uploads/template?type=combined"
                      download
                      className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-[11px] font-medium text-zinc-300 flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3 h-3 text-indigo-400" />
                      <span>Combined CSV</span>
                    </a>
                    <a
                      href="/api/uploads/template?type=sales"
                      download
                      className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-[11px] font-medium text-zinc-300 flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3 h-3 text-indigo-400" />
                      <span>Sales Only</span>
                    </a>
                    <a
                      href="/api/uploads/template?type=cost"
                      download
                      className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-[11px] font-medium text-zinc-300 flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3 h-3 text-indigo-400" />
                      <span>Costs Only</span>
                    </a>
                  </div>
                </div>

                {/* Upload Type Radio */}
                <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    {
                      key: "combined",
                      label: "Combined File (Revenue & Cost)",
                      desc: "Has 'Type' column",
                    },
                    {
                      key: "sales",
                      label: "Sales / Revenue File",
                      desc: "All rows treated as revenue",
                    },
                    {
                      key: "cost",
                      label: "Cost / Expense File",
                      desc: "All rows treated as cost",
                    },
                  ].map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setUploadType(t.key as any)}
                      className={`px-3 py-2 rounded-xl text-left border transition-all ${
                        uploadType === t.key
                          ? "bg-indigo-600/15 border-indigo-500 text-white"
                          : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <div className="font-semibold text-xs">{t.label}</div>
                      <div className="text-[10px] text-zinc-400">{t.desc}</div>
                    </button>
                  ))}
                </div>

                {/* Drag and Drop Zone */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileDrop(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-zinc-700 hover:border-indigo-500/60 bg-zinc-900/40 hover:bg-zinc-900/80 rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileDrop(e.target.files[0]);
                      }
                    }}
                  />

                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    {isParsing ? (
                      <RefreshCw className="w-6 h-6 animate-spin" />
                    ) : (
                      <UploadCloud className="w-6 h-6" />
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-1">
                    {isParsing ? "Analyzing CSV Headers..." : "Click or drag CSV file to upload"}
                  </h4>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    Supported format: Comma-separated (.csv). Automatic header detection for Client,
                    Date, Amount, Category, and Type.
                  </p>
                </div>
              </div>
            ) : (
              /* Step 2: Column Mapping Screen */
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-xs font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">Map CSV Columns</h3>
                      <p className="text-xs text-zinc-400">
                        File: {parsedData?.fileName} ({parsedData?.totalRows} rows found)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setStep("idle");
                      setParsedData(null);
                    }}
                    className="text-xs text-zinc-400 hover:text-white px-2.5 py-1 rounded bg-zinc-800 border border-zinc-700"
                  >
                    Cancel
                  </button>
                </div>

                {/* Mapping Selectors Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
                  <div>
                    <label className="text-xs font-medium text-white flex items-center gap-1 mb-1.5">
                      <span>Client / Account Name</span>
                      <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={columnMapping.clientName || ""}
                      onChange={(e) =>
                        setColumnMapping({ ...columnMapping, clientName: e.target.value })
                      }
                      className="w-full text-xs bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-zinc-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">-- Select Column --</option>
                      {parsedData?.headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-white flex items-center gap-1 mb-1.5">
                      <span>Transaction Date</span>
                      <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={columnMapping.transactionDate || ""}
                      onChange={(e) =>
                        setColumnMapping({ ...columnMapping, transactionDate: e.target.value })
                      }
                      className="w-full text-xs bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-zinc-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">-- Select Column --</option>
                      {parsedData?.headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-white flex items-center gap-1 mb-1.5">
                      <span>Amount ($)</span>
                      <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={columnMapping.amount || ""}
                      onChange={(e) =>
                        setColumnMapping({ ...columnMapping, amount: e.target.value })
                      }
                      className="w-full text-xs bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-zinc-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">-- Select Column --</option>
                      {parsedData?.headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  {uploadType === "combined" && (
                    <div>
                      <label className="text-xs font-medium text-white flex items-center gap-1 mb-1.5">
                        <span>Type (Revenue vs. Cost)</span>
                      </label>
                      <select
                        value={columnMapping.type || ""}
                        onChange={(e) =>
                          setColumnMapping({ ...columnMapping, type: e.target.value })
                        }
                        className="w-full text-xs bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-zinc-200 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="">-- None (Default: Revenue) --</option>
                        {parsedData?.headers.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-medium text-white flex items-center gap-1 mb-1.5">
                      <span>Category / Line Item</span>
                    </label>
                    <select
                      value={columnMapping.category || ""}
                      onChange={(e) =>
                        setColumnMapping({ ...columnMapping, category: e.target.value })
                      }
                      className="w-full text-xs bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-zinc-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">-- None (Auto-Assign) --</option>
                      {parsedData?.headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-white flex items-center gap-1 mb-1.5">
                      <span>Description / Memo</span>
                    </label>
                    <select
                      value={columnMapping.description || ""}
                      onChange={(e) =>
                        setColumnMapping({ ...columnMapping, description: e.target.value })
                      }
                      className="w-full text-xs bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-zinc-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">-- None (Optional) --</option>
                      {parsedData?.headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Sample Rows Preview */}
                <div>
                  <h4 className="text-xs font-semibold text-white mb-2">First 5 Sample Rows</h4>
                  <div className="overflow-x-auto rounded-lg border border-zinc-800">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400">
                        <tr>
                          {parsedData?.headers.map((h) => (
                            <th key={h} className="p-2.5 whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-850">
                        {parsedData?.sampleRows.slice(0, 5).map((row, i) => (
                          <tr key={i} className="hover:bg-zinc-900/40">
                            {parsedData?.headers.map((h) => (
                              <td key={h} className="p-2.5 text-zinc-300 whitespace-nowrap">
                                {row[h] || "—"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Confirm & Process Button */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                  <button
                    onClick={() => {
                      setStep("idle");
                      setParsedData(null);
                    }}
                    className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirmImport}
                    disabled={isImporting}
                    className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isImporting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Validating & Importing...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirm & Import Data</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 text-xs text-zinc-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>You have Member (read-only) access. File uploads require Admin or Owner permissions.</span>
          </div>
        )}

        {/* Uploads History Table */}
        <div className="glass-panel rounded-xl border border-zinc-800/80 overflow-hidden">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Import History</h3>
              <p className="text-xs text-zinc-400">Past data uploads with processing statistics and rollback</p>
            </div>
            <button
              onClick={fetchUploads}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/80 border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">File Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Uploaded By</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Total Rows</th>
                  <th className="py-3 px-4 text-right">Valid Rows</th>
                  <th className="py-3 px-4 text-right">Failed Rows</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="p-4">
                      <TableSkeleton rows={3} cols={9} />
                    </td>
                  </tr>
                ) : uploads.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-xs text-zinc-400">
                      No files uploaded yet.
                    </td>
                  </tr>
                ) : (
                  uploads.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-850/40">
                      <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="truncate max-w-[180px]">{item.fileName}</span>
                      </td>
                      <td className="py-3 px-4 capitalize text-zinc-300">{item.uploadType}</td>
                      <td className="py-3 px-4 text-zinc-400">
                        {item.uploadedBy?.fullName || "User"}
                      </td>
                      <td className="py-3 px-4 text-zinc-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-zinc-300">
                        {item.totalRows}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums font-semibold text-emerald-400">
                        {item.validRows}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums font-semibold">
                        {item.failedRows > 0 ? (
                          <span className="text-rose-400">{item.failedRows}</span>
                        ) : (
                          <span className="text-zinc-500">0</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Completed</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {item.failedRows > 0 && (
                            <button
                              onClick={() => setViewErrorsItem(item)}
                              className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[11px] font-medium border border-rose-500/20"
                            >
                              Errors ({item.failedRows})
                            </button>
                          )}
                          {role !== "member" && (
                            <button
                              onClick={() => setDeleteConfirmId(item.id)}
                              title="Delete Upload and Rollback"
                              className="p-1 rounded text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete / Rollback Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel p-6 rounded-2xl border border-zinc-700 max-w-md w-full space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Upload & Rollback?</h3>
                <p className="text-xs text-zinc-400">This action will delete all imported records.</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Deleting this upload will permanently remove all transactions associated with this file
              and automatically trigger an idempotent recalculation of client profitability summaries.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUpload(deleteConfirmId)}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white shadow-lg shadow-rose-600/25"
              >
                Delete & Recalculate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Errors Modal */}
      {viewErrorsItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel p-6 rounded-2xl border border-zinc-700 max-w-xl w-full space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertCircle className="w-5 h-5" />
                <h3 className="text-sm font-bold text-white">
                  Failed Rows Error Log — {viewErrorsItem.fileName}
                </h3>
              </div>
              <button
                onClick={() => setViewErrorsItem(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 flex-1 pr-1 text-xs">
              {viewErrorsItem.errorLog ? (
                (() => {
                  try {
                    const errs = JSON.parse(viewErrorsItem.errorLog);
                    return errs.map((e: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 text-rose-300 space-y-1"
                      >
                        <div className="font-semibold text-rose-200">
                          Row {e.rowNumber} • Field: {e.field}
                        </div>
                        <div className="text-[11px] text-zinc-300">{e.message}</div>
                      </div>
                    ));
                  } catch {
                    return <div className="text-zinc-400">Could not parse error log.</div>;
                  }
                })()
              ) : (
                <div className="text-zinc-400">No error details available.</div>
              )}
            </div>

            <div className="pt-2 border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => setViewErrorsItem(null)}
                className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
