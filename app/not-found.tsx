import React from "react";
import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#823513] text-[#faae33] flex items-center justify-center p-6 selection:bg-[#faae33] selection:text-[#281006]">
      <div className="tiger-card max-w-md w-full text-center space-y-6 p-8 border border-[#6b2e12] bg-[#402011] rounded-[6px]">
        <div className="text-7xl font-salmond font-bold text-[#faae33] leading-none">
          404
        </div>

        <div className="space-y-2">
          <span className="text-xs font-salmond tracking-[2px] text-[#faae33]/60 uppercase block">
            PAGE NOT FOUND
          </span>
          <h1 className="text-2xl font-salmond font-bold text-[#faae33] uppercase">
            LOST IN THE TANDOOR
          </h1>
          <p className="text-xs font-graphikx text-[#faae33]/70 leading-relaxed">
            The page or resource you are looking for has been moved, deleted, or does not exist in your workspace.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="btn-primary-filled flex items-center gap-2 text-xs"
          >
            <Home className="w-3.5 h-3.5" />
            <span>RETURN TO DASHBOARD</span>
          </Link>
          <Link
            href="/"
            className="btn-ghost-outline flex items-center gap-2 text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>HOME</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
