import assert from "node:assert";
import { determineClassification, getMonthBucket, parseRange } from "../../lib/calculations/engine";

export function testCalculations() {
  console.log("Running calculation engine tests...");

  const thresholds = { profitableMarginThreshold: 20.0, lowMarginThreshold: 5.0 };

  // 1. Classification tests
  assert.strictEqual(
    determineClassification(35.5, 10000, thresholds),
    "profitable",
    "Should classify >= 20% margin as profitable"
  );

  assert.strictEqual(
    determineClassification(20.0, 10000, thresholds),
    "profitable",
    "Should classify exactly 20.0% margin as profitable"
  );

  assert.strictEqual(
    determineClassification(14.2, 50000, thresholds),
    "low_margin",
    "Should classify 14.2% margin as low_margin"
  );

  assert.strictEqual(
    determineClassification(5.0, 50000, thresholds),
    "low_margin",
    "Should classify exactly 5.0% margin as low_margin"
  );

  assert.strictEqual(
    determineClassification(4.9, 50000, thresholds),
    "loss_making",
    "Should classify < 5% margin as loss_making"
  );

  assert.strictEqual(
    determineClassification(-25.0, 50000, thresholds),
    "loss_making",
    "Should classify negative margin as loss_making"
  );

  assert.strictEqual(
    determineClassification(null, 0, thresholds),
    "no_revenue",
    "Should classify 0 revenue as no_revenue"
  );

  // 2. Month bucket tests
  const d = new Date("2026-03-18T14:32:00Z");
  const bucket = getMonthBucket(d);
  assert.strictEqual(bucket.getUTCFullYear(), 2026);
  assert.strictEqual(bucket.getUTCMonth(), 2); // 0-indexed March is 2
  assert.strictEqual(bucket.getUTCDate(), 1);

  // 3. Date range parser tests
  const range12m = parseRange("12m");
  assert.ok(range12m.startDate !== null, "12m should have a valid start date");
  assert.strictEqual(range12m.label, "Last 12 Months");

  const rangeAll = parseRange("all");
  assert.strictEqual(rangeAll.startDate, null, "All time should have null start date");

  console.log("✓ Calculation engine tests passed!");
}
