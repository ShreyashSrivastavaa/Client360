import { testCalculations } from "./calculations/engine.test";
import { testCsvParser } from "./csv/parser.test";

async function runAll() {
  console.log("=== ProfitLens Test Suite ===");
  try {
    testCalculations();
    testCsvParser();
    console.log("=============================");
    console.log("ALL TESTS PASSED SUCCESSFULLY! ✓");
  } catch (error) {
    console.error("Test failure:", error);
    process.exit(1);
  }
}

runAll();
