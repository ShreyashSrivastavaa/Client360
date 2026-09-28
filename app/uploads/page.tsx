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
  Trash2,
  Download,
  ArrowRight,
  X,
  RefreshCw,
  Info,
  Check,
  AlertCircle,
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
    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploadType", uploadType);

    try {
      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({ error: "Failed to parse CSV" }));
        throw new Error(errJson.error || "Failed to parse CSV file");
      }

      const data: ParsedUploadResponse = await res.json();
      setParsedData(data);
      setColumnMapping(data.autoMapping || {});
      setStep("mapping");
      success(`Parsed ${data.totalRows} rows from ${data.fileName}`);
    } catch (err: any) {
      error(err.message || "Failed to process CSV file");
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Confirm import with mapping
  const handleConfirmImport = async () => {
    if (!parsedData) return;

    if (!columnMapping.clientName || !columnMapping.transactionDate || !columnMapping.amount) {
      error("Client Name, Transaction Date, and Amount are required column mappings.");
      return;
    }

    setIsImporting(true);
    try {
      const res = await apiFetch<{
        uploadId: string;
        validRows: number;
        failedRows: number;
        message: string;
      }>("/api/uploads/confirm", {
        method: "POST",
        body: JSON.stringify({
          fileName: parsedData.fileName,
          uploadType: parsedData.uploadType,
          rawCsvText: parsedData.rawCsvText,
          columnMapping,
        }),
      });

      success(res.message || `Imported ${res.validRows} rows successfully!`);
      setStep("idle");
      setParsedData(null);
      fetchUploads();
      router.refresh();
    } catch (err: any) {
      error(err.message || "Import confirmation failed");
    } finally {
      setIsImporting(false);
    }
  };

  // Delete upload & rollback
  const handleDeleteUpload = async (id: string) => {
    try {
      await apiFetch(`/api/uploads/${id}`, { method: "DELETE" });
      success("Upload deleted and summaries recalculated.");
      setDeleteConfirmId(null);
      fetchUploads();
    } catch (err: any) {
      error(err.message || "Failed to delete upload");
    }
  };

  return (
    <AppShell
      eyebrow="INGESTION ENGINE"
      pageTitle="CSV Ledger Ingest"
      pageDescription="Upload financial ledgers with automatic column detection and formula sanitization"
    >
      <div className="space-y-6">
        {/* Upload Action Card */}
        {role !== "member" ? (
          <div className="p-6 rounded-[4px] bg-[#ffffff] border border-[#e0e0e0]">
            {step === "idle" ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e0e0e0]">
                  <div>
                    <h3 className="font-serif text-xl text-[#272727] tracking-tight">Import New Transactions</h3>
                    <p className="text-xs text-[#5d5d5d]">Upload revenue or expense records from your accounting tool</p>
                  </div>

                  {/* Sample CSV Download buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono text-[#858585] hidden sm:inline">Templates:</span>
                    <a
                      href="/api/uploads/template?type=combined"
                      download
                      className="btn-secondary text-xs py-1 px-2.5"
                    >
                      <Download className="w-3 h-3 text-[#7451f2]" />
                      <span>Combined</span>
                    </a>
                    <a
                      href="/api/uploads/template?type=sales"
                      download
                      className="btn-secondary text-xs py-1 px-2.5"
                    >
                      <Download className="w-3 h-3 text-[#7451f2]" />
                      <span>Sales</span>
                    </a>
                    <a
                      href="/api/uploads/template?type=cost"
                      download
                      className="btn-secondary text-xs py-1 px-2.5"
                    >
                      <Download className="w-3 h-3 text-[#7451f2]" />
                      <span>Costs</span>
                    </a>
                  </div>
                </div>

                {/* Upload Type Radio Selection */}
                <div>
                  <label className="font-mono text-[11px] uppercase tracking-[0.22px] text-[#858585] block mb-2">
                    Select File Structure
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        key: "combined",
                        label: "Combined File",
                        desc: "Revenue and Cost with a Type column",
                      },
                      {
                        key: "sales",
                        label: "Sales / Revenue",
                        desc: "All rows treated as income",
                      },
                      {
                        key: "cost",
                        label: "Cost / Expense",
                        desc: "All rows treated as expense",
                      },
                    ].map((t) => {
                      const isSelected = uploadType === t.key;
                      return (
                        <button
                          key={t.key}
                          type="button"
                          onClick={() => setUploadType(t.key as any)}
                          className={`p-3 rounded-[4px] text-left border transition-colors ${
                            isSelected
                              ? "border-[#7451f2] bg-[#f6f6f6]"
                              : "border-[#e0e0e0] bg-[#ffffff] hover:border-[#858585]"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#272727]">{t.label}</span>
                            {isSelected && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#7451f2]" />
                            )}
                          </div>
                          <div className="text-[11px] text-[#5d5d5d] mt-1 leading-normal">
                            {t.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Drag and Drop Zone with Dotted background feel */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileDrop(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed border-[#e0e0e0] hover:border-[#7451f2] hover:bg-[#f6f6f6] bg-[#ffffff] rounded-[4px] p-8 sm:p-12 text-center cursor-pointer transition-colors group"
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

                  <div className="w-10 h-10 rounded-[4px] bg-[#f6f6f6] border border-[#e0e0e0] text-[#7451f2] flex items-center justify-center mx-auto mb-3">
                    {isParsing ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-[#7451f2]" />
                    ) : (
                      <UploadCloud className="w-4 h-4 text-[#7451f2] transition-colors" />
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-[#272727] mb-1">
                    {isParsing ? "Analyzing CSV Headers..." : "Click or drag CSV file to upload"}
                  </h4>
                  <p className="text-xs text-[#5d5d5d] max-w-sm mx-auto">
                    Supported format: Comma-separated (.csv). Automatic header detection for Client,
                    Date, Amount, Category, and Type.
                  </p>
                </div>
              </div>
            ) : (
              /* Step 2: Column Mapping Screen */
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#eaeaea]">
                  <div>
                    <h3 className="text-sm font-bold text-[#1a1a1a]">
                      Map CSV Columns
                    </h3>
                    <p className="text-xs text-[#838383]">
                      File: <span className="font-bold text-[#1a1a1a]">{parsedData?.fileName}</span> ({parsedData?.totalRows} rows identified)
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setStep("idle");
                      setParsedData(null);
                    }}
                    className="btn-rows-outlined text-xs py-1 px-3"
                  >
                    Cancel
                  </button>
                </div>

                {/* Mapping Selectors Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-[4px] bg-[#f7f7f7] border border-[#eaeaea]">
                  <div>
                    <label className="text-xs font-bold text-[#1a1a1a] flex items-center gap-1 mb-1.5">
                      <span>Client / Account Name</span>
                      <span className="text-[#e11d48]">*</span>
                    </label>
                    <select
                      value={columnMapping.clientName || ""}
                      onChange={(e) =>
                        setColumnMapping({ ...columnMapping, clientName: e.target.value })
                      }
                      className="input-rows-default w-full text-xs"
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
                    <label className="text-xs font-bold text-[#1a1a1a] flex items-center gap-1 mb-1.5">
                      <span>Transaction Date</span>
                      <span className="text-[#e11d48]">*</span>
                    </label>
                    <select
                      value={columnMapping.transactionDate || ""}
                      onChange={(e) =>
                        setColumnMapping({ ...columnMapping, transactionDate: e.target.value })
                      }
                      className="input-rows-default w-full text-xs"
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
                    <label className="text-xs font-bold text-[#1a1a1a] flex items-center gap-1 mb-1.5">
                      <span>Amount ($)</span>
                      <span className="text-[#e11d48]">*</span>
                    </label>
                    <select
                      value={columnMapping.amount || ""}
                      onChange={(e) =>
                        setColumnMapping({ ...columnMapping, amount: e.target.value })
                      }
                      className="input-rows-default w-full text-xs"
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
                      <label className="text-xs font-bold text-[#1a1a1a] block mb-1.5">
                        Type (Revenue vs. Cost)
                      </label>
                      <select
                        value={columnMapping.type || ""}
                        onChange={(e) =>
                          setColumnMapping({ ...columnMapping, type: e.target.value })
                        }
                        className="input-rows-default w-full text-xs"
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
                    <label className="text-xs font-bold text-[#1a1a1a] block mb-1.5">
                      Category / Line Item
                    </label>
                    <select
                      value={columnMapping.category || ""}
                      onChange={(e) =>
                        setColumnMapping({ ...columnMapping, category: e.target.value })
                      }
                      className="input-rows-default w-full text-xs"
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
                    <label className="text-xs font-bold text-[#1a1a1a] block mb-1.5">
                      Description / Memo
                    </label>
                    <select
                      value={columnMapping.description || ""}
                      onChange={(e) =>
                        setColumnMapping({ ...columnMapping, description: e.target.value })
                      }
                      className="input-rows-default w-full text-xs"
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
                  <h4 className="text-rows-caption mb-2">First 5 Sample Rows</h4>
                  <div className="overflow-x-auto rounded-[4px] border border-[#eaeaea]">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-[#f7f7f7] border-b border-[#eaeaea] text-[#838383] font-normal">
                        <tr>
                          {parsedData?.headers.map((h) => (
                            <th key={h} className="p-2.5 whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e1e1e1] bg-white">
                        {parsedData?.sampleRows.slice(0, 5).map((row, i) => (
                          <tr key={i} className="hover:bg-[#f7f7f7]">
                            {parsedData?.headers.map((h) => (
                              <td key={h} className="p-2.5 text-[#1a1a1a] whitespace-nowrap">
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
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#eaeaea]">
                  <button
                    onClick={() => {
                      setStep("idle");
                      setParsedData(null);
                    }}
                    className="btn-rows-outlined text-xs"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirmImport}
                    disabled={isImporting}
                    className="btn-rows-primary text-xs"
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
          <div className="p-4 rounded-[4px] border border-[#eaeaea] bg-white text-xs text-[#6f6f6f] flex items-center gap-2">
            <Info className="w-4 h-4 text-[#838383] shrink-0" />
            <span>You have Member (read-only) access. File uploads require Admin or Owner permissions.</span>
          </div>
        )}

        {/* Uploads History Table */}
        <div className="rounded-[4px] bg-[#ffffff] border border-[#e0e0e0] overflow-hidden">
          <div className="p-4 border-b border-[#e0e0e0] flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl text-[#272727] tracking-tight">Import History</h3>
              <p className="text-xs text-[#5d5d5d]">
                Past data uploads with processing statistics and instant rollback
              </p>
            </div>
            <button
              onClick={fetchUploads}
              className="p-1.5 rounded-[4px] bg-[#ffffff] hover:bg-[#f6f6f6] border border-[#e0e0e0] text-[#272727] transition-colors"
              title="Refresh History"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f6f6f6] border-b border-[#e0e0e0] font-mono text-[11px] uppercase tracking-[0.22px] text-[#858585]">
                <tr>
                  <th className="py-2.5 px-4">File Name</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Uploaded By</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4 text-right">Total Rows</th>
                  <th className="py-2.5 px-4 text-right">Valid Rows</th>
                  <th className="py-2.5 px-4 text-right">Failed Rows</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e0e0e0]">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="p-4">
                      <TableSkeleton rows={3} cols={9} />
                    </td>
                  </tr>
                ) : uploads.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-xs text-[#858585]">
                      No files uploaded yet. Upload a CSV to get started.
                    </td>
                  </tr>
                ) : (
                  uploads.map((item) => (
                    <tr key={item.id} className="hover:bg-[#f6f6f6] transition-colors">
                      <td className="py-3 px-4 font-semibold text-[#272727] flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#7451f2] shrink-0" />
                        <span className="truncate max-w-[180px]">{item.fileName}</span>
                      </td>
                      <td className="py-3 px-4 capitalize text-[#5d5d5d]">{item.uploadType}</td>
                      <td className="py-3 px-4 text-[#5d5d5d]">
                        {item.uploadedBy?.fullName || "User"}
                      </td>
                      <td className="py-3 px-4 text-[#858585] tabular-nums font-mono">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-[#272727] font-mono">
                        {item.totalRows}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums font-semibold text-[#16a34a] font-mono">
                        {item.validRows}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums font-mono">
                        {item.failedRows > 0 ? (
                          <span className="text-[#e11d48] font-bold">{item.failedRows}</span>
                        ) : (
                          <span className="text-[#858585]">0</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="badge-pill inline-flex items-center gap-1.5 text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
                          <span>COMPLETED</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {item.failedRows > 0 && (
                            <button
                              onClick={() => setViewErrorsItem(item)}
                              className="btn-secondary text-[11px] py-0.5 px-2 text-[#e11d48] border-[#e11d48]"
                            >
                              Errors ({item.failedRows})
                            </button>
                          )}
                          {role !== "member" && (
                            <button
                              onClick={() => setDeleteConfirmId(item.id)}
                              title="Delete Upload and Rollback"
                              className="p-1 rounded text-[#858585] hover:text-[#e11d48] transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
          <div className="bg-white p-6 rounded-[8px] border border-[#eaeaea] max-w-md w-full space-y-4">
            <div className="flex items-center gap-3 text-[#e11d48]">
              <div>
                <h3 className="text-base font-bold text-[#1a1a1a]">Delete Upload & Rollback?</h3>
                <p className="text-xs text-[#838383]">This action will delete all imported records.</p>
              </div>
            </div>

            <p className="text-xs text-[#6f6f6f] leading-relaxed">
              Deleting this upload will permanently remove all transactions associated with this file
              and automatically trigger an idempotent recalculation of client profitability summaries.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#eaeaea]">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="btn-rows-outlined text-xs py-1.5 px-3"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUpload(deleteConfirmId)}
                className="btn-rows-primary bg-[#e11d48] hover:bg-[#be123c] text-xs py-1.5 px-3"
              >
                Delete & Recalculate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Errors Modal */}
      {viewErrorsItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
          <div className="bg-white p-6 rounded-[8px] border border-[#eaeaea] max-w-xl w-full space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#eaeaea]">
              <div>
                <h3 className="text-sm font-bold text-[#1a1a1a]">
                  Failed Rows Error Log — {viewErrorsItem.fileName}
                </h3>
              </div>
              <button
                onClick={() => setViewErrorsItem(null)}
                className="text-[#838383] hover:text-[#1a1a1a]"
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
                        className="p-3 rounded-[4px] bg-[#f7f7f7] border border-[#eaeaea] text-[#1a1a1a] space-y-1"
                      >
                        <div className="font-bold text-[#e11d48]">
                          Row {e.rowNumber} • Field: {e.field}
                        </div>
                        <div className="text-[11px] text-[#6f6f6f]">{e.message}</div>
                      </div>
                    ));
                  } catch {
                    return <div className="text-[#838383]">Could not parse error log.</div>;
                  }
                })()
              ) : (
                <div className="text-[#838383]">No error details available.</div>
              )}
            </div>

            <div className="pt-3 border-t border-[#eaeaea] flex justify-end">
              <button
                onClick={() => setViewErrorsItem(null)}
                className="btn-rows-primary text-xs py-1.5 px-3"
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
