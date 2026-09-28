import assert from "node:assert";
import {
  parseNumericAmount,
  parseFlexibleDate,
  autoDetectColumnMapping,
  validateCsvRows,
  sanitizeCellFormula,
  parseCsvText,
} from "../../lib/csv/parser";

export function testCsvParser() {
  console.log("Running CSV parser tests...");

  // 1. Amount parser & integer cents verification
  const amt1 = parseNumericAmount("$1,250.50");
  assert.strictEqual(amt1?.amount, 1250.5);
  assert.strictEqual(amt1?.amountCents, 125050);
  assert.strictEqual(amt1?.isNegative, false);

  const amt2 = parseNumericAmount("(450.00)");
  assert.strictEqual(amt2?.amount, 450);
  assert.strictEqual(amt2?.amountCents, 45000);
  assert.strictEqual(amt2?.isNegative, true);

  const amt3 = parseNumericAmount("-100.25");
  assert.strictEqual(amt3?.amount, 100.25);
  assert.strictEqual(amt3?.amountCents, 10025);
  assert.strictEqual(amt3?.isNegative, true);

  const amtInvalid = parseNumericAmount("not-a-number");
  assert.strictEqual(amtInvalid, null);

  // 2. Date parser
  const dateIso = parseFlexibleDate("2026-03-15");
  assert.ok(dateIso !== null);
  assert.strictEqual(dateIso?.getUTCFullYear(), 2026);
  assert.strictEqual(dateIso?.getUTCMonth(), 2);

  const dateSlashUS = parseFlexibleDate("04/20/2026");
  assert.ok(dateSlashUS !== null);
  assert.strictEqual(dateSlashUS?.getUTCMonth(), 3); // April

  const dateInvalid = parseFlexibleDate("invalid-date-string");
  assert.strictEqual(dateInvalid, null);

  // 3. UTF-8 BOM Handling
  const bomText = "\uFEFFClient,Date,Amount\nAlpha,2026-01-01,100";
  const parsedBom = parseCsvText(bomText);
  assert.strictEqual(parsedBom.headers[0], "Client");
  assert.strictEqual(parsedBom.rows.length, 1);

  // 4. Formula / DDE Injection Sanitization
  assert.strictEqual(sanitizeCellFormula("=cmd|'/C calc'!A0"), "'=cmd|'/C calc'!A0");
  assert.strictEqual(sanitizeCellFormula("+12345"), "'+12345");
  assert.strictEqual(sanitizeCellFormula("-formula()"), "'-formula()");
  assert.strictEqual(sanitizeCellFormula("@SUM(A1:A10)"), "'@SUM(A1:A10)");
  assert.strictEqual(sanitizeCellFormula("Normal Client Name"), "Normal Client Name");

  // 5. Auto-detect mapping
  const headers = ["Account Name", "Invoice Date", "Total Amount", "Kind", "Memo"];
  const mapping = autoDetectColumnMapping(headers, "combined");
  assert.strictEqual(mapping.clientName, "Account Name");
  assert.strictEqual(mapping.transactionDate, "Invoice Date");
  assert.strictEqual(mapping.amount, "Total Amount");
  assert.strictEqual(mapping.type, "Kind");
  assert.strictEqual(mapping.description, "Memo");

  // 6. Validate rows with formula injection protection
  const mockRows: Record<string, any>[] = [
    {
      "Account Name": "=Dangerous Corp",
      "Invoice Date": "2026-03-01",
      "Total Amount": "$4,500.00",
      Kind: "Revenue",
      Memo: "Subscription tier 1",
    },
    {
      "Account Name": "", // Missing client name
      "Invoice Date": "2026-03-02",
      "Total Amount": "$2,000.00",
      Kind: "Cost",
    },
    {
      "Account Name": "Beta Ltd",
      "Invoice Date": "invalid-date", // Bad date
      "Total Amount": "300",
    },
  ];

  const validation = validateCsvRows(mockRows, mapping, "combined");
  assert.strictEqual(validation.totalRows, 3);
  assert.strictEqual(validation.validRows.length, 1);
  assert.strictEqual(validation.errors.length, 2);
  assert.strictEqual(validation.validRows[0].clientName, "'=Dangerous Corp"); // Sanitized!
  assert.strictEqual(validation.validRows[0].amount, 4500);
  assert.strictEqual(validation.validRows[0].amountCents, 450000);

  console.log("✓ CSV parser tests passed!");
}
