import React from "react";
import Link from "next/link";
import { UploadCloud, CheckCircle2, Clock, AlertTriangle, ArrowRight } from "lucide-react";

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
    <div className="glass-panel p-5 rounded-xl border border-zinc-800/80">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300">
            <UploadCloud className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Recent Data Imports</h3>
            <p className="text-xs text-zinc-400">Past data uploads processed by the calculation engine</p>
          </div>
        </div>
        <Link
          href="/uploads"
          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
        >
          <span>View All Uploads</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-zinc-800/60 mt-2">
        {uploads.length === 0 ? (
          <div className="py-6 text-center text-xs text-zinc-400">
            No files uploaded yet. Upload a CSV to ingest new client data.
          </div>
        ) : (
          uploads.slice(0, 3).map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-1.5 rounded bg-zinc-800/80 text-zinc-300">
                  <UploadCloud className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-white truncate max-w-[200px] sm:max-w-xs">
                    {item.fileName}
                  </div>
                  <div className="text-[11px] text-zinc-400">
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
                  <span className="font-semibold text-white tabular-nums">
                    {item.validRows} rows
                  </span>
                  {item.failedRows > 0 && (
                    <span className="text-rose-400 ml-1.5 tabular-nums">
                      ({item.failedRows} failed)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Completed</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
