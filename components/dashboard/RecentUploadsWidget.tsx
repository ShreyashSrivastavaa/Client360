import React from "react";
import Link from "next/link";
import { UploadCloud, CheckCircle2, ArrowRight } from "lucide-react";

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
    <div className="p-6 sm:p-8 rounded-[32px] bg-white border border-[#d1d1db] shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-[#d1d1db]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#f7f7f8] text-[#121217]">
            <UploadCloud className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-display font-bold text-[#121217]">Recent Data Imports</h3>
            <p className="text-xs text-[#6c6c89]">Past CSV uploads processed by the calculation engine</p>
          </div>
        </div>
        <Link
          href="/uploads"
          className="text-xs text-[#5423e7] hover:text-[#4518cc] flex items-center gap-1 font-semibold"
        >
          <span>View All Uploads</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-[#d1d1db] mt-2">
        {uploads.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#6c6c89]">
            No files uploaded yet. Upload a CSV to ingest new client data.
          </div>
        ) : (
          uploads.slice(0, 3).map((item) => (
            <div key={item.id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-[#f7f7f8] text-[#5423e7]">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-[#121217] truncate max-w-[200px] sm:max-w-xs">
                    {item.fileName}
                  </div>
                  <div className="text-[11px] text-[#6c6c89]">
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
                  <span className="font-bold text-[#121217] tabular-nums">
                    {item.validRows} rows
                  </span>
                  {item.failedRows > 0 && (
                    <span className="text-[#d50b3e] ml-1.5 tabular-nums font-semibold">
                      ({item.failedRows} failed)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#1e874c]/10 text-[#1e874c] border border-[#1e874c]/20">
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
