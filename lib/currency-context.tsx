"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  CurrencyCode,
  CURRENCIES,
  CurrencyConfig,
  setGlobalCurrency,
  getGlobalCurrency,
  formatCurrency,
} from "./utils";

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  currencyConfig: CurrencyConfig;
  symbol: string;
  formatAmount: (amount: number | null | undefined, compact?: boolean) => string;
  supportedCurrencies: CurrencyConfig[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  // Default to INR as requested
  const [currency, setCurrencyState] = useState<CurrencyCode>("INR");

  useEffect(() => {
    // Check if user previously saved a currency preference
    const saved = localStorage.getItem("client360_currency") as CurrencyCode | null;
    if (saved && CURRENCIES[saved]) {
      setCurrencyState(saved);
      setGlobalCurrency(saved);
    } else {
      setGlobalCurrency("INR");
    }
  }, []);

  const setCurrency = (code: CurrencyCode) => {
    if (CURRENCIES[code]) {
      setCurrencyState(code);
      setGlobalCurrency(code);
      try {
        localStorage.setItem("client360_currency", code);
      } catch (e) {
        console.warn("Could not save currency to localStorage", e);
      }
    }
  };

  const currencyConfig = CURRENCIES[currency] || CURRENCIES.INR;

  const formatAmount = (amount: number | null | undefined, compact = false) => {
    return formatCurrency(amount, compact, currency);
  };

  const supportedCurrencies = Object.values(CURRENCIES);

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        currencyConfig,
        symbol: currencyConfig.symbol,
        formatAmount,
        supportedCurrencies,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    const code = getGlobalCurrency();
    const config = CURRENCIES[code] || CURRENCIES.INR;
    return {
      currency: code,
      setCurrency: (newCode: CurrencyCode) => setGlobalCurrency(newCode),
      currencyConfig: config,
      symbol: config.symbol,
      formatAmount: (amount: number | null | undefined, compact = false) =>
        formatCurrency(amount, compact, code),
      supportedCurrencies: Object.values(CURRENCIES),
    };
  }
  return context;
}
