import assert from "node:assert";
import {
  determineClassification,
  calculateClientMetrics,
  getMonthBucket,
  parseRange,
} from "../../lib/calculations/engine";
import { generateInsights } from "../../lib/insights/engine";

export function testCalculations() {
  console.log("Running calculation engine tests...");

  const thresholds = { profitableMarginThreshold: 20.0, lowMarginThreshold: 5.0 };

  // 1. Boundary & Classification tests
  // Exactly 20.0%
  assert.strictEqual(
    determineClassification(20.0, 10000, thresholds),
    "profitable",
    "Should classify exactly 20.0% margin as profitable"
  );

  // Just below 20.0% (19.99%)
  assert.strictEqual(
    determineClassification(19.99, 10000, thresholds),
    "low_margin",
    "Should classify 19.99% margin as low_margin"
  );

  // Exactly 5.0%
  assert.strictEqual(
    determineClassification(5.0, 50000, thresholds),
    "low_margin",
    "Should classify exactly 5.0% margin as low_margin"
  );

  // Just below 5.0% (4.99%)
  assert.strictEqual(
    determineClassification(4.99, 50000, thresholds),
    "loss_making",
    "Should classify 4.99% margin as loss_making"
  );

  // Zero revenue with zero cost
  const zeroMetrics = calculateClientMetrics(0, 0, thresholds);
  assert.strictEqual(zeroMetrics.grossProfit, 0);
  assert.strictEqual(zeroMetrics.marginPercent, null);
  assert.strictEqual(zeroMetrics.classification, "no_revenue");

  // Zero revenue with positive costs (costs only)
  const costOnlyMetrics = calculateClientMetrics(0, 2500, thresholds);
  assert.strictEqual(costOnlyMetrics.grossProfit, -2500);
  assert.strictEqual(costOnlyMetrics.marginPercent, null);
  assert.strictEqual(costOnlyMetrics.classification, "loss_making");

  // Negative revenue (refunds / credit notes)
  const refundMetrics = calculateClientMetrics(-1000, 200, thresholds);
  assert.strictEqual(refundMetrics.grossProfit, -1200);
  assert.strictEqual(refundMetrics.classification, "loss_making");

  // Standard profit calculation: $10,000 rev, $6,000 cost -> $4,000 profit (40% margin)
  const standardMetrics = calculateClientMetrics(10000, 6000, thresholds);
  assert.strictEqual(standardMetrics.grossProfit, 4000);
  assert.strictEqual(standardMetrics.marginPercent, 40.0);
  assert.strictEqual(standardMetrics.classification, "profitable");

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

  // 4. Diagnostic Insights Engine Tests
  const mockClients = [
    {
      id: "c1",
      name: "Acme Profitable",
      revenue: 80000,
      cost: 30000,
      profit: 50000,
      marginPercent: 62.5,
      classification: "profitable",
    },
    {
      id: "c2",
      name: "Bleeding Edge Co",
      revenue: 20000,
      cost: 35000,
      profit: -15000,
      marginPercent: -75.0,
      classification: "loss_making",
    },
    {
      id: "c3",
      name: "Slim Margin Ltd",
      revenue: 50000,
      cost: 47000,
      profit: 3000,
      marginPercent: 6.0,
      classification: "low_margin",
    },
  ];

  const insights = generateInsights(mockClients, 150000, 38000);
  assert.ok(insights.length >= 1, "Should generate insights for loss making and low margin clients");
  const lossAlert = insights.find((i) => i.id === "loss-makers-alert");
  assert.ok(lossAlert !== undefined, "Should trigger loss makers alert");
  assert.strictEqual(lossAlert?.type, "danger");

  console.log("✓ Calculation engine & insights tests passed!");
}
