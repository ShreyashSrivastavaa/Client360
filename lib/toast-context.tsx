"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextType {
  addToast: (toast: { type?: ToastType; title?: string; message: string }) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type = "info", title, message }: { type?: ToastType; title?: string; message: string }) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, type, title, message };

      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast]
  );

  const success = useCallback((message: string, title?: string) => addToast({ type: "success", title, message }), [addToast]);
  const error = useCallback((message: string, title?: string) => addToast({ type: "error", title, message }), [addToast]);
  const info = useCallback((message: string, title?: string) => addToast({ type: "info", title, message }), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, success, error, info }}>
      {children}
      {/* Toast viewport container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-[4px] bg-white border border-[#eaeaea] text-[#1a1a1a] transition-all animate-in fade-in slide-in-from-bottom-3"
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 mt-1 ${
                toast.type === "success"
                  ? "bg-[#34d399]"
                  : toast.type === "error"
                  ? "bg-[#ef4444]"
                  : "bg-[#38bdf8]"
              }`}
            />
            <div className="flex-1 min-w-0">
              {toast.title && <div className="text-xs font-bold text-[#1a1a1a]">{toast.title}</div>}
              <div className="text-xs text-[#6f6f6f] leading-relaxed">{toast.message}</div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#838383] hover:text-[#1a1a1a] transition-colors p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
