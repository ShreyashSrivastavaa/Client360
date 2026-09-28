import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface UploadSummaryItem {
  id: string;
  fileName: string;
  uploadType: string;
  status: string;
  totalRows: number;
  validRows: number;
  failedRows: number;
  createdAt: string;
  uploadedBy?: { fullName: string; email: string };
}

interface RecentUploadsWidgetProps {
  uploads: UploadSummaryItem[];
  isLoading: boolean;
}

export function RecentUploadsWidget({ uploads, isLoading }: RecentUploadsWidgetProps) {
  if (isLoading) {
    return null;
  }

  return (
    <div className="p-6 rounded-[4px] bg-[#ffffff] border border-[#e0e0e0]">
      <div className="flex items-center justify-between pb-3 border-b border-[#e0e0e0]">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.22px] text-[#858585] mb-0.5">
            DATA PIPELINE
          </div>
          <h3 className="font-serif text-xl text-[#272727] tracking-tight">
            Recent Ledger Imports
          </h3>
          <p className="text-xs text-[#5d5d5d]">Past CSV uploads processed by the calculation engine</p>
        </div>
        <Link
          href="/uploads"
          className="btn-ghost text-xs font-normal"
        >
          <span>View all uploads</span>
          <span>→</span>
        </Link>
      </div>

      <div className="divide-y divide-[#e0e0e0] mt-2">
        {uploads.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#858585]">
            No files uploaded yet. Upload a CSV to ingest new client data.
          </div>
        ) : (
          uploads.slice(0, 3).map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7451f2] shrink-0" />
                <div className="min-w-0">
                  <div className="font-semibold text-[#272727] truncate max-w-[200px] sm:max-w-xs">
                    {item.fileName}
                  </div>
                  <div className="text-[11px] text-[#858585] font-mono">
                    {item.uploadedBy?.fullName || "User"} •{" "}
                    {new Date(item.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right hidden sm:block font-mono text-xs text-[#5d5d5d]">
                  <span className="tabular-nums">
                    {item.validRows} rows
                  </span>
                  {item.failedRows > 0 && (
                    <span className="text-[#e11d48] ml-1.5 tabular-nums">
                      ({item.failedRows} invalid)
                    </span>
                  )}
                </div>

                <span className="badge-pill inline-flex items-center gap-1.5 text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
                  <span>COMPLETED</span>
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
