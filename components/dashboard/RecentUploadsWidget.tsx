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
    <div className="p-6 rounded-[8px] bg-white border border-[#eaeaea]">
      <div className="flex items-center justify-between pb-3 border-b border-[#eaeaea]">
        <div>
          <h3 className="text-sm font-bold text-[#1a1a1a]">Recent Data Imports</h3>
          <p className="text-xs text-[#838383]">Past CSV uploads processed by the calculation engine</p>
        </div>
        <Link
          href="/uploads"
          className="btn-rows-ghost text-xs font-normal"
        >
          <span>View all uploads</span>
          <span>→</span>
        </Link>
      </div>

      <div className="divide-y divide-[#eaeaea] mt-1">
        {uploads.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#838383]">
            No files uploaded yet. Upload a CSV to ingest new client data.
          </div>
        ) : (
          uploads.slice(0, 3).map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-[#1a1a1a] truncate max-w-[200px] sm:max-w-xs">
                    {item.fileName}
                  </div>
                  <div className="text-[11px] text-[#838383]">
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
                <div className="text-right hidden sm:block">
                  <span className="font-normal text-[#1a1a1a] tabular-nums">
                    {item.validRows} rows
                  </span>
                  {item.failedRows > 0 && (
                    <span className="text-[#e11d48] ml-1.5 tabular-nums">
                      ({item.failedRows} invalid)
                    </span>
                  )}
                </div>

                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-[0.21px] bg-white border border-[#eaeaea] text-[#1a1a1a]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]" />
                  <span>Completed</span>
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
