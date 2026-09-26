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
      <div className="space-y-8">
        {/* Upload Wizard Section */}
        {role !== "member" ? (
          <div className="lemon-card p-6 sm:p-10">
            {step === "idle" ? (
              <div className="space-y-6">
                {/* Header & Templates */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#d1d1db]">
                  <div>
                    <div className="eyebrow text-[#6c6c89] text-[12px] uppercase tracking-[2px] font-semibold mb-1">
                      Data Ingestion
                    </div>
                    <h3 className="font-display text-xl sm:text-2xl font-normal text-[#121217]">
                      Import New CSV File
                    </h3>
                    <p className="text-xs text-[#6c6c89] mt-0.5">
                      Upload your transaction data. Maximum file size is 10MB per batch.
                    </p>
                  </div>

                  {/* Sample CSV Download buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-[#6c6c89] font-medium hidden sm:inline">Templates:</span>
                    <a
                      href="/api/uploads/template?type=combined"
                      download
                      className="px-3 py-1.5 rounded-full bg-[#f7f7f8] hover:bg-[#ffc233]/20 border border-[#d1d1db] text-[11px] font-medium text-[#121217] flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3 h-3 text-[#5423e7]" />
                      <span>Combined CSV</span>
                    </a>
                    <a
                      href="/api/uploads/template?type=sales"
                      download
                      className="px-3 py-1.5 rounded-full bg-[#f7f7f8] hover:bg-[#ffc233]/20 border border-[#d1d1db] text-[11px] font-medium text-[#121217] flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3 h-3 text-[#5423e7]" />
                      <span>Sales Only</span>
                    </a>
                    <a
                      href="/api/uploads/template?type=cost"
                      download
                      className="px-3 py-1.5 rounded-full bg-[#f7f7f8] hover:bg-[#ffc233]/20 border border-[#d1d1db] text-[11px] font-medium text-[#121217] flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3 h-3 text-[#5423e7]" />
                      <span>Costs Only</span>
                    </a>
                  </div>
                </div>

                {/* Upload Type Radio Selection */}
                <div>
                  <label className="block text-xs font-semibold text-[#121217] mb-2">
                    Select File Structure
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        key: "combined",
                        label: "Combined File",
                        desc: "Contains both Revenue & Cost with a Type column",
                      },
                      {
                        key: "sales",
                        label: "Sales / Revenue File",
                        desc: "All transaction rows treated as income",
                      },
                      {
                        key: "cost",
                        label: "Cost / Expense File",
                        desc: "All transaction rows treated as expense",
                      },
                    ].map((t) => {
                      const isSelected = uploadType === t.key;
                      return (
                        <button
                          key={t.key}
                          type="button"
                          onClick={() => setUploadType(t.key as any)}
                          className={`p-3.5 rounded-2xl text-left border transition-all ${
                            isSelected
                              ? "bg-[#5423e7]/5 border-[#5423e7] shadow-sm"
                              : "bg-[#f7f7f8] border-[#d1d1db] hover:border-[#121217]/40"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-xs text-[#121217]">{t.label}</span>
                            {isSelected && (
                              <span className="w-2 h-2 rounded-full bg-[#5423e7]" />
                            )}
                          </div>
                          <div className="text-[11px] text-[#6c6c89] mt-1 leading-relaxed">
                            {t.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
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
                  className="border-2 border-dashed border-[#d1d1db] hover:border-[#5423e7] bg-[#f7f7f8] hover:bg-white rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 group"
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

                  <div className="w-14 h-14 rounded-2xl bg-[#5423e7]/10 text-[#5423e7] flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    {isParsing ? (
                      <RefreshCw className="w-6 h-6 animate-spin text-[#5423e7]" />
                    ) : (
                      <UploadCloud className="w-7 h-7 text-[#5423e7]" />
                    )}
                  </div>
                  <h4 className="font-display text-base font-normal text-[#121217] mb-1">
                    {isParsing ? "Analyzing CSV Headers..." : "Click or drag CSV file to upload"}
                  </h4>
                  <p className="text-xs text-[#6c6c89] max-w-sm mx-auto">
                    Supported format: Comma-separated (.csv). Automatic header detection for Client,
                    Date, Amount, Category, and Type.
                  </p>
                </div>
              </div>
            ) : (
              /* Step 2: Column Mapping Screen */
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#d1d1db]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#5423e7] text-white flex items-center justify-center text-xs font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-normal text-[#121217]">
                        Map CSV Columns
                      </h3>
                      <p className="text-xs text-[#6c6c89]">
                        File: <span className="font-semibold text-[#121217]">{parsedData?.fileName}</span> ({parsedData?.totalRows} rows identified)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setStep("idle");
                      setParsedData(null);
                    }}
                    className="text-xs text-[#6c6c89] hover:text-[#121217] px-3 py-1.5 rounded-lg bg-white border border-[#d1d1db] transition-colors"
                  >
                    Cancel
                  </button>
                </div>

                {/* Mapping Selectors Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-[#f7f7f8] p-5 rounded-2xl border border-[#d1d1db]">
                  <div>
                    <label className="text-xs font-semibold text-[#121217] flex items-center gap-1 mb-1.5">
                      <span>Client / Account Name</span>
                      <span className="text-[#d50b3e]">*</span>
                    </label>
                    <select
                      value={columnMapping.clientName || ""}
                      onChange={(e) =>
                        setColumnMapping({ ...columnMapping, clientName: e.target.value })
                      }
                      className="w-full text-xs bg-white border border-[#d1d1db] rounded-lg p-2.5 text-[#121217] focus:outline-none focus:border-[#5423e7] focus:ring-1 focus:ring-[#5423e7]"
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
                    <label className="text-xs font-semibold text-[#121217] flex items-center gap-1 mb-1.5">
                      <span>Transaction Date</span>
                      <span className="text-[#d50b3e]">*</span>
                    </label>
                    <select
                      value={columnMapping.transactionDate || ""}
                      onChange={(e) =>
                        setColumnMapping({ ...columnMapping, transactionDate: e.target.value })
                      }
                      className="w-full text-xs bg-white border border-[#d1d1db] rounded-lg p-2.5 text-[#121217] focus:outline-none focus:border-[#5423e7] focus:ring-1 focus:ring-[#5423e7]"
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
                    <label className="text-xs font-semibold text-[#121217] flex items-center gap-1 mb-1.5">
                      <span>Amount ($)</span>
                      <span className="text-[#d50b3e]">*</span>
                    </label>
                    <select
                      value={columnMapping.amount || ""}
                      onChange={(e) =>
                        setColumnMapping({ ...columnMapping, amount: e.target.value })
                      }
                      className="w-full text-xs bg-white border border-[#d1d1db] rounded-lg p-2.5 text-[#121217] focus:outline-none focus:border-[#5423e7] focus:ring-1 focus:ring-[#5423e7]"
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
                      <label className="text-xs font-semibold text-[#121217] flex items-center gap-1 mb-1.5">
                        <span>Type (Revenue vs. Cost)</span>
                      </label>
                      <select
                        value={columnMapping.type || ""}
                        onChange={(e) =>
                          setColumnMapping({ ...columnMapping, type: e.target.value })
                        }
                        className="w-full text-xs bg-white border border-[#d1d1db] rounded-lg p-2.5 text-[#121217] focus:outline-none focus:border-[#5423e7] focus:ring-1 focus:ring-[#5423e7]"
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
                    <label className="text-xs font-semibold text-[#121217] flex items-center gap-1 mb-1.5">
                      <span>Category / Line Item</span>
                    </label>
                    <select
                      value={columnMapping.category || ""}
                      onChange={(e) =>
                        setColumnMapping({ ...columnMapping, category: e.target.value })
                      }
                      className="w-full text-xs bg-white border border-[#d1d1db] rounded-lg p-2.5 text-[#121217] focus:outline-none focus:border-[#5423e7] focus:ring-1 focus:ring-[#5423e7]"
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
                    <label className="text-xs font-semibold text-[#121217] flex items-center gap-1 mb-1.5">
                      <span>Description / Memo</span>
                    </label>
                    <select
                      value={columnMapping.description || ""}
                      onChange={(e) =>
                        setColumnMapping({ ...columnMapping, description: e.target.value })
                      }
                      className="w-full text-xs bg-white border border-[#d1d1db] rounded-lg p-2.5 text-[#121217] focus:outline-none focus:border-[#5423e7] focus:ring-1 focus:ring-[#5423e7]"
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
                  <h4 className="text-xs font-semibold text-[#121217] mb-2">First 5 Sample Rows</h4>
                  <div className="overflow-x-auto rounded-xl border border-[#d1d1db]">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-[#f7f7f8] border-b border-[#d1d1db] text-[#6c6c89] font-medium">
                        <tr>
                          {parsedData?.headers.map((h) => (
                            <th key={h} className="p-3 whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#d1d1db] bg-white">
                        {parsedData?.sampleRows.slice(0, 5).map((row, i) => (
                          <tr key={i} className="hover:bg-[#f7f7f8]">
                            {parsedData?.headers.map((h) => (
                              <td key={h} className="p-3 text-[#121217] whitespace-nowrap">
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
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#d1d1db]">
                  <button
                    onClick={() => {
                      setStep("idle");
                      setParsedData(null);
                    }}
                    className="px-4 py-2.5 rounded-lg bg-white hover:bg-[#f7f7f8] border border-[#d1d1db] text-xs font-medium text-[#121217] transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirmImport}
                    disabled={isImporting}
                    className="px-6 py-2.5 rounded-lg bg-[#121217] hover:bg-black text-xs font-medium text-white shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
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
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-5 rounded-2xl border border-[#d1d1db] bg-white text-xs text-[#6c6c89] flex items-center gap-3">
            <Info className="w-4 h-4 text-[#5423e7] shrink-0" />
            <span>You have Member (read-only) access. File uploads require Admin or Owner permissions.</span>
          </div>
        )}

        {/* Uploads History Table */}
        <div className="lemon-card p-6 sm:p-8">
          <div className="pb-5 border-b border-[#d1d1db] flex items-center justify-between">
            <div>
              <div className="eyebrow text-[#6c6c89] text-[12px] uppercase tracking-[2px] font-semibold mb-1">
                Audit Trail
              </div>
              <h3 className="font-display text-xl font-normal text-[#121217]">Import History</h3>
              <p className="text-xs text-[#6c6c89] mt-0.5">
                Past data uploads with processing statistics and instant rollback
              </p>
            </div>
            <button
              onClick={fetchUploads}
              className="p-2 rounded-lg bg-white hover:bg-[#f7f7f8] border border-[#d1d1db] text-[#121217] transition-colors"
              title="Refresh History"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f7f7f8] border-b border-[#d1d1db] text-[11px] font-semibold text-[#6c6c89] uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">File Name</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Uploaded By</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Total Rows</th>
                  <th className="py-3.5 px-4 text-right">Valid Rows</th>
                  <th className="py-3.5 px-4 text-right">Failed Rows</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d1d1db]">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="p-4">
                      <TableSkeleton rows={3} cols={9} />
                    </td>
                  </tr>
                ) : uploads.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-xs text-[#6c6c89]">
                      No files uploaded yet. Upload a CSV to get started.
                    </td>
                  </tr>
                ) : (
                  uploads.map((item) => (
                    <tr key={item.id} className="hover:bg-[#f7f7f8] transition-colors">
                      <td className="py-3.5 px-4 font-medium text-[#121217] flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#5423e7] shrink-0" />
                        <span className="truncate max-w-[180px]">{item.fileName}</span>
                      </td>
                      <td className="py-3.5 px-4 capitalize text-[#6c6c89]">{item.uploadType}</td>
                      <td className="py-3.5 px-4 text-[#6c6c89]">
                        {item.uploadedBy?.fullName || "User"}
                      </td>
                      <td className="py-3.5 px-4 text-[#6c6c89]">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right tabular-nums text-[#121217]">
                        {item.totalRows}
                      </td>
                      <td className="py-3.5 px-4 text-right tabular-nums font-semibold text-[#1e874c]">
                        {item.validRows}
                      </td>
                      <td className="py-3.5 px-4 text-right tabular-nums font-semibold">
                        {item.failedRows > 0 ? (
                          <span className="text-[#d50b3e]">{item.failedRows}</span>
                        ) : (
                          <span className="text-[#6c6c89]">0</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#1e874c]/10 text-[#1e874c]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Completed</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {item.failedRows > 0 && (
                            <button
                              onClick={() => setViewErrorsItem(item)}
                              className="px-2.5 py-1 rounded-full bg-[#d50b3e]/10 hover:bg-[#d50b3e]/20 text-[#d50b3e] text-[11px] font-medium border border-[#d50b3e]/20 transition-colors"
                            >
                              Errors ({item.failedRows})
                            </button>
                          )}
                          {role !== "member" && (
                            <button
                              onClick={() => setDeleteConfirmId(item.id)}
                              title="Delete Upload and Rollback"
                              className="p-1.5 rounded-lg text-[#6c6c89] hover:text-[#d50b3e] hover:bg-[#f7f7f8] transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#d1d1db] shadow-2xl max-w-md w-full space-y-4">
            <div className="flex items-center gap-3 text-[#d50b3e]">
              <div className="p-3 rounded-2xl bg-[#d50b3e]/10">
                <AlertTriangle className="w-6 h-6 text-[#d50b3e]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#121217]">Delete Upload & Rollback?</h3>
                <p className="text-xs text-[#6c6c89]">This action will delete all imported records.</p>
              </div>
            </div>

            <p className="text-xs text-[#6c6c89] leading-relaxed">
              Deleting this upload will permanently remove all transactions associated with this file
              and automatically trigger an idempotent recalculation of client profitability summaries.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#d1d1db]">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-lg bg-white hover:bg-[#f7f7f8] border border-[#d1d1db] text-xs font-medium text-[#121217]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUpload(deleteConfirmId)}
                className="px-4 py-2 rounded-lg bg-[#d50b3e] hover:bg-[#d50b3e]/90 text-xs font-medium text-white shadow-sm"
              >
                Delete & Recalculate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Errors Modal */}
      {viewErrorsItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#d1d1db] shadow-2xl max-w-xl w-full space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#d1d1db]">
              <div className="flex items-center gap-2 text-[#d50b3e]">
                <AlertCircle className="w-5 h-5" />
                <h3 className="text-sm font-bold text-[#121217]">
                  Failed Rows Error Log — {viewErrorsItem.fileName}
                </h3>
              </div>
              <button
                onClick={() => setViewErrorsItem(null)}
                className="text-[#6c6c89] hover:text-[#121217]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2.5 flex-1 pr-1 text-xs">
              {viewErrorsItem.errorLog ? (
                (() => {
                  try {
                    const errs = JSON.parse(viewErrorsItem.errorLog);
                    return errs.map((e: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-[#f7f7f8] border border-[#d1d1db] text-[#121217] space-y-1"
                      >
                        <div className="font-semibold text-[#d50b3e]">
                          Row {e.rowNumber} • Field: {e.field}
                        </div>
                        <div className="text-[11px] text-[#6c6c89]">{e.message}</div>
                      </div>
                    ));
                  } catch {
                    return <div className="text-[#6c6c89]">Could not parse error log.</div>;
                  }
                })()
              ) : (
                <div className="text-[#6c6c89]">No error details available.</div>
              )}
            </div>

            <div className="pt-3 border-t border-[#d1d1db] flex justify-end">
              <button
                onClick={() => setViewErrorsItem(null)}
                className="px-4 py-2 rounded-lg bg-[#121217] text-white text-xs font-medium"
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
