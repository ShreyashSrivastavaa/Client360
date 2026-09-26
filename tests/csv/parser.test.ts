import assert from "node:assert";
import {
  parseNumericAmount,
  parseFlexibleDate,
  autoDetectColumnMapping,
  validateCsvRows,
} from "../../lib/csv/parser";

export function testCsvParser() {
  console.log("Running CSV parser tests...");

  // 1. Amount parser
  const amt1 = parseNumericAmount("$1,250.50");
  assert.strictEqual(amt1?.amount, 1250.5);
  assert.strictEqual(amt1?.isNegative, false);

  const amt2 = parseNumericAmount("(450.00)");
  assert.strictEqual(amt2?.amount, 450);
  assert.strictEqual(amt2?.isNegative, true);

  const amt3 = parseNumericAmount("-100.25");
  assert.strictEqual(amt3?.amount, 100.25);
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

  // 3. Auto-detect mapping
  const headers = ["Account Name", "Invoice Date", "Total Amount", "Kind", "Memo"];
  const mapping = autoDetectColumnMapping(headers, "combined");
  assert.strictEqual(mapping.clientName, "Account Name");
  assert.strictEqual(mapping.transactionDate, "Invoice Date");
  assert.strictEqual(mapping.amount, "Total Amount");
  assert.strictEqual(mapping.type, "Kind");
  assert.strictEqual(mapping.description, "Memo");

  // 4. Validate rows
  const mockRows = [
    {
      "Account Name": "Acme Corp",
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
  assert.strictEqual(validation.validRows[0].clientName, "Acme Corp");
  assert.strictEqual(validation.validRows[0].amount, 4500);

  console.log("✓ CSV parser tests passed!");
}
