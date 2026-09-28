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
  amountCents: number; // Integer cents representation for money
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

export const MAX_CSV_ROWS = 50000;
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Strips UTF-8 Byte Order Mark (BOM) if present at start of CSV text
 */
export function stripBOM(content: string): string {
  if (content.charCodeAt(0) === 0xfeff) {
    return content.slice(1);
  }
  return content;
}

/**
 * Protect against CSV / Spreadsheet formula injection (DDE injection)
 * Characters: = , + , - , @
 */
export function sanitizeCellFormula(val: string): string {
  if (!val) return "";
  const trimmed = val.trim();
  if (/^[=+\-@\t\r]/.test(trimmed)) {
    // Prepend single quote to neutralize formula evaluation in Excel/Sheets
    return `'${trimmed}`;
  }
  return trimmed;
}

/**
 * Clean and parse currency/numeric strings (e.g. "$1,250.00", "(200.00)", " 340.50 ")
 * Returns both regular float and precision integer cents to eliminate float rounding errors.
 */
export function parseNumericAmount(val: any): { amount: number; amountCents: number; isNegative: boolean } | null {
  if (val === null || val === undefined) return null;
  let str = String(val).trim();
  if (!str) return null;

  let isNegative = false;
  if (str.startsWith("(") && str.endsWith(")")) {
    isNegative = true;
    str = str.slice(1, -1);
  }

  // Remove currency signs, commas, and whitespace
  str = str.replace(/[^0-9.-]/g, "");
  if (!str || str === "-" || str === ".") return null;

  const num = parseFloat(str);
  if (isNaN(num)) return null;

  const finalAmount = Math.abs(num);
  const amountCents = Math.round(finalAmount * 100);

  return {
    amount: finalAmount,
    amountCents,
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

  // Direct ISO parsing YYYY-MM-DD
  const d1 = new Date(str);
  if (!isNaN(d1.getTime()) && str.includes("-")) {
    const parts = str.split("-");
    if (parts.length === 3 && parts[0].length === 4) {
      return new Date(Date.UTC(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)));
    }
    return d1;
  }

  // Handle slash formats MM/DD/YYYY or DD/MM/YYYY
  const slashParts = str.split(/[\/\.]/);
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
 * Heuristics to auto-map CSV column headers
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
 * Validates parsed CSV rows against chosen column mapping with formula sanitization and bounds checking
 */
export function validateCsvRows(
  rows: Record<string, any>[],
  mapping: ColumnMapping,
  uploadType: "combined" | "sales" | "cost"
): CsvValidationResult {
  const validRows: ValidatedTransactionRow[] = [];
  const errors: RowValidationError[] = [];

  const rowCount = Math.min(rows.length, MAX_CSV_ROWS);

  for (let index = 0; index < rowCount; index++) {
    const row = rows[index];
    const rowNumber = index + 2; // +1 for 0-index, +1 for header row
    const rawClient = row[mapping.clientName]?.toString().trim();
    const rawDate = row[mapping.transactionDate];
    const rawAmount = row[mapping.amount];
    const rawType = mapping.type ? row[mapping.type]?.toString().toLowerCase().trim() : undefined;
    const rawCategory = mapping.category ? row[mapping.category]?.toString().trim() : "";
    const rawDescription = mapping.description ? row[mapping.description]?.toString().trim() : "";

    // 1. Check Client Name
    if (!rawClient) {
      errors.push({
        rowNumber,
        field: "clientName",
        message: "Client name is empty or missing",
        rawRow: row,
      });
      continue;
    }

    // 2. Check Date
    const parsedDate = parseFlexibleDate(rawDate);
    if (!parsedDate) {
      errors.push({
        rowNumber,
        field: "transactionDate",
        message: `Date '${rawDate}' cannot be parsed. Expected YYYY-MM-DD or MM/DD/YYYY`,
        rawRow: row,
      });
      continue;
    }

    // 3. Check Amount
    const parsedAmountResult = parseNumericAmount(rawAmount);
    if (!parsedAmountResult) {
      errors.push({
        rowNumber,
        field: "amount",
        message: `Amount '${rawAmount}' is not a valid number or currency`,
        rawRow: row,
      });
      continue;
    }

    // 4. Determine type: revenue or cost
    let finalType: "revenue" | "cost" = "revenue";
    if (uploadType === "cost") {
      finalType = "cost";
    } else if (uploadType === "sales") {
      finalType = "revenue";
    } else if (rawType) {
      if (rawType.includes("cost") || rawType.includes("expense") || rawType === "c") {
        finalType = "cost";
      } else {
        finalType = "revenue";
      }
    } else if (mapping.defaultType) {
      finalType = mapping.defaultType;
    }

    // If negative amount was parsed on revenue, handle as negative or refund
    const finalAmount = parsedAmountResult.amount;
    const finalAmountCents = parsedAmountResult.amountCents;

    const sanitizedClient = sanitizeCellFormula(rawClient);
    const sanitizedCategory = sanitizeCellFormula(
      rawCategory || (finalType === "revenue" ? "Sales & Subscriptions" : "General Delivery Cost")
    );
    const sanitizedDescription = sanitizeCellFormula(
      rawDescription || `${finalType === "revenue" ? "Revenue" : "Expense"} transaction`
    );

    validRows.push({
      rowNumber,
      clientName: sanitizedClient,
      transactionDate: parsedDate,
      amount: finalAmount,
      amountCents: finalAmountCents,
      type: finalType,
      category: sanitizedCategory,
      description: sanitizedDescription,
    });
  }

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
 * Fast synchronous CSV parser with UTF-8 BOM removal and greedy whitespace skipping
 */
export function parseCsvText(csvText: string): { headers: string[]; rows: Record<string, string>[] } {
  const cleanText = stripBOM(csvText);
  const result = Papa.parse<Record<string, string>>(cleanText, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (header: string) => header.trim(),
  });

  const headers = result.meta.fields || [];
  return {
    headers,
    rows: result.data,
  };
}
