import Papa from "papaparse";

export interface ParsedCsvRow {
  [key: string]: string;
}

export interface ColumnMapping {
  clientName: string;
  transactionDate: string;
  amount: string;
  type?: string;        // Optional if upload is predefined as 'sales' or 'cost'
  category?: string;    // Optional
  description?: string; // Optional
  defaultType?: "revenue" | "cost";
}

export interface RowValidationError {
  rowNumber: number;
  field: string;
  message: string;
  rawRow: Record<string, string>;
}

export interface ValidatedTransactionRow {
  rowNumber: number;
  clientName: string;
  transactionDate: Date;
  amount: number;
  type: "revenue" | "cost";
  category: string;
  description: string;
}

export interface CsvValidationResult {
  totalRows: number;
  validRows: ValidatedTransactionRow[];
  errors: RowValidationError[];
  previewRows: Array<Record<string, any>>;
}

/**
 * Clean and parse currency/numeric strings (e.g. "$1,250.00", "(200.00)", " 340.50 ")
 */
export function parseNumericAmount(val: any): { amount: number; isNegative: boolean } | null {
  if (val === null || val === undefined) return null;
  let str = String(val).trim();
  if (!str) return null;

  let isNegative = false;
  if (str.startsWith("(") && str.endsWith(")")) {
    isNegative = true;
    str = str.slice(1, -1);
  }
  str = str.replace(/[^0-9.-]/g, "");
  const num = parseFloat(str);
  if (isNaN(num)) return null;

  return {
    amount: Math.abs(num),
    isNegative: isNegative || num < 0,
  };
}

/**
 * Robust date parser supporting YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY, etc.
 */
export function parseFlexibleDate(val: any): Date | null {
  if (!val) return null;
  const str = String(val).trim();
  if (!str) return null;

  // Direct ISO parsing
  const d1 = new Date(str);
  if (!isNaN(d1.getTime()) && str.includes("-")) {
    return d1;
  }

  // Handle slash formats MM/DD/YYYY or DD/MM/YYYY
  const slashParts = str.split("/");
  if (slashParts.length === 3) {
    const p0 = parseInt(slashParts[0], 10);
    const p1 = parseInt(slashParts[1], 10);
    const p2 = parseInt(slashParts[2], 10);

    // If p0 > 12, likely DD/MM/YYYY
    if (p0 > 12 && p1 <= 12) {
      const year = p2 < 100 ? 2000 + p2 : p2;
      return new Date(Date.UTC(year, p1 - 1, p0));
    } else {
      // Default to US MM/DD/YYYY
      const year = p2 < 100 ? 2000 + p2 : p2;
      return new Date(Date.UTC(year, p0 - 1, p1));
    }
  }

  if (!isNaN(d1.getTime())) {
    return d1;
  }

  return null;
}

/**
 * Intelligent field auto-matching heuristics
 */
export function autoDetectColumnMapping(headers: string[], uploadType: "combined" | "sales" | "cost"): ColumnMapping {
  const lowerHeaders = headers.map((h) => h.toLowerCase().trim());

  const findHeader = (candidates: string[]) => {
    for (const cand of candidates) {
      const idx = lowerHeaders.findIndex((h) => h === cand || h.includes(cand));
      if (idx !== -1) return headers[idx];
    }
    return "";
  };

  const clientName = findHeader(["client name", "customer name", "client", "customer", "account name", "company", "account"]);
  const transactionDate = findHeader(["transaction date", "invoice date", "date", "period", "timestamp", "trans_date"]);
  const amount = findHeader(["amount", "revenue", "cost", "expense", "total", "price", "value", "sum"]);
  const type = uploadType === "combined" ? findHeader(["type", "transaction type", "entry type", "kind", "revenue/cost"]) : "";
  const category = findHeader(["category", "cost category", "expense category", "department", "service", "item type"]);
  const description = findHeader(["description", "notes", "memo", "details", "summary", "item"]);

  return {
    clientName: clientName || (headers[0] ?? ""),
    transactionDate: transactionDate || (headers[1] ?? ""),
    amount: amount || (headers[2] ?? ""),
    type: type,
    category: category,
    description: description,
    defaultType: uploadType === "cost" ? "cost" : "revenue",
  };
}

/**
 * Validates parsed CSV rows against chosen column mapping
 */
export function validateCsvRows(
  rows: Record<string, any>[],
  mapping: ColumnMapping,
  uploadType: "combined" | "sales" | "cost"
): CsvValidationResult {
  const validRows: ValidatedTransactionRow[] = [];
  const errors: RowValidationError[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2; // +1 for 0-index, +1 for header row
    const rawClient = row[mapping.clientName]?.trim();
    const rawDate = row[mapping.transactionDate];
    const rawAmount = row[mapping.amount];
    const rawType = mapping.type ? row[mapping.type]?.toLowerCase().trim() : undefined;
    const rawCategory = mapping.category ? row[mapping.category]?.trim() : "";
    const rawDescription = mapping.description ? row[mapping.description]?.trim() : "";

    // Check Client Name
    if (!rawClient) {
      errors.push({
        rowNumber,
        field: "clientName",
        message: "Client name is empty or missing",
        rawRow: row,
      });
      return;
    }

    // Check Date
    const parsedDate = parseFlexibleDate(rawDate);
    if (!parsedDate) {
      errors.push({
        rowNumber,
        field: "transactionDate",
        message: `Date '${rawDate}' cannot be parsed. Expected YYYY-MM-DD or MM/DD/YYYY`,
        rawRow: row,
      });
      return;
    }

    // Check Amount
    const parsedAmountResult = parseNumericAmount(rawAmount);
    if (!parsedAmountResult) {
      errors.push({
        rowNumber,
        field: "amount",
        message: `Amount '${rawAmount}' is not a valid number`,
        rawRow: row,
      });
      return;
    }

    // Determine type: revenue or cost
    let finalType: "revenue" | "cost" = "revenue";
    if (uploadType === "cost") {
      finalType = "cost";
    } else if (uploadType === "sales") {
      finalType = "revenue";
    } else if (rawType) {
      if (rawType.includes("cost") || rawType.includes("expense")) {
        finalType = "cost";
      } else {
        finalType = "revenue";
      }
    } else if (mapping.defaultType) {
      finalType = mapping.defaultType;
    }

    const category = rawCategory || (finalType === "revenue" ? "Sales & Subscriptions" : "General Delivery Cost");

    validRows.push({
      rowNumber,
      clientName: rawClient,
      transactionDate: parsedDate,
      amount: parsedAmountResult.amount,
      type: finalType,
      category,
      description: rawDescription || `${finalType === "revenue" ? "Revenue" : "Expense"} transaction`,
    });
  });

  const previewRows = validRows.slice(0, 20).map((r) => ({
    rowNumber: r.rowNumber,
    client: r.clientName,
    date: r.transactionDate.toISOString().split("T")[0],
    type: r.type,
    category: r.category,
    amount: r.amount,
    description: r.description,
  }));

  return {
    totalRows: rows.length,
    validRows,
    errors,
    previewRows,
  };
}

/**
 * Fast synchronous CSV parser
 */
export function parseCsvText(csvText: string): { headers: string[]; rows: Record<string, string>[] } {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: "greedy",
  });

  const headers = result.meta.fields || [];
  return {
    headers,
    rows: result.data,
  };
}
